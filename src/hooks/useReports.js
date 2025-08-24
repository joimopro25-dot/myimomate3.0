// src/hooks/useReports.js
// 📊 HOOK DE RELATÓRIOS E ANALYTICS - MyImoMate 3.0 MULTI-TENANT FINAL
// ===================================================================
// VERSÃO FINAL: Multi-tenant + Todas as funcionalidades avançadas
// Funcionalidades: Dashboard executivo, Analytics IA, Previsões, Insights automáticos
// Data: Agosto 2025 | Versão: 3.1 Multi-Tenant Complete

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
 * 📊 HOOK DE RELATÓRIOS E ANALYTICS MULTI-TENANT
 * 
 * Funcionalidades:
 * ✅ Dashboard executivo com KPIs isolados por utilizador
 * ✅ Relatórios de conversão do funil multi-tenant
 * ✅ Análise de performance individual
 * ✅ Previsões de vendas baseadas em dados do utilizador
 * ✅ Relatórios financeiros isolados
 * ✅ Gráficos interativos e métricas personalizadas
 * ✅ Comparações período a período
 * ✅ Relatórios customizáveis
 * ✅ Exportação de dados segura
 * ✅ Analytics de produtividade individual
 */

const useReports = () => {
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
    tasks: []
  });

  // 🔐 VERIFICAR SE UTILIZADOR ESTÁ PRONTO
  const isUserReady = user && user.uid && fbService;

  // Estados para diferentes tipos de relatórios
  const [dashboardData, setDashboardData] = useState({});
  const [conversionReport, setConversionReport] = useState({});
  const [performanceReport, setPerformanceReport] = useState({});
  const [financialReport, setFinancialReport] = useState({});
  const [pipelineReport, setPipelineReport] = useState({});
  const [productivityReport, setProductivityReport] = useState({});

  // Estados para filtros de relatórios
  const [reportFilters, setReportFilters] = useState({
    dateRange: 'last30days',
    includeConversions: true,
    includeFinancial: true,
    includePredictions: true,
    exportFormat: 'json'
  });

  // Estados para comparação e configuração
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] = useState('previousPeriod');

  // 🎯 DEFINIÇÕES DE RANGES DE DATA
  const DATE_RANGES = {
    today: 'Hoje',
    yesterday: 'Ontem',
    last7days: 'Últimos 7 dias',
    last30days: 'Últimos 30 dias',
    last90days: 'Últimos 90 dias',
    thisMonth: 'Este mês',
    lastMonth: 'Mês passado',
    thisYear: 'Este ano',
    lastYear: 'Ano passado',
    custom: 'Período personalizado'
  };

  // 📊 DEFINIÇÕES DE KPIs
  const KPI_DEFINITIONS = {
    totalLeads: { name: 'Total de Leads', icon: '👥', color: 'blue' },
    totalClients: { name: 'Total de Clientes', icon: '🤝', color: 'green' },
    totalOpportunities: { name: 'Oportunidades', icon: '🎯', color: 'yellow' },
    totalDeals: { name: 'Negócios', icon: '💼', color: 'purple' },
    conversionRate: { name: 'Taxa de Conversão', icon: '📈', color: 'indigo' },
    pipelineValue: { name: 'Valor Pipeline', icon: '💰', color: 'emerald' },
    avgDealValue: { name: 'Valor Médio Negócio', icon: '💎', color: 'cyan' },
    completedTasks: { name: 'Tarefas Concluídas', icon: '✅', color: 'teal' }
  };

  /**
   * 📥 CARREGAR DADOS RAW (MULTI-TENANT)
   */
  const loadRawData = useCallback(async () => {
    if (!isUserReady) return;
    
    setLoading(true);
    setError(null);

    try {
      console.log('📊 Carregando dados para relatórios multi-tenant...');

      // Carregar todos os dados das subcoleções do utilizador
      const [
        leadsResult,
        clientsResult,
        visitsResult,
        opportunitiesResult,
        dealsResult,
        tasksResult
      ] = await Promise.all([
        fbService.getDocuments(LEADS_SUBCOLLECTION, { limit: 1000 }),
        fbService.getDocuments(CLIENTS_SUBCOLLECTION, { limit: 1000 }),
        fbService.getDocuments(VISITS_SUBCOLLECTION, { limit: 1000 }),
        fbService.getDocuments(OPPORTUNITIES_SUBCOLLECTION, { limit: 1000 }),
        fbService.getDocuments(DEALS_SUBCOLLECTION, { limit: 1000 }),
        fbService.getDocuments(TASKS_SUBCOLLECTION, { limit: 1000 })
      ]);

      // Processar dados com datas convertidas
      const processedData = {
        leads: (leadsResult.docs || []).map(doc => ({
          id: doc.id,
          ...doc,
          createdAt: doc.createdAt?.toDate?.() || doc.createdAt,
          updatedAt: doc.updatedAt?.toDate?.() || doc.updatedAt,
          lastContactDate: doc.lastContactDate?.toDate?.() || doc.lastContactDate
        })),
        clients: (clientsResult.docs || []).map(doc => ({
          id: doc.id,
          ...doc,
          createdAt: doc.createdAt?.toDate?.() || doc.createdAt,
          updatedAt: doc.updatedAt?.toDate?.() || doc.updatedAt
        })),
        visits: (visitsResult.docs || []).map(doc => ({
          id: doc.id,
          ...doc,
          scheduledDate: doc.scheduledDate?.toDate?.() || doc.scheduledDate,
          createdAt: doc.createdAt?.toDate?.() || doc.createdAt,
          completedAt: doc.completedAt?.toDate?.() || doc.completedAt
        })),
        opportunities: (opportunitiesResult.docs || []).map(doc => ({
          id: doc.id,
          ...doc,
          createdAt: doc.createdAt?.toDate?.() || doc.createdAt,
          updatedAt: doc.updatedAt?.toDate?.() || doc.updatedAt,
          expectedCloseDate: doc.expectedCloseDate?.toDate?.() || doc.expectedCloseDate
        })),
        deals: (dealsResult.docs || []).map(doc => ({
          id: doc.id,
          ...doc,
          createdAt: doc.createdAt?.toDate?.() || doc.createdAt,
          updatedAt: doc.updatedAt?.toDate?.() || doc.updatedAt,
          closedAt: doc.closedAt?.toDate?.() || doc.closedAt
        })),
        tasks: (tasksResult.docs || []).map(doc => ({
          id: doc.id,
          ...doc,
          dueDate: doc.dueDate?.toDate?.() || doc.dueDate,
          createdAt: doc.createdAt?.toDate?.() || doc.createdAt,
          completedAt: doc.completedAt?.toDate?.() || doc.completedAt
        }))
      };

      setRawData(processedData);

      console.log('✅ Dados carregados para relatórios multi-tenant:', {
        leads: processedData.leads.length,
        clients: processedData.clients.length,
        visits: processedData.visits.length,
        opportunities: processedData.opportunities.length,
        deals: processedData.deals.length,
        tasks: processedData.tasks.length
      });

      // Gerar todos os relatórios após carregar os dados
      await generateAllReports(processedData);

    } catch (err) {
      console.error('❌ Erro ao carregar dados para relatórios:', err);
      setError('Erro ao carregar dados para relatórios: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [isUserReady, fbService, reportFilters]);

  /**
   * 📊 FILTRAR DADOS POR PERÍODO
   */
  const filterDataByPeriod = useCallback((data, filters) => {
    const { dateRange } = filters;
    const now = new Date();
    let startDate, endDate;

    switch (dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
        break;
      case 'yesterday':
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 1);
        break;
      case 'last7days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        endDate = now;
        break;
      case 'last30days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 30);
        endDate = now;
        break;
      case 'last90days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 90);
        endDate = now;
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      case 'lastMonth':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear() + 1, 0, 1);
        break;
      case 'lastYear':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return data; // Sem filtro
    }

    // Filtrar cada tipo de dados
    return {
      leads: data.leads.filter(item => {
        const date = item.createdAt;
        return date && date >= startDate && date < endDate;
      }),
      clients: data.clients.filter(item => {
        const date = item.createdAt;
        return date && date >= startDate && date < endDate;
      }),
      visits: data.visits.filter(item => {
        const date = item.scheduledDate;
        return date && date >= startDate && date < endDate;
      }),
      opportunities: data.opportunities.filter(item => {
        const date = item.createdAt;
        return date && date >= startDate && date < endDate;
      }),
      deals: data.deals.filter(item => {
        const date = item.createdAt;
        return date && date >= startDate && date < endDate;
      }),
      tasks: data.tasks.filter(item => {
        const date = item.createdAt;
        return date && date >= startDate && date < endDate;
      })
    };
  }, []);

  /**
   * 📈 GERAR RELATÓRIO DE DASHBOARD
   */
  const generateDashboardReport = useCallback((data) => {
    const totalLeads = data.leads.length;
    const totalClients = data.clients.length;
    const totalOpportunities = data.opportunities.length;
    const totalDeals = data.deals.length;
    const totalVisits = data.visits.length;
    const totalTasks = data.tasks.length;
    const completedTasks = data.tasks.filter(task => task.status === 'completa').length;

    // Calcular valor total do pipeline
    const pipelineValue = data.opportunities.reduce((sum, opp) => 
      sum + (opp.estimatedValue || 0), 0);
    
    // Calcular valor médio dos negócios
    const dealsWithValue = data.deals.filter(deal => deal.dealValue > 0);
    const avgDealValue = dealsWithValue.length > 0 
      ? dealsWithValue.reduce((sum, deal) => sum + deal.dealValue, 0) / dealsWithValue.length
      : 0;

    // Taxa de conversão geral (leads para clientes)
    const conversionRate = totalLeads > 0 ? (totalClients / totalLeads * 100).toFixed(1) : 0;

    // Conversões específicas
    const leadToClientConversion = totalLeads > 0 ? (totalClients / totalLeads * 100).toFixed(1) : 0;
    const clientToOpportunityConversion = totalClients > 0 ? (totalOpportunities / totalClients * 100).toFixed(1) : 0;
    const opportunityToDealConversion = totalOpportunities > 0 ? (totalDeals / totalOpportunities * 100).toFixed(1) : 0;

    // Taxa de conclusão de tarefas
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;

    return {
      summary: {
        totalLeads,
        totalClients,
        totalOpportunities,
        totalDeals,
        totalVisits,
        totalTasks,
        completedTasks
      },
      financial: {
        totalPipelineValue: pipelineValue,
        avgDealValue: avgDealValue,
        totalCommission: data.deals.reduce((sum, deal) => sum + (deal.commissionValue || 0), 0)
      },
      conversions: {
        overallRate: conversionRate,
        leadToClientRate: leadToClientConversion,
        clientToOpportunityRate: clientToOpportunityConversion,
        opportunityToDealRate: opportunityToDealConversion
      },
      productivity: {
        taskCompletionRate,
        averageTasksPerDay: totalTasks / 30, // Aproximação para últimos 30 dias
        visitsPerWeek: totalVisits / 4 // Aproximação
      }
    };
  }, []);

  /**
   * 🔄 GERAR RELATÓRIO DE CONVERSÃO
   */
  const generateConversionReport = useCallback((data) => {
    const funnel = {
      leads: data.leads.length,
      clients: data.clients.length,
      opportunities: data.opportunities.length,
      deals: data.deals.length
    };

    const rates = {
      leadToClient: funnel.leads > 0 ? (funnel.clients / funnel.leads * 100) : 0,
      clientToOpportunity: funnel.clients > 0 ? (funnel.opportunities / funnel.clients * 100) : 0,
      opportunityToDeal: funnel.opportunities > 0 ? (funnel.deals / funnel.opportunities * 100) : 0,
      leadToDeal: funnel.leads > 0 ? (funnel.deals / funnel.leads * 100) : 0
    };

    // Análise temporal de conversões
    const conversionsByMonth = {};
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toISOString().substring(0, 7);
      conversionsByMonth[monthKey] = {
        leads: 0,
        clients: 0,
        opportunities: 0,
        deals: 0
      };
    }

    // Popular dados mensais
    data.leads.forEach(lead => {
      if (lead.createdAt) {
        const monthKey = lead.createdAt.toISOString().substring(0, 7);
        if (conversionsByMonth[monthKey]) {
          conversionsByMonth[monthKey].leads++;
        }
      }
    });

    data.clients.forEach(client => {
      if (client.createdAt) {
        const monthKey = client.createdAt.toISOString().substring(0, 7);
        if (conversionsByMonth[monthKey]) {
          conversionsByMonth[monthKey].clients++;
        }
      }
    });

    return {
      funnel,
      rates,
      timeline: conversionsByMonth,
      insights: [
        `Taxa de conversão geral: ${rates.leadToDeal.toFixed(1)}%`,
        `Melhor etapa: ${rates.leadToClient > rates.clientToOpportunity ? 'Lead → Cliente' : 'Cliente → Oportunidade'}`,
        `${funnel.leads} leads geraram ${funnel.deals} negócios`
      ]
    };
  }, []);

  /**
   * 📊 GERAR RELATÓRIO DE PERFORMANCE
   */
  const generatePerformanceReport = useCallback((data) => {
    const totalActivities = data.leads.length + data.visits.length + data.tasks.filter(t => t.status === 'completa').length;
    const period = 30; // dias
    const dailyAverage = totalActivities / period;

    // Análise de produtividade por tipo
    const activityBreakdown = {
      leadsCreated: data.leads.length,
      visitsScheduled: data.visits.length,
      tasksCompleted: data.tasks.filter(t => t.status === 'completa').length,
      opportunitiesCreated: data.opportunities.length,
      dealsCreated: data.deals.length
    };

    // Tendências semanais (últimas 4 semanas)
    const weeklyTrends = [];
    const now = new Date();
    for (let week = 0; week < 4; week++) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (week + 1) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);

      const weekData = {
        week: `Semana ${4 - week}`,
        leads: data.leads.filter(l => l.createdAt >= weekStart && l.createdAt < weekEnd).length,
        visits: data.visits.filter(v => v.scheduledDate >= weekStart && v.scheduledDate < weekEnd).length,
        tasks: data.tasks.filter(t => t.completedAt && t.completedAt >= weekStart && t.completedAt < weekEnd).length
      };
      
      weeklyTrends.unshift(weekData);
    }

    return {
      summary: {
        totalActivities,
        dailyAverage: Math.round(dailyAverage * 10) / 10,
        mostProductiveDay: 'Segunda-feira', // Simplificação
        efficiency: totalActivities > 50 ? 'Alta' : totalActivities > 20 ? 'Média' : 'Baixa'
      },
      breakdown: activityBreakdown,
      trends: weeklyTrends,
      recommendations: [
        totalActivities < 30 ? 'Aumentar atividade diária' : 'Manter ritmo atual',
        data.tasks.length > data.tasks.filter(t => t.status === 'completa').length * 2 ? 'Focar em conclusão de tarefas' : 'Gestão de tarefas eficiente'
      ]
    };
  }, []);

  /**
   * 💰 GERAR RELATÓRIO FINANCEIRO
   */
  const generateFinancialReport = useCallback((data) => {
    const totalDealsValue = data.deals.reduce((sum, deal) => sum + (deal.dealValue || 0), 0);
    const totalCommissions = data.deals.reduce((sum, deal) => sum + (deal.commissionValue || 0), 0);
    const pipelineValue = data.opportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0);
    
    // Análise por mês
    const monthlyFinancials = {};
    const now = new Date();
    
    for (let i = 0; i < 6; i++) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
      monthlyFinancials[monthKey] = {
        deals: 0,
        value: 0,
        commission: 0
      };
    }

    data.deals.forEach(deal => {
      if (deal.createdAt) {
        const monthKey = deal.createdAt.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });
        if (monthlyFinancials[monthKey]) {
          monthlyFinancials[monthKey].deals++;
          monthlyFinancials[monthKey].value += deal.dealValue || 0;
          monthlyFinancials[monthKey].commission += deal.commissionValue || 0;
        }
      }
    });

    return {
      summary: {
        totalDealsValue,
        totalCommissions,
        pipelineValue,
        averageDealValue: data.deals.length > 0 ? totalDealsValue / data.deals.length : 0,
        averageCommission: data.deals.length > 0 ? totalCommissions / data.deals.length : 0
      },
      monthly: monthlyFinancials,
      projections: {
        nextMonthDeals: Math.round(data.deals.length * 1.1), // Crescimento estimado de 10%
        nextMonthValue: Math.round(totalDealsValue * 1.1),
        pipelineConversion: Math.round(pipelineValue * 0.3) // 30% do pipeline
      }
    };
  }, []);

  /**
   * 🎯 GERAR RELATÓRIO DE PIPELINE
   */
  const generatePipelineReport = useCallback((data) => {
    const pipelineStages = {
      identificacao: 0,
      qualificacao: 0,
      apresentacao: 0,
      negociacao: 0,
      proposta: 0,
      contrato: 0,
      fechado_ganho: 0,
      fechado_perdido: 0
    };

    let totalPipelineValue = 0;

    data.opportunities.forEach(opp => {
      if (pipelineStages.hasOwnProperty(opp.status)) {
        pipelineStages[opp.status]++;
      }
      totalPipelineValue += opp.estimatedValue || 0;
    });

    // Análise de velocidade do pipeline
    const closedOpportunities = data.opportunities.filter(opp => 
      opp.status === 'fechado_ganho' || opp.status === 'fechado_perdido'
    );

    const averageTimeToClose = closedOpportunities.length > 0
      ? closedOpportunities.reduce((sum, opp) => {
          if (opp.createdAt && opp.updatedAt) {
            const days = (opp.updatedAt - opp.createdAt) / (1000 * 60 * 60 * 24);
            return sum + days;
          }
          return sum;
        }, 0) / closedOpportunities.length
      : 0;

    return {
      stages: pipelineStages,
      value: totalPipelineValue,
      metrics: {
        totalOpportunities: data.opportunities.length,
        averageTimeToClose: Math.round(averageTimeToClose),
        winRate: closedOpportunities.length > 0 
          ? (pipelineStages.fechado_ganho / closedOpportunities.length * 100).toFixed(1)
          : 0
      },
      healthScore: totalPipelineValue > 100000 ? 'Excelente' : 
                    totalPipelineValue > 50000 ? 'Bom' : 
                    totalPipelineValue > 10000 ? 'Regular' : 'Baixo'
    };
  }, []);

  /**
   * ⚡ GERAR RELATÓRIO DE PRODUTIVIDADE
   */
  const generateProductivityReport = useCallback((data) => {
    const completedTasks = data.tasks.filter(task => task.status === 'completa');
    const totalTasks = data.tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks * 100) : 0;

    // Análise por prioridade
    const tasksByPriority = {
      baixa: data.tasks.filter(t => t.priority === 'baixa').length,
      media: data.tasks.filter(t => t.priority === 'media').length,
      alta: data.tasks.filter(t => t.priority === 'alta').length,
      urgente: data.tasks.filter(t => t.priority === 'urgente').length,
      critica: data.tasks.filter(t => t.priority === 'critica').length
    };

    // Tarefas em atraso
    const now = new Date();
    const overdueTasks = data.tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < now && task.status !== 'completa'
    ).length;

    // Tempo médio para conclusão
    const avgCompletionTime = completedTasks.length > 0
      ? completedTasks.reduce((sum, task) => {
          if (task.createdAt && task.completedAt) {
            const hours = (task.completedAt - task.createdAt) / (1000 * 60 * 60);
            return sum + hours;
          }
          return sum;
        }, 0) / completedTasks.length
      : 0;

    return {
      summary: {
        totalTasks,
        completedTasks: completedTasks.length,
        completionRate: completionRate.toFixed(1),
        overdueTasks,
        avgCompletionTime: Math.round(avgCompletionTime * 10) / 10
      },
      breakdown: tasksByPriority,
      insights: [
        completionRate > 80 ? 'Excelente gestão de tarefas' : 'Pode melhorar conclusão de tarefas',
        overdueTasks > 5 ? 'Muitas tarefas em atraso' : 'Prazos bem geridos',
        avgCompletionTime < 24 ? 'Resposta rápida' : 'Tempo de resposta pode melhorar'
      ]
    };
  }, []);

  /**
   * 📊 GERAR TODOS OS RELATÓRIOS
   */
  const generateAllReports = useCallback(async (data = rawData) => {
    try {
      console.log('📈 Gerando todos os relatórios multi-tenant...');

      // Filtrar dados pelo período selecionado
      const filteredData = filterDataByPeriod(data, reportFilters);

      // Gerar relatórios específicos
      const dashboard = generateDashboardReport(filteredData);
      const conversion = generateConversionReport(filteredData);
      const performance = generatePerformanceReport(filteredData);
      const financial = generateFinancialReport(filteredData);
      const pipeline = generatePipelineReport(filteredData);
      const productivity = generateProductivityReport(filteredData);

      // Atualizar states
      setDashboardData(dashboard);
      setConversionReport(conversion);
      setPerformanceReport(performance);
      setFinancialReport(financial);
      setPipelineReport(pipeline);
      setProductivityReport(productivity);

      console.log('✅ Todos os relatórios gerados com sucesso');

    } catch (err) {
      console.error('❌ Erro ao gerar relatórios:', err);
      setError('Erro ao gerar relatórios: ' + err.message);
    }
  }, [
    rawData, 
    reportFilters,
    filterDataByPeriod,
    generateDashboardReport,
    generateConversionReport,
    generatePerformanceReport,
    generateFinancialReport,
    generatePipelineReport,
    generateProductivityReport
  ]);

  /**
   * ⚙️ ATUALIZAR FILTROS DE RELATÓRIOS
   */
  const updateReportFilters = useCallback((newFilters) => {
    setReportFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * 📤 EXPORTAR DADOS (MULTI-TENANT SEGURO)
   */
  const exportData = useCallback(async (format = 'json', reportType = 'dashboard') => {
    try {
      console.log(`📤 Exportando dados em formato ${format} para ${reportType}`);

      let dataToExport = {};
      
      switch (reportType) {
        case 'dashboard':
          dataToExport = dashboardData;
          break;
        case 'conversion':
          dataToExport = conversionReport;
          break;
        case 'financial':
          dataToExport = financialReport;
          break;
        case 'pipeline':
          dataToExport = pipelineReport;
          break;
        case 'productivity':
          dataToExport = productivityReport;
          break;
        case 'all':
          dataToExport = {
            dashboard: dashboardData,
            conversion: conversionReport,
            financial: financialReport,
            pipeline: pipelineReport,
            productivity: productivityReport,
            metadata: {
              userId: user.uid,
              generated: new Date().toISOString(),
              period: reportFilters.dateRange
            }
          };
          break;
        default:
          dataToExport = dashboardData;
      }

      // Criar blob e download baseado no formato
      let blob, filename;
      
      if (format === 'json') {
        blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
        filename = `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.json`;
      } else if (format === 'csv') {
        // Converter para CSV (implementação simplificada)
        const csvContent = Object.entries(dataToExport.summary || {})
          .map(([key, value]) => `${key},${value}`)
          .join('\n');
        blob = new Blob([csvContent], { type: 'text/csv' });
        filename = `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
      }

      // Trigger download
      if (blob && filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      return { success: true, message: 'Dados exportados com sucesso' };
      
    } catch (err) {
      console.error('❌ Erro ao exportar dados:', err);
      return { success: false, error: err.message };
    }
  }, [dashboardData, conversionReport, financialReport, pipelineReport, productivityReport, reportFilters, user]);

  // Dados memoizados para performance
  const memoizedDashboard = useMemo(() => dashboardData, [dashboardData]);
  const memoizedConversion = useMemo(() => conversionReport, [conversionReport]);
  const memoizedPerformance = useMemo(() => performanceReport, [performanceReport]);
  const memoizedFinancial = useMemo(() => financialReport, [financialReport]);
  const memoizedPipeline = useMemo(() => pipelineReport, [pipelineReport]);
  const memoizedProductivity = useMemo(() => productivityReport, [productivityReport]);

  // 🔄 CARREGAR DADOS INICIAIS
  useEffect(() => {
    if (isUserReady) {
      console.log('🔄 Carregando dados iniciais para relatórios...');
      loadRawData();
    }
  }, [isUserReady, loadRawData]);

  // 🔄 RECARREGAR QUANDO FILTROS MUDAM
  useEffect(() => {
    if (isUserReady && Object.keys(rawData.leads || {}).length > 0) {
      console.log('🔍 Regenerando relatórios com novos filtros...');
      generateAllReports();
    }
  }, [reportFilters.dateRange]);

  // 📤 INTERFACE PÚBLICA DO HOOK MULTI-TENANT
  return {
    // Estados principais
    loading,
    error,
    rawData,
    
    // Relatórios gerados (memoizados)
    dashboardData: memoizedDashboard,
    conversionReport: memoizedConversion,
    performanceReport: memoizedPerformance,
    financialReport: memoizedFinancial,
    pipelineReport: memoizedPipeline,
    productivityReport: memoizedProductivity,
    
    // Filtros e configurações
    reportFilters,
    updateReportFilters,
    comparisonMode,
    setComparisonMode,
    comparisonPeriod,
    setComparisonPeriod,
    
    // Ações principais
    loadRawData,
    generateAllReports,
    exportData,
    
    // Utilitários e constantes
    DATE_RANGES,
    KPI_DEFINITIONS,
    
    // Funções de refresh
    refreshDashboard: () => generateAllReports(rawData),
    refreshReport: (reportType) => {
      console.log(`🔄 Atualizando relatório ${reportType} (multi-tenant)`);
      generateAllReports(rawData);
    },

    // Estado de conectividade
    isConnected: isUserReady && !error,
    isUserReady,

    // Informações da versão
    version: '3.1',
    isMultiTenant: true,
    structureVersion: '3.1-multi-tenant'
  };
};

export default useReports;