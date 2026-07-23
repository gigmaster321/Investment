import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, Eye, PauseCircle, PlayCircle, RefreshCw,
  Search, ShieldCheck, XCircle,
} from 'lucide-react';
import { listInvestments, updateInvestmentStatus, type Investment, type InvestmentStatusActionAction } from '@workspace/api-client-react';
import { toast } from '@/hooks/use-toast';
import { formatInvestmentDate } from '@/lib/investments';

const STATUS_STYLES: Record<string, string> = {
  Pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Paused: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Completed: 'text-accent bg-accent/10 border-accent/20',
  Cancelled: 'text-red-400 bg-red-500/10 border-red-500/20',
};

function money(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function statusIcon(status: string) {
  if (status === 'Active') return CheckCircle2;
  if (status === 'Pending') return Clock;
  if (status === 'Cancelled') return XCircle;
  return ShieldCheck;
}

export default function AdminInvestments() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [detail, setDetail] = useState<Investment | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setInvestments(await listInvestments({ scope: 'all' }));
    } catch (cause) {
      toast({ title: 'Unable to load investments', description: cause instanceof Error ? cause.message : 'Please try again.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase();
    return investments.filter((investment) => {
      const matchesSearch = !query ||
        investment.id.toLowerCase().includes(query) ||
        investment.user.name.toLowerCase().includes(query) ||
        investment.user.email.toLowerCase().includes(query) ||
        investment.plan.name.toLowerCase().includes(query);
      const matchesStatus = statusFilter === 'All' || investment.displayStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [investments, search, statusFilter]);

  const counts = useMemo(() => ({
    all: investments.length,
    pending: investments.filter((investment) => investment.displayStatus === 'Pending').length,
    active: investments.filter((investment) => investment.displayStatus === 'Active').length,
    paused: investments.filter((investment) => investment.displayStatus === 'Paused').length,
    completed: investments.filter((investment) => investment.displayStatus === 'Completed').length,
  }), [investments]);

  async function applyAction(investment: Investment, action: InvestmentStatusActionAction) {
    try {
      const updated = await updateInvestmentStatus(investment.id, { action });
      setInvestments((current) => current.map((item) => item.id === updated.id ? updated : item));
      if (detail?.id === updated.id) setDetail(updated);
      toast({
        title: action === 'pause' ? 'Investment Paused' : `Investment ${action}d`,
        description: `${investment.id} is now ${updated.displayStatus}.`,
      });
    } catch (cause) {
      toast({ title: 'Unable to update investment', description: cause instanceof Error ? cause.message : 'Please try again.' });
    }
  }

  return (
    <div className="space-y-6">
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setDetail(null)}>
          <div className="bg-[hsl(221,70%,10%)] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div><p className="text-sm font-bold text-white">Investment Details</p><p className="text-[10px] text-muted-foreground mt-0.5">{detail.id}</p></div>
              <button onClick={() => setDetail(null)} className="text-muted-foreground hover:text-white text-xs">Close</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {[
                ['User', detail.user.name],
                ['Email', detail.user.email],
                ['Plan', detail.plan.name],
                ['Amount', money(detail.investmentAmount)],
                ['Profit Percentage', `${detail.profitPercentage}%`],
                ['Expected Return', money(detail.expectedReturn)],
                ['Investment Date', formatInvestmentDate(detail.investmentDate)],
                ['Maturity Date', formatInvestmentDate(detail.maturityDate)],
              ].map(([label, value]) => (
                <div key={label} className="bg-white/[0.03] border border-white/5 rounded-lg p-3">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground/60">{label}</p>
                  <p className="text-xs text-white font-semibold mt-1 break-words">{value}</p>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5 flex flex-wrap gap-2">
              {detail.displayStatus === 'Pending' && <button onClick={() => void applyAction(detail, 'activate')} className="admin-action text-emerald-400 border-emerald-500/20"><PlayCircle size={13} /> Activate</button>}
              {detail.displayStatus === 'Active' && <button onClick={() => void applyAction(detail, 'pause')} className="admin-action text-orange-400 border-orange-500/20"><PauseCircle size={13} /> Pause</button>}
              {(detail.displayStatus === 'Active' || detail.displayStatus === 'Paused') && <button onClick={() => void applyAction(detail, 'complete')} className="admin-action text-accent border-accent/20"><CheckCircle2 size={13} /> Complete</button>}
              {!['Completed', 'Cancelled'].includes(detail.displayStatus) && <button onClick={() => void applyAction(detail, 'cancel')} className="admin-action text-red-400 border-red-500/20"><XCircle size={13} /> Cancel</button>}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Investment Assignments</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Review user investments and control their lifecycle.</p>
        </div>
        <button onClick={() => void refresh()} className="self-start sm:self-auto flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-white border border-white/10 rounded-lg px-3 py-2.5 transition-colors">
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          ['All', counts.all, 'All'],
          ['Pending', counts.pending, 'Pending'],
          ['Active', counts.active, 'Active'],
          ['Paused', counts.paused, 'Paused'],
          ['Completed', counts.completed, 'Completed'],
        ].map(([label, value, filter]) => (
          <button key={label} onClick={() => setStatusFilter(filter === 'All' ? 'All' : String(filter))} className={`text-left rounded-xl border p-3 transition-colors ${statusFilter === filter ? 'bg-primary/15 border-primary/30' : 'bg-card/40 border-white/5 hover:bg-card/60'}`}>
            <p className="text-white font-bold text-lg">{value}</p>
            <p className="text-muted-foreground text-[10px]">{label}</p>
          </button>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-card/40 border border-white/5 rounded-xl overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-4 border-b border-white/5">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search user, plan, ID…" className="h-8 w-60 pl-8 pr-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white placeholder:text-white/25 focus:outline-none focus:border-accent/40" />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-8 md:ml-auto rounded-lg bg-[hsl(221,70%,12%)] border border-white/10 text-xs text-white px-3 focus:outline-none">
            {['All', 'Pending', 'Active', 'Paused', 'Completed', 'Cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead><tr className="border-b border-white/5">{['Investment', 'User', 'Plan', 'Amount', 'Profit %', 'Investment Date', 'Maturity Date', 'Status', 'Actions'].map((heading) => <th key={heading} className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-4 py-3 whitespace-nowrap">{heading}</th>)}</tr></thead>
            <tbody>
              {rows.map((investment) => {
                const Icon = statusIcon(investment.displayStatus);
                return (
                  <tr key={investment.id} className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                    <td className="px-4 py-3.5"><p className="text-white text-xs font-semibold">{investment.id}</p><p className="text-[10px] text-muted-foreground">{investment.plan.executionCycle}</p></td>
                    <td className="px-4 py-3.5"><p className="text-white text-xs">{investment.user.name}</p><p className="text-[10px] text-muted-foreground">{investment.user.email}</p></td>
                    <td className="px-4 py-3.5 text-accent text-xs font-semibold">{investment.plan.name}</td>
                    <td className="px-4 py-3.5 text-white text-xs font-bold">{money(investment.investmentAmount)}</td>
                    <td className="px-4 py-3.5 text-accent text-xs font-bold">{investment.profitPercentage}%</td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs whitespace-nowrap">{formatInvestmentDate(investment.investmentDate)}</td>
                    <td className="px-4 py-3.5 text-muted-foreground text-xs whitespace-nowrap">{formatInvestmentDate(investment.maturityDate)}</td>
                    <td className="px-4 py-3.5"><span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[investment.displayStatus] ?? STATUS_STYLES.Pending}`}><Icon size={9} />{investment.displayStatus}</span></td>
                    <td className="px-4 py-3.5"><button onClick={() => setDetail(investment)} className="flex items-center gap-1.5 text-[10px] font-semibold text-accent hover:bg-accent/10 border border-accent/20 rounded-md px-2.5 py-1 transition-colors"><Eye size={11} /> View</button></td>
                  </tr>
                );
              })}
              {!loading && rows.length === 0 && <tr><td colSpan={9} className="px-5 py-14 text-center text-sm text-muted-foreground">No investment records match your filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-white/5 text-[10px] text-muted-foreground/50">Showing {rows.length} of {investments.length} investments</div>
      </motion.div>
    </div>
  );
}