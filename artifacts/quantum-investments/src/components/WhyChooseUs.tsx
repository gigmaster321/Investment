import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Eye, Zap } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: "Secure Investment Platform",
    description: "Bank-grade security, encrypted transactions, insured deposits. Your capital is protected at every level."
  },
  {
    icon: TrendingUp,
    title: "Professional Asset Management",
    description: "Expert fund managers with 10+ years in global markets carefully optimizing your portfolio daily."
  },
  {
    icon: Eye,
    title: "Transparent Operations",
    description: "Real-time dashboards, full audit trail, zero hidden fees. Know exactly where your money is working."
  },
  {
    icon: Zap,
    title: "Fast Withdrawals",
    description: "Withdrawal requests processed within 24 hours, guaranteed. Access your profits without the wait."
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
              We combine institutional-grade security with unparalleled transparency to deliver a premium investment experience.
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              className="bg-card border border-white/10 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_30px_rgba(21,101,232,0.15)] hover:border-primary/50 group"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
