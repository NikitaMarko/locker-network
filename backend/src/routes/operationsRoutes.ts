import express from "express";

import {createOperation, getOperationStatus} from "../controllers/operationsController";


export const operationsRoutes = express.Router();

operationsRoutes.post('/health', createOperation);
operationsRoutes.get('/', getOperationStatus)