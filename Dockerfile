# NoraCOND Backend Dockerfile
# Multi-stage build para otimização de tamanho e segurança

# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copiar arquivos de projeto e restaurar dependências
COPY ["NoraCOND.API/NoraCOND.API.csproj", "NoraCOND.API/"]
COPY ["NoraCOND.Application/NoraCOND.Application.csproj", "NoraCOND.Application/"]
COPY ["NoraCOND.Domain/NoraCOND.Domain.csproj", "NoraCOND.Domain/"]
COPY ["NoraCOND.Infrastructure/NoraCOND.Infrastructure.csproj", "NoraCOND.Infrastructure/"]

RUN dotnet restore "NoraCOND.API/NoraCOND.API.csproj"

# Copiar código fonte e compilar
COPY . .
WORKDIR "/src/NoraCOND.API"
RUN dotnet build "NoraCOND.API.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "NoraCOND.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Criar usuário não-root para segurança
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

# Copiar aplicação publicada
COPY --from=publish /app/publish .

# Configurar variáveis de ambiente
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Expor porta
EXPOSE 8080

# Comando de inicialização
ENTRYPOINT ["dotnet", "NoraCOND.API.dll"]