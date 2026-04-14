## Lockers

### Public endpoints

#### GET /api/v1/lockers/boxes

- Roles: all
- Primary source: DynamoDB cache
- Fallback source: RDS projections when DynamoDB is unavailable or access is denied
- Query params: `stationId`, `size`, `status`

#### GET /api/v1/lockers/boxes/:id

- Roles: user
- Primary source: DynamoDB cache
- Fallback source: RDS projections when DynamoDB is unavailable or access is denied

### Admin/operator endpoints

#### GET /api/v1/lockers/admin/boxes

- Roles: operator, admin
- Source: RDS

#### GET /api/v1/lockers/admin/boxes/:id

- Roles: operator, admin
- Source: RDS

#### POST /api/v1/lockers/admin/boxes

- Roles: operator, admin
- Writes locker to RDS
- Enqueues locker cache projection through outbox for DynamoDB
- Updates related station cache in Redis directly from backend

Request body:

```json
{
  "stationId": "0486833f-d187-4af2-9b73-e7d661ca6104",
  "code": "A007",
  "size": "L"
}
```

#### PATCH /api/v1/lockers/admin/boxes/:id/status

- Roles: operator, admin
- Updates RDS first
- Enqueues locker cache projection through outbox for DynamoDB
- Updates related station cache in Redis directly from backend
- Current route is a generic status change endpoint, not a concurrency-safe booking endpoint
- Concurrent requests for the same locker are not guarded by atomic booking logic yet

#### POST /api/v1/lockers/admin/boxes/:id/resync-cache

- Roles: admin
- Enqueues one locker projection into outbox

#### PATCH /api/v1/lockers/oper/boxes/:id/delete

- Roles: operator
- Soft-deletes in RDS
- Enqueues locker delete projection through outbox
- Updates related station cache in Redis directly from backend
