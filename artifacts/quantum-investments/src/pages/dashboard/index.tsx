import { StatCard } from '@/components/dashboard/StatCard';
import { Wallet, Activity, TrendingUp, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const chartData = [
  { name: 'Jan', value: 120000 },
  { name: 'Feb', value: 125000 },
  { name: 'Mar', value: 122000 },
  { name: 'Apr', value: 130000 },
  { name: 'May', value: 138000 },
  { name: 'Jun', value: 142854 },
];

const recentTransactions = [
  { id: 1, type: 'Profit', amount: '+$1,250.00', date: 'Today, 09:41 AM', status: 'Completed' },
  { id: 2, type: 'Deposit', amount: '+$25,000.00', date: 'Yesterday, 14:20 PM', status: 'Completed' },
  { id: 3, type: 'Withdrawal', amount: '-$5,000.00', date: 'Oct 24, 11:30 AM', status: 'Completed' },
  { id: 4, type: 'Profit', amount: '+$1,250.00', date: 'Oct 23, 09:41 AM', status: 'Completed' },
  { id: 5, type: 'Deposit', amount: '+$10,000.00', date: 'Oct 20, 16:00 PM', status: 'Completed' },
];

export default function DashboardOverview() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Portfolio Overview</h1>
        <p className="text-muted-foreground">Welcome back. Here is your current balance and activity.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard delay={0} title="Total Balance" value="$142,854.20" subtitle="+12.5% this month" icon={Wallet} />
        <StatCard delay={0.1} title="Active Investment" value="$85,000.00" subtitle="Gold Plan" icon={Activity} />
        <StatCard delay={0.2} title="Total Profit" value="$28,430.50" subtitle="+$1,250.00 today" icon={TrendingUp} />
        <StatCard delay={0.3} title="Total Withdrawals" value="$12,000.00" icon={Download} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
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
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1EA7FF" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#1EA7FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(11,42,111,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#1EA7FF' }}
                />
                <Area type="monotone" dataKey="value" stroke="#1EA7FF" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="bg-card/40 backdrop-blur-md border border-white/5 rounded-xl p-6 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            {recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-default">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${tx.type === 'Withdrawal' ? 'bg-destructive/20 text-destructive' : 'bg-primary/20 text-accent'}`}>
                    {tx.type === 'Withdrawal' ? <Download size={16} /> : <Activity size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${tx.type === 'Withdrawal' ? 'text-white' : 'text-accent'}`}>{tx.amount}</p>
                  <p className="text-xs text-muted-foreground">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}