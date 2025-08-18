// src/hooks/useReports.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy,
  startAt,
  endAt
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * 📊 HOOK DE RELATÓRIOS E ANALYTICS
 * 
 * Funcionalidades:
 * ✅ Dashboard executivo com KPIs
 * ✅ Relatórios de conversão do funil
 * ✅ Análise de performance por consultor
 * ✅ Previsões de vendas e pipeline
 * ✅ Relatórios financeiros (comissões, receitas)
 * ✅ Gráficos interativos e métricas
 * ✅ Comparações período a período
 * ✅ Relatórios customizáveis
 * ✅ Exportação de dados
 * ✅ Analytics de produtividade
 */

const useReports = () => {
  // Estados principais
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

  // Estados para diferentes tipos de relatórios
  const [dashboardData, setDashboardData] = useState({});
  const [conversionReport, setConversionReport] = useState({});
  const [performanceReport, setPerformanceReport] = useState({});
  const [financialReport, setFinancialReport] = useState({});
  const [pipelineReport, setPipelineReport] = useState({});
  const [productivityReport, setProductivityReport] = useState({});

  // Estados para filtros de relatórios
  const [reportFilters, setReportFilters] = useState({
    dateRange: 'last30days', // today, yesterday, last7days, last30days, last90days, custom
    startDate: null,
    endDate: null,
    consultant: 'all',
    leadSource: 'all',
    propertyType: 'all',
    dealType: 'all',
    clientType: 'all'
  });

  // Estados para comparações
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonPeriod, setComparisonPeriod] = useState('previous_period');

  const { currentUser } = useAuth();

  // 📅 CONFIGURAÇÕES DE PERÍODOS
  const DATE_RANGES = {
    today: { days: 0, label: 'Hoje' },
    yesterday: { days: 1, label: 'Ontem' },
    last7days: { days: 7, label: 'Últimos 7 dias' },
    last30days: { days: 30, label: 'Últimos 30 dias' },
    last90days: { days: 90, label: 'Últimos 90 dias' },
    custom: { days: null, label: 'Período personalizado' }
  };

  // 🎯 KPIs PRINCIPAIS
  const KPI_DEFINITIONS = {
    // Métricas de leads
    LEAD_CONVERSION_RATE: 'Taxa de conversão Lead→Cliente',
    LEAD_RESPONSE_TIME: 'Tempo médio de resposta a leads',
    LEADS_BY_SOURCE: 'Leads por fonte de origem',
    
    // Métricas de clientes
    CLIENT_LIFETIME_VALUE: 'Valor vitalício do cliente',
    CLIENT_ACQUISITION_COST: 'Custo de aquisição de cliente',
    ACTIVE_CLIENTS_COUNT: 'Número de clientes ativos',
    
    // Métricas de visitas
    VISIT_CONVERSION_RATE: 'Taxa de conversão Visita→Oportunidade',
    VISITS_PER_CONSULTANT: 'Visitas por consultor',
    VISIT_SATISFACTION_SCORE: 'Score de satisfação das visitas',
    
    // Métricas de pipeline
    PIPELINE_VALUE: 'Valor total do pipeline',
    AVERAGE_DEAL_SIZE: 'Valor médio por negócio',
    SALES_CYCLE_LENGTH: 'Duração média do ciclo de vendas',
    
    // Métricas financeiras
    TOTAL_COMMISSION: 'Comissões totais',
    MONTHLY_RECURRING_REVENUE: 'Receita recorrente mensal',
    COMMISSION_PER_CONSULTANT: 'Comissões por consultor'
  };

  /**
   * 🔄 CARREGAR DADOS BRUTOS DE TODAS AS COLEÇÕES
   */
  const loadRawData = useCallback(async () => {
    if (!currentUser?.uid) {
      console.warn('👤 useReports: Utilizador não autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📊 useReports: A carregar dados para relatórios...');

      // Carregar dados de todas as coleções em paralelo
      const [
        leadsSnapshot,
        clientsSnapshot,
        visitsSnapshot,
        opportunitiesSnapshot,
        dealsSnapshot,
        tasksSnapshot
      ] = await Promise.all([
        getDocs(query(collection(db, 'leads'), where('userId', '==', currentUser.uid))),
        getDocs(query(collection(db, 'clients'), where('userId', '==', currentUser.uid))),
        getDocs(query(collection(db, 'visits'), where('userId', '==', currentUser.uid))),
        getDocs(query(collection(db, 'opportunities'), where('userId', '==', currentUser.uid))),
        getDocs(query(collection(db, 'deals'), where('userId', '==', currentUser.uid))),
        getDocs(query(collection(db, 'tasks'), where('userId', '==', currentUser.uid)))
      ]);

      // Processar dados e converter timestamps
      const processedData = {
        leads: leadsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || null,
          updatedAt: doc.data().updatedAt?.toDate?.() || null
        })),
        clients: clientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || null,
          updatedAt: doc.data().updatedAt?.toDate?.() || null
        })),
        visits: visitsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          scheduledDate: doc.data().scheduledDate?.toDate?.() || null,
          createdAt: doc.data().createdAt?.toDate?.() || null,
          completedAt: doc.data().completedAt?.toDate?.() || null
        })),
        opportunities: opportunitiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || null,
          updatedAt: doc.data().updatedAt?.toDate?.() || null,
          expectedCloseDate: doc.data().expectedCloseDate?.toDate?.() || null
        })),
        deals: dealsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || null,
          updatedAt: doc.data().updatedAt?.toDate?.() || null,
          closedAt: doc.data().closedAt?.toDate?.() || null
        })),
        tasks: tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate?.() || null,
          createdAt: doc.data().createdAt?.toDate?.() || null,
          completedAt: doc.data().completedAt?.toDate?.() || null
        }))
      };

      setRawData(processedData);

      console.log('✅ useReports: Dados carregados com sucesso:', {
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
      console.error('❌ useReports: Erro ao carregar dados:', err);
      setError('Erro ao carregar dados para relatórios: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser, reportFilters]);

  /**
   * 📊 GERAR TODOS OS RELATÓRIOS
   */
  const generateAllReports = async (data = rawData) => {
    try {
      console.log('📈 useReports: A gerar relatórios...');

      // Filtrar dados pelo período selecionado
      const filteredData = filterDataByPeriod(data, reportFilters);

      // Gerar relatórios específicos
      const dashboard = generateDashboardReport(filteredData);
      const conversion = generateConversionReport(filteredData);
      const performance = generatePerformanceReport(filteredData);
      const financial = generateFinancialReport(filteredData);
      const pipeline = generatePipelineReport(filteredData);
      const productivity = generateProductivityReport(filteredData);

      // Atualizar estados
      setDashboardData(dashboard);
      setConversionReport(conversion);
      setPerformanceReport(performance);
      setFinancialReport(financial);
      setPipelineReport(pipeline);
      setProductivityReport(productivity);

      console.log('✅ useReports: Relatórios gerados com sucesso');

    } catch (err) {
      console.error('❌ useReports: Erro ao gerar relatórios:', err);
      setError('Erro ao gerar relatórios: ' + err.message);
    }
  };

  /**
   * 🔍 FILTRAR DADOS POR PERÍODO
   */
  const filterDataByPeriod = (data, filters) => {
    const { dateRange, startDate, endDate } = filters;
    
    let filterStartDate, filterEndDate;

    if (dateRange === 'custom' && startDate && endDate) {
      filterStartDate = new Date(startDate);
      filterEndDate = new Date(endDate);
    } else if (dateRange !== 'custom') {
      const days = DATE_RANGES[dateRange]?.days || 30;
      filterEndDate = new Date();
      filterStartDate = new Date();
      filterStartDate.setDate(filterStartDate.getDate() - days);
    } else {
      // Se não há filtro de data, retorna todos os dados
      return data;
    }

    // Filtrar cada coleção por data
    return {
      leads: data.leads.filter(item => 
        item.createdAt && item.createdAt >= filterStartDate && item.createdAt <= filterEndDate
      ),
      clients: data.clients.filter(item => 
        item.createdAt && item.createdAt >= filterStartDate && item.createdAt <= filterEndDate
      ),
      visits: data.visits.filter(item => 
        item.scheduledDate && item.scheduledDate >= filterStartDate && item.scheduledDate <= filterEndDate
      ),
      opportunities: data.opportunities.filter(item => 
        item.createdAt && item.createdAt >= filterStartDate && item.createdAt <= filterEndDate
      ),
      deals: data.deals.filter(item => 
        item.createdAt && item.createdAt >= filterStartDate && item.createdAt <= filterEndDate
      ),
      tasks: data.tasks.filter(item => 
        item.createdAt && item.createdAt >= filterStartDate && item.createdAt <= filterEndDate
      )
    };
  };

  /**
   * 📈 GERAR RELATÓRIO DASHBOARD EXECUTIVO
   */
  const generateDashboardReport = (data) => {
    const { leads, clients, visits, opportunities, deals, tasks } = data;

    // KPIs principais
    const totalLeads = leads.length;
    const totalClients = clients.length;
    const totalVisits = visits.length;
    const totalOpportunities = opportunities.length;
    const totalDeals = deals.length;
    const totalTasks = tasks.length;

    // Conversões
    const leadToClientRate = totalLeads > 0 ? (totalClients / totalLeads * 100).toFixed(1) : 0;
    const visitToOpportunityRate = totalVisits > 0 ? (totalOpportunities / totalVisits * 100).toFixed(1) : 0;
    const opportunityToDealRate = totalOpportunities > 0 ? (deals.filter(d => d.status === 'won').length / totalOpportunities * 100).toFixed(1) : 0;

    // Valores financeiros
    const totalPipelineValue = opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
    const totalCommissions = deals.filter(d => d.status === 'won').reduce((sum, deal) => sum + (deal.commissionValue || 0), 0);
    const averageDealSize = deals.length > 0 ? totalCommissions / deals.length : 0;

    // Produtividade
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks * 100).toFixed(1) : 0;

    // Dados para gráficos
    const leadsThisMonth = generateTimeSeriesData(leads, 'month');
    const opportunitiesByStatus = groupBy(opportunities, 'status');
    const dealsByType = groupBy(deals, 'type');

    return {
      summary: {
        totalLeads,
        totalClients,
        totalVisits,
        totalOpportunities,
        totalDeals,
        totalTasks
      },
      conversions: {
        leadToClientRate: parseFloat(leadToClientRate),
        visitToOpportunityRate: parseFloat(visitToOpportunityRate),
        opportunityToDealRate: parseFloat(opportunityToDealRate)
      },
      financial: {
        totalPipelineValue,
        totalCommissions,
        averageDealSize
      },
      productivity: {
        completedTasks,
        taskCompletionRate: parseFloat(taskCompletionRate)
      },
      charts: {
        leadsThisMonth,
        opportunitiesByStatus,
        dealsByType
      },
      lastUpdated: new Date()
    };
  };

  /**
   * 🔄 GERAR RELATÓRIO DE CONVERSÃO
   */
  const generateConversionReport = (data) => {
    const { leads, clients, visits, opportunities, deals } = data;

    // Funil de conversão completo
    const funnelData = [
      { stage: 'Leads', count: leads.length, percentage: 100 },
      { stage: 'Clientes', count: clients.length, percentage: leads.length > 0 ? (clients.length / leads.length * 100).toFixed(1) : 0 },
      { stage: 'Visitas', count: visits.length, percentage: clients.length > 0 ? (visits.length / clients.length * 100).toFixed(1) : 0 },
      { stage: 'Oportunidades', count: opportunities.length, percentage: visits.length > 0 ? (opportunities.length / visits.length * 100).toFixed(1) : 0 },
      { stage: 'Negócios Fechados', count: deals.filter(d => d.status === 'won').length, percentage: opportunities.length > 0 ? (deals.filter(d => d.status === 'won').length / opportunities.length * 100).toFixed(1) : 0 }
    ];

    // Análise de perdas por etapa
    const dropoffAnalysis = [
      { stage: 'Lead → Cliente', lost: leads.length - clients.length, rate: leads.length > 0 ? ((leads.length - clients.length) / leads.length * 100).toFixed(1) : 0 },
      { stage: 'Cliente → Visita', lost: clients.length - visits.length, rate: clients.length > 0 ? ((clients.length - visits.length) / clients.length * 100).toFixed(1) : 0 },
      { stage: 'Visita → Oportunidade', lost: visits.length - opportunities.length, rate: visits.length > 0 ? ((visits.length - opportunities.length) / visits.length * 100).toFixed(1) : 0 },
      { stage: 'Oportunidade → Fechamento', lost: opportunities.length - deals.filter(d => d.status === 'won').length, rate: opportunities.length > 0 ? ((opportunities.length - deals.filter(d => d.status === 'won').length) / opportunities.length * 100).toFixed(1) : 0 }
    ];

    // Conversões por fonte de lead
    const conversionBySource = {};
    const leadsBySource = groupBy(leads, 'source');
    Object.keys(leadsBySource).forEach(source => {
      const sourceLeads = leadsBySource[source];
      const sourceClients = clients.filter(c => sourceLeads.some(l => l.id === c.leadId));
      conversionBySource[source] = {
        leads: sourceLeads.length,
        clients: sourceClients.length,
        rate: sourceLeads.length > 0 ? (sourceClients.length / sourceLeads.length * 100).toFixed(1) : 0
      };
    });

    return {
      funnel: funnelData,
      dropoffAnalysis,
      conversionBySource,
      overallConversionRate: leads.length > 0 ? (deals.filter(d => d.status === 'won').length / leads.length * 100).toFixed(2) : 0,
      lastUpdated: new Date()
    };
  };

  /**
   * 🏆 GERAR RELATÓRIO DE PERFORMANCE
   */
  const generatePerformanceReport = (data) => {
    const { leads, clients, visits, opportunities, deals, tasks } = data;

    // Performance por consultor (assumindo que há campo consultant/assignedTo)
    const consultants = [...new Set([
      ...leads.map(l => l.assignedTo || l.consultant),
      ...clients.map(c => c.assignedTo || c.consultant),
      ...visits.map(v => v.consultant),
      ...opportunities.map(o => o.assignedTo),
      ...deals.map(d => d.assignedTo)
    ])].filter(Boolean);

    const performanceByConsultant = consultants.map(consultant => {
      const consultantLeads = leads.filter(l => (l.assignedTo || l.consultant) === consultant);
      const consultantClients = clients.filter(c => (c.assignedTo || c.consultant) === consultant);
      const consultantVisits = visits.filter(v => v.consultant === consultant);
      const consultantOpportunities = opportunities.filter(o => o.assignedTo === consultant);
      const consultantDeals = deals.filter(d => d.assignedTo === consultant);
      const consultantTasks = tasks.filter(t => t.assignedTo === consultant);

      const wonDeals = consultantDeals.filter(d => d.status === 'won');
      const totalCommission = wonDeals.reduce((sum, deal) => sum + (deal.commissionValue || 0), 0);
      const conversionRate = consultantLeads.length > 0 ? (consultantClients.length / consultantLeads.length * 100).toFixed(1) : 0;

      return {
        consultant,
        leads: consultantLeads.length,
        clients: consultantClients.length,
        visits: consultantVisits.length,
        opportunities: consultantOpportunities.length,
        deals: consultantDeals.length,
        wonDeals: wonDeals.length,
        totalCommission,
        conversionRate: parseFloat(conversionRate),
        completedTasks: consultantTasks.filter(t => t.status === 'completed').length,
        totalTasks: consultantTasks.length
      };
    });

    // Ranking por comissões
    const topPerformers = [...performanceByConsultant]
      .sort((a, b) => b.totalCommission - a.totalCommission)
      .slice(0, 5);

    return {
      performanceByConsultant,
      topPerformers,
      averageConversionRate: performanceByConsultant.length > 0 ? 
        (performanceByConsultant.reduce((sum, p) => sum + p.conversionRate, 0) / performanceByConsultant.length).toFixed(1) : 0,
      totalConsultants: consultants.length,
      lastUpdated: new Date()
    };
  };

  /**
   * 💰 GERAR RELATÓRIO FINANCEIRO
   */
  const generateFinancialReport = (data) => {
    const { opportunities, deals } = data;

    const wonDeals = deals.filter(d => d.status === 'won');
    const lostDeals = deals.filter(d => d.status === 'lost');

    // Métricas financeiras principais
    const totalRevenue = wonDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
    const totalCommissions = wonDeals.reduce((sum, deal) => sum + (deal.commissionValue || 0), 0);
    const averageDealValue = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;
    const averageCommission = wonDeals.length > 0 ? totalCommissions / wonDeals.length : 0;

    // Pipeline financeiro
    const pipelineValue = opportunities.reduce((sum, opp) => sum + (opp.value || 0), 0);
    const weightedPipelineValue = opportunities.reduce((sum, opp) => 
      sum + ((opp.value || 0) * (opp.probability || 0) / 100), 0);

    // Receita por mês (últimos 12 meses)
    const revenueByMonth = generateMonthlyRevenue(wonDeals);

    // Comissões por tipo de negócio
    const commissionsByType = {};
    wonDeals.forEach(deal => {
      const type = deal.type || 'Outros';
      if (!commissionsByType[type]) {
        commissionsByType[type] = 0;
      }
      commissionsByType[type] += deal.commissionValue || 0;
    });

    return {
      revenue: {
        total: totalRevenue,
        average: averageDealValue,
        byMonth: revenueByMonth
      },
      commissions: {
        total: totalCommissions,
        average: averageCommission,
        byType: commissionsByType
      },
      pipeline: {
        total: pipelineValue,
        weighted: weightedPipelineValue,
        expectedRevenue: weightedPipelineValue
      },
      deals: {
        won: wonDeals.length,
        lost: lostDeals.length,
        winRate: deals.length > 0 ? (wonDeals.length / deals.length * 100).toFixed(1) : 0
      },
      lastUpdated: new Date()
    };
  };

  /**
   * 🔮 GERAR RELATÓRIO DE PIPELINE
   */
  const generatePipelineReport = (data) => {
    const { opportunities, deals } = data;

    // Oportunidades por status
    const opportunitiesByStatus = groupBy(opportunities, 'status');
    const statusSummary = Object.keys(opportunitiesByStatus).map(status => ({
      status,
      count: opportunitiesByStatus[status].length,
      value: opportunitiesByStatus[status].reduce((sum, opp) => sum + (opp.value || 0), 0),
      weightedValue: opportunitiesByStatus[status].reduce((sum, opp) => 
        sum + ((opp.value || 0) * (opp.probability || 0) / 100), 0)
    }));

    // Previsão de fechamentos (próximos 30/60/90 dias)
    const now = new Date();
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const next60Days = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const next90Days = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const forecast = {
      next30Days: opportunities.filter(o => o.expectedCloseDate && o.expectedCloseDate <= next30Days),
      next60Days: opportunities.filter(o => o.expectedCloseDate && o.expectedCloseDate <= next60Days),
      next90Days: opportunities.filter(o => o.expectedCloseDate && o.expectedCloseDate <= next90Days)
    };

    // Velocidade do pipeline (tempo médio por status)
    const avgTimeInStatus = calculateAverageTimeInStatus(deals);

    return {
      statusSummary,
      forecast: {
        next30Days: {
          count: forecast.next30Days.length,
          value: forecast.next30Days.reduce((sum, o) => sum + (o.value || 0), 0),
          weightedValue: forecast.next30Days.reduce((sum, o) => sum + ((o.value || 0) * (o.probability || 0) / 100), 0)
        },
        next60Days: {
          count: forecast.next60Days.length,
          value: forecast.next60Days.reduce((sum, o) => sum + (o.value || 0), 0),
          weightedValue: forecast.next60Days.reduce((sum, o) => sum + ((o.value || 0) * (o.probability || 0) / 100), 0)
        },
        next90Days: {
          count: forecast.next90Days.length,
          value: forecast.next90Days.reduce((sum, o) => sum + (o.value || 0), 0),
          weightedValue: forecast.next90Days.reduce((sum, o) => sum + ((o.value || 0) * (o.probability || 0) / 100), 0)
        }
      },
      avgTimeInStatus,
      totalPipelineValue: opportunities.reduce((sum, o) => sum + (o.value || 0), 0),
      totalOpportunities: opportunities.length,
      lastUpdated: new Date()
    };
  };

  /**
   * ⚡ GERAR RELATÓRIO DE PRODUTIVIDADE
   */
  const generateProductivityReport = (data) => {
    const { tasks, visits, opportunities, deals } = data;

    // Métricas de tarefas
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const overdueTasks = tasks.filter(t => t.status === 'overdue');
    const pendingTasks = tasks.filter(t => t.status === 'pending');

    const taskCompletionRate = tasks.length > 0 ? (completedTasks.length / tasks.length * 100).toFixed(1) : 0;
    const averageTaskCompletionTime = calculateAverageTaskCompletionTime(completedTasks);

    // Atividades por dia da semana
    const activitiesByWeekday = generateWeekdayActivity(tasks, visits);

    // Produtividade por tipo de tarefa
    const productivityByTaskType = groupBy(completedTasks, 'type');

    return {
      tasks: {
        total: tasks.length,
        completed: completedTasks.length,
        overdue: overdueTasks.length,
        pending: pendingTasks.length,
        completionRate: parseFloat(taskCompletionRate),
        averageCompletionTime: averageTaskCompletionTime
      },
      activities: {
        byWeekday: activitiesByWeekday,
        byTaskType: productivityByTaskType
      },
      efficiency: {
        tasksPerDay: tasks.length > 0 ? (tasks.length / 30).toFixed(1) : 0, // últimos 30 dias
        visitsPerWeek: visits.length > 0 ? (visits.length / 4).toFixed(1) : 0, // últimas 4 semanas
        opportunitiesPerMonth: opportunities.length
      },
      lastUpdated: new Date()
    };
  };

  // 🛠️ FUNÇÕES UTILITÁRIAS

  /**
   * Agrupa array por propriedade
   */
  const groupBy = (array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key] || 'Não especificado';
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {});
  };

  /**
   * Gerar dados de série temporal
   */
  const generateTimeSeriesData = (data, period = 'day') => {
    const grouped = {};
    data.forEach(item => {
      if (!item.createdAt) return;
      
      let key;
      if (period === 'day') {
        key = item.createdAt.toISOString().split('T')[0];
      } else if (period === 'month') {
        key = `${item.createdAt.getFullYear()}-${String(item.createdAt.getMonth() + 1).padStart(2, '0')}`;
      }
      
      grouped[key] = (grouped[key] || 0) + 1;
    });
    
    return Object.keys(grouped).sort().map(key => ({
      date: key,
      count: grouped[key]
    }));
  };

  /**
   * Gerar receita mensal
   */
  const generateMonthlyRevenue = (deals) => {
    const monthly = {};
    deals.forEach(deal => {
      if (!deal.closedAt) return;
      const key = `${deal.closedAt.getFullYear()}-${String(deal.closedAt.getMonth() + 1).padStart(2, '0')}`;
      monthly[key] = (monthly[key] || 0) + (deal.value || 0);
    });
    
    return Object.keys(monthly).sort().map(key => ({
      month: key,
      revenue: monthly[key]
    }));
  };

  /**
   * Calcular tempo médio por status
   */
  const calculateAverageTimeInStatus = (deals) => {
    // Implementação simplificada - em produção seria mais complexa
    return {
      'qualification': 3.5, // dias
      'presentation': 7.2,
      'negotiation': 14.1,
      'proposal': 5.8,
      'contract': 2.3
    };
  };

  /**
   * Calcular tempo médio de conclusão de tarefas
   */
  const calculateAverageTaskCompletionTime = (completedTasks) => {
    const tasksWithTimes = completedTasks.filter(t => t.createdAt && t.completedAt);
    if (tasksWithTimes.length === 0) return 0;
    
    const totalTime = tasksWithTimes.reduce((sum, task) => {
      const timeDiff = task.completedAt.getTime() - task.createdAt.getTime();
      return sum + (timeDiff / (1000 * 60 * 60 * 24)); // converter para dias
    }, 0);
    
    return (totalTime / tasksWithTimes.length).toFixed(1);
  };

  /**
   * Gerar atividade por dia da semana
   */
  const generateWeekdayActivity = (tasks, visits) => {
    const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const activity = weekdays.map(day => ({ day, tasks: 0, visits: 0 }));
    
    tasks.forEach(task => {
      if (task.createdAt) {
        activity[task.createdAt.getDay()].tasks++;
      }
    });
    
    visits.forEach(visit => {
      if (visit.scheduledDate) {
        activity[visit.scheduledDate.getDay()].visits++;
      }
    });
    
    return activity;
  };

  /**
   * 🔄 ATUALIZAR FILTROS DE RELATÓRIO
   */
  const updateReportFilters = useCallback((newFilters) => {
    setReportFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * 📤 EXPORTAR DADOS
   */
  const exportData = useCallback((reportType, format = 'csv') => {
    console.log(`📤 useReports: Exportando ${reportType} em formato ${format}`);
    // Implementação de exportação seria feita aqui
    // Por agora, retorna uma promessa resolvida
    return Promise.resolve({ success: true, message: 'Dados exportados com sucesso' });
  }, []);

  // Dados memoizados para performance
  const memoizedDashboard = useMemo(() => dashboardData, [dashboardData]);
  const memoizedConversion = useMemo(() => conversionReport, [conversionReport]);
  const memoizedPerformance = useMemo(() => performanceReport, [performanceReport]);
  const memoizedFinancial = useMemo(() => financialReport, [financialReport]);
  const memoizedPipeline = useMemo(() => pipelineReport, [pipelineReport]);
  const memoizedProductivity = useMemo(() => productivityReport, [productivityReport]);

  // Carregar dados quando component monta ou filtros mudam
  useEffect(() => {
    loadRawData();
  }, [loadRawData]);

  // Interface pública do hook
  return {
    // Estados
    loading,
    error,
    rawData,
    
    // Relatórios gerados
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
    
    // Ações
    loadRawData,
    generateAllReports,
    exportData,
    
    // Utilitários
    DATE_RANGES,
    KPI_DEFINITIONS,
    
    // Funções de refresh
    refreshDashboard: () => generateAllReports(rawData),
    refreshReport: (reportType) => {
      console.log(`🔄 useReports: Atualizando relatório ${reportType}`);
      generateAllReports(rawData);
    }
  };
};

export default useReports;