import { apiClient, authenticateTestUser, generateTestData } from '../setup/test-setup';

describe('Testes de Integração - Clientes', () => {
  
  beforeEach(async () => {
    await authenticateTestUser();
  });

  describe('GET /api/clientes', () => {
    it('deve listar todos os clientes', async () => {
      const response = await apiClient.get('/clientes');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      if (response.data.length > 0) {
        const cliente = response.data[0];
        expect(cliente).toHaveProperty('id');
        expect(cliente).toHaveProperty('nome');
        expect(cliente).toHaveProperty('email');
        expect(cliente).toHaveProperty('telefone');
        expect(cliente).toHaveProperty('endereco');
        expect(cliente).toHaveProperty('criadoEm');
      }
    });

    it('deve suportar paginação', async () => {
      const response = await apiClient.get('/clientes?page=1&limit=5');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeLessThanOrEqual(5);
    });

    it('deve suportar busca por nome', async () => {
      // Criar cliente para teste de busca
      const clienteTeste = generateTestData.cliente();
      const clienteCriado = await apiClient.post('/clientes', clienteTeste);

      const response = await apiClient.get(`/clientes?search=${clienteTeste.nome}`);

      expect(response.status).toBe(200);
      expect(response.data.some((c: any) => c.id === clienteCriado.data.id)).toBe(true);
    });
  });

  describe('POST /api/clientes', () => {
    it('deve criar um novo cliente com dados válidos', async () => {
      const novoCliente = generateTestData.cliente();

      const response = await apiClient.post('/clientes', novoCliente);

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.nome).toBe(novoCliente.nome);
      expect(response.data.email).toBe(novoCliente.email);
      expect(response.data.telefone).toBe(novoCliente.telefone);
      expect(response.data.endereco).toBe(novoCliente.endereco);
      expect(response.data).toHaveProperty('criadoEm');
    });

    it('deve validar campos obrigatórios', async () => {
      const testCases = [
        { nome: '', email: 'teste@email.com', telefone: '11999999999', endereco: 'Rua Teste' },
        { nome: 'Teste', email: '', telefone: '11999999999', endereco: 'Rua Teste' },
        { nome: 'Teste', email: 'teste@email.com', telefone: '', endereco: 'Rua Teste' },
        { nome: 'Teste', email: 'teste@email.com', telefone: '11999999999', endereco: '' }
      ];

      for (const testCase of testCases) {
        try {
          await apiClient.post('/clientes', testCase);
          fail(`Deveria ter validado campos obrigatórios para: ${JSON.stringify(testCase)}`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      }
    });

    it('deve validar formato de email', async () => {
      const clienteInvalido = {
        ...generateTestData.cliente(),
        email: 'email-invalido'
      };

      try {
        await apiClient.post('/clientes', clienteInvalido);
        fail('Deveria ter validado formato do email');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('deve impedir emails duplicados', async () => {
      const cliente1 = generateTestData.cliente();
      await apiClient.post('/clientes', cliente1);

      const cliente2 = {
        ...generateTestData.cliente(),
        email: cliente1.email
      };

      try {
        await apiClient.post('/clientes', cliente2);
        fail('Deveria ter impedido email duplicado');
      } catch (error: any) {
        expect(error.response.status).toBe(409);
      }
    });
  });

  describe('GET /api/clientes/:id', () => {
    let clienteId: number;

    beforeEach(async () => {
      const cliente = await apiClient.post('/clientes', generateTestData.cliente());
      clienteId = cliente.data.id;
    });

    it('deve retornar cliente específico por ID', async () => {
      const response = await apiClient.get(`/clientes/${clienteId}`);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(clienteId);
      expect(response.data).toHaveProperty('nome');
      expect(response.data).toHaveProperty('email');
      expect(response.data).toHaveProperty('telefone');
      expect(response.data).toHaveProperty('endereco');
    });

    it('deve retornar 404 para cliente inexistente', async () => {
      try {
        await apiClient.get('/clientes/99999');
        fail('Deveria ter retornado 404 para cliente inexistente');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('PUT /api/clientes/:id', () => {
    let clienteId: number;
    let clienteOriginal: any;

    beforeEach(async () => {
      const cliente = await apiClient.post('/clientes', generateTestData.cliente());
      clienteId = cliente.data.id;
      clienteOriginal = cliente.data;
    });

    it('deve atualizar cliente existente', async () => {
      const dadosAtualizados = {
        nome: 'Nome Atualizado',
        email: `atualizado${Date.now()}@teste.com`,
        telefone: '(11) 88888-8888',
        endereco: 'Rua Atualizada, 456'
      };

      const response = await apiClient.put(`/clientes/${clienteId}`, dadosAtualizados);

      expect(response.status).toBe(200);
      expect(response.data.id).toBe(clienteId);
      expect(response.data.nome).toBe(dadosAtualizados.nome);
      expect(response.data.email).toBe(dadosAtualizados.email);
      expect(response.data.telefone).toBe(dadosAtualizados.telefone);
      expect(response.data.endereco).toBe(dadosAtualizados.endereco);
    });

    it('deve validar dados na atualização', async () => {
      const dadosInvalidos = {
        nome: '',
        email: 'email-invalido',
        telefone: '',
        endereco: ''
      };

      try {
        await apiClient.put(`/clientes/${clienteId}`, dadosInvalidos);
        fail('Deveria ter validado dados na atualização');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('deve retornar 404 para cliente inexistente', async () => {
      try {
        await apiClient.put('/clientes/99999', generateTestData.cliente());
        fail('Deveria ter retornado 404 para cliente inexistente');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('DELETE /api/clientes/:id', () => {
    let clienteId: number;

    beforeEach(async () => {
      const cliente = await apiClient.post('/clientes', generateTestData.cliente());
      clienteId = cliente.data.id;
    });

    it('deve excluir cliente existente', async () => {
      const response = await apiClient.delete(`/clientes/${clienteId}`);

      expect(response.status).toBe(204);

      // Verificar se foi realmente excluído
      try {
        await apiClient.get(`/clientes/${clienteId}`);
        fail('Cliente deveria ter sido excluído');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('deve retornar 404 para cliente inexistente', async () => {
      try {
        await apiClient.delete('/clientes/99999');
        fail('Deveria ter retornado 404 para cliente inexistente');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('deve impedir exclusão de cliente com processos associados', async () => {
      // Criar processo associado ao cliente
      const processo = generateTestData.processo(clienteId);
      await apiClient.post('/processos', processo);

      try {
        await apiClient.delete(`/clientes/${clienteId}`);
        fail('Deveria ter impedido exclusão de cliente com processos');
      } catch (error: any) {
        expect(error.response.status).toBe(409);
        expect(error.response.data.message).toContain('processos associados');
      }
    });
  });

  describe('Integração com outros módulos', () => {
    it('deve listar processos do cliente', async () => {
      // Criar cliente
      const cliente = await apiClient.post('/clientes', generateTestData.cliente());
      
      // Criar processo para o cliente
      const processo = await apiClient.post('/processos', generateTestData.processo(cliente.data.id));
      
      // Buscar processos do cliente
      const response = await apiClient.get(`/clientes/${cliente.data.id}/processos`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.some((p: any) => p.id === processo.data.id)).toBe(true);
    });
  });
});