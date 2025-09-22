using System;

namespace NoraCOND.Domain.Entities
{
    public class Usuario
    {
        public Guid Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string SenhaHash { get; set; } = string.Empty; // Armazenará a senha com hash
        public string Role { get; set; } = string.Empty; // Ex: "Admin", "Advogado", "Estagiario"
        public DateTime DataCriacao { get; set; }

        // Relacionamentos para Chat
        public ICollection<Mensagem> MensagensEnviadas { get; set; } = new List<Mensagem>();
        public ICollection<Mensagem> MensagensRecebidas { get; set; } = new List<Mensagem>();

        public Usuario()
        {
            Id = Guid.NewGuid();
            DataCriacao = DateTime.UtcNow;
        }
    }
}