import { useState, useRef, type KeyboardEvent } from 'react';
import { Send, ImageIcon, Loader2 } from 'lucide-react';

interface Props {
  onSend: (text: string) => void;
  onSendImage: (file: File) => void;
  isSending: boolean;
  disabled?: boolean;
}

const ACCEPTED = 'image/jpeg,image/png,image/gif,image/webp';

export default function ChatInput({ onSend, onSendImage, isSending, disabled }: Props) {
  const [text, setText] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!text.trim() || isSending || disabled) return;
    onSend(text.trim());
    setText('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-grow textarea up to ~5 lines
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onSendImage(file);
    // Reset so same file can be re-selected
    e.target.value = '';
  };

  const canSend = text.trim().length > 0 && !isSending && !disabled;

  return (
    <div className="shrink-0 border-t border-white/8 bg-card/40 backdrop-blur-md px-3 py-3">
      <div className="flex items-end gap-2 bg-[hsl(221,55%,17%)] border border-white/8 rounded-2xl px-3 py-2">
        {/* Image upload button */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isSending || disabled}
          className="shrink-0 mb-0.5 text-muted-foreground hover:text-accent transition-colors disabled:opacity-40 disabled:cursor-not-allowed p-1"
          aria-label="Upload image"
        >
          <ImageIcon size={20} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Message Quantum Support…"
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground/50 resize-none outline-none leading-relaxed py-0.5 disabled:opacity-40 min-h-[24px]"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={`
            shrink-0 mb-0.5 w-8 h-8 rounded-full flex items-center justify-center transition-all
            ${canSend
              ? 'bg-primary hover:bg-primary/80 text-white shadow-[0_0_12px_rgba(30,100,255,0.4)]'
              : 'bg-white/5 text-muted-foreground/30 cursor-not-allowed'
            }
          `}
          aria-label="Send message"
        >
          {isSending
            ? <Loader2 size={15} className="animate-spin" />
            : <Send size={15} />
          }
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground/40 text-center mt-1.5">
        Press <kbd className="font-mono">Enter</kbd> to send · <kbd className="font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
