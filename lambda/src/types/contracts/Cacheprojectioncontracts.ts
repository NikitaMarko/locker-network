// ─── SQS message from backend ───
export interface CacheProjectionEvent {
  eventId: string;
  schemaVersion: number;
  correlationId: string;
  occurredAt: string;
  actorId: string | null;
  entityType: 'station_cache' | 'locker_cache';
  entityId: string;
  eventType: 'UPSERT' | 'DELETE';
  projectionVersion: number;
  payload: StationCachePayload | LockerCachePayload;
}
 
// ─── Station cache projection ───
export interface StationCachePayload {
  stationId: string;
  cityId: string;
  address: string | null;
  latitude: number;
  longitude: number;
  status: string;
  version: number;
  availableLockers: number;
  city: {
    code: string;
    name: string;
  };
  lockers: unknown[];
}
 
// ─── Locker cache projection ───
export interface LockerCachePayload {
  lockerBoxId: string;
  stationId: string;
  code: string;
  size: string;
  status: string;
  version: number;
  lastStatusChangedAt: string;
  pricePerHour: string;
  station: {
    address: string | null;
    latitude: number;
    longitude: number;
    status: string;
    city: {
      code: string;
      name: string;
    };
  };
}
 