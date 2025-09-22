// Interfaces para o sistema de gerenciamento de clientes

export interface Client {
  id: string;
  nomeCompleto: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao?: string;
}

export interface ClientFormData {
  nomeCompleto: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  observacoes?: string;
  ativo: boolean;
}

export interface ClientsResponse {
  clients: Client[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ClientsFilters {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  ativo?: boolean;
}