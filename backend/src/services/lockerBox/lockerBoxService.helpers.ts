import { LockerCacheDto, LockerResponseDto } from "../../contracts/cache.dto";
import { logger } from "../../Logger/winston";
import { lockerCacheRepository } from "../../repositories/cache/LockerCacheRepository";
import { lockerCatalogProjectionService } from "../../repositories/prisma/LockerCatalogProjectionService";
import { isDynamoAccessError } from "../../utils/awsErrors";
import { enqueueLockerProjectionDelete, enqueueLockerProjectionUpsert } from "../cacheProjectionQueueService";

export type LockerQuery = {
    stationId?: string;
    size?: "S" | "M" | "L";
    status?: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "FAULTY" | "EXPIRED";
};

export type StationCacheStatus = "SYNCED" | "FAILED" | "DEFERRED";
export type LockerCacheStatus = "DEFERRED" | "FAILED";

export function toLockerResponse(locker: LockerCacheDto): LockerResponseDto {
    return {
        lockerBoxId: locker.lockerBoxId,
        stationId: locker.stationId,
        code: locker.code,
        size: locker.size,
        status: locker.status,
        version: locker.version,
        lastStatusChangedAt: locker.lastStatusChangedAt,
        pricePerHour: locker.pricePerHour,
        station: {
            address: locker.station.address,
            city: locker.station.city.name,
            latitude: locker.station.latitude,
            longitude: locker.station.longitude,
        },
    };
}

export function lockerMeta(stationCacheStatus: StationCacheStatus, lockerCacheStatus: LockerCacheStatus) {
    return {
        stationCacheStatus,
        lockerCacheStatus,
    };
}

export async function syncLockerProjection(
    projection: Parameters<typeof lockerCacheRepository.upsert>[0],
    correlationId?: string,
    actorId?: string | null
) {
    try {
        await enqueueLockerProjectionUpsert(projection, correlationId, actorId);
        return "DEFERRED" as const;
    } catch (error) {
        logger.error("Locker cache projection enqueue failed", {
            lockerBoxId: projection.lockerBoxId,
            error,
        });
        return "FAILED" as const;
    }
}

export async function deleteLockerProjection(lockerBoxId: string, version?: number, correlationId?: string, actorId?: string | null) {
    try {
        await enqueueLockerProjectionDelete(lockerBoxId, version, correlationId, actorId);
        return "DEFERRED" as const;
    } catch (error) {
        logger.error("Locker cache projection delete enqueue failed", {
            lockerBoxId,
            version,
            error,
        });
        return "FAILED" as const;
    }
}

export async function loadLockers() {
    try {
        const cachedLockers = await lockerCacheRepository.findAll();
        if (cachedLockers.length > 0) {
            return cachedLockers;
        }

        return lockerCatalogProjectionService.getAllLockerCacheProjections();
    } catch (error) {
        if (!isDynamoAccessError(error)) {
            throw error;
        }

        return lockerCatalogProjectionService.getAllLockerCacheProjections();
    }
}

export async function loadOneLocker(lockerBoxId: string) {
    try {
        const cachedLocker = await lockerCacheRepository.findById(lockerBoxId);
        if (cachedLocker) {
            return cachedLocker;
        }

        return lockerCatalogProjectionService.getLockerCacheProjection(lockerBoxId);
    } catch (error) {
        if (!isDynamoAccessError(error)) {
            throw error;
        }

        return lockerCatalogProjectionService.getLockerCacheProjection(lockerBoxId);
    }
}
