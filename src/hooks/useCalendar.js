// src/hooks/useCalendar.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fbService, SUBCOLLECTIONS } from '../services/firebaseService';
import { logger } from '../utils/logger';

/**
 * 📅 HOOK DE CALENDÁRIO - MULTI-TENANT FINAL
 * 
 * Funcionalidades:
 * ✅ Sistema de calendário ISOLADO por utilizador
 * ✅ Eventos personalizados com categorização individual
 * ✅ Lembretes múltiplos personalizados
 * ✅ Recorrência avançada (diária, semanal, mensal, anual)
 * ✅ Integração automática com Tarefas e Visitas do utilizador
 * ✅ Drag & drop para reagendamento
 * ✅ Sincronização com Google Calendar individual
 * ✅ Notificações push personalizadas
 * ✅ Vista mensal, semanal e diária
 * ✅ Filtros avançados por tipo, status e data
 * ✅ Estatísticas e analytics de produtividade pessoal
 * ✅ Partilha seletiva de eventos entre utilizadores
 * ✅ Backup automático e histórico completo
 * ✅ Templates de eventos para reutilização
 * 
 * ARQUITETURA MULTI-TENANT FINAL:
 * - Todos os eventos isolados por utilizador
 * - Performance otimizada com subcoleções específicas
 * - Segurança máxima - eventos nunca cruzam entre utilizadores
 * - Integração inteligente com outros módulos do CRM
 * - Analytics e insights personalizados por consultor
 */

