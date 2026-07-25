import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, Loader2, AlertCircle } from 'lucide-react';
import { chatApi, ChatMessage, formatChatTime } from '@/lib/chat-api';
import { useAuth } from '@/contexts/AuthContext';

const POLL_INTERVAL = 3000; // 3 seconds

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

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  const fetchMessages = useCallback(async (convId: number, markRead = false) => {
    try {
      const msgs = await chatApi.getMessages(convId);
      setMessages(msgs);
      if (markRead) await chatApi.markRead(convId);
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
      } catch (err: any) {
        setError(err?.message ?? 'Could not load chat. Please try again.');
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom(messages.length <= 20);
  }, [messages, scrollToBottom]);

  // Polling for new messages
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
        // prevent duplicate if polling already picked it up
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    } catch (err: any) {
      setError(err?.message ?? 'Failed to send message.');
      setInputText(text); // restore on error
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
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Live Chat Support</h1>
        <p className="text-muted-foreground">Chat with our support team — we typically reply within minutes.</p>
      </header>

      {/* Chat container */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden flex flex-col"
        style={{ height: 'calc(100vh - 280px)', minHeight: '480px' }}
      >
        {/* Chat header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 shrink-0">
          <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
            <MessageCircle size={18} className="text-accent" />
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
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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
                  <div className="text-center text-[10px] text-muted-foreground/50 my-2">
                    {formatChatTime(msg.created_at)}
                  </div>
                )}
                <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isUser
                        ? 'bg-primary text-white rounded-br-sm shadow-[0_0_20px_rgba(21,101,232,0.25)]'
                        : 'bg-white/5 border border-white/10 text-white/90 rounded-bl-sm'
                    }`}
                  >
                    {msg.message}
                    <div
                      className={`flex items-center gap-1 mt-1 ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <span className="text-[10px] opacity-50">
                        {formatChatTime(msg.created_at)}
                      </span>
                      {isUser && (
                        <span className={`text-[10px] ${msg.is_read ? 'text-accent/70' : 'opacity-50'}`}>
                          {msg.is_read ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
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
                // Auto-grow
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
