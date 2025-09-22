namespace NoraCOND.Application.Dashboard.DTOs;

/// <summary>
/// DTO para resposta das estatísticas do dashboard
/// </summary>
public class DashboardStatsResponse
{
    /// <summary>
    /// Total de clientes cadastrados no sistema
    /// </summary>
    public int TotalClientes { get; set; }

    /// <summary>
    /// Número de novos clientes cadastrados nos últimos 30 dias
    /// </summary>
    public int NovosClientesUltimos30Dias { get; set; }

    /// <summary>
    /// Total de processos com status ativo/em andamento
    /// </summary>
    public int TotalProcessosAtivos { get; set; }

    /// <summary>
    /// Total de processos arquivados/finalizados
    /// </summary>
    public int TotalProcessosArquivados { get; set; }

    /// <summary>
    /// Valor total de receitas não pagas (a receber)
    /// </summary>
    public decimal TotalAReceber { get; set; }

    /// <summary>
    /// Valor total de despesas não pagas (a pagar)
    /// </summary>
    public decimal TotalAPagar { get; set; }
}