import { Link, useLocation } from 'wouter';
import { LayoutDashboard, TrendingUp, Download, Upload, Clock, User, LogOut, X } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/investments', label: 'Investments', icon: TrendingUp },
  { href: '/dashboard/deposits', label: 'Deposits', icon: Download },
  { href: '/dashboard/withdrawals', label: 'Withdrawals', icon: Upload },
  { href: '/dashboard/transactions', label: 'Transactions', icon: Clock },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();

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
          const isActive = location === item.href || (item.href === '/dashboard' && location === '/dashboard/');
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
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          onClick={() => {
            if (confirm('Are you sure you want to log out?')) {
              window.location.href = '/';
            }
          }}
        >
          <LogOut size={20} />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
}