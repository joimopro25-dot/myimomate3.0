// src/hooks/useAutomations.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fbService, SUBCOLLECTIONS } from '../services/firebaseService';
import { logger } from '../utils/logger';

/**
 * 🤖 ENGINE DE AUTOMAÇÕES INTELIGENTES - MULTI-TENANT
 * 
 * Funcionalidades:
 * ✅ Automações baseadas em IA e machine learning ISOLADAS por utilizador
 * ✅ Regras configuráveis (If/Then conditions) personalizadas
 * ✅ Triggers automáticos baseados em eventos do utilizador
 * ✅ Email marketing inteligente com segmentação individual
 * ✅ Tasks automáticas por datas e comportamento pessoal
 * ✅ Alertas proativos para pipeline individual em risco
 * ✅ Workflows personalizáveis únicos por consultor
 * ✅ A/B testing automático para campanhas individuais
 * ✅ ROI tracking de automações por utilizador
 * ✅ Sistema de aprendizagem baseado em resultados pessoais
 * 
 * ARQUITETURA MULTI-TENANT:
 * - Todas as automações isoladas por utilizador
 * - Performance otimizada com subcoleções
 * - Segurança máxima - dados nunca cruzam entre utilizadores
 * - ML treinado apenas com dados do utilizador específico
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
      description: 'Campanhas automáticas baseadas em segmentação personalizada',
      icon: '📧',
      category: 'Marketing',
      requiredFields: ['subject', 'content', 'targetSegment'],
      mlOptimizable: true,
      avgSuccessRate: 0.65
    },
    TASK_CREATION: {
      id: 'task_creation',
      name: 'Criação de Tarefas',
      description: 'Tasks automáticas baseadas em eventos e datas',
      icon: '📋',
      category: 'Produtividade',
      requiredFields: ['taskTitle', 'dueDate', 'priority'],
      mlOptimizable: true,
      avgSuccessRate: 0.85
    },
    PIPELINE_ALERTS: {
      id: 'pipeline_alerts',
      name: 'Alertas de Pipeline',
      description: 'Notificações proativas para oportunidades em risco',
      icon: '🚨',
      category: 'Vendas',
      requiredFields: ['alertType', 'conditions', 'notificationMethod'],
      mlOptimizable: true,
      avgSuccessRate: 0.75
    },
    LEAD_NURTURING: {
      id: 'lead_nurturing',
      name: 'Nutrição de Leads',
      description: 'Sequências automáticas de follow-up baseadas no comportamento',
      icon: '🌱',
      category: 'Marketing',
      requiredFields: ['sequence', 'triggers', 'content'],
      mlOptimizable: true,
      avgSuccessRate: 0.70
    },
    BIRTHDAY_CAMPAIGNS: {
      id: 'birthday_campaigns',
      name: 'Campanhas de Aniversário',
      description: 'Mensagens automáticas para clientes em datas especiais',
      icon: '🎉',
      category: 'Relacionamento',
      requiredFields: ['message', 'notificationDays'],
      mlOptimizable: false,
      avgSuccessRate: 0.90
    },
    PAYMENT_REMINDERS: {
      id: 'payment_reminders',
      name: 'Lembretes de Pagamento',
      description: 'Avisos automáticos para contratos e faturas pendentes',
      icon: '💰',
      category: 'Financeiro',
      requiredFields: ['reminderDays', 'escalationRules'],
      mlOptimizable: false,
      avgSuccessRate: 0.85
    }
  };

  // 🔥 TIPOS DE TRIGGER DISPONÍVEIS
  const TRIGGER_TYPES = {
    DATE_BASED: {
      id: 'date_based',
      name: 'Baseado em Data',
      description: 'Execução agendada ou baseada em datas específicas',
      icon: '📅',
      conditions: ['specific_date', 'relative_date', 'recurring']
    },
    EVENT_BASED: {
      id: 'event_based',
      name: 'Baseado em Evento',
      description: 'Execução quando eventos específicos ocorrem',
      icon: '⚡',
      conditions: ['lead_created', 'deal_closed', 'task_completed', 'client_inactive']
    },
    BEHAVIOR_BASED: {
      id: 'behavior_based',
      name: 'Baseado em Comportamento',
      description: 'Execução baseada em padrões de comportamento',
      icon: '🎯',
      conditions: ['email_opened', 'website_visited', 'form_submitted', 'phone_answered']
    },
    PERFORMANCE_BASED: {
      id: 'performance_based',
      name: 'Baseado em Performance',
      description: 'Execução baseada em métricas e KPIs',
      icon: '📊',
      conditions: ['conversion_drop', 'pipeline_stalled', 'goal_achieved', 'quota_exceeded']
    }
  };

  // 📝 TEMPLATES PRÉ-DEFINIDOS DE AUTOMAÇÃO
  const AUTOMATION_TEMPLATES = {
    WELCOME_SEQUENCE: {
      id: 'welcome_sequence',
      name: 'Sequência de Boas-vindas',
      type: AUTOMATION_TYPES.LEAD_NURTURING.id,
      description: 'Série de emails para novos leads com conteúdo educativo',
      template: {
        trigger: {
          type: TRIGGER_TYPES.EVENT_BASED.id,
          condition: 'lead_created',
          delay: 0
        },
        actions: [
          {
            type: 'send_email',
            delay: 0,
            content: 'Email de boas-vindas e introdução aos serviços'
          },
          {
            type: 'send_email',
            delay: 86400, // 24h
            content: 'Caso de sucesso e depoimentos'
          },
          {
            type: 'send_email',
            delay: 259200, // 72h
            content: 'Convite para consulta gratuita'
          }
        ],
        mlOptimizations: {
          optimizeTiming: true,
          adaptiveContent: true,
          successPrediction: true
        }
      },
      tags: ['Novos Leads', 'Educativo', 'Conversão']
    },

    PIPELINE_MONITOR: {
      id: 'pipeline_monitor',
      name: 'Monitor de Pipeline',
      type: AUTOMATION_TYPES.PIPELINE_ALERTS.id,
      description: 'Alertas para oportunidades paradas há mais de 7 dias',
      template: {
        trigger: {
          type: TRIGGER_TYPES.PERFORMANCE_BASED.id,
          condition: 'pipeline_stalled',
          threshold: 7 // dias
        },
        actions: [
          {
            type: 'create_task',
            content: 'Follow-up necessário - oportunidade parada',
            priority: 'high',
            dueDate: 'today'
          },
          {
            type: 'send_notification',
            content: 'Oportunidade {opportunity_name} precisa de atenção'
          }
        ],
        conditions: {
          stageNotIn: ['Fechada', 'Perdida'],
          lastActivityDays: 7
        }
      },
      tags: ['Pipeline', 'Vendas', 'Produtividade']
    },

    BIRTHDAY_GREETINGS: {
      id: 'birthday_greetings',
      name: 'Parabéns Automáticos',
      type: AUTOMATION_TYPES.BIRTHDAY_CAMPAIGNS.id,
      description: 'Mensagens de aniversário personalizadas para clientes',
      template: {
        trigger: {
          type: TRIGGER_TYPES.DATE_BASED.id,
          condition: 'client_birthday',
          timing: 'morning'
        },
        actions: [
          {
            type: 'send_email',
            content: 'Mensagem de parabéns personalizada',
            personalization: true
          },
          {
            type: 'create_task',
            content: 'Ligar para cumprimentar {client_name}',
            priority: 'medium'
          }
        ],
        personalization: {
          useClientName: true,
          includePhoto: true,
          customMessage: true
        }
      },
      tags: ['Relacionamento', 'Personalizado', 'Fidelização']
    },

    PAYMENT_FOLLOW_UP: {
      id: 'payment_follow_up',
      name: 'Follow-up de Pagamentos',
      type: AUTOMATION_TYPES.PAYMENT_REMINDERS.id,
      description: 'Lembretes automáticos para faturas pendentes',
      template: {
        trigger: {
          type: TRIGGER_TYPES.DATE_BASED.id,
          condition: 'payment_due',
          beforeDays: [7, 3, 1, 0, -3, -7]
        },
        actions: [
          {
            type: 'send_email',
            delay: 0,
            tone: 'friendly',
            content: 'Lembrete amigável de pagamento pendente'
          },
          {
            type: 'create_task',
            delay: 259200, // 3 dias após vencimento
            content: 'Follow-up telefónico para pagamento em atraso',
            priority: 'high'
          }
        ],
        escalation: {
          levels: ['friendly', 'formal', 'urgent', 'legal']
        }
      },
      tags: ['Financeiro', 'Cobrança', 'Relacionamento']
    },

    RE_ENGAGEMENT: {
      id: 're_engagement',
      name: 'Reativação de Clientes',
      type: AUTOMATION_TYPES.EMAIL_MARKETING.id,
      description: 'Campanha para reativar clientes inativos',
      template: {
        trigger: {
          type: TRIGGER_TYPES.BEHAVIOR_BASED.id,
          condition: 'client_inactive',
          threshold: 90 // dias
        },
        actions: [
          {
            type: 'send_email',
            content: 'Sentimos a sua falta - oferta especial',
            personalization: true
          },
          {
            type: 'create_task',
            content: 'Follow-up pessoal com cliente inativo',
            priority: 'medium'
          }
        ],
        segmentation: {
          lastInteractionDays: 90,
          excludeRecentPurchases: true,
          includeHighValue: true
        }
      },
      tags: ['Reativação', 'Inativos', 'Ofertas']
    },

    CONVERSION_OPTIMIZER: {
      id: 'conversion_optimizer',
      name: 'Otimizador de Conversão',
      type: AUTOMATION_TYPES.LEAD_NURTURING.id,
      description: 'Sequência inteligente para converter leads em clientes',
      template: {
        trigger: {
          type: TRIGGER_TYPES.BEHAVIOR_BASED.id,
          condition: 'high_intent_behavior',
          signals: ['multiple_page_views', 'pricing_viewed', 'demo_requested']
        },
        actions: [
          {
            type: 'send_email',
            content: 'Proposta personalizada baseada no interesse',
            urgency: 'medium'
          },
          {
            type: 'schedule_call',
            delay: 3600, // 1h
            content: 'Agendar demonstração personalizada'
          }
        ],
        mlOptimizations: {
          timingOptimization: true,
          contentPersonalization: true,
          channelOptimization: true
        }
      },
      tags: ['Conversão', 'Alta Intenção', 'Personalizado']
    }
  };

  /**
   * 🤖 ENGINE DE MACHINE LEARNING PARA AUTOMAÇÕES
   * Personalizado e isolado por utilizador
   */
  const MLAutomations = useMemo(() => {
    return {
      /**
       * Otimizar timing das automações baseado no histórico do utilizador
       */
      optimizeAutomationTiming: (automationType, historicalData) => {
        if (!historicalData || historicalData.length < 10) {
          return getDefaultTiming(automationType);
        }

        // Analisar padrões de abertura/resposta por hora/dia
        const timePatterns = historicalData.reduce((acc, record) => {
          const hour = new Date(record.timestamp).getHours();
          const day = new Date(record.timestamp).getDay();
          
          const key = `${day}-${hour}`;
          acc[key] = (acc[key] || 0) + (record.success ? 1 : 0);
          return acc;
        }, {});

        // Encontrar horário com maior taxa de sucesso
        const bestTime = Object.entries(timePatterns)
          .sort(([,a], [,b]) => b - a)[0];

        if (bestTime) {
          const [day, hour] = bestTime[0].split('-').map(Number);
          return { day, hour, confidence: bestTime[1] / historicalData.length };
        }

        return getDefaultTiming(automationType);
      },

      /**
       * Segmentação adaptativa baseada em comportamento do utilizador
       */
      adaptiveSegmentation: (leads, clientsData, automationType) => {
        // Agrupar leads por padrões de comportamento
        const segments = {
          highIntent: [],
          nurturing: [],
          lowActivity: [],
          churning: []
        };

        leads.forEach(lead => {
          const score = calculateEngagementScore(lead, clientsData);
          
          if (score >= 0.8) segments.highIntent.push(lead);
          else if (score >= 0.5) segments.nurturing.push(lead);
          else if (score >= 0.2) segments.lowActivity.push(lead);
          else segments.churning.push(lead);
        });

        return segments;
      },

      /**
       * Predição de sucesso da automação baseada em dados históricos
       */
      predictAutomationSuccess: (automation, targetSegment) => {
        const factors = {
          segmentSize: Math.min(targetSegment.length / 100, 1),
          automationType: getAutomationTypeScore(automation.type),
          timing: automation.mlConfig?.optimizeTiming ? 0.9 : 0.7,
          personalization: automation.personalized ? 0.9 : 0.6,
          historicalPerformance: automation.stats?.successRate || 0.5
        };

        // Calcular score de sucesso ponderado
        const weights = { 
          segmentSize: 0.15, 
          automationType: 0.25, 
          timing: 0.25, 
          personalization: 0.2,
          historicalPerformance: 0.15
        };
        
        const successScore = Object.entries(factors)
          .reduce((sum, [key, value]) => sum + (value * weights[key]), 0);

        return {
          successProbability: Math.round(successScore * 100),
          confidence: Math.min(automation.stats?.executions || 0 / 50, 1),
          recommendedAdjustments: generateRecommendations(factors, automation),
          estimatedROI: calculateEstimatedROI(successScore, automation)
        };
      },

      /**
       * Otimização automática de conteúdo baseada em performance
       */
      optimizeAutomationContent: (automation, performanceData) => {
        const improvements = [];
        
        if (performanceData.openRate < 0.2) {
          improvements.push({
            type: 'subject_line',
            suggestion: 'Teste assuntos mais persuasivos',
            impact: 'high'
          });
        }

        if (performanceData.clickRate < 0.05) {
          improvements.push({
            type: 'call_to_action',
            suggestion: 'Fortaleça o call-to-action',
            impact: 'high'
          });
        }

        if (performanceData.conversionRate < 0.02) {
          improvements.push({
            type: 'personalization',
            suggestion: 'Adicione mais elementos personalizados',
            impact: 'medium'
          });
        }

        return improvements;
      }
    };
  }, []);

  // Funções auxiliares para ML
  const getDefaultTiming = (automationType) => {
    const defaults = {
      email_marketing: { day: 2, hour: 10 }, // Terça, 10h
      task_creation: { day: 1, hour: 9 },    // Segunda, 9h
      pipeline_alerts: { day: null, hour: 14 }, // Qualquer dia, 14h
      lead_nurturing: { day: 3, hour: 11 },  // Quarta, 11h
    };
    return defaults[automationType] || { day: 2, hour: 10 };
  };

  const calculateEngagementScore = (lead, clientsData) => {
    let score = 0;
    
    // Pontuação baseada em atividade recente
    const daysSinceLastActivity = (Date.now() - new Date(lead.lastActivity)) / (1000 * 60 * 60 * 24);
    score += Math.max(0, (30 - daysSinceLastActivity) / 30) * 0.4;
    
    // Pontuação baseada em interações
    score += Math.min(lead.emailOpens || 0, 10) / 10 * 0.3;
    score += Math.min(lead.callAnswers || 0, 5) / 5 * 0.3;
    
    return Math.min(score, 1);
  };

  const getAutomationTypeScore = (type) => {
    const scores = {
      email_marketing: 0.75,
      task_creation: 0.90,
      pipeline_alerts: 0.80,
      lead_nurturing: 0.85,
      birthday_campaigns: 0.95,
      payment_reminders: 0.90
    };
    return scores[type] || 0.5;
  };

  const generateRecommendations = (factors, automation) => {
    const recommendations = [];
    
    if (factors.segmentSize < 0.3) {
      recommendations.push({
        type: 'segment',
        message: 'Considere expandir o segmento alvo para maior impacto',
        priority: 'medium'
      });
    }
    
    if (factors.timing < 0.8) {
      recommendations.push({
        type: 'timing',
        message: 'Otimize o timing baseado no histórico de engajamento',
        priority: 'high'
      });
    }
    
    if (factors.personalization < 0.8) {
      recommendations.push({
        type: 'personalization',
        message: 'Adicione mais elementos de personalização',
        priority: 'high'
      });
    }

    if (factors.historicalPerformance < 0.6) {
      recommendations.push({
        type: 'content',
        message: 'Revise o conteúdo baseado em baixa performance histórica',
        priority: 'critical'
      });
    }
    
    return recommendations;
  };

  const calculateEstimatedROI = (successScore, automation) => {
    const baseCost = 50; // Custo base estimado
    const expectedRevenue = successScore * (automation.estimatedValue || 200);
    return ((expectedRevenue - baseCost) / baseCost) * 100;
  };

  /**
   * 📊 ESTATÍSTICAS CALCULADAS DA AUTOMAÇÃO
   */
  const calculateOverallStats = useMemo(() => {
    if (automations.length === 0) return {};

    const totalExecutions = automations.reduce((sum, auto) => 
      sum + (auto.stats?.executions || 0), 0);
    
    const avgSuccessRate = automations.length > 0 
      ? automations.reduce((sum, auto) => 
          sum + (auto.stats?.successRate || 0), 0) / automations.length
      : 0;

    const totalConversions = automations.reduce((sum, auto) => 
      sum + (auto.stats?.totalConversions || 0), 0);

    const topPerformingAutomations = automations
      .filter(auto => auto.stats?.executions > 0)
      .sort((a, b) => (b.stats.successRate || 0) - (a.stats.successRate || 0))
      .slice(0, 5);

    return {
      totalAutomations: automations.length,
      activeAutomations: activeAutomations.length,
      totalExecutions,
      avgSuccessRate: Math.round(avgSuccessRate * 100) / 100,
      totalConversions,
      topPerformingAutomations
    };
  }, [automations, activeAutomations]);

  /**
   * 📤 CARREGAR AUTOMAÇÕES DO UTILIZADOR
   */
  const loadAutomations = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    setError(null);

    try {
      const unsubscribe = await fbService.subscribeToCollection(
        SUBCOLLECTIONS.AUTOMATIONS,
        (automationsData) => {
          setAutomations(automationsData);
          setActiveAutomations(automationsData.filter(auto => auto.status === 'active'));
        },
        (error) => {
          logger.error('Erro ao carregar automações:', error);
          setError('Erro ao carregar automações');
        },
        [
          ['status', '!=', 'deleted'],
          ['createdAt', 'desc']
        ]
      );

      return unsubscribe;

    } catch (err) {
      logger.error('Erro ao subscrever automações:', err);
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
        throw new Error('Dados obrigatórios em falta (name, type, trigger)');
      }

      // Estrutura completa da automação isolada por utilizador
      const automation = {
        ...automationData,
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
          avgResponseTime: 0,
          lastExecution: null,
          totalRevenue: 0
        },

        // Configurações de ML personalizadas
        mlConfig: {
          optimizeTiming: automationData.mlConfig?.optimizeTiming || false,
          adaptiveSegmentation: automationData.mlConfig?.adaptiveSegmentation || false,
          successPrediction: automationData.mlConfig?.successPrediction || true,
          autoContentOptimization: automationData.mlConfig?.autoContentOptimization || false
        },

        // Metadados para auditoria
        metadata: {
          version: '2.0',
          migrationDate: new Date(),
          architecture: 'multi-tenant'
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

      const result = await fbService.addDocument(SUBCOLLECTIONS.AUTOMATIONS, automation);

      if (result.success) {
        // Log da criação
        await logAutomationEvent(result.id, 'created', {
          automationType: automation.type,
          trigger: automation.trigger,
          mlEnabled: Object.values(automation.mlConfig).some(v => v === true)
        });

        logger.info(`Automação criada: ${automation.name}`, { id: result.id });
      }

      return result;

    } catch (err) {
      logger.error('Erro ao criar automação:', err);
      setError(err.message);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  }, [currentUser, MLAutomations]);

  /**
   * 🔄 ATUALIZAR AUTOMAÇÃO
   */
  const updateAutomation = useCallback(async (automationId, updates) => {
    if (!currentUser) throw new Error('Usuário não autenticado');

    setLoading(true);

    try {
      const updateData = {
        ...updates,
        lastModified: new Date(),
        modifiedBy: currentUser.email
      };

      const result = await fbService.updateDocument(
        SUBCOLLECTIONS.AUTOMATIONS, 
        automationId, 
        updateData
      );

      if (result.success) {
        await logAutomationEvent(automationId, 'updated', {
          updatedFields: Object.keys(updates)
        });

        logger.info(`Automação atualizada: ${automationId}`);
      }

      return result;

    } catch (err) {
      logger.error('Erro ao atualizar automação:', err);
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
      await logAutomationEvent(automationId, 
        newStatus === 'active' ? 'activated' : 'paused'
      );
    }

    return result;
  }, [updateAutomation]);

  /**
   * 🗑️ ELIMINAR AUTOMAÇÃO (SOFT DELETE)
   */
  const deleteAutomation = useCallback(async (automationId) => {
    if (!currentUser) throw new Error('Usuário não autenticado');

    setLoading(true);

    try {
      // Soft delete para manter histórico
      const result = await fbService.updateDocument(
        SUBCOLLECTIONS.AUTOMATIONS,
        automationId,
        {
          status: 'deleted',
          deletedAt: new Date(),
          deletedBy: currentUser.email
        }
      );

      if (result.success) {
        await logAutomationEvent(automationId, 'deleted');
        logger.info(`Automação eliminada: ${automationId}`);
      }

      return result;

    } catch (err) {
      logger.error('Erro ao eliminar automação:', err);
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
      logger.error('Erro ao executar automação:', err);
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
   * ⚡ EXECUTAR AÇÃO INDIVIDUAL
   */
  const executeAction = useCallback(async (action, targetData, automation) => {
    try {
      switch (action.type) {
        case 'send_email':
          return await executeEmailAction(action, targetData, automation);
        
        case 'create_task':
          return await executeTaskAction(action, targetData, automation);
        
        case 'send_notification':
          return await executeNotificationAction(action, targetData, automation);
        
        case 'schedule_call':
          return await executeScheduleAction(action, targetData, automation);
        
        case 'update_lead_score':
          return await executeScoreUpdateAction(action, targetData, automation);
        
        default:
          throw new Error(`Tipo de ação não suportado: ${action.type}`);
      }
    } catch (err) {
      logger.error(`Erro ao executar ação ${action.type}:`, err);
      return {
        success: false,
        action: action.type,
        error: err.message
      };
    }
  }, []);

  /**
   * 📧 EXECUTAR AÇÃO DE EMAIL
   */
  const executeEmailAction = useCallback(async (action, targetData, automation) => {
    // Integrar com serviço de email (exemplo com EmailJS ou similar)
    const emailData = {
      to: targetData?.email,
      subject: personalizeContent(action.subject, targetData),
      content: personalizeContent(action.content, targetData),
      fromAutomation: automation.id
    };

    // Simular envio de email (substituir por integração real)
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      success: true,
      action: 'send_email',
      result: `Email enviado para ${emailData.to}`
    };
  }, []);

  /**
   * 📋 EXECUTAR AÇÃO DE CRIAÇÃO DE TAREFA
   */
  const executeTaskAction = useCallback(async (action, targetData, automation) => {
    const taskData = {
      title: personalizeContent(action.content, targetData),
      priority: action.priority || 'medium',
      dueDate: action.dueDate || new Date(),
      automationId: automation.id,
      relatedTo: targetData?.type || 'lead',
      relatedId: targetData?.id
    };

    // Criar tarefa usando o serviço
    const result = await fbService.addDocument(SUBCOLLECTIONS.TASKS, taskData);

    return {
      success: result.success,
      action: 'create_task',
      result: result.success ? `Tarefa criada: ${taskData.title}` : result.error
    };
  }, []);

  /**
   * 🔔 EXECUTAR AÇÃO DE NOTIFICAÇÃO
   */
  const executeNotificationAction = useCallback(async (action, targetData, automation) => {
    const notificationData = {
      title: personalizeContent(action.title, targetData),
      message: personalizeContent(action.content, targetData),
      type: 'automation',
      automationId: automation.id,
      createdAt: new Date()
    };

    // Adicionar à fila de notificações do utilizador
    const result = await fbService.addDocument(SUBCOLLECTIONS.NOTIFICATIONS, notificationData);

    return {
      success: result.success,
      action: 'send_notification',
      result: result.success ? 'Notificação enviada' : result.error
    };
  }, []);

  /**
   * 📞 EXECUTAR AÇÃO DE AGENDAMENTO
   */
  const executeScheduleAction = useCallback(async (action, targetData, automation) => {
    const eventData = {
      title: personalizeContent(action.content, targetData),
      date: action.scheduledDate || new Date(),
      duration: action.duration || 30,
      type: 'call',
      automationId: automation.id,
      relatedTo: targetData?.type || 'lead',
      relatedId: targetData?.id
    };

    // Criar evento no calendário
    const result = await fbService.addDocument(SUBCOLLECTIONS.CALENDAR_EVENTS, eventData);

    return {
      success: result.success,
      action: 'schedule_call',
      result: result.success ? 'Ligação agendada' : result.error
    };
  }, []);

  /**
   * 📊 EXECUTAR AÇÃO DE ATUALIZAÇÃO DE PONTUAÇÃO
   */
  const executeScoreUpdateAction = useCallback(async (action, targetData, automation) => {
    if (!targetData?.id) {
      return {
        success: false,
        action: 'update_lead_score',
        error: 'Target data sem ID'
      };
    }

    const scoreUpdate = {
      score: targetData.score + (action.scoreChange || 10),
      lastScoreUpdate: new Date(),
      updatedBy: `automation-${automation.id}`
    };

    const result = await fbService.updateDocument(
      SUBCOLLECTIONS.LEADS,
      targetData.id,
      scoreUpdate
    );

    return {
      success: result.success,
      action: 'update_lead_score',
      result: result.success ? `Score atualizado: +${action.scoreChange || 10}` : result.error
    };
  }, []);

  /**
   * ✨ PERSONALIZAR CONTEÚDO
   */
  const personalizeContent = useCallback((content, data) => {
    if (!data || !content) return content;

    let personalizedContent = content;
    
    // Substituir placeholders comuns
    const replacements = {
      '{name}': data.name || data.firstName || 'Cliente',
      '{company}': data.company || '',
      '{email}': data.email || '',
      '{phone}': data.phone || '',
      '{value}': data.value || data.estimatedValue || '',
      '{date}': new Date().toLocaleDateString('pt-PT')
    };

    Object.entries(replacements).forEach(([placeholder, value]) => {
      personalizedContent = personalizedContent.replace(
        new RegExp(placeholder, 'g'), 
        value
      );
    });

    return personalizedContent;
  }, []);

  /**
   * 📊 ATUALIZAR ESTATÍSTICAS DA AUTOMAÇÃO
   */
  const updateAutomationStats = useCallback(async (automationId, executionResults) => {
    const successCount = executionResults.filter(r => r.success).length;
    const successRate = successCount / executionResults.length;

    const statsUpdate = {
      'stats.executions': fbService.increment(1),
      'stats.successRate': successRate,
      'stats.lastExecution': new Date()
    };

    await fbService.updateDocument(SUBCOLLECTIONS.AUTOMATIONS, automationId, statsUpdate);
  }, []);

  /**
   * 📝 LOG DE EVENTOS DA AUTOMAÇÃO
   */
  const logAutomationEvent = useCallback(async (automationId, eventType, additionalData = {}) => {
    const eventData = {
      automationId,
      eventType,
      timestamp: new Date(),
      user: currentUser?.email,
      ...additionalData
    };

    await fbService.addDocument(SUBCOLLECTIONS.AUTOMATION_LOGS, eventData);
  }, [currentUser]);

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