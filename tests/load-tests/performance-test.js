import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Métricas customizadas
export let errorRate = new Rate('errors');
export let responseTime = new Trend('response_time');
export let requestCount = new Counter('requests');

// Configuração do teste
export let options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp-up para 10 usuários
    { duration: '5m', target: 25 }, // Manter 25 usuários
    { duration: '2m', target: 50 }, // Ramp-up para 50 usuários
    { duration: '10m', target: 50 }, // Manter 50 usuários por 10 minutos
    { duration: '3m', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições devem ser < 500ms
    http_req_failed: ['rate<0.01'],   // Taxa de erro < 1%
    errors: ['rate<0.01'],            // Taxa de erro customizada < 1%
  },
};

// Configuração da API
const BASE_URL = __ENV.API_URL || 'http://localhost:5000/api';
const TEST_USER = {
  email: __ENV.TEST_EMAIL || 'teste@noracond.com',
  password: __ENV.TEST_PASSWORD || 'senha123'
};

// Função para fazer login e obter token
function login() {
  const loginPayload = JSON.stringify(TEST_USER);
  const loginParams = {
    headers: { 'Content-Type': 'application/json' },
  };

  const loginResponse = http.post(`${BASE_URL}/auth/login`, loginPayload, loginParams);
  
  const loginSuccess = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login response has token': (r) => r.json('token') !== undefined,
  });

  if (!loginSuccess) {
    console.error(`Login failed: ${loginResponse.status} - ${loginResponse.body}`);
    errorRate.add(1);
    return null;
  }

  return loginResponse.json('token');
}

