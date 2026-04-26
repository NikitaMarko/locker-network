import express from "express";
// import {Role} from "@prisma/client";

import * as  pricingController from "../controllers/pricingController";


export const pricingRoutes = express.Router();

pricingRoutes.get("/", pricingController.getAllPrices);
pricingRoutes.post("/", pricingController.createPrice);
pricingRoutes.patch("/:id", pricingController.changePrice)