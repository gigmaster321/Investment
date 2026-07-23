import { motion } from 'framer-motion';
import {
  Users, TrendingUp, DollarSign, ArrowUpCircle, Clock,
  Activity, ArrowUp, ArrowDown,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const STAT_CARDS = [
  { title: 'Total Users', value: '4,821', change: '+12.4%', up: true, icon: Users, color: 'from-blue-600/20 to-blue-500/10', border: 'border-blue-500/20' },
  { title: 'Active Investors', value: '3,147', change: '+8.2%', up: true, icon: TrendingUp, color: 'from-accent/20 to-accent/5', border: 'border-accent/20' },
  { title: 'Total Deposits', value: '$2.84M', change: '+22.1%', up: true, icon: DollarSign, color: 'from-emerald-600/20 to-emerald-500/10', border: 'border-emerald-500/20' },
  { title: 'Total Withdrawals', value: '$1.12M', change: '+5.7%', up: true, icon: ArrowUpCircle, color: 'from-violet-600/20 to-violet-500/10', border: 'border-violet-500/20' },
  { title: 'Pending Withdrawals', value: '38', change: '-3 today', up: false, icon: Clock, color: 'from-amber-600/20 to-amber-500/10', border: 'border-amber-500/20' },
];

const growthData = [
  { month: 'Jan', users: 2400, deposits: 420000 },
  { month: 'Feb', users: 2800, deposits: 510000 },
  { month: 'Mar', users: 3100, deposits: 580000 },
  { month: 'Apr', users: 3400, deposits: 670000 },
  { month: 'May', users: 3700, deposits: 720000 },
  { month: 'Jun', users: 4100, deposits: 810000 },
  { month: 'Jul', users: 4821, deposits: 920000 },
];

const RECENT_USERS = [
  { id: '#U-4821', name: 'James Thornton', email: 'j.thornton@email.com', plan: 'Gold', joined: '2h ago', status: 'Active' },
  { id: '#U-4820', name: 'Priya Sharma', email: 'p.sharma@email.com', plan: 'Platinum', joined: '5h ago', status: 'Active' },
  { id: '#U-4819', name: 'Carlos Rivera', email: 'c.rivera@email.com', plan: 'Silver', joined: '1d ago', status: 'Pending' },
  { id: '#U-4818', name: 'Sofia Becker', email: 's.becker@email.com', plan: 'Starter', joined: '1d ago', status: 'Active' },
  { id: '#U-4817', name: 'Amir Hassan', email: 'a.hassan@email.com', plan: 'Gold', joined: '2d ago', status: 'Suspended' },
];

const PENDING_WITHDRAWALS = [
  { id: '#W-0381', user: 'James Thornton', amount: '$4,200', method: 'Bitcoin', requested: '1h ago' },
  { id: '#W-0380', user: 'Priya Sharma', amount: '$12,800', method: 'Bank Transfer', requested: '3h ago' },
  { id: '#W-0379', user: 'Elena Volkov', amount: '$950', method: 'USDT', requested: '6h ago' },
];

const STATUS_COLORS: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Suspended: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function AdminDashboard() {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        {STAT_CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className={`bg-gradient-to-br ${card.color} border ${card.border} rounded-xl p-5 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(30,167,255,0.1)] transition-all duration-200`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{card.title}</span>
              <card.icon size={16} className="text-white/40" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${card.up ? 'text-emerald-400' : 'text-amber-400'}`}>
                {card.up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                {card.change}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Growth chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="bg-card/40 border border-white/5 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-white">Platform Growth</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Users & deposits — last 7 months</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={growthData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1EA7FF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1EA7FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="depositsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1565D8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#1565D8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.35)', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
            <Tooltip
              contentStyle={{ background: 'hsl(221,70%,16%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: 'rgba(255,255,255,0.7)' }}
            />
            <Area type="monotone" dataKey="users" stroke="#1EA7FF" strokeWidth={2} fill="url(#usersGrad)" name="Users" />
            <Area type="monotone" dataKey="deposits" stroke="#1565D8" strokeWidth={2} fill="url(#depositsGrad)" name="Deposits ($)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent users + pending withdrawals */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent users */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.4 }}
          className="xl:col-span-2 bg-card/40 border border-white/5 rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Recent Users</h2>
            <a href="/admin/users" className="text-xs text-accent hover:text-accent/70 transition-colors">View all →</a>
          </div>
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
                {RECENT_USERS.map((u) => (
                  <tr key={u.id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                    <td className="px-6 py-3.5">
                      <p className="text-white text-xs font-medium">{u.name}</p>
                      <p className="text-muted-foreground text-[10px]">{u.email}</p>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="text-xs text-accent font-medium">{u.plan}</span>
                    </td>
                    <td className="px-6 py-3.5 text-muted-foreground text-xs">{u.joined}</td>
                    <td className="px-6 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[u.status]}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <button className="text-[10px] font-medium text-muted-foreground hover:text-white border border-white/10 hover:border-white/25 rounded-md px-2.5 py-1 transition-colors">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pending withdrawals */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="bg-card/40 border border-white/5 rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-white">Pending Withdrawals</h2>
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-full px-2 py-0.5">
              {PENDING_WITHDRAWALS.length} new
            </span>
          </div>
          <div className="flex flex-col gap-0">
            {PENDING_WITHDRAWALS.map((w, i) => (
              <div key={w.id} className={`px-5 py-4 flex flex-col gap-2 ${i < PENDING_WITHDRAWALS.length - 1 ? 'border-b border-white/5' : ''}`}>
                <div className="flex items-center justify-between">
                  <span className="text-white text-xs font-semibold">{w.user}</span>
                  <span className="text-accent text-xs font-bold">{w.amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-[10px]">{w.method} · {w.requested}</span>
                  <div className="flex gap-1.5">
                    <button className="text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-md px-2 py-0.5 transition-colors">
                      Approve
                    </button>
                    <button className="text-[10px] font-semibold text-red-400 hover:bg-red-500/15 border border-red-500/20 rounded-md px-2 py-0.5 transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-5 py-3 border-t border-white/5">
            <a href="/admin/withdrawals" className="text-xs text-accent hover:text-accent/70 transition-colors">
              View all withdrawals →
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
