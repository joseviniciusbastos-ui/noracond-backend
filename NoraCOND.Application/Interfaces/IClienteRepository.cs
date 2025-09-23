using NoraCOND.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace NoraCOND.Application.Interfaces
{
    public interface IClienteRepository
    {
        Task<Cliente?> GetByIdAsync(Guid id);
        Task<IEnumerable<Cliente>> GetAllAsync();
        Task<Cliente> AddAsync(Cliente cliente);
        Task<Cliente> UpdateAsync(Cliente cliente);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> ExistsAsync(Guid id);
        Task<Cliente?> GetByCpfCnpjAsync(string cpfCnpj);
        Task<Cliente?> GetByEmailAsync(string email);
    }
}
