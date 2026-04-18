import {NextFunction, Request, Response} from "express";
import {ZodError, ZodTypeAny} from "zod";

import {HttpError} from "../errorHandler/HttpError";

export const validateRequest =
    (schema: ZodTypeAny) =>
        (req: Request, res: Response, next: NextFunction) => {
            try {
                schema.parse({
                    body: req.body,
                    params: req.params,
                    query: req.query,
                    cookies: req.cookies,
                });

                next();
            } catch (e) {
                if (e instanceof ZodError) {
                    const details = e.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                    }));
                    return next(new HttpError(400, "Validation failed", "VALIDATION_ERROR", details));
                }
                next(e);
            }
        };
