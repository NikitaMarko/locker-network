import { SQSEvent } from 'aws-lambda';
import { SQSCommand, OperationType, OperationStatus } from '../../types/contracts/OperationContracts';
import { updateOperationStatus } from '../../db/dynamodb';
import { handleHealthCheck } from './lambdaHealthService';

export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const command: SQSCommand = JSON.parse(record.body);

    console.log('Processing command:', JSON.stringify(command));

    try {
      // Update status to PROCESSING
      await updateOperationStatus(command.operationId, OperationStatus.PROCESSING);

      // Route by type
      switch (command.type) {
        case OperationType.HEALTH_CHECK:
          await handleHealthCheck(command.operationId);
          break;
        default:
          throw new Error(`Unknown command type: ${command.type}`);
      }
    } catch (err) {
      console.error('Command failed:', command.operationId, err);
      await updateOperationStatus(
        command.operationId,
        OperationStatus.FAILED,
        err instanceof Error ? err.message : 'Unknown error',
      );
    }
  }
};