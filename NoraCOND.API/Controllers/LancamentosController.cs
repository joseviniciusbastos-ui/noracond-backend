using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoraCOND.Application.Lancamentos.DTOs;
using NoraCOND.Application.Interfaces;

namespace NoraCOND.API.Controllers
{
    [ApiController]
    [Route("api")]
    [Authorize]
    public class LancamentosController : ControllerBase
    {
        private readonly ILancamentoFinanceiroService _lancamentoService;

        public LancamentosController(ILancamentoFinanceiroService lancamentoService)
        {
            _lancamentoService = lancamentoService;
        }

        /// <summary>
        /// Lista todos os lançamentos de um processo específico
        /// </summary>
        [HttpGet("processos/{processoId:guid}/lancamentos")]
        public async Task<ActionResult<IEnumerable<LancamentoResponse>>> GetLancamentosByProcesso(Guid processoId)
        {
            try
            {
                var lancamentos = await _lancamentoService.GetByProcessoIdAsync(processoId);
                return Ok(lancamentos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Adiciona um novo lançamento a um processo
        /// </summary>
        [HttpPost("processos/{processoId:guid}/lancamentos")]
        public async Task<ActionResult<LancamentoResponse>> CreateLancamento(Guid processoId, [FromBody] CriarLancamentoRequest request)
        {
            try
            {
                // Garantir que o ProcessoId do request corresponde ao da rota
                request.ProcessoId = processoId;
                
                var lancamento = await _lancamentoService.CreateAsync(request);
                return CreatedAtAction(nameof(GetLancamentoById), new { id = lancamento.Id }, lancamento);
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

        /// <summary>
        /// Obtém um lançamento específico por ID
        /// </summary>
        [HttpGet("lancamentos/{id:guid}")]
        public async Task<ActionResult<LancamentoResponse>> GetLancamentoById(Guid id)
        {
            try
            {
                var lancamento = await _lancamentoService.GetByIdAsync(id);
                if (lancamento == null)
                    return NotFound(new { message = "Lançamento não encontrado" });

                return Ok(lancamento);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Atualiza os dados de um lançamento
        /// </summary>
        [HttpPut("lancamentos/{id:guid}")]
        public async Task<ActionResult<LancamentoResponse>> UpdateLancamento(Guid id, [FromBody] AtualizarLancamentoRequest request)
        {
            try
            {
                var lancamento = await _lancamentoService.UpdateAsync(id, request);
                if (lancamento == null)
                    return NotFound(new { message = "Lançamento não encontrado" });

                return Ok(lancamento);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Marca um lançamento como pago, recebendo a data de pagamento
        /// </summary>
        [HttpPatch("lancamentos/{id:guid}/marcar-pago")]
        public async Task<ActionResult<LancamentoResponse>> MarcarComoPago(Guid id, [FromBody] MarcarComoPagoRequest request)
        {
            try
            {
                var lancamento = await _lancamentoService.MarcarComoPagoAsync(id, request);
                if (lancamento == null)
                    return NotFound(new { message = "Lançamento não encontrado" });

                return Ok(lancamento);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Remove um lançamento
        /// </summary>
        [HttpDelete("lancamentos/{id:guid}")]
        public async Task<ActionResult> DeleteLancamento(Guid id)
        {
            try
            {
                var success = await _lancamentoService.DeleteAsync(id);
                if (!success)
                    return NotFound(new { message = "Lançamento não encontrado" });

                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Lista todos os lançamentos (endpoint adicional para administração)
        /// </summary>
        [HttpGet("lancamentos")]
        public async Task<ActionResult<IEnumerable<LancamentoResponse>>> GetAllLancamentos()
        {
            try
            {
                var lancamentos = await _lancamentoService.GetAllAsync();
                return Ok(lancamentos);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}