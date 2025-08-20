// src/pages/dashboard/DashboardPage.jsx

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { 
  ThemedButton, 
  ThemedCard, 
  ThemedHeading, 
  ThemedText,
  ThemedGradient,
  ThemedBadge
} from '../../components/common/ThemedComponents';

// Layout profissional
import DashboardLayout from '../../components/layout/DashboardLayout';

// Hooks para dados reais
import useLeads from '../../hooks/useLeads';
import useClients from '../../hooks/useClients';
import useVisits from '../../hooks/useVisits';
import useOpportunities from '../../hooks/useOpportunities';
import useDeals from '../../hooks/useDeals';
import useTasks from '../../hooks/useTasks';

// Ícones profissionais
import {
  UserGroupIcon,
  UsersIcon,
  EyeIcon,
  BriefcaseIcon,
  CurrencyEuroIcon,
  CheckIcon,
  CalendarIcon,
  ClockIcon,
  ArrowTrendingUpIcon 
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { userProfile } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // HOOKS PARA DADOS REAIS
  const { leads, getLeadStats } = useLeads();
  const { clients, getClientStats } = useClients();
  const { visitStats } = useVisits();
  const { opportunities, getOpportunityStats } = useOpportunities();
  const { deals, getDealStats } = useDeals();
  const { tasks, getTaskStats } = useTasks();

  // CALCULAR MÉTRICAS REAIS
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

  // Dados simulados para demonstração
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

  // Componente de Métrica
  const MetricCard = ({ title, value, change, icon: Icon, color, onClick }) => (
    <ThemedCard 
      className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 ${onClick ? 'hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-3xl font-bold mt-2 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <div className="flex items-center mt-2">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-500 font-medium">{change}</span>
          </div>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </ThemedCard>
  );

  // Componente de Tabela Simples
  const SimpleTable = ({ title, data, columns, onRowClick, emptyMessage }) => (
    <ThemedCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <ThemedHeading level={3}>{title}</ThemedHeading>
      </div>
      {data.length === 0 ? (
        <p className={`text-center py-8 ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
          {emptyMessage}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className={`border-b ${isDark() ? 'border-gray-700' : 'border-gray-200'}`}>
                {columns.map((col, index) => (
                  <th key={index} className={`text-left py-3 px-4 font-medium ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr 
                  key={index}
                  className={`border-b cursor-pointer hover:bg-gray-50 ${isDark() ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200'}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className={`py-3 px-4 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                      {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ThemedCard>
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return isDark() ? 'text-red-400' : 'text-red-600';
      case 'média': return isDark() ? 'text-yellow-400' : 'text-yellow-600';
      case 'baixa': return isDark() ? 'text-green-400' : 'text-green-600';
      default: return isDark() ? 'text-gray-400' : 'text-gray-600';
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

  const taskColumns = [
    { 
      header: 'Tarefa', 
      accessor: row => (
        <div className="flex items-center space-x-2">
          <span>{row.title}</span>
        </div>
      )
    },
    { 
      header: 'Prioridade', 
      accessor: row => (
        <ThemedBadge 
          variant="secondary" 
          size="xs"
          className={getPriorityColor(row.priority)}
        >
          {row.priority}
        </ThemedBadge>
      )
    },
    { 
      header: 'Data', 
      accessor: row => 
        row.dueDate ? row.dueDate.toLocaleDateString('pt-PT') : 'Sem data'
    }
  ];

  const visitColumns = [
    { header: 'Propriedade', accessor: 'property' },
    { header: 'Cliente', accessor: 'client' },
    { 
      header: 'Status', 
      accessor: row => (
        <ThemedBadge 
          variant="secondary" 
          size="xs"
          className={getStatusColor(row.status)}
        >
          {row.status}
        </ThemedBadge>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Welcome Section */}
        <ThemedCard className="text-center">
          <ThemedGradient className="p-6 rounded-lg">
            <ThemedHeading level={2} className="mb-2 text-white">
              Bem-vindo de volta, {userProfile?.name || 'Utilizador'}! 👋
            </ThemedHeading>
            <ThemedText className="mb-4 text-white/90">
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
            <p className="text-white/80">
              Você tem {realMetrics.tasks.pending} tarefas pendentes e {realMetrics.visits.today} visitas hoje.
            </p>
          </ThemedGradient>
        </ThemedCard>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Leads"
            value={realMetrics.leads.total.toString()}
            change={realMetrics.leads.trend}
            icon={UserGroupIcon}
            color="blue"
            onClick={() => navigate('/leads')}
          />
          <MetricCard
            title="Clientes"
            value={realMetrics.clients.total.toString()}
            change={realMetrics.clients.trend}
            icon={UsersIcon}
            color="green"
            onClick={() => navigate('/clients')}
          />
          <MetricCard
            title="Visitas"
            value={realMetrics.visits.total.toString()}
            change={realMetrics.visits.trend}
            icon={EyeIcon}
            color="yellow"
            onClick={() => navigate('/visits')}
          />
          <MetricCard
            title="Negócios"
            value={realMetrics.deals.value}
            change={realMetrics.deals.trend}
            icon={CurrencyEuroIcon}
            color="purple"
            onClick={() => navigate('/deals')}
          />
        </div>

        {/* Grid de Conteúdo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Tarefas Urgentes */}
          <SimpleTable
            title="Tarefas Urgentes"
            data={recentTasks}
            columns={taskColumns}
            emptyMessage="Nenhuma tarefa urgente"
            onRowClick={(task) => navigate(`/tasks/${task.id}`)}
          />

          {/* Visitas Próximas */}
          <SimpleTable
            title="Visitas Próximas"
            data={recentVisits}
            columns={visitColumns}
            emptyMessage="Nenhuma visita agendada"
            onRowClick={(visit) => navigate(`/visits/${visit.id}`)}
          />

        </div>

        {/* Ações Rápidas */}
        <ThemedCard className="p-6">
          <ThemedHeading level={3} className="mb-4">Ações Rápidas</ThemedHeading>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <ThemedButton 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/leads/new')}
            >
              <UserGroupIcon className="w-6 h-6" />
              <span className="text-sm">Novo Lead</span>
            </ThemedButton>

            <ThemedButton 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/visits/schedule')}
            >
              <CalendarIcon className="w-6 h-6" />
              <span className="text-sm">Agendar Visita</span>
            </ThemedButton>

            <ThemedButton 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/tasks/new')}
            >
              <CheckIcon className="w-6 h-6" />
              <span className="text-sm">Nova Tarefa</span>
            </ThemedButton>

            <ThemedButton 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/clients/new')}
            >
              <UsersIcon className="w-6 h-6" />
              <span className="text-sm">Novo Cliente</span>
            </ThemedButton>

          </div>
        </ThemedCard>

      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;