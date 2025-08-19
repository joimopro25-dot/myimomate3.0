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
  ResponsiveTable,
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

// Ícones - CORRIGIDO: CheckIcon em vez de CheckSquareIcon
import {
  UserGroupIcon,
  UsersIcon,
  EyeIcon,
  BriefcaseIcon,
  CurrencyEuroIcon,
  CheckIcon,
  CalendarIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { userProfile } = useAuth();
  const { theme, isDark, currentTheme } = useTheme();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const [currentTime, setCurrentTime] = useState(new Date());

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
      value: (typeof getDealStats === 'function') ? 
        (getDealStats()?.totalValue ? `€${getDealStats().totalValue.toLocaleString()}` : '€0') : '€0',
      trend: '+20%',
      isPositive: true
    },
    tasks: {
      total: tasks?.length || 0,
      pending: tasks?.filter(t => t.status === 'pending')?.length || 0,
      urgent: tasks?.filter(t => t.priority === 'alta')?.length || 0,
      trend: '+5%',
      isPositive: true
    }
  };

  // Atualizar relógio
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Dados simulados para completar a interface
  const recentTasks = [
    {
      id: 1,
      title: 'Ligar para João Silva',
      type: 'call',
      priority: 'alta',
      dueDate: new Date(),
      client: 'João Silva'
    },
    {
      id: 2,
      title: 'Preparar proposta comercial',
      type: 'document',
      priority: 'média',
      dueDate: new Date(Date.now() + 86400000),
      client: 'Maria Santos'
    },
    {
      id: 3,
      title: 'Follow-up reunião',
      type: 'follow-up',
      priority: 'baixa',
      dueDate: new Date(Date.now() + 172800000),
      client: 'Pedro Costa'
    }
  ];

  const recentVisits = [
    {
      id: 1,
      property: 'Apartamento T2 - Lisboa',
      client: 'Ana Ferreira',
      date: new Date(),
      status: 'confirmada'
    },
    {
      id: 2,
      property: 'Moradia T4 - Porto',
      client: 'Carlos Mendes',
      date: new Date(Date.now() + 86400000),
      status: 'pendente'
    }
  ];

  // Funções auxiliares
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmada': return 'text-green-500';
      case 'pendente': return 'text-yellow-500';
      case 'cancelada': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  // Dados das métricas para o novo sistema
  const metricsData = [
    {
      title: 'Leads',
      value: realMetrics.leads.total.toString(),
      change: realMetrics.leads.trend,
      icon: UserGroupIcon,
      color: 'blue',
      clickable: true,
      onClick: () => navigate('/leads')
    },
    {
      title: 'Clientes',
      value: realMetrics.clients.total.toString(),
      change: realMetrics.clients.trend,
      icon: UsersIcon,
      color: 'green',
      clickable: true,
      onClick: () => navigate('/clients')
    },
    {
      title: 'Visitas',
      value: realMetrics.visits.total.toString(),
      change: realMetrics.visits.trend,
      icon: EyeIcon,
      color: 'yellow',
      clickable: true,
      onClick: () => navigate('/visits')
    },
    {
      title: 'Negócios',
      value: realMetrics.deals.value,
      change: realMetrics.deals.trend,
      icon: CurrencyEuroIcon,
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
          <PlusIcon className="w-4 h-4 mr-2 inline" />
          {isMobile ? 'Lead' : 'Novo Lead'}
        </Link>
      </ThemedButton>
      <ThemedButton variant="primary" size="sm">
        <Link to="/visits/schedule">
          <CalendarIcon className="w-4 h-4 mr-2 inline" />
          {isMobile ? 'Visita' : 'Agendar Visita'}
        </Link>
      </ThemedButton>
    </PageActions>
  );

  // Preparar dados das tarefas para tabela responsiva
  const taskColumns = [
    { header: 'Tarefa', accessor: row => (
      <div className="flex items-center space-x-2">
        <span className="text-lg">{getTaskIcon(row.type)}</span>
        <span>{row.title}</span>
      </div>
    )},
    { header: 'Prioridade', accessor: row => (
      <ThemedBadge 
        variant="secondary" 
        size="xs"
        className={getPriorityColor(row.priority)}
      >
        {row.priority}
      </ThemedBadge>
    )},
    { header: 'Data', accessor: row => 
      row.dueDate ? row.dueDate.toLocaleDateString('pt-PT') : 'Sem data'
    }
  ];

  const visitColumns = [
    { header: 'Propriedade', accessor: 'property' },
    { header: 'Cliente', accessor: 'client' },
    { header: 'Status', accessor: row => (
      <ThemedBadge 
        variant="secondary" 
        size="xs"
        className={getStatusColor(row.status)}
      >
        {row.status}
      </ThemedBadge>
    )}
  ];

  return (
    <ResponsiveLayout 
      title="Dashboard" 
      actions={headerActions}
    >
      <div className="space-y-6">
        
        {/* Welcome Section */}
        <ResponsiveCard className="text-center">
          <ThemedGradient className="p-6 rounded-lg">
            <ThemedHeading level={2} className="mb-2">
              Bem-vindo de volta, {userProfile?.personalInfo?.firstName || 'Utilizador'}! 👋
            </ThemedHeading>
            <ThemedText className="mb-4">
              {currentTime.toLocaleDateString('pt-PT', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} • {currentTime.toLocaleTimeString('pt-PT', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </ThemedText>
            <p className="text-white/90">
              Você tem {realMetrics.tasks.pending} tarefas pendentes e {realMetrics.visits.today} visitas hoje.
            </p>
          </ThemedGradient>
        </ResponsiveCard>

        {/* Métricas Principais */}
        <MetricsGrid metrics={metricsData} />

        {/* Grid de Conteúdo */}
        <ResponsiveGrid cols={{ mobile: 1, desktop: 2 }}>
          
          {/* Tarefas Recentes */}
          <ResponsiveCard title="Tarefas Urgentes" subtitle="Suas próximas atividades">
            <ResponsiveTable 
              columns={taskColumns}
              data={recentTasks}
              emptyMessage="Nenhuma tarefa urgente"
              onRowClick={(task) => navigate(`/tasks/${task.id}`)}
            />
            <div className="mt-4 text-center">
              <ThemedButton 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/tasks')}
              >
                Ver todas as tarefas
              </ThemedButton>
            </div>
          </ResponsiveCard>

          {/* Visitas de Hoje */}
          <ResponsiveCard title="Visitas Próximas" subtitle="Agendamentos confirmados">
            <ResponsiveTable 
              columns={visitColumns}
              data={recentVisits}
              emptyMessage="Nenhuma visita agendada"
              onRowClick={(visit) => navigate(`/visits/${visit.id}`)}
            />
            <div className="mt-4 text-center">
              <ThemedButton 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/visits')}
              >
                Ver todas as visitas
              </ThemedButton>
            </div>
          </ResponsiveCard>

        </ResponsiveGrid>

        {/* Ações Rápidas */}
        <ResponsiveCard title="Ações Rápidas">
          <ResponsiveGrid cols={{ mobile: 2, tablet: 4 }}>
            
            <ThemedButton 
              variant="outline" 
              className="h-20"
              onClick={() => navigate('/leads/new')}
            >
              <div className="text-center">
                <UserGroupIcon className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">Novo Lead</span>
              </div>
            </ThemedButton>

            <ThemedButton 
              variant="outline" 
              className="h-20"
              onClick={() => navigate('/visits/schedule')}
            >
              <div className="text-center">
                <CalendarIcon className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">Agendar Visita</span>
              </div>
            </ThemedButton>

            <ThemedButton 
              variant="outline" 
              className="h-20"
              onClick={() => navigate('/tasks/new')}
            >
              <div className="text-center">
                <CheckIcon className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">Nova Tarefa</span>
              </div>
            </ThemedButton>

            <ThemedButton 
              variant="outline" 
              className="h-20"
              onClick={() => navigate('/clients/new')}
            >
              <div className="text-center">
                <UsersIcon className="w-6 h-6 mx-auto mb-1" />
                <span className="text-sm">Novo Cliente</span>
              </div>
            </ThemedButton>

          </ResponsiveGrid>
        </ResponsiveCard>

      </div>
    </ResponsiveLayout>
  );
};

export default DashboardPage;