import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Protects admin routes.
 * - Unauthenticated visitors → redirect to /admin/login
 * - Authenticated non-admin users → "Unauthorized Access" screen
 * - Admin users → render children
 */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated: isAdminAuthenticated, isLoading: adminLoading } =
    useAdminAuth();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const isLoading = adminLoading || authLoading;

  // Redirect unauthenticated visitors to admin login
  useEffect(() => {
    if (!isLoading && !isAdminAuthenticated && !authUser) {
      setLocation('/admin/login');
    }
  }, [isLoading, isAdminAuthenticated, authUser, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  // Authenticated regular user trying to access admin routes
  if (authUser && authUser.role !== 'admin') {
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
          <h1 className="text-2xl font-bold text-white">Unauthorized Access</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You do not have permission to access the admin panel. This area is
            restricted to authorized administrators only.
          </p>
          <button
            onClick={() => setLocation('/dashboard')}
            className="mt-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm hover:shadow-[0_0_25px_rgba(30,167,255,0.35)] hover:scale-[1.02] transition-all duration-200"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  // Not authenticated as admin → null while redirect fires
  if (!isAdminAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
