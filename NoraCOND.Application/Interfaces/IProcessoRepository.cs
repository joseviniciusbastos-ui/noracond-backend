using NoraCOND.Domain.Entities;

namespace NoraCOND.Application.Interfaces
{
    public interface IProcessoRepository
    {
        Task<Processo> CriarAsync(Processo processo);
        Task<Processo?> ObterPorIdAsync(Guid id);
        Task<IEnumerable<Processo>> ObterTodosAsync();
        Task<IEnumerable<Processo>> ObterPorClienteIdAsync(Guid clienteId);
        Task<IEnumerable<Processo>> ObterPorUsuarioResponsavelIdAsync(Guid usuarioId);
        Task<Processo> AtualizarAsync(Processo processo);
        Task<bool> ExcluirAsync(Guid id);
        Task<bool> ExisteAsync(Guid id);
        Task<bool> ClienteExisteAsync(Guid clienteId);
        Task<bool> UsuarioExisteAsync(Guid usuarioId);
        Task<bool> NumeroProcessoExisteAsync(string numeroProcesso, Guid? processoIdExcluir = null);
    }
}