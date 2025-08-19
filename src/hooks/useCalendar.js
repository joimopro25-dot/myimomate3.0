// src/hooks/useCalendar.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

// Constantes
const COLLECTION_NAME = 'calendar_events';

const EVENT_TYPES = {
  MEETING: 'meeting',
  CALL: 'call',
  TASK: 'task',
  VISIT: 'visit',
  REMINDER: 'reminder',
  APPOINTMENT: 'appointment',
  OTHER: 'other'
};

const EVENT_STATUS = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled'
};

const REMINDER_TIMES = {
  FIVE_MINUTES: 5,
  FIFTEEN_MINUTES: 15,
  THIRTY_MINUTES: 30,
  ONE_HOUR: 60,
  TWO_HOURS: 120,
  ONE_DAY: 1440
};

const RECURRENCE_TYPES = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  YEARLY: 'yearly'
};

export const useCalendar = () => {
  const { user } = useAuth();
  
  // Estados principais
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de filtros e visualização
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateRange: {
      start: null,
      end: null
    },
    search: ''
  });
  
  // Estados de sincronização
  const [syncStatus, setSyncStatus] = useState({
    googleCalendar: false,
    lastSync: null,
    syncing: false
  });

  // Validações
  const validateEvent = (eventData) => {
    const errors = [];

    if (!eventData.title?.trim()) {
      errors.push('Título é obrigatório');
    }

    if (!eventData.startDate) {
      errors.push('Data de início é obrigatória');
    }

    if (!eventData.startTime) {
      errors.push('Hora de início é obrigatória');
    }

    if (!eventData.endTime) {
      errors.push('Hora de fim é obrigatória');
    }

    // Validar que hora de fim é depois da hora de início
    if (eventData.startTime && eventData.endTime) {
      const start = new Date(`1970-01-01 ${eventData.startTime}`);
      const end = new Date(`1970-01-01 ${eventData.endTime}`);
      
      if (end <= start) {
        errors.push('Hora de fim deve ser posterior à hora de início');
      }
    }

    // Validar data não é no passado (exceto para eventos já existentes)
    if (eventData.startDate && !eventData.id) {
      const eventDate = new Date(eventData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        errors.push('Não é possível criar eventos no passado');
      }
    }

    return errors;
  };

  // Carregar eventos do Firestore
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const eventsRef = collection(db, COLLECTION_NAME);
    const q = query(
      eventsRef,
      where('userId', '==', user.uid),
      orderBy('startDate', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        try {
          const eventsData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              startDate: data.startDate?.toDate ? data.startDate.toDate() : new Date(data.startDate),
              endDate: data.endDate?.toDate ? data.endDate.toDate() : new Date(data.endDate),
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
              updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
            };
          });

          setEvents(eventsData);
          setLoading(false);
        } catch (err) {
          console.error('Erro ao processar eventos:', err);
          setError('Erro ao carregar eventos');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Erro ao carregar eventos:', err);
        setError('Erro ao conectar com o banco de dados');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Criar novo evento
  const createEvent = useCallback(async (eventData) => {
    try {
      if (!user?.uid) {
        throw new Error('Utilizador não autenticado');
      }

      const errors = validateEvent(eventData);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const eventToCreate = {
        ...eventData,
        userId: user.uid,
        userEmail: user.email,
        status: eventData.status || EVENT_STATUS.SCHEDULED,
        type: eventData.type || EVENT_TYPES.OTHER,
        startDate: Timestamp.fromDate(new Date(eventData.startDate)),
        endDate: eventData.endDate ? Timestamp.fromDate(new Date(eventData.endDate)) : Timestamp.fromDate(new Date(eventData.startDate)),
        reminderTimes: eventData.reminderTimes || [REMINDER_TIMES.FIFTEEN_MINUTES],
        recurrence: eventData.recurrence || RECURRENCE_TYPES.NONE,
        attendees: eventData.attendees || [],
        location: eventData.location || '',
        description: eventData.description || '',
        color: eventData.color || '#3B82F6',
        isAllDay: eventData.isAllDay || false,
        googleEventId: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), eventToCreate);
      
      // Se tem recorrência, criar eventos recorrentes
      if (eventData.recurrence !== RECURRENCE_TYPES.NONE) {
        await createRecurringEvents(docRef.id, eventData);
      }

      return { success: true, id: docRef.id };
    } catch (err) {
      console.error('Erro ao criar evento:', err);
      throw new Error(err.message || 'Erro ao criar evento');
    }
  }, [user]);

  // Atualizar evento
  const updateEvent = useCallback(async (eventId, updates) => {
    try {
      if (!user?.uid) {
        throw new Error('Utilizador não autenticado');
      }

      if (!eventId) {
        throw new Error('ID do evento é obrigatório');
      }

      const eventToUpdate = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Converter datas se necessário
      if (updates.startDate) {
        eventToUpdate.startDate = Timestamp.fromDate(new Date(updates.startDate));
      }
      if (updates.endDate) {
        eventToUpdate.endDate = Timestamp.fromDate(new Date(updates.endDate));
      }

      const eventRef = doc(db, COLLECTION_NAME, eventId);
      await updateDoc(eventRef, eventToUpdate);

      return { success: true };
    } catch (err) {
      console.error('Erro ao atualizar evento:', err);
      throw new Error(err.message || 'Erro ao atualizar evento');
    }
  }, [user]);

  // Deletar evento
  const deleteEvent = useCallback(async (eventId) => {
    try {
      if (!user?.uid) {
        throw new Error('Utilizador não autenticado');
      }

      if (!eventId) {
        throw new Error('ID do evento é obrigatório');
      }

      if (!window.confirm('Tem certeza que deseja excluir este evento?')) {
        return { success: false, cancelled: true };
      }

      const eventRef = doc(db, COLLECTION_NAME, eventId);
      await deleteDoc(eventRef);

      return { success: true };
    } catch (err) {
      console.error('Erro ao deletar evento:', err);
      throw new Error(err.message || 'Erro ao deletar evento');
    }
  }, [user]);

  // Criar eventos recorrentes
  const createRecurringEvents = async (parentEventId, eventData, occurrences = 10) => {
    try {
      const events = [];
      const startDate = new Date(eventData.startDate);
      
      for (let i = 1; i <= occurrences; i++) {
        const nextDate = new Date(startDate);
        
        switch (eventData.recurrence) {
          case RECURRENCE_TYPES.DAILY:
            nextDate.setDate(startDate.getDate() + i);
            break;
          case RECURRENCE_TYPES.WEEKLY:
            nextDate.setDate(startDate.getDate() + (i * 7));
            break;
          case RECURRENCE_TYPES.MONTHLY:
            nextDate.setMonth(startDate.getMonth() + i);
            break;
          case RECURRENCE_TYPES.YEARLY:
            nextDate.setFullYear(startDate.getFullYear() + i);
            break;
          default:
            continue;
        }

        const recurringEvent = {
          ...eventData,
          userId: user.uid,
          userEmail: user.email,
          startDate: Timestamp.fromDate(nextDate),
          endDate: eventData.endDate ? Timestamp.fromDate(nextDate) : Timestamp.fromDate(nextDate),
          parentEventId,
          isRecurring: true,
          recurrenceIndex: i,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        events.push(recurringEvent);
      }

      // Criar todos os eventos recorrentes em lote
      const promises = events.map(event => 
        addDoc(collection(db, COLLECTION_NAME), event)
      );
      
      await Promise.all(promises);
      
      return { success: true, created: events.length };
    } catch (err) {
      console.error('Erro ao criar eventos recorrentes:', err);
      throw new Error('Erro ao criar eventos recorrentes');
    }
  };

  // Marcar evento como completo
  const markEventComplete = useCallback(async (eventId, notes = '') => {
    try {
      const updates = {
        status: EVENT_STATUS.COMPLETED,
        completedAt: serverTimestamp(),
        completionNotes: notes,
        updatedAt: serverTimestamp()
      };

      await updateEvent(eventId, updates);
      return { success: true };
    } catch (err) {
      console.error('Erro ao marcar evento como completo:', err);
      throw new Error('Erro ao marcar evento como completo');
    }
  }, [updateEvent]);

  // Reagendar evento
  const rescheduleEvent = useCallback(async (eventId, newDate, newStartTime, newEndTime) => {
    try {
      const updates = {
        startDate: newDate,
        startTime: newStartTime,
        endTime: newEndTime,
        status: EVENT_STATUS.RESCHEDULED,
        rescheduledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateEvent(eventId, updates);
      return { success: true };
    } catch (err) {
      console.error('Erro ao reagendar evento:', err);
      throw new Error('Erro ao reagendar evento');
    }
  }, [updateEvent]);

  // Filtrar eventos
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
        event.location?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [events, filters]);

  // Estatísticas dos eventos
  const statistics = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: events.length,
      today: events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate.toDateString() === today.toDateString();
      }).length,
      thisWeek: events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= thisWeek && eventDate < new Date(thisWeek.getTime() + (7 * 24 * 60 * 60 * 1000));
      }).length,
      thisMonth: events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= thisMonth;
      }).length,
      completed: events.filter(event => event.status === EVENT_STATUS.COMPLETED).length,
      pending: events.filter(event => 
        event.status === EVENT_STATUS.SCHEDULED || 
        event.status === EVENT_STATUS.CONFIRMED
      ).length,
      overdue: events.filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate < now && event.status !== EVENT_STATUS.COMPLETED;
      }).length,
      byType: Object.keys(EVENT_TYPES).reduce((acc, type) => {
        acc[type] = events.filter(event => event.type === EVENT_TYPES[type]).length;
        return acc;
      }, {}),
      byStatus: Object.keys(EVENT_STATUS).reduce((acc, status) => {
        acc[status] = events.filter(event => event.status === EVENT_STATUS[status]).length;
        return acc;
      }, {})
    };
  }, [events]);

  // Próximos eventos
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => {
        const eventDate = new Date(event.startDate);
        return eventDate >= now && event.status !== EVENT_STATUS.COMPLETED;
      })
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 5);
  }, [events]);

  // Sincronização com Google Calendar (placeholder)
  const syncWithGoogleCalendar = useCallback(async () => {
    try {
      setSyncStatus(prev => ({ ...prev, syncing: true }));
      
      // Implementar integração com Google Calendar API
      // Por agora, simula a sincronização
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSyncStatus(prev => ({
        ...prev,
        syncing: false,
        googleCalendar: true,
        lastSync: new Date()
      }));
      
      return { success: true };
    } catch (err) {
      console.error('Erro na sincronização:', err);
      setSyncStatus(prev => ({ ...prev, syncing: false }));
      throw new Error('Erro ao sincronizar com Google Calendar');
    }
  }, []);

  return {
    // Estados
    events: filteredEvents,
    allEvents: events,
    loading,
    error,
    filters,
    syncStatus,
    
    // Estatísticas
    statistics,
    upcomingEvents,
    
    // Ações CRUD
    createEvent,
    updateEvent,
    deleteEvent,
    markEventComplete,
    rescheduleEvent,
    
    // Filtros
    setFilters,
    
    // Utilitários
    validateEvent,
    
    // Sincronização
    syncWithGoogleCalendar,
    
    // Constantes
    EVENT_TYPES,
    EVENT_STATUS,
    REMINDER_TIMES,
    RECURRENCE_TYPES
  };
};