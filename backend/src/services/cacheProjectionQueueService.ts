import { randomUUID } from "crypto";

import { SendMessageCommand } from "@aws-sdk/client-sqs";

import { LockerCacheDto } from "../contracts/cache.dto";
import { LockerCacheProjectionEvent } from "../contracts/cacheProjectionEvent.dto";
import { HttpError } from "../errorHandler/HttpError";
import { env } from "../config/env";
import { sqsClient } from "../utils/sqsClient";

const CACHE_PROJECTION_QUEUE_URL = env.CACHE_PROJECTION_QUEUE_URL;

function getQueueUrl() {
    if (!CACHE_PROJECTION_QUEUE_URL) {
        throw new HttpError(500, "CACHE_PROJECTION_QUEUE_URL is not configured");
    }

    return CACHE_PROJECTION_QUEUE_URL;
}

async function sendCacheProjectionEvent(event: LockerCacheProjectionEvent) {
    await sqsClient.send(new SendMessageCommand({
        QueueUrl: getQueueUrl(),
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
    }));
}

function buildEnvelope(
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

export async function enqueueLockerProjectionUpsert(
    projection: LockerCacheDto,
    correlationId?: string,
    actorId?: string | null
) {
    await sendCacheProjectionEvent({
        ...buildEnvelope(projection.lockerBoxId, projection.version, correlationId, actorId),
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
        ...buildEnvelope(lockerBoxId, version, correlationId, actorId),
        entityType: "locker_cache",
        eventType: "DELETE",
        payload: {
            lockerBoxId,
        },
    });
}
