using NoraCOND.Application.Dashboard.DTOs;

namespace NoraCOND.Application.Interfaces;

/// <summary>
/// Interface para serviços de dashboard e estatísticas
/// </summary>
public interface IDashboardService
{
    /// <summary>
    /// Obtém as estatísticas agregadas do dashboard
    /// </summary>
    /// <returns>Objeto com todas as estatísticas do sistema</returns>
    Task<DashboardStatsResponse> GetDashboardStatsAsync();
}
