import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Filter, Eye, UserCheck, UserX, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';

const ALL_USERS = [
  { id: '#U-4821', name: 'James Thornton', email: 'j.thornton@email.com', plan: 'Gold', balance: '$14,200', joined: 'Jul 22, 2026', status: 'Active', country: 'USA' },
  { id: '#U-4820', name: 'Priya Sharma', email: 'p.sharma@email.com', plan: 'Platinum', balance: '$52,800', joined: 'Jul 22, 2026', status: 'Active', country: 'India' },
  { id: '#U-4819', name: 'Carlos Rivera', email: 'c.rivera@email.com', plan: 'Silver', balance: '$3,950', joined: 'Jul 21, 2026', status: 'Pending', country: 'Mexico' },
  { id: '#U-4818', name: 'Sofia Becker', email: 's.becker@email.com', plan: 'Starter', balance: '$1,100', joined: 'Jul 21, 2026', status: 'Active', country: 'Germany' },
  { id: '#U-4817', name: 'Amir Hassan', email: 'a.hassan@email.com', plan: 'Gold', balance: '$0', joined: 'Jul 20, 2026', status: 'Suspended', country: 'UAE' },
  { id: '#U-4816', name: 'Elena Volkov', email: 'e.volkov@email.com', plan: 'Platinum', balance: '$89,300', joined: 'Jul 19, 2026', status: 'Active', country: 'Russia' },
  { id: '#U-4815', name: 'David Osei', email: 'd.osei@email.com', plan: 'Silver', balance: '$7,600', joined: 'Jul 18, 2026', status: 'Active', country: 'Ghana' },
  { id: '#U-4814', name: 'Lin Wei', email: 'l.wei@email.com', plan: 'Gold', balance: '$23,400', joined: 'Jul 17, 2026', status: 'Active', country: 'China' },
];

const STATUS_STYLES: Record<string, string> = {
  Active: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Pending: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  Suspended: 'text-red-400 bg-red-500/10 border-red-500/20',
};

const PLAN_STYLES: Record<string, string> = {
  Starter: 'text-slate-300 bg-slate-500/10 border-slate-500/20',
  Silver: 'text-slate-300 bg-slate-400/10 border-slate-400/20',
  Gold: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
  Platinum: 'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',
};

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filtered = ALL_USERS.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || u.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Browse, search, and manage all registered users.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Users', value: '4,821', icon: Users },
          { label: 'Active', value: '3,892', icon: UserCheck },
          { label: 'Pending', value: '619', icon: MoreHorizontal },
          { label: 'Suspended', value: '310', icon: UserX },
        ].map((s) => (
          <div key={s.label} className="bg-card/40 border border-white/5 rounded-xl p-4 flex items-center gap-3">
            <div className="bg-primary/15 p-2 rounded-lg">
              <s.icon size={16} className="text-accent" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">{s.value}</p>
              <p className="text-muted-foreground text-[11px]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card/40 border border-white/5 rounded-xl overflow-hidden"
      >
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 px-6 py-4 border-b border-white/5">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              placeholder="Search by name, email or ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-9 bg-muted/40 border-white/10 text-white placeholder:text-white/25 text-sm"
            />
          </div>
          <div className="flex items-center gap-1 bg-muted/40 border border-white/10 rounded-lg p-1">
            <Filter size={13} className="text-muted-foreground ml-2 mr-1" />
            {['All', 'Active', 'Pending', 'Suspended'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                  filter === f ? 'bg-primary/30 text-accent' : 'text-muted-foreground hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-white/5">
                {['User', 'Plan', 'Balance', 'Country', 'Joined', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-6 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-white/3 hover:bg-white/3 transition-colors">
                  <td className="px-6 py-3.5">
                    <p className="text-white text-xs font-semibold">{u.name}</p>
                    <p className="text-muted-foreground text-[10px]">{u.email}</p>
                    <p className="text-muted-foreground/50 text-[10px]">{u.id}</p>
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PLAN_STYLES[u.plan]}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-white text-xs font-semibold">{u.balance}</td>
                  <td className="px-6 py-3.5 text-muted-foreground text-xs">{u.country}</td>
                  <td className="px-6 py-3.5 text-muted-foreground text-xs">{u.joined}</td>
                  <td className="px-6 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLES[u.status]}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <button className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground hover:text-white border border-white/10 hover:border-white/25 rounded-md px-2.5 py-1.5 transition-colors">
                      <Eye size={11} />
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground text-sm">
                    No users match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination stub */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/5">
          <p className="text-[11px] text-muted-foreground">
            Showing {filtered.length} of {ALL_USERS.length} users
          </p>
          <div className="flex gap-1">
            {[1, 2, 3, '…', 18].map((p, i) => (
              <button
                key={i}
                className={`text-xs w-7 h-7 rounded-md border transition-colors ${
                  p === 1 ? 'bg-primary/30 text-accent border-primary/30' : 'border-white/10 text-muted-foreground hover:text-white hover:border-white/25'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
