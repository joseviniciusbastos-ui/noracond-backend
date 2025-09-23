using NoraCOND.Application.Clientes.DTOs;

namespace NoraCOND.Application.Interfaces
{
    public interface IClienteService
    {
        Task<ClienteResponse> CriarClienteAsync(CriarClienteRequest request, Guid usuarioId);
        Task<ClienteResponse?> ObterClientePorIdAsync(Guid id);
        Task<IEnumerable<ClienteResponse>> ObterTodosClientesAsync();
        Task<ClienteResponse?> AtualizarClienteAsync(Guid id, AtualizarClienteRequest request);
        Task<bool> ExcluirClienteAsync(Guid id);
    }
}