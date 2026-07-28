import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, ShieldCheck, X, ExternalLink } from 'lucide-react';
import { useLocation } from 'wouter';

const DISMISS_AFTER_MS = 6000;

export interface ChatNotification {
  id: string;
  senderName: string;
  senderType: 'admin' | 'user';
  preview: string;
  navigateTo: string;
}

interface ChatPopupProps {
  notifications: ChatNotification[];
  onDismiss: (id: string) => void;
}

function NotificationCard({
  notification,
  onDismiss,
}: {
  notification: ChatNotification;
  onDismiss: (id: string) => void;
}) {
  const [, navigate] = useLocation();
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 100 - (elapsed / DISMISS_AFTER_MS) * 100);
      setProgress(remaining);
      if (remaining === 0) {
        onDismiss(notification.id);
      }
    }, 50);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [notification.id, onDismiss]);

  const handleOpenChat = () => {
    onDismiss(notification.id);
    navigate(notification.navigateTo);
  };

  const isAdmin = notification.senderType === 'admin';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="w-80 rounded-xl overflow-hidden shadow-2xl border border-white/10"
      style={{ background: 'hsl(224 70% 8% / 0.97)', backdropFilter: 'blur(20px)' }}
    >
      {/* Progress bar */}
      <div className="h-0.5 bg-white/5">
        <motion.div
          className={`h-full ${isAdmin ? 'bg-emerald-400' : 'bg-accent'}`}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.05, ease: 'linear' }}
        />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                isAdmin
                  ? 'bg-emerald-500/20 border-emerald-500/30'
                  : 'bg-primary/20 border-primary/30'
              }`}
            >
              {isAdmin ? (
                <ShieldCheck size={16} className="text-emerald-400" />
              ) : (
                <MessageCircle size={16} className="text-accent" />
              )}
            </div>
            <div>
              <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider leading-tight">
                New Message
              </p>
              <p className="text-sm font-semibold text-white leading-tight mt-0.5">
                {notification.senderName}
              </p>
            </div>
          </div>
          <button
            onClick={() => onDismiss(notification.id)}
            className="text-white/30 hover:text-white/70 transition-colors shrink-0 mt-0.5"
          >
            <X size={15} />
          </button>
        </div>

        {/* Message preview */}
        <p className="text-sm text-white/70 leading-relaxed mb-3 line-clamp-2 pl-[46px]">
          {notification.preview}
        </p>

        {/* Open Chat button */}
        <div className="pl-[46px]">
          <button
            onClick={handleOpenChat}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
              isAdmin
                ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20'
                : 'bg-accent/15 text-accent hover:bg-accent/25 border border-accent/20'
            }`}
          >
            <ExternalLink size={12} />
            Open Chat
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function ChatPopup({ notifications, onDismiss }: ChatPopupProps) {
  return (
    <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="sync">
        {notifications.slice(0, 3).map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <NotificationCard notification={n} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
