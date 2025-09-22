namespace NoraCOND.Application.Chat.DTOs;

public class MensagemResponse
{
    public Guid Id { get; set; }
    public string Conteudo { get; set; } = string.Empty;
    public DateTime DataEnvio { get; set; }
    public bool Lida { get; set; }
    public Guid RemetenteId { get; set; }
    public string RemetenteNome { get; set; } = string.Empty;
    public Guid DestinatarioId { get; set; }
    public string DestinatarioNome { get; set; } = string.Empty;
}