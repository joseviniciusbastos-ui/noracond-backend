using Microsoft.AspNetCore.Http;
using NoraCOND.Application.Documentos.DTOs;

namespace NoraCOND.Application.Interfaces
{
    public interface IDocumentoService
    {
        Task<DocumentoResponse> UploadDocumentoAsync(Guid processoId, IFormFile arquivo);
        Task<IEnumerable<DocumentoResponse>> ObterDocumentosPorProcessoAsync(Guid processoId);
        Task<(Stream stream, string contentType, string nomeOriginal)> GetDocumentoStreamAsync(Guid documentoId);
        Task<bool> DeleteDocumentoAsync(Guid documentoId);
    }
}