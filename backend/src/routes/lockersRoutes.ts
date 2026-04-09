import express from "express";
import {Role} from "@prisma/client";

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
import * as auth from "../middleware/authMiddleware";
import {authorize} from "../middleware/authMiddleware";


export const lockersRoutes = express.Router();

//guest routes
lockersRoutes.get('/boxes', validateRequest(getLockersWithParamsSchema), lockerBoxController.getBoxes);
lockersRoutes.get('/stations', validateRequest(getStationsWithParamsSchema), lockerStationController.getStations);

lockersRoutes.use(auth.protect);
// boxes routers
lockersRoutes.get('/', authorize(Role.OPERATOR, Role.ADMIN), lockerBoxController.getAllBoxes);
lockersRoutes.get('/boxes/:id', authorize(Role.OPERATOR, Role.ADMIN, Role.USER), validateRequest(oneLockerSchema), lockerBoxController.getOneBox);
lockersRoutes.post('/boxes', authorize(Role.OPERATOR, Role.ADMIN), validateRequest(createLockerSchema), lockerBoxController.createBox);
lockersRoutes.patch('/boxes/:id/status', authorize(Role.OPERATOR,  Role.ADMIN), validateRequest(changeStatusLockerSchema), lockerBoxController.changeBoxStatus);
lockersRoutes.patch('/boxes/:id/delete', authorize(Role.OPERATOR), validateRequest(oneLockerSchema), lockerBoxController.deleteBox);


// stations routers
lockersRoutes.get('/stations/all', authorize(Role.OPERATOR,  Role.ADMIN), lockerStationController.getAllStation);
lockersRoutes.get('/stations/:id', authorize(Role.OPERATOR, Role.ADMIN, Role.USER), validateRequest(oneStationSchema), lockerStationController.getOneStation);
lockersRoutes.post('/stations', authorize(Role.OPERATOR,  Role.ADMIN), validateRequest(createStationSchema), lockerStationController.createStation);
lockersRoutes.patch('/stations/:id/status', authorize(Role.OPERATOR,  Role.ADMIN), validateRequest(changeStatusStationSchema), lockerStationController.changeStationStatus);
lockersRoutes.patch('/stations/:id/delete', authorize(Role.OPERATOR), validateRequest(oneStationSchema), lockerStationController.deleteStation);