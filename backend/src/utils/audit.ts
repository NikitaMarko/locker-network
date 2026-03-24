import { Request } from 'express';

import { prismaService } from '../services/prismaService';
import {auditLogger} from '../Logger/winston';

type AuditAction =
    | 'USER_LOGIN'
    | 'USER_LOGIN_FAILED'
    | 'USER_LOGOUT'
    | 'USER_REGISTER'
    | 'TOKEN_REFRESH'
    | 'TOKEN_REVOKED';

interface AuditParams {
    req: Request;
    action: AuditAction;
    actorId?: string;
    entityId: string;
    entityType?: string;
    lockerId?: string;
    details?: Record<string, unknown>;
}

export const logAudit = async ({
                                   req,
                                   action,
                                   actorId,
                                   entityId,
                                   entityType = 'User',
                                   lockerId,
                                   details,
                               }: AuditParams): Promise<void> => {
    try {
        await prismaService.auditLog.create({
            data: {
                actorId,
                lockerId,
                action,
                entityType,
                entityId,
                details: {
                    ipAddress: req.ip,
                    userAgent: req.get('user-agent') ?? 'unknown',
                    correlationId: req.headers['x-correlation-id'],
                    ...details,
                },
            },
        });
    } catch (err) {
        auditLogger.error('Failed to write audit log', { action, actorId, err });
    }
};