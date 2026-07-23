import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, TrendingUp, Clock, ShieldCheck, X, DollarSign } from 'lucide-react';
import { formatInvestmentAmount, useInvestmentPlans, type InvestmentPlan } from '@/lib/investment-plans';
import { formatInvestmentDate, formatRemainingTime, useInvestments } from '@/lib/investments';
import type { Investment } from '@workspace/api-client-react';
import { toast } from '@/hooks/use-toast';

interface BuyPlanModalProps {
  plan: InvestmentPlan;
  onClose: () => void;
  onCreate: (amount: number) => Promise<Investment>;
}

function BuyPlanModal({ plan, onClose, onCreate }: BuyPlanModalProps) {
  const [amount, setAmount] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Investment | null>(null);

  const amountNum = Number(amount);
  const isValid = amount !== '' && Number.isFinite(amountNum) && amountNum >= plan.minInvestment &&
    (plan.maxInvestment === null || amountNum <= plan.maxInvestment);
  const estimatedProfit = isValid ? (amountNum * plan.profitPercentage / 100).toFixed(2) : '0.00';

  async function confirmInvestment() {
    if (!isValid) return;
    setSubmitting(true);
    try {
      setSubmitted(await onCreate(amountNum));
    } catch (cause) {
      toast({
        title: 'Unable to create investment',
        description: cause instanceof Error ? cause.message : 'Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-6 px-2">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Investment Submitted</h3>
        <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
          Your investment of <span className="text-white font-semibold">${submitted.investmentAmount.toLocaleString()}</span> in the{' '}
          <span className="text-accent font-semibold">{plan.name} Plan</span> has been received and is being processed.
        </p>
        <button onClick={onClose} className="mt-6 text-sm text-primary hover:text-accent font-medium transition-colors">Close</button>
      </motion.div>
    );
  }

  if (reviewing) {
    return (
      <div className="space-y-5">
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
          <h4 className="font-bold text-white text-lg mb-4">Confirm Investment</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4"><span className="text-muted-foreground">Selected Plan</span><span className="text-white font-semibold">{plan.name}</span></div>
            <div className="flex items-center justify-between gap-4"><span className="text-muted-foreground">Investment Amount</span><span className="text-white font-semibold">${amountNum.toLocaleString()}</span></div>
            <div className="flex items-center justify-between gap-4"><span className="text-muted-foreground">Expected Profit Percentage</span><span className="text-accent font-semibold">{plan.profitPercentage}%</span></div>
            <div className="flex items-center justify-between gap-4"><span className="text-muted-foreground">Execution Cycle</span><span className="text-white font-semibold">{plan.executionCycle}</span></div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => void confirmInvestment()} disabled={submitting} className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white py-3.5 rounded-xl font-semibold transition-all">
            {submitting ? 'Submitting…' : 'Confirm Investment'}
          </button>
          <button onClick={onClose} disabled={submitting} className="flex-1 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white border border-white/10 py-3.5 rounded-xl font-semibold transition-all">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-bold text-white text-lg">{plan.name} Plan</h4>
          <span className="text-accent font-bold text-xl">{plan.profitPercentage}%<span className="text-sm text-muted-foreground font-normal"> target</span></span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div><p className="text-muted-foreground text-xs mb-1 flex items-center gap-1"><Clock size={11} /> Duration</p><p className="text-white font-medium">{plan.executionCycle}</p></div>
          <div><p className="text-muted-foreground text-xs mb-1">Min. Deposit</p><p className="text-white font-medium">{formatInvestmentAmount(plan.minInvestment)}</p></div>
          <div><p className="text-muted-foreground text-xs mb-1">Max. Deposit</p><p className="text-white font-medium">{formatInvestmentAmount(plan.maxInvestment)}</p></div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">Investment Amount (USD)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
          <input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={`Min. ${formatInvestmentAmount(plan.minInvestment)}`} min={plan.minInvestment} max={plan.maxInvestment ?? undefined} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
        </div>
        {amount !== '' && !isValid && <p className="text-xs text-red-400 mt-1.5">{amountNum < plan.minInvestment ? `Minimum investment is ${formatInvestmentAmount(plan.minInvestment)}` : `Maximum investment is ${formatInvestmentAmount(plan.maxInvestment)}`}</p>}
      </div>

      {isValid && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-accent text-sm"><TrendingUp size={16} /><span className="font-medium">Expected return</span></div>
          <span className="text-white font-bold text-lg">${(amountNum + Number(estimatedProfit)).toFixed(2)}</span>
        </motion.div>
      )}

      <button onClick={() => { if (isValid) setReviewing(true); }} disabled={!isValid} className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(21,101,232,0.3)]">
        <DollarSign size={18} /> Invest Now
      </button>
    </div>
  );
}

