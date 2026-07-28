import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { chatApi } from '@/lib/chat-api';
import { ChatPopup, ChatNotification } from './ChatPopup';

const POLL_MS = 3000;

export function AdminChatNotifications() {
  const [location] = useLocation();
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);

  const prevUnreadMapRef = useRef<Record<number, number>>({});
  const initDoneRef = useRef(false);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const poll = useCallback(async () => {
    // Don't show popups when already on the admin chat page
    if (location === '/wp-admin/chat' || location.startsWith('/wp-admin/chat/')) return;

    try {
      const convs = await chatApi.getAllConversations();

      if (!initDoneRef.current) {
        for (const conv of convs) {
          prevUnreadMapRef.current[conv.id] = conv.unread_count ?? 0;
        }
        initDoneRef.current = true;
        return;
      }

      for (const conv of convs) {
        const prev = prevUnreadMapRef.current[conv.id] ?? 0;
        const curr = conv.unread_count ?? 0;
        if (curr > prev && conv.last_message && conv.last_message.sender_type === 'user') {
          const displayName =
            conv.user_full_name ?? conv.user_username ?? `User #${conv.user_id}`;
          const preview =
            conv.last_message.message.length > 100
              ? conv.last_message.message.slice(0, 97) + '…'
              : conv.last_message.message;
          const notifId = `conv-${conv.id}-${Date.now()}`;
          setNotifications((prev) => [
            {
              id: notifId,
              senderName: displayName,
              senderType: 'user',
              preview,
              navigateTo: '/wp-admin/chat',
            },
            ...prev.slice(0, 2), // keep max 3
          ]);
          break; // one popup per poll cycle
        }
        prevUnreadMapRef.current[conv.id] = curr;
      }
    } catch {
      // non-fatal
    }
  }, [location]);

  useEffect(() => {
    poll();
    const timer = setInterval(poll, POLL_MS);
    return () => clearInterval(timer);
  }, [poll]);

  if (notifications.length === 0) return null;
  return <ChatPopup notifications={notifications} onDismiss={dismiss} />;
}
