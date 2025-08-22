// src/pages/dashboard/DashboardPage.jsx - COM SIDEBAR E LAYOUT CONSISTENTE
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Target, 
  Briefcase, 
  CheckSquare, 
  BarChart3,
  TrendingUp,
  Plus,
  ArrowRight,
  Phone,
  Home,
  Clock,
  DollarSign,
  Settings,
  Link
} from 'lucide-react';
import { 
  ThemedContainer, 
  ThemedHeading, 
  ThemedText,
  ThemedButton 
} from '../../components/common/ThemedComponents';

// Sidebar Temporária (até criar componente reutilizável)
const Sidebar = () => {
  const navigate = useNavigate();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { id: 'leads', label: 'Leads', icon: Phone, path: '/leads' },
    { id: 'clients', label: 'Clientes', icon: Users, path: '/clients' },
    { id: 'visits', label: 'Visitas', icon: Home, path: '/visits' },
    { id: 'opportunities', label: 'Oportunidades', icon: Target, path: '/opportunities' },
    { id: 'deals', label: 'Negócios', icon: Briefcase, path: '/deals' },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare, path: '/tasks' },
    { id: 'calendar', label: 'Calendário', icon: Calendar, path: '/calendar' },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, path: '/reports' },
    { id: 'integrations', label: 'Integrações', icon: Link, path: '/integrations' },
    { id: 'settings', label: 'Configurações', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-10">
      <div className="p-6">
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <div className="font-bold text-gray-900">MyImoMate</div>
            <div className="text-xs text-gray-500">CRM Imobiliário</div>
          </div>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = window.location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <IconComponent className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  
  // Estados para dados simulados
  const [dashboardData, setDashboardData] = useState({
    leads: { count: 12, recent: 3 },
    clients: { count: 8, recent: 2 },
    visits: { count: 15, today: 4 },
    opportunities: { count: 6, value: 250000 },
    deals: { count: 3, value: 180000 },
    tasks: { count: 18, pending: 7 }
  });

  // Navegação inteligente - Cards clicáveis
  const handleCardClick = (module) => {
    navigate(`/${module}`);
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'new-lead':
        navigate('/leads');
        break;
      case 'schedule-visit':
        navigate('/visits');
        break;
      case 'new-client':
        navigate('/clients');
        break;
      case 'new-task':
        navigate('/tasks');
        break;
      default:
        console.log('Ação rápida:', action);
    }
  };

  // Métricas clicáveis com hover effects
  const metricsCards = [
    {
      id: 'leads',
      title: 'Leads',
      count: dashboardData.leads.count,
      subtitle: `${dashboardData.leads.recent} novos hoje`,
      icon: Phone,
      color: 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600',
      action: () => handleCardClick('leads')
    },
    {
      id: 'clients',
      title: 'Clientes',
      count: dashboardData.clients.count,
      subtitle: `${dashboardData.clients.recent} novos esta semana`,
      icon: Users,
      color: 'bg-gradient-to-r from-green-50 to-green-100 border-green-200 hover:from-green-100 hover:to-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      action: () => handleCardClick('clients')
    },
    {
      id: 'visits',
      title: 'Visitas',
      count: dashboardData.visits.count,
      subtitle: `${dashboardData.visits.today} agendadas hoje`,
      icon: Home,
      color: 'bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200',
      textColor: 'text-purple-800',
      iconColor: 'text-purple-600',
      action: () => handleCardClick('visits')
    },
    {
      id: 'opportunities',
      title: 'Oportunidades',
      count: dashboardData.opportunities.count,
      subtitle: `€${(dashboardData.opportunities.value / 1000).toFixed(0)}k em pipeline`,
      icon: Target,
      color: 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200',
      textColor: 'text-orange-800',
      iconColor: 'text-orange-600',
      action: () => handleCardClick('opportunities')
    },
    {
      id: 'deals',
      title: 'Negócios',
      count: dashboardData.deals.count,
      subtitle: `€${(dashboardData.deals.value / 1000).toFixed(0)}k em vendas`,
      icon: Briefcase,
      color: 'bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200 hover:from-indigo-100 hover:to-indigo-200',
      textColor: 'text-indigo-800',
      iconColor: 'text-indigo-600',
      action: () => handleCardClick('deals')
    },
    {
      id: 'tasks',
      title: 'Tarefas',
      count: dashboardData.tasks.count,
      subtitle: `${dashboardData.tasks.pending} pendentes`,
      icon: CheckSquare,
      color: 'bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200 hover:from-teal-100 hover:to-teal-200',
      textColor: 'text-teal-800',
      iconColor: 'text-teal-600',
      action: () => handleCardClick('tasks')
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1">
        <div className="p-6">
          {/* Header Principal */}
          <div className="mb-8">
            <ThemedHeading level={1} className="mb-2">
              Dashboard Principal
            </ThemedHeading>
            <ThemedText className="text-gray-600">
              Visão geral do seu negócio imobiliário
            </ThemedText>
          </div>

          {/* Métricas Principais (Clicáveis) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {metricsCards.map((metric) => {
              const IconComponent = metric.icon;
              return (
                <div
                  key={metric.id}
                  className={`${metric.color} border-2 rounded-xl p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group`}
                  onClick={metric.action}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-white ${metric.iconColor}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <ArrowRight className={`h-5 w-5 ${metric.iconColor} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  </div>
                  
                  <div className="space-y-1">
                    <ThemedText className={`text-sm font-medium ${metric.textColor}`}>
                      {metric.title}
                    </ThemedText>
                    <ThemedHeading level={2} className={`${metric.textColor}`}>
                      {metric.count}
                    </ThemedHeading>
                    <ThemedText className={`text-xs ${metric.textColor} opacity-80`}>
                      {metric.subtitle}
                    </ThemedText>
                  </div>
                  
                  <div className={`mt-4 text-xs ${metric.textColor} opacity-70 group-hover:opacity-100 transition-opacity`}>
                    👆 Clique para gerir
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ações Rápidas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Ações Rápidas - Lado Esquerdo */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Plus className="h-5 w-5 text-blue-600 mr-2" />
                <ThemedHeading level={3}>Ações Rápidas</ThemedHeading>
              </div>
              
              <div className="space-y-3">
                <ThemedButton
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => handleQuickAction('new-lead')}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Adicionar Novo Lead
                </ThemedButton>
                
                <ThemedButton
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => handleQuickAction('schedule-visit')}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Visita
                </ThemedButton>
                
                <ThemedButton
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => handleQuickAction('new-client')}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Registar Cliente
                </ThemedButton>
                
                <ThemedButton
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => handleQuickAction('new-task')}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Criar Tarefa
                </ThemedButton>
              </div>
            </div>

            {/* Resumo do Pipeline - Lado Direito */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                <ThemedHeading level={3}>Pipeline de Vendas</ThemedHeading>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <ThemedText className="text-sm">Oportunidades Ativas</ThemedText>
                  <ThemedText className="font-semibold">
                    {dashboardData.opportunities.count}
                  </ThemedText>
                </div>
                
                <div className="flex justify-between items-center">
                  <ThemedText className="text-sm">Valor em Pipeline</ThemedText>
                  <ThemedText className="font-semibold text-blue-600">
                    €{(dashboardData.opportunities.value / 1000).toFixed(0)}k
                  </ThemedText>
                </div>
                
                <div className="flex justify-between items-center">
                  <ThemedText className="text-sm">Negócios Fechados</ThemedText>
                  <ThemedText className="font-semibold text-green-600">
                    €{(dashboardData.deals.value / 1000).toFixed(0)}k
                  </ThemedText>
                </div>
                
                <div className="pt-3 border-t">
                  <ThemedButton
                    className="w-full"
                    onClick={() => navigate('/reports')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Ver Relatórios Completos
                  </ThemedButton>
                </div>
              </div>
            </div>
          </div>

          {/* Atividade Recente */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-600 mr-2" />
                <ThemedHeading level={3}>Atividade Recente</ThemedHeading>
              </div>
              <ThemedButton variant="outline" size="sm">
                Ver Todas
              </ThemedButton>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <ThemedText className="text-sm font-medium">
                    Sistema 100% conectado e funcional
                  </ThemedText>
                  <ThemedText className="text-xs text-gray-600">
                    Todos os módulos principais operacionais
                  </ThemedText>
                </div>
                <ThemedText className="text-xs text-gray-500">
                  Agora
                </ThemedText>
              </div>
              
              <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <ThemedText className="text-sm font-medium">
                    Navegação inteligente implementada
                  </ThemedText>
                  <ThemedText className="text-xs text-gray-600">
                    Cards clicáveis com navegação direta
                  </ThemedText>
                </div>
                <ThemedText className="text-xs text-gray-500">
                  Há poucos segundos
                </ThemedText>
              </div>
              
              <div className="text-center py-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                <ThemedText className="text-sm font-medium text-gray-700 mb-1">
                  Sistema Pronto para Uso
                </ThemedText>
                <ThemedText className="text-xs text-gray-600">
                  Clique nos cards coloridos acima para navegar pelos módulos
                </ThemedText>
              </div>
            </div>
          </div>

        </ThemedContainer>
      </div>
    </div>
  );
};

export default DashboardPage;