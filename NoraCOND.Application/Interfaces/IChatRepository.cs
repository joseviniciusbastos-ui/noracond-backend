using NoraCOND.Domain.Entities;

namespace NoraCOND.Application.Interfaces;

public interface IChatRepository
{
    Task<Mensagem> EnviarMensagemAsync(Mensagem mensagem);
    Task<IEnumerable<Mensagem>> GetConversaAsync(Guid usuarioId1, Guid usuarioId2);
    Task<IEnumerable<Usuario>> GetContatosAsync(Guid usuarioId);
    Task MarcarMensagensComoLidasAsync(Guid remetenteId, Guid destinatarioId);
    Task<int> GetMensagensNaoLidasCountAsync(Guid usuarioId, Guid outroUsuarioId);
}
