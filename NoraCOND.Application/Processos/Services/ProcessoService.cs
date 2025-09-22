using NoraCOND.Application.Processos.DTOs;
using NoraCOND.Application.Processos.Interfaces;
using NoraCOND.Application.Processos.Services;
using NoraCOND.Domain.Entities;

namespace NoraCOND.Application.Processos.Services
{
    public class ProcessoService : IProcessoService
    {
        private readonly IProcessoRepository _processoRepository;

        public ProcessoService(IProcessoRepository processoRepository)
        {
            _processoRepository = processoRepository;
        }

        public async Task<ProcessoResponse> CriarProcessoAsync(CriarProcessoRequest request, Guid usuarioResponsavelId)
        {
            // Validar se o cliente existe
            if (!await _processoRepository.ClienteExisteAsync(request.ClienteId))
            {
                throw new ArgumentException("Cliente não encontrado.");
            }

            // Validar se o usuário responsável existe
            if (!await _processoRepository.UsuarioExisteAsync(usuarioResponsavelId))
            {
                throw new ArgumentException("Usuário responsável não encontrado.");
            }

            // Validar se o número do processo já existe
            if (await _processoRepository.NumeroProcessoExisteAsync(request.NumeroProcesso))
            {
                throw new ArgumentException("Já existe um processo com este número.");
            }

            var processo = new Processo
            {
                NumeroProcesso = request.NumeroProcesso,
                Titulo = request.Titulo,
                Descricao = request.Descricao,
                Status = request.Status,
                DataAbertura = request.DataAbertura,
                ClienteId = request.ClienteId,
                UsuarioResponsavelId = usuarioResponsavelId
            };

            var processoCriado = await _processoRepository.CriarAsync(processo);
            var processoCompleto = await _processoRepository.ObterPorIdAsync(processoCriado.Id);

            return MapearParaResponse(processoCompleto!);
        }

        public async Task<ProcessoResponse?> ObterProcessoPorIdAsync(Guid id)
        {
            var processo = await _processoRepository.ObterPorIdAsync(id);
            return processo != null ? MapearParaResponse(processo) : null;
        }

        public async Task<IEnumerable<ProcessoResponse>> ObterTodosProcessosAsync()
        {
            var processos = await _processoRepository.ObterTodosAsync();
            return processos.Select(MapearParaResponse);
        }

        public async Task<IEnumerable<ProcessoResponse>> ObterProcessosPorClienteAsync(Guid clienteId)
        {
            var processos = await _processoRepository.ObterPorClienteIdAsync(clienteId);
            return processos.Select(MapearParaResponse);
        }

        public async Task<IEnumerable<ProcessoResponse>> ObterProcessosPorUsuarioResponsavelAsync(Guid usuarioId)
        {
            var processos = await _processoRepository.ObterPorUsuarioResponsavelIdAsync(usuarioId);
            return processos.Select(MapearParaResponse);
        }

        public async Task<ProcessoResponse> AtualizarProcessoAsync(Guid id, AtualizarProcessoRequest request)
        {
            var processo = await _processoRepository.ObterPorIdAsync(id);
            if (processo == null)
            {
                throw new ArgumentException("Processo não encontrado.");
            }

            // Validar se o cliente existe
            if (!await _processoRepository.ClienteExisteAsync(request.ClienteId))
            {
                throw new ArgumentException("Cliente não encontrado.");
            }

            // Validar se o número do processo já existe (excluindo o processo atual)
            if (await _processoRepository.NumeroProcessoExisteAsync(request.NumeroProcesso, id))
            {
                throw new ArgumentException("Já existe um processo com este número.");
            }

            // Atualizar propriedades
            processo.NumeroProcesso = request.NumeroProcesso;
            processo.Titulo = request.Titulo;
            processo.Descricao = request.Descricao;
            processo.Status = request.Status;
            processo.DataEncerramento = request.DataEncerramento;
            processo.ClienteId = request.ClienteId;

            var processoAtualizado = await _processoRepository.AtualizarAsync(processo);
            var processoCompleto = await _processoRepository.ObterPorIdAsync(processoAtualizado.Id);

            return MapearParaResponse(processoCompleto!);
        }

        public async Task<bool> ExcluirProcessoAsync(Guid id)
        {
            if (!await _processoRepository.ExisteAsync(id))
            {
                throw new ArgumentException("Processo não encontrado.");
            }

            return await _processoRepository.ExcluirAsync(id);
        }

        private static ProcessoResponse MapearParaResponse(Processo processo)
        {
            return new ProcessoResponse
            {
                Id = processo.Id,
                NumeroProcesso = processo.NumeroProcesso,
                Titulo = processo.Titulo,
                Descricao = processo.Descricao,
                Status = processo.Status,
                DataAbertura = processo.DataAbertura,
                DataEncerramento = processo.DataEncerramento,
                DataCriacao = processo.DataCriacao,
                DataAtualizacao = processo.DataAtualizacao,
                ClienteId = processo.ClienteId,
                ClienteNome = processo.Cliente?.NomeCompleto ?? string.Empty,
                ClienteCpfCnpj = processo.Cliente?.CpfCnpj ?? string.Empty,
                UsuarioResponsavelId = processo.UsuarioResponsavelId,
                UsuarioResponsavelNome = processo.UsuarioResponsavel?.Nome ?? string.Empty,
                UsuarioResponsavelEmail = processo.UsuarioResponsavel?.Email ?? string.Empty
            };
        }
    }
}