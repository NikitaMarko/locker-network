import { SendMessageCommand } from "@aws-sdk/client-sqs";

import { sqsClient } from "../utils/sqsClient";
import {env} from "../config/env";

import {OperationType} from "./dto/operationDto";

const QUEUE_URL = env.SQS_URL;

type SQSCommand = {
    operationId: string;
    type: OperationType;
    payload?: Record<string, unknown>;
};

export async function sendOperationToQueue(operation: SQSCommand) {
    await sqsClient.send(
        new SendMessageCommand({
            QueueUrl: QUEUE_URL,
            MessageBody: JSON.stringify(operation),

            MessageAttributes: {
                type: {
                    DataType: "String",
                    StringValue: operation.type,
                },
            },
        })
    );
}
