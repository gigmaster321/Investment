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

## OTP / Email verification flow

- `email_otps` table: `id, user_id (FK→users cascade), code, expires_at, used, created_at`
- OTP TTL: 10 minutes; Resend cooldown: 60 seconds
- `POST /api/auth/register` → creates user (email_verified=false), generates OTP, sends email, returns `{ requiresVerification: true }` — NO session
- `POST /api/auth/verify-email` → verifies code, sets email_verified=true, returns `{ verified: true }` — NO session (user must then log in)
- `POST /api/auth/resend-otp` → enforces 60s cooldown, generates new OTP, sends email
- `POST /api/auth/login` → returns `EMAIL_NOT_VERIFIED` (403) if email not verified; Login.tsx auto-redirects to /verify-email on this error
- `ProtectedRoute` also checks `user.email_verified`; redirects to /verify-email if false
- Dev mode: when RESEND_API_KEY is not set, OTP is logged to console AND returned in API response as `devOtp`; Register.tsx forwards it to VerifyEmail via query param
- Email service: `artifacts/api-server/src/services/email.ts` — tries Resend (RESEND_API_KEY) first, falls back to console log

## WordPress readiness

`auth-api.ts` uses a single `API_BASE` constant. Swap to a WP REST endpoint to redirect all auth calls without touching component code.
