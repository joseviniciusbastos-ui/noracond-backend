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
    // Verificar se o usuário admin já existe
    var adminExistente = await context.Usuarios.FirstOrDefaultAsync(u => u.Email == "admin@noracond.com");

    if (adminExistente != null)
    {
        Console.WriteLine("Usuário admin já existe no banco de dados.");
        Console.WriteLine($"ID: {adminExistente.Id}");
        Console.WriteLine($"Nome: {adminExistente.Nome}");
        Console.WriteLine($"Email: {adminExistente.Email}");
        Console.WriteLine($"Role: {adminExistente.Role}");
        return;
    }

    // Criar usuário admin
    var senhaHash = BCrypt.Net.BCrypt.HashPassword("admin123");

    var adminUser = new Usuario
    {
        Id = Guid.NewGuid(),
        Nome = "Administrador",
        Email = "admin@noracond.com",
        SenhaHash = senhaHash,
        Role = "Admin",
        DataCriacao = DateTime.UtcNow
    };

    // Adicionar ao banco
    context.Usuarios.Add(adminUser);
    await context.SaveChangesAsync();

    Console.WriteLine("✅ Usuário admin criado com sucesso!");
    Console.WriteLine($"📧 Email: admin@noracond.com");
    Console.WriteLine($"🔑 Senha: admin123");
    Console.WriteLine($"🆔 ID: {adminUser.Id}");
    Console.WriteLine($"👤 Role: {adminUser.Role}");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Erro ao criar usuário: {ex.Message}");
    Console.WriteLine($"Detalhes: {ex.InnerException?.Message}");
}