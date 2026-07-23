import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownCircle, Clock, CheckCircle, XCircle,
  Search, Calendar, ChevronDown, Eye, X, Wallet,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from '@/hooks/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type WithdrawalStatus = 'Pending' | 'Approved' | 'Rejected';

interface Withdrawal {
  id: string;
  userName: string;
  username: string;
  email: string;
  method: string;       // "Crypto Withdrawal"
  crypto: string;       // "BTC" | "ETH" | "USDT"
  amount: string;       // "$4,200.00"
  amountUsd: number;
  walletAddress: string;
  date: string;
  status: WithdrawalStatus;
  approvedBy?: string;
  processedAt?: string;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED: Withdrawal[] = [
  {
    id: '#W-0381', userName: 'James Thornton', username: 'james_t',
    email: 'j.thornton@email.com', method: 'Crypto Withdrawal', crypto: 'BTC',
    amount: '$4,200.00', amountUsd: 4200,
    walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    date: '2026-07-23 09:14', status: 'Pending',
  },
  {
    id: '#W-0380', userName: 'Priya Sharma', username: 'priya_sh',
    email: 'p.sharma@email.com', method: 'Crypto Withdrawal', crypto: 'ETH',
    amount: '$12,800.00', amountUsd: 12800,
    walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    date: '2026-07-23 07:52', status: 'Pending',
  },
  {
    id: '#W-0379', userName: 'Elena Volkov', username: 'elena_v',
    email: 'e.volkov@email.com', method: 'Crypto Withdrawal', crypto: 'USDT',
    amount: '$950.00', amountUsd: 950,
    walletAddress: 'TRX7k2mJNp9LqVuQdSxZ3Yb8P1eWcRf6D',
    date: '2026-07-22 22:30', status: 'Pending',
  },
  {
    id: '#W-0378', userName: 'David Osei', username: 'david_o',
    email: 'd.osei@email.com', method: 'Crypto Withdrawal', crypto: 'BTC',
    amount: '$2,100.00', amountUsd: 2100,
    walletAddress: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
    date: '2026-07-22 18:05', status: 'Pending',
  },
  {
    id: '#W-0377', userName: 'Lin Wei', username: 'lin_wei',
    email: 'l.wei@email.com', method: 'Crypto Withdrawal', crypto: 'ETH',
    amount: '$8,500.00', amountUsd: 8500,
    walletAddress: '0x89205A3A3b2A69De6Dbf7f476598cd8A1a5A4e5',
    date: '2026-07-22 14:20', status: 'Approved',
    approvedBy: 'Super Admin', processedAt: '2026-07-22 15:00',
  },
  {
    id: '#W-0376', userName: 'Carlos Rivera', username: 'carlos_r',
    email: 'c.rivera@email.com', method: 'Crypto Withdrawal', crypto: 'USDT',
    amount: '$1,800.00', amountUsd: 1800,
    walletAddress: 'TXqR5mJb2jPnVkLuNdSxZ3Yb8P1eWcRf9',
    date: '2026-07-21 10:44', status: 'Approved',
    approvedBy: 'Super Admin', processedAt: '2026-07-21 11:30',
  },
  {
    id: '#W-0375', userName: 'Sofia Becker', username: 'sofia_b',
    email: 's.becker@email.com', method: 'Crypto Withdrawal', crypto: 'BTC',
    amount: '$3,400.00', amountUsd: 3400,
    walletAddress: 'bc1q9r5k2j3h7g4f8d2s6p1n0m9l8k7j6h5g4f3',
    date: '2026-07-20 16:12', status: 'Approved',
    approvedBy: 'Super Admin', processedAt: '2026-07-20 17:00',
  },
  {
    id: '#W-0374', userName: 'Amir Hassan', username: 'amir_h',
    email: 'a.hassan@email.com', method: 'Crypto Withdrawal', crypto: 'BTC',
    amount: '$6,000.00', amountUsd: 6000,
    walletAddress: 'Unknown / Unverified',
    date: '2026-07-20 09:00', status: 'Rejected',
    approvedBy: 'Super Admin', processedAt: '2026-07-20 10:15',
  },
  {
    id: '#W-0373', userName: 'Test Account', username: 'test_user',
    email: 'test@test.com', method: 'Crypto Withdrawal', crypto: 'ETH',
    amount: '$15,000.00', amountUsd: 15000,
    walletAddress: 'Unverified — flagged by system',
    date: '2026-07-19 11:00', status: 'Rejected',
    approvedBy: 'Super Admin', processedAt: '2026-07-19 12:00',
  },
];

// ─── Style maps ───────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<WithdrawalStatus, { color: string; bg: string; border: string; Icon: typeof Clock }> = {
  Pending:  { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   Icon: Clock },
  Approved: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', Icon: CheckCircle },
  Rejected: { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     Icon: XCircle },
};

const CRYPTO_COLOR: Record<string, string> = {
  BTC:  'text-amber-400',
  ETH:  'text-indigo-400',
  USDT: 'text-emerald-400',
};

