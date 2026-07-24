import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, BarChart2, Activity, Users } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DepositRequest {
  status: 'Pending' | 'Approved' | 'Rejected';
  amount: string;
  approved_amount: string | null;
  created_at: string;
  plan_name: string | null;
}

interface AdminUser {
  plan: string;
  totalDeposits: string;
  registeredDate: string;
  registeredIso: string;
}

interface MonthPoint {
  month: string;
  deposits: number;
  users: number;
}

interface PlanPoint {
  plan: string;
  investors: number;
  deposits: number;
}

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    background: 'hsl(221,70%,16%)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 8,
    fontSize: 11,
  },
  labelStyle: { color: 'rgba(255,255,255,0.7)' },
};

const GRID_PROPS = { strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.04)' };
const AXIS_TICK  = { fill: 'rgba(255,255,255,0.35)', fontSize: 11 };
const AXIS_LINE  = { axisLine: false as const, tickLine: false as const };

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminAnalytics() {
  const [monthlyData, setMonthlyData]     = useState<MonthPoint[]>([]);
  const [planData, setPlanData]           = useState<PlanPoint[]>([]);
  const [totalRevenue, setTotalRevenue]   = useState(0);
  const [totalUsers, setTotalUsers]       = useState(0);
  const [loading, setLoading]             = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, depositsRes] = await Promise.all([
          fetch('/api/admin/users', { credentials: 'include' }),
          fetch('/api/deposits',    { credentials: 'include' }),
        ]);

        const users: AdminUser[]         = usersRes.ok    ? await usersRes.json()    : [];
        const deposits: DepositRequest[] = depositsRes.ok ? await depositsRes.json() : [];

        // Monthly aggregation — by calendar month of created_at
        const monthlyMap = new Map<string, { deposits: number; userSet: Set<string> }>();
        deposits.forEach((d) => {
          if (d.status !== 'Approved') return;
          const dt    = new Date(d.created_at);
          const key   = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
          const label = `${MONTH_LABELS[dt.getMonth()]} '${String(dt.getFullYear()).slice(2)}`;
          if (!monthlyMap.has(key)) monthlyMap.set(key, { deposits: 0, userSet: new Set() });
          monthlyMap.get(key)!.deposits += parseFloat(d.approved_amount ?? d.amount);
        });
        users.forEach((u) => {
          const dt    = new Date(u.registeredIso ?? u.registeredDate);
          const key   = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyMap.has(key)) monthlyMap.set(key, { deposits: 0, userSet: new Set() });
          monthlyMap.get(key)!.userSet.add(u.registeredDate + u.totalDeposits);
        });

        const sortedKeys = [...monthlyMap.keys()].sort();
        const monthly: MonthPoint[] = sortedKeys.map((key) => {
          const [yr, mo] = key.split('-');
          const label    = `${MONTH_LABELS[Number(mo) - 1]} '${yr.slice(2)}`;
          const entry    = monthlyMap.get(key)!;
          return { month: label, deposits: entry.deposits, users: entry.userSet.size };
        });

        // Plan distribution
        const planMap = new Map<string, { investors: number; deposits: number }>();
        users.forEach((u) => {
          const plan = u.plan || 'None';
          if (!planMap.has(plan)) planMap.set(plan, { investors: 0, deposits: 0 });
          planMap.get(plan)!.investors += 1;
          planMap.get(plan)!.deposits  += parseFloat(u.totalDeposits.replace(/[$,]/g, '')) || 0;
        });
        const plans: PlanPoint[] = [...planMap.entries()]
          .filter(([k]) => k !== 'None')
          .map(([plan, v]) => ({ plan, ...v }));

        const revenue = deposits
          .filter((d) => d.status === 'Approved')
          .reduce((s, d) => s + parseFloat(d.approved_amount ?? d.amount), 0);

        setMonthlyData(monthly);
        setPlanData(plans);
        setTotalRevenue(revenue);
        setTotalUsers(users.length);
      } catch {
        // leave empty
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const hasMonthly = monthlyData.length > 0;
  const hasPlan    = planData.length > 0;

  const kpis = [
    { label: 'Total Deposits',  value: fmt(totalRevenue),        sub: 'Approved only',        icon: TrendingUp },
    { label: 'Total Users',     value: totalUsers.toLocaleString(), sub: 'Registered accounts', icon: Users      },
    { label: 'Deposit Growth',  value: hasMonthly ? `${monthlyData.length} mo` : '—', sub: 'Months with data', icon: BarChart2  },
    { label: 'Plan Types',      value: hasPlan ? String(planData.length) : '—',       sub: 'Active plan tiers', icon: Activity   },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Platform performance metrics and financial trends.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="bg-card/40 border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground text-[11px]">{k.label}</p>
              <k.icon size={14} className="text-accent/60" />
            </div>
            {loading ? (
              <div className="h-7 bg-white/5 rounded animate-pulse" />
            ) : (
              <>
                <p className="text-white font-bold text-xl">{k.value}</p>
                <p className="text-muted-foreground text-[10px] mt-0.5">{k.sub}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Monthly Deposits Chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card/40 border border-white/5 rounded-xl p-6"
      >
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">Monthly Deposits</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Approved deposit volume by month</p>
        </div>
        {loading ? (
          <div className="h-48 bg-white/3 rounded-lg animate-pulse" />
        ) : !hasMonthly ? (
          <div className="flex flex-col items-center gap-2 py-14 text-muted-foreground/40">
            <BarChart2 size={32} strokeWidth={1.2} />
            <p className="text-sm">No deposit data yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#1EA7FF" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#1EA7FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="month" tick={AXIS_TICK} {...AXIS_LINE} />
              <YAxis tick={AXIS_TICK} {...AXIS_LINE} width={48} tickFormatter={(v) => fmt(v)} />
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v: number) => [fmt(v), 'Deposits']} />
              <Area type="monotone" dataKey="deposits" stroke="#1EA7FF" strokeWidth={2} fill="url(#depGrad)" name="Deposits" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Plan Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="bg-card/40 border border-white/5 rounded-xl p-6"
      >
        <div className="mb-5">
          <h2 className="text-base font-semibold text-white">Plan Distribution</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Users by investment plan</p>
        </div>
        {loading ? (
          <div className="h-48 bg-white/3 rounded-lg animate-pulse" />
        ) : !hasPlan ? (
          <div className="flex flex-col items-center gap-2 py-14 text-muted-foreground/40">
            <Activity size={32} strokeWidth={1.2} />
            <p className="text-sm">No investment plans active yet.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={planData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="plan" tick={AXIS_TICK} {...AXIS_LINE} />
              <YAxis tick={AXIS_TICK} {...AXIS_LINE} width={36} />
              <Tooltip {...CHART_TOOLTIP_STYLE} />
              <Bar dataKey="investors" fill="#1EA7FF" radius={[4, 4, 0, 0]} name="Investors" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
}
