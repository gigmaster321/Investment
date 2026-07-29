import { useState } from 'react';
import { CheckCheck, Check, X, ZoomIn, ShieldCheck, User } from 'lucide-react';
import { isImageMessage, getImageSrc } from '../types/chat.types';
import type { ChatMessage } from '../types/chat.types';

interface Props {
  message: ChatMessage;
  /** True when this message is from the viewing party (right-aligned). */
  isMine: boolean;
  /** First message in a consecutive run from the same sender. */
  isGroupStart: boolean;
  /** Last message in a consecutive run from the same sender. */
  isGroupEnd: boolean;
  /** Initials shown in the incoming-side avatar circle. */
  avatarLabel?: string;
  /** Full name/label shown above the first message of an incoming group. */
  senderLabel?: string;
  /** When true the incoming sender is the support team (ShieldCheck icon). */
  isSupport?: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function ChatBubble({
  message,
  isMine,
  isGroupStart,
  isGroupEnd,
  avatarLabel,
  senderLabel,
  isSupport = false,
}: Props) {
  const isImage = isImageMessage(message.message);
  const [lightbox, setLightbox] = useState(false);

  // Tailored corner rounding: full roundness except the "inner" corner for
  // grouped messages – matches the WhatsApp / iMessage visual pattern.
  const br = isMine
    ? [
        'rounded-2xl',
        !isGroupStart && 'rounded-tr-[5px]',
        !isGroupEnd  && 'rounded-br-[5px]',
      ]
    : [
        'rounded-2xl',
        !isGroupStart && 'rounded-tl-[5px]',
        !isGroupEnd  && 'rounded-bl-[5px]',
      ];
  const bubbleRadius = br.filter(Boolean).join(' ');

  return (
    <>
      <div
        className={`flex w-full items-end gap-2 ${
          isMine ? 'justify-end pl-10 sm:pl-20' : 'justify-start pr-10 sm:pr-20'
        }`}
      >
        {/* Incoming avatar — only visible on the last bubble of a group */}
        {!isMine && (
          <div className="shrink-0 w-7 h-7 mb-0.5">
            {isGroupEnd ? (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-zinc-600/60 to-zinc-700/60 border border-white/15 flex items-center justify-center shadow-sm">
                {avatarLabel ? (
                  <span className="text-[10px] font-bold text-white/80 leading-none">
                    {avatarLabel.slice(0, 2).toUpperCase()}
                  </span>
                ) : isSupport ? (
                  <ShieldCheck size={13} className="text-accent" />
                ) : (
                  <User size={12} className="text-white/70" />
                )}
              </div>
            ) : null}
          </div>
        )}

        <div
          className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${
            isMine ? 'items-end' : 'items-start'
          }`}
        >
          {/* Sender name label — only on the first bubble of an incoming group */}
          {!isMine && isGroupStart && senderLabel && (
            <div className="flex items-center gap-1 mb-1 ml-0.5">
              {isSupport ? (
                <ShieldCheck size={11} className="text-accent/70 shrink-0" />
              ) : (
                <User size={11} className="text-white/40 shrink-0" />
              )}
              <span className="text-[11px] font-semibold text-white/60 leading-none">
                {senderLabel}
              </span>
            </div>
          )}

          {/* Message bubble */}
          <div
            className={[
              'relative text-sm leading-relaxed break-words',
              bubbleRadius,
              isMine
                ? 'bg-primary text-white shadow-[0_2px_16px_rgba(30,100,255,0.22)]'
                : 'bg-[hsl(220,12%,20%)] text-white/90 border border-white/[0.09] shadow-sm',
              isImage ? 'p-1.5 overflow-hidden' : 'px-3.5 py-2.5',
            ].join(' ')}
          >
            {isImage ? (
              <div
                role="button"
                tabIndex={0}
                aria-label="View full image"
                onClick={() => setLightbox(true)}
                onKeyDown={(e) => e.key === 'Enter' && setLightbox(true)}
                className="relative cursor-zoom-in group"
              >
                <img
                  src={getImageSrc(message.message)}
                  alt="Shared image"
                  loading="lazy"
                  decoding="async"
                  className="max-w-full rounded-xl max-h-56 object-contain block"
                />
                <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/22 transition-colors duration-150 flex items-center justify-center">
                  <ZoomIn
                    size={18}
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 drop-shadow"
                  />
                </div>
              </div>
            ) : (
              <span className="whitespace-pre-wrap">{message.message}</span>
            )}
          </div>

          {/* Timestamp + read receipt — shown under every message */}
          <div
            className={`flex items-center gap-1 px-0.5 mt-1 ${
              isMine ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <span className="text-[10px] text-muted-foreground/45 leading-none tabular-nums">
              {formatTime(message.created_at)}
            </span>
            {isMine &&
              (message.is_read ? (
                <CheckCheck size={12} className="text-accent shrink-0" />
              ) : (
                <Check size={12} className="text-muted-foreground/40 shrink-0" />
              ))}
          </div>
        </div>
      </div>

      {/* Full-screen image lightbox */}
      {lightbox && isImage && (
        <div
          className="fixed inset-0 z-50 bg-black/88 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={() => setLightbox(false)}
            aria-label="Close image"
          >
            <X size={18} />
          </button>
          <img
            src={getImageSrc(message.message)}
            alt="Full size"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
