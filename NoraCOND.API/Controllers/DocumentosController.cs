using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NoraCOND.Application.Interfaces;

namespace NoraCOND.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DocumentosController : ControllerBase
    {
        private readonly IDocumentoService _documentoService;

        public DocumentosController(IDocumentoService documentoService)
        {
            _documentoService = documentoService;
        }

        /// <summary>
        /// Upload de documento para um processo específico
        /// </summary>
        /// <param name="processoId">ID do processo</param>
        /// <param name="arquivo">Arquivo a ser enviado</param>
        /// <returns>Metadados do documento criado</returns>
        [HttpPost("processos/{processoId:guid}/documentos")]
        public async Task<IActionResult> UploadDocumento(Guid processoId, IFormFile arquivo)
        {
            try
            {
                var resultado = await _documentoService.UploadDocumentoAsync(processoId, arquivo);
                return Ok(resultado);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        /// <summary>
        /// Lista todos os documentos de um processo
        /// </summary>
        /// <param name="processoId">ID do processo</param>
        /// <returns>Lista de metadados dos documentos</returns>
        [HttpGet("processos/{processoId:guid}/documentos")]
        public async Task<IActionResult> ListarDocumentosPorProcesso(Guid processoId)
        {
            try
            {
                var documentos = await _documentoService.ObterDocumentosPorProcessoAsync(processoId);
                return Ok(documentos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        /// <summary>
        /// Download de um documento específico
        /// </summary>
        /// <param name="id">ID do documento</param>
        /// <returns>Arquivo para download</returns>
        [HttpGet("{id:guid}/download")]
        public async Task<IActionResult> DownloadDocumento(Guid id)
        {
            try
            {
                var (stream, contentType, nomeOriginal) = await _documentoService.GetDocumentoStreamAsync(id);
                return File(stream, contentType, nomeOriginal);
            }
            catch (FileNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }

        /// <summary>
        /// Exclusão de um documento
        /// </summary>
        /// <param name="id">ID do documento</param>
        /// <returns>Resultado da operação</returns>
        [HttpDelete("{id:guid}")]
        public async Task<IActionResult> ExcluirDocumento(Guid id)
        {
            try
            {
                var sucesso = await _documentoService.DeleteDocumentoAsync(id);
                if (!sucesso)
                {
                    return NotFound(new { message = "Documento não encontrado" });
                }

                return Ok(new { message = "Documento excluído com sucesso" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro interno do servidor", details = ex.Message });
            }
        }
    }
}