import { useState, useEffect, useCallback, useRef } from 'react';
import { chatApiService } from '../services/chatApi';
import type { AdminConversation } from '../services/chatApi';
import { IMG_PREFIX } from '../types/chat.types';
import type { ChatMessage } from '../types/chat.types';

export type { AdminConversation };

const POLL_INTERVAL = 3_000;

export function useAdminChat() {
  const [conversations, setConversations] = useState<AdminConversation[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);

  const selectedIdRef = useRef<number | null>(null);

  // ── Fetch all conversations ─────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    try {
      const data = await chatApiService.getAllConversations();
      setConversations(data);
      const total = data.reduce((sum, c) => sum + (c.unread_count ?? 0), 0);
      setUnreadTotal(total);
    } catch {
      // silent
    }
  }, []);

  // ── Fetch messages for selected conversation ────────────────────────────────
  const fetchMessages = useCallback(async (id: number) => {
    try {
      const msgs = await chatApiService.getMessages(id);
      setMessages(msgs);
    } catch {
      // silent
    }
  }, []);

  // ── Select a conversation ───────────────────────────────────────────────────
  const selectConversation = useCallback(
    async (id: number) => {
      if (selectedIdRef.current === id) return;
      setSelectedId(id);
      selectedIdRef.current = id;
      setMessages([]);
      setLoadingMessages(true);
      try {
        const msgs = await chatApiService.getMessages(id);
        setMessages(msgs);
        // Mark user messages as read
        await chatApiService.markRead(id).catch(() => {});
        // Refresh list to clear badge
        fetchConversations();
      } finally {
        setLoadingMessages(false);
      }
    },
    [fetchConversations],
  );

  // ── Poll conversations ──────────────────────────────────────────────────────
  useEffect(() => {
    fetchConversations();
    const t = setInterval(fetchConversations, POLL_INTERVAL);
    return () => clearInterval(t);
  }, [fetchConversations]);

  // ── Poll messages for selected conversation ─────────────────────────────────
  useEffect(() => {
    if (!selectedId) return;
    const t = setInterval(async () => {
      await fetchMessages(selectedId);
      await chatApiService.markRead(selectedId).catch(() => {});
    }, POLL_INTERVAL);
    return () => clearInterval(t);
  }, [selectedId, fetchMessages]);

  // ── Send text ───────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      const id = selectedIdRef.current;
      if (!id || !text.trim() || isSending) return;
      setIsSending(true);

      const tempId = -Date.now();
      const optimistic: ChatMessage = {
        id: tempId,
        conversation_id: id,
        sender_type: 'admin',
        sender_id: 0,
        message: text.trim(),
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);

      try {
        const sent = await chatApiService.sendMessage(id, text.trim());
        setMessages((prev) => prev.map((m) => (m.id === tempId ? sent : m)));
        fetchConversations();
      } catch {
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } finally {
        setIsSending(false);
      }
    },
    [isSending, fetchConversations],
  );

  // ── Send image ──────────────────────────────────────────────────────────────
  const sendImage = useCallback(
    async (file: File) => {
      const id = selectedIdRef.current;
      if (!id || isSending) return;
      setIsSending(true);

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const encoded = IMG_PREFIX + (reader.result as string);
        const tempId = -Date.now();
        const optimistic: ChatMessage = {
          id: tempId,
          conversation_id: id,
          sender_type: 'admin',
          sender_id: 0,
          message: encoded,
          is_read: false,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimistic]);
        try {
          const sent = await chatApiService.sendMessage(id, encoded);
          setMessages((prev) => prev.map((m) => (m.id === tempId ? sent : m)));
          fetchConversations();
        } catch {
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
        } finally {
          setIsSending(false);
        }
      };
      reader.onerror = () => setIsSending(false);
    },
    [isSending, fetchConversations],
  );

  return {
    conversations,
    selectedId,
    messages,
    loadingMessages,
    isSending,
    unreadTotal,
    selectConversation,
    sendMessage,
    sendImage,
  };
}
