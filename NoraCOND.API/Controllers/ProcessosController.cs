using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoraCOND.Application.Processos.DTOs;
using NoraCOND.Application.Processos.Services;
using System.Security.Claims;

namespace NoraCOND.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProcessosController : ControllerBase
    {
        private readonly IProcessoService _processoService;

        public ProcessosController(IProcessoService processoService)
        {
            _processoService = processoService;
        }

        [HttpPost]
        public async Task<ActionResult<ProcessoResponse>> CriarProcesso([FromBody] CriarProcessoRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var usuarioId = ObterUsuarioIdDoToken();
                var processo = await _processoService.CriarProcessoAsync(request, usuarioId);

                return CreatedAtAction(nameof(ObterProcessoPorId), new { id = processo.Id }, processo);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProcessoResponse>>> ObterTodosProcessos()
        {
            try
            {
                var processos = await _processoService.ObterTodosProcessosAsync();
                return Ok(processos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ProcessoResponse>> ObterProcessoPorId(Guid id)
        {
            try
            {
                var processo = await _processoService.ObterProcessoPorIdAsync(id);
                
                if (processo == null)
                {
                    return NotFound(new { message = "Processo não encontrado" });
                }

                return Ok(processo);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        [HttpGet("cliente/{clienteId}")]
        public async Task<ActionResult<IEnumerable<ProcessoResponse>>> ObterProcessosPorCliente(Guid clienteId)
        {
            try
            {
                var processos = await _processoService.ObterProcessosPorClienteAsync(clienteId);
                return Ok(processos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        [HttpGet("usuario/{usuarioId}")]
        public async Task<ActionResult<IEnumerable<ProcessoResponse>>> ObterProcessosPorUsuario(Guid usuarioId)
        {
            try
            {
                var processos = await _processoService.ObterProcessosPorUsuarioResponsavelAsync(usuarioId);
                return Ok(processos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        [HttpGet("meus-processos")]
        public async Task<ActionResult<IEnumerable<ProcessoResponse>>> ObterMeusProcessos()
        {
            try
            {
                var usuarioId = ObterUsuarioIdDoToken();
                var processos = await _processoService.ObterProcessosPorUsuarioResponsavelAsync(usuarioId);
                return Ok(processos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ProcessoResponse>> AtualizarProcesso(Guid id, [FromBody] AtualizarProcessoRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var processo = await _processoService.AtualizarProcessoAsync(id, request);
                return Ok(processo);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> ExcluirProcesso(Guid id)
        {
            try
            {
                var sucesso = await _processoService.ExcluirProcessoAsync(id);
                
                if (!sucesso)
                {
                    return NotFound(new { message = "Processo não encontrado" });
                }

                return NoContent();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        private Guid ObterUsuarioIdDoToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("Token inválido ou usuário não identificado");
            }

            return userId;
        }
    }
}