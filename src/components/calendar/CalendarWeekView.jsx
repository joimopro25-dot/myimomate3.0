// src/components/calendar/CalendarWeekView.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameDay, 
  isToday, 
  addWeeks, 
  subWeeks,
  parseISO,
  getHours,
  getMinutes
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ThemedCard, 
  ThemedButton, 
  ThemedText, 
  ThemedHeading 
} from '../common/ThemedComponents';

const CalendarWeekView = ({ 
  currentDate, 
  events = [], 
  onDateClick, 
  onEventClick, 
  onCreateEvent,
  onNavigate,
  EVENT_TYPES,
  EVENT_COLORS 
}) => {
  // Estados locais
  const [selectedTime, setSelectedTime] = useState(null);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  // Configurações da vista semanal
  const HOURS_START = 6; // 6:00
  const HOURS_END = 22; // 22:00
  const HOUR_HEIGHT = 60; // pixels por hora
  const MINUTES_INTERVAL = 15; // intervalos de 15 minutos

  // Calcular semana atual
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Segunda-feira
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  // Gerar dias da semana
  const weekDays = useMemo(() => {
    const days = [];
    let currentDay = weekStart;
    
    while (currentDay <= weekEnd) {
      days.push(currentDay);
      currentDay = addDays(currentDay, 1);
    }
    
    return days;
  }, [weekStart, weekEnd]);

  // Gerar horas do dia
  const dayHours = useMemo(() => {
    const hours = [];
    for (let hour = HOURS_START; hour <= HOURS_END; hour++) {
      hours.push(hour);
    }
    return hours;
  }, []);

  // Filtrar eventos da semana atual
  const weekEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
      return eventDate >= weekStart && eventDate <= weekEnd;
    });
  }, [events, weekStart, weekEnd]);

  // Agrupar eventos por dia
  const eventsByDay = useMemo(() => {
    const grouped = {};
    
    weekDays.forEach(day => {
      const dayKey = format(day, 'yyyy-MM-dd');
      grouped[dayKey] = weekEvents.filter(event => {
        const eventDate = event.date instanceof Date ? event.date : new Date(event.date);
        return isSameDay(eventDate, day);
      });
    });
    
    return grouped;
  }, [weekDays, weekEvents]);

  // Converter hora string para posição Y
  const timeToPosition = (timeString) => {
    if (!timeString) return 0;
    
    const [hours, minutes] = timeString.split(':').map(Number);
    const totalMinutes = (hours - HOURS_START) * 60 + minutes;
    return (totalMinutes / 60) * HOUR_HEIGHT;
  };

  // Converter posição Y para hora
  const positionToTime = (position) => {
    const totalMinutes = (position / HOUR_HEIGHT) * 60;
    const hours = Math.floor(totalMinutes / 60) + HOURS_START;
    const minutes = Math.round((totalMinutes % 60) / MINUTES_INTERVAL) * MINUTES_INTERVAL;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Calcular duração do evento em pixels
  const getEventHeight = (startTime, endTime) => {
    if (!startTime || !endTime) return HOUR_HEIGHT / 2; // 30 minutos default
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;
    
    return Math.max((durationMinutes / 60) * HOUR_HEIGHT, 30); // Mínimo 30px
  };

  // Navegar entre semanas
  const navigateWeek = (direction) => {
    const newDate = direction === 'prev' ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1);
    onNavigate && onNavigate(newDate);
  };

  // Ir para hoje
  const goToToday = () => {
    onNavigate && onNavigate(new Date());
  };

  // Manipular clique em hora específica
  const handleTimeSlotClick = (day, hour) => {
    const clickedDate = new Date(day);
    const timeString = `${hour.toString().padStart(2, '0')}:00`;
    
    setSelectedTime({ date: clickedDate, time: timeString });
    onCreateEvent && onCreateEvent(clickedDate, timeString);
  };

  // Manipular drag de evento
  const handleEventDragStart = (event, e) => {
    setDraggedEvent(event);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleEventDragEnd = () => {
    setDraggedEvent(null);
    setDragPosition({ x: 0, y: 0 });
  };

  // Renderizar header da semana
  const renderWeekHeader = () => (
    <div className="flex items-center justify-between mb-6 bg-white rounded-lg shadow p-4">
      <div className="flex items-center space-x-4">
        <ThemedHeading className="text-xl font-bold">
          {format(weekStart, 'dd MMM', { locale: ptBR })} - {format(weekEnd, 'dd MMM yyyy', { locale: ptBR })}
        </ThemedHeading>
        
        <div className="flex space-x-2">
          <ThemedButton
            variant="outline"
            size="sm"
            onClick={() => navigateWeek('prev')}
          >
            ‹ Semana Anterior
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
            onClick={() => navigateWeek('next')}
          >
            Próxima Semana ›
          </ThemedButton>
        </div>
      </div>

      <div className="text-sm text-gray-600">
        Arraste eventos para reagendar • Clique numa hora para criar evento
      </div>
    </div>
  );

  // Renderizar cabeçalho dos dias
  const renderDaysHeader = () => (
    <div className="grid grid-cols-8 gap-0 bg-white border-b border-gray-200">
      {/* Coluna das horas */}
      <div className="p-4 border-r border-gray-200">
        <div className="text-sm font-medium text-gray-500">Hora</div>
      </div>
      
      {/* Colunas dos dias */}
      {weekDays.map(day => {
        const isCurrentDay = isToday(day);
        const dayEvents = eventsByDay[format(day, 'yyyy-MM-dd')] || [];
        
        return (
          <div 
            key={day.toISOString()} 
            className={`p-4 text-center border-r border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
              isCurrentDay ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onClick={() => onDateClick && onDateClick(day)}
          >
            <div className={`text-sm font-medium ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'}`}>
              {format(day, 'EEE', { locale: ptBR })}
            </div>
            <div className={`text-lg font-bold mt-1 ${isCurrentDay ? 'text-blue-600' : 'text-gray-700'}`}>
              {format(day, 'd')}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Renderizar linha de hora
  const renderHourRow = (hour) => (
    <div key={hour} className="grid grid-cols-8 gap-0 border-b border-gray-100">
      {/* Coluna da hora */}
      <div className="p-2 border-r border-gray-200 text-right" style={{ height: HOUR_HEIGHT }}>
        <div className="text-sm text-gray-500 -mt-2">
          {hour.toString().padStart(2, '0')}:00
        </div>
      </div>
      
      {/* Colunas dos dias */}
      {weekDays.map(day => (
        <div 
          key={`${day.toISOString()}-${hour}`}
          className="relative border-r border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors"
          style={{ height: HOUR_HEIGHT }}
          onClick={() => handleTimeSlotClick(day, hour)}
        >
          {/* Linhas de intervalo (15 min) */}
          <div className="absolute top-1/4 left-0 right-0 border-t border-gray-100"></div>
          <div className="absolute top-1/2 left-0 right-0 border-t border-gray-100"></div>
          <div className="absolute top-3/4 left-0 right-0 border-t border-gray-100"></div>
          
          {/* Indicador de hora atual */}
          {isToday(day) && new Date().getHours() === hour && (
            <div 
              className="absolute left-0 right-0 border-t-2 border-red-500 z-10"
              style={{ top: `${(new Date().getMinutes() / 60) * HOUR_HEIGHT}px` }}
            >
              <div className="absolute -left-2 -top-1 w-4 h-2 bg-red-500 rounded-full"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Renderizar evento
  const renderEvent = (event, dayIndex) => {
    const eventHeight = getEventHeight(event.startTime, event.endTime);
    const eventTop = timeToPosition(event.startTime);
    const eventColor = EVENT_COLORS[event.type] || 'bg-gray-500';
    
    return (
      <div
        key={event.id}
        className={`absolute left-1 right-1 ${eventColor} text-white text-xs p-1 rounded shadow-sm cursor-pointer hover:shadow-md transition-shadow z-20`}
        style={{ 
          top: eventTop,
          height: eventHeight,
          minHeight: '30px'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onEventClick && onEventClick(event);
        }}
        draggable
        onDragStart={(e) => handleEventDragStart(event, e)}
        onDragEnd={handleEventDragEnd}
        title={`${event.title}\n${event.startTime} - ${event.endTime}`}
      >
        <div className="font-medium truncate">{event.title}</div>
        {eventHeight > 40 && (
          <div className="text-xs opacity-75 truncate">
            {event.startTime} - {event.endTime}
          </div>
        )}
        {eventHeight > 60 && event.location && (
          <div className="text-xs opacity-75 truncate">
            📍 {event.location}
          </div>
        )}
      </div>
    );
  };

  // Renderizar todos os eventos na grade
  const renderEventsOverlay = () => (
    <div className="absolute inset-0 pointer-events-none" style={{ marginLeft: '12.5%' }}>
      <div className="grid grid-cols-7 gap-0 h-full">
        {weekDays.map((day, dayIndex) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDay[dayKey] || [];
          
          return (
            <div key={dayKey} className="relative pointer-events-auto">
              {dayEvents.map(event => renderEvent(event, dayIndex))}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Renderizar estatísticas da semana
  const renderWeekStats = () => {
    const stats = {
      total: weekEvents.length,
      tasks: weekEvents.filter(e => e.type === EVENT_TYPES.TASK).length,
      visits: weekEvents.filter(e => e.type === EVENT_TYPES.VISIT).length,
      meetings: weekEvents.filter(e => e.type === EVENT_TYPES.MEETING).length
    };

    return (
      <ThemedCard className="p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Estatísticas da Semana
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-purple-600">{stats.tasks}</div>
            <div className="text-xs text-gray-600">Tarefas</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{stats.visits}</div>
            <div className="text-xs text-gray-600">Visitas</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-orange-600">{stats.meetings}</div>
            <div className="text-xs text-gray-600">Reuniões</div>
          </div>
        </div>
      </ThemedCard>
    );
  };

  // Renderizar mini calendário de navegação
  const renderMiniCalendar = () => (
    <ThemedCard className="p-4 mb-6">
      <h3 className="text-sm font-medium text-gray-900 mb-3">
        Navegação Rápida
      </h3>
      <div className="space-y-2">
        <ThemedButton
          variant="outline"
          size="sm"
          onClick={() => onNavigate && onNavigate(new Date())}
          className="w-full"
        >
          📅 Esta Semana
        </ThemedButton>
        <ThemedButton
          variant="outline"
          size="sm"
          onClick={() => navigateWeek('next')}
          className="w-full"
        >
          ⏭️ Próxima Semana
        </ThemedButton>
        <ThemedButton
          variant="outline"
          size="sm"
          onClick={() => onNavigate && onNavigate(addWeeks(new Date(), 4))}
          className="w-full"
        >
          📆 Daqui a 1 Mês
        </ThemedButton>
      </div>
    </ThemedCard>
  );

  return (
    <div className="space-y-6">
      {/* Header da semana */}
      {renderWeekHeader()}

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar esquerda */}
        <div className="col-span-3">
          {renderWeekStats()}
          {renderMiniCalendar()}
        </div>

        {/* Vista principal da semana */}
        <div className="col-span-9">
          <ThemedCard className="overflow-hidden">
            <div className="relative">
              {/* Header dos dias */}
              {renderDaysHeader()}
              
              {/* Grade de horas e eventos */}
              <div className="relative overflow-y-auto max-h-[600px]">
                <div className="relative">
                  {/* Linhas das horas */}
                  {dayHours.map(hour => renderHourRow(hour))}
                  
                  {/* Overlay dos eventos */}
                  {renderEventsOverlay()}
                </div>
              </div>
            </div>
          </ThemedCard>
        </div>
      </div>

      {/* Legenda de tipos de evento */}
      <ThemedCard className="p-4">
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

      {/* Dicas de uso */}
      <ThemedCard className="p-4 bg-blue-50 border-blue-200">
        <h3 className="text-sm font-medium text-blue-900 mb-2">💡 Dicas de Uso</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <div>• <strong>Clique numa hora</strong> para criar um novo evento</div>
          <div>• <strong>Arraste eventos</strong> para reagendar rapidamente</div>
          <div>• <strong>Clique num evento</strong> para ver detalhes</div>
          <div>• <strong>Linha vermelha</strong> indica a hora atual</div>
        </div>
      </ThemedCard>
    </div>
  );
};

export default CalendarWeekView;