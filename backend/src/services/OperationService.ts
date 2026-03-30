import {Request, Response} from "express";
import {v4 as uuidv4} from "uuid";

import {HttpError} from "../errorHandler/HttpError";
import {logAudit} from "../utils/audit";

import {ActionType, Operation, OperationStatus} from "./dto/operationDto";
import {createOperation, getOperation, updateOperationStatus} from "./dynamoService";


export class OperationService {

    async createOper(req: Request, res: Response) {
        const operationId = uuidv4();
        const operation: Operation = {
            operationId,
            timestamp: new Date().toISOString(),
            status: OperationStatus.PENDING
        }
        await createOperation(operation);
        //ToDo Send command to sqs!!! and delete mock sqs!
        //========= mock sqs ===============
        setTimeout(async () => {
            await updateOperationStatus(operationId, OperationStatus.PROCESSING);

            setTimeout(async () => {
                await updateOperationStatus(operationId, OperationStatus.SUCCESS);
            }, 10000);

        }, 10000);
        // =======================================
        await logAudit({
            req,
            action: ActionType.OPERATION_CREATE,
            actorId: undefined,
            entityId: operationId,
            entityType: 'Operation'
        });

        return res.status(200).json({
            success: true,
            data: {
                operationId: operationId,
                status: OperationStatus.PENDING
            }
        })
    }

    async getOperationStatus(req: Request, res: Response) {
        const operation = await getOperation(req.params.id as string);
        if (!operation) {
            await logAudit({
                req,
                action: ActionType.OPERATION_INFO_FAILED,
                actorId: undefined,
                entityId: req.params.id as string,
                entityType: 'Operation',
                details: {reason: 'Not found'},
            });
            throw new HttpError(404, 'Operation not found');
        }
        await logAudit({
            req,
            action: ActionType.OPERATION_INFO,
            actorId: undefined,
            entityId: operation.operationId,
            entityType: 'Operation'
        });
        return res.status(200).json({success: true, data: operation});
    }

}

export const operationsService = new OperationService();