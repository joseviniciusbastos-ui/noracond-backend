using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NoraCOND.Application.Authentication;
using NoraCOND.Application.Clientes.Interfaces;
using NoraCOND.Application.Clientes.Services;
using NoraCOND.Application.Common.Interfaces;
using NoraCOND.Application.Processos.Interfaces;
using NoraCOND.Application.Processos.Services;
using NoraCOND.Application.Lancamentos.Interfaces;
using NoraCOND.Application.Lancamentos.Services;
using NoraCOND.Application.Documentos.Interfaces;
using NoraCOND.Application.Documentos.Services;
using NoraCOND.Application.Usuarios.Interfaces;
using NoraCOND.Application.Chat.Interfaces;
using NoraCOND.Application.Chat.Services;
using NoraCOND.Application.Dashboard.Interfaces;
using NoraCOND.Application.Dashboard.Services;
using NoraCOND.Infrastructure.Authentication;
using NoraCOND.Infrastructure.Data;
using NoraCOND.Infrastructure.Repositories;
using System.Text;
using DotNetEnv;

// Carregar variáveis de ambiente do arquivo .env
Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Limpa provedores de configuração padrão
builder.Configuration.Sources.Clear();

// Adiciona as configurações na ordem correta de prioridade
builder.Configuration
    .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
    .AddJsonFile($"appsettings.{builder.Environment.EnvironmentName}.json", optional: true, reloadOnChange: true)
    .AddEnvironmentVariables();

// Adicionar serviços ao contêiner.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Entity Framework Configuration
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Configuration
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["Secret"] ?? throw new InvalidOperationException("JWT Secret não configurado");
var key = Encoding.ASCII.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Dependency Injection
builder.Services.AddScoped<IUsuarioRepository, UsuarioRepository>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Cliente Services
builder.Services.AddScoped<IClienteRepository, ClienteRepository>();
builder.Services.AddScoped<IClienteService, ClienteService>();

// Processo Services
builder.Services.AddScoped<IProcessoRepository, ProcessoRepository>();
builder.Services.AddScoped<IProcessoService, ProcessoService>();

// Lançamento Services
builder.Services.AddScoped<ILancamentoFinanceiroRepository, LancamentoFinanceiroRepository>();
builder.Services.AddScoped<ILancamentoFinanceiroService, LancamentoFinanceiroService>();

// Documento Services
builder.Services.AddScoped<IDocumentoRepository, DocumentoRepository>();
builder.Services.AddScoped<IDocumentoService, DocumentoService>();

// Chat Services
builder.Services.AddScoped<IChatRepository, ChatRepository>();
builder.Services.AddScoped<IChatService, ChatService>();

// Dashboard Services
builder.Services.AddScoped<IDashboardService, DashboardService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Aplica as migrações do Entity Framework automaticamente ao iniciar
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<NoraCOND.Infrastructure.Data.AppDbContext>();
    dbContext.Database.Migrate();
}

app.Run();
