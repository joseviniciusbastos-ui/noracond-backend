import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Financial, FinancialFormData, FinancialType } from '../../types/financial';
import { ProcessCombobox } from '../common/ProcessCombobox';

interface FinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FinancialFormData) => Promise<void>;
  financial?: Financial | null;
  loading?: boolean;
}

const FinancialModal: React.FC<FinancialModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  financial,
  loading = false
}) => {
  const [formData, setFormData] = useState<FinancialFormData>({
    descricao: '',
    valor: 0,
    dataVencimento: new Date().toISOString().split('T')[0],
    tipo: FinancialType.RECEITA,
    processoId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (financial) {
        // Modo edição
        setFormData({
          descricao: financial.descricao,
          valor: financial.valor,
          dataVencimento: financial.dataVencimento.split('T')[0],
          tipo: financial.tipo,
          processoId: financial.processoId
        });
      } else {
        // Modo criação
        setFormData({
          descricao: '',
          valor: 0,
          dataVencimento: new Date().toISOString().split('T')[0],
          tipo: FinancialType.RECEITA,
          processoId: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, financial]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.valor || formData.valor <= 0) {
      newErrors.valor = 'Valor deve ser maior que zero';
    }

    if (!formData.dataVencimento) {
      newErrors.dataVencimento = 'Data de vencimento é obrigatória';
    }

    if (!formData.tipo) {
      newErrors.tipo = 'Tipo é obrigatório';
    }

    if (!formData.processoId) {
      newErrors.processoId = 'Processo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar lançamento:', error);
    }
  };

  const handleInputChange = (field: keyof FinancialFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {financial ? 'Editar Lançamento' : 'Novo Lançamento'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={loading}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Descrição */}
              <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <input
                  type="text"
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.descricao ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Digite a descrição do lançamento"
                  disabled={loading}
                />
                {errors.descricao && (
                  <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Valor */}
                <div>
                  <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
                    Valor *
                  </label>
                  <input
                    type="number"
                    id="valor"
                    step="0.01"
                    min="0"
                    value={formData.valor}
                    onChange={(e) => handleInputChange('valor', parseFloat(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.valor ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0,00"
                    disabled={loading}
                  />
                  {errors.valor && (
                    <p className="mt-1 text-sm text-red-600">{errors.valor}</p>
                  )}
                </div>

                {/* Tipo */}
                <div>
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => handleInputChange('tipo', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.tipo ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={loading}
                  >
                    <option value={FinancialType.RECEITA}>Receita</option>
                    <option value={FinancialType.DESPESA}>Despesa</option>
                  </select>
                  {errors.tipo && (
                    <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
                  )}
                </div>
              </div>

              {/* Data de Vencimento */}
              <div>
                <label htmlFor="dataVencimento" className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento *
                </label>
                <input
                  type="date"
                  id="dataVencimento"
                  value={formData.dataVencimento}
                  onChange={(e) => handleInputChange('dataVencimento', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.dataVencimento ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={loading}
                />
                {errors.dataVencimento && (
                  <p className="mt-1 text-sm text-red-600">{errors.dataVencimento}</p>
                )}
              </div>

              {/* Processo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Processo *
                </label>
                <ProcessCombobox
                  value={formData.processoId}
                  onChange={(processoId) => handleInputChange('processoId', processoId)}
                  error={errors.processoId}
                  disabled={loading}
                />
                {errors.processoId && (
                  <p className="mt-1 text-sm text-red-600">{errors.processoId}</p>
                )}
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : (financial ? 'Atualizar' : 'Criar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialModal;