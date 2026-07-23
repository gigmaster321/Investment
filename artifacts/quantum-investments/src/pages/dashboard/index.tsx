import { StatCard } from '@/components/dashboard/StatCard';
import { Wallet, Activity, TrendingUp, Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInvestments } from '@/lib/investments';

export default function DashboardOverview() {
  const { investments, loading } = useInvestments();

  const activeInvestment = investments.find((inv) => inv.status === 'active');
  const activeValue = activeInvestment
    ? `$${Number(activeInvestment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    : '$0.00';
  const activeSubtitle = activeInvestment?.plan_name ?? 'No active plan';

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Portfolio Overview</h1>
        <p className="text-muted-foreground">Welcome back. Here is your current balance and activity.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard delay={0} title="Total Balance" value="$0.00" subtitle="No balance yet" icon={Wallet} href="/dashboard" />
        <StatCard delay={0.1} title="Active Investment" value={loading ? '…' : activeValue} subtitle={loading ? '' : activeSubtitle} icon={Activity} href="/dashboard/investments" />
        <StatCard delay={0.2} title="Total Profit" value="$0.00" subtitle="No earnings yet" icon={TrendingUp} href="/dashboard/earnings" />
        <StatCard delay={0.3} title="Total Withdrawals" value="$0.00" icon={Download} href="/dashboard/withdrawals" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="lg:col-span-2 bg-card/40 backdrop-blur-md border border-white/5 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Performance History</h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-muted-foreground cursor-pointer hover:text-white transition-colors">1W</span>
              <span className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-xs font-medium text-accent cursor-pointer">1M</span>
              <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-muted-foreground cursor-pointer hover:text-white transition-colors">1Y</span>
            </div>
          </div>
          <div className="h-[300px] w-full flex flex-col items-center justify-center gap-3 text-center">
            <TrendingUp size={40} className="text-white/10" />
            <p className="text-muted-foreground text-sm">Performance history will appear once your account has activity.</p>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="bg-card/40 backdrop-blur-md border border-white/5 rounded-xl p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-8">
            <Activity size={36} className="text-white/10" />
            <p className="text-muted-foreground text-sm">No recent activity yet.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
