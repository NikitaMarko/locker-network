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


export const lockersRoutes = express.Router();

// boxes routers
lockersRoutes.get('/', lockerBoxController.getAllBoxes);
lockersRoutes.get('/boxes', lockerBoxController.getBoxes);
lockersRoutes.get('/boxes/:id', lockerBoxController.getOneBox);
lockersRoutes.post('/boxes', lockerBoxController.createBox);
lockersRoutes.patch('/boxes/:id/status', lockerBoxController.changeBoxStatus);
lockersRoutes.delete('/boxes/:id', lockerBoxController.deleteBox);


// stations routers
lockersRoutes.get('/stations/all', lockerStationController.getAllStation);
lockersRoutes.get('/stations',validateRequest(getStationsWithParamsSchema), lockerStationController.getStations);
lockersRoutes.get('/stations/:id',validateRequest(oneStationSchema), lockerStationController.getOneStation);
lockersRoutes.post('/stations',validateRequest(createStationSchema), lockerStationController.createStation);
lockersRoutes.patch('/stations/:id/status',validateRequest(changeStatusStationSchema), lockerStationController.changeStationStatus);
lockersRoutes.delete('/stations/:id',validateRequest(oneStationSchema), lockerStationController.deleteStation);