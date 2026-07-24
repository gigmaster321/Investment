/**
 * Deposit & transaction API client.
 * Mirrors the pattern in auth-api.ts — uses credentials: "include" for session cookies.
 */

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data?.message ?? `Request failed (${res.status})`), data);
  return data as T;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DepositRequest {
  id: number;
  user_id: number;
  user_full_name?: string | null;
  user_email?: string | null;
  user_username?: string | null;
  plan_id: string | null;
  plan_name: string | null;
  amount: string;
  approved_amount: string | null;
  payment_method: string;
  transaction_id: string | null;
  screenshot_data: string | null;
  status: "Pending" | "Approved" | "Rejected";
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateDepositInput {
  amount: number;
  plan_id?: string;
  plan_name?: string;
  payment_method: string;
  transaction_id?: string;
  screenshot_data?: string; // base64 data URL
}

export interface AppTransaction {
  id: number;
  user_id: number;
  type: "Deposit" | "Withdrawal" | "Profit";
  amount: string;
  description: string | null;
  reference_id: string | null;
  status: "Pending" | "Completed" | "Rejected";
  created_at: string;
}

// ─── Deposit API ──────────────────────────────────────────────────────────────

export const depositApi = {
  /** Create a deposit request (user). */
  create: (input: CreateDepositInput) =>
    request<DepositRequest>("/deposits", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  /** List deposits for the current user (or all if admin). */
  list: () => request<DepositRequest[]>("/deposits"),

  /** Get a single deposit by ID. */
  get: (id: number) => request<DepositRequest>(`/deposits/${id}`),

  /** Admin: approve a deposit. */
  approve: (id: number, approved_amount: number) =>
    request<DepositRequest>(`/deposits/${id}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ approved_amount }),
    }),

  /** Admin: reject a deposit. */
  reject: (id: number) =>
    request<DepositRequest>(`/deposits/${id}/reject`, { method: "PATCH" }),
};

// ─── Transaction API ──────────────────────────────────────────────────────────

export const transactionApi = {
  list: () => request<AppTransaction[]>("/transactions"),
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a File to a base64 data URL. */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
