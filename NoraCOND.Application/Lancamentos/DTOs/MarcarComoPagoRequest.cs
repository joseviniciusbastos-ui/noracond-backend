using System.ComponentModel.DataAnnotations;

namespace NoraCOND.Application.Lancamentos.DTOs
{
    public class MarcarComoPagoRequest
    {
        [Required(ErrorMessage = "A data de pagamento é obrigatória")]
        public DateTime DataPagamento { get; set; }
    }
}