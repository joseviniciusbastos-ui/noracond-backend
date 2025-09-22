import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar variáveis de ambiente do arquivo .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configurações padrão para testes
const defaultConfig = {
  API_URL: 'http://localhost:5286/api',
  FRONTEND_URL: 'http://localhost:3000',
  TEST_EMAIL: 'teste@noracond.com',
  TEST_PASSWORD: 'senha123',
  TEST_USER_NAME: 'Usuário Teste',
  TEST_USER_2_EMAIL: 'teste2@noracond.com',
  TEST_USER_2_PASSWORD: 'senha456',
  TEST_USER_2_NAME: 'Usuário Teste 2',
  NODE_ENV: 'test',
  TEST_TIMEOUT: '30000',
  JEST_TIMEOUT: '60000',
  K6_VUS: '50',
  K6_DURATION: '10m',
  K6_THRESHOLD_DURATION: '500',
  K6_THRESHOLD_ERROR_RATE: '0.01',
  JWT_SECRET: 'test-secret-key-for-testing-only',
  JWT_EXPIRATION: '1h',
  LOG_LEVEL: 'debug',
  HEADLESS: 'true',
  BROWSER_TIMEOUT: '30000',
  VIEWPORT_WIDTH: '1920',
  VIEWPORT_HEIGHT: '1080',
  CLEANUP_TEST_DATA: 'true',
  SEED_TEST_DATA: 'true',
  MOCK_EXTERNAL_APIS: 'true',
  ENABLE_SECURITY_TESTS: 'true',
  MAX_WORKERS: '4',
  TEST_CONCURRENCY: '2',
  GENERATE_HTML_REPORT: 'true',
  GENERATE_JSON_REPORT: 'true',
  ENVIRONMENT: 'test',
  DEBUG_MODE: 'true',
  VERBOSE_LOGGING: 'true'
};

// Aplicar configurações padrão se não estiverem definidas
Object.entries(defaultConfig).forEach(([key, value]) => {
  if (!process.env[key]) {
    process.env[key] = value;
  }
});

// Validar configurações obrigatórias
const requiredEnvVars = [
  'API_URL',
  'FRONTEND_URL',
  'TEST_EMAIL',
  'TEST_PASSWORD'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variáveis de ambiente obrigatórias não encontradas:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n💡 Dica: Copie o arquivo .env.example para .env e configure os valores necessários.');
  process.exit(1);
}

// Configurar timeouts globais
if (process.env.JEST_TIMEOUT) {
  jest.setTimeout(parseInt(process.env.JEST_TIMEOUT));
}

// Log de configuração (apenas em modo debug)
if (process.env.DEBUG_MODE === 'true') {
  console.log('🔧 Configuração de ambiente carregada:');
  console.log(`   - API_URL: ${process.env.API_URL}`);
  console.log(`   - FRONTEND_URL: ${process.env.FRONTEND_URL}`);
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   - TEST_TIMEOUT: ${process.env.TEST_TIMEOUT}ms`);
  console.log(`   - HEADLESS: ${process.env.HEADLESS}`);
}

export {};