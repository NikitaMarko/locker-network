import { env } from '../config/env';

import { prismaService } from './prismaService';

type LambdaHealthPayload = {
    status?: string;
    uptime?: number;
    services?: Record<string, unknown>;
};

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}

function parseLambdaPayload(raw: unknown): LambdaHealthPayload {
    if (!isObject(raw)) {
        return {};
    }

    if (typeof raw.body === 'string') {
        try {
            const parsedBody = JSON.parse(raw.body) as unknown;

            return isObject(parsedBody) ? parsedBody : {};
        } catch {
            return {};
        }
    }

    return raw;
}

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
    const payload = parseLambdaPayload(raw);

    return {
        status: payload.status ?? (response.ok ? 'ok' : 'degraded'),
        time: new Date().toISOString(),
        source: 'lambda' as const,
        uptime: payload.uptime,
        services: payload.services,
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
