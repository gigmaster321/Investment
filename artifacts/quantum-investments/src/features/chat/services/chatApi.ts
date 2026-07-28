import type { ChatConversation, ChatMessage } from '../types/chat.types';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '') + '/api/chat';

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const chatApiService = {
  /** Creates or returns the user's existing conversation. */
  getOrCreate: (): Promise<ChatConversation> =>
    req('/conversations', { method: 'POST' }),

  /** Returns the user's conversation with unread_count, or null. */
  getConversation: (): Promise<(ChatConversation & { unread_count: number }) | null> =>
    req('/conversations'),

  /** All messages for a conversation, oldest first. */
  getMessages: (conversationId: number): Promise<ChatMessage[]> =>
    req(`/conversations/${conversationId}/messages`),

  /** Send a text (or image-encoded) message. */
  sendMessage: (conversationId: number, message: string): Promise<ChatMessage> =>
    req(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),

  /** Mark messages from the opposing side as read. */
  markRead: (conversationId: number): Promise<{ ok: boolean }> =>
    req(`/conversations/${conversationId}/read`, { method: 'PATCH' }),

  /** Unread message count for sidebar badge. */
  getUnreadCount: (): Promise<{ count: number }> =>
    req('/unread-count'),

  /** Admin only: all conversations with user info, unread counts, last message. */
  getAllConversations: (): Promise<AdminConversation[]> =>
    req('/conversations'),
};

export interface AdminConversation {
  id: number;
  user_id: number;
  user_full_name?: string;
  user_email?: string;
  user_username?: string;
  created_at: string;
  updated_at: string;
  unread_count: number;
  last_message?: { message: string; created_at: string; sender_type: string } | null;
}
