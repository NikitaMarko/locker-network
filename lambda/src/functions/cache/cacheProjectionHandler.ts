import { SQSEvent } from 'aws-lambda';
import { CacheProjectionEvent } from '../../types/contracts/CacheProjectionContracts';
import {
  upsertStationCache,
  deleteStationCache,
  upsertLockerCache,
  deleteLockerCache,
} from '../../db/dynamodb';

export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const cacheEvent: CacheProjectionEvent = JSON.parse(record.body);
 
    console.log(JSON.stringify({
      action: 'CACHE_EVENT_RECEIVED',
      eventId: cacheEvent.eventId,
      entityType: cacheEvent.entityType,
      entityId: cacheEvent.entityId,
      eventType: cacheEvent.eventType,
      projectionVersion: cacheEvent.projectionVersion,
      correlationId: cacheEvent.correlationId,
    }));
 
    try {
      switch (cacheEvent.entityType) {
        case 'station_cache':
          if (cacheEvent.eventType === 'UPSERT') {
            await upsertStationCache(
              cacheEvent.entityId,
              cacheEvent.payload as unknown as Record<string, unknown>,
              cacheEvent.projectionVersion,
            );
          } else if (cacheEvent.eventType === 'DELETE') {
            await deleteStationCache(cacheEvent.entityId);
          }
          break;
 
        case 'locker_cache':
          if (cacheEvent.eventType === 'UPSERT') {
            await upsertLockerCache(
              cacheEvent.entityId,
              cacheEvent.payload as unknown as Record<string, unknown>,
              cacheEvent.projectionVersion,
            );
          } else if (cacheEvent.eventType === 'DELETE') {
            await deleteLockerCache(cacheEvent.entityId);
          }
          break;
 
        default:
          console.error(JSON.stringify({
            action: 'UNKNOWN_ENTITY_TYPE',
            entityType: cacheEvent.entityType,
            eventId: cacheEvent.eventId,
          }));
      }
 
      console.log(JSON.stringify({
        action: 'CACHE_EVENT_PROCESSED',
        eventId: cacheEvent.eventId,
        entityType: cacheEvent.entityType,
        eventType: cacheEvent.eventType,
      }));
 
    } catch (err) {
      console.error(JSON.stringify({
        action: 'CACHE_EVENT_FAILED',
        eventId: cacheEvent.eventId,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
      throw err; // SQS will retry
    }
  }
};