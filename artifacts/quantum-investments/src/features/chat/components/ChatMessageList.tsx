import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import ChatBubble from './ChatBubble';
import type { ChatMessage } from '../types/chat.types';

interface Props {
  messages: ChatMessage[];
  showTyping: boolean;
  isLoading: boolean;
  /** Which sender_type is "mine" (right-aligned). Defaults to 'user'. */
  myRole?: 'user' | 'admin';
}

/** Group consecutive messages into date buckets for date-separator display. */
function getDateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ChatMessageList({ messages, showTyping, isLoading, myRole = 'user' }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, showTyping]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-primary/50 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !showTyping) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <MessageCircle size={28} className="text-accent/60" />
        </div>
        <div>
          <p className="text-sm font-medium text-white/70">No messages yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Send a message to start the conversation with support.
          </p>
        </div>
      </div>
    );
  }

  // Build list with date separators
  const items: Array<{ type: 'date'; label: string } | { type: 'msg'; msg: ChatMessage }> = [];
  let lastLabel = '';
  for (const msg of messages) {
    const label = getDateLabel(msg.created_at);
    if (label !== lastLabel) {
      items.push({ type: 'date', label });
      lastLabel = label;
    }
    items.push({ type: 'msg', msg });
  }

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-1 scroll-smooth">
      <AnimatePresence initial={false}>
        {items.map((item, idx) =>
          item.type === 'date' ? (
            <div key={`date-${item.label}`} className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-white/6" />
              <span className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">
                {item.label}
              </span>
              <div className="flex-1 h-px bg-white/6" />
            </div>
          ) : (
            <motion.div
              key={item.msg.id}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="pb-0.5"
            >
              <ChatBubble
                message={item.msg}
                isMine={item.msg.sender_type === 'user'}
              />
            </motion.div>
          ),
        )}
      </AnimatePresence>

      {/* Typing indicator */}
      <AnimatePresence>
        {showTyping && (
          <motion.div
            key="typing"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="flex justify-start pb-1"
          >
            <div className="bg-[hsl(221,55%,20%)] border border-white/6 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce"
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
