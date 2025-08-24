// src/utils/LeadTimeClassifier.js
// 🕐 UTILITÁRIO DE CLASSIFICAÇÃO TEMPORAL DE LEADS
// ================================================
// MyImoMate 3.0 - Sistema inteligente de classificação automática
// ✅ Classifica leads automaticamente baseado no tempo
// ✅ Novos → Contactados → Mornos (2-4 sem) → Frios (1+ mês)
// ✅ Funções de batch processing para atualização em lote
// ✅ Analytics e relatórios de tendências temporais

import { 
  UNIFIED_LEAD_STATUS, 
  calculateDaysSinceCreation,
  classifyLeadByTime,
  filterLeadsByTimeStatus 
} from '../constants/unifiedTypes';

/**
 * CLASSIFICADOR TEMPORAL DE LEADS
 * ================================
 */
export class LeadTimeClassifier {
  
  /**
   * Classificar um único lead baseado no tempo
   * @param {Object} lead - Objeto do lead
   * @returns {Object} Lead com status atualizado
   */
  static classifySingleLead(lead) {
    if (!lead || !lead.createdAt) {
      return { ...lead, status: UNIFIED_LEAD_STATUS.NOVO };
    }

    const newStatus = classifyLeadByTime(lead);
    const daysSinceCreation = calculateDaysSinceCreation(lead.createdAt);

    return {
      ...lead,
      status: newStatus,
      daysSinceCreation,
      lastClassified: new Date(),
      classificationReason: this.getClassificationReason(daysSinceCreation, newStatus)
    };
  }

  /**
   * Classificar múltiplos leads em lote
   * @param {Array} leads - Array de leads
   * @returns {Array} Array de leads classificados
   */
  static classifyLeadsBatch(leads) {
    if (!Array.isArray(leads)) return [];

    return leads.map(lead => this.classifySingleLead(lead));
  }

  /**
   * Obter razão da classificação para debug/log
   * @param {number} days - Dias desde criação
   * @param {string} status - Status atribuído
   * @returns {string} Explicação da classificação
   */
  static getClassificationReason(days, status) {
    switch (status) {
      case UNIFIED_LEAD_STATUS.NOVO:
        return `Lead criado há ${days} dia(s) - ainda novo`;
      case UNIFIED_LEAD_STATUS.CONTACTADO:
        return `Lead criado há ${days} dia(s) - contactado recentemente`;
      case UNIFIED_LEAD_STATUS.MORNOU:
        return `Lead criado há ${days} dia(s) - mornou (2-4 semanas sem qualificação)`;
      case UNIFIED_LEAD_STATUS.FRIO:
        return `Lead criado há ${days} dia(s) - frio (mais de 1 mês sem qualificação)`;
      default:
        return `Status manual: ${status}`;
    }
  }

  /**
   * Filtrar leads que precisam de reclassificação
   * @param {Array} leads - Array de leads
   * @returns {Array} Leads que devem ser reclassificados
   */
  static getLeadsNeedingReclassification(leads) {
    if (!Array.isArray(leads)) return [];

    return leads.filter(lead => {
      // Skip leads já convertidos/perdidos/inativos
      if ([
        UNIFIED_LEAD_STATUS.CONVERTIDO,
        UNIFIED_LEAD_STATUS.PERDIDO,
        UNIFIED_LEAD_STATUS.INATIVO
      ].includes(lead.status)) {
        return false;
      }

      const daysSinceCreation = calculateDaysSinceCreation(lead.createdAt);
      const expectedStatus = classifyLeadByTime(lead);

      // Precisa reclassificação se o status atual não bate com o esperado
      return lead.status !== expectedStatus;
    });
  }

