using NoraCOND.Application.Interfaces;
using NoraCOND.Application.Dashboard.DTOs;
using NoraCOND.Domain.Enums;

namespace NoraCOND.Application.Dashboard.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IClienteRepository _clienteRepository;
        private readonly IProcessoRepository _processoRepository;
        private readonly ILancamentoFinanceiroRepository _lancamentoRepository;

        public DashboardService(
            IClienteRepository clienteRepository,
            IProcessoRepository processoRepository,
            ILancamentoFinanceiroRepository lancamentoRepository)
        {
            _clienteRepository = clienteRepository;
            _processoRepository = processoRepository;
            _lancamentoRepository = lancamentoRepository;
        }

        public async Task<DashboardStatsResponse> GetDashboardStatsAsync()
        {
            // Buscar todos os dados necessários em paralelo para otimizar performance
            var clientesTask = _clienteRepository.GetAllAsync();
            var processosTask = _processoRepository.ObterTodosAsync();
            var lancamentosTask = _lancamentoRepository.GetAllAsync();

            await Task.WhenAll(clientesTask, processosTask, lancamentosTask);

            var clientes = await clientesTask;
            var processos = await processosTask;
            var lancamentos = await lancamentosTask;

            // Calcular estatísticas
            var dataLimite30Dias = DateTime.UtcNow.AddDays(-30);

            var stats = new DashboardStatsResponse
            {
                TotalClientes = clientes.Count(),
                NovosClientesUltimos30Dias = clientes.Count(c => c.DataCriacao >= dataLimite30Dias),
                TotalProcessosAtivos = processos.Count(p => p.Status == "Em Andamento" || p.Status == "Ativo"),
                TotalProcessosArquivados = processos.Count(p => p.Status == "Arquivado" || p.Status == "Finalizado"),
                TotalAReceber = lancamentos
                    .Where(l => l.Tipo == TipoLancamento.Receita && !l.Pago)
                    .Sum(l => l.Valor),
                TotalAPagar = lancamentos
                    .Where(l => l.Tipo == TipoLancamento.Despesa && !l.Pago)
                    .Sum(l => l.Valor)
            };

            return stats;
        }
    }
}