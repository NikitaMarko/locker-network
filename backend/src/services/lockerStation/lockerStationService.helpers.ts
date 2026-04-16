import { StationCacheDto, StationListItemDto } from "../../contracts/cache.dto";
import { logger } from "../../Logger/winston";
import { lockerCacheRepository } from "../../repositories/cache/LockerCacheRepository";
import { stationCacheRepository } from "../../repositories/cache/StationCacheRepository";
import { lockerCatalogProjectionService } from "../../repositories/prisma/LockerCatalogProjectionService";
import { isRedisAccessError } from "../../utils/redisErrors";

export type StationQuery = {
    city?: string;
    status?: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
    lat?: number;
    lng?: number;
    radius?: number;
};

export type StationCacheStatus = "SYNCED" | "FAILED" | "DEFERRED";
export type LockerCacheStatus = "SYNCED" | "FAILED";

function toRadians(value: number) {
    return value * (Math.PI / 180);
}

function getDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
    const earthRadiusMeters = 6371000;
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2
        + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;

    return Number((earthRadiusMeters * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2));
}

export function toStationListItem(station: StationCacheDto, distance: number | null): StationListItemDto {
    return {
        stationId: station.stationId,
        cityId: station.cityId,
        address: station.address,
        latitude: station.latitude,
        longitude: station.longitude,
        status: station.status,
        version: station.version,
        distance,
        city: station.city,
        _count: {
            lockers: station.availableLockers,
        },
    };
}

export function stationMeta(stationCacheStatus: StationCacheStatus, lockerCacheStatus?: LockerCacheStatus) {
    return {
        stationCacheStatus,
        ...(lockerCacheStatus && { lockerCacheStatus }),
    };
}

export function resolveStationDistance(query: Pick<StationQuery, "lat" | "lng">, station: StationCacheDto) {
    if (query.lat === undefined || query.lng === undefined) {
        return null;
    }

    return getDistanceMeters(query.lat, query.lng, station.latitude, station.longitude);
}

export async function warmupStationsCache(stations: StationCacheDto[]) {
    const results = await Promise.allSettled(
        stations.map((station) => stationCacheRepository.upsert(station))
    );

    const failedCount = results.filter((result) => result.status === "rejected").length;
    if (failedCount > 0) {
        logger.warn("Station cache warmup completed with Redis write failures", {
            failedCount,
            total: stations.length,
        });
    }
}

export async function loadStationsWithFallback() {
    try {
        const cachedStations = await stationCacheRepository.findAll();
        if (cachedStations.length > 0) {
            return cachedStations;
        }

        const projectedStations = await lockerCatalogProjectionService.getAllStationCacheProjections();
        if (projectedStations.length > 0) {
            await warmupStationsCache(projectedStations);
        }

        return projectedStations;
    } catch (error) {
        if (!isRedisAccessError(error)) {
            throw error;
        }

        return lockerCatalogProjectionService.getAllStationCacheProjections();
    }
}

export async function loadOneStationWithFallback(stationId: string) {
    try {
        const cachedStation = await stationCacheRepository.findById(stationId);
        if (cachedStation) {
            return cachedStation;
        }

        const projectedStation = await lockerCatalogProjectionService.getStationCacheProjection(stationId);
        if (projectedStation) {
            await warmupStationsCache([projectedStation]);
        }

        return projectedStation;
    } catch (error) {
        if (!isRedisAccessError(error)) {
            throw error;
        }

        return lockerCatalogProjectionService.getStationCacheProjection(stationId);
    }
}

export async function syncStationProjection(projection: Parameters<typeof stationCacheRepository.upsert>[0]) {
    try {
        await stationCacheRepository.upsert(projection);
        return "SYNCED" as const;
    } catch (error) {
        logger.error("Station cache Redis upsert failed after DB commit", {
            stationId: projection.stationId,
            error,
        });
        return "FAILED" as const;
    }
}

export async function deleteStationProjection(stationId: string, version: number) {
    try {
        await stationCacheRepository.delete(stationId, version);
        return "SYNCED" as const;
    } catch (error) {
        logger.error("Station cache Redis delete failed after DB commit", {
            stationId,
            version,
            error,
        });
        return "FAILED" as const;
    }
}

export async function syncLockerProjections(
    projections: Awaited<ReturnType<typeof lockerCatalogProjectionService.getLockerCacheProjectionsByStationId>>
) {
    try {
        await Promise.all(projections.map((projection) => lockerCacheRepository.upsert(projection)));
        return "SYNCED" as const;
    } catch (error) {
        logger.error("Locker cache Dynamo sync failed after station change", {
            count: projections.length,
            error,
        });
        return "FAILED" as const;
    }
}

export async function deleteLockerProjections(lockerIds: string[]) {
    try {
        const cachedLockers = await Promise.all(lockerIds.map((lockerBoxId) => lockerCacheRepository.findById(lockerBoxId)));
        await Promise.all(lockerIds.map((lockerBoxId, index) =>
            lockerCacheRepository.delete(lockerBoxId, cachedLockers[index]?.version)
        ));
        return "SYNCED" as const;
    } catch (error) {
        logger.error("Locker cache Dynamo delete failed after station delete", {
            count: lockerIds.length,
            error,
        });
        return "FAILED" as const;
    }
}
