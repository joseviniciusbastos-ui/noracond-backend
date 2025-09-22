import api from '../api/api';

export interface DashboardStats {
  totalClientes: number;
  totalProcessos: number;
  processosAtivos: number;
  processosFinalizados: number;
  receitaTotal: number;
  receitaMensal: number;
  clientesAtivos: number;
  processosPendentes: number;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardStats;
  message?: string;
}

class DashboardService {
  /**
   * Busca as estatísticas do dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get<DashboardResponse>('/dashboard/stats');
      
      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Erro ao buscar estatísticas do dashboard');
      }
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      
      // Se for erro de rede ou servidor, lançar erro personalizado
      if (error.response?.status >= 500) {
        throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
      } else if (error.response?.status === 401) {
        throw new Error('Sessão expirada. Faça login novamente.');
      } else if (error.response?.status === 403) {
        throw new Error('Você não tem permissão para acessar essas informações.');
      } else {
        throw new Error(error.message || 'Erro ao carregar dados do dashboard');
      }
    }
  }

  /**
   * Dados mockados para desenvolvimento/teste
   * Remove esta função quando o backend estiver funcionando
   */
  getMockDashboardStats(): DashboardStats {
    return {
      totalClientes: 156,
      totalProcessos: 89,
      processosAtivos: 34,
      processosFinalizados: 55,
      receitaTotal: 450000,
      receitaMensal: 75000,
      clientesAtivos: 142,
      processosPendentes: 12
    };
  }
}

const dashboardService = new DashboardService();
export default dashboardService;