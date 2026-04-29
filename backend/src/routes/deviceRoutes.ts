import express from "express";

import * as deviceController from "../controllers/deviceController";


export const devicesRoutes = express.Router();



// User actions
devicesRoutes.post('/open-locker', deviceController.openDeviceUser);
devicesRoutes.post('/close-locker',deviceController.closeDeviceUser);

// Operator actions
devicesRoutes.post('/oper/open-locker',deviceController.openDeviceOper);
devicesRoutes.post('/oper/close-locker',deviceController.closeDeviceOper);