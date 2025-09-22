import { apiClient, authenticateTestUser } from '../setup/test-setup';

describe('Testes de Integração - Dashboard', () => {
  
  beforeEach(async () => {
    await authenticateTestUser();
  });

  describe('GET /api/dashboard/stats', () => {
    it('deve retornar estatísticas do dashboard', async () => {
      const response = await apiClient.get('/dashboard/stats');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('totalClientes');
      expect(response.data).toHaveProperty('totalProcessos');
      expect(response.data).toHaveProperty('totalReceitas');
      expect(response.data).toHaveProperty('totalDespesas');
      expect(response.data).toHaveProperty('aReceber');
      expect(response.data).toHaveProperty('aPagar');
      
      // Validar tipos de dados
      expect(typeof response.data.totalClientes).toBe('number');
      expect(typeof response.data.totalProcessos).toBe('number');
      expect(typeof response.data.totalReceitas).toBe('number');
      expect(typeof response.data.totalDespesas).toBe('number');
      expect(typeof response.data.aReceber).toBe('number');
      expect(typeof response.data.aPagar).toBe('number');
      
      // Validar valores não negativos
      expect(response.data.totalClientes).toBeGreaterThanOrEqual(0);
      expect(response.data.totalProcessos).toBeGreaterThanOrEqual(0);
      expect(response.data.totalReceitas).toBeGreaterThanOrEqual(0);
      expect(response.data.totalDespesas).toBeGreaterThanOrEqual(0);
      expect(response.data.aReceber).toBeGreaterThanOrEqual(0);
      expect(response.data.aPagar).toBeGreaterThanOrEqual(0);
    });

    it('deve retornar dados consistentes com o banco', async () => {
      // Buscar dados individuais
      const [clientesResponse, processosResponse, lancamentosResponse] = await Promise.all([
        apiClient.get('/clientes'),
        apiClient.get('/processos'),
        apiClient.get('/lancamentos')
      ]);

      // Buscar estatísticas do dashboard
      const dashboardResponse = await apiClient.get('/dashboard/stats');

      // Validar consistência
      expect(dashboardResponse.data.totalClientes).toBe(clientesResponse.data.length);
      expect(dashboardResponse.data.totalProcessos).toBe(processosResponse.data.length);
      
      // Calcular valores esperados dos lançamentos
      const lancamentos = lancamentosResponse.data;
      const receitas = lancamentos.filter((l: any) => l.tipo === 'Receita');
      const despesas = lancamentos.filter((l: any) => l.tipo === 'Despesa');
      const aReceber = receitas.filter((r: any) => !r.pago).reduce((sum: number, r: any) => sum + r.valor, 0);
      const aPagar = despesas.filter((d: any) => !d.pago).reduce((sum: number, d: any) => sum + d.valor, 0);

      expect(dashboardResponse.data.totalReceitas).toBe(receitas.length);
      expect(dashboardResponse.data.totalDespesas).toBe(despesas.length);
      expect(Math.abs(dashboardResponse.data.aReceber - aReceber)).toBeLessThan(0.01);
      expect(Math.abs(dashboardResponse.data.aPagar - aPagar)).toBeLessThan(0.01);
    });

    it('deve retornar resposta rápida (performance)', async () => {
      const startTime = Date.now();
      const response = await apiClient.get('/dashboard/stats');
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      
      expect(response.status).toBe(200);
      expect(responseTime).toBeLessThan(1000); // Menos de 1 segundo
    });

    it('deve manter dados atualizados após mudanças', async () => {
      // Obter estatísticas iniciais
      const initialStats = await apiClient.get('/dashboard/stats');
      
      // Criar um novo cliente
      const novoCliente = {
        nome: `Cliente Dashboard Test ${Date.now()}`,
        email: `dashboard${Date.now()}@teste.com`,
        telefone: '(11) 99999-9999',
        endereco: 'Rua Teste Dashboard, 123'
      };
      
      await apiClient.post('/clientes', novoCliente);
      
      // Obter estatísticas atualizadas
      const updatedStats = await apiClient.get('/dashboard/stats');
      
      // Validar que o contador foi incrementado
      expect(updatedStats.data.totalClientes).toBe(initialStats.data.totalClientes + 1);
    });
  });

  describe('Integração com outros módulos', () => {
    it('deve refletir mudanças financeiras no dashboard', async () => {
      // Obter estatísticas iniciais
      const initialStats = await apiClient.get('/dashboard/stats');
      
      // Criar cliente e processo para o teste
      const cliente = await apiClient.post('/clientes', {
        nome: `Cliente Financeiro ${Date.now()}`,
        email: `financeiro${Date.now()}@teste.com`,
        telefone: '(11) 99999-9999',
        endereco: 'Rua Teste, 123'
      });
      
      const processo = await apiClient.post('/processos', {
        numero: `${Date.now()}-12.2024.8.26.0001`,
        titulo: `Processo Dashboard Test ${Date.now()}`,
        descricao: 'Processo para teste do dashboard',
        clienteId: cliente.data.id,
        status: 'Ativo'
      });
      
      // Adicionar lançamento não pago
      const lancamento = {
        descricao: 'Honorários Dashboard Test',
        valor: 2500.00,
        tipo: 'Receita',
        processoId: processo.data.id,
        pago: false
      };
      
      await apiClient.post('/lancamentos', lancamento);
      
      // Verificar se o dashboard foi atualizado
      const updatedStats = await apiClient.get('/dashboard/stats');
      
      expect(updatedStats.data.totalClientes).toBe(initialStats.data.totalClientes + 1);
      expect(updatedStats.data.totalProcessos).toBe(initialStats.data.totalProcessos + 1);
      expect(updatedStats.data.totalReceitas).toBe(initialStats.data.totalReceitas + 1);
      expect(updatedStats.data.aReceber).toBeCloseTo(initialStats.data.aReceber + 2500.00, 2);
    });
  });
});