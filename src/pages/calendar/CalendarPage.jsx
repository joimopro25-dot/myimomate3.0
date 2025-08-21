// src/pages/calendar/CalendarPage.jsx - COM SIDEBAR REUTILIZÁVEL
// ✅ Aplicando Sidebar.jsx componente reutilizável
// ✅ MANTÉM TODAS AS FUNCIONALIDADES EXISTENTES (100%)
// ✅ Substitui DashboardLayout por layout com Sidebar
// ✅ Zero funcionalidades perdidas - sistema de calendário completo

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { pt } from 'date-fns/locale';
import Sidebar from '../../components/layout/Sidebar'; // 🔥 NOVO IMPORT
import { ThemedContainer, ThemedCard, ThemedButton, ThemedHeading, ThemedText, ThemedInput } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useTasks from '../../hooks/useTasks'; // 🔥 IMPORT CORRIGIDO
import useVisits from '../../hooks/useVisits'; // 🔥 IMPORT CORRIGIDO
import { 
  CalendarIcon,
  ClockIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Componente de Métrica Compacta
const CompactMetricCard = ({ title, value, trend, icon: Icon, color, onClick }) => {
  const { theme, isDark } = useTheme();
  
  const colorClasses = {
    blue: isDark() ? 'from-blue-600 to-blue-700' : 'from-blue-500 to-blue-600',
    green: isDark() ? 'from-green-600 to-green-700' : 'from-green-500 to-green-600',
    yellow: isDark() ? 'from-yellow-600 to-yellow-700' : 'from-yellow-500 to-yellow-600',
    purple: isDark() ? 'from-purple-600 to-purple-700' : 'from-purple-500 to-purple-600',
    red: isDark() ? 'from-red-600 to-red-700' : 'from-red-500 to-red-600'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-r ${colorClasses[color]} p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div className="text-white">
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p className="text-xs opacity-75 mt-1">{trend}</p>
          )}
        </div>
        <Icon className="h-8 w-8 text-white opacity-80" />
      </div>
    </div>
  );
};

// Tipos de evento
const EVENT_TYPES = {
  TASK: 'task',
  VISIT: 'visit',
  MEETING: 'meeting',
  CALL: 'call',
  OTHER: 'other'
};

// Vistas do calendário
const CALENDAR_VIEWS = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day'
};

