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
- [API Documentation](#-api-documentation)
- [Authentication Flow](#-authentication-flow)
- [Security](#-security)
- [Rate Limiting](#-rate-limiting)
- [Audit Logging](#-audit-logging)
- [Health Check](#-health-check)
- [Project Structure](#-project-structure)

---

## ⚡ Quick Start

```bash
# Clone repository
git clone https://github.com/locker-network-java-30-final-project/locker-network-repository
cd locker-network-repository/backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env — replace JWT secrets with strong random values (see Environment Setup)

# Generate Prisma client
npx prisma generate  

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Server: `http://localhost:3555`
Swagger docs: `http://localhost:3555/docs` (development only)

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

### Full `.env` reference

```env
# Server
NODE_ENV=development                    # development | production | test
PORT=3555
SERVER_URL=http://localhost:3555
CLOUDFRONT_URL=https://your-cloudfront-domain

# Database
# Note: 5433 = host port mapped to Docker container's 5432
DATABASE_URL="postgresql://root:root@localhost:5433/locker_db"
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

# Logging
LOG_LEVEL=info                          # debug | info | warn | error

# Lambda health check
USE_LAMBDA_HEALTH=true                  # true = call AWS Lambda first, fallback to DB check on error
LAMBDA_HEALTH_URL=                      # Required when USE_LAMBDA_HEALTH=true

# Async operations
DYNAMO_TABLE_NAME=operations
SQS_URL=
```

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

Expected output:
```
[INFO] Starting server initialization...
[INFO] PostgreSQL connected successfully
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
# Start PostgreSQL + Backend
docker-compose up -d

# Logs
docker-compose logs -f backend

# Stop
docker-compose down

# Reset volumes
docker-compose down -v
```

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

Schema: `prisma/schema.prisma`
Migrations: `prisma/migrations/`
Generated client: `@prisma/client`

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
| `GET` | `/api/v1/lockers/` | List locker boxes | not enforced yet |
| `POST` | `/api/v1/lockers/boxes` | Create locker box | not enforced yet |
| `GET` | `/api/v1/lockers/stations` | List stations | not enforced yet |
| `POST` | `/api/v1/lockers/stations` | Create station | not enforced yet |

`Lockers` endpoints are still under active development. Auth/role checks and additional read endpoints are planned, but are not wired in the current router yet.

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
   POST /auth/login or /auth/signup
   ← accessToken in JSON body (store in memory, NOT localStorage)
   ← refreshToken in httpOnly cookie (browser handles automatically)

2. AUTHENTICATED REQUEST
   GET /api/v1/auth/me
   → Authorization: Bearer <accessToken>

3. TOKEN EXPIRED (401)
   POST /auth/refresh
   ← new accessToken in JSON body
   ← new refreshToken in httpOnly cookie (refresh token rotation)
   old refresh token is invalidated

4. LOGOUT / REVOKE
   → refresh token removed from DB
   → tokenVersion incremented
   → all previously issued tokens become invalid for refresh flow
```

### Token payload

```typescript
interface TokenPayload {
  userId: string;       // User UUID
  role: Role;           // USER | OPERATOR | ADMIN
  tokenVersion: number; // Revocation version
}
```

### Token TTL

| Token | TTL | Storage |
|-------|-----|---------|
| `accessToken` | 15 minutes | JS memory (Zustand / React state) |
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
- **Token rotation**: every `/refresh` issues a new refresh token and invalidates the old one
- **Token revocation**: incrementing `tokenVersion` prevents further refresh and forces re-authentication after the current access token expires.

### HTTP security headers (Helmet)

- `Content-Security-Policy`
- `Strict-Transport-Security` (HSTS, 1 year + preload)
- `X-Frame-Options`
- `X-Content-Type-Options`

---

## 🚦 Rate Limiting

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| `POST /auth/signup` | 5 req | 1 hour | IP |
| `POST /auth/login` | 5 req | 15 min | email + IP |
| `POST /auth/refresh` | 100 req | 1 hour | IP (failed only) |
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
| `true` + valid `LAMBDA_HEALTH_URL` | Calls AWS Lambda first, then falls back to local DB health check on timeout/error |

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
│   │   ├── HealthService.ts            # Health check (mock + lambda)
│   │   ├── LockerBoxServiceImplPostgress.ts
│   │   ├── LockerStationServiceImplPostgress.ts
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
