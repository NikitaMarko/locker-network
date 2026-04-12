import express from "express";

import * as citiesController from "../controllers/citiesController";

export const citiesRoutes = express.Router();

citiesRoutes.get('/', citiesController.getAllCities);
