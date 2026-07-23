import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Check, ArrowRight, ArrowDownToLine, Clock, FileText,
  QrCode, AlertCircle,
} from 'lucide-react';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiTether } from 'react-icons/si';
import { StatCard } from '@/components/dashboard/StatCard';
import { toast } from '@/hooks/use-toast';
import QRCode from 'qrcode';

// ─── Wallet configuration ─────────────────────────────────────────────────────
// To update a wallet address, change only the `address` field here.
// Nothing else in the component needs to change.

const PAYMENT_METHODS = [
  {
    id: 'btc',
    name: 'Bitcoin',
    ticker: 'BTC',
    network: 'BTC Network',
    icon: FaBitcoin,
    color: 'text-[#F7931A]',
    bgGlow: 'rgba(247,147,26,0.15)',
    address: '1MNj9kLqBH5Hb2vyRJkVvebfwKdxsD3yFK',
    confirmations: '3 network confirmations (~30 min)',
    minDeposit: '$100',
  },
  {
    id: 'eth',
    name: 'Ethereum',
    ticker: 'ETH',
    network: 'ERC20',
    icon: FaEthereum,
    color: 'text-[#627EEA]',
    bgGlow: 'rgba(98,126,234,0.15)',
    address: '0x0f6d68e8471a9d9a97c1a8268c1fec08f50d0076',
    confirmations: '12 network confirmations (~3 min)',
    minDeposit: '$100',
  },
  {
    id: 'usdt',
    name: 'USDT',
    ticker: 'TRC20',
    network: 'TRC20 (TRON)',
    icon: SiTether,
    color: 'text-[#26A17B]',
    bgGlow: 'rgba(38,161,123,0.15)',
    address: 'TFpKuiUfgU32CLAxxvFZArpBYoysU1pjq',
    confirmations: '20 network confirmations (~1 min)',
    minDeposit: '$100',
  },
] as const;

type Method = (typeof PAYMENT_METHODS)[number];

// ─── Mock history ─────────────────────────────────────────────────────────────

const MOCK_HISTORY = [
  { id: 'DEP-8492', amount: '$25,000.00', method: 'Bitcoin',       date: 'Oct 24, 2023, 14:20 PM', status: 'Completed' },
  { id: 'DEP-8491', amount: '$10,000.00', method: 'Ethereum',      date: 'Oct 20, 2023, 16:00 PM', status: 'Completed' },
  { id: 'DEP-8490', amount: '$50,000.00', method: 'Bank Transfer',  date: 'Sep 15, 2023, 11:00 AM', status: 'Completed' },
  { id: 'DEP-8489', amount: '$10,000.00', method: 'USDT (TRC20)',   date: 'Sep 05, 2023, 10:20 AM', status: 'Completed' },
  { id: 'DEP-8488', amount: '$5,000.00',  method: 'Bitcoin',       date: 'Aug 12, 2023, 09:15 AM', status: 'Completed' },
  { id: 'DEP-8487', amount: '$15,000.00', method: 'Ethereum',      date: 'Jul 28, 2023, 13:40 PM', status: 'Completed' },
  { id: 'DEP-8486', amount: '$2,500.00',  method: 'Bitcoin',       date: 'Jul 10, 2023, 08:30 AM', status: 'Completed' },
  { id: 'DEP-8485', amount: '$1,000.00',  method: 'USDT (TRC20)',   date: 'Jun 22, 2023, 17:50 PM', status: 'Completed' },
  { id: 'DEP-8484', amount: '$4,000.00',  method: 'Bank Transfer',  date: 'May 18, 2023, 14:10 PM', status: 'Completed' },
  { id: 'DEP-8483', amount: '$2,500.00',  method: 'Bitcoin',       date: 'Apr 05, 2023, 11:25 AM', status: 'Completed' },
];

// ─── Payment URI builder ──────────────────────────────────────────────────────

function buildPaymentUri(method: Method): string {
  switch (method.id) {
    case 'btc':  return `bitcoin:${method.address}`;
    case 'eth':  return `ethereum:${method.address}`;
    case 'usdt': return method.address;            // TRON has no standard URI prefix
    default:     throw new Error('Unsupported payment method');
  }
}

// ─── Real QR code card ────────────────────────────────────────────────────────

