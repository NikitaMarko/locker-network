import {NextFunction, Request, Response} from "express";

import {boxService} from "../services/LockerBoxServiceImplPostgress";


export const createBox = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await boxService.createBox(req,res);
    } catch (e) {
        next(e);
    }
}


export const getAllBoxes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await boxService.getAllBoxes(req,res);
    } catch (e) {
        next(e);
    }
};