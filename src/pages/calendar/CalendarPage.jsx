// src/pages/calendar/CalendarPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ThemedContainer, 
  ThemedCard, 
  ThemedButton, 
  ThemedText, 
  ThemedHeading,
  ThemedInput,
  ThemedSelect,
  ThemedTextarea
} from '../../components/common/ThemedComponents';
import { useAuth } from '../../contexts/AuthContext';
import { useTasks } from '../../hooks/useTasks';
import { useVisits } from '../../hooks/useVisits';
import { 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  format, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  parseISO
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Constantes
const CALENDAR_VIEWS = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day'
};

const EVENT_TYPES = {
  TASK: 'task',
  VISIT: 'visit',
  MEETING: 'meeting',
  CALL: 'call',
  OTHER: 'other'
};

const EVENT_COLORS = {
  [EVENT_TYPES.TASK]: 'bg-blue-500',
  [EVENT_TYPES.VISIT]: 'bg-green-500',
  [EVENT_TYPES.MEETING]: 'bg-purple-500',
  [EVENT_TYPES.CALL]: 'bg-orange-500',
  [EVENT_TYPES.OTHER]: 'bg-gray-500'
};

const CalendarPage = () => {
  const { user } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();
  const { visits, loading: visitsLoading } = useVisits();

  // Estados do calendário
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(CALENDAR_VIEWS.MONTH);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Estados do formulário de evento
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    type: EVENT_TYPES.OTHER,
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    attendees: '',
    reminder: true,
    reminderTime: '15' // minutos antes
  });

  // Estados de feedback
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');

  // Limpar feedback após 3 segundos
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage('');
        setFeedbackType('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // Processar eventos do calendário
  const calendarEvents = useMemo(() => {
    const events = [];

    // Adicionar tarefas como eventos
    tasks.forEach(task => {
      if (task.dueDate) {
        events.push({
          id: `task-${task.id}`,
          title: task.title,
          description: task.description,
          type: EVENT_TYPES.TASK,
          date: task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate),
          startTime: '09:00',
          endTime: '10:00',
          source: 'task',
          sourceData: task,
          priority: task.priority,
          status: task.status
        });
      }
    });

    // Adicionar visitas como eventos
    visits.forEach(visit => {
      if (visit.scheduledDate) {
        events.push({
          id: `visit-${visit.id}`,
          title: `Visita - ${visit.propertyAddress || 'Propriedade'}`,
          description: `Cliente: ${visit.clientName || 'N/A'}`,
          type: EVENT_TYPES.VISIT,
          date: visit.scheduledDate instanceof Date ? visit.scheduledDate : new Date(visit.scheduledDate),
          startTime: visit.scheduledTime || '14:00',
          endTime: visit.estimatedDuration ? 
            addMinutesToTime(visit.scheduledTime || '14:00', visit.estimatedDuration) : 
            '15:00',
          source: 'visit',
          sourceData: visit,
          location: visit.propertyAddress,
          attendees: visit.clientName
        });
      }
    });

    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [tasks, visits]);

  // Função auxiliar para adicionar minutos ao horário
  const addMinutesToTime = (time, minutes) => {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  };

  // Obter eventos de uma data específica
  const getEventsForDate = (date) => {
    return calendarEvents.filter(event => 
      isSameDay(event.date, date)
    );
  };

  // Gerar dias do mês para a grade do calendário
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Segunda-feira
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let currentDay = startDate;

    while (currentDay <= endDate) {
      days.push(currentDay);
      currentDay = addDays(currentDay, 1);
    }

    return days;
  };

  // Navegar entre meses
  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  // Ir para hoje
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Selecionar data
  const handleDateClick = (date) => {
    setSelectedDate(date);
    const events = getEventsForDate(date);
    if (events.length === 1) {
      setSelectedEvent(events[0]);
      setShowEventModal(true);
    }
  };

  // Criar novo evento
  const handleCreateEvent = () => {
    setEventForm({
      ...eventForm,
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00'
    });
    setShowCreateModal(true);
  };

  // Submeter formulário de evento
  const handleEventSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validações
      if (!eventForm.title.trim()) {
        throw new Error('Título é obrigatório');
      }
      if (!eventForm.date) {
        throw new Error('Data é obrigatória');
      }
      if (!eventForm.startTime) {
        throw new Error('Hora de início é obrigatória');
      }

      // Aqui integraria com um hook para salvar eventos customizados
      // Por agora, apenas simula o sucesso
      setFeedbackMessage('Evento criado com sucesso!');
      setFeedbackType('success');
      setShowCreateModal(false);
      resetEventForm();

    } catch (err) {
      setFeedbackMessage(err.message || 'Erro ao criar evento');
      setFeedbackType('error');
    }
  };

  // Reset do formulário
  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      type: EVENT_TYPES.OTHER,
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      attendees: '',
      reminder: true,
      reminderTime: '15'
    });
  };

  // Renderizar header do calendário
  const renderCalendarHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <ThemedHeading className="text-2xl font-bold">
          {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
        </ThemedHeading>
        
        <div className="flex space-x-2">
          <ThemedButton
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            ‹ Anterior
          </ThemedButton>
          
          <ThemedButton
            variant="outline"
            size="sm"
            onClick={goToToday}
          >
            Hoje
          </ThemedButton>
          
          <ThemedButton
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            Próximo ›
          </ThemedButton>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <ThemedSelect
          value={currentView}
          onChange={(e) => setCurrentView(e.target.value)}
          className="w-32"
        >
          <option value={CALENDAR_VIEWS.MONTH}>Mês</option>
          <option value={CALENDAR_VIEWS.WEEK}>Semana</option>
          <option value={CALENDAR_VIEWS.DAY}>Dia</option>
        </ThemedSelect>

        <ThemedButton onClick={handleCreateEvent}>
          + Novo Evento
        </ThemedButton>
      </div>
    </div>
  );

  // Renderizar vista mensal
  const renderMonthView = () => {
    const days = generateCalendarDays();
    const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header dos dias da semana */}
        <div className="grid grid-cols-7 gap-0 bg-gray-50 border-b">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Grade de dias */}
        <div className="grid grid-cols-7 gap-0">
          {days.map((day, index) => {
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);
            const dayEvents = getEventsForDate(day);

            return (
              <div
                key={index}
                onClick={() => handleDateClick(day)}
                className={`
                  min-h-[120px] p-2 border-r border-b border-gray-200 cursor-pointer
                  hover:bg-gray-50 transition-colors
                  ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                  ${isSelected ? 'bg-blue-50 border-blue-200' : ''}
                  ${isCurrentDay ? 'bg-yellow-50' : ''}
                `}
              >
                {/* Número do dia */}
                <div className={`
                  text-sm font-medium mb-1
                  ${isCurrentDay ? 'text-blue-600 font-bold' : ''}
                  ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                `}>
                  {format(day, 'd')}
                </div>

                {/* Eventos do dia */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEvent(event);
                        setShowEventModal(true);
                      }}
                      className={`
                        text-xs p-1 rounded text-white truncate cursor-pointer
                        hover:opacity-80 transition-opacity
                        ${EVENT_COLORS[event.type]}
                      `}
                      title={event.title}
                    >
                      {event.startTime && `${event.startTime} `}
                      {event.title}
                    </div>
                  ))}
                  
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Renderizar legenda de eventos
  const renderEventLegend = () => (
    <ThemedCard className="p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Tipos de Evento</h3>
      <div className="flex flex-wrap gap-4">
        {Object.entries(EVENT_TYPES).map(([key, type]) => (
          <div key={type} className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded ${EVENT_COLORS[type]}`}></div>
            <span className="text-sm text-gray-700 capitalize">
              {type === 'task' ? 'Tarefas' : 
               type === 'visit' ? 'Visitas' :
               type === 'meeting' ? 'Reuniões' :
               type === 'call' ? 'Chamadas' : 'Outros'}
            </span>
          </div>
        ))}
      </div>
    </ThemedCard>
  );

  // Renderizar estatísticas do mês
  const renderMonthStats = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    const monthEvents = calendarEvents.filter(event => 
      event.date >= monthStart && event.date <= monthEnd
    );

    const stats = {
      total: monthEvents.length,
      tasks: monthEvents.filter(e => e.type === EVENT_TYPES.TASK).length,
      visits: monthEvents.filter(e => e.type === EVENT_TYPES.VISIT).length,
      completed: monthEvents.filter(e => 
        e.sourceData?.status === 'completa' || 
        e.sourceData?.status === 'completed'
      ).length
    };

    return (
      <ThemedCard className="p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Estatísticas de {format(currentDate, 'MMMM', { locale: ptBR })}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Eventos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.visits}</div>
            <div className="text-xs text-gray-600">Visitas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.tasks}</div>
            <div className="text-xs text-gray-600">Tarefas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.completed}</div>
            <div className="text-xs text-gray-600">Concluídos</div>
          </div>
        </div>
      </ThemedCard>
    );
  };

  // Modal de detalhes do evento
  const renderEventModal = () => {
    if (!selectedEvent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Detalhes do Evento
              </h3>
              <button
                onClick={() => setShowEventModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <p className="text-gray-900">{selectedEvent.title}</p>
              </div>

              {selectedEvent.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <p className="text-gray-900">{selectedEvent.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data
                  </label>
                  <p className="text-gray-900">
                    {format(selectedEvent.date, 'dd/MM/yyyy')}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário
                  </label>
                  <p className="text-gray-900">
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </p>
                </div>
              </div>

              {selectedEvent.location && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Local
                  </label>
                  <p className="text-gray-900">{selectedEvent.location}</p>
                </div>
              )}

              {selectedEvent.attendees && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Participantes
                  </label>
                  <p className="text-gray-900">{selectedEvent.attendees}</p>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <div className={`w-4 h-4 rounded ${EVENT_COLORS[selectedEvent.type]}`}></div>
                <span className="text-sm text-gray-700 capitalize">
                  {selectedEvent.type === 'task' ? 'Tarefa' : 
                   selectedEvent.type === 'visit' ? 'Visita' :
                   selectedEvent.type === 'meeting' ? 'Reunião' :
                   selectedEvent.type === 'call' ? 'Chamada' : 'Outro'}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <ThemedButton
                variant="outline"
                onClick={() => setShowEventModal(false)}
              >
                Fechar
              </ThemedButton>
              {selectedEvent.source === 'task' && (
                <ThemedButton
                  onClick={() => {
                    // Navegar para a tarefa
                    window.location.href = '/tasks';
                  }}
                >
                  Ver Tarefa
                </ThemedButton>
              )}
              {selectedEvent.source === 'visit' && (
                <ThemedButton
                  onClick={() => {
                    // Navegar para a visita
                    window.location.href = '/visits';
                  }}
                >
                  Ver Visita
                </ThemedButton>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Modal de criação de evento
  const renderCreateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Criar Novo Evento
            </h3>
            <button
              onClick={() => setShowCreateModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleEventSubmit} className="space-y-4">
            <ThemedInput
              label="Título *"
              value={eventForm.title}
              onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
              placeholder="Ex: Reunião com cliente"
              required
            />

            <ThemedTextarea
              label="Descrição"
              value={eventForm.description}
              onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
              placeholder="Detalhes do evento..."
              rows={3}
            />

            <ThemedSelect
              label="Tipo"
              value={eventForm.type}
              onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
            >
              <option value={EVENT_TYPES.MEETING}>Reunião</option>
              <option value={EVENT_TYPES.CALL}>Chamada</option>
              <option value={EVENT_TYPES.OTHER}>Outro</option>
            </ThemedSelect>

            <div className="grid grid-cols-2 gap-4">
              <ThemedInput
                label="Data *"
                type="date"
                value={eventForm.date}
                onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                required
              />
              <ThemedSelect
                label="Lembrete"
                value={eventForm.reminderTime}
                onChange={(e) => setEventForm({...eventForm, reminderTime: e.target.value})}
              >
                <option value="5">5 minutos antes</option>
                <option value="15">15 minutos antes</option>
                <option value="30">30 minutos antes</option>
                <option value="60">1 hora antes</option>
              </ThemedSelect>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ThemedInput
                label="Hora Início *"
                type="time"
                value={eventForm.startTime}
                onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})}
                required
              />
              <ThemedInput
                label="Hora Fim *"
                type="time"
                value={eventForm.endTime}
                onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})}
                required
              />
            </div>

            <ThemedInput
              label="Local"
              value={eventForm.location}
              onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
              placeholder="Ex: Escritório, Casa do cliente..."
            />

            <ThemedInput
              label="Participantes"
              value={eventForm.attendees}
              onChange={(e) => setEventForm({...eventForm, attendees: e.target.value})}
              placeholder="Ex: João Silva, Maria Santos..."
            />

            <div className="flex justify-end space-x-3 mt-6">
              <ThemedButton
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </ThemedButton>
              <ThemedButton type="submit">
                Criar Evento
              </ThemedButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (tasksLoading || visitsLoading) {
    return (
      <ThemedContainer>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <ThemedText>Carregando calendário...</ThemedText>
          </div>
        </div>
      </ThemedContainer>
    );
  }

  return (
    <ThemedContainer>
      <div className="space-y-6">
        {/* Feedback */}
        {feedbackMessage && (
          <div className={`
            p-4 rounded-lg border
            ${feedbackType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'}
          `}>
            {feedbackMessage}
          </div>
        )}

        {/* Header */}
        {renderCalendarHeader()}

        {/* Estatísticas */}
        {renderMonthStats()}

        {/* Legenda */}
        {renderEventLegenda()}

        {/* Vista do calendário */}
        {currentView === CALENDAR_VIEWS.MONTH && renderMonthView()}
        
        {currentView === CALENDAR_VIEWS.WEEK && (
          <div className="bg-white rounded-lg shadow p-6">
            <ThemedText className="text-center text-gray-600">
              Vista de semana em desenvolvimento...
            </ThemedText>
          </div>
        )}
        
        {currentView === CALENDAR_VIEWS.DAY && (
          <div className="bg-white rounded-lg shadow p-6">
            <ThemedText className="text-center text-gray-600">
              Vista de dia em desenvolvimento...
            </ThemedText>
          </div>
        )}

        {/* Modais */}
        {showEventModal && renderEventModal()}
        {showCreateModal && renderCreateModal()}
      </div>
    </ThemedContainer>
  );
};

export default CalendarPage;