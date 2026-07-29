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
  /** The DB user id of the logged-in admin, or null when not authenticated. */
  adminUserId: number | null;
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
  const [adminUserId, setAdminUserId] = useState<number | null>(null);

  // Restore admin session on mount
  useEffect(() => {
    apiFetch('/admin-me')
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          setIsAuthenticated(true);
          setAdminUserId(typeof data.userId === 'number' ? data.userId : null);
        }
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
        // Fetch the admin's user id now that the session is established
        try {
          const me = await apiFetch('/admin-me');
          if (me.ok) {
            const data = await me.json().catch(() => ({}));
            setAdminUserId(typeof data.userId === 'number' ? data.userId : null);
          }
        } catch {
          // non-fatal — userId stays null
        }
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
    setAdminUserId(null);
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, isLoading, adminUserId, login, logout }}>
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
