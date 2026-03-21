import {NextFunction, Request, RequestHandler, Response} from "express";
import jwt from "jsonwebtoken";

import {env} from "../config/env";
import {HttpError} from "../errorHandler/HttpError";
import {logger} from "../Logger/winston";
import {prismaService} from "../services/prismaService";
import {TokenPayload} from "../utils/jwt";


export const protect: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {

    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) return next(new HttpError(401, 'You are not logged in'));
    try {
        const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET!) as TokenPayload;

        const currentUser = await prismaService.user.findUnique({
            where: { userId: decoded.userId },
            select: {
                userId: true,
                role: true,
                tokenVersion: true,
            },
        });

        if (!currentUser) {
            return next(new HttpError(401, 'The user belongs to this token does no longer exist!'));
        }

        if (decoded.tokenVersion !== currentUser.tokenVersion) {
            return next(new HttpError(401, "Token has been revoked. Please log in again"));
        }

        req.user = currentUser;

        next();
    } catch (e) {
        logger.warn("Invalid auth token");
        next(new HttpError(401, 'Invalid token'));
    }
};



