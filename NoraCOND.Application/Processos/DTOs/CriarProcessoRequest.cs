using System.ComponentModel.DataAnnotations;

namespace NoraCOND.Application.Processos.DTOs
{
    public class CriarProcessoRequest
    {
        [Required(ErrorMessage = "O número do processo é obrigatório")]
        [StringLength(25, ErrorMessage = "O número do processo deve ter no máximo 25 caracteres")]
        public string NumeroProcesso { get; set; } = string.Empty;

        [Required(ErrorMessage = "O título é obrigatório")]
        [StringLength(200, ErrorMessage = "O título deve ter no máximo 200 caracteres")]
        public string Titulo { get; set; } = string.Empty;

        [StringLength(1000, ErrorMessage = "A descrição deve ter no máximo 1000 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        [Required(ErrorMessage = "O status é obrigatório")]
        [StringLength(50, ErrorMessage = "O status deve ter no máximo 50 caracteres")]
        public string Status { get; set; } = "Em Andamento";

        public DateTime DataAbertura { get; set; } = DateTime.UtcNow;

        [Required(ErrorMessage = "O ID do cliente é obrigatório")]
        public Guid ClienteId { get; set; }
    }
}