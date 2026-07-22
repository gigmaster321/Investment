import { motion } from 'framer-motion';
import { Lock, Shield, Star } from 'lucide-react';

export function CtaSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden z-10 border-t border-primary/20">
      {/* Background with rich gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary via-primary/80 to-secondary" />
      
      {/* Texture & Glow */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/40 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          {/* Label */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-black/20 border border-white/10 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-bold text-white tracking-widest uppercase">Limited Spots Available</span>
          </div>

          {/* Heading */}
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight drop-shadow-lg">
            Start Your Investment Journey Today
          </h2>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-2xl mx-auto drop-shadow">
            Join 18,500+ investors already building wealth with Quantum. Open your account in minutes and choose the plan that fits your goals.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button className="w-full sm:w-auto px-10 py-4 rounded-full bg-white text-primary font-bold text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 hover:-translate-y-1">
              Start Investing Now
            </button>
            <button className="w-full sm:w-auto px-10 py-4 rounded-full bg-transparent border border-white/30 text-white font-bold text-lg hover:bg-white/10 transition-all duration-300">
              View Investment Plans
            </button>
          </div>

          {/* Trust Row */}
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 pt-8 border-t border-white/20">
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Lock className="w-4 h-4 text-accent" />
              256-bit Encryption
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Shield className="w-4 h-4 text-accent" />
              SEC Registered
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-white">
              <Star className="w-4 h-4 text-accent" />
              34.7% Avg. Annual Return
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}