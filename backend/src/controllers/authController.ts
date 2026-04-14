import {NextFunction, Request, Response} from "express";

import {HttpError} from '../errorHandler/HttpError';
import { logSecurityEvent, SecurityEventType } from "../services/securityEventService";
import {authService} from '../services/AuthServiceImplPostgres';
import {TokenPayload} from "../utils/jwt";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await authService.register(res, req, req.body);
    } catch (e) {
        next(e);
    }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await authService.login(res, req, req.body);
    } catch (e) {
        next(e);
    }
};

export const googleLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        return await authService.googleLogin(res, req, req.body);
    } catch (e) {
        next(e);
    }
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
    try{
    const {userId} = req.user as TokenPayload;
    const currentUser = await authService.me(userId);
    return res.status(200).json({
        status: 'success',
        data: {
            ...currentUser
        },
    })
    } catch (e) {
        next(e)
    }
}


export const refresh = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies?.refreshToken;

        if (!token) {
            void logSecurityEvent({
                req,
                eventType: SecurityEventType.AUTH_MISSING_TOKEN,
                reason: "Missing refresh token cookie",
            });
            throw new HttpError(401, "No refresh token");
        }

        return await authService.refresh(res, req, token);
    } catch (e) {
        next(e);
    }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { sessionId, userId } = req.user as TokenPayload;

        if (!userId) {
            throw new HttpError(401, "Unauthorized");
        }

        await authService.logout(res, req, sessionId, userId);
    } catch (e) {
        next(e);
    }
};
