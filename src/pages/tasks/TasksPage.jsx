// src/pages/tasks/TasksPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useTasks from '../../hooks/useTasks';

// Interface principal do Sistema de Tarefas
// MyImoMate 3.0 - Gestão completa de produtividade
// Funcionalidades: CRUD, Calendário, Templates, Analytics

const TasksPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Hook personalizado de tarefas
  const {
    tasks,
    loading,
    error,
    creating,
    updating,
    deleting,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    createFromTemplate,
    getTaskStats,
    isOverdue,
    isDueToday,
    getDaysUntilDue,
    formatTaskDate,
    TASK_STATUS,
    TASK_PRIORITY,
    TASK_TYPES,
    TASK_ASSOCIATIONS,
    TASK_STATUS_COLORS,
    PRIORITY_COLORS,
    TASK_TEMPLATES,
    filters,
    setFilters
  } = useTasks();

  // Estados locais
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [viewMode, setViewMode] = useState('list'); // list, calendar, kanban

  // Estados do formulário de criação
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: TASK_TYPES?.FOLLOW_UP || 'follow_up',
    priority: TASK_PRIORITY?.MEDIA || 'media',
    status: TASK_STATUS?.PENDENTE || 'pendente',
    dueDate: '',
    reminderDate: '',
    estimatedDuration: 30,
    associatedTo: '',
    associatedId: '',
    associatedName: '',
    notes: '',
    autoReminder: true
  });

  // Obter estatísticas
  const stats = getTaskStats || {};

  // Efeito para limpar feedback
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage('');
        setFeedbackType('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // Manipuladores de formulário
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Criar tarefa
  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.title.trim()) {
        throw new Error('Título é obrigatório');
      }
      if (!formData.dueDate) {
        throw new Error('Data de vencimento é obrigatória');
      }

      const success = await createTask(formData);
      
      if (success) {
        setFeedbackMessage('Tarefa criada com sucesso!');
        setFeedbackType('success');
        setShowCreateForm(false);
        resetForm();
      }
    } catch (err) {
      setFeedbackMessage(err.message || 'Erro ao criar tarefa');
      setFeedbackType('error');
    }
  };

  // Atualizar status da tarefa
  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const success = await updateTask(taskId, { status: newStatus });
      if (success) {
        setFeedbackMessage('Status atualizado com sucesso!');
        setFeedbackType('success');
      }
    } catch (err) {
      setFeedbackMessage('Erro ao atualizar status');
      setFeedbackType('error');
    }
  };

  // Completar tarefa
  const handleCompleteTask = async (taskId, notes = '') => {
    try {
      const success = await completeTask(taskId, notes);
      if (success) {
        setFeedbackMessage('Tarefa marcada como completa!');
        setFeedbackType('success');
      }
    } catch (err) {
      setFeedbackMessage('Erro ao completar tarefa');
      setFeedbackType('error');
    }
  };

  // Excluir tarefa
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    try {
      const success = await deleteTask(taskId);
      if (success) {
        setFeedbackMessage('Tarefa excluída com sucesso!');
        setFeedbackType('success');
      }
    } catch (err) {
      setFeedbackMessage('Erro ao excluir tarefa');
      setFeedbackType('error');
    }
  };

  // Criar tarefa a partir de template
  const handleCreateFromTemplate = async (templateKey) => {
    try {
      const template = TASK_TEMPLATES[templateKey];
      const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      
      const success = await createFromTemplate(template, { dueDate });
      
      if (success) {
        setFeedbackMessage('Tarefa criada a partir do template!');
        setFeedbackType('success');
        setShowTemplatesModal(false);
      }
    } catch (err) {
      setFeedbackMessage('Erro ao criar tarefa do template');
      setFeedbackType('error');
    }
  };

  // Funções auxiliares
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: TASK_TYPES?.FOLLOW_UP || 'follow_up',
      priority: TASK_PRIORITY?.MEDIA || 'media',
      status: TASK_STATUS?.PENDENTE || 'pendente',
      dueDate: '',
      reminderDate: '',
      estimatedDuration: 30,
      associatedTo: '',
      associatedId: '',
      associatedName: '',
      notes: '',
      autoReminder: true
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      [TASK_STATUS.PENDENTE]: 'Pendente',
      [TASK_STATUS.EM_PROGRESSO]: 'Em Progresso',
      [TASK_STATUS.AGUARDANDO]: 'Aguardando',
      [TASK_STATUS.COMPLETA]: 'Completa',
      [TASK_STATUS.CANCELADA]: 'Cancelada',
      [TASK_STATUS.ADIADA]: 'Adiada'
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      [TASK_PRIORITY.BAIXA]: 'Baixa',
      [TASK_PRIORITY.MEDIA]: 'Média',
      [TASK_PRIORITY.ALTA]: 'Alta',
      [TASK_PRIORITY.URGENTE]: 'Urgente',
      [TASK_PRIORITY.CRITICA]: 'Crítica'
    };
    return labels[priority] || priority;
  };

  const getTypeLabel = (type) => {
    const labels = {
      [TASK_TYPES.FOLLOW_UP]: 'Follow-up',
      [TASK_TYPES.LIGACAO]: 'Ligação',
      [TASK_TYPES.EMAIL]: 'Email',
      [TASK_TYPES.REUNIAO]: 'Reunião',
      [TASK_TYPES.VISITA]: 'Visita',
      [TASK_TYPES.DOCUMENTOS]: 'Documentos',
      [TASK_TYPES.PESQUISA]: 'Pesquisa',
      [TASK_TYPES.PROPOSTA]: 'Proposta',
      [TASK_TYPES.CONTRATO]: 'Contrato',
      [TASK_TYPES.ADMINISTRATIVO]: 'Administrativo',
      [TASK_TYPES.OUTRO]: 'Outro'
    };
    return labels[type] || type;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      [TASK_PRIORITY.BAIXA]: '🟢',
      [TASK_PRIORITY.MEDIA]: '🔵',
      [TASK_PRIORITY.ALTA]: '🟡',
      [TASK_PRIORITY.URGENTE]: '🔴',
      [TASK_PRIORITY.CRITICA]: '🟣'
    };
    return icons[priority] || '⚪';
  };

  // Renderizar estatísticas
  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <ThemedCard className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Total de Tarefas</h3>
        <p className="text-2xl font-bold text-blue-600">{stats.total || 0}</p>
      </ThemedCard>
      
      <ThemedCard className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Para Hoje</h3>
        <p className="text-2xl font-bold text-orange-600">{stats.dueToday || 0}</p>
      </ThemedCard>
      
      <ThemedCard className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Em Atraso</h3>
        <p className="text-2xl font-bold text-red-600">{stats.overdue || 0}</p>
      </ThemedCard>
      
      <ThemedCard className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Taxa de Conclusão</h3>
        <p className="text-2xl font-bold text-green-600">{(stats.completionRate || 0).toFixed(1)}%</p>
      </ThemedCard>
    </div>
  );

  // Renderizar lista de tarefas
  const renderTaskList = () => (
    <div className="space-y-4">
      {tasks.map(task => {
        const statusColors = TASK_STATUS_COLORS[task.status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
        const priorityColors = PRIORITY_COLORS[task.priority] || { bg: 'bg-gray-100', text: 'text-gray-800' };
        const overdue = isOverdue(task);
        const dueToday = isDueToday(task);
        const daysUntil = getDaysUntilDue(task);

        return (
          <ThemedCard 
            key={task.id} 
            className={`p-4 ${overdue ? 'border-red-300 bg-red-50' : dueToday ? 'border-orange-300 bg-orange-50' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg">{getPriorityIcon(task.priority)}</span>
                  <h3 className={`font-semibold ${overdue ? 'text-red-800' : dueToday ? 'text-orange-800' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}>
                    {getStatusLabel(task.status)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${priorityColors.bg} ${priorityColors.text}`}>
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>

                {task.description && (
                  <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                )}

                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>📅 {formatTaskDate(task.dueDate)}</span>
                  <span>🏷️ {getTypeLabel(task.type)}</span>
                  {task.estimatedDuration && (
                    <span>⏱️ {task.estimatedDuration}min</span>
                  )}
                  {task.associatedName && (
                    <span>🔗 {task.associatedName}</span>
                  )}
                </div>

                {(overdue || dueToday || (daysUntil !== null && daysUntil <= 3)) && (
                  <div className="mt-2">
                    {overdue && (
                      <span className="text-xs text-red-600 font-medium">
                        ⚠️ Em atraso há {Math.abs(daysUntil)} dia{Math.abs(daysUntil) !== 1 ? 's' : ''}
                      </span>
                    )}
                    {dueToday && !overdue && (
                      <span className="text-xs text-orange-600 font-medium">
                        🔔 Vence hoje
                      </span>
                    )}
                    {!overdue && !dueToday && daysUntil > 0 && daysUntil <= 3 && (
                      <span className="text-xs text-blue-600 font-medium">
                        📅 Vence em {daysUntil} dia{daysUntil !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex space-x-2 ml-4">
                {task.status !== TASK_STATUS.COMPLETA && (
                  <ThemedButton
                    size="sm"
                    onClick={() => handleCompleteTask(task.id)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    ✓ Completar
                  </ThemedButton>
                )}
                
                <ThemedButton
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedTask(task);
                    setShowTaskModal(true);
                  }}
                >
                  Ver
                </ThemedButton>

                <ThemedButton
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Excluir
                </ThemedButton>
              </div>
            </div>
          </ThemedCard>
        );
      })}
    </div>
  );

  // Renderizar calendário simples
  const renderCalendar = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Agrupar tarefas por data
    const tasksByDate = {};
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = task.dueDate.toDateString();
        if (!tasksByDate[dateKey]) {
          tasksByDate[dateKey] = [];
        }
        tasksByDate[dateKey].push(task);
      }
    });

    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-900">
            {new Intl.DateTimeFormat('pt-PT', { month: 'long', year: 'numeric' }).format(today)}
          </h3>
        </div>
        <div className="p-4">
          <div className="text-center text-gray-600">
            Vista de calendário em desenvolvimento...
            <br />
            <span className="text-sm">
              Por agora, use a vista de lista para gerir as suas tarefas
            </span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <ThemedContainer className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando tarefas...</p>
        </ThemedContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ThemedContainer className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Tarefas</h1>
            <p className="text-gray-600 mt-1">Gestão de produtividade e follow-ups</p>
          </div>
          
          <div className="flex space-x-3">
            <ThemedButton
              variant="outline"
              onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            >
              {viewMode === 'list' ? '📅 Calendário' : '📋 Lista'}
            </ThemedButton>

            <ThemedButton
              variant="outline"
              onClick={() => setShowTemplatesModal(true)}
            >
              📄 Templates
            </ThemedButton>
            
            <ThemedButton
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              + Nova Tarefa
            </ThemedButton>
          </div>
        </div>

        {/* Feedback */}
        {feedbackMessage && (
          <div className={`p-4 rounded-lg ${
            feedbackType === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {feedbackMessage}
          </div>
        )}

        {/* Filtros */}
        <ThemedCard className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={filters?.status || 'all'}
              onChange={(e) => setFilters && setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os Status</option>
              {TASK_STATUS && Object.values(TASK_STATUS).map(status => (
                <option key={status} value={status}>{getStatusLabel(status)}</option>
              ))}
            </select>

            <select
              value={filters?.priority || 'all'}
              onChange={(e) => setFilters && setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas as Prioridades</option>
              {TASK_PRIORITY && Object.values(TASK_PRIORITY).map(priority => (
                <option key={priority} value={priority}>{getPriorityLabel(priority)}</option>
              ))}
            </select>

            <select
              value={filters?.type || 'all'}
              onChange={(e) => setFilters && setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os Tipos</option>
              {TASK_TYPES && Object.values(TASK_TYPES).map(type => (
                <option key={type} value={type}>{getTypeLabel(type)}</option>
              ))}
            </select>

            <select
              value={filters?.dateRange || 'all'}
              onChange={(e) => setFilters && setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas as Datas</option>
              <option value="overdue">Em Atraso</option>
              <option value="today">Hoje</option>
              <option value="tomorrow">Amanhã</option>
              <option value="week">Esta Semana</option>
            </select>

            <input
              type="text"
              placeholder="Pesquisar tarefas..."
              value={filters?.searchTerm || ''}
              onChange={(e) => setFilters && setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </ThemedCard>

        {/* Estatísticas */}
        {renderStats()}

        {/* Erro */}
        {error && (
          <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Conteúdo Principal */}
        {tasks && tasks.length === 0 ? (
          <ThemedCard className="p-8 text-center">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma tarefa encontrada</h3>
            <p className="text-gray-600 mb-4">Comece criando a sua primeira tarefa</p>
            <ThemedButton onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              + Criar Primeira Tarefa
            </ThemedButton>
          </ThemedCard>
        ) : (
          viewMode === 'list' ? renderTaskList() : renderCalendar()
        )}

        {/* Modal de Criação */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Criar Nova Tarefa</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título da Tarefa *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {TASK_TYPES && Object.values(TASK_TYPES).map(type => (
                          <option key={type} value={type}>{getTypeLabel(type)}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridade
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {TASK_PRIORITY && Object.values(TASK_PRIORITY).map(priority => (
                          <option key={priority} value={priority}>{getPriorityLabel(priority)}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Vencimento *
                      </label>
                      <input
                        type="datetime-local"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duração Estimada (min)
                      </label>
                      <input
                        type="number"
                        name="estimatedDuration"
                        value={formData.estimatedDuration}
                        onChange={handleInputChange}
                        min="5"
                        step="5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="autoReminder"
                      checked={formData.autoReminder}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label className="text-sm text-gray-700">
                      Criar lembrete automático
                    </label>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <ThemedButton
                      type="button"
                      variant="outline"
                      onClick={() => setShowCreateForm(false)}
                    >
                      Cancelar
                    </ThemedButton>
                    <ThemedButton
                      type="submit"
                      disabled={creating}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {creating ? 'Criando...' : 'Criar Tarefa'}
                    </ThemedButton>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Templates */}
        {showTemplatesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Templates de Tarefas</h2>
                  <button
                    onClick={() => setShowTemplatesModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  {Object.entries(TASK_TEMPLATES).map(([key, template]) => (
                    <div key={key} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                         onClick={() => handleCreateFromTemplate(key)}>
                      <h3 className="font-medium text-gray-900">{template.title}</h3>
                      <p className="text-sm text-gray-600">{template.description}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                          {getTypeLabel(template.type)}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-800">
                          {getPriorityLabel(template.priority)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {template.estimatedDuration}min
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <ThemedButton
                    variant="outline"
                    onClick={() => setShowTemplatesModal(false)}
                  >
                    Fechar
                  </ThemedButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalhes da Tarefa */}
        {showTaskModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{selectedTask.title}</h2>
                  <button
                    onClick={() => setShowTaskModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Status e Prioridade */}
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      TASK_STATUS_COLORS[selectedTask.status]?.bg || 'bg-gray-100'
                    } ${TASK_STATUS_COLORS[selectedTask.status]?.text || 'text-gray-800'}`}>
                      {getStatusLabel(selectedTask.status)}
                    </span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      PRIORITY_COLORS[selectedTask.priority]?.bg || 'bg-gray-100'
                    } ${PRIORITY_COLORS[selectedTask.priority]?.text || 'text-gray-800'}`}>
                      {getPriorityIcon(selectedTask.priority)} {getPriorityLabel(selectedTask.priority)}
                    </span>
                  </div>

                  {/* Descrição */}
                  {selectedTask.description && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Descrição</h3>
                      <p className="text-gray-700">{selectedTask.description}</p>
                    </div>
                  )}

                  {/* Informações */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Informações</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tipo:</span>
                          <span className="font-medium">{getTypeLabel(selectedTask.type)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vencimento:</span>
                          <span className="font-medium">{formatTaskDate(selectedTask.dueDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Duração:</span>
                          <span className="font-medium">{selectedTask.estimatedDuration || 30}min</span>
                        </div>
                        {selectedTask.associatedName && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Associado a:</span>
                            <span className="font-medium">{selectedTask.associatedName}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">Status</h3>
                      <select
                        value={selectedTask.status}
                        onChange={(e) => handleStatusUpdate(selectedTask.id, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        {TASK_STATUS && Object.values(TASK_STATUS).map(status => (
                          <option key={status} value={status}>{getStatusLabel(status)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Alertas */}
                  {isOverdue(selectedTask) && (
                    <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm font-medium">
                        ⚠️ Esta tarefa está em atraso há {Math.abs(getDaysUntilDue(selectedTask))} dia(s)
                      </p>
                    </div>
                  )}

                  {isDueToday(selectedTask) && !isOverdue(selectedTask) && (
                    <div className="p-3 bg-orange-100 border border-orange-200 rounded-lg">
                      <p className="text-orange-800 text-sm font-medium">
                        🔔 Esta tarefa vence hoje
                      </p>
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex space-x-3 pt-4">
                    {selectedTask.status !== TASK_STATUS.COMPLETA && (
                      <ThemedButton
                        onClick={() => {
                          handleCompleteTask(selectedTask.id);
                          setShowTaskModal(false);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        ✓ Marcar como Completa
                      </ThemedButton>
                    )}
                    
                    <ThemedButton
                      variant="outline"
                      onClick={() => {
                        handleDeleteTask(selectedTask.id);
                        setShowTaskModal(false);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Excluir Tarefa
                    </ThemedButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ThemedContainer>
    </DashboardLayout>
  );
};

export default TasksPage;