  /**
   * Gerar relatório de classificação temporal
   * @param {Array} leads - Array de leads
   * @returns {Object} Relatório detalhado
   */
  static generateTimeClassificationReport(leads) {
    if (!Array.isArray(leads) || leads.length === 0) {
      return {
        total: 0,
        byStatus: {},
        byTimeRange: {},
        needsReclassification: 0,
        trends: {}
      };
    }

    const report = {
      total: leads.length,
      byStatus: {
        [UNIFIED_LEAD_STATUS.NOVO]: 0,
        [UNIFIED_LEAD_STATUS.CONTACTADO]: 0,
        [UNIFIED_LEAD_STATUS.MORNOU]: 0,
        [UNIFIED_LEAD_STATUS.FRIO]: 0,
        [UNIFIED_LEAD_STATUS.CONVERTIDO]: 0,
        [UNIFIED_LEAD_STATUS.PERDIDO]: 0,
        [UNIFIED_LEAD_STATUS.INATIVO]: 0
      },
      byTimeRange: {
        '0-1_days': 0,
        '2-7_days': 0,
        '1-2_weeks': 0,
        '2-4_weeks': 0,
        '1-2_months': 0,
        '2+_months': 0
      },
      needsReclassification: 0,
      trends: {},
      averageDaysToConversion: 0,
      conversionRateByTimeRange: {}
    };

    let totalConversionDays = 0;
    let convertedLeadsCount = 0;

    leads.forEach(lead => {
      // Classificação atual vs esperada
      const expectedStatus = classifyLeadByTime(lead);
      const currentStatus = lead.status;
      
      if (currentStatus !== expectedStatus && ![
        UNIFIED_LEAD_STATUS.CONVERTIDO,
        UNIFIED_LEAD_STATUS.PERDIDO,
        UNIFIED_LEAD_STATUS.INATIVO
      ].includes(currentStatus)) {
        report.needsReclassification++;
      }

      // Contagem por status
      if (report.byStatus[currentStatus] !== undefined) {
        report.byStatus[currentStatus]++;
      }

      // Contagem por faixa temporal
      const days = calculateDaysSinceCreation(lead.createdAt);
      if (days <= 1) {
        report.byTimeRange['0-1_days']++;
      } else if (days <= 7) {
        report.byTimeRange['2-7_days']++;
      } else if (days <= 14) {
        report.byTimeRange['1-2_weeks']++;
      } else if (days <= 28) {
        report.byTimeRange['2-4_weeks']++;
      } else if (days <= 60) {
        report.byTimeRange['1-2_months']++;
      } else {
        report.byTimeRange['2+_months']++;
      }

      // Analytics de conversão
      if (currentStatus === UNIFIED_LEAD_STATUS.CONVERTIDO) {
        totalConversionDays += days;
        convertedLeadsCount++;
      }
    });

    // Média de dias para conversão
    if (convertedLeadsCount > 0) {
      report.averageDaysToConversion = Math.round(totalConversionDays / convertedLeadsCount);
    }

    // Taxa de conversão por faixa temporal
    Object.keys(report.byTimeRange).forEach(range => {
      const totalInRange = report.byTimeRange[range];
      if (totalInRange > 0) {
        const convertedInRange = this.getConvertedLeadsInTimeRange(leads, range);
        report.conversionRateByTimeRange[range] = 
          Math.round((convertedInRange / totalInRange) * 100);
      }
    });

    return report;
  }

  /**
   * Obter leads convertidos em uma faixa temporal específica
   * @private
   */
  static getConvertedLeadsInTimeRange(leads, timeRange) {
    return leads.filter(lead => {
      if (lead.status !== UNIFIED_LEAD_STATUS.CONVERTIDO) return false;
      
      const days = calculateDaysSinceCreation(lead.createdAt);
      
      switch (timeRange) {
        case '0-1_days': return days <= 1;
        case '2-7_days': return days > 1 && days <= 7;
        case '1-2_weeks': return days > 7 && days <= 14;
        case '2-4_weeks': return days > 14 && days <= 28;
        case '1-2_months': return days > 28 && days <= 60;
        case '2+_months': return days > 60;
        default: return false;
      }
    }).length;
  }

  /**
   * Recomendar ações baseadas na classificação temporal
   * @param {Object} lead - Lead individual
   * @returns {Array} Array de ações recomendadas
   */
  static recommendActionsForLead(lead) {
    const days = calculateDaysSinceCreation(lead.createdAt);
    const status = classifyLeadByTime(lead);
    const actions = [];

    switch (status) {
      case UNIFIED_LEAD_STATUS.NOVO:
        actions.push({
          priority: 'high',
          action: 'first_contact',
          title: 'Primeiro Contacto',
          description: 'Fazer contacto inicial nas próximas 2 horas',
          deadline: '2 horas'
        });
        break;

      case UNIFIED_LEAD_STATUS.CONTACTADO:
        actions.push({
          priority: 'medium',
          action: 'follow_up',
          title: 'Follow-up',
          description: 'Agendar visita ou reunião',
          deadline: '2-3 dias'
        });
        break;

      case UNIFIED_LEAD_STATUS.MORNOU:
        actions.push({
          priority: 'high',
          action: 'reactivation',
          title: 'Reativação Urgente',
          description: 'Lead está a arrefecer - contacto imediato necessário',
          deadline: 'Hoje'
        });
        actions.push({
          priority: 'medium',
          action: 'special_offer',
          title: 'Oferta Especial',
          description: 'Considerar incentivo ou oferta personalizada',
          deadline: '3 dias'
        });
        break;

      case UNIFIED_LEAD_STATUS.FRIO:
        actions.push({
          priority: 'low',
          action: 'nurturing_campaign',
          title: 'Campanha de Nutrição',
          description: 'Incluir em campanha de email marketing',
          deadline: '1 semana'
        });
        actions.push({
          priority: 'low',
          action: 'reassessment',
          title: 'Reavaliação',
          description: 'Avaliar se deve ser movido para inativo',
          deadline: '2 semanas'
        });
        break;
    }

    return actions;
  }

