import { StatCard } from '@/components/dashboard/StatCard';
import { DollarSign, Calendar, TrendingUp, Activity, Check } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const chartData = [
  { name: 'Jan', value: 800 },
  { name: 'Feb', value: 850 },
  { name: 'Mar', value: 920 },
  { name: 'Apr', value: 1050 },
  { name: 'May', value: 1150 },
  { name: 'Jun', value: 1300 },
  { name: 'Jul', value: 1420 },
  { name: 'Aug', value: 1550 },
  { name: 'Sep', value: 1680 },
  { name: 'Oct', value: 1850 },
  { name: 'Nov', value: 1980 },
  { name: 'Dec', value: 2100 },
];

const breakdownData = [
  { period: 'January', rate: '1.8%', invested: '$85,000.00', profit: '$1,530.00', cumulative: '$1,530.00' },
  { period: 'February', rate: '1.8%', invested: '$85,000.00', profit: '$1,530.00', cumulative: '$3,060.00' },
  { period: 'March', rate: '1.8%', invested: '$85,000.00', profit: '$1,530.00', cumulative: '$4,590.00' },
  { period: 'April', rate: '1.8%', invested: '$85,000.00', profit: '$1,530.00', cumulative: '$6,120.00' },
  { period: 'May', rate: '1.8%', invested: '$85,000.00', profit: '$1,530.00', cumulative: '$7,650.00' },
  { period: 'June', rate: '1.8%', invested: '$85,000.00', profit: '$1,530.00', cumulative: '$9,180.00' },
  { period: 'July', rate: '1.8%', invested: '$85,000.00', profit: '$1,530.00', cumulative: '$10,710.00' },
  { period: 'August', rate: '1.8%', invested: '$85,000.00', profit: '$1,530.00', cumulative: '$12,240.00' },
  { period: 'September', rate: '1.8%', invested: '$85,000.00', profit: '$1,530.00', cumulative: '$13,770.00' },
  { period: 'October', rate: '1.8%', invested: '$85,000.00', profit: '$1,530.00', cumulative: '$15,300.00' },
  { period: 'November', rate: '1.8%', invested: '$85,000.00', profit: '$1,530.00', cumulative: '$16,830.00' },
  { period: 'December', rate: '1.8%', invested: '$85,000.00', profit: '$1,530.00', cumulative: '$18,360.00' },
];

const dailyLogs = [
  { date: 'Today', profit: '+$1,250.00' },
  { date: 'Yesterday', profit: '+$1,250.00' },
  { date: 'Oct 23, 2023', profit: '+$1,250.00' },
  { date: 'Oct 22, 2023', profit: '+$1,100.00' },
  { date: 'Oct 21, 2023', profit: '+$1,100.00' },
  { date: 'Oct 20, 2023', profit: '+$1,100.00' },
  { date: 'Oct 19, 2023', profit: '+$1,100.00' },
];

export default function Earnings() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Earnings Report</h1>
        <p className="text-muted-foreground">Detailed breakdown of your generated profits.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard delay={0} title="Daily Earnings" value="$1,250.00" icon={Activity} />
        <StatCard delay={0.1} title="Monthly Earnings" value="$37,500.00" icon={Calendar} />
        <StatCard delay={0.2} title="Total Profit" value="$28,430.50" icon={DollarSign} />
        <StatCard delay={0.3} title="ROI" value="33.4%" icon={TrendingUp} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 space-y-8"
        >
          <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Earnings Over Time</h2>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1EA7FF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1EA7FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(11,42,111,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#1EA7FF' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#1EA7FF" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

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
                  {breakdownData.map((row, i) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 + 0.5 }}
                      key={row.period} 
                      className={`border-b border-white/5 transition-colors ${i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.02]'}`}
                    >
                      <td className="p-4 font-medium text-white">{row.period}</td>
                      <td className="p-4 text-white">{row.rate}</td>
                      <td className="p-4 text-muted-foreground">{row.invested}</td>
                      <td className="p-4 text-accent font-semibold">{row.profit}</td>
                      <td className="p-4 text-white">{row.cumulative}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card/40 backdrop-blur-md border border-white/5 rounded-xl p-6 h-fit"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Daily Earnings Log</h2>
          <div className="space-y-4">
            {dailyLogs.map((log, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5">
                <div>
                  <p className="text-sm font-medium text-white">{log.date}</p>
                  <p className="text-xs text-muted-foreground mt-1">Compound yield</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <p className="text-sm font-bold text-accent">{log.profit}</p>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                    <Check size={10} /> Credited
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-primary hover:text-white transition-colors font-medium">
            View Full Log
          </button>
        </motion.div>
      </div>
    </div>
  );
}