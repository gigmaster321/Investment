import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatMemberSince(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function Profile() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved successfully.',
      });
    }, 800);
  };

  const initials   = user ? getInitials(user.full_name) : '…';
  const memberSince = user ? formatMemberSince(user.created_at) : '—';

  return (
    <div className="max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account details and security.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-1 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/20 to-transparent -z-10" />
            <div className="w-24 h-24 rounded-full bg-background border-4 border-primary/20 flex items-center justify-center text-3xl font-bold text-accent mb-4 shadow-[0_0_20px_rgba(30,167,255,0.2)]">
              {initials}
            </div>
            <h2 className="text-xl font-bold text-white">{user?.full_name ?? '—'}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {user?.role === 'admin' ? 'Administrator' : 'Investor'}
            </p>
            <div className="w-full bg-white/5 rounded-lg p-3 flex justify-between items-center border border-white/5 text-sm">
              <span className="text-muted-foreground">Member Since</span>
              <span className="font-semibold text-white">{memberSince}</span>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} onSubmit={handleSave} className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8 space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4 border-b border-white/5 pb-4">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="text"
                    defaultValue={user?.full_name ?? ''}
                    key={`name-${user?.id}`}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="email"
                    defaultValue={user?.email ?? ''}
                    key={`email-${user?.id}`}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input
                    type="tel"
                    defaultValue={user?.phone ?? ''}
                    key={`phone-${user?.id}`}
                    placeholder="Not provided"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-white mt-8 mb-4 border-b border-white/5 pb-4 pt-4">Change Password</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Confirm New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90 disabled:opacity-70 text-white px-6 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(21,101,232,0.3)]">
                {isSaving
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                  : <><Save size={18} /> Save Changes</>
                }
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </div>
  );
}
