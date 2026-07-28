import { User } from 'lucide-react';
import type { ChatConversation } from '../types/chat.types';
import { isImageMessage } from '../types/chat.types';

interface ConvWithMeta extends ChatConversation {
  user_full_name?: string;
  user_email?: string;
  unread_count?: number;
  last_message?: { message: string; created_at: string; sender_type: string } | null;
}

interface Props {
  conversation: ConvWithMeta;
  isSelected: boolean;
  onSelect: () => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ChatConversationItem({ conversation: conv, isSelected, onSelect }: Props) {
  const lastMsg = conv.last_message;
  const preview = lastMsg
    ? isImageMessage(lastMsg.message)
      ? '📷 Image'
      : lastMsg.message.slice(0, 40) + (lastMsg.message.length > 40 ? '…' : '')
    : 'No messages yet';

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        isSelected ? 'bg-primary/10' : 'hover:bg-white/4'
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-white/8 border border-white/10 flex items-center justify-center shrink-0">
        <User size={18} className="text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-white truncate">
            {conv.user_full_name ?? conv.user_email ?? `User #${conv.user_id}`}
          </span>
          {lastMsg && (
            <span className="text-[10px] text-muted-foreground shrink-0">
              {formatTime(lastMsg.created_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground truncate">{preview}</span>
          {(conv.unread_count ?? 0) > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center shrink-0">
              {(conv.unread_count ?? 0) > 99 ? '99+' : conv.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
