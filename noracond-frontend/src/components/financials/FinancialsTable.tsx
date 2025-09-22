import React from 'react';
import { Edit, Trash2, CheckCircle } from 'lucide-react';
import { Financial, FinancialTypeColors, FinancialStatusColors } from '../../types/financial';

interface FinancialsTableProps {
  financials: Financial[];
  loading: boolean;
  onEdit: (financial: Financial) => void;
  onDelete: (financial: Financial) => void;
  onMarkAsPaid: (financial: Financial) => void;
}

const FinancialsTable: React.FC<FinancialsTableProps> = ({
  financials,
  loading,
  onEdit,
  onDelete,
  onMarkAsPaid
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 border-t border-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  if (financials.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-gray-500">Nenhum lançamento financeiro encontrado.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descrição
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Processo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Valor
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vencimento
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {financials.map((financial) => (
            <tr key={financial.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {financial.descricao}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {financial.processoNumero}
                </div>
                <div className="text-sm text-gray-500">
                  {financial.processoTitulo}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  FinancialTypeColors[financial.tipo as keyof typeof FinancialTypeColors]
                }`}>
                  {financial.tipo}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className={`text-sm font-medium ${
                  financial.tipo === 'Receita' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(financial.valor)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(financial.dataVencimento)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  FinancialStatusColors[financial.status as keyof typeof FinancialStatusColors]
                }`}>
                  {financial.status}
                </span>
                {financial.dataPagamento && (
                  <div className="text-xs text-gray-500 mt-1">
                    Pago em: {formatDate(financial.dataPagamento)}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => onEdit(financial)}
                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  {financial.status === 'Pendente' && (
                    <button
                      onClick={() => onMarkAsPaid(financial)}
                      className="text-green-600 hover:text-green-900 p-1 rounded"
                      title="Marcar como Pago"
                    >
                      <CheckCircle size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(financial)}
                    className="text-red-600 hover:text-red-900 p-1 rounded"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FinancialsTable;