  /**
   * Gerar dashboard de métricas temporais
   * @param {Array} leads - Array de leads
   * @returns {Object} Métricas para dashboard
   */
  static getDashboardMetrics(leads) {
    const report = this.generateTimeClassificationReport(leads);
    
    return {
      totalLeads: report.total,
      distribution: {
        novos: report.byStatus[UNIFIED_LEAD_STATUS.NOVO],
        contactados: report.byStatus[UNIFIED_LEAD_STATUS.CONTACTADO],
        mornos: report.byStatus[UNIFIED_LEAD_STATUS.MORNOU],
        frios: report.byStatus[UNIFIED_LEAD_STATUS.FRIO],
        convertidos: report.byStatus[UNIFIED_LEAD_STATUS.CONVERTIDO]
      },
      alerts: {
        needsReclassification: report.needsReclassification,
        mornosCount: report.byStatus[UNIFIED_LEAD_STATUS.MORNOU],
        friosCount: report.byStatus[UNIFIED_LEAD_STATUS.FRIO]
      },
      performance: {
        averageDaysToConversion: report.averageDaysToConversion,
        conversionRate: report.total > 0 ? 
          Math.round((report.byStatus[UNIFIED_LEAD_STATUS.CONVERTIDO] / report.total) * 100) : 0
      }
    };
  }
}

/**
 * FUNÇÕES AUXILIARES DE EXPORTAÇÃO
 * =================================
 */

/**
 * Processar leads em lote com classificação temporal
 * @param {Array} leads - Array de leads
 * @returns {Object} Resultado do processamento
 */
export const processLeadsWithTimeClassification = (leads) => {
  const classifiedLeads = LeadTimeClassifier.classifyLeadsBatch(leads);
  const report = LeadTimeClassifier.generateTimeClassificationReport(classifiedLeads);
  const dashboardMetrics = LeadTimeClassifier.getDashboardMetrics(classifiedLeads);
  const needsReclassification = LeadTimeClassifier.getLeadsNeedingReclassification(leads);

  return {
    classifiedLeads,
    report,
    dashboardMetrics,
    needsReclassification,
    summary: {
      totalProcessed: leads.length,
      reclassifiedCount: needsReclassification.length,
      mornosAlertCount: dashboardMetrics.distribution.mornos,
      friosAlertCount: dashboardMetrics.distribution.frios,
      conversionRate: dashboardMetrics.performance.conversionRate,
      averageConversionTime: dashboardMetrics.performance.averageDaysToConversion
    }
  };
};

/**
 * Obter ações recomendadas para todos os leads
 * @param {Array} leads - Array de leads
 * @returns {Array} Array de ações agrupadas por prioridade
 */
export const getRecommendedActionsForAllLeads = (leads) => {
  const allActions = [];
  
  leads.forEach(lead => {
    const actions = LeadTimeClassifier.recommendActionsForLead(lead);
    actions.forEach(action => {
      allActions.push({
        ...action,
        leadId: lead.id,
        leadName: lead.name,
        leadStatus: classifyLeadByTime(lead),
        daysSinceCreation: calculateDaysSinceCreation(lead.createdAt)
      });
    });
  });

  // Agrupar por prioridade
  return {
    high: allActions.filter(a => a.priority === 'high'),
    medium: allActions.filter(a => a.priority === 'medium'),
    low: allActions.filter(a => a.priority === 'low')
  };
};

/**
 * Exportar classificador para uso global
 */
export default LeadTimeClassifier;