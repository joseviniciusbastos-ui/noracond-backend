import { apiClient, authenticateTestUser, generateTestData } from '../setup/test-setup';

describe('Testes de Integração - Financeiro', () => {
  let clienteId: number;
  let processoId: number;

  beforeEach(async () => {
    await authenticateTestUser();
    
    // Criar cliente e processo para os testes financeiros
    const cliente = await apiClient.post('/clientes', generateTestData.cliente());
    clienteId = cliente.data.id;
    
    const processo = await apiClient.post('/processos', generateTestData.processo(clienteId));
    processoId = processo.data.id;
  });

  describe('GET /api/lancamentos', () => {
    it('deve listar todos os lançamentos', async () => {
      const response = await apiClient.get('/lancamentos');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
        const lancamento = response.data[0];
        expect(lancamento).toHaveProperty('id');
        expect(lancamento).toHaveProperty('descricao');
        expect(lancamento).toHaveProperty('valor');
        expect(lancamento).toHaveProperty('tipo');
        expect(lancamento).toHaveProperty('processoId');
        expect(lancamento).toHaveProperty('pago');
        expect(lancamento).toHaveProperty('criadoEm');
      }
    });

    it('deve suportar filtro por tipo', async () => {
      // Criar lançamentos de diferentes tipos
      const receita = await apiClient.post('/lancamentos', {
        ...generateTestData.lancamento(processoId),
        tipo: 'Receita'
      });

      const despesa = await apiClient.post('/lancamentos', {
        ...generateTestData.lancamento(processoId),
        tipo: 'Despesa'
      });

      // Filtrar por receitas
      const receitasResponse = await apiClient.get('/lancamentos?tipo=Receita');
      expect(receitasResponse.status).toBe(200);
      expect(receitasResponse.data.every((l: any) => l.tipo === 'Receita')).toBe(true);
      expect(receitasResponse.data.some((l: any) => l.id === receita.data.id)).toBe(true);

      // Filtrar por despesas
      const despesasResponse = await apiClient.get('/lancamentos?tipo=Despesa');
      expect(despesasResponse.status).toBe(200);
      expect(despesasResponse.data.every((l: any) => l.tipo === 'Despesa')).toBe(true);
      expect(despesasResponse.data.some((l: any) => l.id === despesa.data.id)).toBe(true);
    });

    it('deve suportar filtro por status de pagamento', async () => {
      // Criar lançamentos pagos e não pagos
      const pago = await apiClient.post('/lancamentos', {
        ...generateTestData.lancamento(processoId),
        pago: true
      });

      const naoPago = await apiClient.post('/lancamentos', {
        ...generateTestData.lancamento(processoId),
        pago: false
      });

      // Filtrar por pagos
      const pagosResponse = await apiClient.get('/lancamentos?pago=true');
      expect(pagosResponse.status).toBe(200);
      expect(pagosResponse.data.every((l: any) => l.pago === true)).toBe(true);

      // Filtrar por não pagos
      const naoPagosResponse = await apiClient.get('/lancamentos?pago=false');
      expect(naoPagosResponse.status).toBe(200);
      expect(naoPagosResponse.data.every((l: any) => l.pago === false)).toBe(true);
    });

    it('deve suportar filtro por processo', async () => {
      const lancamento = await apiClient.post('/lancamentos', generateTestData.lancamento(processoId));

      const response = await apiClient.get(`/lancamentos?processoId=${processoId}`);

      expect(response.status).toBe(200);
      expect(response.data.every((l: any) => l.processoId === processoId)).toBe(true);
      expect(response.data.some((l: any) => l.id === lancamento.data.id)).toBe(true);
    });
  });

  describe('POST /api/lancamentos', () => {
    it('deve criar um novo lançamento de receita', async () => {
      const novaReceita = {
        descricao: 'Honorários Advocatícios',
        valor: 5000.00,
        tipo: 'Receita',
        processoId,
        pago: false
      };

      const response = await apiClient.post('/lancamentos', novaReceita);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.descricao).toBe(novaReceita.descricao);
      expect(response.data.valor).toBe(novaReceita.valor);
      expect(response.data.tipo).toBe(novaReceita.tipo);
      expect(response.data.processoId).toBe(novaReceita.processoId);
      expect(response.data.pago).toBe(novaReceita.pago);
      expect(response.data).toHaveProperty('criadoEm');
    });

    it('deve criar um novo lançamento de despesa', async () => {
      const novaDespesa = {
        descricao: 'Custas Processuais',
        valor: 800.00,
        tipo: 'Despesa',
        processoId,
        pago: true
      };

      const response = await apiClient.post('/lancamentos', novaDespesa);

      expect(response.status).toBe(201);
      expect(response.data.tipo).toBe('Despesa');
      expect(response.data.valor).toBe(800.00);
      expect(response.data.pago).toBe(true);
    });

    it('deve validar campos obrigatórios', async () => {
      const testCases = [
        { descricao: '', valor: 1000, tipo: 'Receita', processoId, pago: false },
        { descricao: 'Teste', valor: 0, tipo: 'Receita', processoId, pago: false },
        { descricao: 'Teste', valor: -100, tipo: 'Receita', processoId, pago: false },
        { descricao: 'Teste', valor: 1000, tipo: '', processoId, pago: false },
        { descricao: 'Teste', valor: 1000, tipo: 'TipoInvalido', processoId, pago: false },
        { descricao: 'Teste', valor: 1000, tipo: 'Receita', processoId: null, pago: false }
      ];

      for (const testCase of testCases) {
        try {
          await apiClient.post('/lancamentos', testCase);
          fail(`Deveria ter validado campos obrigatórios para: ${JSON.stringify(testCase)}`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      }
    });

    it('deve validar se processo existe', async () => {
      const lancamentoInvalido = {
        ...generateTestData.lancamento(99999), // Processo inexistente
      };

      try {
        await apiClient.post('/lancamentos', lancamentoInvalido);
        fail('Deveria ter validado existência do processo');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('deve aceitar valores decimais', async () => {
      const lancamento = {
        descricao: 'Teste Valor Decimal',
        valor: 1234.56,
        tipo: 'Receita',
        processoId,
        pago: false
      };

      const response = await apiClient.post('/lancamentos', lancamento);

      expect(response.status).toBe(201);
      expect(response.data.valor).toBe(1234.56);
    });
  });

  describe('GET /api/lancamentos/:id', () => {
    let lancamentoId: number;

    beforeEach(async () => {
      const lancamento = await apiClient.post('/lancamentos', generateTestData.lancamento(processoId));
      lancamentoId = lancamento.data.id;
    });

    it('deve retornar lançamento específico por ID', async () => {
      const response = await apiClient.get(`/lancamentos/${lancamentoId}`);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(lancamentoId);
      expect(response.data).toHaveProperty('descricao');
      expect(response.data).toHaveProperty('valor');
      expect(response.data).toHaveProperty('tipo');
      expect(response.data).toHaveProperty('processoId');
      expect(response.data).toHaveProperty('pago');
    });

    it('deve incluir dados do processo associado', async () => {
      const response = await apiClient.get(`/lancamentos/${lancamentoId}?includeProcesso=true`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('processo');
      expect(response.data.processo.id).toBe(processoId);
    });

    it('deve retornar 404 para lançamento inexistente', async () => {
      try {
        await apiClient.get('/lancamentos/99999');
        fail('Deveria ter retornado 404 para lançamento inexistente');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('PUT /api/lancamentos/:id', () => {
    let lancamentoId: number;

    beforeEach(async () => {
      const lancamento = await apiClient.post('/lancamentos', generateTestData.lancamento(processoId));
      lancamentoId = lancamento.data.id;
    });

    it('deve atualizar lançamento existente', async () => {
      const dadosAtualizados = {
        descricao: 'Descrição Atualizada',
        valor: 2500.00,
        tipo: 'Despesa',
        processoId,
        pago: true
      };

      const response = await apiClient.put(`/lancamentos/${lancamentoId}`, dadosAtualizados);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(lancamentoId);
      expect(response.data.descricao).toBe(dadosAtualizados.descricao);
      expect(response.data.valor).toBe(dadosAtualizados.valor);
      expect(response.data.tipo).toBe(dadosAtualizados.tipo);
      expect(response.data.pago).toBe(dadosAtualizados.pago);
    });

    it('deve validar dados na atualização', async () => {
      const dadosInvalidos = {
        descricao: '',
        valor: -100,
        tipo: 'TipoInvalido',
        processoId: null,
        pago: 'nao-booleano'
      };

      try {
        await apiClient.put(`/lancamentos/${lancamentoId}`, dadosInvalidos);
        fail('Deveria ter validado dados na atualização');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('PATCH /api/lancamentos/:id/marcar-pago', () => {
    let lancamentoId: number;

    beforeEach(async () => {
      const lancamento = await apiClient.post('/lancamentos', {
        ...generateTestData.lancamento(processoId),
        pago: false
      });
      lancamentoId = lancamento.data.id;
    });

    it('deve marcar lançamento como pago', async () => {
      const response = await apiClient.patch(`/lancamentos/${lancamentoId}/marcar-pago`);

      expect(response.status).toBe(200);
      expect(response.data.pago).toBe(true);
      expect(response.data).toHaveProperty('dataPagamento');
      expect(new Date(response.data.dataPagamento)).toBeInstanceOf(Date);
    });

    it('deve marcar lançamento como não pago', async () => {
      // Primeiro marcar como pago
      await apiClient.patch(`/lancamentos/${lancamentoId}/marcar-pago`);

      // Depois desmarcar
      const response = await apiClient.patch(`/lancamentos/${lancamentoId}/desmarcar-pago`);

      expect(response.status).toBe(200);
      expect(response.data.pago).toBe(false);
      expect(response.data.dataPagamento).toBeNull();
    });

    it('deve atualizar estatísticas do dashboard após marcar como pago', async () => {
      // Obter estatísticas iniciais
      const statsIniciais = await apiClient.get('/dashboard/stats');

      // Marcar como pago
      await apiClient.patch(`/lancamentos/${lancamentoId}/marcar-pago`);

      // Obter estatísticas atualizadas
      const statsAtualizadas = await apiClient.get('/dashboard/stats');

      // Verificar se os valores "a receber/pagar" foram atualizados
      expect(statsAtualizadas.data.aReceber).not.toBe(statsIniciais.data.aReceber);
    });

    it('deve retornar 404 para lançamento inexistente', async () => {
      try {
        await apiClient.patch('/lancamentos/99999/marcar-pago');
        fail('Deveria ter retornado 404 para lançamento inexistente');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('DELETE /api/lancamentos/:id', () => {
    let lancamentoId: number;

    beforeEach(async () => {
      const lancamento = await apiClient.post('/lancamentos', generateTestData.lancamento(processoId));
      lancamentoId = lancamento.data.id;
    });

    it('deve excluir lançamento existente', async () => {
      const response = await apiClient.delete(`/lancamentos/${lancamentoId}`);

      expect(response.status).toBe(204);

      // Verificar se foi realmente excluído
      try {
        await apiClient.get(`/lancamentos/${lancamentoId}`);
        fail('Lançamento deveria ter sido excluído');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('deve atualizar dashboard após exclusão', async () => {
      // Obter estatísticas iniciais
      const statsIniciais = await apiClient.get('/dashboard/stats');

      // Excluir lançamento
      await apiClient.delete(`/lancamentos/${lancamentoId}`);

      // Obter estatísticas atualizadas
      const statsAtualizadas = await apiClient.get('/dashboard/stats');

      // Verificar se as estatísticas foram atualizadas
      expect(statsAtualizadas.data.totalReceitas + statsAtualizadas.data.totalDespesas)
        .toBeLessThan(statsIniciais.data.totalReceitas + statsIniciais.data.totalDespesas);
    });
  });

  describe('Relatórios Financeiros', () => {
    beforeEach(async () => {
      // Criar vários lançamentos para testes de relatório
      await apiClient.post('/lancamentos', {
        descricao: 'Receita 1',
        valor: 3000.00,
        tipo: 'Receita',
        processoId,
        pago: true
      });

      await apiClient.post('/lancamentos', {
        descricao: 'Receita 2',
        valor: 2000.00,
        tipo: 'Receita',
        processoId,
        pago: false
      });

      await apiClient.post('/lancamentos', {
        descricao: 'Despesa 1',
        valor: 800.00,
        tipo: 'Despesa',
        processoId,
        pago: true
      });

      await apiClient.post('/lancamentos', {
        descricao: 'Despesa 2',
        valor: 500.00,
        tipo: 'Despesa',
        processoId,
        pago: false
      });
    });

    it('deve gerar relatório de receitas e despesas', async () => {
      const response = await apiClient.get('/lancamentos/relatorio');

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('totalReceitas');
      expect(response.data).toHaveProperty('totalDespesas');
      expect(response.data).toHaveProperty('receitasPagas');
      expect(response.data).toHaveProperty('despesasPagas');
      expect(response.data).toHaveProperty('aReceber');
      expect(response.data).toHaveProperty('aPagar');
      expect(response.data).toHaveProperty('saldoLiquido');

      expect(response.data.totalReceitas).toBe(5000.00);
      expect(response.data.totalDespesas).toBe(1300.00);
      expect(response.data.receitasPagas).toBe(3000.00);
      expect(response.data.despesasPagas).toBe(800.00);
      expect(response.data.aReceber).toBe(2000.00);
      expect(response.data.aPagar).toBe(500.00);
      expect(response.data.saldoLiquido).toBe(3700.00);
    });

    it('deve filtrar relatório por período', async () => {
      const hoje = new Date().toISOString().split('T')[0];
      const response = await apiClient.get(`/lancamentos/relatorio?dataInicio=${hoje}&dataFim=${hoje}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('totalReceitas');
      expect(response.data).toHaveProperty('totalDespesas');
    });
  });
});