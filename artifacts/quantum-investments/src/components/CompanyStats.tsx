import { useRef, useState, useEffect } from 'react';
import { useInView } from 'framer-motion';
import { useCountUp } from '@/hooks/use-count-up';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatConfig {
  /** Numeric end value (e.g. 2.3 for "$2.3B+") */
  end: number;
  /** Decimal places shown during and after animation */
  decimals?: number;
  /** Text prepended to the number (e.g. "$") */
  prefix?: string;
  /** Text appended to the number (e.g. "B+", "M+", "%") */
  suffix?: string;
  /** Short label shown in accent colour */
  label: string;
  /** Descriptive sub-label in muted colour */
  sublabel: string;
  /** Animation duration in ms (default 2000) */
  duration?: number;
}

// ─── Individual stat card ─────────────────────────────────────────────────────

interface StatProps extends StatConfig {
  inView: boolean;
}

function Stat({
  end,
  decimals = 0,
  prefix = '',
  suffix = '',
  label,
  sublabel,
  duration = 2000,
  inView,
}: StatProps) {
  // Hook: animates once when inView first becomes true, never again.
  const count = useCountUp(end, duration, decimals, inView);

  // Underline reveal — fires once on first inView, just like the counter.
  const [lineVisible, setLineVisible] = useState(false);
  const lineStarted = useRef(false);
  useEffect(() => {
    if (inView && !lineStarted.current) {
      lineStarted.current = true;
      const t = setTimeout(() => setLineVisible(true), 400);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [inView]);

  // Format the animated value preserving commas + required decimal places.
  const formatted = count.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <div className="flex flex-col items-center justify-center text-center px-4 py-10 relative">
      {/* Animated number */}
      <div className="text-5xl md:text-6xl font-extrabold text-white mb-4 tracking-tight drop-shadow-lg">
        {prefix}{formatted}{suffix}
      </div>

      {/* Accent underline bar */}
      <div className="h-1 bg-white/10 w-24 rounded-full mb-6 overflow-hidden relative">
        <div
          className="absolute top-0 left-0 h-full bg-accent rounded-full transition-all duration-1000 ease-out"
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

// ─── Stats section ────────────────────────────────────────────────────────────

const STATS: StatConfig[] = [
  {
    end: 18500,
    suffix: '+',
    label: 'Total Investors',
    sublabel: 'Active worldwide',
    duration: 2000,
  },
  {
    end: 247,
    prefix: '$',
    suffix: 'M+',
    label: 'Total Deposits',
    sublabel: 'Capital entrusted',
    duration: 2200,
  },
  {
    end: 183,
    prefix: '$',
    suffix: 'M+',
    label: 'Total Withdrawals',
    sublabel: 'Successfully processed',
    duration: 2000,
  },
  {
    end: 3287,
    label: 'Days Running',
    sublabel: 'Uninterrupted since 2015',
    duration: 2500,
  },
];

export function CompanyStats() {
  const ref = useRef<HTMLElement>(null);

  // once: true ensures isInView flips to true exactly once and stays true —
  // the IntersectionObserver is disconnected immediately after triggering.
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      className="relative w-full border-y border-primary/10 z-10 overflow-hidden bg-background"
    >
      {/* Dramatic radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-secondary/30 via-background to-background" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_10%,transparent_100%)]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/10 py-20 md:py-28">
          {STATS.map((stat) => (
            <Stat key={stat.label} {...stat} inView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}
