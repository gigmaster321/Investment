import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon: Icon, delay = 0 }: StatCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-card/40 backdrop-blur-md border border-white/5 rounded-xl p-6 flex flex-col gap-4 hover:bg-card/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_30px_rgba(30,167,255,0.15)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground font-medium text-sm">{title}</span>
        <div className="bg-primary/20 p-2 rounded-lg text-accent">
          <Icon size={20} />
        </div>
      </div>
      <div>
        <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
        {subtitle && <p className="text-xs text-accent mt-1 font-medium">{subtitle}</p>}
      </div>
    </motion.div>
  );
}