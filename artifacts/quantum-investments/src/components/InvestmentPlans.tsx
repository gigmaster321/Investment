import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

const plans = [
  {
    name: "Starter",
    daily: "1.5%",
    min: "$100",
    max: "$999",
    duration: "30 days",
    featured: false
  },
  {
    name: "Silver",
    daily: "2.5%",
    min: "$1,000",
    max: "$4,999",
    duration: "60 days",
    featured: false
  },
  {
    name: "Gold",
    daily: "4.0%",
    min: "$5,000",
    max: "$19,999",
    duration: "90 days",
    featured: true
  },
  {
    name: "Platinum",
    daily: "6.0%",
    min: "$20,000+",
    max: "No limit",
    duration: "180 days",
    featured: false
  }
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {plans.map((plan, idx) => (
            <motion.div 
              key={plan.name}
              variants={itemVariants}
              className={`relative bg-card rounded-2xl border transition-all duration-300 hover:-translate-y-2 flex flex-col h-full ${
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
              
              <div className="p-8 flex-1">
                <h3 className="text-2xl font-bold text-white mb-2 text-center">{plan.name}</h3>
                <div className="text-center mb-6">
                  <span className="text-5xl font-extrabold text-primary">{plan.daily}</span>
                  <span className="block text-sm text-accent font-medium mt-1 uppercase tracking-wider">Daily Return</span>
                </div>
                
                <div className="h-px w-full bg-white/10 mb-6" />
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Min Deposit</span>
                    <span className="text-white font-semibold">{plan.min}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Max Deposit</span>
                    <span className="text-white font-semibold">{plan.max}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground text-sm">Duration</span>
                    <span className="text-white font-semibold">{plan.duration}</span>
                  </div>
                </div>
                
                <button onClick={() => setLocation('/register')} className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
                  plan.featured 
                    ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25' 
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}>
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
