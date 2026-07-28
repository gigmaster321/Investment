import { useState, useEffect, useCallback, useRef } from 'react';
import { chatApiService } from '../services/chatApi';
import { IMG_PREFIX } from '../types/chat.types';
import type { ChatConversation, ChatMessage } from '../types/chat.types';

const POLL_INTERVAL = 3_000;
/** How long the "typing" dots are shown after the user sends a message. */
const TYPING_DURATION = 2_200;

export function useChat() {
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevAdminCount = useRef(0);
  const convRef = useRef<ChatConversation | null>(null);

  // ── 1. Get or create conversation on mount ──────────────────────────────────
  useEffect(() => {
    chatApiService
      .getOrCreate()
      .then((conv) => {
        setConversation(conv);
        convRef.current = conv;
      })
      .catch(() => setError('Could not start chat. Please refresh.'))
      .finally(() => setIsLoading(false));
  }, []);

  // ── 2. Fetch messages ────────────────────────────────────────────────────────
  const fetchMessages = useCallback(async () => {
    const conv = convRef.current;
    if (!conv) return;
    try {
      const msgs = await chatApiService.getMessages(conv.id);

      // Detect newly arrived admin messages → show brief typing flash
      const adminCount = msgs.filter((m) => m.sender_type === 'admin').length;
      if (adminCount > prevAdminCount.current && prevAdminCount.current > 0) {
        setShowTyping(true);
        setTimeout(() => setShowTyping(false), 600);
      }
      prevAdminCount.current = adminCount;

      setMessages(msgs);

      // Auto-mark admin messages as read
      const hasUnread = msgs.some((m) => m.sender_type === 'admin' && !m.is_read);
      if (hasUnread) {
        chatApiService.markRead(conv.id).catch(() => {});
      }
    } catch {
      // Silent — stale data is fine
    }
  }, []);

  // ── 3. Start polling once we have a conversation ─────────────────────────────
  useEffect(() => {
    if (!conversation) return;
    convRef.current = conversation;
    fetchMessages();
    const timer = setInterval(fetchMessages, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [conversation, fetchMessages]);

  // ── 4. Send text message ─────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      const conv = convRef.current;
      if (!conv || !text.trim() || isSending) return;

      setIsSending(true);

      // Optimistic insert
      const tempId = -Date.now();
      const optimistic: ChatMessage = {
        id: tempId,
        conversation_id: conv.id,
        sender_type: 'user',
        sender_id: 0,
        message: text.trim(),
        is_read: false,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);

      // Show typing indicator briefly (simulates admin reading + replying)
      if (typingTimer.current) clearTimeout(typingTimer.current);
      setShowTyping(true);
      typingTimer.current = setTimeout(() => setShowTyping(false), TYPING_DURATION);

      try {
        const sent = await chatApiService.sendMessage(conv.id, text.trim());
        setMessages((prev) => prev.map((m) => (m.id === tempId ? sent : m)));
      } catch {
        // Roll back optimistic message on failure
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } finally {
        setIsSending(false);
      }
    },
    [isSending],
  );

  // ── 5. Send image message ─────────────────────────────────────────────────────
  const sendImage = useCallback(
    async (file: File) => {
      const conv = convRef.current;
      if (!conv || isSending) return;

      setIsSending(true);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const encoded = IMG_PREFIX + dataUrl;

        const tempId = -Date.now();
        const optimistic: ChatMessage = {
          id: tempId,
          conversation_id: conv.id,
          sender_type: 'user',
          sender_id: 0,
          message: encoded,
          is_read: false,
          created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimistic]);

        if (typingTimer.current) clearTimeout(typingTimer.current);
        setShowTyping(true);
        typingTimer.current = setTimeout(() => setShowTyping(false), TYPING_DURATION);

        try {
          const sent = await chatApiService.sendMessage(conv.id, encoded);
          setMessages((prev) => prev.map((m) => (m.id === tempId ? sent : m)));
        } catch {
          setMessages((prev) => prev.filter((m) => m.id !== tempId));
        } finally {
          setIsSending(false);
        }
      };
      reader.onerror = () => setIsSending(false);
    },
    [isSending],
  );

  // ── Cleanup ────────────────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, []);

  return { conversation, messages, isLoading, isSending, showTyping, error, sendMessage, sendImage };
}
