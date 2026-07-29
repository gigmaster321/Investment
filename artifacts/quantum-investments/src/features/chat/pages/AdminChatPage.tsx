import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, Search, ArrowLeft, User, Users,
} from 'lucide-react';
import { useAdminChat } from '../hooks/useAdminChat';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import type { AdminConversation } from '../hooks/useAdminChat';
import ChatMessageList from '../components/ChatMessageList';
import ChatInput from '../components/ChatInput';
import { isImageMessage } from '../types/chat.types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDisplayName(conv: AdminConversation): string {
  return conv.user_full_name ?? conv.user_email ?? `User #${conv.user_id}`;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function lastPreview(conv: AdminConversation): string {
  const msg = conv.last_message;
  if (!msg) return 'No messages yet';
  if (isImageMessage(msg.message)) return '📷 Image';
  const prefix = msg.sender_type === 'admin' ? 'You: ' : '';
  const text = msg.message.slice(0, 38) + (msg.message.length > 38 ? '…' : '');
  return prefix + text;
}

// ── Conversation List Item ────────────────────────────────────────────────────

function ConvItem({
  conv,
  isSelected,
  onSelect,
}: {
  conv: AdminConversation;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const name = getDisplayName(conv);
  const initials = getInitials(name);
  const unread = conv.unread_count ?? 0;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative ${
        isSelected
          ? 'bg-primary/15 border-l-2 border-accent'
          : 'hover:bg-white/4 border-l-2 border-transparent'
      }`}
    >
      {/* Avatar */}
      <div className="w-11 h-11 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-accent">{initials || <User size={16} />}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-sm font-semibold truncate ${unread > 0 ? 'text-white' : 'text-white/80'}`}>
            {name}
          </span>
          {conv.last_message && (
            <span className="text-[10px] text-muted-foreground shrink-0">
              {formatTime(conv.last_message.created_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className={`text-xs truncate ${unread > 0 ? 'text-white/70' : 'text-muted-foreground'}`}>
            {lastPreview(conv)}
          </span>
          {unread > 0 && (
            <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center shrink-0">
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Chat Panel Header ─────────────────────────────────────────────────────────

function ChatPanelHeader({
  conv,
  onBack,
}: {
  conv: AdminConversation;
  onBack?: () => void;
}) {
  const name = getDisplayName(conv);
  const initials = getInitials(name);

  return (
    <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-white/8 bg-[hsl(221,70%,10%)]/80 backdrop-blur-md">
      {onBack && (
        <button
          onClick={onBack}
          className="md:hidden text-muted-foreground hover:text-white transition-colors p-1 -ml-1"
          aria-label="Back to conversations"
        >
          <ArrowLeft size={20} />
        </button>
      )}
      <div className="w-9 h-9 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-accent">{initials || <User size={14} />}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{name}</p>
        {conv.user_email && (
          <p className="text-[11px] text-muted-foreground truncate">{conv.user_email}</p>
        )}
      </div>
      <div className="shrink-0 flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Active
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminChatPage() {
  const {
    conversations,
    selectedId,
    messages,
    loadingMessages,
    isSending,
    selectConversation,
    sendMessage,
    sendImage,
  } = useAdminChat();
  const { adminUserId } = useAdminAuth();

  const [search, setSearch] = useState('');
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter(
      (c) =>
        (c.user_full_name ?? '').toLowerCase().includes(q) ||
        (c.user_email ?? '').toLowerCase().includes(q) ||
        (c.user_username ?? '').toLowerCase().includes(q),
    );
  }, [conversations, search]);

  const selectedConv = conversations.find((c) => c.id === selectedId) ?? null;

  const handleSelect = (id: number) => {
    selectConversation(id);
    setMobileView('chat');
  };

  const totalUnread = conversations.reduce((s, c) => s + (c.unread_count ?? 0), 0);

  return (
    // Break out of AdminLayout's p-5 md:p-8 padding
    <div className="-m-5 md:-m-8 flex h-[calc(100dvh-3.5rem)] md:h-dvh overflow-hidden bg-background">

      {/* ── Left Panel: Conversation List ─────────────────────────────── */}
      <div
        className={`
          flex-shrink-0 w-full md:w-80 lg:w-96 flex flex-col
          border-r border-white/6 bg-[hsl(221,70%,9%)]
          ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}
        `}
      >
        {/* Header */}
        <div className="shrink-0 px-4 py-4 border-b border-white/6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-accent" />
              <h1 className="text-base font-bold text-white">Support Chat</h1>
              {totalUnread > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Users size={13} />
              {conversations.length}
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 pointer-events-none" />
            <input
              type="text"
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/8 rounded-lg pl-8 pr-3 py-2 text-sm text-white placeholder:text-muted-foreground/50 outline-none focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-white/5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center px-6">
              <MessageSquare size={32} className="text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                {search ? 'No users match your search' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            filtered.map((conv) => (
              <ConvItem
                key={conv.id}
                conv={conv}
                isSelected={conv.id === selectedId}
                onSelect={() => handleSelect(conv.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right Panel: Chat Window ───────────────────────────────────── */}
      <div
        className={`
          flex-1 flex flex-col min-w-0
          ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}
        `}
      >
        <AnimatePresence mode="wait">
          {selectedConv ? (
            <motion.div
              key={selectedConv.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col h-full"
            >
              <ChatPanelHeader
                conv={selectedConv}
                onBack={() => setMobileView('list')}
              />
              <ChatMessageList
                messages={messages}
                showTyping={false}
                isLoading={loadingMessages}
                currentUserId={adminUserId ?? 0}
                incomingLabel={getInitials(getDisplayName(selectedConv))}
                incomingName={getDisplayName(selectedConv)}
              />
              <ChatInput
                onSend={sendMessage}
                onSendImage={sendImage}
                isSending={isSending}
                placeholder={`Reply to ${getDisplayName(selectedConv)}…`}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 hidden md:flex flex-col items-center justify-center gap-4 text-center px-8"
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <MessageSquare size={32} className="text-accent/50" />
              </div>
              <div>
                <p className="text-base font-semibold text-white/70">Select a conversation</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a user from the list to start chatting
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
