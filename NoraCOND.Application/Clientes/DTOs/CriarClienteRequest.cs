using System.ComponentModel.DataAnnotations;

namespace NoraCOND.Application.Clientes.DTOs
{
    public class CriarClienteRequest
    {
        [Required(ErrorMessage = "Nome completo é obrigatório")]
        [StringLength(200, MinimumLength = 2, ErrorMessage = "Nome deve ter entre 2 e 200 caracteres")]
        public string NomeCompleto { get; set; } = string.Empty;

        [Required(ErrorMessage = "CPF/CNPJ é obrigatório")]
        [StringLength(18, MinimumLength = 11, ErrorMessage = "CPF/CNPJ deve ter entre 11 e 18 caracteres")]
        public string CpfCnpj { get; set; } = string.Empty;

        [Required(ErrorMessage = "Telefone é obrigatório")]
        [StringLength(20, MinimumLength = 10, ErrorMessage = "Telefone deve ter entre 10 e 20 caracteres")]
        public string Telefone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email é obrigatório")]
        [EmailAddress(ErrorMessage = "Email deve ter um formato válido")]
        [StringLength(100, ErrorMessage = "Email deve ter no máximo 100 caracteres")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Endereço é obrigatório")]
        [StringLength(500, MinimumLength = 10, ErrorMessage = "Endereço deve ter entre 10 e 500 caracteres")]
        public string Endereco { get; set; } = string.Empty;
    }
}