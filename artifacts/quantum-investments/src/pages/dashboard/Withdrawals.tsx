import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, ArrowRight, ShieldAlert, ArrowUpFromLine,
  Clock, FileText, CheckCircle, ChevronDown,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';

// ─── Types ────────────────────────────────────────────────────────────────────

type WithdrawalStatus = 'Pending' | 'Approved' | 'Rejected';
type CryptoOption = 'btc' | 'eth' | 'usdt';

interface WithdrawalRecord {
  id: string;
  date: string;
  method: string;        // e.g. "Crypto Withdrawal"
  crypto: string;        // e.g. "BTC", "ETH", "USDT"
  amount: string;
  wallet: string;
  status: WithdrawalStatus;
}

// ─── Mock history (seed data) ─────────────────────────────────────────────────

const SEED_HISTORY: WithdrawalRecord[] = [
  { id: 'WDL-7201', date: 'Oct 24, 2023, 11:30 AM', method: 'Crypto Withdrawal', crypto: 'BTC',  amount: '$5,000.00', wallet: 'bc1q...x0wlh', status: 'Approved'  },
  { id: 'WDL-7200', date: 'Oct 21, 2023, 10:15 AM', method: 'Crypto Withdrawal', crypto: 'ETH',  amount: '$2,000.00', wallet: '0x71...8976F', status: 'Approved'  },
  { id: 'WDL-7199', date: 'Sep 10, 2023, 13:45 PM', method: 'Crypto Withdrawal', crypto: 'USDT', amount: '$5,000.00', wallet: 'TXLA...7m7X', status: 'Pending'   },
  { id: 'WDL-7198', date: 'Aug 14, 2023, 16:20 PM', method: 'Crypto Withdrawal', crypto: 'BTC',  amount: '$1,500.00', wallet: 'bc1q...v2pq8', status: 'Approved'  },
  { id: 'WDL-7197', date: 'Jul 05, 2023, 09:10 AM', method: 'Crypto Withdrawal', crypto: 'ETH',  amount: '$2,500.00', wallet: '0x88...1A49B', status: 'Approved'  },
  { id: 'WDL-7196', date: 'Jun 12, 2023, 14:30 PM', method: 'Crypto Withdrawal', crypto: 'USDT', amount: '$1,000.00', wallet: 'TYH8...4G9L', status: 'Approved'  },
  { id: 'WDL-7195', date: 'May 20, 2023, 11:45 AM', method: 'Crypto Withdrawal', crypto: 'BTC',  amount: '$500.00',   wallet: 'bc1q...a9x2m', status: 'Approved' },
  { id: 'WDL-7194', date: 'Apr 18, 2023, 10:05 AM', method: 'Crypto Withdrawal', crypto: 'ETH',  amount: '$8,000.00', wallet: '0x12...9C33D', status: 'Rejected'  },
  { id: 'WDL-7193', date: 'Mar 10, 2023, 15:50 PM', method: 'Crypto Withdrawal', crypto: 'USDT', amount: '$3,000.00', wallet: 'TKJ1...8Y4M', status: 'Approved'  },
  { id: 'WDL-7192', date: 'Feb 22, 2023, 08:15 AM', method: 'Crypto Withdrawal', crypto: 'BTC',  amount: '$1,200.00', wallet: 'bc1q...o5r4t', status: 'Approved'  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CRYPTO_LABELS: Record<CryptoOption, string> = {
  btc:  'Bitcoin (BTC)',
  eth:  'Ethereum (ERC20)',
  usdt: 'USDT (TRC20)',
};

const CRYPTO_TICKERS: Record<CryptoOption, string> = {
  btc:  'BTC',
  eth:  'ETH',
  usdt: 'USDT',
};

const CRYPTO_PLACEHOLDERS: Record<CryptoOption, string> = {
  btc:  'Enter your BTC wallet address (starts with 1, 3 or bc1…)',
  eth:  'Enter your ETH wallet address (starts with 0x…)',
  usdt: 'Enter your TRC20 wallet address (starts with T…)',
};

const STATUS_STYLE: Record<WithdrawalStatus, string> = {
  Pending:  'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Approved: 'bg-green-500/10  text-green-400  border-green-500/20',
  Rejected: 'bg-red-500/10   text-red-400    border-red-500/20',
};

function nowLabel() {
  return new Date().toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function nextId(history: WithdrawalRecord[]) {
  const nums = history.map((h) => parseInt(h.id.replace('WDL-', ''), 10));
  const max = nums.length ? Math.max(...nums) : 7201;
  return `WDL-${max + 1}`;
}

// ─── Validation errors type ───────────────────────────────────────────────────

interface FormErrors {
  amount?: string;
  wallet?: string;
}

// ─── Main component ───────────────────────────────────────────────────────────

type PageView = 'form' | 'success' | 'history';

export default function Withdrawals() {
  const availableBalance = 28_430.5;

  // Page view
  const [view, setView] = useState<PageView>('form');

  // Form state
  const [amount, setAmount]   = useState('');
  const [crypto, setCrypto]   = useState<CryptoOption>('btc');
  const [wallet, setWallet]   = useState('');
  const [errors, setErrors]   = useState<FormErrors>({});

  // History state
  const [history, setHistory]           = useState<WithdrawalRecord[]>(SEED_HISTORY);
  const [statusFilter, setStatusFilter] = useState<'All' | WithdrawalStatus>('All');

  // Last submitted record (for success screen)
  const [lastRecord, setLastRecord] = useState<WithdrawalRecord | null>(null);

  // ── Validation ─────────────────────────────────────────────────────────────

  function validate(): boolean {
    const errs: FormErrors = {};
    const num = parseFloat(amount);

    if (!amount || isNaN(num) || num <= 0) {
      errs.amount = 'Withdrawal amount is required and must be greater than zero.';
    } else if (num > availableBalance) {
      errs.amount = `Amount exceeds your available balance of $${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}.`;
    }

    if (!wallet.trim()) {
      errs.wallet = 'Wallet address is required.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    const record: WithdrawalRecord = {
      id:     nextId(history),
      date:   nowLabel(),
      method: 'Crypto Withdrawal',
      crypto: CRYPTO_TICKERS[crypto],
      amount: `$${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      wallet: wallet.trim(),
      status: 'Pending',
    };

    // Prepend to history (most-recent first)
    setHistory((prev) => [record, ...prev]);
    setLastRecord(record);
    setView('success');
  }

  // ── Reset form ──────────────────────────────────────────────────────────────

  function resetForm() {
    setAmount('');
    setCrypto('btc');
    setWallet('');
    setErrors({});
    setLastRecord(null);
  }

  // ── Filtered history ────────────────────────────────────────────────────────

  const filtered = history.filter(
    (r) => statusFilter === 'All' || r.status === statusFilter,
  );

  // ─── Stat cards ─────────────────────────────────────────────────────────────

  const totalWithdrawn = history
    .filter((r) => r.status === 'Approved')
    .reduce((sum, r) => sum + parseFloat(r.amount.replace(/[$,]/g, '')), 0);

  const pendingAmount = history
    .filter((r) => r.status === 'Pending')
    .reduce((sum, r) => sum + parseFloat(r.amount.replace(/[$,]/g, '')), 0);

  const lastWithdrawn = history.find((r) => r.status === 'Approved');

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Page header */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Withdrawals</h1>
        <p className="text-muted-foreground">Transfer profits to your external wallet securely.</p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          delay={0}
          title="Total Withdrawn"
          value={`$${totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={ArrowUpFromLine}
        />
        <StatCard
          delay={0.1}
          title="Last Withdrawal"
          value={lastWithdrawn ? lastWithdrawn.amount : '$0.00'}
          icon={FileText}
        />
        <StatCard
          delay={0.2}
          title="Pending"
          value={`$${pendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={Clock}
        />
      </div>

      {/* ── SUCCESS STATE ─────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {view === 'success' && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 md:p-12 flex flex-col items-center text-center max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 bg-green-500/15 border border-green-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
              <CheckCircle size={32} className="text-green-400" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">Request Submitted</h2>
            <p className="text-muted-foreground leading-relaxed max-w-md mb-2">
              Your withdrawal request has been submitted successfully and is awaiting admin approval.
            </p>

            {lastRecord && (
              <div className="mt-4 mb-6 w-full max-w-sm bg-white/[0.03] border border-white/5 rounded-xl p-4 text-left space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="text-white font-mono">{lastRecord.id}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="text-white font-bold">{lastRecord.amount}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Network</span>
                  <span className="text-white">{lastRecord.crypto}</span>
                </div>
                <div className="flex justify-between text-xs gap-4">
                  <span className="text-muted-foreground shrink-0">Wallet</span>
                  <span className="text-white font-mono text-right truncate">{lastRecord.wallet}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Status</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                    Pending
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full max-w-sm">
              <button
                onClick={() => { setView('history'); setStatusFilter('All'); }}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(21,101,232,0.3)]"
              >
                View History <ArrowRight size={16} />
              </button>
              <button
                onClick={() => { resetForm(); setView('form'); }}
                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-semibold transition-all"
              >
                New Request
              </button>
            </div>
          </motion.div>
        )}

        {/* ── FORM STATE ─────────────────────────────────────────────────── */}
        {view === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ delay: 0.3, duration: 0.35 }}
            className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden max-w-2xl mx-auto"
          >
            {/* Available balance banner */}
            <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between mb-8">
              <div>
                <p className="text-sm text-accent font-medium mb-1">Available for Withdrawal</p>
                <p className="text-2xl font-bold text-white">
                  ${availableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <Wallet className="text-accent opacity-50" size={32} />
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-6">

              {/* ── Amount ─────────────────────────────────────────────── */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Withdrawal Amount (USD) <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                    }}
                    placeholder="0.00"
                    className={`w-full bg-white/5 border rounded-xl py-3 pl-8 pr-16 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 transition-all ${
                      errors.amount
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
                        : 'border-white/10 focus:border-primary focus:ring-primary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAmount(availableBalance.toString());
                      setErrors((prev) => ({ ...prev, amount: undefined }));
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-accent hover:text-primary transition-colors"
                  >
                    MAX
                  </button>
                </div>
                {errors.amount && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.amount}</p>
                )}
              </div>

              {/* ── Withdrawal Method ───────────────────────────────────── */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Withdrawal Method
                </label>
                <div className="relative">
                  <select
                    defaultValue="crypto"
                    className="w-full bg-background border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                  >
                    <option value="crypto">Crypto Withdrawal</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {/* ── Crypto sub-fields ───────────────────────────────────── */}
              <div className="space-y-5 pl-0 border-l-0">
                {/* Cryptocurrency */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Cryptocurrency <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={crypto}
                      onChange={(e) => {
                        setCrypto(e.target.value as CryptoOption);
                        setWallet('');
                        setErrors((prev) => ({ ...prev, wallet: undefined }));
                      }}
                      className="w-full bg-background border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
                    >
                      <option value="btc">Bitcoin (BTC)</option>
                      <option value="eth">Ethereum (ERC20)</option>
                      <option value="usdt">USDT (TRC20)</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                {/* Wallet Address */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Wallet Address <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={wallet}
                    onChange={(e) => {
                      setWallet(e.target.value);
                      if (errors.wallet) setErrors((prev) => ({ ...prev, wallet: undefined }));
                    }}
                    placeholder={CRYPTO_PLACEHOLDERS[crypto]}
                    className={`w-full bg-white/5 border rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 transition-all font-mono text-sm ${
                      errors.wallet
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/30'
                        : 'border-white/10 focus:border-primary focus:ring-primary'
                    }`}
                  />
                  {errors.wallet && (
                    <p className="mt-1.5 text-xs text-red-400">{errors.wallet}</p>
                  )}
                </div>
              </div>

              {/* ── Security notice ─────────────────────────────────────── */}
              <div className="flex items-start gap-3 bg-white/[0.02] p-4 rounded-lg border border-white/5">
                <ShieldAlert className="text-yellow-500 shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Double-check your wallet address before submitting. Withdrawals sent to the wrong address or network cannot be recovered. Your request will be reviewed by our admin team before processing.
                </p>
              </div>

              {/* ── Submit ─────────────────────────────────────────────── */}
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(21,101,232,0.3)] mt-4"
              >
                Submit Withdrawal Request <ArrowRight size={18} />
              </button>
            </form>

            {/* Link to history */}
            <p className="text-center text-xs text-muted-foreground mt-5">
              Want to check past requests?{' '}
              <button
                onClick={() => setView('history')}
                className="text-accent hover:text-accent/70 font-medium transition-colors"
              >
                View History →
              </button>
            </p>
          </motion.div>
        )}

        {/* ── HISTORY STATE ──────────────────────────────────────────────── */}
        {view === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <button
                onClick={() => { resetForm(); setView('form'); }}
                className="text-sm text-accent hover:text-accent/70 font-medium transition-colors flex items-center gap-1"
              >
                ← New Withdrawal Request
              </button>
            </div>

            <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
              {/* History toolbar */}
              <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-white">Withdrawal History</h2>
                <div className="flex bg-white/5 p-1 rounded-lg">
                  {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                        statusFilter === tab
                          ? 'bg-primary/20 text-accent shadow-sm'
                          : 'text-muted-foreground hover:text-white'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      <th className="p-4">Date</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Wallet</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="p-4 text-muted-foreground text-sm whitespace-nowrap">
                          {row.date}
                        </td>
                        <td className="p-4">
                          <p className="text-white text-sm font-medium whitespace-nowrap">{row.method}</p>
                          <p className="text-muted-foreground text-xs">{row.crypto}</p>
                        </td>
                        <td className="p-4 font-bold text-white whitespace-nowrap">{row.amount}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_STYLE[row.status]}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="p-4 text-muted-foreground font-mono text-xs">
                          {row.wallet.length > 24 ? row.wallet.slice(0, 24) + '…' : row.wallet}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>

                {filtered.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    No {statusFilter !== 'All' ? statusFilter.toLowerCase() + ' ' : ''}withdrawals found.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
