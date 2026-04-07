import {Response, Request} from "express";

import {HttpError} from "../errorHandler/HttpError";

import {prismaService} from "./prismaService";



export class LockerBoxServiceImplPostgres {

    async getAllBoxes (req: Request, res: Response) {
        const allBoxes = await prismaService.lockerBox.findMany();
        return res.json(allBoxes);

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

        return res.status(200).json({massage: "box created"});
    }


}

export const boxService = new LockerBoxServiceImplPostgres();