import { Operation, OperationStatus } from "../../services/dto/operationDto";
import { createOperation, getOperation, updateOperationStatus } from "../../services/dynamoService";

interface IOperationRepository {
    create(operation: Operation): Promise<void>;
    findById(operationId: string): Promise<Operation | undefined>;
    updateStatus(operationId: string, status: OperationStatus, errorMessage?: string, result?: Record<string, unknown>): Promise<void>;
}

class OperationRepository implements IOperationRepository {
    create(operation: Operation) {
        return createOperation(operation);
    }

    findById(operationId: string) {
        return getOperation(operationId) as Promise<Operation | undefined>;
    }

    updateStatus(operationId: string, status: OperationStatus, errorMessage?: string, result?: Record<string, unknown>) {
        return updateOperationStatus(operationId, status, errorMessage, result);
    }
}

export const operationRepository = new OperationRepository();
