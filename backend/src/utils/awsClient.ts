import {
    fromEnv,
    fromIni,
    fromNodeProviderChain,
    fromTemporaryCredentials
} from "@aws-sdk/credential-providers";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { env } from "../config/env";

function hasStaticAwsCredentials() {
    return Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
}

function getBaseCredentialsProvider() {
    if (hasStaticAwsCredentials()) {
        return fromEnv();
    }

    if (env.AWS_PROFILE) {
        return fromIni({ profile: env.AWS_PROFILE });
    }

    return fromNodeProviderChain();
}

const baseCredentialsProvider = getBaseCredentialsProvider();
const dynamoCredentialsProvider = env.DYNAMO_ROLE_ARN
    ? fromTemporaryCredentials({
        masterCredentials: baseCredentialsProvider,
        params: {
            RoleArn: env.DYNAMO_ROLE_ARN,
            RoleSessionName: env.DYNAMO_ROLE_SESSION_NAME || "locker-backend-dynamo"
        }
    })
    : baseCredentialsProvider;

const dynamoClient = new DynamoDBClient({
    region: env.AWS_REGION,
    credentials: dynamoCredentialsProvider
});

export const dynamoDocClient = DynamoDBDocumentClient.from(dynamoClient);

export async function assertAwsCredentialsConfigured() {
    try {
        await dynamoCredentialsProvider();
    } catch (error) {
        const details = error instanceof Error ? error.message : "Unknown credentials error";

        throw new Error(
            "AWS credentials for DynamoDB are not configured. " +
            "Provide AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY, set AWS_PROFILE, " +
            "or configure source credentials for DYNAMO_ROLE_ARN. " +
            `Details: ${details}`
        );
    }
}
