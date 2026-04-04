import {Request, Response} from "express";
import {v4 as uuidv4} from "uuid";

import {HttpError} from "../errorHandler/HttpError";
import {logAudit} from "../utils/audit";

import {
    ActionType,
    Operation,
    OperationStatus,
    OperationType
} from "./dto/operationDto";
import {createOperation, getOperation, updateOperationStatus} from "./dynamoService";
import {sendOperationToQueue} from "./sqsService";


export class OperationService {

    async createOper(req: Request, res: Response) {
        const operationId = uuidv4();
        const operation: Operation = {
            operationId,
            timestamp: new Date().toISOString(),
            status: OperationStatus.PENDING,
            type: OperationType.HEALTH_CHECK
        }
        try{
            await createOperation(operation);
        }catch(e){
            const errorMessage = e instanceof Error ? e.message : "DynamoDB error";

            await logAudit({
                req,
                action: ActionType.OPERATION_CREATE_FAILED,
                actorId: undefined,
                entityId: operationId,
                entityType: 'Operation',
                details: {reason: errorMessage}
            });
            throw new HttpError(500, errorMessage);
        }

        try{
            await sendOperationToQueue({
                operationId,
                type: operation.type,
                payload: {
                    timestamp: operation.timestamp,
                }
            });
        }catch(e){
        await updateOperationStatus(operationId, OperationStatus.FAILED, "Failed to send command sqs");
            await logAudit({
                req,
                action: ActionType.OPERATION_CREATE_FAILED,
                actorId: undefined,
                entityId: operationId,
                entityType: 'Operation',
                details: {reason: 'Sqs error'}
            });
            return res.status(500).json({
                success: false,
                data: {
                    operationId: operationId,
                    status: OperationStatus.FAILED,
                    errorMessage: "Failed to send command sqs"
                }
            })
        }
        // //========= mock sqs ===============
        // setTimeout(async () => {
        //     await updateOperationStatus(operationId, OperationStatus.PROCESSING);
        //
        //     setTimeout(async () => {
        //         await updateOperationStatus(operationId, OperationStatus.SUCCESS);
        //     }, 10000);
        //
        // }, 10000);
        // // =======================================
        // await logAudit({
        //     req,
        //     action: ActionType.OPERATION_CREATE,
        //     actorId: undefined,
        //     entityId: operationId,
        //     entityType: 'Operation'
        // });

        return res.status(200).json({
            success: true,
            data: {
                operationId: operationId,
                status: OperationStatus.PENDING
            }
        })
    }

    async getOperationStatus(req: Request, res: Response) {
        let operation;
        try{
            operation = await getOperation(req.params.id as string);
        }catch(e){
            const errorMessage = e instanceof Error ? e.message : "DynamoDB error";

            await logAudit({
                req,
                action: ActionType.OPERATION_INFO_FAILED,
                actorId: undefined,
                entityId: req.params.id as string,
                entityType: 'Operation',
                details: {reason: errorMessage},
            });
            throw new HttpError(500, errorMessage);
        }

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
