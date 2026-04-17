import {Request, Response, NextFunction} from 'express';

import * as healthService from '../services/HealthService';
import {logAudit} from "../utils/audit";
import {ActionType} from "../services/dto/operationDto";

export const healthStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userAgent = req.headers['user-agent'] || '';
        const isElbHealthChecker = userAgent.includes('ELB-HealthChecker');
        const result = await healthService.getHealthStatus({
            preferLocal: isElbHealthChecker,
        });

        if (!isElbHealthChecker) {
            void logAudit({
                req,
                action: ActionType.HEALTH_CHECK,
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
