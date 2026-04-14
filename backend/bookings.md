## Bookings

- Status: planned contract, not implemented in current backend router
- Current locker status routes must not be treated as a concurrency-safe booking API

### Endpoints:

#### POST /api/v1/bookings

- Roles:  User, Operator, Admin

- Request Body:
```json
{
  "lockerBoxId": "510520e8-3e12-4332-b3b5-7d5b54d19991",
  "expectedEndTime": "2026-04-13T18:00:00.000Z",
  "requestId": "f7c5d2b5-2c12-4f62-a4d6-50e5ea24d001"
}
```

Notes:

- `userId` should be taken from authenticated user session
- `correlationId` should be taken from request header `x-correlation-id`
- booking command should be sent to SQS
- backend should return async operation response immediately

Response `202 Accepted`:
```json
{
  "success": true,
  "correlationId": "corr-201",
  "data": {
    "operationId": "c6edcc11-3870-4179-b3e1-21757d43f001",
    "status": "PENDING",
    "type": "CREATE_BOOKING"
  }
}
```

Response `400 Bad Request`:
```json
{
  "success": false,
  "correlationId": "corr-201",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "expectedEndTime must be a valid ISO datetime"
  }
}
```

Response `401 Unauthorized`:
```json
{
  "success": false,
  "correlationId": "corr-201",
  "error": {
    "code": "HTTP_ERROR",
    "message": "You are not logged in"
  }
}
```

Response `409 Conflict`:
```json
{
  "success": false,
  "correlationId": "corr-201",
  "error": {
    "code": "HTTP_ERROR",
    "message": "Idempotency key was already used with a different payload"
  }
}
```


#### GET /api/v1/bookings/:id

- Roles:  User, Operator, Admin

Response `200 OK`:
```json
{
  "success": true,
  "correlationId": "corr-202",
  "data": {
    "bookingId": "a2c3c940-c39e-44d9-a30c-c98917ef5001",
    "userId": "b13c403e-d8f3-46c5-a69e-b0a9894c7001",
    "lockerBoxId": "510520e8-3e12-4332-b3b5-7d5b54d19991",
    "status": "PENDING",
    "startTime": null,
    "expectedEndTime": "2026-04-13T18:00:00.000Z",
    "endTime": null,
    "totalPrice": null,
    "correlationId": "corr-202",
    "requestId": "f7c5d2b5-2c12-4f62-a4d6-50e5ea24d001",
    "createdAt": "2026-04-13T14:00:00.000Z",
    "updatedAt": "2026-04-13T14:00:00.000Z"
  }
}
```

Response `404 Not Found`:
```json
{
  "success": false,
  "correlationId": "corr-202",
  "error": {
    "code": "HTTP_ERROR",
    "message": "Booking not found"
  }
}
```


#### GET /api/v1/bookings/operations/:id

- Roles:  User, Operator, Admin

Response `200 OK`:
```json
{
  "success": true,
  "correlationId": "corr-203",
  "data": {
    "operationId": "c6edcc11-3870-4179-b3e1-21757d43f001",
    "status": "SUCCESS",
    "type": "CREATE_BOOKING"
  }
}
```

Response `404 Not Found`:
```json
{
  "success": false,
  "correlationId": "corr-203",
  "error": {
    "code": "HTTP_ERROR",
    "message": "Operation not found"
  }
}
```

### Booking entity

Stored fields:

```json
{
  "bookingId": "a2c3c940-c39e-44d9-a30c-c98917ef5001",
  "userId": "b13c403e-d8f3-46c5-a69e-b0a9894c7001",
  "lockerBoxId": "510520e8-3e12-4332-b3b5-7d5b54d19991",
  "status": "PENDING",
  "startTime": null,
  "expectedEndTime": "2026-04-13T18:00:00.000Z",
  "endTime": null,
  "totalPrice": null,
  "correlationId": "corr-202",
  "requestId": "f7c5d2b5-2c12-4f62-a4d6-50e5ea24d001",
  "createdAt": "2026-04-13T14:00:00.000Z",
  "updatedAt": "2026-04-13T14:00:00.000Z"
}
```

### Booking statuses

- `PENDING`
- `ACTIVE`
- `COMPLETED`
- `CANCELLED`
- `EXPIRED`

### Expected flow

```text
POST /api/v1/bookings
  ->
validate request
  ->
create async operation with status PENDING
  ->
send booking command to SQS
  ->
lambda processes booking
  ->
booking row is created/updated
  ->
operation status becomes SUCCESS or FAILED
```

### Concurrency requirement

When booking is implemented, it should not rely on the current generic locker status update route alone.

The real booking flow must reject simultaneous reservation attempts for the same locker using one of these approaches:

- atomic update with current-status check
- optimistic locking with `version`
- dedicated booking row plus uniqueness constraints
