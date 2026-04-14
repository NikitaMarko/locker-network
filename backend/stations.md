## Stations

### Public endpoints

#### GET /api/v1/lockers/stations

- Roles: all
- Primary source: Redis station cache
- Fallback source: RDS projections when Redis is unavailable or access is denied
- Query params: `city`, `lat`, `lng`, `radius`, `status`

#### GET /api/v1/lockers/stations/:id

- Roles: user
- Primary source: Redis station cache
- Fallback source: RDS projections when Redis is unavailable or access is denied

### Admin/operator endpoints

#### GET /api/v1/lockers/admin/stations

- Roles: operator, admin
- Source: RDS

#### GET /api/v1/lockers/admin/stations/:id

- Roles: operator, admin
- Source: RDS

#### POST /api/v1/lockers/admin/stations

- Roles: operator, admin
- Writes station to RDS
- Updates station cache in Redis directly from backend

Request body:

```json
{
  "city": "HFA",
  "latitude": 34.405045,
  "longitude": 37.706076,
  "address": "test"
}
```

#### PATCH /api/v1/lockers/admin/stations/:id/status

- Roles: operator, admin
- Updates RDS first
- Updates station projection in Redis directly from backend
- Enqueues dependent locker projections through outbox for DynamoDB

#### POST /api/v1/lockers/admin/stations/:id/resync-cache

- Roles: admin
- Rebuilds one station projection from RDS and writes it directly to Redis

#### POST /api/v1/lockers/admin/cache/reconcile

- Roles: admin
- Compares RDS station projections with Redis station cache
- Upserts missing or stale station projections directly to Redis
- Deletes stale Redis station records that are absent from RDS projections because they were soft-deleted
- Falls back to full RDS resync for stations if Redis cannot be read
- Runs locker reconciliation separately against DynamoDB
- Does not delete stations that are only `INACTIVE`

#### PATCH /api/v1/lockers/oper/stations/:id/delete

- Roles: operator
- Soft-deletes station in RDS
- Marks station status as `INACTIVE`
- Deletes station cache from Redis directly from backend
- Enqueues locker delete projections through outbox
