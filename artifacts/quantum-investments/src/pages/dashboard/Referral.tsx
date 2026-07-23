import { motion } from 'framer-motion';
import { Copy, Share2, Users, UserPlus, DollarSign } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function Referral() {
  const { toast } = useToast();
  const { user } = useAuth();

  const refLink = user
    ? `${window.location.origin}/ref/${user.username}`
    : '';

  const handleCopy = () => {
    if (!refLink) return;
    navigator.clipboard.writeText(refLink);
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard.',
    });
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Referral Program</h1>
        <p className="text-muted-foreground">Invite friends and earn up to 5% commission.</p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 md:p-8"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Your Referral Link</h2>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full relative">
            <input
              readOnly
              value={refLink}
              placeholder="Loading your referral link…"
              className="w-full bg-background border border-white/10 rounded-xl py-4 pl-4 pr-12 text-accent font-mono text-sm focus:outline-none"
            />
            <button
              onClick={handleCopy}
              disabled={!refLink}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Copy size={16} />
            </button>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl font-medium transition-colors">
              <Share2 size={18} /> Share
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard delay={0.1} title="Total Referrals" value="0" icon={Users} />
        <StatCard delay={0.2} title="Active Referrals" value="0" icon={UserPlus} />
        <StatCard delay={0.3} title="Referral Earnings" value="$0.00" icon={DollarSign} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/40 backdrop-blur-md border border-white/5 rounded-xl p-6 h-fit"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Commission Tiers</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-primary bg-primary/10 shadow-[0_0_15px_rgba(30,167,255,0.1)]">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-bold">Level 1 (Direct)</h3>
                <span className="text-accent font-bold">5%</span>
              </div>
              <p className="text-xs text-muted-foreground">Earn 5% on deposits from people you invite directly.</p>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-white/5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-bold">Level 2 (Indirect)</h3>
                <span className="text-accent font-bold">2%</span>
              </div>
              <p className="text-xs text-muted-foreground">Earn 2% when your direct referrals invite others.</p>
            </div>
            <div className="p-4 rounded-xl border border-white/5 bg-white/5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-bold">Level 3 (Network)</h3>
                <span className="text-accent font-bold">1%</span>
              </div>
              <p className="text-xs text-muted-foreground">Earn 1% on the third tier of your network.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Referred Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/5 text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  <th className="p-4">User</th>
                  <th className="p-4">Date Joined</th>
                  <th className="p-4">Investment Amount</th>
                  <th className="p-4">Commission Earned</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    No referrals yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
