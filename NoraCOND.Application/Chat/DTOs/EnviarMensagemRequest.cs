using System.ComponentModel.DataAnnotations;

namespace NoraCOND.Application.Chat.DTOs;

public class EnviarMensagemRequest
{
    [Required(ErrorMessage = "O ID do destinatário é obrigatório")]
    public Guid DestinatarioId { get; set; }

    [Required(ErrorMessage = "O conteúdo da mensagem é obrigatório")]
    [StringLength(1000, ErrorMessage = "O conteúdo da mensagem não pode exceder 1000 caracteres")]
    public string Conteudo { get; set; } = string.Empty;
}