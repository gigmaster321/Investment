import { motion } from 'framer-motion';
import { ShieldCheck, Zap, TrendingUp, BarChart2, Headphones, Target } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: "Secure Investments",
    description: "Bank-grade 256-bit encryption, segregated client accounts, and FDIC-insured deposits protect every dollar."
  },
  {
    icon: Zap,
    title: "Fast Withdrawals",
    description: "Withdrawal requests are processed and transferred within 24 hours, every time — no delays, no surprises."
  },
  {
    icon: TrendingUp,
    title: "Expert Management",
    description: "Our fund managers bring 10+ years of institutional market experience, optimizing your portfolio daily."
  },
  {
    icon: BarChart2,
    title: "Transparent Reporting",
    description: "Real-time dashboards, complete audit trails, and zero hidden fees. You always know exactly where your capital is."
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our dedicated investor support team is available around the clock via live chat, email, and phone."
  },
  {
    icon: Target,
    title: "Risk Management",
    description: "Multi-layered risk protocols and diversified asset allocation strategies designed to protect and grow your capital."
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export function WhyChooseUs() {
  return (
    <section className="py-20 md:py-28 bg-secondary/20 relative z-10 border-y border-white/5">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Why Choose Quantum Investments</h2>
            <p className="text-lg text-muted-foreground">
              Six reasons why 18,500+ investors trust us with their financial future
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              className="bg-card border border-white/10 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(21,101,216,0.2)] hover:border-primary/50 group"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}