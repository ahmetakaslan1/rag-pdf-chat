import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useRAG } from '../../contexts/RAGContext';
import { useAuth } from '../../contexts/AuthContext';
import {
  FileText,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  LogOut,
  User,
  MessageSquare,
  Sparkles,
  Clock,
  Edit2,
} from 'lucide-react';
import { deleteSession as apiDeleteSession } from '../../api/chat';

export const Sidebar: React.FC = () => {
  const { documents, sessions, createNewSession, refreshData, deleteUploadedDocument, renameChatSession } = useRAG();
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { sessionId: currentSessionId } = useParams<{ sessionId: string }>();

  const [expandedDocs, setExpandedDocs] = useState<Record<string, boolean>>({});
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const toggleDoc = (docId: string) => {
    setExpandedDocs((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  const handleCreateSession = async (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    try {
      const session = await createNewSession(docId);
      setExpandedDocs((prev) => ({ ...prev, [docId]: true }));
      navigate(`/chat/${session.id}`);
    } catch {
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await apiDeleteSession(id);
      await refreshData();
      if (currentSessionId === id) {
        navigate('/');
      }
    } catch {
    }
  };

  const handleDeleteDocument = async (e: React.MouseEvent, docId: string, fileName: string) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`"${fileName}" belgesini ve bu belgeye bağlı tüm sohbet odalarını silmek istediğinize emin misiniz?`);
    if (!confirmDelete) return;

    try {
      await deleteUploadedDocument(docId);
      navigate('/');
    } catch {
    }
  };

  const handleRenameSubmit = async (sessionId: string) => {
    if (editTitle.trim()) {
      try {
        await renameChatSession(sessionId, editTitle.trim());
      } catch {}
    }
    setEditingSessionId(null);
  };

  return (
    <aside className="w-80 border-r border-color bg-secondary flex flex-col h-full shrink-0">
      <div className="p-6 border-b border-color flex items-center gap-3">
        <div className="bg-primary p-2 rounded-lg text-white">
          <Sparkles size={20} />
        </div>
        <div>
          <h1 className="text-lg font-bold text-primary-hover tracking-wide m-0 p-0 text-left" style={{ fontSize: '1.2rem' }}>
            RAG AI Chat
          </h1>
          <p className="text-xs text-muted text-left">PDF Bilgi Asistanı</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
        <div className="flex items-center justify-between px-2 text-xs font-semibold text-muted uppercase tracking-wider">
          <span>DOKÜMANLAR VE SOHBETLER</span>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-color rounded-lg text-sm text-muted">
            Henüz PDF yüklenmedi. Ana sayfadan PDF yükleyerek başlayın.
          </div>
        ) : (
          <div className="space-y-1">
            {documents.map((doc) => {
              const isExpanded = expandedDocs[doc.id];
              const docSessions = sessions.filter((s) => s.documentId === doc.id);

              return (
                <div key={doc.id} className="space-y-1">
                  <div
                    onClick={() => toggleDoc(doc.id)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-tertiary cursor-pointer group transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-muted">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                      <FileText size={16} className="text-primary shrink-0" />
                      <span className="text-sm truncate font-medium text-text-primary">
                        {doc.fileName}
                      </span>
                      <div className="tooltip-container shrink-0 cursor-help" style={{ marginLeft: '4px' }} onClick={(e) => e.stopPropagation()}>
                        <Clock size={12} className="text-muted hover:text-primary transition-colors" />
                        <span className="tooltip-content">
                          {new Date(doc.createdAt).toLocaleString('tr-TR')}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
                      <button
                        onClick={(e) => handleCreateSession(e, doc.id)}
                        className="p-1 hover:bg-primary-glow text-primary rounded transition-all"
                        title="Yeni Sohbet Başlat"
                      >
                        <Plus size={16} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteDocument(e, doc.id, doc.fileName)}
                        className="p-1 hover:bg-danger text-error rounded transition-all"
                        title="Belgeyi Sil"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="pl-6 border-l border-color ml-4 space-y-1 animate-slide-up">
                      {docSessions.length === 0 ? (
                        <div className="text-xs text-muted py-1.5 px-2">
                          Sohbet bulunmuyor.
                        </div>
                      ) : (
                        docSessions.map((session) => {
                          const isActive = currentSessionId === session.id;
                          const isEditing = editingSessionId === session.id;
                          return (
                            <div
                              key={session.id}
                              onClick={() => !isEditing && navigate(`/chat/${session.id}`)}
                              className={`flex items-center justify-between p-2 rounded-md cursor-pointer group transition-all text-sm ${
                                isActive
                                  ? 'bg-primary-glow text-primary border-l-2 border-primary'
                                  : 'text-text-secondary hover:bg-tertiary'
                              }`}
                            >
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onBlur={() => handleRenameSubmit(session.id)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRenameSubmit(session.id);
                                    if (e.key === 'Escape') setEditingSessionId(null);
                                  }}
                                  autoFocus
                                  className="w-full bg-primary border border-color rounded px-2 py-1 text-xs text-text-primary outline-none"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <>
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <MessageSquare size={14} className="shrink-0" />
                                    <span className="truncate">{session.title}</span>
                                  </div>
                                  <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 shrink-0">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingSessionId(session.id);
                                        setEditTitle(session.title);
                                      }}
                                      className="p-1 hover:bg-primary-glow text-primary rounded transition-all"
                                      title="Sohbeti Yeniden Adlandır"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      onClick={(e) => handleDeleteSession(e, session.id)}
                                      className="p-1 hover:bg-danger text-error rounded transition-all"
                                      title="Sohbeti Sil"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })
                      )}
                      <button
                        onClick={(e) => handleCreateSession(e, doc.id)}
                        className="flex items-center gap-1.5 p-2 rounded-md hover:bg-tertiary text-xs text-primary font-medium w-full transition-all"
                      >
                        <Plus size={12} />
                        <span>Yeni Sohbet Ekle</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-color bg-tertiary">
        {!isAuthenticated ? (
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-xs text-warning bg-warning/10 p-2.5 rounded-lg border border-warning/20">
              <Clock size={16} className="shrink-0 mt-0.5" />
              <span>Misafir oturumu aktif. Yüklediğiniz dosyalar 30 dakika sonra otomatik silinecektir.</span>
            </div>
            <div className="flex gap-2">
              <Link to="/login" className="btn-secondary text-xs py-1.5 px-3 flex-1 text-center font-semibold">
                Giriş Yap
              </Link>
              <Link to="/register" className="btn-primary text-xs py-1.5 px-3 flex-1 text-center font-semibold">
                Kayıt Ol
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="bg-primary/20 p-2 rounded-full text-primary">
                <User size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate text-text-primary">{user?.email}</p>
                <p className="text-xs text-muted capitalize">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-danger text-error rounded-lg transition-all"
              title="Çıkış Yap"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
