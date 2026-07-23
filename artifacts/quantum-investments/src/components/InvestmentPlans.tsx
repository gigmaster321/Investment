import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Check } from 'lucide-react';

const plans = [
  {
    name: "Starter AI",
    returns: "200% – 350%",
    investment: "$1,000 – $10,000",
    cycle: "24 Hours",
    featured: false,
    description: "Based on historical backtesting and volatility-adjusted strategy modeling.",
    overview: "Designed for new investors seeking structured exposure to innovation-focused equities with automated risk controls.",
    features: [
      "Automated trade execution",
      "Risk-adjusted capital deployment",
      "Portfolio rebalancing",
      "Monthly performance reporting",
    ],
  },
  {
    name: "Growth AI",
    returns: "350% – 550%",
    investment: "$10,000 – $100,000",
    cycle: "3 Days",
    featured: true,
    description: "Advanced signal detection with volatility-aware execution framework.",
    overview: "Enhanced AI signal modeling focused on high-growth innovation sectors and dynamic capital rotation.",
    features: [
      "High-frequency signal detection",
      "Sector rotation strategy",
      "Volatility hedging logic",
      "Weekly analytics dashboard",
    ],
  },
  {
    name: "Elite AI",
    returns: "+700%",
    investment: "$100,000+",
    cycle: "5 Days",
    featured: false,
    description: "Multi-layered AI execution across diversified innovation assets.",
    overview: "Designed for large capital deployment with structured downside protection and dynamic reallocation systems.",
    features: [
      "Cross-sector AI allocation engine",
      "Downside risk containment protocol",
      "Real-time capital rebalancing",
      "Dedicated strategy oversight",
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export function InvestmentPlans() {
  const [, setLocation] = useLocation();

  return (
    <section id="plans" className="py-20 md:py-28 bg-background relative z-10">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Investment Plans</h2>
            <p className="text-lg text-muted-foreground">
              Choose the plan that fits your financial goals. Whether you are starting small or scaling up, we have a strategy for your capital.
            </p>
          </motion.div>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={itemVariants}
              className={`relative bg-card rounded-2xl border transition-all duration-300 hover:-translate-y-2 flex flex-col ${
                plan.featured
                  ? 'border-primary shadow-[0_0_30px_rgba(21,101,232,0.2)] lg:scale-105 z-10'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="p-8 flex flex-col flex-1">
                {/* Plan name */}
                <h3 className="text-2xl font-bold text-white mb-2 text-center">{plan.name}</h3>

                {/* Returns */}
                <div className="text-center mb-4">
                  <span className="text-4xl font-extrabold text-primary">{plan.returns}</span>
                  <span className="block text-sm text-accent font-medium mt-1 uppercase tracking-wider">Target Returns</span>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground text-center mb-5 leading-relaxed">
                  {plan.description}
                </p>

                <div className="h-px w-full bg-white/10 mb-5" />

                {/* Investment & cycle */}
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Investment</span>
                    <span className="text-white font-semibold">{plan.investment}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Execution Cycle</span>
                    <span className="text-white font-semibold">{plan.cycle}</span>
                  </div>
                </div>

                <div className="h-px w-full bg-white/10 mb-5" />

                {/* Overview */}
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {plan.overview}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-8 flex-1">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                        plan.featured ? 'bg-primary/20' : 'bg-white/10'
                      }`}>
                        <Check className={`h-2.5 w-2.5 ${plan.featured ? 'text-primary' : 'text-white/60'}`} strokeWidth={2.5} />
                      </span>
                      <span className="text-sm text-white/70 leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA — pinned to bottom */}
                <button
                  onClick={() => setLocation('/register')}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                    plan.featured
                      ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  }`}
                >
                  Invest Now
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
