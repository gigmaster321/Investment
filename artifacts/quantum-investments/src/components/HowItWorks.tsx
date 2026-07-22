import { motion } from 'framer-motion';
import { UserPlus, CreditCard, TrendingUp, Wallet, ArrowRight } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    number: "01",
    title: "Register",
    description: "Create your secure investor account in under 3 minutes. Verification is instant."
  },
  {
    icon: CreditCard,
    number: "02",
    title: "Deposit",
    description: "Fund your account starting from $100 using bank transfer, card, or crypto."
  },
  {
    icon: TrendingUp,
    number: "03",
    title: "Invest",
    description: "Choose your plan and watch our algorithms put your capital to work immediately."
  },
  {
    icon: Wallet,
    number: "04",
    title: "Withdraw Profit",
    description: "Request your earnings anytime. Funds arrive in your account within 24 hours."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-background relative z-10">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">The Investment Process</h2>
            <p className="text-lg text-muted-foreground">
              From registration to profit withdrawal in four seamless steps
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="relative max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                {/* Connector Line (Desktop) */}
                {idx < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-[5.5rem] left-[60%] w-[80%] h-[2px] border-t-2 border-dashed border-primary/30 z-[-1]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background w-6 h-6 rounded-full flex items-center justify-center border border-primary/30 z-10">
                      <ArrowRight className="w-3 h-3 text-primary" />
                    </div>
                  </div>
                )}

                <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-primary to-accent mb-6 transition-all duration-300 group-hover:brightness-125">
                  {step.number}
                </div>

                <div className="w-20 h-20 rounded-2xl bg-card border border-white/10 shadow-xl flex items-center justify-center mb-6 relative group-hover:-translate-y-2 transition-transform duration-300">
                  <step.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed max-w-[220px]">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}