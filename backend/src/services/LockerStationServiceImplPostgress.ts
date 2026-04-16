import { Request, Response } from "express";
import { Prisma } from "@prisma/client";

import { HttpError } from "../errorHandler/HttpError";
import { lockerCatalogProjectionService } from "../repositories/prisma/LockerCatalogProjectionService";
import { logAudit } from "../utils/audit";
import { sendSuccess } from "../utils/response";

import { ActionType } from "./dto/operationDto";
import { idempotencyService } from "./IdempotencyService";
import {
    deleteLockerProjections,
    loadOneStationWithFallback,
    loadStationsWithFallback,
    resolveStationDistance,
    stationMeta,
    StationQuery,
    syncLockerProjections,
    syncStationProjection,
    toStationListItem,
} from "./lockerStation/lockerStationService.helpers";
import { prismaService } from "./prismaService";

export class LockerStationServiceImplPostgres {
    async getAllStation(_req: Request, res: Response) {
        const stations = await lockerCatalogProjectionService.getAllStationsAdminView();
        return sendSuccess(res, stations);
    }

    async createStation(req: Request, res: Response) {
        return idempotencyService.execute(
            req,
            res,
            "station:create",
            req.body,
            async () => {
                const { city, latitude, longitude, address } = req.body as { city: string; latitude: number; longitude: number; address: string };

                try {
                    const result = await prismaService.$transaction(async (tx) => {
                        const cityForStation = await tx.city.findUnique({ where: { code: city } });
                        if (!cityForStation) throw new HttpError(404, "City not found");

                        const station = await tx.lockerStation.create({
                            data: {
                                cityId: cityForStation.cityId,
                                latitude,
                                longitude,
                                address,
                            },
                            select: {
                                stationId: true,
                                cityId: true,
                                city: {
                                    select: {
                                        code: true,
                                    },
                                },
                            },
                        });

                        await tx.$executeRaw(
                            Prisma.sql`
                                UPDATE "LockerStation"
                                SET location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
                                WHERE "stationId" = ${station.stationId}
                            `
                        );

                        const stationProjection = await lockerCatalogProjectionService.getStationCacheProjection(station.stationId, tx);

                        if (!stationProjection) throw new HttpError(500, "Failed to build station cache projection after create");

                        return {
                            station,
                        };
                    });

                    const stationCacheStatus = "DEFERRED" as const;

                    await logAudit({
                        req,
                        action: ActionType.STATION_CREATE,
                        actorId: req.user?.userId,
                        entityId: result.station.stationId,
                        entityType: "LockerStation",
                    });

                    return {
                        body: { id: result.station.stationId, city: result.station.city.code },
                        meta: stationMeta(stationCacheStatus),
                    };
                } catch (e: unknown) {
                    await logAudit({
                        req,
                        action: ActionType.STATION_CREATE_FAILED,
                        actorId: req.user?.userId,
                        entityId: "undefined",
                        entityType: "LockerStation",
                        details: { reason: e instanceof Error ? e.message : "Unknown error" }
                    });

                    if (e instanceof HttpError) {
                        throw e;
                    }

                    throw new HttpError(500, "Failed to create station");
                }
            }
        );
    }

    async getStations(req: Request, res: Response) {
        const city = req.query.city as string | undefined;
        const status = req.query.status as StationQuery["status"] | undefined;
        const lat = req.query.lat ? Number(req.query.lat) : undefined;
        const lng = req.query.lng ? Number(req.query.lng) : undefined;
        const radius = req.query.radius ? Number(req.query.radius) : undefined;

        const stations = await loadStationsWithFallback();

        const result = stations
            .filter((station) => !city || station.city.code === city)
            .filter((station) => !status || station.status === status)
            .map((station) => {
                const distance = lat !== undefined && lng !== undefined
                    ? resolveStationDistance({ lat, lng }, station)
                    : null;

                return toStationListItem(station, distance);
            })
            .filter((station) => radius === undefined || (station.distance !== null && station.distance <= radius))
            .sort((left, right) => {
                if (left.distance === null && right.distance === null) {
                    return 0;
                }

                if (left.distance === null) {
                    return 1;
                }

                if (right.distance === null) {
                    return -1;
                }

                return left.distance - right.distance;
            });

        return sendSuccess(res, result);
    }

    async getOneStation(req: Request, res: Response) {
        const stationId = req.params.id as string;
        const station = await loadOneStationWithFallback(stationId);

        if (!station) {
            throw new HttpError(404, "Station doesn't exist");
        }

        return sendSuccess(res, station);
    }

    async getOneStationAdmin(req: Request, res: Response) {
        const stationId = req.params.id as string;
        const station = await lockerCatalogProjectionService.getStationCacheProjection(stationId);

        if (!station) {
            throw new HttpError(404, "Station doesn't exist");
        }

        return sendSuccess(res, station);
    }

