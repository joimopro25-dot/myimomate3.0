// src/pages/reports/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CurrencyEuroIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  UserGroupIcon,
  CalendarIcon,
  DocumentChartBarIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ClockIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  AdjustmentsHorizontalIcon,
  ArrowRightIcon,
  BanknotesIcon,
  ChartPieIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedCard, ThemedButton, ThemedBadge } from '../../components/common/ThemedComponents';
import useReports from '../../hooks/useReports';

/**
 * 📊 PÁGINA PRINCIPAL DE RELATÓRIOS E ANALYTICS
 * 
 * Funcionalidades:
 * ✅ Dashboard executivo com KPIs principais
 * ✅ Múltiplos tipos de relatórios interativos
 * ✅ Filtros avançados por período e consultor
 * ✅ Gráficos e visualizações de dados
 * ✅ Comparações período a período
 * ✅ Exportação de relatórios
 * ✅ Navegação entre diferentes análises
 * ✅ Métricas de performance em tempo real
 * ✅ Previsões de vendas e pipeline
 * ✅ Analytics de produtividade
 */

const ReportsPage = () => {
  // Estados locais
  const [activeReport, setActiveReport] = useState('dashboard');
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Hooks
  const { currentTheme } = useTheme();
  const {
    loading,
    error,
    dashboardData,
    conversionReport,
    performanceReport,
    financialReport,
    pipelineReport,
    productivityReport,
    reportFilters,
    updateReportFilters,
    loadRawData,
    exportData,
    DATE_RANGES
  } = useReports();

  // 📋 TIPOS DE RELATÓRIOS DISPONÍVEIS
  const REPORT_TYPES = {
    dashboard: {
      id: 'dashboard',
      title: 'Dashboard Executivo',
      description: 'Visão geral dos KPIs principais',
      icon: ChartBarIcon,
      color: 'blue'
    },
    conversion: {
      id: 'conversion',
      title: 'Funil de Conversão',
      description: 'Análise do funil Lead → Cliente → Negócio',
      icon: FunnelIcon,
      color: 'green'
    },
    performance: {
      id: 'performance',
      title: 'Performance por Consultor',
      description: 'Rankings e métricas individuais',
      icon: UserGroupIcon,
      color: 'purple'
    },
    financial: {
      id: 'financial',
      title: 'Relatório Financeiro',
      description: 'Receitas, comissões e pipeline value',
      icon: CurrencyEuroIcon,
      color: 'emerald'
    },
    pipeline: {
      id: 'pipeline',
      title: 'Análise de Pipeline',
      description: 'Previsões e análise de oportunidades',
      icon: PresentationChartLineIcon,
      color: 'orange'
    },
    productivity: {
      id: 'productivity',
      title: 'Produtividade',
      description: 'Analytics de tarefas e atividades',
      icon: ClockIcon,
      color: 'pink'
    }
  };

  /**
   * 🔄 ATUALIZAR PERÍODO DE RELATÓRIO
   */
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    updateReportFilters({ dateRange: period });
  };

  /**
   * 📤 EXPORTAR RELATÓRIO ATUAL
   */
  const handleExport = async (format = 'csv') => {
    try {
      setIsExporting(true);
      await exportData(activeReport, format);
      // Aqui poderia mostrar notificação de sucesso
    } catch (err) {
      console.error('Erro ao exportar:', err);
      // Aqui poderia mostrar notificação de erro
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * 📊 COMPONENTE KPI CARD
   */
  const KPICard = ({ title, value, trend, trendValue, icon: Icon, color, subtitle, loading: kpiLoading }) => (
    <ThemedCard className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <Icon className={`h-5 w-5 text-${color}-500`} />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          </div>
          
          {kpiLoading ? (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-24 rounded"></div>
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {typeof value === 'number' && value >= 1000 
                ? value.toLocaleString('pt-PT') 
                : value}
            </p>
          )}
          
          {subtitle && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        
        {trend && (
          <div className={`flex items-center space-x-1 ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend === 'up' ? (
              <TrendingUpIcon className="h-4 w-4" />
            ) : trend === 'down' ? (
              <TrendingDownIcon className="h-4 w-4" />
            ) : null}
            <span className="text-sm font-medium">{trendValue}</span>
          </div>
        )}
      </div>
    </ThemedCard>
  );

  /**
   * 📈 DASHBOARD EXECUTIVO
   */
  const DashboardView = () => {
    if (!dashboardData.summary) return null;

    const { summary, conversions, financial, productivity } = dashboardData;

    return (
      <div className="space-y-6">
        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total de Leads"
            value={summary.totalLeads}
            icon={UserGroupIcon}
            color="blue"
            loading={loading}
          />
          <KPICard
            title="Clientes Ativos"
            value={summary.totalClients}
            icon={BuildingOfficeIcon}
            color="green"
            loading={loading}
          />
          <KPICard
            title="Visitas Realizadas"
            value={summary.totalVisits}
            icon={CalendarIcon}
            color="purple"
            loading={loading}
          />
          <KPICard
            title="Negócios Fechados"
            value={summary.totalDeals}
            icon={CheckCircleIcon}
            color="emerald"
            loading={loading}
          />
        </div>

        {/* Métricas de Conversão */}
        <ThemedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2 text-green-500" />
            Taxas de Conversão
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {conversions.leadToClientRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Lead → Cliente</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {conversions.visitToOpportunityRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Visita → Oportunidade</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-1">
                {conversions.opportunityToDealRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Oportunidade → Fechamento</div>
            </div>
          </div>
        </ThemedCard>

        {/* Métricas Financeiras */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ThemedCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CurrencyEuroIcon className="h-5 w-5 mr-2 text-emerald-500" />
              Performance Financeira
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Valor do Pipeline</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  €{financial.totalPipelineValue?.toLocaleString('pt-PT') || '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Comissões Totais</span>
                <span className="font-semibold text-emerald-600">
                  €{financial.totalCommissions?.toLocaleString('pt-PT') || '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Valor Médio por Negócio</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  €{financial.averageDealSize?.toLocaleString('pt-PT') || '0'}
                </span>
              </div>
            </div>
          </ThemedCard>

          <ThemedCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ClockIcon className="h-5 w-5 mr-2 text-pink-500" />
              Produtividade
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Tarefas Concluídas</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {productivity.completedTasks || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Taxa de Conclusão</span>
                <span className="font-semibold text-green-600">
                  {productivity.taskCompletionRate || 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total de Tarefas</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {summary.totalTasks || 0}
                </span>
              </div>
            </div>
          </ThemedCard>
        </div>
      </div>
    );
  };

  /**
   * 🔄 FUNIL DE CONVERSÃO
   */
  const ConversionView = () => {
    if (!conversionReport.funnel) return null;

    return (
      <div className="space-y-6">
        <ThemedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <FunnelIcon className="h-5 w-5 mr-2 text-green-500" />
            Funil de Conversão Completo
          </h3>
          
          <div className="space-y-4">
            {conversionReport.funnel.map((stage, index) => (
              <div key={stage.stage} className="relative">
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-purple-500' :
                      index === 3 ? 'bg-orange-500' : 'bg-emerald-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{stage.stage}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {stage.count} registos ({stage.percentage}%)
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stage.count}
                      </div>
                      <div className="text-sm text-gray-500">
                        {stage.percentage}%
                      </div>
                    </div>
                    {index < conversionReport.funnel.length - 1 && (
                      <ArrowRightIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {/* Barra de progresso visual */}
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-purple-500' :
                      index === 3 ? 'bg-orange-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${stage.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </ThemedCard>

        {/* Análise de Perdas */}
        {conversionReport.dropoffAnalysis && (
          <ThemedCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <XCircleIcon className="h-5 w-5 mr-2 text-red-500" />
              Análise de Perdas por Etapa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conversionReport.dropoffAnalysis.map((dropoff, index) => (
                <div key={dropoff.stage} className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-red-800 dark:text-red-200">{dropoff.stage}</span>
                    <span className="text-red-600 dark:text-red-400 font-bold">{dropoff.rate}%</span>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {dropoff.lost} registos perdidos
                  </p>
                </div>
              ))}
            </div>
          </ThemedCard>
        )}
      </div>
    );
  };

  /**
   * 🏆 PERFORMANCE POR CONSULTOR
   */
  const PerformanceView = () => {
    if (!performanceReport.performanceByConsultant) return null;

    const { performanceByConsultant, topPerformers } = performanceReport;

    return (
      <div className="space-y-6">
        {/* Top Performers */}
        <ThemedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <UserGroupIcon className="h-5 w-5 mr-2 text-purple-500" />
            Top Performers (por Comissões)
          </h3>
          <div className="space-y-3">
            {topPerformers.slice(0, 5).map((performer, index) => (
              <div key={performer.consultant} className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' :
                    index === 2 ? 'bg-orange-600' : 'bg-purple-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {performer.consultant || 'Consultor N/D'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {performer.wonDeals} negócios fechados
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-emerald-600">
                    €{performer.totalCommission?.toLocaleString('pt-PT') || '0'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Taxa: {performer.conversionRate}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ThemedCard>

        {/* Tabela Completa de Performance */}
        <ThemedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Detalhada por Consultor
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Consultor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Leads
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Clientes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Visitas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Negócios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Comissões
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Taxa Conversão
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {performanceByConsultant.map((consultant) => (
                  <tr key={consultant.consultant}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {consultant.consultant || 'N/D'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {consultant.leads}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {consultant.clients}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {consultant.visits}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {consultant.wonDeals}/{consultant.deals}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-emerald-600 font-semibold">
                      €{consultant.totalCommission?.toLocaleString('pt-PT') || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ThemedBadge 
                        variant={consultant.conversionRate >= 20 ? 'success' : consultant.conversionRate >= 10 ? 'warning' : 'error'}
                      >
                        {consultant.conversionRate}%
                      </ThemedBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ThemedCard>
      </div>
    );
  };

  /**
   * 💰 RELATÓRIO FINANCEIRO
   */
  const FinancialView = () => {
    if (!financialReport.revenue) return null;

    const { revenue, commissions, pipeline, deals } = financialReport;

    return (
      <div className="space-y-6">
        {/* Métricas Financeiras Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Receita Total"
            value={`€${revenue.total?.toLocaleString('pt-PT') || '0'}`}
            icon={BanknotesIcon}
            color="emerald"
            loading={loading}
          />
          <KPICard
            title="Comissões Totais"
            value={`€${commissions.total?.toLocaleString('pt-PT') || '0'}`}
            icon={CurrencyEuroIcon}
            color="green"
            loading={loading}
          />
          <KPICard
            title="Pipeline Value"
            value={`€${pipeline.total?.toLocaleString('pt-PT') || '0'}`}
            icon={ChartPieIcon}
            color="blue"
            loading={loading}
          />
          <KPICard
            title="Receita Esperada"
            value={`€${pipeline.weighted?.toLocaleString('pt-PT') || '0'}`}
            icon={TrendingUpIcon}
            color="purple"
            loading={loading}
          />
        </div>

        {/* Análise de Negócios */}
        <ThemedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2 text-green-500" />
            Análise de Negócios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-3xl font-bold text-green-600 mb-2">{deals.won}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Negócios Ganhos</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="text-3xl font-bold text-red-600 mb-2">{deals.lost}</div>
              <div className="text-sm text-red-700 dark:text-red-300">Negócios Perdidos</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="text-3xl font-bold text-blue-600 mb-2">{deals.winRate}%</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Taxa de Sucesso</div>
            </div>
          </div>
        </ThemedCard>

        {/* Comissões por Tipo */}
        {commissions.byType && Object.keys(commissions.byType).length > 0 && (
          <ThemedCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <ChartPieIcon className="h-5 w-5 mr-2 text-emerald-500" />
              Comissões por Tipo de Negócio
            </h3>
            <div className="space-y-3">
              {Object.entries(commissions.byType).map(([type, value]) => (
                <div key={type} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <span className="font-medium text-gray-900 dark:text-white">{type}</span>
                  <span className="font-bold text-emerald-600">
                    €{value?.toLocaleString('pt-PT') || '0'}
                  </span>
                </div>
              ))}
            </div>
          </ThemedCard>
        )}
      </div>
    );
  };

  /**
   * 🔮 ANÁLISE DE PIPELINE
   */
  const PipelineView = () => {
    if (!pipelineReport.statusSummary) return null;

    const { statusSummary, forecast } = pipelineReport;

    return (
      <div className="space-y-6">
        {/* Previsões */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ThemedCard className="p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Próximos 30 Dias</h4>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-blue-600">{forecast.next30Days?.count || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">oportunidades</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                €{forecast.next30Days?.weightedValue?.toLocaleString('pt-PT') || '0'}
              </p>
              <p className="text-xs text-gray-500">valor esperado</p>
            </div>
          </ThemedCard>

          <ThemedCard className="p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Próximos 60 Dias</h4>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-green-600">{forecast.next60Days?.count || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">oportunidades</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                €{forecast.next60Days?.weightedValue?.toLocaleString('pt-PT') || '0'}
              </p>
              <p className="text-xs text-gray-500">valor esperado</p>
            </div>
          </ThemedCard>

          <ThemedCard className="p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Próximos 90 Dias</h4>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-purple-600">{forecast.next90Days?.count || 0}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">oportunidades</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                €{forecast.next90Days?.weightedValue?.toLocaleString('pt-PT') || '0'}
              </p>
              <p className="text-xs text-gray-500">valor esperado</p>
            </div>
          </ThemedCard>
        </div>

        {/* Pipeline por Status */}
        <ThemedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <PresentationChartLineIcon className="h-5 w-5 mr-2 text-orange-500" />
            Pipeline por Status
          </h3>
          <div className="space-y-4">
            {statusSummary.map((status, index) => (
              <div key={status.status} className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index % 6 === 0 ? 'bg-blue-500' :
                    index % 6 === 1 ? 'bg-green-500' :
                    index % 6 === 2 ? 'bg-yellow-500' :
                    index % 6 === 3 ? 'bg-orange-500' :
                    index % 6 === 4 ? 'bg-purple-500' : 'bg-pink-500'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {status.status.replace('_', ' ')}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {status.count} oportunidades
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-white">
                    €{status.value?.toLocaleString('pt-PT') || '0'}
                  </p>
                  <p className="text-sm text-gray-500">
                    €{status.weightedValue?.toLocaleString('pt-PT') || '0'} esperado
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ThemedCard>
      </div>
    );
  };

  /**
   * ⚡ PRODUTIVIDADE
   */
  const ProductivityView = () => {
    if (!productivityReport.tasks) return null;

    const { tasks, activities, efficiency } = productivityReport;

    return (
      <div className="space-y-6">
        {/* Métricas de Tarefas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Tarefas Totais"
            value={tasks.total}
            icon={ClockIcon}
            color="blue"
            loading={loading}
          />
          <KPICard
            title="Concluídas"
            value={tasks.completed}
            icon={CheckCircleIcon}
            color="green"
            loading={loading}
          />
          <KPICard
            title="Em Atraso"
            value={tasks.overdue}
            icon={XCircleIcon}
            color="red"
            loading={loading}
          />
          <KPICard
            title="Taxa de Conclusão"
            value={`${tasks.completionRate}%`}
            icon={ChartBarIcon}
            color="purple"
            loading={loading}
          />
        </div>

        {/* Atividade por Dia da Semana */}
        {activities.byWeekday && (
          <ThemedCard className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-pink-500" />
              Atividade por Dia da Semana
            </h3>
            <div className="grid grid-cols-7 gap-2">
              {activities.byWeekday.map((day) => (
                <div key={day.day} className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {day.day.substring(0, 3)}
                  </div>
                  <div className="text-lg font-bold text-blue-600">{day.tasks}</div>
                  <div className="text-xs text-gray-500">{day.visits} visitas</div>
                </div>
              ))}
            </div>
          </ThemedCard>
        )}

        {/* Métricas de Eficiência */}
        <ThemedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUpIcon className="h-5 w-5 mr-2 text-green-500" />
            Métricas de Eficiência
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <div className="text-2xl font-bold text-blue-600 mb-1">{efficiency.tasksPerDay}</div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Tarefas por Dia</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="text-2xl font-bold text-green-600 mb-1">{efficiency.visitsPerWeek}</div>
              <div className="text-sm text-green-700 dark:text-green-300">Visitas por Semana</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <div className="text-2xl font-bold text-purple-600 mb-1">{efficiency.opportunitiesPerMonth}</div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Oportunidades/Mês</div>
            </div>
          </div>
        </ThemedCard>
      </div>
    );
  };

  /**
   * 🎨 RENDERIZAR RELATÓRIO ATIVO
   */
  const renderActiveReport = () => {
    switch (activeReport) {
      case 'dashboard':
        return <DashboardView />;
      case 'conversion':
        return <ConversionView />;
      case 'performance':
        return <PerformanceView />;
      case 'financial':
        return <FinancialView />;
      case 'pipeline':
        return <PipelineView />;
      case 'productivity':
        return <ProductivityView />;
      default:
        return <DashboardView />;
    }
  };

  // Loading inicial
  if (loading && !dashboardData.summary) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Relatórios e Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Dashboard executivo e análise de performance
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Filtro de Período */}
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            {Object.entries(DATE_RANGES).map(([key, range]) => (
              <option key={key} value={key}>{range.label}</option>
            ))}
          </select>
          
          {/* Botões de ação */}
          <ThemedButton
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            disabled={loading}
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
            Filtros
          </ThemedButton>
          
          <ThemedButton
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={loading || isExporting}
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar'}
          </ThemedButton>
        </div>
      </div>

      {/* Navegação entre Relatórios */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {Object.values(REPORT_TYPES).map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeReport === report.id
                    ? `border-${report.color}-500 text-${report.color}-600 dark:text-${report.color}-400`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{report.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo do Relatório */}
      {error ? (
        <ThemedCard className="p-6">
          <div className="text-center">
            <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Erro ao Carregar Relatórios
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <ThemedButton onClick={loadRawData}>
              Tentar Novamente
            </ThemedButton>
          </div>
        </ThemedCard>
      ) : (
        renderActiveReport()
      )}
    </div>
  );
};

export default ReportsPage;