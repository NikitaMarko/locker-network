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
    changeTechStatusLockerSchema,
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

// user cache routes
lockersRoutes.get('/boxes/:id', authorize(Role.USER), validateRequest(oneLockerSchema), lockerBoxController.getOneBox);
lockersRoutes.get('/stations/:id', authorize(Role.USER), validateRequest(oneStationSchema), lockerStationController.getOneStation);

// admin/operator routes backed by RDS
lockersRoutes.get('/admin/boxes', authorize(Role.OPERATOR, Role.ADMIN), lockerBoxController.getAllBoxes);
lockersRoutes.get('/admin/boxes/:id', authorize(Role.OPERATOR, Role.ADMIN), validateRequest(oneLockerSchema), lockerBoxController.getOneBoxAdmin);
lockersRoutes.post('/admin/boxes', authorize(Role.OPERATOR, Role.ADMIN), validateRequest(createLockerSchema), lockerBoxController.createBox);
lockersRoutes.patch('/admin/boxes/:id/status', authorize(Role.OPERATOR, Role.ADMIN), validateRequest(changeStatusLockerSchema), lockerBoxController.changeBoxStatus);
lockersRoutes.patch('/admin/boxes/:id/tech-status', authorize(Role.OPERATOR, Role.ADMIN), validateRequest(changeTechStatusLockerSchema), lockerBoxController.changeBoxTechStatus);
lockersRoutes.post('/admin/boxes/:id/resync-cache', authorize(Role.ADMIN), validateRequest(oneLockerSchema), lockerBoxController.resyncLockerCache);

lockersRoutes.get('/admin/stations', authorize(Role.OPERATOR, Role.ADMIN), lockerStationController.getAllStation);
lockersRoutes.get('/admin/stations/:id', authorize(Role.OPERATOR, Role.ADMIN), validateRequest(oneStationSchema), lockerStationController.getOneStationAdmin);
lockersRoutes.post('/admin/stations', authorize(Role.OPERATOR, Role.ADMIN), validateRequest(createStationSchema), lockerStationController.createStation);
lockersRoutes.patch('/admin/stations/:id/status', authorize(Role.OPERATOR, Role.ADMIN), validateRequest(changeStatusStationSchema), lockerStationController.changeStationStatus);
lockersRoutes.post('/admin/stations/:id/resync-cache', authorize(Role.ADMIN), validateRequest(oneStationSchema), lockerStationController.resyncStationCache);
lockersRoutes.post('/admin/cache/reconcile', authorize(Role.ADMIN), lockerStationController.reconcileCatalogCache);
//lockersRoutes.patch('/admin/users/:id', authorize(Role.ADMIN), adminActionsService.changeRole);

// operator-only routes
lockersRoutes.patch('/oper/boxes/:id/delete', authorize(Role.OPERATOR), validateRequest(oneLockerSchema), lockerBoxController.deleteBox);
lockersRoutes.patch('/oper/stations/:id/delete', authorize(Role.OPERATOR), validateRequest(oneStationSchema), lockerStationController.deleteStation);
