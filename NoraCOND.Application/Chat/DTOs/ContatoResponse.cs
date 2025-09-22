namespace NoraCOND.Application.Chat.DTOs;

public class ContatoResponse
{
    public Guid UsuarioId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? UltimaMensagem { get; set; }
    public DateTime? DataUltimaMensagem { get; set; }
    public int MensagensNaoLidas { get; set; }
}