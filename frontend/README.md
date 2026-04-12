# Smart Locker Network System — Frontend

> 📌 This document describes frontend architecture, API integration, and system behavior.

## 📋 Table of Contents
- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Environment Configuration](#-environment-configuration)
- [Architecture Principles](#-architecture-principles)
- [Providers Architecture](#-providers-architecture)
- [Project Structure](#-project-structure)
- [API Layer](#-api-layer)
- [Authentication](#-authentication)
- [API Integration](#-api-integration)
- [Sync Health Check](#-sync-health-check)
- [Async Health Check](#-async-health-check)
- [User Features](#-user-features)
- [Operator Features](#-operator-features)
- [Administrator Features](#-administrator-features)
- [Error Handling](#️-error-handling)
- [Health Check](#-health-check)
- [Logging](#-logging)
- [Security](#-security)
- [Notes](#-notes)

---

## 📌 Overview

Frontend application for the **Smart Locker Network System** — a distributed system of automated lockers.

The system supports three roles:

- **User** — booking lockers and managing active rentals  
- **Operator** — managing locker stations and box states  
- **Administrator** — analytics, audit logs, user management  

---

## 🛠 Tech Stack

- React  
- TypeScript  
- Vite  
- React Router  
- Context API (AuthProvider)  
- Custom HTTP client  
- CSS  

---

## ⚡ Quick Start

```bash
npm install
npm run dev
```

App runs at: `http://localhost:5173`

App runs in AWS Amplify at: `https://main.d3vb1066jloxjy.amplifyapp.com/`

## 🌍 Environment Configuration
**Environment setup** — create `.env` in root:

```env
BASE_API_URL = "http://localhost:3555/api/v1";
```

---

## 🧱 Architecture Principles

### Core Principles

- **RBAC** — Role-Based Access Control (User / Operator / Admin)
- **Separation of Concerns** — API / App / Config layers are strictly isolated
- **Centralized API layer** — all requests go through a single HTTP client
- **Context-based global state** — auth state managed via React Context
- **Async-first** — all device interactions are asynchronous, backend-driven

### 🧠 Providers Architecture

Located in `src/app/providers/`:

| Provider | Responsibility |
|---|---|
| `AuthProvider` | Authentication state and session lifecycle |
| `AuthContext` | React context definition |
| `useAuth` | Hook for consuming auth data |
| `QueryProvider` | Server state management |
| `ThemeProvider` | UI theme configuration |

Store aggregation: `src/app/providers/store/index.ts`

---

## 📁 Project Structure

```
frontend/
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  ├─ routes.tsx
│  │  ├─ Navbar.tsx
│  │  ├─ navlink.css
│  │  ├─ utils/
|  |  |  ├─ paths.ts
│  │  ├─ providers/
│  │  │  ├─ AuthProvider.tsx
|  |  |  ├─ AuthProviderTest.tsx
│  │  │  ├─ QueryProvider.tsx
|  |  |  ├─ useAuth.ts
|  |  |  ├─ authContext.ts
│  │  │  └─ ThemeProvider.tsx
│  │  └─ store/              
│  │     ├─ index.ts
│  │     └─ useAuth.ts
│  ├─ config/
│  │  ├─ env.ts              # BASE_API_URL, WS_URL и т.п.
│  │  └─ roles.ts            # USER / OPERATOR / ADMIN
│  ├─ api/
│  │  ├─ httpClient.ts
│  │  ├─ httpClient2.ts
│  │  ├─ httpClientTest.ts
│  │  ├─ adminApi.ts
│  │  ├─ usersApi.ts
│  │  ├─ authApi.ts
│  │  ├─ lockersApi.ts
│  │  └─ errorsApi.ts
│  ├─ modules/
│  │  ├─ auth/
│  │  │  ├─ pages/
│  │  │  │  ├─ LoginPage.tsx
│  │  │  │  ├─ LoginPage.tsx
│  │  │  │  └─ RegisterPage.tsx
│  │  ├─ user/
│  │  │  ├─ pages/
│  │  │  │  ├─ UserDashboardPage.tsx
│  │  │  │  └─ LockerBookingPage.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ LockerList.tsx
│  │  │  │  └─ LockerCard.tsx
│  │  │  └─ hooks/
│  │  │     └─ useLockers.ts
│  │  ├─ operator/
│  │  │  ├─ pages/
│  │  │  │  └─ OperatorDashboardPage.tsx
│  │  │  ├─ components/
│  │  │  │  └─ LockerControlTable.tsx
│  │  │  └─ hooks/
│  │  │     └─ useOperatorLockers.ts
│  │  ├─ admin/
│  │  │  ├─ pages/
│  │  │  │  ├─ AdminDashboardPage.tsx
│  │  │  │  ├─ UsersPage.tsx
│  │  │  │  └─ ErrorsPage.tsx
│  │  │  ├─ components/
│  │  │  │  ├─ ErrorList.tsx
│  │  │  │  └─ UserTable.tsx
│  │  │  └─ hooks/
│  │  │  │  ├─ useUsers.ts
│  │  │  │  ├─ useAdminDashboard.ts
│  │  │     └─ useErrors.ts
│  │  ├─ shared/
│  │  │  ├─ components/
│  │  │  │  ├─ Header.tsx
│  │  │  │  ├─ ProtectedRoute.tsx
│  │  │  │  └─ RoleGuard.tsx
│  │  │  ├─ layout/
│  │  │  │  ├─ Layout.tsx
│  │  │  │  ├─ menu.ts
│  │  │  │  └─ Sidebar.tsx
│  │  │  ├─ pages/
│  │  │  │  ├─ ForbiddenPage.tsx
│  │  │  │  ├─ HomePage.tsx
│  │  │  │  ├─ HomePage2.tsx
│  │  │  │  ├─ HomePage.tsx
│  │  │  │  └─ RedirectByRole.tsx
│  │  │  └─ types/
│  │  │     ├─ locker.ts
│  │  │     ├─ user.ts
│  │  │     └─ admin.ts
│  ├─ components/
│  │  ├─ Info.tsx
│  │  ├─ Location.tsx
│  │  └─ Price.tsx
│  ├─ index.css
│  ├─ App.css
│  └─ main.tsx
├─ .env
├─ package.json
├─ package-lock.json
├─ tsconfig.json
├─ tsconfig.app.json
├─ tsconfig.node.json
├─ vite.config.ts
├─ index.html
└─ README.md
```

---


## 🧭 Navigation Flow
```ts
Start Page
↓
Login / Register
↓
Role-based redirect
↓
Dashboards
```
---

## 🌐 API Layer

Located in: `src/api/`

### Structure
- authApi.ts
- lockersApi.ts
- usersApi.ts
adminApi.ts
- errorsApi.ts
-HTTP Clients
- httpClient.ts — main
- httpClient2.ts — experimental
- httpClientTest.ts — testing
---
## 🔐 Authentication

### Endpoints

```
POST /api/v1/auth/signup
POST /api/v1/auth/login
GET  /api/v1/auth/me
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### Token Strategy

| Token | Storage | Lifetime |
|---|---|---|
| `accessToken` | In-memory | 15 minutes |
| `refreshToken` | httpOnly cookie | 7 days |


### Security Measures

- JWT authentication
- httpOnly cookies (XSS protection)
- Token rotation on refresh
- Role-based route guards

---

## 📦 API Integration

**Base URL:** `http://localhost:3555/api/v1`

**HTTP Client Example:**

```ts
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});
```
### 🔹 Sync Health Check

- **Endpoint:**
```ts
  GET /health
```

- **Behavior:**
    - Executes request synchronously
    - Returns final result in a single response
    - Used via `handleHealthCheck`

- **Flow:**
```
  fetch(HEALTH_URL)
  await response.json()
  Normalize status:
    ok    → UP
    error → DOWN
```

- **Response (mapped on frontend):**
```ts
  {
    "status": "UP | DOWN",
    "uptime": number,
    "services": {
      "lambda": { "status": "ok" },
      "database": {
        "status": "ok",
        "latencyMs": number
      }
    },
    "message": "string (optional)"
  }
```

---

### 🔹 Async Health Check

- **Endpoints:**
```ts
  POST /operations/health      // initiate
  GET  /operations/:id         // poll status
```

- **Behavior:**
    - Initiates async health check, returns `operationId` and initial `status: PENDING`
    - Polls every **5 seconds**, up to **12 attempts** (60s max)
    - Polling stops when status is `SUCCESS` or `FAILED`
    - Used via `handleAsyncHealthCheck`

- **Status flow:**
```
  PENDING → PROCESSING → SUCCESS
                       → FAILED
```

- **Response shape (both POST and GET):**
```ts
  {
    "success": true,
    "data": {
      "operationId": "uuid",
      "status": "PENDING | PROCESSING | SUCCESS | FAILED",
      "timestamp": "ISO string",
      "errorMessage": "string (optional)"
    }
  }
```

> **Note:** BE returns field `status` (not `operationStatus`). Mapped to `operationStatus` internally on the frontend.

### Lockers

```
GET    /api/v1/lockers/stations
GET    /api/v1/lockers/stations/:id
POST   /api/v1/lockers/stations
GET    /api/v1/lockers/boxes
GET    /api/v1/lockers/boxes/:id
POST   /api/v1/lockers/boxes
```

### Bookings

```
GET    /api/v1/bookings
POST   /api/v1/bookings
PATCH  /api/v1/bookings/:id
DELETE /api/v1/bookings/:id
```

### Users

```
GET    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id
```

### Admin

```
GET    /api/v1/audit-logs
```

### System

```
GET    /health
```

---

## Features by Role

### 👤 User Features
- View available locker boxes
- Book a locker
- End an active booking
- View active sessions (rent duration: 24h, timer in UI)

### 🧑‍🔧 Operator Features
- View all stations and boxes
- Manage locker states
- Monitor system status

### 🧑‍💼 Administrator Features
- View audit logs
- Manage users
- System statistics *(planned)*

---

## ⚠️ Error Handling

| Error | Cause | Frontend Behavior |
|---|---|---|
| `401 Unauthorized` | Token expired | Trigger refresh flow |
| `403 Forbidden` | Insufficient role | Show access denied UI |
| `400 Bad Request` | Validation failed | Show validation error |
| `404 Not Found (API)` | Resource missing | Resource not found message |
| `404 Not Found (UI)` | Unknown route | Fallback page |
| `429 Too Many Requests` | Rate limit hit | Show retry message |
| `5xx Server Error` | Backend failure | Fallback UI / system error |
| Network timeout | No response | Show network error |
| Offline | No connection | Notify user |

---

## 🏥 Health Check

```ts
await fetch("http://localhost:3555/health");
```

Used to verify backend availability and system status before critical operations.

---

## 🪵 Logging

```ts
export const logger = {
  info: console.log,
  error: console.error,
};
```
---
## 🔐 Security
- JWT
- httpOnly cookies
- token rotation
- RBAC
---
## 📌 Notes
- API versioned (/api/v1)
- Frontend follows backend contract
- Async operations depend on backend
