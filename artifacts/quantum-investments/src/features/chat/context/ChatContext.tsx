import { createContext, useContext } from 'react';
import type { ChatConversation, ChatMessage } from '../types/chat.types';

export interface ChatContextValue {
  conversation: ChatConversation | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  showTyping: boolean;
  error: string | null;
  sendMessage: (text: string) => void;
  sendImage: (file: File) => void;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
}
