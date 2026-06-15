import React from 'react';
import type { Message } from '../../api/chat';
import { Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isAi = message.sender === 'AI';

  return (
    <div
      className={`flex gap-3 w-full animate-fade-in ${isAi ? 'justify-start' : 'justify-end'}`}
    >
      {/* AI avatar — only left side */}
      {isAi && (
        <div
          className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-primary text-white"
          style={{ marginTop: '2px', flexShrink: 0 }}
        >
          <Sparkles size={14} />
        </div>
      )}

      {/* Bubble */}
      <div
        className={`flex flex-col gap-1 ${isAi ? 'items-start' : 'items-end'}`}
        style={{ maxWidth: '72%' }}
      >
        {/* Sender label + time */}
        <div
          className="flex items-center gap-2 px-1"
          style={{ flexDirection: isAi ? 'row' : 'row-reverse' }}
        >
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            {isAi ? 'Yapay Zeka' : 'Siz'}
          </span>
          <span className="text-xs text-muted">
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Message text */}
        <div
          className={`px-4 py-3 text-sm leading-relaxed ${
            isAi ? 'bg-secondary border border-color text-text-primary' : 'text-white'
          }`}
          style={{
            borderRadius: isAi ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
            ...(isAi
              ? {}
              : {
                  background: 'linear-gradient(135deg, var(--primary) 0%, #a78bfa 100%)',
                  boxShadow: '0 4px 14px var(--primary-glow)',
                }),
          }}
        >
          {isAi ? (
            <ReactMarkdown
              components={{
                p: ({ children }) => (
                  <p style={{ marginBottom: '0.5rem', lineHeight: '1.65' }}>{children}</p>
                ),
                strong: ({ children }) => (
                  <strong style={{ fontWeight: 700, color: 'var(--primary)' }}>{children}</strong>
                ),
                em: ({ children }) => (
                  <em style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>{children}</em>
                ),
                ul: ({ children }) => (
                  <ul style={{ paddingLeft: '1.25rem', marginBottom: '0.5rem', listStyleType: 'disc' }}>
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol style={{ paddingLeft: '1.25rem', marginBottom: '0.5rem', listStyleType: 'decimal' }}>
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li style={{ marginBottom: '0.2rem', lineHeight: '1.6' }}>{children}</li>
                ),
                h1: ({ children }) => (
                  <h1 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{children}</h1>
                ),
                h2: ({ children }) => (
                  <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>{children}</h2>
                ),
                h3: ({ children }) => (
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.3rem', color: 'var(--text-primary)' }}>{children}</h3>
                ),
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-');
                  return isBlock ? (
                    <code
                      style={{
                        display: 'block',
                        background: 'var(--bg-tertiary)',
                        borderRadius: '6px',
                        padding: '0.75rem 1rem',
                        fontSize: '0.8rem',
                        overflowX: 'auto',
                        marginBottom: '0.5rem',
                        fontFamily: 'monospace',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {children}
                    </code>
                  ) : (
                    <code
                      style={{
                        background: 'var(--bg-tertiary)',
                        borderRadius: '4px',
                        padding: '0.1rem 0.35rem',
                        fontSize: '0.82rem',
                        fontFamily: 'monospace',
                        color: 'var(--primary)',
                      }}
                    >
                      {children}
                    </code>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote
                    style={{
                      borderLeft: '3px solid var(--primary)',
                      paddingLeft: '0.75rem',
                      color: 'var(--text-secondary)',
                      fontStyle: 'italic',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {children}
                  </blockquote>
                ),
                hr: () => (
                  <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.75rem 0' }} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            <span style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {message.content}
            </span>
          )}
        </div>
      </div>

      {/* User avatar — only right side */}
      {!isAi && (
        <div
          className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-primary/20 text-primary"
          style={{ marginTop: '2px', flexShrink: 0 }}
        >
          <User size={14} />
        </div>
      )}
    </div>
  );
};
