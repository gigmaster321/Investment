/**
 * Withdrawal API client.
 * Mirrors the pattern in deposit-api.ts — uses credentials: "include" for session cookies.
 */

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw Object.assign(
      new Error((data as any)?.message ?? `Request failed (${res.status})`),
      data,
    );
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WithdrawalRequest {
  id: number;
  user_id: number;
  /** Present when fetched by admin */
  user_full_name?: string | null;
  user_email?: string | null;
  user_username?: string | null;
  amount: string;
  method: string;
  crypto: string;
  wallet_address: string;
  status: "Pending" | "Approved" | "Rejected";
  approved_amount: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateWithdrawalInput {
  amount: number;
  method?: string;
  crypto: string;
  wallet_address: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const withdrawalApi = {
  /** Create a withdrawal request (user). */
  create: (input: CreateWithdrawalInput) =>
    request<WithdrawalRequest>("/withdrawals", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /** List withdrawal requests (user: own; admin: all). */
  list: () => request<WithdrawalRequest[]>("/withdrawals"),

  /** Admin: approve a withdrawal. */
  approve: (id: number, approved_amount?: number) =>
    request<WithdrawalRequest>(`/withdrawals/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify(approved_amount != null ? { approved_amount } : {}),
    }),

  /** Admin: reject a withdrawal. */
  reject: (id: number) =>
    request<WithdrawalRequest>(`/withdrawals/${id}/reject`, { method: "PATCH" }),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Format an ISO timestamp for user-facing display. */
export function formatWithdrawalDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Format an ISO timestamp as "YYYY-MM-DD HH:mm" (compatible with date filter startsWith). */
export function formatWithdrawalDateAdmin(iso: string): string {
  return new Date(iso).toISOString().replace("T", " ").slice(0, 16);
}

/** Format a numeric string as "$X,XXX.XX". */
export function formatMoney(value: string | number): string {
  const n = typeof value === "string" ? parseFloat(value) : value;
  return `$${(isNaN(n) ? 0 : n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
