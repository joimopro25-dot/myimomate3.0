// src/pages/analytics/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  CurrencyEuroIcon, 
  TrendingUpIcon, 
  TrendingDownIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  AdjustmentsHorizontalIcon,
  ArrowDownTrayIcon,
  PresentationChartLineIcon,
  TargetIcon,
  BoltIcon,
  ArrowTrendingUpIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedCard, ThemedButton, ThemedBadge } from '../../components/common/ThemedComponents';
import useAnalytics from '../../hooks/useAnalytics';

/**
 * 📊 DASHBOARD EXECUTIVO COM IA E ANALYTICS AVANÇADOS
 */
const AnalyticsPage = () => {
  // Estados locais
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');
  const [showFilters, setShowFilters] = useState(false);
  const [widgetLayout, setWidgetLayout] = useState('grid');

  // Hooks
  const { currentTheme } = useTheme();
  const {
    loading,
    error,
    dashboardMetrics,
    predictiveAnalysis,
    leadScoring,
    anomalyDetection,
    processAllAnalytics,
    exportAnalytics
  } = useAnalytics();

  // Períodos disponíveis
  const PERIOD_OPTIONS = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'last7days', label: 'Últimos 7 dias' },
    { value: 'last30days', label: 'Últimos 30 dias' },
    { value: 'last90days', label: 'Últimos 90 dias' }
  ];

  // Recarregar dados quando período muda
  useEffect(() => {
    if (selectedPeriod && processAllAnalytics) {
      processAllAnalytics({ dateRange: selectedPeriod });
    }
  }, [selectedPeriod, processAllAnalytics]);

  // Widget de Resumo Executivo
  const SummaryWidget = () => (
    <ThemedCard className="p-6" theme={currentTheme}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-blue-500" />
          Resumo Executivo
        </h3>
        <ThemedBadge variant="success" theme={currentTheme}>
          {selectedPeriod === 'last30days' ? 'Últimos 30 dias' : 'Período Selecionado'}
        </ThemedBadge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {dashboardMetrics?.summary?.totalLeads || 0}
          </div>
          <div className="text-sm text-gray-600">Leads Captados</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {dashboardMetrics?.summary?.totalClients || 0}
          </div>
          <div className="text-sm text-gray-600">Clientes Ativos</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {dashboardMetrics?.summary?.totalOpportunities || 0}
          </div>
          <div className="text-sm text-gray-600">Oportunidades</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">
            {dashboardMetrics?.summary?.totalDeals || 0}
          </div>
          <div className="text-sm text-gray-600">Negócios Fechados</div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-indigo-600">
              €{(dashboardMetrics?.financial?.totalPipelineValue || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Valor Pipeline</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {dashboardMetrics?.conversions?.leadToClientRate || 0}%
            </div>
            <div className="text-sm text-gray-600">Taxa Conversão</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-600">
              €{(dashboardMetrics?.financial?.avgDealValue || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Valor Médio Deal</div>
          </div>
        </div>
      </div>
    </ThemedCard>
  );

  // Widget de Funil de Conversão
  const ConversionWidget = () => {
    const conversionData = [
      { 
        stage: 'Leads', 
        count: dashboardMetrics?.summary?.totalLeads || 0, 
        rate: 100,
        color: 'blue'
      },
      { 
        stage: 'Clientes', 
        count: dashboardMetrics?.summary?.totalClients || 0, 
        rate: parseFloat(dashboardMetrics?.conversions?.leadToClientRate || 0),
        color: 'green'
      },
      { 
        stage: 'Oportunidades', 
        count: dashboardMetrics?.summary?.totalOpportunities || 0, 
        rate: parseFloat(dashboardMetrics?.conversions?.visitToOpportunityRate || 0),
        color: 'purple'
      },
      { 
        stage: 'Negócios', 
        count: dashboardMetrics?.summary?.totalDeals || 0, 
        rate: parseFloat(dashboardMetrics?.conversions?.opportunityToDealRate || 0),
        color: 'emerald'
      }
    ];

    return (
      <ThemedCard className="p-6" theme={currentTheme}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-green-500" />
            Funil de Conversão
          </h3>
        </div>

        <div className="space-y-4">
          {conversionData.map((stage, index) => (
            <div key={stage.stage} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{stage.stage}</span>
                <div className="text-right">
                  <span className="font-semibold">{stage.count}</span>
                  <span className="text-sm text-gray-500 ml-2">({stage.rate.toFixed(1)}%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full bg-${stage.color}-500 transition-all duration-500`}
                  style={{ width: `${Math.max(stage.rate, 5)}%` }}
                />
              </div>
              {index < conversionData.length - 1 && (
                <div className="flex justify-center mt-2">
                  <TrendingDownIcon className="w-4 h-4 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </ThemedCard>
    );
  };

  // Widget Financeiro
  const FinancialWidget = () => (
    <ThemedCard className="p-6" theme={currentTheme}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CurrencyEuroIcon className="w-5 h-5 text-emerald-500" />
          Métricas Financeiras
        </h3>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
          <span className="font-medium">Valor Total Pipeline</span>
          <span className="text-xl font-bold text-emerald-600">
            €{(dashboardMetrics?.financial?.totalPipelineValue || 0).toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
          <span className="font-medium">Valor Total Deals</span>
          <span className="text-xl font-bold text-blue-600">
            €{(dashboardMetrics?.financial?.totalDealValue || 0).toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
          <span className="font-medium">Comissões Projetadas</span>
          <span className="text-xl font-bold text-purple-600">
            €{(dashboardMetrics?.financial?.projectedCommission || 0).toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">
              €{(dashboardMetrics?.financial?.avgDealValue || 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Valor Médio Deal</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-800">
              {dashboardMetrics?.performance?.avgSalesCycle || 0} dias
            </div>
            <div className="text-sm text-gray-600">Ciclo Vendas Médio</div>
          </div>
        </div>
      </div>
    </ThemedCard>
  );

  // Widget de Previsões IA
  const PredictionsWidget = () => (
    <ThemedCard className="p-6" theme={currentTheme}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <PresentationChartLineIcon className="w-5 h-5 text-purple-500" />
          Previsões IA
        </h3>
        <ThemedBadge variant="info" theme={currentTheme}>
          <BoltIcon className="w-3 h-3 mr-1" />
          IA Ativa
        </ThemedBadge>
      </div>

      <div className="space-y-4">
        {predictiveAnalysis?.predictions && Object.entries(predictiveAnalysis.predictions).length > 0 ? (
          Object.entries(predictiveAnalysis.predictions).map(([period, data]) => (
            <div key={period} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium capitalize">
                  {period.replace('next', 'Próximos ').replace('Days', ' Dias')}
                </h4>
                <div className="flex items-center gap-2">
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    data.confidence > 70 ? 'bg-green-100 text-green-800' :
                    data.confidence > 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {data.confidence}% confiança
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-lg font-semibold text-blue-600">{data.deals}</div>
                  <div className="text-sm text-gray-600">Deals Previstos</div>
                </div>
                <div>
                  <div className="text-lg font-semibold text-emerald-600">
                    €{data.revenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Receita Prevista</div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <PresentationChartLineIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Processando previsões IA...</p>
            <p className="text-sm">Aguarde enquanto analisamos dados históricos</p>
          </div>
        )}

        {predictiveAnalysis?.trends && (
          <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUpIcon className="w-4 h-4 text-indigo-500" />
              <span className="font-medium text-indigo-800">Tendências Detectadas</span>
            </div>
            <div className="text-sm text-indigo-700">
              Deals: {predictiveAnalysis.trends.deals === 'up' ? '📈 Crescimento' : 
                     predictiveAnalysis.trends.deals === 'down' ? '📉 Declínio' : '➡️ Estável'}
              <br />
              Receita: {predictiveAnalysis.trends.revenue === 'up' ? '📈 Crescimento' : '➡️ Estável'}
            </div>
          </div>
        )}
      </div>
    </ThemedCard>
  );

  // Widget de Lead Scoring
  const LeadScoringWidget = () => (
    <ThemedCard className="p-6" theme={currentTheme}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <TargetIcon className="w-5 h-5 text-orange-500" />
          Lead Scoring
        </h3>
      </div>

      {leadScoring?.distribution ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {leadScoring.distribution.hot || 0}
              </div>
              <div className="text-sm text-red-700">Hot Leads (80+)</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {leadScoring.distribution.warm || 0}
              </div>
              <div className="text-sm text-yellow-700">Warm Leads (60-79)</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {leadScoring.distribution.cold || 0}
              </div>
              <div className="text-sm text-gray-700">Cold Leads (menor que 60)</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Score Médio</span>
              <span className="text-lg font-bold">
                {(leadScoring.averageScore || 0).toFixed(1)}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-500"
                style={{ width: `${leadScoring.averageScore || 0}%` }}
              />
            </div>
          </div>

          {leadScoring.topLeads && leadScoring.topLeads.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">🔥 Top 3 Leads</h4>
              <div className="space-y-2">
                {leadScoring.topLeads.slice(0, 3).map((lead, index) => (
                  <div key={lead.id || index} className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <span className="font-medium">{lead.name}</span>
                    <ThemedBadge variant="warning" theme={currentTheme}>
                      {lead.score}/100
                    </ThemedBadge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          <TargetIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Calculando scoring de leads...</p>
          <p className="text-sm">Aguarde enquanto processamos os dados</p>
        </div>
      )}
    </ThemedCard>
  );

  // Widget de Alertas e Anomalias
  const AnomaliesWidget = () => (
    <ThemedCard className="p-6" theme={currentTheme}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
          Alertas e Anomalias
        </h3>
        {anomalyDetection?.deals && anomalyDetection.deals.length > 0 && (
          <ThemedBadge variant="error" theme={currentTheme}>
            {anomalyDetection.deals.length} alertas
          </ThemedBadge>
        )}
      </div>

      <div className="space-y-3">
        {anomalyDetection?.alerts && anomalyDetection.alerts.length > 0 ? (
          anomalyDetection.alerts.slice(0, 5).map((alert, index) => (
            <div
              key={alert.id || index}
              className={`p-3 rounded-lg border-l-4 ${
                alert.severity === 'critical' 
                  ? 'bg-red-50 border-red-500' 
                  : 'bg-yellow-50 border-yellow-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm">{alert.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{alert.description}</div>
                </div>
                <ThemedBadge 
                  variant={alert.severity === 'critical' ? 'error' : 'warning'}
                  theme={currentTheme}
                >
                  {alert.severity}
                </ThemedBadge>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Nenhuma anomalia detectada</p>
            <p className="text-sm">Sistema funcionando normalmente</p>
          </div>
        )}
      </div>
    </ThemedCard>
  );

  // Widget de Insights Automáticos
  const InsightsWidget = () => (
    <ThemedCard className="p-6" theme={currentTheme}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <LightBulbIcon className="w-5 h-5 text-yellow-500" />
          Insights Automáticos
        </h3>
      </div>

      <div className="space-y-4">
        {predictiveAnalysis?.recommendations && predictiveAnalysis.recommendations.length > 0 ? (
          predictiveAnalysis.recommendations.slice(0, 3).map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'critical' ? 'bg-red-50 border-red-500' :
                insight.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">{insight.title}</h4>
                <ThemedBadge variant={insight.type} theme={currentTheme}>
                  {insight.category}
                </ThemedBadge>
              </div>
              <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
              
              {insight.actions && insight.actions.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Ações Recomendadas:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {insight.actions.slice(0, 2).map((action, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full" />
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-6 text-gray-500">
            <LightBulbIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>Gerando insights...</p>
            <p className="text-sm">Aguarde enquanto analisamos seus dados</p>
          </div>
        )}
      </div>
    </ThemedCard>
  );

  // Lista de widgets disponíveis
  const defaultWidgets = ['summary', 'conversions', 'financials', 'predictions', 'leadScoring', 'anomalies', 'insights'];

  // Função para renderizar widgets
  const renderWidget = (widgetId) => {
    switch (widgetId) {
      case 'summary': 
        return <SummaryWidget />;
      case 'conversions': 
        return <ConversionWidget />;
      case 'financials': 
        return <FinancialWidget />;
      case 'predictions': 
        return <PredictionsWidget />;
      case 'leadScoring': 
        return <LeadScoringWidget />;
      case 'anomalies': 
        return <AnomaliesWidget />;
      case 'insights': 
        return <InsightsWidget />;
      default: 
        return null;
    }
  };

  // Funções de ação
  const handleExport = async () => {
    try {
      if (exportAnalytics) {
        await exportAnalytics('json');
      }
    } catch (err) {
      console.error('Erro ao exportar:', err);
    }
  };

  const handleRefresh = () => {
    if (processAllAnalytics) {
      processAllAnalytics({ dateRange: selectedPeriod });
    }
  };

  // Estados de loading e erro
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Processando analytics com IA...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Erro no Analytics</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <ThemedButton onClick={handleRefresh} theme={currentTheme}>
            Tentar Novamente
          </ThemedButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <ChartBarIcon className="w-8 h-8 text-blue-500" />
              Analytics e IA
            </h1>
            <p className="text-gray-600">
              Dashboard executivo com insights automáticos e previsões inteligentes
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 md:mt-0">
            {/* Seletor de período */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {PERIOD_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Botões de ação */}
            <ThemedButton
              onClick={handleRefresh}
              variant="outline"
              theme={currentTheme}
              className="flex items-center gap-2"
            >
              <ArrowTrendingUpIcon className="w-4 h-4" />
              Atualizar
            </ThemedButton>

            <ThemedButton
              onClick={handleExport}
              variant="outline"
              theme={currentTheme}
              className="flex items-center gap-2"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              Exportar
            </ThemedButton>

            <ThemedButton
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              theme={currentTheme}
              className="flex items-center gap-2"
            >
              <AdjustmentsHorizontalIcon className="w-4 h-4" />
              Filtros
            </ThemedButton>
          </div>
        </div>

        {/* Indicadores de status IA */}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">IA Ativa</span>
          </div>
          
          {predictiveAnalysis?.predictions && (
            <div className="flex items-center gap-2">
              <BoltIcon className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600">
                Previsões atualizadas há {new Date().toLocaleTimeString()}
              </span>
            </div>
          )}

          {leadScoring?.averageScore && (
            <div className="flex items-center gap-2">
              <TargetIcon className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-600">
                Score médio: {leadScoring.averageScore.toFixed(1)}/100
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filtros avançados */}
      {showFilters && (
        <ThemedCard className="p-4 mb-6" theme={currentTheme}>
          <h3 className="font-semibold mb-3">Filtros Avançados</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comparação
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="none">Sem comparação</option>
                <option value="previous">Período anterior</option>
                <option value="year">Mesmo período ano passado</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consultor
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="all">Todos os consultores</option>
                <option value="user1">João Silva</option>
                <option value="user2">Maria Santos</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Negócio
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                <option value="all">Todos os tipos</option>
                <option value="compra">Compra</option>
                <option value="venda">Venda</option>
                <option value="arrendamento">Arrendamento</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Layout
              </label>
              <select 
                value={widgetLayout}
                onChange={(e) => setWidgetLayout(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="grid">Grade</option>
                <option value="list">Lista</option>
                <option value="compact">Compacto</option>
              </select>
            </div>
          </div>
        </ThemedCard>
      )}

      {/* Grid de widgets */}
      <div className={`grid gap-6 ${
        widgetLayout === 'grid' ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3' :
        widgetLayout === 'list' ? 'grid-cols-1' :
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
      }`}>
        {defaultWidgets.map(widgetId => (
          <div key={widgetId}>
            {renderWidget(widgetId)}
          </div>
        ))}
      </div>

      {/* Resumo executivo na parte inferior */}
      <div className="mt-8">
        <ThemedCard className="p-6" theme={currentTheme}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <LightBulbIcon className="w-5 h-5 text-yellow-500" />
            Resumo Executivo IA
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Performance geral */}
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {dashboardMetrics?.conversions?.leadToClientRate 
                  ? parseFloat(dashboardMetrics.conversions.leadToClientRate) > 15 ? '🎯' : '⚠️'
                  : '📊'
                }
              </div>
              <h4 className="font-semibold text-blue-800">Performance de Conversão</h4>
              <p className="text-sm text-blue-700 mt-1">
                {dashboardMetrics?.conversions?.leadToClientRate 
                  ? parseFloat(dashboardMetrics.conversions.leadToClientRate) > 15 
                    ? 'Excelente! Acima da média do mercado'
                    : 'Oportunidade de melhoria identificada'
                  : 'Aguardando dados para análise'
                }
              </p>
            </div>

            {/* Saúde do pipeline */}
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600 mb-2">
                {dashboardMetrics?.financial?.totalPipelineValue 
                  ? dashboardMetrics.financial.totalPipelineValue > 250000 ? '💰' : '📈'
                  : '🔍'
                }
              </div>
              <h4 className="font-semibold text-emerald-800">Saúde do Pipeline</h4>
              <p className="text-sm text-emerald-700 mt-1">
                {dashboardMetrics?.financial?.totalPipelineValue 
                  ? dashboardMetrics.financial.totalPipelineValue > 250000
                    ? 'Pipeline robusto e saudável'
                    : 'Focar na geração de oportunidades'
                  : 'Carregando análise do pipeline'
                }
              </p>
            </div>

            {/* Previsão IA */}
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {predictiveAnalysis?.predictions?.next30Days?.confidence 
                  ? predictiveAnalysis.predictions.next30Days.confidence > 70 ? '🤖' : '🔮'
                  : '⏳'
                }
              </div>
              <h4 className="font-semibold text-purple-800">Previsão IA</h4>
              <p className="text-sm text-purple-700 mt-1">
                {predictiveAnalysis?.predictions?.next30Days?.confidence 
                  ? predictiveAnalysis.predictions.next30Days.confidence > 70
                    ? 'Previsões de alta confiança disponíveis'
                    : 'Coletando mais dados para melhor precisão'
                  : 'Processando dados históricos'
                }
              </p>
            </div>
          </div>
        </ThemedCard>
      </div>
    </div>
  );
};

export default AnalyticsPage;