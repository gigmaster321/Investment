import { motion } from 'framer-motion';
import { UserPlus, ClipboardList, DollarSign, Wallet } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: "Create Account",
    description: "Sign up in minutes with our secure registration process."
  },
  {
    icon: ClipboardList,
    title: "Choose Plan",
    description: "Select an investment tier that aligns with your financial goals."
  },
  {
    icon: DollarSign,
    title: "Invest Funds",
    description: "Deposit your capital using our supported secure payment methods."
  },
  {
    icon: Wallet,
    title: "Withdraw Profits",
    description: "Watch your portfolio grow and withdraw your earnings anytime."
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
    <section className="py-20 md:py-28 bg-secondary/30 relative z-10 border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">How It Works</h2>
            <p className="text-lg text-muted-foreground">
              Start earning in 4 simple steps. Our streamlined onboarding gets your money working for you immediately.
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="relative max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute top-[44px] left-[10%] right-[10%] h-[2px] border-t-2 border-dashed border-white/10 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-6">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                variants={itemVariants}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-2xl bg-card border border-white/10 shadow-xl flex items-center justify-center mb-6 relative group hover:border-primary/50 transition-colors">
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-lg">
                    {idx + 1}
                  </div>
                  <step.icon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm max-w-[200px] mx-auto leading-relaxed">
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
