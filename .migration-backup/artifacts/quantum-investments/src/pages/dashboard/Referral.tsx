import { motion } from 'framer-motion';
import { Copy, Share2, Users, UserPlus, DollarSign, Check } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { useToast } from '@/hooks/use-toast';

const mockReferredUsers = [
  { id: 1, name: 'J*** D***', date: 'Oct 15, 2023', invested: '$10,000.00', commission: '$500.00', status: 'Active' },
  { id: 2, name: 'M*** S***', date: 'Oct 02, 2023', invested: '$5,000.00', commission: '$250.00', status: 'Active' },
  { id: 3, name: 'A*** R***', date: 'Sep 28, 2023', invested: '$25,000.00', commission: '$1,250.00', status: 'Active' },
  { id: 4, name: 'L*** P***', date: 'Sep 10, 2023', invested: '$0.00', commission: '$0.00', status: 'Inactive' },
  { id: 5, name: 'D*** W***', date: 'Aug 22, 2023', invested: '$2,500.00', commission: '$125.00', status: 'Active' },
  { id: 6, name: 'S*** B***', date: 'Aug 15, 2023', invested: '$500.00', commission: '$25.00', status: 'Active' },
  { id: 7, name: 'C*** H***', date: 'Jul 30, 2023', invested: '$0.00', commission: '$0.00', status: 'Inactive' },
  { id: 8, name: 'E*** C***', date: 'Jul 12, 2023', invested: '$15,000.00', commission: '$750.00', status: 'Active' },
];

export default function Referral() {
  const { toast } = useToast();
  const refLink = 'https://quantuminvestments.com/ref/john-doe-2024';

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard.",
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
              className="w-full bg-background border border-white/10 rounded-xl py-4 pl-4 pr-12 text-accent font-mono text-sm focus:outline-none"
            />
            <button 
              onClick={handleCopy}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary hover:text-white transition-colors"
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
        <StatCard delay={0.1} title="Total Referrals" value="12" icon={Users} />
        <StatCard delay={0.2} title="Active Referrals" value="8" icon={UserPlus} />
        <StatCard delay={0.3} title="Referral Earnings" value="$3,400.00" icon={DollarSign} />
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
                {mockReferredUsers.map((row, i) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 + 0.6 }}
                    key={row.id} 
                    className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="p-4 font-mono text-white">{row.name}</td>
                    <td className="p-4 text-muted-foreground">{row.date}</td>
                    <td className="p-4 text-white">{row.invested}</td>
                    <td className="p-4 text-accent font-semibold">{row.commission}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                        row.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}