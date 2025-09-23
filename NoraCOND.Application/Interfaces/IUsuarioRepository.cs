using System;
using System.Threading.Tasks;
using NoraCOND.Domain.Entities;

namespace NoraCOND.Application.Interfaces
{
    public interface IUsuarioRepository
    {
        Task<Usuario?> GetUserByEmailAsync(string email);
        Task<Usuario> AddUserAsync(Usuario usuario);
        Task<Usuario?> GetUserByIdAsync(Guid id);
    }
}
