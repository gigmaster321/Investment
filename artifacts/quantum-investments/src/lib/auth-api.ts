/**
 * Auth API client.
 * Uses relative paths — the Replit proxy routes /api/* to the API server.
 * WordPress-ready: swap API_BASE to the WP REST endpoint when migrating.
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
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: AuthUser;
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
  /** Register a new user account and start a session. */
  register: (data: {
    full_name: string;
    username: string;
    email: string;
    phone?: string;
    password: string;
  }) =>
    request<AuthResponse>("/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Log in with email + password. Returns user and starts a session. */
  login: (email: string, password: string) =>
    request<AuthResponse>("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  /** Destroy the current session. */
  logout: () =>
    request<{ success: boolean }>("/logout", { method: "POST" }),

  /** Fetch the currently authenticated user (session check). */
  me: () => request<AuthResponse>("/me"),
};
