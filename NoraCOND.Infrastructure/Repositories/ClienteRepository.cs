using Microsoft.EntityFrameworkCore;
using NoraCOND.Application.Interfaces;
using NoraCOND.Domain.Entities;
using NoraCOND.Infrastructure.Data;

namespace NoraCOND.Infrastructure.Repositories
{
    public class ClienteRepository : IClienteRepository
    {
        private readonly AppDbContext _context;

        public ClienteRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Cliente?> GetByIdAsync(Guid id)
        {
            return await _context.Clientes
                .Include(c => c.UsuarioDeCriacao)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<IEnumerable<Cliente>> GetAllAsync()
        {
            return await _context.Clientes
                .Include(c => c.UsuarioDeCriacao)
                .OrderBy(c => c.NomeCompleto)
                .ToListAsync();
        }

        public async Task<Cliente> AddAsync(Cliente cliente)
        {
            _context.Clientes.Add(cliente);
            await _context.SaveChangesAsync();
            return cliente;
        }

        public async Task<Cliente> UpdateAsync(Cliente cliente)
        {
            _context.Entry(cliente).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return cliente;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var cliente = await _context.Clientes.FindAsync(id);
            if (cliente == null)
                return false;

            _context.Clientes.Remove(cliente);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.Clientes.AnyAsync(c => c.Id == id);
        }

        public async Task<Cliente?> GetByCpfCnpjAsync(string cpfCnpj)
        {
            return await _context.Clientes
                .Include(c => c.UsuarioDeCriacao)
                .FirstOrDefaultAsync(c => c.CpfCnpj == cpfCnpj);
        }

        public async Task<Cliente?> GetByEmailAsync(string email)
        {
            return await _context.Clientes
                .Include(c => c.UsuarioDeCriacao)
                .FirstOrDefaultAsync(c => c.Email == email);
        }
    }
}