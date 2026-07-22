import { Link } from 'wouter';
import { Mail, Phone, MapPin, ShieldCheck, Lock, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react';
// @ts-ignore
import logoPath from '@assets/Quantum_Investment_1784716537861.jpeg';

export function SiteFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-[#050a1a] pt-20 pb-8 border-t border-white/10 relative z-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          
          {/* Column 1: Brand & Bio */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="inline-block">
              <img
                src={logoPath}
                alt="Quantum Investments Logo"
                className="h-14 w-auto object-contain rounded-md"
              />
            </Link>
            <div className="space-y-2">
              <h4 className="text-white font-semibold text-lg">Smarter Investments. Stronger Futures.</h4>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                Quantum Investments delivers intelligent portfolio management and institutional-grade strategies to forward-thinking investors worldwide.
              </p>
            </div>
            
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="md:col-span-4">
            <h4 className="text-white font-bold mb-6 tracking-wide">Quick Links</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Link href="#about" className="block text-sm text-muted-foreground hover:text-accent transition-colors">About Us</Link>
                <Link href="#plans" className="block text-sm text-muted-foreground hover:text-accent transition-colors">Investment Plans</Link>
                <Link href="#faq" className="block text-sm text-muted-foreground hover:text-accent transition-colors">FAQ</Link>
                <a href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">Contact Us</a>
              </div>
              <div className="space-y-3">
                <a href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">Privacy Policy</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">Terms of Service</a>
                <a href="#" className="block text-sm text-muted-foreground hover:text-accent transition-colors">Risk Disclosure</a>
              </div>
            </div>
          </div>

          {/* Column 3: Contact */}
          <div className="md:col-span-3">
            <h4 className="text-white font-bold mb-6 tracking-wide">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3 text-sm">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <a href="mailto:support@quantuminvestments.com" className="text-muted-foreground hover:text-white transition-colors">
                  support@quantuminvestments.com
                </a>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <a href="tel:+18005550192" className="text-muted-foreground hover:text-white transition-colors">
                  +1 (800) 555-0192
                </a>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-muted-foreground leading-relaxed">
                  350 Fifth Avenue<br />
                  New York, NY 10118<br />
                  United States
                </span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} Quantum Investments. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4 text-xs font-medium text-white/50">
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-white/30" /> SEC Registered</div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-white/30" /> FDIC Insured</div>
            <div className="w-1 h-1 rounded-full bg-white/20" />
            <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-white/30" /> 256-bit SSL</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
