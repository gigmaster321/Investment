import { CheckCheck, Check } from 'lucide-react';
import { isImageMessage, getImageSrc } from '../types/chat.types';
import type { ChatMessage } from '../types/chat.types';

interface Props {
  message: ChatMessage;
  /** True for the user's own messages (right-aligned). */
  isMine: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function ChatBubble({ message, isMine }: Props) {
  const isImage = isImageMessage(message.message);

  return (
    <div className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[72%] sm:max-w-[60%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        {/* Bubble */}
        <div
          className={`
            relative rounded-2xl px-3 py-2 text-sm leading-relaxed break-words
            ${isMine
              ? 'bg-primary text-white rounded-br-sm shadow-[0_2px_12px_rgba(30,100,255,0.25)]'
              : 'bg-[hsl(221,55%,20%)] text-white/90 rounded-bl-sm border border-white/6 shadow-sm'
            }
            ${isImage ? 'p-1.5' : ''}
          `}
        >
          {isImage ? (
            <img
              src={getImageSrc(message.message)}
              alt="Shared image"
              className="max-w-full rounded-xl max-h-64 object-contain"
            />
          ) : (
            <span>{message.message}</span>
          )}
        </div>

        {/* Timestamp + read receipt */}
        <div className={`flex items-center gap-1 px-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] text-muted-foreground/70 leading-none">
            {formatTime(message.created_at)}
          </span>
          {isMine && (
            message.is_read
              ? <CheckCheck size={13} className="text-accent shrink-0" />
              : <Check size={13} className="text-muted-foreground/50 shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
}
