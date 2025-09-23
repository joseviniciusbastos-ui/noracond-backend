using Microsoft.EntityFrameworkCore;
using NoraCOND.Application.Interfaces;
using NoraCOND.Domain.Entities;
using NoraCOND.Infrastructure.Data;

namespace NoraCOND.Infrastructure.Repositories
{
    public class DocumentoRepository : IDocumentoRepository
    {
        private readonly AppDbContext _context;

        public DocumentoRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Documento> CriarAsync(Documento documento)
        {
            _context.Documentos.Add(documento);
            await _context.SaveChangesAsync();
            return documento;
        }

        public async Task<Documento?> ObterPorIdAsync(Guid id)
        {
            return await _context.Documentos
                .Include(d => d.Processo)
                .FirstOrDefaultAsync(d => d.Id == id);
        }

        public async Task<IEnumerable<Documento>> ObterPorProcessoIdAsync(Guid processoId)
        {
            return await _context.Documentos
                .Where(d => d.ProcessoId == processoId)
                .OrderByDescending(d => d.DataUpload)
                .ToListAsync();
        }

        public async Task<bool> ExcluirAsync(Guid id)
        {
            var documento = await _context.Documentos.FindAsync(id);
            if (documento == null)
                return false;

            _context.Documentos.Remove(documento);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExisteAsync(Guid id)
        {
            return await _context.Documentos.AnyAsync(d => d.Id == id);
        }
    }
}