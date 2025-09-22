import { apiClient, TEST_CONFIG, generateTestData, waitFor } from '../setup/test-setup';

describe('Teste E2E - Fluxo de Gestão Financeira de um Processo', () => {
  let authToken: string;
  let clienteId: number;
  let processoId: number;
  let receitaId: number;
  let despesaId: number;

  beforeAll(async () => {
    // Setup inicial: criar cliente e processo para o teste
    const loginResponse = await apiClient.post('/auth/login', TEST_CONFIG.DEFAULT_USER);
    authToken = loginResponse.data.token;
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    // Criar cliente de teste
    const clienteData = generateTestData.cliente();
    const clienteResponse = await apiClient.post('/clientes', clienteData);
    clienteId = clienteResponse.data.id;

    // Criar processo de teste
    const processoData = {
      numero: `${Date.now()}-FINANCEIRO-TEST`,
      titulo: 'Processo para Teste Financeiro',
      descricao: 'Processo criado especificamente para testar fluxo financeiro E2E',
      clienteId: clienteId,
      status: 'Ativo'
    };
    const processoResponse = await apiClient.post('/processos', processoData);
    processoId = processoResponse.data.id;
  });

  afterAll(async () => {
    // Cleanup: remover dados criados durante o teste
    try {
      if (receitaId) {
        await apiClient.delete(`/lancamentos/${receitaId}`);
      }
      if (despesaId) {
        await apiClient.delete(`/lancamentos/${despesaId}`);
      }
      if (processoId) {
        await apiClient.delete(`/processos/${processoId}`);
      }
      if (clienteId) {
        await apiClient.delete(`/clientes/${clienteId}`);
      }
    } catch (error) {
      // Ignorar erros de cleanup
    }
  });

  describe('Cenário Completo: Gestão Financeira de um Processo', () => {
    it('deve executar o fluxo completo de gestão financeira com sucesso', async () => {
      // ========================================
      // ETAPA 1: Login e localização do processo
      // ========================================
      console.log('🔐 Etapa 1: Verificando autenticação e localizando processo...');
      
      // Verificar se o processo existe e está acessível
      const processoResponse = await apiClient.get(`/processos/${processoId}`);
      expect(processoResponse.status).toBe(200);
      expect(processoResponse.data.id).toBe(processoId);
      expect(processoResponse.data.status).toBe('Ativo');
      
      console.log('✅ Processo localizado com sucesso');
      console.log(`   - ID: ${processoId}`);
      console.log(`   - Número: ${processoResponse.data.numero}`);
      console.log(`   - Título: ${processoResponse.data.titulo}`);

      // ========================================
      // ETAPA 2: Capturar estado inicial do Dashboard
      // ========================================
      console.log('📊 Etapa 2: Capturando estado inicial do Dashboard...');
      
      const dashboardInicialResponse = await apiClient.get('/dashboard/stats');
      expect(dashboardInicialResponse.status).toBe(200);
      
      const statsIniciais = dashboardInicialResponse.data;
      console.log('✅ Estado inicial capturado');
      console.log(`   - Total A Receber: R$ ${statsIniciais.totalAReceber || 0}`);
      console.log(`   - Total A Pagar: R$ ${statsIniciais.totalAPagar || 0}`);
      console.log(`   - Total Receitas: R$ ${statsIniciais.totalReceitas || 0}`);
      console.log(`   - Total Despesas: R$ ${statsIniciais.totalDespesas || 0}`);

      // ========================================
      // ETAPA 3: Acessar página financeira e adicionar Receita (Honorários)
      // ========================================
      console.log('💰 Etapa 3: Adicionando nova Receita (Honorários)...');
      
      // Primeiro, listar lançamentos existentes do processo
      const lancamentosIniciais = await apiClient.get(`/lancamentos?processoId=${processoId}`);
      expect(lancamentosIniciais.status).toBe(200);
      
      const qtdLancamentosIniciais = lancamentosIniciais.data.length;
      
      // Criar nova receita (Honorários)
      const receitaData = {
        descricao: 'Honorários Advocatícios - Ação de Cobrança',
        valor: 5000.00,
        tipo: 'Receita',
        categoria: 'Honorários',
        dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 dias
        processoId: processoId,
        status: 'Pendente' // Não Paga
      };
      
      const receitaResponse = await apiClient.post('/lancamentos', receitaData);
      expect(receitaResponse.status).toBe(201);
      expect(receitaResponse.data).toHaveProperty('id');
      expect(receitaResponse.data.valor).toBe(receitaData.valor);
      expect(receitaResponse.data.tipo).toBe('Receita');
      expect(receitaResponse.data.status).toBe('Pendente');
      
      receitaId = receitaResponse.data.id;
      console.log('✅ Receita criada com sucesso');
      console.log(`   - ID: ${receitaId}`);
      console.log(`   - Valor: R$ ${receitaResponse.data.valor}`);
      console.log(`   - Status: ${receitaResponse.data.status}`);

      // ========================================
      // ETAPA 4: Adicionar nova Despesa (Custas Processuais)
      // ========================================
      console.log('💸 Etapa 4: Adicionando nova Despesa (Custas Processuais)...');
      
      const despesaData = {
        descricao: 'Custas Processuais - Distribuição e Citação',
        valor: 800.00,
        tipo: 'Despesa',
        categoria: 'Custas Processuais',
        dataVencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 dias
        processoId: processoId,
        status: 'Pendente' // Não Paga
      };
      
      const despesaResponse = await apiClient.post('/lancamentos', despesaData);
      expect(despesaResponse.status).toBe(201);
      expect(despesaResponse.data).toHaveProperty('id');
      expect(despesaResponse.data.valor).toBe(despesaData.valor);
      expect(despesaResponse.data.tipo).toBe('Despesa');
      expect(despesaResponse.data.status).toBe('Pendente');
      
      despesaId = despesaResponse.data.id;
      console.log('✅ Despesa criada com sucesso');
      console.log(`   - ID: ${despesaId}`);
      console.log(`   - Valor: R$ ${despesaResponse.data.valor}`);
      console.log(`   - Status: ${despesaResponse.data.status}`);

      // Verificar se os lançamentos foram adicionados à lista
      const lancamentosAtualizados = await apiClient.get(`/lancamentos?processoId=${processoId}`);
      expect(lancamentosAtualizados.status).toBe(200);
      expect(lancamentosAtualizados.data.length).toBe(qtdLancamentosIniciais + 2);
      
      const receitaCriada = lancamentosAtualizados.data.find((l: any) => l.id === receitaId);
      const despesaCriada = lancamentosAtualizados.data.find((l: any) => l.id === despesaId);
      expect(receitaCriada).toBeDefined();
      expect(despesaCriada).toBeDefined();

      // ========================================
      // ETAPA 5: Verificar atualização do Dashboard
      // ========================================
      console.log('📈 Etapa 5: Verificando atualização do Dashboard...');
      
      // Aguardar um momento para processamento
      await waitFor(1000);
      
      const dashboardAtualizadoResponse = await apiClient.get('/dashboard/stats');
      expect(dashboardAtualizadoResponse.status).toBe(200);
      
      const statsAtualizadas = dashboardAtualizadoResponse.data;
      
      // Verificar se os valores "A Receber" e "A Pagar" foram atualizados
      const expectedAReceber = (statsIniciais.totalAReceber || 0) + receitaData.valor;
      const expectedAPagar = (statsIniciais.totalAPagar || 0) + despesaData.valor;
      
      expect(statsAtualizadas.totalAReceber).toBeCloseTo(expectedAReceber, 2);
      expect(statsAtualizadas.totalAPagar).toBeCloseTo(expectedAPagar, 2);
      
      console.log('✅ Dashboard atualizado corretamente');
      console.log(`   - A Receber: R$ ${statsIniciais.totalAReceber || 0} → R$ ${statsAtualizadas.totalAReceber}`);
      console.log(`   - A Pagar: R$ ${statsIniciais.totalAPagar || 0} → R$ ${statsAtualizadas.totalAPagar}`);

      // ========================================
      // ETAPA 6: Marcar Receita como "Paga"
      // ========================================
      console.log('✅ Etapa 6: Marcando Receita como Paga...');
      
      // Marcar receita como paga
      const marcarPagaResponse = await apiClient.patch(`/lancamentos/${receitaId}/marcar-pago`, {
        status: 'Pago',
        dataPagamento: new Date().toISOString(),
        observacoes: 'Pagamento recebido via transferência bancária'
      });
      
      expect(marcarPagaResponse.status).toBe(200);
      expect(marcarPagaResponse.data.status).toBe('Pago');
      expect(marcarPagaResponse.data).toHaveProperty('dataPagamento');
      
      console.log('✅ Receita marcada como paga');
      console.log(`   - Status: ${marcarPagaResponse.data.status}`);
      console.log(`   - Data Pagamento: ${marcarPagaResponse.data.dataPagamento}`);

      // Verificar se a receita foi atualizada na lista
      const receitaAtualizadaResponse = await apiClient.get(`/lancamentos/${receitaId}`);
      expect(receitaAtualizadaResponse.status).toBe(200);
      expect(receitaAtualizadaResponse.data.status).toBe('Pago');
      expect(receitaAtualizadaResponse.data.dataPagamento).toBeDefined();

      // ========================================
      // ETAPA 7: Verificar atualização final do Dashboard
      // ========================================
      console.log('📊 Etapa 7: Verificando atualização final do Dashboard...');
      
      // Aguardar processamento
      await waitFor(1000);
      
      const dashboardFinalResponse = await apiClient.get('/dashboard/stats');
      expect(dashboardFinalResponse.status).toBe(200);
      
      const statsFinais = dashboardFinalResponse.data;
      
      // Após marcar a receita como paga:
      // - Total A Receber deve diminuir
      // - Total Receitas deve aumentar
      // - Total A Pagar deve permanecer igual (despesa ainda pendente)
      
      const expectedAReceberFinal = expectedAReceber - receitaData.valor;
      const expectedReceitasFinal = (statsIniciais.totalReceitas || 0) + receitaData.valor;
      
      expect(statsFinais.totalAReceber).toBeCloseTo(expectedAReceberFinal, 2);
      expect(statsFinais.totalReceitas).toBeCloseTo(expectedReceitasFinal, 2);
      expect(statsFinais.totalAPagar).toBeCloseTo(expectedAPagar, 2); // Deve permanecer igual
      
      console.log('✅ Dashboard final atualizado corretamente');
      console.log(`   - A Receber: R$ ${statsAtualizadas.totalAReceber} → R$ ${statsFinais.totalAReceber}`);
      console.log(`   - Total Receitas: R$ ${statsIniciais.totalReceitas || 0} → R$ ${statsFinais.totalReceitas}`);
      console.log(`   - A Pagar: R$ ${statsFinais.totalAPagar} (inalterado)`);

      // ========================================
      // ETAPA 8: Validar histórico e relatórios
      // ========================================
      console.log('📋 Etapa 8: Validando histórico e relatórios...');
      
      // Buscar relatório financeiro do processo
      const relatorioProcessoResponse = await apiClient.get(`/processos/${processoId}/financeiro`);
      expect(relatorioProcessoResponse.status).toBe(200);
      
      const relatorio = relatorioProcessoResponse.data;
      expect(relatorio).toHaveProperty('totalReceitas');
      expect(relatorio).toHaveProperty('totalDespesas');
      expect(relatorio).toHaveProperty('saldoLiquido');
      expect(relatorio).toHaveProperty('lancamentos');
      
      expect(relatorio.totalReceitas).toBe(receitaData.valor);
      expect(relatorio.totalDespesas).toBe(despesaData.valor);
      expect(relatorio.saldoLiquido).toBe(receitaData.valor - despesaData.valor);
      expect(relatorio.lancamentos.length).toBe(2);
      
      // Verificar se o lançamento pago está marcado corretamente no relatório
      const receitaNoRelatorio = relatorio.lancamentos.find((l: any) => l.id === receitaId);
      const despesaNoRelatorio = relatorio.lancamentos.find((l: any) => l.id === despesaId);
      
      expect(receitaNoRelatorio.status).toBe('Pago');
      expect(despesaNoRelatorio.status).toBe('Pendente');
      
      console.log('✅ Relatório financeiro validado');
      console.log(`   - Total Receitas: R$ ${relatorio.totalReceitas}`);
      console.log(`   - Total Despesas: R$ ${relatorio.totalDespesas}`);
      console.log(`   - Saldo Líquido: R$ ${relatorio.saldoLiquido}`);

      // ========================================
      // ETAPA 9: Testar funcionalidade "Desmarcar como Pago"
      // ========================================
      console.log('↩️ Etapa 9: Testando funcionalidade Desmarcar como Pago...');
      
      const desmarcarPagaResponse = await apiClient.patch(`/lancamentos/${receitaId}/desmarcar-pago`, {
        status: 'Pendente',
        observacoes: 'Pagamento cancelado - estorno solicitado'
      });
      
      expect(desmarcarPagaResponse.status).toBe(200);
      expect(desmarcarPagaResponse.data.status).toBe('Pendente');
      expect(desmarcarPagaResponse.data.dataPagamento).toBeNull();
      
      console.log('✅ Receita desmarcada como paga');
      
      // Verificar se o dashboard foi atualizado novamente
      await waitFor(1000);
      const dashboardRevertidoResponse = await apiClient.get('/dashboard/stats');
      const statsRevertidas = dashboardRevertidoResponse.data;
      
      // Valores devem voltar ao estado anterior
      expect(statsRevertidas.totalAReceber).toBeCloseTo(expectedAReceber, 2);
      expect(statsRevertidas.totalReceitas).toBeCloseTo(statsIniciais.totalReceitas || 0, 2);
      
      console.log('✅ Dashboard revertido corretamente após desmarcar pagamento');

      // ========================================
      // RESULTADO FINAL
      // ========================================
      console.log('🎉 FLUXO DE GESTÃO FINANCEIRA CONCLUÍDO COM SUCESSO!');
      console.log('📋 Resumo das operações realizadas:');
      console.log(`   ✓ Processo localizado e acessado`);
      console.log(`   ✓ Estado inicial do Dashboard capturado`);
      console.log(`   ✓ Receita (Honorários) criada: R$ ${receitaData.valor}`);
      console.log(`   ✓ Despesa (Custas) criada: R$ ${despesaData.valor}`);
      console.log(`   ✓ Dashboard atualizado com valores A Receber/A Pagar`);
      console.log(`   ✓ Receita marcada como Paga`);
      console.log(`   ✓ Dashboard atualizado após pagamento`);
      console.log(`   ✓ Relatório financeiro gerado e validado`);
      console.log(`   ✓ Funcionalidade Desmarcar como Pago testada`);
      console.log(`   ✓ Integridade dos dados mantida em todas as operações`);
      
    }, 90000); // Timeout de 90 segundos para o teste completo
  });

  describe('Cenários de Erro na Gestão Financeira', () => {
    it('deve tratar erro ao criar lançamento com dados inválidos', async () => {
      const lancamentoInvalido = {
        descricao: '', // Descrição vazia
        valor: -100, // Valor negativo
        tipo: 'TipoInvalido', // Tipo inválido
        processoId: processoId
      };

      try {
        await apiClient.post('/lancamentos', lancamentoInvalido);
        fail('Deveria ter falhado com dados inválidos');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        console.log('✅ Validação de lançamento inválido funcionando');
      }
    });

    it('deve tratar erro ao marcar como pago lançamento inexistente', async () => {
      try {
        await apiClient.patch('/lancamentos/99999/marcar-pago', {
          status: 'Pago'
        });
        fail('Deveria ter falhado com lançamento inexistente');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        console.log('✅ Validação de lançamento inexistente funcionando');
      }
    });

    it('deve manter consistência do dashboard após operações com erro', async () => {
      // Capturar estado inicial
      const dashboardAntes = await apiClient.get('/dashboard/stats');
      
      // Tentar criar lançamento inválido
      try {
        await apiClient.post('/lancamentos', {
          descricao: 'Teste',
          valor: 'valor-invalido', // Valor não numérico
          tipo: 'Receita',
          processoId: processoId
        });
        fail('Deveria ter falhado');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
      
      // Verificar se o dashboard não foi alterado
      const dashboardDepois = await apiClient.get('/dashboard/stats');
      expect(dashboardDepois.data.totalReceitas).toBe(dashboardAntes.data.totalReceitas);
      expect(dashboardDepois.data.totalDespesas).toBe(dashboardAntes.data.totalDespesas);
      
      console.log('✅ Consistência do dashboard mantida após erro');
    });
  });
});