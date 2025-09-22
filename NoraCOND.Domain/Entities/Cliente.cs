using System;
using System.Collections.Generic;

namespace NoraCOND.Domain.Entities
{
    public class Cliente
    {
        public Guid Id { get; set; }
        public string NomeCompleto { get; set; } = string.Empty;
        public string CpfCnpj { get; set; } = string.Empty;
        public string Telefone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Endereco { get; set; } = string.Empty;
        public DateTime DataCriacao { get; set; }

        // Chave estrangeira para rastrear quem cadastrou
        public Guid UsuarioDeCriacaoId { get; set; }
        
        // Propriedade de navegação
        public Usuario? UsuarioDeCriacao { get; set; }

        // Navegação inversa para Processos
        public ICollection<Processo> Processos { get; set; } = new List<Processo>();

        public Cliente()
        {
            Id = Guid.NewGuid();
            DataCriacao = DateTime.UtcNow;
        }
    }
}