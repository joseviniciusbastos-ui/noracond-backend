import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Métricas customizadas
export const errorRate = new Rate('errors');

// Configuração do teste
export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp-up para 10 usuários
    { duration: '2m', target: 25 }, // Ramp-up para 25 usuários
    { duration: '2m', target: 50 }, // Ramp-up para 50 usuários
    { duration: '10m', target: 50 }, // Manter 50 usuários por 10 minutos
    { duration: '2m', target: 0 },   // Ramp-down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% das requisições devem ser < 500ms
    http_req_failed: ['rate<0.01'],   // Taxa de erro < 1%
    errors: ['rate<0.01'],            // Taxa de erro customizada < 1%
  },
};

// Configuração da API
const BASE_URL = 'http://localhost:5286/api';
const DEFAULT_USER = {
  email: 'admin@noracond.com',
  password: 'Admin123!'
};

// Função para fazer login e obter token
function login() {
  const loginResponse = http.post(`${BASE_URL}/auth/login`, JSON.stringify(DEFAULT_USER), {
    headers: { 'Content-Type': 'application/json' },
  });

  const loginSuccess = check(loginResponse, {
    'login status is 200': (r) => r.status === 200,
    'login has token': (r) => r.json('token') !== undefined,
  });

  if (!loginSuccess) {
    errorRate.add(1);
    return null;
  }

  return loginResponse.json('token');
}

// Função principal do teste
export default function () {
  // 1. Login (100% dos usuários)
  const token = login();
  if (!token) {
    return; // Falha no login, pular resto do teste
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  sleep(1); // Pausa entre requisições

  // 2. Dashboard (80% dos usuários)
  if (Math.random() < 0.8) {
    const dashboardResponse = http.get(`${BASE_URL}/dashboard/stats`, { headers });
    
    const dashboardSuccess = check(dashboardResponse, {
      'dashboard status is 200': (r) => r.status === 200,
      'dashboard has stats': (r) => r.json('totalClientes') !== undefined,
      'dashboard response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (!dashboardSuccess) {
      errorRate.add(1);
    }
  }

  sleep(1);

  // 3. Listar Clientes (50% dos usuários)
  if (Math.random() < 0.5) {
    const clientesResponse = http.get(`${BASE_URL}/clientes`, { headers });
    
    const clientesSuccess = check(clientesResponse, {
      'clientes status is 200': (r) => r.status === 200,
      'clientes is array': (r) => Array.isArray(r.json()),
      'clientes response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (!clientesSuccess) {
      errorRate.add(1);
    }
  }

  sleep(1);

  // 4. Listar Processos (30% dos usuários)
  if (Math.random() < 0.3) {
    const processosResponse = http.get(`${BASE_URL}/processos`, { headers });
    
    const processosSuccess = check(processosResponse, {
      'processos status is 200': (r) => r.status === 200,
      'processos is array': (r) => Array.isArray(r.json()),
      'processos response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (!processosSuccess) {
      errorRate.add(1);
    }
  }

  sleep(1);

  // 5. Operações adicionais (20% dos usuários)
  if (Math.random() < 0.2) {
    // Listar lançamentos financeiros
    const lancamentosResponse = http.get(`${BASE_URL}/lancamentos`, { headers });
    
    const lancamentosSuccess = check(lancamentosResponse, {
      'lancamentos status is 200': (r) => r.status === 200,
      'lancamentos response time < 500ms': (r) => r.timings.duration < 500,
    });

    if (!lancamentosSuccess) {
      errorRate.add(1);
    }

    sleep(0.5);

    // Verificar chat (se disponível)
    const chatResponse = http.get(`${BASE_URL}/chat/conversas`, { headers });
    
    check(chatResponse, {
      'chat accessible': (r) => r.status === 200 || r.status === 404, // 404 é aceitável se não houver conversas
      'chat response time < 500ms': (r) => r.timings.duration < 500,
    });
  }

  // Pausa final entre iterações
  sleep(2);
}

// Função executada no início do teste
export function setup() {
  console.log('🚀 Iniciando teste de carga do NoraCOND');
  console.log('📊 Configuração:');
  console.log('   - 50 usuários virtuais máximo');
  console.log('   - 10 minutos de duração');
  console.log('   - Limite de 500ms para 95% das requisições');
  console.log('   - Taxa de erro máxima: 1%');
  
  // Verificar se a API está disponível
  const healthCheck = http.get(`${BASE_URL}/dashboard/stats`);
  if (healthCheck.status !== 401) { // 401 é esperado sem autenticação
    console.log('⚠️  API pode não estar disponível');
  } else {
    console.log('✅ API está respondendo');
  }
}

// Função executada no final do teste
export function teardown(data) {
  console.log('🏁 Teste de carga finalizado');
  console.log('📈 Verifique os resultados acima para métricas detalhadas');
}