const METHODS = ['All', 'Crypto Withdrawal'];
const STATUSES: Array<'All' | WithdrawalStatus> = ['All', 'Pending', 'Approved', 'Rejected'];

function truncate(s: string, n = 22) {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

function nowStr() {
  return new Date().toISOString().replace('T', ' ').slice(0, 16);
}

// ─── Details Modal ────────────────────────────────────────────────────────────

function DetailsModal({ w, onClose }: { w: Withdrawal; onClose: () => void }) {
  const s = STATUS_STYLE[w.status];
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(5,12,28,0.85)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.93, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="relative bg-[hsl(221,70%,10%)] border border-white/10 rounded-2xl overflow-hidden w-full max-w-md shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div>
              <p className="text-sm font-bold text-white">Withdrawal Details</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{w.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Modal body */}
          <div className="p-5 space-y-3">
            {/* User */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-3">
                User Information
              </p>
              <Row label="Name"     value={w.userName} />
              <Row label="Username" value={`@${w.username}`} mono />
              <Row label="Email"    value={w.email} />
            </div>

            {/* Withdrawal */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-3">
                Withdrawal Information
              </p>
              <Row label="Method"  value={w.method} />
              <Row label="Network" value={w.crypto} colored={CRYPTO_COLOR[w.crypto]} />
              <Row label="Amount"  value={w.amount} bold />
              <Row label="Wallet"  value={w.walletAddress} mono small />
              <Row label="Date"    value={w.date} />
            </div>

            {/* Status */}
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50 mb-3">
                Status
              </p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">Status</span>
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${s.bg} ${s.border} ${s.color}`}>
                  <s.Icon size={9} />
                  {w.status}
                </span>
              </div>
              {w.approvedBy && <Row label="Processed by" value={w.approvedBy} />}
              {w.processedAt && <Row label="Processed at" value={w.processedAt} />}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Row({
  label, value, mono, bold, small, colored,
}: {
  label: string; value: string;
  mono?: boolean; bold?: boolean; small?: boolean; colored?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[10px] text-muted-foreground shrink-0">{label}</span>
      <span
        className={`text-right break-all ${small ? 'text-[10px]' : 'text-xs'} ${mono ? 'font-mono' : ''} ${bold ? 'font-bold text-white' : ''} ${colored ?? 'text-white'}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Filter Select ────────────────────────────────────────────────────────────

function FilterSelect({
  value, options, onChange, icon: Icon,
}: {
  value: string; options: string[];
  onChange: (v: string) => void;
  icon?: typeof ChevronDown;
}) {
  return (
    <div className="relative">
      {Icon && (
        <Icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`h-8 rounded-lg bg-muted/40 border border-white/10 text-xs text-white appearance-none pr-7 focus:outline-none focus:border-accent/40 transition-colors ${Icon ? 'pl-8' : 'pl-3'}`}
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-[hsl(221,70%,12%)]">{o}</option>
        ))}
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminWithdrawals() {
  const { user } = useAdminAuth();
  const adminName = user?.name ?? 'Admin';

  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(SEED);
  const [detailItem, setDetailItem]   = useState<Withdrawal | null>(null);

  // Filters
  const [search,       setSearch]  = useState('');
  const [statusFilter, setStatus]  = useState<string>('All');
  const [methodFilter, setMethod]  = useState<string>('All');
  const [dateFilter,   setDate]    = useState<string>('');

  // Summary counts
  const counts = useMemo(() => ({
    All:      withdrawals.length,
    Pending:  withdrawals.filter((w) => w.status === 'Pending').length,
    Approved: withdrawals.filter((w) => w.status === 'Approved').length,
    Rejected: withdrawals.filter((w) => w.status === 'Rejected').length,
  }), [withdrawals]);

  // Filtered rows
  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return withdrawals.filter((w) => {
      const matchSearch = !q ||
        w.userName.toLowerCase().includes(q) ||
        w.username.toLowerCase().includes(q) ||
        w.email.toLowerCase().includes(q) ||
        w.id.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || w.status === statusFilter;
      const matchMethod = methodFilter === 'All' || w.method === methodFilter;
      const matchDate   = !dateFilter || w.date.startsWith(dateFilter);
      return matchSearch && matchStatus && matchMethod && matchDate;
    });
  }, [withdrawals, search, statusFilter, methodFilter, dateFilter]);

  // ── Approve ───────────────────────────────────────────────────────────────
  function handleApprove(id: string) {
    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, status: 'Approved', approvedBy: adminName, processedAt: nowStr() }
          : w,
      ),
    );
    toast({
      title: '✅ Withdrawal Approved',
      description: `Withdrawal ${id} approved. Amount deducted from user balance and transaction logged.`,
    });
  }

  // ── Reject ────────────────────────────────────────────────────────────────
  function handleReject(id: string) {
    setWithdrawals((prev) =>
      prev.map((w) =>
        w.id === id
          ? { ...w, status: 'Rejected', approvedBy: adminName, processedAt: nowStr() }
          : w,
      ),
    );
    toast({
      title: '❌ Withdrawal Rejected',
      description: `Withdrawal ${id} rejected. User's balance remains unchanged.`,
    });
  }

  const COLS = [
    'User', 'Username', 'Email', 'Method',
    'Amount', 'Wallet / Bank', 'Date', 'Status', 'Actions',
  ];

  return (
    <>
      {detailItem && (
        <DetailsModal w={detailItem} onClose={() => setDetailItem(null)} />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Withdrawals</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Review and process all user withdrawal requests.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((key) => {
            const meta = key === 'All'
              ? { color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20', Icon: ArrowDownCircle }
              : STATUS_STYLE[key as WithdrawalStatus];
            const active = statusFilter === key;
            return (
              <button
                key={key}
                onClick={() => setStatus(key)}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${
                  active
                    ? `${meta.bg} ${meta.border} shadow-[0_0_20px_rgba(30,167,255,0.08)]`
                    : 'bg-card/40 border-white/5 hover:bg-card/60'
                }`}
              >
                <div className={`p-2.5 rounded-lg ${meta.bg} border ${meta.border}`}>
                  <meta.Icon size={16} className={meta.color} />
                </div>
                <div>
                  <p className="text-white font-bold text-xl">{counts[key]}</p>
                  <p className="text-muted-foreground text-[10px]">
                    {key === 'All' ? 'Total Requests' : `${key} Requests`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Table Panel */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-card/40 border border-white/5 rounded-xl overflow-hidden"
        >
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-4 border-b border-white/5">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <Input
                placeholder="Search user, email, ID…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-8 w-56 bg-muted/40 border-white/10 text-white placeholder:text-white/25 text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 md:ml-auto">
              {/* Status */}
              <FilterSelect value={statusFilter} options={STATUSES} onChange={setStatus} />

              {/* Method */}
              <FilterSelect value={methodFilter} options={METHODS} onChange={setMethod} icon={Wallet} />

              {/* Date */}
              <div className="relative">
                <Calendar size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-8 h-8 w-40 bg-muted/40 border-white/10 text-white text-xs [color-scheme:dark]"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[960px]">
              <thead>
                <tr className="border-b border-white/5">
                  {COLS.map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-4 py-3 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((w) => {
                  const s = STATUS_STYLE[w.status];
                  return (
                    <motion.tr
                      key={w.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors"
                    >
                      {/* User */}
                      <td className="px-4 py-3.5">
                        <p className="text-white text-xs font-medium whitespace-nowrap">{w.userName}</p>
                        <p className="text-muted-foreground text-[10px] font-mono">{w.id}</p>
                      </td>

                      {/* Username */}
                      <td className="px-4 py-3.5 text-muted-foreground text-xs font-mono">
                        @{w.username}
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 text-muted-foreground text-[10px] whitespace-nowrap">
                        {w.email}
                      </td>

                      {/* Method */}
                      <td className="px-4 py-3.5">
                        <p className="text-white text-xs whitespace-nowrap">{w.method}</p>
                        <p className={`text-[10px] font-semibold ${CRYPTO_COLOR[w.crypto] ?? 'text-muted-foreground'}`}>
                          {w.crypto}
                        </p>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 text-white text-xs font-bold whitespace-nowrap">
                        {w.amount}
                      </td>

                      {/* Wallet */}
                      <td className="px-4 py-3.5">
                        <span
                          title={w.walletAddress}
                          className="text-[10px] font-mono text-muted-foreground cursor-help"
                        >
                          {truncate(w.walletAddress)}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-muted-foreground text-[10px] whitespace-nowrap">
                        {w.date}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.bg} ${s.border} ${s.color} w-fit whitespace-nowrap`}
                          >
                            <s.Icon size={9} />
                            {w.status}
                          </span>
                          {w.approvedBy && (
                            <span className="text-[9px] text-muted-foreground/50">
                              by {w.approvedBy}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* View */}
                          <button
                            onClick={() => setDetailItem(w)}
                            className="flex items-center gap-1 text-[10px] font-semibold text-accent hover:text-accent/70 border border-accent/20 hover:border-accent/40 rounded-md px-2 py-1 transition-colors whitespace-nowrap"
                          >
                            <Eye size={10} />
                            Details
                          </button>

                          {w.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(w.id)}
                                className="text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-md px-2 py-1 transition-colors whitespace-nowrap"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(w.id)}
                                className="text-[10px] font-semibold text-red-400 hover:bg-red-500/15 border border-red-500/20 rounded-md px-2 py-1 transition-colors whitespace-nowrap"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {w.status !== 'Pending' && (
                            <span className="text-[10px] text-muted-foreground/40 italic">
                              {w.status}
                            </span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                        <ArrowDownCircle size={28} strokeWidth={1.2} />
                        <p className="text-sm">No withdrawals match your filters.</p>
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
                Showing {rows.length} of {withdrawals.length} requests
              </p>
              {(search || statusFilter !== 'All' || methodFilter !== 'All' || dateFilter) && (
                <button
                  onClick={() => { setSearch(''); setStatus('All'); setMethod('All'); setDate(''); }}
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
