import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, Plus, Search, Download } from 'lucide-react';
import { transactionApi, type AppTransaction } from '@/lib/deposit-api';

function exportToCSV(rows: AppTransaction[]) {
  const headers = ['Transaction ID', 'Type', 'Amount', 'Description', 'Date', 'Status'];
  const lines = [
    headers.join(','),
    ...rows.map((tx) =>
      [
        `DEP-${tx.id}`,
        tx.type,
        `$${Number(tx.amount).toFixed(2)}`,
        `"${(tx.description ?? '').replace(/"/g, '""')}"`,
        `"${new Date(tx.created_at).toLocaleString()}"`,
        tx.status,
      ].join(','),
    ),
  ];
  const csv = lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'transactions.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export default function Transactions() {
  const [filter, setFilter]   = useState('All');
  const [search, setSearch]   = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]   = useState('');
  const [transactions, setTransactions] = useState<AppTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transactionApi
      .list()
      .then(setTransactions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = transactions.filter((t) => {
    if (filter !== 'All' && t.type !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!`dep-${t.id}`.includes(q) && !t.type.toLowerCase().includes(q)) return false;
    }
    if (dateFrom) {
      const txDate = new Date(t.created_at).toISOString().slice(0, 10);
      if (txDate < dateFrom) return false;
    }
    if (dateTo) {
      const txDate = new Date(t.created_at).toISOString().slice(0, 10);
      if (txDate > dateTo) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">Transaction History</h1>
          <p className="text-muted-foreground">Complete record of your deposits, withdrawals, and profits.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text" placeholder="Search ID or type..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <button
            onClick={() => exportToCSV(filtered)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      <div className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex bg-white/5 p-1 rounded-lg overflow-x-auto w-full md:w-auto">
            {['All', 'Deposit', 'Withdrawal', 'Profit'].map((tab) => (
              <button key={tab} onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                  filter === tab ? 'bg-primary/20 text-accent shadow-sm' : 'text-muted-foreground hover:text-white'
                }`}>
                {tab}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto">
            <span className="text-sm text-muted-foreground shrink-0">Date:</span>
            <div className="flex items-center gap-2 flex-wrap">
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1 min-w-0 bg-background border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-primary" />
              <span className="text-muted-foreground shrink-0">–</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="flex-1 min-w-0 bg-background border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-primary" />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Type</th>
                <th className="p-4">Description</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-12 text-center text-muted-foreground">Loading transactions…</td></tr>
              ) : filtered.map((tx, i) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 10) * 0.05, duration: 0.2 }}
                  key={tx.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4 text-sm font-mono text-white/80">DEP-{tx.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {tx.type === 'Deposit'    && <ArrowDownLeft size={16} className="text-emerald-400" />}
                      {tx.type === 'Withdrawal' && <ArrowUpRight size={16} className="text-destructive" />}
                      {tx.type === 'Profit'     && <Plus size={16} className="text-accent" />}
                      <span className="text-sm font-medium text-white">{tx.type}</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-muted-foreground max-w-[200px] truncate">{tx.description ?? '—'}</td>
                  <td className={`p-4 text-sm font-bold text-right ${tx.type === 'Withdrawal' ? 'text-white' : 'text-accent'}`}>
                    ${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      tx.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      tx.status === 'Pending'   ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              {search || filter !== 'All' ? 'No transactions match your criteria.' : 'No transactions yet.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
