import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type PlanStatus = "Active" | "Disabled";

export interface InvestmentPlan {
  id: string;
  name: string;
  minInvestment: number;
  maxInvestment: number | null;
  profitPercentage: number;
  executionCycle: string;
  description: string;
  features: string[];
  status: PlanStatus;
  displayOrder: number;
  investors: number;
  totalDeposited: number;
}

export type PlanInput = Omit<InvestmentPlan, "id" | "investors" | "totalDeposited">;

export const DEFAULT_PLANS: InvestmentPlan[] = [
  {
    id: "starter",
    name: "Starter",
    minInvestment: 100,
    maxInvestment: 999,
    profitPercentage: 5,
    executionCycle: "30 days",
    description: "A practical starting point for building a diversified portfolio.",
    features: ["Daily ROI payouts", "Email support", "Basic analytics", "Referral bonus 2%"],
    status: "Active",
    displayOrder: 1,
    investors: 1842,
    totalDeposited: 284100,
  },
  {
    id: "silver",
    name: "Silver",
    minInvestment: 1000,
    maxInvestment: 4999,
    profitPercentage: 8,
    executionCycle: "30 days",
    description: "More room to grow with enhanced support and reporting.",
    features: ["Daily ROI payouts", "Priority email support", "Advanced analytics", "Referral bonus 4%", "Faster withdrawals"],
    status: "Active",
    displayOrder: 2,
    investors: 1203,
    totalDeposited: 3600000,
  },
  {
    id: "gold",
    name: "Gold",
    minInvestment: 5000,
    maxInvestment: 24999,
    profitPercentage: 12,
    executionCycle: "30 days",
    description: "A high-touch plan for investors seeking stronger portfolio support.",
    features: ["Daily ROI payouts", "24/7 dedicated support", "Full analytics suite", "Referral bonus 6%", "Same-day withdrawals", "Portfolio manager"],
    status: "Active",
    displayOrder: 3,
    investors: 614,
    totalDeposited: 18200000,
  },
  {
    id: "platinum",
    name: "Platinum",
    minInvestment: 25000,
    maxInvestment: null,
    profitPercentage: 18,
    executionCycle: "30 days",
    description: "VIP portfolio access with dedicated strategy oversight.",
    features: ["Daily ROI payouts", "Personal account manager", "Real-time analytics", "Referral bonus 10%", "Instant withdrawals", "VIP investment advisory", "Custom strategies"],
    status: "Active",
    displayOrder: 4,
    investors: 162,
    totalDeposited: 47800000,
  },
];

const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? body?.title ?? `Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

interface InvestmentPlansContextValue {
  plans: InvestmentPlan[];
  loading: boolean;
  error: string | null;
  createPlan: (input: PlanInput) => Promise<InvestmentPlan>;
  updatePlan: (id: string, input: PlanInput) => Promise<InvestmentPlan>;
  setPlanStatus: (id: string, status: PlanStatus) => Promise<InvestmentPlan>;
  deletePlan: (id: string) => Promise<void>;
  refreshPlans: () => Promise<void>;
}

const InvestmentPlansContext = createContext<InvestmentPlansContextValue | null>(null);

export function InvestmentPlansProvider({ children }: { children: ReactNode }) {
  const [plans, setPlans] = useState<InvestmentPlan[]>(DEFAULT_PLANS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshPlans = async () => {
    setLoading(true);
    try {
      const next = await request<InvestmentPlan[]>("/plans");
      setPlans(next);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load investment plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshPlans();
  }, []);

  const value = useMemo<InvestmentPlansContextValue>(() => ({
    plans: [...plans].sort((a, b) => a.displayOrder - b.displayOrder),
    loading,
    error,
    refreshPlans,
    async createPlan(input) {
      const created = await request<InvestmentPlan>("/plans", { method: "POST", body: JSON.stringify(input) });
      setPlans((current) => [...current, created]);
      return created;
    },
    async updatePlan(id, input) {
      const updated = await request<InvestmentPlan>(`/plans/${encodeURIComponent(id)}`, { method: "PUT", body: JSON.stringify(input) });
      setPlans((current) => current.map((plan) => plan.id === id ? updated : plan));
      return updated;
    },
    async setPlanStatus(id, status) {
      const updated = await request<InvestmentPlan>(`/plans/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      setPlans((current) => current.map((plan) => plan.id === id ? updated : plan));
      return updated;
    },
    async deletePlan(id) {
      await request(`/plans/${encodeURIComponent(id)}`, { method: "DELETE" });
      setPlans((current) => current.filter((plan) => plan.id !== id));
    },
  }), [plans, loading, error]);

  return <InvestmentPlansContext.Provider value={value}>{children}</InvestmentPlansContext.Provider>;
}

export function useInvestmentPlans() {
  const context = useContext(InvestmentPlansContext);
  if (!context) throw new Error("useInvestmentPlans must be used inside InvestmentPlansProvider");
  return context;
}

export function formatInvestmentAmount(value: number | null) {
  return value === null ? "Unlimited" : `$${value.toLocaleString("en-US")}`;
}