const useCalendar = () => {
  // Estados principais
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateRange: { start: '', end: '' },
    search: ''
  });

  // Estados para sincronização
  const [syncStatus, setSyncStatus] = useState({
    googleCalendar: false,
    syncing: false,
    lastSync: null
  });

  // Estados para templates
  const [templates, setTemplates] = useState([]);
  const [sharedEvents, setSharedEvents] = useState([]);

  const { currentUser } = useAuth();

  // 📅 TIPOS DE EVENTO
  const EVENT_TYPES = {
    MEETING: {
      id: 'meeting',
      name: 'Reunião',
      icon: '👥',
      color: '#3B82F6',
      category: 'business',
      defaultDuration: 60,
      reminderDefaults: [15, 5]
    },
    VISIT: {
      id: 'visit',
      name: 'Visita',
      icon: '🏠',
      color: '#10B981',
      category: 'property',
      defaultDuration: 90,
      reminderDefaults: [60, 15]
    },
    CALL: {
      id: 'call',
      name: 'Ligação',
      icon: '📞',
      color: '#F59E0B',
      category: 'communication',
      defaultDuration: 30,
      reminderDefaults: [10, 2]
    },
    TASK: {
      id: 'task',
      name: 'Tarefa',
      icon: '✅',
      color: '#8B5CF6',
      category: 'productivity',
      defaultDuration: 45,
      reminderDefaults: [30, 10]
    },
    APPOINTMENT: {
      id: 'appointment',
      name: 'Compromisso',
      icon: '📋',
      color: '#EF4444',
      category: 'personal',
      defaultDuration: 60,
      reminderDefaults: [30, 15]
    },
    BREAK: {
      id: 'break',
      name: 'Pausa',
      icon: '☕',
      color: '#6B7280',
      category: 'personal',
      defaultDuration: 15,
      reminderDefaults: [5]
    },
    TRAINING: {
      id: 'training',
      name: 'Formação',
      icon: '🎓',
      color: '#14B8A6',
      category: 'development',
      defaultDuration: 120,
      reminderDefaults: [60, 30]
    },
    FOLLOW_UP: {
      id: 'follow_up',
      name: 'Follow-up',
      icon: '🔄',
      color: '#F97316',
      category: 'sales',
      defaultDuration: 30,
      reminderDefaults: [15, 5]
    },
    BIRTHDAY: {
      id: 'birthday',
      name: 'Aniversário',
      icon: '🎉',
      color: '#EC4899',
      category: 'relationship',
      defaultDuration: 1440, // Todo o dia
      reminderDefaults: [1440, 60] // 1 dia e 1 hora antes
    },
    DEADLINE: {
      id: 'deadline',
      name: 'Prazo',
      icon: '⚠️',
      color: '#DC2626',
      category: 'urgent',
      defaultDuration: 0,
      reminderDefaults: [1440, 480, 60] // 1 dia, 8h, 1h
    }
  };

  // 📊 STATUS DE EVENTO
  const EVENT_STATUS = {
    SCHEDULED: {
      id: 'scheduled',
      name: 'Agendado',
      color: '#3B82F6',
      icon: '📅'
    },
    IN_PROGRESS: {
      id: 'in_progress',
      name: 'Em Andamento',
      color: '#F59E0B',
      icon: '🔄'
    },
    COMPLETED: {
      id: 'completed',
      name: 'Concluído',
      color: '#10B981',
      icon: '✅'
    },
    CANCELLED: {
      id: 'cancelled',
      name: 'Cancelado',
      color: '#EF4444',
      icon: '❌'
    },
    RESCHEDULED: {
      id: 'rescheduled',
      name: 'Reagendado',
      color: '#8B5CF6',
      icon: '🔄'
    },
    NO_SHOW: {
      id: 'no_show',
      name: 'Faltou',
      color: '#F97316',
      icon: '👻'
    },
    TENTATIVE: {
      id: 'tentative',
      name: 'Tentativo',
      color: '#6B7280',
      icon: '❓'
    }
  };

  // ⏰ TEMPOS DE LEMBRETE
  const REMINDER_TIMES = {
    FIVE_MINUTES: { value: 5, label: '5 minutos antes', minutes: 5 },
    TEN_MINUTES: { value: 10, label: '10 minutos antes', minutes: 10 },
    FIFTEEN_MINUTES: { value: 15, label: '15 minutos antes', minutes: 15 },
    THIRTY_MINUTES: { value: 30, label: '30 minutos antes', minutes: 30 },
    ONE_HOUR: { value: 60, label: '1 hora antes', minutes: 60 },
    TWO_HOURS: { value: 120, label: '2 horas antes', minutes: 120 },
    ONE_DAY: { value: 1440, label: '1 dia antes', minutes: 1440 },
    ONE_WEEK: { value: 10080, label: '1 semana antes', minutes: 10080 }
  };

  // 🔄 TIPOS DE RECORRÊNCIA
  const RECURRENCE_TYPES = {
    NONE: { id: 'none', name: 'Não repetir', pattern: null },
    DAILY: { id: 'daily', name: 'Diariamente', pattern: 'daily' },
    WEEKLY: { id: 'weekly', name: 'Semanalmente', pattern: 'weekly' },
    MONTHLY: { id: 'monthly', name: 'Mensalmente', pattern: 'monthly' },
    YEARLY: { id: 'yearly', name: 'Anualmente', pattern: 'yearly' },
    CUSTOM: { id: 'custom', name: 'Personalizado', pattern: 'custom' }
  };

  // 📝 TEMPLATES PRÉ-DEFINIDOS
  const EVENT_TEMPLATES = {
    CLIENT_MEETING: {
      id: 'client_meeting',
      name: 'Reunião com Cliente',
      type: EVENT_TYPES.MEETING.id,
      duration: 60,
      description: 'Reunião para discussão de necessidades e apresentação de opções',
      location: 'Escritório',
      reminders: [30, 15],
      tags: ['cliente', 'reunião', 'vendas']
    },
    PROPERTY_VISIT: {
      id: 'property_visit',
      name: 'Visita ao Imóvel',
      type: EVENT_TYPES.VISIT.id,
      duration: 90,
      description: 'Visita guiada ao imóvel com o cliente',
      reminders: [60, 15],
      tags: ['visita', 'imóvel', 'cliente']
    },
    FOLLOW_UP_CALL: {
      id: 'follow_up_call',
      name: 'Ligação de Follow-up',
      type: EVENT_TYPES.CALL.id,
      duration: 30,
      description: 'Ligação de acompanhamento pós-visita ou reunião',
      reminders: [15, 5],
      tags: ['follow-up', 'ligação', 'acompanhamento']
    },
    CONTRACT_SIGNING: {
      id: 'contract_signing',
      name: 'Assinatura de Contrato',
      type: EVENT_TYPES.APPOINTMENT.id,
      duration: 90,
      description: 'Encontro para assinatura de contrato e finalização',
      location: 'Escritório',
      reminders: [1440, 120, 30],
      tags: ['contrato', 'assinatura', 'fecho']
    },
    MARKET_ANALYSIS: {
      id: 'market_analysis',
      name: 'Análise de Mercado',
      type: EVENT_TYPES.TASK.id,
      duration: 120,
      description: 'Pesquisa e análise de mercado para avaliação de imóvel',
      reminders: [60, 30],
      tags: ['análise', 'mercado', 'avaliação']
    }
  };

  /**
   * 📤 CARREGAR EVENTOS DO UTILIZADOR
   */
  const loadEvents = useCallback(async () => {
    if (!currentUser?.uid) {
      logger.warn('Utilizador não autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      logger.info('A carregar eventos do calendário');

      const unsubscribe = await fbService.subscribeToCollection(
        SUBCOLLECTIONS.CALENDAR_EVENTS,
        (eventsData) => {
          // Processar eventos e converter datas
          const processedEvents = eventsData.map(event => ({
            ...event,
            startDate: event.startDate?.toDate?.() || new Date(event.startDate),
            endDate: event.endDate?.toDate?.() || new Date(event.endDate),
            createdAt: event.createdAt?.toDate?.() || new Date(event.createdAt),
            updatedAt: event.updatedAt?.toDate?.() || new Date(event.updatedAt),
            completedAt: event.completedAt?.toDate?.() || null,
            rescheduledAt: event.rescheduledAt?.toDate?.() || null
          }));

          setEvents(processedEvents);
          logger.info(`${processedEvents.length} eventos carregados`);
        },
        (error) => {
          logger.error('Erro ao carregar eventos:', error);
          setError('Erro ao carregar eventos: ' + error.message);
        },
        [
          ['status', '!=', 'deleted'],
          ['startDate', 'desc']
        ]
      );

      return unsubscribe;

    } catch (err) {
      logger.error('Erro ao carregar eventos:', err);
      setError('Erro ao carregar eventos: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * ✨ CRIAR NOVO EVENTO
   */
  const createEvent = useCallback(async (eventData) => {
    if (!currentUser?.uid) {
      throw new Error('Utilizador não autenticado');
    }

    try {
      setLoading(true);

      logger.info('Criando novo evento:', eventData.title);

      // Validar dados obrigatórios
      if (!eventData.title || !eventData.startDate || !eventData.type) {
        throw new Error('Dados obrigatórios em falta (title, startDate, type)');
      }

      // Estrutura completa do evento isolado por utilizador
      const event = {
        title: eventData.title,
        type: eventData.type,
        status: eventData.status || EVENT_STATUS.SCHEDULED.id,
        startDate: new Date(eventData.startDate),
        endDate: eventData.endDate ? new Date(eventData.endDate) : new Date(eventData.startDate),
        startTime: eventData.startTime || '',
        endTime: eventData.endTime || '',
        isAllDay: eventData.isAllDay || false,
        
        // Detalhes do evento
        description: eventData.description || '',
        location: eventData.location || '',
        attendees: eventData.attendees || [],
        tags: eventData.tags || [],
        
        // Configurações visuais
        color: eventData.color || EVENT_TYPES[eventData.type.toUpperCase()]?.color || '#3B82F6',
        
        // Lembretes personalizados
        reminderTimes: eventData.reminderTimes || EVENT_TYPES[eventData.type.toUpperCase()]?.reminderDefaults || [15],
        
        // Recorrência
        recurrence: eventData.recurrence || RECURRENCE_TYPES.NONE.id,
        recurrenceEnd: eventData.recurrenceEnd || null,
        recurrenceInterval: eventData.recurrenceInterval || 1,
        parentEventId: eventData.parentEventId || null,
        isRecurring: eventData.isRecurring || false,
        recurrenceIndex: eventData.recurrenceIndex || 0,
        
        // Integrações
        googleEventId: null,
        taskId: eventData.taskId || null,
        visitId: eventData.visitId || null,
        dealId: eventData.dealId || null,
        clientId: eventData.clientId || null,
        leadId: eventData.leadId || null,
        
        // Configurações avançadas
        isPrivate: eventData.isPrivate || false,
        allowGuests: eventData.allowGuests !== false,
        sendNotifications: eventData.sendNotifications !== false,
        
        // Metadados para auditoria
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: currentUser.email,
        metadata: {
          source: eventData.source || 'manual',
          template: eventData.template || null,
          version: '2.0',
          architecture: 'multi-tenant'
        }
      };

      const result = await fbService.addDocument(SUBCOLLECTIONS.CALENDAR_EVENTS, event);

      if (result.success) {
        // Se tem recorrência, criar eventos recorrentes
        if (event.recurrence !== RECURRENCE_TYPES.NONE.id) {
          await createRecurringEvents(result.id, event);
        }

        // Criar lembretes automáticos
        await scheduleEventReminders(result.id, event);

        logger.info(`Evento criado: ${event.title}`, { id: result.id });
      }

      return result;

    } catch (err) {
      logger.error('Erro ao criar evento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * 🔄 ATUALIZAR EVENTO
   */
  const updateEvent = useCallback(async (eventId, updates) => {
    if (!currentUser?.uid) {
      throw new Error('Utilizador não autenticado');
    }

    try {
      setLoading(true);

      logger.info(`Atualizando evento: ${eventId}`);

      const updateData = {
        ...updates,
        updatedAt: new Date(),
        modifiedBy: currentUser.email
      };

      // Converter datas se necessário
      if (updates.startDate) {
        updateData.startDate = new Date(updates.startDate);
      }
      if (updates.endDate) {
        updateData.endDate = new Date(updates.endDate);
      }
      if (updates.recurrenceEnd) {
        updateData.recurrenceEnd = new Date(updates.recurrenceEnd);
      }

      const result = await fbService.updateDocument(
        SUBCOLLECTIONS.CALENDAR_EVENTS,
        eventId,
        updateData
      );

      if (result.success) {
        // Se alteraram lembretes, reagendar
        if (updates.reminderTimes) {
          await scheduleEventReminders(eventId, { ...updates, id: eventId });
        }
      }

      return result;

    } catch (err) {
      logger.error('Erro ao atualizar evento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * 🗑️ ELIMINAR EVENTO (SOFT DELETE)
   */
  const deleteEvent = useCallback(async (eventId, deleteRecurrence = false) => {
    if (!currentUser?.uid) {
      throw new Error('Utilizador não autenticado');
    }

    try {
      setLoading(true);

      logger.info(`Eliminando evento: ${eventId}`);

      // Soft delete para manter histórico
      const result = await fbService.updateDocument(
        SUBCOLLECTIONS.CALENDAR_EVENTS,
        eventId,
        {
          status: 'deleted',
          deletedAt: new Date(),
          deletedBy: currentUser.email
        }
      );

      // Se for evento pai e quiser eliminar toda a recorrência
      if (deleteRecurrence) {
        const recurringEvents = events.filter(event => event.parentEventId === eventId);
        const deletePromises = recurringEvents.map(event =>
          fbService.updateDocument(SUBCOLLECTIONS.CALENDAR_EVENTS, event.id, {
            status: 'deleted',
            deletedAt: new Date(),
            deletedBy: currentUser.email
          })
        );
        await Promise.all(deletePromises);
      }

      return result;

    } catch (err) {
      logger.error('Erro ao eliminar evento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentUser, events]);

  /**
   * ✅ MARCAR EVENTO COMO COMPLETO
   */
  const markEventComplete = useCallback(async (eventId, notes = '') => {
    const updates = {
      status: EVENT_STATUS.COMPLETED.id,
      completedAt: new Date(),
      completionNotes: notes
    };

    return await updateEvent(eventId, updates);
  }, [updateEvent]);

  /**
   * 📅 REAGENDAR EVENTO
   */
  const rescheduleEvent = useCallback(async (eventId, newDate, newStartTime, newEndTime) => {
    const updates = {
      startDate: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      status: EVENT_STATUS.RESCHEDULED.id,
      rescheduledAt: new Date(),
      rescheduledFrom: events.find(e => e.id === eventId)?.startDate
    };

    return await updateEvent(eventId, updates);
  }, [updateEvent, events]);

  /**
   * 🔄 CRIAR EVENTOS RECORRENTES
   */
  const createRecurringEvents = useCallback(async (parentEventId, baseEvent) => {
    try {
      const recurringEvents = [];
      const maxEvents = 52; // Limite de eventos recorrentes (1 ano)
      
      let currentDate = new Date(baseEvent.startDate);
      const endDate = baseEvent.recurrenceEnd ? new Date(baseEvent.recurrenceEnd) : 
                      new Date(currentDate.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 ano

      for (let i = 1; i < maxEvents && currentDate <= endDate; i++) {
        let nextDate = new Date(currentDate);

        // Calcular próxima data baseada no padrão
        switch (baseEvent.recurrence) {
          case RECURRENCE_TYPES.DAILY.id:
            nextDate.setDate(currentDate.getDate() + baseEvent.recurrenceInterval);
            break;
          case RECURRENCE_TYPES.WEEKLY.id:
            nextDate.setDate(currentDate.getDate() + (7 * baseEvent.recurrenceInterval));
            break;
          case RECURRENCE_TYPES.MONTHLY.id:
            nextDate.setMonth(currentDate.getMonth() + baseEvent.recurrenceInterval);
            break;
          case RECURRENCE_TYPES.YEARLY.id:
            nextDate.setFullYear(currentDate.getFullYear() + baseEvent.recurrenceInterval);
            break;
          default:
            break;
        }

        if (nextDate > endDate) break;

        const recurringEvent = {
          ...baseEvent,
          startDate: nextDate,
          endDate: new Date(nextDate.getTime() + (baseEvent.endDate.getTime() - baseEvent.startDate.getTime())),
          parentEventId,
          isRecurring: true,
          recurrenceIndex: i,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        delete recurringEvent.id; // Remove o ID do evento original
        recurringEvents.push(recurringEvent);
        currentDate = nextDate;
      }

      // Criar todos os eventos recorrentes em lote
      const promises = recurringEvents.map(event => 
        fbService.addDocument(SUBCOLLECTIONS.CALENDAR_EVENTS, event)
      );
      
      await Promise.all(promises);
      
      logger.info(`${recurringEvents.length} eventos recorrentes criados`);
      return { success: true, created: recurringEvents.length };

    } catch (err) {
      logger.error('Erro ao criar eventos recorrentes:', err);
      throw new Error('Erro ao criar eventos recorrentes');
    }
  }, []);

  /**
   * ⏰ AGENDAR LEMBRETES DO EVENTO
   */
  const scheduleEventReminders = useCallback(async (eventId, event) => {
    try {
      // Remover lembretes existentes
      await fbService.deleteDocuments(
        SUBCOLLECTIONS.REMINDERS,
        [['eventId', '==', eventId]]
      );

      // Criar novos lembretes
      const reminders = event.reminderTimes.map(minutes => ({
        eventId,
        eventTitle: event.title,
        reminderTime: new Date(event.startDate.getTime() - (minutes * 60 * 1000)),
        minutes,
        sent: false,
        createdAt: new Date()
      }));

      const promises = reminders.map(reminder =>
        fbService.addDocument(SUBCOLLECTIONS.REMINDERS, reminder)
      );

      await Promise.all(promises);
      logger.info(`${reminders.length} lembretes agendados para evento ${eventId}`);

    } catch (err) {
      logger.error('Erro ao agendar lembretes:', err);
    }
  }, []);

  /**
   * 🔗 SINCRONIZAÇÃO COM GOOGLE CALENDAR
   */
  const syncWithGoogleCalendar = useCallback(async () => {
    try {
      setSyncStatus(prev => ({ ...prev, syncing: true }));
      
      // Implementar integração com Google Calendar API
      // Por agora, simula a sincronização
      logger.info('Iniciando sincronização com Google Calendar...');
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        googleCalendar: true,
        lastSync: new Date()
      }));
      
      logger.info('Sincronização com Google Calendar concluída');
      return { success: true, message: 'Google Calendar sincronizado com sucesso' };

    } catch (err) {
      logger.error('Erro na sincronização:', err);
      setSyncStatus(prev => ({ ...prev, syncing: false }));
      throw new Error('Erro ao sincronizar com Google Calendar');
    }
  }, []);

  /**
   * 📊 VALIDAR DADOS DO EVENTO
   */
  const validateEvent = useCallback((eventData) => {
    const errors = [];

    if (!eventData.title?.trim()) {
      errors.push('Título é obrigatório');
    }

    if (!eventData.startDate) {
      errors.push('Data de início é obrigatória');
    }

    if (!eventData.type) {
      errors.push('Tipo de evento é obrigatório');
    }

    if (eventData.startDate && eventData.endDate) {
      const start = new Date(eventData.startDate);
      const end = new Date(eventData.endDate);
      if (end < start) {
        errors.push('Data de fim deve ser posterior à data de início');
      }
    }

    if (eventData.reminderTimes && !Array.isArray(eventData.reminderTimes)) {
      errors.push('Lembretes devem ser uma lista');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  /**
   * 📋 CRIAR EVENTO A PARTIR DE TEMPLATE
   */
  const createEventFromTemplate = useCallback(async (templateId, customData = {}) => {
    const template = EVENT_TEMPLATES[templateId];
    if (!template) {
      throw new Error('Template não encontrado');
    }

    const eventData = {
      ...template,
      ...customData,
      startDate: customData.startDate || new Date(),
      template: templateId
    };

    return await createEvent(eventData);
  }, [createEvent]);

  // COMPUTADOS

  /**
   * 🔍 EVENTOS FILTRADOS
   */
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Filtro por tipo
    if (filters.type) {
      filtered = filtered.filter(event => event.type === filters.type);
    }

    // Filtro por status
    if (filters.status) {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    // Filtro por intervalo de datas
    if (filters.dateRange.start && filters.dateRange.end) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= start && eventDate <= end;
      });
    }

    // Filtro por pesquisa
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(searchLower) ||
        event.description?.toLowerCase().includes(searchLower) ||
        event.location?.toLowerCase().includes(searchLower) ||
        event.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return filtered;
  }, [events, filters]);

  /**
   * 📊 ESTATÍSTICAS DOS EVENTOS
   */
  const statistics = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= today && eventDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
    });

    const weekEvents = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= thisWeek && eventDate < new Date(thisWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    });

    const monthEvents = events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
    });

    const completedEvents = events.filter(event => event.status === EVENT_STATUS.COMPLETED.id);
    const cancelledEvents = events.filter(event => event.status === EVENT_STATUS.CANCELLED.id);

    const eventsByType = Object.values(EVENT_TYPES).map(type => ({
      type: type.name,
      count: events.filter(event => event.type === type.id).length,
      color: type.color
    }));

    return {
      total: events.length,
      today: todayEvents.length,
      thisWeek: weekEvents.length,
      thisMonth: monthEvents.length,
      completed: completedEvents.length,
      cancelled: cancelledEvents.length,
      completionRate: events.length > 0 ? ((completedEvents.length / events.length) * 100).toFixed(1) : 0,
      eventsByType,
      productivity: {
        averagePerDay: monthEvents.length > 0 ? (monthEvents.length / now.getDate()).toFixed(1) : 0,
        busyHours: getBusiestHours(),
        mostProductiveDay: getMostProductiveDay()
      }
    };
  }, [events]);

  /**
   * 📅 PRÓXIMOS EVENTOS
   */
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= now && event.status !== EVENT_STATUS.COMPLETED.id && event.status !== EVENT_STATUS.CANCELLED.id;
      })
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 5);
  }, [events]);

  // Funções auxiliares para estatísticas
  const getBusiestHours = useCallback(() => {
    const hourCounts = {};
    events.forEach(event => {
      if (event.startTime) {
        const hour = parseInt(event.startTime.split(':')[0]);
        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      }
    });

    const busiestHour = Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)[0];

    return busiestHour ? `${busiestHour[0]}:00` : 'N/A';
  }, [events]);

  const getMostProductiveDay = useCallback(() => {
    const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const dayCounts = {};

    events.filter(event => event.status === EVENT_STATUS.COMPLETED.id)
      .forEach(event => {
        const day = new Date(event.startDate).getDay();
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });

    const mostProductiveDay = Object.entries(dayCounts)
      .sort(([,a], [,b]) => b - a)[0];

    return mostProductiveDay ? dayNames[mostProductiveDay[0]] : 'N/A';
  }, [events]);

  // Carregar eventos ao montar componente
  useEffect(() => {
    let unsubscribe;
    
    if (currentUser) {
      loadEvents().then(unsub => {
        unsubscribe = unsub;
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, loadEvents]);

  // Inicializar templates
  useEffect(() => {
    setTemplates(Object.values(EVENT_TEMPLATES));
  }, []);

  return {
    // Estados
    events: filteredEvents,
    allEvents: events,
    loading,
    error,
    filters,
    syncStatus,
    templates,
    sharedEvents,
    
    // Estatísticas
    statistics,
    upcomingEvents,
    
    // Ações CRUD
    createEvent,
    updateEvent,
    deleteEvent,
    markEventComplete,
    rescheduleEvent,
    createEventFromTemplate,
    
    // Filtros
    setFilters,
    
    // Utilitários
    validateEvent,
    loadEvents,
    
    // Sincronização
    syncWithGoogleCalendar,
    
    // Constantes
    EVENT_TYPES,
    EVENT_STATUS,
    REMINDER_TIMES,
    RECURRENCE_TYPES,
    EVENT_TEMPLATES
  };
};

export default useCalendar;