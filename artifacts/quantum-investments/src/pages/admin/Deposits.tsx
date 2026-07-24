import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Clock, CheckCircle, XCircle, Search,
  Eye, X, Calendar, ChevronDown, Wallet,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { depositApi, type DepositRequest } from '@/lib/deposit-api';

// ─── Types ────────────────────────────────────────────────────────────────────

type DepositStatus = 'Pending' | 'Approved' | 'Rejected';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<DepositStatus, { color: string; bg: string; border: string; Icon: typeof Clock }> = {
  Pending:  { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   Icon: Clock },
  Approved: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', Icon: CheckCircle },
  Rejected: { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     Icon: XCircle },
};

const COINS = ['All', 'Bitcoin', 'Ethereum', 'USDT'];
const STATUSES: Array<'All' | DepositStatus> = ['All', 'Pending', 'Approved', 'Rejected'];

function truncate(str: string, n = 20) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ─── Screenshot Modal ────────────────────────────────────────────────────────

function ScreenshotModal({ url, id, onClose }: { url: string; id: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(5,12,28,0.85)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="relative bg-[hsl(221,70%,10%)] border border-white/10 rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
            <div>
              <p className="text-sm font-semibold text-white">Deposit Screenshot</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{id}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="p-4">
            <img
              src={url} alt={`Screenshot for ${id}`}
              className="w-full rounded-lg border border-white/5 object-contain max-h-[420px] bg-white/3"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/800x500/0a1628/ffffff?text=Screenshot+Not+Available';
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Approve Modal ────────────────────────────────────────────────────────────

interface ApproveModalProps {
  deposit: DepositRequest;
  onClose: () => void;
  onApprove: (id: number, amount: number) => Promise<void>;
  onReject: (id: number) => Promise<void>;
}

function ApproveModal({ deposit, onClose, onApprove, onReject }: ApproveModalProps) {
  const [approvedAmount, setApprovedAmount] = useState(String(Number(deposit.amount).toFixed(2)));
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null);

  const handleApprove = async () => {
    const num = Number(approvedAmount);
    if (!num || num <= 0) {
      toast({ title: 'Invalid amount', description: 'Enter a valid approved amount.' });
      return;
    }
    setLoading('approve');
    try {
      await onApprove(deposit.id, num);
      onClose();
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async () => {
    setLoading('reject');
    try {
      await onReject(deposit.id);
      onClose();
    } finally {
      setLoading(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(5,12,28,0.85)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="bg-[hsl(221,70%,10%)] border border-white/10 rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div>
              <p className="text-sm font-semibold text-white">Review Deposit</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">DEP-{deposit.id}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* User info */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">User</span>
                <span className="text-white font-medium">{deposit.user_full_name ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email</span>
                <span className="text-white text-xs">{deposit.user_email ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plan</span>
                <span className="text-accent font-medium">{deposit.plan_name ?? 'No plan selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="text-white">{deposit.payment_method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Requested Amount</span>
                <span className="text-white font-bold">${Number(deposit.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="text-white text-xs">{formatDate(deposit.created_at)}</span>
              </div>
              {deposit.transaction_id && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground shrink-0">TXN ID</span>
                  <span className="text-white font-mono text-xs break-all text-right">{deposit.transaction_id}</span>
                </div>
              )}
            </div>

            {/* Screenshot */}
            {deposit.screenshot_data && (
              <div>
                <p className="text-xs font-medium text-white/60 mb-2">Payment Screenshot</p>
                <img
                  src={deposit.screenshot_data}
                  alt="Payment screenshot"
                  className="w-full rounded-xl border border-white/10 object-contain max-h-48 bg-black/20"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/800x500/0a1628/ffffff?text=Screenshot+Not+Available';
                  }}
                />
              </div>
            )}
            {!deposit.screenshot_data && (
              <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center text-xs text-muted-foreground">
                No screenshot provided
              </div>
            )}

            {/* Approved amount (editable) */}
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Approved Deposit Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                <input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(e.target.value)}
                  min={0.01}
                  step={0.01}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">You can edit this amount before approving.</p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-1">
              <button
                onClick={handleApprove}
                disabled={!!loading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-colors"
              >
                {loading === 'approve' ? 'Approving…' : '✓ Approve'}
              </button>
              <button
                onClick={handleReject}
                disabled={!!loading}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-red-600/80 hover:bg-red-500 disabled:opacity-50 text-white transition-colors"
              >
                {loading === 'reject' ? 'Rejecting…' : '✕ Reject'}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Filter Select ────────────────────────────────────────────────────────────

function FilterSelect({ value, options, onChange, icon: Icon }: {
  value: string; options: string[]; onChange: (v: string) => void; icon?: typeof ChevronDown;
}) {
  return (
    <div className="relative">
      {Icon && <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />}
      <select
        value={value} onChange={(e) => onChange(e.target.value)}
        className={`h-8 rounded-lg bg-muted/40 border border-white/10 text-xs text-white appearance-none pr-7 focus:outline-none focus:border-accent/40 transition-colors ${Icon ? 'pl-8' : 'pl-3'}`}
      >
        {options.map((o) => <option key={o} value={o} className="bg-[hsl(221,70%,12%)]">{o}</option>)}
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDeposits() {
  const adminName = 'Admin';

  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [screenshotDeposit, setScreenshotDeposit] = useState<DepositRequest | null>(null);
  const [reviewDeposit, setReviewDeposit] = useState<DepositRequest | null>(null);

  // Filters
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState<string>('All');
  const [coinFilter, setCoin]     = useState<string>('All');
  const [dateFilter, setDate]     = useState<string>('');

  const loadDeposits = useCallback(async () => {
    setLoadingList(true);
    try {
      const rows = await depositApi.list();
      setDeposits(rows);
    } catch (err: any) {
      toast({ title: 'Failed to load deposits', description: err?.message ?? 'Server error.' });
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { void loadDeposits(); }, [loadDeposits]);

  // Summary counts
  const counts = useMemo(() => ({
    All:      deposits.length,
    Pending:  deposits.filter((d) => d.status === 'Pending').length,
    Approved: deposits.filter((d) => d.status === 'Approved').length,
    Rejected: deposits.filter((d) => d.status === 'Rejected').length,
  }), [deposits]);

  // Filtered rows
  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return deposits.filter((d) => {
      const matchSearch = !q ||
        (d.user_full_name ?? '').toLowerCase().includes(q) ||
        (d.user_username ?? '').toLowerCase().includes(q) ||
        (d.user_email ?? '').toLowerCase().includes(q) ||
        `dep-${d.id}`.includes(q);
      const matchStatus = statusFilter === 'All' || d.status === statusFilter;
      const matchCoin   = coinFilter === 'All' || d.payment_method.toLowerCase().includes(coinFilter.toLowerCase());
      const matchDate   = !dateFilter || d.created_at.startsWith(dateFilter);
      return matchSearch && matchStatus && matchCoin && matchDate;
    });
  }, [deposits, search, statusFilter, coinFilter, dateFilter]);

  // ── Approve ──────────────────────────────────────────────────────────────
  const handleApprove = async (id: number, approved_amount: number) => {
    await depositApi.approve(id, approved_amount);
    setDeposits((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: 'Approved', approved_amount: approved_amount.toFixed(2), reviewed_by: adminName }
          : d,
      ),
    );
    toast({
      title: '✅ Deposit Approved',
      description: `Deposit DEP-${id} has been approved. User balance updated.`,
    });
  };

  // ── Reject ───────────────────────────────────────────────────────────────
  const handleReject = async (id: number) => {
    await depositApi.reject(id);
    setDeposits((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, status: 'Rejected', reviewed_by: adminName } : d,
      ),
    );
    toast({
      title: '❌ Deposit Rejected',
      description: `Deposit DEP-${id} has been rejected. User balance unchanged.`,
    });
  };

  const COLS = ['User', 'Email', 'Plan', 'Amount', 'Approved', 'Screenshot', 'Date', 'Status', 'Actions'];

  return (
    <>
      {/* Screenshot modal */}
      {screenshotDeposit && (
        <ScreenshotModal
          url={screenshotDeposit.screenshot_data ?? ''}
          id={`DEP-${screenshotDeposit.id}`}
          onClose={() => setScreenshotDeposit(null)}
        />
      )}

      {/* Approve/Reject modal */}
      {reviewDeposit && (
        <ApproveModal
          deposit={reviewDeposit}
          onClose={() => setReviewDeposit(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Deposits</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Review and approve all incoming deposit requests.</p>
          </div>
          <button onClick={loadDeposits} className="text-xs text-accent hover:text-accent/70 transition-colors border border-accent/20 rounded-lg px-3 py-1.5">
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((key) => {
            const meta = key === 'All'
              ? { color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20', Icon: DollarSign }
              : STATUS_STYLE[key as DepositStatus];
            const active = statusFilter === key;
            return (
              <button key={key} onClick={() => setStatus(key)}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                  active ? `${meta.bg} ${meta.border} shadow-[0_0_20px_rgba(30,167,255,0.08)]` : 'bg-card/40 border-white/5 hover:bg-card/60'
                }`}
              >
                <div className={`p-2.5 rounded-lg ${meta.bg} border ${meta.border}`}>
                  <meta.Icon size={16} className={meta.color} />
                </div>
                <div>
                  <p className="text-white font-bold text-xl">{counts[key]}</p>
                  <p className="text-muted-foreground text-[10px]">{key === 'All' ? 'Total' : key}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Table Panel */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="bg-card/40 border border-white/5 rounded-xl overflow-hidden"
        >
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-4 border-b border-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <Input
                placeholder="Search user, email, ID…"
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 w-56 bg-muted/40 border-white/10 text-white placeholder:text-white/25 text-xs"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 md:ml-auto">
              <FilterSelect value={statusFilter} options={STATUSES} onChange={setStatus} />
              <FilterSelect value={coinFilter} options={COINS} onChange={setCoin} icon={Wallet} />
              <div className="relative">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <Input
                  type="date" value={dateFilter} onChange={(e) => setDate(e.target.value)}
                  className="pl-8 h-8 w-40 bg-muted/40 border-white/10 text-white text-xs [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-white/5">
                  {COLS.map((h) => (
                    <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loadingList ? (
                  <tr><td colSpan={9} className="px-5 py-14 text-center text-muted-foreground text-sm">Loading deposits…</td></tr>
                ) : rows.map((d) => {
                  const s = STATUS_STYLE[d.status];
                  return (
                    <motion.tr key={d.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">

                      {/* User */}
                      <td className="px-4 py-3.5">
                        <p className="text-white text-xs font-medium whitespace-nowrap">{d.user_full_name ?? '—'}</p>
                        <p className="text-muted-foreground text-[10px] font-mono">DEP-{d.id}</p>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 text-muted-foreground text-[10px] whitespace-nowrap">{d.user_email ?? '—'}</td>

                      {/* Plan */}
                      <td className="px-4 py-3.5">
                        <span className="text-xs text-accent font-medium">{d.plan_name ?? '—'}</span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 text-white text-xs font-bold whitespace-nowrap">
                        ${Number(d.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>

                      {/* Approved Amount */}
                      <td className="px-4 py-3.5 text-xs font-semibold whitespace-nowrap">
                        {d.approved_amount
                          ? <span className="text-emerald-400">${Number(d.approved_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          : <span className="text-muted-foreground/40">—</span>}
                      </td>

                      {/* Screenshot */}
                      <td className="px-4 py-3.5">
                        {d.screenshot_data ? (
                          <button onClick={() => setScreenshotDeposit(d)}
                            className="flex items-center gap-1.5 text-[10px] font-semibold text-accent hover:text-accent/70 border border-accent/20 hover:border-accent/40 rounded-md px-2.5 py-1 transition-colors whitespace-nowrap">
                            <Eye size={11} /> View
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/30">None</span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-muted-foreground text-[10px] whitespace-nowrap">
                        {formatDate(d.created_at)}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.bg} ${s.border} ${s.color} w-fit whitespace-nowrap`}>
                            <s.Icon size={9} />
                            {d.status}
                          </span>
                          {d.reviewed_by && (
                            <span className="text-[9px] text-muted-foreground/60">by {d.reviewed_by}</span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        {d.status === 'Pending' ? (
                          <button
                            onClick={() => setReviewDeposit(d)}
                            className="text-[10px] font-semibold text-accent hover:bg-accent/15 border border-accent/20 rounded-md px-2.5 py-1 transition-colors whitespace-nowrap"
                          >
                            Review
                          </button>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/40 italic">{d.status}</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}

                {!loadingList && rows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                        <DollarSign size={28} strokeWidth={1.2} />
                        <p className="text-sm">No deposits match your filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {rows.length > 0 && (
            <div className="px-5 py-3 border-t border-white/5 flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground/50">
                Showing {rows.length} of {deposits.length} deposits
              </p>
              {(search || statusFilter !== 'All' || coinFilter !== 'All' || dateFilter) && (
                <button
                  onClick={() => { setSearch(''); setStatus('All'); setCoin('All'); setDate(''); }}
                  className="text-[10px] text-accent hover:text-accent/70 transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
