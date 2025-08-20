// src/pages/dashboard/DashboardPage.jsx
// Dashboard Responsivo - Ocupação Total da Tela

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

// Layout otimizado com widgets
import DashboardLayout from '../../components/layout/DashboardLayout';

// Hooks para dados reais
import useLeads from '../../hooks/useLeads';
import useClients from '../../hooks/useClients';
import useVisits from '../../hooks/useVisits';
import useOpportunities from '../../hooks/useOpportunities';
import useDeals from '../../hooks/useDeals';
import useTasks from '../../hooks/useTasks';

// Ícones
import {
  UserGroupIcon,
  UsersIcon,
  EyeIcon,
  BriefcaseIcon,
  CurrencyEuroIcon,
  CheckIcon,
  CalendarIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Componente de Métrica Responsiva
const ResponsiveMetricCard = ({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  color = 'blue',
  onClick,
  className = ''
}) => {
  const { isDark } = useTheme();
  
  const colorClasses = {
    blue: {
      bg: isDark() ? 'bg-blue-900/20' : 'bg-blue-50',
      iconBg: isDark() ? 'bg-blue-600' : 'bg-blue-100',
      iconColor: isDark() ? 'text-white' : 'text-blue-600',
      text: isDark() ? 'text-blue-200' : 'text-blue-700'
    },
    green: {
      bg: isDark() ? 'bg-green-900/20' : 'bg-green-50',
      iconBg: isDark() ? 'bg-green-600' : 'bg-green-100',
      iconColor: isDark() ? 'text-white' : 'text-green-600',
      text: isDark() ? 'text-green-200' : 'text-green-700'
    },
    yellow: {
      bg: isDark() ? 'bg-yellow-900/20' : 'bg-yellow-50',
      iconBg: isDark() ? 'bg-yellow-600' : 'bg-yellow-100',
      iconColor: isDark() ? 'text-white' : 'text-yellow-600',
      text: isDark() ? 'text-yellow-200' : 'text-yellow-700'
    },
    purple: {
      bg: isDark() ? 'bg-purple-900/20' : 'bg-purple-50',
      iconBg: isDark() ? 'bg-purple-600' : 'bg-purple-100',
      iconColor: isDark() ? 'text-white' : 'text-purple-600',
      text: isDark() ? 'text-purple-200' : 'text-purple-700'
    }
  };

  const colors = colorClasses[color] || colorClasses.blue;

  return (
    <div 
      className={`
        ${colors.bg} p-6 rounded-lg shadow-sm transition-all duration-200 cursor-pointer h-full
        hover:shadow-md hover:scale-[1.02] border flex flex-col justify-center
        ${isDark() ? 'border-gray-700 hover:border-gray-600' : 'border-gray-100 hover:border-gray-200'}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`
          w-12 h-12 rounded-lg flex items-center justify-center mr-4
          ${colors.iconBg}
        `}>
          <Icon className={`w-6 h-6 ${colors.iconColor}`} />
        </div>
        <div className="flex-1">
          <p className={`text-sm font-medium mb-1 ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-2xl font-bold mb-1 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {trend && (
            <p className={`text-sm font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de Tabela Expansível
const ExpandableTable = ({ 
  title, 
  data = [], 
  emptyMessage = "Nenhum item encontrado",
  onRowClick,
  className = ''
}) => {
  const { isDark } = useTheme();

  return (
    <div className={`
      bg-white rounded-lg shadow-sm p-6 border h-full flex flex-col
      ${isDark() ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}
      ${className}
    `}>
      <h3 className={`text-lg font-medium mb-4 flex items-center ${
        isDark() ? 'text-white' : 'text-gray-900'
      }`}>
        {title}
      </h3>
      
      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-8">
            <p className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
              {emptyMessage}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 space-y-3 overflow-y-auto">
          {data.map((item, index) => (
            <div 
              key={index}
              className={`
                p-4 rounded transition-colors cursor-pointer
                ${isDark() 
                  ? 'bg-gray-700 hover:bg-gray-600' 
                  : 'bg-gray-50 hover:bg-gray-100'
                }
              `}
              onClick={() => onRowClick && onRowClick(item)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${
                    isDark() ? 'text-white' : 'text-gray-900'
                  }`}>
                    {item.name || item.title}
                  </p>
                  <p className={`text-xs truncate mt-1 ${
                    isDark() ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {item.description || item.property || item.email}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  {item.priority && (
                    <span className={`
                      inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                      ${item.priority === 'alta' 
                        ? 'bg-red-100 text-red-800' 
                        : item.priority === 'media'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                      }
                    `}>
                      {item.priority === 'alta' ? '🔥' : item.priority === 'media' ? '⏰' : '📌'}
                    </span>
                  )}
                  {item.status && (
                    <span className={`
                      inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                      ${item.status === 'confirmada' 
                        ? 'bg-green-100 text-green-800' 
                        : item.status === 'pendente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                      }
                    `}>
                      {item.time || item.value || item.status}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

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

  // Atualizar hora
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);

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
        (getDealStats()?.totalValue ? 
          `€${Math.round(getDealStats().totalValue / 1000)}k` : '€0') : '€0',
      trend: '+23%',
      isPositive: true
    }
  };

  // DADOS SIMULADOS PARA DEMONSTRAÇÃO
  const recentTasks = [
    {
      name: 'Ligar para João Silva',
      description: 'Follow-up interesse T3 Cascais',
      priority: 'alta'
    },
    {
      name: 'Agendar visita Ana Costa',
      description: 'T2 Lisboa - Cliente VIP',
      priority: 'media'
    },
    {
      name: 'Enviar proposta comercial',
      description: 'Carlos Mendes - T4 Porto',
      priority: 'baixa'
    },
    {
      name: 'Follow-up email marketing',
      description: 'Campanha Setembro',
      priority: 'media'
    },
    {
      name: 'Reunião equipa comercial',
      description: 'Review mensal de objetivos',
      priority: 'alta'
    }
  ];

  const recentVisits = [
    {
      name: 'Ana Costa',
      description: 'T3 Cascais - Alameda dos Oceanos',
      status: 'confirmada',
      time: '15:00'
    },
    {
      name: 'Carlos Mendes',
      description: 'T2 Lisboa - Avenidas Novas',
      status: 'confirmada',
      time: '17:30'
    },
    {
      name: 'Maria Santos',
      description: 'T4 Porto - Cedofeita',
      status: 'pendente',
      time: 'Amanhã'
    },
    {
      name: 'Pedro Oliveira',
      description: 'T1 Cascais - Centro',
      status: 'confirmada',
      time: 'Amanhã 10:00'
    }
  ];

  return (
    <DashboardLayout showWidgets={true}>
      {/* Container principal que ocupa toda a altura */}
      <div className="h-full flex flex-col space-y-6">
        
        {/* Saudação compacta */}
        <ThemedCard className="p-4 flex-shrink-0">
          <ThemedGradient className="text-center">
            <ThemedHeading level={2} className="mb-2">
              Olá, {userProfile?.name || 'Utilizador'}! 👋
            </ThemedHeading>
            <p className={`text-sm ${isDark() ? 'text-gray-300' : 'text-gray-600'}`}>
              {currentTime.toLocaleDateString('pt-PT', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })} | Dashboard Otimizado 🚀
            </p>
          </ThemedGradient>
        </ThemedCard>

        {/* Área principal expansível */}
        <div className="flex-1 flex flex-col space-y-6 min-h-0">
          
          {/* Métricas responsivas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-4 h-32">
            <ResponsiveMetricCard
              title="Leads"
              value={realMetrics.leads.total.toString()}
              trend={realMetrics.leads.trend}
              icon={UserGroupIcon}
              color="blue"
              onClick={() => navigate('/leads')}
            />
            <ResponsiveMetricCard
              title="Clientes"
              value={realMetrics.clients.total.toString()}
              trend={realMetrics.clients.trend}
              icon={UsersIcon}
              color="green"
              onClick={() => navigate('/clients')}
            />
            <ResponsiveMetricCard
              title="Visitas"
              value={realMetrics.visits.total.toString()}
              trend={realMetrics.visits.trend}
              icon={EyeIcon}
              color="yellow"
              onClick={() => navigate('/visits')}
            />
            <ResponsiveMetricCard
              title="Negócios"
              value={realMetrics.deals.value}
              trend={realMetrics.deals.trend}
              icon={CurrencyEuroIcon}
              color="purple"
              onClick={() => navigate('/deals')}
            />
          </div>

          {/* Tabelas expansíveis lado a lado */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">
            <ExpandableTable
              title="🔥 Tarefas Urgentes"
              data={recentTasks}
              emptyMessage="Nenhuma tarefa urgente"
              onRowClick={(task) => navigate(`/tasks`)}
            />
            
            <ExpandableTable
              title="📅 Visitas Agendadas"
              data={recentVisits}
              emptyMessage="Nenhuma visita agendada"
              onRowClick={(visit) => navigate(`/visits`)}
            />
          </div>

          {/* Ações rápidas */}
          <ThemedCard className="p-6 flex-shrink-0">
            <ThemedHeading level={3} className="mb-4 text-lg">⚡ Ações Rápidas</ThemedHeading>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              <ThemedButton 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 transition-all hover:scale-105"
                onClick={() => navigate('/leads/new')}
              >
                <PlusIcon className="w-6 h-6" />
                <span className="text-sm font-medium">Novo Lead</span>
              </ThemedButton>

              <ThemedButton 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 transition-all hover:scale-105"
                onClick={() => navigate('/visits/schedule')}
              >
                <CalendarIcon className="w-6 h-6" />
                <span className="text-sm font-medium">Agendar</span>
              </ThemedButton>

              <ThemedButton 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 transition-all hover:scale-105"
                onClick={() => navigate('/tasks/new')}
              >
                <PhoneIcon className="w-6 h-6" />
                <span className="text-sm font-medium">Ligar</span>
              </ThemedButton>

              <ThemedButton 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center space-y-2 transition-all hover:scale-105"
                onClick={() => navigate('/reports')}
              >
                <ChartBarIcon className="w-6 h-6" />
                <span className="text-sm font-medium">Relatórios</span>
              </ThemedButton>

            </div>
          </ThemedCard>

          {/* Resumo de performance compacto */}
          <div className="grid grid-cols-3 gap-4 flex-shrink-0">
            <ThemedCard className="p-4 text-center">
              <div className={`text-2xl font-bold mb-1 ${isDark() ? 'text-blue-400' : 'text-blue-600'}`}>
                15.3%
              </div>
              <div className={`text-xs ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                Taxa Conversão
              </div>
            </ThemedCard>

            <ThemedCard className="p-4 text-center">
              <div className={`text-2xl font-bold mb-1 ${isDark() ? 'text-green-400' : 'text-green-600'}`}>
                €42k
              </div>
              <div className={`text-xs ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                Ticket Médio
              </div>
            </ThemedCard>

            <ThemedCard className="p-4 text-center">
              <div className={`text-2xl font-bold mb-1 ${isDark() ? 'text-purple-400' : 'text-purple-600'}`}>
                87%
              </div>
              <div className={`text-xs ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
                Meta Mensal
              </div>
            </ThemedCard>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;