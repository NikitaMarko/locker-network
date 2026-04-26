import {authorize} from "../middleware/authMiddleware";
import {Role} from "@prisma/client";
import * as adminActionsController from "../controllers/adminActionsController";
import * as auth from "../middleware/authMiddleware";
import express from "express";

export const adminRoutes = express.Router();

// ---admin only routes---

adminRoutes.patch('/:id',auth.protect,authorize(Role.ADMIN),adminActionsController.changeRole);

adminRoutes.get('/',auth.protect,authorize(Role.ADMIN),adminActionsController.getAllUsers);


adminRoutes.get('/city',auth.protect,authorize(Role.ADMIN),adminActionsController.getAllUsers);
//adminRoutes.patch('/city',auth.protect,authorize(Role.ADMIN),adminActionsController.getAllUsers);
//adminRoutes.delete('/city',auth.protect,authorize(Role.ADMIN),adminActionsController.getAllUsers);
//adminRoutes.get('/city',auth.protect,authorize(Role.ADMIN),adminActionsController.getAllUsers);


