import { useEffect, useRef, useCallback, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, TrendingDown, TrendingUp, UserPlus } from 'lucide-react';

// ─── Data pools ──────────────────────────────────────────────────────────────

const FIRST_NAMES = [
  'James', 'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'William', 'Sophia',
  'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Charlotte', 'Alexander',
  'Amelia', 'Mason', 'Harper', 'Ethan', 'Evelyn', 'Daniel', 'Abigail',
  'Michael', 'Emily', 'Elijah', 'Elizabeth', 'Owen', 'Mila', 'Aiden', 'Ella',
];

const LAST_INITIALS = 'ABCDEFGHJKLMNPRSTW'.split('');

const LOCATIONS = [
  'New York, US', 'London, UK', 'Toronto, CA', 'Sydney, AU', 'Dubai, UAE',
  'Singapore, SG', 'Frankfurt, DE', 'Tokyo, JP', 'Paris, FR', 'Zurich, CH',
  'Amsterdam, NL', 'Hong Kong', 'Seoul, KR', 'Stockholm, SE', 'Miami, US',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randName() {
  return `${pick(FIRST_NAMES)} ${pick(LAST_INITIALS)}.`;
}

function formatAmount(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
}

// ─── Types ───────────────────────────────────────────────────────────────────

type NotifKind = 'withdrawal' | 'deposit' | 'investor';

interface Notif {
  id: number;
  kind: NotifKind;
  name: string;
  location: string;
  amount?: number;
  plan?: string;
}

const PLANS = ['Starter Plan', 'Growth Plan', 'Premium Plan', 'Elite Plan'];

let _id = 0;
function makeNotif(kind: NotifKind): Notif {
  return {
    id: ++_id,
    kind,
    name: randName(),
    location: pick(LOCATIONS),
    amount: kind !== 'investor' ? rand(500, 50_000) : undefined,
    plan: kind === 'investor' ? pick(PLANS) : undefined,
  };
}

// ─── Config per kind ─────────────────────────────────────────────────────────

const KIND_META: Record<
  NotifKind,
  { label: string; verb: string; Icon: typeof TrendingDown; color: string; bg: string; border: string }
> = {
  withdrawal: {
    label: 'Withdrawal',
    verb: 'just withdrew',
    Icon: TrendingDown,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/30',
  },
  deposit: {
    label: 'Deposit',
    verb: 'just deposited',
    Icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/30',
  },
  investor: {
    label: 'New Investor',
    verb: 'just joined',
    Icon: UserPlus,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/30',
  },
};

// Auto-dismiss each notification after this many ms
const AUTO_DISMISS_MS = 5_500;
// Max notifications shown at once
const MAX_VISIBLE = 3;

// ─── Component ───────────────────────────────────────────────────────────────

export function LiveNotifications() {
  const [queue, setQueue] = useState<Notif[]>([]);
  const withdrawalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const depositTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const investorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback((id: number) => {
    setQueue((q) => q.filter((n) => n.id !== id));
  }, []);

  const push = useCallback((kind: NotifKind) => {
    const notif = makeNotif(kind);
    setQueue((q) => {
      // Keep only the most recent MAX_VISIBLE (drop oldest if at cap)
      const next = [...q, notif];
      return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next;
    });
    // Auto-dismiss
    setTimeout(() => dismiss(notif.id), AUTO_DISMISS_MS);
  }, [dismiss]);

  // Schedule the next withdrawal notification (8–12 s)
  const scheduleWithdrawal = useCallback(() => {
    withdrawalTimer.current = setTimeout(() => {
      push('withdrawal');
      scheduleWithdrawal();
    }, rand(8_000, 12_000));
  }, [push]);

  // Schedule the next deposit notification (12–18 s)
  const scheduleDeposit = useCallback(() => {
    depositTimer.current = setTimeout(() => {
      push('deposit');
      scheduleDeposit();
    }, rand(12_000, 18_000));
  }, [push]);

  // Schedule the next investor notification (20–35 s)
  const scheduleInvestor = useCallback(() => {
    investorTimer.current = setTimeout(() => {
      push('investor');
      scheduleInvestor();
    }, rand(20_000, 35_000));
  }, [push]);

  useEffect(() => {
    // Stagger the initial fires so they don't all fire at once
    const t1 = setTimeout(scheduleWithdrawal, rand(3_000, 6_000));
    const t2 = setTimeout(scheduleDeposit, rand(7_000, 12_000));
    const t3 = setTimeout(scheduleInvestor, rand(15_000, 22_000));

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (withdrawalTimer.current) clearTimeout(withdrawalTimer.current);
      if (depositTimer.current) clearTimeout(depositTimer.current);
      if (investorTimer.current) clearTimeout(investorTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // Fixed overlay — above navbar (z-50) and sidebar (z-40/z-50), below modal backdrops
    <div
      className="fixed bottom-4 left-4 z-[500] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Live activity notifications"
    >
      <AnimatePresence initial={false} mode="sync">
        {queue.map((notif) => (
          <NotifCard key={notif.id} notif={notif} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ─── Single notification card ─────────────────────────────────────────────────

function NotifCard({ notif, onDismiss }: { notif: Notif; onDismiss: (id: number) => void }) {
  const meta = KIND_META[notif.kind];
  const { Icon } = meta;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -40, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -40, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      className={[
        'pointer-events-auto relative flex items-start gap-3',
        'w-[min(88vw,320px)] rounded-xl border px-4 py-3',
        'shadow-2xl backdrop-blur-md',
        // Brand dark navy card background
        'bg-[hsl(224,50%,13%)/90%]',
        meta.border,
      ].join(' ')}
      style={{
        background: 'rgba(10, 19, 48, 0.92)',
        borderColor: 'rgba(var(--tw-border-opacity, 1))',
      }}
      role="alert"
    >
      {/* Icon badge */}
      <div
        className={[
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          meta.bg,
        ].join(' ')}
      >
        <Icon className={['h-4 w-4', meta.color].join(' ')} strokeWidth={2.2} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-0.5">
          {meta.label}
        </p>
        <p className="text-sm font-medium text-white leading-snug">
          <span className="text-white font-semibold">{notif.name}</span>{' '}
          <span className="text-white/70">{meta.verb}</span>{' '}
          {notif.amount !== undefined && (
            <span className={['font-bold', meta.color].join(' ')}>
              {formatAmount(notif.amount)}
            </span>
          )}
          {notif.plan && (
            <span className={['font-semibold', meta.color].join(' ')}>
              {notif.plan}
            </span>
          )}
        </p>
        <p className="text-[11px] text-white/40 mt-0.5">{notif.location} · just now</p>
      </div>

      {/* Close button */}
      <button
        onClick={() => onDismiss(notif.id)}
        className="ml-1 shrink-0 rounded-md p-1 text-white/30 hover:text-white/80 hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
