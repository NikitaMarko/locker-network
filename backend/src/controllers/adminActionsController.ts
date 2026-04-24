import { NextFunction, Request, Response } from "express";

import { AdminActions } from "../services/AdminActionService";

export const changeRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await AdminActions.changeRole(req, res);
    } catch (e) {
        next(e);
    }
};