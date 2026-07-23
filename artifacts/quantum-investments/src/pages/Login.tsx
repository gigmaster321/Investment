import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

// @ts-ignore
import logoPath from '@assets/Quantum_Investment_1784716537861.jpeg';

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      setLocation('/dashboard');
    } catch (err: any) {
      setError(
        err?.message ||
          (err?.error === 'ACCOUNT_INACTIVE'
            ? 'Your account has been suspended. Please contact support.'
            : 'Invalid email or password. Please try again.'),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center relative overflow-hidden p-4 md:p-6">
      {/* Radial Background Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-primary/15 rounded-full blur-[100px] md:blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[440px] backdrop-blur-xl bg-card/40 border border-white/10 shadow-2xl rounded-2xl p-6 md:p-8"
      >
        <Link href="/" className="block w-fit mx-auto mb-6">
          <img
            src={logoPath}
            alt="Quantum Investments"
            className="h-12 w-auto object-contain rounded-md mx-auto"
          />
        </Link>

        <h1 className="text-2xl font-bold text-center text-white mb-2">Welcome Back</h1>
        <p className="text-muted-foreground text-center text-sm mb-8">
          Sign in to your investment account
        </p>

        <form onSubmit={handleSignIn} className="space-y-5">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-destructive/15 border border-destructive/30 text-red-400 text-xs rounded-lg px-3 py-2.5"
            >
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <Label className="text-white/70 text-xs uppercase tracking-wider font-semibold">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 bg-muted/50 border-white/10 focus-visible:ring-accent text-white placeholder:text-white/20 transition-all"
              />
            </div>
          </div>

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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                className="border-white/20 data-[state=checked]:bg-accent data-[state=checked]:border-accent"
              />
              <Label htmlFor="remember" className="text-xs text-white/60 cursor-pointer">
                Remember Me
              </Label>
            </div>
            <a href="#" className="text-xs text-accent hover:text-accent/80 transition-colors">
              Forgot Password?
            </a>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent hover:shadow-[0_0_30px_rgba(30,167,255,0.4)] hover:scale-[1.02] transition-all duration-200 text-white font-semibold rounded-lg h-11 mt-2 border-0 disabled:opacity-60 disabled:pointer-events-none"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing In…
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        <div className="flex items-center gap-4 my-6">
          <div className="h-px bg-white/10 flex-1" />
          <span className="text-white/30 text-xs uppercase font-medium">or</span>
          <div className="h-px bg-white/10 flex-1" />
        </div>

        <p className="text-center text-sm text-white/60">
          Don't have an account?{' '}
          <Link href="/register" className="text-accent hover:text-accent/80 transition-colors font-medium">
            Create one
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
