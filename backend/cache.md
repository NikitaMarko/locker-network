## Cache

### Purpose

- PostgreSQL is the source of truth
- station cache lives in Redis under `REDIS_STATION_CACHE_PREFIX`
- locker cache lives in DynamoDB table `DYNAMO_LOCKER_CACHE_TABLE_NAME`
- operations state lives in DynamoDB table `DYNAMO_TABLE_NAME`
- public station reads fall back to RDS projections when Redis is unavailable

### Flow

```text
RDS write
  ->
projection builder
  ->
station cache write directly from backend to Redis
  ->
locker cache write directly from backend to DynamoDB
```

### Key rules

- station cache key: `stationId`
- locker cache key: `lockerBoxId`
- station projection version = `station.updatedAt.getTime() * 1000 + station.version`
- locker projection version = `locker.version`
- `station.version` is incremented on locker create, locker status change, and locker soft-delete
- station writes in Redis are version-aware
- locker cache writes happen directly in backend
- DynamoDB is the source of truth for locker statuses

### Read behaviour

Public endpoints:

- `GET /api/v1/lockers/stations`
- `GET /api/v1/lockers/stations/:id`
- `GET /api/v1/lockers/boxes`
- `GET /api/v1/lockers/boxes/:id`

Default sources:

- stations: Redis
- lockers: DynamoDB

Fallback source:

- stations: RDS projections built by `LockerCatalogProjectionService`
- lockers: no RDS status fallback; runtime status comes only from DynamoDB

### Reconciliation

Admin endpoint:

```bash
POST /api/v1/lockers/admin/cache/reconcile
```

Behaviour:

- compares RDS station projections with Redis and upserts/deletes station cache directly from backend
- compares RDS locker metadata with DynamoDB runtime cache and upserts/deletes locker cache directly from backend
- if Redis cannot be read, station reconcile falls back to full Redis resync from RDS
- if DynamoDB cannot be read, locker reconcile falls back to full locker resync from backend state
- `INACTIVE` stations are not pruned unless they are also `isDeleted = true`
