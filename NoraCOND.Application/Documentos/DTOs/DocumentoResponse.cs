namespace NoraCOND.Application.Documentos.DTOs
{
    public class DocumentoResponse
    {
        public Guid Id { get; set; }
        public string NomeOriginal { get; set; } = string.Empty;
        public string TipoConteudo { get; set; } = string.Empty;
        public long TamanhoBytes { get; set; }
        public DateTime DataUpload { get; set; }
        public Guid ProcessoId { get; set; }
    }
}