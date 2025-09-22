using Microsoft.EntityFrameworkCore;
using NoraCOND.Application.Lancamentos.Interfaces;
using NoraCOND.Domain.Entities;
using NoraCOND.Infrastructure.Data;

namespace NoraCOND.Infrastructure.Repositories
{
    public class LancamentoFinanceiroRepository : ILancamentoFinanceiroRepository
    {
        private readonly AppDbContext _context;

        public LancamentoFinanceiroRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<LancamentoFinanceiro?> GetByIdAsync(Guid id)
        {
            return await _context.LancamentosFinanceiros
                .Include(l => l.Processo)
                .FirstOrDefaultAsync(l => l.Id == id);
        }

        public async Task<IEnumerable<LancamentoFinanceiro>> GetAllAsync()
        {
            return await _context.LancamentosFinanceiros
                .Include(l => l.Processo)
                .OrderByDescending(l => l.DataVencimento)
                .ToListAsync();
        }

        public async Task<IEnumerable<LancamentoFinanceiro>> GetByProcessoIdAsync(Guid processoId)
        {
            return await _context.LancamentosFinanceiros
                .Include(l => l.Processo)
                .Where(l => l.ProcessoId == processoId)
                .OrderByDescending(l => l.DataVencimento)
                .ToListAsync();
        }

        public async Task<LancamentoFinanceiro> CreateAsync(LancamentoFinanceiro lancamento)
        {
            _context.LancamentosFinanceiros.Add(lancamento);
            await _context.SaveChangesAsync();
            
            // Recarregar com dados do processo
            return await GetByIdAsync(lancamento.Id) ?? lancamento;
        }

        public async Task<LancamentoFinanceiro> UpdateAsync(LancamentoFinanceiro lancamento)
        {
            _context.LancamentosFinanceiros.Update(lancamento);
            await _context.SaveChangesAsync();
            
            // Recarregar com dados do processo
            return await GetByIdAsync(lancamento.Id) ?? lancamento;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var lancamento = await _context.LancamentosFinanceiros.FindAsync(id);
            if (lancamento == null)
                return false;

            _context.LancamentosFinanceiros.Remove(lancamento);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(Guid id)
        {
            return await _context.LancamentosFinanceiros.AnyAsync(l => l.Id == id);
        }
    }
}