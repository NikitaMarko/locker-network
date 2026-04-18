import { Prisma } from "@prisma/client";

import { IdempotencyStatus, StoredIdempotencyResponse } from "../../contracts/idempotency.dto";
import { prismaService } from "../../services/prismaService";

export interface IdempotencyRecord {
    recordId: string;
    requestHash: string;
    status: IdempotencyStatus;
    responseStatusCode: number | null;
    responseBody: Prisma.JsonValue | null;
}

class IdempotencyRepository {
    async tryBegin(recordId: string, requestHash: string): Promise<boolean> {
        const result = await prismaService.$executeRaw`
            INSERT INTO "IdempotencyRecord" (
                "recordId",
                "requestHash",
                "status",
                "createdAt",
                "updatedAt"
            )
            VALUES (
                ${recordId},
                ${requestHash},
                CAST(${IdempotencyStatus.IN_PROGRESS} AS "IdempotencyRecordStatus"),
                NOW(),
                NOW()
            )
            ON CONFLICT ("recordId") DO NOTHING
        `;

        return Number(result) > 0;
    }

    async findById(recordId: string): Promise<IdempotencyRecord | null> {
        const rows = await prismaService.$queryRaw<IdempotencyRecord[]>`
            SELECT
                "recordId",
                "requestHash",
                "status",
                "responseStatusCode",
                "responseBody"
            FROM "IdempotencyRecord"
            WHERE "recordId" = ${recordId}
            LIMIT 1
        `;

        return rows[0] ?? null;
    }

    async complete(recordId: string, response: StoredIdempotencyResponse) {
        await prismaService.$executeRaw`
            UPDATE "IdempotencyRecord"
            SET
                "status" = CAST(${IdempotencyStatus.COMPLETED} AS "IdempotencyRecordStatus"),
                "responseStatusCode" = ${response.statusCode},
                "responseBody" = ${JSON.parse(JSON.stringify(response.body))}::jsonb,
                "updatedAt" = NOW()
            WHERE "recordId" = ${recordId}
        `;
    }

    async fail(recordId: string, response: StoredIdempotencyResponse) {
        await prismaService.$executeRaw`
            UPDATE "IdempotencyRecord"
            SET
                "status" = CAST(${IdempotencyStatus.FAILED} AS "IdempotencyRecordStatus"),
                "responseStatusCode" = ${response.statusCode},
                "responseBody" = ${JSON.parse(JSON.stringify(response.body))}::jsonb,
                "updatedAt" = NOW()
            WHERE "recordId" = ${recordId}
        `;
    }

    async release(recordId: string, requestHash: string) {
        await prismaService.$executeRaw`
            DELETE FROM "IdempotencyRecord"
            WHERE "recordId" = ${recordId}
              AND "requestHash" = ${requestHash}
              AND "status" = CAST(${IdempotencyStatus.IN_PROGRESS} AS "IdempotencyRecordStatus")
        `;
    }
}

export const idempotencyRepository = new IdempotencyRepository();
