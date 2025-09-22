import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { 
  Financial, 
  FinancialsFilters, 
  FinancialFormData, 
  FinancialType, 
  FinancialStatus 
} from '../types/financial';
import { financialService } from '../services/financialService';
import FinancialsTable from '../components/financials/FinancialsTable';
import FinancialModal from '../components/financials/FinancialModal';
import MarkAsPaidModal from '../components/financials/MarkAsPaidModal';
import Button from '../components/common/Button';
import { Pagination } from '../components/common/Pagination';
import { ConfirmationModal } from "../components/common/ConfirmationModal";
import { toast } from 'react-hot-toast';

const FinancialsPage: React.FC = () => {
  const [financials, setFinancials] = useState<Financial[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  // Estados dos modais
  const [isFinancialModalOpen, setIsFinancialModalOpen] = useState(false);
  const [isMarkAsPaidModalOpen, setIsMarkAsPaidModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFinancial, setSelectedFinancial] = useState<Financial | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Estados dos filtros
  const [filters, setFilters] = useState<FinancialsFilters>({
    searchTerm: '',
    tipo: '',
    status: '',
    processoId: '',
    page: 1,
    pageSize: 10
  });

  const [showFilters, setShowFilters] = useState(false);

  // Carregar lançamentos
  const loadFinancials = async () => {
    try {
      setLoading(true);
      const response = await financialService.getFinancials(filters);
      setFinancials(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch (error) {
      console.error('Erro ao carregar lançamentos:', error);
      toast.error('Erro ao carregar lançamentos financeiros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancials();
  }, [filters]);

  // Handlers dos filtros
  const handleSearchChange = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm, page: 1 }));
  };

  const handleFilterChange = (field: keyof FinancialsFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      tipo: '',
      status: '',
      processoId: '',
      page: 1,
      pageSize: 10
    });
  };

  // Handlers dos modais
  const handleCreateFinancial = () => {
    setSelectedFinancial(null);
    setIsFinancialModalOpen(true);
  };

  const handleEditFinancial = (financial: Financial) => {
    setSelectedFinancial(financial);
    setIsFinancialModalOpen(true);
  };

  const handleDeleteFinancial = (financial: Financial) => {
    setSelectedFinancial(financial);
    setIsDeleteModalOpen(true);
  };

  const handleMarkAsPaid = (financial: Financial) => {
    setSelectedFinancial(financial);
    setIsMarkAsPaidModalOpen(true);
  };

  // Handlers das ações
  const handleSubmitFinancial = async (formData: FinancialFormData) => {
    try {
      setModalLoading(true);
      
      if (selectedFinancial) {
        // Editar
        await financialService.updateFinancial(selectedFinancial.id, formData);
        toast.success('Lançamento atualizado com sucesso!');
      } else {
        // Criar
        await financialService.createFinancial(formData);
        toast.success('Lançamento criado com sucesso!');
      }
      
      await loadFinancials();
      setIsFinancialModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
      toast.error('Erro ao salvar lançamento');
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedFinancial) return;

    try {
      setModalLoading(true);
      await financialService.deleteFinancial(selectedFinancial.id);
      toast.success('Lançamento excluído com sucesso!');
      await loadFinancials();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Erro ao excluir lançamento:', error);
      toast.error('Erro ao excluir lançamento');
    } finally {
      setModalLoading(false);
    }
  };

  const handleConfirmMarkAsPaid = async (paymentDate: string) => {
    if (!selectedFinancial) return;

    try {
      setModalLoading(true);
      await financialService.markAsPaid(selectedFinancial.id, { dataPagamento: paymentDate });
      toast.success('Lançamento marcado como pago!');
      await loadFinancials();
      setIsMarkAsPaidModalOpen(false);
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      toast.error('Erro ao processar pagamento');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gerenciamento Financeiro</h1>
          <p className="text-gray-600">
            {total > 0 ? `${total} lançamento${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}` : 'Nenhum lançamento encontrado'}
          </p>
        </div>
        <Button
          onClick={handleCreateFinancial}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Lançamento
        </Button>
      </div>

      {/* Barra de busca e filtros */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por descrição, processo..."
                value={filters.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={filters.tipo}
                onChange={(e) => handleFilterChange('tipo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os tipos</option>
                <option value={FinancialType.RECEITA}>Receita</option>
                <option value={FinancialType.DESPESA}>Despesa</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os status</option>
                <option value={FinancialStatus.PENDENTE}>Pendente</option>
                <option value={FinancialStatus.PAGO}>Pago</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tabela */}
      <FinancialsTable
        financials={financials}
        loading={loading}
        onEdit={handleEditFinancial}
        onDelete={handleDeleteFinancial}
        onMarkAsPaid={handleMarkAsPaid}
      />

      {/* Paginação */}
      {totalPages > 1 && (
        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Modais */}
      <FinancialModal
        isOpen={isFinancialModalOpen}
        onClose={() => setIsFinancialModalOpen(false)}
        onSubmit={handleSubmitFinancial}
        financial={selectedFinancial}
        loading={modalLoading}
      />

      <MarkAsPaidModal
        isOpen={isMarkAsPaidModalOpen}
        onClose={() => setIsMarkAsPaidModalOpen(false)}
        onConfirm={handleConfirmMarkAsPaid}
        financial={selectedFinancial}
        loading={modalLoading}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Lançamento"
        message={`Tem certeza que deseja excluir o lançamento "${selectedFinancial?.descricao}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
        loading={modalLoading}
      />
    </div>
  );
};

export default FinancialsPage;