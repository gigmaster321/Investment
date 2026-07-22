import { motion } from 'framer-motion';
import { CheckCircle2, TrendingUp, Clock, ShieldCheck } from 'lucide-react';

export default function Investments() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Active Investments</h1>
        <p className="text-muted-foreground">Monitor your current plans and daily yields.</p>
      </header>

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
            { title: "Capital Protected", desc: "Principal amount is insured against market volatility." },
            { title: "Priority Support", desc: "24/7 access to your dedicated account manager." },
            { title: "Instant Withdrawals", desc: "Profit withdrawals are processed with zero delay." }
          ].map((benefit, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 p-5 rounded-xl hover:bg-white/[0.05] transition-colors">
              <h4 className="text-sm font-semibold text-white mb-2">{benefit.title}</h4>
              <p className="text-sm text-muted-foreground">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}