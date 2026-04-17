# 🔐 Locker Network Backend

> Secure smart locker management system with JWT authentication, role-based access control, audit logging, and AWS Lambda integration.

## 📋 Table of Contents

- [Quick Start](#-quick-start)
- [Tech Stack](#-tech-stack)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Running Locally](#-running-locally)
- [Docker Deployment](#-docker-deployment)
- [Database Migrations](#-database-migrations)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
- [Authentication Flow](#-authentication-flow)
- [Security](#-security)
- [Rate Limiting](#-rate-limiting)
- [Audit Logging](#-audit-logging)
- [Health Check](#-health-check)
- [Project Structure](#-project-structure)

---

## ⚡ Quick Start

### Full Docker Quick Start

Run these commands in order for a clean, full local Docker setup:

```bash
cd locker-network-repository/lambda
npm install
npm run build

cd ../backend
cp .env.localstack.example .env
# optional for Google Sign-In:
# export GOOGLE_CLIENT_ID=your-google-oauth-client-id
docker compose down -v
docker compose up --build -d
docker compose ps
docker exec locker-backend wget -qO- http://localhost:3555/health
```

This sequence does all required steps:

- builds the TypeScript Lambda artifacts used by LocalStack
- starts PostgreSQL, Redis, LocalStack, and backend
- recreates Docker volumes for a clean bootstrap
- keeps Docker in LocalStack mode without inheriting remote AWS health settings from `.env`
- verifies backend health from inside the container

Notes:

- `cp .env.localstack.example .env` creates the local Docker env file used by Docker Compose variable substitution.
- Google login in Docker reads `GOOGLE_CLIENT_ID` from the host shell or `.env`, but the container still keeps localstack-safe defaults such as `USE_LAMBDA_HEALTH=false`.

If you only changed backend code:

```bash
cd locker-network-repository/backend
docker compose up --build -d
```

```bash
# Clone repository
git clone https://github.com/locker-network-java-30-final-project/locker-network-repository
cd locker-network-repository/backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env — replace JWT secrets and AWS resource values as needed

# Configure AWS credentials for DynamoDB/SQS access
# Option A:
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_REGION=eu-west-1

# Option B:
export AWS_PROFILE=your-profile-name

# Generate Prisma client
npx prisma generate  

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Server: `http://localhost:3555`
Swagger docs: `http://localhost:3555/docs` when `NODE_ENV != production`

---

## 🛠 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Runtime** | Node.js | 22+     |
| **Language** | TypeScript | 5.9+    |
| **Framework** | Express.js | 5.2+    |
| **ORM** | Prisma | 5.22+   |
| **Database** | PostgreSQL | 12+     |
| **Auth** | JWT (access + refresh token rotation) | HS256   |
| **Password Hash** | Argon2 | 0.44+   |
| **Logging** | Winston | 3.19+   |
| **Rate Limiting** | express-rate-limit | 8.3+    |
| **Validation** | Zod | 4.3+    |
| **Security** | Helmet, HPP, CORS | latest  |
| **API Docs** | Swagger UI (OpenAPI 3.0) | latest  |

---

## 📦 Installation

### Prerequisites

- Node.js 22+ ([download](https://nodejs.org))
- npm
- PostgreSQL 12+ or Docker

### Install

```bash
npm install
```

### Verify

```bash
node --version  # 22+
npm --version   # 8+
```

---

## 🔐 Environment Setup

```bash
cp .env.example .env
```

Use [`.env.example`](./.env.example) as the canonical template for local configuration. It reflects the current local CORS, Google login, Redis station cache read settings, DynamoDB locker cache read settings, and SQS queue settings used by the backend.

Refresh-session policy:

- each new login revokes all previously active refresh sessions for the same user
- the same policy applies to Google login because it uses the same auth flow

### Full `.env` reference

```env
# Server
NODE_ENV=development                    # development | production | test
PORT=3555
SERVER_URL=http://localhost:3555
CLOUDFRONT_URL=https://your-cloudfront-domain
LOG_LEVEL=info                          # debug | info | warn | error

# Database
# Note: 5433 = host port mapped to Docker container's 5432
DATABASE_URL="postgresql://root:root@localhost:5433/locker"
POSTGRES_USER=root
POSTGRES_PASSWORD=root
POSTGRES_HOST=localhost
POSTGRES_PORT=5433

# JWT — generate secrets with:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_ACCESS_SECRET=<min-32-chars>        # HS256, access token signing
JWT_REFRESH_SECRET=<min-32-chars>       # HS256, refresh token signing
JWT_ACCESS_EXPIRES_IN=15m               # Access token TTL
JWT_ACCESS_TOKEN_TTL=15                 # Access token TTL in minutes
JWT_REFRESH_EXPIRES_IN=7d               # Refresh token TTL
JWT_REFRESH_TOKEN_TTL=7                 # Refresh token TTL in days

# Frontend CORS origin
FRONTEND_URL=http://localhost:5173
FRONTEND_LOCAL_URL=http://localhost:5173

# Lambda health check
USE_LAMBDA_HEALTH=false                 # true = call AWS Lambda first, fallback to DB check on error
LAMBDA_HEALTH_URL=                      # Required when USE_LAMBDA_HEALTH=true

# AWS / async operations
AWS_REGION=eu-west-1
AWS_PROFILE=                            # Optional: local AWS profile name
DYNAMODB_ENDPOINT_URL=                  # Optional: override only for LocalStack/custom endpoint
SQS_ENDPOINT_URL=                       # Optional: override only for LocalStack/custom endpoint
AWS_ENDPOINT_URL=                       # Optional: shared endpoint override
REDIS_URL=redis://localhost:6379
REDIS_STATION_CACHE_PREFIX=station-cache:
REDIS_STATION_CACHE_TTL_SECONDS=300
DYNAMO_LOCKER_CACHE_TABLE_NAME=locker-dev-locker-cache
DYNAMO_ROLE_ARN=                        # Optional: assume-role ARN for DynamoDB/SQS access
DYNAMO_ROLE_SESSION_NAME=locker-backend-dynamo
DYNAMO_TABLE_NAME=locker-dev-operations-dynamodb
OPERATIONS_QUEUE_URL=https://sqs.eu-west-1.amazonaws.com/131904957044/locker-dev-operations-queue
CACHE_PROJECTION_QUEUE_URL=https://sqs.eu-west-1.amazonaws.com/131904957044/locker-dev-cache-projection
SQS_URL=https://sqs.eu-west-1.amazonaws.com/131904957044/locker-dev-operations-queue
```

### AWS credentials are required

The backend validates AWS credentials during startup because async operation endpoints use DynamoDB and SQS.
Locker cache projection publishing also requires SQS access to `CACHE_PROJECTION_QUEUE_URL`.

Supported local setup options:

```bash
# Option A: static credentials
export AWS_ACCESS_KEY_ID=your-access-key
export AWS_SECRET_ACCESS_KEY=your-secret-key
export AWS_REGION=eu-west-1

# Option B: named profile
export AWS_PROFILE=your-profile-name
export AWS_REGION=eu-west-1
```

If your project uses role assumption, also configure `DYNAMO_ROLE_ARN` and, optionally, `DYNAMO_ROLE_SESSION_NAME`.

### ⚠️ Security requirements

```bash
# Generate strong secrets (required, min 32 chars):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Never commit `.env` to git.** Use `.env.example` for templates only.

---

## 🚀 Running Locally

### Development

```bash
npm run dev
```

- Hot reload via `ts-node-dev`
- Winston logging to console
- Swagger UI available at `/docs`
- Startup requires a reachable PostgreSQL instance and valid AWS credentials

Expected output:
```
[INFO] Starting server initialization...
[INFO] PostgreSQL connected successfully
[INFO] AWS credentials resolved successfully
[INFO] App running at http://localhost:3555
```

### Production

```bash
npm run build
npm start
```

---

## 🐳 Docker Deployment

```bash
# Start PostgreSQL + Redis + LocalStack + Backend
docker compose up --build -d

# Logs
docker compose logs -f backend

# Stop
docker compose down

# Reset volumes
docker compose down -v
```

### Local Docker stack

For local verification of the current cache setup, [docker-compose.yml](/Users/dmitrii/Desktop/BackEnd/locker-network-repository/locker-network-repository/backend/docker-compose.yml:1) starts:

- PostgreSQL with PostGIS
- Redis as station cache read source
- LocalStack for DynamoDB, SQS, Lambda, IAM and logs
- backend service wired to those local dependencies
- cache projection queue and lambda for locker cache updates

Important:

- `docker-compose.yml` intentionally overrides AWS endpoints and queue URLs to LocalStack for the `backend` container
- the compose stack uses [`.env.localstack.example`](./.env.localstack.example) as the container env source
- if you run `npm run dev` on the host, backend uses values from `.env`
- if you run `docker compose up backend`, backend uses the compose-local values even if `.env` points to real AWS

If you also want the host-run backend to target LocalStack, copy the local template:

```bash
cp .env.localstack.example .env
```

Compose-exposed ports:

- API: `http://localhost:3555`
- PostgreSQL: `localhost:5433`
- Redis: `localhost:6379`
- LocalStack edge: `http://localhost:4566`

## 🔎 Route Summary

Primary route groups:

- `GET /health`
- `POST /operations/health`
- `GET /operations/:id`
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/google`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`
- `GET /api/v1/cities`
- `GET /api/v1/lockers/boxes`
- `GET /api/v1/lockers/stations`
- admin/operator locker and station routes under `/api/v1/lockers/admin/*` and `/api/v1/lockers/oper/*`

Then start infrastructure:

```bash
docker compose up -d postgres redis localstack
```

Run only Redis locally:

```bash
docker compose up -d redis
```

If you want to run Redis outside Docker Compose:

```bash
docker run --name locker-redis -p 6379:6379 -d redis:7-alpine
```

What LocalStack bootstraps automatically:
- SQS queues:
  - `locker-operations-queue`
  - `locker-dev-cache-projection`
- DynamoDB tables:
  - `locker-dev-operations-dynamodb`
  - `locker-dev-locker-cache`
- Local operations Lambda:
  - `locker-command-handler`
- Local cache projection Lambda:
  - `locker-cache-projection-handler`

Current locker cache write path:

`backend -> locker-dev-cache-projection -> locker-cache-projection-handler -> locker-dev-locker-cache`

Station cache is not handled by this lambda flow. Stations remain backend-owned via Redis cache with RDS fallback.

Bootstrap files:

- init script: [01-bootstrap.sh](/Users/dmitrii/Desktop/BackEnd/locker-network-repository/locker-network-repository/backend/docker/localstack/init/01-bootstrap.sh:1)
- TS Lambda source module: [lambda/package.json](/Users/dmitrii/Desktop/BackEnd/locker-network-repository/locker-network-repository/lambda/package.json:1)
- operations handler: [commandHandler.ts](/Users/dmitrii/Desktop/BackEnd/locker-network-repository/locker-network-repository/lambda/src/functions/operations/commandHandler.ts:1)
- cache projection handler: [cacheProjectionHandler.ts](/Users/dmitrii/Desktop/BackEnd/locker-network-repository/locker-network-repository/lambda/src/functions/cache/cacheProjectionHandler.ts:1)

Before starting LocalStack-backed Docker flow, make sure Lambda TS artifacts exist:

```bash
cd ../lambda
npm install
npm run build
cd ../backend
```

Run backend against LocalStack:

```bash
npm run dev
```

Useful checks:

```bash
aws --endpoint-url=http://localhost:4566 sqs list-queues --region eu-west-1
aws --endpoint-url=http://localhost:4566 dynamodb list-tables --region eu-west-1
aws --endpoint-url=http://localhost:4566 lambda list-functions --region eu-west-1
aws --endpoint-url=http://localhost:4566 lambda list-event-source-mappings --region eu-west-1
```

Browse LocalStack DynamoDB tables with `dynamodb-admin`:

```bash
npm install -g dynamodb-admin

AWS_REGION=eu-west-1 dynamodb-admin --dynamo-endpoint=http://localhost:4566
```

Then open the URL printed by `dynamodb-admin` in your browser.

### Ports

| Service | Host port | Container port |
|---------|-----------|----------------|
| Backend | 3555 | 3555 |
| PostgreSQL | 5433 | 5432 |

### Manual Docker build

```bash
docker build -t locker-backend:latest .

docker run -p 3555:3555 \
  -e DATABASE_URL="postgresql://user:pass@host:5433/locker" \
  -e JWT_ACCESS_SECRET="your-32-char-secret" \
  -e JWT_REFRESH_SECRET="your-32-char-secret" \
  locker-backend:latest
```

---

## 🗄️ Database Migrations

```bash
# Dev — create and apply migration
npx prisma migrate dev --name <migration_name>

# Production — apply existing migrations
npx prisma migrate deploy

# Reset (dev only!)
npx prisma migrate reset

# Regenerate Prisma client after schema changes
npx prisma generate

# GUI browser
npx prisma studio
```

If a schema change requires an index or manual SQL, add it through a Prisma migration instead of applying ad hoc SQL from the README.

Schema: `prisma/schema.prisma`
Migrations: `prisma/migrations/`
Generated client: `@prisma/client`

---

## 🧪 Testing

Current status:

- `npm test` is not implemented yet and exits with an error placeholder
- Jest and Supertest are installed, but the test script still needs to be wired
- Treat this backend as requiring manual verification until the test command is finalized

Useful verification commands right now:

```bash
npm run lint
npm run build
```

---

## 📚 API Documentation

### Swagger UI

Available in development at: **http://localhost:3555/docs**

### Base URL

```
http://localhost:3555/api/v1
```

### Endpoints

#### System
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/health` | Service health check | — |

#### Authentication
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/api/v1/auth/signup` | Register new user | — |
| `POST` | `/api/v1/auth/login` | Login | — |
| `POST` | `/api/v1/auth/google` | Login via Google ID token | — |
| `POST` | `/api/v1/auth/refresh` | Refresh access token | cookie |
| `POST` | `/api/v1/auth/logout` | Logout | Bearer |
| `GET` | `/api/v1/auth/me` | Current user profile | Bearer |

#### Users (coming soon)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/v1/users/:id` | Get user by ID | Bearer |
| `PATCH` | `/api/v1/users/:id` | Update profile | Bearer |
| `DELETE` | `/api/v1/users/:id` | Delete account | Bearer |

#### Lockers (in progress)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/v1/lockers/boxes` | Public locker list from cache | — |
| `GET` | `/api/v1/lockers/stations` | Public station list from cache | — |
| `GET` | `/api/v1/lockers/boxes/:id` | User locker details from cache | Bearer User |
| `GET` | `/api/v1/lockers/stations/:id` | User station details from cache | Bearer User |
| `GET` | `/api/v1/lockers/admin/boxes` | Staff locker list from backend projection | Bearer Operator/Admin |
| `GET` | `/api/v1/lockers/admin/boxes/:id` | Staff locker details from backend projection | Bearer Operator/Admin |
| `POST` | `/api/v1/lockers/admin/boxes` | Create locker box | Bearer Operator/Admin |
| `PATCH` | `/api/v1/lockers/admin/boxes/:id/status` | Change locker status | Bearer Operator/Admin |
| `POST` | `/api/v1/lockers/admin/boxes/:id/resync-cache` | Immediate locker cache refresh in DynamoDB | Bearer Admin |
| `PATCH` | `/api/v1/lockers/oper/boxes/:id/delete` | Delete locker box | Bearer Operator |
| `GET` | `/api/v1/lockers/admin/stations` | Staff station list from backend projection | Bearer Operator/Admin |
| `GET` | `/api/v1/lockers/admin/stations/:id` | Staff station details from backend projection | Bearer Operator/Admin |
| `POST` | `/api/v1/lockers/admin/stations` | Create station | Bearer Operator/Admin |
| `PATCH` | `/api/v1/lockers/admin/stations/:id/status` | Change station status | Bearer Operator/Admin |
| `POST` | `/api/v1/lockers/admin/stations/:id/resync-cache` | Immediate station cache refresh in Redis | Bearer Admin |
| `POST` | `/api/v1/lockers/admin/cache/reconcile` | Admin reconcile endpoint for unscheduled direct cache refresh | Bearer Admin |
| `PATCH` | `/api/v1/lockers/oper/stations/:id/delete` | Delete station | Bearer Operator |

#### Bookings (coming soon)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/v1/bookings` | User's bookings | Bearer |
| `POST` | `/api/v1/bookings` | Create booking | Bearer |
| `PATCH` | `/api/v1/bookings/:id` | Update booking | Bearer |
| `DELETE` | `/api/v1/bookings/:id` | Cancel booking | Bearer |

#### Audit (Admin only, coming soon)
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/v1/audit-logs` | View audit logs | Admin |

---

## 🔑 Authentication Flow

```
1. LOGIN / REGISTER
   POST /api/v1/auth/login or /api/v1/auth/signup
   ← accessToken in JSON body
   ← refreshToken in httpOnly cookie (browser handles automatically)

2. AUTHENTICATED REQUEST
   GET /api/v1/auth/me
   → Authorization: Bearer <accessToken>

3. TOKEN EXPIRED (401)
   POST /api/v1/auth/refresh
   ← new accessToken in JSON body
   ← new refreshToken in httpOnly cookie (refresh token rotation)
   old refresh token is invalidated

4. LOGOUT / REVOKE
   → current refresh session is revoked
   → new login revokes all older active refresh sessions for the same user
```

### Token payload

```typescript
interface TokenPayload {
  userId: string;       // User UUID
  role: Role;           // USER | OPERATOR | ADMIN
  sessionId: string;    // Active refresh-session id
}
```

### Token TTL

| Token | TTL | Storage |
|-------|-----|---------|
| `accessToken` | 15 minutes | JSON response body; client storage is frontend-specific |
| `refreshToken` | 7 days | httpOnly cookie |

### curl examples

```bash
# Register
curl -X POST http://localhost:3555/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"SecurePass123!"}'

# Login
curl -X POST http://localhost:3555/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'

# Protected request
curl http://localhost:3555/api/v1/auth/me \
  -H "Authorization: Bearer <accessToken>"

# Refresh (cookie sent automatically)
curl -X POST http://localhost:3555/api/v1/auth/refresh \
  --cookie "refreshToken=<token>"

# Logout
curl -X POST http://localhost:3555/api/v1/auth/logout \
  -H "Authorization: Bearer <accessToken>"
```

---

## 🔒 Security

### Password policy

- Minimum 12 characters
- Must include: uppercase (A-Z), lowercase (a-z), digit (0-9), special character (`!@#$%^&*`)

### Token security

- **Access token**: short-lived (15m), transmitted via `Authorization` header only
- **Refresh token**: long-lived (7d), stored in an `httpOnly` cookie — inaccessible to JavaScript
- **Cookie flags**: in production the cookie is `Secure` + `SameSite=None`; in local development it is `SameSite=Lax` and not `Secure`
- **Token rotation**: every `/refresh` issues a new refresh token and revokes the old refresh session
- **Single active login policy**: every new login revokes all previously active refresh sessions for the same user

### HTTP security headers (Helmet)

- `Content-Security-Policy`
- `Strict-Transport-Security` (HSTS, 1 year + preload)
- `X-Frame-Options`
- `X-Content-Type-Options`

---

## 🚦 Rate Limiting

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| `POST /api/v1/auth/signup` | 5 req | 1 hour | IP |
| `POST /api/v1/auth/login` | 5 req | 15 min | email + IP |
| `POST /api/v1/auth/refresh` | 100 req | 1 hour | IP (failed only) |
| All other endpoints | 200 req | 1 hour | IP |

Rate limit response:
```json
{
  "status": "error",
  "message": "Too many requests from this IP, please try again in an hour!"
}
```

---

## 📋 Audit Logging

All authentication events are written to the `AuditLog` table in PostgreSQL.

| Action | Trigger |
|--------|---------|
| `USER_REGISTER` | Successful signup |
| `USER_LOGIN` | Successful login |
| `USER_LOGIN_FAILED` | Wrong password or unknown email |
| `USER_LOGOUT` | Logout |
| `TOKEN_REFRESH` | Successful token refresh |
| `TOKEN_REVOKED` | Token version mismatch detected |

Each log entry includes: `actorId`, `action`, `entityType`, `entityId`, `ipAddress`, `userAgent`, `correlationId`, `createdAt`.

---

## 🏥 Health Check

```bash
curl http://localhost:3555/health
```

Response `200 OK`:
```json
{
  "status": "ok",
  "time": "2026-03-21T14:18:31.141Z",
  "source": "mock",
  "uptime": 142,
  "services": {
    "database": { "status": "ok", "latencyMs": 4 }
  }
}
```

Response `503 Service Unavailable` (degraded):
```json
{
  "status": "degraded",
  "time": "2026-03-21T14:18:31.141Z",
  "source": "mock-fallback",
  "services": {
    "database": { "status": "error", "error": "Database unreachable" }
  }
}
```

If `USE_LAMBDA_HEALTH=true` and the Lambda request fails or times out, the backend now falls back to the local DB check and returns `source: "mock-fallback"`.

## 🗃️ Cache Behaviour

For the full role matrix and cache flow description, see [catalog-cache-and-roles.md](./catalog-cache-and-roles.md).

Public station endpoints read from Redis by default. Public locker endpoints read from DynamoDB only.

If Redis is unavailable, the backend falls back to RDS projections for:

- `GET /api/v1/lockers/stations`
- `GET /api/v1/lockers/stations/:id`

Admin cache reconciliation endpoint:

```bash
curl -X POST http://localhost:3555/api/v1/lockers/admin/cache/reconcile \
  -H "Authorization: Bearer <adminAccessToken>"
```

Behaviour:

- endpoint is kept for unscheduled cache reconcile / refresh operations
- stations: compare RDS projections with Redis and upsert/delete cache records directly
- lockers: compare RDS metadata with DynamoDB and upsert/delete cache records directly
- if Redis cannot be read, station reconcile switches to `rds-fallback-full-resync`
- if DynamoDB cannot be read, locker reconcile switches to `rds-fallback-full-resync`
- station cache freshness depends on the station projection version. Locker create/status/delete operations bump `LockerStation.version`, so `cache/reconcile` can detect stale station cache entries even when only the station's locker set changed
- locker create/status/delete update locker cache in DynamoDB directly
- station create stays deferred and does not rewrite Redis directly
- station status/delete update dependent locker cache in DynamoDB directly, but keep Redis station cache deferred
- `INACTIVE` stations are not deleted unless they are also `isDeleted = true`
- After locker mutations, stale station cache symptoms usually look like:
  - `GET /api/v1/lockers/stations` returns `_count.lockers: 0`
  - `GET /api/v1/lockers/stations/:id` returns `lockers: []`
  - `GET /api/v1/lockers/boxes` still returns locker rows from DynamoDB
- Running `POST /api/v1/lockers/admin/cache/reconcile` rewrites drifted cache records immediately.

## 🏥 Health Check Async

### Data Models:

```ts 
type Operation = {
    operationId: string,
    timestamp: string,
    status: OperationStatus,
}
enum OperationStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    SUCCESS = "SUCCESS",
    FAILED = "FAILED",
}
```
### Endpoints:

#### POST /operations/health

- Request Body: not required

Response `200 OK`:
```json
{
    "success": true,
    "data": {
        "operationId": "305fa517-25a4-41ca-b0c9-f41c331a9a8b",
        "status": "PENDING"
    }
}
```

Response `500 Internal Server Error`:
```json
{
  "status": "error",
  "message": "Failed to create operation"
}
```

#### GET /operations/:id

Response `200 OK`:
```json
{
    "success": true,
    "data": {
        "operationId": "305fa517-25a4-41ca-b0c9-f41c331a9a8b",
        "status":  "PROCESSING",
        "timestamp": "2026-03-29T18:24:40.076Z"
    }
}
```

Response `404 Not Found`:
```json
{
    "status": "error",
    "message": "Operation not found"
}
```

Response `500 Internal Server Error`:
```json
{
  "status": "error",
  "message": "Failed to getInfo operation"
}
```

### Two modes

| `USE_LAMBDA_HEALTH` | Behaviour |
|---------------------|-----------|
| `false` (default) | Node.js queries PostgreSQL directly |
| `true` + valid `LAMBDA_HEALTH_URL` | Calls AWS Lambda first, then falls back to local DB health check on timeout, transport error, or non-`ok` Lambda status |

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                          # Entry point, graceful shutdown
│   ├── server.ts                       # Express setup, middleware, routes
│   ├── config/
│   │   └── env.ts                      # Zod environment validation
│   ├── controllers/
│   │   ├── authController.ts           # Auth route handlers
│   │   ├── healthController.ts         # Health route handler
│   │   ├── lockerBoxController.ts      # Locker box handlers
│   │   ├── lockerStationController.ts  # Locker station handlers
│   │   └── operationsController.ts     # Async operation handlers
│   ├── services/
│   │   ├── AuthServiceImplPostgres.ts  # Auth business logic
│   │   ├── CacheSyncService.ts         # Direct cache reconcile for Redis + DynamoDB
│   │   ├── HealthService.ts            # Health check (mock + lambda)
│   │   ├── LockerBoxServiceImplPostgress.ts # Locker CRUD + locker cache reads
│   │   ├── LockerStationServiceImplPostgress.ts # Station CRUD + station cache reads
│   │   ├── OperationService.ts         # Async operation status flow
│   │   ├── dynamoService.ts            # DynamoDB access
│   │   ├── prismaService.ts            # Prisma client wrapper
│   │   ├── sqsService.ts               # SQS dispatch
│   │   └── dto/
│   │       └── applDto.ts              # SignupDto, LoginDto
│   ├── routes/
│   │   ├── authRoutes.ts               # /api/v1/auth/*
│   │   ├── healthRoutes.ts             # /health
│   │   ├── lockersRoutes.ts            # /api/v1/lockers/*
│   │   └── operationsRoutes.ts         # /operations/*
│   ├── middleware/
│   │   ├── authMiddleware.ts           # JWT protect middleware
│   │   └── validateRequest.ts          # Zod request validation
│   ├── errorHandler/
│   │   ├── errorHandler.ts             # Global Express error handler
│   │   └── HttpError.ts                # Custom HTTP error class
│   ├── utils/
│   │   ├── audit.ts                    # Audit log writer
│   │   ├── awsClient.ts                # AWS SDK clients
│   │   ├── awsErrors.ts                # AWS/Dynamo auth error helpers
│   │   ├── jwt.ts                      # Token sign, verify, cookie helpers
│   │   └── sqsClient.ts                # Shared SQS client
│   ├── validation/
│   │   └── authSchemas.ts              # Zod schemas for auth endpoints
│   ├── Logger/
│   │   └── winston.ts                  # Winston logger configuration
│   ├── lib/
│   │   └── prisma.ts                   # Prisma library helpers
│   └── types/
│       └── express.d.ts                # Express Request type extensions
├── prisma/
│   ├── schema.prisma                   # DB schema
│   └── migrations/                     # Migration history
├── docs/
│   └── openapi.json                    # OpenAPI 3.0 spec
├── .env.example                        # Environment template
├── .env                                # Local env (git ignored)
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```
