import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Guards routes that require authentication AND a verified email.
 *
 * - Not authenticated → redirect to /login
 * - Authenticated but email not verified → redirect to /verify-email
 * - Authenticated and verified → render children
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }

    if (user && !user.email_verified) {
      setLocation(`/verify-email?email=${encodeURIComponent(user.email)}`);
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || (user && !user.email_verified)) {
    return null;
  }

  return <>{children}</>;
}
