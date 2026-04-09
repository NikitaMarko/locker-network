import express from "express";

import * as lockerBoxController from "../controllers/lockerBoxController";
import * as lockerStationController from "../controllers/lockerStationController";
import {validateRequest} from "../middleware/validateRequest";
import {
    changeStatusStationSchema,
    createStationSchema,
    getStationsWithParamsSchema,
    oneStationSchema
} from "../validation/stationSchemas";
import {
    changeStatusLockerSchema,
    createLockerSchema,
    getLockersWithParamsSchema,
    oneLockerSchema
} from "../validation/lockersSchema";


export const lockersRoutes = express.Router();

// boxes routers
lockersRoutes.get('/', lockerBoxController.getAllBoxes);
lockersRoutes.get('/boxes', validateRequest(getLockersWithParamsSchema),lockerBoxController.getBoxes);
lockersRoutes.get('/boxes/:id',validateRequest(oneLockerSchema), lockerBoxController.getOneBox);
lockersRoutes.post('/boxes', validateRequest(createLockerSchema),lockerBoxController.createBox);
lockersRoutes.patch('/boxes/:id/status',validateRequest(changeStatusLockerSchema), lockerBoxController.changeBoxStatus);
lockersRoutes.patch('/boxes/:id/delete',validateRequest(oneLockerSchema), lockerBoxController.deleteBox);


// stations routers
lockersRoutes.get('/stations/all', lockerStationController.getAllStation);
lockersRoutes.get('/stations',validateRequest(getStationsWithParamsSchema), lockerStationController.getStations);
lockersRoutes.get('/stations/:id',validateRequest(oneStationSchema), lockerStationController.getOneStation);
lockersRoutes.post('/stations',validateRequest(createStationSchema), lockerStationController.createStation);
lockersRoutes.patch('/stations/:id/status',validateRequest(changeStatusStationSchema), lockerStationController.changeStationStatus);
lockersRoutes.patch('/stations/:id/delete',validateRequest(oneStationSchema), lockerStationController.deleteStation);