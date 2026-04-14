export function getRedisErrorCode(error: unknown): string | undefined {
    if (!(error instanceof Error)) {
        return undefined;
    }

    const redisError = error as Error & {
        code?: string;
        errno?: string;
        name?: string;
    };

    return redisError.code || redisError.errno || redisError.name;
}

export function isRedisAccessError(error: unknown): boolean {
    const code = getRedisErrorCode(error);
    const message = error instanceof Error ? error.message.toLowerCase() : "";

    return [
        "ECONNREFUSED",
        "ECONNRESET",
        "ENOTFOUND",
        "EAI_AGAIN",
        "ETIMEDOUT",
        "SocketClosedUnexpectedly",
    ].includes(code ?? "") || [
        "redis_url is not configured",
        "connection refused",
        "socket closed",
        "getaddrinfo",
        "timed out",
        "redis access failed",
    ].some((pattern) => message.includes(pattern));
}
