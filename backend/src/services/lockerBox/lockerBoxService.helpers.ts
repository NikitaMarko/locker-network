import { LockerCacheDto, LockerResponseDto } from "../../contracts/cache.dto";
import { logger } from "../../Logger/winston";
import { lockerCacheRepository } from "../../repositories/cache/LockerCacheRepository";

export type LockerQuery = {
    stationId?: string;
    size?: "S" | "M" | "L";
    status?: "AVAILABLE" | "RESERVED" | "OCCUPIED" | "FAULTY" | "EXPIRED";
};

export type StationCacheStatus = "SYNCED" | "FAILED" | "DEFERRED";
export type LockerCacheStatus = "SYNCED" | "FAILED";

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

export async function syncLockerProjection(projection: Parameters<typeof lockerCacheRepository.upsert>[0]) {
    try {
        await lockerCacheRepository.upsert(projection);
        return "SYNCED" as const;
    } catch (error) {
        logger.error("Locker cache Dynamo upsert failed", {
            lockerBoxId: projection.lockerBoxId,
            error,
        });
        return "FAILED" as const;
    }
}

export async function deleteLockerProjection(lockerBoxId: string, version?: number) {
    try {
        await lockerCacheRepository.delete(lockerBoxId, version);
        return "SYNCED" as const;
    } catch (error) {
        logger.error("Locker cache Dynamo delete failed", {
            lockerBoxId,
            version,
            error,
        });
        return "FAILED" as const;
    }
}

export async function loadLockers() {
    return lockerCacheRepository.findAll();
}

export async function loadOneLocker(lockerBoxId: string) {
    return lockerCacheRepository.findById(lockerBoxId);
}
