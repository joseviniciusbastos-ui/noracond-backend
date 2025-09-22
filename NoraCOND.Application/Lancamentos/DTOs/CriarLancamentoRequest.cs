using System.ComponentModel.DataAnnotations;
using NoraCOND.Domain.Enums;

namespace NoraCOND.Application.Lancamentos.DTOs
{
    public class CriarLancamentoRequest
    {
        [Required(ErrorMessage = "A descrição é obrigatória")]
        [StringLength(500, ErrorMessage = "A descrição deve ter no máximo 500 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        [Required(ErrorMessage = "O valor é obrigatório")]
        [Range(0.01, double.MaxValue, ErrorMessage = "O valor deve ser maior que zero")]
        public decimal Valor { get; set; }

        [Required(ErrorMessage = "O tipo de lançamento é obrigatório")]
        public TipoLancamento Tipo { get; set; }

        [Required(ErrorMessage = "A data de vencimento é obrigatória")]
        public DateTime DataVencimento { get; set; }

        public DateTime? DataPagamento { get; set; }

        public bool Pago { get; set; } = false;

        [Required(ErrorMessage = "O ID do processo é obrigatório")]
        public Guid ProcessoId { get; set; }
    }
}