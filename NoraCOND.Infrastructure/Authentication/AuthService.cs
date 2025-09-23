using System;
using System.Threading.Tasks;
using BCrypt.Net;
using NoraCOND.Application.Interfaces;
using NoraCOND.Domain.Entities;

namespace NoraCOND.Infrastructure.Authentication
{
    public class AuthService : IAuthService
    {
        private readonly IUsuarioRepository _usuarioRepository;
        private readonly IJwtTokenGenerator _jwtTokenGenerator;

        public AuthService(IUsuarioRepository usuarioRepository, IJwtTokenGenerator jwtTokenGenerator)
        {
            _usuarioRepository = usuarioRepository;
            _jwtTokenGenerator = jwtTokenGenerator;
        }

        public async Task<Usuario> RegistrarAsync(string nome, string email, string senha, string role)
        {
            // Verificar se o usuário já existe
            var usuarioExistente = await _usuarioRepository.GetUserByEmailAsync(email);
            if (usuarioExistente != null)
            {
                throw new InvalidOperationException("Usuário com este email já existe");
            }

            // Criar hash da senha
            var senhaHash = BCrypt.Net.BCrypt.HashPassword(senha);

            // Criar novo usuário
            var novoUsuario = new Usuario
            {
                Nome = nome,
                Email = email,
                SenhaHash = senhaHash,
                Role = role
            };

            // Salvar no banco
            return await _usuarioRepository.AddUserAsync(novoUsuario);
        }

        public async Task<string> LoginAsync(string email, string senha)
        {
            // Buscar usuário por email
            var usuario = await _usuarioRepository.GetUserByEmailAsync(email);
            if (usuario == null)
            {
                Console.WriteLine($"DEBUG: Usuário não encontrado para email: {email}");
                throw new UnauthorizedAccessException("Email ou senha inválidos");
            }

            Console.WriteLine($"DEBUG: Usuário encontrado - ID: {usuario.Id}, Email: {usuario.Email}");
            Console.WriteLine($"DEBUG: Senha fornecida: {senha}");
            Console.WriteLine($"DEBUG: Hash armazenado: {usuario.SenhaHash}");

            // Verificar senha
            var senhaValida = BCrypt.Net.BCrypt.Verify(senha, usuario.SenhaHash);
            Console.WriteLine($"DEBUG: Resultado da verificação de senha: {senhaValida}");
            
            if (!senhaValida)
            {
                Console.WriteLine("DEBUG: Senha inválida - falha na verificação BCrypt");
                throw new UnauthorizedAccessException("Email ou senha inválidos");
            }

            Console.WriteLine("DEBUG: Login bem-sucedido, gerando token JWT");
            // Gerar token JWT
            return _jwtTokenGenerator.GenerateToken(usuario.Id, usuario.Email, usuario.Role);
        }
    }
}