// Função principal do teste
export default function () {
  // ========================================
  // ETAPA 1: Login (100% dos usuários)
  // ========================================
  const token = login();
  if (!token) {
    return; // Sair se login falhou
  }

  const authHeaders = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  requestCount.add(1);
  sleep(1);

  // ========================================
  // ETAPA 2: Dashboard (80% dos usuários)
  // ========================================
  if (Math.random() < 0.8) {
    const startTime = Date.now();
    const dashboardResponse = http.get(`${BASE_URL}/dashboard/stats`, authHeaders);
    const endTime = Date.now();
    
    const dashboardSuccess = check(dashboardResponse, {
      'dashboard status is 200': (r) => r.status === 200,
      'dashboard has stats': (r) => {
        try {
          const data = r.json();
          return data.totalClientes !== undefined && 
                 data.totalProcessos !== undefined &&
                 data.totalReceitas !== undefined &&
                 data.totalDespesas !== undefined;
        } catch (e) {
          return false;
        }
      },
      'dashboard response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (!dashboardSuccess) {
      errorRate.add(1);
      console.error(`Dashboard failed: ${dashboardResponse.status}`);
    }

    responseTime.add(endTime - startTime);
    requestCount.add(1);
    sleep(0.5);
  }

  // ========================================
  // ETAPA 3: Listar Clientes com Paginação (50% dos usuários)
  // ========================================
  if (Math.random() < 0.5) {
    const page = Math.floor(Math.random() * 3) + 1; // Páginas 1-3
    const pageSize = 10;
    
    const startTime = Date.now();
    const clientesResponse = http.get(
      `${BASE_URL}/clientes?page=${page}&pageSize=${pageSize}`, 
      authHeaders
    );
    const endTime = Date.now();

    const clientesSuccess = check(clientesResponse, {
      'clientes status is 200': (r) => r.status === 200,
      'clientes response is array': (r) => {
        try {
          return Array.isArray(r.json());
        } catch (e) {
          return false;
        }
      },
      'clientes response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (!clientesSuccess) {
      errorRate.add(1);
      console.error(`Clientes failed: ${clientesResponse.status}`);
    }

    responseTime.add(endTime - startTime);
    requestCount.add(1);
    sleep(0.3);
  }

  // ========================================
  // ETAPA 4: Listar Processos (30% dos usuários)
  // ========================================
  if (Math.random() < 0.3) {
    const startTime = Date.now();
    const processosResponse = http.get(`${BASE_URL}/processos`, authHeaders);
    const endTime = Date.now();

    const processosSuccess = check(processosResponse, {
      'processos status is 200': (r) => r.status === 200,
      'processos response is array': (r) => {
        try {
          return Array.isArray(r.json());
        } catch (e) {
          return false;
        }
      },
      'processos response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (!processosSuccess) {
      errorRate.add(1);
      console.error(`Processos failed: ${processosResponse.status}`);
    }

    responseTime.add(endTime - startTime);
    requestCount.add(1);
    sleep(0.5);
  }

  // ========================================
  // ETAPA 5: Operações Financeiras (20% dos usuários)
  // ========================================
  if (Math.random() < 0.2) {
    const startTime = Date.now();
    const financeirosResponse = http.get(`${BASE_URL}/lancamentos`, authHeaders);
    const endTime = Date.now();

    const financeirosSuccess = check(financeirosResponse, {
      'financeiros status is 200': (r) => r.status === 200,
      'financeiros response is array': (r) => {
        try {
          return Array.isArray(r.json());
        } catch (e) {
          return false;
        }
      },
      'financeiros response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (!financeirosSuccess) {
      errorRate.add(1);
      console.error(`Financeiros failed: ${financeirosResponse.status}`);
    }

    responseTime.add(endTime - startTime);
    requestCount.add(1);
    sleep(0.7);
  }

  // ========================================
  // ETAPA 6: Chat/Mensagens (15% dos usuários)
  // ========================================
  if (Math.random() < 0.15) {
    const startTime = Date.now();
    const chatResponse = http.get(`${BASE_URL}/chat/conversas`, authHeaders);
    const endTime = Date.now();

    const chatSuccess = check(chatResponse, {
      'chat status is 200': (r) => r.status === 200,
      'chat response is array': (r) => {
        try {
          return Array.isArray(r.json());
        } catch (e) {
          return false;
        }
      },
      'chat response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (!chatSuccess) {
      errorRate.add(1);
      console.error(`Chat failed: ${chatResponse.status}`);
    }

    responseTime.add(endTime - startTime);
    requestCount.add(1);
    sleep(0.4);
  }

  // ========================================
  // ETAPA 7: Busca e Filtros (10% dos usuários)
  // ========================================
  if (Math.random() < 0.1) {
    const searchTerms = ['Silva', 'Santos', 'Oliveira', 'Cobrança', 'Trabalhista'];
    const searchTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    
    const startTime = Date.now();
    const searchResponse = http.get(
      `${BASE_URL}/clientes?search=${searchTerm}`, 
      authHeaders
    );
    const endTime = Date.now();

    const searchSuccess = check(searchResponse, {
      'search status is 200': (r) => r.status === 200,
      'search response is array': (r) => {
        try {
          return Array.isArray(r.json());
        } catch (e) {
          return false;
        }
      },
      'search response time < 1000ms': (r) => r.timings.duration < 1000,
    });

    if (!searchSuccess) {
      errorRate.add(1);
      console.error(`Search failed: ${searchResponse.status}`);
    }

    responseTime.add(endTime - startTime);
    requestCount.add(1);
    sleep(0.6);
  }

  // Pausa entre iterações para simular comportamento real do usuário
  sleep(Math.random() * 2 + 1); // 1-3 segundos
}

// Função executada no final do teste
export function teardown(data) {
  console.log('========================================');
  console.log('TESTE DE CARGA CONCLUÍDO');
  console.log('========================================');
  console.log(`Total de requisições: ${requestCount.count}`);
  console.log(`Taxa de erro: ${(errorRate.rate * 100).toFixed(2)}%`);
  console.log(`Tempo médio de resposta: ${responseTime.avg.toFixed(2)}ms`);
  console.log(`P95 tempo de resposta: ${responseTime.p(95).toFixed(2)}ms`);
  console.log('========================================');
}

// Função executada no início do teste
export function setup() {
  console.log('========================================');
  console.log('INICIANDO TESTE DE CARGA - NORACOND');
  console.log('========================================');
  console.log(`URL da API: ${BASE_URL}`);
  console.log(`Usuário de teste: ${TEST_USER.email}`);
  console.log('Configuração:');
  console.log('- 50 usuários virtuais máximo');
  console.log('- 10 minutos de duração no pico');
  console.log('- Thresholds: P95 < 500ms, Erro < 1%');
  console.log('========================================');
  
  // Verificar se a API está acessível
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    console.warn(`API health check failed: ${healthCheck.status}`);
    console.warn('Continuando com o teste...');
  } else {
    console.log('✅ API health check passou');
  }
  
  return {};
}