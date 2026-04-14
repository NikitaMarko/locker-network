## Booking SQS

- Status: planned, not implemented in current backend producer flow
- Current operations queue supports `HEALTH_CHECK` and `SECURITY_EVENT`
- `CREATE_BOOKING` is documented here only as a future contract reference

### Current operations queue

- Queue URL env: `OPERATIONS_QUEUE_URL`
- Producer: backend
- Consumer: lambda command handler
- Transport: AWS SQS

Current message shape:

```json
{
  "operationId": "uuid",
  "type": "HEALTH_CHECK",
  "payload": {
    "timestamp": "2026-04-14T00:00:00.000Z"
  }
}
```

### Planned booking command

```json
{
  "operationId": "c6edcc11-3870-4179-b3e1-21757d43f001",
  "type": "CREATE_BOOKING",
  "payload": {
    "userId": "b13c403e-d8f3-46c5-a69e-b0a9894c7001",
    "lockerBoxId": "510520e8-3e12-4332-b3b5-7d5b54d19991",
    "expectedEndTime": "2026-04-13T18:00:00.000Z",
    "correlationId": "corr-201",
    "requestId": "f7c5d2b5-2c12-4f62-a4d6-50e5ea24d001"
  }
}
```

### Planned backend expectations

- create operation row in DynamoDB before sending SQS message
- operation status starts with `PENDING`
- on enqueue failure, operation status becomes `FAILED`
- use authenticated user id instead of body user id
- pass `x-correlation-id` into payload
- pass `requestId` when present for idempotency
- protect against concurrent booking of the same locker so two requests cannot both succeed

### Planned lambda expectations

- read from `OPERATIONS_QUEUE_URL`
- validate payload fields
- create booking
- update operation status in DynamoDB:
  - `PROCESSING`
  - `SUCCESS` or `FAILED`
