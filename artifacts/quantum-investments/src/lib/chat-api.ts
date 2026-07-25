const BASE = "/api/chat";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any)?.message ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface Conversation {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  unread_count?: number;
  // admin view extras
  user_full_name?: string;
  user_email?: string;
  user_username?: string;
  last_message?: {
    message: string;
    created_at: string;
    sender_type: "user" | "admin";
  } | null;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_type: "user" | "admin";
  sender_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const chatApi = {
  /** User: get or create their conversation */
  getOrCreateConversation(): Promise<Conversation> {
    return apiFetch(`${BASE}/conversations`, { method: "POST" });
  },

  /** User: get their own conversation (null if none yet) */
  getMyConversation(): Promise<Conversation | null> {
    return apiFetch(`${BASE}/conversations`);
  },

  /** Admin: get all conversations */
  getAllConversations(): Promise<Conversation[]> {
    return apiFetch(`${BASE}/conversations`);
  },

  /** Get messages for a conversation */
  getMessages(conversationId: number): Promise<ChatMessage[]> {
    return apiFetch(`${BASE}/conversations/${conversationId}/messages`);
  },

  /** Send a message to a conversation */
  sendMessage(conversationId: number, message: string): Promise<ChatMessage> {
    return apiFetch(`${BASE}/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  },

  /** Mark all messages in a conversation as read */
  markRead(conversationId: number): Promise<{ ok: boolean }> {
    return apiFetch(`${BASE}/conversations/${conversationId}/read`, {
      method: "PATCH",
    });
  },

  /** Get unread badge count */
  getUnreadCount(): Promise<{ count: number }> {
    return apiFetch(`${BASE}/unread-count`);
  },
};

export function formatChatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diffDays === 1) {
    return `Yesterday ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: "short" }) + " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" }) + " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
