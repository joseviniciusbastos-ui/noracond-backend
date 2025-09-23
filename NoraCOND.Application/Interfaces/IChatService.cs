using NoraCOND.Application.Chat.DTOs;

namespace NoraCOND.Application.Interfaces;

public interface IChatService
{
    Task<MensagemResponse> EnviarMensagemAsync(Guid remetenteId, Guid destinatarioId, string conteudo);
    Task<IEnumerable<MensagemResponse>> GetConversaAsync(Guid usuarioId1, Guid usuarioId2);
    Task<IEnumerable<ContatoResponse>> GetContatosAsync(Guid usuarioId);
    Task MarcarConversaComoLidaAsync(Guid usuarioLogadoId, Guid outroUsuarioId);
}
