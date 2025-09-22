using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoraCOND.Application.Clientes.DTOs;
using NoraCOND.Application.Clientes.Services;
using System.Security.Claims;

namespace NoraCOND.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Protege todos os endpoints com JWT
    public class ClientesController : ControllerBase
    {
        private readonly IClienteService _clienteService;

        public ClientesController(IClienteService clienteService)
        {
            _clienteService = clienteService;
        }

        /// <summary>
        /// Cria um novo cliente
        /// </summary>
        /// <param name="request">Dados do cliente a ser criado</param>
        /// <returns>Cliente criado</returns>
        [HttpPost]
        public async Task<ActionResult<ClienteResponse>> CriarCliente([FromBody] CriarClienteRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Obter ID do usuário autenticado do token JWT
                var usuarioId = ObterUsuarioIdDoToken();
                if (usuarioId == Guid.Empty)
                {
                    return Unauthorized("Token inválido ou usuário não identificado.");
                }

                var cliente = await _clienteService.CriarClienteAsync(request, usuarioId);
                return CreatedAtAction(nameof(ObterClientePorId), new { id = cliente.Id }, cliente);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor.", details = ex.Message });
            }
        }

        /// <summary>
        /// Obtém todos os clientes
        /// </summary>
        /// <returns>Lista de clientes</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ClienteResponse>>> ObterTodosClientes()
        {
            try
            {
                var clientes = await _clienteService.ObterTodosClientesAsync();
                return Ok(clientes);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor.", details = ex.Message });
            }
        }

        /// <summary>
        /// Obtém um cliente por ID
        /// </summary>
        /// <param name="id">ID do cliente</param>
        /// <returns>Cliente encontrado</returns>
        [HttpGet("{id}")]
        public async Task<ActionResult<ClienteResponse>> ObterClientePorId(Guid id)
        {
            try
            {
                var cliente = await _clienteService.ObterClientePorIdAsync(id);
                if (cliente == null)
                {
                    return NotFound(new { message = "Cliente não encontrado." });
                }

                return Ok(cliente);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor.", details = ex.Message });
            }
        }

        /// <summary>
        /// Atualiza um cliente existente
        /// </summary>
        /// <param name="id">ID do cliente</param>
        /// <param name="request">Dados atualizados do cliente</param>
        /// <returns>Cliente atualizado</returns>
        [HttpPut("{id}")]
        public async Task<ActionResult<ClienteResponse>> AtualizarCliente(Guid id, [FromBody] AtualizarClienteRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var cliente = await _clienteService.AtualizarClienteAsync(id, request);
                if (cliente == null)
                {
                    return NotFound(new { message = "Cliente não encontrado." });
                }

                return Ok(cliente);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor.", details = ex.Message });
            }
        }

        /// <summary>
        /// Exclui um cliente
        /// </summary>
        /// <param name="id">ID do cliente</param>
        /// <returns>Resultado da operação</returns>
        [HttpDelete("{id}")]
        public async Task<ActionResult> ExcluirCliente(Guid id)
        {
            try
            {
                var sucesso = await _clienteService.ExcluirClienteAsync(id);
                if (!sucesso)
                {
                    return NotFound(new { message = "Cliente não encontrado." });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor.", details = ex.Message });
            }
        }

        /// <summary>
        /// Obtém o ID do usuário autenticado a partir do token JWT
        /// </summary>
        /// <returns>ID do usuário</returns>
        private Guid ObterUsuarioIdDoToken()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (Guid.TryParse(userIdClaim, out var userId))
            {
                return userId;
            }
            return Guid.Empty;
        }
    }
}