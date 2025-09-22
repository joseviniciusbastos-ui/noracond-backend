import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Gavel, 
  CircleDollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Loader2 
} from 'lucide-react';
import dashboardService from '../services/dashboardService';
import type { DashboardStats } from '../services/dashboardService';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'indigo';
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    red: 'bg-red-50 text-red-600 border-red-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const LoadingCard: React.FC = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-center h-20">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  </div>
);

const ErrorCard: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
    <div className="text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar dados</h3>
      <p className="text-sm text-gray-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
      >
        Tentar novamente
      </button>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Tenta buscar dados reais do backend
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.warn('Erro ao buscar dados reais, usando dados mockados:', err.message);
      
      // Em caso de erro, usa dados mockados para desenvolvimento
      const mockData = dashboardService.getMockDashboardStats();
      setStats(mockData);
      setError('Usando dados de demonstração (backend indisponível)');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Carregando estatísticas...</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <LoadingCard key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Visão geral do sistema</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2 lg:col-span-3">
            <ErrorCard 
              message={error || 'Não foi possível carregar os dados do dashboard'}
              onRetry={loadDashboardStats}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema NoraCOND</p>
        {error && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Clientes"
          value={stats.totalClientes}
          icon={<Users className="h-6 w-6" />}
          color="blue"
          subtitle={`${stats.clientesAtivos} ativos`}
        />
        
        <StatCard
          title="Total de Processos"
          value={stats.totalProcessos}
          icon={<Gavel className="h-6 w-6" />}
          color="purple"
          subtitle={`${stats.processosAtivos} em andamento`}
        />
        
        <StatCard
          title="Receita Total"
          value={formatCurrency(stats.receitaTotal)}
          icon={<CircleDollarSign className="h-6 w-6" />}
          color="green"
          subtitle="Acumulado"
        />
        
        <StatCard
          title="Receita Mensal"
          value={formatCurrency(stats.receitaMensal)}
          icon={<TrendingUp className="h-6 w-6" />}
          color="indigo"
          subtitle="Mês atual"
        />
        
        <StatCard
          title="Processos Ativos"
          value={stats.processosAtivos}
          icon={<Clock className="h-6 w-6" />}
          color="yellow"
          subtitle="Em andamento"
        />
        
        <StatCard
          title="Processos Finalizados"
          value={stats.processosFinalizados}
          icon={<CheckCircle className="h-6 w-6" />}
          color="green"
          subtitle="Concluídos"
        />
        
        <StatCard
          title="Clientes Ativos"
          value={stats.clientesAtivos}
          icon={<Users className="h-6 w-6" />}
          color="blue"
          subtitle="Com processos ativos"
        />
        
        <StatCard
          title="Processos Pendentes"
          value={stats.processosPendentes}
          icon={<AlertCircle className="h-6 w-6" />}
          color="red"
          subtitle="Requerem atenção"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Users className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="font-medium text-gray-900">Gerenciar Clientes</h3>
            <p className="text-sm text-gray-600">Visualizar e editar informações dos clientes</p>
          </button>
          
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <Gavel className="h-8 w-8 text-purple-600 mb-2" />
            <h3 className="font-medium text-gray-900">Processos</h3>
            <p className="text-sm text-gray-600">Acompanhar andamento dos processos</p>
          </button>
          
          <button className="p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <CircleDollarSign className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="font-medium text-gray-900">Financeiro</h3>
            <p className="text-sm text-gray-600">Controle financeiro e relatórios</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;