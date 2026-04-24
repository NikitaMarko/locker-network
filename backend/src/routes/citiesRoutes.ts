import express from "express";
import {Role} from "@prisma/client";

import * as citiesController from "../controllers/citiesController";
import * as auth from "../middleware/authMiddleware";
import {authorize} from "../middleware/authMiddleware";
import {validateRequest} from "../middleware/validateRequest";
import {createCitySchema} from "../validation/citiesSchema";




export const citiesRoutes = express.Router();

citiesRoutes.get('/', citiesController.getAllCities);

citiesRoutes.use(auth.protect);
citiesRoutes.post('/', authorize(Role.ADMIN), validateRequest(createCitySchema), citiesController.createCities);
