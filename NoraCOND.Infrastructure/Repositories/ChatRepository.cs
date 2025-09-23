using Microsoft.EntityFrameworkCore;
using NoraCOND.Application.Interfaces;
using NoraCOND.Domain.Entities;
using NoraCOND.Infrastructure.Data;

namespace NoraCOND.Infrastructure.Repositories;

public class ChatRepository : IChatRepository
{
    private readonly AppDbContext _context;

    public ChatRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Mensagem> EnviarMensagemAsync(Mensagem mensagem)
    {
        _context.Mensagens.Add(mensagem);
        await _context.SaveChangesAsync();
        
        // Carrega os relacionamentos para retornar a mensagem completa
        await _context.Entry(mensagem)
            .Reference(m => m.Remetente)
            .LoadAsync();
        
        await _context.Entry(mensagem)
            .Reference(m => m.Destinatario)
            .LoadAsync();

        return mensagem;
    }

    public async Task<IEnumerable<Mensagem>> GetConversaAsync(Guid usuarioId1, Guid usuarioId2)
    {
        return await _context.Mensagens
            .Include(m => m.Remetente)
            .Include(m => m.Destinatario)
            .Where(m => (m.RemetenteId == usuarioId1 && m.DestinatarioId == usuarioId2) ||
                       (m.RemetenteId == usuarioId2 && m.DestinatarioId == usuarioId1))
            .OrderBy(m => m.DataEnvio)
            .ToListAsync();
    }

    public async Task<IEnumerable<Usuario>> GetContatosAsync(Guid usuarioId)
    {
        var contatosIds = await _context.Mensagens
            .Where(m => m.RemetenteId == usuarioId || m.DestinatarioId == usuarioId)
            .Select(m => m.RemetenteId == usuarioId ? m.DestinatarioId : m.RemetenteId)
            .Distinct()
            .ToListAsync();

        return await _context.Usuarios
            .Where(u => contatosIds.Contains(u.Id))
            .ToListAsync();
    }

    public async Task MarcarMensagensComoLidasAsync(Guid remetenteId, Guid destinatarioId)
    {
        var mensagensNaoLidas = await _context.Mensagens
            .Where(m => m.RemetenteId == remetenteId && 
                       m.DestinatarioId == destinatarioId && 
                       !m.Lida)
            .ToListAsync();

        foreach (var mensagem in mensagensNaoLidas)
        {
            mensagem.Lida = true;
        }

        await _context.SaveChangesAsync();
    }

    public async Task<int> GetMensagensNaoLidasCountAsync(Guid usuarioId, Guid outroUsuarioId)
    {
        return await _context.Mensagens
            .CountAsync(m => m.RemetenteId == outroUsuarioId && 
                            m.DestinatarioId == usuarioId && 
                            !m.Lida);
    }
}