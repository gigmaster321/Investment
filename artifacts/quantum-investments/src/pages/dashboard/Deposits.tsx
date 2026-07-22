import { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, ArrowRight, CreditCard, ArrowDownToLine, Clock, FileText } from 'lucide-react';
import { FaBitcoin, FaEthereum } from 'react-icons/fa';
import { SiTether } from 'react-icons/si';
import { StatCard } from '@/components/dashboard/StatCard';

const METHODS = [
  { id: 'btc', name: 'Bitcoin', icon: FaBitcoin, color: 'text-[#F7931A]', network: 'BTC Network', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
  { id: 'eth', name: 'Ethereum', icon: FaEthereum, color: 'text-[#627EEA]', network: 'ERC20', address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F' },
  { id: 'usdt', name: 'USDT (Tether)', icon: SiTether, color: 'text-[#26A17B]', network: 'TRC20', address: 'TXLAQ63Xg1NwaZ5q5K7qTz5GZ7X7m7X' },
  { id: 'bank', name: 'Bank Transfer', icon: CreditCard, color: 'text-white', network: 'Wire/ACH', address: 'Contact support for routing instructions.' },
];

const mockHistory = [
  { id: 'DEP-8492', amount: '$25,000.00', method: 'Bitcoin', date: 'Oct 24, 2023, 14:20 PM', status: 'Completed' },
  { id: 'DEP-8491', amount: '$10,000.00', method: 'Ethereum', date: 'Oct 20, 2023, 16:00 PM', status: 'Completed' },
  { id: 'DEP-8490', amount: '$50,000.00', method: 'Bank Transfer', date: 'Sep 15, 2023, 11:00 AM', status: 'Completed' },
  { id: 'DEP-8489', amount: '$10,000.00', method: 'USDT (Tether)', date: 'Sep 05, 2023, 10:20 AM', status: 'Completed' },
  { id: 'DEP-8488', amount: '$5,000.00', method: 'Bitcoin', date: 'Aug 12, 2023, 09:15 AM', status: 'Completed' },
  { id: 'DEP-8487', amount: '$15,000.00', method: 'Ethereum', date: 'Jul 28, 2023, 13:40 PM', status: 'Completed' },
  { id: 'DEP-8486', amount: '$2,500.00', method: 'Bitcoin', date: 'Jul 10, 2023, 08:30 AM', status: 'Completed' },
  { id: 'DEP-8485', amount: '$1,000.00', method: 'USDT (Tether)', date: 'Jun 22, 2023, 17:50 PM', status: 'Completed' },
  { id: 'DEP-8484', amount: '$4,000.00', method: 'Bank Transfer', date: 'May 18, 2023, 14:10 PM', status: 'Completed' },
  { id: 'DEP-8483', amount: '$2,500.00', method: 'Bitcoin', date: 'Apr 05, 2023, 11:25 AM', status: 'Completed' },
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
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Deposits</h1>
        <p className="text-muted-foreground">Add capital to your Quantum Investments account.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard delay={0} title="Total Deposited" value="$125,000.00" icon={ArrowDownToLine} />
        <StatCard delay={0.1} title="Last Deposit" value="$25,000.00" icon={FileText} />
        <StatCard delay={0.2} title="Pending Deposits" value="$0.00" icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
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

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card/40 backdrop-blur-md border border-white/5 rounded-xl p-6 h-fit">
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden mt-8">
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
              {mockHistory.map((row, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 + 0.5 }}
                  key={row.id} 
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                >
                  <td className="p-4 font-mono text-white/80">{row.id}</td>
                  <td className="p-4 font-bold text-white">{row.amount}</td>
                  <td className="p-4 text-white">{row.method}</td>
                  <td className="p-4 text-muted-foreground">{row.date}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      row.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      row.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                      'bg-blue-500/10 text-blue-400 border-blue-500/20'
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