import { randomUUID } from "crypto";

import { Request } from "express";

import { logger } from "../Logger/winston";

import { OperationType } from "./dto/operationDto";
import { sendSecurityEventToQueue } from "./sqsService";

export enum SecurityEventType {
    AUTH_MISSING_TOKEN = "AUTH_MISSING_TOKEN",
    AUTH_INVALID_TOKEN = "AUTH_INVALID_TOKEN",
    AUTH_FORBIDDEN = "AUTH_FORBIDDEN",
    AUTH_INVALID_CREDENTIALS = "AUTH_INVALID_CREDENTIALS",
    AUTH_REFRESH_FAILED = "AUTH_REFRESH_FAILED",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}

interface LogSecurityEventParams {
    req: Request;
    eventType: SecurityEventType;
    reason: string;
    actorId?: string;
    details?: Record<string, unknown>;
}

function getIpAddress(req: Request) {
    const forwardedFor = req.headers["x-forwarded-for"];

    if (typeof forwardedFor === "string" && forwardedFor.trim().length > 0) {
        return forwardedFor.split(",")[0]?.trim() ?? req.ip ?? "unknown";
    }

    return req.ip ?? "unknown";
}

export async function logSecurityEvent({
    req,
    eventType,
    reason,
    actorId,
    details,
}: LogSecurityEventParams): Promise<void> {
    try {
        await sendSecurityEventToQueue({
            operationId: randomUUID(),
            type: OperationType.SECURITY_EVENT,
            payload: {
                eventId: randomUUID(),
                eventType,
                occurredAt: new Date().toISOString(),
                actorId,
                correlationId: req.correlationId ?? (req.headers["x-correlation-id"] as string | undefined),
                ipAddress: getIpAddress(req),
                userAgent: req.get("user-agent") ?? "unknown",
                method: req.method,
                path: req.originalUrl,
                reason,
                details,
            },
        });
    } catch (error) {
        (req.log || logger).error("Failed to enqueue security event", {
            eventType,
            actorId,
            error,
        });
    }
}
