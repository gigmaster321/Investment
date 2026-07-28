/**
 * Single source of truth for the user's unread notification count.
 *
 * - One poll interval lives here at the app level — not per-sidebar-mount.
 * - The page calls refresh() immediately after mark-read so the badge clears
 *   without waiting for the next tick.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api';
const POLL_MS = 30_000;

interface NotificationCtx {
  unreadCount: number;
  /** Call after any mark-read action so the badge updates immediately. */
  refresh: () => void;
}

const NotificationContext = createContext<NotificationCtx>({
  unreadCount: 0,
  refresh: () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const mountedRef = useRef(true);

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch(`${BASE}/notifications/unread-count`, {
        credentials: 'include',
      });
      if (!res.ok) return;
      const { count } = await res.json();
      if (mountedRef.current) setUnreadCount(count ?? 0);
    } catch {
      // Non-critical — stale badge is fine
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetch_();
    const id = setInterval(fetch_, POLL_MS);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetch_]);

  return (
    <NotificationContext.Provider value={{ unreadCount, refresh: fetch_ }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationCount() {
  return useContext(NotificationContext);
}
