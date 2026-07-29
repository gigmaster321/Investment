import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, ShieldCheck } from 'lucide-react';
import AdminMessageBubble from './AdminMessageBubble';
import UserMessageBubble from './UserMessageBubble';
import type { ChatMessage } from '../types/chat.types';

interface Props {
  messages: ChatMessage[];
  showTyping: boolean;
  isLoading: boolean;
  /**
   * The authenticated session user's DB id.
   * isMine is computed as message.sender_id === currentUserId — never from sender_type.
   */
  currentUserId: number;
  /** Initials / short label for the incoming party's avatar circle. */
  incomingLabel?: string;
  /** Full display name shown above the first bubble of each incoming group. */
  incomingName?: string;
}

function getDateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Placeholder rows shown while messages are loading
function SkeletonRow({ align }: { align: 'left' | 'right' }) {
  return (
    <div className={`flex w-full ${align === 'right' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
      {align === 'left' && <div className="w-7 h-7 rounded-full bg-white/[0.06] shrink-0 animate-pulse" />}
      <div className={`flex flex-col gap-1.5 ${align === 'right' ? 'items-end' : 'items-start'}`}>
        <div
          className={`h-10 rounded-2xl bg-white/[0.06] animate-pulse ${
            align === 'right' ? 'w-44' : 'w-56'
          }`}
        />
        <div className="h-2 w-10 rounded bg-white/[0.04] animate-pulse" />
      </div>
    </div>
  );
}

export default function ChatMessageList({
  messages,
  showTyping,
  isLoading,
  currentUserId,
  incomingLabel,
  incomingName,
}: Props) {
  const listRef  = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  // Track whether this is the very first render with messages
  const isInitial = useRef(true);

  /** Returns true when the user is scrolled within 120 px of the bottom. */
  const isNearBottom = useCallback(() => {
    const el = listRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }, []);

  // Auto-scroll logic:
  //  • First paint → instant (no animation flash)
  //  • New message arrives → smooth, but ONLY if the user is already near the bottom
  useEffect(() => {
    if (!bottomRef.current) return;
    if (isInitial.current && messages.length > 0) {
      bottomRef.current.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
      isInitial.current = false;
      return;
    }
    if (isNearBottom()) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, isNearBottom]);

  // Always follow the typing indicator regardless of scroll position
  useEffect(() => {
    if (showTyping && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showTyping]);

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex-1 overflow-hidden px-4 py-5 flex flex-col gap-5">
        <SkeletonRow align="left" />
        <SkeletonRow align="right" />
        <SkeletonRow align="left" />
        <SkeletonRow align="right" />
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (messages.length === 0 && !showTyping) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <MessageCircle size={28} className="text-accent/60" />
        </div>
        <div>
          <p className="text-sm font-medium text-white/70">No messages yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Send a message to start the conversation.
          </p>
        </div>
      </div>
    );
  }

  // ── Build items list with date separators ──────────────────────────────────
  type RawItem =
    | { type: 'date'; label: string }
    | { type: 'msg'; msg: ChatMessage };

  const raw: RawItem[] = [];
  let lastLabel = '';
  for (const msg of messages) {
    const label = getDateLabel(msg.created_at);
    if (label !== lastLabel) {
      raw.push({ type: 'date', label });
      lastLabel = label;
    }
    raw.push({ type: 'msg', msg });
  }

  // Attach grouping metadata — consecutive messages from the same sender
  // (with no date separator in between) form a visual "group".
  type EnrichedMsg = {
    type: 'msg';
    msg: ChatMessage;
    isGroupStart: boolean;
    isGroupEnd: boolean;
  };
  type Item = { type: 'date'; label: string } | EnrichedMsg;

  const items: Item[] = raw.map((item, i) => {
    if (item.type === 'date') return item;
    const prev = raw[i - 1];
    const next = raw[i + 1];
    const prevMsg = prev?.type === 'msg' ? prev.msg : null;
    const nextMsg = next?.type === 'msg' ? next.msg : null;
    return {
      type: 'msg',
      msg: item.msg,
      isGroupStart: !prevMsg || prevMsg.sender_id !== item.msg.sender_id,
      isGroupEnd:   !nextMsg || nextMsg.sender_id !== item.msg.sender_id,
    };
  });

  return (
    <div
      ref={listRef}
      className="flex-1 overflow-y-auto overscroll-contain px-3 sm:px-4 py-4"
    >
      <AnimatePresence initial={false}>
        {items.map((item) =>
          item.type === 'date' ? (
            <div key={`d-${item.label}`} className="flex items-center gap-3 py-3 my-1">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider px-1">
                {item.label}
              </span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>
          ) : (
            <motion.div
              key={item.msg.id}
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.14, ease: [0.25, 0.1, 0.25, 1] }}
              // Larger gap after the last bubble of each group
              className={item.isGroupEnd ? 'mb-3' : 'mb-[3px]'}
            >
              {item.msg.sender_type === 'admin' ? (
                <AdminMessageBubble
                  message={item.msg}
                  isMine={item.msg.sender_id === currentUserId}
                  isGroupStart={item.isGroupStart}
                  isGroupEnd={item.isGroupEnd}
                />
              ) : (
                <UserMessageBubble
                  message={item.msg}
                  isMine={item.msg.sender_id === currentUserId}
                  isGroupStart={item.isGroupStart}
                  isGroupEnd={item.isGroupEnd}
                  customerInitials={incomingLabel}
                  customerName={incomingName}
                />
              )}
            </motion.div>
          ),
        )}
      </AnimatePresence>

      {/* Typing indicator */}
      <AnimatePresence>
        {showTyping && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.18 }}
            className="flex items-end gap-2 mb-3"
          >
            {/* Mirror the incoming avatar style */}
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 border border-primary/35 flex items-center justify-center shrink-0 shadow-sm">
              {incomingLabel ? (
                <span className="text-[10px] font-bold text-accent">
                  {incomingLabel.slice(0, 2).toUpperCase()}
                </span>
              ) : (
                <ShieldCheck size={13} className="text-accent" />
              )}
            </div>
            <div className="bg-[hsl(221,55%,21%)] border border-white/[0.07] rounded-2xl rounded-bl-[5px] px-4 py-3 flex items-center gap-1.5 shadow-sm">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce"
                  style={{ animationDelay: `${i * 0.18}s` }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  );
}
