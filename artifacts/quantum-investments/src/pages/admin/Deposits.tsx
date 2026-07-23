import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Clock, CheckCircle, XCircle, Search,
  Eye, X, Calendar, ChevronDown, Wallet, Hash,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from '@/hooks/use-toast';

// ─── Types ───────────────────────────────────────────────────────────────────

type DepositStatus = 'Pending' | 'Approved' | 'Rejected';

interface Deposit {
  id: string;
  userName: string;
  username: string;
  email: string;
  crypto: string;
  amount: string;
  amountUsd: number;
  walletAddress: string;
  txHash: string;
  screenshotUrl: string;
  dateSubmitted: string;
  status: DepositStatus;
  approvedBy?: string;
  approvedAt?: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const SEED: Deposit[] = [
  {
    id: '#D-0041',
    userName: 'James Thornton',
    username: 'james_t',
    email: 'j.thornton@email.com',
    crypto: 'Bitcoin',
    amount: '$4,200.00',
    amountUsd: 4200,
    walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf NA',
    txHash: 'a1075db55d416d3ca199f55b6084e211 5f',
    screenshotUrl: 'https://placehold.co/800x500/0a1628/1EA7FF?text=BTC+Deposit+Receipt',
    dateSubmitted: '2026-07-23 09:14',
    status: 'Pending',
  },
  {
    id: '#D-0040',
    userName: 'Priya Sharma',
    username: 'priya_sh',
    email: 'p.sharma@email.com',
    crypto: 'Ethereum',
    amount: '$12,800.00',
    amountUsd: 12800,
    walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    txHash: '0x4e3a3754410177e8842851f8b3c26fb97c69ca3 e0',
    screenshotUrl: 'https://placehold.co/800x500/0a1628/7c3aed?text=ETH+Deposit+Receipt',
    dateSubmitted: '2026-07-23 07:52',
    status: 'Pending',
  },
  {
    id: '#D-0039',
    userName: 'Elena Volkov',
    username: 'elena_v',
    email: 'e.volkov@email.com',
    crypto: 'USDT',
    amount: '$950.00',
    amountUsd: 950,
    walletAddress: 'TRX7k2mJNp9LqVuQdSxZ3Yb8P1eWcRf6',
    txHash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f 8',
    screenshotUrl: 'https://placehold.co/800x500/0a1628/10b981?text=USDT+Deposit+Receipt',
    dateSubmitted: '2026-07-22 22:30',
    status: 'Pending',
  },
  {
    id: '#D-0038',
    userName: 'David Osei',
    username: 'david_o',
    email: 'd.osei@email.com',
    crypto: 'Bitcoin',
    amount: '$2,100.00',
    amountUsd: 2100,
    walletAddress: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5',
    txHash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a 9',
    screenshotUrl: 'https://placehold.co/800x500/0a1628/f59e0b?text=BTC+Deposit+Receipt',
    dateSubmitted: '2026-07-22 18:05',
    status: 'Pending',
  },
  {
    id: '#D-0037',
    userName: 'Lin Wei',
    username: 'lin_wei',
    email: 'l.wei@email.com',
    crypto: 'Ethereum',
    amount: '$8,500.00',
    amountUsd: 8500,
    walletAddress: '0x89205A3A3b2A69De6Dbf7f476598cd8A1a5A4e5',
    txHash: '0xf7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3 e4',
    screenshotUrl: 'https://placehold.co/800x500/0a1628/6366f1?text=ETH+Deposit+Receipt',
    dateSubmitted: '2026-07-22 14:20',
    status: 'Approved',
    approvedBy: 'Super Admin',
    approvedAt: '2026-07-22 15:00',
  },
  {
    id: '#D-0036',
    userName: 'Carlos Rivera',
    username: 'carlos_r',
    email: 'c.rivera@email.com',
    crypto: 'USDT',
    amount: '$1,800.00',
    amountUsd: 1800,
    walletAddress: 'TXqR5mJb2jPn9VkLuNdSxZ3Yb8P1eWcRf',
    txHash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b 0',
    screenshotUrl: 'https://placehold.co/800x500/0a1628/10b981?text=USDT+Deposit+Receipt',
    dateSubmitted: '2026-07-21 10:44',
    status: 'Approved',
    approvedBy: 'Super Admin',
    approvedAt: '2026-07-21 11:30',
  },
  {
    id: '#D-0035',
    userName: 'Sofia Becker',
    username: 'sofia_b',
    email: 's.becker@email.com',
    crypto: 'Bitcoin',
    amount: '$3,400.00',
    amountUsd: 3400,
    walletAddress: 'bc1q9r5k2j3h7g4f8d2s6p1n0m9l8k7j6h5',
    txHash: 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c 1',
    screenshotUrl: 'https://placehold.co/800x500/0a1628/1EA7FF?text=BTC+Deposit+Receipt',
    dateSubmitted: '2026-07-20 16:12',
    status: 'Rejected',
  },
  {
    id: '#D-0034',
    userName: 'Amir Hassan',
    username: 'amir_h',
    email: 'a.hassan@email.com',
    crypto: 'Ethereum',
    amount: '$6,000.00',
    amountUsd: 6000,
    walletAddress: '0x00000000219ab540356cBB839Cbe05303d7705Fa',
    txHash: 'f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d 2',
    screenshotUrl: 'https://placehold.co/800x500/0a1628/ef4444?text=Invalid+Screenshot',
    dateSubmitted: '2026-07-20 09:00',
    status: 'Rejected',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<DepositStatus, { color: string; bg: string; border: string; Icon: typeof Clock }> = {
  Pending:  { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   Icon: Clock },
  Approved: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', Icon: CheckCircle },
  Rejected: { color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20',     Icon: XCircle },
};

const CRYPTO_COLORS: Record<string, string> = {
  Bitcoin:  'text-amber-400',
  Ethereum: 'text-indigo-400',
  USDT:     'text-emerald-400',
};

const COINS = ['All', 'Bitcoin', 'Ethereum', 'USDT'];
const STATUSES: Array<'All' | DepositStatus> = ['All', 'Pending', 'Approved', 'Rejected'];

function truncate(str: string, n = 20) {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

function nowStr() {
  return new Date().toISOString().replace('T', ' ').slice(0, 16);
}

// ─── Screenshot Modal ────────────────────────────────────────────────────────

function ScreenshotModal({ url, id, onClose }: { url: string; id: string; onClose: () => void }) {
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
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="relative bg-[hsl(221,70%,10%)] border border-white/10 rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
            <div>
              <p className="text-sm font-semibold text-white">Deposit Screenshot</p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Image */}
          <div className="p-4">
            <img
              src={url}
              alt={`Screenshot for ${id}`}
              className="w-full rounded-lg border border-white/5 object-contain max-h-[420px] bg-white/3"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://placehold.co/800x500/0a1628/ffffff?text=Screenshot+Not+Available';
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Select (filter dropdown) ─────────────────────────────────────────────────

function FilterSelect({
  value,
  options,
  onChange,
  icon: Icon,
}: {
  value: string;
  options: string[];
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
          <option key={o} value={o} className="bg-[hsl(221,70%,12%)]">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminDeposits() {
  const { user } = useAdminAuth();
  const adminName = user?.name ?? 'Admin';

  const [deposits, setDeposits] = useState<Deposit[]>(SEED);
  const [screenshotDeposit, setScreenshotDeposit] = useState<Deposit | null>(null);

  // Filters
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState<string>('All');
  const [coinFilter, setCoin]        = useState<string>('All');
  const [dateFilter, setDate]        = useState<string>('');

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
        d.userName.toLowerCase().includes(q) ||
        d.username.toLowerCase().includes(q) ||
        d.email.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'All' || d.status === statusFilter;
      const matchCoin   = coinFilter === 'All' || d.crypto === coinFilter;
      const matchDate   = !dateFilter || d.dateSubmitted.startsWith(dateFilter);
      return matchSearch && matchStatus && matchCoin && matchDate;
    });
  }, [deposits, search, statusFilter, coinFilter, dateFilter]);

  // ── Approve ──────────────────────────────────────────────────────────────
  function handleApprove(id: string) {
    setDeposits((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: 'Approved', approvedBy: adminName, approvedAt: nowStr() }
          : d,
      ),
    );
    toast({
      title: '✅ Deposit Approved',
      description: `Deposit ${id} has been approved and the user's balance has been credited.`,
    });
  }

  // ── Reject ───────────────────────────────────────────────────────────────
  function handleReject(id: string) {
    setDeposits((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: 'Rejected', approvedBy: adminName, approvedAt: nowStr() }
          : d,
      ),
    );
    toast({
      title: '❌ Deposit Rejected',
      description: `Deposit ${id} has been rejected. The user's balance remains unchanged.`,
    });
  }

  const COLS = [
    'User', 'Username', 'Email', 'Crypto', 'Amount',
    'Wallet Address', 'Transaction Hash', 'Screenshot',
    'Date Submitted', 'Status', 'Actions',
  ];

  return (
    <>
      {/* Screenshot modal */}
      {screenshotDeposit && (
        <ScreenshotModal
          url={screenshotDeposit.screenshotUrl}
          id={screenshotDeposit.id}
          onClose={() => setScreenshotDeposit(null)}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Deposits</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Review and approve all incoming deposit requests.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((key) => {
            const meta = key === 'All'
              ? { color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20', Icon: DollarSign }
              : STATUS_STYLE[key as DepositStatus];
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
                  <p className="text-muted-foreground text-[10px]">{key === 'All' ? 'Total' : key}</p>
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
              <FilterSelect
                value={statusFilter}
                options={STATUSES}
                onChange={setStatus}
              />

              {/* Coin */}
              <FilterSelect
                value={coinFilter}
                options={COINS}
                onChange={setCoin}
                icon={Wallet}
              />

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
            <table className="w-full text-sm min-w-[1100px]">
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
                {rows.map((d) => {
                  const s = STATUS_STYLE[d.status];
                  return (
                    <motion.tr
                      key={d.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors"
                    >
                      {/* User */}
                      <td className="px-4 py-3.5">
                        <p className="text-white text-xs font-medium whitespace-nowrap">{d.userName}</p>
                        <p className="text-muted-foreground text-[10px] font-mono">{d.id}</p>
                      </td>

                      {/* Username */}
                      <td className="px-4 py-3.5 text-muted-foreground text-xs font-mono">
                        @{d.username}
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 text-muted-foreground text-[10px] whitespace-nowrap">
                        {d.email}
                      </td>

                      {/* Crypto */}
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-semibold ${CRYPTO_COLORS[d.crypto] ?? 'text-white'}`}>
                          {d.crypto}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3.5 text-white text-xs font-bold whitespace-nowrap">
                        {d.amount}
                      </td>

                      {/* Wallet Address */}
                      <td className="px-4 py-3.5">
                        <span
                          title={d.walletAddress}
                          className="text-[10px] font-mono text-muted-foreground cursor-help"
                        >
                          {truncate(d.walletAddress, 18)}
                        </span>
                      </td>

                      {/* Tx Hash */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Hash size={10} className="text-white/20 shrink-0" />
                          <span
                            title={d.txHash}
                            className="text-[10px] font-mono text-muted-foreground cursor-help"
                          >
                            {truncate(d.txHash, 16)}
                          </span>
                        </div>
                      </td>

                      {/* Screenshot */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setScreenshotDeposit(d)}
                          className="flex items-center gap-1.5 text-[10px] font-semibold text-accent hover:text-accent/70 border border-accent/20 hover:border-accent/40 rounded-md px-2.5 py-1 transition-colors whitespace-nowrap"
                        >
                          <Eye size={11} />
                          View
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-muted-foreground text-[10px] whitespace-nowrap">
                        {d.dateSubmitted}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${s.bg} ${s.border} ${s.color} w-fit whitespace-nowrap`}
                          >
                            <s.Icon size={9} />
                            {d.status}
                          </span>
                          {d.approvedBy && (
                            <span className="text-[9px] text-muted-foreground/60">
                              by {d.approvedBy}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        {d.status === 'Pending' ? (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleApprove(d.id)}
                              className="text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-md px-2.5 py-1 transition-colors whitespace-nowrap"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(d.id)}
                              className="text-[10px] font-semibold text-red-400 hover:bg-red-500/15 border border-red-500/20 rounded-md px-2.5 py-1 transition-colors whitespace-nowrap"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/40 italic">
                            {d.status}
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-5 py-14 text-center">
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

          {/* Footer count */}
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
