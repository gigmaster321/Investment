import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface AdminAuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

const ADMIN_API = '/api/auth';

async function apiFetch(path: string, options?: RequestInit) {
  return fetch(`${ADMIN_API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Restore admin session on mount
  useEffect(() => {
    apiFetch('/admin-me')
      .then((res) => {
        if (res.ok) setIsAuthenticated(true);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (password: string): Promise<boolean> => {
    try {
      const res = await apiFetch('/admin-login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    await apiFetch('/admin-logout', { method: 'POST' }).catch(() => {});
    setIsAuthenticated(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
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
