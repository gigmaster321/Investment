/**
 * Auth API client.
 * Uses relative paths — the Replit proxy routes /api/* to the API server.
 */

const API_BASE = "/api/auth";

export interface AuthUser {
  id: number;
  full_name: string;
  username: string;
  email: string;
  phone: string | null;
  role: "user" | "admin";
  email_verified: boolean;
  account_status: "active" | "suspended" | "blocked";
  balance: string;
  total_deposit: string;
  total_withdrawal: string;
  current_plan: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface RegisterResponse {
  success: boolean;
  userId: number;
}

export interface AuthError {
  status: number;
  error: string;
  message?: string;
  details?: Record<string, string[]>;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err: AuthError = { status: res.status, ...data };
    throw err;
  }

  return data as T;
}

export const authApi = {
  /**
   * Register a new user account.
   * Account is immediately active — user can log in right away.
   */
  register: (data: {
    full_name: string;
    username: string;
    email: string;
    phone?: string;
    password: string;
  }) =>
    request<RegisterResponse>("/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Log in with email + password. */
  login: (email: string, password: string, rememberMe = false) =>
    request<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password, rememberMe }),
    }),

  /** Destroy the current session. */
  logout: () =>
    request<{ success: boolean }>("/logout", { method: "POST" }),

  /** Fetch the currently authenticated user (session check). */
  me: () => request<AuthResponse>("/me"),
};
