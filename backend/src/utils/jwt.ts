import {CookieOptions, Response} from 'express';
import jwt, {JwtPayload, SignOptions} from 'jsonwebtoken';

import {env} from '../config/env';
import {v4 as uuidv4} from 'uuid';
import {Role} from '../prisma';
import {hash} from 'argon2';
import {prismaService} from '../services/prismaService';

export interface TokenPayload extends JwtPayload {
    userId: string;
    role: Role;
    jti?: string;
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

export const saveToken = async (userId: string, refreshToken: string) => {
    await prismaService.user.update({
        where: {userId},
        data: {
            refreshToken: await hash(refreshToken),
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

export const generateTokens = async (payload: TokenPayload) => {
    const jti = uuidv4();
    const tokenPayload: TokenPayload = {
        ...payload,
        jti,
    };
    const accessToken = signToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);
    return {accessToken, refreshToken};
};

