export type Operation = {
    operationId: string,
    timestamp: string,
    type: OperationType,
    status: OperationStatus,
    errorMessage?: string,
}

export enum OperationStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
}

export enum OperationType {
    HEALTH_CHECK = "HEALTH_CHECK",
}

export enum ActionType {
    HEALTH_CHECK = "HEALTH_CHECK",
    OPERATION_CREATE = "OPERATION_CREATE",
    OPERATION_INFO = "OPERATION_INFO",
    OPERATION_INFO_FAILED = "OPERATION_INFO_FAILED",
    USER_LOGIN = "USER_LOGIN",
    USER_LOGIN_FAILED = "USER_LOGIN_FAILED",
    USER_LOGOUT = "USER_LOGOUT",
    TOKEN_REVOKED = "TOKEN_REVOKED",
    USER_REGISTER = "USER_REGISTER",
    OPERATION_CREATE_FAILED = "OPERATION_CREATE_FAILED",
    TOKEN_REFRESH = "TOKEN_REFRESH",
}
