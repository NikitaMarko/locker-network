import {Request, Response} from "express";

import {attachPricesToStations} from "../utils/tools";
import {HttpError} from "../errorHandler/HttpError";

import {prismaService} from "./prismaService";
import {logAudit} from "../utils/audit";
import {ActionType} from "./dto/operationDto";


export class LockerStationServiceImplPostgres {

    async getAllStation(req: Request, res: Response) {
        const stations = await prismaService.lockerStation.findMany({
            include: {
                city: {
                    select: {
                        code: true,
                        name: true
                    }
                },
                _count: {
                    select: {
                        lockers: {
                            where: {
                                isDeleted: false,
                                status: "AVAILABLE",
                            },
                        }
                    }
                }
            }
        });
        return res.json(stations);
    }


    async createStation(req: Request, res: Response) {
        const {city, latitude, longitude, address} = req.body;
        try{
            const result = await prismaService.$transaction(async (tx) => {
                const cityForStation = await tx.city.findUnique({
                    where: {code: city}
                });

                if (!cityForStation) {
                    throw new HttpError(404, "City not found");
                }
                const station = await tx.lockerStation.create({
                    data: {
                        cityId: cityForStation.cityId,
                        latitude,
                        longitude,
                        address
                    },
                    select: {
                        stationId: true,
                        status: true
                    }
                });
                await tx.$executeRaw`
                    UPDATE "LockerStation"
                    SET location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
                    WHERE "stationId" = ${station.stationId}
                `;
                await logAudit({
                    req,
                    action: ActionType.STATION_CREATE,
                    actorId: req.user!.userId,
                    entityId: station.stationId,
                    entityType: 'LockerStation',
                });
                return station;
            })

            //ToDo DynamoDB
            return res.status(200).json({id: result.stationId, city: city});
        }
        catch(e:any){
            await logAudit({
                req,
                action: ActionType.STATION_CREATE_FAILED,
                actorId: req.user!.userId,
                entityId: "undefined",
                entityType: 'LockerStation',
                details: {reason: e.message}
            });
            if (e instanceof HttpError) {
                throw e;
            }
            throw new HttpError(500, "Failed to create station");
        }

    }

    async getStations(req: Request, res: Response) {
        const city = req.query.city as string | undefined;
        const status = req.query.status as
            | "ACTIVE"
            | "INACTIVE"
            | "MAINTENANCE"
            | undefined;

        const lat = req.query.lat ? Number(req.query.lat) : null;
        const lng = req.query.lng ? Number(req.query.lng) : null;
        const radius = req.query.radius ? Number(req.query.radius) : null;

        const stations = await prismaService.$queryRaw`
            SELECT
                ls."stationId",
                ls."cityId",
                c."code" AS "cityCode",
                c."name" AS "cityName",
                ls."address",
                ls."latitude",
                ls."longitude",
                ls."status",
                ls."createdAt",
                ls."updatedAt",
                ls."isDeleted",
                ls."deletedAt",
                CASE
                    WHEN ${lat}::double precision IS NOT NULL
                    AND ${lng}::double precision IS NOT NULL
                THEN ROUND(
                  ST_Distance(
                       ls."location"::geography,
                       ST_SetSRID(
                             ST_MakePoint(
                                 ${lng}::double precision,
                                 ${lat}::double precision
                             ),
                             4326
                  )::geography
                )::numeric,
                2
                )
                ELSE NULL
            END AS distance,
        json_build_object(
            'lockers',
            COUNT(lb."lockerBoxId") FILTER (
                WHERE lb."status" = 'AVAILABLE'
                  AND lb."isDeleted" = false
            )
        ) AS "_count"
    FROM "LockerStation" ls
    JOIN "City" c ON ls."cityId" = c."cityId"
    LEFT JOIN "LockerBox" lb
        ON lb."stationId" = ls."stationId"
       
    WHERE ls."isDeleted" = false
      AND (${city ?? null}::text IS NULL OR c."code" = ${city ?? null})
            AND (${status ?? null}::"StationStatus" IS NULL
            OR ls."status" = ${status ?? null}::"StationStatus")
            AND ( 
                ${radius}::double precision IS NULL  
                OR (
                    ${lat}::double precision IS NOT NULL
                    AND ${lng}::double precision IS NOT NULL
                    AND ST_DWithin(
                        ls."location"::geography,
                        ST_SetSRID(
                            ST_MakePoint(
                                ${lng}::double precision,
                                ${lat}::double precision
                            ),
                            4326
                        )::geography,
                        ${radius}::double precision
                    )
                )
            )
            GROUP BY ls."stationId", c."cityId", c."code", c."name"
            ORDER BY distance ASC NULLS LAST;
        `;

        const result = (stations as any[]).map((station) => ({
            stationId: station.stationId,
            cityId: station.cityId,
            address: station.address,
            latitude: station.latitude,
            longitude: station.longitude,
            status: station.status,
            createdAt: station.createdAt,
            updatedAt: station.updatedAt,
            isDeleted: station.isDeleted,
            deletedAt: station.deletedAt,
            distance: station.distance,
            city: {
                code: station.cityCode,
                name: station.cityName,
            },
            _count: station._count,
        }));
        return res.json(result);
    }

