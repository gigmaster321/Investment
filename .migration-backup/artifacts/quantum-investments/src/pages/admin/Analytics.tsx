import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LineChart, Line,
} from 'recharts';
import { TrendingUp, BarChart2, Activity } from 'lucide-react';

const monthlyData = [
  { month: 'Jan', deposits: 320000, withdrawals: 110000, users: 2400, earnings: 48000 },
  { month: 'Feb', deposits: 410000, withdrawals: 130000, users: 2800, earnings: 61500 },
  { month: 'Mar', deposits: 480000, withdrawals: 155000, users: 3100, earnings: 72000 },
  { month: 'Apr', deposits: 560000, withdrawals: 170000, users: 3400, earnings: 84000 },
  { month: 'May', deposits: 620000, withdrawals: 200000, users: 3700, earnings: 93000 },
  { month: 'Jun', deposits: 710000, withdrawals: 240000, users: 4100, earnings: 106500 },
  { month: 'Jul', deposits: 840000, withdrawals: 280000, users: 4821, earnings: 126000 },
];

const dailyDeposits = [
  { day: 'Mon', amount: 42000 },
  { day: 'Tue', amount: 38000 },
  { day: 'Wed', amount: 61000 },
  { day: 'Thu', amount: 55000 },
  { day: 'Fri', amount: 78000 },
  { day: 'Sat', amount: 29000 },
  { day: 'Sun', amount: 21000 },
];

const planDistribution = [
  { plan: 'Starter', investors: 1842, deposits: 284100 },
  { plan: 'Silver', investors: 1203, deposits: 3600000 },
  { plan: 'Gold', investors: 614, deposits: 18200000 },
  { plan: 'Platinum', investors: 162, deposits: 47800000 },
];

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
const AXIS_TICK = { fill: 'rgba(255,255,255,0.35)', fontSize: 11 };
const AXIS_LINE = { axisLine: false, tickLine: false };

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Platform performance metrics and financial trends.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Revenue', value: '$591K', sub: 'All-time earnings', icon: TrendingUp },
          { label: 'Deposit Growth', value: '+162%', sub: 'Jan → Jul 2026', icon: BarChart2 },
          { label: 'User Growth', value: '+101%', sub: 'Jan → Jul 2026', icon: Activity },
          { label: 'Withdrawal Rate', value: '33.3%', sub: 'Of total deposits', icon: BarChart2 },
        ].map((k) => (
          <div key={k.label} className="bg-card/40 border border-white/5 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-muted-foreground text-[11px]">{k.label}</p>
              <k.icon size={14} className="text-accent/60" />
            </div>
            <p className="text-white font-bold text-xl">{k.value}</p>
            <p className="text-muted-foreground text-[10px] mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Growth chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card/40 border border-white/5 rounded-xl p-6"
      >
        <h2 className="text-sm font-semibold text-white mb-1">Platform Growth</h2>
        <p className="text-xs text-muted-foreground mb-5">Deposits vs withdrawals vs user growth over 7 months</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="depGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1EA7FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#1EA7FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="wdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="month" tick={AXIS_TICK} {...AXIS_LINE} />
            <YAxis tick={AXIS_TICK} {...AXIS_LINE} width={50} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v: number) => `$${v.toLocaleString()}`} />
            <Legend wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }} />
            <Area type="monotone" dataKey="deposits" stroke="#1EA7FF" strokeWidth={2} fill="url(#depGrad)" name="Deposits" />
            <Area type="monotone" dataKey="withdrawals" stroke="#a78bfa" strokeWidth={2} fill="url(#wdGrad)" name="Withdrawals" />
            <Area type="monotone" dataKey="earnings" stroke="#34d399" strokeWidth={2} fill="url(#earnGrad)" name="Earnings" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Daily deposits bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-card/40 border border-white/5 rounded-xl p-6"
        >
          <h2 className="text-sm font-semibold text-white mb-1">Daily Deposit Volume</h2>
          <p className="text-xs text-muted-foreground mb-5">This week</p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={dailyDeposits} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis dataKey="day" tick={AXIS_TICK} {...AXIS_LINE} />
              <YAxis tick={AXIS_TICK} {...AXIS_LINE} width={45} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Bar dataKey="amount" fill="#1565D8" radius={[4, 4, 0, 0]} name="Deposits" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Plan distribution line */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="bg-card/40 border border-white/5 rounded-xl p-6"
        >
          <h2 className="text-sm font-semibold text-white mb-1">Deposits by Plan</h2>
          <p className="text-xs text-muted-foreground mb-5">Total deposited per investment tier</p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={planDistribution} layout="vertical" margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
              <CartesianGrid {...GRID_PROPS} horizontal={false} />
              <XAxis type="number" tick={AXIS_TICK} {...AXIS_LINE} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
              <YAxis type="category" dataKey="plan" tick={AXIS_TICK} {...AXIS_LINE} width={56} />
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(v: number) => `$${v.toLocaleString()}`} />
              <Bar dataKey="deposits" fill="#1EA7FF" radius={[0, 4, 4, 0]} name="Total Deposited" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* User growth line chart */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="bg-card/40 border border-white/5 rounded-xl p-6"
      >
        <h2 className="text-sm font-semibold text-white mb-1">User Growth Curve</h2>
        <p className="text-xs text-muted-foreground mb-5">Cumulative registered users per month</p>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={monthlyData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="month" tick={AXIS_TICK} {...AXIS_LINE} />
            <YAxis tick={AXIS_TICK} {...AXIS_LINE} width={45} />
            <Tooltip {...CHART_TOOLTIP_STYLE} />
            <Line type="monotone" dataKey="users" stroke="#34d399" strokeWidth={2.5} dot={{ r: 4, fill: '#34d399' }} name="Users" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
