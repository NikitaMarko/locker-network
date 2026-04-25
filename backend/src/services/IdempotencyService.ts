import crypto from "crypto";

import { Request, Response } from "express";

import { IdempotencyStatus } from "../contracts/idempotency.dto";
import { HttpError } from "../errorHandler/HttpError";
import { idempotencyRepository } from "../repositories/rds/IdempotencyRepository";
import { buildErrorPayload, buildSuccessPayload, sendSuccess } from "../utils/response";

function normalizePayload(value: unknown): unknown {
    if (Array.isArray(value)) {
        return value.map((item) => normalizePayload(item));
    }

    if (value && typeof value === "object") {
        return Object.keys(value as Record<string, unknown>)
            .sort()
            .reduce<Record<string, unknown>>((acc, key) => {
                acc[key] = normalizePayload((value as Record<string, unknown>)[key]);
                return acc;
            }, {});
    }

    return value;
}

function hashPayload(payload: unknown) {
    const normalizedPayload = normalizePayload(payload ?? {});
    return crypto.createHash("sha256").update(JSON.stringify(normalizedPayload)).digest("hex");
}

function extractIdempotencyKey(req: Request) {
    const value = req.headers["idempotency-key"] ?? req.headers["x-idempotency-key"];
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

        try {
            const result = await handler();
            const responseStatusCode = result.statusCode ?? 200;
            const responseBody = buildSuccessPayload(
                res.getHeader("x-correlation-id") as string | undefined,
                result.body,
                result.meta
            );

            await idempotencyRepository.complete(recordId, {
                statusCode: responseStatusCode,
                body: responseBody,
            });

            return res.status(responseStatusCode).json(responseBody);
        } catch (error) {
            if (error instanceof HttpError) {
                const errorResponseBody = buildErrorPayload(
                    res.getHeader("x-correlation-id") as string | undefined,
                    error.code,
                    error.message
                );

                await idempotencyRepository.fail(recordId, {
                    statusCode: error.status,
                    body: errorResponseBody,
                });
            } else {
                await idempotencyRepository.release(recordId, requestHash);
            }

            throw error;
        }
    }
}

export const idempotencyService = new IdempotencyService();
