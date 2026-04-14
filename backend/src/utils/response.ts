import { Response } from "express";

import { ApiErrorResponse, ApiSuccessResponse } from "../contracts/response.dto";

export function sendSuccess<T>(
    res: Response,
    data: T,
    status = 200,
    meta?: Record<string, unknown>
) {
    const payload: ApiSuccessResponse<T> = {
        success: true,
        correlationId: res.getHeader("x-correlation-id") as string | undefined,
        data,
        ...(meta && { meta }),
    };

    return res.status(status).json(payload);
}

export function sendError(
    res: Response,
    status: number,
    code: string,
    message: string,
    details?: unknown
) {
    const payload: ApiErrorResponse = {
        success: false,
        correlationId: res.getHeader("x-correlation-id") as string | undefined,
        error: {
            code,
            message,
            ...(details !== undefined && { details }),
        },
    };

    return res.status(status).json(payload);
}
