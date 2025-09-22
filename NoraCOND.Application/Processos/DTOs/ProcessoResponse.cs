namespace NoraCOND.Application.Processos.DTOs
{
    public class ProcessoResponse
    {
        public Guid Id { get; set; }
        public string NumeroProcesso { get; set; } = string.Empty;
        public string Titulo { get; set; } = string.Empty;
        public string Descricao { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime DataAbertura { get; set; }
        public DateTime? DataEncerramento { get; set; }
        public DateTime DataCriacao { get; set; }
        public DateTime DataAtualizacao { get; set; }

        // Dados do Cliente
        public Guid ClienteId { get; set; }
        public string ClienteNome { get; set; } = string.Empty;
        public string ClienteCpfCnpj { get; set; } = string.Empty;

        // Dados do Usuário Responsável
        public Guid UsuarioResponsavelId { get; set; }
        public string UsuarioResponsavelNome { get; set; } = string.Empty;
        public string UsuarioResponsavelEmail { get; set; } = string.Empty;
    }
}