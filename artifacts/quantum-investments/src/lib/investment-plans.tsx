import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type PlanStatus = "Active" | "Disabled";

export interface InvestmentPlan {
  id: string;
  name: string;
  minInvestment: number;
  maxInvestment: number | null;
  profitPercentage: number;
  /** Optional display string for return ranges, e.g. "200% – 350%". Takes precedence over profitPercentage display. */
  returnRange?: string;
  executionCycle: string;
  description: string;
  /** Optional longer overview paragraph, distinct from the short description. */
  overview?: string;
  features: string[];
  status: PlanStatus;
  displayOrder: number;
  investors: number;
  totalDeposited: number;
}

export type PlanInput = Omit<InvestmentPlan, "id" | "investors" | "totalDeposited">;

export const DEFAULT_PLANS: InvestmentPlan[] = [
  {
    id: "starter-ai",
    name: "Starter AI",
    minInvestment: 1000,
    maxInvestment: 10000,
    profitPercentage: 200,
    returnRange: "200% – 350%",
    executionCycle: "24 Hours",
    description: "Based on historical backtesting and volatility-adjusted strategy modeling.",
    overview: "Designed for new investors seeking structured exposure to innovation-focused equities with automated risk controls.",
    features: [
      "Automated trade execution",
      "Risk-adjusted capital deployment",
      "Portfolio rebalancing",
      "Monthly performance reporting",
    ],
    status: "Active",
    displayOrder: 1,
    investors: 1842,
    totalDeposited: 284100,
  },
  {
    id: "growth-ai",
    name: "Growth AI",
    minInvestment: 10000,
    maxInvestment: 100000,
    profitPercentage: 350,
    returnRange: "350% – 550%",
    executionCycle: "3 Days",
    description: "Advanced signal detection with volatility-aware execution framework.",
    overview: "Enhanced AI signal modeling focused on high-growth innovation sectors and dynamic capital rotation.",
    features: [
      "High-frequency signal detection",
      "Sector rotation strategy",
      "Volatility hedging logic",
      "Weekly analytics dashboard",
    ],
    status: "Active",
    displayOrder: 2,
    investors: 1203,
    totalDeposited: 3600000,
  },
  {
    id: "elite-ai",
    name: "Elite AI",
    minInvestment: 100000,
    maxInvestment: null,
    profitPercentage: 700,
    returnRange: "+700%",
    executionCycle: "5 Days",
    description: "Multi-layered AI execution across diversified innovation assets.",
    overview: "Designed for large capital deployment with structured downside protection and dynamic reallocation systems.",
    features: [
      "Cross-sector AI allocation engine",
      "Downside risk containment protocol",
      "Real-time capital rebalancing",
      "Dedicated strategy oversight",
    ],
    status: "Active",
    displayOrder: 3,
    investors: 614,
    totalDeposited: 18200000,
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