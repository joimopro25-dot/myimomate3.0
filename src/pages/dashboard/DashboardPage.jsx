// src/pages/dashboard/DashboardPage.jsx
// Dashboard Page que PREENCHE 100% DA VIEWPORT

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

// Layout otimizado
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
  PlusIcon,
  PhoneIcon,
  ChartBarIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

// Componente de Métrica Compacta
const ViewportMetricCard = ({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  color = 'blue',
  onClick
}) => {
  const { isDark } = useTheme();
  
  const colorClasses = {
    blue: isDark() ? 'from-blue-900/30 to-blue-800/20 border-blue-700/50' : 'from-blue-50 to-blue-100/50 border-blue-200',
    green: isDark() ? 'from-green-900/30 to-green-800/20 border-green-700/50' : 'from-green-50 to-green-100/50 border-green-200',
    yellow: isDark() ? 'from-yellow-900/30 to-yellow-800/20 border-yellow-700/50' : 'from-yellow-50 to-yellow-100/50 border-yellow-200',
    purple: isDark() ? 'from-purple-900/30 to-purple-800/20 border-purple-700/50' : 'from-purple-50 to-purple-100/50 border-purple-200'
  };

  const iconColors = {
    blue: isDark() ? 'text-blue-400' : 'text-blue-600',
    green: isDark() ? 'text-green-400' : 'text-green-600',
    yellow: isDark() ? 'text-yellow-400' : 'text-yellow-600',
    purple: isDark() ? 'text-purple-400' : 'text-purple-600'
  };

  return (
    <div 
      className={`
        bg-gradient-to-br ${colorClasses[color]} p-4 rounded-lg border cursor-pointer h-full
        transition-all duration-200 hover:scale-[1.02] hover:shadow-md flex flex-col justify-center
      `}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`w-6 h-6 ${iconColors[color]}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-lg font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          <p className="text-xs font-medium text-green-600">{trend}</p>
        </div>
      </div>
    </div>
  );
};

// Componente de Lista que ocupa toda altura disponível
const ViewportList = ({ 
  title, 
  data = [], 
  emptyMessage = "Nenhum item encontrado",
  onRowClick,
  icon = "📋"
}) => {
  const { isDark } = useTheme();

  return (
    <div className={`
      rounded-lg border h-full flex flex-col overflow-hidden
      ${isDark() ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
    `}>
      {/* Header */}
      <div className={`px-4 py-3 border-b flex-shrink-0 ${isDark() ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
        <h3 className={`text-sm font-semibold flex items-center ${
          isDark() ? 'text-white' : 'text-gray-900'
        }`}>
          <span className="mr-2">{icon}</span>
          {title}
        </h3>
      </div>
      
      {/* Content que expande */}
      <div className="flex-1 overflow-hidden">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className={`text-sm ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
              {emptyMessage}
            </p>
          </div>
        ) : (
          <div className="h-full overflow-y-auto px-3 py-2">
            <div className="space-y-2">
              {data.map((item, index) => (
                <div 
                  key={index}
                  className={`
                    p-3 rounded-md transition-colors cursor-pointer border
                    ${isDark() 
                      ? 'bg-gray-700/50 hover:bg-gray-600/50 border-gray-600/50' 
                      : 'bg-gray-50 hover:bg-gray-100 border-gray-200/50'
                    }
                  `}
                  onClick={() => onRowClick && onRowClick(item)}
                >
                  <div className="flex justify-between items-start">
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
                    <div className="ml-2 flex-shrink-0">
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
          </div>
        )}
      </div>
    </div>
  );
};

// Componente de Ações Rápidas + Performance
const ViewportActionsPanel = ({ navigate, isDark }) => {
  return (
    <div className="h-full flex flex-col space-y-3">
      
      {/* Ações Rápidas */}
      <div className={`
        rounded-lg border p-4 flex-shrink-0
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <h3 className={`text-sm font-semibold mb-3 flex items-center ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          <span className="mr-2">⚡</span>
          Ações Rápidas
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => navigate('/leads/new')}
            className={`
              p-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center space-x-1
              ${isDark 
                ? 'bg-blue-900/50 hover:bg-blue-800/50 text-blue-200' 
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
              }
            `}
          >
            <PlusIcon className="w-4 h-4" />
            <span>Lead</span>
          </button>
          
          <button 
            onClick={() => navigate('/visits/schedule')}
            className={`
              p-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center space-x-1
              ${isDark 
                ? 'bg-green-900/50 hover:bg-green-800/50 text-green-200' 
                : 'bg-green-50 hover:bg-green-100 text-green-700'
              }
            `}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Visita</span>
          </button>
          
          <button 
            onClick={() => navigate('/tasks/new')}
            className={`
              p-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center space-x-1
              ${isDark 
                ? 'bg-yellow-900/50 hover:bg-yellow-800/50 text-yellow-200' 
                : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'
              }
            `}
          >
            <PhoneIcon className="w-4 h-4" />
            <span>Ligar</span>
          </button>
          
          <button 
            onClick={() => navigate('/reports')}
            className={`
              p-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center space-x-1
              ${isDark 
                ? 'bg-purple-900/50 hover:bg-purple-800/50 text-purple-200' 
                : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
              }
            `}
          >
            <ChartBarIcon className="w-4 h-4" />
            <span>Report</span>
          </button>
        </div>
      </div>

      {/* Performance que expande */}
      <div className={`
        flex-1 rounded-lg border p-4 overflow-hidden
        ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      `}>
        <h3 className={`text-sm font-semibold mb-4 flex items-center ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          <span className="mr-2">📊</span>
          Performance
        </h3>
        
        <div className="space-y-3 h-full">
          <div className="text-center p-3 rounded-md bg-gradient-to-r from-blue-500/10 to-blue-600/10">
            <div className={`text-xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              15.3%
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Taxa Conversão
            </div>
          </div>

          <div className="text-center p-3 rounded-md bg-gradient-to-r from-green-500/10 to-green-600/10">
            <div className={`text-xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              €42k
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Ticket Médio
            </div>
          </div>

          <div className="text-center p-3 rounded-md bg-gradient-to-r from-purple-500/10 to-purple-600/10">
            <div className={`text-xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
              87%
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Meta Mensal
            </div>
          </div>
        </div>
      </div>

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
      trend: '+15%'
    },
    clients: {
      total: clients?.length || 0,
      trend: '+12%'
    },
    visits: {
      total: visitStats?.total || 0,
      trend: '+8%'
    },
    deals: {
      value: (typeof getDealStats === 'function') ? 
        (getDealStats()?.totalValue ? 
          `€${Math.round(getDealStats().totalValue / 1000)}k` : '€0') : '€0',
      trend: '+23%'
    }
  };

  // DADOS PARA LISTAS
  const recentTasks = [
    { name: 'Ligar para João Silva', description: 'Follow-up interesse T3 Cascais', priority: 'alta' },
    { name: 'Agendar visita Ana Costa', description: 'T2 Lisboa - Cliente VIP', priority: 'media' },
    { name: 'Enviar proposta comercial', description: 'Carlos Mendes - T4 Porto', priority: 'baixa' },
    { name: 'Follow-up email marketing', description: 'Campanha Setembro', priority: 'media' },
    { name: 'Reunião equipa comercial', description: 'Review mensal de objetivos', priority: 'alta' },
    { name: 'Preparar apresentação', description: 'Cliente empresarial grande', priority: 'alta' },
    { name: 'Atualizar CRM', description: 'Dados de contactos novos', priority: 'baixa' },
    { name: 'Ligar seguradoras', description: 'Confirmar cobertura imóvel', priority: 'media' }
  ];

  const recentVisits = [
    { name: 'Ana Costa', description: 'T3 Cascais - Alameda dos Oceanos', status: 'confirmada', time: '15:00' },
    { name: 'Carlos Mendes', description: 'T2 Lisboa - Avenidas Novas', status: 'confirmada', time: '17:30' },
    { name: 'Maria Santos', description: 'T4 Porto - Cedofeita', status: 'pendente', time: 'Amanhã' },
    { name: 'Pedro Oliveira', description: 'T1 Cascais - Centro', status: 'confirmada', time: 'Amanhã 10:00' },
    { name: 'Sofia Rodrigues', description: 'T2 Sintra - Queluz', status: 'pendente', time: 'Sexta' },
    { name: 'Miguel Ferreira', description: 'T3 Porto - Boavista', status: 'confirmada', time: 'Sábado 14:00' },
    { name: 'Isabel Martins', description: 'T4 Lisboa - Príncipe Real', status: 'confirmada', time: 'Sábado 16:30' }
  ];

  return (
    <DashboardLayout showWidgets={true}>
      {/* Container que ocupa TODA a altura do main */}
      <div className="h-full flex flex-col p-4 overflow-hidden">
        
        {/* Saudação compacta */}
        <div className={`
          p-3 rounded-lg mb-4 flex-shrink-0
          ${isDark() ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
        `}>
          <div className="text-center">
            <h2 className={`text-lg font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              Olá, {userProfile?.name || 'Utilizador'}! 👋
            </h2>
            <p className={`text-xs ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
              {currentTime.toLocaleDateString('pt-PT', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
              })} | Dashboard Otimizado 🚀
            </p>
          </div>
        </div>

        {/* Área principal que expande para ocupar todo espaço restante */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          
          {/* Métricas compactas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 flex-shrink-0" style={{height: '80px'}}>
            <ViewportMetricCard
              title="Leads"
              value={realMetrics.leads.total.toString()}
              trend={realMetrics.leads.trend}
              icon={UserGroupIcon}
              color="blue"
              onClick={() => navigate('/leads')}
            />
            <ViewportMetricCard
              title="Clientes"
              value={realMetrics.clients.total.toString()}
              trend={realMetrics.clients.trend}
              icon={UsersIcon}
              color="green"
              onClick={() => navigate('/clients')}
            />
            <ViewportMetricCard
              title="Visitas"
              value={realMetrics.visits.total.toString()}
              trend={realMetrics.visits.trend}
              icon={EyeIcon}
              color="yellow"
              onClick={() => navigate('/visits')}
            />
            <ViewportMetricCard
              title="Negócios"
              value={realMetrics.deals.value}
              trend={realMetrics.deals.trend}
              icon={CurrencyEuroIcon}
              color="purple"
              onClick={() => navigate('/deals')}
            />
          </div>

          {/* Layout de 3 colunas que ocupa TODO o espaço restante */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0 overflow-hidden">
            
            {/* Coluna 1: Tarefas */}
            <ViewportList
              title="Tarefas Urgentes"
              icon="🔥"
              data={recentTasks}
              emptyMessage="Nenhuma tarefa urgente"
              onRowClick={(task) => navigate('/tasks')}
            />
            
            {/* Coluna 2: Visitas */}
            <ViewportList
              title="Visitas Agendadas"
              icon="📅"
              data={recentVisits}
              emptyMessage="Nenhuma visita agendada"
              onRowClick={(visit) => navigate('/visits')}
            />

            {/* Coluna 3: Ações + Performance */}
            <ViewportActionsPanel navigate={navigate} isDark={isDark()} />

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;