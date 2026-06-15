import React from 'react';
import { useRAG } from '../../contexts/RAGContext';
import { FileText, Loader2, AlertCircle, X } from 'lucide-react';

export const ProcessingStatus: React.FC = () => {
  const { processingFiles, removeProcessingFile, deleteUploadedDocument } = useRAG();

  const activeFiles = Object.values(processingFiles);

  if (activeFiles.length === 0) return null;

  const handleCancel = async (id: string, name: string) => {
    const confirmCancel = window.confirm(`"${name}" belgesinin yüklenmesini iptal etmek istediğinize emin misiniz?`);
    if (!confirmCancel) return;

    try {
      await deleteUploadedDocument(id);
    } catch {
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'parsing':
        return 'Metin ayrıştırılıyor...';
      case 'chunking':
        return 'İçerik bölümleniyor...';
      case 'embedding':
        return 'Vektör embedding modelleri çıkarılıyor...';
      case 'completed':
        return 'Tamamlandı';
      case 'failed':
        return 'Hata Oluştu';
      default:
        return 'Bekleniyor...';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 space-y-3 animate-slide-up">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider px-1">
        YÜKLENEN BELGE DURUMLARI
      </h3>
      <div className="space-y-2">
        {activeFiles.map((file) => {
          const isFailed = file.status === 'failed';
          const statusText = getStatusText(file.status);

          return (
            <div
              key={file.id}
              className={`glass-panel border border-color rounded-xl p-4 flex flex-col gap-3 relative ${
                isFailed ? 'border-danger/30' : ''
              }`}
            >
              {isFailed && (
                <button
                  onClick={() => removeProcessingFile(file.id)}
                  className="absolute top-3 right-3 text-muted hover:text-text-primary rounded-lg transition-all"
                >
                  <X size={16} />
                </button>
              )}

              {!isFailed && file.status !== 'completed' && (
                <button
                  onClick={() => handleCancel(file.id, file.name)}
                  className="absolute top-3 right-3 text-muted hover:text-error rounded-lg transition-all"
                  title="Yüklemeyi İptal Et"
                >
                  <X size={16} />
                </button>
              )}

              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${isFailed ? 'bg-danger/10 text-error' : 'bg-primary/10 text-primary'}`}>
                  {isFailed ? (
                    <AlertCircle size={20} />
                  ) : file.status === 'completed' ? (
                    <FileText size={20} />
                  ) : (
                    <Loader2 size={20} className="animate-spin" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate text-text-primary pr-6">{file.name}</p>
                  <p className={`text-xs mt-0.5 ${isFailed ? 'text-error font-medium' : 'text-muted'}`}>
                    {statusText} {!isFailed && `${file.percent}%`}
                  </p>
                </div>
              </div>

              {!isFailed && (
                <div className="w-full h-1.5 bg-tertiary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${file.percent}%` }}
                  />
                </div>
              )}

              {isFailed && file.error && (
                <p className="text-xs text-error bg-danger/5 p-2 rounded-lg border border-danger/10">
                  {file.error}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
