import api from '../api/api';
import type { Client, ClientFormData, ClientsResponse, ClientsFilters } from '../types/client';

class ClientService {
  private baseUrl = '/clientes';

  // Busca clientes com suporte a paginação e filtros
  async getClients(filters: ClientsFilters = {}): Promise<ClientsResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.pageSize) params.append('pageSize', filters.pageSize.toString());
      if (filters.searchTerm) params.append('searchTerm', filters.searchTerm);
      if (filters.ativo !== undefined) params.append('ativo', filters.ativo.toString());

      const response = await api.get(`${this.baseUrl}?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      
      // Fallback com dados mockados para desenvolvimento
      return this.getMockClientsResponse(filters);
    }
  }

  // Busca cliente por ID
  async getClientById(id: string): Promise<Client> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      
      // Fallback com dados mockados
      return this.getMockClient(id);
    }
  }

  // Cria novo cliente
  async createClient(clientData: ClientFormData): Promise<Client> {
    try {
      const response = await api.post(this.baseUrl, clientData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar cliente:', error);
      
      // Simula criação para desenvolvimento
      return this.simulateCreateClient(clientData);
    }
  }

  // Atualiza cliente existente
  async updateClient(id: string, clientData: ClientFormData): Promise<Client> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, clientData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error);
      
      // Simula atualização para desenvolvimento
      return this.simulateUpdateClient(id, clientData);
    }
  }

  // Remove cliente
  async deleteClient(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/${id}`);
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      
      // Simula exclusão para desenvolvimento
      console.log(`Cliente ${id} removido (simulação)`);
    }
  }

  // Métodos auxiliares para dados mockados (desenvolvimento)
  private getMockClientsResponse(filters: ClientsFilters): ClientsResponse {
    const mockClients: Client[] = [
      {
        id: '1',
        nomeCompleto: 'João Silva Santos',
        cpfCnpj: '123.456.789-00',
        email: 'joao.silva@email.com',
        telefone: '(11) 99999-1234',
        endereco: 'Rua das Flores, 123',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567',
        ativo: true,
        dataCriacao: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        nomeCompleto: 'Maria Oliveira Ltda',
        cpfCnpj: '12.345.678/0001-90',
        email: 'contato@mariaoliveira.com.br',
        telefone: '(11) 3333-5678',
        endereco: 'Av. Paulista, 1000',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01310-100',
        ativo: true,
        dataCriacao: '2024-01-10T14:20:00Z'
      },
      {
        id: '3',
        nomeCompleto: 'Carlos Eduardo Pereira',
        cpfCnpj: '987.654.321-00',
        email: 'carlos.pereira@email.com',
        telefone: '(21) 98888-7777',
        endereco: 'Rua Copacabana, 456',
        cidade: 'Rio de Janeiro',
        estado: 'RJ',
        cep: '22070-001',
        ativo: false,
        dataCriacao: '2024-01-05T09:15:00Z'
      }
    ];

    // Aplica filtro de busca se fornecido
    let filteredClients = mockClients;
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filteredClients = mockClients.filter(client => 
        client.nomeCompleto.toLowerCase().includes(searchLower) ||
        client.cpfCnpj.includes(searchLower) ||
        client.email.toLowerCase().includes(searchLower)
      );
    }

    // Aplica filtro de status se fornecido
    if (filters.ativo !== undefined) {
      filteredClients = filteredClients.filter(client => client.ativo === filters.ativo);
    }

    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedClients = filteredClients.slice(startIndex, endIndex);

    return {
      clients: paginatedClients,
      totalCount: filteredClients.length,
      currentPage: page,
      totalPages: Math.ceil(filteredClients.length / pageSize),
      hasNextPage: endIndex < filteredClients.length,
      hasPreviousPage: page > 1
    };
  }

  private getMockClient(id: string): Client {
    return {
      id,
      nomeCompleto: 'Cliente Exemplo',
      cpfCnpj: '123.456.789-00',
      email: 'cliente@exemplo.com',
      telefone: '(11) 99999-0000',
      ativo: true,
      dataCriacao: new Date().toISOString()
    };
  }

  private simulateCreateClient(clientData: ClientFormData): Client {
    return {
      id: Date.now().toString(),
      ...clientData,
      dataCriacao: new Date().toISOString()
    };
  }

  private simulateUpdateClient(id: string, clientData: ClientFormData): Client {
    return {
      id,
      ...clientData,
      dataCriacao: '2024-01-01T00:00:00Z',
      dataAtualizacao: new Date().toISOString()
    };
  }
}

export default new ClientService();