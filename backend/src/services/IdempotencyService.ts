import crypto from "crypto";

import { Request, Response } from "express";

import { IdempotencyStatus } from "../contracts/idempotency.dto";
import { HttpError } from "../errorHandler/HttpError";
import { idempotencyRepository } from "../repositories/rds/IdempotencyRepository";
import { sendSuccess } from "../utils/response";

function hashPayload(payload: unknown) {
    return crypto.createHash("sha256").update(JSON.stringify(payload ?? {})).digest("hex");
}

function extractIdempotencyKey(req: Request) {
    const value = req.headers["idempotency-key"];
    return typeof value === "string" ? value.trim() : undefined;
}

class IdempotencyService {
    async execute<T>(
        req: Request,
        res: Response,
        scope: string,
        payload: unknown,
        handler: () => Promise<{ statusCode?: number; body: T; meta?: Record<string, unknown> }>
    ) {
        const key = extractIdempotencyKey(req);

        if (!key) {
            const result = await handler();
            return sendSuccess(res, result.body, result.statusCode ?? 200, result.meta);
        }

        const recordId = `${scope}:${key}`;
        const requestHash = hashPayload(payload);
        const began = await idempotencyRepository.tryBegin(recordId, requestHash);

        if (!began) {
            const existing = await idempotencyRepository.findById(recordId);

            if (!existing) {
                throw new HttpError(409, "Idempotent request is already in progress");
            }

            if (existing.requestHash !== requestHash) {
                throw new HttpError(409, "Idempotency key was already used with a different payload");
            }

            if (existing.status === IdempotencyStatus.IN_PROGRESS) {
                throw new HttpError(409, "Idempotent request is already in progress");
            }

            if (existing.responseStatusCode === null || existing.responseBody === null) {
                throw new HttpError(409, "Stored idempotent response is incomplete");
            }

            return res.status(existing.responseStatusCode).json(existing.responseBody);
        }

        const result = await handler();
        const responseBody = {
            success: true,
            correlationId: res.getHeader("x-correlation-id") as string | undefined,
            data: result.body,
            ...(result.meta && { meta: result.meta }),
        };

        await idempotencyRepository.complete(recordId, {
            statusCode: result.statusCode ?? 200,
            body: responseBody,
        });

        return res.status(result.statusCode ?? 200).json(responseBody);
    }
}

export const idempotencyService = new IdempotencyService();
