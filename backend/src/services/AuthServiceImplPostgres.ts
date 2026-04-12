import {Request, Response} from "express";
import {hash, verify} from "argon2";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";

import * as tokenService from "../utils/jwt"
import {hashToken, timingSafeTokenCompare, TokenPayload} from "../utils/jwt"
import {env} from "../config/env";
import {HttpError} from "../errorHandler/HttpError";
import {logAudit} from '../utils/audit';

import {prismaService} from "./prismaService";
import {LoginDto, SignupDto} from "./dto/applDto";
import {ActionType} from "./dto/operationDto";


function isPrismaUniqueConstraintError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

function extractConstraintField(error: Prisma.PrismaClientKnownRequestError): string {
    const fields = error.meta?.target as string[] | undefined;
    return fields?.[0] ?? 'Field';
}

export class AuthServiceImplPostgres {

    async auth(res: Response, req: Request, user: { userId: string; role: TokenPayload['role'] }) {
        const sessionId = await prismaService.refreshSession.create({
            data: {
                userId: user.userId,
                tokenHash: "",
                ipAddress: req.ip ?? null,
                deviceInfo: req.headers["user-agent"] ?? null,
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * env.JWT_REFRESH_TOKEN_TTL),
            },
        });

        const payload: TokenPayload = { userId: user.userId, role: user.role, sessionId: sessionId.id };
        const { accessToken, refreshToken } =
            tokenService.generateTokens(payload);

        await prismaService.refreshSession.update({
            where: { id: sessionId.id },
            data: { tokenHash: hashToken(refreshToken) },
        });

        const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * env.JWT_REFRESH_TOKEN_TTL);
        tokenService.cookieToken(refreshToken, res, expires);

        return res.status(200).json({ accessToken });
    }

    async register(res: Response, req: Request, dto: SignupDto) {
        const {name, email, password, phone} = dto;
        let user;

        try {
            user = await prismaService.user.create({
                data: {
                    name,
                    email,
                    password: await hash(password),
                    phone,
                },
                select: {
                    userId: true,
                    role: true,
                },
            });
        } catch (error) {
            if (isPrismaUniqueConstraintError(error)) {
                const field = extractConstraintField(error); // 'email' or 'phone'
                throw new HttpError(400, `${field} already in use`);
            }
            throw error;
        }
        await logAudit({
            req,
            action: ActionType.USER_REGISTER,
            actorId: user.userId,
            entityId: user.userId,
        });

        return this.auth(res, req, user);
    }

    async login(res: Response, req: Request, dto: LoginDto) {
        const {email, password} = dto;

        const user = await prismaService.user.findUnique({
            where: {
                email,
            },
            select: {
                userId: true,
                password: true,
                role: true,
            },
        });

        if (!user) {
            await logAudit({
                req,
                action: ActionType.USER_LOGIN_FAILED,
                entityId: email,
                entityType: 'User',
                details: { email, reason: 'User not found' },
            });
            throw new HttpError(401, 'Invalid credentials');
        }

        const isValidPassword = await verify(user.password, password);

        if (!isValidPassword) {
            await logAudit({
                req,
                action: ActionType.USER_LOGIN_FAILED,
                actorId: user.userId,
                entityId: user.userId,
                details: { email, reason: 'Wrong password' },
            });
            throw new HttpError(401, 'Invalid credentials');
        }

        await logAudit({
            req,
            action: ActionType.USER_LOGIN,
            actorId: user.userId,
            entityId: user.userId,
        });
        const {password: _, ...safeUser} = user;
        return this.auth(res, req, safeUser);
    }


    async logout(res: Response, req: Request, sessionId: string, userId: string) {
        await tokenService.refreshSession(sessionId, userId);
        tokenService.clearCookies(res);
        await logAudit({
            req,
            action: ActionType.USER_LOGOUT,
            actorId: userId,
            entityId: userId,
        });
        return res.status(200).json({ message: 'Logged out' });
    }

    async me(userId: string) {
        const currentUser = await prismaService.user.findUnique({
            where: {userId},
            select: {
                userId: true,
                email: true,
                phone: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });

        if (!currentUser) {
            throw new HttpError(404, 'User not found');
        }

        return currentUser;
    }

    async refresh(res: Response, req: Request, refreshToken: string) {
        let payload: TokenPayload;

        try {
            payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET, {
                algorithms: ['HS256'],
            }) as TokenPayload;
        } catch {
            tokenService.clearCookies(res);
            throw new HttpError(401, 'Invalid refresh token');
        }

        const session = await prismaService.refreshSession.findUnique({
            where: { id: payload.sessionId },
            include: { user: { select: { userId: true, role: true } } },
        });

        if (!session || session.userId !== payload.userId) {
            tokenService.clearCookies(res);
            throw new HttpError(401, 'Session not found');
        }

        if (session.revokedAt) {
            await prismaService.refreshSession.updateMany({
                where: { userId: session.userId, revokedAt: null },
                data: { revokedAt: new Date() },
            });

            tokenService.clearCookies(res);
            throw new HttpError(401, "Token reuse detected");
        }

        if (session.expiresAt < new Date()) {
            tokenService.clearCookies(res);
            throw new HttpError(401, "Token expired");
        }

        const incomingHash = hashToken(refreshToken);

        if (!timingSafeTokenCompare(incomingHash, session.tokenHash)) {
            tokenService.clearCookies(res);
            throw new HttpError(401, "Invalid token");
        }

        const updated = await prismaService.refreshSession.updateMany({
            where: {
                id: session.id,
                revokedAt: null,
            },
            data: { revokedAt: new Date() },
        });

        if (updated.count === 0) {
            tokenService.clearCookies(res);
            throw new HttpError(401, "Token already used");
        }

        await logAudit({
            req,
            action: ActionType.TOKEN_REFRESH,
            actorId: session.user.userId,
            entityId: session.id,
        });

        return this.auth(res, req, session.user);
    }
}

export const authService = new AuthServiceImplPostgres()
