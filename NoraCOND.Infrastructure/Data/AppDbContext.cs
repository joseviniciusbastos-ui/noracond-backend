using Microsoft.EntityFrameworkCore;
using NoraCOND.Domain.Entities;

namespace NoraCOND.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Usuario> Usuarios { get; set; }
        public DbSet<Cliente> Clientes { get; set; }
        public DbSet<Processo> Processos { get; set; }
        public DbSet<LancamentoFinanceiro> LancamentosFinanceiros { get; set; }
        public DbSet<Documento> Documentos { get; set; }
        public DbSet<Mensagem> Mensagens { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configuração da entidade Usuario
            modelBuilder.Entity<Usuario>(entity =>
            {
                entity.HasKey(u => u.Id);
                
                entity.Property(u => u.Nome)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(u => u.Email)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.HasIndex(u => u.Email)
                    .IsUnique();

                entity.Property(u => u.SenhaHash)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(u => u.Role)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(u => u.DataCriacao)
                    .IsRequired();
            });

            // Configuração da entidade Cliente
            modelBuilder.Entity<Cliente>(entity =>
            {
                entity.HasKey(c => c.Id);

                entity.Property(c => c.NomeCompleto)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(c => c.CpfCnpj)
                    .IsRequired()
                    .HasMaxLength(18);

                entity.HasIndex(c => c.CpfCnpj)
                    .IsUnique();

                entity.Property(c => c.Telefone)
                    .IsRequired()
                    .HasMaxLength(20);

                entity.Property(c => c.Email)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.HasIndex(c => c.Email)
                    .IsUnique();

                entity.Property(c => c.Endereco)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(c => c.DataCriacao)
                    .IsRequired();

                entity.Property(c => c.UsuarioDeCriacaoId)
                    .IsRequired();

                // Relacionamento com Usuario
                entity.HasOne(c => c.UsuarioDeCriacao)
                    .WithMany()
                    .HasForeignKey(c => c.UsuarioDeCriacaoId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configuração da entidade Processo
            modelBuilder.Entity<Processo>(entity =>
            {
                entity.HasKey(p => p.Id);

                entity.Property(p => p.NumeroProcesso)
                    .IsRequired()
                    .HasMaxLength(25);

                entity.HasIndex(p => p.NumeroProcesso)
                    .IsUnique();

                entity.Property(p => p.Titulo)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(p => p.Descricao)
                    .HasMaxLength(1000);

                entity.Property(p => p.Status)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(p => p.DataAbertura)
                    .IsRequired();

                entity.Property(p => p.DataCriacao)
                    .IsRequired();

                entity.Property(p => p.DataAtualizacao)
                    .IsRequired();

                // Relacionamento com Cliente
                entity.HasOne(p => p.Cliente)
                    .WithMany(c => c.Processos)
                    .HasForeignKey(p => p.ClienteId)
                    .OnDelete(DeleteBehavior.Restrict);

                // Relacionamento com Usuario Responsável
                entity.HasOne(p => p.UsuarioResponsavel)
                    .WithMany()
                    .HasForeignKey(p => p.UsuarioResponsavelId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configuração da entidade LancamentoFinanceiro
            modelBuilder.Entity<LancamentoFinanceiro>(entity =>
            {
                entity.HasKey(l => l.Id);

                entity.Property(l => l.Descricao)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(l => l.Valor)
                    .IsRequired()
                    .HasColumnType("decimal(18,2)");

                entity.Property(l => l.Tipo)
                    .IsRequired()
                    .HasConversion<string>();

                entity.Property(l => l.DataVencimento)
                    .IsRequired();

                entity.Property(l => l.Pago)
                    .IsRequired();

                // Relacionamento com Processo
                entity.HasOne(l => l.Processo)
                    .WithMany(p => p.LancamentosFinanceiros)
                    .HasForeignKey(l => l.ProcessoId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configuração da entidade Documento
            modelBuilder.Entity<Documento>(entity =>
            {
                entity.HasKey(d => d.Id);

                entity.Property(d => d.NomeOriginal)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(d => d.NomeUnico)
                    .IsRequired()
                    .HasMaxLength(255);

                entity.Property(d => d.CaminhoArquivo)
                    .IsRequired()
                    .HasMaxLength(500);

                entity.Property(d => d.TipoConteudo)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(d => d.TamanhoBytes)
                    .IsRequired();

                entity.Property(d => d.DataUpload)
                    .IsRequired();

                // Relacionamento com Processo
                entity.HasOne(d => d.Processo)
                    .WithMany(p => p.Documentos)
                    .HasForeignKey(d => d.ProcessoId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configuração da entidade Mensagem
            modelBuilder.Entity<Mensagem>(entity =>
            {
                entity.HasKey(m => m.Id);

                entity.Property(m => m.Conteudo)
                    .IsRequired()
                    .HasMaxLength(1000);

                entity.Property(m => m.DataEnvio)
                    .IsRequired();

                entity.Property(m => m.Lida)
                    .IsRequired();

                // Relacionamento com Remetente
                entity.HasOne(m => m.Remetente)
                    .WithMany(u => u.MensagensEnviadas)
                    .HasForeignKey(m => m.RemetenteId)
                    .OnDelete(DeleteBehavior.Restrict); // Evita deleção em cascata

                // Relacionamento com Destinatário
                entity.HasOne(m => m.Destinatario)
                    .WithMany(u => u.MensagensRecebidas)
                    .HasForeignKey(m => m.DestinatarioId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}