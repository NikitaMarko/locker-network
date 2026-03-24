import { HealthCheckResponse, HealthCheckBody } from '../types/contracts';

const startTime = Date.now();

export const handler = async (): Promise<HealthCheckResponse> => {
  const body: HealthCheckBody = {
    status: 'ok',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services: {
      lambda: { status: 'ok' },
    },
  };

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
};