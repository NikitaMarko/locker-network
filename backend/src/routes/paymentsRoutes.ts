import express from "express";

import * as paymentController from "../controllers/paymentController";

export const paymentsRoutes = express.Router();

paymentsRoutes.post("/webhook", paymentController.stripeWebhook);
