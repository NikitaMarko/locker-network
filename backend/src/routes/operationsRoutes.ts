import express from "express";

import {createOperation, getOperationStatus} from "../controllers/operationsController";


export const operationsRouter = express.Router();

operationsRouter.post('/health', createOperation);
operationsRouter.get('/:id', getOperationStatus)