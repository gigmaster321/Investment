import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Lock, LogOut, Shield, Bell, Globe, Save, Eye, EyeOff, Camera } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useLocation } from 'wouter';

type SectionKey = 'profile' | 'password' | 'notifications' | 'security';

const SECTIONS: { key: SectionKey; label: string; icon: typeof User }[] = [
  { key: 'profile', label: 'Profile Settings', icon: User },
  { key: 'password', label: 'Change Password', icon: Lock },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security', icon: Shield },
];

export default function AdminSettings() {
  const [active, setActive] = useState<SectionKey>('profile');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saved, setSaved] = useState(false);
  const { user, logout } = useAdminAuth();
  const [, setLocation] = useLocation();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleLogout = () => {
    if (confirm('Sign out of the admin panel?')) {
      logout();
      setLocation('/admin/login');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your admin account and preferences.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <div className="lg:w-56 shrink-0 flex flex-col gap-1">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                active === s.key
                  ? 'bg-primary/20 text-accent border border-primary/30'
                  : 'text-muted-foreground hover:text-white hover:bg-white/5'
              }`}
            >
              <s.icon size={16} />
              {s.label}
            </button>
          ))}

          <div className="mt-3 pt-3 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Content */}
        <motion.div
          key={active}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 bg-card/40 border border-white/5 rounded-xl p-6"
        >
          {active === 'profile' && (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-white">Profile Settings</h2>
                <p className="text-muted-foreground text-xs mt-0.5">Update your admin profile information.</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold">
                    {user?.name?.charAt(0) ?? 'A'}
                  </div>
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent border-2 border-background flex items-center justify-center"
                  >
                    <Camera size={11} className="text-white" />
                  </button>
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{user?.name}</p>
                  <p className="text-muted-foreground text-xs">{user?.email}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent px-2 py-0.5 rounded-full mt-1 inline-block">
                    {user?.role?.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', placeholder: user?.name ?? '', type: 'text' },
                  { label: 'Email Address', placeholder: user?.email ?? '', type: 'email' },
                  { label: 'Phone Number', placeholder: '+1 (555) 000-0000', type: 'tel' },
                  { label: 'Timezone', placeholder: 'UTC+0 (London)', type: 'text' },
                ].map((f) => (
                  <div key={f.label} className="space-y-1.5">
                    <Label className="text-white/60 text-[10px] uppercase tracking-widest font-semibold">{f.label}</Label>
                    <Input
                      type={f.type}
                      defaultValue={f.placeholder}
                      className="h-10 bg-muted/40 border-white/10 text-white text-sm"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label className="text-white/60 text-[10px] uppercase tracking-widest font-semibold">Bio</Label>
                <textarea
                  rows={3}
                  placeholder="Brief description of your admin role…"
                  className="w-full bg-muted/40 border border-white/10 text-white text-sm rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-white/20"
                />
              </div>

              <SaveButton saved={saved} />
            </form>
          )}

          {active === 'password' && (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-white">Change Password</h2>
                <p className="text-muted-foreground text-xs mt-0.5">Use a strong, unique password to protect the admin panel.</p>
              </div>

              {[
                { label: 'Current Password', show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
                { label: 'New Password', show: showNew, toggle: () => setShowNew(!showNew) },
                { label: 'Confirm New Password', show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
              ].map((f) => (
                <div key={f.label} className="space-y-1.5">
                  <Label className="text-white/60 text-[10px] uppercase tracking-widest font-semibold">{f.label}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                    <Input
                      type={f.show ? 'text' : 'password'}
                      placeholder="••••••••••"
                      required
                      className="pl-10 pr-10 h-10 bg-muted/40 border-white/10 text-white placeholder:text-white/20"
                    />
                    <button
                      type="button"
                      onClick={f.toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    >
                      {f.show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}

              {/* Password requirements */}
              <div className="bg-white/3 border border-white/8 rounded-lg p-4 space-y-1.5">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Password requirements</p>
                {['At least 12 characters', 'One uppercase letter', 'One number', 'One special character'].map((req) => (
                  <div key={req} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                    {req}
                  </div>
                ))}
              </div>

              <SaveButton saved={saved} label="Update Password" />
            </form>
          )}

          {active === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-white">Notification Preferences</h2>
                <p className="text-muted-foreground text-xs mt-0.5">Choose which events trigger admin alerts.</p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'New user registration', desc: 'Alert when a new user signs up', enabled: true },
                  { label: 'Withdrawal request', desc: 'Alert on every new withdrawal', enabled: true },
                  { label: 'Large deposit (>$10k)', desc: 'Alert on deposits over $10,000', enabled: true },
                  { label: 'Suspicious login attempt', desc: 'Alert on failed admin logins', enabled: true },
                  { label: 'Plan change', desc: 'Alert when a user upgrades or downgrades', enabled: false },
                  { label: 'Weekly summary report', desc: 'Receive a weekly digest by email', enabled: false },
                ].map((n) => (
                  <div key={n.label} className="flex items-center justify-between p-4 bg-white/3 border border-white/8 rounded-lg">
                    <div>
                      <p className="text-white text-sm font-medium">{n.label}</p>
                      <p className="text-muted-foreground text-xs">{n.desc}</p>
                    </div>
                    <button
                      type="button"
                      className={`relative w-10 h-5 rounded-full transition-colors ${n.enabled ? 'bg-accent' : 'bg-white/15'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${n.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {active === 'security' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-semibold text-white">Security Settings</h2>
                <p className="text-muted-foreground text-xs mt-0.5">Configure admin panel security options.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Two-Factor Auth', status: 'Not configured', action: 'Enable', safe: true },
                  { label: 'Active Sessions', status: '1 device', action: 'Manage', safe: true },
                  { label: 'IP Whitelist', status: 'Disabled', action: 'Configure', safe: false },
                  { label: 'Audit Log', status: 'Enabled', action: 'View logs', safe: true },
                ].map((s) => (
                  <div key={s.label} className="bg-white/3 border border-white/8 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <Shield size={14} className={s.safe ? 'text-accent' : 'text-amber-400'} />
                      <p className="text-white text-sm font-semibold">{s.label}</p>
                    </div>
                    <p className="text-muted-foreground text-xs">{s.status}</p>
                    <button className="self-start text-xs font-semibold text-accent hover:text-accent/70 border border-accent/25 rounded-md px-3 py-1.5 transition-colors">
                      {s.action}
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 space-y-3">
                <p className="text-red-400 text-sm font-semibold">Danger Zone</p>
                <p className="text-muted-foreground text-xs">These actions are irreversible. Proceed with caution.</p>
                <div className="flex flex-wrap gap-2">
                  <button className="text-xs font-semibold text-red-400 border border-red-500/25 hover:bg-red-500/10 rounded-lg px-4 py-2 transition-colors">
                    Revoke All Sessions
                  </button>
                  <button className="text-xs font-semibold text-red-400 border border-red-500/25 hover:bg-red-500/10 rounded-lg px-4 py-2 transition-colors">
                    Reset Admin Panel
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

function SaveButton({ saved, label = 'Save Changes' }: { saved: boolean; label?: string }) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <Button
        type="submit"
        className="bg-gradient-to-r from-primary to-accent text-white font-semibold border-0 hover:shadow-[0_0_20px_rgba(30,167,255,0.3)] hover:scale-[1.02] transition-all duration-200 flex items-center gap-2"
      >
        <Save size={14} />
        {label}
      </Button>
      {saved && (
        <motion.span
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          className="text-xs text-emerald-400 font-medium"
        >
          ✓ Saved successfully
        </motion.span>
      )}
    </div>
  );
}
