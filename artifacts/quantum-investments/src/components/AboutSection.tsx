import { motion } from 'framer-motion';
import { Target, Eye, Shield, Lock, Building, Award, Users, Globe, Briefcase } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="py-20 md:py-28 bg-background relative overflow-hidden z-10">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Column */}
          <motion.div 
            className="flex-1"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-block px-3 py-1 mb-6 rounded-full bg-secondary/50 border border-white/10 text-accent text-sm font-semibold tracking-wide uppercase">
              About Us
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Empowering Investors Worldwide Since 2015
            </h2>
            
            <div className="space-y-4 text-muted-foreground text-lg mb-8 leading-relaxed">
              <p>
                At Quantum Investments, we believe that elite wealth management should not be confined to institutions. For over a decade, we have democratized access to professional asset management, combining algorithmic precision with expert human insight.
              </p>
              <p>
                Our commitment to transparency, rigorous risk management, and consistent performance has earned the trust of investors across the globe. We do not just grow portfolios; we build lasting financial confidence.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-8 mb-10">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center text-primary mb-4">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-white">Our Mission</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To deliver exceptional, risk-adjusted returns through institutional-grade strategies. We prioritize capital preservation while capturing consistent market growth.
                </p>
              </div>
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center text-accent mb-4">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-semibold text-white">Our Vision</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  To be the world's most transparent and trusted digital investment firm. We envision a future where financial freedom is accessible to every disciplined investor.
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Building className="w-4 h-4 text-primary" />
                SEC Registered
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Lock className="w-4 h-4 text-primary" />
                256-bit SSL
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Shield className="w-4 h-4 text-primary" />
                FDIC Insured
              </div>
            </div>
          </motion.div>

          {/* Right Column */}
          <motion.div 
            className="flex-1 w-full"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
          >
            <div className="relative bg-card rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl shadow-primary/5 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl pointer-events-none" />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                {/* Tile 1 */}
                <div className="bg-background/50 border border-white/5 rounded-xl p-6 transition-all duration-300 hover:bg-background hover:border-primary/30 hover:shadow-[0_0_20px_rgba(21,101,232,0.15)] group/tile">
                  <Award className="w-8 h-8 text-primary mb-4 group-hover/tile:scale-110 transition-transform" />
                  <div className="text-2xl font-bold text-white mb-1">10+ Years</div>
                  <div className="text-sm text-accent font-medium mb-2">Market Experience</div>
                  <div className="text-xs text-muted-foreground">Navigating diverse market cycles with proven resilience.</div>
                </div>
                
                {/* Tile 2 */}
                <div className="bg-background/50 border border-white/5 rounded-xl p-6 transition-all duration-300 hover:bg-background hover:border-primary/30 hover:shadow-[0_0_20px_rgba(21,101,232,0.15)] group/tile">
                  <Users className="w-8 h-8 text-primary mb-4 group-hover/tile:scale-110 transition-transform" />
                  <div className="text-2xl font-bold text-white mb-1">18,500+</div>
                  <div className="text-sm text-accent font-medium mb-2">Active Investors</div>
                  <div className="text-xs text-muted-foreground">A growing community of disciplined wealth builders.</div>
                </div>

                {/* Tile 3 */}
                <div className="bg-background/50 border border-white/5 rounded-xl p-6 transition-all duration-300 hover:bg-background hover:border-primary/30 hover:shadow-[0_0_20px_rgba(21,101,232,0.15)] group/tile">
                  <Briefcase className="w-8 h-8 text-primary mb-4 group-hover/tile:scale-110 transition-transform" />
                  <div className="text-2xl font-bold text-white mb-1">$2.4B+</div>
                  <div className="text-sm text-accent font-medium mb-2">Assets Managed</div>
                  <div className="text-xs text-muted-foreground">Substantial capital entrusted to our expert strategies.</div>
                </div>

                {/* Tile 4 */}
                <div className="bg-background/50 border border-white/5 rounded-xl p-6 transition-all duration-300 hover:bg-background hover:border-primary/30 hover:shadow-[0_0_20px_rgba(21,101,232,0.15)] group/tile">
                  <Globe className="w-8 h-8 text-primary mb-4 group-hover/tile:scale-110 transition-transform" />
                  <div className="text-2xl font-bold text-white mb-1">34+</div>
                  <div className="text-sm text-accent font-medium mb-2">Countries Served</div>
                  <div className="text-xs text-muted-foreground">Global reach with localized compliance and support.</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
