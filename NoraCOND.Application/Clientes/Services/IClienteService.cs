using NoraCOND.Application.Clientes.DTOs;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoraCOND.Application.Clientes.Services
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