using NoraCOND.Domain.Entities;

namespace NoraCOND.Application.Documentos.Interfaces
{
    public interface IDocumentoRepository
    {
        Task<Documento> CriarAsync(Documento documento);
        Task<Documento?> ObterPorIdAsync(Guid id);
        Task<IEnumerable<Documento>> ObterPorProcessoIdAsync(Guid processoId);
        Task<bool> ExcluirAsync(Guid id);
        Task<bool> ExisteAsync(Guid id);
    }
}