import {Request, Response} from "express";
import { v4 as uuidv4 } from "uuid";

import {HttpError} from "../errorHandler/HttpError";
import {logAudit} from "../utils/audit";

import {Operation} from "./dto/operationDto";
import {createOperation, getOperation} from "./dynamoService";


export class OperationService {

    async createOper(req: Request, res: Response) {
        const operationId = uuidv4();
        const operation:Operation = {
            operationId,
            timestamp: new Date().toISOString(),
            status: "PENDING"
        }
        await createOperation(operation);
        //ToDo Send command to sqs!!!

        await logAudit({
            req,
            action: 'OPERATION_CREATE',
            actorId: undefined,
            entityId: operationId,
            entityType: 'Operation'
        });

        return res.status(200).json({
            success: true,
            data: {
                operationId: operationId,
                status: "PENDING"
            }
        })
    }

    async getOperationStatus(req: Request, res: Response) {
        const operation = await getOperation(req.params.id as string);
        if (!operation) {
            await logAudit({
                req,
                action: 'OPERATION_INFO_FAILED',
                actorId: undefined,
                entityId: req.params.id  as string,
                entityType: 'Operation',
                details: { reason: 'Not found' },
            });
            throw new HttpError(404,  'Operation not found');
        }
        await logAudit({
            req,
            action: 'OPERATION_INFO',
            actorId: undefined,
            entityId: operation.operationId,
            entityType: 'Operation'
        });
        return res.status(200).json({success: true, data: operation});
    }

}

export const operationsService = new OperationService();