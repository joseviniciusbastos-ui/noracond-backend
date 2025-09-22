# NoraCOND - Guia de Deployment e Infraestrutura

## 📋 Pré-requisitos

### Ambiente de Desenvolvimento
- Docker Desktop 4.0+
- Docker Compose 2.0+
- .NET 9.0 SDK
- Node.js 20+
- PostgreSQL 16+ (opcional, pode usar Docker)

### Ambiente de Produção
- Servidor Linux (Ubuntu 22.04 LTS recomendado)
- Docker Engine 24.0+
- Docker Compose 2.0+
- Certificado SSL válido
- Domínio configurado

## 🔧 Configuração Inicial

### 1. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp NoraCOND.API/.env.example NoraCOND.API/.env

# Editar com valores reais
nano NoraCOND.API/.env
```

**Variáveis obrigatórias para produção:**
```env
# Banco de Dados
DB_HOST=postgres
DB_PORT=5432
DB_NAME=noracond_prod
DB_USERNAME=noracond_user
DB_PASSWORD=sua_senha_super_segura

# JWT (CRÍTICO: Gerar chave segura)
JWT_SECRET=sua-chave-jwt-super-segura-com-pelo-menos-64-caracteres-para-producao
JWT_ISSUER=NoraCOND.API
JWT_AUDIENCE=NoraCOND.Client
JWT_EXPIRATION_MINUTES=60

# Armazenamento
FILE_UPLOAD_PATH=/app/uploads

# Ambiente
ASPNETCORE_ENVIRONMENT=Production
```

### 2. Configurar SSL/TLS (Produção)

```bash
# Criar diretório para certificados
mkdir -p ./ssl

# Copiar certificados SSL
cp seu_certificado.crt ./ssl/
cp sua_chave_privada.key ./ssl/
```

## 🚀 Deployment

### Desenvolvimento Local

```bash
# Subir apenas banco e serviços auxiliares
docker-compose -f docker-compose.dev.yml up -d

# Executar API localmente
cd NoraCOND.API
dotnet run

# Executar Frontend localmente
cd noracond-frontend
npm run dev
```

### Staging/Homologação

```bash
# Build e deploy completo
docker-compose up -d --build

# Verificar logs
docker-compose logs -f

# Executar migrations
docker-compose exec api dotnet ef database update
```

### Produção

```bash
# 1. Fazer backup do banco (se existir)
docker-compose exec postgres pg_dump -U postgres noracond_db > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Deploy com build
docker-compose -f docker-compose.yml up -d --build

# 3. Executar migrations
docker-compose exec api dotnet ef database update

# 4. Verificar saúde dos serviços
docker-compose ps
curl -f http://localhost/health
curl -f http://localhost:5000/health
```

## 🔍 Monitoramento e Logs

### Verificar Status dos Serviços
```bash
# Status geral
docker-compose ps

# Logs em tempo real
docker-compose logs -f

# Logs específicos
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Health Checks
```bash
# Frontend
curl -f http://localhost/health

# Backend API
curl -f http://localhost:5000/health

# Banco de dados
docker-compose exec postgres pg_isready -U postgres
```

## 🛡️ Segurança

### Checklist de Segurança
- [ ] Variáveis sensíveis em `.env` (nunca no código)
- [ ] JWT Secret com pelo menos 64 caracteres
- [ ] Certificado SSL válido em produção
- [ ] Firewall configurado (portas 80, 443, 22 apenas)
- [ ] Usuários não-root nos containers
- [ ] Backup automático do banco de dados
- [ ] Logs de auditoria habilitados

### Configuração de Firewall (Ubuntu)
```bash
# Habilitar UFW
sudo ufw enable

# Permitir SSH
sudo ufw allow 22

# Permitir HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Verificar status
sudo ufw status
```

## 📊 Backup e Recuperação

### Backup Automático
```bash
# Criar script de backup
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup do banco
docker-compose exec -T postgres pg_dump -U postgres noracond_db > $BACKUP_DIR/db_backup_$DATE.sql

# Backup dos uploads
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz ./uploads_data

# Manter apenas últimos 7 dias
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# Adicionar ao crontab (backup diário às 2h)
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

### Restauração
```bash
# Restaurar banco de dados
docker-compose exec -T postgres psql -U postgres -d noracond_db < backup_file.sql

# Restaurar uploads
tar -xzf uploads_backup.tar.gz
```

## 🔄 Atualizações

### Processo de Atualização
```bash
# 1. Backup completo
./backup.sh

# 2. Parar serviços
docker-compose down

# 3. Atualizar código
git pull origin main

# 4. Rebuild e deploy
docker-compose up -d --build

# 5. Executar migrations
docker-compose exec api dotnet ef database update

# 6. Verificar funcionamento
curl -f http://localhost/health
```

## 🌐 Configuração de Domínio

### Nginx Reverse Proxy (Opcional)
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## 🚨 Troubleshooting

### Problemas Comuns

**Container não inicia:**
```bash
# Verificar logs
docker-compose logs container_name

# Verificar recursos
docker system df
docker system prune
```

**Erro de conexão com banco:**
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Testar conexão
docker-compose exec postgres psql -U postgres -d noracond_db -c "SELECT 1;"
```

**Erro de permissão de arquivos:**
```bash
# Verificar permissões do volume
docker-compose exec api ls -la /app/uploads

# Corrigir permissões se necessário
sudo chown -R 1001:1001 ./uploads_data
```

## 📞 Suporte

Para suporte técnico:
- Verificar logs: `docker-compose logs -f`
- Documentação da API: `http://localhost:5000/swagger`
- Issues no repositório: [GitHub Issues]

---

**⚠️ IMPORTANTE:** Sempre teste em ambiente de staging antes de fazer deploy em produção!