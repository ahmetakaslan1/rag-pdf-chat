import api from './axios';

export interface ChatSession {
  id: string;
  documentId: string;
  title: string;
  createdAt: string;
}

export interface Message {
  id: string;
  sessionId: string;
  sender: 'USER' | 'AI';
  content: string;
  createdAt: string;
}

export const createSession = async (documentId: string): Promise<ChatSession> => {
  const response = await api.post('/chat/sessions', { documentId });
  return response.data;
};

export const getSessions = async (): Promise<ChatSession[]> => {
  const response = await api.get('/chat/sessions');
  return response.data;
};

export const getSessionMessages = async (sessionId: string): Promise<Message[]> => {
  const response = await api.get(`/chat/sessions/${sessionId}/messages`);
  return response.data;
};

export const sendMessage = async (sessionId: string, content: string): Promise<Message> => {
  const response = await api.post(`/chat/sessions/${sessionId}/messages`, { content });
  return response.data;
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  await api.delete(`/chat/sessions/${sessionId}`);
};

export const renameSession = async (sessionId: string, title: string): Promise<ChatSession> => {
  const response = await api.patch(`/chat/sessions/${sessionId}`, { title });
  return response.data;
};
