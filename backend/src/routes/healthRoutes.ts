import express from "express";

import * as healthController from '../controllers/healthController';

export const healthRouter = express.Router()

healthRouter.get('/', healthController.healthStatus);

