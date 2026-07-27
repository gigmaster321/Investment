import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, Save, X, Copy, Check, Wallet, RefreshCw } from 'lucide-react';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiTether } from 'react-icons/si';
import { toast } from '@/hooks/use-toast';
import { adminWalletApi, type WalletRecord } from '@/lib/wallet-api';

// ─── Static UI config keyed by coin_id ────────────────────────────────────────

const COIN_UI: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  label: string;
}> = {
  btc:        { icon: FaBitcoin,  color: 'text-[#F7931A]', bgColor: 'bg-[#F7931A]/10 border-[#F7931A]/20', label: 'Bitcoin' },
  eth:        { icon: FaEthereum, color: 'text-[#627EEA]', bgColor: 'bg-[#627EEA]/10 border-[#627EEA]/20', label: 'Ethereum' },
  usdt_trc20: { icon: SiTether,   color: 'text-[#26A17B]', bgColor: 'bg-[#26A17B]/10 border-[#26A17B]/20', label: 'USDT TRC20' },
  usdt_erc20: { icon: SiTether,   color: 'text-[#26A17B]', bgColor: 'bg-[#26A17B]/10 border-[#26A17B]/20', label: 'USDT ERC20' },
};

function coinUi(coinId: string) {
  return COIN_UI[coinId] ?? { icon: Wallet, color: 'text-accent', bgColor: 'bg-accent/10 border-accent/20', label: coinId };
}

// ─── Edit modal ───────────────────────────────────────────────────────────────