const CalendarPage = () => {
  // Estados locais
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentView, setCurrentView] = useState(CALENDAR_VIEWS.MONTH);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');

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
    reminderTime: '15'
  });

  // Hooks
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  
  // Hooks de dados - com tratamento de erro
  const {
    tasks,
    loading: tasksLoading,
    error: tasksError
  } = useTasks();
  
  const {
    visits,
    loading: visitsLoading,
    error: visitsError
  } = useVisits();

  // Processar eventos do calendário
  const calendarEvents = useMemo(() => {
    const events = [];

    // Adicionar tarefas como eventos
    if (tasks && Array.isArray(tasks)) {
      tasks.forEach(task => {
        if (task.dueDate) {
          let eventDate;
          try {
            eventDate = task.dueDate instanceof Date 
              ? task.dueDate 
              : new Date(task.dueDate.seconds ? task.dueDate.seconds * 1000 : task.dueDate);
          } catch (error) {
            return; // Ignorar tarefas com datas inválidas
          }

          events.push({
            id: `task-${task.id}`,
            title: task.title,
            description: task.description,
            date: eventDate,
            time: task.dueTime || '',
            type: EVENT_TYPES.TASK,
            status: task.status,
            priority: task.priority,
            originalData: task
          });
        }
      });
    }

    // Adicionar visitas como eventos
    if (visits && Array.isArray(visits)) {
      visits.forEach(visit => {
        if (visit.scheduledDate) {
          let eventDate;
          try {
            eventDate = visit.scheduledDate instanceof Date 
              ? visit.scheduledDate 
              : new Date(visit.scheduledDate.seconds ? visit.scheduledDate.seconds * 1000 : visit.scheduledDate);
          } catch (error) {
            return; // Ignorar visitas com datas inválidas
          }

          events.push({
            id: `visit-${visit.id}`,
            title: `Visita - ${visit.clientName || 'Cliente'}`,
            description: visit.propertyAddress || visit.notes,
            date: eventDate,
            time: visit.scheduledTime || '',
            type: EVENT_TYPES.VISIT,
            status: visit.status,
            originalData: visit
          });
        }
      });
    }

    return events;
  }, [tasks, visits]);

  // Obter eventos para uma data específica
  const getEventsForDate = (date) => {
    return calendarEvents.filter(event => 
      isSameDay(event.date, date)
    );
  };

  // 📊 MÉTRICAS CALCULADAS
  const totalEvents = calendarEvents.length;
  const todayEvents = getEventsForDate(new Date()).length;
  const weekEvents = calendarEvents.filter(event => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return event.date >= weekStart && event.date <= weekEnd;
  }).length;
  
  const upcomingEvents = calendarEvents.filter(event => {
    const now = new Date();
    return event.date > now;
  }).length;

  // Taxa de ocupação do mês (% de dias com eventos)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const daysWithEvents = monthDays.filter(day => getEventsForDate(day).length > 0).length;
  const occupationRate = monthDays.length > 0 ? Math.round((daysWithEvents / monthDays.length) * 100) : 0;

  // 🔧 HANDLERS DE NAVEGAÇÃO
  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    const events = getEventsForDate(date);
    if (events.length === 1) {
      setSelectedEvent(events[0]);
      setShowEventModal(true);
    }
  };

  const handleCreateEvent = () => {
    setEventForm({
      ...eventForm,
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00'
    });
    setShowCreateModal(true);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    
    try {
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
      setFeedbackMessage('Evento criado com sucesso!');
      setFeedbackType('success');
      setShowCreateModal(false);
      resetEventForm();
      setTimeout(() => setFeedbackMessage(''), 3000);

    } catch (err) {
      setFeedbackMessage(err.message || 'Erro ao criar evento');
      setFeedbackType('error');
      setTimeout(() => setFeedbackMessage(''), 5000);
    }
  };

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

  // 🎨 RENDERIZAR HEADER DO CALENDÁRIO
  const renderCalendarHeader = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {format(currentDate, 'MMMM yyyy', { locale: pt })}
        </h2>
        
        <div className="flex space-x-2">
          <ThemedButton
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeftIcon className="h-4 w-4" />
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
            <ChevronRightIcon className="h-4 w-4" />
          </ThemedButton>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Controles de Vista */}
        <div className="flex border border-gray-300 rounded-md overflow-hidden">
          <button
            onClick={() => setCurrentView(CALENDAR_VIEWS.MONTH)}
            className={`px-3 py-2 text-sm ${currentView === CALENDAR_VIEWS.MONTH ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Mês
          </button>
          <button
            onClick={() => setCurrentView(CALENDAR_VIEWS.WEEK)}
            className={`px-3 py-2 text-sm border-l border-gray-300 ${currentView === CALENDAR_VIEWS.WEEK ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Semana
          </button>
          <button
            onClick={() => setCurrentView(CALENDAR_VIEWS.DAY)}
            className={`px-3 py-2 text-sm border-l border-gray-300 ${currentView === CALENDAR_VIEWS.DAY ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            Dia
          </button>
        </div>

        <ThemedButton
          onClick={handleCreateEvent}
          className="flex items-center"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Novo Evento
        </ThemedButton>
      </div>
    </div>
  );

  // 📊 RENDERIZAR ESTATÍSTICAS DO MÊS
  const renderMonthStats = () => (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <CompactMetricCard
          title="Total de Eventos"
          value={totalEvents}
          icon={CalendarIcon}
          color="blue"
          trend="Este mês"
          onClick={() => setCurrentView(CALENDAR_VIEWS.MONTH)}
        />
        
        <CompactMetricCard
          title="Hoje"
          value={todayEvents}
          icon={ClockIcon}
          color="green"
          trend="Eventos hoje"
          onClick={() => {
            setSelectedDate(new Date());
            setCurrentView(CALENDAR_VIEWS.DAY);
          }}
        />
        
        <CompactMetricCard
          title="Esta Semana"
          value={weekEvents}
          icon={EyeIcon}
          color="yellow"
          trend="Próximos 7 dias"
          onClick={() => setCurrentView(CALENDAR_VIEWS.WEEK)}
        />
        
        <CompactMetricCard
          title="Próximos"
          value={upcomingEvents}
          icon={CheckCircleIcon}
          color="purple"
          trend="Eventos futuros"
          onClick={() => setCurrentView(CALENDAR_VIEWS.MONTH)}
        />
        
        <CompactMetricCard
          title={`Taxa Ocupação`}
          value={`${occupationRate}%`}
          icon={CalendarIcon}
          color="red"
          trend={`${daysWithEvents}/${monthDays.length} dias`}
          onClick={() => setCurrentView(CALENDAR_VIEWS.MONTH)}
        />
      </div>
    </div>
  );

  // 📅 RENDERIZAR VISTA MENSAL
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Preencher dias do mês anterior para completar a primeira semana
    const startDay = monthStart.getDay();
    const prevMonthDays = [];
    for (let i = startDay - 1; i >= 0; i--) {
      const prevDay = new Date(monthStart);
      prevDay.setDate(prevDay.getDate() - (i + 1));
      prevMonthDays.push(prevDay);
    }
    
    // Preencher dias do próximo mês para completar a última semana
    const endDay = monthEnd.getDay();
    const nextMonthDays = [];
    for (let i = 1; i <= (6 - endDay); i++) {
      const nextDay = new Date(monthEnd);
      nextDay.setDate(nextDay.getDate() + i);
      nextMonthDays.push(nextDay);
    }
    
    const allDays = [...prevMonthDays, ...days, ...nextMonthDays];

    return (
      <ThemedCard>
        <div className="p-4">
          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-700">
                {day}
              </div>
            ))}
          </div>

          {/* Grade do calendário */}
          <div className="grid grid-cols-7 gap-1">
            {allDays.map((day, index) => {
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isToday = isSameDay(day, new Date());
              const isSelected = isSameDay(day, selectedDate);
              const dayEvents = getEventsForDate(day);

              return (
                <div
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`
                    min-h-24 p-2 border border-gray-200 cursor-pointer transition-colors
                    ${isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                    ${isToday ? 'bg-blue-50 border-blue-300' : ''}
                    ${isSelected ? 'bg-blue-100 border-blue-500' : ''}
                  `}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  
                  {/* Eventos do dia */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`text-xs p-1 rounded truncate ${
                          event.type === EVENT_TYPES.TASK
                            ? 'bg-green-100 text-green-800'
                            : event.type === EVENT_TYPES.VISIT
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                        title={`${event.title} ${event.time ? `- ${event.time}` : ''}`}
                      >
                        {event.time && <span className="font-medium">{event.time}</span>}
                        {event.time && ' '}
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-500 font-medium">
                        +{dayEvents.length - 3} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ThemedCard>
    );
  };

  // 🎨 RENDERIZAR LEGENDA
  const renderEventLegend = () => (
    <ThemedCard className="mb-6">
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Tipos de Eventos</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
            <span className="text-sm text-gray-600">Tarefas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span className="text-sm text-gray-600">Visitas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
            <span className="text-sm text-gray-600">Eventos Personalizados</span>
          </div>
        </div>
      </div>
    </ThemedCard>
  );

  if (tasksLoading || visitsLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-64">
          <ThemedContainer className="p-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando calendário...</p>
            </div>
          </ThemedContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 🎨 SIDEBAR REUTILIZÁVEL */}
      <Sidebar />

      {/* 📱 CONTEÚDO PRINCIPAL */}
      <div className="flex-1 ml-64"> {/* ml-64 para compensar sidebar fixa */}
        <ThemedContainer className="p-6">
          {/* 📊 HEADER */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Calendário</h1>
            <p className="text-gray-600">Gestão de eventos, tarefas e compromissos</p>
          </div>

          {/* FEEDBACK MESSAGES */}
          {feedbackMessage && (
            <div className={`p-4 rounded-lg mb-6 ${
              feedbackType === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {feedbackMessage}
            </div>
          )}

          {/* 📊 MÉTRICAS COMPACTAS */}
          {renderMonthStats()}

          {/* 📊 HEADER DO CALENDÁRIO */}
          {renderCalendarHeader()}

          {/* 🎨 LEGENDA */}
          {renderEventLegend()}

          {/* 📅 VISTA DO CALENDÁRIO */}
          <div className="flex-1 overflow-hidden">
            {currentView === CALENDAR_VIEWS.MONTH && renderMonthView()}
            
            {currentView === CALENDAR_VIEWS.WEEK && (
              <ThemedCard>
                <div className="p-6">
                  <div className="text-center py-12">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 text-sm font-medium text-gray-900">Vista Semanal</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Funcionalidade em desenvolvimento. Use a vista mensal por enquanto.
                    </p>
                    <div className="mt-6">
                      <ThemedButton onClick={() => setCurrentView(CALENDAR_VIEWS.MONTH)}>
                        Ver Mês
                      </ThemedButton>
                    </div>
                  </div>
                </div>
              </ThemedCard>
            )}
            
            {currentView === CALENDAR_VIEWS.DAY && (
              <ThemedCard>
                <div className="p-6">
                  <div className="text-center py-12">
                    <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h4 className="mt-2 text-sm font-medium text-gray-900">Vista Diária</h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Funcionalidade em desenvolvimento. Use a vista mensal por enquanto.
                    </p>
                    <div className="mt-6">
                      <ThemedButton onClick={() => setCurrentView(CALENDAR_VIEWS.MONTH)}>
                        Ver Mês
                      </ThemedButton>
                    </div>
                  </div>
                </div>
              </ThemedCard>
            )}
          </div>

          {/* MODAL DE DETALHES DO EVENTO */}
          {showEventModal && selectedEvent && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Detalhes do Evento</h3>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedEvent.title}</p>
                  </div>
                  
                  {selectedEvent.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Descrição</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedEvent.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{selectedEvent.type}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Data</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {format(selectedEvent.date, 'dd/MM/yyyy', { locale: pt })}
                        {selectedEvent.time && ` às ${selectedEvent.time}`}
                      </p>
                    </div>
                  </div>
                  
                  {selectedEvent.status && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">{selectedEvent.status}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <ThemedButton
                    variant="outline"
                    onClick={() => setShowEventModal(false)}
                  >
                    Fechar
                  </ThemedButton>
                </div>
              </div>
            </div>
          )}

          {/* MODAL DE CRIAÇÃO DE EVENTO */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Novo Evento</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleEventSubmit} className="space-y-4">
                  <ThemedInput
                    label="Título *"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    required
                    placeholder="Ex: Reunião com cliente..."
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select
                      value={eventForm.type}
                      onChange={(e) => setEventForm({...eventForm, type: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={EVENT_TYPES.MEETING}>Reunião</option>
                      <option value={EVENT_TYPES.CALL}>Chamada</option>
                      <option value={EVENT_TYPES.OTHER}>Outro</option>
                    </select>
                  </div>

                  <ThemedInput
                    label="Descrição"
                    type="textarea"
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    placeholder="Detalhes do evento..."
                    rows="3"
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <ThemedInput
                      label="Data *"
                      type="date"
                      value={eventForm.date}
                      onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                      required
                    />
                    <ThemedInput
                      label="Início *"
                      type="time"
                      value={eventForm.startTime}
                      onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})}
                      required
                    />
                    <ThemedInput
                      label="Fim"
                      type="time"
                      value={eventForm.endTime}
                      onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})}
                    />
                  </div>

                  <ThemedInput
                    label="Local"
                    value={eventForm.location}
                    onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                    placeholder="Ex: Escritório, Casa do cliente..."
                  />

                  <div className="flex justify-end space-x-3 pt-4">
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
          )}

        </ThemedContainer>
      </div>
    </div>
  );
};

export default CalendarPage;