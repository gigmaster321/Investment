import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, AtSign, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

// @ts-ignore
import logoPath from '@assets/Quantum_Investment_1784716537861.jpeg';

export default function Register() {
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate register delay
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    setLocation('/dashboard');
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center relative overflow-hidden p-4 md:p-6 py-12">
      {/* Radial Background Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] md:w-[900px] md:h-[900px] bg-primary/15 rounded-full blur-[100px] md:blur-[140px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[520px] backdrop-blur-xl bg-card/40 border border-white/10 shadow-2xl rounded-2xl p-6 md:p-8"
      >
        <Link href="/" className="block w-fit mx-auto mb-6">
          <img
            src={logoPath}
            alt="Quantum Investments"
            className="h-12 w-auto object-contain rounded-md mx-auto"
          />
        </Link>

        <h1 className="text-2xl font-bold text-center text-white mb-2">Create Account</h1>
        <p className="text-muted-foreground text-center text-sm mb-8">
          Join thousands of investors growing their wealth
        </p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-white/70 text-xs uppercase tracking-wider font-semibold">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type="text"
                  placeholder="John Doe"
                  required
                  className="pl-10 h-11 bg-muted/50 border-white/10 focus-visible:ring-accent text-white placeholder:text-white/20 transition-all"
                />
              </div>
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label className="text-white/70 text-xs uppercase tracking-wider font-semibold">
                Username
              </Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type="text"
                  placeholder="johndoe123"
                  required
                  className="pl-10 h-11 bg-muted/50 border-white/10 focus-visible:ring-accent text-white placeholder:text-white/20 transition-all"
                />
              </div>
            </div>

            {/* Email (Full Width) */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-white/70 text-xs uppercase tracking-wider font-semibold">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="pl-10 h-11 bg-muted/50 border-white/10 focus-visible:ring-accent text-white placeholder:text-white/20 transition-all"
                />
              </div>
            </div>

            {/* Phone Number (Full Width) */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-white/70 text-xs uppercase tracking-wider font-semibold">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  required
                  className="pl-10 h-11 bg-muted/50 border-white/10 focus-visible:ring-accent text-white placeholder:text-white/20 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label className="text-white/70 text-xs uppercase tracking-wider font-semibold">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  className="pl-10 pr-10 h-11 bg-muted/50 border-white/10 focus-visible:ring-accent text-white placeholder:text-white/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label className="text-white/70 text-xs uppercase tracking-wider font-semibold">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  className="pl-10 pr-10 h-11 bg-muted/50 border-white/10 focus-visible:ring-accent text-white placeholder:text-white/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

          </div>

          <div className="flex items-start gap-3 mt-6 pt-2">
            <Checkbox
              id="terms"
              required
              className="mt-0.5 border-white/20 data-[state=checked]:bg-accent data-[state=checked]:border-accent shrink-0"
            />
            <Label htmlFor="terms" className="text-xs text-white/60 leading-relaxed cursor-pointer">
              I agree to the{' '}
              <a href="#" className="text-accent hover:text-accent/80 transition-colors">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-accent hover:text-accent/80 transition-colors">
                Privacy Policy
              </a>
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent hover:shadow-[0_0_30px_rgba(30,167,255,0.4)] hover:scale-[1.02] transition-all duration-200 text-white font-semibold rounded-lg h-11 mt-6 border-0 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Creating Account…
              </span>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-white/30 text-xs uppercase font-medium">or</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <p className="text-center text-sm text-white/60">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:text-accent/80 transition-colors font-medium">
            Sign In
          </Link>
        </p>
        
        <div className="flex items-center justify-center gap-1.5 mt-8 text-white/30 text-xs font-medium">
          <Lock className="w-3 h-3" />
          <span>256-bit SSL Encrypted</span>
        </div>
      </motion.div>
    </div>
  );
}
