import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { authApi, AuthUser } from '@/lib/auth-api';

export type AdminRole = 'super_admin' | 'admin';

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: AdminRole;
}

interface AdminAuthContextValue {
  isAuthenticated: boolean;
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function toAdminUser(apiUser: AuthUser): AdminUser {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.full_name,
    role: 'admin',
  };
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore admin session on mount
  useEffect(() => {
    authApi
      .me()
      .then(({ user: apiUser }) => {
        if (apiUser.role === 'admin') {
          setUser(toAdminUser(apiUser));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { user: apiUser } = await authApi.login(email, password);
      if (apiUser.role !== 'admin') {
        // Signed in but not an admin — log them back out
        await authApi.logout().catch(() => {});
        return false;
      }
      setUser(toAdminUser(apiUser));
      return true;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await authApi.logout().catch(() => {});
    setUser(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated: !!user, user, isLoading, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx)
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
