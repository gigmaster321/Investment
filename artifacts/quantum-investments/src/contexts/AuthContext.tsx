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
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (data: {
    full_name: string;
    username: string;
    email: string;
    phone?: string;
    password: string;
  }) => Promise<AuthUser>;
  logout: () => Promise<void>;
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

  const login = async (email: string, password: string): Promise<AuthUser> => {
    const { user: u } = await authApi.login(email, password);
    setUser(u);
    return u;
  };

  const register = async (
    data: Parameters<typeof authApi.register>[0],
  ): Promise<AuthUser> => {
    const { user: u } = await authApi.register(data);
    setUser(u);
    return u;
  };

  const logout = async (): Promise<void> => {
    await authApi.logout().catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}
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
