import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, Plus, Search, Download } from 'lucide-react';

type Transaction = {
  id: string;
  type: string;
  amount: string;
  date: string;
  status: string;
};

// No real transactions API yet — will be populated from backend in a future release.
const allTransactions: Transaction[] = [];

function exportToCSV(rows: Transaction[]) {
  const headers = ['Transaction ID', 'Type', 'Amount', 'Date', 'Status'];
  const lines = [
    headers.join(','),
    ...rows.map(tx =>
      [tx.id, tx.type, tx.amount, `"${tx.date}"`, tx.status].join(',')
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
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = allTransactions.filter(t => {
    if (filter !== 'All' && t.type !== filter) return false;
    if (search && !t.id.toLowerCase().includes(search.toLowerCase()) && !t.type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Transaction History</h1>
          <p className="text-muted-foreground">Complete record of your deposits, withdrawals, and profits.</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search ID or type..."
              value={search}
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
            {['All', 'Deposit', 'Withdrawal', 'Profit'].map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${
                  filter === tab ? 'bg-primary/20 text-accent shadow-sm' : 'text-muted-foreground hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-sm text-muted-foreground">Date:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="bg-background border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-primary"
            />
            <span className="text-muted-foreground">–</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="bg-background border border-white/10 rounded-lg py-1.5 px-3 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Type</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx, i) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (i % 10) * 0.05, duration: 0.2 }}
                  key={tx.id}
                  className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                >
                  <td className="p-4 text-sm font-mono text-white/80">{tx.id}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {tx.type === 'Deposit' && <ArrowDownLeft size={16} className="text-emerald-400" />}
                      {tx.type === 'Withdrawal' && <ArrowUpRight size={16} className="text-destructive" />}
                      {tx.type === 'Profit' && <Plus size={16} className="text-accent" />}
                      <span className="text-sm font-medium text-white">{tx.type}</span>
                    </div>
                  </td>
                  <td className={`p-4 text-sm font-bold text-right ${tx.type === 'Withdrawal' ? 'text-white' : 'text-accent'}`}>
                    {tx.amount}
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{tx.date}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      tx.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      tx.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      tx.status === 'Processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              {search || filter !== 'All'
                ? 'No transactions found matching your criteria.'
                : 'No transactions yet.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
