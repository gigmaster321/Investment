import { useRef, useEffect } from 'react';
import { useInView } from 'framer-motion';
import { useCountUp } from '@/hooks/use-count-up';

interface StatProps {
  end: number;
  label: string;
  sublabel: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  inView: boolean;
}

function Stat({ end, label, sublabel, prefix = '', suffix = '', decimals = 0, inView }: StatProps) {
  const { count, startCounting } = useCountUp(end, 2500, 0);

  useEffect(() => {
    if (inView) {
      startCounting();
    }
  }, [inView, startCounting]);

  const formattedCount = decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString();

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-8">
      <div className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight drop-shadow-md">
        {prefix}{formattedCount}{suffix}
      </div>
      <div className="text-sm md:text-base font-bold text-accent uppercase tracking-wider mb-2">
        {label}
      </div>
      <div className="text-xs text-muted-foreground font-medium">
        {sublabel}
      </div>
    </div>
  );
}

export function CompanyStats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative w-full bg-card border-y border-white/5 z-10" ref={ref}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/10 py-20 md:py-28">
          <Stat 
            end={18500} 
            prefix="" 
            suffix="+" 
            label="Total Investors" 
            sublabel="Globally trusted"
            inView={isInView}
          />
          <Stat 
            end={2.4} 
            decimals={1}
            prefix="$" 
            suffix="B+" 
            label="Investments Managed" 
            sublabel="Total portfolio value"
            inView={isInView}
          />
          <Stat 
            end={34} 
            prefix="" 
            suffix="" 
            label="Countries Served" 
            sublabel="International presence"
            inView={isInView}
          />
          <Stat 
            end={99200} 
            prefix="" 
            suffix="+" 
            label="Successful Withdrawals" 
            sublabel="Processed flawlessly"
            inView={isInView}
          />
        </div>
      </div>
    </section>
  );
}
