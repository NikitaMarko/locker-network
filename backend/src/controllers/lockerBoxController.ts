import {NextFunction, Request, Response} from "express";

import { boxService } from "../services/LockerBoxServiceImplPostgress";


export const createBox = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await boxService.createBox(req,res);
    } catch (e) {
        next(e);
    }
};


export const getAllBoxes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await boxService.getAllBoxes(req,res);
    } catch (e) {
        next(e);
    }
};

export const getBoxes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await boxService.getBoxes(req,res);
    } catch (e) {
        next(e);
    }
};

export const getOneBox = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await boxService.getOneBox(req,res);
    } catch (e) {
        next(e);
    }
};

export const getOneBoxAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await boxService.getOneBoxAdmin(req, res);
    } catch (e) {
        next(e);
    }
};

export const changeBoxStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await boxService.changeBoxStatus(req,res);
    } catch (e) {
        next(e);
    }
};

export const changeBoxTechStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await boxService.changeBoxTechStatus(req, res);
    } catch (e) {
        next(e);
    }
};

export const deleteBox = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await boxService.deleteBox(req,res);
    } catch (e) {
        next(e);
    }
}

export const resyncLockerCache = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await boxService.resyncLockerCache(req, res);
    } catch (e) {
        next(e);
    }
}
