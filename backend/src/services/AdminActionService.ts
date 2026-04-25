import { Request, Response } from "express";
import { Role } from "@prisma/client";

import { prismaService } from "./prismaService";
import { HttpError } from "../errorHandler/HttpError";

export class AdminActions {
    static async changeRole(req: Request, res: Response) {
        const rawTargetUserId = req.params.id;
        const targetUserId = Array.isArray(rawTargetUserId)
            ? rawTargetUserId[0]
            : rawTargetUserId;

        if (!targetUserId) {
            throw new HttpError(400, "User id is required");
        }

        const { role } = req.body as { role: Role };

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
    }

    //--------------------getAllUsers

    static async getAllUsers(req: Request, res: Response) {
        const users = await prismaService.user.findMany({
            where: {
                isDeleted: false,
            },
            select: {
                userId: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json(users);
    }
}
