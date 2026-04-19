import { Request, Response } from "express";
import { Role } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

import { HttpError } from "../errorHandler/HttpError";
import { operationRepository } from "../repositories/operation/OperationRepository";
import { logAudit } from "../utils/audit";
import { sendSuccess } from "../utils/response";

import {
    ActionType,
    Operation,
    OperationStatus,
    OperationType
} from "./dto/operationDto";
import { idempotencyService } from "./IdempotencyService";
import { sendOperationToQueue } from "./sqsService";

export class OperationCommandService {
    async createHealthCheckOperation(req: Request, res: Response) {
        return idempotencyService.execute(
            req,
            res,
            "operation:health-check",
            req.body,
            async () => {
                const operationId = uuidv4();
                const operation: Operation = {
                    operationId,
                    userId: req.user?.userId,
                    timestamp: new Date().toISOString(),
                    status: OperationStatus.PENDING,
                    type: OperationType.HEALTH_CHECK
                };

                try {
                    await operationRepository.create(operation);
                    await sendOperationToQueue({
                        operationId,
                        type: operation.type,
                        payload: {
                            timestamp: operation.timestamp,
                        }
                    });

                    await logAudit({
                        req,
                        action: ActionType.OPERATION_CREATE,
                        actorId: req.user?.userId,
                        entityId: operationId,
                        entityType: "Operation"
                    });

                    return {
                        body: {
                            operationId,
                            status: OperationStatus.PENDING,
                        }
                    };
                } catch (e) {
                    const errorMessage = e instanceof Error ? e.message : "Failed to create operation";

                    await operationRepository.updateStatus(operationId, OperationStatus.FAILED, errorMessage);
                    await logAudit({
                        req,
                        action: ActionType.OPERATION_CREATE_FAILED,
                        actorId: req.user?.userId,
                        entityId: operationId,
                        entityType: "Operation",
                        details: { reason: errorMessage }
                    });

                    throw new HttpError(500, errorMessage);
                }
            }
        );
    }

}

export class OperationReadService {
    async getOperationStatus(req: Request, res: Response) {
        let operation;

        try {
            operation = await operationRepository.findById(req.params.id as string);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : "DynamoDB error";

            await logAudit({
                req,
                action: ActionType.OPERATION_INFO_FAILED,
                actorId: req.user?.userId,
                entityId: req.params.id as string,
                entityType: "Operation",
                details: { reason: errorMessage },
            });

            throw new HttpError(500, errorMessage);
        }

        if (!operation) {
            await logAudit({
                req,
                action: ActionType.OPERATION_INFO_FAILED,
                actorId: req.user?.userId,
                entityId: req.params.id as string,
                entityType: "Operation",
                details: { reason: "Not found" },
            });
            throw new HttpError(404, "Operation not found");
        }

        if (req.user?.role === Role.USER && (operation as Operation).userId && (operation as Operation).userId !== req.user.userId) {
            throw new HttpError(403, "Access denied");
        }

        await logAudit({
            req,
            action: ActionType.OPERATION_INFO,
            actorId: req.user?.userId,
            entityId: operation.operationId,
            entityType: "Operation"
        });

        const result = operation as Operation & { result?: Record<string, unknown> };

        return sendSuccess(res, {
            operationId: result.operationId,
            status: result.status,
            type: result.type,
            timestamp: result.timestamp,
            ...(result.errorMessage ? { errorMessage: result.errorMessage } : {}),
            ...(result.result ? { data: result.result } : {}),
        });
    }
}

export const operationCommandService = new OperationCommandService();
export const operationReadService = new OperationReadService();
