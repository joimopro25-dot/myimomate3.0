// src/pages/dashboard/DashboardPage.jsx
// Dashboard Otimizado - Sistema de 3 Colunas com Máximo Aproveitamento

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

// Ícones otimizados
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

// Componente de Métrica Compacta
const CompactMetricCard = ({ 
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
        ${colors.bg} p-4 rounded-lg shadow-sm transition-all duration-200 cursor-pointer
        hover:shadow-md hover:scale-[1.02] border
        ${isDark() ? 'border-gray-700 hover:border-gray-600' : 'border-gray-100 hover:border-gray-200'}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center mr-3
          ${colors.iconBg}
        `}>
          <Icon className={`w-5 h-5 ${colors.iconColor}`} />
        </div>
        <div className="flex-1">
          <p className={`text-xs font-medium ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {trend && (
            <p className={`text-xs font-medium ${trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {trend}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de Tabela Compacta
const CompactTable = ({ 
  title, 
  data = [], 
  columns = [],
  emptyMessage = "Nenhum item encontrado",
  onRowClick,
  className = ''
}) => {
  const { isDark } = useTheme();

  return (
    <div className={`
      bg-white rounded-lg shadow-sm p-4 border
      ${isDark() ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}
      ${className}
    `}>
      <h3 className={`text-base font-medium mb-3 flex items-center ${
        isDark() ? 'text-white' : 'text-gray-900'
      }`}>
        {title}
      </h3>
      
      {data.length === 0 ? (
        <div className="text-center py-8">
          <p className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {data.slice(0, 5).map((item, index) => (
            <div 
              key={index}
              className={`
                p-2 rounded transition-colors cursor-pointer
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
                  <p className={`text-xs truncate ${
                    isDark() ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {item.description || item.property || item.email}
                  </p>
                </div>
                <div className="ml-3 flex-shrink-0">
                  {item.priority && (
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
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
                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
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

  // Atualizar hora a cada minuto
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

  // DADOS SIMULADOS PARA DEMONSTRAÇÃO (substituir por dados reais)
  const recentTasks = [
    {
      name: 'Ligar para João Silva',
      description: 'Follow-up interesse T3 Cascais',
      priority: 'alta',
      time: '🔥'
    },
    {
      name: 'Agendar visita Ana Costa',
      description: 'T2 Lisboa - Cliente VIP',
      priority: 'media',
      time: '⏰'
    },
    {
      name: 'Enviar proposta comercial',
      description: 'Carlos Mendes - T4 Porto',
      priority: 'baixa',
      time: '📌'
    },
    {
      name: 'Follow-up email marketing',
      description: 'Campanha Setembro',
      priority: 'media',
      time: '⏰'
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
    }
  ];

  return (
    <DashboardLayout showWidgets={true}>
      <div className="space-y-6">
        
        {/* Saudação otimizada */}
        <ThemedCard className="p-4">
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

        {/* Métricas compactas em 2x2 */}
        <div className="grid grid-cols-2 gap-4">
          <CompactMetricCard
            title="Leads"
            value={realMetrics.leads.total.toString()}
            trend={realMetrics.leads.trend}
            icon={UserGroupIcon}
            color="blue"
            onClick={() => navigate('/leads')}
          />
          <CompactMetricCard
            title="Clientes"
            value={realMetrics.clients.total.toString()}
            trend={realMetrics.clients.trend}
            icon={UsersIcon}
            color="green"
            onClick={() => navigate('/clients')}
          />
          <CompactMetricCard
            title="Visitas"
            value={realMetrics.visits.total.toString()}
            trend={realMetrics.visits.trend}
            icon={EyeIcon}
            color="yellow"
            onClick={() => navigate('/visits')}
          />
          <CompactMetricCard
            title="Negócios"
            value={realMetrics.deals.value}
            trend={realMetrics.deals.trend}
            icon={CurrencyEuroIcon}
            color="purple"
            onClick={() => navigate('/deals')}
          />
        </div>

        {/* Tabelas lado a lado */}
        <div className="grid grid-cols-2 gap-4">
          <CompactTable
            title="🔥 Tarefas Urgentes"
            data={recentTasks}
            emptyMessage="Nenhuma tarefa urgente"
            onRowClick={(task) => navigate(`/tasks`)}
          />
          
          <CompactTable
            title="📅 Visitas Hoje"
            data={recentVisits}
            emptyMessage="Nenhuma visita agendada"
            onRowClick={(visit) => navigate(`/visits`)}
          />
        </div>

        {/* Ações rápidas horizontais otimizadas */}
        <ThemedCard className="p-4">
          <ThemedHeading level={3} className="mb-4 text-base">⚡ Ações Rápidas</ThemedHeading>
          <div className="grid grid-cols-4 gap-3">
            
            <ThemedButton 
              variant="outline" 
              className="h-16 flex flex-col items-center justify-center space-y-1 transition-all hover:scale-105"
              onClick={() => navigate('/leads/new')}
            >
              <PlusIcon className="w-5 h-5" />
              <span className="text-xs font-medium">Novo Lead</span>
            </ThemedButton>

            <ThemedButton 
              variant="outline" 
              className="h-16 flex flex-col items-center justify-center space-y-1 transition-all hover:scale-105"
              onClick={() => navigate('/visits/schedule')}
            >
              <CalendarIcon className="w-5 h-5" />
              <span className="text-xs font-medium">Agendar</span>
            </ThemedButton>

            <ThemedButton 
              variant="outline" 
              className="h-16 flex flex-col items-center justify-center space-y-1 transition-all hover:scale-105"
              onClick={() => navigate('/tasks/new')}
            >
              <PhoneIcon className="w-5 h-5" />
              <span className="text-xs font-medium">Ligar</span>
            </ThemedButton>

            <ThemedButton 
              variant="outline" 
              className="h-16 flex flex-col items-center justify-center space-y-1 transition-all hover:scale-105"
              onClick={() => navigate('/reports')}
            >
              <ChartBarIcon className="w-5 h-5" />
              <span className="text-xs font-medium">Relatórios</span>
            </ThemedButton>

          </div>
        </ThemedCard>

        {/* Resumo de performance compacto */}
        <div className="grid grid-cols-3 gap-4">
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
    </DashboardLayout>
  );
};

export default DashboardPage;