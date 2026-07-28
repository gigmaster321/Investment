import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearch } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Check, ArrowRight, ArrowDownToLine, Clock, FileText,
  QrCode, AlertCircle, Upload, X, ChevronDown, Info,
} from 'lucide-react';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiTether } from 'react-icons/si';
import { StatCard } from '@/components/dashboard/StatCard';
import { toast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import { useAuth } from '@/contexts/AuthContext';
import { useInvestmentPlans } from '@/lib/investment-plans';
import { depositApi, fileToBase64, type DepositRequest } from '@/lib/deposit-api';
import { walletApi } from '@/lib/wallet-api';

// ─── Wallet configuration ─────────────────────────────────────────────────────

interface PaymentMethod {
  id: string;
  name: string;
  ticker: string;
  network: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgGlow: string;
  address: string;
  confirmations: string;
  minDeposit: string;
}

/** Static UI config — addresses are loaded dynamically from the API. */
const PAYMENT_METHODS_BASE: Omit<PaymentMethod, 'address'>[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    ticker: 'BTC',
    network: 'BTC Network',
    icon: FaBitcoin,
    color: 'text-[#F7931A]',
    bgGlow: 'rgba(247,147,26,0.15)',
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
    confirmations: '12 network confirmations (~3 min)',
    minDeposit: '$100',
  },
  {
    id: 'usdt_trc20',
    name: 'USDT (TRC20)',
    ticker: 'TRC20',
    network: 'TRC20 (TRON)',
    icon: SiTether,
    color: 'text-[#26A17B]',
    bgGlow: 'rgba(38,161,123,0.15)',
    confirmations: '20 network confirmations (~1 min)',
    minDeposit: '$100',
  },
  {
    id: 'usdt_erc20',
    name: 'USDT (ERC20)',
    ticker: 'ERC20',
    network: 'ERC20 (Ethereum)',
    icon: SiTether,
    color: 'text-[#26A17B]',
    bgGlow: 'rgba(38,161,123,0.15)',
    confirmations: '12 network confirmations (~3 min)',
    minDeposit: '$100',
  },
];

type Method = PaymentMethod;

function buildPaymentUri(method: Method): string {
  switch (method.id) {
    case 'btc':       return method.address ? `bitcoin:${method.address}` : '';
    case 'eth':       return method.address ? `ethereum:${method.address}` : '';
    case 'usdt_trc20':
    case 'usdt_erc20':
    default:          return method.address;
  }
}

// ─── QR code card ─────────────────────────────────────────────────────────────

