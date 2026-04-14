import { SQSClient } from "@aws-sdk/client-sqs";

import { env } from "../config/env";

import { baseCredentialsProvider, createRoleAwareProvider } from "./awsClient";

const sqsCredentials = createRoleAwareProvider(
    env.SQS_ROLE_ARN || env.AWS_ROLE_ARN || env.DYNAMO_ROLE_ARN,
    env.SQS_ROLE_SESSION_NAME || env.AWS_ROLE_SESSION_NAME || "locker-backend-sqs"
);

export const sqsClient = new SQSClient({
    region: env.AWS_REGION,
    credentials: sqsCredentials,
    endpoint: env.SQS_ENDPOINT_URL || env.AWS_ENDPOINT_URL,
});

export async function assertSqsCredentialsConfigured() {
    try {
        await baseCredentialsProvider();
        await sqsCredentials();
    } catch (error) {
        const details = error instanceof Error ? error.message : "Unknown credentials error";

        throw new Error(
            "AWS credentials for SQS are not configured. " +
            "Provide AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY, set AWS_PROFILE, " +
            "or configure source credentials for SQS_ROLE_ARN/AWS_ROLE_ARN. " +
            `Details: ${details}`
        );
    }
}
