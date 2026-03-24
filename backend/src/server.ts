
import { randomUUID } from 'crypto';

import cookieParser from "cookie-parser";
import cors from "cors";
import express, {Application, NextFunction, Request, Response} from 'express'
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from "morgan";
import qs from 'qs';
import swaggerUi from "swagger-ui-express"

import {env} from "./config/env";
import {errorHandler} from "./errorHandler/errorHandler";
import {logger} from "./Logger/winston";
import {authRouter} from "./routes/authRoutes";
import {healthRouter} from "./routes/healthRoutes";
import { HttpError } from './errorHandler/HttpError';
import {lockersRoutes} from "./routes/lockersRoutes";

    const PORT = env.PORT;
    const baseUrl = `http://localhost:${PORT}`;
export const createApp = () => {


    const app: Application = express();
    app.set('trust proxy', 1);

    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                connectSrc: ["'self'", env.FRONTEND_URL].filter(Boolean) as string[],
                formAction: ["'self'"],
                frameAncestors: ["'none'"],
                objectSrc: ["'none'"],
            }
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true
        }
    }));

    app.use(cookieParser());

    //===============Logging============

    app.use(
        morgan("combined", {
            stream: {
                write: (message) => logger.info(message.trim()),
            },
        })
    );

    //===============Middleware============
    app.use(express.json({limit: '10kb'}));
    app.set('query parser', (str: string) => qs.parse(str));

    app.use(hpp())

    //===============CORS============
    app.use(
        cors({
            origin: [
                env.FRONTEND_URL,
                env.SERVER_URL
            ].filter(Boolean) as string[],
            methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
            allowedHeaders: ["Content-Type", "Authorization", "Accept"],
            credentials: true
        })
    );

    //===============Limiter============
    const globalLimiter = rateLimit({
        skip: (req) => req.path.startsWith('/api/v1/auth'),
        max: 200,
        windowMs: 60 * 60 * 1000,
        message: 'Too many requests from this IP, please try again in an hour!',
        standardHeaders: true,
        legacyHeaders: false,
    });

    app.use(globalLimiter);
    //==============Swagger Docs==========
    if (env.NODE_ENV !== 'production') {
        const swaggerDoc = require("../docs/openapi.json");
        app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
    }

    //==============Correlation ID==========
    app.use((req: Request, res: Response, next: NextFunction) => {
        const correlationId = (req.headers['x-correlation-id'] as string) || randomUUID();
        req.headers['x-correlation-id'] = correlationId;
        res.setHeader('x-correlation-id', correlationId);
        next();
    });

    //===============Router================
    const API_PREFIX = '/api/v1';
    app.get('/', (_, res) => res.send('API is running'));
    app.use(`${API_PREFIX}/auth`, authRouter)
    app.use(`/health`, healthRouter)
    app.use(`${API_PREFIX}/lockers`, lockersRoutes)



    //===============404 Handler================
    app.use((req, res, next) => {
        next(new HttpError(404, `Cannot find ${req.originalUrl} on this server`));
    });

//=============Global Error Handler===========
    app.use(errorHandler)
    return app;
};

export const launchServer = () => {
    const app = createApp();

    const server = app.listen(PORT, () => {
        logger.info(`App running at ${baseUrl}`);
    });

    return server;
};