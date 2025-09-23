using NoraCOND.Domain.Entities;

namespace NoraCOND.Application.Interfaces
{
    public interface ILancamentoFinanceiroRepository
    {
        Task<LancamentoFinanceiro?> GetByIdAsync(Guid id);
        Task<IEnumerable<LancamentoFinanceiro>> GetAllAsync();
        Task<IEnumerable<LancamentoFinanceiro>> GetByProcessoIdAsync(Guid processoId);
        Task<LancamentoFinanceiro> CreateAsync(LancamentoFinanceiro lancamento);
        Task<LancamentoFinanceiro> UpdateAsync(LancamentoFinanceiro lancamento);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> ExistsAsync(Guid id);
    }
}
