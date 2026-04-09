import {Response, Request} from "express";

import {HttpError} from "../errorHandler/HttpError";

import {prismaService} from "./prismaService";



export class LockerBoxServiceImplPostgres {

    async getAllBoxes (req: Request, res: Response) {
        const lockers = await prismaService.lockerBox.findMany({
            where: {
                isDeleted: false,
                station: {
                    isDeleted: false,
                    status: "ACTIVE",
                },
            },
            include: {
                station: {
                    include: {
                        city: true,
                    },
                },
            },
        });

        const pricing = await prismaService.pricing.findMany();

        const pricingMap = new Map(
            pricing.map((p) => [`${p.cityId}-${p.size}`, p.pricePerHour])
        );

        const result = lockers.map((locker) => ({
            ...locker,
            pricePerHour:
                pricingMap.get(
                    `${locker.station.cityId}-${locker.size}`
                ) || null,
        }));

        return res.json(result);
    }

    async createBox (req: Request, res: Response) {
        const {stationId, code, size} = req.body;

        const stationExists = await prismaService.lockerStation.findUnique({
            where: { stationId },
        })
        if (!stationExists) {
            throw new HttpError(400, `Station doesn't exists`);
        }
        const boxExists = await prismaService.lockerBox.findUnique({
            where: {
                code,
            }
        })
        if (boxExists) {
            throw new HttpError(400, `Locker already exists`);
        }
        const box = await prismaService.lockerBox.create({
            data: {
                stationId,
                code,
                size,
            },
            select:{
                lockerBoxId: true,
                status: true,
                createdAt: true
            }
        });

        return res.status(200).json({id: box.lockerBoxId, stationId: stationId});
    }


}

export const boxService = new LockerBoxServiceImplPostgres();