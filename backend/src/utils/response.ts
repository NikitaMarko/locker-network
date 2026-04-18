import { Response } from "express";

import { ApiErrorResponse, ApiSuccessResponse } from "../contracts/response.dto";

export function buildSuccessPayload<T>(
    correlationId: string | undefined,
    data: T,
    meta?: Record<string, unknown>
): ApiSuccessResponse<T> {
    return {
        success: true,
        status: "success",
        correlationId,
        data,
        ...(meta && { meta }),
    };
}

export function buildErrorPayload(
    correlationId: string | undefined,
    code: string,
    message: string,
    details?: unknown
): ApiErrorResponse {
    return {
        success: false,
        status: "error",
        correlationId,
        message,
        error: {
            code,
            message,
            ...(details !== undefined && { details }),
        },
    };
}

export function sendSuccess<T>(
    res: Response,
    data: T,
    status = 200,
    meta?: Record<string, unknown>
) {
    const payload = buildSuccessPayload(
        res.getHeader("x-correlation-id") as string | undefined,
        data,
        meta
    );

    return res.status(status).json(payload);
}

export function sendError(
    res: Response,
    status: number,
    code: string,
    message: string,
    details?: unknown
) {
    const payload = buildErrorPayload(
        res.getHeader("x-correlation-id") as string | undefined,
        code,
        message,
        details
    );

    return res.status(status).json(payload);
}
