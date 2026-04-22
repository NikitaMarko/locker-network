import { randomUUID } from "crypto";

import { SendMessageCommand } from "@aws-sdk/client-sqs";

import { LockerCacheDto } from "../contracts/cache.dto";
import { HttpError } from "../errorHandler/HttpError";
import { sqsClient } from "../utils/sqsClient";
import {env} from "../config/env";

import {OperationType} from "./dto/operationDto";

const QUEUE_URL = env.OPERATIONS_QUEUE_URL || env.SQS_URL;
const CACHE_PROJECTION_QUEUE_URL = env.CACHE_PROJECTION_QUEUE_URL;

export type QueueCommand = {
    operationId: string;
    type: OperationType;
    payload?: Record<string, unknown>;
};

export type PaymentConfirmCommand = {
    operationId: string;
    type: OperationType.PAYMENT_CONFIRM;
    payload: {
        bookingId: string;
        paymentSessionId: string;
        providerPaymentId: string;
        amount: number;
        currency: string;
    };
};

type LockerCacheProjectionEvent =
    | {
        eventId: string;
        schemaVersion: number;
        correlationId: string;
        occurredAt: string;
        actorId: string | null;
        entityId: string;
        projectionVersion: number;
        entityType: "locker_cache";
        eventType: "UPSERT";
        payload: LockerCacheDto;
    }
    | {
        eventId: string;
        schemaVersion: number;
        correlationId: string;
        occurredAt: string;
        actorId: string | null;
        entityId: string;
        projectionVersion: number;
        entityType: "locker_cache";
        eventType: "DELETE";
        payload: {
            lockerBoxId: string;
        };
    };

async function sendCommandToQueue(command: QueueCommand) {
    await sqsClient.send(
        new SendMessageCommand({
            QueueUrl: QUEUE_URL,
            MessageBody: JSON.stringify(command),

            MessageAttributes: {
                type: {
                    DataType: "String",
                    StringValue: command.type,
                },
            },
        })
    );
}

function getCacheProjectionQueueUrl() {
    if (!CACHE_PROJECTION_QUEUE_URL) {
        throw new HttpError(500, "CACHE_PROJECTION_QUEUE_URL is not configured");
    }

    return CACHE_PROJECTION_QUEUE_URL;
}

async function sendCacheProjectionEvent(event: LockerCacheProjectionEvent) {
    await sqsClient.send(
        new SendMessageCommand({
            QueueUrl: getCacheProjectionQueueUrl(),
            MessageBody: JSON.stringify(event),
            MessageAttributes: {
                entityType: {
                    DataType: "String",
                    StringValue: event.entityType,
                },
                eventType: {
                    DataType: "String",
                    StringValue: event.eventType,
                },
            },
        })
    );
}

function buildCacheProjectionEnvelope(
    entityId: string,
    projectionVersion: number,
    correlationId?: string,
    actorId?: string | null
) {
    return {
        eventId: randomUUID(),
        schemaVersion: 1,
        correlationId: correlationId ?? randomUUID(),
        occurredAt: new Date().toISOString(),
        actorId: actorId ?? null,
        entityId,
        projectionVersion,
    };
}

export async function sendOperationToQueue(operation: QueueCommand) {
    await sendCommandToQueue(operation);
}

export async function sendSecurityEventToQueue(event: QueueCommand) {
    await sendCommandToQueue(event);
}

export async function sendPaymentConfirmToQueue(command: PaymentConfirmCommand) {
    await sendCommandToQueue(command);
}

export async function enqueueLockerProjectionUpsert(
    projection: LockerCacheDto,
    correlationId?: string,
    actorId?: string | null
) {
    await sendCacheProjectionEvent({
        ...buildCacheProjectionEnvelope(projection.lockerBoxId, projection.version, correlationId, actorId),
        entityType: "locker_cache",
        eventType: "UPSERT",
        payload: projection,
    });
}

export async function enqueueLockerProjectionDelete(
    lockerBoxId: string,
    version = 0,
    correlationId?: string,
    actorId?: string | null
) {
    await sendCacheProjectionEvent({
        ...buildCacheProjectionEnvelope(lockerBoxId, version, correlationId, actorId),
        entityType: "locker_cache",
        eventType: "DELETE",
        payload: {
            lockerBoxId,
        },
    });
}
