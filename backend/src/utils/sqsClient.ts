import { SQSClient } from "@aws-sdk/client-sqs";
import { fromTemporaryCredentials, fromNodeProviderChain } from "@aws-sdk/credential-providers";

import { env } from "../config/env";

const baseCredentials = fromNodeProviderChain();

const sqsCredentials = env.DYNAMO_ROLE_ARN
    ? fromTemporaryCredentials({
        masterCredentials: baseCredentials,
        params: {
            RoleArn: env.DYNAMO_ROLE_ARN,
            RoleSessionName: "locker-backend-sqs"
        }
    })
    : baseCredentials;

export const sqsClient = new SQSClient({
    region: "eu-west-1",
    credentials: sqsCredentials
});