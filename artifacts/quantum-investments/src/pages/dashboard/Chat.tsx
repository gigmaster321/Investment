import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { chatApi, ChatMessage, formatChatTime } from '@/lib/chat-api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const POLL_INTERVAL = 3000;

function getInitials(name?: string | null): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? 'U';
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

export default function Chat() {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialLoadDoneRef = useRef(false);
  const maxNotifiedIdRef = useRef(0);

  // Smart scroll: only auto-scroll if user is near the bottom
  const isNearBottom = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 140;
  }, []);

  const scrollToBottom = useCallback((force = false) => {
    if (force || isNearBottom()) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isNearBottom]);

  const fetchMessages = useCallback(async (convId: number, markRead = false) => {
    try {
      const msgs = await chatApi.getMessages(convId);
      if (markRead) await chatApi.markRead(convId);

      setMessages((prev) => {
        // Toast for new admin messages — only after initial load, no duplicates
        if (initialLoadDoneRef.current) {
          const knownMaxId = maxNotifiedIdRef.current;
          const newAdminMsgs = msgs.filter(
            (m) => m.sender_type === 'admin' && m.id > knownMaxId,
          );
          if (newAdminMsgs.length > 0) {
            const latest = newAdminMsgs[newAdminMsgs.length - 1];
            toast({
              title: '💬 New message from Support',
              description: latest.message.length > 80
                ? latest.message.slice(0, 77) + '…'
                : latest.message,
            });
          }
        }
        const newMax = msgs.reduce((m, msg) => Math.max(m, msg.id), maxNotifiedIdRef.current);
        maxNotifiedIdRef.current = newMax;
        return msgs;
      });
    } catch {
      // non-fatal
    }
  }, []);

  // Init: get or create conversation
  useEffect(() => {
    (async () => {
      try {
        const conv = await chatApi.getOrCreateConversation();
        setConversationId(conv.id);
        await fetchMessages(conv.id, true);
        // Force scroll to bottom on initial load
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
        initialLoadDoneRef.current = true;
      } catch (err: any) {
        setError(err?.message ?? 'Could not load chat. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchMessages]);

  // Smart scroll when messages update
  useEffect(() => {
    if (!initialLoadDoneRef.current) return;
    scrollToBottom(false);
  }, [messages, scrollToBottom]);

  // Polling
  useEffect(() => {
    if (!conversationId) return;
    pollRef.current = setInterval(async () => {
      await fetchMessages(conversationId, true);
    }, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [conversationId, fetchMessages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || !conversationId || sending) return;

    setSending(true);
    setInputText('');
    try {
      const msg = await chatApi.sendMessage(conversationId, text);
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        maxNotifiedIdRef.current = Math.max(maxNotifiedIdRef.current, msg.id);
        return [...prev, msg];
      });
      // Always scroll after sending own message
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 30);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to send message.');
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
          className="text-accent hover:text-accent/70 text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Live Chat Support</h1>
        <p className="text-muted-foreground">Chat with our support team — we typically reply within minutes.</p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden flex flex-col"
        style={{ height: 'calc(100vh - 280px)', minHeight: '480px' }}
      >
        {/* Chat header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 shrink-0">
          <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <ShieldCheck size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Support Team</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <MessageCircle size={40} className="text-white/10" />
              <p className="text-muted-foreground text-sm">No messages yet. Start the conversation!</p>
            </div>
          )}

          {messages.map((msg, i) => {
            const isUser = msg.sender_type === 'user';
            const showTime =
              i === 0 ||
              new Date(msg.created_at).getTime() -
                new Date(messages[i - 1].created_at).getTime() >
                60_000 * 5;

            return (
              <div key={msg.id}>
                {showTime && (
                  <div className="text-center text-[10px] text-muted-foreground/50 my-3">
                    {formatChatTime(msg.created_at)}
                  </div>
                )}

                {/* Admin message — left aligned */}
                {!isUser && (
                  <div className="flex items-end gap-2.5 justify-start">
                    {/* Admin avatar */}
                    <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mb-0.5">
                      <ShieldCheck size={13} className="text-emerald-400" />
                    </div>
                    <div className="flex flex-col items-start max-w-[72%]">
                      <span className="text-[10px] text-emerald-400/80 font-medium mb-1 ml-1">Admin</span>
                      <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-emerald-500/10 border border-emerald-500/20 text-white/90">
                        {msg.message}
                        <div className="flex items-center gap-1 mt-1 justify-start">
                          <span className="text-[10px] opacity-50">
                            {formatChatTime(msg.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* User message — right aligned */}
                {isUser && (
                  <div className="flex items-end gap-2.5 justify-end">
                    <div className="flex flex-col items-end max-w-[72%]">
                      <span className="text-[10px] text-primary/80 font-medium mb-1 mr-1">You</span>
                      <div className="px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed bg-primary text-white shadow-[0_0_20px_rgba(21,101,232,0.25)]">
                        {msg.message}
                        <div className="flex items-center gap-1 mt-1 justify-end">
                          <span className="text-[10px] opacity-60">
                            {formatChatTime(msg.created_at)}
                          </span>
                          <span className={`text-[11px] leading-none ${msg.is_read ? 'text-accent/90' : 'opacity-60'}`}>
                            {msg.is_read ? '✓✓' : '✓'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* User avatar */}
                    <div className="w-7 h-7 rounded-full bg-primary/30 border border-primary/40 flex items-center justify-center shrink-0 mb-0.5">
                      <span className="text-[10px] font-bold text-white/80">{userInitials}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Error banner */}
        {error && conversationId && (
          <div className="mx-6 mb-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Input */}
        <div className="px-6 py-4 border-t border-white/5 shrink-0">
          <div className="flex gap-3 items-end">
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
              placeholder="Type a message… (Enter to send)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none overflow-hidden"
              style={{ minHeight: '48px' }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || sending}
              className="shrink-0 w-12 h-12 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all shadow-[0_0_20px_rgba(21,101,232,0.3)]"
            >
              {sending ? (
                <Loader2 size={18} className="animate-spin text-white" />
              ) : (
                <Send size={18} className="text-white" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground/40 mt-2 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </motion.div>
    </div>
  );
}
