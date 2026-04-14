import { DeleteCommand, GetCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

import { LockerCacheDto } from "../../contracts/cache.dto";
import { env } from "../../config/env";
import { HttpError } from "../../errorHandler/HttpError";
import { dynamoDocClient } from "../../utils/awsClient";

interface ILockerCacheRepository {
    findById(lockerBoxId: string): Promise<LockerCacheDto | null>;
    findByStationId(stationId: string): Promise<LockerCacheDto[]>;
    findAll(): Promise<LockerCacheDto[]>;
    upsert(projection: LockerCacheDto): Promise<void>;
    delete(lockerBoxId: string, version?: number): Promise<void>;
}

const TABLE_NAME = env.DYNAMO_LOCKER_CACHE_TABLE_NAME;

class LockerCacheRepository implements ILockerCacheRepository {
    async findById(lockerBoxId: string): Promise<LockerCacheDto | null> {
        if (!TABLE_NAME) {
            throw new HttpError(500, "DYNAMO_LOCKER_CACHE_TABLE_NAME is not configured");
        }

        const result = await dynamoDocClient.send(new GetCommand({
            TableName: TABLE_NAME,
            Key: { lockerBoxId },
        }));

        return (result.Item as LockerCacheDto | undefined) ?? null;
    }

    async findAll(): Promise<LockerCacheDto[]> {
        if (!TABLE_NAME) {
            throw new HttpError(500, "DYNAMO_LOCKER_CACHE_TABLE_NAME is not configured");
        }

        const items: LockerCacheDto[] = [];
        let exclusiveStartKey: Record<string, unknown> | undefined;

        do {
            const result = await dynamoDocClient.send(new ScanCommand({
                TableName: TABLE_NAME,
                ExclusiveStartKey: exclusiveStartKey,
            }));

            items.push(...((result.Items ?? []) as LockerCacheDto[]));
            exclusiveStartKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
        } while (exclusiveStartKey);

        return items;
    }

    async findByStationId(stationId: string): Promise<LockerCacheDto[]> {
        return (await this.findAll()).filter((item) => item.stationId === stationId);
    }

    async upsert(projection: LockerCacheDto): Promise<void> {
        if (!TABLE_NAME) {
            throw new HttpError(500, "DYNAMO_LOCKER_CACHE_TABLE_NAME is not configured");
        }

        await dynamoDocClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: projection,
        }));
    }

    async delete(lockerBoxId: string, version?: number): Promise<void> {
        if (!TABLE_NAME) {
            throw new HttpError(500, "DYNAMO_LOCKER_CACHE_TABLE_NAME is not configured");
        }

        await dynamoDocClient.send(new DeleteCommand({
            TableName: TABLE_NAME,
            Key: { lockerBoxId },
            ...(version !== undefined
                ? {
                    ConditionExpression: "attribute_not_exists(version) OR version <= :version",
                    ExpressionAttributeValues: {
                        ":version": version,
                    },
                }
                : {}),
        }));
    }
}

export const lockerCacheRepository = new LockerCacheRepository();
