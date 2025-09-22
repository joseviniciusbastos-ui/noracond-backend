export interface Financial {
  id: string;
  descricao: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  tipo: string; // 'Receita' ou 'Despesa'
  status: string; // 'Pago' ou 'Pendente'
  dataCriacao: string;
  dataAtualizacao: string;
  processoId: string;
  processoNumero: string;
  processoTitulo: string;
}

export interface FinancialFormData {
  descricao: string;
  valor: number;
  dataVencimento: string;
  tipo: string;
  processoId: string;
}

export interface FinancialsResponse {
  data: Financial[];
  total: number;
  page: number;
  totalPages: number;
}

export interface FinancialsFilters {
  searchTerm: string;
  tipo?: string;
  status?: string;
  processoId?: string;
  page: number;
  pageSize: number;
}

export interface CreateFinancialRequest {
  descricao: string;
  valor: number;
  dataVencimento: string;
  tipo: string;
  processoId: string;
}

export interface UpdateFinancialRequest {
  descricao: string;
  valor: number;
  dataVencimento: string;
  tipo: string;
  processoId: string;
}

export interface MarkAsPaidRequest {
  dataPagamento: string;
}

export const FinancialType = {
  RECEITA: 'Receita',
  DESPESA: 'Despesa'
} as const;

export type FinancialTypeType = typeof FinancialType[keyof typeof FinancialType];

export const FinancialStatus = {
  PAGO: 'Pago',
  PENDENTE: 'Pendente'
} as const;

export type FinancialStatusType = typeof FinancialStatus[keyof typeof FinancialStatus];

export const FinancialTypeColors = {
  [FinancialType.RECEITA]: 'bg-green-100 text-green-800',
  [FinancialType.DESPESA]: 'bg-red-100 text-red-800'
} as const;

export const FinancialStatusColors = {
  [FinancialStatus.PAGO]: 'bg-green-100 text-green-800',
  [FinancialStatus.PENDENTE]: 'bg-yellow-100 text-yellow-800'
} as const;