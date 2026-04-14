import { LockerStatus, Prisma } from "@prisma/client";

import {
    LockerCacheDto,
    LockerResponseDto,
    StationCacheDto,
    StationCacheLockerDto,
    StationListItemDto
} from "../../contracts/cache.dto";
import { lockerCacheRepository } from "../cache/LockerCacheRepository";
import { prismaService } from "../../services/prismaService";
import { TransactionClient } from "./transactionClient";

function decimalToString(value: Prisma.Decimal | null | undefined) {
    return value ? value.toString() : null;
}

function buildPricingMap(
    pricing: Array<{ cityId: string; size: string; pricePerHour: Prisma.Decimal }>
) {
    return new Map(pricing.map((item) => [`${item.cityId}-${item.size}`, item.pricePerHour.toString()]));
}

function stationProjectionVersion(updatedAt: Date, version: number) {
    return updatedAt.getTime() * 1000 + version;
}

function fallbackLockerState(locker: {
    status: LockerStatus;
    version: number;
    lastStatusChangedAt: Date;
}) {
    return {
        status: locker.status,
        version: locker.version,
        lastStatusChangedAt: locker.lastStatusChangedAt.toISOString(),
    };
}

interface ILockerCatalogProjectionService {
    getStationCacheProjection(stationId: string): Promise<StationCacheDto | null>;
    getLockerCacheProjection(lockerBoxId: string): Promise<LockerCacheDto | null>;
    getLockerCacheProjectionsByStationId(stationId: string): Promise<LockerCacheDto[]>;
    getAllStationCacheProjections(): Promise<StationCacheDto[]>;
    getAllLockerCacheProjections(): Promise<LockerCacheDto[]>;
    getAllStationsAdminView(): Promise<StationListItemDto[]>;
    getAllLockersAdminView(): Promise<LockerResponseDto[]>;
    getLockerIdsByStationId(stationId: string): Promise<string[]>;
}

