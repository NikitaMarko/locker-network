import express, {Request} from "express";
import {rateLimit, ipKeyGenerator} from 'express-rate-limit';
import jwt from "jsonwebtoken";

import * as authController from "../controllers/authController";
import {validateRequest} from "../middleware/validateRequest";
import {
    loginSchema,
    refreshSchema,
    signupSchema,
} from "../validation/authSchemas";
import * as auth from "../middleware/authMiddleware";
import {env} from "../config/env";
import {TokenPayload} from "../utils/jwt";

const loginLimiter = rateLimit({
    max: 5,
    windowMs: 15 * 60 * 1000,  // 15 минут
    skipSuccessfulRequests: true,  // Не считай успешные попытки
    keyGenerator: (req: Request) => {
        const email = req.body?.email || 'unknown';
        if (!req.ip) {
            throw new Error('IP is missing');
        }
        const ip = ipKeyGenerator(req.ip);
        return `${email}:${ip}`;
    },
    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            message: 'Too many login attempts. Try again later.',
        });
    }
});

const signupLimiter = rateLimit({
    max: 5,
    windowMs: 60 * 60 * 1000,  // 1 час
    handler: (req, res) => {
        res.status(429).json({
            status: 'error',
            message: 'Too many signup attempts. Try again later.',
        });
    }
});


const refreshLimiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    skipSuccessfulRequests: true,
    keyGenerator: (req: Request) => {
        try {
            const token = req.cookies?.refreshToken;
            const payload = jwt.verify(token, env.JWT_REFRESH_SECRET, {
                algorithms: ['HS256'],
            }) as TokenPayload;
            if (!req.ip) {
                throw new Error('IP is missing');
            }
            const ip = ipKeyGenerator(req.ip);
            return `${payload.userId}:${ip}`;
        } catch {
            return ipKeyGenerator(req.ip ?? 'unknown');
        }
    },
});

export const authRouter = express.Router()

authRouter.post('/signup', signupLimiter, validateRequest(signupSchema), authController.register);
authRouter.post('/login', loginLimiter, validateRequest(loginSchema), authController.login);
authRouter.post('/refresh', refreshLimiter, validateRequest(refreshSchema), authController.refresh);
authRouter.use(auth.protect);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authController.me);
