using Microsoft.EntityFrameworkCore;
using NoraCOND.Infrastructure.Data;
using NoraCOND.Domain.Entities;
using BCrypt.Net;

// Configurar connection string
var connectionString = "Host=localhost;Port=5432;Database=noracond_dev;Username=postgres;Password=postgres";

// Configurar DbContext
var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
optionsBuilder.UseNpgsql(connectionString);

using var context = new AppDbContext(optionsBuilder.Options);

try
{
    Console.WriteLine("🔍 Procurando usuário admin existente...");
    
    // Buscar e deletar usuário admin existente
    var adminExistente = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == "admin@noracond.com");

    if (adminExistente != null)
    {
        Console.WriteLine($"❌ Deletando usuário admin existente (ID: {adminExistente.Id})");
        context.Usuarios.Remove(adminExistente);
        await context.SaveChangesAsync();
        Console.WriteLine("✅ Usuário admin deletado com sucesso!");
    }
    else
    {
        Console.WriteLine("ℹ️ Nenhum usuário admin encontrado para deletar.");
    }

    Console.WriteLine("\n🔐 Criando novo usuário admin...");
    
    // Criar hash da senha usando BCrypt.Net-Next
    string senha = "admin123";
    string senhaHash = BCrypt.Net.BCrypt.HashPassword(senha, 11);
    
    Console.WriteLine($"🔑 Senha: {senha}");
    Console.WriteLine($"🔒 Hash gerado: {senhaHash}");
    
    // Testar o hash imediatamente
    bool testeHash = BCrypt.Net.BCrypt.Verify(senha, senhaHash);
    Console.WriteLine($"✅ Teste do hash: {testeHash}");
    
    if (!testeHash)
    {
        Console.WriteLine("❌ ERRO: Hash não passou no teste de verificação!");
        return;
    }

    // Criar novo usuário admin
    var novoAdmin = new Usuario
    {
        Id = Guid.NewGuid(),
        Nome = "Administrador",
        Email = "admin@noracond.com",
        SenhaHash = senhaHash,
        Role = "Admin",
        DataCriacao = DateTime.UtcNow
    };

    // Adicionar ao banco
    context.Usuarios.Add(novoAdmin);
    await context.SaveChangesAsync();

    Console.WriteLine("\n✅ Novo usuário admin criado com sucesso!");
    Console.WriteLine($"📧 Email: {novoAdmin.Email}");
    Console.WriteLine($"🔑 Senha: {senha}");
    Console.WriteLine($"🆔 ID: {novoAdmin.Id}");
    Console.WriteLine($"👤 Role: {novoAdmin.Role}");
    
    // Verificar se foi salvo corretamente
    var verificacao = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == "admin@noracond.com");
    if (verificacao != null)
    {
        Console.WriteLine("\n🔍 Verificação no banco:");
        Console.WriteLine($"Hash salvo: {verificacao.SenhaHash}");
        bool verificacaoFinal = BCrypt.Net.BCrypt.Verify(senha, verificacao.SenhaHash);
        Console.WriteLine($"Verificação final: {verificacaoFinal}");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Erro: {ex.Message}");
    Console.WriteLine($"Stack trace: {ex.StackTrace}");
}