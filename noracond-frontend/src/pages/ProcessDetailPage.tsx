import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, FileText, Calendar, User, Building, AlertCircle } from 'lucide-react';
import { Process } from '../types/process';
import { Document } from '../services/documentService';
import { processService } from '../services/processService';
import { documentService } from '../services/documentService';
import { DocumentList } from '../components/documents/DocumentList';
import { UploadModal } from '../components/documents/UploadModal';
import StatusBadge from '../components/common/StatusBadge';
import { formatDate } from '../utils/dateUtils';
import { toast } from 'react-hot-toast';

export const ProcessDetailPage: React.FC = () => {
  const { processId } = useParams<{ processId: string }>();
  const navigate = useNavigate();
  
  const [process, setProcess] = useState<Process | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do processo
  const loadProcess = useCallback(async () => {
    if (!processId) {
      setError('ID do processo não fornecido');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const processData = await processService.getProcessById(processId);
      setProcess(processData);
    } catch (err: any) {
      console.error('Erro ao carregar processo:', err);
      setError('Erro ao carregar dados do processo');
      toast.error('Erro ao carregar processo');
    } finally {
      setLoading(false);
    }
  }, [processId]);

  // Carregar documentos do processo
  const loadDocuments = useCallback(async () => {
    if (!processId) return;

    try {
      setDocumentsLoading(true);
      const documentsData = await documentService.getDocumentsForProcess(processId);
      setDocuments(documentsData);
    } catch (err: any) {
      console.error('Erro ao carregar documentos:', err);
      toast.error('Erro ao carregar documentos');
    } finally {
      setDocumentsLoading(false);
    }
  }, [processId]);

  // Carregar dados iniciais
  useEffect(() => {
    loadProcess();
    loadDocuments();
  }, [loadProcess, loadDocuments]);

  // Handler para upload de documento
  const handleUploadDocument = async (file: File, description: string) => {
    if (!processId) return;

    try {
      await documentService.uploadDocument(processId, file, description);
      toast.success('Documento enviado com sucesso!');
      setUploadModalOpen(false);
      await loadDocuments(); // Recarregar lista de documentos
    } catch (err: any) {
      console.error('Erro ao fazer upload:', err);
      throw new Error(err.response?.data?.message || 'Erro ao enviar documento');
    }
  };

  // Handler para download de documento
  const handleDownloadDocument = async (document: Document) => {
    try {
      const blob = await documentService.downloadDocument(document.id);
      
      // Criar URL temporária para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.nomeArquivo;
      document.body.appendChild(link);
      link.click();
      
      // Limpar recursos
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Download iniciado');
    } catch (err: any) {
      console.error('Erro ao fazer download:', err);
      toast.error('Erro ao baixar documento');
    }
  };

  // Handler para exclusão de documento
  const handleDeleteDocument = async (documentId: string) => {
    try {
      await documentService.deleteDocument(documentId);
      toast.success('Documento excluído com sucesso!');
      await loadDocuments(); // Recarregar lista de documentos
    } catch (err: any) {
      console.error('Erro ao excluir documento:', err);
      toast.error('Erro ao excluir documento');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !process) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="h-6 w-6" />
              <div>
                <h3 className="text-lg font-medium">Erro ao carregar processo</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {error || 'Processo não encontrado'}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate('/processes')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Processos
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header com navegação */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/processes')}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Voltar para Processos
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Processo {process.numeroProcesso}
              </h1>
              <p className="text-gray-600 mt-1">{process.titulo}</p>
            </div>
            <StatusBadge status={process.status} />
          </div>
        </div>

        {/* Informações do processo */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Informações do Processo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Building className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Cliente</p>
                <p className="text-sm text-gray-600">{process.clienteNome}</p>
                <p className="text-xs text-gray-500">{process.clienteCpfCnpj}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Responsável</p>
                <p className="text-sm text-gray-600">{process.usuarioResponsavelNome}</p>
                <p className="text-xs text-gray-500">{process.usuarioResponsavelEmail}</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Data de Abertura</p>
                <p className="text-sm text-gray-600">{formatDate(process.dataAbertura)}</p>
                {process.dataEncerramento && (
                  <p className="text-xs text-gray-500">
                    Encerrado em {formatDate(process.dataEncerramento)}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {process.descricao && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-900 mb-2">Descrição</p>
              <p className="text-sm text-gray-600">{process.descricao}</p>
            </div>
          )}
        </div>

        {/* Seção de documentos */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-medium text-gray-900">
                  Documentos
                </h2>
              </div>
              <button
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Documento
              </button>
            </div>
          </div>
          
          <div className="p-6">
            <DocumentList
              documents={documents}
              loading={documentsLoading}
              onDelete={handleDeleteDocument}
              onDownload={handleDownloadDocument}
            />
          </div>
        </div>
      </div>

      {/* Modal de upload */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadDocument}
        processId={processId || ''}
      />
    </div>
  );
};

export default ProcessDetailPage;