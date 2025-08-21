// src/pages/tasks/TasksPage.jsx - COM SIDEBAR REUTILIZÁVEL - VERSÃO COMPLETA
// ✅ Aplicando Sidebar.jsx componente reutilizável
// ✅ MANTÉM TODAS AS FUNCIONALIDADES EXISTENTES (100%)
// ✅ Substitui DashboardLayout por layout com Sidebar
// ✅ Zero funcionalidades perdidas - sistema de tarefas completo
// 🔥 CORRIGIDO: CheckIcon em vez de CheckSquareIcon (Heroicons v2)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar'; // 🔥 NOVO IMPORT
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useTasks from '../../hooks/useTasks';
import { 
  CheckIcon, // 🔥 CORRIGIDO: CheckSquareIcon NÃO EXISTE em Heroicons v2
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  FunnelIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  StarIcon,
  ArrowRightIcon,
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

const TasksPage = () => {
  // Estados locais
  const [view, setView] = useState('list'); // 'list', 'kanban', 'calendar'
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');

  // Estados do formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'follow_up',
    priority: 'media',
    status: 'pendente',
    dueDate: '',
    dueTime: '',
    notes: '',
    associatedTo: '',
    associatedId: ''
  });

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    type: 'all',
    search: '',
    dateRange: 'all'
  });

  // Hooks
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  const {
    tasks,
    loading,
    error,
    creating,
    createTask,
    updateTask,
    deleteTask,
    isOverdue,
    isDueToday,
    refreshTasks,
    TASK_STATUS,
    TASK_PRIORITY,
    TASK_TYPES,
    TASK_TEMPLATES
  } = useTasks();

  // Filtrar tarefas
  const filteredTasks = tasks.filter(task => {
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.type !== 'all' && task.type !== filters.type) return false;
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !task.description?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  // 📊 MÉTRICAS CALCULADAS
  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter(t => t.status === 'pendente').length;
  const inProgressTasks = tasks.filter(t => t.status === 'em_progresso').length;
  const completedTasks = tasks.filter(t => t.status === 'completa').length;
  const overdueTasks = tasks.filter(t => isOverdue && isOverdue(t)).length;

  // 🔧 HANDLERS
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await createTask(formData);
      setFormData({
        title: '',
        description: '',
        type: 'follow_up',
        priority: 'media',
        status: 'pendente',
        dueDate: '',
        dueTime: '',
        notes: '',
        associatedTo: '',
        associatedId: ''
      });
      setShowCreateForm(false);
      setFeedbackMessage('Tarefa criada com sucesso!');
      setFeedbackType('success');
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (error) {
      setFeedbackMessage('Erro ao criar tarefa: ' + error.message);
      setFeedbackType('error');
      setTimeout(() => setFeedbackMessage(''), 5000);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await updateTask(taskId, { status: 'completa' });
      setFeedbackMessage('Tarefa marcada como completa!');
      setFeedbackType('success');
      setTimeout(() => setFeedbackMessage(''), 3000);
      setOpenDropdown(null);
    } catch (error) {
      setFeedbackMessage('Erro ao completar tarefa: ' + error.message);
      setFeedbackType('error');
      setTimeout(() => setFeedbackMessage(''), 5000);
    }
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (window.confirm(`Deseja eliminar a tarefa "${taskTitle}"?`)) {
      try {
        await deleteTask(taskId);
        setFeedbackMessage('Tarefa eliminada com sucesso!');
        setFeedbackType('success');
        setTimeout(() => setFeedbackMessage(''), 3000);
        setOpenDropdown(null);
      } catch (error) {
        setFeedbackMessage('Erro ao eliminar tarefa: ' + error.message);
        setFeedbackType('error');
        setTimeout(() => setFeedbackMessage(''), 5000);
      }
    }
  };

  const handleCreateFromTemplate = async (templateKey) => {
    try {
      if (!TASK_TEMPLATES || !TASK_TEMPLATES[templateKey]) {
        throw new Error('Template não encontrado');
      }
      
      const template = TASK_TEMPLATES[templateKey];
      const taskData = {
        ...template,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 dia a partir de agora
      };
      
      await createTask(taskData);
      setShowTemplatesModal(false);
      setFeedbackMessage('Tarefa criada a partir do template!');
      setFeedbackType('success');
      setTimeout(() => setFeedbackMessage(''), 3000);
    } catch (error) {
      setFeedbackMessage('Erro ao criar tarefa do template: ' + error.message);
      setFeedbackType('error');
      setTimeout(() => setFeedbackMessage(''), 5000);
    }
  };

  // 🛡️ FUNÇÕES SEGURAS
  const safeIsOverdue = (task) => {
    try {
      return isOverdue && typeof isOverdue === 'function' ? isOverdue(task) : false;
    } catch (error) {
      return false;
    }
  };

  const safeIsDueToday = (task) => {
    try {
      return isDueToday && typeof isDueToday === 'function' ? isDueToday(task) : false;
    } catch (error) {
      return false;
    }
  };

  // 🏷️ FUNÇÕES DE LABEL E COR
  const getStatusLabel = (status) => {
    const labels = {
      'pendente': 'Pendente',
      'em_progresso': 'Em Progresso',
      'aguardando': 'Aguardando',
      'completa': 'Completa',
      'cancelada': 'Cancelada',
      'adiada': 'Adiada'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pendente': 'bg-yellow-100 text-yellow-800',
      'em_progresso': 'bg-blue-100 text-blue-800',
      'aguardando': 'bg-orange-100 text-orange-800',
      'completa': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800',
      'adiada': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  const getPriorityColor = (priority) => {
    const colors = {
      'baixa': 'bg-gray-100 text-gray-800',
      'media': 'bg-blue-100 text-blue-800',
      'alta': 'bg-yellow-100 text-yellow-800',
      'urgente': 'bg-orange-100 text-orange-800',
      'critica': 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type) => {
    const labels = {
      'follow_up': 'Follow-up',
      'chamada': 'Chamada',
      'email': 'Email',
      'visita': 'Visita',
      'documento': 'Documento',
      'reuniao': 'Reunião',
      'proposta': 'Proposta',
      'contrato': 'Contrato',
      'apresentacao': 'Apresentação',
      'negociacao': 'Negociação',
      'geral': 'Geral'
    };
    return labels[type] || type;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 🎨 SIDEBAR REUTILIZÁVEL */}
      <Sidebar />

      {/* 📱 CONTEÚDO PRINCIPAL */}
      <div className="flex-1 ml-64"> {/* ml-64 para compensar sidebar fixa */}
        <ThemedContainer className="p-6">
          {/* 📊 HEADER COM MÉTRICAS COMPACTAS */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Sistema de Tarefas</h1>
              <p className="text-gray-600">Gestão completa de tarefas e follow-ups</p>
            </div>

            <div className="flex space-x-3">
              <ThemedButton
                onClick={() => setShowTemplatesModal(true)}
                variant="outline"
                className="flex items-center"
              >
                <CheckIcon className="h-4 w-4 mr-2" />
                Templates
              </ThemedButton>
              
              <ThemedButton
                onClick={() => setShowCreateForm(true)}
                className="flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nova Tarefa
              </ThemedButton>
            </div>
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

          {/* 📊 CARDS DE MÉTRICAS COMPACTAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <CompactMetricCard
              title="Total de Tarefas"
              value={totalTasks}
              icon={CheckIcon}
              color="blue"
              trend={`${pendingTasks} pendentes`}
              onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
            />
            
            <CompactMetricCard
              title="Pendentes"
              value={pendingTasks}
              icon={ClockIcon}
              color="yellow"
              trend="A completar"
              onClick={() => setFilters(prev => ({ ...prev, status: 'pendente' }))}
            />
            
            <CompactMetricCard
              title="Em Progresso"
              value={inProgressTasks}
              icon={EyeIcon}
              color="green"
              trend="Ativas"
              onClick={() => setFilters(prev => ({ ...prev, status: 'em_progresso' }))}
            />
            
            <CompactMetricCard
              title="Completas"
              value={completedTasks}
              icon={CheckCircleIcon}
              color="purple"
              trend="Finalizadas"
              onClick={() => setFilters(prev => ({ ...prev, status: 'completa' }))}
            />
            
            <CompactMetricCard
              title="Em Atraso"
              value={overdueTasks}
              icon={ClockIcon}
              color="red"
              trend="Requer atenção"
              onClick={() => setFilters(prev => ({ ...prev, status: 'pendente' }))}
            />
          </div>

          {/* 🔍 FILTROS E CONTROLES */}
          <ThemedCard className="mb-6">
            <div className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                {/* Filtro de Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos</option>
                    <option value="pendente">Pendentes</option>
                    <option value="em_progresso">Em Progresso</option>
                    <option value="aguardando">Aguardando</option>
                    <option value="completa">Completas</option>
                    <option value="cancelada">Canceladas</option>
                    <option value="adiada">Adiadas</option>
                  </select>
                </div>

                {/* Filtro de Prioridade */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todas</option>
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                    <option value="critica">Crítica</option>
                  </select>
                </div>

                {/* Filtro de Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="chamada">Chamada</option>
                    <option value="email">Email</option>
                    <option value="visita">Visita</option>
                    <option value="reuniao">Reunião</option>
                    <option value="documento">Documento</option>
                    <option value="proposta">Proposta</option>
                    <option value="contrato">Contrato</option>
                  </select>
                </div>

                {/* Pesquisa */}
                <div className="flex-1 min-w-64">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pesquisar</label>
                  <input
                    type="text"
                    placeholder="Título, descrição ou notas..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Controles de Vista */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vista</label>
                  <div className="flex border border-gray-300 rounded-md overflow-hidden">
                    <button
                      onClick={() => setView('list')}
                      className={`px-3 py-2 text-sm ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      Lista
                    </button>
                    <button
                      onClick={() => setView('kanban')}
                      className={`px-3 py-2 text-sm border-l border-gray-300 ${view === 'kanban' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      Kanban
                    </button>
                    <button
                      onClick={() => setView('calendar')}
                      className={`px-3 py-2 text-sm border-l border-gray-300 ${view === 'calendar' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    >
                      Calendário
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ThemedCard>

          {/* FORMULÁRIO DE CRIAÇÃO */}
          {showCreateForm && (
            <ThemedCard className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4">Nova Tarefa</h3>
                
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Título */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Ligar para cliente..."
                      />
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="follow_up">Follow-up</option>
                        <option value="chamada">Chamada</option>
                        <option value="email">Email</option>
                        <option value="visita">Visita</option>
                        <option value="reuniao">Reunião</option>
                        <option value="documento">Documento</option>
                        <option value="proposta">Proposta</option>
                        <option value="contrato">Contrato</option>
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
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descreva os detalhes da tarefa..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Prioridade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridade
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="baixa">Baixa</option>
                        <option value="media">Média</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                        <option value="critica">Crítica</option>
                      </select>
                    </div>

                    {/* Data de Vencimento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data de Vencimento
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Notas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas Adicionais
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows="2"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Notas adicionais, contexto, etc..."
                    />
                  </div>

                  {/* Botões */}
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
                      disabled={creating || !formData.title.trim()}
                    >
                      {creating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Criando...
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Criar Tarefa
                        </>
                      )}
                    </ThemedButton>
                  </div>
                </form>
              </div>
            </ThemedCard>
          )}

          {/* 📋 CONTEÚDO PRINCIPAL - VISTA LISTA */}
          {view === 'list' && (
            <ThemedCard>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Tarefas ({filteredTasks.length})
                </h3>

                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center">
                      <svg className="animate-spin h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      A carregar tarefas...
                    </div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-600">
                    Erro ao carregar tarefas: {error}
                  </div>
                ) : filteredTasks.length > 0 ? (
                  // Tabela de tarefas
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarefa</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimento</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTasks.map((task) => {
                          return (
                            <tr key={task.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{task.title}</div>
                                  {task.description && (
                                    <div className="text-sm text-gray-500 truncate max-w-xs">{task.description}</div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{getTypeLabel(task.type)}</div>
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
                                {safeIsOverdue(task) && (
                                  <div className="text-xs text-red-600 mt-1">Em atraso</div>
                                )}
                                {safeIsDueToday(task) && !safeIsOverdue(task) && (
                                  <div className="text-xs text-orange-600 mt-1">Vence hoje</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {task.dueDate ? (
                                  task.dueDate instanceof Date 
                                    ? task.dueDate.toLocaleDateString('pt-PT')
                                    : new Date(task.dueDate).toLocaleDateString('pt-PT')
                                ) : 'Sem data'}
                                {task.dueTime && <div className="text-xs">{task.dueTime}</div>}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                                        {task.status !== 'completa' && (
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
                    <CheckIcon className="mx-auto h-12 w-12 text-gray-400" />
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

          {/* VISTA KANBAN */}
          {view === 'kanban' && (
            <ThemedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vista Kanban
                </h3>
                
                <div className="text-center py-12">
                  <CheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">Vista Kanban</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Funcionalidade em desenvolvimento. Use a vista em lista por enquanto.
                  </p>
                  <div className="mt-6">
                    <ThemedButton onClick={() => setView('list')}>
                      Ver Lista
                    </ThemedButton>
                  </div>
                </div>
              </div>
            </ThemedCard>
          )}

          {/* VISTA CALENDÁRIO */}
          {view === 'calendar' && (
            <ThemedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Vista Calendário
                </h3>
                
                <div className="text-center py-12">
                  <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">Vista Calendário</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Funcionalidade em desenvolvimento. Use a vista em lista por enquanto.
                  </p>
                  <div className="mt-6">
                    <ThemedButton onClick={() => setView('list')}>
                      Ver Lista
                    </ThemedButton>
                  </div>
                </div>
              </div>
            </ThemedCard>
          )}

          {/* MODAL DE TEMPLATES */}
          {showTemplatesModal && TASK_TEMPLATES && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Templates de Tarefas</h3>
                
                <div className="space-y-3">
                  {Object.entries(TASK_TEMPLATES).map(([key, template]) => (
                    <div
                      key={key}
                      className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleCreateFromTemplate(key)}
                    >
                      <h4 className="font-medium text-gray-900">{template.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                      <div className="flex space-x-2 mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(template.priority)}`}>
                          {getPriorityLabel(template.priority)}
                        </span>
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {getTypeLabel(template.type)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <ThemedButton
                    variant="outline"
                    onClick={() => setShowTemplatesModal(false)}
                  >
                    Cancelar
                  </ThemedButton>
                </div>
              </div>
            </div>
          )}

          {/* MODAL DE DETALHES DA TAREFA */}
          {showTaskModal && selectedTask && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Detalhes da Tarefa</h3>
                  <button
                    onClick={() => setShowTaskModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-5 w-5" />
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
                        {selectedTask.dueDate ? (
                          selectedTask.dueDate instanceof Date 
                            ? selectedTask.dueDate.toLocaleDateString('pt-PT')
                            : new Date(selectedTask.dueDate).toLocaleDateString('pt-PT')
                        ) : 'Sem data definida'}
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
                    {selectedTask.status !== 'completa' && (
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