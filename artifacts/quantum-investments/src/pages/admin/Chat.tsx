import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MessageCircle, Send, Loader2, ArrowLeft, Users, ShieldCheck, Search,
} from 'lucide-react';
import { chatApi, Conversation, ChatMessage, formatChatTime } from '@/lib/chat-api';

const POLL_INTERVAL = 3000;

function getInitials(name?: string | null): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? 'U';
  return ((parts[0][0] ?? '') + (parts[parts.length - 1][0] ?? '')).toUpperCase();
}

// ─── Shared avatar components ─────────────────────────────────────────────────

function AdminAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-primary/25 border border-primary/40 flex items-center justify-center shrink-0">
      <ShieldCheck size={15} className="text-accent" />
    </div>
  );
}

function UserAvatar({ initials, size = 'sm' }: { initials: string; size?: 'sm' | 'md' }) {
  const dim = size === 'md' ? 'w-10 h-10' : 'w-8 h-8';
  const text = size === 'md' ? 'text-sm' : 'text-[11px]';
  return (
    <div className={`${dim} rounded-full bg-white/8 border border-white/15 flex items-center justify-center shrink-0`}>
      <span className={`${text} font-bold text-white/70`}>{initials}</span>
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

// ─── Message bubble ───────────────────────────────────────────────────────────

interface BubbleProps {
  msg: ChatMessage;
  isAdmin: boolean;
  userDisplayName: string;
  userInitials: string;
}

function MessageBubble({ msg, isAdmin, userDisplayName, userInitials }: BubbleProps) {
  return (
    <div className={`flex items-end gap-2.5 ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
      {isAdmin ? <AdminAvatar /> : <UserAvatar initials={userInitials} />}

      <div className={`flex flex-col max-w-[68%] ${isAdmin ? 'items-end' : 'items-start'}`}>
        {/* Sender label */}
        <span
          className={`text-[10px] font-semibold mb-1.5 px-1 ${
            isAdmin ? 'text-accent/70' : 'text-white/40'
          }`}
        >
          {isAdmin ? 'You (Admin)' : userDisplayName}
        </span>

        {/* Bubble */}
        <div
          className={`px-4 py-3 text-[13.5px] leading-relaxed break-words ${
            isAdmin
              ? 'bg-primary text-white rounded-2xl rounded-br-[4px] shadow-[0_4px_24px_rgba(21,101,232,0.28)]'
              : 'bg-white/[0.07] border border-white/10 text-white/90 rounded-2xl rounded-bl-[4px]'
          }`}
        >
          {msg.message}
          <div className={`flex items-center gap-1 mt-1.5 ${isAdmin ? 'justify-end' : 'justify-start'}`}>
            <span className="text-[10px] opacity-40 tabular-nums">
              {formatChatTime(msg.created_at)}
            </span>
            {isAdmin && (
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

// ─── Conversation list item ───────────────────────────────────────────────────

function ConvItem({
  conv,
  isSelected,
  onSelect,
}: {
  conv: Conversation;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const initials = getInitials(conv.user_full_name ?? conv.user_username);
  const displayName = conv.user_full_name ?? conv.user_username ?? `User #${conv.user_id}`;
  const unread = conv.unread_count ?? 0;
  const lastMsg = conv.last_message;

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-start gap-3 px-4 py-3.5 text-left transition-all ${
        isSelected
          ? 'bg-primary/12 border-r-2 border-accent'
          : 'hover:bg-white/[0.035] border-r-2 border-transparent'
      }`}
    >
      {/* Avatar with unread dot */}
      <div className="relative shrink-0 mt-0.5">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center border ${
            isSelected
              ? 'bg-primary/20 border-primary/40'
              : 'bg-white/[0.07] border-white/12'
          }`}
        >
          <span className={`text-sm font-bold ${isSelected ? 'text-accent' : 'text-white/60'}`}>
            {initials}
          </span>
        </div>
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-accent border-2 border-[hsl(224,70%,7%)]" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Name + time */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <p className={`text-sm font-semibold truncate ${isSelected ? 'text-accent' : 'text-white/90'}`}>
            {displayName}
          </p>
          {lastMsg && (
            <span className="text-[10px] text-white/25 shrink-0 tabular-nums">
              {formatChatTime(lastMsg.created_at)}
            </span>
          )}
        </div>

        {/* Last message + unread badge */}
        <div className="flex items-center justify-between gap-2">
          {lastMsg ? (
            <p className={`text-xs truncate ${unread > 0 ? 'text-white/65 font-medium' : 'text-white/35'}`}>
              {lastMsg.sender_type === 'admin' && (
                <span className="text-accent/60 mr-1">You:</span>
              )}
              {lastMsg.message}
            </p>
          ) : (
            <p className="text-xs text-white/20 italic">No messages yet</p>
          )}
          {unread > 0 && (
            <span className="shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>

        {/* Email */}
        <p className="text-[10px] text-white/20 mt-0.5 truncate">{conv.user_email}</p>
      </div>
    </button>
  );
}

// ─── Conversation list panel ──────────────────────────────────────────────────

function ConversationListPanel({
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
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? conversations.filter((c) => {
        const q = search.toLowerCase();
        return (
          (c.user_full_name ?? '').toLowerCase().includes(q) ||
          (c.user_username ?? '').toLowerCase().includes(q) ||
          (c.user_email ?? '').toLowerCase().includes(q)
        );
      })
    : conversations;

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div
        className="px-4 py-3 border-b border-white/[0.07] shrink-0"
        style={{ background: 'hsl(224 70% 6% / 0.8)' }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-2">
          Conversations ({conversations.length})
        </p>
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users…"
            className="w-full bg-white/[0.05] border border-white/8 rounded-lg pl-8 pr-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary/40 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="animate-spin text-accent" size={22} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3 px-6 text-center">
            <Users size={28} className="text-white/10" />
            <p className="text-white/30 text-sm">
              {search ? 'No matching users' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConvItem
              key={conv.id}
              conv={conv}
              isSelected={conv.id === selectedId}
              onSelect={() => onSelect(conv)}
            />
          ))
        )}
      </div>
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
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const maxSeenIdRef = useRef(0);

  const forceScrollBottom = useCallback(() => {
    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    });
  }, []);

  const fetchMessages = useCallback(async (markRead = false) => {
    try {
      const msgs = await chatApi.getMessages(conversation.id);
      if (markRead) chatApi.markRead(conversation.id).catch(() => {});
      const maxId = msgs.reduce((m, msg) => Math.max(m, msg.id), 0);
      setMessages(msgs);
      if (maxId > maxSeenIdRef.current) {
        maxSeenIdRef.current = maxId;
        forceScrollBottom();
      }
    } catch {
      // non-fatal
    }
  }, [conversation.id, forceScrollBottom]);

  // Load on conversation change
  useEffect(() => {
    maxSeenIdRef.current = 0;
    setLoadingMsgs(true);
    setMessages([]);
    fetchMessages(true).finally(() => {
      setLoadingMsgs(false);
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' });
      });
    });
  }, [conversation.id, fetchMessages]);

  // Polling
  useEffect(() => {
    pollRef.current = setInterval(() => fetchMessages(true), POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMessages]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || sending) return;

    setSending(true);
    setInputText('');
    if (inputRef.current) inputRef.current.style.height = '48px';

    try {
      const msg = await chatApi.sendMessage(conversation.id, text);
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        maxSeenIdRef.current = Math.max(maxSeenIdRef.current, msg.id);
        return [...prev, msg];
      });
      forceScrollBottom();
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
      <div
        className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.07] shrink-0"
        style={{ background: 'hsl(224 70% 6% / 0.8)' }}
      >
        <button
          onClick={onBack}
          className="md:hidden text-white/30 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="relative">
          <UserAvatar initials={userInitials} size="md" />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-[hsl(224,70%,6%)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{userDisplayName}</p>
          <p className="text-xs text-white/35 truncate">{conversation.user_email}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-1">
        {loadingMsgs ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="animate-spin text-accent" size={22} />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center select-none">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
              <MessageCircle size={24} className="text-white/20" />
            </div>
            <div>
              <p className="text-white/40 text-sm font-medium">No messages yet</p>
              <p className="text-white/20 text-xs mt-0.5">Say hello to {userDisplayName}</p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isAdminMsg = msg.sender_type === 'admin';
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
                    isAdmin={isAdminMsg}
                    userDisplayName={userDisplayName}
                    userInitials={userInitials}
                  />
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} className="h-1" />
      </div>

      {/* Input */}
      <div
        className="px-5 py-4 border-t border-white/[0.07] shrink-0"
        style={{ background: 'hsl(224 70% 6% / 0.8)' }}
      >
        <div className="flex gap-3 items-end">
          <AdminAvatar />
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
              placeholder={`Reply to ${userDisplayName}…`}
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

  const fetchConversations = useCallback(async () => {
    try {
      const data = await chatApi.getAllConversations();
      // Update unread map
      for (const conv of data) {
        prevUnreadMapRef.current[conv.id] = conv.unread_count ?? 0;
      }
      setConversations(data);
    } catch {
      // non-fatal
    }
  }, []);

  useEffect(() => {
    fetchConversations().finally(() => setLoadingConvs(false));
    pollRef.current = setInterval(fetchConversations, POLL_INTERVAL);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
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
    <div className="space-y-5">
      {/* Page header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Live Chat</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage user support conversations in real time.</p>
        </div>
        {totalUnread > 0 && (
          <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-xl px-3 py-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
            <span className="text-sm font-semibold text-accent">
              {totalUnread} unread
            </span>
          </div>
        )}
      </header>

      {/* Main panel */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl overflow-hidden border border-white/[0.07]"
        style={{
          background: 'hsl(224 70% 7% / 0.6)',
          backdropFilter: 'blur(20px)',
          height: 'calc(100vh - 230px)',
          minHeight: '520px',
        }}
      >
        <div className="flex h-full">
          {/* Conversation list — desktop always visible, mobile hidden when thread open */}
          <div
            className={`${
              showThread ? 'hidden md:flex' : 'flex'
            } w-full md:w-[300px] lg:w-[320px] flex-col border-r border-white/[0.07] shrink-0`}
          >
            <ConversationListPanel
              conversations={conversations}
              loading={loadingConvs}
              selectedId={selected?.id ?? null}
              onSelect={handleSelect}
            />
          </div>

          {/* Thread panel */}
          <div className={`${showThread ? 'flex' : 'hidden md:flex'} flex-1 flex-col min-w-0`}>
            {selected ? (
              <MessageThread
                key={selected.id}
                conversation={selected}
                onBack={() => setShowThread(false)}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6 select-none">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.07] flex items-center justify-center">
                  <MessageCircle size={28} className="text-white/20" />
                </div>
                <div>
                  <p className="text-white/40 text-sm font-medium">Select a conversation</p>
                  <p className="text-white/20 text-xs mt-0.5">Choose a user from the list to start replying</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
