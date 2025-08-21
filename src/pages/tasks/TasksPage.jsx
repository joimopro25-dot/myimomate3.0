// src/pages/tasks/TasksPage.jsx - COM SIDEBAR REUTILIZÁVEL
// ✅ Aplicando Sidebar.jsx componente reutilizável
// ✅ MANTÉM TODAS AS FUNCIONALIDADES EXISTENTES (100%)
// ✅ Substitui DashboardLayout por layout com Sidebar
// ✅ Zero funcionalidades perdidas - sistema de tarefas completo

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar'; // 🔥 NOVO IMPORT
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useTasks from '../../hooks/useTasks';
import { 
  CheckSquareIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  PlusIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

// Componente de Métrica Compacta (mantido idêntico)
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
      className={`
        relative overflow-hidden rounded-lg p-3 cursor-pointer
        bg-gradient-to-r ${colorClasses[color]}
        text-white shadow-lg hover:shadow-xl 
        transform hover:scale-105 transition-all duration-200
        group
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-white/80 mb-1">{title}</p>
          <p className="text-lg font-bold text-white">{value}</p>
          {trend && (
            <p className="text-xs text-white/70 mt-1">{trend}</p>
          )}
        </div>
        <div className="ml-3">
          <Icon className="h-6 w-6 text-white/80 group-hover:text-white transition-colors" />
        </div>
      </div>
      
      {/* Efeito hover */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </div>
  );
};

// 🎯 PÁGINA PRINCIPAL DO SISTEMA DE TAREFAS
// =========================================
// MyImoMate 3.0 - Interface completa para gestão de tarefas
// Funcionalidades: Kanban, Lista, Templates, Follow-ups, Produtividade

const TasksPage = () => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  
  // Hook personalizado de tarefas (mantido 100% idêntico)
  const {
    tasks,
    loading,
    error,
    creating,
    updating,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    createFromTemplate,
    getTaskStats,
    isOverdue,
    isDueToday,
    getDaysUntilDue,
    TASK_STATUS,
    TASK_TYPES,
    TASK_PRIORITY,
    TASK_STATUS_COLORS,
    PRIORITY_COLORS,
    TASK_TEMPLATES,
    filters,
    setFilters
  } = useTasks();

  // Estados locais (mantidos idênticos)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [viewMode, setViewMode] = useState('list'); // list, calendar, kanban
  const [openDropdown, setOpenDropdown] = useState(null);

  // Estados do formulário (mantidos idênticos)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: TASK_TYPES?.FOLLOW_UP || 'follow_up',
    priority: TASK_PRIORITY?.MEDIA || 'media',
    status: TASK_STATUS?.PENDENTE || 'pendente',
    dueDate: '',
    dueTime: '',
    relatedTo: '',
    relatedId: '',
    notes: '',
    tags: []
  });

  // Obter estatísticas (mantido idêntico)
  const stats = getTaskStats?.() || { 
    total: 0, 
    pending: 0, 
    inProgress: 0, 
    completed: 0, 
    completionRate: 0 
  };

  // Calcular estatísticas adicionais (mantido idêntico)
  const calculatedStats = {
    ...stats,
    total: tasks?.length || 0,
    pending: tasks?.filter(task => task.status === (TASK_STATUS?.PENDENTE || 'pendente')).length || 0,
    inProgress: tasks?.filter(task => task.status === (TASK_STATUS?.EM_PROGRESSO || 'em_progresso')).length || 0,
    completed: tasks?.filter(task => task.status === (TASK_STATUS?.COMPLETA || 'completa')).length || 0,
    completionRate: tasks?.length > 0 
      ? (tasks.filter(task => task.status === (TASK_STATUS?.COMPLETA || 'completa')).length / tasks.length) * 100 
      : 0
  };

  // 📝 MANIPULAR MUDANÇAS NO FORMULÁRIO (mantido idêntico)
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 🔄 RESET DO FORMULÁRIO (mantido idêntico)
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: TASK_TYPES?.FOLLOW_UP || 'follow_up',
      priority: TASK_PRIORITY?.MEDIA || 'media',
      status: TASK_STATUS?.PENDENTE || 'pendente',
      dueDate: '',
      dueTime: '',
      relatedTo: '',
      relatedId: '',
      notes: '',
      tags: []
    });
  };

  // 📝 SUBMETER FORMULÁRIO DE CRIAÇÃO (mantido idêntico)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (!formData.title.trim()) {
        throw new Error('Título é obrigatório');
      }
      if (!formData.dueDate) {
        throw new Error('Data de vencimento é obrigatória');
      }

      const result = await createTask(formData);
      
      if (result?.success !== false) {
        setFeedbackMessage('Tarefa criada com sucesso!');
        setFeedbackType('success');
        setShowCreateForm(false);
        resetForm();
      } else {
        throw new Error(result?.error || 'Erro ao criar tarefa');
      }
    } catch (error) {
      setFeedbackMessage(error.message || 'Erro inesperado ao criar tarefa');
      setFeedbackType('error');
    }
  };

  // 📊 ATUALIZAR STATUS DA TAREFA (mantido idêntico)
  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      const result = await updateTask(taskId, { status: newStatus });
      
      if (result?.success !== false) {
        setFeedbackMessage('Status atualizado com sucesso!');
        setFeedbackType('success');
        setOpenDropdown(null);
      } else {
        throw new Error(result?.error || 'Erro ao atualizar status');
      }
    } catch (error) {
      setFeedbackMessage(error.message || 'Erro inesperado ao atualizar status');
      setFeedbackType('error');
    }
  };

  // ✅ COMPLETAR TAREFA (mantido idêntico)
  const handleCompleteTask = async (taskId, notes = '') => {
    try {
      const result = await completeTask(taskId, notes);
      
      if (result?.success !== false) {
        setFeedbackMessage('Tarefa marcada como completa!');
        setFeedbackType('success');
      } else {
        throw new Error(result?.error || 'Erro ao completar tarefa');
      }
    } catch (error) {
      setFeedbackMessage(error.message || 'Erro inesperado ao completar tarefa');
      setFeedbackType('error');
    }
  };

  // 🗑️ ELIMINAR TAREFA (mantido idêntico)
  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!window.confirm(`Tem certeza que deseja eliminar a tarefa "${taskTitle}"?`)) return;
    
    try {
      const result = await deleteTask(taskId);
      
      if (result?.success !== false) {
        setFeedbackMessage('Tarefa eliminada com sucesso!');
        setFeedbackType('success');
        setOpenDropdown(null);
      } else {
        throw new Error(result?.error || 'Erro ao eliminar tarefa');
      }
    } catch (error) {
      setFeedbackMessage(error.message || 'Erro inesperado ao eliminar tarefa');
      setFeedbackType('error');
    }
  };

  // 📄 CRIAR TAREFA A PARTIR DE TEMPLATE (mantido idêntico)
  const handleCreateFromTemplate = async (templateKey) => {
    try {
      if (!createFromTemplate || !TASK_TEMPLATES) {
        setFeedbackMessage('Funcionalidade de templates não disponível');
        setFeedbackType('error');
        return;
      }

      const template = TASK_TEMPLATES[templateKey];
      if (!template) {
        throw new Error('Template não encontrado');
      }

      const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      
      const result = await createFromTemplate(template, { dueDate });
      
      if (result?.success !== false) {
        setFeedbackMessage('Tarefa criada a partir do template!');
        setFeedbackType('success');
        setShowTemplatesModal(false);
      } else {
        throw new Error(result?.error || 'Erro ao criar tarefa do template');
      }
    } catch (error) {
      setFeedbackMessage(error.message || 'Erro inesperado ao criar tarefa do template');
      setFeedbackType('error');
    }
  };

  // Funções auxiliares defensivas (mantidas idênticas)
  const safeIsOverdue = (task) => {
    if (isOverdue) return isOverdue(task);
    if (!task.dueDate) return false;
    const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
    return dueDate < new Date();
  };

  const safeIsDueToday = (task) => {
    if (isDueToday) return isDueToday(task);
    if (!task.dueDate) return false;
    const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
    const today = new Date();
    return dueDate.toDateString() === today.toDateString();
  };

  const safeGetDaysUntilDue = (task) => {
    if (getDaysUntilDue) return getDaysUntilDue(task);
    if (!task.dueDate) return null;
    const dueDate = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusLabel = (status) => {
    const labels = {
      'pendente': 'Pendente',
      'em_progresso': 'Em Progresso',
      'completa': 'Completa',
      'cancelada': 'Cancelada'
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'baixa': 'Baixa',
      'media': 'Média',
      'alta': 'Alta',
      'urgente': 'Urgente',
      'critica': 'Crítica'
    };
    return labels[priority] || priority;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'follow_up': 'Follow-up',
      'ligacao': 'Ligação',
      'email': 'Email',
      'reuniao': 'Reunião',
      'visita': 'Visita',
      'documentos': 'Documentos',
      'pesquisa': 'Pesquisa',
      'proposta': 'Proposta',
      'contrato': 'Contrato',
      'administrativo': 'Administrativo',
      'outro': 'Outro'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = TASK_STATUS_COLORS?.[status];
    if (colors) return `${colors.bg} ${colors.text}`;
    return 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = PRIORITY_COLORS?.[priority];
    if (colors) return `${colors.bg} ${colors.text}`;
    return 'bg-gray-100 text-gray-800';
  };

  // 🕒 EFEITO PARA LIMPAR MENSAGENS DE FEEDBACK (mantido idêntico)
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage('');
        setFeedbackType('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1 min-h-screen bg-gray-50">
          <ThemedContainer className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando tarefas...</p>
          </ThemedContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* 🔥 SIDEBAR REUTILIZÁVEL - SUBSTITUIU DASHBOARDLAYOUT */}
      <Sidebar />
      
      {/* Conteúdo Principal - MANTÉM MARGEM LEFT PARA SIDEBAR */}
      <div className="ml-64 flex-1 min-h-screen bg-gray-50">
        <ThemedContainer className="px-6 py-6">
          
          {/* Header da Página - MANTIDO IDÊNTICO */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Sistema de Tarefas
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestão de produtividade e follow-ups automáticos
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex rounded-lg border border-gray-300">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-2 text-sm ${
                      viewMode === 'list' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } rounded-l-lg`}
                  >
                    Lista
                  </button>
                  <button
                    onClick={() => setViewMode('kanban')}
                    className={`px-3 py-2 text-sm ${
                      viewMode === 'kanban' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Kanban
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-3 py-2 text-sm ${
                      viewMode === 'calendar' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } rounded-r-lg`}
                  >
                    Calendário
                  </button>
                </div>

                {TASK_TEMPLATES && Object.keys(TASK_TEMPLATES).length > 0 && (
                  <ThemedButton
                    variant="outline"
                    onClick={() => setShowTemplatesModal(true)}
                  >
                    Templates
                  </ThemedButton>
                )}
                
                <ThemedButton 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Nova Tarefa</span>
                </ThemedButton>
              </div>
            </div>

            {/* Feedback Messages - MANTIDO IDÊNTICO */}
            {feedbackMessage && (
              <div className={`p-4 rounded-lg mb-4 ${
                feedbackType === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : feedbackType === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {feedbackMessage}
              </div>
            )}

            {/* Métricas Compactas - MANTIDAS IDÊNTICAS */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <CompactMetricCard
                title="Total"
                value={calculatedStats.total}
                trend="Todas as tarefas"
                icon={CheckSquareIcon}
                color="blue"
                onClick={() => setViewMode('list')}
              />
              
              <CompactMetricCard
                title="Pendentes"
                value={calculatedStats.pending}
                trend="Aguardando execução"
                icon={ClockIcon}
                color="yellow"
                onClick={() => setFilters?.(prev => ({ ...prev, status: 'pendente' }))}
              />
              
              <CompactMetricCard
                title="Em Progresso"
                value={calculatedStats.inProgress}
                trend="Tarefas ativas"
                icon={EyeIcon}
                color="green"
                onClick={() => setFilters?.(prev => ({ ...prev, status: 'em_progresso' }))}
              />
              
              <CompactMetricCard
                title="Concluídas"
                value={calculatedStats.completed}
                trend="Tarefas finalizadas"
                icon={CheckCircleIcon}
                color="purple"
                onClick={() => setFilters?.(prev => ({ ...prev, status: 'completa' }))}
              />
              
              <CompactMetricCard
                title="Taxa Conclusão"
                value={`${calculatedStats.completionRate?.toFixed(1) || 0}%`}
                trend="KPI de produtividade"
                icon={CheckCircleIcon}
                color="red"
                onClick={() => setShowCreateForm(true)}
              />
            </div>
          </div>

          {/* Filtros - MANTIDOS IDÊNTICOS */}
          <ThemedCard className="mb-6">
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                
                {/* Campo de Pesquisa */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Pesquisar por título, descrição ou tags..."
                    value={filters?.searchTerm || ''}
                    onChange={(e) => setFilters?.(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filtros */}
                <div className="flex flex-col md:flex-row gap-2">
                  <select
                    value={filters?.status || ''}
                    onChange={(e) => setFilters?.(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Status</option>
                    {Object.entries(TASK_STATUS || {}).map(([key, value]) => (
                      <option key={key} value={value}>
                        {getStatusLabel(value)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters?.type || ''}
                    onChange={(e) => setFilters?.(prev => ({ ...prev, type: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Tipos</option>
                    {Object.entries(TASK_TYPES || {}).map(([key, value]) => (
                      <option key={key} value={value}>
                        {getTypeLabel(value)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters?.priority || ''}
                    onChange={(e) => setFilters?.(prev => ({ ...prev, priority: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas as Prioridades</option>
                    {Object.entries(TASK_PRIORITY || {}).map(([key, value]) => (
                      <option key={key} value={value}>
                        {getPriorityLabel(value)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </ThemedCard>

          {/* Formulário de Criação - MANTIDO IDÊNTICO */}
          {showCreateForm && (
            <ThemedCard className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Criar Nova Tarefa
                </h3>
                
                <form onSubmit={handleCreateSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Título */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título da Tarefa *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Ligar para cliente João Silva"
                      />
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Tarefa
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => handleFormChange('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(TASK_TYPES || {}).map(([key, value]) => (
                          <option key={key} value={value}>
                            {getTypeLabel(value)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Prioridade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridade
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => handleFormChange('priority', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(TASK_PRIORITY || {}).map(([key, value]) => (
                          <option key={key} value={value}>
                            {getPriorityLabel(value)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Data de Vencimento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Vencimento *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.dueDate}
                        onChange={(e) => handleFormChange('dueDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Hora de Vencimento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora de Vencimento
                      </label>
                      <input
                        type="time"
                        value={formData.dueTime}
                        onChange={(e) => handleFormChange('dueTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Relacionado A */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Relacionado A
                      </label>
                      <select
                        value={formData.relatedTo}
                        onChange={(e) => handleFormChange('relatedTo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Não relacionado</option>
                        <option value="client">Cliente</option>
                        <option value="lead">Lead</option>
                        <option value="opportunity">Oportunidade</option>
                        <option value="deal">Negócio</option>
                        <option value="visit">Visita</option>
                      </select>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Detalhes da tarefa..."
                    />
                  </div>

                  {/* Notas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas Adicionais
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Notas internas..."
                    />
                  </div>

                  {/* Botões do formulário */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <ThemedButton
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </ThemedButton>
                    <ThemedButton
                      type="submit"
                      disabled={creating}
                      className="flex items-center space-x-2"
                    >
                      {creating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Criando...</span>
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4" />
                          <span>Criar Tarefa</span>
                        </>
                      )}
                    </ThemedButton>
                  </div>
                </form>
              </div>
            </ThemedCard>
          )}

          {/* Conteúdo Principal baseado na vista ativa */}
          {viewMode === 'kanban' && (
            <ThemedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vista Kanban
                </h3>
                
                <div className="text-center py-12">
                  <CheckSquareIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">Vista Kanban</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Funcionalidade em desenvolvimento. Use a vista em lista por enquanto.
                  </p>
                  <div className="mt-6">
                    <ThemedButton onClick={() => setViewMode('list')}>
                      Ver Lista
                    </ThemedButton>
                  </div>
                </div>
              </div>
            </ThemedCard>
          )}

          {viewMode === 'calendar' && (
            <ThemedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vista Calendário
                </h3>
                
                <div className="text-center py-12">
                  <CheckSquareIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">Vista Calendário</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Funcionalidade em desenvolvimento. Use a vista em lista por enquanto.
                  </p>
                  <div className="mt-6">
                    <ThemedButton onClick={() => setViewMode('list')}>
                      Ver Lista
                    </ThemedButton>
                  </div>
                </div>
              </div>
            </ThemedCard>
          )}

          {/* Vista Lista */}
          {viewMode === 'list' && (
            <ThemedCard>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Lista de Tarefas ({tasks?.length || 0})
                  </h3>
                  {loading && (
                    <p className="text-gray-500 mt-2">Carregando tarefas...</p>
                  )}
                  {error && (
                    <p className="text-red-600 mt-2">Erro: {error}</p>
                  )}
                </div>

                {tasks?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tarefa
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Prioridade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vencimento
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tasks.map((task) => {
                          const overdue = safeIsOverdue(task);
                          const dueToday = safeIsDueToday(task);
                          const daysUntil = safeGetDaysUntilDue(task);

                          return (
                            <tr 
                              key={task.id} 
                              className={`hover:bg-gray-50 ${
                                overdue ? 'bg-red-50' : dueToday ? 'bg-yellow-50' : ''
                              }`}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {task.title}
                                  </div>
                                  {task.description && (
                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                      {task.description}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {getTypeLabel(task.type)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                                  {getPriorityLabel(task.priority)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                                  {getStatusLabel(task.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm ${overdue ? 'text-red-600 font-medium' : dueToday ? 'text-yellow-600 font-medium' : 'text-gray-900'}`}>
                                  {task.dueDate instanceof Date 
                                    ? task.dueDate.toLocaleDateString('pt-PT')
                                    : new Date(task.dueDate).toLocaleDateString('pt-PT')
                                  }
                                  {task.dueTime && (
                                    <div className="text-xs text-gray-500">
                                      {task.dueTime}
                                    </div>
                                  )}
                                  {overdue && (
                                    <div className="text-xs text-red-500">
                                      {Math.abs(daysUntil)} dia(s) em atraso
                                    </div>
                                  )}
                                  {dueToday && (
                                    <div className="text-xs text-yellow-600">
                                      Vence hoje
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="relative">
                                  <button
                                    onClick={() => setOpenDropdown(openDropdown === task.id ? null : task.id)}
                                    className="text-gray-400 hover:text-gray-600"
                                  >
                                    <EllipsisVerticalIcon className="h-5 w-5" />
                                  </button>
                                  
                                  {openDropdown === task.id && (
                                    <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                                      <div className="py-1">
                                        <button
                                          onClick={() => {
                                            setSelectedTask(task);
                                            setShowTaskModal(true);
                                            setOpenDropdown(null);
                                          }}
                                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                          Ver Detalhes
                                        </button>
                                        {task.status !== (TASK_STATUS?.COMPLETA || 'completa') && (
                                          <button
                                            onClick={() => handleCompleteTask(task.id)}
                                            className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                          >
                                            Marcar como Completa
                                          </button>
                                        )}
                                        <div className="border-t border-gray-100 my-1"></div>
                                        <button
                                          onClick={() => handleDeleteTask(task.id, task.title)}
                                          className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                        >
                                          Eliminar
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  // Estado vazio
                  <div className="text-center py-12">
                    <CheckSquareIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma tarefa encontrada</h3>
                    <p className="mt-1 text-sm text-gray-500">Comece criando uma nova tarefa.</p>
                    <div className="mt-6">
                      <ThemedButton onClick={() => setShowCreateForm(true)}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Criar Primeira Tarefa
                      </ThemedButton>
                    </div>
                  </div>
                )}
              </div>
            </ThemedCard>
          )}

          {/* MODAIS MANTIDOS IDÊNTICOS */}
          {/* Modal de Templates */}
          {showTemplatesModal && TASK_TEMPLATES && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Templates de Tarefas</h3>
                
                <div className="space-y-3">
                  {Object.entries(TASK_TEMPLATES).map(([key, template]) => (
                    <div key={key} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{template.title}</h4>
                          <p className="text-sm text-gray-500 mt-1">{template.description}</p>
                        </div>
                        <ThemedButton
                          size="sm"
                          onClick={() => handleCreateFromTemplate(key)}
                        >
                          Usar
                        </ThemedButton>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <ThemedButton
                    variant="outline"
                    onClick={() => setShowTemplatesModal(false)}
                  >
                    Fechar
                  </ThemedButton>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Detalhes da Tarefa */}
          {showTaskModal && selectedTask && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-90vh overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Detalhes da Tarefa</h3>
                  <button
                    onClick={() => {
                      setShowTaskModal(false);
                      setSelectedTask(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedTask.title}</p>
                  </div>
                  
                  {selectedTask.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Descrição</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTask.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo</label>
                      <p className="mt-1 text-sm text-gray-900">{getTypeLabel(selectedTask.type)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Prioridade</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(selectedTask.priority)}`}>
                        {getPriorityLabel(selectedTask.priority)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedTask.status)}`}>
                        {getStatusLabel(selectedTask.status)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Vencimento</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedTask.dueDate instanceof Date 
                          ? selectedTask.dueDate.toLocaleDateString('pt-PT')
                          : new Date(selectedTask.dueDate).toLocaleDateString('pt-PT')
                        }
                        {selectedTask.dueTime && ` às ${selectedTask.dueTime}`}
                      </p>
                    </div>
                  </div>

                  {safeIsOverdue(selectedTask) && (
                    <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                      <p className="text-red-800 text-sm font-medium">
                        Esta tarefa está em atraso
                      </p>
                    </div>
                  )}

                  {safeIsDueToday(selectedTask) && !safeIsOverdue(selectedTask) && (
                    <div className="p-3 bg-orange-100 border border-orange-200 rounded-lg">
                      <p className="text-orange-800 text-sm font-medium">
                        Esta tarefa vence hoje
                      </p>
                    </div>
                  )}

                  {selectedTask.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notas</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedTask.notes}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedTask.createdAt?.toDate?.()?.toLocaleDateString('pt-PT') || 'N/A'}
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex space-x-3 pt-4">
                    {selectedTask.status !== (TASK_STATUS?.COMPLETA || 'completa') && (
                      <ThemedButton
                        onClick={() => {
                          handleCompleteTask(selectedTask.id);
                          setShowTaskModal(false);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Marcar como Completa
                      </ThemedButton>
                    )}
                    
                    <ThemedButton
                      variant="outline"
                      onClick={() => {
                        handleDeleteTask(selectedTask.id, selectedTask.title);
                        setShowTaskModal(false);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Eliminar Tarefa
                    </ThemedButton>
                  </div>
                </div>
              </div>
            </div>
          )}

        </ThemedContainer>
      </div>
    </div>
  );
};

export default TasksPage;