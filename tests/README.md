# 🧪 Suite de Testes - Fase II NoraCOND

## 📋 Visão Geral

Esta é a implementação completa da **Fase II - Testes e Qualidade (QA)** do projeto NoraCOND. A suite de testes foi desenvolvida para validar rigorosamente a funcionalidade, integração, performance e segurança da aplicação antes de prosseguir para as fases de otimização e produção.

## 🎯 Objetivos

- ✅ Validar comunicação e fluxo de dados entre Frontend (React) e Backend (.NET API)
- ✅ Simular cenários reais de uso através de testes End-to-End
- ✅ Avaliar performance e estabilidade sob demanda com testes de carga
- ✅ Garantir qualidade e confiabilidade do sistema

## 🏗️ Estrutura do Projeto

```
tests/
├── src/
│   ├── setup/
│   │   └── test-setup.ts          # Configurações globais e helpers
│   ├── integration/
│   │   ├── auth.test.ts           # Testes de autenticação
│   │   ├── dashboard.test.ts      # Testes do dashboard
│   │   ├── clientes.test.ts       # Testes CRUD de clientes
│   │   ├── processos.test.ts      # Testes CRUD de processos
│   │   └── financeiro.test.ts     # Testes do módulo financeiro
│   └── e2e/
│       ├── onboarding-flow.test.ts           # Fluxo completo de onboarding
│       ├── financial-management.test.ts      # Gestão financeira E2E
│       └── communication-collaboration.test.ts # Chat e colaboração
├── load-tests/
│   ├── stress-test.js             # Teste de carga principal (k6)
│   └── performance-test.js        # Teste de performance detalhado
├── scripts/
│   └── run-all-tests.ps1          # Script de execução completa
├── reports/                       # Relatórios gerados
├── package.json                   # Dependências e scripts
├── jest.config.js                 # Configuração do Jest
├── tsconfig.json                  # Configuração TypeScript
└── README.md                      # Esta documentação
```

## 🛠️ Tecnologias Utilizadas

- **Jest**: Framework de testes para JavaScript/TypeScript
- **Axios**: Cliente HTTP para testes de API
- **k6**: Ferramenta de teste de carga moderna
- **TypeScript**: Tipagem estática para maior confiabilidade
- **PowerShell**: Scripts de automação para Windows

## 🚀 Instalação e Configuração

### Pré-requisitos

- Node.js (v16 ou superior)
- .NET 6.0 ou superior
- k6 (para testes de carga)
- PowerShell 5.0+ (Windows)

### Instalação

1. **Instalar dependências:**
   ```bash
   cd tests
   npm install
   ```

2. **Instalar k6 (Windows):**
   ```powershell
   # Via Chocolatey
   choco install k6
   
   # Ou baixar de: https://k6.io/docs/getting-started/installation/
   ```

3. **Configurar variáveis de ambiente:**
   ```bash
   # Copiar arquivo de exemplo
   cp .env.example .env
   
   # Editar .env com suas configurações
   API_URL=http://localhost:5000/api
   FRONTEND_URL=http://localhost:3000
   TEST_EMAIL=teste@noracond.com
   TEST_PASSWORD=senha123
   ```

## 🧪 Tipos de Teste

### 1. 🔗 Testes de Integração

Validam a comunicação entre Frontend e Backend, testando todos os endpoints da API.

**Módulos cobertos:**
- **Autenticação**: Login, validação de token JWT
- **Dashboard**: Estatísticas e dados agregados
- **Clientes**: CRUD completo com validações
- **Processos**: CRUD com associação a clientes
- **Financeiro**: Lançamentos e funcionalidade "Marcar como Pago"

**Executar:**
```bash
npm run test:integration
```

### 2. 🎭 Testes End-to-End (E2E)

Simulam fluxos completos de usuário, validando a experiência de ponta a ponta.

**Cenários implementados:**

#### 🚀 Fluxo de Onboarding
- Login de usuário
- Navegação para Dashboard
- Criação de cliente
- Criação de processo associado
- Upload de documento
- Validação de persistência

#### 💰 Gestão Financeira
- Localização de processo
- Criação de receita (Honorários)
- Criação de despesa (Custas)
- Verificação de atualização do Dashboard
- Marcação como "Pago"
- Validação de relatórios

#### 💬 Comunicação e Colaboração
- Login de dois usuários
- Envio de mensagem sobre processo
- Recebimento e visualização
- Resposta à mensagem
- Validação do histórico

**Executar:**
```bash
npm run test:e2e
```

### 3. ⚡ Testes de Carga

Avaliam performance e estabilidade sob demanda usando k6.

**Configuração:**
- **Usuários Virtuais**: 50
- **Duração**: 10 minutos no pico
- **Cenários**: 
  - 100% fazem login
  - 80% acessam Dashboard
  - 50% listam clientes
  - 30% listam processos

**Métricas monitoradas:**
- Tempo de resposta (P95 < 500ms)
- Taxa de erro (< 1%)
- Throughput de requisições

**Executar:**
```bash
npm run test:load
```

## 📊 Scripts Disponíveis

