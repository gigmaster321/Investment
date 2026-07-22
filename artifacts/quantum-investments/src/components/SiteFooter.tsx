import { Link } from 'wouter';
import { Mail, Phone, MapPin, ShieldCheck, Lock, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';
// @ts-ignore
import logoPath from '@assets/Quantum_Investment_1784717259991.jpeg';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-[#040912] pt-20 pb-8 relative z-10">
      {/* Top Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-1 space-y-6">
            <Link href="/" className="inline-block">
              <img
                src={logoPath}
                alt="Quantum Investments Logo"
                className="h-14 w-auto object-contain rounded-md"
              />
            </Link>
            <div className="space-y-2">
              <h4 className="text-accent font-semibold text-base">Smarter Investments. Stronger Futures.</h4>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                Quantum Investments delivers intelligent portfolio management and institutional-grade strategies to forward-thinking investors worldwide.
              </p>
            </div>
            
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-all">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Company */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-bold mb-6 tracking-wide text-lg">Company</h4>
            <div className="space-y-3">
              <Link href="#about" className="block text-sm text-muted-foreground hover:text-accent transition-colors">About Us</Link>
              <Link href="#plans" className="block text-sm text-muted-foreground hover:text-accent transition-colors">Investment Plans</Link>
              <Link href="#how-it-works" className="block text-sm text-muted-foreground hover:text-accent transition-colors">How It Works</Link>
              <Link href="#stats" className="block text-sm text-muted-foreground hover:text-accent transition-colors">Statistics</Link>
              <Link href="#faq" className="block text-sm text-muted-foreground hover:text-accent transition-colors">FAQ</Link>
            </div>
          </div>

          {/* Column 3: Legal */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-bold mb-6 tracking-wide text-lg">Legal</h4>
            <div className="space-y-3">
              <a href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">Privacy Policy</a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">Terms of Service</a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">Risk Disclosure</a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">Cookie Policy</a>
              <a href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">AML Policy</a>
            </div>
          </div>

          {/* Column 4: Contact */}
          <div className="lg:col-span-1">
            <h4 className="text-white font-bold mb-6 tracking-wide text-lg">Get In Touch</h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href="mailto:support@quantuminvestments.com" className="text-muted-foreground hover:text-accent transition-colors">
                  support@quantuminvestments.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href="tel:+18005550192" className="text-muted-foreground hover:text-accent transition-colors">
                  +1 (800) 555-0192
                </a>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground leading-relaxed">
                  350 Fifth Avenue<br />
                  New York, NY 10118
                </span>
              </div>
              <div className="pt-2 text-sm text-muted-foreground">
                <span className="text-white font-medium">Hours:</span> Mon–Fri, 9:00 AM – 6:00 PM EST
              </div>
            </div>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Quantum Investments. All rights reserved.
          </p>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-xs font-medium text-white/70">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> SEC Registered
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-xs font-medium text-white/70">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> FDIC Insured
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 text-xs font-medium text-white/70">
              <Lock className="w-3.5 h-3.5 text-primary" /> 256-bit SSL
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}