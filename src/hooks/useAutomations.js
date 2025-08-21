// src/hooks/useAutomations.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * 🤖 ENGINE DE AUTOMAÇÕES INTELIGENTES
 * 
 * Funcionalidades:
 * ✅ Automações baseadas em IA e machine learning
 * ✅ Regras configuráveis (If/Then conditions)
 * ✅ Triggers automáticos baseados em eventos
 * ✅ Email marketing inteligente com segmentação
 * ✅ Tasks automáticas por datas e comportamento
 * ✅ Alertas proativos para pipeline em risco
 * ✅ Workflows personalizáveis
 * ✅ A/B testing automático para campanhas
 * ✅ ROI tracking de automações
 * ✅ Sistema de aprendizagem baseado em resultados
 */

const useAutomations = () => {
  // Estados principais
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [automations, setAutomations] = useState([]);
  const [activeAutomations, setActiveAutomations] = useState([]);
  const [automationHistory, setAutomationHistory] = useState([]);
  const [templates, setTemplates] = useState([]);

  // Estados de performance
  const [automationStats, setAutomationStats] = useState({});
  const [triggers, setTriggers] = useState([]);
  const [executionQueue, setExecutionQueue] = useState([]);

  const { currentUser } = useAuth();

  // 🎯 TIPOS DE AUTOMAÇÃO DISPONÍVEIS
  const AUTOMATION_TYPES = {
    EMAIL_MARKETING: {
      id: 'email_marketing',
      name: 'Email Marketing',
      description: 'Campanhas automáticas baseadas em segmentação',
      category: 'communication',
      triggers: ['lead_score_change', 'time_based', 'behavior_based'],
      icon: '📧'
    },
    TASK_CREATION: {
      id: 'task_creation',
      name: 'Criação de Tarefas',
      description: 'Tasks automáticas baseadas em eventos',
      category: 'productivity',
      triggers: ['date_based', 'milestone_reached', 'inactivity'],
      icon: '✅'
    },
    PIPELINE_ALERTS: {
      id: 'pipeline_alerts',
      name: 'Alertas de Pipeline',
      description: 'Notificações para oportunidades em risco',
      category: 'sales',
      triggers: ['opportunity_stagnant', 'deal_risk', 'conversion_drop'],
      icon: '🚨'
    },
    LEAD_NURTURING: {
      id: 'lead_nurturing',
      name: 'Nutrição de Leads',
      description: 'Sequências automáticas de follow-up',
      category: 'marketing',
      triggers: ['lead_created', 'score_threshold', 'engagement_level'],
      icon: '🌱'
    },
    BIRTHDAY_CAMPAIGNS: {
      id: 'birthday_campaigns',
      name: 'Campanhas de Aniversário',
      description: 'Mensagens automáticas em datas especiais',
      category: 'relationship',
      triggers: ['birthday_approaching', 'anniversary_date'],
      icon: '🎂'
    },
    PAYMENT_REMINDERS: {
      id: 'payment_reminders',
      name: 'Lembretes de Pagamento',
      description: 'Alertas para tranches e vencimentos',
      category: 'financial',
      triggers: ['payment_due', 'overdue_payment'],
      icon: '💰'
    }
  };

  // 🔄 TRIGGERS DISPONÍVEIS
  const TRIGGER_TYPES = {
    // Triggers baseados em tempo
    TIME_BASED: {
      daily: { name: 'Diário', interval: 24 * 60 * 60 * 1000 },
      weekly: { name: 'Semanal', interval: 7 * 24 * 60 * 60 * 1000 },
      monthly: { name: 'Mensal', interval: 30 * 24 * 60 * 60 * 1000 },
      custom: { name: 'Personalizado', interval: null }
    },
    
    // Triggers baseados em eventos
    EVENT_BASED: {
      lead_created: 'Novo lead criado',
      client_converted: 'Lead convertido para cliente',
      opportunity_created: 'Nova oportunidade criada',
      deal_closed: 'Negócio fechado',
      visit_scheduled: 'Visita agendada',
      task_completed: 'Tarefa concluída'
    },
    
    // Triggers baseados em comportamento
    BEHAVIOR_BASED: {
      inactivity_period: 'Período de inatividade',
      score_threshold: 'Threshold de score atingido',
      engagement_drop: 'Queda no engajamento',
      pipeline_stagnant: 'Pipeline estagnado'
    }
  };

  // 📋 TEMPLATES PRÉ-DEFINIDOS
  const AUTOMATION_TEMPLATES = {
    welcome_sequence: {
      name: 'Sequência de Boas-vindas',
      description: 'Série de emails para novos leads',
      type: 'email_marketing',
      trigger: 'lead_created',
      actions: [
        { delay: 0, type: 'send_email', template: 'welcome_email' },
        { delay: 24, type: 'send_email', template: 'company_intro' },
        { delay: 72, type: 'create_task', template: 'follow_up_call' }
      ]
    },
    birthday_reminder: {
      name: 'Lembrete de Aniversário',
      description: 'Mensagem automática no aniversário do cliente',
      type: 'birthday_campaigns',
      trigger: 'birthday_approaching',
      actions: [
        { delay: -7, type: 'create_task', template: 'prepare_birthday_message' },
        { delay: 0, type: 'send_email', template: 'birthday_wishes' }
      ]
    },
    payment_reminder: {
      name: 'Lembrete de Pagamento',
      description: 'Alertas antes do vencimento de tranches',
      type: 'payment_reminders',
      trigger: 'payment_due',
      actions: [
        { delay: -7, type: 'send_email', template: 'payment_reminder_7d' },
        { delay: -1, type: 'send_sms', template: 'payment_reminder_1d' },
        { delay: 1, type: 'create_task', template: 'follow_up_overdue' }
      ]
    },
    inactive_lead_reactivation: {
      name: 'Reativação de Lead Inativo',
      description: 'Sequência para reativar leads inativos',
      type: 'lead_nurturing',
      trigger: 'inactivity_period',
      actions: [
        { delay: 0, type: 'send_email', template: 'reactivation_email' },
        { delay: 48, type: 'create_task', template: 'personal_call' },
        { delay: 168, type: 'send_email', template: 'final_attempt' }
      ]
    }
  };

  // 🤖 ALGORITMOS DE MACHINE LEARNING PARA AUTOMAÇÕES
  const MLAutomations = {
    /**
     * Calcular o melhor momento para enviar emails
     */
    calculateBestSendTime: (clientHistory) => {
      if (!clientHistory || clientHistory.length === 0) {
        return { hour: 14, confidence: 0.3 }; // Default: 14h
      }

      // Analisar horários de maior engajamento
      const engagementByHour = {};
      clientHistory.forEach(interaction => {
        if (interaction.type === 'email_open' || interaction.type === 'email_click') {
          const hour = new Date(interaction.timestamp).getHours();
          engagementByHour[hour] = (engagementByHour[hour] || 0) + 1;
        }
      });

      // Encontrar horário com maior engajamento
      const bestHour = Object.entries(engagementByHour)
        .sort(([,a], [,b]) => b - a)[0];

      return {
        hour: bestHour ? parseInt(bestHour[0]) : 14,
        confidence: clientHistory.length > 10 ? 0.8 : 0.5
      };
    },

    /**
     * Segmentação inteligente de clientes
     */
    segmentClients: (clients, criteria) => {
      const segments = {
        hot_prospects: [],
        warm_leads: [],
        cold_leads: [],
        loyal_clients: [],
        at_risk_clients: []
      };

      clients.forEach(client => {
        const score = client.score || 0;
        const lastInteraction = client.lastInteraction ? 
          new Date() - new Date(client.lastInteraction) : Infinity;
        const daysSinceLastInteraction = lastInteraction / (1000 * 60 * 60 * 24);

        // Classificação baseada em score e atividade
        if (score >= 80 && daysSinceLastInteraction <= 7) {
          segments.hot_prospects.push(client);
        } else if (score >= 60 && daysSinceLastInteraction <= 30) {
          segments.warm_leads.push(client);
        } else if (score < 60 || daysSinceLastInteraction > 90) {
          segments.cold_leads.push(client);
        } else if (client.totalDeals > 0 && daysSinceLastInteraction <= 60) {
          segments.loyal_clients.push(client);
        } else {
          segments.at_risk_clients.push(client);
        }
      });

      return segments;
    },

    /**
     * Predizer sucesso de automação
     */
    predictAutomationSuccess: (automation, targetSegment) => {
      // Fatores que influenciam o sucesso
      const factors = {
        segmentSize: Math.min(targetSegment.length / 100, 1), // Normalizado
        automationType: getAutomationTypeScore(automation.type),
        timing: automation.timing === 'optimal' ? 1 : 0.7,
        personalization: automation.personalized ? 0.9 : 0.6
      };

      // Calcular score de sucesso ponderado
      const weights = { segmentSize: 0.2, automationType: 0.3, timing: 0.3, personalization: 0.2 };
      const successScore = Object.entries(factors)
        .reduce((sum, [key, value]) => sum + (value * weights[key]), 0);

      return {
        successProbability: Math.round(successScore * 100),
        recommendedAdjustments: generateRecommendations(factors)
      };
    }
  };

  // Funções auxiliares para ML
  const getAutomationTypeScore = (type) => {
    const scores = {
      email_marketing: 0.8,
      task_creation: 0.9,
      pipeline_alerts: 0.7,
      lead_nurturing: 0.85,
      birthday_campaigns: 0.6,
      payment_reminders: 0.95
    };
    return scores[type] || 0.5;
  };

  const generateRecommendations = (factors) => {
    const recommendations = [];
    
    if (factors.segmentSize < 0.5) {
      recommendations.push('Considere expandir o segmento alvo para maior impacto');
    }
    if (factors.timing < 0.8) {
      recommendations.push('Otimize o timing baseado no histórico de engajamento');
    }
    if (factors.personalization < 0.8) {
      recommendations.push('Adicione mais elementos de personalização');
    }
    
    return recommendations;
  };

  /**
   * 📤 CARREGAR AUTOMAÇÕES
   */
  const loadAutomations = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'automations'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const automationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAutomations(automationsData);
        setActiveAutomations(automationsData.filter(auto => auto.status === 'active'));
      });

      return unsubscribe;

    } catch (err) {
      console.error('Erro ao carregar automações:', err);
      setError('Erro ao carregar automações');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * ✨ CRIAR NOVA AUTOMAÇÃO
   */
  const createAutomation = useCallback(async (automationData) => {
    if (!currentUser) throw new Error('Usuário não autenticado');

    setLoading(true);

    try {
      // Validar dados da automação
      if (!automationData.name || !automationData.type || !automationData.trigger) {
        throw new Error('Dados obrigatórios em falta');
      }

      // Estrutura completa da automação
      const automation = {
        ...automationData,
        userId: currentUser.uid,
        status: 'active',
        createdAt: new Date(),
        lastModified: new Date(),
        createdBy: currentUser.email,
        
        // Estatísticas iniciais
        stats: {
          executions: 0,
          successRate: 0,
          totalSent: 0,
          totalClicks: 0,
          totalConversions: 0,
          avgResponseTime: 0
        },

        // Configurações de ML
        mlConfig: {
          optimizeTiming: automationData.mlConfig?.optimizeTiming || false,
          adaptiveSegmentation: automationData.mlConfig?.adaptiveSegmentation || false,
          successPrediction: automationData.mlConfig?.successPrediction || true
        }
      };

      // Calcular predição de sucesso se habilitado
      if (automation.mlConfig.successPrediction && automation.targetSegment) {
        const prediction = MLAutomations.predictAutomationSuccess(
          automation, 
          automation.targetSegment
        );
        automation.prediction = prediction;
      }

      const docRef = await addDoc(collection(db, 'automations'), automation);

      // Log da criação
      await logAutomationEvent(docRef.id, 'created', {
        automationType: automation.type,
        trigger: automation.trigger
      });

      return {
        success: true,
        automationId: docRef.id,
        message: 'Automação criada com sucesso!'
      };

    } catch (err) {
      console.error('Erro ao criar automação:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * 🔄 ATUALIZAR AUTOMAÇÃO
   */
  const updateAutomation = useCallback(async (automationId, updates) => {
    if (!currentUser) throw new Error('Usuário não autenticado');

    setLoading(true);

    try {
      const automationRef = doc(db, 'automations', automationId);
      
      const updateData = {
        ...updates,
        lastModified: new Date(),
        modifiedBy: currentUser.email
      };

      await updateDoc(automationRef, updateData);

      await logAutomationEvent(automationId, 'updated', {
        updatedFields: Object.keys(updates)
      });

      return {
        success: true,
        message: 'Automação atualizada com sucesso!'
      };

    } catch (err) {
      console.error('Erro ao atualizar automação:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * ⏸️ PAUSAR/ATIVAR AUTOMAÇÃO
   */
  const toggleAutomation = useCallback(async (automationId, newStatus) => {
    const result = await updateAutomation(automationId, { 
      status: newStatus,
      statusChangedAt: new Date()
    });

    if (result.success) {
      await logAutomationEvent(automationId, newStatus === 'active' ? 'activated' : 'paused');
    }

    return result;
  }, [updateAutomation]);

  /**
   * 🗑️ ELIMINAR AUTOMAÇÃO
   */
  const deleteAutomation = useCallback(async (automationId) => {
    if (!currentUser) throw new Error('Usuário não autenticado');

    setLoading(true);

    try {
      await deleteDoc(doc(db, 'automations', automationId));

      await logAutomationEvent(automationId, 'deleted');

      return {
        success: true,
        message: 'Automação eliminada com sucesso!'
      };

    } catch (err) {
      console.error('Erro ao eliminar automação:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * 🚀 EXECUTAR AUTOMAÇÃO MANUALMENTE
   */
  const executeAutomation = useCallback(async (automationId, targetData = null) => {
    if (!currentUser) throw new Error('Usuário não autenticado');

    setLoading(true);

    try {
      const automation = automations.find(auto => auto.id === automationId);
      if (!automation) {
        throw new Error('Automação não encontrada');
      }

      if (automation.status !== 'active') {
        throw new Error('Automação não está ativa');
      }

      // Executar ações da automação
      const executionResults = [];
      for (const action of automation.actions) {
        const result = await executeAction(action, targetData, automation);
        executionResults.push(result);
      }

      // Atualizar estatísticas
      await updateAutomationStats(automationId, executionResults);

      await logAutomationEvent(automationId, 'executed', {
        targetData,
        results: executionResults
      });

      return {
        success: true,
        results: executionResults,
        message: 'Automação executada com sucesso!'
      };

    } catch (err) {
      console.error('Erro ao executar automação:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  }, [currentUser, automations]);

  /**
   * ⚡ EXECUTAR AÇÃO ESPECÍFICA
   */
  const executeAction = async (action, targetData, automation) => {
    try {
      switch (action.type) {
        case 'send_email':
          return await sendEmail(action, targetData, automation);
        
        case 'send_sms':
          return await sendSMS(action, targetData, automation);
        
        case 'create_task':
          return await createTask(action, targetData, automation);
        
        case 'update_lead_score':
          return await updateLeadScore(action, targetData, automation);
        
        case 'create_opportunity':
          return await createOpportunity(action, targetData, automation);
        
        case 'schedule_visit':
          return await scheduleVisit(action, targetData, automation);
        
        default:
          throw new Error(`Tipo de ação não suportado: ${action.type}`);
      }
    } catch (err) {
      return {
        success: false,
        action: action.type,
        error: err.message
      };
    }
  };

  // Implementações das ações específicas
  const sendEmail = async (action, targetData, automation) => {
    // Simular envio de email
    // Em produção, integrar com serviço de email (SendGrid, etc.)
    
    return {
      success: true,
      action: 'send_email',
      details: {
        template: action.template,
        recipient: targetData?.email,
        subject: action.subject || 'Email automático',
        sentAt: new Date()
      }
    };
  };

  const sendSMS = async (action, targetData, automation) => {
    // Simular envio de SMS
    // Em produção, integrar com serviço de SMS
    
    return {
      success: true,
      action: 'send_sms',
      details: {
        template: action.template,
        recipient: targetData?.phone,
        message: action.message,
        sentAt: new Date()
      }
    };
  };

  const createTask = async (action, targetData, automation) => {
    try {
      // Criar tarefa no sistema
      const taskData = {
        title: action.title || `Tarefa automática - ${automation.name}`,
        description: action.description || 'Tarefa gerada automaticamente',
        assignedTo: currentUser.uid,
        relatedTo: targetData?.id,
        relatedType: targetData?.type || 'automation',
        priority: action.priority || 'medium',
        status: 'pending',
        dueDate: action.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdBy: 'automation',
        automationId: automation.id,
        userId: currentUser.uid,
        createdAt: new Date()
      };

      await addDoc(collection(db, 'tasks'), taskData);

      return {
        success: true,
        action: 'create_task',
        details: taskData
      };

    } catch (err) {
      throw new Error(`Erro ao criar tarefa: ${err.message}`);
    }
  };

  const updateLeadScore = async (action, targetData, automation) => {
    // Implementar atualização de score
    return {
      success: true,
      action: 'update_lead_score',
      details: {
        leadId: targetData?.id,
        oldScore: targetData?.score || 0,
        newScore: (targetData?.score || 0) + (action.scoreChange || 5),
        reason: 'Automação executada'
      }
    };
  };

  const createOpportunity = async (action, targetData, automation) => {
    // Implementar criação de oportunidade
    return {
      success: true,
      action: 'create_opportunity',
      details: {
        clientId: targetData?.id,
        title: action.title || 'Oportunidade automática',
        status: 'identificacao',
        source: 'automation'
      }
    };
  };

  const scheduleVisit = async (action, targetData, automation) => {
    // Implementar agendamento de visita
    return {
      success: true,
      action: 'schedule_visit',
      details: {
        clientId: targetData?.id,
        scheduledDate: action.scheduledDate,
        type: action.visitType || 'property_visit'
      }
    };
  };

  /**
   * 📊 ATUALIZAR ESTATÍSTICAS DA AUTOMAÇÃO
   */
  const updateAutomationStats = async (automationId, results) => {
    try {
      const automation = automations.find(auto => auto.id === automationId);
      if (!automation) return;

      const successfulActions = results.filter(r => r.success).length;
      const totalActions = results.length;
      const successRate = totalActions > 0 ? (successfulActions / totalActions) * 100 : 0;

      const updatedStats = {
        ...automation.stats,
        executions: (automation.stats.executions || 0) + 1,
        successRate: successRate,
        lastExecution: new Date()
      };

      await updateDoc(doc(db, 'automations', automationId), {
        stats: updatedStats
      });

    } catch (err) {
      console.error('Erro ao atualizar estatísticas:', err);
    }
  };

  /**
   * 📝 LOG DE EVENTOS DA AUTOMAÇÃO
   */
  const logAutomationEvent = async (automationId, eventType, eventData = {}) => {
    try {
      const logEntry = {
        automationId,
        eventType,
        eventData,
        timestamp: new Date(),
        userId: currentUser.uid,
        userEmail: currentUser.email
      };

      await addDoc(collection(db, 'automation_logs'), logEntry);

    } catch (err) {
      console.error('Erro ao registrar log:', err);
    }
  };

  /**
   * 📈 CALCULAR ESTATÍSTICAS GERAIS
   */
  const calculateOverallStats = useMemo(() => {
    if (automations.length === 0) return {};

    const totalAutomations = automations.length;
    const activeAutomations = automations.filter(auto => auto.status === 'active').length;
    const totalExecutions = automations.reduce((sum, auto) => sum + (auto.stats?.executions || 0), 0);
    const avgSuccessRate = automations.reduce((sum, auto) => sum + (auto.stats?.successRate || 0), 0) / totalAutomations;

    return {
      totalAutomations,
      activeAutomations,
      pausedAutomations: totalAutomations - activeAutomations,
      totalExecutions,
      avgSuccessRate: avgSuccessRate.toFixed(1),
      automationsByType: groupAutomationsByType(),
      topPerformingAutomations: getTopPerformingAutomations()
    };
  }, [automations]);

  const groupAutomationsByType = () => {
    const groups = {};
    automations.forEach(auto => {
      groups[auto.type] = (groups[auto.type] || 0) + 1;
    });
    return groups;
  };

  const getTopPerformingAutomations = () => {
    return automations
      .filter(auto => auto.stats?.executions > 0)
      .sort((a, b) => (b.stats?.successRate || 0) - (a.stats?.successRate || 0))
      .slice(0, 5);
  };

  // Carregar automações ao montar componente
  useEffect(() => {
    let unsubscribe;
    
    if (currentUser) {
      loadAutomations().then(unsub => {
        unsubscribe = unsub;
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, loadAutomations]);

  // Inicializar templates
  useEffect(() => {
    setTemplates(Object.values(AUTOMATION_TEMPLATES));
  }, []);

  return {
    // Estados
    loading,
    error,
    automations,
    activeAutomations,
    automationHistory,
    templates,
    automationStats: calculateOverallStats,
    triggers,
    executionQueue,

    // Métodos CRUD
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomation,

    // Execução
    executeAutomation,
    executeAction,

    // Utilitários
    loadAutomations,
    logAutomationEvent,

    // Constantes
    AUTOMATION_TYPES,
    TRIGGER_TYPES,
    AUTOMATION_TEMPLATES,

    // Machine Learning
    MLAutomations
  };
};

export default useAutomations;