class LockerCatalogProjectionService implements ILockerCatalogProjectionService {
    async getStationCacheProjection(stationId: string, tx: TransactionClient | typeof prismaService = prismaService): Promise<StationCacheDto | null> {
        const station = await tx.lockerStation.findUnique({
            where: { stationId },
            include: {
                city: {
                    select: {
                        code: true,
                        name: true,
                        Pricing: true,
                    }
                },
                lockers: {
                    where: { isDeleted: false },
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!station) {
            return null;
        }

        const pricingMap = buildPricingMap(
            station.city.Pricing.map((item) => ({
                cityId: station.cityId,
                size: item.size,
                pricePerHour: item.pricePerHour,
            }))
        );

        const cachedLockers = await lockerCacheRepository.findByStationId(station.stationId);
        const cachedLockersMap = new Map(cachedLockers.map((item) => [item.lockerBoxId, item]));

        const lockers: StationCacheLockerDto[] = station.lockers.map((locker) => ({
            ...(cachedLockersMap.get(locker.lockerBoxId)
                ? {
                    status: cachedLockersMap.get(locker.lockerBoxId)!.status,
                    version: cachedLockersMap.get(locker.lockerBoxId)!.version,
                    lastStatusChangedAt: cachedLockersMap.get(locker.lockerBoxId)!.lastStatusChangedAt,
                }
                : fallbackLockerState(locker)),
            lockerBoxId: locker.lockerBoxId,
            stationId: locker.stationId,
            code: locker.code,
            size: locker.size,
            pricePerHour: pricingMap.get(`${station.cityId}-${locker.size}`) ?? null,
        }));

        return {
            stationId: station.stationId,
            cityId: station.cityId,
            address: station.address ?? null,
            latitude: station.latitude,
            longitude: station.longitude,
            status: station.status,
            version: stationProjectionVersion(station.updatedAt, station.version),
            availableLockers: lockers.filter((locker) => locker.status === "AVAILABLE").length,
            city: {
                code: station.city.code,
                name: station.city.name,
            },
            lockers,
        };
    }

    async getLockerCacheProjection(lockerBoxId: string, tx: TransactionClient | typeof prismaService = prismaService): Promise<LockerCacheDto | null> {
        const locker = await tx.lockerBox.findUnique({
            where: { lockerBoxId },
            include: {
                station: {
                    include: {
                        city: {
                            select: {
                                code: true,
                                name: true,
                                Pricing: true,
                            }
                        }
                    }
                }
            }
        });

        if (!locker) {
            return null;
        }

        const priceItem = locker.station.city.Pricing.find((item) => item.size === locker.size);
        const cachedLocker = await lockerCacheRepository.findById(lockerBoxId);
        const runtimeState = cachedLocker ?? fallbackLockerState(locker);

        return {
            lockerBoxId: locker.lockerBoxId,
            stationId: locker.stationId,
            code: locker.code,
            size: locker.size,
            status: runtimeState.status,
            version: runtimeState.version,
            lastStatusChangedAt: runtimeState.lastStatusChangedAt,
            pricePerHour: decimalToString(priceItem?.pricePerHour),
            station: {
                address: locker.station.address ?? null,
                latitude: locker.station.latitude,
                longitude: locker.station.longitude,
                status: locker.station.status,
                city: {
                    code: locker.station.city.code,
                    name: locker.station.city.name,
                },
            },
        };
    }

    async getLockerCacheProjectionsByStationId(stationId: string, tx: TransactionClient | typeof prismaService = prismaService): Promise<LockerCacheDto[]> {
        const lockers = await tx.lockerBox.findMany({
            where: { stationId },
            select: { lockerBoxId: true },
        });

        const projections = await Promise.all(lockers.map(({ lockerBoxId }) => this.getLockerCacheProjection(lockerBoxId, tx)));
        return projections.filter((item): item is LockerCacheDto => item !== null);
    }

    async getAllStationCacheProjections(tx: TransactionClient | typeof prismaService = prismaService): Promise<StationCacheDto[]> {
        const stations = await tx.lockerStation.findMany({
            where: { isDeleted: false },
            select: { stationId: true },
        });

        const projections = await Promise.all(
            stations.map(({ stationId }) => this.getStationCacheProjection(stationId, tx))
        );

        return projections.filter((item): item is StationCacheDto => item !== null);
    }

    async getAllLockerCacheProjections(tx: TransactionClient | typeof prismaService = prismaService): Promise<LockerCacheDto[]> {
        const lockers = await tx.lockerBox.findMany({
            where: {
                isDeleted: false,
                station: {
                    isDeleted: false,
                },
            },
            include: {
                station: {
                    include: {
                        city: {
                            select: {
                                code: true,
                                name: true,
                                Pricing: true,
                            }
                        }
                    }
                }
            }
        });

        const cachedLockers = await lockerCacheRepository.findAll();
        const cachedLockersMap = new Map(cachedLockers.map((item) => [item.lockerBoxId, item]));

        return lockers.map((locker) => {
            const priceItem = locker.station.city.Pricing.find((item) => item.size === locker.size);
            const runtimeState = cachedLockersMap.get(locker.lockerBoxId) ?? fallbackLockerState(locker);

            return {
                lockerBoxId: locker.lockerBoxId,
                stationId: locker.stationId,
                code: locker.code,
                size: locker.size,
                status: runtimeState.status,
                version: runtimeState.version,
                lastStatusChangedAt: runtimeState.lastStatusChangedAt,
                pricePerHour: decimalToString(priceItem?.pricePerHour),
                station: {
                    address: locker.station.address ?? null,
                    latitude: locker.station.latitude,
                    longitude: locker.station.longitude,
                    status: locker.station.status,
                    city: {
                        code: locker.station.city.code,
                        name: locker.station.city.name,
                    },
                },
            };
        });
    }

    async getAllStationsAdminView(tx: TransactionClient | typeof prismaService = prismaService): Promise<StationListItemDto[]> {
        const stations = await this.getAllStationCacheProjections(tx);
        return stations.map((station) => ({
            stationId: station.stationId,
            cityId: station.cityId,
            address: station.address,
            latitude: station.latitude,
            longitude: station.longitude,
            status: station.status,
            version: station.version,
            distance: null,
            city: station.city,
            _count: {
                lockers: station.availableLockers,
            },
        }));
    }

    async getAllLockersAdminView(tx: TransactionClient | typeof prismaService = prismaService): Promise<LockerResponseDto[]> {
        const lockers = await this.getAllLockerCacheProjections(tx);
        return lockers.map((locker) => ({
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
        }));
    }

    async getLockerIdsByStationId(stationId: string, tx: TransactionClient | typeof prismaService = prismaService): Promise<string[]> {
        const lockers = await tx.lockerBox.findMany({
            where: { stationId },
            select: { lockerBoxId: true },
        });

        return lockers.map((locker) => locker.lockerBoxId);
    }
}

export const lockerCatalogProjectionService = new LockerCatalogProjectionService();
