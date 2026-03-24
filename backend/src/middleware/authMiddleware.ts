import {NextFunction, Request, RequestHandler, Response} from "express";
import jwt from "jsonwebtoken";

import {env} from "../config/env";
import {HttpError} from "../errorHandler/HttpError";
import {logger} from "../Logger/winston";
import {prismaService} from "../services/prismaService";
import {TokenPayload} from "../utils/jwt";
import {Role} from "../prisma"

export const protect: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {

    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return next(new HttpError(401, 'You are not logged in'));
    try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET!) as TokenPayload;

        const currentUser = {
            userId: decoded.userId,
            role: decoded.role,
            tokenVersion: decoded.tokenVersion,
        }

        req.user = currentUser;
        next();
    } catch (e) {
        logger.warn("Invalid auth token");
        next(new HttpError(401, 'Invalid token'));
    }
};

export const authorize = (...roles: Role[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new HttpError(401, 'Not authenticated'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new HttpError(403, 'Access denied'));
        }

        next();
    };
};

