import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ChatWindow } from '../components/Chat/ChatWindow';

export const ChatPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  if (!sessionId) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <ChatWindow sessionId={sessionId} />
    </div>
  );
};
