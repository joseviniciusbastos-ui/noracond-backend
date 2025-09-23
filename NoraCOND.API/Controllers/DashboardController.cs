using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoraCOND.Application.Interfaces;

namespace NoraCOND.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Protege todos os endpoints com JWT
    public class DashboardController : ControllerBase
    {
        private readonly IDashboardService _dashboardService;

        public DashboardController(IDashboardService dashboardService)
        {
            _dashboardService = dashboardService;
        }

        /// <summary>
        /// Obtém as estatísticas do dashboard
        /// </summary>
        /// <returns>Objeto JSON com as principais métricas do sistema</returns>
        [HttpGet("stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var stats = await _dashboardService.GetDashboardStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }
    }
}