import api from '../api/api';
import { 
  Financial, 
  FinancialsResponse, 
  CreateFinancialRequest, 
  UpdateFinancialRequest,
  FinancialsFilters,
  MarkAsPaidRequest
} from '../types/financial';

export const financialService = {
  // Obter todos os lançamentos com filtros e paginação
  async getFinancials(filters: Partial<FinancialsFilters> = {}): Promise<FinancialsResponse> {
    const params = new URLSearchParams();
    
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.tipo) params.append('tipo', filters.tipo);
    if (filters.status) params.append('status', filters.status);
    if (filters.processoId) params.append('processoId', filters.processoId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const response = await api.get(`/lancamentos?${params.toString()}`);
    return response.data;
  },

  // Obter lançamento por ID
  async getFinancialById(id: string): Promise<Financial> {
    const response = await api.get(`/lancamentos/${id}`);
    return response.data;
  },

  // Criar novo lançamento
  async createFinancial(financialData: CreateFinancialRequest): Promise<Financial> {
    const response = await api.post('/lancamentos', financialData);
    return response.data;
  },

  // Atualizar lançamento
  async updateFinancial(id: string, financialData: UpdateFinancialRequest): Promise<Financial> {
    const response = await api.put(`/lancamentos/${id}`, financialData);
    return response.data;
  },

  // Excluir lançamento
  async deleteFinancial(id: string): Promise<void> {
    await api.delete(`/lancamentos/${id}`);
  },

  // Marcar como pago
  async markAsPaid(id: string, paymentData: MarkAsPaidRequest): Promise<Financial> {
    const response = await api.patch(`/lancamentos/${id}/marcar-pago`, paymentData);
    return response.data;
  },

  // Obter estatísticas financeiras
  async getFinancialStats(): Promise<{
    totalReceitas: number;
    totalDespesas: number;
    saldoTotal: number;
    receitasPendentes: number;
    despesasPendentes: number;
  }> {
    const response = await api.get('/lancamentos/estatisticas');
    return response.data;
  }
};