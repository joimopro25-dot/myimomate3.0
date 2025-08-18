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
import DashboardLayout from '../../components/layout/DashboardLayout';

const DashboardPage = () => {
  const { userProfile } = useAuth();
  const { theme, isDark } = useTheme();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar hora a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Dados simulados para demonstração (futuramente virão do Firebase)
  const metrics = {
    leads: {
      total: 47,
      thisMonth: 12,
      trend: '+15%',
      isPositive: true
    },
    clients: {
      total: 156,
      thisMonth: 8,
      trend: '+12%',
      isPositive: true
    },
    visits: {
      total: 23,
      thisWeek: 5,
      trend: '+8%',
      isPositive: true
    },
    deals: {
      total: 8,
      thisMonth: 3,
      value: '€245.000',
      trend: '+22%',
      isPositive: true
    }
  };

  const recentTasks = [
    {
      id: 1,
      title: 'Ligar para João Silva sobre T2 no Porto',
      priority: 'alta',
      dueDate: '2025-08-18',
      type: 'call'
    },
    {
      id: 2,
      title: 'Preparar documentos para visita de amanhã',
      priority: 'média',
      dueDate: '2025-08-18',
      type: 'document'
    },
    {
      id: 3,
      title: 'Follow-up com Maria Costa - Proposta T3',
      priority: 'alta',
      dueDate: '2025-08-19',
      type: 'follow-up'
    },
    {
      id: 4,
      title: 'Agendar visita para apartamento em Cascais',
      priority: 'baixa',
      dueDate: '2025-08-20',
      type: 'visit'
    }
  ];

  const upcomingVisits = [
    {
      id: 1,
      client: 'Ana Pereira',
      property: 'T3 em Cascais - 320.000€',
      time: '10:00',
      date: '2025-08-18',
      status: 'confirmada'
    },
    {
      id: 2,
      client: 'Carlos Mendes',
      property: 'T2 no Centro do Porto - 280.000€',
      time: '15:30',
      date: '2025-08-18',
      status: 'pendente'
    },
    {
      id: 3,
      client: 'Sofia Santos',
      property: 'Moradia em Oeiras - 650.000€',
      time: '11:00',
      date: '2025-08-19',
      status: 'confirmada'
    }
  ];

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmada': return 'text-green-500';
      case 'pendente': return 'text-yellow-500';
      case 'cancelada': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header da Dashboard */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <ThemedHeading level={1} className={`mb-2 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              {getGreeting()}, {userProfile?.name?.split(' ')[0] || 'Consultor'}! 👋
            </ThemedHeading>
            <ThemedText className={`${isDark() ? 'text-gray-300' : 'text-gray-600'}`}>
              Aqui está o resumo da sua atividade hoje, {currentTime.toLocaleDateString('pt-PT', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}.
            </ThemedText>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <ThemedButton variant="secondary" size="sm">
              <Link to="/leads/new">+ Novo Lead</Link>
            </ThemedButton>
            <ThemedButton variant="primary" size="sm">
              <Link to="/visits/schedule">+ Agendar Visita</Link>
            </ThemedButton>
          </div>
        </div>

        {/* Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Leads */}
          <ThemedCard 
            className="p-6 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
            onClick={() => navigate('/leads')}
          >
            <div className="flex items-center justify-between">
              <div>
                <ThemedText size="sm" className={`font-medium ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
                  Leads
                </ThemedText>
                <ThemedHeading level={2} className={`mt-1 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                {metrics.leads.total}
              </ThemedHeading>
              <ThemedText size="xs" className={`${isDark() ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                👆 Clique para gerir
              </ThemedText>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${metrics.leads.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {metrics.leads.trend}
                  </span>
                  <ThemedText size="sm" className={`ml-2 ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
                    este mês
                  </ThemedText>
                </div>
              </div>
              <ThemedGradient type="primary" className="w-12 h-12 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">📋</span>
              </ThemedGradient>
            </div>
          </ThemedCard>

          {/* Clientes */}
          <ThemedCard 
            className="p-6 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
            onClick={() => navigate('/clients')}
          >
            <div className="flex items-center justify-between">
              <div>
                <ThemedText size="sm" className={`font-medium ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
                  Clientes
                </ThemedText>
                <ThemedHeading level={2} className={`mt-1 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                  {metrics.clients.total}
                </ThemedHeading>
                <ThemedText size="xs" className={`${isDark() ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  👆 Clique para gerir
                </ThemedText>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${metrics.clients.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {metrics.clients.trend}
                  </span>
                  <ThemedText size="sm" className={`ml-2 ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
                    este mês
                  </ThemedText>
                </div>
              </div>
              <ThemedGradient type="secondary" className="w-12 h-12 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">🤝</span>
              </ThemedGradient>
            </div>
          </ThemedCard>

          {/* Visitas */}
          <ThemedCard 
            className="p-6 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
            onClick={() => navigate('/visits')}
          >
            <div className="flex items-center justify-between">
              <div>
                <ThemedText size="sm" className={`font-medium ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
                  Visitas
                </ThemedText>
                <ThemedHeading level={2} className={`mt-1 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                  {metrics.visits.total}
                </ThemedHeading>
                <ThemedText size="xs" className={`${isDark() ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  👆 Clique para gerir
                </ThemedText>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${metrics.visits.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {metrics.visits.trend}
                  </span>
                  <ThemedText size="sm" className={`ml-2 ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
                    esta semana
                  </ThemedText>
                </div>
              </div>
              <ThemedGradient type="accent" className="w-12 h-12 rounded-xl flex items-center justify-center">
                <span className="text-white text-2xl">🏠</span>
              </ThemedGradient>
            </div>
          </ThemedCard>

          {/* Negócios */}
          <ThemedCard 
            className="p-6 cursor-pointer hover:shadow-lg transition-all transform hover:scale-105"
            onClick={() => navigate('/deals')}
          >
            <div className="flex items-center justify-between">
              <div>
                <ThemedText size="sm" className={`font-medium ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
                  Negócios
                </ThemedText>
                <ThemedHeading level={2} className={`mt-1 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                  {metrics.deals.total}
                </ThemedHeading>
                <ThemedText size="xs" className={`${isDark() ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                  👆 Clique para gerir
                </ThemedText>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${metrics.deals.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {metrics.deals.trend}
                  </span>
                  <ThemedText size="sm" className={`ml-2 ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
                    {metrics.deals.value}
                  </ThemedText>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isDark() ? 'bg-yellow-600' : 'bg-yellow-500'
              }`}>
                <span className="text-white text-2xl">💼</span>
              </div>
            </div>
          </ThemedCard>
        </div>

        {/* Grid de Conteúdo Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tarefas Recentes */}
          <div className="lg:col-span-2">
            <ThemedCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <ThemedHeading level={3} className={isDark() ? 'text-white' : 'text-gray-900'}>
                  Tarefas Pendentes
                </ThemedHeading>
                <Link 
                  to="/tasks"
                  className={`text-sm font-medium transition-colors ${
                    isDark() ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  Ver todas
                </Link>
              </div>
              
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className={`
                    flex items-start space-x-3 p-3 rounded-lg transition-colors
                    ${isDark() ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                  `}>
                    <span className="text-lg">{getTaskIcon(task.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isDark() ? 'text-white' : 'text-gray-900'}`}>
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
                        <ThemedText size="xs" className={isDark() ? 'text-gray-400' : 'text-gray-500'}>
                          {new Date(task.dueDate).toLocaleDateString('pt-PT')}
                        </ThemedText>
                      </div>
                    </div>
                    <button className={`
                      p-1 rounded transition-colors
                      ${isDark() ? 'text-gray-400 hover:text-white hover:bg-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}
                    `}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <ThemedButton variant="secondary" size="sm" className="w-full">
                  <Link to="/tasks/new">+ Nova Tarefa</Link>
                </ThemedButton>
              </div>
            </ThemedCard>
          </div>

          {/* Próximas Visitas */}
          <div className="lg:col-span-1">
            <ThemedCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <ThemedHeading level={3} className={isDark() ? 'text-white' : 'text-gray-900'}>
                  Próximas Visitas
                </ThemedHeading>
                <Link 
                  to="/visits"
                  className={`text-sm font-medium transition-colors ${
                    isDark() ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                  }`}
                >
                  Ver todas
                </Link>
              </div>
              
              <div className="space-y-4">
                {upcomingVisits.map((visit) => (
                  <div key={visit.id} className={`
                    p-3 rounded-lg border transition-colors
                    ${isDark() ? 'border-gray-600 hover:border-gray-500' : 'border-gray-200 hover:border-gray-300'}
                  `}>
                    <div className="flex items-center justify-between mb-2">
                      <ThemedText size="sm" className={`font-medium ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                        {visit.client}
                      </ThemedText>
                      <span className={`text-xs font-medium ${getStatusColor(visit.status)}`}>
                        {visit.status}
                      </span>
                    </div>
                    <ThemedText size="xs" className={`mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-600'}`}>
                      {visit.property}
                    </ThemedText>
                    <div className="flex items-center justify-between">
                      <ThemedText size="xs" className={isDark() ? 'text-gray-400' : 'text-gray-500'}>
                        {new Date(visit.date).toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })}
                      </ThemedText>
                      <ThemedText size="xs" className={`font-medium ${isDark() ? 'text-blue-400' : 'text-blue-600'}`}>
                        {visit.time}
                      </ThemedText>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <ThemedButton variant="primary" size="sm" className="w-full">
                  <Link to="/visits/schedule">+ Agendar Visita</Link>
                </ThemedButton>
              </div>
            </ThemedCard>
          </div>
        </div>

        {/* Quick Actions */}
        <ThemedCard className="p-6">
          <ThemedHeading level={3} className={`mb-4 ${isDark() ? 'text-white' : 'text-gray-900'}`}>
            Ações Rápidas
          </ThemedHeading>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              to="/leads/new"
              className={`
                flex flex-col items-center p-4 rounded-lg transition-all
                ${isDark() 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <span className="text-2xl mb-2">📋</span>
              <span className="text-sm font-medium">Novo Lead</span>
            </Link>
            
            <Link 
              to="/clients/new"
              className={`
                flex flex-col items-center p-4 rounded-lg transition-all
                ${isDark() 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <span className="text-2xl mb-2">🤝</span>
              <span className="text-sm font-medium">Novo Cliente</span>
            </Link>
            
            <Link 
              to="/visits/schedule"
              className={`
                flex flex-col items-center p-4 rounded-lg transition-all
                ${isDark() 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <span className="text-2xl mb-2">🏠</span>
              <span className="text-sm font-medium">Agendar Visita</span>
            </Link>
            
            <Link 
              to="/deals/new"
              className={`
                flex flex-col items-center p-4 rounded-lg transition-all
                ${isDark() 
                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white' 
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <span className="text-2xl mb-2">💼</span>
              <span className="text-sm font-medium">Novo Negócio</span>
            </Link>
          </div>
        </ThemedCard>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;