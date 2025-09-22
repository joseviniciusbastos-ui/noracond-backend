import axios from 'axios';
import https from 'https';

// Configuração global para testes
export const TEST_CONFIG = {
  API_BASE_URL: process.env.API_URL || 'http://localhost:5286/api',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  TEST_TIMEOUT: parseInt(process.env.TEST_TIMEOUT || '30000'),
  DEFAULT_USER: {
    nome: process.env.TEST_USER_NAME || 'Usuário Teste',
    email: process.env.TEST_EMAIL || 'teste@noracond.com',
    senha: process.env.TEST_PASSWORD || 'senha123'
  },
  ADMIN_USER: {
    nome: 'Administrador',
    email: 'admin@noracond.com',
    senha: 'Admin123!'
  }
};

// Cliente HTTP configurado para testes
export const apiClient = axios.create({
  baseURL: TEST_CONFIG.API_BASE_URL,
  timeout: TEST_CONFIG.TEST_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  },
  // Ignorar certificados SSL auto-assinados em ambiente de teste
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

// Interceptor para adicionar token JWT automaticamente
let authToken: string | null = null;

export const setAuthToken = (token: string) => {
  authToken = token;
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const clearAuthToken = () => {
  authToken = null;
  delete apiClient.defaults.headers.common['Authorization'];
};

// Helper para login automático nos testes
export const authenticateTestUser = async () => {
  try {
    const response = await apiClient.post('/auth/login', TEST_CONFIG.DEFAULT_USER);
    const token = response.data.token;
    setAuthToken(token);
    return token;
  } catch (error) {
    console.error('Falha na autenticação do usuário de teste:', error);
    throw error;
  }
};

// Setup global antes de cada teste
beforeEach(() => {
  // Limpar token antes de cada teste
  clearAuthToken();
});

// Cleanup global após cada teste
afterEach(() => {
  // Limpar qualquer estado global
  clearAuthToken();
});

// Helper para aguardar condições assíncronas
export const waitFor = (condition: () => boolean, timeout = 5000): Promise<void> => {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const checkCondition = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error(`Timeout: Condição não foi atendida em ${timeout}ms`));
      } else {
        setTimeout(checkCondition, 100);
      }
    };
    checkCondition();
  });
};

// Helper para gerar dados de teste únicos
export const generateTestData = {
  cliente: () => ({
    nome: `Cliente Teste ${Date.now()}`,
    email: `cliente${Date.now()}@teste.com`,
    telefone: '(11) 99999-9999',
    endereco: 'Rua Teste, 123'
  }),
  
  processo: (clienteId: number) => ({
    numero: `${Date.now()}-12.2024.8.26.0001`,
    titulo: `Processo Teste ${Date.now()}`,
    descricao: 'Processo criado para testes automatizados',
    clienteId,
    status: 'Ativo'
  }),
  
  lancamento: (processoId: number) => ({
    descricao: `Lançamento Teste ${Date.now()}`,
    valor: 1500.00,
    tipo: 'Receita',
    processoId,
    pago: false
  })
};