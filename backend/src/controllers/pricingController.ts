import {NextFunction, Request, Response} from "express";

import {pricingService} from "../services/PricingServiceImplPostgres";



export const getAllPrices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await pricingService.getAllPrices(req,res);
    } catch (e) {
        next(e);
    }
};

export const createPrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await pricingService.createPrice(req,res);
    } catch (e) {
        next(e);
    }
};

export const changePrice = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await pricingService.changePrice(req,res);
    } catch (e) {
        next(e);
    }
};