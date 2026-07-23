import { motion } from 'framer-motion';
import { Target, Eye, Shield, Lock, BarChart2 } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28 bg-background relative z-10 overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Column */}
          <motion.div 
            className="flex-1 w-full"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-secondary/20 border border-white/5 text-accent text-sm font-semibold tracking-wide uppercase">
              <BarChart2 className="w-4 h-4" />
              About Quantum Investments
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Building Wealth Through Intelligent Investment Management
            </h2>
            
            <div className="space-y-4 text-muted-foreground text-lg mb-10 leading-relaxed">
              <p>
                At Quantum Investments, we believe that elite wealth management should not be confined to institutions. For over a decade, we have democratized access to professional asset management, combining algorithmic precision with expert human insight.
              </p>
              <p>
                Our commitment to transparency, rigorous risk management, and consistent performance has earned the trust of investors across the globe. We do not just grow portfolios; we build lasting financial confidence.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-8 mb-10">
              <div className="flex-1 space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Target className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Our Mission</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    To deliver exceptional, risk-adjusted returns through institutional-grade strategies while prioritizing capital preservation.
                  </p>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Our Vision</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    To be the world's most transparent digital investment firm, making financial freedom accessible to every disciplined investor.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/30 text-xs font-medium text-white/90">
                <Shield className="w-3.5 h-3.5 text-primary" /> SEC Registered
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/30 text-xs font-medium text-white/90">
                <Lock className="w-3.5 h-3.5 text-primary" /> 256-bit SSL
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/30 text-xs font-medium text-white/90">
                <Shield className="w-3.5 h-3.5 text-primary" /> FDIC Insured
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary/30 text-xs font-medium text-white/90">
                <Shield className="w-3.5 h-3.5 text-primary" /> ISO 27001
              </div>
            </div>
          </motion.div>

          {/* Right Column - Illustration */}
          <motion.div 
            className="flex-1 w-full"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative mx-auto max-w-md lg:max-w-full">
              {/* Glow background */}
              <div className="absolute inset-0 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
              
              <div className="relative bg-card rounded-2xl border border-primary/20 p-8 shadow-[0_0_40px_rgba(21,101,216,0.15)]">
                
                {/* Live Badge */}
                <div className="absolute top-6 right-6 flex items-center gap-2 bg-background/80 border border-white/5 px-3 py-1.5 rounded-full z-20">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-semibold text-white tracking-wide uppercase">Live</span>
                </div>

                <div className="mb-8 mt-2">
                  <div className="text-muted-foreground text-sm font-medium mb-1 uppercase tracking-wider">Portfolio Performance</div>
                  <div className="text-4xl font-extrabold text-accent">+34.7% <span className="text-lg text-muted-foreground font-normal tracking-normal">Avg. Annual Return</span></div>
                </div>

                {/* Chart Area */}
                <div className="relative h-64 w-full flex items-end justify-between gap-2 md:gap-4 mt-12">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-full h-px bg-white" />
                    ))}
                  </div>

                  {/* SVG Path */}
                  <svg className="absolute inset-0 w-full h-full z-10 overflow-visible pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path 
                      d="M 8,70 C 20,70 20,55 33,55 C 40,55 40,65 50,65 C 60,65 60,40 66,40 C 75,40 75,25 83,25 C 90,25 90,10 95,10" 
                      fill="none" 
                      stroke="hsl(var(--accent))" 
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0 0 6px hsl(var(--accent)))' }}
                    />
                  </svg>

                  {/* Bars */}
                  {[
                    { h: '30%' },
                    { h: '45%' },
                    { h: '35%' },
                    { h: '60%' },
                    { h: '75%' },
                    { h: '90%' },
                  ].map((bar, i) => (
                    <div 
                      key={i} 
                      className="w-full relative z-0 rounded-t-sm"
                      style={{ height: bar.h, background: 'linear-gradient(to top, hsl(var(--primary)), hsl(var(--accent)))' }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-t-sm pointer-events-none" />
                    </div>
                  ))}
                </div>
                
                {/* X Axis Labels */}
                <div className="flex justify-between mt-4 text-xs font-medium text-muted-foreground">
                  <span>2019</span>
                  <span>2020</span>
                  <span>2021</span>
                  <span>2022</span>
                  <span>2023</span>
                  <span>2024</span>
                </div>
                
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}