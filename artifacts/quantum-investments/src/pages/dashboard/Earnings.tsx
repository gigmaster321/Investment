import { StatCard } from '@/components/dashboard/StatCard';
import { DollarSign, Calendar, TrendingUp, Activity, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  fetchEarningsSummary,
  fetchEarningsHistory,
  formatCreditDate,
  type EarningsSummary,
  type EarningRecord,
} from '@/lib/earnings';

function fmt(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Earnings() {
  const [summary, setSummary] = useState<EarningsSummary | null>(null);
  const [history, setHistory] = useState<EarningRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    Promise.all([
      fetchEarningsSummary(ac.signal),
      fetchEarningsHistory(ac.signal),
    ])
      .then(([s, h]) => {
        setSummary(s);
        setHistory(h);
      })
      .catch(() => {/* stay with defaults on error */})
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, []);

  const dailyVal  = loading ? '…' : fmt(summary?.dailyEarnings  ?? 0);
  const monthlyVal = loading ? '…' : fmt(summary?.monthlyEarnings ?? 0);
  const totalVal  = loading ? '…' : fmt(summary?.totalProfit    ?? 0);
  const roiVal    = loading ? '…' : `${(summary?.roi ?? 0).toFixed(2)}%`;

  // Most recent 10 entries for the Daily Earnings Log sidebar
  const recentLog = history.slice(0, 10);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Earnings Report</h1>
        <p className="text-muted-foreground">Detailed breakdown of your generated profits.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard delay={0}   title="Daily Earnings"   value={dailyVal}   icon={Activity} />
        <StatCard delay={0.1} title="Monthly Earnings" value={monthlyVal} icon={Calendar} />
        <StatCard delay={0.2} title="Total Profit"     value={totalVal}   icon={DollarSign} />
        <StatCard delay={0.3} title="ROI"              value={roiVal}     icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 space-y-8"
        >
          {/* Earnings chart placeholder */}
          <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Earnings Over Time</h2>
            <div className="h-[300px] w-full flex flex-col items-center justify-center gap-3 text-center">
              <TrendingUp size={40} className="text-white/10" />
              <p className="text-muted-foreground text-sm">Earnings history will appear once profits are credited to your account.</p>
            </div>
          </div>

          {/* Breakdown table */}
          <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Earnings Breakdown</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                    <th className="p-4">Period</th>
                    <th className="p-4">Daily Rate</th>
                    <th className="p-4">Amount Invested</th>
                    <th className="p-4">Profit Earned</th>
                    <th className="p-4">Cumulative Total</th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && history.length > 0 ? (
                    history.map((rec, i) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 + 0.5 }}
                        key={rec.id}
                        className="border-b border-white/5 transition-colors"
                      >
                        <td className="p-4 font-medium text-white">
                          {formatCreditDate(rec.creditDate)}
                          <span className="block text-xs text-muted-foreground font-normal">{rec.planName}</span>
                        </td>
                        <td className="p-4 text-white">{rec.dailyRate.toFixed(4)}%</td>
                        <td className="p-4 text-muted-foreground">{fmt(rec.investmentAmount)}</td>
                        <td className="p-4 text-accent font-semibold">{fmt(rec.amount)}</td>
                        <td className="p-4 text-white">{fmt(rec.cumulativeTotal)}</td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-muted-foreground">
                        {loading ? 'Loading…' : 'No earnings data yet.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Daily earnings log */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card/40 backdrop-blur-md border border-white/5 rounded-xl p-6 h-fit"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Daily Earnings Log</h2>
          {recentLog.length > 0 ? (
            <ul className="space-y-3">
              {recentLog.map((rec) => (
                <li key={rec.id} className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-white font-medium">{formatCreditDate(rec.creditDate)}</p>
                    <p className="text-xs text-muted-foreground">{rec.planName}</p>
                  </div>
                  <span className="text-accent font-semibold text-sm whitespace-nowrap">+{fmt(rec.amount)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 text-center py-8">
              <Check size={36} className="text-white/10" />
              <p className="text-muted-foreground text-sm">
                {loading ? 'Loading…' : 'No earnings logged yet.'}
              </p>
            </div>
          )}
          <button className="w-full mt-6 py-2 text-sm text-primary hover:text-white transition-colors font-medium">
            View Full Log
          </button>
        </motion.div>
      </div>
    </div>
  );
}
