import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  disabled: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, disabled }) => {
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || disabled || sending) return;

    const text = content.trim();
    setContent('');
    setSending(true);
    
    try {
      await onSend(text);
    } catch {
      setContent(text);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 flex gap-3">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={disabled || sending}
        placeholder="Belge hakkında bir soru sorun..."
        className="flex-1 rounded-xl bg-tertiary border-color"
      />
      <button
        type="submit"
        disabled={!content.trim() || disabled || sending}
        className="btn-primary rounded-xl px-5 shrink-0"
      >
        {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
      </button>
    </form>
  );
};
