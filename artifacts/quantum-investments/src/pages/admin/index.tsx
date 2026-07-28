import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, DollarSign, ArrowUpCircle, Clock,
  Activity, CheckCircle, XCircle, InboxIcon,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  registeredDate: string;
  status: string;
}

interface DepositRequest {
  id: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  amount: string;
  approved_amount: string | null;
}

interface DashboardStats {
  totalUsers: number;
  totalDeposits: string;
  pendingDeposits: number;
  approvedDeposits: number;
  rejectedDeposits: number;
  recentUsers: AdminUser[];
}

const STATUS_COLORS: Record<string, string> = {
  Active:    'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Pending:   'text-amber-400   bg-amber-500/10   border-amber-500/20',
  Suspended: 'text-red-400     bg-red-500/10     border-red-500/20',
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, depositsRes] = await Promise.all([
          fetch('/api/admin/users', { credentials: 'include' }),
          fetch('/api/deposits', { credentials: 'include' }),
        ]);

        const users: AdminUser[] = usersRes.ok ? await usersRes.json() : [];
        const deposits: DepositRequest[] = depositsRes.ok ? await depositsRes.json() : [];

        const pending  = deposits.filter((d) => d.status === 'Pending').length;
        const approved = deposits.filter((d) => d.status === 'Approved').length;
        const rejected = deposits.filter((d) => d.status === 'Rejected').length;

        const totalDepositsNum = deposits
          .filter((d) => d.status === 'Approved')
          .reduce((sum, d) => sum + parseFloat(d.approved_amount ?? d.amount), 0);

        setStats({
          totalUsers: users.length,
          totalDeposits: `$${totalDepositsNum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          pendingDeposits: pending,
          approvedDeposits: approved,
          rejectedDeposits: rejected,
          recentUsers: users.slice(0, 5),
        });
      } catch {
        setStats({
          totalUsers: 0,
          totalDeposits: '$0.00',
          pendingDeposits: 0,
          approvedDeposits: 0,
          rejectedDeposits: 0,
          recentUsers: [],
        });
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const statCards = stats
    ? [
        { title: 'Total Users',         value: stats.totalUsers.toLocaleString(), icon: Users,        color: 'from-blue-600/20 to-blue-500/10',      border: 'border-blue-500/20'    },
        { title: 'Total Deposits',       value: stats.totalDeposits,               icon: DollarSign,   color: 'from-emerald-600/20 to-emerald-500/10', border: 'border-emerald-500/20' },
        { title: 'Pending Deposits',     value: String(stats.pendingDeposits),     icon: Clock,        color: 'from-amber-600/20 to-amber-500/10',     border: 'border-amber-500/20'   },
        { title: 'Approved Deposits',    value: String(stats.approvedDeposits),    icon: TrendingUp,   color: 'from-accent/20 to-accent/5',            border: 'border-accent/20'      },
        { title: 'Total Withdrawals',    value: '—',                               icon: ArrowUpCircle, color: 'from-violet-600/20 to-violet-500/10', border: 'border-violet-500/20'  },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Welcome back — here's what's happening on the platform.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/5 border border-white/8 rounded-lg px-3 py-2">
          <Activity size={12} className="text-accent" />
          Live data · Updated just now
        </div>
      </div>

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-card/40 border border-white/5 rounded-xl p-5 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-xl p-5 flex flex-col gap-3`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
                <card.icon size={16} className="text-white/40" />
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recent Users + Deposit Status */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="xl:col-span-2 bg-card/40 border border-white/5 rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Recent Users</h2>
            <a href="/wp-admin/users" className="text-xs text-accent hover:text-accent/70 transition-colors">View all →</a>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-8 bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          ) : stats?.recentUsers.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-14 text-muted-foreground/50">
              <InboxIcon size={28} strokeWidth={1.2} />
              <p className="text-sm">No users registered yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['User', 'Plan', 'Joined', 'Status', ''].map((h) => (
                      <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-6 py-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats?.recentUsers.map((u) => (
                    <tr key={u.id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                      <td className="px-6 py-3.5">
                        <p className="text-white text-xs font-medium">{u.name}</p>
                        <p className="text-muted-foreground text-[10px]">{u.email}</p>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-xs text-accent font-medium">{u.plan}</span>
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground text-xs">{u.registeredDate}</td>
                      <td className="px-6 py-3.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[u.status] ?? STATUS_COLORS['Active']}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <a
                          href="/wp-admin/users"
                          className="text-[10px] font-medium text-muted-foreground hover:text-white border border-white/10 hover:border-white/25 rounded-md px-2.5 py-1 transition-colors"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Deposit Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="bg-card/40 border border-white/5 rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Deposit Requests</h2>
            {!loading && (stats?.pendingDeposits ?? 0) > 0 && (
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5">
                {stats!.pendingDeposits} pending
              </span>
            )}
          </div>

          <div className="p-4 flex flex-col gap-3">
            <a href="/wp-admin/deposits" className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/15 hover:bg-amber-500/12 transition-colors">
              <div className="p-2 rounded-lg bg-amber-500/15 border border-amber-500/20 shrink-0">
                <Clock size={15} className="text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-amber-400 text-xs font-semibold">Pending</p>
                <p className="text-muted-foreground text-[10px]">Awaiting review</p>
              </div>
              <span className="text-amber-400 text-xl font-bold shrink-0">
                {loading ? '…' : stats?.pendingDeposits ?? 0}
              </span>
            </a>

            <a href="/wp-admin/deposits" className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/8 border border-emerald-500/15 hover:bg-emerald-500/12 transition-colors">
              <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/20 shrink-0">
                <CheckCircle size={15} className="text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-emerald-400 text-xs font-semibold">Approved</p>
                <p className="text-muted-foreground text-[10px]">Processed &amp; credited</p>
              </div>
              <span className="text-emerald-400 text-xl font-bold shrink-0">
                {loading ? '…' : stats?.approvedDeposits ?? 0}
              </span>
            </a>

            <a href="/wp-admin/deposits" className="flex items-center gap-3 p-3.5 rounded-xl bg-red-500/8 border border-red-500/15 hover:bg-red-500/12 transition-colors">
              <div className="p-2 rounded-lg bg-red-500/15 border border-red-500/20 shrink-0">
                <XCircle size={15} className="text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-red-400 text-xs font-semibold">Rejected</p>
                <p className="text-muted-foreground text-[10px]">Declined requests</p>
              </div>
              <span className="text-red-400 text-xl font-bold shrink-0">
                {loading ? '…' : stats?.rejectedDeposits ?? 0}
              </span>
            </a>
          </div>

          <div className="px-5 py-3 border-t border-white/5">
            <a href="/wp-admin/deposits" className="text-xs text-accent hover:text-accent/70 transition-colors">
              Manage all deposits →
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
