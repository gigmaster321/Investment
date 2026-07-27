import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ArrowDownLeft, ArrowUpRight, TrendingUp, ShieldAlert, CheckCircle2, Loader2 } from 'lucide-react';

type NotificationType = 'Investment' | 'Deposit' | 'Withdrawal' | 'System';

interface AppNotification {
  id: number;
  type: NotificationType;
  title: string;
  description: string;
  read: boolean;
  created_at: string;
}

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api';

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Yesterday, ${timeStr}`;

  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (diffDays < 365) return `${monthDay}, ${timeStr}`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Notifications() {
  const [filter, setFilter] = useState('All');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setError(false);
      const res = await fetch(`${API_BASE}/notifications`, { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AppNotification[] = await res.json();
      setNotifications(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filtered = notifications.filter(n => filter === 'All' || n.type === filter);

  const markAllRead = async () => {
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    try {
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'PATCH',
        credentials: 'include',
      });
    } catch {
      // Non-critical — visual state already updated
    }
  };

  const markRead = async (id: number) => {
    if (notifications.find(n => n.id === id)?.read) return;
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include',
      });
    } catch {
      // Non-critical
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'Deposit':    return <ArrowDownLeft className="text-emerald-400" size={20} />;
      case 'Withdrawal': return <ArrowUpRight className="text-destructive" size={20} />;
      case 'Investment': return <TrendingUp className="text-accent" size={20} />;
      case 'System':     return <ShieldAlert className="text-yellow-400" size={20} />;
    }
  };

  const getBorderColor = (type: NotificationType) => {
    switch (type) {
      case 'Deposit':    return 'border-l-emerald-500';
      case 'Withdrawal': return 'border-l-destructive';
      case 'Investment': return 'border-l-primary';
      case 'System':     return 'border-l-yellow-500';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on your account activity.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 border border-white/10 text-white rounded-lg hover:bg-white/5 transition-colors text-sm font-medium"
          >
            <CheckCircle2 size={16} /> Mark All as Read
          </button>
        )}
      </header>

      <div className="flex bg-white/5 p-1 rounded-lg w-fit overflow-x-auto">
        {['All', 'Investment', 'Deposit', 'Withdrawal', 'System'].map(tab => (
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

      <div className="space-y-4">
        {loading && (
          <div className="py-20 flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 size={36} className="animate-spin opacity-40" />
            <p className="text-sm">Loading notifications…</p>
          </div>
        )}

        {!loading && error && (
          <div className="py-20 text-center text-muted-foreground">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <p className="mb-3">Could not load notifications.</p>
            <button
              onClick={fetchNotifications}
              className="text-sm text-accent hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <AnimatePresence>
            {filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center text-muted-foreground"
              >
                <Bell size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-base font-medium text-white/60 mb-1">No notifications yet.</p>
                <p className="text-sm">
                  {filter === 'All'
                    ? 'Activity such as deposits, withdrawals, and profit credits will appear here.'
                    : `No ${filter.toLowerCase()} notifications yet.`}
                </p>
              </motion.div>
            ) : (
              filtered.map((n, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04, duration: 0.2 }}
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex items-start gap-4 p-5 rounded-xl border border-white/5 cursor-pointer transition-colors border-l-4 ${getBorderColor(n.type)} ${
                    n.read ? 'bg-card/40 backdrop-blur-md' : 'bg-primary/5 hover:bg-primary/10'
                  }`}
                >
                  <div className="mt-1 bg-white/5 p-2 rounded-full shrink-0">
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1 gap-4">
                      <h3 className={`font-semibold ${n.read ? 'text-white/80' : 'text-white'}`}>{n.title}</h3>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">{formatTime(n.created_at)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.description}</p>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 shadow-[0_0_10px_rgba(30,167,255,0.5)]" />
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
