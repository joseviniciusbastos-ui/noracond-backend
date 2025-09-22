namespace NoraCOND.Domain.Entities
{
    public class Documento
    {
        public Guid Id { get; set; }
        public string NomeOriginal { get; set; } = string.Empty;
        public string NomeUnico { get; set; } = string.Empty; // Nome salvo em disco para evitar conflitos
        public string CaminhoArquivo { get; set; } = string.Empty;
        public string TipoConteudo { get; set; } = string.Empty; // MIME Type (e.g., "application/pdf")
        public long TamanhoBytes { get; set; }
        public DateTime DataUpload { get; set; }

        // Chave estrangeira para o Processo
        public Guid ProcessoId { get; set; }
        public Processo Processo { get; set; } = null!;
    }
}