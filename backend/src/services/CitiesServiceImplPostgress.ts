import {Request, Response} from "express";

import {prismaService} from "./prismaService";

export class CitiesServiceImplPostgres {

    async getAllCities(req: Request, res: Response) {
        const cities = await prismaService.city.findMany({
            where: {
                isActive: true,
            },
            select: {
                cityId: true,
                code: true,
                name: true
            },
        });


        return res.json(cities);
    }
}

export const citiesService = new CitiesServiceImplPostgres();