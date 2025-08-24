// src/hooks/useAnalytics.js
// 🤖 HOOK DE ANALYTICS AVANÇADO COM IA - MyImoMate 3.0 MULTI-TENANT
// ================================================================
// VERSÃO MIGRADA: Multi-tenant + Machine Learning + Analytics completo
// Funcionalidades: Dashboard inteligente, Análise preditiva, Insights automáticos, Scoring leads
// Data: Agosto 2025 | Versão: 3.1 Multi-Tenant

import { useState, useEffect, useCallback, useMemo } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

// 🏗️ IMPORTS DO SISTEMA MULTI-TENANT
import firebaseService, { 
  SUBCOLLECTIONS, 
  createCRUDHelpers,
  useFirebaseService 
} from '../utils/FirebaseService';

// 🎯 CONFIGURAÇÕES DO HOOK MULTI-TENANT
const LEADS_SUBCOLLECTION = SUBCOLLECTIONS.LEADS;
const CLIENTS_SUBCOLLECTION = SUBCOLLECTIONS.CLIENTS;
const VISITS_SUBCOLLECTION = SUBCOLLECTIONS.VISITS;
const OPPORTUNITIES_SUBCOLLECTION = SUBCOLLECTIONS.OPPORTUNITIES;
const DEALS_SUBCOLLECTION = SUBCOLLECTIONS.DEALS;
const TASKS_SUBCOLLECTION = SUBCOLLECTIONS.TASKS;

/**
 * 🤖 HOOK DE ANALYTICS AVANÇADO COM IA MULTI-TENANT
 * 
 * Funcionalidades:
 * ✅ Dashboard executivo inteligente isolado por utilizador
 * ✅ Análise preditiva com machine learning
 * ✅ Insights automáticos baseados em padrões individuais
 * ✅ Alertas inteligentes por anomalias pessoais
 * ✅ Previsões de vendas 30/60/90 dias personalizadas
 * ✅ Análise comportamental de clientes individual
 * ✅ Scoring automático de leads baseado no histórico
 * ✅ Recomendações personalizadas por consultor
 * ✅ Análise de cohort individual
 * ✅ ROI e métricas financeiras isoladas
 */

