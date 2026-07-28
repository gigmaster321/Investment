import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle, Send, Loader2, ArrowLeft, Users, Clock, ShieldCheck,
} from 'lucide-react';
import { chatApi, Conversation, ChatMessage, formatChatTime } from '@/lib/chat-api';
import { toast } from '@/hooks/use-toast';

const POLL_INTERVAL = 3000;

function getInitials(name?: string | null): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? 'U';
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

// ─── Conversation list ────────────────────────────────────────────────────────

function ConversationList({
  conversations,
  loading,
  selectedId,
  onSelect,
}: {
  conversations: Conversation[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (conv: Conversation) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="animate-spin text-accent" size={24} />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-3 text-center px-6">
        <Users size={32} className="text-white/10" />
        <p className="text-muted-foreground text-sm">No conversations yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-white/5 overflow-y-auto flex-1">
      {conversations.map((conv) => {
        const isSelected = conv.id === selectedId;
        const hasUnread = (conv.unread_count ?? 0) > 0;
        const initials = getInitials(conv.user_full_name ?? conv.user_username);

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv)}
            className={`flex items-start gap-3 px-4 py-3.5 text-left transition-colors ${
              isSelected ? 'bg-primary/10 border-r-2 border-accent' : 'hover:bg-white/[0.03]'
            }`}
          >
            {/* User avatar */}
            <div className="relative shrink-0 mt-0.5">
              <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-xs font-bold text-white/60">{initials}</span>
              </div>
              {hasUnread && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-card" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-medium truncate ${isSelected ? 'text-accent' : 'text-white'}`}>
                  {conv.user_full_name ?? conv.user_username ?? `User #${conv.user_id}`}
                </p>
                {conv.last_message && (
                  <span className="text-[10px] text-muted-foreground/50 shrink-0">
                    {formatChatTime(conv.last_message.created_at)}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-0.5">
                {conv.last_message ? (
                  <p className={`text-xs truncate max-w-[160px] ${hasUnread ? 'text-white/70 font-medium' : 'text-muted-foreground'}`}>
                    {conv.last_message.sender_type === 'admin' ? 'You: ' : ''}
                    {conv.last_message.message}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground/40 italic">No messages yet</p>
                )}
                {hasUnread && (
                  <span className="ml-2 shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
                    {(conv.unread_count ?? 0) > 99 ? '99+' : conv.unread_count}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground/40 mt-0.5">{conv.user_email}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Message thread ───────────────────────────────────────────────────────────

function MessageThread({
  conversation,
  onBack,
}: {
  conversation: Conversation;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(true);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const initialLoadDoneRef = useRef(false);
  const maxNotifiedIdRef = useRef(0);

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

  const fetchMessages = useCallback(async (markRead = false) => {
    try {
      const msgs = await chatApi.getMessages(conversation.id);
      if (markRead) await chatApi.markRead(conversation.id);

      setMessages(() => {
        // Toast for new user messages in this thread — only after initial load
        if (initialLoadDoneRef.current) {
          const knownMaxId = maxNotifiedIdRef.current;
          const newUserMsgs = msgs.filter(
            (m) => m.sender_type === 'user' && m.id > knownMaxId,
          );
          if (newUserMsgs.length > 0) {
            const latest = newUserMsgs[newUserMsgs.length - 1];
            const displayName = conversation.user_full_name ?? conversation.user_username ?? `User #${conversation.user_id}`;
            toast({
              title: `💬 New message from ${displayName}`,
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
  }, [conversation.id, conversation.user_full_name, conversation.user_username, conversation.user_id]);

  useEffect(() => {
    initialLoadDoneRef.current = false;
    maxNotifiedIdRef.current = 0;
    setLoadingMsgs(true);
    setMessages([]);
    fetchMessages(true).finally(() => {
      setLoadingMsgs(false);
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' });
        initialLoadDoneRef.current = true;
      }, 50);
    });
  }, [conversation.id, fetchMessages]);

  // Smart scroll when messages update
  useEffect(() => {
    if (!initialLoadDoneRef.current) return;
    scrollToBottom(false);
  }, [messages, scrollToBottom]);

  useEffect(() => {
    pollRef.current = setInterval(() => fetchMessages(true), POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchMessages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    setInputText('');
    try {
      const msg = await chatApi.sendMessage(conversation.id, text);
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        maxNotifiedIdRef.current = Math.max(maxNotifiedIdRef.current, msg.id);
        return [...prev, msg];
      });
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 30);
    } catch {
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

  const userDisplayName = conversation.user_full_name ?? conversation.user_username ?? `User #${conversation.user_id}`;
  const userInitials = getInitials(conversation.user_full_name ?? conversation.user_username);

  return (
    <div className="flex flex-col h-full">
      {/* Thread header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 shrink-0">
        <button
          onClick={onBack}
          className="md:hidden text-muted-foreground hover:text-white transition-colors p-1"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-white/60">{userInitials}</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{userDisplayName}</p>
          <p className="text-xs text-muted-foreground">{conversation.user_email}</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {loadingMsgs ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="animate-spin text-accent" size={24} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <MessageCircle size={40} className="text-white/10" />
            <p className="text-muted-foreground text-sm">No messages yet. Say hello!</p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isAdmin = msg.sender_type === 'admin';
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

                {/* User message — left aligned */}
                {!isAdmin && (
                  <div className="flex items-end gap-2.5 justify-start">
                    {/* User avatar */}
                    <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0 mb-0.5">
                      <span className="text-[10px] font-bold text-white/60">{userInitials}</span>
                    </div>
                    <div className="flex flex-col items-start max-w-[72%]">
                      <span className="text-[10px] text-white/50 font-medium mb-1 ml-1">{userDisplayName}</span>
                      <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm leading-relaxed bg-white/5 border border-white/10 text-white/90">
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

                {/* Admin message — right aligned */}
                {isAdmin && (
                  <div className="flex items-end gap-2.5 justify-end">
                    <div className="flex flex-col items-end max-w-[72%]">
                      <span className="text-[10px] text-accent/80 font-medium mb-1 mr-1">You (Admin)</span>
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
                    {/* Admin avatar */}
                    <div className="w-7 h-7 rounded-full bg-primary/30 border border-primary/40 flex items-center justify-center shrink-0 mb-0.5">
                      <ShieldCheck size={13} className="text-accent" />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

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
            placeholder="Reply to user… (Enter to send)"
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
    </div>
  );
}

// ─── Main admin chat page ─────────────────────────────────────────────────────

export default function AdminChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [showThread, setShowThread] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevUnreadMapRef = useRef<Record<number, number>>({});
  const convListInitDoneRef = useRef(false);

  const fetchConversations = useCallback(async () => {
    try {
      const data = await chatApi.getAllConversations();

      // Toast for unread increases on non-selected conversations (after initial load)
      if (convListInitDoneRef.current) {
        for (const conv of data) {
          const prevUnread = prevUnreadMapRef.current[conv.id] ?? 0;
          const currUnread = conv.unread_count ?? 0;
          if (currUnread > prevUnread && conv.id !== (selected?.id ?? -1)) {
            const displayName = conv.user_full_name ?? conv.user_username ?? `User #${conv.user_id}`;
            const lastMsg = conv.last_message;
            toast({
              title: `💬 New message from ${displayName}`,
              description: lastMsg
                ? (lastMsg.message.length > 80 ? lastMsg.message.slice(0, 77) + '…' : lastMsg.message)
                : undefined,
            });
            break; // one toast per poll cycle to avoid flooding
          }
        }
      }

      // Update unread map
      const newMap: Record<number, number> = {};
      for (const conv of data) {
        newMap[conv.id] = conv.unread_count ?? 0;
      }
      prevUnreadMapRef.current = newMap;

      setConversations(data);
    } catch {
      // non-fatal
    }
  }, [selected?.id]);

  useEffect(() => {
    fetchConversations().finally(() => {
      setLoadingConvs(false);
      convListInitDoneRef.current = true;
    });
    pollRef.current = setInterval(fetchConversations, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchConversations]);

  const handleSelect = (conv: Conversation) => {
    setSelected(conv);
    setShowThread(true);
    // Optimistically clear unread in list
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c)),
    );
    prevUnreadMapRef.current[conv.id] = 0;
  };

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unread_count ?? 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Live Chat</h1>
          <p className="text-muted-foreground">Manage user support conversations.</p>
        </div>
        {totalUnread > 0 && (
          <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-xl px-4 py-2">
            <Clock size={16} className="text-accent" />
            <span className="text-sm font-semibold text-accent">
              {totalUnread} unread {totalUnread === 1 ? 'message' : 'messages'}
            </span>
          </div>
        )}
      </header>

      {/* Chat panel */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-card/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden"
        style={{ height: 'calc(100vh - 260px)', minHeight: '500px' }}
      >
        <div className="flex h-full">
          {/* Conversation list — always visible on md+, hidden on mobile when thread is open */}
          <div
            className={`${
              showThread ? 'hidden md:flex' : 'flex'
            } w-full md:w-80 flex-col border-r border-white/5 shrink-0`}
          >
            <div className="px-4 py-3 border-b border-white/5 shrink-0">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                Conversations ({conversations.length})
              </p>
            </div>
            <ConversationList
              conversations={conversations}
              loading={loadingConvs}
              selectedId={selected?.id ?? null}
              onSelect={handleSelect}
            />
          </div>

          {/* Thread */}
          <div className={`${showThread ? 'flex' : 'hidden md:flex'} flex-1 flex-col`}>
            {selected ? (
              <MessageThread
                key={selected.id}
                conversation={selected}
                onBack={() => setShowThread(false)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                <MessageCircle size={48} className="text-white/10" />
                <p className="text-muted-foreground text-sm">
                  Select a conversation to start replying.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
