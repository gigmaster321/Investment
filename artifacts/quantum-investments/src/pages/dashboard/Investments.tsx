import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Clock, ShieldCheck } from 'lucide-react';

const historyData = [
  { id: 1, plan: 'Gold Plan', amount: '$85,000.00', profit: '$28,430.50', start: 'Sep 15, 2023', end: 'Dec 14, 2023', status: 'Active' },
  { id: 2, plan: 'Starter Plan', amount: '$2,500.00', profit: '$600.00', start: 'Aug 01, 2023', end: 'Aug 30, 2023', status: 'Completed' },
  { id: 3, plan: 'Starter Plan', amount: '$1,000.00', profit: '$240.00', start: 'Jul 01, 2023', end: 'Jul 30, 2023', status: 'Completed' },
  { id: 4, plan: 'Gold Plan', amount: '$10,000.00', profit: '$5,400.00', start: 'May 10, 2023', end: 'Aug 08, 2023', status: 'Completed' },
  { id: 5, plan: 'Platinum Plan', amount: '$50,000.00', profit: '$37,500.00', start: 'Jan 15, 2023', end: 'Apr 15, 2023', status: 'Completed' },
  { id: 6, plan: 'Starter Plan', amount: '$4,000.00', profit: '$960.00', start: 'Dec 01, 2022', end: 'Dec 30, 2022', status: 'Completed' },
  { id: 7, plan: 'Gold Plan', amount: '$15,000.00', profit: '$8,100.00', start: 'Sep 01, 2022', end: 'Nov 30, 2022', status: 'Completed' },
  { id: 8, plan: 'Starter Plan', amount: '$1,500.00', profit: 'Expired', start: 'May 01, 2022', end: 'May 30, 2022', status: 'Expired' },
];

const plansData = [
  { id: 'starter', name: 'Starter', min: '$500', max: '$4,999', rate: '0.8%', current: false },
  { id: 'gold', name: 'Gold', min: '$5,000', max: '$49,999', rate: '1.8%', current: true },
  { id: 'platinum', name: 'Platinum', min: '$50,000', max: 'Unlimited', rate: '2.5%', current: false },
];

export default function Investments() {
  const [activeTab, setActiveTab] = useState('Active');

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Investments</h1>
        <p className="text-muted-foreground">Monitor your current plans and daily yields.</p>
      </header>

      <div className="flex bg-white/5 p-1 rounded-lg w-fit">
        {['Active', 'History', 'Plans'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === tab ? 'bg-primary/20 text-accent shadow-sm' : 'text-muted-foreground hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Active' && (
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card/40 backdrop-blur-md border border-primary/30 rounded-2xl p-8 relative overflow-hidden group hover:border-primary/50 transition-colors duration-500"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:bg-primary/20 transition-colors duration-500" />
            
            <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-accent/20 text-accent border border-accent/30 rounded-full text-xs font-bold uppercase tracking-wider">Gold Plan</span>
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium"><CheckCircle2 size={14}/> Active</span>
                </div>
                <h2 className="text-4xl font-bold text-white mt-4">$85,000.00</h2>
                <p className="text-muted-foreground mt-1">Principal Amount</p>
              </div>

              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><TrendingUp size={16}/> Daily Rate</p>
                  <p className="text-xl font-semibold text-white">1.8%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Clock size={16}/> Duration</p>
                  <p className="text-xl font-semibold text-white">90 Days</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                  <p className="text-sm font-semibold text-white">Sep 15, 2023</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">End Date</p>
                  <p className="text-sm font-semibold text-white">Dec 14, 2023</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Accrued Profit</p>
                  <p className="text-2xl font-bold text-accent">$28,430.50</p>
                </div>
                <p className="text-sm font-medium text-white">33% of expected total</p>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '33%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-accent rounded-full shadow-[0_0_10px_rgba(30,167,255,0.5)]" 
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="text-primary" /> Plan Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Daily Compound", desc: "Earnings are accrued and compounded daily directly into your balance." },
                { title: "Guaranteed Returns", desc: "Principal amount is insured against market volatility with our coverage." },
                { title: "24/7 Support", desc: "Priority round-the-clock access to your dedicated account manager." }
              ].map((benefit, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 p-5 rounded-xl hover:bg-white/[0.05] transition-colors">
                  <h4 className="text-sm font-semibold text-white mb-2">{benefit.title}</h4>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {activeTab === 'History' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <th className="p-4">Plan</th>
                  <th className="p-4">Amount Invested</th>
                  <th className="p-4">Profit Earned</th>
                  <th className="p-4">Start Date</th>
                  <th className="p-4">End Date</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {historyData.map((row, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    key={row.id} 
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="p-4 font-medium text-white">{row.plan}</td>
                    <td className="p-4 text-white">{row.amount}</td>
                    <td className="p-4 text-accent font-semibold">{row.profit}</td>
                    <td className="p-4 text-muted-foreground">{row.start}</td>
                    <td className="p-4 text-muted-foreground">{row.end}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                        row.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        row.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {activeTab === 'Plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plansData.map((plan, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={plan.id}
              className={`bg-card/40 backdrop-blur-md border rounded-2xl p-6 flex flex-col ${
                plan.current ? 'border-primary shadow-[0_0_30px_rgba(30,167,255,0.15)]' : 'border-white/5 hover:border-white/20'
              } transition-all duration-300`}
            >
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  {plan.current && (
                    <span className="px-2 py-1 bg-primary/20 text-accent border border-primary/30 rounded-md text-xs font-semibold">
                      Current Plan
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-1">Daily Return</p>
                  <p className="text-3xl font-bold text-accent">{plan.rate}</p>
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Min. Deposit</span>
                    <span className="text-white font-medium">{plan.min}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Max. Deposit</span>
                    <span className="text-white font-medium">{plan.max}</span>
                  </div>
                </div>
              </div>
              <button 
                className={`mt-auto w-full py-3 rounded-xl font-semibold transition-all ${
                  plan.current 
                    ? 'bg-white/10 text-white cursor-default' 
                    : 'bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(21,101,232,0.3)]'
                }`}
              >
                {plan.current ? 'Active' : 'Select Plan'}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}