/**
 * AdminMessageBubble — renders a message whose sender_type is 'admin'.
 *
 * isMine=false  → customer is reading a support reply  (left-aligned, branded)
 * isMine=true   → admin is reading their own message   (right-aligned, blue)
 *
 * The component always knows it is an admin message; it never needs a runtime
 * check for "who sent this" — that decision is made one level up in
 * ChatMessageList before this component is chosen.
 */

import { useState } from 'react';
import { ShieldCheck, CheckCheck, Check, ZoomIn, X } from 'lucide-react';
import { isImageMessage, getImageSrc } from '../types/chat.types';
import type { ChatMessage } from '../types/chat.types';

interface Props {
  message: ChatMessage;
  /** True when the admin is viewing their own outbound message. */
  isMine: boolean;
  isGroupStart: boolean;
  isGroupEnd: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// Corner radii follow the WhatsApp/iMessage "inner corner flattens in a run" pattern.
function bubbleRadius(isMine: boolean, isGroupStart: boolean, isGroupEnd: boolean): string {
  const base = 'rounded-2xl';
  if (isMine) {
    return [base, !isGroupStart && 'rounded-tr-[5px]', !isGroupEnd && 'rounded-br-[5px]']
      .filter(Boolean).join(' ');
  }
  return [base, !isGroupStart && 'rounded-tl-[5px]', !isGroupEnd && 'rounded-bl-[5px]']
    .filter(Boolean).join(' ');
}

export default function AdminMessageBubble({ message, isMine, isGroupStart, isGroupEnd }: Props) {
  const isImage = isImageMessage(message.message);
  const [lightbox, setLightbox] = useState(false);
  const br = bubbleRadius(isMine, isGroupStart, isGroupEnd);

  return (
    <>
      <div className={`flex w-full items-end gap-2 ${isMine ? 'justify-end pl-10 sm:pl-20' : 'justify-start pr-10 sm:pr-20'}`}>

        {/* Avatar — left side, shown only on the last bubble of a run */}
        {!isMine && (
          <div className="shrink-0 w-7 h-7 mb-0.5">
            {isGroupEnd ? (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 border border-primary/40 flex items-center justify-center shadow-sm">
                <ShieldCheck size={13} className="text-accent" />
              </div>
            ) : null}
          </div>
        )}

        <div className={`flex flex-col max-w-[75%] sm:max-w-[65%] ${isMine ? 'items-end' : 'items-start'}`}>

          {/* "Quantum Support" label — above the first bubble in a run */}
          {!isMine && isGroupStart && (
            <div className="flex items-center gap-1 mb-1 ml-0.5">
              <ShieldCheck size={11} className="text-accent/70 shrink-0" />
              <span className="text-[11px] font-semibold text-accent/70 leading-none">
                Quantum Support
              </span>
            </div>
          )}

          {/* Bubble */}
          <div className={[
            'relative text-sm leading-relaxed break-words',
            br,
            isMine
              // Admin's own outbound message: standard primary blue
              ? 'bg-primary text-white shadow-[0_2px_16px_rgba(30,100,255,0.22)]'
              // Support reply visible to customer: deep navy-blue with a primary tint
              // — deliberately different from both `bg-primary` and the page background
              : 'bg-[hsl(225,38%,17%)] text-white/90 border border-primary/25 shadow-sm',
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
