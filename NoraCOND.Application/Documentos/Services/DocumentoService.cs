using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using NoraCOND.Application.Documentos.DTOs;
using NoraCOND.Application.Documentos.Interfaces;
using NoraCOND.Application.Processos.Interfaces;
using NoraCOND.Domain.Entities;

namespace NoraCOND.Application.Documentos.Services
{
    public class DocumentoService : IDocumentoService
    {
        private readonly IDocumentoRepository _documentoRepository;
        private readonly IProcessoRepository _processoRepository;
        private readonly IConfiguration _configuration;
        private readonly string _uploadPath;

        public DocumentoService(
            IDocumentoRepository documentoRepository,
            IProcessoRepository processoRepository,
            IConfiguration configuration)
        {
            _documentoRepository = documentoRepository;
            _processoRepository = processoRepository;
            _configuration = configuration;
            _uploadPath = _configuration["FileStorageSettings:UploadPath"] ?? "C:/NoraCOND_Uploads";
            
            // Garantir que o diretório existe
            if (!Directory.Exists(_uploadPath))
            {
                Directory.CreateDirectory(_uploadPath);
            }
        }

        public async Task<DocumentoResponse> UploadDocumentoAsync(Guid processoId, IFormFile arquivo)
        {
            // Validar se o processo existe
            var processoExiste = await _processoRepository.ExisteAsync(processoId);
            if (!processoExiste)
            {
                throw new ArgumentException("Processo não encontrado.");
            }

            // Validar arquivo
            if (arquivo == null || arquivo.Length == 0)
            {
                throw new ArgumentException("Arquivo não fornecido ou vazio.");
            }

            // Gerar nome único para o arquivo
            var nomeUnico = $"{Guid.NewGuid()}{Path.GetExtension(arquivo.FileName)}";
            var caminhoCompleto = Path.Combine(_uploadPath, nomeUnico);

            try
            {
                // Salvar arquivo no disco
                using (var stream = new FileStream(caminhoCompleto, FileMode.Create))
                {
                    await arquivo.CopyToAsync(stream);
                }

                // Criar entidade Documento
                var documento = new Documento
                {
                    Id = Guid.NewGuid(),
                    NomeOriginal = arquivo.FileName,
                    NomeUnico = nomeUnico,
                    CaminhoArquivo = caminhoCompleto,
                    TipoConteudo = arquivo.ContentType,
                    TamanhoBytes = arquivo.Length,
                    DataUpload = DateTime.UtcNow,
                    ProcessoId = processoId
                };

                // Salvar no banco de dados
                var documentoSalvo = await _documentoRepository.CriarAsync(documento);

                return new DocumentoResponse
                {
                    Id = documentoSalvo.Id,
                    NomeOriginal = documentoSalvo.NomeOriginal,
                    TipoConteudo = documentoSalvo.TipoConteudo,
                    TamanhoBytes = documentoSalvo.TamanhoBytes,
                    DataUpload = documentoSalvo.DataUpload,
                    ProcessoId = documentoSalvo.ProcessoId
                };
            }
            catch (Exception)
            {
                // Se houve erro, tentar remover o arquivo do disco
                if (File.Exists(caminhoCompleto))
                {
                    File.Delete(caminhoCompleto);
                }
                throw;
            }
        }

        public async Task<IEnumerable<DocumentoResponse>> ObterDocumentosPorProcessoAsync(Guid processoId)
        {
            var documentos = await _documentoRepository.ObterPorProcessoIdAsync(processoId);
            
            return documentos.Select(d => new DocumentoResponse
            {
                Id = d.Id,
                NomeOriginal = d.NomeOriginal,
                TipoConteudo = d.TipoConteudo,
                TamanhoBytes = d.TamanhoBytes,
                DataUpload = d.DataUpload,
                ProcessoId = d.ProcessoId
            });
        }

        public async Task<(Stream stream, string contentType, string nomeOriginal)> GetDocumentoStreamAsync(Guid documentoId)
        {
            var documento = await _documentoRepository.ObterPorIdAsync(documentoId);
            if (documento == null)
            {
                throw new FileNotFoundException("Documento não encontrado.");
            }

            if (!File.Exists(documento.CaminhoArquivo))
            {
                throw new FileNotFoundException("Arquivo físico não encontrado no servidor.");
            }

            var stream = new FileStream(documento.CaminhoArquivo, FileMode.Open, FileAccess.Read);
            return (stream, documento.TipoConteudo, documento.NomeOriginal);
        }

        public async Task<bool> DeleteDocumentoAsync(Guid documentoId)
        {
            var documento = await _documentoRepository.ObterPorIdAsync(documentoId);
            if (documento == null)
            {
                return false;
            }

            try
            {
                // Remover arquivo do disco
                if (File.Exists(documento.CaminhoArquivo))
                {
                    File.Delete(documento.CaminhoArquivo);
                }

                // Remover registro do banco
                return await _documentoRepository.ExcluirAsync(documentoId);
            }
            catch (Exception)
            {
                // Se houve erro ao deletar o arquivo, ainda assim tenta remover do banco
                return await _documentoRepository.ExcluirAsync(documentoId);
            }
        }
    }
}