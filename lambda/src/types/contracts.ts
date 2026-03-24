export interface HealthCheckRequest {
  action: string;
  requestedBy: string;
}

export interface HealthCheckResponse {
  statusCode: number;
  headers: { 'Content-Type': string };
  body: string;  // JSON-строка, потому что API Gateway так требует
}

export interface HealthCheckBody {
  status: 'ok' | 'degraded';
  uptime: number;
  services: {
    lambda: { status: 'ok' };
  };
}