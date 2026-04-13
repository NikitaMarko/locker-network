export interface SecurityEventPayload {
  eventId: string;
  eventType: string;
  occurredAt: string;
  actorId?: string;
  correlationId?: string;
  ipAddress: string;
  userAgent: string;
  method: string;
  path: string;
  reason: string;
  details?: Record<string, unknown>;
}
 