import {Request, Response, NextFunction} from 'express';
import * as healthService from '../services/HealthService';

export const healthStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await healthService.getHealthStatus();
        return res.status(result.status === 'ok' ? 200 : 503).json(result);
    } catch (e) {
        next(e);
    }
}