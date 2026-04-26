import {Request, Response} from "express";

import {HttpError} from "../errorHandler/HttpError";
import {logAudit} from "../utils/audit";

import {prismaService} from "./prismaService";
import {idempotencyService} from "./IdempotencyService";
import {ActionType} from "./dto/operationDto";


export class PricingServiceImplPostgres {


    async getAllPrices(req: Request, res: Response) {
        const prices = await prismaService.pricing.findMany({
            include: {
                city: {
                    select: { code : true, name : true },
                   },
            }
        });

        return res.json(prices);
    }

    async createPrice(req: Request, res: Response) {
        return idempotencyService.execute(
            req,
            res,
            "price:create",
            req.body,
            async () => {
                const {pricePerHour, cityId, size} = req.body as {cityId: string, size: "S" | "M" | "L", pricePerHour: number};

                try {
                    const result = await prismaService.$transaction(async (tx) => {
                        const priceExist = await tx.pricing.findUnique({
                            where: {
                                cityId_size : {cityId, size}}
                        });
                        if (priceExist) {
                            throw new HttpError(400, "Price already exists");
                        }
                        const price = await tx.pricing.create({
                                data: {
                                    cityId,
                                    pricePerHour,
                                    size
                                },
                                select: {
                                    priceId: true
                                }
                            }
                        )
                        return {price};
                    });
                    await logAudit({
                        req,
                        action: ActionType.PRICE_CREATE,
                        actorId: req.user?.userId,
                        entityId: result.price.priceId,
                        entityType: "Pricing",
                    });
                    return {
                        statusCode: 201,
                        body: {id: result.price.priceId }
                    };
                } catch (e) {
                    await logAudit({
                        req,
                        action: ActionType.PRICE_CREATE_FAILED,
                        actorId: req.user?.userId,
                        entityId: "undefined",
                        entityType: "Pricing",
                        details: { reason: e instanceof Error ? e.message : "Unknown error" }
                    });

                    if (e instanceof HttpError) {
                        throw e;
                    }
                    throw new HttpError(500, "Failed to create price");
                }
            }
        )
    }

    async changePrice(req: Request, res: Response) {
        return idempotencyService.execute(
            req,
            res,
            "price:changePrice",
            req.body,
            async () => {
                const {pricePerHour} = req.body as {pricePerHour: number};
                const priceId = req.params.id as string;

                try {
                    const result = await prismaService.$transaction(async (tx) => {
                        const priceExist = await tx.pricing.findUnique({
                            where: {
                                priceId,
                            }
                        });
                        if (!priceExist) {
                            throw new HttpError(404, "Price not found");
                        }
                        const price = await tx.pricing.update({
                            where: {priceId},
                                data: {
                                    pricePerHour,
                                },
                                select: {
                                    priceId: true,
                                    size: true,
                                    pricePerHour: true
                                }
                            }
                        )
                        return {price};
                    });
                    await logAudit({
                        req,
                        action: ActionType.PRICE_UPDATE,
                        actorId: req.user?.userId,
                        entityId: result.price.priceId,
                        entityType: "Pricing",
                    });
                    return {
                        statusCode: 200,
                        body: {newPrice: result.price }
                    };
                } catch (e) {
                    await logAudit({
                        req,
                        action: ActionType.PRICE_UPDATE_FAILED,
                        actorId: req.user?.userId,
                        entityId: "undefined",
                        entityType: "Pricing",
                        details: { reason: e instanceof Error ? e.message : "Unknown error" }
                    });

                    if (e instanceof HttpError) {
                        throw e;
                    }
                    throw new HttpError(500, "Failed to update price");
                }
            }
        )
    }



}

export const pricingService = new PricingServiceImplPostgres();