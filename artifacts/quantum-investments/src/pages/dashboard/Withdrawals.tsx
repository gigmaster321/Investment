import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowRight, ShieldAlert, ArrowUpFromLine, Clock, FileText } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';

const mockHistory = [
  { id: 'WDL-7201', amount: '$5,000.00', wallet: 'bc1q...x0wlh', network: 'BTC', date: 'Oct 24, 2023, 11:30 AM', status: 'Completed' },
  { id: 'WDL-7200', amount: '$2,000.00', wallet: '0x71...8976F', network: 'ETH', date: 'Oct 21, 2023, 10:15 AM', status: 'Completed' },
  { id: 'WDL-7199', amount: '$5,000.00', wallet: 'TXLA...7m7X', network: 'USDT', date: 'Sep 10, 2023, 13:45 PM', status: 'Processing' },
  { id: 'WDL-7198', amount: '$1,500.00', wallet: 'bc1q...v2pq8', network: 'BTC', date: 'Aug 14, 2023, 16:20 PM', status: 'Completed' },
  { id: 'WDL-7197', amount: '$2,500.00', wallet: '0x88...1A49B', network: 'ETH', date: 'Jul 05, 2023, 09:10 AM', status: 'Completed' },
  { id: 'WDL-7196', amount: '$1,000.00', wallet: 'TYH8...4G9L', network: 'USDT', date: 'Jun 12, 2023, 14:30 PM', status: 'Completed' },
  { id: 'WDL-7195', amount: '$500.00', wallet: 'bc1q...a9x2m', network: 'BTC', date: 'May 20, 2023, 11:45 AM', status: 'Completed' },
  { id: 'WDL-7194', amount: '$8,000.00', wallet: '0x12...9C33D', network: 'ETH', date: 'Apr 18, 2023, 10:05 AM', status: 'Rejected' },
  { id: 'WDL-7193', amount: '$3,000.00', wallet: 'TKJ1...8Y4M', network: 'USDT', date: 'Mar 10, 2023, 15:50 PM', status: 'Completed' },
  { id: 'WDL-7192', amount: '$1,200.00', wallet: 'bc1q...o5r4t', network: 'BTC', date: 'Feb 22, 2023, 08:15 AM', status: 'Completed' },
];

export default function Withdrawals() {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('btc');
  const [submitted, setSubmitted] = useState(false);
  const [filter, setFilter] = useState('All');

  const availableBalance = 28430.50; // Total Profit

  const filtered = mockHistory.filter(t => filter === 'All' || t.status === filter);

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
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Withdrawals</h1>
        <p className="text-muted-foreground">Transfer profits to your external wallet securely.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard delay={0} title="Total Withdrawn" value="$12,000.00" icon={ArrowUpFromLine} />
        <StatCard delay={0.1} title="Last Withdrawal" value="$5,000.00" icon={FileText} />
        <StatCard delay={0.2} title="Pending" value="$0.00" icon={Clock} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden max-w-2xl mx-auto">
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

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden mt-8">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">Withdrawal History</h2>
          <div className="flex bg-white/5 p-1 rounded-lg">
            {['All', 'Pending', 'Processing', 'Completed', 'Rejected'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  filter === tab ? 'bg-primary/20 text-accent shadow-sm' : 'text-muted-foreground hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="p-4">TXN ID</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Wallet</th>
                <th className="p-4">Network</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 + 0.4 }}
                  key={row.id} 
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                >
                  <td className="p-4 font-mono text-white/80">{row.id}</td>
                  <td className="p-4 font-bold text-white">{row.amount}</td>
                  <td className="p-4 text-muted-foreground font-mono">{row.wallet}</td>
                  <td className="p-4 text-white">{row.network}</td>
                  <td className="p-4 text-muted-foreground">{row.date}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      row.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                      row.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                      row.status === 'Processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              No withdrawals found matching your criteria.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}