// src/pages/dashboard/DashboardPage.jsx - CORRIGIDO
// ✅ Navegação inteligente + Sidebar reutilizável  
// ✅ Cards clicáveis com métricas simuladas
// ✅ Layout harmonioso aplicado
// ✅ Tags JSX corrigidas
// ✅ Ícones Heroicons corrigidos

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/layout/Sidebar';
import { ThemedCard, ThemedButton, ThemedText, ThemedHeading } from '../../components/common/ThemedComponents';
import { 
  UserGroupIcon,
  UsersIcon,
  HomeIcon,
  BriefcaseIcon, // ✅ Substituído TargetIcon por BriefcaseIcon
  CurrencyEuroIcon,
  CheckCircleIcon,
  PlusIcon,
  ArrowRightIcon,
  BellIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { isDark } = useTheme();

  // Dados simulados de demonstração
  const metrics = {
    leads: { total: 245, new: 38, trend: '+15%' },
    clients: { total: 89, active: 67, trend: '+12%' },
    visits: { total: 156, scheduled: 22, trend: '+8%' },
    opportunities: { total: 45, high: 12, trend: '+25%' },
    deals: { total: 34, closed: 18, trend: '+18%' },
    revenue: { total: 245000, monthly: 68000, trend: '+22%' }
  };

  // Componente de Card Métrica
  const MetricCard = ({ title, value, subValue, trend, icon: Icon, color = 'blue', onClick }) => {
    const colorClasses = {
      blue: isDark() 
        ? 'from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600' 
        : 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
      green: isDark() 
        ? 'from-green-600 to-green-700 hover:from-green-500 hover:to-green-600' 
        : 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
      purple: isDark() 
        ? 'from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600' 
        : 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
      yellow: isDark() 
        ? 'from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600' 
        : 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
      red: isDark() 
        ? 'from-red-600 to-red-700 hover:from-red-500 hover:to-red-600' 
        : 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
      teal: isDark() 
        ? 'from-teal-600 to-teal-700 hover:from-teal-500 hover:to-teal-600' 
        : 'from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700'
    };

    return (
      <div 
        onClick={onClick}
        className={`
          relative overflow-hidden rounded-xl p-6 cursor-pointer
          bg-gradient-to-br ${colorClasses[color]}
          text-white shadow-lg hover:shadow-xl 
          transform hover:scale-105 transition-all duration-200
          group
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-white/80 mb-2">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm text-white/70">{subValue}</span>
              <span className="text-sm font-medium text-white bg-white/20 px-2 py-1 rounded-full">
                {trend}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <Icon className="h-12 w-12 text-white/80 group-hover:text-white transition-colors" />
          </div>
        </div>
        
        {/* Efeito hover */}
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        
        {/* Seta indicativa */}
        <ArrowRightIcon className="absolute bottom-4 right-4 h-5 w-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
      </div>
    );
  };

  // Quick Actions
  const quickActions = [
    {
      title: 'Novo Lead',
      description: 'Adicionar novo contacto',
      icon: UserGroupIcon,
      color: 'blue',
      action: () => navigate('/leads/new')
    },
    {
      title: 'Marcar Visita',
      description: 'Agendar nova visita',
      icon: CalendarIcon,
      color: 'green',
      action: () => navigate('/visits/new')
    },
    {
      title: 'Nova Tarefa',
      description: 'Criar follow-up',
      icon: CheckCircleIcon,
      color: 'purple',
      action: () => navigate('/tasks/new')
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Conteúdo Principal */}
      <div className="flex-1">
        <div className="p-6">
          {/* Header de Boas-vindas */}
          <div className="mb-8">
            <ThemedHeading level={1} className="text-3xl font-bold text-gray-900 mb-2">
              Olá, {userProfile?.name || 'Utilizador'}! 👋
            </ThemedHeading>
            <ThemedText className="text-lg text-gray-600">
              Aqui está o resumo do seu negócio hoje.
            </ThemedText>
          </div>

          {/* Cards de Métricas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <MetricCard
              title="Leads"
              value={metrics.leads.total}
              subValue={`${metrics.leads.new} novos`}
              trend={metrics.leads.trend}
              icon={UserGroupIcon}
              color="blue"
              onClick={() => navigate('/leads')}
            />
            
            <MetricCard
              title="Clientes"
              value={metrics.clients.total}
              subValue={`${metrics.clients.active} ativos`}
              trend={metrics.clients.trend}
              icon={UsersIcon}
              color="green"
              onClick={() => navigate('/clients')}
            />
            
            <MetricCard
              title="Visitas"
              value={metrics.visits.total}
              subValue={`${metrics.visits.scheduled} agendadas`}
              trend={metrics.visits.trend}
              icon={HomeIcon}
              color="purple"
              onClick={() => navigate('/visits')}
            />
            
            <MetricCard
              title="Oportunidades"
              value={metrics.opportunities.total}
              subValue={`${metrics.opportunities.high} alta prioridade`}
              trend={metrics.opportunities.trend}
              icon={BriefcaseIcon} // ✅ Corrigido: BriefcaseIcon em vez de TargetIcon
              color="yellow"
              onClick={() => navigate('/opportunities')}
            />
            
            <MetricCard
              title="Negócios"
              value={metrics.deals.total}
              subValue={`${metrics.deals.closed} fechados`}
              trend={metrics.deals.trend}
              icon={CheckCircleIcon}
              color="teal"
              onClick={() => navigate('/deals')}
            />
            
            <MetricCard
              title="Receita"
              value={`€${(metrics.revenue.total / 1000).toFixed(0)}k`}
              subValue={`€${(metrics.revenue.monthly / 1000).toFixed(0)}k este mês`}
              trend={metrics.revenue.trend}
              icon={CurrencyEuroIcon}
              color="red"
              onClick={() => navigate('/reports')}
            />
          </div>

          {/* Seção de Ações Rápidas e Atividade */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Ações Rápidas */}
            <ThemedCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <ThemedHeading level={3} className="text-lg font-semibold">
                    Ações Rápidas
                  </ThemedHeading>
                  <PlusIcon className="h-5 w-5 text-gray-400" />
                </div>
                
                <div className="space-y-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={index}
                        onClick={action.action}
                        className="w-full flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className={`p-2 rounded-lg mr-3 ${
                          action.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                          action.color === 'green' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{action.title}</p>
                          <p className="text-sm text-gray-500">{action.description}</p>
                        </div>
                        <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                      </button>
                    );
                  })}
                </div>
              </div>
            </ThemedCard>

            {/* Atividade Recente */}
            <ThemedCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <ThemedHeading level={3} className="text-lg font-semibold">
                    Atividade Recente
                  </ThemedHeading>
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
            </ThemedCard>

          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;