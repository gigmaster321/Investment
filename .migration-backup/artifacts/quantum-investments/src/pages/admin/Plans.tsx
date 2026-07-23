import { motion } from 'framer-motion';
import { CreditCard, Users, TrendingUp, Zap, Star, Award, Gem } from 'lucide-react';

const PLANS = [
  {
    key: 'starter',
    name: 'Starter',
    icon: Zap,
    color: 'from-slate-600/30 to-slate-500/10',
    border: 'border-slate-500/25',
    glow: 'shadow-[0_0_30px_rgba(100,116,139,0.15)]',
    accentColor: 'text-slate-300',
    badgeBg: 'bg-slate-500/15 border-slate-400/20 text-slate-300',
    minDeposit: '$100',
    maxDeposit: '$999',
    roi: '5%',
    duration: '30 days',
    users: 1842,
    totalDeposited: '$284,100',
    features: ['Daily ROI payouts', 'Email support', 'Basic analytics', 'Referral bonus 2%'],
  },
  {
    key: 'silver',
    name: 'Silver',
    icon: Star,
    color: 'from-slate-400/30 to-slate-300/10',
    border: 'border-slate-400/30',
    glow: 'shadow-[0_0_30px_rgba(148,163,184,0.15)]',
    accentColor: 'text-slate-200',
    badgeBg: 'bg-slate-400/15 border-slate-300/20 text-slate-200',
    minDeposit: '$1,000',
    maxDeposit: '$4,999',
    roi: '8%',
    duration: '30 days',
    users: 1203,
    totalDeposited: '$3.6M',
    features: ['Daily ROI payouts', 'Priority email support', 'Advanced analytics', 'Referral bonus 4%', 'Faster withdrawals'],
  },
  {
    key: 'gold',
    name: 'Gold',
    icon: Award,
    color: 'from-amber-600/30 to-amber-500/10',
    border: 'border-amber-500/30',
    glow: 'shadow-[0_0_40px_rgba(245,158,11,0.15)]',
    accentColor: 'text-amber-300',
    badgeBg: 'bg-amber-500/15 border-amber-400/20 text-amber-300',
    minDeposit: '$5,000',
    maxDeposit: '$24,999',
    roi: '12%',
    duration: '30 days',
    users: 614,
    totalDeposited: '$18.2M',
    features: ['Daily ROI payouts', '24/7 dedicated support', 'Full analytics suite', 'Referral bonus 6%', 'Same-day withdrawals', 'Portfolio manager'],
  },
  {
    key: 'platinum',
    name: 'Platinum',
    icon: Gem,
    color: 'from-cyan-600/30 to-cyan-500/10',
    border: 'border-cyan-500/30',
    glow: 'shadow-[0_0_50px_rgba(6,182,212,0.2)]',
    accentColor: 'text-cyan-300',
    badgeBg: 'bg-cyan-500/15 border-cyan-400/20 text-cyan-300',
    minDeposit: '$25,000',
    maxDeposit: 'Unlimited',
    roi: '18%',
    duration: '30 days',
    users: 162,
    totalDeposited: '$47.8M',
    features: ['Daily ROI payouts', 'Personal account manager', 'Real-time analytics', 'Referral bonus 10%', 'Instant withdrawals', 'VIP investment advisory', 'Custom strategies'],
  },
];

export default function AdminPlans() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Investment Plans</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage and monitor all active investment plans.</p>
        </div>
        <button className="self-start sm:self-auto flex items-center gap-2 text-xs font-semibold text-white bg-gradient-to-r from-primary to-accent rounded-lg px-4 py-2.5 hover:shadow-[0_0_20px_rgba(30,167,255,0.3)] hover:scale-[1.02] transition-all duration-200">
          <CreditCard size={14} />
          Add New Plan
        </button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Plans', value: '4', icon: CreditCard },
          { label: 'Total Investors', value: '3,821', icon: Users },
          { label: 'Avg ROI', value: '10.75%', icon: TrendingUp },
          { label: 'Total AUM', value: '$69.9M', icon: Gem },
        ].map((s) => (
          <div key={s.label} className="bg-card/40 border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className="bg-primary/15 p-2 rounded-lg shrink-0">
              <s.icon size={16} className="text-accent" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">{s.value}</p>
              <p className="text-muted-foreground text-[11px]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.key}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className={`bg-gradient-to-br ${plan.color} border ${plan.border} rounded-2xl p-6 flex flex-col gap-5 ${plan.glow} hover:-translate-y-0.5 transition-all duration-200`}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl bg-white/5 border ${plan.border}`}>
                  <plan.icon size={20} className={plan.accentColor} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${plan.badgeBg}`}>
                    Active
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-3xl font-black ${plan.accentColor}`}>{plan.roi}</p>
                <p className="text-muted-foreground text-[10px]">monthly ROI</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 bg-black/20 rounded-xl p-3">
              {[
                { label: 'Investors', value: plan.users.toLocaleString() },
                { label: 'Total Deposited', value: plan.totalDeposited },
                { label: 'Duration', value: plan.duration },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-white font-bold text-sm">{s.value}</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Deposit range */}
            <div className="flex items-center justify-between bg-black/15 rounded-lg px-4 py-2.5">
              <div>
                <p className="text-muted-foreground text-[10px]">Min Deposit</p>
                <p className={`font-bold text-sm ${plan.accentColor}`}>{plan.minDeposit}</p>
              </div>
              <div className={`h-px flex-1 mx-4 bg-gradient-to-r from-transparent via-white/10 to-transparent`} />
              <div className="text-right">
                <p className="text-muted-foreground text-[10px]">Max Deposit</p>
                <p className={`font-bold text-sm ${plan.accentColor}`}>{plan.maxDeposit}</p>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-1.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className={`w-1 h-1 rounded-full ${plan.accentColor} bg-current shrink-0`} />
                  {f}
                </li>
              ))}
            </ul>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button className={`flex-1 text-xs font-semibold py-2 rounded-lg border ${plan.border} ${plan.accentColor} hover:bg-white/5 transition-colors`}>
                Edit Plan
              </button>
              <button className="flex-1 text-xs font-semibold py-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-white transition-colors">
                View Investors
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
