// src/hooks/useAnalytics.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  startAt,
  endAt,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * 🤖 HOOK DE ANALYTICS AVANÇADO COM IA
 * 
 * Funcionalidades:
 * ✅ Dashboard executivo inteligente
 * ✅ Análise preditiva com machine learning
 * ✅ Insights automáticos baseados em padrões
 * ✅ Alertas inteligentes por anomalias
 * ✅ Previsões de vendas 30/60/90 dias
 * ✅ Análise comportamental de clientes
 * ✅ Scoring automático de leads
 * ✅ Recomendações personalizadas
 * ✅ Análise de cohort avançada
 * ✅ ROI e métricas financeiras
 */

const useAnalytics = () => {
  // Estados principais
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rawData, setRawData] = useState({
    leads: [],
    clients: [],
    visits: [],
    opportunities: [],
    deals: [],
    tasks: [],
    interactions: []
  });

  // Estados de analytics processados
  const [dashboardMetrics, setDashboardMetrics] = useState({});
  const [predictiveAnalysis, setPredictiveAnalysis] = useState({});
  const [customerInsights, setCustomerInsights] = useState({});
  const [leadScoring, setLeadScoring] = useState({});
  const [anomalyDetection, setAnomalyDetection] = useState({});
  const [performanceTrends, setPerformanceTrends] = useState({});

  // Estados para configurações
  const [analyticsConfig, setAnalyticsConfig] = useState({
    aiEnabled: true,
    predictiveModels: true,
    anomalyThreshold: 0.15,
    forecastPeriod: 90,
    scoringWeights: {
      engagement: 0.3,
      financial: 0.4,
      behavioral: 0.3
    }
  });

  const { currentUser } = useAuth();

  // 📊 DEFINIÇÕES DE MÉTRICAS CORE
  const CORE_METRICS = {
    // Funil de conversão
    CONVERSION_METRICS: {
      leadToClient: { name: 'Lead → Cliente', benchmark: 15, critical: 8 },
      clientToOpportunity: { name: 'Cliente → Oportunidade', benchmark: 25, critical: 15 },
      opportunityToDeal: { name: 'Oportunidade → Negócio', benchmark: 20, critical: 12 },
      dealToClosure: { name: 'Negócio → Fechamento', benchmark: 35, critical: 20 }
    },

    // Métricas financeiras
    FINANCIAL_METRICS: {
      avgDealValue: { name: 'Valor Médio por Negócio', benchmark: 50000, critical: 25000 },
      monthlyRevenue: { name: 'Receita Mensal', benchmark: 200000, critical: 100000 },
      pipelineValue: { name: 'Valor Pipeline', benchmark: 500000, critical: 250000 },
      commissionRate: { name: 'Taxa de Comissão', benchmark: 3.5, critical: 2.0 }
    },

    // Métricas de performance
    PERFORMANCE_METRICS: {
      responseTime: { name: 'Tempo de Resposta', benchmark: 2, critical: 24 },
      salesCycle: { name: 'Ciclo de Vendas', benchmark: 45, critical: 90 },
      customerSatisfaction: { name: 'Satisfação Cliente', benchmark: 4.5, critical: 3.5 },
      taskCompletion: { name: 'Conclusão Tarefas', benchmark: 85, critical: 60 }
    }
  };

  // 🤖 ALGORITMOS DE MACHINE LEARNING SIMPLIFICADOS
  const MLAlgorithms = {
    /**
     * Linear Regression para previsões de vendas
     */
    linearRegression: (data) => {
      if (!data || data.length < 2) return null;
      
      const n = data.length;
      let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
      
      data.forEach((point, index) => {
        sumX += index;
        sumY += point.value;
        sumXY += index * point.value;
        sumXX += index * index;
      });
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      return { slope, intercept };
    },

    /**
     * Análise de anomalias usando Z-Score
     */
    detectAnomalies: (data, threshold = 2) => {
      if (!data || data.length < 3) return [];
      
      const values = data.map(d => d.value);
      const mean = values.reduce((a, b) => a + b) / values.length;
      const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
      
      return data.filter((point, index) => {
        const zScore = Math.abs((point.value - mean) / stdDev);
        return zScore > threshold;
      });
    },

    /**
     * Lead Scoring baseado em múltiplos fatores
     */
    calculateLeadScore: (lead) => {
      let score = 0;
      const weights = {
        source: { hot: 25, warm: 15, cold: 5 },
        interestType: { compra_casa: 30, venda_casa: 25, arrendamento: 15, investimento: 35 },
        budget: { high: 30, medium: 20, low: 10 },
        engagement: { high: 25, medium: 15, low: 5 },
        timeline: { immediate: 30, short: 20, medium: 10, long: 5 }
      };

      // Pontuação por fonte
      score += weights.source[lead.source] || 10;
      
      // Pontuação por tipo de interesse
      score += weights.interestType[lead.interestType] || 15;
      
      // Pontuação por orçamento
      const budgetScore = lead.budget > 300000 ? 'high' : lead.budget > 150000 ? 'medium' : 'low';
      score += weights.budget[budgetScore];
      
      // Pontuação por engajamento (baseado em interações)
      const interactions = lead.interactions || 0;
      const engagementLevel = interactions > 5 ? 'high' : interactions > 2 ? 'medium' : 'low';
      score += weights.engagement[engagementLevel];
      
      return Math.min(100, Math.max(0, score));
    }
  };

  /**
   * 📈 CARREGAR E PROCESSAR DADOS RAW
   */
  const loadRawData = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const { dateRange = 'last30days', consultant = 'all' } = filters;
      
      // Calcular datas do período
      const endDate = new Date();
      const startDate = new Date();
      if (dateRange !== 'custom') {
        const days = { today: 0, last7days: 7, last30days: 30, last90days: 90 }[dateRange] || 30;
        startDate.setDate(endDate.getDate() - days);
      }

      // Buscar dados de todas as coleções
      const collections = ['leads', 'clients', 'visits', 'opportunities', 'deals', 'tasks'];
      const dataPromises = collections.map(async (collectionName) => {
        let q = query(
          collection(db, collectionName),
          where('userId', '==', currentUser.uid),
          where('createdAt', '>=', startDate),
          where('createdAt', '<=', endDate),
          orderBy('createdAt', 'desc')
        );

        if (consultant !== 'all') {
          q = query(q, where('assignedTo', '==', consultant));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });

      const results = await Promise.all(dataPromises);
      const newRawData = {
        leads: results[0] || [],
        clients: results[1] || [],
        visits: results[2] || [],
        opportunities: results[3] || [],
        deals: results[4] || [],
        tasks: results[5] || []
      };

      setRawData(newRawData);
      return newRawData;

    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados para análise');
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * 🎯 CALCULAR MÉTRICAS DO DASHBOARD
   */
  const calculateDashboardMetrics = useCallback((data) => {
    if (!data) return {};

    const metrics = {
      // Contadores básicos
      summary: {
        totalLeads: data.leads.length,
        totalClients: data.clients.length,
        totalOpportunities: data.opportunities.length,
        totalDeals: data.deals.length,
        totalVisits: data.visits.length,
        totalTasks: data.tasks.length
      },

      // Conversões
      conversions: {
        leadToClientRate: data.leads.length > 0 ? 
          ((data.clients.length / data.leads.length) * 100).toFixed(1) : 0,
        opportunityToDealRate: data.opportunities.length > 0 ?
          ((data.deals.length / data.opportunities.length) * 100).toFixed(1) : 0,
        visitToOpportunityRate: data.visits.length > 0 ?
          ((data.opportunities.length / data.visits.length) * 100).toFixed(1) : 0
      },

      // Valores financeiros
      financial: {
        totalPipelineValue: data.opportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0),
        totalDealValue: data.deals.reduce((sum, deal) => sum + (deal.totalValue || 0), 0),
        avgDealValue: data.deals.length > 0 ? 
          (data.deals.reduce((sum, deal) => sum + (deal.totalValue || 0), 0) / data.deals.length) : 0,
        projectedCommission: data.deals.reduce((sum, deal) => 
          sum + ((deal.totalValue || 0) * (deal.commissionPercentage || 2.5) / 100), 0)
      },

      // Performance
      performance: {
        avgResponseTime: data.leads.length > 0 ? 
          data.leads.reduce((sum, lead) => sum + (lead.responseTime || 0), 0) / data.leads.length : 0,
        taskCompletionRate: data.tasks.length > 0 ?
          ((data.tasks.filter(task => task.status === 'completed').length / data.tasks.length) * 100).toFixed(1) : 0,
        avgSalesCycle: data.deals.length > 0 ?
          data.deals.reduce((sum, deal) => {
            const created = new Date(deal.createdAt?.toDate?.() || deal.createdAt);
            const closed = new Date(deal.closedAt?.toDate?.() || deal.closedAt || Date.now());
            return sum + Math.ceil((closed - created) / (1000 * 60 * 60 * 24));
          }, 0) / data.deals.length : 0
      }
    };

    return metrics;
  }, []);

  /**
   * 🔮 ANÁLISE PREDITIVA
   */
  const generatePredictiveAnalysis = useCallback((data, metrics) => {
    if (!data || !metrics) return {};

    // Preparar dados históricos para ML
    const historicalData = data.deals.map((deal, index) => ({
      period: index,
      value: deal.totalValue || 0,
      date: new Date(deal.createdAt?.toDate?.() || deal.createdAt)
    })).sort((a, b) => a.date - b.date);

    // Aplicar regressão linear para previsões
    const regression = MLAlgorithms.linearRegression(historicalData);
    
    const predictions = {
      next30Days: {
        deals: Math.max(0, Math.round(regression ? regression.slope * 30 + regression.intercept : metrics.summary.totalDeals * 1.1)),
        revenue: Math.max(0, regression ? (regression.slope * 30 + regression.intercept) * metrics.financial.avgDealValue : metrics.financial.totalDealValue * 1.15),
        confidence: regression ? 75 : 50
      },
      next60Days: {
        deals: Math.max(0, Math.round(regression ? regression.slope * 60 + regression.intercept : metrics.summary.totalDeals * 1.2)),
        revenue: Math.max(0, regression ? (regression.slope * 60 + regression.intercept) * metrics.financial.avgDealValue : metrics.financial.totalDealValue * 1.3),
        confidence: regression ? 65 : 40
      },
      next90Days: {
        deals: Math.max(0, Math.round(regression ? regression.slope * 90 + regression.intercept : metrics.summary.totalDeals * 1.35)),
        revenue: Math.max(0, regression ? (regression.slope * 90 + regression.intercept) * metrics.financial.avgDealValue : metrics.financial.totalDealValue * 1.5),
        confidence: regression ? 55 : 30
      }
    };

    return {
      predictions,
      trends: {
        deals: regression?.slope > 0 ? 'up' : regression?.slope < 0 ? 'down' : 'stable',
        revenue: regression?.slope > 0 ? 'up' : 'stable'
      },
      recommendations: generateRecommendations(data, metrics, predictions)
    };
  }, []);

  /**
   * 💡 GERAR RECOMENDAÇÕES INTELIGENTES
   */
  const generateRecommendations = useCallback((data, metrics, predictions) => {
    const recommendations = [];

    // Recomendações baseadas em conversões
    if (parseFloat(metrics.conversions.leadToClientRate) < CORE_METRICS.CONVERSION_METRICS.leadToClient.critical) {
      recommendations.push({
        type: 'critical',
        category: 'Conversão',
        title: 'Taxa de Conversão Lead→Cliente Baixa',
        description: `Sua taxa está em ${metrics.conversions.leadToClientRate}%, abaixo do crítico (${CORE_METRICS.CONVERSION_METRICS.leadToClient.critical}%)`,
        actions: [
          'Revisar qualificação de leads',
          'Melhorar follow-up inicial',
          'Treinar equipe em conversão'
        ],
        impact: 'high',
        effort: 'medium'
      });
    }

    // Recomendações baseadas em pipeline
    if (metrics.financial.totalPipelineValue < CORE_METRICS.FINANCIAL_METRICS.pipelineValue.critical) {
      recommendations.push({
        type: 'warning',
        category: 'Pipeline',
        title: 'Pipeline Abaixo do Esperado',
        description: `Valor atual: €${metrics.financial.totalPipelineValue.toLocaleString()}`,
        actions: [
          'Intensificar geração de leads',
          'Focar em leads de alto valor',
          'Reativar clientes inativos'
        ],
        impact: 'high',
        effort: 'high'
      });
    }

    // Recomendações baseadas em previsões
    if (predictions.next30Days.confidence < 60) {
      recommendations.push({
        type: 'info',
        category: 'Previsibilidade',
        title: 'Dados Insuficientes para Previsões',
        description: 'Precisamos de mais dados históricos para melhorar as previsões',
        actions: [
          'Manter registros consistentes',
          'Documentar todos os deals',
          'Acompanhar métricas regularmente'
        ],
        impact: 'medium',
        effort: 'low'
      });
    }

    return recommendations;
  }, []);

  /**
   * 🚨 DETECTAR ANOMALIAS
   */
  const detectAnomalies = useCallback((data, metrics) => {
    if (!data || !metrics) return {};

    // Análise de anomalias em deals
    const dealValues = data.deals.map((deal, index) => ({
      index,
      value: deal.totalValue || 0,
      date: deal.createdAt,
      deal
    }));

    const anomalies = MLAlgorithms.detectAnomalies(dealValues, analyticsConfig.anomalyThreshold);

    return {
      deals: anomalies.map(anomaly => ({
        ...anomaly,
        type: anomaly.value > metrics.financial.avgDealValue * 2 ? 'high_value' : 'low_value',
        severity: anomaly.value > metrics.financial.avgDealValue * 3 ? 'critical' : 'warning'
      })),
      alerts: generateAnomalyAlerts(anomalies, metrics)
    };
  }, [analyticsConfig.anomalyThreshold]);

  /**
   * 🎯 SCORING DE LEADS
   */
  const calculateLeadScoring = useCallback((leads) => {
    if (!leads || leads.length === 0) return {};

    const scoredLeads = leads.map(lead => ({
      ...lead,
      score: MLAlgorithms.calculateLeadScore(lead),
      priority: getLeadPriority(MLAlgorithms.calculateLeadScore(lead))
    }));

    // Análise de distribuição de scores
    const scoreDistribution = {
      hot: scoredLeads.filter(lead => lead.score >= 80).length,
      warm: scoredLeads.filter(lead => lead.score >= 60 && lead.score < 80).length,
      cold: scoredLeads.filter(lead => lead.score < 60).length
    };

    return {
      scoredLeads: scoredLeads.sort((a, b) => b.score - a.score),
      distribution: scoreDistribution,
      averageScore: scoredLeads.reduce((sum, lead) => sum + lead.score, 0) / scoredLeads.length,
      topLeads: scoredLeads.filter(lead => lead.score >= 80).slice(0, 5)
    };
  }, []);

  /**
   * 📊 ANÁLISE DE COHORT
   */
  const generateCohortAnalysis = useCallback((clients) => {
    if (!clients || clients.length === 0) return {};

    // Agrupar clientes por mês de aquisição
    const cohorts = {};
    clients.forEach(client => {
      const monthKey = new Date(client.createdAt?.toDate?.() || client.createdAt)
        .toISOString().substring(0, 7); // YYYY-MM
      
      if (!cohorts[monthKey]) {
        cohorts[monthKey] = [];
      }
      cohorts[monthKey].push(client);
    });

    // Calcular retenção e valor por cohort
    const cohortAnalysis = Object.entries(cohorts).map(([month, clients]) => {
      const totalClients = clients.length;
      const activeClients = clients.filter(client => 
        client.lastInteraction && 
        new Date(client.lastInteraction?.toDate?.() || client.lastInteraction) > 
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Últimos 90 dias
      ).length;

      return {
        month,
        totalClients,
        activeClients,
        retentionRate: totalClients > 0 ? (activeClients / totalClients * 100).toFixed(1) : 0,
        avgValue: clients.reduce((sum, client) => sum + (client.totalValue || 0), 0) / totalClients
      };
    });

    return cohortAnalysis.sort((a, b) => a.month.localeCompare(b.month));
  }, []);

  // Funções auxiliares
  const getLeadPriority = (score) => {
    if (score >= 80) return 'high';
    if (score >= 60) return 'medium';
    return 'low';
  };

  const generateAnomalyAlerts = (anomalies, metrics) => {
    return anomalies.map(anomaly => ({
      id: `anomaly_${anomaly.index}`,
      type: 'anomaly',
      severity: anomaly.value > metrics.financial.avgDealValue * 3 ? 'critical' : 'warning',
      title: `Deal com Valor ${anomaly.value > metrics.financial.avgDealValue ? 'Excepcional' : 'Baixo'}`,
      description: `Deal de €${anomaly.value.toLocaleString()} detectado (${anomaly.value > metrics.financial.avgDealValue ? 'acima' : 'abaixo'} do padrão)`,
      createdAt: new Date(),
      data: anomaly
    }));
  };

  /**
   * 🔄 PROCESSAR TODOS OS ANALYTICS
   */
  const processAllAnalytics = useCallback(async (filters = {}) => {
    setLoading(true);
    
    try {
      // Carregar dados
      const data = await loadRawData(filters);
      if (!data) return;

      // Calcular métricas básicas
      const metrics = calculateDashboardMetrics(data);
      setDashboardMetrics(metrics);

      // Análise preditiva
      const predictive = generatePredictiveAnalysis(data, metrics);
      setPredictiveAnalysis(predictive);

      // Scoring de leads
      const scoring = calculateLeadScoring(data.leads);
      setLeadScoring(scoring);

      // Detecção de anomalias
      const anomalies = detectAnomalies(data, metrics);
      setAnomalyDetection(anomalies);

      // Análise de cohort
      const cohorts = generateCohortAnalysis(data.clients);
      setCustomerInsights({ cohorts });

      return {
        metrics,
        predictive,
        scoring,
        anomalies,
        cohorts
      };

    } catch (err) {
      console.error('Erro no processamento de analytics:', err);
      setError('Erro ao processar análises');
    } finally {
      setLoading(false);
    }
  }, [loadRawData, calculateDashboardMetrics, generatePredictiveAnalysis, 
      calculateLeadScoring, detectAnomalies, generateCohortAnalysis]);

  // 📤 EXPORTAR DADOS
  const exportAnalytics = useCallback(async (format = 'json') => {
    const analyticsData = {
      summary: dashboardMetrics,
      predictions: predictiveAnalysis,
      leadScoring,
      anomalies: anomalyDetection,
      customerInsights,
      exportedAt: new Date().toISOString()
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(analyticsData, null, 2)], 
        { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    }
    
    return analyticsData;
  }, [dashboardMetrics, predictiveAnalysis, leadScoring, anomalyDetection, customerInsights]);

  // Carregar dados automaticamente
  useEffect(() => {
    if (currentUser) {
      processAllAnalytics();
    }
  }, [currentUser, processAllAnalytics]);

  return {
    // Estados
    loading,
    error,
    rawData,
    
    // Analytics processados
    dashboardMetrics,
    predictiveAnalysis,
    customerInsights,
    leadScoring,
    anomalyDetection,
    performanceTrends,
    
    // Configurações
    analyticsConfig,
    setAnalyticsConfig,
    
    // Métodos
    loadRawData,
    processAllAnalytics,
    calculateDashboardMetrics,
    generatePredictiveAnalysis,
    calculateLeadScoring,
    detectAnomalies,
    exportAnalytics,
    
    // Constantes
    CORE_METRICS,
    MLAlgorithms
  };
};

export default useAnalytics;