import {Request, Response} from "express";
import {hash, verify} from "argon2";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";

import * as tokenService from "../utils/jwt"
import {hashToken, TokenPayload} from "../utils/jwt"
import {env} from "../config/env";
import {HttpError} from "../errorHandler/HttpError";
import {logAudit} from '../utils/audit';

import {prismaService} from "./prismaService";
import {LoginDto, SignupDto} from "./dto/applDto";


function isPrismaUniqueConstraintError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}

function extractConstraintField(error: Prisma.PrismaClientKnownRequestError): string {
    const fields = error.meta?.target as string[] | undefined;
    return fields?.[0] ?? 'Field';
}

export class AuthServiceImplPostgres {
   
    async auth(res: Response, user: TokenPayload) {
        const { accessToken, refreshToken } = await tokenService.generateTokens(user);
        await tokenService.saveToken(user.userId, refreshToken);
        const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * env.JWT_REFRESH_TOKEN_TTL);
        tokenService.cookieToken(refreshToken, res, expires)

        return res.status(200).json({
            accessToken,
        });
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
                    tokenVersion: true,
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
            action: 'USER_REGISTER',
            actorId: user.userId,
            entityId: user.userId,
        });

        return this.auth(res, user);
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
                tokenVersion: true,
            },
        });

        if (!user) {
            await logAudit({
                req,
                action: 'USER_LOGIN_FAILED',
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
                action: 'USER_LOGIN_FAILED',
                actorId: user.userId,
                entityId: user.userId,
                details: { email, reason: 'Wrong password' },
            });
            throw new HttpError(401, 'Invalid credentials');
        }

        await logAudit({
            req,
            action: 'USER_LOGIN',
            actorId: user.userId,
            entityId: user.userId,
        });
        const {password: _, ...safeUser} = user;
        return this.auth(res, safeUser);
    }


    async logout(res: Response, req: Request, userId: string) {
        await tokenService.removeToken(userId);
        tokenService.clearCookies(res);
        await logAudit({
            req,
            action: 'USER_LOGOUT',
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

        const user = await prismaService.user.findUnique({
            where: {userId: payload.userId},
            select: {
                userId: true,
                role: true,
                refreshToken: true,
                tokenVersion: true
            },
        });

        if (!user || !user.refreshToken) {
            throw new HttpError(401, "User not found");
        }

        const hashedIncoming = hashToken(refreshToken);

        if (hashedIncoming !== user.refreshToken) {
            throw new HttpError(401,'Invalid refresh token');
        }

        if (payload.tokenVersion !== user.tokenVersion) {
            await logAudit({
                req,
                action: 'TOKEN_REVOKED',
                actorId: user.userId,
                entityId: user.userId,
                details: { reason: 'Token version mismatch' },
            });
            throw new HttpError(401, 'Token revoked');
        }

        const newPayload: TokenPayload = {
            userId: user.userId,
            role: user.role,
            tokenVersion: user.tokenVersion,
        };

        const { accessToken, refreshToken: newRefreshToken } = await tokenService.generateTokens(newPayload);
        const hashed = hashToken(newRefreshToken);

        const result = await prismaService.user.updateMany({
            where: {
                userId: user.userId,
                refreshToken: user.refreshToken,
            },
            data: {
                refreshToken: hashed,
            },
        });

        if (result.count === 0) {
            throw new HttpError(401, 'Refresh token already used');
        }
        const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * env.JWT_REFRESH_TOKEN_TTL);
        tokenService.cookieToken(newRefreshToken, res, expires);
        await logAudit({
            req,
            action: 'TOKEN_REFRESH',
            actorId: user.userId,
            entityId: user.userId,
        });
        return res.json({ accessToken });
    }
}

export const authService = new AuthServiceImplPostgres()