import { createHash } from 'crypto';

import {CookieOptions, Response} from 'express';
import jwt, {JwtPayload, SignOptions} from 'jsonwebtoken';

import {env} from '../config/env';
import {Role} from '../prisma';
import {prismaService} from '../services/prismaService';

export interface TokenPayload extends JwtPayload {
    userId: string;
    role: Role;
    tokenVersion: number;
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

export const saveToken = async (userId: string, refreshToken: string) => {
    await prismaService.user.update({
        where: {userId},
        data: {
            refreshToken: hashToken(refreshToken),
        },
    });
};

export const removeToken = async (userId: string) => {
    await prismaService.user.update({
        where: {userId},
        data: {
            refreshToken: null,
            tokenVersion: {increment: 1}
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

