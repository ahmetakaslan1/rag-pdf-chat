import React, { useState, useRef } from 'react';
import { useRAG } from '../../contexts/RAGContext';
import { Upload, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const FileUpload: React.FC = () => {
  const { upload } = useRAG();
  const { isAuthenticated } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFileSize = isAuthenticated ? 50 * 1024 * 1024 : 2 * 1024 * 1024;
  const maxFileLabel = isAuthenticated ? '50 MB' : '2 MB';

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const file = e.dataTransfer.files[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Sadece PDF dosyaları yüklenebilir.');
      return;
    }

    if (file.size > maxFileSize) {
      setError(`Seçilen dosya sınırı aşıyor. Maksimum dosya boyutu: ${maxFileLabel}.`);
      return;
    }

    try {
      await upload(file);
    } catch {
      setError('Dosya yüklenirken beklenmeyen bir hata oluştu.');
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 animate-slide-up">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerSelect}
        className={`glass-panel border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${
          isDragging
            ? 'border-primary bg-primary-glow scale-[1.01]'
            : 'border-color hover:border-primary-glow hover:bg-white/[0.01]'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
        />

        <div className="bg-primary-glow p-4 rounded-full text-primary">
          <Upload size={32} />
        </div>

        <div>
          <p className="text-base font-semibold text-text-primary">
            PDF dosyasını buraya sürükleyin veya <span className="text-primary hover:underline">göz atın</span>
          </p>
          <p className="text-xs text-muted mt-2">
            Maksimum Dosya Boyutu: {maxFileLabel} {!isAuthenticated && '(Giriş yapıldığında 50 MB)'}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-danger/10 border border-danger/20 text-error rounded-xl text-sm">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
