export enum OperationType {
  HEALTH_CHECK = 'HEALTH_CHECK',
  SECURITY_EVENT = 'SECURITY_EVENT',
  BOOKING_INIT = 'BOOKING_INIT',
  PAYMENT_CONFIRM = 'PAYMENT_CONFIRM',
  BOOKING_EXTEND = 'BOOKING_EXTEND',
}

export enum OperationStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export interface SQSCommand {
  operationId: string;
  type: OperationType;
  payload?: Record<string, unknown>;
   // BOOKING_INIT fields (flat, not in payload)
  userId?: string;
  stationId?: string;
  size?: string;
  expectedEndTime?: string;
}

export interface OperationRecord {
  operationId: string;
  status: OperationStatus;
  type: OperationType;
  timestamp: string;
  errorMessage?: string;
}