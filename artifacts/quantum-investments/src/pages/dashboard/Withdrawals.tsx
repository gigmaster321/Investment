import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight, ShieldAlert } from 'lucide-react';

export default function Withdrawals() {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('btc');
  const [submitted, setSubmitted] = useState(false);

  const availableBalance = 28430.50; // Total Profit

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-20 h-full">
        <div className="w-16 h-16 bg-primary/20 text-accent rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(30,167,255,0.2)]">
          <Wallet size={32} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Withdrawal Processing</h2>
        <p className="text-muted-foreground text-center max-w-md">Your request to withdraw ${amount} has been received. Funds are typically transferred within 2-4 hours.</p>
        <button onClick={() => { setSubmitted(false); setAmount(''); setAddress(''); }} className="mt-8 text-primary hover:text-accent font-medium transition-colors">Back to Withdrawals</button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Withdraw Funds</h1>
        <p className="text-muted-foreground">Transfer profits to your external wallet securely.</p>
      </header>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden">
        
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between mb-8">
          <div>
            <p className="text-sm text-accent font-medium mb-1">Available for Withdrawal</p>
            <p className="text-2xl font-bold text-white">${availableBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          </div>
          <Wallet className="text-accent opacity-50" size={32} />
        </div>

        <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Withdrawal Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
              <input 
                type="number" 
                required
                max={availableBalance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-16 text-white placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
              <button 
                type="button" 
                onClick={() => setAmount(availableBalance.toString())}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-accent hover:text-primary transition-colors"
              >
                MAX
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Network</label>
            <select 
              value={network}
              onChange={(e) => setNetwork(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
            >
              <option value="btc">Bitcoin (BTC)</option>
              <option value="eth">Ethereum (ERC20)</option>
              <option value="usdt">USDT (TRC20)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">Destination Address</label>
            <input 
              type="text" 
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={`Enter your ${network.toUpperCase()} address`}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono text-sm"
            />
          </div>

          <div className="flex items-start gap-3 bg-white/[0.02] p-4 rounded-lg border border-white/5">
            <ShieldAlert className="text-yellow-500 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Please double-check your destination address. Withdrawals sent to the wrong network or address cannot be recovered. Processing takes up to 4 hours.
            </p>
          </div>

          <button 
            type="submit"
            disabled={!amount || !address || Number(amount) <= 0 || Number(amount) > availableBalance}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(21,101,232,0.3)] mt-4"
          >
            Submit Withdrawal <ArrowRight size={18} />
          </button>
        </form>
      </motion.div>
    </div>
  );
}