function money(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusClass(status: string) {
  if (status === 'Completed') return 'bg-green-500/10 text-green-400 border-green-500/20';
  if (status === 'Active') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (status === 'Pending') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  if (status === 'Cancelled') return 'bg-red-500/10 text-red-400 border-red-500/20';
  return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
}

export default function Investments() {
  const [activeTab, setActiveTab] = useState('Active');
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null);
  const { plans, loading } = useInvestmentPlans();
  const { investments, loading: investmentsLoading, create } = useInvestments();
  const activePlans = plans.filter((plan) => plan.status === 'Active');
  const activeInvestments = investments.filter((investment) => ['Pending', 'Active'].includes(investment.displayStatus));
  const historyInvestments = investments.filter((investment) => ['Completed', 'Cancelled'].includes(investment.displayStatus));

  async function createUserInvestment(amount: number) {
    if (!selectedPlan) throw new Error('Select an investment plan first.');
    return create({ planId: selectedPlan.id, amount });
  }

  return (
    <div className="space-y-8">
      <header><h1 className="text-3xl font-bold tracking-tight text-white mb-2">Investments</h1><p className="text-muted-foreground">Monitor your current plans and daily yields.</p></header>

      <div className="flex bg-white/5 p-1 rounded-lg w-fit">
        {['Active', 'History', 'Plans'].map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === tab ? 'bg-primary/20 text-accent shadow-sm' : 'text-muted-foreground hover:text-white'}`}>{tab}</button>)}
      </div>

      {activeTab === 'Active' && (
        <div className="space-y-8">
          {investmentsLoading && <div className="bg-card/40 border border-white/5 rounded-2xl p-8 text-sm text-muted-foreground">Loading your investments…</div>}
          {!investmentsLoading && activeInvestments.map((investment) => (
            <motion.div key={investment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/40 backdrop-blur-md border border-primary/30 rounded-2xl p-8 relative overflow-hidden group hover:border-primary/50 transition-colors duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none group-hover:bg-primary/20 transition-colors duration-500" />
              <div className="flex flex-col lg:flex-row justify-between gap-8 relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-accent/20 text-accent border border-accent/30 rounded-full text-xs font-bold uppercase tracking-wider">{investment.plan.name} Plan</span>
                    <span className={`flex items-center gap-1 text-xs font-medium ${investment.displayStatus === 'Pending' ? 'text-amber-400' : investment.displayStatus === 'Paused' ? 'text-orange-400' : 'text-emerald-400'}`}><CheckCircle2 size={14} /> {investment.displayStatus}</span>
                  </div>
                  <h2 className="text-4xl font-bold text-white mt-4">{money(investment.investmentAmount)}</h2><p className="text-muted-foreground mt-1">Investment Amount</p>
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  <div><p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><TrendingUp size={16} /> Profit Percentage</p><p className="text-xl font-semibold text-white">{investment.profitPercentage}%</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Clock size={16} /> Execution Cycle</p><p className="text-xl font-semibold text-white">{investment.plan.executionCycle}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Investment Date</p><p className="text-sm font-semibold text-white">{formatInvestmentDate(investment.investmentDate)}</p></div>
                  <div><p className="text-sm text-muted-foreground mb-1">Maturity Date</p><p className="text-sm font-semibold text-white">{formatInvestmentDate(investment.maturityDate)}</p></div>
                </div>
              </div>
              <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-3">
                  <div><p className="text-sm text-muted-foreground mb-1">Expected Return</p><p className="text-2xl font-bold text-accent">{money(investment.expectedReturn)}</p></div>
                  <p className="text-sm font-medium text-white">{investment.displayStatus === 'Pending' ? 'Awaiting activation' : formatRemainingTime(investment.remainingSeconds)}</p>
                </div>
                <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: investment.status === 'Pending' ? '0%' : investment.remainingSeconds > 0 ? '33%' : '100%' }} transition={{ duration: 1, delay: 0.5 }} className="h-full bg-accent rounded-full shadow-[0_0_10px_rgba(30,167,255,0.5)]" /></div>
              </div>
            </motion.div>
          ))}
          {!investmentsLoading && activeInvestments.length === 0 && <div className="bg-card/40 border border-white/5 rounded-2xl p-8 text-center"><p className="text-white font-semibold">No active investment plans yet.</p><p className="text-muted-foreground text-sm mt-1">Open the Plans tab to start a new investment.</p></div>}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2"><ShieldCheck className="text-primary" /> Plan Benefits</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[
              { title: 'Daily Compound', desc: 'Earnings are accrued and compounded daily directly into your balance.' },
              { title: 'Guaranteed Returns', desc: 'Principal amount is insured against market volatility with our coverage.' },
              { title: '24/7 Support', desc: 'Priority round-the-clock access to your dedicated account manager.' },
            ].map((benefit) => <div key={benefit.title} className="bg-white/[0.02] border border-white/5 p-5 rounded-xl hover:bg-white/[0.05] transition-colors"><h4 className="text-sm font-semibold text-white mb-2">{benefit.title}</h4><p className="text-sm text-muted-foreground">{benefit.desc}</p></div>)}</div>
          </motion.div>
        </div>
      )}

      {activeTab === 'History' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead><tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-wider text-muted-foreground font-semibold"><th className="p-4">Plan</th><th className="p-4">Amount Invested</th><th className="p-4">Expected Return</th><th className="p-4">Start Date</th><th className="p-4">End Date</th><th className="p-4">Status</th></tr></thead>
              <tbody>
                {historyInvestments.map((investment, index) => <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} key={investment.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="p-4 font-medium text-white">{investment.plan.name} Plan</td><td className="p-4 text-white">{money(investment.investmentAmount)}</td><td className="p-4 text-accent font-semibold">{money(investment.expectedReturn)}</td><td className="p-4 text-muted-foreground">{formatInvestmentDate(investment.investmentDate)}</td><td className="p-4 text-muted-foreground">{formatInvestmentDate(investment.maturityDate)}</td><td className="p-4"><span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${statusClass(investment.displayStatus)}`}>{investment.displayStatus}</span></td>
                </motion.tr>)}
              </tbody>
            </table>
          </div>
          {!investmentsLoading && historyInvestments.length === 0 && <p className="p-10 text-center text-sm text-muted-foreground">No completed or cancelled investments yet.</p>}
        </motion.div>
      )}

      {activeTab === 'Plans' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activePlans.map((plan, index) => <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} key={plan.id} className={`bg-card/40 backdrop-blur-md border rounded-2xl p-6 flex flex-col ${index === 1 ? 'border-primary shadow-[0_0_30px_rgba(30,167,255,0.15)]' : 'border-white/5 hover:border-white/20'} transition-all duration-300`}>
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-white">{plan.name}</h3>{index === 1 && <span className="px-2 py-1 bg-primary/20 text-accent border border-primary/30 rounded-md text-xs font-semibold">Featured</span>}</div>
              <div className="mb-4"><p className="text-sm text-muted-foreground mb-1">Profit Percentage</p><p className="text-3xl font-bold text-accent">{plan.profitPercentage}%</p></div>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Min. Deposit</span><span className="text-white font-medium">{formatInvestmentAmount(plan.minInvestment)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Max. Deposit</span><span className="text-white font-medium">{formatInvestmentAmount(plan.maxInvestment)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Duration</span><span className="text-white font-medium">{plan.executionCycle}</span></div>
              </div>
            </div>
            <button onClick={() => setSelectedPlan(plan)} className={`mt-auto w-full py-3 rounded-xl font-semibold transition-all ${index === 1 ? 'bg-white/10 text-white' : 'bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(21,101,232,0.3)]'}`}>Invest Now</button>
          </motion.div>)}
          {!loading && activePlans.length === 0 && <p className="col-span-full text-center text-sm text-muted-foreground">No active investment plans are available.</p>}
        </div>
      )}

      <AnimatePresence>
        {selectedPlan && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(event) => { if (event.target === event.currentTarget) setSelectedPlan(null); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 16 }} transition={{ duration: 0.2 }} className="bg-[hsl(221,70%,13%)] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5"><h2 className="text-lg font-bold text-white">Invest in {selectedPlan.name} Plan</h2><button onClick={() => setSelectedPlan(null)} className="text-muted-foreground hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"><X size={20} /></button></div>
            <BuyPlanModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} onCreate={createUserInvestment} />
          </motion.div>
        </motion.div>}
      </AnimatePresence>
    </div>
  );
}