```json
{
  "test:integration": "jest --testPathPattern=integration",
  "test:e2e": "jest --testPathPattern=e2e",
  "test:load": "k6 run load-tests/stress-test.js",
  "test:performance": "k6 run load-tests/performance-test.js",
  "test:coverage": "jest --coverage",
  "test:report": "jest --coverage --coverageReporters=html",
  "test:all": "npm run test:integration && npm run test:e2e && npm run test:load"
}
```

## 🖥️ Execução Completa

### Script Automatizado (Recomendado)

```powershell
# Executar todos os testes
.\scripts\run-all-tests.ps1

# Com opções específicas
.\scripts\run-all-tests.ps1 -Environment "staging" -GenerateReport

# Pular testes específicos
.\scripts\run-all-tests.ps1 -SkipLoad -SkipE2E
```

### Execução Manual

```bash
# 1. Testes de integração
npm run test:integration

# 2. Testes E2E
npm run test:e2e

# 3. Testes de carga
npm run test:load

# 4. Gerar relatórios
npm run test:coverage
```

## 📈 Critérios de Aceitação - Fase II

A Fase II será considerada **CONCLUÍDA** quando:

- ✅ **95% dos casos de teste** de Integração e E2E executados com sucesso
- ✅ **Nenhum bug crítico** ou de bloqueio identificado
- ✅ **Teste de carga** concluído com:
  - Taxa de erro < 1%
  - Tempos de resposta P95 < 500ms
- ✅ **Relatório completo** de bugs e resultados gerado

## 🐛 Tratamento de Erros

### Cenários de Erro Testados

1. **Dados inválidos**: Validação de campos obrigatórios
2. **Autenticação**: Tokens inválidos ou expirados
3. **Recursos inexistentes**: IDs não encontrados
4. **Concorrência**: Múltiplas operações simultâneas
5. **Conectividade**: Falhas de rede e timeouts

### Logs e Debugging

- Logs detalhados em `tests/reports/test-execution-*.log`
- Coverage reports em `tests/reports/coverage/`
- Screenshots de falhas (E2E) em `tests/reports/screenshots/`

## 🔧 Configuração Avançada

### Variáveis de Ambiente

```bash
# API Configuration
API_URL=http://localhost:5000/api
FRONTEND_URL=http://localhost:3000

# Test User Credentials
TEST_EMAIL=teste@noracond.com
TEST_PASSWORD=senha123

# Test Configuration
NODE_ENV=test
TEST_TIMEOUT=30000
JEST_TIMEOUT=60000

# Load Test Configuration
K6_VUS=50
K6_DURATION=10m
K6_THRESHOLD_DURATION=500
K6_THRESHOLD_ERROR_RATE=0.01
```

### Configuração do Jest

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## 📚 Exemplos de Uso

### Teste de Integração Simples

```typescript
describe('Clientes API', () => {
  it('deve criar um novo cliente', async () => {
    const clienteData = {
      nome: 'João Silva',
      email: 'joao@teste.com',
      telefone: '(11) 99999-9999'
    };

    const response = await apiClient.post('/clientes', clienteData);
    
    expect(response.status).toBe(201);
    expect(response.data.nome).toBe(clienteData.nome);
  });
});
```

### Teste E2E Completo

```typescript
describe('Fluxo de Onboarding', () => {
  it('deve completar onboarding com sucesso', async () => {
    // 1. Login
    const loginResponse = await apiClient.post('/auth/login', credentials);
    const token = loginResponse.data.token;
    
    // 2. Criar cliente
    const cliente = await apiClient.post('/clientes', clienteData);
    
    // 3. Criar processo
    const processo = await apiClient.post('/processos', {
      ...processoData,
      clienteId: cliente.data.id
    });
    
    // 4. Validar persistência
    expect(processo.data.clienteId).toBe(cliente.data.id);
  });
});
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Testes falhando por timeout**
   ```bash
   # Aumentar timeout no Jest
   jest --testTimeout=60000
   ```

2. **API não está rodando**
   ```bash
   # Verificar se a API está ativa
   curl http://localhost:5000/api/health
   ```

3. **k6 não encontrado**
   ```powershell
   # Instalar k6
   choco install k6
   ```

4. **Dependências desatualizadas**
   ```bash
   # Atualizar dependências
   npm update
   ```

### Logs de Debug

```bash
# Executar com logs detalhados
DEBUG=* npm run test:integration

# Logs específicos do k6
k6 run --verbose load-tests/stress-test.js
```

## 🤝 Contribuição

### Adicionando Novos Testes

1. **Testes de Integração**: Adicionar em `src/integration/`
2. **Testes E2E**: Adicionar em `src/e2e/`
3. **Testes de Carga**: Adicionar em `load-tests/`

### Padrões de Código

- Usar TypeScript para tipagem
- Seguir padrão AAA (Arrange, Act, Assert)
- Incluir logs descritivos
- Limpar dados após testes

### Pull Requests

1. Executar todos os testes localmente
2. Garantir cobertura > 80%
3. Documentar novos cenários
4. Atualizar README se necessário

## 📞 Suporte

Para dúvidas ou problemas:

1. Verificar logs em `tests/reports/`
2. Consultar documentação da API
3. Revisar configurações de ambiente
4. Executar testes individualmente para isolar problemas

---

## 📄 Licença

Este projeto faz parte do sistema NoraCOND e segue as mesmas diretrizes de licenciamento do projeto principal.

---

**Desenvolvido com ❤️ para garantir a qualidade do NoraCOND**