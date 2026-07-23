import { createContext, useContext, useState, ReactNode } from 'react';

/**
 * Placeholder admin auth context.
 * Replace `isAuthenticated` logic with real JWT / session checks
 * once the backend auth system is in place.
 *
 * Role-based access is wired up here — add roles such as
 * 'super_admin' | 'support' | 'finance' to the AdminRole type
 * and check them in AdminGuard.
 */

export type AdminRole = 'super_admin' | 'admin';

interface AdminUser {
  email: string;
  name: string;
  role: AdminRole;
  avatar?: string;
}

interface AdminAuthContextValue {
  isAuthenticated: boolean;
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

// Demo credentials — swap out for real API call when backend is ready
const DEMO_ADMIN: AdminUser = {
  email: 'admin@quantuminvestments.com',
  name: 'Super Admin',
  role: 'super_admin',
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(() => {
    // Persist auth across page refreshes (placeholder only)
    const stored = sessionStorage.getItem('admin_auth');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email: string, _password: string): Promise<boolean> => {
    // TODO: replace with real API call → POST /api/admin/auth/login
    if (email === DEMO_ADMIN.email) {
      setUser(DEMO_ADMIN);
      sessionStorage.setItem('admin_auth', JSON.stringify(DEMO_ADMIN));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('admin_auth');
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated: !!user, user, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
