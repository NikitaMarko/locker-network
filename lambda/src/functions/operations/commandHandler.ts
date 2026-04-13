import { SQSEvent } from 'aws-lambda';
import { SQSCommand, OperationType, OperationStatus } from '../../types/contracts/OperationContracts';
import { SecurityEventPayload } from '../../types/contracts/SecurityEventContracts';
import { updateOperationStatus } from '../../db/dynamodb';
import { handleHealthCheck } from './lambdaHealthService';
import { handleSecurityEvent } from './securityEventService';
 
export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const command: SQSCommand = JSON.parse(record.body);
 
    console.log(JSON.stringify({
      action: 'COMMAND_RECEIVED',
      operationId: command.operationId,
      type: command.type,
      timestamp: new Date().toISOString(),
    }));
 
    try {
      await updateOperationStatus(command.operationId, OperationStatus.PROCESSING);
 
      switch (command.type) {
        case OperationType.HEALTH_CHECK:
          await handleHealthCheck(command.operationId);
          break;
 
        case OperationType.SECURITY_EVENT:
          await handleSecurityEvent(
            command.operationId,
            command.payload as unknown as SecurityEventPayload,
          );
          break;
 
        default:
          throw new Error(`Unknown command type: ${command.type}`);
      }
 
      console.log(JSON.stringify({
        action: 'COMMAND_COMPLETED',
        operationId: command.operationId,
        type: command.type,
      }));
 
    } catch (err) {
      console.error(JSON.stringify({
        action: 'COMMAND_FAILED',
        operationId: command.operationId,
        type: command.type,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
 
      await updateOperationStatus(
        command.operationId,
        OperationStatus.FAILED,
        err instanceof Error ? err.message : 'Unknown error',
      );
    }
  }
};