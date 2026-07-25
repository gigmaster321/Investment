---
name: Withdrawal system
description: What exists, where each piece lives, and key constraints for the withdrawal feature.
---

## What exists (as of implementation)

- **DB table**: `withdrawal_requests` — schema at `lib/db/src/schema/withdrawal_requests.ts`; migrated via `0001_add_withdrawal_requests.sql`.
- **API routes** (`artifacts/api-server/src/routes/withdrawals.ts`):
  - `POST /api/withdrawals` — requireAuth; validates amount ≤ balance; inserts row; does NOT deduct balance on submit (deduction happens on admin approve).
  - `GET /api/withdrawals` — requireAuth; user gets own rows; admin gets all rows with joined user info.
  - `PATCH /api/withdrawals/:id/approve` — requireAdmin; deducts `GREATEST(0, balance - approved_amount)`, increments `total_withdrawal`, writes a `Withdrawal` transaction record.
  - `PATCH /api/withdrawals/:id/reject` — requireAdmin; status-only update, balance unchanged.
- **Frontend API client**: `artifacts/quantum-investments/src/lib/withdrawal-api.ts` — `withdrawalApi.{create, list, approve, reject}` + helpers `formatWithdrawalDate`, `formatWithdrawalDateAdmin`, `formatMoney`.
- **Dashboard page**: `artifacts/quantum-investments/src/pages/dashboard/Withdrawals.tsx` — reads balance from `useAuth().user.balance`, submits via API, loads history on mount, calls `refreshUser()` after submit.
- **Admin page**: `artifacts/quantum-investments/src/pages/admin/Withdrawals.tsx` — loads all withdrawals via API on mount; approve/reject calls API and updates local state from the response.

## Key constraints

**Why:** Balance deduction happens only on admin approval, not on submission. This is intentional — a pending request should not lock funds so they are inaccessible.

**How to apply:** If a feature needs to "reserve" balance on submit, that's a new requirement; the current contract is approve = deduct.

**Date filter compatibility:** Admin `date` field is stored as "YYYY-MM-DD HH:mm" via `formatWithdrawalDateAdmin()` so the HTML date input filter (`startsWith("YYYY-MM-DD")`) works correctly.

**ID shape:** DB id is a plain integer. Frontend displays it as `WDL-{id}`. The API client stores `rawId: number` alongside `id: string` in the admin component for use in API calls.

## Known debt (not part of this feature)
- Admin hardcoded password `Admin@123` in `admin-auth.ts`
- Plans stored in-memory `Map` in `plans.ts`
- Admin notes in-memory `Map` in `admin-users.ts`
- Fake/random live notifications
- `SESSION_SECRET` has a plaintext fallback
