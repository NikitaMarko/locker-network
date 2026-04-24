import { LockerStatus, StationStatus, TechnicalStatus } from "@prisma/client";

import { LockerCacheDto, LockerResponseDto } from "../../contracts/cache.dto";
import { HttpError } from "../../errorHandler/HttpError";
import { logger } from "../../Logger/winston";
import { lockerCacheRepository } from "../../repositories/cache/LockerCacheRepository";
import { lockerCatalogProjectionService } from "../../repositories/prisma/LockerCatalogProjectionService";
import { isDynamoAccessError } from "../../utils/awsErrors";

export type LockerQuery = {
    stationId?: string;
    size?: "S" | "M" | "L";
    status?: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "FAULTY" | "EXPIRED";
};

export type StationCacheStatus = "SYNCED" | "FAILED" | "DEFERRED";
export type LockerCacheStatus = "SYNCED" | "FAILED";

const ACTIVE_RUNTIME_STATUSES = new Set<LockerStatus>([
    "AVAILABLE",
    "RESERVED",
    "OCCUPIED",
    "EXPIRED",
]);

export function toLockerResponse(locker: LockerCacheDto): LockerResponseDto {
    return {
        lockerBoxId: locker.lockerBoxId,
        stationId: locker.stationId,
        code: locker.code,
        size: locker.size,
        status: locker.status,
        techStatus: locker.techStatus,
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

export function assertValidLockerStatusTransition(input: {
    nextStatus: LockerStatus;
    currentStatus: LockerStatus | null;
    techStatus: TechnicalStatus;
    stationStatus: StationStatus;
}) {
    const { nextStatus, currentStatus, techStatus, stationStatus } = input;

    if (currentStatus === nextStatus) {
        throw new HttpError(400, "Locker is already " + nextStatus);
    }

    if (nextStatus === "FAULTY") {
        throw new HttpError(400, "Use tech status endpoint to set locker FAULTY");
    }

    if (stationStatus !== "ACTIVE") {
        throw new HttpError(400, "Locker runtime status can be changed only when station is ACTIVE");
    }

    if (techStatus !== "ACTIVE") {
        throw new HttpError(400, "Locker runtime status can be changed only when tech status is ACTIVE");
    }

    if (!ACTIVE_RUNTIME_STATUSES.has(nextStatus)) {
        throw new HttpError(400, "Unsupported locker runtime status transition");
    }
}

export function resolveLockerStateForTechStatus(input: {
    currentStatus: LockerStatus | null;
    nextTechStatus: TechnicalStatus;
    stationStatus: StationStatus;
}) {
    const { currentStatus, nextTechStatus, stationStatus } = input;

    if (nextTechStatus === "ACTIVE") {
        if (stationStatus !== "ACTIVE") {
            throw new HttpError(400, "Locker tech status can be ACTIVE only when station is ACTIVE");
        }

        return {
            nextStatus: currentStatus ?? "AVAILABLE",
            statusChanged: currentStatus === null,
        };
    }

    return {
        nextStatus: null,
        statusChanged: currentStatus !== null,
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
    _correlationId?: string,
    _actorId?: string | null
) {
    try {
        await lockerCacheRepository.upsert(projection);
        return "SYNCED" as const;
    } catch (error) {
        logger.error("Locker cache direct upsert failed", {
            lockerBoxId: projection.lockerBoxId,
            error,
        });
        return "FAILED" as const;
    }
}

export async function deleteLockerProjection(lockerBoxId: string, version?: number, _correlationId?: string, _actorId?: string | null) {
    try {
        await lockerCacheRepository.delete(lockerBoxId, version);
        return "SYNCED" as const;
    } catch (error) {
        logger.error("Locker cache direct delete failed", {
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
            return lockerCatalogProjectionService.getAllLockerCacheProjections();
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
        const projectedLocker = await lockerCatalogProjectionService.getLockerCacheProjection(lockerBoxId);
        if (projectedLocker) {
            await lockerCacheRepository.upsert(projectedLocker);
        }

        return projectedLocker;
    } catch (error) {
        if (!isDynamoAccessError(error)) {
            throw error;
        }

        return lockerCatalogProjectionService.getLockerCacheProjection(lockerBoxId);
    }
}