const useAnalytics = () => {
  // 🔐 AUTENTICAÇÃO E INICIALIZAÇÃO MULTI-TENANT
  const { currentUser: user, userProfile } = useAuth();
  const fbService = useFirebaseService(user);
  
  // 📊 STATES PRINCIPAIS
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

  // 🔐 VERIFICAR SE UTILIZADOR ESTÁ PRONTO
  const isUserReady = user && user.uid && fbService;

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

      data.forEach((point, i) => {
        const x = i; // índice como tempo
        const y = point.value || 0;
        sumX += x;
        sumY += y;
        sumXY += x * y;
        sumXX += x * x;
      });

      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;

      return { slope, intercept, correlation: Math.abs(slope) / (Math.max(data.map(p => p.value || 0)) || 1) };
    },

    /**
     * Detectar anomalias usando Z-score
     */
    detectAnomalies: (data, threshold = 2) => {
      if (!data || data.length < 3) return [];
      
      const values = data.map(d => d.value || 0);
      const mean = values.reduce((a, b) => a + b) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2)) / values.length;
      const stdDev = Math.sqrt(variance);

      return data.filter(d => {
        const zScore = Math.abs(((d.value || 0) - mean) / stdDev);
        return zScore > threshold;
      });
    },

    /**
     * Clustering simples para segmentação de clientes
     */
    kMeansClustering: (data, k = 3) => {
      if (!data || data.length < k) return [];

      // Simplificação: agrupar por valor
      const sorted = [...data].sort((a, b) => (a.value || 0) - (b.value || 0));
      const chunkSize = Math.ceil(sorted.length / k);
      
      return Array.from({ length: k }, (_, i) => ({
        cluster: i,
        items: sorted.slice(i * chunkSize, (i + 1) * chunkSize),
        centroid: sorted.slice(i * chunkSize, (i + 1) * chunkSize)
          .reduce((sum, item) => sum + (item.value || 0), 0) / chunkSize
      }));
    }
  };

  /**
   * 📈 CARREGAR E PROCESSAR DADOS RAW (MULTI-TENANT)
   */
  const loadRawData = useCallback(async (filters = {}) => {
    if (!isUserReady) return null;
    
    setLoading(true);
    setError(null);

    try {
      console.log('🤖 Carregando dados para analytics multi-tenant...');

      const { dateRange = 'last30days', consultant = 'all' } = filters;
      
      // Calcular datas do período
      const endDate = new Date();
      const startDate = new Date();
      if (dateRange !== 'custom') {
        const days = { today: 0, last7days: 7, last30days: 30, last90days: 90 }[dateRange] || 30;
        startDate.setDate(endDate.getDate() - days);
      }

      // Construir query options para cada subcoleção
      const queryOptions = {
        where: [
          { field: 'createdAt', operator: '>=', value: startDate },
          { field: 'createdAt', operator: '<=', value: endDate }
        ],
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
        limit: 1000
      };

      // Buscar dados de todas as subcoleções do utilizador
      const [
        leadsResult,
        clientsResult,
        visitsResult,
        opportunitiesResult,
        dealsResult,
        tasksResult
      ] = await Promise.all([
        fbService.getDocuments(LEADS_SUBCOLLECTION, queryOptions),
        fbService.getDocuments(CLIENTS_SUBCOLLECTION, queryOptions),
        fbService.getDocuments(VISITS_SUBCOLLECTION, queryOptions),
        fbService.getDocuments(OPPORTUNITIES_SUBCOLLECTION, queryOptions),
        fbService.getDocuments(DEALS_SUBCOLLECTION, queryOptions),
        fbService.getDocuments(TASKS_SUBCOLLECTION, queryOptions)
      ]);

      // Processar e converter datas
      const newRawData = {
        leads: (leadsResult.docs || []).map(doc => ({
          id: doc.id,
          ...doc,
          createdAt: doc.createdAt?.toDate?.() || doc.createdAt
        })),
        clients: (clientsResult.docs || []).map(doc => ({
          id: doc.id,
          ...doc,
          createdAt: doc.createdAt?.toDate?.() || doc.createdAt
        })),
        visits: (visitsResult.docs || []).map(doc => ({
          id: doc.id,
          ...doc,
          scheduledDate: doc.scheduledDate?.toDate?.() || doc.scheduledDate,
          createdAt: doc.createdAt?.toDate?.() || doc.createdAt
        })),
        opportunities: (opportunitiesResult.docs || []).map(doc => ({
          id: doc.id,
          ...doc,
          createdAt: doc.createdAt?.toDate?.() || doc.createdAt
        })),
        deals: (dealsResult.docs || []).map(doc => ({
          id: doc.id,
          ...doc,
          createdAt: doc.createdAt?.toDate?.() || doc.createdAt
        })),
        tasks: (tasksResult.docs || []).map(doc => ({
          id: doc.id,
          ...doc,
          createdAt: doc.createdAt?.toDate?.() || doc.createdAt
        }))
      };

      setRawData(newRawData);
      
      console.log('✅ Dados carregados para analytics multi-tenant:', {
        leads: newRawData.leads.length,
        clients: newRawData.clients.length,
        visits: newRawData.visits.length,
        opportunities: newRawData.opportunities.length,
        deals: newRawData.deals.length,
        tasks: newRawData.tasks.length
      });

      return newRawData;

    } catch (err) {
      console.error('❌ Erro ao carregar dados para analytics:', err);
      setError('Erro ao carregar dados para análise');
      return null;
    } finally {
      setLoading(false);
    }
  }, [isUserReady, fbService]);

  /**
   * 🎯 CALCULAR MÉTRICAS DO DASHBOARD (MULTI-TENANT)
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

      // Financeiras
      financial: {
        totalDealValue: data.deals.reduce((sum, deal) => sum + (deal.dealValue || 0), 0),
        avgDealValue: data.deals.length > 0 ? 
          data.deals.reduce((sum, deal) => sum + (deal.dealValue || 0), 0) / data.deals.length : 0,
        totalPipelineValue: data.opportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0),
        totalCommission: data.deals.reduce((sum, deal) => sum + (deal.commissionValue || 0), 0)
      },

      // Performance
      performance: {
        completedTasks: data.tasks.filter(t => t.status === 'completa').length,
        taskCompletionRate: data.tasks.length > 0 ?
          ((data.tasks.filter(t => t.status === 'completa').length / data.tasks.length) * 100).toFixed(1) : 0,
        completedVisits: data.visits.filter(v => v.status === 'realizada').length,
        visitCompletionRate: data.visits.length > 0 ?
          ((data.visits.filter(v => v.status === 'realizada').length / data.visits.length) * 100).toFixed(1) : 0
      }
    };

    return metrics;
  }, []);

  /**
   * 🔮 GERAR ANÁLISE PREDITIVA (MULTI-TENANT)
   */
  const generatePredictiveAnalysis = useCallback((data, metrics) => {
    if (!data || !metrics) return {};

    // Preparar dados temporais para regressão
    const dailyDeals = {};
    data.deals.forEach(deal => {
      if (deal.createdAt) {
        const dateKey = deal.createdAt.toISOString().split('T')[0];
        dailyDeals[dateKey] = (dailyDeals[dateKey] || 0) + 1;
      }
    });

    const timeSeriesData = Object.entries(dailyDeals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value], index) => ({ index, date, value }));

    // Aplicar regressão linear
    const regression = MLAlgorithms.linearRegression(timeSeriesData);

    // Gerar previsões
    const predictions = {
      next30Days: {
        deals: Math.max(0, Math.round(regression ? regression.slope * 30 + regression.intercept : metrics.summary.totalDeals * 1.1)),
        revenue: Math.max(0, regression ? (regression.slope * 30 + regression.intercept) * metrics.financial.avgDealValue : metrics.financial.totalDealValue * 1.2),
        confidence: regression ? Math.min(95, Math.max(30, regression.correlation * 100)) : 45
      },
      next60Days: {
        deals: Math.max(0, Math.round(regression ? regression.slope * 60 + regression.intercept : metrics.summary.totalDeals * 1.25)),
        revenue: Math.max(0, regression ? (regression.slope * 60 + regression.intercept) * metrics.financial.avgDealValue : metrics.financial.totalDealValue * 1.35),
        confidence: regression ? Math.min(85, Math.max(25, regression.correlation * 85)) : 40
      },
      next90Days: {
        deals: Math.max(0, Math.round(regression ? regression.slope * 90 + regression.intercept : metrics.summary.totalDeals * 1.35)),
        revenue: Math.max(0, regression ? (regression.slope * 90 + regression.intercept) * metrics.financial.avgDealValue : metrics.financial.totalDealValue * 1.5),
        confidence: regression ? Math.min(75, Math.max(20, regression.correlation * 75)) : 35
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
   * 🎯 CALCULAR SCORING DE LEADS (MULTI-TENANT)
   */
  const calculateLeadScoring = useCallback((leads) => {
    if (!leads || leads.length === 0) return {};

    const weights = {
      status: { 'novo': 10, 'contactado': 20, 'qualificado': 40, 'interessado': 60, 'convertido': 80 },
      budget: { high: 40, medium: 25, low: 10 },
      engagement: { high: 30, medium: 20, low: 10 }
    };

    const scoredLeads = leads.map(lead => {
      let score = 0;
      
      // Pontuação por status
      score += weights.status[lead.status] || 0;
      
      // Pontuação por orçamento
      const budget = lead.budgetValue || 0;
      const budgetScore = budget > 300000 ? 'high' : budget > 150000 ? 'medium' : 'low';
      score += weights.budget[budgetScore];
      
      // Pontuação por engajamento (baseado em interações)
      const interactions = lead.interactions || 0;
      const engagementLevel = interactions > 5 ? 'high' : interactions > 2 ? 'medium' : 'low';
      score += weights.engagement[engagementLevel];
      
      const finalScore = Math.min(100, Math.max(0, score));
      
      return {
        ...lead,
        score: finalScore,
        grade: finalScore >= 70 ? 'A' : finalScore >= 50 ? 'B' : finalScore >= 30 ? 'C' : 'D'
      };
    });

    const distribution = {
      A: scoredLeads.filter(l => l.grade === 'A').length,
      B: scoredLeads.filter(l => l.grade === 'B').length,
      C: scoredLeads.filter(l => l.grade === 'C').length,
      D: scoredLeads.filter(l => l.grade === 'D').length
    };

    return {
      distribution,
      averageScore: scoredLeads.length > 0 ? 
        scoredLeads.reduce((sum, lead) => sum + lead.score, 0) / scoredLeads.length : 0,
      topLeads: scoredLeads
        .filter(lead => lead.score >= 70)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10),
      scoredLeads
    };
  }, []);

  /**
   * 💡 GERAR RECOMENDAÇÕES INTELIGENTES (MULTI-TENANT)
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
          'Implementar sistema de nurturing'
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
          'Reativar oportunidades pausadas'
        ],
        impact: 'high',
        effort: 'high'
      });
    }

    // Recomendações baseadas em tarefas
    if (parseFloat(metrics.performance.taskCompletionRate) < CORE_METRICS.PERFORMANCE_METRICS.taskCompletion.critical) {
      recommendations.push({
        type: 'warning',
        category: 'Produtividade',
        title: 'Baixa Taxa de Conclusão de Tarefas',
        description: `Taxa atual: ${metrics.performance.taskCompletionRate}%`,
        actions: [
          'Priorizar tarefas críticas',
          'Usar templates de tarefas',
          'Implementar lembretes automáticos'
        ],
        impact: 'medium',
        effort: 'low'
      });
    }

    // Recomendações baseadas em previsões
    if (predictions.next30Days.confidence < 60) {
      recommendations.push({
        type: 'info',
        category: 'Previsibilidade',
        title: 'Dados Insuficientes para Previsões Precisas',
        description: 'Precisamos de mais dados históricos para melhorar as previsões',
        actions: [
          'Manter registros consistentes',
          'Documentar todos os negócios',
          'Acompanhar métricas diariamente'
        ],
        impact: 'medium',
        effort: 'low'
      });
    }

    return recommendations;
  }, []);

  /**
   * 🚨 DETECTAR ANOMALIAS (MULTI-TENANT)
   */
  const detectAnomalies = useCallback((data, metrics) => {
    if (!data || !metrics) return {};

    // Análise de anomalias em negócios
    const dealValues = data.deals.map((deal, index) => ({
      index,
      value: deal.dealValue || 0,
      date: deal.createdAt,
      deal
    }));

    const anomalies = MLAlgorithms.detectAnomalies(dealValues, analyticsConfig.anomalyThreshold);

    return {
      deals: anomalies.map(anomaly => ({
        ...anomaly,
        type: anomaly.value > metrics.financial.avgDealValue * 2 ? 'exceptional' : 'low',
        severity: anomaly.value > metrics.financial.avgDealValue * 3 ? 'critical' : 'warning',
        title: `Deal com Valor ${anomaly.value > metrics.financial.avgDealValue ? 'Excepcional' : 'Baixo'}`,
        description: `Deal de €${anomaly.value.toLocaleString()} detectado (${anomaly.value > metrics.financial.avgDealValue ? 'acima' : 'abaixo'} do padrão)`,
        createdAt: new Date(),
        data: anomaly
      })),
      count: anomalies.length,
      lastDetected: anomalies.length > 0 ? new Date() : null
    };
  }, [analyticsConfig.anomalyThreshold]);

  /**
   * 📊 GERAR ANÁLISE DE COHORT (MULTI-TENANT)
   */
  const generateCohortAnalysis = useCallback((clients) => {
    if (!clients || clients.length === 0) return {};

    // Agrupar clientes por mês de criação
    const cohortGroups = {};
    clients.forEach(client => {
      if (client.createdAt) {
        const monthKey = client.createdAt.toISOString().substring(0, 7);
        if (!cohortGroups[monthKey]) {
          cohortGroups[monthKey] = [];
        }
        cohortGroups[monthKey].push(client);
      }
    });

    // Calcular métricas por cohort
    const cohortData = Object.entries(cohortGroups).map(([month, groupClients]) => {
      const activeClients = groupClients.filter(c => c.status === 'ativo').length;
      const totalValue = groupClients.reduce((sum, c) => sum + (c.totalValue || 0), 0);
      
      return {
        month,
        totalClients: groupClients.length,
        activeClients,
        retentionRate: groupClients.length > 0 ? (activeClients / groupClients.length * 100).toFixed(1) : 0,
        totalValue,
        avgValuePerClient: groupClients.length > 0 ? totalValue / groupClients.length : 0
      };
    });

    return {
      cohorts: cohortData.sort((a, b) => a.month.localeCompare(b.month)),
      totalCohorts: cohortData.length,
      averageRetention: cohortData.length > 0 ? 
        cohortData.reduce((sum, c) => sum + parseFloat(c.retentionRate), 0) / cohortData.length : 0
    };
  }, []);

  /**
   * 🔄 PROCESSAR TODOS OS ANALYTICS (MULTI-TENANT)
   */
  const processAllAnalytics = useCallback(async (filters = {}) => {
    if (!isUserReady) return;
    
    setLoading(true);
    
    try {
      console.log('🤖 Processando analytics multi-tenant...');

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

      console.log('✅ Analytics processados com sucesso (multi-tenant)');

      return {
        metrics,
        predictive,
        scoring,
        anomalies,
        cohorts
      };

    } catch (err) {
      console.error('❌ Erro no processamento de analytics:', err);
      setError('Erro ao processar análises');
    } finally {
      setLoading(false);
    }
  }, [isUserReady, loadRawData, calculateDashboardMetrics, generatePredictiveAnalysis, 
      calculateLeadScoring, detectAnomalies, generateCohortAnalysis]);

  /**
   * 📤 EXPORTAR DADOS (MULTI-TENANT SEGURO)
   */
  const exportAnalytics = useCallback(async (format = 'json') => {
    try {
      console.log(`📤 Exportando analytics em formato ${format} (multi-tenant)`);

      const analyticsData = {
        summary: dashboardMetrics,
        predictions: predictiveAnalysis,
        leadScoring,
        anomalies: anomalyDetection,
        customerInsights,
        metadata: {
          userId: user.uid,
          userName: userProfile?.displayName || user.displayName,
          exportedAt: new Date().toISOString(),
          version: '3.1-multi-tenant'
        }
      };

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(analyticsData, null, 2)], 
          { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics_${user.uid}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
      
      return { success: true, data: analyticsData };
      
    } catch (err) {
      console.error('❌ Erro ao exportar analytics:', err);
      return { success: false, error: err.message };
    }
  }, [dashboardMetrics, predictiveAnalysis, leadScoring, anomalyDetection, customerInsights, user, userProfile]);

  // 🔄 CARREGAR DADOS INICIAIS
  useEffect(() => {
    if (isUserReady) {
      console.log('🔄 Carregando analytics iniciais...');
      processAllAnalytics();
    }
  }, [isUserReady, processAllAnalytics]);

  // 📤 INTERFACE PÚBLICA DO HOOK MULTI-TENANT
  return {
    // Estados principais
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
    
    // Métodos principais
    loadRawData,
    processAllAnalytics,
    calculateDashboardMetrics,
    generatePredictiveAnalysis,
    calculateLeadScoring,
    detectAnomalies,
    exportAnalytics,
    
    // Constantes e algoritmos
    CORE_METRICS,
    MLAlgorithms,

    // Estado de conectividade
    isConnected: isUserReady && !error,
    isUserReady,

    // Informações da versão
    version: '3.1',
    isMultiTenant: true,
    structureVersion: '3.1-multi-tenant'
  };
};

export default useAnalytics;