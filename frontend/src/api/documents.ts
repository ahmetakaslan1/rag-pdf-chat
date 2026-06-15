import api from './axios';

export interface DocumentInfo {
  id: string;
  fileName: string;
  createdAt: string;
}

export const uploadDocument = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getDocuments = async (): Promise<DocumentInfo[]> => {
  const response = await api.get('/documents');
  return response.data;
};

export const getDocument = async (id: string) => {
  const response = await api.get(`/documents/${id}`);
  return response.data;
};

export const deleteDocument = async (id: string): Promise<void> => {
  await api.delete(`/documents/${id}`);
};
