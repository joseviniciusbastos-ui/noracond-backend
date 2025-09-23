using NoraCOND.Application.Chat.DTOs;
using NoraCOND.Application.Interfaces;
using NoraCOND.Domain.Entities;

namespace NoraCOND.Application.Chat.Services;

public class ChatService : IChatService
{
    private readonly IChatRepository _chatRepository;

    public ChatService(IChatRepository chatRepository)
    {
        _chatRepository = chatRepository;
    }

    public async Task<MensagemResponse> EnviarMensagemAsync(Guid remetenteId, Guid destinatarioId, string conteudo)
    {
        if (remetenteId == destinatarioId)
        {
            throw new ArgumentException("Não é possível enviar mensagem para si mesmo");
        }

        if (string.IsNullOrWhiteSpace(conteudo))
        {
            throw new ArgumentException("O conteúdo da mensagem não pode estar vazio");
        }

        var mensagem = new Mensagem
        {
            Id = Guid.NewGuid(),
            RemetenteId = remetenteId,
            DestinatarioId = destinatarioId,
            Conteudo = conteudo.Trim(),
            DataEnvio = DateTime.UtcNow,
            Lida = false
        };

        var mensagemSalva = await _chatRepository.EnviarMensagemAsync(mensagem);

        return new MensagemResponse
        {
            Id = mensagemSalva.Id,
            Conteudo = mensagemSalva.Conteudo,
            DataEnvio = mensagemSalva.DataEnvio,
            Lida = mensagemSalva.Lida,
            RemetenteId = mensagemSalva.RemetenteId,
            RemetenteNome = mensagemSalva.Remetente.Nome,
            DestinatarioId = mensagemSalva.DestinatarioId,
            DestinatarioNome = mensagemSalva.Destinatario.Nome
        };
    }

    public async Task<IEnumerable<MensagemResponse>> GetConversaAsync(Guid usuarioId1, Guid usuarioId2)
    {
        var mensagens = await _chatRepository.GetConversaAsync(usuarioId1, usuarioId2);

        return mensagens.Select(m => new MensagemResponse
        {
            Id = m.Id,
            Conteudo = m.Conteudo,
            DataEnvio = m.DataEnvio,
            Lida = m.Lida,
            RemetenteId = m.RemetenteId,
            RemetenteNome = m.Remetente.Nome,
            DestinatarioId = m.DestinatarioId,
            DestinatarioNome = m.Destinatario.Nome
        });
    }

    public async Task<IEnumerable<ContatoResponse>> GetContatosAsync(Guid usuarioId)
    {
        var contatos = await _chatRepository.GetContatosAsync(usuarioId);
        var contatosResponse = new List<ContatoResponse>();

        foreach (var contato in contatos)
        {
            var conversa = await _chatRepository.GetConversaAsync(usuarioId, contato.Id);
            var ultimaMensagem = conversa.OrderByDescending(m => m.DataEnvio).FirstOrDefault();
            var mensagensNaoLidas = await _chatRepository.GetMensagensNaoLidasCountAsync(usuarioId, contato.Id);

            contatosResponse.Add(new ContatoResponse
            {
                UsuarioId = contato.Id,
                Nome = contato.Nome,
                Email = contato.Email,
                UltimaMensagem = ultimaMensagem?.Conteudo,
                DataUltimaMensagem = ultimaMensagem?.DataEnvio,
                MensagensNaoLidas = mensagensNaoLidas
            });
        }

        return contatosResponse.OrderByDescending(c => c.DataUltimaMensagem);
    }

    public async Task MarcarConversaComoLidaAsync(Guid usuarioLogadoId, Guid outroUsuarioId)
    {
        await _chatRepository.MarcarMensagensComoLidasAsync(outroUsuarioId, usuarioLogadoId);
    }
}