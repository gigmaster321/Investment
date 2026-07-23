import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ArrowDownLeft, ArrowUpRight, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';

type NotificationType = 'Investment' | 'Deposit' | 'Withdrawal' | 'System';

interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const initialNotifications: AppNotification[] = [
  { id: '1', type: 'Investment', title: 'Profit Credited', description: '+$1,250.00 profit credited to your account from Gold Plan.', time: 'Today, 09:41 AM', read: false },
  { id: '2', type: 'Deposit', title: 'Deposit Confirmed', description: '$25,000.00 deposit confirmed via Bitcoin network.', time: 'Yesterday, 14:20 PM', read: false },
  { id: '3', type: 'Withdrawal', title: 'Withdrawal Processed', description: '$5,000.00 withdrawal sent to your BTC wallet.', time: 'Oct 24, 11:30 AM', read: false },
  { id: '4', type: 'System', title: 'New Plan Available', description: 'Platinum Elite plan now available for investments $100,000+.', time: 'Oct 22, 10:00 AM', read: false },
  { id: '5', type: 'System', title: 'Security Alert', description: 'New login detected from Chrome on Windows.', time: 'Oct 20, 08:15 AM', read: true },
  { id: '6', type: 'Investment', title: 'ROI Milestone', description: 'Your portfolio crossed $140,000 total value. Keep it up!', time: 'Oct 18, 15:30 PM', read: true },
  { id: '7', type: 'Deposit', title: 'Deposit Confirmed', description: '$10,000.00 deposit confirmed via Ethereum network.', time: 'Oct 15, 09:20 AM', read: true },
  { id: '8', type: 'Withdrawal', title: 'Withdrawal Processed', description: '$2,000.00 withdrawal sent to your ETH wallet.', time: 'Oct 10, 14:45 PM', read: true },
  { id: '9', type: 'Investment', title: 'Plan Expired', description: 'Your Starter Plan ($1,500) has completed its duration.', time: 'Sep 30, 00:00 AM', read: true },
  { id: '10', type: 'Investment', title: 'Profit Credited', description: '+$850.00 profit credited to your account.', time: 'Sep 29, 09:41 AM', read: true },
  { id: '11', type: 'System', title: 'System Maintenance', description: 'Scheduled maintenance completed successfully.', time: 'Sep 25, 03:00 AM', read: true },
  { id: '12', type: 'Deposit', title: 'Deposit Confirmed', description: '$50,000.00 deposit confirmed via Bank Transfer.', time: 'Sep 15, 11:00 AM', read: true },
];

export default function Notifications() {
  const [filter, setFilter] = useState('All');
  const [notifications, setNotifications] = useState<AppNotification[]>(initialNotifications);

  const filtered = notifications.filter(n => filter === 'All' || n.type === filter);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'Deposit': return <ArrowDownLeft className="text-emerald-400" size={20} />;
      case 'Withdrawal': return <ArrowUpRight className="text-destructive" size={20} />;
      case 'Investment': return <TrendingUp className="text-accent" size={20} />;
      case 'System': return <ShieldAlert className="text-yellow-400" size={20} />;
    }
  };

  const getBorderColor = (type: NotificationType) => {
    switch (type) {
      case 'Deposit': return 'border-l-emerald-500';
      case 'Withdrawal': return 'border-l-destructive';
      case 'Investment': return 'border-l-primary';
      case 'System': return 'border-l-yellow-500';
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Notifications</h1>
          <p className="text-muted-foreground">Stay updated on your account activity.</p>
        </div>
        <button 
          onClick={markAllRead}
          className="flex items-center gap-2 px-4 py-2 border border-white/10 text-white rounded-lg hover:bg-white/5 transition-colors text-sm font-medium"
        >
          <CheckCircle2 size={16} /> Mark All as Read
        </button>
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
        <AnimatePresence>
          {filtered.map((n, i) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex items-start gap-4 p-5 rounded-xl border border-white/5 cursor-pointer transition-colors border-l-4 ${getBorderColor(n.type)} ${
                n.read ? 'bg-card/40 backdrop-blur-md' : 'bg-primary/5 hover:bg-primary/10'
              }`}
            >
              <div className="mt-1 bg-white/5 p-2 rounded-full">
                {getIcon(n.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h3 className={`font-semibold ${n.read ? 'text-white/80' : 'text-white'}`}>{n.title}</h3>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{n.time}</span>
                </div>
                <p className="text-sm text-muted-foreground">{n.description}</p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0 shadow-[0_0_10px_rgba(30,167,255,0.5)]" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filtered.length === 0 && (
          <div className="py-20 text-center text-muted-foreground">
            <Bell size={48} className="mx-auto mb-4 opacity-20" />
            <p>No notifications found.</p>
          </div>
        )}
      </div>
    </div>
  );
}