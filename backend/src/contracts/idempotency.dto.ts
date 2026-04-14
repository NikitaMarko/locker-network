export enum IdempotencyStatus {
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
}

export interface StoredIdempotencyResponse {
    statusCode: number;
    body: unknown;
}