function QrCodeCard({ method }: { method: Method }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const prevId = useRef<string>('');

  useEffect(() => {
    let cancelled = false;
    if (prevId.current !== method.id) {
      setDataUrl(null);
      prevId.current = method.id;
    }
    const uri = buildPaymentUri(method);
    // Do not call QRCode with an empty string — it throws "No input text"
    if (!uri) {
      setDataUrl(null);
      return;
    }
    QRCode.toDataURL(uri, {
      width: 220, margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    }).then((url) => { if (!cancelled) setDataUrl(url); });
    return () => { cancelled = true; };
  }, [method]);

  const hasAddress = Boolean(method.address);

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-6 shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ background: method.bgGlow }}>
          <method.icon className={`text-sm ${method.color}`} />
        </div>
        <span className="text-xs font-semibold text-white/70 tracking-wide uppercase">{method.name}</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 border border-white/10 text-white/40 font-medium">{method.network}</span>
      </div>
      <div className="relative rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
        <AnimatePresence mode="wait">
          {dataUrl ? (
            <motion.img key={method.id} src={dataUrl} alt={`${method.name} QR`} width={180} height={180}
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }} className="block w-[180px] h-[180px] rounded-2xl" draggable={false} />
          ) : hasAddress ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-[180px] h-[180px] bg-white/5 rounded-2xl flex items-center justify-center">
              <QrCode className="w-8 h-8 text-white/20 animate-pulse" />
            </motion.div>
          ) : (
            <motion.div key="no-address" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="w-[180px] h-[180px] bg-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 px-3">
              <AlertCircle className="w-8 h-8 text-white/20" />
              <p className="text-[10px] text-white/30 text-center leading-relaxed">
                Wallet address not configured. Contact support.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="text-xs text-muted-foreground text-center leading-relaxed">
        {hasAddress
          ? <>Scan with your <span className="text-white/60 font-medium">{method.name}</span> wallet app</>
          : <span className="text-white/30">Wallet address not configured. Contact support.</span>
        }
      </p>
    </div>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'Approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
    status === 'Rejected' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
    'bg-amber-500/10 border-amber-500/20 text-amber-400';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${cls}`}>
      {status}
    </span>
  );
}

// ─── Payment submission form (step 2) ─────────────────────────────────────────

interface SubmitFormProps {
  prefillAmount: string;
  selectedMethod: Method;
  onSuccess: () => void;
  onBack: () => void;
}

function SubmitForm({ prefillAmount, selectedMethod, onSuccess, onBack }: SubmitFormProps) {
  const { plans } = useInvestmentPlans();
  const activePlans = plans.filter((p) => p.status === 'Active');

  const [amount, setAmount]       = useState(prefillAmount);
  const [planId, setPlanId]       = useState('');
  const [txnId, setTxnId]         = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshot(file);
    const preview = URL.createObjectURL(file);
    setScreenshotPreview(preview);
  };

  const handleSubmit = async () => {
    const num = Number(amount);
    if (!num || num < 100) {
      toast({ title: 'Invalid amount', description: 'Minimum deposit is $100.' });
      return;
    }

    setSubmitting(true);
    try {
      let screenshotData: string | undefined;
      if (screenshot) {
        screenshotData = await fileToBase64(screenshot);
      }

      const selectedPlan = activePlans.find((p) => p.id === planId);

      await depositApi.create({
        amount: num,
        plan_id: planId || undefined,
        plan_name: selectedPlan?.name || undefined,
        payment_method: selectedMethod.name,
        transaction_id: txnId || undefined,
        screenshot_data: screenshotData,
      });

      onSuccess();
    } catch (err: any) {
      toast({ title: 'Submission failed', description: err?.message ?? 'Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-white/5">
        <button onClick={onBack} className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors">
          <X size={16} />
        </button>
        <h3 className="text-base font-semibold text-white">Confirm Payment Details</h3>
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-medium text-white/70 mb-1.5">Deposit Amount (USD)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={100}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
      </div>

      {/* Plan selector */}
      <div>
        <label className="block text-xs font-medium text-white/70 mb-1.5">Investment Plan</label>
        <div className="relative">
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-8 text-white appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          >
            <option value="" className="bg-[hsl(221,70%,12%)]">Select a plan (optional)</option>
            {activePlans.map((p) => (
              <option key={p.id} value={p.id} className="bg-[hsl(221,70%,12%)]">{p.name} — {p.profitPercentage}%</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction ID */}
      <div>
        <label className="block text-xs font-medium text-white/70 mb-1.5">Transaction ID <span className="text-white/30">(optional)</span></label>
        <input
          type="text"
          value={txnId}
          onChange={(e) => setTxnId(e.target.value)}
          placeholder="Paste your transaction hash"
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 font-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
      </div>

      {/* Screenshot upload */}
      <div>
        <label className="block text-xs font-medium text-white/70 mb-1.5">Payment Screenshot <span className="text-white/30">(optional)</span></label>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        {screenshotPreview ? (
          <div className="relative rounded-xl overflow-hidden border border-white/10 group">
            <img src={screenshotPreview} alt="Screenshot preview" className="w-full max-h-40 object-contain bg-black/20" />
            <button
              onClick={() => { setScreenshot(null); setScreenshotPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
              className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border border-dashed border-white/15 rounded-xl py-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-white/30 hover:bg-white/[0.02] transition-all"
          >
            <Upload size={20} />
            <span className="text-xs">Click to upload screenshot</span>
          </button>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || !amount || Number(amount) < 100}
        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_24px_rgba(21,101,232,0.3)]"
      >
        {submitting ? 'Submitting…' : 'Submit Deposit Request'}
        {!submitting && <ArrowRight size={17} />}
      </button>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Deposits() {
  const { user, refreshUser } = useAuth();
  const search = useSearch();
  const searchParams = new URLSearchParams(search);
  const minAmountParam = searchParams.get('minAmount');
  const planNameParam = searchParams.get('planName');
  const redirectedFromInvest = minAmountParam !== null;

  const [amount,    setAmount]    = useState(minAmountParam ?? '');
  const [method,    setMethod]    = useState<Method>({ ...PAYMENT_METHODS_BASE[0], address: '' });
  const [copied,    setCopied]    = useState(false);
  const [step,      setStep]      = useState<'form' | 'submit' | 'success'>('form');
  const [deposits,  setDeposits]  = useState<DepositRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [walletAddresses, setWalletAddresses] = useState<Record<string, string>>({});

  const loadDeposits = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const rows = await depositApi.list();
      setDeposits(rows);
    } catch {
      // silently fail — deposit history is non-critical
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  // Load wallet addresses from the database
  useEffect(() => {
    walletApi.list()
      .then((ws) => {
        const map: Record<string, string> = {};
        ws.forEach((w) => { map[w.coin_id] = w.address; });
        setWalletAddresses(map);
      })
      .catch(() => {}); // non-critical — show empty address on error
  }, []);

  useEffect(() => { void loadDeposits(); }, [loadDeposits]);

  // Build the full payment methods list with live addresses from DB
  const paymentMethods: Method[] = PAYMENT_METHODS_BASE.map((m) => ({
    ...m,
    address: walletAddresses[m.id] ?? '',
  }));

  // The currently selected method with its live address
  const methodWithAddress: Method = {
    ...method,
    address: walletAddresses[method.id] ?? '',
  };

  const handleCopy = () => {
    if (!methodWithAddress.address) {
      toast({ title: 'No address configured', description: 'Contact support.' });
      return;
    }
    navigator.clipboard.writeText(methodWithAddress.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
    toast({ title: 'Wallet address copied.' });
  };

  const amountNum = Number(amount);
  const canProceed = amount !== '' && amountNum >= 100;

  const totalDeposited = Number(user?.total_deposit ?? 0);
  const lastDeposit = deposits.find((d) => d.status === 'Approved');
  const pendingCount = deposits.filter((d) => d.status === 'Pending').length;

  // ── Success screen ──────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.25)]">
          <Check size={36} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Payment Submitted</h2>
        <p className="text-muted-foreground max-w-md leading-relaxed mb-2">
          Your deposit request has been received and is pending admin verification.
        </p>
        <p className="text-muted-foreground max-w-md text-sm">
          You will see your balance update once approved.
        </p>
        <button
          onClick={() => { setStep('form'); setAmount(''); void loadDeposits(); void refreshUser(); }}
          className="mt-10 text-sm text-primary hover:text-accent font-medium transition-colors"
        >
          ← Make another deposit
        </button>
      </motion.div>
    );
  }

  // ── Submit step ─────────────────────────────────────────────────────────────
  if (step === 'submit') {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">Deposits</h1>
          <p className="text-muted-foreground">Add capital to your Quantum Investments account.</p>
        </header>
        <div className="max-w-lg">
          <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
            <SubmitForm
              prefillAmount={amount}
              selectedMethod={method}
              onSuccess={() => setStep('success')}
              onBack={() => setStep('form')}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Deposits</h1>
        <p className="text-muted-foreground">Add capital to your Quantum Investments account.</p>
      </header>

      {/* Insufficient balance banner — shown when redirected from Invest flow */}
      {redirectedFromInvest && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl p-4"
        >
          <Info size={18} className="text-amber-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-amber-300 font-semibold text-sm">
              Your wallet balance is insufficient.
            </p>
            <p className="text-amber-400/80 text-sm mt-0.5">
              Please deposit at least the minimum amount required
              {planNameParam ? ` for the ${planNameParam} Plan` : ''}.
              {minAmountParam ? ` Minimum: $${Number(minAmountParam).toLocaleString()}.` : ''}
            </p>
          </div>
        </motion.div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard delay={0}   title="Total Deposited"  value={`$${totalDeposited.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} icon={ArrowDownToLine} />
        <StatCard delay={0.1} title="Last Deposit"     value={lastDeposit ? `$${Number(lastDeposit.approved_amount ?? lastDeposit.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '$0.00'} icon={FileText} />
        <StatCard delay={0.2} title="Pending Deposits" value={String(pendingCount)} icon={Clock} />
      </div>

      {/* Deposit form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* Left — amount + coin selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <input
                type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="10,000" min={100}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Minimum deposit: $100.00</p>
          </div>

          {/* Coin selector */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">Select Cryptocurrency</label>
            <div className="flex flex-col gap-3">
              {paymentMethods.map((m) => {
                const isSelected = method.id === m.id;
                return (
                  <button key={m.id} onClick={() => setMethod(m)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all text-left ${
                      isSelected ? 'bg-primary/10 border-primary shadow-[0_0_18px_rgba(21,101,232,0.2)]' : 'bg-white/5 border-white/5 hover:border-white/15 hover:bg-white/8'
                    }`}
                  >
                    <m.icon className={`text-2xl shrink-0 ${m.color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.network}</p>
                    </div>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-white/20'}`}>
                      {isSelected && <Check size={9} strokeWidth={3} className="text-white" />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white/[0.03] border border-white/8 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={14} className="text-accent shrink-0" />
              <span className="text-xs font-semibold text-accent uppercase tracking-wide">Deposit Instructions</span>
            </div>
            {[
              'Enter the USD amount you wish to deposit.',
              'Select your preferred cryptocurrency above.',
              'Copy the wallet address shown on the right.',
              'Send exactly the equivalent crypto amount to that address.',
              'Click "I Have Made Payment" and complete the submission form.',
              `Your balance updates after admin verification.`,
            ].map((step, i) => (
              <p key={i} className="text-xs text-muted-foreground leading-relaxed flex gap-2">
                <span className="shrink-0 w-4 h-4 rounded-full bg-white/8 text-white/50 text-[10px] font-bold flex items-center justify-center mt-px">{i + 1}</span>
                {step}
              </p>
            ))}
          </div>
        </motion.div>

        {/* Right — wallet + QR + CTA */}
        <motion.div key={method.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }} className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 space-y-5">
          {/* Selected coin header */}
          <div className="flex items-center gap-3 pb-4 border-b border-white/5">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: method.bgGlow }}>
              <method.icon className={`text-xl ${method.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{method.name}</p>
              <p className="text-xs text-muted-foreground">{method.network}</p>
            </div>
          </div>

          <QrCodeCard method={methodWithAddress} />

          {/* Wallet address */}
          <div className="bg-background/70 border border-white/8 rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-2 font-medium">{method.name} Deposit Address</p>
            <AnimatePresence mode="wait">
              <motion.p key={methodWithAddress.address || method.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }} className={`text-sm font-mono break-all leading-relaxed mb-3 select-all ${methodWithAddress.address ? 'text-white' : 'text-muted-foreground/50 italic'}`}>
                {methodWithAddress.address || 'Address not configured — contact support'}
              </motion.p>
            </AnimatePresence>
            <button onClick={handleCopy}
              className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                copied ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-accent hover:bg-white/10 hover:border-white/20'
              }`}>
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
            onClick={() => { if (canProceed) setStep('submit'); }}
            disabled={!canProceed}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_24px_rgba(21,101,232,0.3)] hover:shadow-[0_0_32px_rgba(21,101,232,0.45)]"
          >
            I Have Made Payment <ArrowRight size={17} />
          </button>

          {!canProceed && amount !== '' && amountNum < 100 && (
            <p className="text-xs text-red-400 text-center -mt-2">Minimum deposit is $100.00</p>
          )}
          {!amount && (
            <p className="text-xs text-muted-foreground text-center -mt-2">Enter an amount above to continue</p>
          )}
        </motion.div>
      </div>

      {/* Deposit history */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Deposit History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="p-4">ID</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Approved</th>
                <th className="p-4">Plan</th>
                <th className="p-4">Method</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingHistory ? (
                <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">Loading…</td></tr>
              ) : deposits.length === 0 ? (
                <tr><td colSpan={7} className="p-12 text-center text-muted-foreground">No deposits yet.</td></tr>
              ) : deposits.map((d) => (
                <tr key={d.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono text-xs text-white/60">DEP-{d.id}</td>
                  <td className="p-4 text-white font-semibold">${Number(d.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td className="p-4 text-accent font-semibold">
                    {d.approved_amount ? `$${Number(d.approved_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                  </td>
                  <td className="p-4 text-muted-foreground text-xs">{d.plan_name ?? '—'}</td>
                  <td className="p-4 text-muted-foreground text-xs">{d.payment_method}</td>
                  <td className="p-4 text-muted-foreground text-xs whitespace-nowrap">
                    {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="p-4"><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
