# Locker Network — Lambda Functions

Serverless functions for the locker rental booking system. Invoked from the backend (API) via AWS SDK to handle booking business logic, notifications, and audit logging.

## Architecture

```
Backend (API)
    │
    ├── invoke (sync) ──► Booking Lambdas ──► DB
    │                       ├── createBooking
    │                       ├── cancelBooking
    │                       ├── extendBooking
    │                       └── updateBookingStatus
    │
    ├── SQS ──► sendNotification ──► Email / SMS
    │
    └── SQS ──► writeAuditLog ──► DB (AuditLog)

CloudWatch cron (5 min) ──► expireBookings ──► DB
```

## Tech Stack

- **Runtime:** Node.js 20.x
- **Language:** TypeScript
- **ORM:** Prisma (shared schema with backend)
- **IaC:** AWS SAM (`template.yaml`)
- **Infrastructure:** AWS Lambda, SQS, CloudWatch Events

## Project Structure

```
lambda/
├── src/
│   ├── functions/
│   │   ├── healthCheck.ts                # Health check (done)
│   │   ├── booking/
│   │   │   ├── createBooking.ts          # Create booking
│   │   │   ├── cancelBooking.ts          # Cancel booking
│   │   │   ├── extendBooking.ts          # Extend booking
│   │   │   └── updateBookingStatus.ts    # Change status (admin/operator)
│   │   ├── cron/
│   │   │   └── expireBookings.ts         # Expire overdue bookings
│   │   ├── notification/
│   │   │   └── sendNotification.ts       # Send notifications
│   │   └── audit/
│   │       └── writeAuditLog.ts          # Write audit log entries
│   ├── db/
│   │   └── repositories/                 # Prisma query wrappers
│   │       ├── booking.repository.ts
│   │       ├── lockerBox.repository.ts
│   │       └── auditLog.repository.ts
│   └── types/
│       └── contracts.ts                  # Request/response contracts
├── prisma/
│   └── schema.prisma                     # Shared schema (from backend)
├── events/                               # Test event files
│   └── healthCheck.json
├── template.yaml                         # SAM configuration
├── tsconfig.json
└── package.json
```

## Installation

```bash
cd lambda
npm install
npx prisma generate
```

## Local Development

```bash
# Compile TypeScript
npx tsc

# Build SAM
sam build

# Invoke function locally
sam local invoke HealthCheckFunction --event events/healthCheck.json
```

## Deployment

```bash
sam build
sam deploy --parameter-overrides \
  DatabaseUrl="postgresql://user:pass@host:5432/locker_db" \
  Environment="dev"
```

## Contracts

### Health Check

**Request (from backend):**
```json
{
  "action": "healthCheck",
  "requestedBy": "backend-api"
}
```

**Response:**
```json
{
  "message": "Ok",
  "timestamp": "2026-03-23T12:00:00.000Z"
}
```

### Create Booking

**Request:**
```json
{
  "userId": "uuid",
  "lockerBoxId": "uuid",
  "expectedEndTime": "2026-03-24T18:00:00.000Z",
  "correlationId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "booking": {
    "bookingId": "uuid",
    "status": "PENDING",
    "startTime": "2026-03-23T12:00:00.000Z"
  }
}
```

## Lambda Functions

| Function | Trigger | Uses DB | Description |
|----------|---------|:---:|-------------|
| `healthCheck` | invoke | — | Returns Ok + timestamp |
| `createBooking` | invoke | ✅ | Create booking, reserve locker, audit log |
| `cancelBooking` | invoke | ✅ | Cancel booking, release locker |
| `extendBooking` | invoke | ✅ | Extend booking end time |
| `updateBookingStatus` | invoke | ✅ | Change status (admin/operator) |
| `expireBookings` | cron (5 min) | ✅ | Find and expire overdue bookings |
| `sendNotification` | SQS | — | Send email/SMS |
| `writeAuditLog` | SQS | ✅ | Write actions to AuditLog |

## DB Models (used by Lambdas)

- **Booking** — reservations (PENDING → ACTIVE → ENDED / CANCELLED / EXPIRED)
- **LockerBox** — locker boxes (AVAILABLE → RESERVED → OCCUPIED)
- **AuditLog** — action log for all operations
- **LockerDevice** — device status (heartbeat)
- **User** — user data for notifications (read-only)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NODE_ENV` | Environment (dev / staging / prod) |

## Team

- **Lambda:** Egor, Anna
- **Backend (API):** Dmitrii B, Liza, Mark, Igor