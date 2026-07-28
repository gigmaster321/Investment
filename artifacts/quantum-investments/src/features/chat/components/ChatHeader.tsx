import { ShieldCheck } from 'lucide-react';

export default function ChatHeader() {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 bg-[hsl(221,70%,10%)]/90 backdrop-blur-md border-b border-white/[0.07] shrink-0">
      {/* Avatar with gradient ring and live indicator */}
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/35 to-accent/20 border border-primary/40 flex items-center justify-center shadow-[0_0_14px_rgba(30,100,255,0.18)]">
          <ShieldCheck size={19} className="text-accent" />
        </div>
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[hsl(221,70%,10%)] shadow-[0_0_8px_rgba(52,211,153,0.65)]" />
      </div>

      {/* Name + status */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-tight">Quantum Support</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
          <p className="text-[11px] text-emerald-400/90 leading-tight truncate">
            Online · Typically replies in minutes
          </p>
        </div>
      </div>
    </div>
  );
}
