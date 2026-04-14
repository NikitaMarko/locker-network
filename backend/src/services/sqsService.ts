import { SendMessageCommand } from "@aws-sdk/client-sqs";

import { sqsClient } from "../utils/sqsClient";
import {env} from "../config/env";

import {OperationType} from "./dto/operationDto";

const QUEUE_URL = env.OPERATIONS_QUEUE_URL || env.SQS_URL;

export type QueueCommand = {
    operationId: string;
    type: OperationType;
    payload?: Record<string, unknown>;
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

export async function sendOperationToQueue(operation: QueueCommand) {
    await sendCommandToQueue(operation);
}

export async function sendSecurityEventToQueue(event: QueueCommand) {
    await sendCommandToQueue(event);
}
