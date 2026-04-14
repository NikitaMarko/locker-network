export function getAwsErrorCode(error: unknown): string | undefined {
    if (!(error instanceof Error)) {
        return undefined;
    }

    const awsError = error as Error & {
        Code?: string;
        code?: string;
        name?: string;
        __type?: string;
    };

    return awsError.Code || awsError.code || awsError.name || awsError.__type;
}

export function isDynamoAccessError(error: unknown): boolean {
    const code = getAwsErrorCode(error);
    const message = error instanceof Error ? error.message.toLowerCase() : "";

    return [
        "AccessDenied",
        "AccessDeniedException",
        "ExpiredToken",
        "ExpiredTokenException",
        "InvalidClientTokenId",
        "UnrecognizedClientException",
        "CredentialsProviderError",
        "ResourceNotFoundException",
    ].includes(code ?? "") || [
        "is not authorized to perform: dynamodb:",
        "security token included in the request is expired",
        "requested resource not found",
        "could not load credentials",
    ].some((pattern) => message.includes(pattern));
}
