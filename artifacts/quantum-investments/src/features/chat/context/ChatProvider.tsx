import type { ReactNode } from 'react';
import { ChatContext } from './ChatContext';
import { useChat } from '../hooks/useChat';

export default function ChatProvider({ children }: { children: ReactNode }) {
  const chat = useChat();
  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>;
}
