import {NextFunction, Request, Response} from "express";

import {stationService} from "../services/LockerStationServiceImplPostgress";


export const createStation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await stationService.createStation(req,res);
    } catch (e) {
        next(e);
    }
}

export const getAllStation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await stationService.getAllStation(req,res);
    } catch (e) {
        next(e);
    }
}