    async changeStationStatus(req: Request, res: Response) {
        const stationId = req.params.id as string;
        const status = req.body.status;

        return idempotencyService.execute(
            req,
            res,
            `station:status:${stationId}`,
            req.body,
            async () => {
                try {
                    const result = await prismaService.$transaction(async (tx) => {
                        const station = await tx.lockerStation.findUnique({ where: { stationId } });
                        if (!station) throw new HttpError(404, "Station not found");
                        if (station.isDeleted) throw new HttpError(400, "Station is deleted");
                        if (station.status === status) throw new HttpError(400, "Station is already " + status);

                        const updatedStation = await tx.lockerStation.update({
                            where: { stationId, isDeleted: false },
                            data: { status },
                        });

                        const [stationProjection, lockerProjections] = await Promise.all([
                            lockerCatalogProjectionService.getStationCacheProjection(stationId, tx),
                            lockerCatalogProjectionService.getLockerCacheProjectionsByStationId(stationId, tx),
                        ]);

                        if (!stationProjection) throw new HttpError(500, "Failed to build station cache projection after status change");

                        return {
                            updatedStation,
                            stationProjection,
                            lockerProjections,
                        };
                    });

                    //Change status in cache
                    const lockerCacheStatus = await syncLockerProjections(
                        result.lockerProjections,
                        req.correlationId,
                        req.user?.userId
                    );
                    const stationCacheStatus = "DEFERRED" as const;

                    await logAudit({
                        req,
                        action: ActionType.STATION_UPDATE_STATUS,
                        actorId: req.user?.userId,
                        entityId: stationId,
                        entityType: "LockerStation",
                    });

                    return {
                        body: { stationId, status },
                        meta: stationMeta(stationCacheStatus, lockerCacheStatus),
                    };
                } catch (e: unknown) {
                    await logAudit({
                        req,
                        action: ActionType.STATION_UPDATE_STATUS_FAILED,
                        actorId: req.user?.userId,
                        entityId: stationId,
                        entityType: "LockerStation",
                        details: { reason: e instanceof Error ? e.message : "Unknown error" }
                    });

                    if (e instanceof HttpError) {
                        throw e;
                    }

                    throw new HttpError(500, "Failed to update station status");
                }
            }
        );
    }

    async deleteStation(req: Request, res: Response) {
        const stationId = req.params.id as string;

        return idempotencyService.execute(
            req,
            res,
            `station:delete:${stationId}`,
            { stationId },
            async () => {
                try {
                    const result = await prismaService.$transaction(async (tx) => {
                        const lockerIds = await lockerCatalogProjectionService.getLockerIdsByStationId(stationId, tx);
                        const station = await tx.lockerStation.findUnique({ where: { stationId } });
                        if (!station) throw new HttpError(404, "Station not found");
                        if (station.isDeleted) throw new HttpError(400, "Station is already deleted");

                        await tx.lockerStation.update({
                            where: { stationId },
                            data: {
                                isDeleted: true,
                                deletedAt: new Date(),
                            },
                        });

                        return { lockerIds };
                    });

                    //Delete from cache
                    const lockerCacheStatus = await deleteLockerProjections(
                        result.lockerIds,
                        req.correlationId,
                        req.user?.userId
                    );
                    const stationCacheStatus = "DEFERRED" as const;

                    await logAudit({
                        req,
                        action: ActionType.STATION_DELETE,
                        actorId: req.user?.userId,
                        entityId: stationId,
                        entityType: "LockerStation",
                    });

                    return {
                        body: { message: "Station deleted", stationId },
                        meta: stationMeta(stationCacheStatus, lockerCacheStatus),
                    };
                } catch (e: unknown) {
                    await logAudit({
                        req,
                        action: ActionType.STATION_DELETE_FAILED,
                        actorId: req.user?.userId,
                        entityId: stationId,
                        entityType: "LockerStation",
                        details: { reason: e instanceof Error ? e.message : "Unknown error" }
                    });

                    if (e instanceof HttpError) {
                        throw e;
                    }

                    throw new HttpError(500, "Failed to delete station");
                }
            }
        );
    }

    async resyncStationCache(req: Request, res: Response) {
        const stationId = req.params.id as string;
        const stationProjection = await lockerCatalogProjectionService.getStationCacheProjection(stationId);

        if (!stationProjection) {
            throw new HttpError(404, "Station not found");
        }

        const stationCacheStatus = await syncStationProjection(stationProjection);

        return sendSuccess(res, { stationId }, 202, stationMeta(stationCacheStatus));
    }
}

export const stationService = new LockerStationServiceImplPostgres();
