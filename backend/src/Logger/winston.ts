import winston from 'winston';

import {env} from "../config/env";

export const logger = winston.createLogger({
    level: env.LOG_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({stack: true}),
        winston.format.json()
    ),
    defaultMeta: { type: 'AUDIT' },
    transports: [
        new winston.transports.File({ filename: 'logs/audit.log' }),
        new winston.transports.Console(),
    ],
});