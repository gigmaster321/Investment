import { StatCard } from '@/components/dashboard/StatCard';
import { DollarSign, Calendar, TrendingUp, Activity, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInvestments } from '@/lib/investments';

export default function Earnings() {
  const { investments, loading } = useInvestments();
  const activeInvestments = investments.filter((inv) => inv.status === 'active');
  const hasActive = activeInvestments.length > 0;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Earnings Report</h1>
        <p className="text-muted-foreground">Detailed breakdown of your generated profits.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard delay={0} title="Daily Earnings" value="$0.00" icon={Activity} />
        <StatCard delay={0.1} title="Monthly Earnings" value="$0.00" icon={Calendar} />
        <StatCard delay={0.2} title="Total Profit" value="$0.00" icon={DollarSign} />
        <StatCard delay={0.3} title="ROI" value="0.00%" icon={TrendingUp} />
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
                  {!loading && hasActive ? (
                    activeInvestments.map((inv, i) => (
                      <motion.tr
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 + 0.5 }}
                        key={inv.id}
                        className="border-b border-white/5 transition-colors"
                      >
                        <td className="p-4 font-medium text-white">{inv.plan_name ?? '—'}</td>
                        <td className="p-4 text-white">{inv.daily_roi != null ? `${inv.daily_roi}%` : '—'}</td>
                        <td className="p-4 text-muted-foreground">
                          ${Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-4 text-accent font-semibold">$0.00</td>
                        <td className="p-4 text-white">$0.00</td>
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
          <div className="flex flex-col items-center justify-center gap-3 text-center py-8">
            <Check size={36} className="text-white/10" />
            <p className="text-muted-foreground text-sm">No earnings logged yet.</p>
          </div>
          <button className="w-full mt-6 py-2 text-sm text-primary hover:text-white transition-colors font-medium">
            View Full Log
          </button>
        </motion.div>
      </div>
    </div>
  );
}
