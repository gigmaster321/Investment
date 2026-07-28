import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { LayoutDashboard, TrendingUp, Download, Upload, Clock, User, LogOut, X, DollarSign, Bell, MessageCircle } from 'lucide-react';
import { chatApi } from '@/lib/chat-api';

const POLL_INTERVAL = 10_000;

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();
  const [chatUnread, setChatUnread] = useState(0);

  // Poll unread count every 10 seconds
  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const { count } = await chatApi.getUnreadCount();
        if (mounted) setChatUnread(count);
      } catch {
        // silently ignore — sidebar badge is non-critical
      }
    };
    fetch();
    const timer = setInterval(fetch, POLL_INTERVAL);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 0 },
    { href: '/dashboard/investments', label: 'Investments', icon: TrendingUp, badge: 0 },
    { href: '/dashboard/deposits', label: 'Deposits', icon: Download, badge: 0 },
    { href: '/dashboard/withdrawals', label: 'Withdrawals', icon: Upload, badge: 0 },
    { href: '/dashboard/earnings', label: 'Earnings', icon: DollarSign, badge: 0 },
    { href: '/dashboard/transactions', label: 'Transactions', icon: Clock, badge: 0 },
    { href: '/dashboard/notifications', label: 'Notifications', icon: Bell, badge: 0 },
    { href: '/dashboard/chat', label: 'Live Chat', icon: MessageCircle, badge: chatUnread },
    { href: '/dashboard/profile', label: 'Profile', icon: User, badge: 0 },
  ];

  const handleLogout = () => {
    onClose?.();
    window.location.href = '/login';
  };

  return (
    <div className="h-full flex flex-col bg-sidebar/80 backdrop-blur-xl border-r border-white/5 w-64 md:w-72">
      <div className="p-6 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-white">
            QUANTUM<span className="text-accent">.</span>
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-muted-foreground hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/dashboard'
              ? location === '/dashboard' || location === '/dashboard/'
              : location.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary/20 text-accent border border-primary/30 shadow-[0_0_15px_rgba(30,167,255,0.1)]'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
                onClick={() => onClose?.()}
              >
                <item.icon size={20} className={isActive ? 'text-accent' : 'text-muted-foreground'} />
                <span className="font-medium text-sm flex-1">{item.label}</span>
                {item.badge > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}
