import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, Loader2, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { chatApi, ChatMessage, formatChatTime } from '@/lib/chat-api';
import { useAuth } from '@/contexts/AuthContext';

const POLL_INTERVAL = 3000;

function getInitials(name?: string | null): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? 'U';
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

// ─── Avatar components ────────────────────────────────────────────────────────

function SupportAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/35 flex items-center justify-center shrink-0">
      <ShieldCheck size={15} className="text-emerald-400" />
    </div>
  );
}

function UserAvatar({ initials }: { initials: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-primary/25 border border-primary/40 flex items-center justify-center shrink-0">
      <span className="text-[11px] font-bold text-white/90">{initials}</span>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

interface BubbleProps {
  msg: ChatMessage;
  isUser: boolean;
  senderLabel: string;
  userInitials: string;
}

function MessageBubble({ msg, isUser, senderLabel, userInitials }: BubbleProps) {
  return (
    <div className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {isUser ? <UserAvatar initials={userInitials} /> : <SupportAvatar />}

      {/* Bubble + meta */}
      <div className={`flex flex-col max-w-[68%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Sender label */}
        <span
          className={`text-[10px] font-semibold mb-1.5 px-1 ${
            isUser ? 'text-primary/70' : 'text-emerald-400/80'
          }`}
        >
          {senderLabel}
        </span>

        {/* Bubble */}
        <div
          className={`relative px-4 py-3 text-[13.5px] leading-relaxed break-words ${
            isUser
              ? 'bg-primary text-white rounded-2xl rounded-br-[4px] shadow-[0_4px_24px_rgba(21,101,232,0.30)]'
              : 'bg-[hsl(160_55%_10%/1)] border border-emerald-500/20 text-white/90 rounded-2xl rounded-bl-[4px]'
          }`}
        >
          {msg.message}

          {/* Time + read status */}
          <div className={`flex items-center gap-1 mt-1.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] opacity-40 tabular-nums">
              {formatChatTime(msg.created_at)}
            </span>
            {isUser && (
              <span className={`text-[11px] leading-none ${msg.is_read ? 'text-blue-200' : 'opacity-40'}`}>
                {msg.is_read ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Time separator ───────────────────────────────────────────────────────────

function TimeSeparator({ time }: { time: string }) {
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-white/5" />
      <span className="text-[10px] text-white/25 font-medium tabular-nums shrink-0">{time}</span>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  );
}

// ─── Main chat page ───────────────────────────────────────────────────────────

export default function Chat() {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const maxSeenIdRef = useRef(0);

  const forceScrollBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  const fetchMessages = useCallback(async (convId: number, markRead = false) => {
    try {
      const msgs = await chatApi.getMessages(convId);
      if (markRead) chatApi.markRead(convId).catch(() => {});
      setMessages(msgs);
      const maxId = msgs.reduce((m, msg) => Math.max(m, msg.id), 0);
      if (maxId > maxSeenIdRef.current) {
        maxSeenIdRef.current = maxId;
        forceScrollBottom();
      }
    } catch {
      // non-fatal
    }
  }, [forceScrollBottom]);

  // Init
  useEffect(() => {
    (async () => {
      try {
        const conv = await chatApi.getOrCreateConversation();
        setConversationId(conv.id);
        const msgs = await chatApi.getMessages(conv.id);
        await chatApi.markRead(conv.id).catch(() => {});
        setMessages(msgs);
        maxSeenIdRef.current = msgs.reduce((m, msg) => Math.max(m, msg.id), 0);
        // Instant scroll on load
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ behavior: 'auto' });
        });
      } catch (err: any) {
        setError(err?.message ?? 'Could not load chat. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Polling
  useEffect(() => {
    if (!conversationId) return;
    pollRef.current = setInterval(() => fetchMessages(conversationId, true), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [conversationId, fetchMessages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !conversationId || sending) return;

    setSending(true);
    setInputText('');
    // Reset textarea height
    if (inputRef.current) inputRef.current.style.height = '48px';

    try {
      const msg = await chatApi.sendMessage(conversationId, text);
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        maxSeenIdRef.current = Math.max(maxSeenIdRef.current, msg.id);
        return [...prev, msg];
      });
      forceScrollBottom();
    } catch (err: any) {
      setError('Failed to send. Try again.');
      setInputText(text);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const userInitials = getInitials(user?.full_name ?? user?.username);
  const userName = user?.full_name ?? user?.username ?? 'You';

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (error && !conversationId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
        <AlertCircle className="text-red-400" size={40} />
        <p className="text-muted-foreground text-sm max-w-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 text-accent hover:text-accent/70 text-sm font-medium"
        >
          <RefreshCw size={14} /> Retry
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Page header */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-white">Live Chat Support</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Chat with our support team — we typically reply within minutes.
        </p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col rounded-2xl overflow-hidden border border-white/[0.07]"
        style={{
          background: 'hsl(224 70% 7% / 0.6)',
          backdropFilter: 'blur(20px)',
          height: 'calc(100vh - 240px)',
          minHeight: '520px',
        }}
      >
        {/* ── Chat header ───────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-3 px-5 py-4 shrink-0 border-b border-white/[0.07]"
          style={{ background: 'hsl(224 70% 6% / 0.8)' }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck size={20} className="text-emerald-400" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[hsl(224,70%,6%)]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Quantum Support</p>
            <p className="text-xs text-emerald-400/80 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
              Online — typically replies in minutes
            </p>
          </div>
        </div>

        {/* ── Messages ──────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center select-none">
              <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                <MessageCircle size={24} className="text-white/20" />
              </div>
              <div>
                <p className="text-white/40 text-sm font-medium">No messages yet</p>
                <p className="text-white/20 text-xs mt-0.5">Start the conversation below</p>
              </div>
            </div>
          )}

          {messages.map((msg, i) => {
            const isUser = msg.sender_type === 'user';
            const showSep =
              i === 0 ||
              new Date(msg.created_at).getTime() -
                new Date(messages[i - 1].created_at).getTime() >
                5 * 60_000;

            return (
              <div key={msg.id}>
                {showSep && <TimeSeparator time={formatChatTime(msg.created_at)} />}
                <div className="py-0.5">
                  <MessageBubble
                    msg={msg}
                    isUser={isUser}
                    senderLabel={isUser ? userName : 'Support Team'}
                    userInitials={userInitials}
                  />
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} className="h-1" />
        </div>

        {/* ── Error banner ──────────────────────────────────────────────── */}
        {error && conversationId && (
          <div className="mx-5 mb-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 flex items-center gap-2">
            <AlertCircle size={13} />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400/60 hover:text-red-400">
              <RefreshCw size={12} />
            </button>
          </div>
        )}

        {/* ── Input area ────────────────────────────────────────────────── */}
        <div
          className="px-5 py-4 shrink-0 border-t border-white/[0.07]"
          style={{ background: 'hsl(224 70% 6% / 0.8)' }}
        >
          <div className="flex gap-3 items-end">
            <UserAvatar initials={userInitials} />
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={1}
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary/60 focus:bg-white/[0.08] transition-all resize-none overflow-hidden"
                style={{ minHeight: '48px' }}
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim() || sending}
                className="absolute right-2 bottom-2 w-8 h-8 bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-all"
              >
                {sending
                  ? <Loader2 size={14} className="animate-spin text-white" />
                  : <Send size={14} className="text-white" />
                }
              </button>
            </div>
          </div>
          <p className="text-[10px] text-white/15 mt-2 ml-11">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </motion.div>
    </div>
  );
}
