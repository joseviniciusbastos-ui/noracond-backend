export interface Process {
  id: string;
  numeroProcesso: string;
  titulo: string;
  descricao: string;
  status: string;
  dataAbertura: string;
  dataEncerramento?: string;
  dataCriacao: string;
  dataAtualizacao: string;
  clienteId: string;
  clienteNome: string;
  clienteCpfCnpj: string;
  usuarioResponsavelId: string;
  usuarioResponsavelNome: string;
  usuarioResponsavelEmail: string;
}

export interface ProcessFormData {
  numeroProcesso: string;
  titulo: string;
  descricao: string;
  status: string;
  dataAbertura: string;
  dataEncerramento?: string;
  clienteId: string;
}

export interface ProcessesResponse {
  data: Process[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ProcessesFilters {
  searchTerm: string;
  status?: string;
  clienteId: string;
  page: number;
  pageSize: number;
}

export interface ProcessFilters {
  status?: string;
}

export interface CreateProcessRequest {
  numeroProcesso: string;
  titulo: string;
  descricao: string;
  status: string;
  dataAbertura: string;
  clienteId: string;
}

export interface UpdateProcessRequest {
  numeroProcesso: string;
  titulo: string;
  descricao: string;
  status: string;
  dataEncerramento?: string;
  clienteId: string;
}

export const ProcessStatus = {
  EM_ANDAMENTO: 'Em Andamento',
  ARQUIVADO: 'Arquivado',
  FINALIZADO: 'Finalizado',
  SUSPENSO: 'Suspenso',
  AGUARDANDO: 'Aguardando'
} as const;

export type ProcessStatusType = typeof ProcessStatus[keyof typeof ProcessStatus];

export const ProcessStatusColors = {
  [ProcessStatus.EM_ANDAMENTO]: 'bg-blue-100 text-blue-800',
  [ProcessStatus.ARQUIVADO]: 'bg-gray-100 text-gray-800',
  [ProcessStatus.FINALIZADO]: 'bg-green-100 text-green-800',
  [ProcessStatus.SUSPENSO]: 'bg-yellow-100 text-yellow-800',
  [ProcessStatus.AGUARDANDO]: 'bg-orange-100 text-orange-800'
} as const;