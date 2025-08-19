// src/components/calendar/CalendarEvents.jsx
import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ThemedButton, 
  ThemedInput, 
  ThemedSelect, 
  ThemedTextarea,
  ThemedCard
} from '../common/ThemedComponents';
import { useCalendar } from '../../hooks/useCalendar';

const CalendarEvents = ({ 
  selectedDate, 
  onEventCreated, 
  onEventUpdated, 
  onEventDeleted,
  showCreateForm,
  setShowCreateForm,
  selectedEvent,
  setSelectedEvent,
  showEventModal,
  setShowEventModal
}) => {
  const {
    createEvent,
    updateEvent,
    deleteEvent,
    markEventComplete,
    rescheduleEvent,
    EVENT_TYPES,
    EVENT_STATUS,
    REMINDER_TIMES,
    RECURRENCE_TYPES,
    validateEvent
  } = useCalendar();

  // Estados do formulário
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    type: EVENT_TYPES.OTHER,
    startDate: '',
    endDate: '',
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    attendees: '',
    reminderTimes: [REMINDER_TIMES.FIFTEEN_MINUTES],
    recurrence: RECURRENCE_TYPES.NONE,
    color: '#3B82F6',
    isAllDay: false,
    status: EVENT_STATUS.SCHEDULED
  });

  // Estados de feedback e carregamento
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para edição
  const [isEditing, setIsEditing] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Resetar formulário quando a data selecionada muda
  useEffect(() => {
    if (selectedDate) {
      setEventForm(prev => ({
        ...prev,
        startDate: format(selectedDate, 'yyyy-MM-dd'),
        endDate: format(selectedDate, 'yyyy-MM-dd')
      }));
    }
  }, [selectedDate]);

  // Carregar dados do evento selecionado para edição
  useEffect(() => {
    if (selectedEvent && isEditing) {
      setEventForm({
        title: selectedEvent.title || '',
        description: selectedEvent.description || '',
        type: selectedEvent.type || EVENT_TYPES.OTHER,
        startDate: selectedEvent.startDate ? format(selectedEvent.startDate, 'yyyy-MM-dd') : '',
        endDate: selectedEvent.endDate ? format(selectedEvent.endDate, 'yyyy-MM-dd') : '',
        startTime: selectedEvent.startTime || '09:00',
        endTime: selectedEvent.endTime || '10:00',
        location: selectedEvent.location || '',
        attendees: selectedEvent.attendees || '',
        reminderTimes: selectedEvent.reminderTimes || [REMINDER_TIMES.FIFTEEN_MINUTES],
        recurrence: selectedEvent.recurrence || RECURRENCE_TYPES.NONE,
        color: selectedEvent.color || '#3B82F6',
        isAllDay: selectedEvent.isAllDay || false,
        status: selectedEvent.status || EVENT_STATUS.SCHEDULED
      });
    }
  }, [selectedEvent, isEditing]);

  // Limpar mensagens após 3 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Resetar formulário
  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      type: EVENT_TYPES.OTHER,
      startDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      endDate: selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '',
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      attendees: '',
      reminderTimes: [REMINDER_TIMES.FIFTEEN_MINUTES],
      recurrence: RECURRENCE_TYPES.NONE,
      color: '#3B82F6',
      isAllDay: false,
      status: EVENT_STATUS.SCHEDULED
    });
    setError('');
    setSuccess('');
  };

  // Manipulador de mudança no formulário
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Manipulador de mudança de lembretes múltiplos
  const handleReminderChange = (reminderTime, checked) => {
    setEventForm(prev => ({
      ...prev,
      reminderTimes: checked 
        ? [...prev.reminderTimes, reminderTime]
        : prev.reminderTimes.filter(time => time !== reminderTime)
    }));
  };

  // Submeter formulário (criar ou atualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validar dados
      const validationErrors = validateEvent(eventForm);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      let result;
      if (isEditing && selectedEvent) {
        // Atualizar evento existente
        result = await updateEvent(selectedEvent.id, eventForm);
        setSuccess('Evento atualizado com sucesso!');
        onEventUpdated && onEventUpdated(selectedEvent.id, eventForm);
      } else {
        // Criar novo evento
        result = await createEvent(eventForm);
        setSuccess('Evento criado com sucesso!');
        onEventCreated && onEventCreated(result);
      }

      if (result.success) {
        resetForm();
        setShowCreateForm(false);
        setIsEditing(false);
        setSelectedEvent(null);
      }

    } catch (err) {
      console.error('Erro ao salvar evento:', err);
      setError(err.message || 'Erro ao salvar evento');
    } finally {
      setLoading(false);
    }
  };

  // Marcar evento como completo
  const handleMarkComplete = async (eventId, notes = '') => {
    setLoading(true);
    try {
      const result = await markEventComplete(eventId, notes);
      if (result.success) {
        setSuccess('Evento marcado como completo!');
        onEventUpdated && onEventUpdated(eventId, { status: EVENT_STATUS.COMPLETED });
        setShowEventModal(false);
      }
    } catch (err) {
      setError(err.message || 'Erro ao marcar evento como completo');
    } finally {
      setLoading(false);
    }
  };

  // Reagendar evento
  const handleReschedule = async (eventId, newDate, newStartTime, newEndTime) => {
    setLoading(true);
    try {
      const result = await rescheduleEvent(eventId, newDate, newStartTime, newEndTime);
      if (result.success) {
        setSuccess('Evento reagendado com sucesso!');
        onEventUpdated && onEventUpdated(eventId, { 
          startDate: newDate, 
          startTime: newStartTime, 
          endTime: newEndTime,
          status: EVENT_STATUS.RESCHEDULED 
        });
        setShowRescheduleModal(false);
        setShowEventModal(false);
      }
    } catch (err) {
      setError(err.message || 'Erro ao reagendar evento');
    } finally {
      setLoading(false);
    }
  };

  // Deletar evento
  const handleDelete = async (eventId) => {
    setLoading(true);
    try {
      const result = await deleteEvent(eventId);
      if (result.success) {
        setSuccess('Evento excluído com sucesso!');
        onEventDeleted && onEventDeleted(eventId);
        setShowDeleteConfirm(false);
        setShowEventModal(false);
      }
    } catch (err) {
      setError(err.message || 'Erro ao excluir evento');
    } finally {
      setLoading(false);
    }
  };

  // Obter label do tipo de evento
  const getEventTypeLabel = (type) => {
    const labels = {
      [EVENT_TYPES.MEETING]: 'Reunião',
      [EVENT_TYPES.CALL]: 'Chamada',
      [EVENT_TYPES.TASK]: 'Tarefa',
      [EVENT_TYPES.VISIT]: 'Visita',
      [EVENT_TYPES.REMINDER]: 'Lembrete',
      [EVENT_TYPES.APPOINTMENT]: 'Compromisso',
      [EVENT_TYPES.OTHER]: 'Outro'
    };
    return labels[type] || type;
  };

  // Obter label do status do evento
  const getEventStatusLabel = (status) => {
    const labels = {
      [EVENT_STATUS.SCHEDULED]: 'Agendado',
      [EVENT_STATUS.CONFIRMED]: 'Confirmado',
      [EVENT_STATUS.IN_PROGRESS]: 'Em Progresso',
      [EVENT_STATUS.COMPLETED]: 'Completo',
      [EVENT_STATUS.CANCELLED]: 'Cancelado',
      [EVENT_STATUS.RESCHEDULED]: 'Reagendado'
    };
    return labels[status] || status;
  };

  // Renderizar formulário de criação/edição
  const renderEventForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {isEditing ? 'Editar Evento' : 'Criar Novo Evento'}
            </h3>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setIsEditing(false);
                resetForm();
              }}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
            >
              ✕
            </button>
          </div>

          {/* Mensagens de feedback */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <ThemedInput
              label="Título *"
              name="title"
              value={eventForm.title}
              onChange={handleInputChange}
              placeholder="Ex: Reunião com cliente"
              required
              disabled={loading}
            />

            <ThemedTextarea
              label="Descrição"
              name="description"
              value={eventForm.description}
              onChange={handleInputChange}
              placeholder="Detalhes do evento..."
              rows={3}
              disabled={loading}
            />

            <div className="grid grid-cols-2 gap-4">
              <ThemedSelect
                label="Tipo *"
                name="type"
                value={eventForm.type}
                onChange={handleInputChange}
                disabled={loading}
                required
              >
                <option value={EVENT_TYPES.MEETING}>Reunião</option>
                <option value={EVENT_TYPES.CALL}>Chamada</option>
                <option value={EVENT_TYPES.APPOINTMENT}>Compromisso</option>
                <option value={EVENT_TYPES.REMINDER}>Lembrete</option>
                <option value={EVENT_TYPES.OTHER}>Outro</option>
              </ThemedSelect>

              <ThemedSelect
                label="Status"
                name="status"
                value={eventForm.status}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value={EVENT_STATUS.SCHEDULED}>Agendado</option>
                <option value={EVENT_STATUS.CONFIRMED}>Confirmado</option>
                <option value={EVENT_STATUS.IN_PROGRESS}>Em Progresso</option>
                <option value={EVENT_STATUS.COMPLETED}>Completo</option>
                <option value={EVENT_STATUS.CANCELLED}>Cancelado</option>
              </ThemedSelect>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ThemedInput
                label="Data Início *"
                name="startDate"
                type="date"
                value={eventForm.startDate}
                onChange={handleInputChange}
                required
                disabled={loading}
              />
              <ThemedInput
                label="Data Fim"
                name="endDate"
                type="date"
                value={eventForm.endDate}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>

            <div className="flex items-center space-x-4 mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isAllDay"
                  checked={eventForm.isAllDay}
                  onChange={handleInputChange}
                  disabled={loading}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Evento o dia inteiro</span>
              </label>
            </div>

            {!eventForm.isAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <ThemedInput
                  label="Hora Início *"
                  name="startTime"
                  type="time"
                  value={eventForm.startTime}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
                <ThemedInput
                  label="Hora Fim *"
                  name="endTime"
                  type="time"
                  value={eventForm.endTime}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
            )}

            <ThemedInput
              label="Local"
              name="location"
              value={eventForm.location}
              onChange={handleInputChange}
              placeholder="Ex: Escritório, Casa do cliente..."
              disabled={loading}
            />

            <ThemedInput
              label="Participantes"
              name="attendees"
              value={eventForm.attendees}
              onChange={handleInputChange}
              placeholder="Ex: João Silva, Maria Santos..."
              disabled={loading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lembretes
              </label>
              <div className="space-y-2">
                {Object.entries(REMINDER_TIMES).map(([key, minutes]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={eventForm.reminderTimes.includes(minutes)}
                      onChange={(e) => handleReminderChange(minutes, e.target.checked)}
                      disabled={loading}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">
                      {minutes < 60 ? `${minutes} minutos antes` : 
                       minutes < 1440 ? `${minutes / 60} hora(s) antes` : 
                       `${minutes / 1440} dia(s) antes`}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <ThemedSelect
              label="Recorrência"
              name="recurrence"
              value={eventForm.recurrence}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value={RECURRENCE_TYPES.NONE}>Não repetir</option>
              <option value={RECURRENCE_TYPES.DAILY}>Diariamente</option>
              <option value={RECURRENCE_TYPES.WEEKLY}>Semanalmente</option>
              <option value={RECURRENCE_TYPES.MONTHLY}>Mensalmente</option>
              <option value={RECURRENCE_TYPES.YEARLY}>Anualmente</option>
            </ThemedSelect>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cor do Evento
              </label>
              <input
                type="color"
                name="color"
                value={eventForm.color}
                onChange={handleInputChange}
                disabled={loading}
                className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <ThemedButton
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false);
                  setIsEditing(false);
                  resetForm();
                }}
                disabled={loading}
              >
                Cancelar
              </ThemedButton>
              <ThemedButton 
                type="submit" 
                disabled={loading}
                className={loading ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar Evento')}
              </ThemedButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Renderizar modal de detalhes do evento
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
                    Tipo
                  </label>
                  <p className="text-gray-900">{getEventTypeLabel(selectedEvent.type)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <p className="text-gray-900">{getEventStatusLabel(selectedEvent.status)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data
                  </label>
                  <p className="text-gray-900">
                    {selectedEvent.startDate ? format(selectedEvent.startDate, 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário
                  </label>
                  <p className="text-gray-900">
                    {selectedEvent.isAllDay ? 'O dia inteiro' : 
                     `${selectedEvent.startTime || '00:00'} - ${selectedEvent.endTime || '00:00'}`}
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
                <div 
                  className="w-4 h-4 rounded border"
                  style={{ backgroundColor: selectedEvent.color || '#3B82F6' }}
                ></div>
                <span className="text-sm text-gray-700">
                  {getEventTypeLabel(selectedEvent.type)}
                </span>
              </div>
            </div>

            <div className="flex justify-between space-x-3 mt-6">
              <div className="flex space-x-2">
                {selectedEvent.status !== EVENT_STATUS.COMPLETED && (
                  <ThemedButton
                    size="sm"
                    onClick={() => handleMarkComplete(selectedEvent.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={loading}
                  >
                    ✓ Completar
                  </ThemedButton>
                )}
                
                <ThemedButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditing(true);
                    setShowCreateForm(true);
                    setShowEventModal(false);
                  }}
                  disabled={loading}
                >
                  Editar
                </ThemedButton>

                <ThemedButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRescheduleModal(true)}
                  disabled={loading}
                >
                  Reagendar
                </ThemedButton>
              </div>

              <div className="flex space-x-2">
                <ThemedButton
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-800"
                  disabled={loading}
                >
                  Excluir
                </ThemedButton>

                <ThemedButton
                  variant="outline"
                  onClick={() => setShowEventModal(false)}
                  disabled={loading}
                >
                  Fechar
                </ThemedButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar confirmação de exclusão
  const renderDeleteConfirm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Confirmar Exclusão
          </h3>
          <p className="text-gray-600 mb-6">
            Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end space-x-3">
            <ThemedButton
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={loading}
            >
              Cancelar
            </ThemedButton>
            <ThemedButton
              onClick={() => handleDelete(selectedEvent.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={loading}
            >
              {loading ? 'Excluindo...' : 'Excluir'}
            </ThemedButton>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Formulário de criação/edição */}
      {showCreateForm && renderEventForm()}

      {/* Modal de detalhes */}
      {showEventModal && renderEventModal()}

      {/* Confirmação de exclusão */}
      {showDeleteConfirm && renderDeleteConfirm()}
    </>
  );
};

export default CalendarEvents;