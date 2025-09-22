using System;
using System.ComponentModel.DataAnnotations;

namespace NoraCOND.Domain.Entities
{
    public class Processo
    {
        public Guid Id { get; set; }

        [Required]
        [StringLength(25)]
        public string NumeroProcesso { get; set; } = string.Empty; // Número unificado do processo (CNJ)

        [Required]
        [StringLength(200)]
        public string Titulo { get; set; } = string.Empty;

        [StringLength(1000)]
        public string Descricao { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "Em Andamento"; // Ex: "Em Andamento", "Arquivado", "Finalizado"

        public DateTime DataAbertura { get; set; }

        public DateTime? DataEncerramento { get; set; }

        // Chave estrangeira para o Cliente
        public Guid ClienteId { get; set; }
        public Cliente Cliente { get; set; } = null!; // Propriedade de navegação

        // Chave estrangeira para o Usuário responsável
        public Guid UsuarioResponsavelId { get; set; }
        public Usuario UsuarioResponsavel { get; set; } = null!; // Propriedade de navegação

        // Campos de auditoria
        public DateTime DataCriacao { get; set; }
        public DateTime DataAtualizacao { get; set; }

        // Relacionamento com Lançamentos Financeiros
        public ICollection<LancamentoFinanceiro> LancamentosFinanceiros { get; set; } = new List<LancamentoFinanceiro>();

        // Relacionamento com Documentos
        public ICollection<Documento> Documentos { get; set; } = new List<Documento>();

        public Processo()
        {
            Id = Guid.NewGuid();
            DataAbertura = DateTime.UtcNow;
            DataCriacao = DateTime.UtcNow;
            DataAtualizacao = DateTime.UtcNow;
        }
    }
}