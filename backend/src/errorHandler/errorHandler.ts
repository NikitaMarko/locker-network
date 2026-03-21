import {NextFunction, Request, Response} from "express";
import {ZodError} from "zod";

import {logger} from "../Logger/winston";

import {HttpError} from "./HttpError";


export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ZodError) {
        return res.status(400).json({
            status: "fail",
            message: "Validation failed",
            errors: err.flatten().fieldErrors,
        });
    }
    if (err instanceof HttpError) {
        return res.status(err.status).json({
            status: "error",
            message: err.message,
        });
    }

    logger.error("Internal Server Error", err);

    return res.status(500).json({
        status: "error",
        message: "Internal Server Error",
    });
};
