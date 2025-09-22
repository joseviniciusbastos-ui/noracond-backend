import React from 'react';
import { Search, Filter } from 'lucide-react';
import { ProcessStatus, ProcessFilters as IProcessFilters } from '../../types/process';

interface ProcessFiltersProps {
  filters: IProcessFilters;
  onFiltersChange: (filters: IProcessFilters) => void;
  onSearch: (searchTerm: string) => void;
  searchTerm: string;
}

const ProcessFilters: React.FC<ProcessFiltersProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  searchTerm
}) => {
  const statusOptions: { value: ProcessStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Todos os Status' },
    { value: 'Em Andamento', label: 'Em Andamento' },
    { value: 'Suspenso', label: 'Suspenso' },
    { value: 'Arquivado', label: 'Arquivado' },
    { value: 'Finalizado', label: 'Finalizado' }
  ];

  const handleStatusChange = (status: ProcessStatus | 'all') => {
    onFiltersChange({
      ...filters,
      status: status === 'all' ? undefined : status
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Campo de busca */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por número, título ou cliente..."
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        {/* Filtro por status */}
        <div className="sm:w-48">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleStatusChange(e.target.value as ProcessStatus | 'all')}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botão para limpar filtros */}
        {(searchTerm || filters.status) && (
          <button
            onClick={() => {
              onSearch('');
              onFiltersChange({ status: undefined });
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Limpar Filtros
          </button>
        )}
      </div>
    </div>
  );
};

export { ProcessFilters };