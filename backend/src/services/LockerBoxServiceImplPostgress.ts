import {Response, Request} from "express";

import {attachPricesToLockers} from "../utils/tools";
import {HttpError} from "../errorHandler/HttpError";
import {logAudit} from "../utils/audit";

import {prismaService} from "./prismaService";
import {ActionType} from "./dto/operationDto";


export class LockerBoxServiceImplPostgres {

    async getAllBoxes(req: Request, res: Response) {
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
                                Pricing: true
                            },
                        },
                    },
                },
            },
        });

        const result = await attachPricesToLockers(lockers);

        return res.json(result);
    }

    async createBox(req: Request, res: Response) {
        const {stationId, code, size} = req.body;

        try{
            const result = await prismaService.$transaction(async (tx) => {
                const stationExists = await tx.lockerStation.findUnique({
                    where: {stationId},
                })
                if (!stationExists) {
                    throw new HttpError(404, `Station not found`);
                }
                const boxExists = await tx.lockerBox.findUnique({
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
                const box = await tx.lockerBox.create({
                    data: {
                        stationId,
                        code,
                        size,
                    },
                    select: {
                        lockerBoxId: true,
                        status: true,
                        createdAt: true
                    }
                });

                await logAudit({
                    req,
                    action: ActionType.LOCKER_CREATE,
                    actorId: req.user!.userId,
                    entityId: box.lockerBoxId,
                    entityType: 'LockerBox',
                });
                return box;
            })

            // ToDo DynamoDB

            return res.status(200).json({id: result.lockerBoxId, stationId: stationId});
        }
        catch(e: any){
            await logAudit({
                req,
                action: ActionType.LOCKER_CREATE_FAILED,
                actorId: req.user!.userId,
                entityId: stationId,
                entityType: 'LockerBox',
                details: {reason: e.message}
            });
            if (e instanceof HttpError) {
                throw e;
            }
            throw new HttpError(500, "Failed to create locker");
        }


    }

    async getBoxes(req: Request, res: Response) {
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
                ...(stationId && {stationId}),
                ...(size && {size}),
                ...(status && {status}),
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
                                Pricing: true
                            },
                        },
                    },
                },
            }
        });

        const result = await attachPricesToLockers(lockers);

        return res.json(result);
    }

    async getOneBox(req: Request, res: Response) {
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
                                Pricing: true
                            },
                        },
                    },
                },
            }
        });
        if (!locker) {
            throw new HttpError(404, "Locker doesn't exist");
        }
        const [result] = await attachPricesToLockers([locker]);
        return res.json(result);
    }

    async changeBoxStatus(req: Request, res: Response) {

        const lockerBoxId = req.params.id as string;
        const status = req.body.status;

            try {
                const result = await prismaService.$transaction(async (tx) => {
                    const locker = await tx.lockerBox.findUnique({
                        where: {lockerBoxId}
                    })
                    if (!locker) {
                        throw new HttpError(404, "Locker doesn't exist");
                    }
                    if (locker.isDeleted) {
                        throw new HttpError(400, "Locker deleted");
                    }
                    if(locker.status === status) {
                        throw new HttpError(400, "Locker is already " + status);
                    }

                    const updatedLocker = await tx.lockerBox.update({
                    where: {
                        lockerBoxId,
                        isDeleted: false
                    },
                    data: {status}
                });

                await logAudit({
                    req,
                    action: ActionType.LOCKER_UPDATE_STATUS,
                    actorId: req.user!.userId,
                    entityId: lockerBoxId,
                    entityType: 'LockerBox',
                });

               return updatedLocker;
                })

                //ToDo DynamoDB
                return res.json(result);
            } catch (e: any) {
                await logAudit({
                    req,
                    action: ActionType.LOCKER_UPDATE_STATUS_FAILED,
                    actorId: req.user!.userId,
                    entityId: lockerBoxId,
                    entityType: 'LockerBox',
                    details: {reason: e.message}
                });
                if (e instanceof HttpError) {
                    throw e;
                }
                throw new HttpError(500, "Failed to update locker status");
            }
    }

    async deleteBox(req: Request, res: Response) {
        const lockerBoxId = req.params.id as string;

            try {
                const result = await prismaService.$transaction(async (tx) => {
                    const locker = await tx.lockerBox.findUnique({
                        where: {lockerBoxId}
                    })
                    if (!locker) {
                        throw new HttpError(404, "Locker doesn't exist");
                    }
                    if (locker.isDeleted) {
                        throw new HttpError(400, "Locker already deleted");
                    }
                    const deleteLocker = await tx.lockerBox.update({
                        where: {lockerBoxId},
                        data: {
                            isDeleted: true,
                            deletedAt: new Date()
                        }
                    });

                    await logAudit({
                        req,
                        action: ActionType.LOCKER_DELETE,
                        actorId: req.user!.userId,
                        entityId: lockerBoxId,
                        entityType: 'LockerBox',
                    });

                    return deleteLocker;
                })

                //ToDo DynamoDB
                return res.json({message: "Locker deleted", result});
            } catch (e: any) {
                await logAudit({
                    req,
                    action: ActionType.LOCKER_DELETE_FAILED,
                    actorId: req.user!.userId,
                    entityId: lockerBoxId,
                    entityType: 'LockerBox',
                    details: {reason: e.message}
                });
                if (e instanceof HttpError) {
                    throw e;
                }
                throw new HttpError(500, "Failed to delete locker");
            }

    }

}

export const boxService = new LockerBoxServiceImplPostgres();