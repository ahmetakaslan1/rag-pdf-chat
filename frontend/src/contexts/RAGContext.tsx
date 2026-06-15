import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getDocuments, uploadDocument, deleteDocument } from '../api/documents';
import type { DocumentInfo } from '../api/documents';
import { getSessions, createSession, renameSession } from '../api/chat';
import type { ChatSession } from '../api/chat';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

interface ProcessingFile {
  id: string;
  name: string;
  status: 'parsing' | 'chunking' | 'embedding' | 'completed' | 'failed';
  percent: number;
  error?: string;
}

interface RAGContextType {
  documents: DocumentInfo[];
  sessions: ChatSession[];
  processingFiles: Record<string, ProcessingFile>;
  loading: boolean;
  refreshData: () => Promise<void>;
  upload: (file: File) => Promise<void>;
  createNewSession: (documentId: string) => Promise<ChatSession>;
  removeProcessingFile: (id: string) => void;
  deleteUploadedDocument: (id: string) => Promise<void>;
  renameChatSession: (id: string, title: string) => Promise<void>;
}

const RAGContext = createContext<RAGContextType | undefined>(undefined);

export const RAGProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [processingFiles, setProcessingFiles] = useState<Record<string, ProcessingFile>>({});
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { socket } = useSocket();

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [docsData, sessionsData] = await Promise.all([
        getDocuments(),
        getSessions(),
      ]);
      setDocuments(docsData);
      setSessions(sessionsData);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  const upload = async (file: File) => {
    const tempId = crypto.randomUUID();
    setProcessingFiles((prev) => ({
      ...prev,
      [tempId]: {
        id: tempId,
        name: file.name,
        status: 'parsing',
        percent: 0,
      },
    }));

    try {
      const result = await uploadDocument(file);
      const docId = result.documentId;

      setProcessingFiles((prev) => {
        const next = { ...prev };
        delete next[tempId];
        next[docId] = {
          id: docId,
          name: file.name,
          status: 'parsing',
          percent: 10,
        };
        return next;
      });
    } catch (err: any) {
      setProcessingFiles((prev) => ({
        ...prev,
        [tempId]: {
          ...prev[tempId],
          status: 'failed',
          percent: 0,
          error: err.response?.data?.message || 'Yükleme başarısız oldu.',
        },
      }));
    }
  };

  const createNewSession = async (documentId: string) => {
    const session = await createSession(documentId);
    await refreshData();
    return session;
  };

  const removeProcessingFile = (id: string) => {
    setProcessingFiles((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const deleteUploadedDocument = async (id: string) => {
    await deleteDocument(id);
    setProcessingFiles((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    await refreshData();
  };

  const renameChatSession = async (id: string, title: string) => {
    await renameSession(id, title);
    await refreshData();
  };

  useEffect(() => {
    refreshData();
  }, [user, isAuthenticated, refreshData]);

  useEffect(() => {
    if (!socket) return;

    const handleProgress = (data: {
      documentId: string;
      status: ProcessingFile['status'];
      percent: number;
      error?: string;
    }) => {
      setProcessingFiles((prev) => {
        const fileKey = data.documentId;
        const currentFile = prev[fileKey];

        const name = currentFile?.name || 'Doküman';

        if (data.status === 'completed') {
          refreshData();
          const next = { ...prev };
          delete next[fileKey];
          return next;
        }

        return {
          ...prev,
          [fileKey]: {
            id: fileKey,
            name,
            status: data.status,
            percent: data.percent,
            error: data.error,
          },
        };
      });
    };

    socket.on('processing-progress', handleProgress);

    return () => {
      socket.off('processing-progress', handleProgress);
    };
  }, [socket, refreshData]);

  return (
    <RAGContext.Provider
      value={{
        documents,
        sessions,
        processingFiles,
        loading,
        refreshData,
        upload,
        createNewSession,
        removeProcessingFile,
        deleteUploadedDocument,
        renameChatSession,
      }}
    >
      {children}
    </RAGContext.Provider>
  );
};

export const useRAG = () => {
  const context = useContext(RAGContext);
  if (context === undefined) {
    throw new Error('useRAG must be used within a RAGProvider');
  }
  return context;
};