function QrCodeCard({ method }: { method: Method }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const prevId = useRef<string>('');

  useEffect(() => {
    let cancelled = false;
    if (prevId.current !== method.id) {
      setDataUrl(null);          // clear while regenerating
      prevId.current = method.id;
    }
    const uri = buildPaymentUri(method);
    QRCode.toDataURL(uri, {
      width: 220,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then((url) => {
      if (!cancelled) setDataUrl(url);
    });
    return () => { cancelled = true; };
  }, [method]);

  return (
    /* Premium glassmorphism container */
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">

      {/* Network + coin badge row */}
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center w-6 h-6 rounded-full"
          style={{ background: method.bgGlow }}
        >
          <method.icon className={`text-sm ${method.color}`} />
        </div>
        <span className="text-xs font-semibold text-white/70 tracking-wide uppercase">
          {method.name}
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-white/40 font-medium">
          {method.network}
        </span>
      </div>

      {/* QR image — white card with rounded corners + shadow */}
      <div className="relative rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
        <AnimatePresence mode="wait">
          {dataUrl ? (
            <motion.img
              key={method.id}
              src={dataUrl}
              alt={`${method.name} payment QR code`}
              width={180}
              height={180}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="block w-[180px] h-[180px] rounded-2xl"
              draggable={false}
            />
          ) : (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-[180px] h-[180px] bg-white/5 rounded-2xl flex items-center justify-center"
            >
              <QrCode className="w-8 h-8 text-white/20 animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scan hint */}
      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        Scan with your <span className="text-white/60 font-medium">{method.name}</span> wallet app
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Deposits() {
  const [amount,    setAmount]    = useState('');
  const [method,    setMethod]    = useState<Method>(PAYMENT_METHODS[0]);
  const [copied,    setCopied]    = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(method.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast({ title: 'Wallet address copied.' });
  };

  const amountNum   = Number(amount);
  const canSubmit   = amount !== '' && amountNum >= 100;

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.25)]">
          <Check size={36} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Payment Submitted</h2>
        <p className="text-muted-foreground max-w-md leading-relaxed mb-2">
          Your deposit of <span className="text-white font-semibold">${Number(amount).toLocaleString()}</span> via{' '}
          <span className="text-white font-semibold">{method.name} ({method.network})</span> is pending verification.
        </p>
        <p className="text-muted-foreground max-w-md text-sm">
          Funds will be credited after {method.confirmations}.
        </p>
        <button
          onClick={() => { setSubmitted(false); setAmount(''); }}
          className="mt-10 text-sm text-primary hover:text-accent font-medium transition-colors"
        >
          ← Make another deposit
        </button>
      </motion.div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Deposits</h1>
        <p className="text-muted-foreground">Add capital to your Quantum Investments account.</p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard delay={0}   title="Total Deposited"  value="$125,000.00" icon={ArrowDownToLine} />
        <StatCard delay={0.1} title="Last Deposit"     value="$25,000.00"  icon={FileText} />
        <StatCard delay={0.2} title="Pending Deposits" value="$0.00"       icon={Clock} />
      </div>

      {/* Deposit form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* Left — amount + coin selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10,000"
                min={100}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Minimum deposit: $100.00</p>
          </div>

          {/* Coin selector */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">Select Cryptocurrency</label>
            <div className="flex flex-col gap-3">
              {PAYMENT_METHODS.map((m) => {
                const isSelected = method.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all text-left ${
                      isSelected
                        ? 'bg-primary/10 border-primary shadow-[0_0_18px_rgba(21,101,232,0.2)]'
                        : 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/8'
                    }`}
                  >
                    <m.icon className={`text-2xl shrink-0 ${m.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.network}</p>
                    </div>
                    {/* Selected indicator */}
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-primary bg-primary' : 'border-white/20'
                    }`}>
                      {isSelected && <Check size={9} strokeWidth={3} className="text-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instructions panel */}
          <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={14} className="text-accent shrink-0" />
              <span className="text-xs font-semibold text-accent uppercase tracking-wide">Deposit Instructions</span>
            </div>
            {[
              'Enter the USD amount you wish to deposit.',
              `Select your preferred cryptocurrency above.`,
              'Copy the wallet address shown on the right.',
              'Send exactly the equivalent crypto amount to that address.',
              'Click "I Have Sent Payment" to notify our team.',
              `Your balance updates after ${method.confirmations}.`,
            ].map((step, i) => (
              <p key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                <span className="shrink-0 w-4 h-4 rounded-full bg-white/8 text-white/50 text-[10px] font-bold flex items-center justify-center mt-px">
                  {i + 1}
                </span>
                {step}
              </p>
            ))}
          </div>
        </motion.div>

        {/* Right — wallet address + QR + action */}
        <motion.div
          key={method.id}                          // re-animate when coin changes
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 space-y-5"
        >
          {/* Selected coin header */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: method.bgGlow }}
            >
              <method.icon className={`text-xl ${method.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{method.name}</p>
              <p className="text-xs text-muted-foreground">{method.network}</p>
            </div>
          </div>

          {/* QR code */}
          <QrCodeCard method={method} />

          {/* Wallet address */}
          <div className="bg-background/70 border border-white/8 rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium">
              {method.name} Deposit Address
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={method.address}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="text-sm font-mono text-white break-all leading-relaxed mb-3 select-all"
              >
                {method.address}
              </motion.p>
            </AnimatePresence>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                copied
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                  : 'bg-white/5 border-white/10 text-accent hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy Address'}
            </button>
          </div>

          {/* Warning */}
          <div className="flex gap-2 bg-yellow-500/8 border border-yellow-500/20 rounded-xl p-3">
            <AlertCircle size={14} className="text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-300/80 leading-relaxed">
              Only send <strong className="text-yellow-300">{method.name} ({method.network})</strong> to this address.
              Sending any other asset will result in permanent loss.
            </p>
          </div>

          {/* CTA */}
          <button
            onClick={() => { if (canSubmit) setSubmitted(true); }}
            disabled={!canSubmit}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_24px_rgba(21,101,232,0.3)] hover:shadow-[0_0_32px_rgba(21,101,232,0.45)]"
          >
            I Have Sent Payment <ArrowRight size={17} />
          </button>

          {!canSubmit && amount !== '' && amountNum < 100 && (
            <p className="text-xs text-red-400 text-center -mt-2">
              Minimum deposit is $100.00
            </p>
          )}
          {!amount && (
            <p className="text-xs text-muted-foreground text-center -mt-2">
              Enter an amount above to continue
            </p>
          )}
        </motion.div>
      </div>

      {/* Deposit history */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Deposit History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="p-4">TXN ID</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_HISTORY.map((row, i) => (
                <motion.tr
                  key={row.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 + 0.5 }}
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                >
                  <td className="p-4 font-mono text-white/80">{row.id}</td>
                  <td className="p-4 font-bold text-white">{row.amount}</td>
                  <td className="p-4 text-white">{row.method}</td>
                  <td className="p-4 text-muted-foreground">{row.date}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      row.status === 'Completed'
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : row.status === 'Pending'
                        ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
