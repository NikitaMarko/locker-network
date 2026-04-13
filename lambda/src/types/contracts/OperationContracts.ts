export enum OperationType {
  HEALTH_CHECK = 'HEALTH_CHECK',
  SECURITY_EVENT = 'SECURITY_EVENT',
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
}

export interface OperationRecord {
  operationId: string;
  status: OperationStatus;
  type: OperationType;
  timestamp: string;
  errorMessage?: string;
}