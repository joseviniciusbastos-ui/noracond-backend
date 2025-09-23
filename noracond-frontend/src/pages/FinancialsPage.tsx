import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Trash2, Edit } from 'lucide-react';
import { Pagination } from '../components/common/Pagination';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import Button from '../components/common/Button';
import { financialService } from '../services/financialService';
import { Financial, FinancialsResponse } from '../types/financial';

export function FinancialsPage() {
    const [page, setPage] = useState(1);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedFinancialId, setSelectedFinancialId] = useState<string | null>(
        null,
    );
    const [financialsResponse, setFinancialsResponse] = useState<FinancialsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchFinancials = async () => {
            setIsLoading(true);
            try {
                const response = await financialService.getFinancials({ page, pageSize: 10 });
                setFinancialsResponse(response);
            } catch (error) {
                toast.error('Erro ao carregar lançamentos financeiros.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchFinancials();
    }, [page]);

    const deleteFinancialFn = async (id: string) => {
        setIsDeleting(true);
        try {
            await financialService.deleteFinancial(id);
            toast.success('Lançamento excluído com sucesso!');
            // Recarregar dados após exclusão
            const response = await financialService.getFinancials({ page, pageSize: 10 });
            setFinancialsResponse(response);
        } catch (error) {
            toast.error('Erro ao excluir lançamento.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDelete = (id: string) => {
        setSelectedFinancialId(id);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (selectedFinancialId) {
            await deleteFinancialFn(selectedFinancialId);
            setDeleteModalOpen(false);
        }
    };

    const financials = financialsResponse?.data || [];
    const totalItems = financialsResponse?.total || 0;
    const itemsPerPage = 10; // Valor fixo já que não temos meta
    const totalPages = financialsResponse?.totalPages || 1;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>

            <div className="mt-6 bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Descrição
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Valor
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Data
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tipo
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Ações
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                    Carregando...
                                </td>
                            </tr>
                        ) : (
                            financials.map((financial: Financial) => (
                                <tr key={financial.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {financial.descricao}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {financial.valor.toLocaleString('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL',
                                        })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(financial.dataVencimento).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                financial.tipo === 'ENTRADA'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {financial.tipo}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="text-indigo-600 hover:text-indigo-900"
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Editar
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDelete(financial.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Excluir
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
            />

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirmar exclusão"
                message="Tem certeza que deseja excluir este lançamento?"
                confirmText="Excluir"
                cancelText="Cancelar"
                loading={isDeleting}
                type="danger"
            />
        </div>
    );
}

export default FinancialsPage;