using System;

namespace NoraCOND.Application.Clientes.DTOs
{
    public class ClienteResponse
    {
        public Guid Id { get; set; }
        public string NomeCompleto { get; set; } = string.Empty;
        public string CpfCnpj { get; set; } = string.Empty;
        public string Telefone { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Endereco { get; set; } = string.Empty;
        public DateTime DataCriacao { get; set; }
        public Guid UsuarioDeCriacaoId { get; set; }
        public string? NomeUsuarioCriacao { get; set; }
    }
}