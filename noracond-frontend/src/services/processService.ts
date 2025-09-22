import api from '../api/api';
import { 
  Process, 
  ProcessesResponse, 
  CreateProcessRequest, 
  UpdateProcessRequest,
  ProcessesFilters 
} from '../types/process';

export const processService = {
  // Obter todos os processos com filtros e paginação
  async getProcesses(filters: Partial<ProcessesFilters> = {}): Promise<ProcessesResponse> {
    const params = new URLSearchParams();
    
    if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
    if (filters.status) params.append('status', filters.status);
    if (filters.clienteId) params.append('clienteId', filters.clienteId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());

    const response = await api.get(`/processos?${params.toString()}`);
    return response.data;
  },

  // Obter processo por ID
  async getProcessById(id: string): Promise<Process> {
    const response = await api.get(`/processos/${id}`);
    return response.data;
  },

  // Obter processos por cliente
  async getProcessesByClient(clienteId: string): Promise<Process[]> {
    const response = await api.get(`/processos/cliente/${clienteId}`);
    return response.data;
  },

  // Criar novo processo
  async createProcess(processData: CreateProcessRequest): Promise<Process> {
    const response = await api.post('/processos', processData);
    return response.data;
  },

  // Atualizar processo existente
  async updateProcess(id: string, processData: UpdateProcessRequest): Promise<Process> {
    const response = await api.put(`/processos/${id}`, processData);
    return response.data;
  },

  // Excluir processo
  async deleteProcess(id: string): Promise<void> {
    await api.delete(`/processos/${id}`);
  },

  // Buscar processos com termo de busca
  async searchProcesses(searchTerm: string, page: number = 1, pageSize: number = 10): Promise<ProcessesResponse> {
    return this.getProcesses({
      searchTerm,
      page,
      pageSize
    });
  },

  // Obter processos por status
  async getProcessesByStatus(status: string, page: number = 1, pageSize: number = 10): Promise<ProcessesResponse> {
    return this.getProcesses({
      status,
      page,
      pageSize
    });
  }
};

export default processService;