import {Response, Request} from "express";

import {attachPricesToLockers} from "../utils/tools";
import {HttpError} from "../errorHandler/HttpError";

import {prismaService} from "./prismaService";



export class LockerBoxServiceImplPostgres {

    async getAllBoxes (req: Request, res: Response) {
        const lockers = await prismaService.lockerBox.findMany({
            where: {
                isDeleted: false,
                station: {
                    isDeleted: false,
                },
            },
            include: {
                station: {
                    select: {
                        stationId: true,
                        address: true,
                        cityId: true,
                        city: {
                            select: {
                                code: true,
                                name: true,
                                Pricing:true
                            },
                        },
                    },
                },
            },
        });

        const result = await attachPricesToLockers(lockers);

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
                stationId_code: {
                    stationId,
                    code,
                }
            }
        });
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

    async getBoxes (req: Request, res: Response) {
        const stationId = req.query.stationId as string | undefined;
        const size = req.query.size as "S" | "M" | "L" | undefined;
        const status = req.query.status as
            | "AVAILABLE"
            | "RESERVED"
            | "OCCUPIED"
            | "FAULTY"
            | "EXPIRED"
            | undefined;

        const lockers = await prismaService.lockerBox.findMany({
            where: {
                isDeleted: false,
                ...(stationId && { stationId }),
                ...(size && { size }),
                ...(status && { status }),
                station: {
                    isDeleted: false,
                    status: "ACTIVE"
                },
            },
            include: {
                station: {
                    select: {
                        stationId: true,
                        address: true,
                        cityId: true,
                        city: {
                            select: {
                                code: true,
                                name: true,
                                Pricing:true
                            },
                        },
                    },
                },
            }});

        const result = await attachPricesToLockers(lockers);

        return res.json(result);
    }

    async getOneBox (req: Request, res: Response) {
        const lockerBoxId = req.params.id as string;
        const locker = await prismaService.lockerBox.findUnique({
            where: {
                lockerBoxId,
            },
            include: {
                station: {
                    select: {
                        stationId: true,
                        address: true,
                        cityId: true,
                        city: {
                            select: {
                                code: true,
                                name: true,
                                Pricing:true
                            },
                        },
                    },
                },
            }});
        if (!locker) {
            throw new HttpError(404, "Locker doesn't exist");
        }
        const [result] = await attachPricesToLockers([locker]);
        return res.json(result);
    }

    async changeBoxStatus (req: Request, res: Response) {

        const lockerBoxId = req.params.id as string;
        const status = req.body.status;
        try {
            const updatedLocker = await prismaService.lockerBox.update({
                where: {
                    lockerBoxId,
                    isDeleted: false
                },
                data: {status}
            });

            return res.json(updatedLocker);

        } catch (e: any) {
            if (e.code === "P2025") {
                throw new HttpError(404, "Locker not found");
            }

            throw new HttpError(500, "Failed to update Locker status");
        }
    }

    async deleteBox (req: Request, res: Response) {
        try {
            const lockerBoxId = req.params.id as string;

            const station = await prismaService.lockerBox.update({
                where: {lockerBoxId},
                data: {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            });

            return res.json({message: "Locker deleted", station});

        } catch (e: any) {
            if (e.code === "P2025") {
                throw new HttpError(404, "Locker not found");
            }
            return res.status(500).json({
                message: "Failed to delete Locker",
                error: e.message
            });
        }

    }

}

export const boxService = new LockerBoxServiceImplPostgres();