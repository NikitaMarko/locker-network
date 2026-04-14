import {NextFunction, Request, Response} from "express";

import { cacheSyncService } from "../services/CacheSyncService";
import { stationService } from "../services/LockerStationServiceImplPostgress";


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

export const getStations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await stationService.getStations(req,res);
    } catch (e) {
        next(e);
    }
}

export const getOneStation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await stationService.getOneStation(req,res);
    } catch (e) {
        next(e);
    }
}

export const getOneStationAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await stationService.getOneStationAdmin(req, res);
    } catch (e) {
        next(e);
    }
}

export const changeStationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await stationService.changeStationStatus(req,res);
    } catch (e) {
        next(e);
    }
}

export const deleteStation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await stationService.deleteStation(req,res);
    } catch (e) {
        next(e);
    }
}

export const resyncStationCache = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await stationService.resyncStationCache(req, res);
    } catch (e) {
        next(e);
    }
}

export const reconcileCatalogCache = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await cacheSyncService.reconcileAll(req, res);
    } catch (e) {
        next(e);
    }
}
