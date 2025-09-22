import { apiClient, authenticateTestUser, generateTestData } from '../setup/test-setup';

describe('Testes de Integração - Processos', () => {
  let clienteId: number;

  beforeEach(async () => {
    await authenticateTestUser();
    
    // Criar cliente para associar aos processos
    const cliente = await apiClient.post('/clientes', generateTestData.cliente());
    clienteId = cliente.data.id;
  });

  describe('GET /api/processos', () => {
    it('deve listar todos os processos', async () => {
      const response = await apiClient.get('/processos');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
        const processo = response.data[0];
        expect(processo).toHaveProperty('id');
        expect(processo).toHaveProperty('numero');
        expect(processo).toHaveProperty('titulo');
        expect(processo).toHaveProperty('descricao');
        expect(processo).toHaveProperty('clienteId');
        expect(processo).toHaveProperty('status');
        expect(processo).toHaveProperty('criadoEm');
      }
    });

    it('deve suportar filtro por cliente', async () => {
      // Criar processo para o cliente
      const processo = await apiClient.post('/processos', generateTestData.processo(clienteId));

      const response = await apiClient.get(`/processos?clienteId=${clienteId}`);

      expect(response.status).toBe(200);
      expect(response.data.some((p: any) => p.id === processo.data.id)).toBe(true);
      expect(response.data.every((p: any) => p.clienteId === clienteId)).toBe(true);
    });

    it('deve suportar busca por número do processo', async () => {
      const processoData = generateTestData.processo(clienteId);
      const processo = await apiClient.post('/processos', processoData);

      const response = await apiClient.get(`/processos?search=${processoData.numero}`);

      expect(response.status).toBe(200);
      expect(response.data.some((p: any) => p.id === processo.data.id)).toBe(true);
    });
  });

  describe('POST /api/processos', () => {
    it('deve criar um novo processo com dados válidos', async () => {
      const novoProcesso = generateTestData.processo(clienteId);

      const response = await apiClient.post('/processos', novoProcesso);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.numero).toBe(novoProcesso.numero);
      expect(response.data.titulo).toBe(novoProcesso.titulo);
      expect(response.data.descricao).toBe(novoProcesso.descricao);
      expect(response.data.clienteId).toBe(novoProcesso.clienteId);
      expect(response.data.status).toBe(novoProcesso.status);
      expect(response.data).toHaveProperty('criadoEm');
    });

    it('deve validar campos obrigatórios', async () => {
      const testCases = [
        { numero: '', titulo: 'Teste', descricao: 'Desc', clienteId, status: 'Ativo' },
        { numero: '123', titulo: '', descricao: 'Desc', clienteId, status: 'Ativo' },
        { numero: '123', titulo: 'Teste', descricao: '', clienteId, status: 'Ativo' },
        { numero: '123', titulo: 'Teste', descricao: 'Desc', clienteId: null, status: 'Ativo' },
        { numero: '123', titulo: 'Teste', descricao: 'Desc', clienteId, status: '' }
      ];

      for (const testCase of testCases) {
        try {
          await apiClient.post('/processos', testCase);
          fail(`Deveria ter validado campos obrigatórios para: ${JSON.stringify(testCase)}`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      }
    });

    it('deve validar se cliente existe', async () => {
      const processoInvalido = {
        ...generateTestData.processo(99999), // Cliente inexistente
      };

      try {
        await apiClient.post('/processos', processoInvalido);
        fail('Deveria ter validado existência do cliente');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('deve impedir números de processo duplicados', async () => {
      const processo1 = generateTestData.processo(clienteId);
      await apiClient.post('/processos', processo1);

      const processo2 = {
        ...generateTestData.processo(clienteId),
        numero: processo1.numero
      };

      try {
        await apiClient.post('/processos', processo2);
        fail('Deveria ter impedido número de processo duplicado');
      } catch (error: any) {
        expect(error.response.status).toBe(409);
      }
    });

    it('deve validar status do processo', async () => {
      const processoInvalido = {
        ...generateTestData.processo(clienteId),
        status: 'StatusInvalido'
      };

      try {
        await apiClient.post('/processos', processoInvalido);
        fail('Deveria ter validado status do processo');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('GET /api/processos/:id', () => {
    let processoId: number;

    beforeEach(async () => {
      const processo = await apiClient.post('/processos', generateTestData.processo(clienteId));
      processoId = processo.data.id;
    });

    it('deve retornar processo específico por ID', async () => {
      const response = await apiClient.get(`/processos/${processoId}`);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(processoId);
      expect(response.data).toHaveProperty('numero');
      expect(response.data).toHaveProperty('titulo');
      expect(response.data).toHaveProperty('descricao');
      expect(response.data).toHaveProperty('clienteId');
      expect(response.data).toHaveProperty('status');
    });

    it('deve incluir dados do cliente associado', async () => {
      const response = await apiClient.get(`/processos/${processoId}?includeCliente=true`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('cliente');
      expect(response.data.cliente.id).toBe(clienteId);
    });

    it('deve retornar 404 para processo inexistente', async () => {
      try {
        await apiClient.get('/processos/99999');
        fail('Deveria ter retornado 404 para processo inexistente');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('PUT /api/processos/:id', () => {
    let processoId: number;

    beforeEach(async () => {
      const processo = await apiClient.post('/processos', generateTestData.processo(clienteId));
      processoId = processo.data.id;
    });

    it('deve atualizar processo existente', async () => {
      const dadosAtualizados = {
        numero: `${Date.now()}-ATUALIZADO`,
        titulo: 'Título Atualizado',
        descricao: 'Descrição atualizada do processo',
        clienteId,
        status: 'Concluído'
      };

      const response = await apiClient.put(`/processos/${processoId}`, dadosAtualizados);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(processoId);
      expect(response.data.numero).toBe(dadosAtualizados.numero);
      expect(response.data.titulo).toBe(dadosAtualizados.titulo);
      expect(response.data.descricao).toBe(dadosAtualizados.descricao);
      expect(response.data.status).toBe(dadosAtualizados.status);
    });

    it('deve permitir mudança de cliente', async () => {
      // Criar outro cliente
      const outroCliente = await apiClient.post('/clientes', generateTestData.cliente());

      const dadosAtualizados = {
        numero: `${Date.now()}-MUDANCA-CLIENTE`,
        titulo: 'Processo com Cliente Alterado',
        descricao: 'Processo transferido para outro cliente',
        clienteId: outroCliente.data.id,
        status: 'Ativo'
      };

      const response = await apiClient.put(`/processos/${processoId}`, dadosAtualizados);

      expect(response.status).toBe(200);
      expect(response.data.clienteId).toBe(outroCliente.data.id);
    });

    it('deve validar dados na atualização', async () => {
      const dadosInvalidos = {
        numero: '',
        titulo: '',
        descricao: '',
        clienteId: null,
        status: 'StatusInvalido'
      };

      try {
        await apiClient.put(`/processos/${processoId}`, dadosInvalidos);
        fail('Deveria ter validado dados na atualização');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('DELETE /api/processos/:id', () => {
    let processoId: number;

    beforeEach(async () => {
      const processo = await apiClient.post('/processos', generateTestData.processo(clienteId));
      processoId = processo.data.id;
    });

    it('deve excluir processo existente', async () => {
      const response = await apiClient.delete(`/processos/${processoId}`);

      expect(response.status).toBe(204);

      // Verificar se foi realmente excluído
      try {
        await apiClient.get(`/processos/${processoId}`);
        fail('Processo deveria ter sido excluído');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('deve impedir exclusão de processo com lançamentos', async () => {
      // Criar lançamento associado ao processo
      const lancamento = generateTestData.lancamento(processoId);
      await apiClient.post('/lancamentos', lancamento);

      try {
        await apiClient.delete(`/processos/${processoId}`);
        fail('Deveria ter impedido exclusão de processo com lançamentos');
      } catch (error: any) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.message).toContain('lançamentos associados');
      }
    });
  });

  describe('Integração com outros módulos', () => {
    let processoId: number;

    beforeEach(async () => {
      const processo = await apiClient.post('/processos', generateTestData.processo(clienteId));
      processoId = processo.data.id;
    });

    it('deve listar lançamentos do processo', async () => {
      // Criar lançamento para o processo
      const lancamento = await apiClient.post('/lancamentos', generateTestData.lancamento(processoId));
      
      // Buscar lançamentos do processo
      const response = await apiClient.get(`/processos/${processoId}/lancamentos`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.some((l: any) => l.id === lancamento.data.id)).toBe(true);
    });

    it('deve listar documentos do processo', async () => {
      // Buscar documentos do processo (pode estar vazio inicialmente)
      const response = await apiClient.get(`/processos/${processoId}/documentos`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('deve calcular totais financeiros do processo', async () => {
      // Criar lançamentos de receita e despesa
      await apiClient.post('/lancamentos', {
        ...generateTestData.lancamento(processoId),
        tipo: 'Receita',
        valor: 5000.00,
        pago: false
      });

      await apiClient.post('/lancamentos', {
        ...generateTestData.lancamento(processoId),
        tipo: 'Despesa',
        valor: 1500.00,
        pago: true
      });

      // Buscar resumo financeiro do processo
      const response = await apiClient.get(`/processos/${processoId}/resumo-financeiro`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('totalReceitas');
      expect(response.data).toHaveProperty('totalDespesas');
      expect(response.data).toHaveProperty('aReceber');
      expect(response.data).toHaveProperty('aPagar');
      expect(response.data.totalReceitas).toBe(5000.00);
      expect(response.data.totalDespesas).toBe(1500.00);
      expect(response.data.aReceber).toBe(5000.00);
      expect(response.data.aPagar).toBe(0.00);
    });
  });
});