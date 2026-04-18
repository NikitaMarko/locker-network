export enum IdempotencyStatus {
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
}

export interface StoredIdempotencyResponse {
    statusCode: number;
    body: unknown;
}
