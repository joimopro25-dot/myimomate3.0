// src/pages/reports/ReportsPage.jsx - COM SIDEBAR REUTILIZÁVEL
// ✅ Aplicando Sidebar.jsx componente reutilizável
// ✅ Sistema completo de relatórios e analytics
// ✅ Interface profissional com métricas avançadas

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar'; // 🔥 NOVO IMPORT
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  ChartBarIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  CalendarIcon,
  ArrowTrendingUpIcon, // 🔥 CORRIGIDO: TrendingUpIcon → ArrowTrendingUpIcon
  ArrowTrendingDownIcon, // 🔥 CORRIGIDO: TrendingDownIcon → ArrowTrendingDownIcon
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Componente de Métrica Compacta
const CompactMetricCard = ({ title, value, trend, icon: Icon, color, onClick, change }) => {
  const { theme, isDark } = useTheme();
  
  const colorClasses = {
    blue: isDark() ? 'from-blue-600 to-blue-700' : 'from-blue-500 to-blue-600',
    green: isDark() ? 'from-green-600 to-green-700' : 'from-green-500 to-green-600',
    yellow: isDark() ? 'from-yellow-600 to-yellow-700' : 'from-yellow-500 to-yellow-600',
    purple: isDark() ? 'from-purple-600 to-purple-700' : 'from-purple-500 to-purple-600',
    red: isDark() ? 'from-red-600 to-red-700' : 'from-red-500 to-red-600'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-r ${colorClasses[color]} p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div className="text-white">
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <div className="flex items-center mt-1">
            {change && (
              <span className={`flex items-center text-xs ${change >= 0 ? 'text-green-100' : 'text-red-100'}`}>
                {change >= 0 ? (
                  <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />
                )}
                {Math.abs(change)}%
              </span>
            )}
            {trend && (
              <p className="text-xs opacity-75 ml-2">{trend}</p>
            )}
          </div>
        </div>
        <Icon className="h-8 w-8 text-white opacity-80" />
      </div>
    </div>
  );
};

