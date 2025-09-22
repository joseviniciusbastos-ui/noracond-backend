using System.Threading.Tasks;
using NoraCOND.Domain.Entities;

namespace NoraCOND.Application.Authentication
{
    public interface IAuthService
    {
        Task<Usuario> RegistrarAsync(string nome, string email, string senha, string role);
        Task<string> LoginAsync(string email, string senha);
    }
}