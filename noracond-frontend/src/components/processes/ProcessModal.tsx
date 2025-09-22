import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Process, ProcessFormData, ProcessStatus } from '../../types/process';
import { ClientCombobox } from '../common/ClientCombobox';

interface ProcessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProcessFormData) => Promise<void>;
  process?: Process | null;
  loading?: boolean;
}

const ProcessModal: React.FC<ProcessModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  process,
  loading = false
}) => {
  const [formData, setFormData] = useState<ProcessFormData>({
    numeroProcesso: '',
    titulo: '',
    descricao: '',
    status: ProcessStatus.EM_ANDAMENTO,
    dataAbertura: new Date().toISOString().split('T')[0],
    dataEncerramento: '',
    clienteId: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (process) {
        // Modo edição
        setFormData({
          numeroProcesso: process.numeroProcesso,
          titulo: process.titulo,
          descricao: process.descricao,
          status: process.status,
          dataAbertura: process.dataAbertura.split('T')[0],
          dataEncerramento: process.dataEncerramento ? process.dataEncerramento.split('T')[0] : '',
          clienteId: process.clienteId
        });
      } else {
        // Modo criação
        setFormData({
          numeroProcesso: '',
          titulo: '',
          descricao: '',
          status: ProcessStatus.EM_ANDAMENTO,
          dataAbertura: new Date().toISOString().split('T')[0],
          dataEncerramento: '',
          clienteId: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, process]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.numeroProcesso.trim()) {
      newErrors.numeroProcesso = 'Número do processo é obrigatório';
    }

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória';
    }

    if (!formData.clienteId) {
      newErrors.clienteId = 'Cliente é obrigatório';
    }

    if (!formData.dataAbertura) {
      newErrors.dataAbertura = 'Data de abertura é obrigatória';
    }

    // Validar data de encerramento se status for finalizado ou arquivado
    if ((formData.status === ProcessStatus.FINALIZADO || formData.status === ProcessStatus.ARQUIVADO) && !formData.dataEncerramento) {
      newErrors.dataEncerramento = 'Data de encerramento é obrigatória para processos finalizados ou arquivados';
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
      console.error('Erro ao salvar processo:', error);
    }
  };

  const handleInputChange = (field: keyof ProcessFormData, value: string) => {
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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {process ? 'Editar Processo' : 'Novo Processo'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Número do Processo */}
                <div>
                  <label htmlFor="numeroProcesso" className="block text-sm font-medium text-gray-700 mb-1">
                    Número do Processo *
                  </label>
                  <input
                    type="text"
                    id="numeroProcesso"
                    value={formData.numeroProcesso}
                    onChange={(e) => handleInputChange('numeroProcesso', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.numeroProcesso ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: 1234567-89.2024.8.26.0001"
                  />
                  {errors.numeroProcesso && (
                    <p className="mt-1 text-sm text-red-600">{errors.numeroProcesso}</p>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {Object.values(ProcessStatus).map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Título */}
              <div>
                <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange('titulo', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.titulo ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Título do processo"
                />
                {errors.titulo && (
                  <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
                )}
              </div>

              {/* Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente *
                </label>
                <ClientCombobox
                  value={formData.clienteId}
                  onChange={(clienteId) => handleInputChange('clienteId', clienteId)}
                  error={errors.clienteId}
                  placeholder="Busque e selecione um cliente..."
                />
              </div>

              {/* Descrição */}
              <div>
                <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <textarea
                  id="descricao"
                  rows={4}
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.descricao ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Descreva os detalhes do processo..."
                />
                {errors.descricao && (
                  <p className="mt-1 text-sm text-red-600">{errors.descricao}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Data de Abertura */}
                <div>
                  <label htmlFor="dataAbertura" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Abertura *
                  </label>
                  <input
                    type="date"
                    id="dataAbertura"
                    value={formData.dataAbertura}
                    onChange={(e) => handleInputChange('dataAbertura', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.dataAbertura ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.dataAbertura && (
                    <p className="mt-1 text-sm text-red-600">{errors.dataAbertura}</p>
                  )}
                </div>

                {/* Data de Encerramento */}
                <div>
                  <label htmlFor="dataEncerramento" className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Encerramento
                    {(formData.status === ProcessStatus.FINALIZADO || formData.status === ProcessStatus.ARQUIVADO) && ' *'}
                  </label>
                  <input
                    type="date"
                    id="dataEncerramento"
                    value={formData.dataEncerramento}
                    onChange={(e) => handleInputChange('dataEncerramento', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.dataEncerramento ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.dataEncerramento && (
                    <p className="mt-1 text-sm text-red-600">{errors.dataEncerramento}</p>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : (process ? 'Atualizar' : 'Criar')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ProcessModal };