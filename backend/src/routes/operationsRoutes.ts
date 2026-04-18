import express from "express";
import { Role } from "@prisma/client";

import {createOperation, getOperationStatus} from "../controllers/operationsController";
import { authorize, protect } from "../middleware/authMiddleware";


export const operationsRouter = express.Router();

operationsRouter.use(protect);
operationsRouter.use(authorize(Role.OPERATOR, Role.ADMIN));
operationsRouter.post('/health', createOperation);
operationsRouter.get('/:id', getOperationStatus);
