const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

async function apiFetch<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    signal,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail ?? body?.message ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export interface EarningsSummary {
  dailyEarnings: number;
  monthlyEarnings: number;
  totalProfit: number;
  roi: number;
}

export interface EarningRecord {
  id: number;
  investmentId: number;
  planName: string;
  investmentAmount: number;
  profitPercentage: number;
  cycleDays: number;
  dailyRate: number;
  amount: number;
  cumulativeTotal: number;
  creditDate: string; // YYYY-MM-DD
  createdAt: string;
}

export function fetchEarningsSummary(signal?: AbortSignal): Promise<EarningsSummary> {
  return apiFetch<EarningsSummary>("/earnings/summary", signal);
}

export function fetchEarningsHistory(signal?: AbortSignal): Promise<EarningRecord[]> {
  return apiFetch<EarningRecord[]>("/earnings/history", signal);
}

export function formatCreditDate(dateStr: string): string {
  // dateStr is YYYY-MM-DD
  const [year, month, day] = dateStr.split("-");
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}
