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

const durationPattern = /^(\d+)(ms|s|m|h|d|w|y)?$/i;

const durationUnitsToMs: Record<string, number> = {
    ms: 1,
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
    w: 1000 * 60 * 60 * 24 * 7,
    y: 1000 * 60 * 60 * 24 * 365,
};

type TokenExpiresIn = NonNullable<SignOptions['expiresIn']>;

const expiresInToMs = (expiresIn: TokenExpiresIn): number => {
    if (typeof expiresIn === 'number') {
        return expiresIn * 1000;
    }

    const normalizedExpiresIn = expiresIn.trim();
    const match = normalizedExpiresIn.match(durationPattern);

    if (!match) {
        throw new Error(`Unsupported expiresIn format: ${normalizedExpiresIn}`);
    }

    const [, rawValue, rawUnit] = match;
    const value = Number(rawValue);

    if (!rawUnit) {
        return value;
    }

    return value * durationUnitsToMs[rawUnit.toLowerCase()];
};

export const getExpiresAt = (expiresIn: SignOptions['expiresIn']) =>
    new Date(Date.now() + expiresInToMs(expiresIn as TokenExpiresIn));

export const getRefreshTokenExpiresAt = () =>
    getExpiresAt(env.JWT_REFRESH_EXPIRES_IN as TokenExpiresIn);

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
    const expiresAt = getRefreshTokenExpiresAt();
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
