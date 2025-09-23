using NoraCOND.Application.Lancamentos.DTOs;

namespace NoraCOND.Application.Interfaces
{
    public interface ILancamentoFinanceiroService
    {
        Task<LancamentoResponse?> GetByIdAsync(Guid id);
        Task<IEnumerable<LancamentoResponse>> GetAllAsync();
        Task<IEnumerable<LancamentoResponse>> GetByProcessoIdAsync(Guid processoId);
        Task<LancamentoResponse> CreateAsync(CriarLancamentoRequest request);
        Task<LancamentoResponse?> UpdateAsync(Guid id, AtualizarLancamentoRequest request);
        Task<LancamentoResponse?> MarcarComoPagoAsync(Guid id, MarcarComoPagoRequest request);
        Task<bool> DeleteAsync(Guid id);
    }
}
