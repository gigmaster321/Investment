import { useLocation } from 'wouter';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Protects admin routes.
 * Redirects unauthenticated visitors to /admin/login.
 * Extend with role checks once role-based access is required:
 *   if (requiredRole && user?.role !== requiredRole) → show forbidden screen
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center gap-6 p-6">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-destructive/10 rounded-full blur-[120px]" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 flex flex-col items-center gap-4 text-center max-w-sm"
        >
          <div className="w-16 h-16 rounded-2xl bg-destructive/20 border border-destructive/30 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access Required</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            This area is restricted to authorized administrators only. Please sign in with your admin credentials to continue.
          </p>
          <button
            onClick={() => setLocation('/admin/login')}
            className="mt-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:shadow-[0_0_25px_rgba(30,167,255,0.35)] hover:scale-[1.02] transition-all duration-200"
          >
            Go to Admin Login
          </button>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
