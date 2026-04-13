import { SecurityEventPayload } from '../../types/contracts/SecurityEventContracts';
import { OperationStatus } from '../../types/contracts/OperationContracts';
import { updateOperationStatus } from '../../db/dynamodb';
 
export const handleSecurityEvent = async (
  operationId: string,
  payload: SecurityEventPayload,
): Promise<void> => {
  console.log(JSON.stringify({
    action: 'SECURITY_EVENT_RECEIVED',
    operationId,
    eventType: payload.eventType,
    ipAddress: payload.ipAddress,
    method: payload.method,
    path: payload.path,
    reason: payload.reason,
    actorId: payload.actorId,
  }));
 
  // Here you could write to a dedicated security log table
  // For now, just log and update operation status
 
  await updateOperationStatus(operationId, OperationStatus.SUCCESS);
 
  console.log(JSON.stringify({
    action: 'SECURITY_EVENT_PROCESSED',
    operationId,
    eventType: payload.eventType,
  }));
};