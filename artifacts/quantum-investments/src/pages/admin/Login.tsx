import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

// @ts-ignore
import logoPath from '@assets/Quantum_Investment_1784716537861.jpeg';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { login } = useAdminAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const ok = await login(email, password);
    setLoading(false);
    if (ok) {
      setLocation('/admin');
    } else {
      setError('Invalid admin credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/10 rounded-full blur-[130px]" />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-[80px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(hsl(var(--accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--accent)) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Security badge */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 bg-primary/15 border border-primary/25 rounded-full px-4 py-1.5">
            <Shield size={13} className="text-accent" />
            <span className="text-xs font-semibold text-accent tracking-wide uppercase">
              Secure Admin Portal
            </span>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-card/40 border border-white/8 shadow-[0_8px_64px_rgba(0,0,0,0.5)] rounded-2xl p-8">
          {/* Logo */}
          <div className="flex items-center gap-3 justify-center mb-7">
            <img src={logoPath} alt="Quantum Investments" className="h-10 w-10 rounded-lg object-cover" />
            <div className="text-left">
              <p className="text-base font-bold text-white leading-tight">QUANTUM</p>
              <p className="text-[10px] font-semibold text-accent tracking-[0.18em] uppercase">
                Investments
              </p>
            </div>
          </div>

          <h1 className="text-xl font-bold text-center text-white mb-1">Admin Sign In</h1>
          <p className="text-muted-foreground text-center text-xs mb-7">
            Access restricted to authorized administrators only
          </p>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-destructive/15 border border-destructive/30 text-red-400 text-xs rounded-lg px-3 py-2.5 mb-5"
            >
              <AlertCircle size={14} className="shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-white/60 text-[10px] uppercase tracking-widest font-semibold">
                Admin Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="email"
                  placeholder="admin@quantuminvestments.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-muted/40 border-white/10 focus-visible:ring-accent text-white placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-white/60 text-[10px] uppercase tracking-widest font-semibold">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 bg-muted/40 border-white/10 focus-visible:ring-accent text-white placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 mt-2 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-lg border-0 hover:shadow-[0_0_30px_rgba(30,167,255,0.4)] hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Authenticating…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield size={15} />
                  Secure Admin Login
                </span>
              )}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-5 p-3 bg-white/3 border border-white/8 rounded-lg">
            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              <span className="text-white/40 font-semibold">Demo:</span>{' '}
              Use <span className="text-accent/80">admin@quantuminvestments.com</span> with any password
            </p>
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-5 text-white/25 text-[10px] font-medium">
            <Lock className="w-3 h-3" />
            <span>256-bit SSL Encrypted · Role-Based Access Control</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
