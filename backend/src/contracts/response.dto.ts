export interface ApiSuccessResponse<T> {
    success: true;
    status?: "success";
    correlationId?: string;
    data: T;
    meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
    success: false;
    status?: "error";
    correlationId?: string;
    message?: string;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}
