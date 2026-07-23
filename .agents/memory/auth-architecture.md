---
name: Auth Architecture
description: How authentication is structured across the backend and frontend.
---

## Backend

- **Session-based auth** using `express-session` (MemoryStore in dev; upgrade to pg store with DATABASE_URL)
- Cookie name: `qinvest.sid`
- Session holds: `userId`, `userRole`, `userEmail`
- Routes: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Auth service: `artifacts/api-server/src/services/auth.ts` — uses **dynamic imports** of `@workspace/db` so the server starts cleanly even without DATABASE_URL
- Middleware: `artifacts/api-server/src/middleware/requireAuth.ts` — `requireAuth` (401) and `requireAdmin` (403 "Unauthorized Access")
- Password hashing: `bcryptjs`, 12 salt rounds
- All auth endpoints return structured error codes: `EMAIL_EXISTS`, `USERNAME_EXISTS`, `INVALID_CREDENTIALS`, `ACCOUNT_INACTIVE`, `DB_UNAVAILABLE`

**Why dynamic import for DB:** `lib/db/src/index.ts` throws at module init if DATABASE_URL is not set. Dynamic import defers this to request time so the API server stays up without a database.

## Frontend

- **`AuthContext`** (`src/contexts/AuthContext.tsx`): session-based auth for regular users; calls `/api/auth/me` on mount to restore session
- **`AdminAuthContext`** (`src/contexts/AdminAuthContext.tsx`): wraps auth API, checks `role === 'admin'`; if a non-admin logs in, it calls logout and returns false
- **`ProtectedRoute`** (`src/components/ProtectedRoute.tsx`): wraps dashboard routes, redirects to `/login` if unauthenticated
- **`AdminGuard`** (`src/components/admin/AdminGuard.tsx`): checks both AuthContext (for role) and AdminAuthContext (for admin session); shows "Unauthorized Access" for authenticated non-admins, redirects to `/admin/login` for unauthenticated visitors
- **API client**: `src/lib/auth-api.ts` uses relative URL `/api/auth` — Replit proxy routes to API server

## Provider nesting order (App.tsx)

`AuthProvider` → `AdminAuthProvider` → rest of app

AdminGuard reads from both providers, so AuthProvider must be the outer wrapper.

**Why:** AdminGuard needs to distinguish "not authenticated at all" from "authenticated but wrong role".

## WordPress readiness

`auth-api.ts` uses a single `API_BASE` constant. Swap to a WP REST endpoint to redirect all auth calls without touching component code.
