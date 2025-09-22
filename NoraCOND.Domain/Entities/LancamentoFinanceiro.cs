using NoraCOND.Domain.Enums;

namespace NoraCOND.Domain.Entities
{
    public class LancamentoFinanceiro
    {
        public Guid Id { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public decimal Valor { get; set; }
        public TipoLancamento Tipo { get; set; }
        public DateTime DataVencimento { get; set; }
        public DateTime? DataPagamento { get; set; } // Nullable, pois pode não ter sido pago ainda
        public bool Pago { get; set; }

        // Chave estrangeira para o Processo
        public Guid ProcessoId { get; set; }
        public Processo Processo { get; set; } = null!; // Propriedade de navegação

        public LancamentoFinanceiro()
        {
            Id = Guid.NewGuid();
        }
    }
}