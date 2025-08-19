// src/pages/dashboard/DashboardPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ThemedButton, 
  ThemedCard, 
  ThemedHeading, 
  ThemedText,
  ThemedGradient,
  ThemedBadge
} from '../../components/common/ThemedComponents';

// Importar o novo layout responsivo
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';
import { 
  ResponsiveGrid, 
  ResponsiveCard, 
  MetricsGrid, 
  MetricCard,
  PageActions,
  useResponsive 
} from '../../components/layout/ResponsiveGrid';

// Hooks para dados reais
import useLeads from '../../hooks/useLeads';
import useClients from '../../hooks/useClients';
import useVisits from '../../hooks/useVisits';
import useOpportunities from '../../hooks/useOpportunities';
import useDeals from '../../hooks/useDeals';
import useTasks from '../../hooks/useTasks';

const DashboardPage = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [currentTime, setCurrentTime] = useState(new Date());

  // DEBUG: Verificação ultra defensiva do tema
  console.log('🔍 DEBUG: Verificando useTheme...');
  const themeData = useTheme();
  console.log('🔍 DEBUG: themeData recebido:', themeData);

  // Tema ultra seguro com debugging
  const currentTheme = (() => {
    try {
      console.log('🔍 DEBUG: themeData?.currentTheme:', themeData?.currentTheme);
      
      if (themeData && themeData.currentTheme && themeData.currentTheme.primary && themeData.currentTheme.primary.main) {
        console.log('✅ DEBUG: Tema válido encontrado');
        return themeData.currentTheme;
      } else {
        console.log('⚠️ DEBUG: Usando tema fallback');
        return {
          primary: { main: '#3b82f6' },
          text: { 
            primary: '#1f2937', 
            secondary: '#6b7280',
            muted: '#9ca3af'
          },
          background: { 
            primary: '#ffffff', 
            secondary: '#f9fafb' 
          },
          border: { light: '#e5e7eb' },
          sidebar: { 
            background: '#ffffff', 
            hover: '#f3f4f6' 
          }
        };
      }
    } catch (error) {
      console.error('🚨 DEBUG: Erro ao processar tema:', error);
      return {
        primary: { main: '#3b82f6' },
        text: { 
          primary: '#1f2937', 
          secondary: '#6b7280',
          muted: '#9ca3af'
        },
        background: { 
          primary: '#ffffff', 
          secondary: '#f9fafb' 
        },
        border: { light: '#e5e7eb' },
        sidebar: { 
          background: '#ffffff', 
          hover: '#f3f4f6' 
        }
      };
    }
  })();

  console.log('🔍 DEBUG: currentTheme final:', currentTheme);
  console.log('🔍 DEBUG: currentTheme.primary:', currentTheme.primary);
  console.log('🔍 DEBUG: currentTheme.primary.main:', currentTheme.primary.main);

  // Funções de tema com fallback
  const theme = themeData?.theme || 'modern';
  const isDark = themeData?.isDark || (() => false);

  // HOOKS PARA DADOS REAIS
  const { leads, getLeadStats } = useLeads();
  const { clients, getClientStats } = useClients();
  const { visitStats } = useVisits();
  const { opportunities, getOpportunityStats } = useOpportunities();
  const { deals, getDealStats } = useDeals();
  const { tasks, getTaskStats } = useTasks();

  // CALCULAR MÉTRICAS REAIS - VERSÃO SEGURA
  const realMetrics = {
    leads: {
      total: leads?.length || 0,
      thisMonth: (typeof getLeadStats === 'function') ? (getLeadStats()?.thisMonth || 0) : 0,
      trend: '+15%',
      isPositive: true
    },
    clients: {
      total: clients?.length || 0,
      thisMonth: (typeof getClientStats === 'function') ? (getClientStats()?.thisMonth || 0) : 0,
      trend: '+12%',
      isPositive: true
    },
    visits: {
      total: visitStats?.total || 0,
      today: visitStats?.today || 0,
      trend: '+8%',
      isPositive: true
    },
    deals: {
      total: deals?.length || 0,
      thisMonth: (typeof getDealStats === 'function') ? (getDealStats()?.thisMonth || 0) : 0,
      value: (typeof getDealStats === 'function') ? `€${(getDealStats()?.totalValue || 0).toLocaleString()}` : '€0',
      trend: '+22%',
      isPositive: true
    }
  };

  // Atualizar hora a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return isDark() ? 'text-red-400' : 'text-red-600';
      case 'média': return isDark() ? 'text-yellow-400' : 'text-yellow-600';
      case 'baixa': return isDark() ? 'text-green-400' : 'text-green-600';
      default: return isDark() ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'call': return '📞';
      case 'document': return '📄';
      case 'follow-up': return '🔄';
      case 'visit': return '🏠';
      default: return '📝';
    }
  };

  // Função helper ultra segura para acessar cor
  const getSafeColor = (path, fallback = '#3b82f6') => {
    try {
      console.log(`🔍 DEBUG: Acessando ${path}...`);
      
      if (path === 'primary.main') {
        const result = currentTheme?.primary?.main || fallback;
        console.log(`🔍 DEBUG: ${path} = ${result}`);
        return result;
      }
      
      if (path === 'text.primary') {
        const result = currentTheme?.text?.primary || '#1f2937';
        console.log(`🔍 DEBUG: ${path} = ${result}`);
        return result;
      }
      
      if (path === 'text.secondary') {
        const result = currentTheme?.text?.secondary || '#6b7280';
        console.log(`🔍 DEBUG: ${path} = ${result}`);
        return result;
      }
      
      if (path === 'background.primary') {
        const result = currentTheme?.background?.primary || '#ffffff';
        console.log(`🔍 DEBUG: ${path} = ${result}`);
        return result;
      }
      
      if (path === 'background.secondary') {
        const result = currentTheme?.background?.secondary || '#f9fafb';
        console.log(`🔍 DEBUG: ${path} = ${result}`);
        return result;
      }
      
      if (path === 'border.light') {
        const result = currentTheme?.border?.light || '#e5e7eb';
        console.log(`🔍 DEBUG: ${path} = ${result}`);
        return result;
      }
      
      return fallback;
    } catch (error) {
      console.error(`🚨 DEBUG: Erro ao acessar ${path}:`, error);
      return fallback;
    }
  };

  // Dados das métricas para o novo sistema
  const metricsData = [
    {
      title: 'Leads',
      value: realMetrics.leads.total.toString(),
      change: realMetrics.leads.trend,
      color: 'blue',
      clickable: true,
      onClick: () => navigate('/leads')
    },
    {
      title: 'Clientes',
      value: realMetrics.clients.total.toString(),
      change: realMetrics.clients.trend,
      color: 'green',
      clickable: true,
      onClick: () => navigate('/clients')
    },
    {
      title: 'Visitas',
      value: realMetrics.visits.total.toString(),
      change: realMetrics.visits.trend,
      color: 'yellow',
      clickable: true,
      onClick: () => navigate('/visits')
    },
    {
      title: 'Negócios',
      value: realMetrics.deals.value,
      change: realMetrics.deals.trend,
      color: 'purple',
      clickable: true,
      onClick: () => navigate('/deals')
    }
  ];

  // Ações do header
  const headerActions = (
    <PageActions>
      <ThemedButton variant="secondary" size="sm">
        <Link to="/leads/new">
          {isMobile ? 'Lead' : '+ Novo Lead'}
        </Link>
      </ThemedButton>
      <ThemedButton variant="primary" size="sm">
        <Link to="/visits/schedule">
          {isMobile ? 'Visita' : '+ Agendar Visita'}
        </Link>
      </ThemedButton>
    </PageActions>
  );

  return (
    <ResponsiveLayout 
      title={`${getGreeting()}, ${userProfile?.name?.split(' ')[0] || 'Consultor'}!`}
      actions={headerActions}
    >
      
      {/* Subtitle com data */}
      <div className="mb-6">
        <ThemedText className={`${isDark() ? 'text-gray-300' : 'text-gray-600'}`}>
          Aqui está o resumo da sua atividade hoje, {currentTime.toLocaleDateString('pt-PT', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long' 
          })}.
        </ThemedText>
      </div>

      {/* Métricas Principais */}
      <MetricsGrid metrics={metricsData} />

      {/* Grid de Conteúdo Principal */}
      <ResponsiveGrid 
        cols={{ mobile: 1, tablet: 1, desktop: 3 }}
        gap={6}
        className="mb-8"
      >
        
        {/* Tarefas Pendentes - 2 colunas no desktop */}
        <div className="lg:col-span-2">
          <ResponsiveCard 
            title="Tarefas Pendentes"
            subtitle={`${tasks?.length || 0} tarefas em aberto`}
            actions={
              <Link 
                to="/tasks"
                style={{ color: getSafeColor('primary.main') }}
                className="text-sm font-medium hover:underline"
              >
                Ver todas
              </Link>
            }
          >
            {tasks && tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.slice(0, 4).map((task) => (
                  <div key={task.id} className={`
                    flex items-start space-x-3 p-3 rounded-lg transition-colors cursor-pointer
                    ${isDark() ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                  `}>
                    <span className="text-lg">{getTaskIcon(task.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p style={{ color: getSafeColor('text.primary') }} 
                         className="text-sm font-medium">
                        {task.title}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <ThemedBadge 
                          variant="secondary" 
                          size="xs"
                          className={getPriorityColor(task.priority)}
                        >
                          {task.priority}
                        </ThemedBadge>
                        <ThemedText size="xs" style={{ color: getSafeColor('text.secondary') }}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-PT') : 'Sem data'}
                        </ThemedText>
                      </div>
                    </div>
                    <button className={`
                      p-1 rounded transition-colors
                      ${isDark() ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}
                    `}>
                      <span className="text-lg">✓</span>
                    </button>
                  </div>
                ))}
                
                <div className="mt-4 pt-4 border-t" style={{ borderColor: getSafeColor('border.light') }}>
                  <ThemedButton variant="secondary" size="sm" className="w-full">
                    <Link to="/tasks/new">+ Nova Tarefa</Link>
                  </ThemedButton>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-4 block">✅</span>
                <p style={{ color: getSafeColor('text.secondary') }} className="text-sm">
                  Nenhuma tarefa pendente
                </p>
              </div>
            )}
          </ResponsiveCard>
        </div>

        {/* Próximas Visitas - 1 coluna */}
        <div className="lg:col-span-1">
          <ResponsiveCard 
            title="Próximas Visitas"
            subtitle={`${visitStats?.upcoming || 0} agendadas`}
            actions={
              <Link 
                to="/visits"
                style={{ color: getSafeColor('primary.main') }}
                className="text-sm font-medium hover:underline"
              >
                Ver todas
              </Link>
            }
          >
            <div className="space-y-4">
              {visitStats && visitStats.upcoming > 0 ? (
                <div className="text-center py-4">
                  <span className="text-2xl">📅</span>
                  <p style={{ color: getSafeColor('text.primary') }} className="mt-2 text-sm font-medium">
                    {visitStats.upcoming} visitas agendadas
                  </p>
                  <p style={{ color: getSafeColor('text.secondary') }} className="text-xs">
                    {visitStats.today} para hoje
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">📅</span>
                  <p style={{ color: getSafeColor('text.secondary') }} className="text-sm">
                    Nenhuma visita agendada
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t" style={{ borderColor: getSafeColor('border.light') }}>
              <ThemedButton variant="primary" size="sm" className="w-full">
                <Link to="/visits/schedule">+ Agendar Visita</Link>
              </ThemedButton>
            </div>
          </ResponsiveCard>
        </div>
      </ResponsiveGrid>

      {/* Performance do Mês */}
      <ResponsiveCard 
        title="Performance do Mês"
        subtitle="Vendas e conversões"
        className="mb-8"
      >
        <ResponsiveGrid cols={{ mobile: 2, tablet: 4, desktop: 4 }} gap={4}>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: getSafeColor('background.secondary') }}>
            <div className="flex items-center justify-center mb-2">
              <span className="text-lg mr-1">📈</span>
              <span style={{ color: getSafeColor('text.primary') }} className="text-2xl font-bold">
                {realMetrics.deals.value}
              </span>
            </div>
            <p style={{ color: getSafeColor('text.secondary') }} className="text-sm">
              Vendas este mês
            </p>
          </div>
          
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: getSafeColor('background.secondary') }}>
            <div className="flex items-center justify-center mb-2">
              <span className="text-lg mr-1">📊</span>
              <span style={{ color: getSafeColor('text.primary') }} className="text-2xl font-bold">
                23%
              </span>
            </div>
            <p style={{ color: getSafeColor('text.secondary') }} className="text-sm">
              Taxa conversão
            </p>
          </div>

          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: getSafeColor('background.secondary') }}>
            <div className="flex items-center justify-center mb-2">
              <span className="text-lg mr-1">👥</span>
              <span style={{ color: getSafeColor('text.primary') }} className="text-2xl font-bold">
                {realMetrics.leads.thisMonth}
              </span>
            </div>
            <p style={{ color: getSafeColor('text.secondary') }} className="text-sm">
              Leads este mês
            </p>
          </div>

          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: getSafeColor('background.secondary') }}>
            <div className="flex items-center justify-center mb-2">
              <span className="text-lg mr-1">💰</span>
              <span style={{ color: getSafeColor('text.primary') }} className="text-2xl font-bold">
                {realMetrics.deals.total}
              </span>
            </div>
            <p style={{ color: getSafeColor('text.secondary') }} className="text-sm">
              Negócios ativos
            </p>
          </div>
        </ResponsiveGrid>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/reports')}
            style={{ color: getSafeColor('primary.main') }}
            className="text-sm font-medium hover:underline"
          >
            Ver relatório completo →
          </button>
        </div>
      </ResponsiveCard>

      {/* Ações Rápidas */}
      <ResponsiveCard 
        title="Ações Rápidas"
        subtitle="Acesso direto às funcionalidades principais"
      >
        <ResponsiveGrid cols={{ mobile: 2, tablet: 4, desktop: 4 }} gap={4}>
          
          <Link 
            to="/leads/new"
            className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:border-solid hover:shadow-md text-center"
            style={{ 
              borderColor: getSafeColor('border.light'),
              backgroundColor: getSafeColor('background.primary')
            }}
          >
            <ThemedGradient type="primary" className="w-12 h-12 rounded-xl flex items-center justify-center mb-3">
              <span className="text-white text-xl">📋</span>
            </ThemedGradient>
            <span style={{ color: getSafeColor('text.primary') }} className="font-medium text-sm mb-1">
              Novo Lead
            </span>
            <span style={{ color: getSafeColor('text.secondary') }} className="text-xs">
              Adicionar prospect
            </span>
          </Link>
          
          <Link 
            to="/clients/new"
            className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:border-solid hover:shadow-md text-center"
            style={{ 
              borderColor: getSafeColor('border.light'),
              backgroundColor: getSafeColor('background.primary')
            }}
          >
            <ThemedGradient type="secondary" className="w-12 h-12 rounded-xl flex items-center justify-center mb-3">
              <span className="text-white text-xl">🤝</span>
            </ThemedGradient>
            <span style={{ color: getSafeColor('text.primary') }} className="font-medium text-sm mb-1">
              Novo Cliente
            </span>
            <span style={{ color: getSafeColor('text.secondary') }} className="text-xs">
              Registar cliente
            </span>
          </Link>
          
          <Link 
            to="/visits/schedule"
            className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:border-solid hover:shadow-md text-center"
            style={{ 
              borderColor: getSafeColor('border.light'),
              backgroundColor: getSafeColor('background.primary')
            }}
          >
            <ThemedGradient type="accent" className="w-12 h-12 rounded-xl flex items-center justify-center mb-3">
              <span className="text-white text-xl">📅</span>
            </ThemedGradient>
            <span style={{ color: getSafeColor('text.primary') }} className="font-medium text-sm mb-1">
              Agendar Visita
            </span>
            <span style={{ color: getSafeColor('text.secondary') }} className="text-xs">
              Marcar reunião
            </span>
          </Link>
          
          <Link 
            to="/deals/new"
            className="flex flex-col items-center p-4 rounded-lg border-2 border-dashed transition-all duration-200 hover:border-solid hover:shadow-md text-center"
            style={{ 
              borderColor: getSafeColor('border.light'),
              backgroundColor: getSafeColor('background.primary')
            }}
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: '#8b5cf6' }}
            >
              <span className="text-white text-xl">💼</span>
            </div>
            <span style={{ color: getSafeColor('text.primary') }} className="font-medium text-sm mb-1">
              Novo Negócio
            </span>
            <span style={{ color: getSafeColor('text.secondary') }} className="text-xs">
              Pipeline vendas
            </span>
          </Link>
        </ResponsiveGrid>
      </ResponsiveCard>
    </ResponsiveLayout>
  );
};

export default DashboardPage;