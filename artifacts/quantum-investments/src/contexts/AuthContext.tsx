import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { authApi, AuthUser } from '@/lib/auth-api';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True while the initial session check is in flight. */
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<AuthUser>;
  /**
   * Register a new account. Account is immediately active — user can log in right away.
   */
  register: (data: {
    full_name: string;
    username: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<{ success: boolean; userId: number }>;
  logout: () => Promise<void>;
  /** Re-fetch the current user from the server (e.g. after balance update). */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    authApi
      .me()
      .then(({ user: u }) => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (email: string, password: string, rememberMe = false): Promise<AuthUser> => {
    const { user: u } = await authApi.login(email, password, rememberMe);
    setUser(u);
    return u;
  };

  const register = async (
    data: Parameters<typeof authApi.register>[0],
  ): Promise<{ success: boolean; userId: number }> => {
    return authApi.register(data);
  };

  const logout = async (): Promise<void> => {
    await authApi.logout().catch(() => {});
    setUser(null);
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const { user: u } = await authApi.me();
      setUser(u);
    } catch {
      // silently ignore — stale data is better than crashing
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
