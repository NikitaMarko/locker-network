import {logger} from "../../Logger/winston";
import {
    cityCacheRepository
} from "../../repositories/cache/CityCacheRepository";
import {
    lockerCatalogProjectionService
} from "../../repositories/prisma/LockerCatalogProjectionService";
import {isRedisAccessError} from "../../utils/redisErrors";
import {CityCacheDto} from "../../contracts/cache.dto";

export async function warmupCitiesCache(cities: CityCacheDto[]) {
    const results = await Promise.allSettled(
        cities.map((city) => cityCacheRepository.upsert(city))
    );

    const failedCount = results.filter((result) => result.status === "rejected").length;
    if (failedCount > 0) {
        logger.warn("City cache warmup completed with Redis write failures", {
            failedCount,
            total: cities.length,
        });
    }
}

function mergeCityCatalog(
    cachedCities: CityCacheDto[],
    projectedCities: CityCacheDto[],
) {
    const cachedById = new Map(cachedCities.map((city) => [city.cityId, city]));
    const staleOrMissingCities: CityCacheDto[] = [];

    for (const projectedCity of projectedCities) {
        const cachedCity = cachedById.get(projectedCity.cityId);
        if (!cachedCity) {
            staleOrMissingCities.push(projectedCity);
        }
    }

    return {
        mergedCities: projectedCities,
        staleOrMissingCities,
    };
}

export async function loadCitiesWithFallback() {
    try {
        const cachedCities = await cityCacheRepository.findAll();
        if (cachedCities.length === 0) {
            const projectedCities = await lockerCatalogProjectionService.getAllCityCacheProjections();
            if (projectedCities.length > 0) {
                await warmupCitiesCache(projectedCities);
            }

            return projectedCities;
        }

        const projectedCities = await lockerCatalogProjectionService.getAllCityCacheProjections();
        if (projectedCities.length === 0) {
            return cachedCities;
        }

        const { mergedCities, staleOrMissingCities } = mergeCityCatalog(cachedCities, projectedCities);

        if (staleOrMissingCities.length > 0 || cachedCities.length !== projectedCities.length) {
            await warmupCitiesCache(staleOrMissingCities);
        }

        return mergedCities;
    } catch (error) {
        if (!isRedisAccessError(error)) {
            throw error;
        }

        return lockerCatalogProjectionService.getAllCityCacheProjections();
    }
}

export async function loadOneCityWithFallback(cityId: string) {
    try {
        const cachedCity = await cityCacheRepository.findById(cityId);
        if (cachedCity) {
            return cachedCity;
        }

        const projectedCity = await lockerCatalogProjectionService.getCityCacheProjection(cityId);
        if (projectedCity) {
            await warmupCitiesCache([projectedCity]);
        }

        return projectedCity;
    } catch (error) {
        if (!isRedisAccessError(error)) {
            throw error;
        }

        return lockerCatalogProjectionService.getCityCacheProjection(cityId);
    }
}

export async function syncCityProjection(projection: Parameters<typeof cityCacheRepository.upsert>[0]) {
    try {
        await cityCacheRepository.upsert(projection);
        return "SYNCED" as const;
    } catch (error) {
        logger.error("City cache Redis upsert failed after DB commit", {
            cityId: projection.cityId,
            error,
        });
        return "FAILED" as const;
    }
}

export async function deleteCityProjection(cityId: string, version: number) {
    try {
        await cityCacheRepository.delete(cityId, version);
        return "SYNCED" as const;
    } catch (error) {
        logger.error("City cache Redis delete failed after DB commit", {
            cityId,
            version,
            error,
        });
        return "FAILED" as const;
    }
}


