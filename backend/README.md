# 🔐 Locker Network Backend

> Secure smart locker management system with JWT authentication, role-based access control, and real-time device monitoring.

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
- [Project Structure](#-project-structure)


---

## ⚡ Quick Start

```bash
# Clone repository
git clone <repo-url> && cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Server runs on `http://localhost:3555`  
Swagger docs: `http://localhost:3555/docs`

---

## 🛠 Tech Stack

| Component | Technology | Version |
|-----------|-----------|---------|
| **Runtime** | Node.js | 18+ |
| **Language** | TypeScript | 5.7+ |
| **Framework** | Express.js | 5.2+ |
| **ORM** | Prisma | 5.22+ |
| **Database** | PostgreSQL | 12+ |
| **Auth** | JWT (access + refresh) | RS256 |
| **Password Hash** | Argon2 | 0.44+ |
| **Logging** | Winston | 3.19+ |
| **Rate Limiting** | express-rate-limit | 8.3+ |
| **Validation** | Zod | 4.3+ |
| **Security** | Helmet | 8.1+ |
| **CORS** | cors | 2.8+ |

---

## 📦 Installation

### Prerequisites
- Node.js 18+ ([download](https://nodejs.org))
- npm or pnpm
- PostgreSQL 12+ ([install](https://www.postgresql.org/download))
- Docker & Docker Compose (optional)

### Step 1: Clone & Install

```bash
git clone https://github.com/locker-network-java-30-final-project/locker-network-repository
cd locker-network-repository/backend

# Using npm
npm install

# OR using pnpm (faster)
pnpm install
```

### Step 2: Verify Installation

```bash
npm --version  # Should be 8+
node --version # Should be 18+
tsc --version  # Should be 5.7+
```

---

## 🔐 Environment Setup

### Create `.env` file

```bash
cp .env.example .env
```

### Configuration Reference

```env
# Server
NODE_ENV=development                    # development | production | test
PORT=3555                               # API server port
SERVER_URL=http://localhost:3555        # Full server URL

# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/locker_db"

# PostgreSQL Docker (if using docker-compose)
POSTGRES_USER=root
POSTGRES_PASSWORD=root
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-key-min-32-chars  # Min 32 chars!
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_EXPIRES_IN=7d                       # Access token TTL
JWT_REFRESH_TOKEN_TTL=7                 # Refresh token TTL in days

# Frontend
FRONTEND_URL=http://localhost:5173      # CORS origin

# Logging
LOG_LEVEL=info                          # debug | info | warn | error
```

### ⚠️ Security Requirements

```env
# ✅ Use strong random secrets (min 32 characters)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_ACCESS_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z
JWT_REFRESH_SECRET=z0y1x2w3v4u5t6s7r8q9p0o1n2m3l4k5j6i7h8g7f6e5d4c3b2a1
```

---

## 🚀 Running Locally

### Development Mode

```bash
npm run dev
```

Features:
- Hot reload with `ts-node-dev`
- Full TypeScript source maps
- Winston logging to console

Output:
```
[INFO] Starting server initialization...
[INFO] PostgreSQL connected successfully
[INFO] Server listening on port 3555
```

### Production Build

```bash
# Build
npm run build

# Run compiled code
npm start
```

Generates optimized JavaScript in `dist/` directory.

### Check Health

```bash
# Basic health check
curl http://localhost:3555/health

# Get API docs
curl http://localhost:3555/docs

# Test auth endpoint
curl -X POST http://localhost:3555/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123!"}'
```

---

## 🐳 Docker Deployment

### Using Docker Compose

```bash
# Start services (PostgreSQL + Backend)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Reset (remove volumes)
docker-compose down -v
```

### Service Ports
- **Backend**: http://localhost:3555
- **PostgreSQL**: localhost:5433 (not exposed by default)

### Manual Docker Build

```bash
# Build image
docker build -t locker-backend:latest .

# Run container
docker run -p 3555:3555 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_ACCESS_SECRET="your-secret" \
  locker-backend:latest
```

---

## 🗄️ Database Migrations

### Run Migrations

```bash
# Create and run migrations (dev)
npx prisma migrate dev --name <migration_name>

# Deploy existing migrations (production)
npx prisma migrate deploy

# Reset database (dev only!)
npx prisma migrate reset
```

### Generate Prisma Client

```bash
# Auto-generate types from schema
npx prisma generate

# Open Prisma Studio (GUI)
npx prisma studio
```

### Schema Management

- **Schema file**: `prisma/schema.prisma`
- **Migrations**: `prisma/migrations/`
- **Generated client**: `src/prisma/`

---

## 📚 API Documentation

### Access Swagger UI

- **Development**: http://localhost:3555/docs

### API Base URL
```
http://localhost:3555/api/v1
```

### Available Endpoints

#### Authentication
- `POST /auth/signup` - Create new account
- `POST /auth/login` - Authenticate user
- `POST /auth/refresh` - Get new access token
- `POST /auth/logout` - Invalidate tokens
- `GET /auth/me` - Get current user profile

#### Users (Protected)
- `GET /users/:id` - Get user by ID
- `PATCH /users/:id` - Update user profile
- `DELETE /users/:id` - Delete account

#### Lockers (Protected)
- `GET /lockers/stations` - List all stations
- `GET /lockers/stations/:id` - Get station
- `GET /lockers/boxes` - List locker boxes
- `GET /lockers/boxes/:id` - Get box details
- `POST /lockers/stations` - Create station (Admin/Operator)
- `POST /lockers/boxes` - Create locker (Admin/Operator)

#### Bookings (Protected)
- `GET /bookings` - User's bookings
- `POST /bookings` - Create booking
- `PATCH /bookings/:id` - Update booking
- `DELETE /bookings/:id` - Cancel booking

#### Audit (Protected - Admin only)
- `GET /audit-logs` - View audit logs

---

## 🔑 Authentication Flow

### JWT Tokens

```
┌─────────────────────────────────────────────────────────────┐
│                      Authentication Flow                     │
└─────────────────────────────────────────────────────────────┘

1️⃣  USER REGISTRATION / LOGIN
   ├─ POST /auth/signup or /auth/login
   ├─ Server validates credentials
   ├─ Returns: accessToken (JWT, 7d TTL)
   └─ Sets: refreshToken (httpOnly cookie, 7d TTL)

2️⃣  ACCESS TOKEN USAGE
   ├─ Include in Authorization header
   │  Header: Authorization: Bearer <accessToken>
   ├─ Valid for all protected endpoints
   └─ Expires in 7 days

3️⃣  TOKEN EXPIRATION
   ├─ When accessToken expires (401 Unauthorized)
   ├─ Use refreshToken from cookie (automatic)
   └─ POST /auth/refresh → New accessToken

4️⃣  LOGOUT / TOKEN REVOCATION
   ├─ POST /auth/logout
   ├─ Invalidates both tokens
   ├─ Increments tokenVersion
   └─ New login required
```

### Token Payload

```typescript
interface TokenPayload {
  userId: string;      // User UUID
  jti?: string;         // JWT ID (unique per token)
  role: Role;         // USER | OPERATOR | ADMIN
  tokenVersion: number; // Increment on logout
}
```

### Example Authentication

```bash
# 1. Register
curl -X POST http://localhost:3555/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Response:
# {
#   "status": "success",
#   "accessToken": "eyJhbGciOiJIUzI1NiIs..."
# }

# 2. Use token for protected request
curl -X GET http://localhost:3555/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."

# 3. Refresh token (automatic)
curl -X POST http://localhost:3555/api/v1/auth/refresh \
  -H "Cookie: refreshToken=..." 

# 4. Logout
curl -X POST http://localhost:3555/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## 🔒 Security

### Password Policy

- **Minimum length**: 12 characters
- **Must include**:
    - Uppercase letter (A-Z)
    - Lowercase letter (a-z)
    - Number (0-9)
    - Special character (!@#$%^&*)

---

## 🚦 Rate Limiting

### Global Limits

```
Default: 200 requests/hour per IP
Headers: X-RateLimit-Limit, X-RateLimit-Remaining
```

### Per-Endpoint Limits

| Endpoint             | Limit | Window |
|----------------------|-------|--------|
| `POST /auth/signup`  | 5 | 1 hour |
| `POST /auth/login`   | 5 | 15 min (per email) |
| `POST /auth/refresh` | 100 | 1 hour (failed only) |
| Other endpoints      | 200 | 1 hour |

### Rate Limit Response

```json
{
  "status": "error",
  "message": "Too many requests from this IP, please try again in an hour!"
}
```

---

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Application entry point
│   ├── server.ts              # Express server setup
│   ├── config/
│   │   ├── env.ts            # Environment validation (Zod)
│   │   └── appConfig.ts       # App configuration
│   ├── controllers/
│   │   └── authController.ts # Route handlers
│   ├── services/
│   │   ├── AuthServiceImplPostgres.ts  # Business logic
│   │   ├── prismaService.ts   # DB service
│   │   └── dto/
│   │       └── applDto.ts     # Data Transfer Objects
│   ├── routes/
│   │   └── authRoutes.ts     # Route definitions
│   ├── middleware/
│   │   ├── authMiddleware.ts # JWT verification
│   │   └── validateRequest.ts # Input validation
│   ├── errorHandler/
│   │   ├── errorHandler.ts   # Global error handler
│   │   └── HttpError.ts      # Custom error class
│   ├── utils/
│   │   └── jwt.ts            # JWT utilities
│   ├── validation/
│   │   └── authSchemas.ts    # Zod schemas
│   ├── Logger/
│   │   └── winston.ts        # Logging configuration
│   ├── prisma/
│   │   └── index.js          # Generated Prisma client
│   └── types/
│       └── express.d.ts      # Express type extensions
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.ts              # Seed data (optional)
├── docs/
│   └── openapi.json         # OpenAPI 3.0 specification
├── .env.example             # Environment template
├── .env                     # Actual environment (git ignored)
├── .gitignore               # Git ignore rules
├── docker-compose.yml       # Docker services
├── Dockerfile               # Container image
├── package.json             # Dependencies
├── package-lock.json        # Lock file
├── tsconfig.json            # TypeScript config
└── README.md                # This file
```

---

