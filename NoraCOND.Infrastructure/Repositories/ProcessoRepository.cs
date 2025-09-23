using Microsoft.EntityFrameworkCore;
using NoraCOND.Application.Interfaces;
using NoraCOND.Domain.Entities;
using NoraCOND.Infrastructure.Data;

namespace NoraCOND.Infrastructure.Repositories
{
    public class ProcessoRepository : IProcessoRepository
    {
        private readonly AppDbContext _context;

        public ProcessoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Processo> CriarAsync(Processo processo)
        {
            _context.Processos.Add(processo);
            await _context.SaveChangesAsync();
            return processo;
        }

        public async Task<Processo?> ObterPorIdAsync(Guid id)
        {
            return await _context.Processos
                .Include(p => p.Cliente)
                .Include(p => p.UsuarioResponsavel)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<IEnumerable<Processo>> ObterTodosAsync()
        {
            return await _context.Processos
                .Include(p => p.Cliente)
                .Include(p => p.UsuarioResponsavel)
                .OrderByDescending(p => p.DataCriacao)
                .ToListAsync();
        }

        public async Task<IEnumerable<Processo>> ObterPorClienteIdAsync(Guid clienteId)
        {
            return await _context.Processos
                .Include(p => p.Cliente)
                .Include(p => p.UsuarioResponsavel)
                .Where(p => p.ClienteId == clienteId)
                .OrderByDescending(p => p.DataCriacao)
                .ToListAsync();
        }

        public async Task<IEnumerable<Processo>> ObterPorUsuarioResponsavelIdAsync(Guid usuarioId)
        {
            return await _context.Processos
                .Include(p => p.Cliente)
                .Include(p => p.UsuarioResponsavel)
                .Where(p => p.UsuarioResponsavelId == usuarioId)
                .OrderByDescending(p => p.DataCriacao)
                .ToListAsync();
        }

        public async Task<Processo> AtualizarAsync(Processo processo)
        {
            processo.DataAtualizacao = DateTime.UtcNow;
            _context.Processos.Update(processo);
            await _context.SaveChangesAsync();
            return processo;
        }

        public async Task<bool> ExcluirAsync(Guid id)
        {
            var processo = await _context.Processos.FindAsync(id);
            if (processo == null)
                return false;

            _context.Processos.Remove(processo);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExisteAsync(Guid id)
        {
            return await _context.Processos.AnyAsync(p => p.Id == id);
        }

        public async Task<bool> ClienteExisteAsync(Guid clienteId)
        {
            return await _context.Clientes.AnyAsync(c => c.Id == clienteId);
        }

        public async Task<bool> UsuarioExisteAsync(Guid usuarioId)
        {
            return await _context.Usuarios.AnyAsync(u => u.Id == usuarioId);
        }

        public async Task<bool> NumeroProcessoExisteAsync(string numeroProcesso, Guid? processoIdExcluir = null)
        {
            var query = _context.Processos.Where(p => p.NumeroProcesso == numeroProcesso);
            
            if (processoIdExcluir.HasValue)
            {
                query = query.Where(p => p.Id != processoIdExcluir.Value);
            }

            return await query.AnyAsync();
        }
    }
}