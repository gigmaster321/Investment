import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Users, UserCheck, UserX, TrendingUp,
  Eye, Pencil, Trash2, X, ChevronDown, Save,
  Phone, Mail, MapPin, Calendar, CreditCard,
  Wallet, ArrowDownLeft, ArrowUpRight, BadgeCheck,
  ShieldOff, ShieldCheck, AlertTriangle, KeyRound,
  NotebookPen, Activity,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { toast } from '@/hooks/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type UserStatus = 'Active' | 'Suspended';
type UserPlan   = 'Starter' | 'Silver' | 'Gold' | 'Platinum';
type ActivityStatus = 'Completed' | 'Pending' | 'Rejected' | 'Active';

const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/api`;

async function adminApiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.detail ?? body?.title ?? `Request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  country: string;
  registeredDate: string;   // "Jul 22, 2026"
  registeredIso: string;    // "2026-07-22" for sorting/filtering
  status: UserStatus;
  plan: UserPlan;
  balance: string;
  balanceNum: number;
  totalDeposits: string;
  totalWithdrawals: string;
  totalProfit: string;
}

interface InvestmentRecord {
  planName: string;
  amount: string;
  profitPct: string;
  status: ActivityStatus;
  purchaseDate: string;
}

interface DepositRecord {
  coin: string;
  amount: string;
  status: ActivityStatus;
  date: string;
}

interface WithdrawalRecord {
  amount: string;
  method: string;
  status: ActivityStatus;
  date: string;
}

interface TransactionRecord {
  type: 'Deposits' | 'Withdrawals' | 'Profits' | 'Bonuses';
  amount: string;
  status: ActivityStatus;
  date: string;
}

interface UserActivity {
  investments: InvestmentRecord[];
  deposits: DepositRecord[];
  withdrawals: WithdrawalRecord[];
  transactions: TransactionRecord[];
  activeInvestments: number;
  referralEarnings: string;
}

// ─── Seed data (2 demo users shown while real data loads) ────────────────────

const SEED: User[] = [
  {
    id: '#U-D001', name: 'James Thornton',  username: 'james_t',
    email: 'j.thornton@email.com', phone: '+1 234 567 8901',
    country: 'United States', registeredDate: 'Jul 22, 2026', registeredIso: '2026-07-22',
    status: 'Active', plan: 'Gold',
    balance: '$14,200.00', balanceNum: 14200,
    totalDeposits: '$28,000.00', totalWithdrawals: '$5,000.00', totalProfit: '$4,200.00',
  },
  {
    id: '#U-D002', name: 'Priya Sharma',    username: 'priya_sh',
    email: 'p.sharma@email.com', phone: '+91 98765 43210',
    country: 'India', registeredDate: 'Jul 22, 2026', registeredIso: '2026-07-22',
    status: 'Active', plan: 'Platinum',
    balance: '$52,800.00', balanceNum: 52800,
    totalDeposits: '$60,000.00', totalWithdrawals: '$12,800.00', totalProfit: '$5,600.00',
  },
];

// New = registered on or after Jul 20, 2026 (within 3 days of the platform date Jul 23)
const NEW_THRESHOLD = '2026-07-20';

