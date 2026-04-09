import {Request, Response} from "express";

import {attachPricesToStations} from "../utils/tools";
import {HttpError} from "../errorHandler/HttpError";

import {prismaService} from "./prismaService";


export class LockerStationServiceImplPostgres {

    async getAllStation(req: Request, res: Response) {
        const stations = await prismaService.lockerStation.findMany({
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
        const result = await attachPricesToStations(stations);
        return res.json(result);
    }


    async createStation(req: Request, res: Response) {
        const {city, latitude, longitude, address} = req.body;
        const cityForStation = await prismaService.city.findUnique({
            where: {code: city}
        });

        if (!cityForStation) {
            throw new HttpError(400, "City not found");
        }
        const station = await prismaService.lockerStation.create({
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
        await prismaService.$executeRaw`
            UPDATE "LockerStation"
            SET location = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)
            WHERE "stationId" = ${station.stationId}
        `;

        return res.status(200).json({id: station.stationId, city: city});
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
        COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'lockerBoxId', lb."lockerBoxId",
                    'stationId', lb."stationId",
                    'code', lb."code",
                    'size', lb."size",
                    'status', lb."status",
                    'createdAt', lb."createdAt",
                    'updatedAt', lb."updatedAt"
                )
            ) FILTER (WHERE lb."lockerBoxId" IS NOT NULL),
            '[]'
        ) AS lockers
    FROM "LockerStation" ls
    JOIN "City" c ON ls."cityId" = c."cityId"
    LEFT JOIN "LockerBox" lb
        ON lb."stationId" = ls."stationId"
       AND lb."isDeleted" = false
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

        const result = await attachPricesToStations(stations as any[]);
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
            const updatedStation = await prismaService.lockerStation.update({
                where: {
                    stationId,
                    isDeleted: false
                },
                data: {status}
            });

            return res.json(updatedStation);

        } catch (e: any) {
            if (e.code === "P2025") {
                throw new HttpError(404, "Station not found");
            }

            throw new HttpError(500, "Failed to update station status");
        }
    }

    async deleteStation(req: Request, res: Response) {
        try {
            const stationId = req.params.id as string;

            const station = await prismaService.lockerStation.update({
                where: {stationId},
                data: {
                    isDeleted: true,
                    deletedAt: new Date()
                }
            });

            return res.json({message: "Station deleted", station});

        } catch (e: any) {
            if (e.code === "P2025") {
                throw new HttpError(404, "Station not found");
            }
            return res.status(500).json({
                message: "Failed to delete station",
                error: e.message
            });
        }
    }

}


export const stationService = new LockerStationServiceImplPostgres();