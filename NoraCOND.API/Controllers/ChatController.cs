using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoraCOND.Application.Chat.DTOs;
using NoraCOND.Application.Interfaces;
using System.Security.Claims;

namespace NoraCOND.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IChatService _chatService;

    public ChatController(IChatService chatService)
    {
        _chatService = chatService;
    }

    /// <summary>
    /// Envia uma mensagem para outro usuário
    /// </summary>
    [HttpPost("enviar")]
    public async Task<ActionResult<MensagemResponse>> EnviarMensagem([FromBody] EnviarMensagemRequest request)
    {
        try
        {
            var remetenteId = GetUsuarioIdFromToken();
            var mensagem = await _chatService.EnviarMensagemAsync(remetenteId, request.DestinatarioId, request.Conteudo);
            
            return Ok(mensagem);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }

    /// <summary>
    /// Retorna o histórico de mensagens entre o usuário logado e outro usuário
    /// </summary>
    [HttpGet("conversa/{outroUsuarioId:guid}")]
    public async Task<ActionResult<IEnumerable<MensagemResponse>>> GetConversa(Guid outroUsuarioId)
    {
        try
        {
            var usuarioLogadoId = GetUsuarioIdFromToken();
            var conversa = await _chatService.GetConversaAsync(usuarioLogadoId, outroUsuarioId);
            
            return Ok(conversa);
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }

    /// <summary>
    /// Retorna a lista de contatos com quem o usuário já conversou
    /// </summary>
    [HttpGet("contatos")]
    public async Task<ActionResult<IEnumerable<ContatoResponse>>> GetContatos()
    {
        try
        {
            var usuarioLogadoId = GetUsuarioIdFromToken();
            var contatos = await _chatService.GetContatosAsync(usuarioLogadoId);
            
            return Ok(contatos);
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }

    /// <summary>
    /// Marca todas as mensagens recebidas de um usuário como lidas
    /// </summary>
    [HttpPost("conversa/{outroUsuarioId:guid}/marcar-lida")]
    public async Task<ActionResult> MarcarConversaComoLida(Guid outroUsuarioId)
    {
        try
        {
            var usuarioLogadoId = GetUsuarioIdFromToken();
            await _chatService.MarcarConversaComoLidaAsync(usuarioLogadoId, outroUsuarioId);
            
            return Ok(new { message = "Conversa marcada como lida" });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "Erro interno do servidor" });
        }
    }

    private Guid GetUsuarioIdFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("Token inválido");
        }
        
        return userId;
    }
}