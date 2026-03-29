import {NextFunction, Request, Response} from "express";

import {operationsService} from "../services/OperationService";


export const createOperation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await operationsService.createOperation(req,res);
    } catch (e) {
        next(e);
    }
}

export const getOperationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await operationsService.getOperationStatus(req,res);
    } catch (e) {
        next(e);
    }
}