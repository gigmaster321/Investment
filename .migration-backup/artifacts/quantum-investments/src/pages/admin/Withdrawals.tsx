import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownCircle, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type TabKey = 'Pending' | 'Approved' | 'Rejected';

const WITHDRAWALS: Record<TabKey, Array<{
  id: string; user: string; email: string; amount: string;
  method: string; wallet: string; requested: string; processed?: string;
}>> = {
  Pending: [
    { id: '#W-0381', user: 'James Thornton', email: 'j.thornton@email.com', amount: '$4,200', method: 'Bitcoin', wallet: '1A1zP1…xSLbg', requested: '1h ago' },
    { id: '#W-0380', user: 'Priya Sharma', email: 'p.sharma@email.com', amount: '$12,800', method: 'Bank Transfer', wallet: 'IBAN: DE89…3000', requested: '3h ago' },
    { id: '#W-0379', user: 'Elena Volkov', email: 'e.volkov@email.com', amount: '$950', method: 'USDT', wallet: 'TRX7k2…9mNp', requested: '6h ago' },
    { id: '#W-0378', user: 'David Osei', email: 'd.osei@email.com', amount: '$2,100', method: 'Bitcoin', wallet: '3FZbgi…YGo4', requested: '8h ago' },
  ],
  Approved: [
    { id: '#W-0377', user: 'Lin Wei', email: 'l.wei@email.com', amount: '$8,500', method: 'Bank Transfer', wallet: 'IBAN: GB29…6473', requested: '1d ago', processed: '20h ago' },
    { id: '#W-0376', user: 'Carlos Rivera', email: 'c.rivera@email.com', amount: '$1,800', method: 'USDT', wallet: 'TXqR5…2jPn', requested: '2d ago', processed: '1d ago' },
    { id: '#W-0375', user: 'Sofia Becker', email: 's.becker@email.com', amount: '$3,400', method: 'Bitcoin', wallet: 'bc1q9…r5k2', requested: '3d ago', processed: '2d ago' },
  ],
  Rejected: [
    { id: '#W-0374', user: 'Amir Hassan', email: 'a.hassan@email.com', amount: '$6,000', method: 'Bitcoin', wallet: 'Unknown', requested: '4d ago', processed: '3d ago' },
    { id: '#W-0373', user: 'Unknown User', email: 'test@test.com', amount: '$15,000', method: 'Bank Transfer', wallet: 'Unverified', requested: '5d ago', processed: '4d ago' },
  ],
};

const TAB_META = {
  Pending:  { icon: Clock,         color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  Approved: { icon: CheckCircle,   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  Rejected: { icon: XCircle,       color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/20'    },
};

export default function AdminWithdrawals() {
  const [activeTab, setActiveTab] = useState<TabKey>('Pending');
  const [search, setSearch] = useState('');

  const rows = WITHDRAWALS[activeTab].filter(
    (w) =>
      w.user.toLowerCase().includes(search.toLowerCase()) ||
      w.id.toLowerCase().includes(search.toLowerCase()) ||
      w.method.toLowerCase().includes(search.toLowerCase()),
  );

  const meta = TAB_META[activeTab];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Withdrawals</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Review and manage all withdrawal requests.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(Object.keys(WITHDRAWALS) as TabKey[]).map((tab) => {
          const m = TAB_META[tab];
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 ${
                activeTab === tab
                  ? `${m.bg} ${m.border} shadow-[0_0_20px_rgba(30,167,255,0.08)]`
                  : 'bg-card/40 border-white/5 hover:bg-card/60'
              }`}
            >
              <div className={`p-2.5 rounded-lg ${m.bg} border ${m.border}`}>
                <m.icon size={18} className={m.color} />
              </div>
              <div>
                <p className="text-white font-bold text-xl">{WITHDRAWALS[tab].length}</p>
                <p className="text-muted-foreground text-xs">{tab} Requests</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-card/40 border border-white/5 rounded-xl overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-6 py-4 border-b border-white/5">
          <div className={`flex items-center gap-2 text-xs font-semibold ${meta.color}`}>
            <meta.icon size={14} />
            {activeTab} Withdrawals
          </div>
          <div className="relative sm:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-8 w-56 bg-muted/40 border-white/10 text-white placeholder:text-white/25 text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-white/5">
                {['ID', 'User', 'Amount', 'Method', 'Wallet', 'Requested', activeTab !== 'Pending' ? 'Processed' : '', activeTab === 'Pending' ? 'Actions' : ''].filter(Boolean).map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr key={w.id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                  <td className="px-5 py-3.5 text-muted-foreground text-[10px] font-mono">{w.id}</td>
                  <td className="px-5 py-3.5">
                    <p className="text-white text-xs font-medium">{w.user}</p>
                    <p className="text-muted-foreground text-[10px]">{w.email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-white text-xs font-bold">{w.amount}</td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">{w.method}</td>
                  <td className="px-5 py-3.5 text-muted-foreground text-[10px] font-mono">{w.wallet}</td>
                  <td className="px-5 py-3.5 text-muted-foreground text-xs">{w.requested}</td>
                  {activeTab !== 'Pending' && (
                    <td className="px-5 py-3.5 text-muted-foreground text-xs">{w.processed}</td>
                  )}
                  {activeTab === 'Pending' && (
                    <td className="px-5 py-3.5">
                      <div className="flex gap-1.5">
                        <button className="text-[10px] font-semibold text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/20 rounded-md px-2.5 py-1 transition-colors">
                          Approve
                        </button>
                        <button className="text-[10px] font-semibold text-red-400 hover:bg-red-500/15 border border-red-500/20 rounded-md px-2.5 py-1 transition-colors">
                          Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground text-sm">
                    No {activeTab.toLowerCase()} withdrawal requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
