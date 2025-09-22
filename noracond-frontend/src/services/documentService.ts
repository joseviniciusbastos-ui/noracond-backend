import api from '../api/api';

export interface Document {
  id: string;
  nomeArquivo: string;
  descricao: string;
  tamanhoArquivo: number;
  tipoArquivo: string;
  caminhoArquivo: string;
  processoId: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface DocumentsResponse {
  data: Document[];
  total: number;
}

export const documentService = {
  // Obter documentos de um processo específico
  async getDocumentsForProcess(processId: string): Promise<Document[]> {
    const response = await api.get(`/documentos/processo/${processId}`);
    return response.data;
  },

  // Upload de documento
  async uploadDocument(processId: string, file: File, description: string): Promise<Document> {
    const formData = new FormData();
    formData.append('processoId', processId);
    formData.append('file', file);
    formData.append('descricao', description);

    const response = await api.post('/documentos/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Download de documento
  async downloadDocument(documentId: string): Promise<Blob> {
    const response = await api.get(`/documentos/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Obter URL de download do documento
  getDownloadUrl(documentId: string): string {
    return `${api.defaults.baseURL}/documentos/${documentId}/download`;
  },

  // Excluir documento
  async deleteDocument(documentId: string): Promise<void> {
    await api.delete(`/documentos/${documentId}`);
  },

  // Obter documento por ID
  async getDocumentById(documentId: string): Promise<Document> {
    const response = await api.get(`/documentos/${documentId}`);
    return response.data;
  },

  // Atualizar descrição do documento
  async updateDocument(documentId: string, description: string): Promise<Document> {
    const response = await api.put(`/documentos/${documentId}`, {
      descricao: description
    });
    return response.data;
  }
};

export default documentService;