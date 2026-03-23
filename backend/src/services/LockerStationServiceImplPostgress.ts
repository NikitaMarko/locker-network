import {Request, Response} from "express";
import {prismaService} from "./prismaService";


export class LockerStationServiceImplPostgres {

    async getAllStation(req: Request, res: Response){
        const stations = await prismaService.lockerStation.findMany ({ include :   { lockers     : true   } });
        return res.json(stations);
    }


    async createStation(req: Request, res: Response) {
        const {city,latitude, longitude} = req.body;
        const station = await prismaService.lockerStation.create({
            data:{
                city,
                latitude,
                longitude,
            },
            select:{
                stationId: true,
                status: true
            }
        })
        return res.status(200).json({massage: "station created"});
    }
}


export const stationService = new LockerStationServiceImplPostgres();