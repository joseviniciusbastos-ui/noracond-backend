namespace NoraCOND.Domain.Entities;

public class Mensagem
{
    public Guid Id { get; set; }
    public string Conteudo { get; set; } = string.Empty;
    public DateTime DataEnvio { get; set; }
    public bool Lida { get; set; }

    // Chaves estrangeiras para Remetente e Destinatário
    public Guid RemetenteId { get; set; }
    public Usuario Remetente { get; set; } = null!;

    public Guid DestinatarioId { get; set; }
    public Usuario Destinatario { get; set; } = null!;
}