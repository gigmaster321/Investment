import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ArrowRight, CreditCard } from 'lucide-react';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiTether } from 'react-icons/si';

const METHODS = [
  { id: 'btc', name: 'Bitcoin', icon: FaBitcoin, color: 'text-[#F7931A]', network: 'BTC Network', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
  { id: 'eth', name: 'Ethereum', icon: FaEthereum, color: 'text-[#627EEA]', network: 'ERC20', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' },
  { id: 'usdt', name: 'USDT (Tether)', icon: SiTether, color: 'text-[#26A17B]', network: 'TRC20', address: 'TXLAQ63Xg1NwaZ5q5K7qTz5GZ7X7m7X' },
  { id: 'bank', name: 'Bank Transfer', icon: CreditCard, color: 'text-white', network: 'Wire/ACH', address: 'Contact support for routing instructions.' },
];

export default function Deposits() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(METHODS[0]);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(method.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 h-full">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <Check size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Deposit Request Initiated</h2>
        <p className="text-muted-foreground text-center max-w-md">Your deposit of ${amount} via {method.name} is pending verification. Please ensure you have transferred the exact amount to the provided address.</p>
        <button onClick={() => { setSubmitted(false); setAmount(''); }} className="mt-8 text-primary hover:text-accent font-medium transition-colors">Make another deposit</button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Deposit Funds</h1>
        <p className="text-muted-foreground">Add capital to your Quantum Investments account.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10,000"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Minimum deposit: $500.00</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-3">Select Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {METHODS.map((m) => {
                const isSelected = method.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMethod(m)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
                      isSelected 
                        ? 'bg-primary/10 border-primary shadow-[0_0_15px_rgba(30,167,255,0.15)] scale-[1.02]' 
                        : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <m.icon className={`text-2xl ${m.color}`} />
                    <span className="text-sm font-medium text-white">{m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card/40 backdrop-blur-md border border-white/5 rounded-xl p-6 h-fit">
          <h3 className="text-lg font-semibold text-white mb-4">Transfer Instructions</h3>
          
          <div className="space-y-4">
            <div className="bg-white/5 p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Network</p>
                <p className="text-sm font-semibold text-white">{method.network}</p>
              </div>
              <method.icon className={`text-3xl ${method.color} opacity-50`} />
            </div>

            <div className="bg-background/80 p-4 rounded-lg border border-white/5">
              <p className="text-xs text-muted-foreground mb-2">Deposit Address</p>
              <p className="text-sm font-mono text-white break-all mb-3">{method.address}</p>
              {method.id !== 'bank' && (
                <button onClick={handleCopy} className="flex items-center gap-2 text-xs font-medium text-accent hover:text-primary transition-colors">
                  {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied to clipboard' : 'Copy Address'}
                </button>
              )}
            </div>

            <div className="pt-4 border-t border-white/5 space-y-3">
              <p className="text-xs text-muted-foreground">1. Send exactly the amount you wish to deposit to the address above.</p>
              <p className="text-xs text-muted-foreground">2. Click "Confirm Transfer" once you have sent the funds.</p>
              <p className="text-xs text-muted-foreground">3. Your balance will update automatically after network confirmations.</p>
            </div>

            <button 
              onClick={() => {
                if (amount && Number(amount) >= 500) setSubmitted(true);
              }}
              disabled={!amount || Number(amount) < 500}
              className="w-full mt-4 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(21,101,232,0.3)]"
            >
              Confirm Transfer <ArrowRight size={18} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}