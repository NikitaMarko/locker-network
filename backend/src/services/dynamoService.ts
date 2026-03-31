import {GetCommand, PutCommand, UpdateCommand} from "@aws-sdk/lib-dynamodb";

import {dynamoDocClient} from "../utils/awsClient";
import {env} from "../config/env";

import {Operation, OperationStatus} from "./dto/operationDto";


const TABLE_NAME = env.DYNAMO_TABLE_NAME || "operations";

export async function createOperation(operation: Operation) {
    await dynamoDocClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: operation
    }));
}

export async function getOperation(operationId: string) {
    const result = await dynamoDocClient.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: {operationId}
    }));
    return result.Item;
}

export async function updateOperationStatus(operationId:string, status:OperationStatus, errorMessage?: string) {
    await dynamoDocClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { operationId },
        UpdateExpression: errorMessage
            ? 'SET #s = :status, errorMessage = :err'
            : 'SET #s = :status',
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: {
            ':status': status,
            ...(errorMessage && { ':err': errorMessage }),
        },
    }));
}