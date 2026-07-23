import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useSearch } from 'wouter';
import { motion } from 'framer-motion';
import { Mail, Lock, ShieldCheck, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/auth-api';

// @ts-ignore
import logoPath from '@assets/Quantum_Investment_1784716537861.jpeg';

const RESEND_COOLDOWN = 60; // seconds

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const email = params.get('email') ?? '';

  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [devOtp, setDevOtp] = useState('');

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCooldown = (seconds: number) => {
    setCooldown(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is missing. Please go back and register again.');
      return;
    }
    setError('');
    setIsVerifying(true);

    try {
      await authApi.verifyEmail(email, code.trim());
      setSuccess(true);
      setTimeout(() => setLocation('/login'), 2500);
    } catch (err: any) {
      setError(
        err?.message ||
          (err?.error === 'OTP_EXPIRED'
            ? 'This code has expired. Please request a new one.'
            : 'Invalid or expired code. Please try again.'),
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0 || isResending) return;
    setError('');
    setDevOtp('');
    setIsResending(true);

    try {
      const result = await authApi.resendOtp(email);
      if (result.devOtp) {
        setDevOtp(result.devOtp);
      }
      startCooldown(RESEND_COOLDOWN);
    } catch (err: any) {
      if (err?.error === 'COOLDOWN' && err?.retryAfterSeconds) {
        startCooldown(err.retryAfterSeconds);
        setError(`Please wait ${err.retryAfterSeconds}s before requesting a new code.`);
      } else {
        setError(err?.message || 'Failed to resend code. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  };

  // Mask email for display: j***@example.com
  const maskedEmail = email
    ? email.replace(/^(.{1,2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.min(b.length, 6)) + c)
    : '';

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center relative overflow-hidden p-4 md:p-6">
      {/* Radial Background Glow */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] md:w-[800px] md:h-[800px] bg-primary/15 rounded-full blur-[100px] md:blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[440px] backdrop-blur-xl bg-card/40 border border-white/10 shadow-2xl rounded-2xl p-6 md:p-8"
      >
        <Link href="/" className="block w-fit mx-auto mb-6">
          <img
            src={logoPath}
            alt="Quantum Investments"
            className="h-12 w-auto object-contain rounded-md mx-auto"
          />
        </Link>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-2xl bg-accent/15 border border-accent/25 flex items-center justify-center">
            {success ? (
              <CheckCircle2 className="w-7 h-7 text-green-400" />
            ) : (
              <Mail className="w-7 h-7 text-accent" />
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-white mb-2">
          {success ? 'Email Verified!' : 'Verify Your Email'}
        </h1>

        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <p className="text-muted-foreground text-sm mb-6">
              Your email has been verified. Redirecting you to login…
            </p>
            <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin mx-auto" />
          </motion.div>
        ) : (
          <>
            <p className="text-muted-foreground text-center text-sm mb-8">
              We sent a 6-digit code to{' '}
              <span className="text-white/70 font-medium">{maskedEmail || 'your email'}</span>.
              Enter it below to verify your account.
            </p>

            <form onSubmit={handleVerify} className="space-y-5">
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

              {/* Dev OTP hint */}
              {devOtp && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 bg-accent/10 border border-accent/25 text-accent text-xs rounded-lg px-3 py-2.5"
                >
                  <ShieldCheck size={14} className="shrink-0" />
                  <span>
                    <span className="font-semibold">Dev mode:</span> Your code is{' '}
                    <span
                      className="font-bold tracking-widest cursor-pointer underline decoration-dotted"
                      onClick={() => setCode(devOtp)}
                    >
                      {devOtp}
                    </span>{' '}
                    (click to fill)
                  </span>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label className="text-white/70 text-xs uppercase tracking-wider font-semibold">
                  Verification Code
                </Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    placeholder="000000"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-10 h-11 bg-muted/50 border-white/10 focus-visible:ring-accent text-white placeholder:text-white/20 transition-all text-center text-lg tracking-[0.4em] font-mono"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isVerifying || code.length !== 6}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary hover:to-accent hover:shadow-[0_0_30px_rgba(30,167,255,0.4)] hover:scale-[1.02] transition-all duration-200 text-white font-semibold rounded-lg h-11 mt-2 border-0 disabled:opacity-60 disabled:pointer-events-none"
              >
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Verifying…
                  </span>
                ) : (
                  'Verify Email'
                )}
              </Button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="h-px bg-white/10 flex-1" />
              <span className="text-white/30 text-xs uppercase font-medium">or</span>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || isResending || !email}
              className="w-full h-10 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white/90 text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
              {isResending
                ? 'Sending…'
                : cooldown > 0
                  ? `Resend OTP (${cooldown}s)`
                  : 'Resend OTP'}
            </button>

            <p className="text-center text-sm text-white/60 mt-6">
              Wrong email?{' '}
              <Link href="/register" className="text-accent hover:text-accent/80 transition-colors font-medium">
                Register again
              </Link>
            </p>
          </>
        )}

        <div className="flex items-center justify-center gap-1.5 mt-8 text-white/30 text-xs font-medium">
          <Lock className="w-3 h-3" />
          <span>256-bit SSL Encrypted</span>
        </div>
      </motion.div>
    </div>
  );
}
