/**
 * Deposit wallet API client.
 * Mirrors the pattern in deposit-api.ts.
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

export interface WalletRecord {
  id: number;
  coin_id: string;
  name: string;
  ticker: string;
  network: string;
  address: string;
  is_active: boolean;
  updated_at: string;
}

export interface UpdateWalletInput {
  address: string;
  is_active?: boolean;
}

// ─── User-facing wallet API (read only) ──────────────────────────────────────

export const walletApi = {
  /** List active wallet addresses (authenticated user). */
  list: () => request<WalletRecord[]>("/wallets"),
};

// ─── Admin wallet API ─────────────────────────────────────────────────────────

export const adminWalletApi = {
  /** List all wallets (admin). */
  list: () => request<WalletRecord[]>("/admin/wallets"),

  /** Update a wallet's address and/or active status (admin). */
  update: (id: number, input: UpdateWalletInput) =>
    request<WalletRecord>(`/admin/wallets/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
};
