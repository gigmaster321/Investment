import { MessageCircle } from 'lucide-react';

interface Props {
  unreadCount?: number;
  onClick: () => void;
}

export default function ChatPopupButton({ unreadCount = 0, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-14 h-14 rounded-full bg-primary hover:bg-primary/80 text-white flex items-center justify-center shadow-[0_4px_20px_rgba(30,100,255,0.4)] transition-all active:scale-95"
      aria-label="Open chat"
    >
      <MessageCircle size={24} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center border-2 border-background">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
