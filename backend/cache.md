## Cache

### Purpose

- PostgreSQL is the source of truth
- station cache lives in Redis under `REDIS_STATION_CACHE_PREFIX`
- locker cache lives in DynamoDB table `DYNAMO_LOCKER_CACHE_TABLE_NAME`
- operations state lives in DynamoDB table `DYNAMO_TABLE_NAME`
- public station reads use Redis as the primary cache, but reconcile against RDS projections when cache is empty, partial, or stale

### Flow

```text
station read miss
  ->
build projection from RDS
  ->
warm station cache in Redis

locker create/status/delete
  ->
RDS write
  ->
backend writes locker cache directly to DynamoDB

admin resync/reconcile
  ->
backend writes Redis / DynamoDB directly
```

### Key rules

- station cache key: `stationId`
- locker cache key: `lockerBoxId`
- station projection version = `station.updatedAt.getTime() * 1000 + station.version`
- locker projection version = `locker.version`
- `station.version` is incremented on locker create, locker status change, and locker soft-delete
- backend warms station cache in Redis on read miss
- station create does not write cache directly
- station status/delete keep Redis station cache deferred
- station status/delete rewrite dependent locker cache in DynamoDB directly
- locker create/status/delete write locker cache in DynamoDB directly
- `resync-cache` and `cache/reconcile` write cache directly
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
- lockers: no fallback; runtime status comes only from DynamoDB cache

Station read details:

- `GET /api/v1/lockers/stations` does not trust a non-empty Redis catalog as complete by itself
- backend loads Redis station cache first, then compares it with RDS station projections
- missing or stale station records are returned from RDS and warmed back into Redis
- hard fallback to pure RDS happens when Redis is unavailable or access is denied

### Reconciliation

Admin endpoint:

```bash
POST /api/v1/lockers/admin/cache/reconcile
```

Behaviour:

- reserved as an admin endpoint for unscheduled cache reconcile / refresh flow
- compares cache state with RDS projections
- writes missing or stale station records directly to Redis
- writes missing or stale locker records directly to DynamoDB
- deletes stale cache records when they are absent from the source projection
- `INACTIVE` stations are not pruned unless they are also `isDeleted = true`
