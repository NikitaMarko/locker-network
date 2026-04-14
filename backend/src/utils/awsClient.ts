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

function createRoleAwareProvider(roleArn?: string, roleSessionName?: string) {
    if (!roleArn) {
        return baseCredentialsProvider;
    }

    return fromTemporaryCredentials({
        masterCredentials: baseCredentialsProvider,
        params: {
            RoleArn: roleArn,
            RoleSessionName: roleSessionName || env.AWS_ROLE_SESSION_NAME || "locker-backend-aws"
        }
    });
}

const baseCredentialsProvider = getBaseCredentialsProvider();
const dynamoCredentialsProvider = createRoleAwareProvider(
    env.DYNAMO_ROLE_ARN || env.AWS_ROLE_ARN,
    env.DYNAMO_ROLE_SESSION_NAME || env.AWS_ROLE_SESSION_NAME || "locker-backend-dynamo"
);

const dynamoClient = new DynamoDBClient({
    region: env.AWS_REGION,
    credentials: dynamoCredentialsProvider,
    endpoint: env.DYNAMODB_ENDPOINT_URL || env.AWS_ENDPOINT_URL,
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

export { baseCredentialsProvider, createRoleAwareProvider };
