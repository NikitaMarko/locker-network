import { OperationStatus } from '../../types/contracts/OperationContracts';
import { updateOperationStatus } from '../../db/dynamodb';

export const handleHealthCheck = async (operationId: string): Promise<void> => {
  console.log('Health check started for operation:', operationId);

  // Simulate a little delay (as per task description)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Update status to SUCCESS
  await updateOperationStatus(operationId, OperationStatus.SUCCESS);

  console.log('Health check completed for operation:', operationId);
};