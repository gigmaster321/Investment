import ChatConversationItem from './ChatConversationItem';
import type { ChatConversation } from '../types/chat.types';

interface Props {
  conversations: (ChatConversation & {
    user_full_name?: string;
    user_email?: string;
    unread_count?: number;
    last_message?: { message: string; created_at: string; sender_type: string } | null;
  })[];
  selectedId?: number | null;
  onSelect: (id: number) => void;
}

export default function ChatConversationList({ conversations, selectedId, onSelect }: Props) {
  return (
    <div className="flex flex-col divide-y divide-white/5">
      {conversations.map((conv) => (
        <ChatConversationItem
          key={conv.id}
          conversation={conv}
          isSelected={conv.id === selectedId}
          onSelect={() => onSelect(conv.id)}
        />
      ))}
    </div>
  );
}
