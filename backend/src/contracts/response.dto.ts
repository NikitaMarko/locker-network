export interface ApiSuccessResponse<T> {
    success: true;
    correlationId?: string;
    data: T;
    meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
    success: false;
    correlationId?: string;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}
