import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { useCountUp } from '@/hooks/use-count-up';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatConfig {
  end: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  sublabel: string;
}

const STATS: StatConfig[] = [
  {
    end: 2.4,
    decimals: 1,
    prefix: '$',
    suffix: 'B+',
    label: 'Assets Managed',
    sublabel: 'Trusted by institutions & individuals',
  },
  {
    end: 18500,
    suffix: '+',
    label: 'Active Investors',
    sublabel: 'Growing community worldwide',
  },
  {
    end: 34.7,
    decimals: 1,
    suffix: '%',
    label: 'Average Annual ROI',
    sublabel: 'Historical performance across funds',
  },
];

// ─── Individual stat ──────────────────────────────────────────────────────────

interface StatProps extends StatConfig {
  inView: boolean;
}

function Stat({ end, decimals = 0, prefix = '', suffix = '', label, sublabel, inView }: StatProps) {
  // Animates once when inView first becomes true; never restarts.
  const count = useCountUp(end, 2000, decimals, inView);

  const formatted = count.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-8 relative">
      <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 tracking-tight">
        {prefix}{formatted}{suffix}
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

// ─── Section ──────────────────────────────────────────────────────────────────

export function TrustIndicators() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="relative w-full border-t border-white/10 bg-background/50 z-10"
    >
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/10 py-12">
          {STATS.map((stat) => (
            <Stat key={stat.label} {...stat} inView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}
