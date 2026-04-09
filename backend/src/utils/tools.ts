import {LockerSize, Prisma} from "@prisma/client";

import {prismaService} from "../services/prismaService";



type PricingItem = {
    cityId: string;
    size: LockerSize;
    pricePerHour: Prisma.Decimal;
};

export const attachPricesToStations = async (stations: any[]) => {
    if (!stations.length) return stations;

    const cityIds = [...new Set(stations.map(s => s.cityId))];

    const pricing = await prismaService.pricing.findMany({
        where: {
            cityId: { in: cityIds }
        }
    });

    const pricingMap = new Map(
        pricing.map(p => [`${p.cityId}-${p.size}`, p.pricePerHour])
    );

    return stations.map(station => ({
        ...station,
        lockers: (station.lockers || []).map((locker: any) => ({
            ...locker,
            pricePerHour:
                pricingMap.get(`${station.cityId}-${locker.size}`) || null
        }))
    }));
};

export const attachPricesToLockers = async (lockers: any[]) => {
    if (!lockers.length) return [];

    const pricingMap = new Map<string, Prisma.Decimal>();

    lockers.forEach((locker) => {
        locker.station.city.Pricing.forEach((p:PricingItem) => {
            pricingMap.set(`${p.cityId}-${p.size}`, p.pricePerHour);
        });
    });

    return lockers.map((locker) => ({
        ...locker,
        pricePerHour:
            pricingMap.get(
                `${locker.station.cityId}-${locker.size}`
            ) ?? null,
        station: {
            ...locker.station,
            city: locker.station.city.name
        },
    }));

}