    async getOneStation(req: Request, res: Response) {
        const stationId = req.params.id as string;
        const station = await prismaService.lockerStation.findUnique({
            where: {
                stationId
            },
            include: {
                lockers: {
                    where: { isDeleted: false }
                },
                city: {
                    select: {
                        code: true,
                        name: true
                    }
                }
            }
        });
        if (!station) {
            throw new HttpError(404, "Station doesn't exist");
        }
        const [result] = await attachPricesToStations([station]);
        return res.json(result);
    }

    async changeStationStatus(req: Request, res: Response) {
        const stationId = req.params.id as string;
        const status = req.body.status;
        try {
            const result = await prismaService.$transaction(async (tx) => {
                const station = await tx.lockerStation.findUnique({
                    where: {stationId}
                });
                if (!station) {
                    throw new HttpError(404, "Station not found");
                }
                if (station.isDeleted){
                    throw new HttpError(400, "Station is deleted");
                }
                if (station.status === status) {
                    throw new HttpError(400, "Station is already " + status);
                }

                const updatedStation = await tx.lockerStation.update({
                    where: {
                        stationId,
                        isDeleted: false
                    },
                    data: {status}
                });

                await logAudit({
                    req,
                    action: ActionType.STATION_UPDATE_STATUS,
                    actorId: req.user!.userId,
                    entityId: stationId,
                    entityType: 'LockerStation',
                });
                return updatedStation;
            })

            //ToDo DynamoDB
            return res.json(result);

        } catch (e: any) {
            await logAudit({
                req,
                action: ActionType.STATION_UPDATE_STATUS_FAILED,
                actorId: req.user!.userId,
                entityId: stationId,
                entityType: 'LockerStation',
                details: {reason: e.message}
            });
            if (e instanceof HttpError) {
                throw e;
            }
            throw new HttpError(500, "Failed to update station status");
        }
    }

    async deleteStation(req: Request, res: Response) {
        const stationId = req.params.id as string;
        try {
            const result = await prismaService.$transaction(async (tx) => {
               const station = await tx.lockerStation.findUnique({
                   where: {stationId}
               });

               if (!station) {
                   throw new HttpError(404, "Station not found");
               }
               if (station.isDeleted){
                   throw new HttpError(400, "Station is already deleted");
               }

               const deleteStation = await tx.lockerStation.update({
                    where: {stationId},
                    data: {
                        isDeleted: true,
                        deletedAt: new Date()
                    }
               });

               await logAudit({
                    req,
                    action: ActionType.STATION_DELETE,
                    actorId: req.user!.userId,
                    entityId: stationId,
                    entityType: 'LockerStation',
               });
               return deleteStation;
            })

            //ToDo DynamoDB
            return res.json({message: "Station deleted", result});

        } catch (e: any) {
            await logAudit({
                req,
                action: ActionType.STATION_DELETE_FAILED,
                actorId: req.user!.userId,
                entityId: stationId,
                entityType: 'LockerStation',
                details: {reason: e.message}
            });
            if (e instanceof HttpError) {
                throw e;
            }
            throw new HttpError(500, "Failed to delete station");
        }
    }

}


export const stationService = new LockerStationServiceImplPostgres();