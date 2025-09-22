import { apiClient, TEST_CONFIG } from '../setup/test-setup';

describe('Testes de Integração - Autenticação', () => {
  let testUserId: string;

  beforeAll(async () => {
    // Criar usuário de teste antes de executar os testes
    try {
      const registerResponse = await apiClient.post('/auth/registrar', {
        nome: TEST_CONFIG.DEFAULT_USER.nome || 'Usuário Teste',
        email: TEST_CONFIG.DEFAULT_USER.email,
        senha: TEST_CONFIG.DEFAULT_USER.senha,
        role: 'User'
      });
      testUserId = registerResponse.data.id;
      console.log('✅ Usuário de teste criado com sucesso');
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('já existe')) {
        console.log('ℹ️ Usuário de teste já existe, continuando...');
      } else {
        console.error('❌ Erro ao criar usuário de teste:', error.response?.data || error.message);
        throw error;
      }
    }
  });

  afterAll(async () => {
    // Cleanup: remover usuário de teste se foi criado
    if (testUserId) {
      try {
        // Assumindo que existe um endpoint para deletar usuário (implementar se necessário)
        // await apiClient.delete(`/usuarios/${testUserId}`);
        console.log('🧹 Cleanup do usuário de teste concluído');
      } catch (error) {
        console.log('ℹ️ Erro no cleanup (ignorado):', error);
      }
    }
  });
  
  describe('POST /api/auth/login', () => {
    it('deve autenticar usuário válido e retornar token JWT', async () => {
      const loginData = {
        email: TEST_CONFIG.DEFAULT_USER.email,
        senha: TEST_CONFIG.DEFAULT_USER.senha
      };

      const response = await apiClient.post('/auth/login', loginData);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(response.data).toHaveProperty('usuario');
      expect(response.data.usuario).toHaveProperty('email', loginData.email);
      expect(typeof response.data.token).toBe('string');
      expect(response.data.token.length).toBeGreaterThan(0);
    });

    it('deve rejeitar usuário com credenciais inválidas', async () => {
      const loginData = {
        email: 'usuario@inexistente.com',
        senha: 'senhaerrada'
      };

      try {
        await apiClient.post('/auth/login', loginData);
        fail('Deveria ter lançado erro para credenciais inválidas');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
        expect(error.response.data).toHaveProperty('message');
      }
    });

    it('deve validar campos obrigatórios', async () => {
      const testCases = [
        { email: '', senha: 'senha123' },
        { email: 'email@teste.com', senha: '' },
        { email: '', senha: '' }
      ];

      for (const testCase of testCases) {
        try {
          await apiClient.post('/auth/login', testCase);
          fail(`Deveria ter validado campos obrigatórios para: ${JSON.stringify(testCase)}`);
        } catch (error: any) {
          expect(error.response.status).toBe(400);
        }
      }
    });

    it('deve validar formato de email', async () => {
      const loginData = {
        email: 'email-invalido',
        password: 'senha123'
      };

      try {
        await apiClient.post('/auth/login', loginData);
        fail('Deveria ter validado formato do email');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('Validação de Token JWT', () => {
    let authToken: string;

    beforeEach(async () => {
      const response = await apiClient.post('/auth/login', TEST_CONFIG.DEFAULT_USER);
      authToken = response.data.token;
    });

    it('deve aceitar requisições com token válido', async () => {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      const response = await apiClient.get('/dashboard/stats');
      expect(response.status).toBe(200);
    });

    it('deve rejeitar requisições sem token', async () => {
      delete apiClient.defaults.headers.common['Authorization'];
      
      try {
        await apiClient.get('/dashboard/stats');
        fail('Deveria ter rejeitado requisição sem token');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('deve rejeitar requisições com token inválido', async () => {
      apiClient.defaults.headers.common['Authorization'] = 'Bearer token-invalido';
      
      try {
        await apiClient.get('/dashboard/stats');
        fail('Deveria ter rejeitado token inválido');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    afterEach(() => {
      delete apiClient.defaults.headers.common['Authorization'];
    });
  });
});