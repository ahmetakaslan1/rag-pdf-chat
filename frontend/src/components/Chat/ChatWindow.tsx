import React, { useState, useEffect, useRef } from 'react';
import { getSessionMessages, sendMessage } from '../../api/chat';
import type { Message } from '../../api/chat';
import { useSocket } from '../../contexts/SocketContext';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { AlertCircle, MessageSquare, Sparkles } from 'lucide-react';

interface ChatWindowProps {
  sessionId: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ sessionId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const { socket } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSessionMessages(sessionId);
        setMessages(data);
      } catch {
        setError('Mesajlar yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [sessionId]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join-room', sessionId);

    const handleNewMessage = (msg: Message) => {
      if (msg.sessionId === sessionId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.emit('leave-room', sessionId);
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    setIsSending(true);
    try {
      await sendMessage(sessionId, content);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-primary">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-primary gap-4 text-center p-6">
        <AlertCircle size={48} className="text-error" />
        <p className="text-text-primary font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-primary">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted gap-3">
            <div className="bg-tertiary p-4 rounded-full text-text-secondary">
              <MessageSquare size={32} />
            </div>
            <p className="text-sm">Bu sohbet oturumu henüz boş.</p>
            <p className="text-xs mb-4">Yapay zekaya bu PDF belgesiyle ilgili dilediğiniz soruyu sorabilirsiniz.</p>
            
            {!isSending && (
              <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-lg">
                <button 
                  onClick={() => handleSendMessage("Bana nasıl yardımcı olabilirsin?")}
                  className="px-4 py-2 bg-secondary border border-color rounded-full text-xs text-text-primary hover:bg-tertiary transition-colors"
                >
                  Bana nasıl yardımcı olabilirsin?
                </button>
                <button 
                  onClick={() => handleSendMessage("Bu belgenin özeti nedir?")}
                  className="px-4 py-2 bg-secondary border border-color rounded-full text-xs text-text-primary hover:bg-tertiary transition-colors"
                >
                  Bu belgenin özeti nedir?
                </button>
              </div>
            )}

            {isSending && (
              <div className="flex items-center gap-2 mt-4 text-primary">
                <Sparkles size={16} className="animate-pulse" />
                <span className="text-sm animate-pulse font-medium">Yapay zeka düşünüyor...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto pb-4">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="bg-secondary text-text-primary px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2 border border-color">
                  <Sparkles size={16} className="animate-pulse text-primary shrink-0" />
                  <span className="text-sm animate-pulse font-medium">Yapay zeka düşünüyor...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="w-full bg-secondary border-t border-color">
        <div className="max-w-4xl mx-auto">
          <MessageInput onSend={handleSendMessage} disabled={false} />
        </div>
      </div>
    </div>
  );
};
