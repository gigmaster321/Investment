import { ShieldCheck } from 'lucide-react';

export default function ChatHeader() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card/60 backdrop-blur-md border-b border-white/8 shrink-0">
      {/* Avatar */}
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
          <ShieldCheck size={20} className="text-accent" />
        </div>
        {/* Online dot */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-background shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">Quantum Support</p>
        <p className="text-[11px] text-emerald-400 leading-tight">Online</p>
      </div>

      {/* Response time badge */}
      <span className="hidden sm:block text-[10px] font-medium text-muted-foreground bg-white/5 border border-white/8 px-2.5 py-1 rounded-full whitespace-nowrap">
        Typically replies in minutes
      </span>
    </div>
  );
}
