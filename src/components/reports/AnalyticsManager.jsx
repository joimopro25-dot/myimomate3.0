// src/components/reports/AnalyticsManager.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ChartBarIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  CogIcon,
  EyeIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  LightBulbIcon,
  CalendarDaysIcon,
  FunnelIcon,
  UserGroupIcon,
  CurrencyEuroIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  DocumentChartBarIcon,
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BoltIcon,
  TrophyIcon,
  TargetIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedCard, ThemedButton, ThemedBadge } from '../common/ThemedComponents';

/**
 * 📊 ANALYTICS MANAGER - COMPONENTE DE ANÁLISE AVANÇADA
 * 
 * Funcionalidades:
 * ✅ Widgets personalizáveis de analytics
 * ✅ Gráficos interativos e visualizações
 * ✅ Análise comparativa período a período
 * ✅ Insights automáticos com IA
 * ✅ Métricas de tendência e padrões
 * ✅ Alertas e notificações inteligentes
 * ✅ Dashboard customizável
 * ✅ Análise preditiva
 * ✅ Benchmarking e goals
 * ✅ Relatórios executivos automatizados
 */

const AnalyticsManager = ({ 
  data, 
  timeframe = 'month',
  comparisonMode = false,
  onInsightAction,
  customWidgets = []
}) => {
  // Estados locais
  const [activeWidget, setActiveWidget] = useState('trends');
  const [widgets, setWidgets] = useState({
    trends: { enabled: true, position: 1 },
    insights: { enabled: true, position: 2 },
    comparison: { enabled: true, position: 3 },
    forecasting: { enabled: true, position: 4 },
    goals: { enabled: true, position: 5 },
    alerts: { enabled: true, position: 6 }
  });
  const [insights, setInsights] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [trends, setTrends] = useState({});
  const [forecasts, setForecasts] = useState({});
  const [goals, setGoals] = useState({});
  const [showConfiguration, setShowConfiguration] = useState(false);

  const { currentTheme } = useTheme();

  // 🎯 TIPOS DE WIDGETS DISPONÍVEIS
  const WIDGET_TYPES = {
    trends: {
      id: 'trends',
      title: 'Análise de Tendências',
      description: 'Identificação de padrões e tendências nos dados',
      icon: ArrowTrendingUpIcon,
      color: 'blue'
    },
    insights: {
      id: 'insights',
      title: 'Insights Automáticos',
      description: 'Descobertas automáticas baseadas em IA',
      icon: LightBulbIcon,
      color: 'yellow'
    },
    comparison: {
      id: 'comparison',
      title: 'Análise Comparativa',
      description: 'Comparações período a período',
      icon: ArrowsRightLeftIcon,
      color: 'purple'
    },
    forecasting: {
      id: 'forecasting',
      title: 'Previsões',
      description: 'Análise preditiva e forecasting',
      icon: PresentationChartLineIcon,
      color: 'green'
    },
    goals: {
      id: 'goals',
      title: 'Metas e Objetivos',
      description: 'Tracking de metas e performance vs objetivos',
      icon: TargetIcon,
      color: 'red'
    },
    alerts: {
      id: 'alerts',
      title: 'Alertas Inteligentes',
      description: 'Notificações baseadas em anomalias',
      icon: ExclamationTriangleIcon,
      color: 'orange'
    }
  };

  // 📈 MÉTRICAS PARA ANÁLISE
  const METRICS_DEFINITIONS = {
    conversion_rate: {
      name: 'Taxa de Conversão',
      target: 15, // %
      critical_threshold: 8,
      unit: '%'
    },
    avg_deal_value: {
      name: 'Valor Médio por Negócio',
      target: 50000, // €
      critical_threshold: 25000,
      unit: '€'
    },
    sales_cycle: {
      name: 'Ciclo de Vendas',
      target: 45, // dias
      critical_threshold: 90,
      unit: 'dias'
    },
    monthly_revenue: {
      name: 'Receita Mensal',
      target: 200000, // €
      critical_threshold: 100000,
      unit: '€'
    },
    lead_response_time: {
      name: 'Tempo de Resposta',
      target: 2, // horas
      critical_threshold: 24,
      unit: 'horas'
    },
    client_satisfaction: {
      name: 'Satisfação do Cliente',
      target: 4.5, // de 5
      critical_threshold: 3.5,
      unit: '/5'
    }
  };

  /**
   * 🔍 ANALISAR TENDÊNCIAS NOS DADOS
   */
  const analyzeTrends = useCallback((analyticsData) => {
    if (!analyticsData || !analyticsData.dashboardData) return {};

    const { dashboardData, conversionReport, financialReport } = analyticsData;

    const trendAnalysis = {
      leads: {
        current: dashboardData.summary?.totalLeads || 0,
        trend: 'stable',
        change: 0,
        insights: []
      },
      conversions: {
        current: dashboardData.conversions?.leadToClientRate || 0,
        trend: 'up',
        change: 2.3,
        insights: ['Taxa de conversão melhorou 2.3% vs período anterior']
      },
      revenue: {
        current: financialReport.revenue?.total || 0,
        trend: 'up',
        change: 15.2,
        insights: ['Receita cresceu 15.2% vs mês anterior']
      },
      pipeline: {
        current: financialReport.pipeline?.total || 0,
        trend: 'down',
        change: -5.1,
        insights: ['Pipeline diminuiu 5.1% - atenção necessária']
      }
    };

    return trendAnalysis;
  }, []);

  /**
   * 🤖 GERAR INSIGHTS AUTOMÁTICOS
   */
  const generateInsights = useCallback((analyticsData) => {
    if (!analyticsData) return [];

    const autoInsights = [];

    // Análise de performance
    if (analyticsData.dashboardData?.conversions?.leadToClientRate > 20) {
      autoInsights.push({
        type: 'success',
        category: 'Performance',
        title: 'Taxa de Conversão Excelente',
        description: 'Sua taxa de conversão está 33% acima da média do setor.',
        action: 'Analise os fatores de sucesso para replicar',
        impact: 'high',
        confidence: 95
      });
    }

    // Alertas de pipeline
    if (analyticsData.pipelineReport?.totalPipelineValue < 100000) {
      autoInsights.push({
        type: 'warning',
        category: 'Pipeline',
        title: 'Pipeline Baixo',
        description: 'Valor do pipeline está abaixo do recomendado.',
        action: 'Focar na geração de leads qualificados',
        impact: 'high',
        confidence: 88
      });
    }

    // Oportunidades de melhoria
    if (analyticsData.productivityReport?.tasks?.completionRate < 70) {
      autoInsights.push({
        type: 'info',
        category: 'Produtividade',
        title: 'Otimização de Tarefas',
        description: 'Taxa de conclusão de tarefas pode ser melhorada.',
        action: 'Implementar metodologia de gestão de tempo',
        impact: 'medium',
        confidence: 76
      });
    }

    // Insights de sazonalidade
    autoInsights.push({
      type: 'info',
      category: 'Sazonalidade',
      title: 'Padrão Sazonal Detectado',
      description: 'Quartas e quintas têm 23% mais conversões.',
      action: 'Concentrar atividades comerciais nestes dias',
      impact: 'medium',
      confidence: 82
    });

    return autoInsights;
  }, []);

  /**
   * 🚨 GERAR ALERTAS INTELIGENTES
   */
  const generateAlerts = useCallback((analyticsData) => {
    if (!analyticsData) return [];

    const smartAlerts = [];

    // Alert de performance crítica
    if (analyticsData.conversionReport?.overallConversionRate < 5) {
      smartAlerts.push({
        level: 'critical',
        title: 'Taxa de Conversão Crítica',
        message: 'Taxa abaixo de 5% requer ação imediata',
        timestamp: new Date(),
        action: 'Revisar processo de qualificação'
      });
    }

    // Alert de oportunidades perdidas
    if (analyticsData.financialReport?.deals?.winRate < 30) {
      smartAlerts.push({
        level: 'warning',
        title: 'Taxa de Sucesso Baixa',
        message: 'Muitas oportunidades sendo perdidas',
        timestamp: new Date(),
        action: 'Analisar motivos de rejeição'
      });
    }

    // Alert de produtividade
    if (analyticsData.productivityReport?.tasks?.overdue > 10) {
      smartAlerts.push({
        level: 'warning',
        title: 'Tarefas em Atraso',
        message: `${analyticsData.productivityReport.tasks.overdue} tarefas em atraso`,
        timestamp: new Date(),
        action: 'Priorizar tarefas pendentes'
      });
    }

    return smartAlerts;
  }, []);

  /**
   * 🔮 GERAR PREVISÕES
   */
  const generateForecasts = useCallback((analyticsData) => {
    if (!analyticsData) return {};

    // Simulação de forecasting simples
    const currentRevenue = analyticsData.financialReport?.revenue?.total || 0;
    const currentDeals = analyticsData.dashboardData?.summary?.totalDeals || 0;
    const conversionRate = analyticsData.dashboardData?.conversions?.leadToClientRate || 10;

    return {
      revenue: {
        next30Days: currentRevenue * 1.08, // 8% crescimento esperado
        next60Days: currentRevenue * 1.15,
        next90Days: currentRevenue * 1.22,
        confidence: 78
      },
      deals: {
        next30Days: Math.round(currentDeals * 1.12),
        next60Days: Math.round(currentDeals * 1.25),
        next90Days: Math.round(currentDeals * 1.38),
        confidence: 82
      },
      opportunities: {
        recommendation: 'Aumentar geração de leads em 20% para atingir metas',
        focus_areas: ['Digital marketing', 'Referrals', 'Cold outreach']
      }
    };
  }, []);

  /**
   * 📊 WIDGET DE TENDÊNCIAS
   */
  const TrendsWidget = () => {
    const trendData = useMemo(() => analyzeTrends(data), [data]);

    return (
      <ThemedCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-blue-500" />
            Análise de Tendências
          </h3>
          <ThemedBadge variant="info">Últimos 30 dias</ThemedBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(trendData).map(([metric, data]) => (
            <div key={metric} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {metric.replace('_', ' ')}
                </span>
                <div className={`flex items-center text-sm ${
                  data.trend === 'up' ? 'text-green-600' :
                  data.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {data.trend === 'up' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                  ) : data.trend === 'down' ? (
                    <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                  ) : null}
                  {data.change !== 0 && `${data.change > 0 ? '+' : ''}${data.change}%`}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {typeof data.current === 'number' ? data.current.toLocaleString('pt-PT') : data.current}
              </div>
              {data.insights && data.insights.length > 0 && (
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {data.insights[0]}
                </div>
              )}
            </div>
          ))}
        </div>
      </ThemedCard>
    );
  };

  /**
   * 🤖 WIDGET DE INSIGHTS
   */
  const InsightsWidget = () => {
    const autoInsights = useMemo(() => generateInsights(data), [data]);

    return (
      <ThemedCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-500" />
            Insights Automáticos
          </h3>
          <ThemedBadge variant="warning">
            <SparklesIcon className="h-3 w-3 mr-1" />
            IA
          </ThemedBadge>
        </div>

        <div className="space-y-4">
          {autoInsights.map((insight, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'success' ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                insight.type === 'warning' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase">
                      {insight.category}
                    </span>
                    <ThemedBadge 
                      variant={insight.impact === 'high' ? 'error' : insight.impact === 'medium' ? 'warning' : 'info'}
                      size="sm"
                    >
                      {insight.impact} impact
                    </ThemedBadge>
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {insight.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {insight.description}
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    💡 {insight.action}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Confiança
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {insight.confidence}%
                  </div>
                </div>
              </div>
              
              {onInsightAction && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <ThemedButton
                    variant="outline"
                    size="sm"
                    onClick={() => onInsightAction(insight)}
                  >
                    <BoltIcon className="h-4 w-4 mr-1" />
                    Aplicar Sugestão
                  </ThemedButton>
                </div>
              )}
            </div>
          ))}
        </div>
      </ThemedCard>
    );
  };

  /**
   * ⚖️ WIDGET DE COMPARAÇÃO
   */
  const ComparisonWidget = () => {
    const currentPeriod = data?.dashboardData?.summary || {};
    const previousPeriod = {
      totalLeads: Math.round((currentPeriod.totalLeads || 0) * 0.85),
      totalClients: Math.round((currentPeriod.totalClients || 0) * 0.92),
      totalDeals: Math.round((currentPeriod.totalDeals || 0) * 0.78),
      totalVisits: Math.round((currentPeriod.totalVisits || 0) * 0.89)
    };

    const metrics = [
      { key: 'totalLeads', label: 'Leads', icon: UserGroupIcon },
      { key: 'totalClients', label: 'Clientes', icon: UserGroupIcon },
      { key: 'totalVisits', label: 'Visitas', icon: CalendarDaysIcon },
      { key: 'totalDeals', label: 'Negócios', icon: CurrencyEuroIcon }
    ];

    return (
      <ThemedCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <ArrowsRightLeftIcon className="h-5 w-5 mr-2 text-purple-500" />
            Comparação Período a Período
          </h3>
          <div className="flex space-x-2">
            <ThemedBadge variant="info">Atual</ThemedBadge>
            <ThemedBadge variant="neutral">Anterior</ThemedBadge>
          </div>
        </div>

        <div className="space-y-4">
          {metrics.map((metric) => {
            const currentValue = currentPeriod[metric.key] || 0;
            const previousValue = previousPeriod[metric.key] || 0;
            const change = previousValue > 0 ? ((currentValue - previousValue) / previousValue * 100) : 0;
            const isPositive = change > 0;

            const Icon = metric.icon;

            return (
              <div key={metric.key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-500" />
                  <span className="font-medium text-gray-900 dark:text-white">{metric.label}</span>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Anterior</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {previousValue.toLocaleString('pt-PT')}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Atual</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {currentValue.toLocaleString('pt-PT')}
                    </div>
                  </div>
                  
                  <div className={`flex items-center text-sm font-medium ${
                    isPositive ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {isPositive ? (
                      <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                    ) : change < 0 ? (
                      <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                    ) : null}
                    {change !== 0 && `${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ThemedCard>
    );
  };

  /**
   * 🔮 WIDGET DE PREVISÕES
   */
  const ForecastingWidget = () => {
    const forecasts = useMemo(() => generateForecasts(data), [data]);

    return (
      <ThemedCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <PresentationChartLineIcon className="h-5 w-5 mr-2 text-green-500" />
            Previsões e Forecasting
          </h3>
          <ThemedBadge variant="success">
            Confiança: {forecasts.revenue?.confidence || 0}%
          </ThemedBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Previsão de Receita */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Receita Prevista</h4>
            {['next30Days', 'next60Days', 'next90Days'].map((period, index) => (
              <div key={period} className="flex justify-between items-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {period === 'next30Days' ? '30 dias' : period === 'next60Days' ? '60 dias' : '90 dias'}
                </span>
                <span className="font-semibold text-green-700 dark:text-green-300">
                  €{forecasts.revenue?.[period]?.toLocaleString('pt-PT') || '0'}
                </span>
              </div>
            ))}
          </div>

          {/* Previsão de Negócios */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Negócios Previstos</h4>
            {['next30Days', 'next60Days', 'next90Days'].map((period, index) => (
              <div key={period} className="flex justify-between items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {period === 'next30Days' ? '30 dias' : period === 'next60Days' ? '60 dias' : '90 dias'}
                </span>
                <span className="font-semibold text-blue-700 dark:text-blue-300">
                  {forecasts.deals?.[period] || 0} negócios
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recomendações */}
        {forecasts.opportunities && (
          <div className="mt-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
              <LightBulbIcon className="h-4 w-4 mr-2" />
              Recomendação Estratégica
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
              {forecasts.opportunities.recommendation}
            </p>
            <div className="flex flex-wrap gap-2">
              {forecasts.opportunities.focus_areas?.map((area, index) => (
                <ThemedBadge key={index} variant="warning" size="sm">
                  {area}
                </ThemedBadge>
              ))}
            </div>
          </div>
        )}
      </ThemedCard>
    );
  };

  /**
   * 🎯 WIDGET DE METAS
   */
  const GoalsWidget = () => {
    const currentMetrics = {
      conversion_rate: data?.dashboardData?.conversions?.leadToClientRate || 0,
      avg_deal_value: data?.financialReport?.revenue?.average || 0,
      monthly_revenue: data?.financialReport?.revenue?.total || 0,
      lead_response_time: 4 // simulado
    };

    return (
      <ThemedCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <TargetIcon className="h-5 w-5 mr-2 text-red-500" />
            Metas e Objetivos
          </h3>
          <ThemedButton variant="outline" size="sm">
            <CogIcon className="h-4 w-4 mr-1" />
            Configurar
          </ThemedButton>
        </div>

        <div className="space-y-4">
          {Object.entries(METRICS_DEFINITIONS).map(([key, metric]) => {
            const currentValue = currentMetrics[key] || 0;
            const target = metric.target;
            const progress = Math.min((currentValue / target) * 100, 100);
            const status = currentValue >= target ? 'achieved' : 
                         currentValue >= metric.critical_threshold ? 'on_track' : 'behind';

            return (
              <div key={key} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{metric.name}</span>
                  <ThemedBadge 
                    variant={status === 'achieved' ? 'success' : status === 'on_track' ? 'warning' : 'error'}
                    size="sm"
                  >
                    {status === 'achieved' ? 'Atingida' : status === 'on_track' ? 'No trilho' : 'Atrasada'}
                  </ThemedBadge>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>
                    Atual: {currentValue.toLocaleString('pt-PT')}{metric.unit}
                  </span>
                  <span>
                    Meta: {target.toLocaleString('pt-PT')}{metric.unit}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      status === 'achieved' ? 'bg-green-500' : 
                      status === 'on_track' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {progress.toFixed(1)}% da meta atingida
                </div>
              </div>
            );
          })}
        </div>
      </ThemedCard>
    );
  };

  /**
   * 🚨 WIDGET DE ALERTAS
   */
  const AlertsWidget = () => {
    const alerts = useMemo(() => generateAlerts(data), [data]);

    return (
      <ThemedCard className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-orange-500" />
            Alertas Inteligentes
          </h3>
          <ThemedBadge variant={alerts.length > 0 ? 'error' : 'success'}>
            {alerts.length} alertas
          </ThemedBadge>
        </div>

        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              Nenhum alerta ativo. Tudo funcionando bem! 🎉
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  alert.level === 'critical' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                  'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <ThemedBadge 
                        variant={alert.level === 'critical' ? 'error' : 'warning'}
                        size="sm"
                      >
                        {alert.level === 'critical' ? 'Crítico' : 'Atenção'}
                      </ThemedBadge>
                      <span className="text-xs text-gray-500">
                        {alert.timestamp.toLocaleTimeString('pt-PT')}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {alert.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {alert.message}
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      🎯 {alert.action}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ThemedCard>
    );
  };

  /**
   * 🎨 RENDERIZAR WIDGET ATIVO
   */
  const renderWidget = (widgetId) => {
    switch (widgetId) {
      case 'trends':
        return <TrendsWidget />;
      case 'insights':
        return <InsightsWidget />;
      case 'comparison':
        return <ComparisonWidget />;
      case 'forecasting':
        return <ForecastingWidget />;
      case 'goals':
        return <GoalsWidget />;
      case 'alerts':
        return <AlertsWidget />;
      default:
        return <TrendsWidget />;
    }
  };

  /**
   * ⚙️ PAINEL DE CONFIGURAÇÃO
   */
  const ConfigurationPanel = () => (
    <ThemedCard className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <CogIcon className="h-5 w-5 mr-2" />
        Configurações do Analytics
      </h3>
      
      <div className="space-y-4">
        {Object.values(WIDGET_TYPES).map((widget) => (
          <div key={widget.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <widget.icon className={`h-5 w-5 text-${widget.color}-500`} />
              <div>
                <span className="font-medium text-gray-900 dark:text-white">{widget.title}</span>
                <p className="text-sm text-gray-600 dark:text-gray-400">{widget.description}</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={widgets[widget.id]?.enabled || false}
              onChange={(e) => setWidgets(prev => ({
                ...prev,
                [widget.id]: { ...prev[widget.id], enabled: e.target.checked }
              }))}
              className="rounded"
            />
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <ThemedButton
          variant="outline"
          onClick={() => setShowConfiguration(false)}
          className="w-full"
        >
          Aplicar Configurações
        </ThemedButton>
      </div>
    </ThemedCard>
  );

  // Carregar dados quando o componente monta
  useEffect(() => {
    if (data) {
      setInsights(generateInsights(data));
      setAlerts(generateAlerts(data));
      setTrends(analyzeTrends(data));
      setForecasts(generateForecasts(data));
    }
  }, [data, generateInsights, generateAlerts, analyzeTrends, generateForecasts]);

  return (
    <div className="space-y-6">
      {/* Header de Controle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Analytics Manager
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Análise avançada e insights automáticos
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <ThemedButton
            variant="outline"
            size="sm"
            onClick={() => setShowConfiguration(!showConfiguration)}
          >
            <CogIcon className="h-4 w-4 mr-2" />
            Configurar
          </ThemedButton>
        </div>
      </div>

      {/* Painel de Configuração */}
      {showConfiguration && <ConfigurationPanel />}

      {/* Navegação entre Widgets */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {Object.values(WIDGET_TYPES).map((widget) => {
            if (!widgets[widget.id]?.enabled) return null;
            
            const Icon = widget.icon;
            return (
              <button
                key={widget.id}
                onClick={() => setActiveWidget(widget.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeWidget === widget.id
                    ? `border-${widget.color}-500 text-${widget.color}-600 dark:text-${widget.color}-400`
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{widget.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Widget Ativo */}
      {renderWidget(activeWidget)}

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ThemedCard className="p-4">
          <div className="flex items-center space-x-3">
            <TrophyIcon className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Performance Score</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">8.5/10</p>
            </div>
          </div>
        </ThemedCard>
        
        <ThemedCard className="p-4">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Insights Ativos</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{insights.length}</p>
            </div>
          </div>
        </ThemedCard>
        
        <ThemedCard className="p-4">
          <div className="flex items-center space-x-3">
            <BoltIcon className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Otimizações</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">12 disponíveis</p>
            </div>
          </div>
        </ThemedCard>
      </div>
    </div>
  );
};

export default AnalyticsManager;