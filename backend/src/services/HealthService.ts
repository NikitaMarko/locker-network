import { env } from '../config/env';

import { prismaService } from './prismaService';

export const getHealthStatus = async () => {
    const useLambda = env.USE_LAMBDA_HEALTH === 'true' && env.LAMBDA_HEALTH_URL;

    if (useLambda) {
        try {
            return await callLambda();
        } catch {
            return getMock('mock-fallback');
        }
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

const getMock = async (source: 'mock' | 'mock-fallback' = 'mock') => {
    const start = Date.now();

    try {
        await prismaService.$queryRaw`SELECT 1`;

        return {
            status: 'ok' as const,
            time: new Date().toISOString(),
            source,
            uptime: Math.floor(process.uptime()),
            services: {
                database: { status: 'ok', latencyMs: Date.now() - start },
            },
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Database unreachable';

        return {
            status: 'degraded' as const,
            time: new Date().toISOString(),
            source,
            uptime: Math.floor(process.uptime()),
            services: {
                database: { status: 'error', error: message },
            },
        };
    }
};
