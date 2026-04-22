import { NextFunction, Request, Response } from "express";

import { paymentService } from "../services/PaymentService";

export const stripeWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await paymentService.handleStripeWebhook(req, res);
    } catch (error) {
        next(error);
    }
};
