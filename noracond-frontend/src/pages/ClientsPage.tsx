import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, Search, Filter, AlertCircle, Trash2 } from 'lucide-react';
import ClientsTable from '../components/clients/ClientsTable';
import ClientModal from '../components/clients/ClientModal';
import { Pagination } from '../components/common/Pagination';
import clientService from '../services/clientService';
import type { Client, ClientFormData, ClientsResponse, ClientsFilters } from '../types/client';

const ClientsPage: React.FC = () => {
  // Estados principais
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de paginação e filtros
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<boolean | undefined>(undefined);
  
  // Estados do modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Estados de confirmação de exclusão
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    clientId: string;
    clientName: string;
  }>({
    isOpen: false,
    clientId: '',
    clientName: ''
  });

  // Debounce para busca
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);

  // Carrega clientes
  const loadClients = useCallback(async (filters: ClientsFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response: ClientsResponse = await clientService.getClients({
        page: currentPage,
        pageSize: 10,
        searchTerm: searchTerm || undefined,
        ativo: statusFilter,
        ...filters
      });
      
      setClients(response.clients);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalCount);
      setCurrentPage(response.currentPage);
    } catch (err) {
      setError('Erro ao carregar clientes. Tente novamente.');
      console.error('Erro ao carregar clientes:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  // Efeito para carregar clientes inicialmente
  useEffect(() => {
    loadClients();
  }, [loadClients]);

  // Debounce para busca
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    
    // Limpa o timeout anterior
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    
    // Define novo timeout
    const timeout = setTimeout(() => {
      setCurrentPage(1); // Reset para primeira página
      loadClients({ page: 1, searchTerm: value });
    }, 500);
    
    setSearchDebounce(timeout);
  };

  // Mudança de página
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadClients({ page });
  };

  // Mudança de filtro de status
  const handleStatusFilterChange = (status: boolean | undefined) => {
    setStatusFilter(status);
    setCurrentPage(1);
    loadClients({ page: 1, ativo: status });
  };

  // Abrir modal para novo cliente
  const handleNewClient = () => {
    setClientToEdit(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar cliente
  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setIsModalOpen(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setClientToEdit(null);
  };

  // Salvar cliente (criar ou atualizar)
  const handleSaveClient = async (clientData: ClientFormData) => {
    try {
      setModalLoading(true);
      
      if (clientToEdit) {
        // Atualizar cliente existente
        await clientService.updateClient(clientToEdit.id, clientData);
      } else {
        // Criar novo cliente
        await clientService.createClient(clientData);
      }
      
      // Recarregar lista
      await loadClients();
      
      // Fechar modal
      handleCloseModal();
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      throw err; // Re-throw para o modal tratar
    } finally {
      setModalLoading(false);
    }
  };

  // Confirmar exclusão
  const handleDeleteClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setDeleteConfirm({
        isOpen: true,
        clientId,
        clientName: client.nomeCompleto
      });
    }
  };

  // Executar exclusão
  const confirmDeleteClient = async () => {
    try {
      setLoading(true);
      await clientService.deleteClient(deleteConfirm.clientId);
      
      // Recarregar lista
      await loadClients();
      
      // Fechar modal de confirmação
      setDeleteConfirm({ isOpen: false, clientId: '', clientName: '' });
    } catch (err) {
      setError('Erro ao excluir cliente. Tente novamente.');
      console.error('Erro ao excluir cliente:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cancelar exclusão
  const cancelDeleteClient = () => {
    setDeleteConfirm({ isOpen: false, clientId: '', clientName: '' });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Clientes</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie todos os seus clientes em um só lugar
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={handleNewClient}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Cliente
            </button>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Campo de busca */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Buscar por nome, CPF/CNPJ ou email..."
              />
            </div>
          </div>

          {/* Filtro de status */}
          <div className="sm:w-48">
            <select
              value={statusFilter === undefined ? 'all' : statusFilter.toString()}
              onChange={(e) => {
                const value = e.target.value;
                handleStatusFilterChange(
                  value === 'all' ? undefined : value === 'true'
                );
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os status</option>
              <option value="true">Apenas ativos</option>
              <option value="false">Apenas inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabela de clientes */}
      <div className="mb-6">
        <ClientsTable
          clients={clients}
          loading={loading}
          onEdit={handleEditClient}
          onDelete={handleDeleteClient}
        />
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={10}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modal de cliente */}
      <ClientModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveClient}
        clientToEdit={clientToEdit}
        loading={modalLoading}
      />

      {/* Modal de confirmação de exclusão */}
      {deleteConfirm.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Excluir Cliente
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Tem certeza que deseja excluir o cliente{' '}
                        <span className="font-medium">{deleteConfirm.clientName}</span>?
                        Esta ação não pode ser desfeita.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={confirmDeleteClient}
                  disabled={loading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  Excluir
                </button>
                <button
                  type="button"
                  onClick={cancelDeleteClient}
                  disabled={loading}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsPage;