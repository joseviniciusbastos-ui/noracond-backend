import { apiClient, TEST_CONFIG, generateTestData, waitFor } from '../setup/test-setup';

describe('Teste E2E - Fluxo de Onboarding e Criação do Primeiro Caso', () => {
  let authToken: string;
  let clienteId: number;
  let processoId: number;

  beforeAll(async () => {
    // Limpar estado anterior
    delete apiClient.defaults.headers.common['Authorization'];
  });

  afterAll(async () => {
    // Cleanup: remover dados criados durante o teste
    if (authToken) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      try {
        if (processoId) {
          await apiClient.delete(`/processos/${processoId}`);
        }
        if (clienteId) {
          await apiClient.delete(`/clientes/${clienteId}`);
        }
      } catch (error) {
        // Ignorar erros de cleanup
      }
    }
  });

  describe('Cenário Completo: Do Login à Criação do Primeiro Caso', () => {
    it('deve executar o fluxo completo de onboarding com sucesso', async () => {
      // ========================================
      // ETAPA 1: Login do usuário
      // ========================================
      console.log('🔐 Etapa 1: Realizando login...');
      
      const loginResponse = await apiClient.post('/auth/login', {
        email: TEST_CONFIG.DEFAULT_USER.email,
        password: TEST_CONFIG.DEFAULT_USER.password
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data).toHaveProperty('token');
      expect(loginResponse.data).toHaveProperty('usuario');
      
      authToken = loginResponse.data.token;
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      console.log('✅ Login realizado com sucesso');

      // ========================================
      // ETAPA 2: Verificar redirecionamento para Dashboard
      // ========================================
      console.log('📊 Etapa 2: Acessando Dashboard...');
      
      const dashboardResponse = await apiClient.get('/dashboard/stats');
      
      expect(dashboardResponse.status).toBe(200);
      expect(dashboardResponse.data).toHaveProperty('totalClientes');
      expect(dashboardResponse.data).toHaveProperty('totalProcessos');
      expect(dashboardResponse.data).toHaveProperty('totalReceitas');
      expect(dashboardResponse.data).toHaveProperty('totalDespesas');
      
      const statsIniciais = dashboardResponse.data;
      console.log('✅ Dashboard acessado com sucesso');
      console.log(`   - Clientes: ${statsIniciais.totalClientes}`);
      console.log(`   - Processos: ${statsIniciais.totalProcessos}`);

      // ========================================
      // ETAPA 3: Navegar para página de Clientes e criar novo cliente
      // ========================================
      console.log('👥 Etapa 3: Criando novo cliente...');
      
      // Primeiro, listar clientes existentes
      const clientesListResponse = await apiClient.get('/clientes');
      expect(clientesListResponse.status).toBe(200);
      expect(Array.isArray(clientesListResponse.data)).toBe(true);
      
      const clientesIniciais = clientesListResponse.data.length;
      
      // Criar novo cliente
      const novoClienteData = {
        nome: `Cliente Onboarding ${Date.now()}`,
        email: `onboarding${Date.now()}@teste.com`,
        telefone: '(11) 99999-9999',
        endereco: 'Rua do Onboarding, 123 - São Paulo, SP'
      };
      
      const clienteResponse = await apiClient.post('/clientes', novoClienteData);
      
      expect(clienteResponse.status).toBe(201);
      expect(clienteResponse.data).toHaveProperty('id');
      expect(clienteResponse.data.nome).toBe(novoClienteData.nome);
      expect(clienteResponse.data.email).toBe(novoClienteData.email);
      
      clienteId = clienteResponse.data.id;
      console.log('✅ Cliente criado com sucesso');
      console.log(`   - ID: ${clienteId}`);
      console.log(`   - Nome: ${clienteResponse.data.nome}`);

      // Verificar se a lista de clientes foi atualizada
      const clientesAtualizadosResponse = await apiClient.get('/clientes');
      expect(clientesAtualizadosResponse.data.length).toBe(clientesIniciais + 1);
      expect(clientesAtualizadosResponse.data.some((c: any) => c.id === clienteId)).toBe(true);

      // ========================================
      // ETAPA 4: Navegar para página de Processos e criar novo processo
      // ========================================
      console.log('⚖️ Etapa 4: Criando novo processo...');
      
      // Primeiro, listar processos existentes
      const processosListResponse = await apiClient.get('/processos');
      expect(processosListResponse.status).toBe(200);
      expect(Array.isArray(processosListResponse.data)).toBe(true);
      
      const processosIniciais = processosListResponse.data.length;
      
      // Criar novo processo associado ao cliente
      const novoProcessoData = {
        numero: `${Date.now()}-12.2024.8.26.0001`,
        titulo: `Ação de Cobrança - Onboarding ${Date.now()}`,
        descricao: 'Processo criado durante o fluxo de onboarding para validação E2E do sistema NoraCOND',
        clienteId: clienteId,
        status: 'Ativo'
      };
      
      const processoResponse = await apiClient.post('/processos', novoProcessoData);
      
      expect(processoResponse.status).toBe(201);
      expect(processoResponse.data).toHaveProperty('id');
      expect(processoResponse.data.numero).toBe(novoProcessoData.numero);
      expect(processoResponse.data.titulo).toBe(novoProcessoData.titulo);
      expect(processoResponse.data.clienteId).toBe(clienteId);
      expect(processoResponse.data.status).toBe('Ativo');
      
      processoId = processoResponse.data.id;
      console.log('✅ Processo criado com sucesso');
      console.log(`   - ID: ${processoId}`);
      console.log(`   - Número: ${processoResponse.data.numero}`);
      console.log(`   - Título: ${processoResponse.data.titulo}`);

      // Verificar se a lista de processos foi atualizada
      const processosAtualizadosResponse = await apiClient.get('/processos');
      expect(processosAtualizadosResponse.data.length).toBe(processosIniciais + 1);
      expect(processosAtualizadosResponse.data.some((p: any) => p.id === processoId)).toBe(true);

      // ========================================
      // ETAPA 5: Acessar detalhes do processo e fazer upload de documento
      // ========================================
      console.log('📄 Etapa 5: Simulando upload de documento...');
      
      // Acessar detalhes do processo
      const processoDetalhesResponse = await apiClient.get(`/processos/${processoId}`);
      expect(processoDetalhesResponse.status).toBe(200);
      expect(processoDetalhesResponse.data.id).toBe(processoId);
      
      // Simular upload de documento (procuração)
      // Nota: Como não temos arquivo real, vamos simular o processo
      const documentoData = {
        nome: 'Procuração - Onboarding.pdf',
        tipo: 'Procuração',
        processoId: processoId,
        tamanho: 1024000, // 1MB simulado
        url: `/uploads/processos/${processoId}/procuracao-onboarding.pdf`
      };
      
      const documentoResponse = await apiClient.post('/documentos', documentoData);
      
      expect(documentoResponse.status).toBe(201);
      expect(documentoResponse.data).toHaveProperty('id');
      expect(documentoResponse.data.nome).toBe(documentoData.nome);
      expect(documentoResponse.data.processoId).toBe(processoId);
      
      console.log('✅ Documento simulado com sucesso');
      console.log(`   - Nome: ${documentoResponse.data.nome}`);
      console.log(`   - Tipo: ${documentoResponse.data.tipo}`);

      // Verificar se o documento está listado no processo
      const documentosProcessoResponse = await apiClient.get(`/processos/${processoId}/documentos`);
      expect(documentosProcessoResponse.status).toBe(200);
      expect(documentosProcessoResponse.data.some((d: any) => d.id === documentoResponse.data.id)).toBe(true);

      // ========================================
      // ETAPA 6: Verificar persistência e integridade dos dados
      // ========================================
      console.log('🔍 Etapa 6: Verificando persistência dos dados...');
      
      // Verificar se o dashboard foi atualizado
      const dashboardFinalResponse = await apiClient.get('/dashboard/stats');
      expect(dashboardFinalResponse.status).toBe(200);
      
      const statsFinal = dashboardFinalResponse.data;
      expect(statsFinal.totalClientes).toBe(statsIniciais.totalClientes + 1);
      expect(statsFinal.totalProcessos).toBe(statsIniciais.totalProcessos + 1);
      
      console.log('✅ Dashboard atualizado corretamente');
      console.log(`   - Clientes: ${statsIniciais.totalClientes} → ${statsFinal.totalClientes}`);
      console.log(`   - Processos: ${statsIniciais.totalProcessos} → ${statsFinal.totalProcessos}`);

      // Verificar integridade da relação cliente-processo
      const clienteComProcessosResponse = await apiClient.get(`/clientes/${clienteId}/processos`);
      expect(clienteComProcessosResponse.status).toBe(200);
      expect(clienteComProcessosResponse.data.some((p: any) => p.id === processoId)).toBe(true);
      
      // Verificar se o processo mantém a referência correta ao cliente
      const processoComClienteResponse = await apiClient.get(`/processos/${processoId}?includeCliente=true`);
      expect(processoComClienteResponse.status).toBe(200);
      expect(processoComClienteResponse.data.cliente.id).toBe(clienteId);
      
      console.log('✅ Integridade dos dados verificada');

      // ========================================
      // ETAPA 7: Validar navegação e acessibilidade
      // ========================================
      console.log('🧭 Etapa 7: Validando navegação...');
      
      // Simular navegação de volta para lista de clientes
      const navegacaoClientesResponse = await apiClient.get('/clientes');
      expect(navegacaoClientesResponse.status).toBe(200);
      expect(navegacaoClientesResponse.data.some((c: any) => c.id === clienteId)).toBe(true);
      
      // Simular navegação para lista de processos
      const navegacaoProcessosResponse = await apiClient.get('/processos');
      expect(navegacaoProcessosResponse.status).toBe(200);
      expect(navegacaoProcessosResponse.data.some((p: any) => p.id === processoId)).toBe(true);
      
      // Simular busca do cliente criado
      const buscaClienteResponse = await apiClient.get(`/clientes?search=${novoClienteData.nome}`);
      expect(buscaClienteResponse.status).toBe(200);
      expect(buscaClienteResponse.data.some((c: any) => c.id === clienteId)).toBe(true);
      
      console.log('✅ Navegação validada com sucesso');

      // ========================================
      // RESULTADO FINAL
      // ========================================
      console.log('🎉 FLUXO DE ONBOARDING CONCLUÍDO COM SUCESSO!');
      console.log('📋 Resumo das operações realizadas:');
      console.log(`   ✓ Login autenticado`);
      console.log(`   ✓ Dashboard acessado e validado`);
      console.log(`   ✓ Cliente criado (ID: ${clienteId})`);
      console.log(`   ✓ Processo criado (ID: ${processoId})`);
      console.log(`   ✓ Documento simulado e associado`);
      console.log(`   ✓ Dados persistidos corretamente`);
      console.log(`   ✓ Integridade das relações mantida`);
      console.log(`   ✓ Navegação funcionando`);
      console.log(`   ✓ Dashboard atualizado em tempo real`);
      
    }, 60000); // Timeout de 60 segundos para o teste completo
  });

  describe('Validações de Erro no Fluxo de Onboarding', () => {
    beforeEach(async () => {
      // Fazer login para os testes de erro
      const loginResponse = await apiClient.post('/auth/login', TEST_CONFIG.DEFAULT_USER);
      authToken = loginResponse.data.token;
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    });

    it('deve tratar erro ao criar cliente com dados inválidos', async () => {
      const clienteInvalido = {
        nome: '', // Nome vazio
        email: 'email-invalido', // Email inválido
        telefone: '',
        endereco: ''
      };

      try {
        await apiClient.post('/clientes', clienteInvalido);
        fail('Deveria ter falhado com dados inválidos');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        console.log('✅ Validação de cliente inválido funcionando');
      }
    });

    it('deve tratar erro ao criar processo sem cliente válido', async () => {
      const processoInvalido = {
        numero: `${Date.now()}-TESTE`,
        titulo: 'Processo Teste',
        descricao: 'Teste',
        clienteId: 99999, // Cliente inexistente
        status: 'Ativo'
      };

      try {
        await apiClient.post('/processos', processoInvalido);
        fail('Deveria ter falhado com cliente inexistente');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        console.log('✅ Validação de processo com cliente inexistente funcionando');
      }
    });

    it('deve manter consistência após falhas parciais', async () => {
      // Criar cliente válido
      const cliente = await apiClient.post('/clientes', generateTestData.cliente());
      expect(cliente.status).toBe(201);
      
      // Tentar criar processo inválido
      try {
        await apiClient.post('/processos', {
          numero: '', // Número vazio
          titulo: '',
          descricao: '',
          clienteId: cliente.data.id,
          status: ''
        });
        fail('Deveria ter falhado');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
      
      // Verificar se o cliente ainda existe
      const clienteVerificacao = await apiClient.get(`/clientes/${cliente.data.id}`);
      expect(clienteVerificacao.status).toBe(200);
      
      // Limpar cliente criado
      await apiClient.delete(`/clientes/${cliente.data.id}`);
      
      console.log('✅ Consistência mantida após falhas parciais');
    });
  });
});