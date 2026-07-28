import { useState, useRef, type KeyboardEvent } from 'react';
import { Send, ImageIcon, Loader2 } from 'lucide-react';

interface Props {
  onSend: (text: string) => void;
  onSendImage: (file: File) => void;
  isSending: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const ACCEPTED = 'image/jpeg,image/png,image/gif,image/webp';

export default function ChatInput({
  onSend,
  onSendImage,
  isSending,
  disabled,
  placeholder = 'Message Quantum Support…',
}: Props) {
  const [text, setText] = useState('');
  const [focused, setFocused] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!text.trim() || isSending || disabled) return;
    onSend(text.trim());
    setText('');
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
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onSendImage(file);
    e.target.value = '';
  };

  const canSend = text.trim().length > 0 && !isSending && !disabled;

  return (
    <div className="shrink-0 border-t border-white/[0.07] bg-[hsl(221,70%,9%)]/80 backdrop-blur-md px-3 py-3">
      <div
        className={[
          'flex items-end gap-2 bg-[hsl(221,55%,16%)] border rounded-2xl px-3 py-2 transition-all duration-150',
          focused
            ? 'border-primary/45 shadow-[0_0_0_1px_hsl(215_82%_46%_/_0.15)]'
            : 'border-white/[0.08]',
        ].join(' ')}
      >
        {/* Image upload button */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={isSending || disabled}
          title="Send image (jpg, png, gif, webp)"
          className="shrink-0 mb-0.5 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/70 hover:text-accent hover:bg-white/[0.06] transition-all duration-100 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Upload image"
        >
          <ImageIcon size={16} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Auto-growing textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          rows={1}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-muted-foreground/40 resize-none outline-none leading-relaxed py-0.5 disabled:opacity-30 min-h-[24px]"
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className={[
            'shrink-0 mb-0.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150',
            canSend
              ? 'bg-primary hover:bg-primary/85 text-white shadow-[0_0_14px_rgba(30,100,255,0.32)] hover:shadow-[0_0_20px_rgba(30,100,255,0.45)] active:scale-90'
              : 'bg-white/[0.05] text-muted-foreground/25 cursor-not-allowed',
          ].join(' ')}
          aria-label="Send message"
        >
          {isSending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} className={canSend ? 'translate-x-px' : ''} />
          )}
        </button>
      </div>
      <p className="text-[10px] text-muted-foreground/30 text-center mt-1.5 select-none">
        <kbd className="font-mono">Enter</kbd> to send ·{' '}
        <kbd className="font-mono">Shift+Enter</kbd> for new line
      </p>
    </div>
  );
}
