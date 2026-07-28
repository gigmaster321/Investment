import { useState, useCallback } from 'react';
import { chatApiService } from '../services/chatApi';
import type { ChatConversation } from '../types/chat.types';

/** Fetches and manages a list of conversations (admin use). */
export default function useChatConversations() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await chatApiService.getConversation();
      setConversations(data ? [data] : []);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { conversations, isLoading, fetch };
}
