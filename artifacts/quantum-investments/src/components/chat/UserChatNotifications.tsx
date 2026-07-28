import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { chatApi } from '@/lib/chat-api';
import { ChatPopup, ChatNotification } from './ChatPopup';
import { useAuth } from '@/contexts/AuthContext';

const POLL_MS = 3000;

export function UserChatNotifications() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);

  const prevCountRef = useRef<number | null>(null);
  const convIdRef = useRef<number | null>(null);
  const maxSeenAdminIdRef = useRef(0);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const poll = useCallback(async () => {
    if (!user) return;
    // Don't show popups when already on the chat page
    if (location === '/dashboard/chat' || location.startsWith('/dashboard/chat/')) return;

    try {
      const { count } = await chatApi.getUnreadCount();

      if (prevCountRef.current === null) {
        prevCountRef.current = count;
        return;
      }

      if (count > prevCountRef.current) {
        // Fetch conversation + last message for preview
        try {
          const conv = await chatApi.getMyConversation();
          if (conv) {
            convIdRef.current = conv.id;
            const messages = await chatApi.getMessages(conv.id);
            const newAdminMsgs = messages.filter(
              (m) => m.sender_type === 'admin' && m.id > maxSeenAdminIdRef.current,
            );
            if (newAdminMsgs.length > 0) {
              const latest = newAdminMsgs[newAdminMsgs.length - 1];
              maxSeenAdminIdRef.current = Math.max(
                maxSeenAdminIdRef.current,
                ...newAdminMsgs.map((m) => m.id),
              );
              const preview =
                latest.message.length > 100
                  ? latest.message.slice(0, 97) + '…'
                  : latest.message;
              setNotifications((prev) => [
                {
                  id: `msg-${latest.id}`,
                  senderName: 'Support Team',
                  senderType: 'admin',
                  preview,
                  navigateTo: '/dashboard/chat',
                },
                ...prev.filter((n) => n.id !== `msg-${latest.id}`),
              ]);
            }
          }
        } catch {
          // fallback: show generic popup
          const notifId = `unread-${Date.now()}`;
          setNotifications((prev) => [
            {
              id: notifId,
              senderName: 'Support Team',
              senderType: 'admin',
              preview: 'You have a new message from support.',
              navigateTo: '/dashboard/chat',
            },
            ...prev,
          ]);
        }
      }

      prevCountRef.current = count;
    } catch {
      // non-fatal
    }
  }, [user, location]);

  useEffect(() => {
    poll();
    const timer = setInterval(poll, POLL_MS);
    return () => clearInterval(timer);
  }, [poll]);

  if (notifications.length === 0) return null;
  return <ChatPopup notifications={notifications} onDismiss={dismiss} />;
}
