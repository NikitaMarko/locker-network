import {Request, Response} from "express";
import { v4 as uuidv4 } from "uuid";

import {HttpError} from "../errorHandler/HttpError";

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
            throw new HttpError(404,  'Operation not found');
        }
        return res.status(200).json({success: true, data: operation});
    }

}

export const operationsService = new OperationService();