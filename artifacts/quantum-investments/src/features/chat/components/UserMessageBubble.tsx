/**
 * UserMessageBubble — renders a message whose sender_type is 'user'.
 *
 * isMine=false  → admin is reading a customer message  (left-aligned, neutral gray)
 * isMine=true   → customer is reading their own message (right-aligned, blue)
 *
 * The component always knows it is a user/customer message; the caller
 * (ChatMessageList) has already selected this component by checking sender_type.
 */

import { useState } from 'react';
import { User, CheckCheck, Check, ZoomIn, X } from 'lucide-react';
import { isImageMessage, getImageSrc } from '../types/chat.types';
import type { ChatMessage } from '../types/chat.types';

interface Props {
  message: ChatMessage;
  /** True when the customer is viewing their own outbound message. */
  isMine: boolean;
  isGroupStart: boolean;
  isGroupEnd: boolean;
  /**
   * Initials to display in the customer avatar circle.
   * Only visible when isMine=false (admin side).
   */
  customerInitials?: string;
  /**
   * Full display name shown above the first bubble of a run.
   * Only visible when isMine=false (admin side).
   */
  customerName?: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function bubbleRadius(isMine: boolean, isGroupStart: boolean, isGroupEnd: boolean): string {
  const base = 'rounded-2xl';
  if (isMine) {
    return [base, !isGroupStart && 'rounded-tr-[5px]', !isGroupEnd && 'rounded-br-[5px]']
      .filter(Boolean).join(' ');
  }
  return [base, !isGroupStart && 'rounded-tl-[5px]', !isGroupEnd && 'rounded-bl-[5px]']
    .filter(Boolean).join(' ');
}

export default function UserMessageBubble({
  message, isMine, isGroupStart, isGroupEnd, customerInitials, customerName,
}: Props) {
  const isImage = isImageMessage(message.message);
  const [lightbox, setLightbox] = useState(false);
  const br = bubbleRadius(isMine, isGroupStart, isGroupEnd);

  return (
    <>
      <div className={`flex w-full items-end gap-2 ${isMine ? 'justify-end pl-10 sm:pl-20' : 'justify-start pr-10 sm:pr-20'}`}>

        {/* Customer avatar — left side, last bubble of a run only */}
        {!isMine && (
          <div className="shrink-0 w-7 h-7 mb-0.5">
            {isGroupEnd ? (
              <div className="w-7 h-7 rounded-full bg-zinc-700/70 border border-white/15 flex items-center justify-center shadow-sm">
                {customerInitials ? (
                  <span className="text-[10px] font-bold text-white/75 leading-none">
                    {customerInitials.slice(0, 2).toUpperCase()}
                  </span>
                ) : (
                  <User size={12} className="text-white/60" />
                )}
              </div>
            ) : null}
          </div>
        )}

        <div className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${isMine ? 'items-end' : 'items-start'}`}>

          {/* Customer name label — above the first bubble in a run, admin view only */}
          {!isMine && isGroupStart && customerName && (
            <div className="flex items-center gap-1 mb-1 ml-0.5">
              <User size={11} className="text-white/35 shrink-0" />
              <span className="text-[11px] font-semibold text-white/45 leading-none">
                {customerName}
              </span>
            </div>
          )}

          {/* Bubble */}
          <div className={[
            'relative text-sm leading-relaxed break-words',
            br,
            isMine
              // Customer's own outbound message: standard primary blue
              ? 'bg-primary text-white shadow-[0_2px_16px_rgba(30,100,255,0.22)]'
              // Customer message visible to admin: neutral mid-gray
              // — clearly distinct from AdminMessageBubble's navy-blue tint
              : 'bg-[hsl(220,8%,23%)] text-white/88 border border-white/[0.08] shadow-sm',
            isImage ? 'p-1.5 overflow-hidden' : 'px-3.5 py-2.5',
          ].join(' ')}>
            {isImage ? (
              <div
                role="button" tabIndex={0} aria-label="View full image"
                onClick={() => setLightbox(true)}
                onKeyDown={(e) => e.key === 'Enter' && setLightbox(true)}
                className="relative cursor-zoom-in group"
              >
                <img
                  src={getImageSrc(message.message)} alt="Shared image"
                  loading="lazy" decoding="async"
                  className="max-w-full rounded-xl max-h-56 object-contain block"
                />
                <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/22 transition-colors duration-150 flex items-center justify-center">
                  <ZoomIn size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 drop-shadow" />
                </div>
              </div>
            ) : (
              <span className="whitespace-pre-wrap">{message.message}</span>
            )}
          </div>

          {/* Timestamp + read receipt under every message */}
          <div className={`flex items-center gap-1 px-0.5 mt-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="text-[10px] text-muted-foreground/45 leading-none tabular-nums">
              {formatTime(message.created_at)}
            </span>
            {isMine && (
              message.is_read
                ? <CheckCheck size={12} className="text-accent shrink-0" />
                : <Check size={12} className="text-muted-foreground/40 shrink-0" />
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && isImage && (
        <div
          className="fixed inset-0 z-50 bg-black/88 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            onClick={() => setLightbox(false)} aria-label="Close image"
          >
            <X size={18} />
          </button>
          <img
            src={getImageSrc(message.message)} alt="Full size"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