function EditModal({
  wallet,
  onClose,
  onSave,
}: {
  wallet: WalletRecord;
  onClose: () => void;
  onSave: (id: number, address: string, isActive: boolean) => Promise<void>;
}) {
  const [address, setAddress] = useState(wallet.address);
  const [isActive, setIsActive] = useState(wallet.is_active);
  const [saving, setSaving] = useState(false);
  const ui = coinUi(wallet.coin_id);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(wallet.id, address.trim(), isActive);
      onClose();
    } catch {
      // error already toasted by caller
    } finally {
      setSaving(false);
    }
  }

  const fieldCls = 'w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-3.5 text-white text-xs placeholder:text-white/20 font-mono focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all';
  const labelCls = 'block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-1.5';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(5,12,28,0.88)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0 }}
          className="relative bg-[hsl(221,70%,10%)] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg border ${ui.bgColor}`}>
                <ui.icon className={`text-base ${ui.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Edit {wallet.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{wallet.network} deposit address</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
              <X size={16} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={submit}>
            <div className="p-5 space-y-4">
              <div>
                <label className={labelCls}>Wallet Address</label>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={`${fieldCls} resize-none leading-relaxed`}
                  placeholder={`Enter ${wallet.name} deposit address`}
                />
                <p className="text-[10px] text-muted-foreground/50 mt-1.5">
                  Users will send funds to this address. Triple-check before saving.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-white">Show to users</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Disable to hide this coin from the deposit page</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive((v) => !v)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${isActive ? 'bg-accent' : 'bg-white/15'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-white/5 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white text-xs font-semibold py-2.5 rounded-xl transition-all"
              >
                <Save size={13} />
                {saving ? 'Saving…' : 'Save Wallet'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 text-xs font-semibold text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Wallet row ───────────────────────────────────────────────────────────────

function WalletRow({
  wallet,
  onEdit,
}: {
  wallet: WalletRecord;
  onEdit: (w: WalletRecord) => void;
}) {
  const ui = coinUi(wallet.coin_id);
  const [copied, setCopied] = useState(false);

  function copyAddress() {
    if (!wallet.address) return;
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Address copied.' });
  }

  return (
    <tr className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors">
      {/* Coin */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg border ${ui.bgColor}`}>
            <ui.icon className={`text-sm ${ui.color}`} />
          </div>
          <div>
            <p className="text-white text-xs font-semibold">{wallet.name}</p>
            <p className="text-[10px] text-muted-foreground">{wallet.network}</p>
          </div>
        </div>
      </td>

      {/* Address */}
      <td className="px-4 py-3.5 max-w-xs">
        {wallet.address ? (
          <p className="text-xs font-mono text-muted-foreground truncate">{wallet.address}</p>
        ) : (
          <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
            Not set
          </span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3.5">
        <span className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
          wallet.is_active
            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            : 'text-muted-foreground bg-white/5 border-white/10'
        }`}>
          {wallet.is_active ? 'Active' : 'Hidden'}
        </span>
      </td>

      {/* Last updated */}
      <td className="px-4 py-3.5 text-[10px] text-muted-foreground whitespace-nowrap">
        {new Date(wallet.updated_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <button
            onClick={copyAddress}
            disabled={!wallet.address}
            title="Copy address"
            className="p-1.5 rounded-md text-muted-foreground hover:text-white hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          </button>
          <button
            onClick={() => onEdit(wallet)}
            title="Edit wallet"
            className="p-1.5 rounded-md text-accent hover:bg-accent/10 border border-accent/20 transition-colors"
          >
            <Edit3 size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminWallets() {
  const [wallets, setWallets] = useState<WalletRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<WalletRecord | null>(null);

  const loadWallets = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await adminWalletApi.list();
      setWallets(rows);
    } catch {
      toast({ title: 'Failed to load wallets', description: 'Please refresh and try again.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadWallets(); }, [loadWallets]);

  async function handleSave(id: number, address: string, isActive: boolean) {
    try {
      const updated = await adminWalletApi.update(id, { address, is_active: isActive });
      setWallets((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
      toast({ title: '✅ Wallet Updated', description: `${updated.name} address saved successfully.` });
    } catch (cause) {
      toast({ title: 'Failed to update wallet', description: cause instanceof Error ? cause.message : 'Please try again.' });
      throw cause;
    }
  }

  const activeCount = wallets.filter((w) => w.is_active).length;
  const setCount = wallets.filter((w) => w.address.trim() !== '').length;

  return (
    <>
      {editing && (
        <EditModal
          wallet={editing}
          onClose={() => setEditing(null)}
          onSave={handleSave}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-white">Deposit Wallets</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Manage the crypto wallet addresses shown to users on the deposit page.
            </p>
          </div>
          <button
            onClick={() => void loadWallets()}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-4 py-2.5 transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { label: 'Total Wallets', value: String(wallets.length) },
            { label: 'Active (shown to users)', value: String(activeCount) },
            { label: 'Addresses Set', value: `${setCount} / ${wallets.length}` },
          ].map((s) => (
            <div key={s.label} className="bg-card/40 border border-white/5 rounded-xl p-4">
              <p className="text-white font-bold text-lg leading-tight">{s.value}</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Warning if any addresses are unset */}
        {!loading && setCount < wallets.length && (
          <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl p-4">
            <Wallet size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-300/90 leading-relaxed">
              <strong className="text-amber-300">{wallets.length - setCount} wallet{wallets.length - setCount !== 1 ? 's' : ''} {wallets.length - setCount === 1 ? 'has' : 'have'} no address set.</strong>{' '}
              Users will see an empty address for those coins. Click <strong>Edit</strong> to set the address.
            </p>
          </div>
        )}

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/40 border border-white/5 rounded-xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div>
              <h2 className="text-sm font-semibold text-white">All Deposit Wallets</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {activeCount} active · {wallets.length - activeCount} hidden
              </p>
            </div>
            {loading && <span className="text-[10px] text-muted-foreground">Loading…</span>}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {['Coin / Network', 'Wallet Address', 'Status', 'Last Updated', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-4 py-3 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-sm text-muted-foreground">
                      Loading wallets…
                    </td>
                  </tr>
                ) : wallets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-14 text-center text-sm text-muted-foreground">
                      No wallets found.
                    </td>
                  </tr>
                ) : (
                  wallets.map((w) => (
                    <WalletRow key={w.id} wallet={w} onEdit={setEditing} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Instructions */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-2">
          <p className="text-xs font-semibold text-white">How wallet addresses work</p>
          <ul className="space-y-1.5">
            {[
              'Click Edit on any wallet to update its deposit address.',
              'Changes take effect immediately — the next user to open the Deposit page will see the new address.',
              'Disable a wallet to hide it from the deposit page without deleting it.',
              'All 4 wallets (BTC, ETH, USDT TRC20, USDT ERC20) are required for full deposit coverage.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="shrink-0 w-1 h-1 rounded-full bg-accent/50 mt-1.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
