using NoraCOND.Application.Clientes.DTOs;
using NoraCOND.Application.Interfaces;
using NoraCOND.Application.Clientes.Services;
using NoraCOND.Domain.Entities;

namespace NoraCOND.Application.Clientes.Services
{
    public class ClienteService : IClienteService
    {
        private readonly IClienteRepository _clienteRepository;

        public ClienteService(IClienteRepository clienteRepository)
        {
            _clienteRepository = clienteRepository;
        }

        public async Task<ClienteResponse> CriarClienteAsync(CriarClienteRequest request, Guid usuarioId)
        {
            // Validar se CPF/CNPJ já existe
            var clienteExistenteCpf = await _clienteRepository.GetByCpfCnpjAsync(request.CpfCnpj);
            if (clienteExistenteCpf != null)
            {
                throw new InvalidOperationException("Já existe um cliente cadastrado com este CPF/CNPJ.");
            }

            // Validar se email já existe
            var clienteExistenteEmail = await _clienteRepository.GetByEmailAsync(request.Email);
            if (clienteExistenteEmail != null)
            {
                throw new InvalidOperationException("Já existe um cliente cadastrado com este email.");
            }

            // Criar nova entidade Cliente
            var cliente = new Cliente
            {
                Id = Guid.NewGuid(),
                NomeCompleto = request.NomeCompleto,
                CpfCnpj = request.CpfCnpj,
                Telefone = request.Telefone,
                Email = request.Email,
                Endereco = request.Endereco,
                DataCriacao = DateTime.UtcNow,
                UsuarioDeCriacaoId = usuarioId
            };

            var clienteCriado = await _clienteRepository.AddAsync(cliente);

            // Buscar cliente com relacionamentos para retorno
            var clienteCompleto = await _clienteRepository.GetByIdAsync(clienteCriado.Id);

            return MapearParaResponse(clienteCompleto!);
        }

        public async Task<ClienteResponse?> ObterClientePorIdAsync(Guid id)
        {
            var cliente = await _clienteRepository.GetByIdAsync(id);
            return cliente != null ? MapearParaResponse(cliente) : null;
        }

        public async Task<IEnumerable<ClienteResponse>> ObterTodosClientesAsync()
        {
            var clientes = await _clienteRepository.GetAllAsync();
            return clientes.Select(MapearParaResponse);
        }

        public async Task<ClienteResponse?> AtualizarClienteAsync(Guid id, AtualizarClienteRequest request)
        {
            var cliente = await _clienteRepository.GetByIdAsync(id);
            if (cliente == null)
                return null;

            // Validar se CPF/CNPJ já existe em outro cliente
            var clienteExistenteCpf = await _clienteRepository.GetByCpfCnpjAsync(request.CpfCnpj);
            if (clienteExistenteCpf != null && clienteExistenteCpf.Id != id)
            {
                throw new InvalidOperationException("Já existe outro cliente cadastrado com este CPF/CNPJ.");
            }

            // Validar se email já existe em outro cliente
            var clienteExistenteEmail = await _clienteRepository.GetByEmailAsync(request.Email);
            if (clienteExistenteEmail != null && clienteExistenteEmail.Id != id)
            {
                throw new InvalidOperationException("Já existe outro cliente cadastrado com este email.");
            }

            // Atualizar propriedades
            cliente.NomeCompleto = request.NomeCompleto;
            cliente.CpfCnpj = request.CpfCnpj;
            cliente.Telefone = request.Telefone;
            cliente.Email = request.Email;
            cliente.Endereco = request.Endereco;

            var clienteAtualizado = await _clienteRepository.UpdateAsync(cliente);

            // Buscar cliente com relacionamentos para retorno
            var clienteCompleto = await _clienteRepository.GetByIdAsync(clienteAtualizado.Id);

            return clienteCompleto != null ? MapearParaResponse(clienteCompleto) : null;
        }

        public async Task<bool> ExcluirClienteAsync(Guid id)
        {
            var existe = await _clienteRepository.ExistsAsync(id);
            if (!existe)
                return false;

            return await _clienteRepository.DeleteAsync(id);
        }

        private static ClienteResponse MapearParaResponse(Cliente cliente)
        {
            return new ClienteResponse
            {
                Id = cliente.Id,
                NomeCompleto = cliente.NomeCompleto,
                CpfCnpj = cliente.CpfCnpj,
                Telefone = cliente.Telefone,
                Email = cliente.Email,
                Endereco = cliente.Endereco,
                DataCriacao = cliente.DataCriacao,
                UsuarioDeCriacaoId = cliente.UsuarioDeCriacaoId,
                NomeUsuarioCriacao = cliente.UsuarioDeCriacao?.Nome ?? "N/A"
            };
        }
    }
}