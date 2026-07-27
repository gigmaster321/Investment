---
name: Manual Profit System
description: Design decisions for the Admin Manual Profit Management feature — earnings table schema, DB constraint strategy, API route, frontend modal.
---

# Manual Profit System

## Earnings table — partial unique index strategy

**Rule:** The `earnings` table uses a **partial unique index** (not a full unique constraint) to allow auto and manual credits to coexist.

```sql
CREATE UNIQUE INDEX earnings_investment_date_uniq
  ON earnings (investment_id, credit_date) WHERE source = 'auto';
```

**Why:** The auto earnings cron credits once per `(investment_id, credit_date)` and relies on `ON CONFLICT DO NOTHING` for idempotency. Admins can credit manually unlimited times per day per investment. A full unique constraint on `(investment_id, credit_date, source)` would block the second manual credit on the same day.

**How to apply:** This index is NOT expressible in Drizzle ORM's `unique()` helper (which can't express partial indexes). It was applied via direct `psql` SQL. The Drizzle schema file documents this with a comment but has an empty `() => []` table callback. Do NOT add a Drizzle `unique()` call here — it would recreate a full constraint that breaks admin use.

## Source column

`earnings.source` is `text NOT NULL DEFAULT 'auto'`. Values: `'auto'` (cron) | `'manual'` (admin). The cron explicitly passes `source: 'auto'` in its insert.

## API routes

- `GET  /api/admin/manual-profit/user/:userId/investments` — active investments for profit modal
- `POST /api/admin/manual-profit/credit` — atomic: updates balance, inserts earnings (source=manual), inserts transaction, updates investment.total_profit, sends notification
- `GET  /api/admin/manual-profit/history` — all manual credits, joined with user + investment

Route file: `artifacts/api-server/src/routes/admin-manual-profit.ts`
Registered in: `artifacts/api-server/src/routes/index.ts`

## Frontend

`ManualProfitModal` added to `artifacts/quantum-investments/src/pages/admin/Users.tsx`. Triggered via `kind: 'profit'` in `ModalMode`. "Update Profit" button is in the ViewModal Account Management section. On success, optimistically updates user balance in state.
