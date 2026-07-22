import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
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
  const { count, startCounting } = useCountUp(end, 2000, 0);

  useEffect(() => {
    if (inView) {
      startCounting();
    }
  }, [inView, startCounting]);

  const formattedCount = count.toFixed(decimals);

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-8 relative">
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 tracking-tight">
        {prefix}{formattedCount}{suffix}
      </div>
      <div className="text-sm md:text-base font-semibold text-accent uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="text-xs md:text-sm text-muted-foreground">
        {sublabel}
      </div>
    </div>
  );
}

export function TrustIndicators() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative w-full border-t border-white/10 bg-background/50 z-10" ref={ref}>
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 py-12">
          <Stat 
            end={2.4} 
            decimals={1}
            prefix="$" 
            suffix="B+" 
            label="Assets Managed" 
            sublabel="Trusted by institutions & individuals"
            inView={isInView}
          />
          <Stat 
            end={18500} 
            prefix="" 
            suffix="+" 
            label="Active Investors" 
            sublabel="Growing community worldwide"
            inView={isInView}
          />
          <Stat 
            end={34.7} 
            decimals={1}
            prefix="" 
            suffix="%" 
            label="Average Annual ROI" 
            sublabel="Historical performance across funds"
            inView={isInView}
          />
        </div>
      </div>
    </section>
  );
}
