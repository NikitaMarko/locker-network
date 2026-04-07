import { createHash } from 'crypto';
import {timingSafeEqual} from "node:crypto";

import {CookieOptions, Response, Request} from 'express';
import jwt, {JwtPayload, SignOptions} from 'jsonwebtoken';
import {Role} from '@prisma/client';

import {env} from '../config/env';
import {prismaService} from '../services/prismaService';

export interface TokenPayload extends JwtPayload {
    userId: string;
    role: Role;
    sessionId: string;
}

export const signToken = (payload: TokenPayload) =>
    jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: env.JWT_ACCESS_EXPIRES_IN as SignOptions['expiresIn'],
    });

export const signRefreshToken = (payload: TokenPayload) =>
    jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions['expiresIn'],
    });

export const hashToken = (token: string) =>
    createHash('sha256').update(token).digest('hex');

export const timingSafeTokenCompare = (a: string, b: string): boolean => {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
};

export const saveToken = async (userId: string, refreshToken: string, req: Request,
): Promise<string> => {
    const expiresAt = new Date(
        Date.now() + 1000 * 60 * 60 * 24 * env.JWT_REFRESH_TOKEN_TTL,
    );
    const session = await prismaService.refreshSession.create({
        data: {
            userId,
            tokenHash: hashToken(refreshToken),
            ipAddress: req.ip ?? null,
            deviceInfo: req.headers['user-agent'] ?? null,
            expiresAt,
        },
    });
    return session.id;
};

export const refreshSession = async (sessionId: string, userId: string) => {
    await prismaService.refreshSession.updateMany({
        where: {
            id: sessionId,
            userId: userId,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        },
    });
};

const baseCookieOptions = (): CookieOptions => ({
    path: '/',
    httpOnly: true,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production',
});

export const cookieToken = (refreshToken: string, res: Response, expires: Date) => {
    res.cookie('refreshToken', refreshToken, {
        ...baseCookieOptions(),
        expires: expires,
    });
};

export const clearCookies = (res: Response) => {
    res.clearCookie('refreshToken', baseCookieOptions());
};

export const generateTokens = (payload: TokenPayload) => {
    const accessToken = signToken(payload);
    const refreshToken = signRefreshToken(payload);
    return {accessToken, refreshToken};
};

