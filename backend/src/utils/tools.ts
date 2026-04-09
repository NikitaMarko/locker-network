import {prismaService} from "../services/prismaService";

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