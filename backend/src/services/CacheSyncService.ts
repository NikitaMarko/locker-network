import { Request, Response } from "express";

import { LockerCacheDto, StationCacheDto } from "../contracts/cache.dto";
import { lockerCacheRepository } from "../repositories/cache/LockerCacheRepository";
import { stationCacheRepository } from "../repositories/cache/StationCacheRepository";
import { lockerCatalogProjectionService } from "../repositories/prisma/LockerCatalogProjectionService";
import { sendSuccess } from "../utils/response";
import { isDynamoAccessError } from "../utils/awsErrors";
import { isRedisAccessError } from "../utils/redisErrors";
import { logger } from "../Logger/winston";

type EntitySyncMode = "compare-and-fill" | "rds-fallback-full-resync";

function getStationSyncCandidates(
    source: StationCacheDto[],
    target: StationCacheDto[],
): StationCacheDto[] {
    const targetMap = new Map(target.map((item) => [item.stationId, item]));

    return source.filter((item) => {
        const cached = targetMap.get(item.stationId);
        return !cached || cached.version !== item.version;
    });
}

function getLockerSyncCandidates(
    source: LockerCacheDto[],
    target: LockerCacheDto[],
): LockerCacheDto[] {
    const targetMap = new Map(target.map((item) => [item.lockerBoxId, item]));

    return source.filter((item) => {
        const cached = targetMap.get(item.lockerBoxId);
        return !cached || cached.version !== item.version;
    });
}

function getStationDeleteCandidates(
    source: StationCacheDto[],
    target: StationCacheDto[],
): Array<{ stationId: string; version: number }> {
    const sourceIds = new Set(source.map((item) => item.stationId));

    return target
        .filter((item) => !sourceIds.has(item.stationId))
        .map((item) => ({
            stationId: item.stationId,
            version: item.version,
        }));
}

function getLockerDeleteCandidates(
    source: LockerCacheDto[],
    target: LockerCacheDto[],
): Array<{ lockerBoxId: string; version: number }> {
    const sourceIds = new Set(source.map((item) => item.lockerBoxId));

    return target
        .filter((item) => !sourceIds.has(item.lockerBoxId))
        .map((item) => ({
            lockerBoxId: item.lockerBoxId,
            version: item.version,
        }));
}

export class CacheSyncService {
    async reconcileAll(req: Request, res: Response) {
        const [stationProjections, lockerProjections] = await Promise.all([
            lockerCatalogProjectionService.getAllStationCacheProjections(),
            lockerCatalogProjectionService.getAllLockerCacheProjections(),
        ]);

        let cachedStations: StationCacheDto[] = [];
        let cachedLockers: LockerCacheDto[] = [];
        let stationMode: EntitySyncMode = "compare-and-fill";
        let lockerMode: EntitySyncMode = "compare-and-fill";

        try {
            cachedStations = await stationCacheRepository.findAll();
        } catch (error) {
            if (!isRedisAccessError(error)) {
                throw error;
            }

            stationMode = "rds-fallback-full-resync";
        }

        try {
            cachedLockers = await lockerCacheRepository.findAll();
        } catch (error) {
            if (!isDynamoAccessError(error)) {
                throw error;
            }

            lockerMode = "rds-fallback-full-resync";
        }

        const stationCandidates = stationMode === "compare-and-fill"
            ? getStationSyncCandidates(stationProjections, cachedStations)
            : stationProjections;

        const lockerCandidates = lockerMode === "compare-and-fill"
            ? getLockerSyncCandidates(lockerProjections, cachedLockers)
            : lockerProjections;

        const stationDeleteCandidates = stationMode === "compare-and-fill"
            ? getStationDeleteCandidates(stationProjections, cachedStations)
            : [];

        const lockerDeleteCandidates = lockerMode === "compare-and-fill"
            ? getLockerDeleteCandidates(lockerProjections, cachedLockers)
            : [];

        const lockerResults = await Promise.allSettled([
            ...lockerCandidates.map((projection) => lockerCacheRepository.upsert(projection)),
            ...lockerDeleteCandidates.map(({ lockerBoxId, version }) => lockerCacheRepository.delete(lockerBoxId, version)),
        ]);

        const stationResults = await Promise.allSettled([
            ...stationCandidates.map((projection) => stationCacheRepository.upsert(projection)),
            ...stationDeleteCandidates.map(({ stationId, version }) => stationCacheRepository.delete(stationId, version)),
        ]);

        const stationCacheStatus = stationResults.every((result) => result.status === "fulfilled")
            ? "SYNCED"
            : "FAILED";

        if (stationCacheStatus === "FAILED") {
            logger.error("Station cache reconcile finished with Redis write failures", {
                failedCount: stationResults.filter((result) => result.status === "rejected").length,
            });
        }

        const lockerCacheStatus = lockerResults.every((result) => result.status === "fulfilled")
            ? "SYNCED"
            : "FAILED";

        if (lockerCacheStatus === "FAILED") {
            logger.error("Locker cache reconcile finished with Dynamo write failures", {
                failedCount: lockerResults.filter((result) => result.status === "rejected").length,
            });
        }

        return sendSuccess(res, {
            mode: {
                stations: stationMode,
                lockers: lockerMode,
            },
            stations: {
                sourceCount: stationProjections.length,
                queuedCount: stationCandidates.length,
                deleteQueuedCount: stationDeleteCandidates.length,
            },
            lockers: {
                sourceCount: lockerProjections.length,
                queuedCount: lockerCandidates.length,
                deleteQueuedCount: lockerDeleteCandidates.length,
            },
        }, 202, {
            stationCacheStatus,
            lockerCacheStatus,
        });
    }
}

export const cacheSyncService = new CacheSyncService();
