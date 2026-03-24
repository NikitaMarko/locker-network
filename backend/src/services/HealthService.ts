import { env } from '../config/env';

import { prismaService } from './prismaService';

export const getHealthStatus = async () => {
    const useLambda = env.USE_LAMBDA_HEALTH === 'true' && env.LAMBDA_HEALTH_URL;

    if (useLambda) {
        return callLambda();
    }
    return getMock();
};

const callLambda = async () => {
    const response = await fetch(env.LAMBDA_HEALTH_URL!, {
        signal: AbortSignal.timeout(5000),
    });

    const raw = await response.json();

    return {
        status: raw.status ?? (response.ok ? 'ok' : 'degraded'),
        time: new Date().toISOString(),
        source: 'lambda' as const,
        uptime: raw.uptime,
        services: raw.services,
    };
};

const getMock = async () => {
    const start = Date.now();
    await prismaService.$queryRaw`SELECT 1`;

    return {
        status: 'ok' as const,
        time: new Date().toISOString(),
        source: 'mock' as const,
        uptime: Math.floor(process.uptime()),
        services: {
            database: { status: 'ok', latencyMs: Date.now() - start },
        },
    };
};