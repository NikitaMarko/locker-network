import express from "express";
import { Role } from "@prisma/client";
import { z } from "zod";

import * as auth from "../middleware/authMiddleware";
import { authorize } from "../middleware/authMiddleware";
import { validateRequest } from "../middleware/validateRequest";
import { prismaService } from "../services/prismaService";
import { HttpError } from "../errorHandler/HttpError";

export const adminRouter = express.Router();

const updateUserRoleSchema = z.object({
    params: z.object({
        id: z.uuid("user id is wrong"),
    }),
    body: z.object({
        role: z.enum(Role),
    }),
});

adminRouter.use(auth.protect);

adminRouter.patch(
    "/users/:id",
    authorize(Role.ADMIN),
    validateRequest(updateUserRoleSchema),
    async (req, res, next) => {
        try {
            const rawTargetUserId = req.params.id;
            const targetUserId = Array.isArray(rawTargetUserId)
                ? rawTargetUserId[0]
                : rawTargetUserId;

            if (!targetUserId) {
                throw new HttpError(400, "User id is required");
            }

            const { role } = req.body;

            const user = await prismaService.user.findUnique({
                where: { userId: targetUserId },
                select: {
                    userId: true,
                    role: true,
                },
            });

            if (!user) {
                throw new HttpError(404, "User not found");
            }

            const updatedUser = await prismaService.user.update({
                where: { userId: targetUserId },
                data: { role },
                select: {
                    userId: true,
                    role: true,
                },
            });

            return res.status(200).json({
                id: updatedUser.userId,
                role: updatedUser.role,
            });
        } catch (e) {
            next(e);
        }
    }
);