using NoraCOND.Application.Interfaces;
using NoraCOND.Application.Lancamentos.DTOs;
using NoraCOND.Domain.Entities;

namespace NoraCOND.Application.Lancamentos.Services
{
    public class LancamentoFinanceiroService : ILancamentoFinanceiroService
    {
        private readonly ILancamentoFinanceiroRepository _lancamentoRepository;
        private readonly IProcessoRepository _processoRepository;

        public LancamentoFinanceiroService(
            ILancamentoFinanceiroRepository lancamentoRepository,
            IProcessoRepository processoRepository)
        {
            _lancamentoRepository = lancamentoRepository;
            _processoRepository = processoRepository;
        }

        public async Task<LancamentoResponse?> GetByIdAsync(Guid id)
        {
            var lancamento = await _lancamentoRepository.GetByIdAsync(id);
            return lancamento != null ? MapToResponse(lancamento) : null;
        }

        public async Task<IEnumerable<LancamentoResponse>> GetAllAsync()
        {
            var lancamentos = await _lancamentoRepository.GetAllAsync();
            return lancamentos.Select(MapToResponse);
        }

        public async Task<IEnumerable<LancamentoResponse>> GetByProcessoIdAsync(Guid processoId)
        {
            var lancamentos = await _lancamentoRepository.GetByProcessoIdAsync(processoId);
            return lancamentos.Select(MapToResponse);
        }

        public async Task<LancamentoResponse> CreateAsync(CriarLancamentoRequest request)
        {
            // Verificar se o processo existe
        var processoExiste = await _processoRepository.ExisteAsync(request.ProcessoId);
        if (!processoExiste)
                throw new ArgumentException("Processo não encontrado", nameof(request.ProcessoId));

            var lancamento = new LancamentoFinanceiro
            {
                Descricao = request.Descricao,
                Valor = request.Valor,
                Tipo = request.Tipo,
                DataVencimento = request.DataVencimento,
                DataPagamento = request.DataPagamento,
                Pago = request.Pago,
                ProcessoId = request.ProcessoId
            };

            var createdLancamento = await _lancamentoRepository.CreateAsync(lancamento);
            return MapToResponse(createdLancamento);
        }

        public async Task<LancamentoResponse?> UpdateAsync(Guid id, AtualizarLancamentoRequest request)
        {
            var lancamento = await _lancamentoRepository.GetByIdAsync(id);
            if (lancamento == null)
                return null;

            lancamento.Descricao = request.Descricao;
            lancamento.Valor = request.Valor;
            lancamento.Tipo = request.Tipo;
            lancamento.DataVencimento = request.DataVencimento;
            lancamento.DataPagamento = request.DataPagamento;
            lancamento.Pago = request.Pago;

            var updatedLancamento = await _lancamentoRepository.UpdateAsync(lancamento);
            return MapToResponse(updatedLancamento);
        }

        public async Task<LancamentoResponse?> MarcarComoPagoAsync(Guid id, MarcarComoPagoRequest request)
        {
            var lancamento = await _lancamentoRepository.GetByIdAsync(id);
            if (lancamento == null)
                return null;

            lancamento.DataPagamento = request.DataPagamento;
            lancamento.Pago = true;

            var updatedLancamento = await _lancamentoRepository.UpdateAsync(lancamento);
            return MapToResponse(updatedLancamento);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _lancamentoRepository.DeleteAsync(id);
        }

        private static LancamentoResponse MapToResponse(LancamentoFinanceiro lancamento)
        {
            return new LancamentoResponse
            {
                Id = lancamento.Id,
                Descricao = lancamento.Descricao,
                Valor = lancamento.Valor,
                Tipo = lancamento.Tipo,
                DataVencimento = lancamento.DataVencimento,
                DataPagamento = lancamento.DataPagamento,
                Pago = lancamento.Pago,
                ProcessoId = lancamento.ProcessoId,
                ProcessoNumero = lancamento.Processo?.NumeroProcesso ?? string.Empty,
                ProcessoTitulo = lancamento.Processo?.Titulo ?? string.Empty
            };
        }
    }
}