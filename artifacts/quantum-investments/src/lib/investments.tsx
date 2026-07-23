import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  createInvestment,
  listInvestments,
  updateInvestmentStatus,
  type Investment,
  type InvestmentInput,
  type InvestmentStatusActionAction,
} from "@workspace/api-client-react";

const DEMO_USER_ID = "user-demo-001";

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
      const next = await listInvestments({ scope: "user", userId: DEMO_USER_ID });
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
      const investment = await createInvestment(input);
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

export async function changeInvestmentStatus(
  investmentId: string,
  action: InvestmentStatusActionAction,
) {
  return updateInvestmentStatus(investmentId, { action });
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