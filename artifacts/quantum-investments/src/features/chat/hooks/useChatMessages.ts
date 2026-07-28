import { useState, useCallback } from 'react';
import { chatApiService } from '../services/chatApi';
import type { ChatMessage } from '../types/chat.types';

/** Standalone hook for fetching messages for a given conversation. */
export default function useChatMessages(conversationId: number | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!conversationId) return;
    setIsLoading(true);
    try {
      const msgs = await chatApiService.getMessages(conversationId);
      setMessages(msgs);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  return { messages, setMessages, isLoading, fetch };
}
