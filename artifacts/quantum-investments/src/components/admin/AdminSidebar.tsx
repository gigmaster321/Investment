import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard, Users, ArrowDownCircle, TrendingUp,
  BarChart2, Settings, LogOut, X, Shield,
  CreditCard, Bell, DollarSign,
} from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

// @ts-ignore
import logoPath from '@assets/Quantum_Investment_1784716537861.jpeg';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  exact?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Main',
    items: [
      { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Management',
    items: [
      { href: '/admin/users', label: 'User Management', icon: Users },
      { href: '/admin/deposits', label: 'Deposits', icon: DollarSign },
      { href: '/admin/withdrawals', label: 'Withdrawals', icon: ArrowDownCircle },
      { href: '/admin/plans', label: 'Investment Plans', icon: CreditCard },
    ],
  },
  {
    label: 'Insights',
    items: [
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const [location] = useLocation();
  const { user, logout } = useAdminAuth();

  const isActive = (href: string, exact?: boolean) =>
    exact ? location === href : location.startsWith(href);

  return (
    <div className="h-full flex flex-col bg-[hsl(221,70%,10%)] border-r border-white/5 w-64 md:w-72">
      {/* Logo */}
      <div className="p-5 flex items-center justify-between border-b border-white/5 shrink-0">
        <Link href="/admin" className="flex items-center gap-3">
          <img src={logoPath} alt="Quantum" className="h-8 w-8 rounded-md object-cover" />
          <div>
            <p className="text-sm font-bold text-white leading-tight">QUANTUM</p>
            <p className="text-[10px] font-semibold text-accent tracking-widest uppercase leading-tight">
              Admin Panel
            </p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="md:hidden text-muted-foreground hover:text-white p-1">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Admin badge */}
      <div className="px-5 py-3 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-3 py-2">
          <Shield size={14} className="text-accent shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name ?? 'Admin'}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user?.email ?? ''}</p>
          </div>
          <span className="ml-auto shrink-0 text-[9px] font-bold uppercase tracking-wider bg-accent/20 text-accent px-1.5 py-0.5 rounded-md">
            {user?.role === 'super_admin' ? 'Super' : 'Admin'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50 px-3 mb-2">
              {section.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      onClick={() => onClose?.()}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer text-sm font-medium ${
                        active
                          ? 'bg-primary/20 text-accent border border-primary/30 shadow-[0_0_15px_rgba(30,167,255,0.12)]'
                          : 'text-muted-foreground hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <item.icon size={17} className={active ? 'text-accent' : ''} />
                      {item.label}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5 shrink-0">
        <button
          onClick={() => {
            logout();
          }}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
