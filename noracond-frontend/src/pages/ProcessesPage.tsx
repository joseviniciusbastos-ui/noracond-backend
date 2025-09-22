import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { Process, ProcessFormData, ProcessesFilters, ProcessStatus } from '../types/process';
import { processService } from '../services/processService';
import { ProcessesTable } from '../components/processes/ProcessesTable';
import { ProcessModal } from '../components/processes/ProcessModal';
import { ProcessFilters } from '../components/processes/ProcessFilters';
import { Pagination } from '../components/common/Pagination';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { useDebounce } from '../hooks/useDebounce';
import { toast } from 'react-hot-toast';

export const ProcessesPage: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Estados do modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Estados de confirmação de exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<Process | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Estados de filtros e busca
  const [filters, setFilters] = useState<ProcessesFilters>({
    searchTerm: '',
    status: undefined,
    clienteId: '',
    page: 1,
    pageSize: 10
  });
  
  // Debounce da busca
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 500);

  // Carregar processos
  const loadProcesses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await processService.getProcesses({
        ...filters,
        searchTerm: debouncedSearchTerm
      });
      
      setProcesses(response.data);
      setTotalPages(response.totalPages);
      setTotalItems(response.total);
    } catch (error) {
      console.error('Erro ao carregar processos:', error);
      toast.error('Erro ao carregar processos');
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearchTerm]);

  // Carregar processos quando filtros mudarem
  useEffect(() => {
    loadProcesses();
  }, [loadProcesses]);

  // Handlers de filtros
  const handleSearchChange = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm, page: 1 }));
  };

  const handleFiltersChange = (newFilters: ProcessFilters) => {
    setFilters(prev => ({
      ...prev,
      status: newFilters.status,
      page: 1 // Reset page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Handlers do modal
  const handleCreateProcess = () => {
    setEditingProcess(null);
    setIsModalOpen(true);
  };

  const handleEditProcess = (process: Process) => {
    setEditingProcess(process);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProcess(null);
  };

  const handleSubmitProcess = async (data: ProcessFormData) => {
    try {
      setModalLoading(true);
      
      if (editingProcess) {
        await processService.updateProcess(editingProcess.id, data);
        toast.success('Processo atualizado com sucesso!');
      } else {
        await processService.createProcess(data);
        toast.success('Processo criado com sucesso!');
      }
      
      await loadProcesses();
      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar processo:', error);
      toast.error('Erro ao salvar processo');
      throw error;
    } finally {
      setModalLoading(false);
    }
  };

  // Handlers de exclusão
  const handleDeleteProcess = (process: Process) => {
    setProcessToDelete(process);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!processToDelete) return;
    
    try {
      setDeleteLoading(true);
      await processService.deleteProcess(processToDelete.id);
      toast.success('Processo excluído com sucesso!');
      await loadProcesses();
      setIsDeleteModalOpen(false);
      setProcessToDelete(null);
    } catch (error) {
      console.error('Erro ao excluir processo:', error);
      toast.error('Erro ao excluir processo');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setProcessToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Processos</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie todos os processos jurídicos dos seus clientes
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={handleCreateProcess}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Processo
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">T</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total de Processos</dt>
                  <dd className="text-lg font-medium text-gray-900">{totalItems}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Em Andamento</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {processes.filter(p => p.status === ProcessStatus.EM_ANDAMENTO).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">S</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Suspensos</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {processes.filter(p => p.status === ProcessStatus.SUSPENSO).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-500 rounded-md flex items-center justify-center">
                  <span className="text-white text-sm font-medium">F</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Finalizados</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {processes.filter(p => p.status === ProcessStatus.FINALIZADO).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <ProcessFilters
        filters={{ status: filters.status }}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearchChange}
        searchTerm={filters.searchTerm}
      />

      {/* Tabela de Processos */}
      <ProcessesTable
        processes={processes}
        loading={loading}
        onEdit={handleEditProcess}
        onDelete={handleDeleteProcess}
      />

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={filters.pageSize}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modal de Processo */}
      <ProcessModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitProcess}
        process={editingProcess}
        loading={modalLoading}
      />

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Excluir Processo"
        message={`Tem certeza que deseja excluir o processo "${processToDelete?.numeroProcesso}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        loading={deleteLoading}
        type="danger"
      />
    </div>
  );
};

export default ProcessesPage;