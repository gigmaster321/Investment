import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? body?.message ?? body?.title ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export interface InvestmentPlanSnapshot {
  id: string;
  name: string;
  executionCycle: string;
}

export interface InvestmentUser {
  id: string;
  name: string;
  email: string;
}

export interface Investment {
  id: string;
  user: InvestmentUser;
  plan: InvestmentPlanSnapshot;
  investmentAmount: number;
  profitPercentage: number;
  investmentDate: string;
  maturityDate: string;
  status: string;
  isPaused: boolean;
  expectedReturn: number;
  remainingSeconds: number;
  displayStatus: string;
  /** Current accrued profit based on elapsed time */
  currentProfit: number;
  /** ROI progress 0–100 */
  roiProgress: number;
  /** ISO date of next profit credit */
  nextProfitCreditDate: string;
  /** Total profit for completed/cancelled investments */
  totalProfitEarned: number | null;
}

export type InvestmentInput = { planId: string; amount: number };

interface InvestmentsContextValue {
  investments: Investment[];
  loading: boolean;
  error: string | null;
  create: (input: InvestmentInput) => Promise<Investment>;
  refresh: () => Promise<void>;
}

const InvestmentsContext = createContext<InvestmentsContextValue | null>(null);

export function InvestmentsProvider({ children }: { children: ReactNode }) {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const next = await apiFetch<Investment[]>("/investments");
      setInvestments(next);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load investments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<InvestmentsContextValue>(() => ({
    investments,
    loading,
    error,
    refresh,
    async create(input) {
      const investment = await apiFetch<Investment>("/investments", {
        method: "POST",
        body: JSON.stringify({ planId: input.planId, amount: input.amount }),
      });
      setInvestments((current) => [investment, ...current]);
      return investment;
    },
  }), [investments, loading, error, refresh]);

  return <InvestmentsContext.Provider value={value}>{children}</InvestmentsContext.Provider>;
}

export function useInvestments() {
  const context = useContext(InvestmentsContext);
  if (!context) throw new Error("useInvestments must be used inside InvestmentsProvider");
  return context;
}

export function formatInvestmentDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

export function formatRemainingTime(seconds: number) {
  if (seconds <= 0) return "Matured";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${Math.max(1, minutes)}m remaining`;
}