const ReportsPage = () => {
  // Estados locais
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('this_month');
  const [reportType, setReportType] = useState('summary');
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');

  // Hooks
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();

  // Dados simulados de demonstração (em produção viriam de hooks de dados)
  const reportData = useMemo(() => {
    return {
      leads: {
        total: 245,
        new: 38,
        converted: 45,
        conversionRate: 18.4,
        change: 12.5
      },
      clients: {
        total: 89,
        active: 67,
        new: 12,
        retention: 85.2,
        change: 8.3
      },
      visits: {
        total: 156,
        completed: 134,
        scheduled: 22,
        completionRate: 85.9,
        change: -2.1
      },
      deals: {
        total: 34,
        closed: 18,
        value: 2450000,
        averageValue: 136111,
        change: 15.7
      },
      revenue: {
        total: 245000,
        commission: 73500,
        target: 300000,
        achievement: 81.7,
        change: 22.4
      },
      tasks: {
        total: 267,
        completed: 198,
        overdue: 12,
        completionRate: 74.2,
        change: 5.8
      }
    };
  }, [dateRange]);

  // 🔧 HANDLERS
  const handleExportReport = (format) => {
    setLoading(true);
    // Simular exportação
    setTimeout(() => {
      setLoading(false);
      setFeedbackMessage(`Relatório exportado em ${format.toUpperCase()} com sucesso!`);
      setFeedbackType('success');
      setTimeout(() => setFeedbackMessage(''), 3000);
    }, 2000);
  };

  const handleGenerateReport = () => {
    setLoading(true);
    // Simular geração de relatório
    setTimeout(() => {
      setLoading(false);
      setFeedbackMessage('Relatório atualizado com sucesso!');
      setFeedbackType('success');
      setTimeout(() => setFeedbackMessage(''), 3000);
    }, 1500);
  };

  // Tabs de navegação
  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: ChartBarIcon },
    { id: 'sales', label: 'Vendas', icon: CurrencyEuroIcon },
    { id: 'leads', label: 'Leads', icon: UserGroupIcon },
    { id: 'performance', label: 'Performance', icon: ArrowTrendingUpIcon }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 🎨 SIDEBAR REUTILIZÁVEL */}
      <Sidebar />

      {/* 📱 CONTEÚDO PRINCIPAL */}
      <div className="flex-1 ml-64"> {/* ml-64 para compensar sidebar fixa */}
        <ThemedContainer className="p-6">
          {/* 📊 HEADER */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Relatórios e Analytics</h1>
              <p className="text-gray-600">Análise de performance e métricas de negócio</p>
            </div>

            <div className="flex space-x-3">
              <ThemedButton
                onClick={handleGenerateReport}
                variant="outline"
                className="flex items-center"
                disabled={loading}
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </ThemedButton>
              
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="today">Hoje</option>
                  <option value="this_week">Esta Semana</option>
                  <option value="this_month">Este Mês</option>
                  <option value="last_month">Mês Anterior</option>
                  <option value="this_quarter">Este Trimestre</option>
                  <option value="this_year">Este Ano</option>
                  <option value="custom">Período Personalizado</option>
                </select>
              </div>

              <ThemedButton
                onClick={() => handleExportReport('pdf')}
                className="flex items-center"
                disabled={loading}
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Exportar PDF
              </ThemedButton>
            </div>
          </div>

          {/* FEEDBACK MESSAGES */}
          {feedbackMessage && (
            <div className={`p-4 rounded-lg mb-6 ${
              feedbackType === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {feedbackMessage}
            </div>
          )}

          {/* 📊 MÉTRICAS PRINCIPAIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <CompactMetricCard
              title="Total de Leads"
              value={reportData.leads.total}
              trend={`${reportData.leads.new} novos`}
              icon={UserGroupIcon}
              color="blue"
              change={reportData.leads.change}
              onClick={() => setActiveTab('leads')}
            />
            
            <CompactMetricCard
              title="Clientes Ativos"
              value={reportData.clients.active}
              trend={`${reportData.clients.retention}% retenção`}
              icon={UserGroupIcon}
              color="green"
              change={reportData.clients.change}
              onClick={() => setActiveTab('performance')}
            />
            
            <CompactMetricCard
              title="Negócios Fechados"
              value={reportData.deals.closed}
              trend={`€${(reportData.deals.averageValue / 1000).toFixed(0)}k média`}
              icon={CurrencyEuroIcon}
              color="purple"
              change={reportData.deals.change}
              onClick={() => setActiveTab('sales')}
            />
            
            <CompactMetricCard
              title="Receita Total"
              value={`€${(reportData.revenue.total / 1000).toFixed(0)}k`}
              trend={`${reportData.revenue.achievement}% da meta`}
              icon={ArrowTrendingUpIcon}
              color="yellow"
              change={reportData.revenue.change}
              onClick={() => setActiveTab('sales')}
            />
            
            <CompactMetricCard
              title="Taxa Conversão"
              value={`${reportData.leads.conversionRate}%`}
              trend="Lead → Cliente"
              icon={ArrowTrendingUpIcon}
              color="red"
              change={reportData.leads.change}
              onClick={() => setActiveTab('overview')}
            />
            
            <CompactMetricCard
              title="Visitas Concluídas"
              value={reportData.visits.completed}
              trend={`${reportData.visits.completionRate}% taxa`}
              icon={EyeIcon}
              color="blue"
              change={reportData.visits.change}
              onClick={() => setActiveTab('performance')}
            />
          </div>

          {/* 🏷️ TABS DE NAVEGAÇÃO */}
          <ThemedCard className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 p-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </ThemedCard>

          {/* 📊 CONTEÚDO DAS TABS */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Funil de Conversão */}
              <ThemedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Funil de Conversão</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Leads Totais</span>
                      <span className="font-medium">{reportData.leads.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{width: '100%'}}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Leads Qualificados</span>
                      <span className="font-medium">{Math.round(reportData.leads.total * 0.6)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{width: '60%'}}></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Clientes Convertidos</span>
                      <span className="font-medium">{reportData.leads.converted}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{width: '18%'}}></div>
                    </div>
                  </div>
                </div>
              </ThemedCard>

              {/* Atividade por Mês */}
              <ThemedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Atividade Mensal</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Tarefas Concluídas</span>
                      <span className="font-medium">{reportData.tasks.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Visitas Realizadas</span>
                      <span className="font-medium">{reportData.visits.completed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Novos Leads</span>
                      <span className="font-medium">{reportData.leads.new}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Negócios Fechados</span>
                      <span className="font-medium">{reportData.deals.closed}</span>
                    </div>
                  </div>
                </div>
              </ThemedCard>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Performance de Vendas */}
              <ThemedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Performance de Vendas</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Receita Total</span>
                      <span className="font-bold text-green-600">€{(reportData.revenue.total / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Comissões</span>
                      <span className="font-medium">€{(reportData.revenue.commission / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Meta Mensal</span>
                      <span className="font-medium">€{(reportData.revenue.target / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Cumprimento da Meta</span>
                      <span className="font-bold text-blue-600">{reportData.revenue.achievement}%</span>
                    </div>
                  </div>
                </div>
              </ThemedCard>

              {/* Análise de Negócios */}
              <ThemedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Análise de Negócios</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Negócios Ativos</span>
                      <span className="font-medium">{reportData.deals.total - reportData.deals.closed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxa de Fechamento</span>
                      <span className="font-medium">{Math.round((reportData.deals.closed / reportData.deals.total) * 100)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Valor Médio</span>
                      <span className="font-medium">€{(reportData.deals.averageValue / 1000).toFixed(0)}k</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Pipeline Total</span>
                      <span className="font-bold text-purple-600">€{((reportData.deals.total * reportData.deals.averageValue) / 1000000).toFixed(1)}M</span>
                    </div>
                  </div>
                </div>
              </ThemedCard>
            </div>
          )}

          {activeTab === 'leads' && (
            <ThemedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Análise de Leads</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{reportData.leads.total}</div>
                    <div className="text-sm text-gray-600">Total de Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{reportData.leads.converted}</div>
                    <div className="text-sm text-gray-600">Convertidos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{reportData.leads.conversionRate}%</div>
                    <div className="text-sm text-gray-600">Taxa de Conversão</div>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-medium mb-3">Origem dos Leads</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Website</span>
                      <span className="font-medium">45%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Referências</span>
                      <span className="font-medium">32%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Redes Sociais</span>
                      <span className="font-medium">23%</span>
                    </div>
                  </div>
                </div>
              </div>
            </ThemedCard>
          )}

          {activeTab === 'performance' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* KPIs de Performance */}
              <ThemedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">KPIs de Performance</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxa de Conclusão de Tarefas</span>
                      <span className="font-bold text-green-600">{reportData.tasks.completionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Taxa de Conclusão de Visitas</span>
                      <span className="font-bold text-blue-600">{reportData.visits.completionRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Retenção de Clientes</span>
                      <span className="font-bold text-purple-600">{reportData.clients.retention}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tarefas em Atraso</span>
                      <span className="font-bold text-red-600">{reportData.tasks.overdue}</span>
                    </div>
                  </div>
                </div>
              </ThemedCard>

              {/* Produtividade */}
              <ThemedCard>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Produtividade</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Leads por Dia</span>
                      <span className="font-medium">{Math.round(reportData.leads.new / 30)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Visitas por Semana</span>
                      <span className="font-medium">{Math.round(reportData.visits.completed / 4)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tarefas por Dia</span>
                      <span className="font-medium">{Math.round(reportData.tasks.completed / 30)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Negócios por Mês</span>
                      <span className="font-medium">{reportData.deals.closed}</span>
                    </div>
                  </div>
                </div>
              </ThemedCard>
            </div>
          )}

          {/* SEÇÃO DE EXPORTAÇÃO */}
          <ThemedCard className="mt-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Exportar Relatórios</h3>
              <div className="flex flex-wrap gap-3">
                <ThemedButton
                  onClick={() => handleExportReport('pdf')}
                  variant="outline"
                  disabled={loading}
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  PDF
                </ThemedButton>
                <ThemedButton
                  onClick={() => handleExportReport('excel')}
                  variant="outline"
                  disabled={loading}
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  Excel
                </ThemedButton>
                <ThemedButton
                  onClick={() => handleExportReport('csv')}
                  variant="outline"
                  disabled={loading}
                >
                  <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                  CSV
                </ThemedButton>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Os relatórios incluem todos os dados do período selecionado: {dateRange === 'this_month' ? 'Este Mês' : dateRange}
              </p>
            </div>
          </ThemedCard>

        </ThemedContainer>
      </div>
    </div>
  );
};

export default ReportsPage;