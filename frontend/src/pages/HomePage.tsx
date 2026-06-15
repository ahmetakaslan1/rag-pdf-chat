import React from 'react';
import { FileUpload } from '../components/Documents/FileUpload';
import { ProcessingStatus } from '../components/Documents/ProcessingStatus';
import { FileText, Sparkles, MessageSquare } from 'lucide-react';
import { useRAG } from '../contexts/RAGContext';

export const HomePage: React.FC = () => {
  const { documents } = useRAG();

  return (
    <div className="flex-1 overflow-y-auto min-h-0 p-8 flex flex-col items-center justify-start bg-primary">
      <div className="w-full max-w-4xl space-y-10 py-6">
        <div className="text-center space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary tracking-tight">
            Akıllı PDF RAG Asistanı
          </h2>
          <p className="text-sm md:text-base text-text-secondary max-w-2xl mx-auto">
            PDF belgelerinizi sisteme yükleyin, yapay zeka belgelerinizi tarasın ve anında sorularınızı yanıtlamaya başlasın.
          </p>
        </div>

        <div className="space-y-6">
          <FileUpload />
          <ProcessingStatus />
        </div>

        {documents.length > 0 && (
          <div className="max-w-2xl mx-auto pt-6 border-t border-color space-y-4">
            <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wider text-center">
              YÜKLENMİŞ BELGELERİNİZ
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documents.slice(0, 4).map((doc) => (
                <div key={doc.id} className="glass-panel border border-color rounded-xl p-3 flex items-center justify-between hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText size={18} className="text-primary shrink-0" />
                    <span className="text-sm truncate text-text-primary font-medium">{doc.fileName}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted bg-tertiary px-2 py-0.5 rounded-full">
                    <MessageSquare size={10} />
                    <span>Sohbetler</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-center text-muted">
              Sol menüdeki belgelerin yanındaki <span className="font-semibold text-primary">+</span> ikonuna tıklayarak yeni bir sohbet odası başlatabilirsiniz.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-6">
          <div className="glass-card p-5 flex flex-col gap-2">
            <div className="text-primary font-semibold text-sm flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>1. Dosyanızı Yükleyin</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              PDF belgelerinizi sürükleyip bırakarak yükleyin. Sistem metinleri ayrıştırır.
            </p>
          </div>
          <div className="glass-card p-5 flex flex-col gap-2">
            <div className="text-primary font-semibold text-sm flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>2. Vektörleştirme</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Gemini API ile metin parçalarının semantik vektör modelleri çıkarılır ve veritabanına kaydedilir.
            </p>
          </div>
          <div className="glass-card p-5 flex flex-col gap-2">
            <div className="text-primary font-semibold text-sm flex items-center gap-1.5">
              <Sparkles size={14} />
              <span>3. Sorularınızı Sorun</span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Oluşturulan sohbet penceresinden belgenizle ilgili sorular sorun ve semantik arama destekli cevaplar alın.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
