import {Request, Response, NextFunction} from 'express';

import * as healthService from '../services/HealthService';
import {logAudit} from "../utils/audit";

export const healthStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await healthService.getHealthStatus();

        const userAgent = req.headers['user-agent'] || '';

        if (!userAgent.includes('ELB-HealthChecker')) {
            await logAudit({
                req,
                action: 'HEALTH_CHECK',
                actorId: undefined,
                entityId: "system",
                entityType: 'system'
            });
        }

        return res.status(result.status === 'ok' ? 200 : 503).json(result);
    } catch (e) {
        next(e);
    }
}