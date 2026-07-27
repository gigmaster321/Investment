---
name: Notifications system
description: Real-time notifications table, API routes, and event hooks — replaces the old hardcoded demo data.
---

## What exists
- `lib/db/src/schema/notifications.ts` — Drizzle schema (`notificationsTable`)
- Migration added to `lib/db/src/migrate.mjs` (idempotent, run it to create the table)
- `artifacts/api-server/src/lib/notifications.ts` — `createNotification(userId, type, title, description)` helper (non-fatal, swallows errors)
- `artifacts/api-server/src/routes/notifications.ts` — `GET /api/notifications`, `PATCH /api/notifications/read-all`, `PATCH /api/notifications/:id/read`
- Registered in `artifacts/api-server/src/routes/index.ts`

## When notifications are created
| Event | Route/Service | Type |
|---|---|---|
| User registers | `routes/auth.ts` | System — "Welcome to Quantum Investments" |
| Deposit approved | `routes/deposits.ts` | Deposit — "Deposit Confirmed" |
| Deposit rejected | `routes/deposits.ts` | Deposit — "Deposit Rejected" |
| Withdrawal approved | `routes/withdrawals.ts` | Withdrawal — "Withdrawal Processed" |
| Withdrawal rejected | `routes/withdrawals.ts` | Withdrawal — "Withdrawal Rejected" |
| Daily profit credited | `services/earningsCron.ts` | Investment — "Profit Credited" (today only, not backfill) |

## Why today-only for cron
The cron back-fills uncredited days on startup. Creating a notification for every historical day would spam users. Only `dateStr === toDateStr(new Date())` triggers a notification insert.

## Frontend
`artifacts/quantum-investments/src/pages/dashboard/Notifications.tsx` — fetches from API, optimistic mark-read, loading/error/empty states. No hardcoded data.
