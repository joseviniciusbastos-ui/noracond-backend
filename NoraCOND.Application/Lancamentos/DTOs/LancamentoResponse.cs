using NoraCOND.Domain.Enums;

namespace NoraCOND.Application.Lancamentos.DTOs
{
    public class LancamentoResponse
    {
        public Guid Id { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public TipoLancamento Tipo { get; set; }
        public string TipoDescricao => Tipo.ToString();
        public DateTime DataVencimento { get; set; }
        public DateTime? DataPagamento { get; set; }
        public bool Pago { get; set; }
        public Guid ProcessoId { get; set; }
        public string ProcessoNumero { get; set; } = string.Empty;
        public string ProcessoTitulo { get; set; } = string.Empty;
    }
}