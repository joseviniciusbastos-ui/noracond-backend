using NoraCOND.Application.Processos.DTOs;

namespace NoraCOND.Application.Interfaces
{
    public interface IProcessoService
    {
        Task<ProcessoResponse> CriarProcessoAsync(CriarProcessoRequest request, Guid usuarioResponsavelId);
        Task<ProcessoResponse?> ObterProcessoPorIdAsync(Guid id);
        Task<IEnumerable<ProcessoResponse>> ObterTodosProcessosAsync();
        Task<IEnumerable<ProcessoResponse>> ObterProcessosPorClienteAsync(Guid clienteId);
        Task<IEnumerable<ProcessoResponse>> ObterProcessosPorUsuarioResponsavelAsync(Guid usuarioId);
        Task<ProcessoResponse> AtualizarProcessoAsync(Guid id, AtualizarProcessoRequest request);
        Task<bool> ExcluirProcessoAsync(Guid id);
    }
}