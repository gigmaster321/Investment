import { useRef, useEffect, useState } from 'react';
import { useInView } from 'framer-motion';
import { useCountUp } from '@/hooks/use-count-up';

interface StatProps {
  end: number;
  label: string;
  sublabel: string;
  prefix?: string;
  suffix?: string;
  inView: boolean;
}

function Stat({ end, label, sublabel, prefix = '', suffix = '', inView }: StatProps) {
  const { count, startCounting } = useCountUp(end, 2500, 0);
  const [lineVisible, setLineVisible] = useState(false);

  useEffect(() => {
    if (inView) {
      startCounting();
      setTimeout(() => setLineVisible(true), 500);
    }
  }, [inView, startCounting]);

  const formattedCount = Math.floor(count).toLocaleString();

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-10 relative">
      <div className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
        {prefix}{formattedCount}{suffix}
      </div>
      
      {/* Animated line */}
      <div className="h-1 bg-white/10 w-24 rounded-full mb-6 overflow-hidden relative">
        <div 
          className="absolute top-0 left-0 h-full bg-accent transition-all duration-1000 ease-out"
          style={{ width: lineVisible ? '100%' : '0%' }}
        />
      </div>

      <div className="text-sm md:text-base font-bold text-accent uppercase tracking-wide mb-2">
        {label}
      </div>
      <div className="text-sm text-muted-foreground font-medium">
        {sublabel}
      </div>
    </div>
  );
}

export function CompanyStats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative w-full border-y border-primary/10 z-10 overflow-hidden bg-background" ref={ref}>
      {/* Dramatic radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/30 via-background to-background" />
      
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/10 py-20 md:py-28">
          <Stat 
            end={18500} 
            prefix="" 
            suffix="+" 
            label="Total Investors" 
            sublabel="Active worldwide"
            inView={isInView}
          />
          <Stat 
            end={247} 
            prefix="$" 
            suffix="M+" 
            label="Total Deposits" 
            sublabel="Capital entrusted"
            inView={isInView}
          />
          <Stat 
            end={183} 
            prefix="$" 
            suffix="M+" 
            label="Total Withdrawals" 
            sublabel="Successfully processed"
            inView={isInView}
          />
          <Stat 
            end={3287} 
            prefix="" 
            suffix="" 
            label="Days Running" 
            sublabel="Uninterrupted since 2015"
            inView={isInView}
          />
        </div>
      </div>
    </section>
  );
}