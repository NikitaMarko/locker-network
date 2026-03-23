import express from "express";
import * as lockerBoxController from "../controllers/lockerBoxController";
import * as lockerStationController from "../controllers/lockerStationController";


export const lockersRoutes = express.Router();

// boxes routers
lockersRoutes.get('/', lockerBoxController.getAllBoxes);
lockersRoutes.post('/boxes', lockerBoxController.createBox);


// stations routers
lockersRoutes.get('/stations', lockerStationController.getAllStation);
lockersRoutes.post('/stations', lockerStationController.createStation);