// ─── Style maps ───────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<UserStatus, { label: string; color: string; bg: string; border: string }> = {
  Active:    { label: 'Active',    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  Suspended: { label: 'Suspended', color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20'     },
};

const PLAN_STYLE: Record<UserPlan, { color: string; bg: string; border: string }> = {
  Starter:  { color: 'text-slate-300',  bg: 'bg-slate-500/10',  border: 'border-slate-500/20'  },
  Silver:   { color: 'text-slate-200',  bg: 'bg-slate-400/10',  border: 'border-slate-400/20'  },
  Gold:     { color: 'text-amber-300',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  Platinum: { color: 'text-cyan-300',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20'   },
};

const AVATAR_COLORS = [
  'bg-blue-600/30 text-blue-300 border-blue-500/30',
  'bg-violet-600/30 text-violet-300 border-violet-500/30',
  'bg-emerald-600/30 text-emerald-300 border-emerald-500/30',
  'bg-amber-600/30 text-amber-300 border-amber-500/30',
  'bg-rose-600/30 text-rose-300 border-rose-500/30',
  'bg-cyan-600/30 text-cyan-300 border-cyan-500/30',
  'bg-indigo-600/30 text-indigo-300 border-indigo-500/30',
  'bg-pink-600/30 text-pink-300 border-pink-500/30',
];

function avatarColor(id: string) {
  const n = parseInt(id.replace(/\D/g, ''), 10) || 0;
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}

function initials(name: string) {
  const parts = name.trim().split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function amountNumber(value: string) {
  return Number(value.replace(/[$,]/g, '')) || 0;
}

function money(value: number) {
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function activityForUser(user: User): UserActivity {
  const deposits = amountNumber(user.totalDeposits);
  const profit = amountNumber(user.totalProfit);
  const withdrawals = amountNumber(user.totalWithdrawals);
  const referral = Math.round(deposits * 0.015);
  const coin = user.plan === 'Starter' ? 'BTC' : user.plan === 'Silver' ? 'USDT' : 'ETH';
  const activeInvestments = user.status === 'Active'
    ? user.plan === 'Platinum' ? 3 : user.plan === 'Gold' ? 2 : 1
    : 0;

  return {
    investments: [{
      planName: `${user.plan} Plan`,
      amount: user.totalDeposits,
      profitPct: deposits ? `${((profit / deposits) * 100).toFixed(1)}%` : '0.0%',
      status: user.status === 'Active' ? 'Active' : 'Completed',
      purchaseDate: user.registeredDate,
    }],
    deposits: [{
      coin,
      amount: user.totalDeposits,
      status: 'Completed',
      date: user.registeredDate,
    }],
    withdrawals: [{
      amount: user.totalWithdrawals,
      method: `${coin} Wallet`,
      status: withdrawals > 0 ? 'Completed' : 'Pending',
      date: user.registeredDate,
    }],
    transactions: [
      { type: 'Deposits', amount: user.totalDeposits, status: 'Completed', date: user.registeredDate },
      { type: 'Withdrawals', amount: user.totalWithdrawals, status: withdrawals > 0 ? 'Completed' : 'Pending', date: user.registeredDate },
      { type: 'Profits', amount: user.totalProfit, status: profit > 0 ? 'Completed' : 'Pending', date: user.registeredDate },
      { type: 'Bonuses', amount: money(referral), status: referral > 0 ? 'Completed' : 'Pending', date: user.registeredDate },
    ],
    activeInvestments,
    referralEarnings: money(referral),
  };
}

function statusClass(status: ActivityStatus) {
  switch (status) {
    case 'Active':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'Pending':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'Rejected':
      return 'text-red-400 bg-red-500/10 border-red-500/20';
    default:
      return 'text-sky-400 bg-sky-500/10 border-sky-500/20';
  }
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? 'w-14 h-14 text-base' : size === 'md' ? 'w-8 h-8 text-xs' : 'w-6 h-6 text-[10px]';
  return (
    <div className={`${sz} rounded-full border flex items-center justify-center font-bold shrink-0 ${avatarColor(user.id)}`}>
      {initials(user.name)}
    </div>
  );
}

// ─── Modal shell ──────────────────────────────────────────────────────────────

function ModalShell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        style={{ background: 'rgba(5,12,28,0.88)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="relative bg-[hsl(221,70%,10%)] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ModalHeader({ title, subtitle, user, onClose }: {
  title: string; subtitle?: string; user?: User; onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
      <div className="flex items-center gap-3">
        {user && <Avatar user={user} size="md" />}
        <div>
          <p className="text-sm font-bold text-white">{title}</p>
          {subtitle && <p className="text-[10px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, mono, accent }: {
  icon?: typeof Mail; label: string; value: string;
  mono?: boolean; accent?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon size={13} className="text-muted-foreground/50 mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <span className="text-[10px] text-muted-foreground shrink-0">{label}</span>
        <span className={`text-xs text-right break-all ${mono ? 'font-mono' : ''} ${accent ? 'text-accent font-semibold' : 'text-white'}`}>
          {value}
        </span>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/50">
      {children}
    </p>
  );
}

function ActivityTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: Array<Array<React.ReactNode>>;
}) {
  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[500px] text-left">
        <thead>
          <tr className="border-b border-white/5">
            {headers.map((header) => (
              <th
                key={header}
                className="px-2 py-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50 whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-white/[0.03] last:border-0">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-2 py-2.5 text-[10px] text-muted-foreground whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActivityStatus({ status }: { status: ActivityStatus }) {
  return (
    <span className={`inline-flex items-center text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${statusClass(status)}`}>
      {status}
    </span>
  );
}

function ProfileStat({ icon: Icon, label, value, accent }: {
  icon: typeof Wallet;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-lg p-3 min-w-0">
      <div className="flex items-center gap-1.5 text-muted-foreground/60 mb-1">
        <Icon size={12} />
        <span className="text-[9px] uppercase tracking-wider truncate">{label}</span>
      </div>
      <p className={`text-sm font-bold truncate ${accent ? 'text-accent' : 'text-white'}`}>{value}</p>
    </div>
  );
}

// ─── View Modal ───────────────────────────────────────────────────────────────

function ViewModal({
  user,
  onClose,
  notes,
  onSaveNotes,
  onResetPassword,
  onToggleStatus,
  onDelete,
}: {
  user: User;
  onClose: () => void;
  notes: string;
  onSaveNotes: (notes: string) => void;
  onResetPassword: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}) {
  const ss = STATUS_STYLE[user.status];
  const ps = PLAN_STYLE[user.plan];
  const activity = activityForUser(user);
  const [draftNotes, setDraftNotes] = useState(notes);

  useEffect(() => {
    let mounted = true;
    adminApiRequest<{ notes: string }>(`/admin/users/${encodeURIComponent(user.id)}/profile`)
      .then((profile) => {
        if (mounted) setDraftNotes(profile.notes);
      })
      .catch(() => {
        // The seeded profile remains visible while a WordPress/API adapter is offline.
      });
    return () => {
      mounted = false;
    };
  }, [user.id]);

  function saveNotes() {
    onSaveNotes(draftNotes.trim());
  }

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader
        title={user.name}
        subtitle={`@${user.username} · ${user.id}`}
        user={user}
        onClose={onClose}
      />

      <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Status + Plan badges */}
        <div className="flex gap-2">
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${ss.bg} ${ss.border} ${ss.color}`}>
            {user.status === 'Active' ? <ShieldCheck size={10} /> : <ShieldOff size={10} />}
            {user.status}
          </span>
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full border ${ps.bg} ${ps.border} ${ps.color}`}>
            <CreditCard size={10} />
            {user.plan} Plan
          </span>
        </div>

        {/* Personal info */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
          <SectionTitle>Personal Information</SectionTitle>
          <InfoRow icon={BadgeCheck}  label="Full Name"    value={user.name} />
          <InfoRow icon={Mail}        label="Email"        value={user.email} mono />
          <InfoRow icon={Phone}       label="Phone"        value={user.phone} mono />
          <InfoRow icon={MapPin}      label="Country"      value={user.country} />
          <InfoRow icon={Calendar}    label="Registered"   value={user.registeredDate} />
        </div>

        {/* Financial summary */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
          <SectionTitle>Financial Summary</SectionTitle>
          <InfoRow icon={Wallet}           label="Available Balance"  value={user.balance}           accent />
          <InfoRow icon={ArrowDownLeft}    label="Total Deposits"     value={user.totalDeposits} />
          <InfoRow icon={ArrowUpRight}     label="Total Withdrawals"  value={user.totalWithdrawals} />
          <InfoRow icon={TrendingUp}       label="Total Profit"       value={user.totalProfit} />
        </div>

        {/* Account statistics */}
        <div className="space-y-3">
          <SectionTitle>Account Statistics</SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <ProfileStat icon={ArrowDownLeft} label="Total Deposits" value={user.totalDeposits} />
            <ProfileStat icon={ArrowUpRight} label="Total Withdrawals" value={user.totalWithdrawals} />
            <ProfileStat icon={Wallet} label="Current Balance" value={user.balance} accent />
            <ProfileStat icon={Activity} label="Active Investments" value={String(activity.activeInvestments)} />
            <ProfileStat icon={Users} label="Referral Earnings" value={activity.referralEarnings} />
            <ProfileStat icon={TrendingUp} label="Profit Earned" value={user.totalProfit} />
          </div>
        </div>

        {/* User activity */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
          <SectionTitle>Investment History</SectionTitle>
          <ActivityTable
            headers={['Plan Name', 'Amount', 'Profit %', 'Status', 'Purchase Date']}
            rows={activity.investments.map((investment) => [
              <span className="text-white font-semibold">{investment.planName}</span>,
              investment.amount,
              investment.profitPct,
              <ActivityStatus status={investment.status} />,
              investment.purchaseDate,
            ])}
          />
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
          <SectionTitle>Deposit History</SectionTitle>
          <ActivityTable
            headers={['Coin', 'Amount', 'Status', 'Date']}
            rows={activity.deposits.map((deposit) => [
              <span className="text-white font-semibold">{deposit.coin}</span>,
              deposit.amount,
              <ActivityStatus status={deposit.status} />,
              deposit.date,
            ])}
          />
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
          <SectionTitle>Withdrawal History</SectionTitle>
          <ActivityTable
            headers={['Amount', 'Method', 'Status', 'Date']}
            rows={activity.withdrawals.map((withdrawal) => [
              withdrawal.amount,
              <span className="text-white">{withdrawal.method}</span>,
              <ActivityStatus status={withdrawal.status} />,
              withdrawal.date,
            ])}
          />
        </div>

        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
          <SectionTitle>Transaction History</SectionTitle>
          <ActivityTable
            headers={['Type', 'Amount', 'Status', 'Date']}
            rows={activity.transactions.map((transaction) => [
              <span className="text-white font-semibold">{transaction.type}</span>,
              transaction.amount,
              <ActivityStatus status={transaction.status} />,
              transaction.date,
            ])}
          />
        </div>

        {/* Admin notes */}
        <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <SectionTitle>Private Admin Notes</SectionTitle>
            <NotebookPen size={13} className="text-muted-foreground/50" />
          </div>
          <textarea
            value={draftNotes}
            onChange={(event) => setDraftNotes(event.target.value)}
            placeholder="VIP Client&#10;Requested manual withdrawal&#10;Needs verification"
            rows={4}
            className="w-full resize-y bg-white/5 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
          />
          <button
            onClick={saveNotes}
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-[10px] font-semibold py-2 px-3 rounded-lg transition-all"
          >
            <Save size={12} />
            Save Private Notes
          </button>
        </div>

        {/* Account management */}
        <div className="border border-white/5 rounded-xl p-4 space-y-3">
          <SectionTitle>Account Management</SectionTitle>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onResetPassword}
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-accent hover:bg-accent/10 border border-accent/20 rounded-lg px-3 py-2 transition-colors"
            >
              <KeyRound size={12} />
              Reset Password
            </button>
            <button
              onClick={onToggleStatus}
              className={`inline-flex items-center gap-1.5 text-[10px] font-semibold rounded-lg px-3 py-2 transition-colors ${
                user.status === 'Active'
                  ? 'text-amber-400 hover:bg-amber-500/10 border border-amber-500/20'
                  : 'text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20'
              }`}
            >
              {user.status === 'Active' ? <ShieldOff size={12} /> : <ShieldCheck size={12} />}
              {user.status === 'Active' ? 'Suspend Account' : 'Activate Account'}
            </button>
            <button
              onClick={onDelete}
              className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 transition-colors"
            >
              <Trash2 size={12} />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

interface EditForm {
  name: string; username: string; email: string;
  phone: string; status: UserStatus; plan: UserPlan;
}

function EditModal({
  user, onClose, onSave,
}: {
  user: User;
  onClose: () => void;
  onSave: (id: string, patch: Partial<User>) => void;
}) {
  const [form, setForm] = useState<EditForm>({
    name:     user.name,
    username: user.username,
    email:    user.email,
    phone:    user.phone,
    status:   user.status,
    plan:     user.plan,
  });

  function handleSave() {
    onSave(user.id, {
      name:     form.name.trim(),
      username: form.username.trim(),
      email:    form.email.trim(),
      phone:    form.phone.trim(),
      status:   form.status,
      plan:     form.plan,
    });
    onClose();
  }

  const fieldCls = 'w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-xs placeholder:text-white/20 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all';
  const labelCls = 'block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1.5';
  const selectCls = 'w-full bg-[hsl(221,70%,8%)] border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-xs focus:outline-none focus:border-accent/50 transition-all appearance-none';

  return (
    <ModalShell onClose={onClose}>
      <ModalHeader title="Edit User" subtitle={user.id} user={user} onClose={onClose} />

      <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Full Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className={fieldCls}
              placeholder="Full name"
            />
          </div>
          <div>
            <label className={labelCls}>Username</label>
            <input
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              className={fieldCls}
              placeholder="username"
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              className={fieldCls}
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label className={labelCls}>Phone Number</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className={fieldCls}
              placeholder="+1 234 567 8900"
            />
          </div>
          <div>
            <label className={labelCls}>Account Status</label>
            <div className="relative">
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as UserStatus }))}
                className={selectCls}
              >
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Investment Plan</label>
            <div className="relative">
              <select
                value={form.plan}
                onChange={(e) => setForm((f) => ({ ...f, plan: e.target.value as UserPlan }))}
                className={selectCls}
              >
                {(['Starter', 'Silver', 'Gold', 'Platinum'] as UserPlan[]).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 border-t border-white/5 flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-[0_0_16px_rgba(21,101,232,0.25)]"
        >
          <Save size={13} />
          Save Changes
        </button>
        <button
          onClick={onClose}
          className="flex-1 text-xs font-semibold text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 rounded-xl transition-colors"
        >
          Cancel
        </button>
      </div>
    </ModalShell>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

function DeleteModal({
  user, onClose, onConfirm,
}: {
  user: User; onClose: () => void; onConfirm: (id: string) => void;
}) {
  return (
    <ModalShell onClose={onClose}>
      <div className="p-6 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-red-500/15 border border-red-500/20 flex items-center justify-center">
          <AlertTriangle size={20} className="text-red-400" />
        </div>
        <div>
          <p className="text-white font-bold text-base">Delete User?</p>
          <p className="text-muted-foreground text-xs mt-1.5 leading-relaxed max-w-xs">
            You are about to permanently delete <span className="text-white font-semibold">{user.name}</span>.
            This action cannot be undone and will remove all associated data.
          </p>
        </div>
        <div className="flex gap-3 w-full mt-1">
          <button
            onClick={() => { onConfirm(user.id); onClose(); }}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-xs font-semibold py-2.5 rounded-xl transition-colors"
          >
            Yes, Delete
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type FilterKey = 'All' | 'Active' | 'Suspended' | 'New Users' | 'Investors';
type ModalMode = { kind: 'view'; user: User } | { kind: 'edit'; user: User } | { kind: 'delete'; user: User } | null;

export default function AdminUsers() {
  useAdminAuth(); // ensures admin context is wired

  const [users, setUsers]   = useState<User[]>(SEED);
  const [notesByUser, setNotesByUser] = useState<Record<string, string>>({});
  const [modal, setModal]   = useState<ModalMode>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('All');

  // Load real users from the API; fall back to demo seed on error
  useEffect(() => {
    const base = API_BASE;
    fetch(`${base}/admin/users`, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data: User[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setUsers(data);
        }
        // If API returns empty array keep demo seed so UI isn't blank
      })
      .catch(() => {
        // Keep demo seed on error
      });
  }, []);

  // ── Counts for summary cards ───────────────────────────────────────────────
  const counts = useMemo(() => ({
    total:     users.length,
    active:    users.filter((u) => u.status === 'Active').length,
    suspended: users.filter((u) => u.status === 'Suspended').length,
    investors: users.filter((u) => u.balanceNum > 0).length,
  }), [users]);

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchSearch = !q ||
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.phone.toLowerCase().includes(q);

      const matchFilter = (() => {
        switch (filter) {
          case 'Active':    return u.status === 'Active';
          case 'Suspended': return u.status === 'Suspended';
          case 'New Users': return u.registeredIso >= NEW_THRESHOLD;
          case 'Investors': return u.balanceNum > 0;
          default:          return true;
        }
      })();

      return matchSearch && matchFilter;
    });
  }, [users, search, filter]);

  // ── User actions ─────────────────────────────────────────────────────────

  function handleSave(id: string, patch: Partial<User>) {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, ...patch } : u));
    toast({ title: '✅ User Updated', description: 'User record saved successfully.' });
  }

  async function handleToggleStatus(user: User) {
    const next: UserStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await adminApiRequest(`/admin/users/${encodeURIComponent(user.id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: next }),
      });
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, status: next } : u));
      setModal((current) => current?.kind === 'view'
        ? { ...current, user: { ...current.user, status: next } }
        : current);
    } catch (error) {
      toast({ title: 'Unable to update account', description: error instanceof Error ? error.message : 'Please try again.' });
      return;
    }
    toast({
      title: next === 'Suspended' ? '🚫 User Suspended' : '✅ User Activated',
      description: `${user.name}'s account has been ${next === 'Suspended' ? 'suspended' : 'reactivated'}.`,
    });
  }

  async function handleResetPassword(user: User) {
    try {
      await adminApiRequest(`/admin/users/${encodeURIComponent(user.id)}/password-reset`, { method: 'POST' });
      toast({
        title: '🔑 Password Reset Requested',
        description: `A password reset link is ready for ${user.email}.`,
      });
    } catch (error) {
      toast({ title: 'Unable to reset password', description: error instanceof Error ? error.message : 'Please try again.' });
    }
  }

  async function handleSaveNotes(id: string, notes: string) {
    try {
      await adminApiRequest(`/admin/users/${encodeURIComponent(id)}/notes`, {
        method: 'PUT',
        body: JSON.stringify({ notes }),
      });
      setNotesByUser((prev) => ({ ...prev, [id]: notes }));
      toast({ title: '📝 Private Notes Saved', description: 'The admin note was saved to this user profile.' });
    } catch (error) {
      toast({ title: 'Unable to save private notes', description: error instanceof Error ? error.message : 'Please try again.' });
    }
  }

  async function handleDelete(id: string) {
    const u = users.find((u) => u.id === id);
    try {
      await adminApiRequest(`/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (error) {
      toast({ title: 'Unable to delete user', description: error instanceof Error ? error.message : 'Please try again.' });
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast({ title: '🗑️ User Deleted', description: `${u?.name ?? id} has been removed.` });
  }

  const FILTER_TABS: FilterKey[] = ['All', 'Active', 'Suspended', 'New Users', 'Investors'];

  const COLS = [
    'Profile', 'Full Name', 'Username', 'Email',
    'Phone', 'Registered', 'Status', 'Plan', 'Balance', 'Actions',
  ];

  return (
    <>
      {/* Modals */}
      {modal?.kind === 'view'   && (
        <ViewModal
          user={modal.user}
          notes={notesByUser[modal.user.id] ?? ''}
          onClose={() => setModal(null)}
          onSaveNotes={(notes) => handleSaveNotes(modal.user.id, notes)}
          onResetPassword={() => handleResetPassword(modal.user)}
          onToggleStatus={() => handleToggleStatus(modal.user)}
          onDelete={() => setModal({ kind: 'delete', user: modal.user })}
        />
      )}
      {modal?.kind === 'edit'   && <EditModal   user={modal.user} onClose={() => setModal(null)} onSave={handleSave} />}
      {modal?.kind === 'delete' && <DeleteModal user={modal.user} onClose={() => setModal(null)} onConfirm={handleDelete} />}

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Browse, search, and manage all registered users.
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total Users',  value: counts.total,     icon: Users,      color: 'text-accent',         bg: 'bg-accent/10',         border: 'border-accent/20'         },
            { label: 'Active',       value: counts.active,    icon: UserCheck,  color: 'text-emerald-400',    bg: 'bg-emerald-500/10',    border: 'border-emerald-500/20'    },
            { label: 'Suspended',    value: counts.suspended, icon: UserX,      color: 'text-red-400',        bg: 'bg-red-500/10',        border: 'border-red-500/20'        },
            { label: 'Investors',    value: counts.investors, icon: TrendingUp, color: 'text-amber-400',      bg: 'bg-amber-500/10',      border: 'border-amber-500/20'      },
          ].map((s) => (
            <div key={s.label} className="bg-card/40 border border-white/5 rounded-xl p-4 flex items-center gap-3">
              <div className={`${s.bg} border ${s.border} p-2.5 rounded-lg`}>
                <s.icon size={15} className={s.color} />
              </div>
              <div>
                <p className="text-white font-bold text-xl leading-tight">{s.value}</p>
                <p className="text-muted-foreground text-[10px]">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table panel */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-card/40 border border-white/5 rounded-xl overflow-hidden"
        >
          {/* Toolbar */}
          <div className="flex flex-col lg:flex-row gap-3 px-5 py-4 border-b border-white/5">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <Input
                placeholder="Search name, username, email, phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 bg-muted/40 border-white/10 text-white placeholder:text-white/25 text-xs"
              />
            </div>

            {/* Filter tabs */}
            <div className="flex items-center gap-0.5 bg-muted/30 border border-white/8 rounded-lg p-1 overflow-x-auto">
              {FILTER_TABS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-[11px] font-medium px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                    filter === f
                      ? 'bg-primary/30 text-accent'
                      : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1080px]">
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
                {rows.map((u) => {
                  const ss = STATUS_STYLE[u.status];
                  const ps = PLAN_STYLE[u.plan];
                  return (
                    <motion.tr
                      key={u.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Avatar */}
                      <td className="px-4 py-3.5">
                        <Avatar user={u} size="md" />
                      </td>

                      {/* Full Name */}
                      <td className="px-4 py-3.5">
                        <p className="text-white text-xs font-semibold whitespace-nowrap">{u.name}</p>
                        <p className="text-muted-foreground/50 text-[10px] font-mono">{u.id}</p>
                      </td>

                      {/* Username */}
                      <td className="px-4 py-3.5 text-muted-foreground text-xs font-mono">
                        @{u.username}
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 text-muted-foreground text-[10px] whitespace-nowrap">
                        {u.email}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3.5 text-muted-foreground text-[10px] whitespace-nowrap font-mono">
                        {u.phone}
                      </td>

                      {/* Registered */}
                      <td className="px-4 py-3.5 text-muted-foreground text-[10px] whitespace-nowrap">
                        {u.registeredDate}
                        {u.registeredIso >= NEW_THRESHOLD && (
                          <span className="ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20">
                            NEW
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ss.bg} ${ss.border} ${ss.color} whitespace-nowrap`}>
                          {u.status === 'Active' ? <ShieldCheck size={9} /> : <ShieldOff size={9} />}
                          {u.status}
                        </span>
                      </td>

                      {/* Plan */}
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ps.bg} ${ps.border} ${ps.color} whitespace-nowrap`}>
                          {u.plan}
                        </span>
                      </td>

                      {/* Balance */}
                      <td className="px-4 py-3.5 text-white text-xs font-bold whitespace-nowrap">
                        {u.balance}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* View */}
                          <button
                            onClick={() => setModal({ kind: 'view', user: u })}
                            title="View Profile"
                            className="flex items-center gap-1 text-[10px] font-semibold text-accent hover:text-accent/70 border border-accent/20 hover:border-accent/40 rounded-md px-2 py-1 transition-colors whitespace-nowrap"
                          >
                            <Eye size={10} />
                            View
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => setModal({ kind: 'edit', user: u })}
                            title="Edit User"
                            className="flex items-center gap-1 text-[10px] font-semibold text-white/70 hover:text-white border border-white/10 hover:border-white/25 rounded-md px-2 py-1 transition-colors whitespace-nowrap"
                          >
                            <Pencil size={10} />
                            Edit
                          </button>

                          {/* Suspend / Activate */}
                          {u.status === 'Active' ? (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              title="Suspend User"
                              className="flex items-center gap-1 text-[10px] font-semibold text-amber-400 hover:bg-amber-500/10 border border-amber-500/20 rounded-md px-2 py-1 transition-colors whitespace-nowrap"
                            >
                              <ShieldOff size={10} />
                              Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              title="Activate User"
                              className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-md px-2 py-1 transition-colors whitespace-nowrap"
                            >
                              <ShieldCheck size={10} />
                              Activate
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => setModal({ kind: 'delete', user: u })}
                            title="Delete User"
                            className="flex items-center gap-1 text-[10px] font-semibold text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border border-red-500/15 hover:border-red-500/30 rounded-md px-2 py-1 transition-colors"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}

                {rows.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-5 py-14 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                        <Users size={28} strokeWidth={1.2} />
                        <p className="text-sm">No users match your search or filter.</p>
                        {(search || filter !== 'All') && (
                          <button
                            onClick={() => { setSearch(''); setFilter('All'); }}
                            className="text-xs text-accent hover:text-accent/70 mt-1 transition-colors"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <p className="text-[10px] text-muted-foreground/50">
              Showing {rows.length} of {users.length} users
              {filter !== 'All' && ` · Filter: ${filter}`}
            </p>
            {(search || filter !== 'All') && (
              <button
                onClick={() => { setSearch(''); setFilter('All'); }}
                className="text-[10px] text-accent hover:text-accent/70 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
