// src/components/tasks/TaskManager.jsx
import { useState, useMemo, useCallback } from 'react';
import { ThemedCard, ThemedButton } from '../common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';

// Componente avançado de gestão de tarefas
// MyImoMate 3.0 - Dashboard de produtividade com analytics
// Funcionalidades: Kanban, Analytics, Automações, Relatórios

const TaskManager = ({
  tasks = [],
  onUpdateTask,
  onCompleteTask,
  onDeleteTask,
  onCreateTask,
  formatTaskDate,
  isOverdue,
  isDueToday,
  getDaysUntilDue,
  TASK_STATUS,
  TASK_PRIORITY,
  TASK_TYPES,
  TASK_STATUS_COLORS,
  PRIORITY_COLORS,
  loading = false
}) => {
  const { theme } = useTheme();

  // Estados locais
  const [activeView, setActiveView] = useState('kanban'); // kanban, analytics, automation
  const [selectedTimeframe, setSelectedTimeframe] = useState('week'); // day, week, month
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  // Colunas do Kanban
  const kanbanColumns = useMemo(() => [
    {
      id: TASK_STATUS?.PENDENTE || 'pendente',
      title: 'Pendente',
      icon: '📋',
      color: 'yellow'
    },
    {
      id: TASK_STATUS?.EM_PROGRESSO || 'em_progresso',
      title: 'Em Progresso',
      icon: '⚡',
      color: 'blue'
    },
    {
      id: TASK_STATUS?.AGUARDANDO || 'aguardando',
      title: 'Aguardando',
      icon: '⏳',
      color: 'orange'
    },
    {
      id: TASK_STATUS?.COMPLETA || 'completa',
      title: 'Completa',
      icon: '✅',
      color: 'green'
    }
  ], [TASK_STATUS]);

  // Agrupar tarefas por status
  const tasksByStatus = useMemo(() => {
    const grouped = {};
    kanbanColumns.forEach(column => {
      grouped[column.id] = tasks.filter(task => task.status === column.id);
    });
    return grouped;
  }, [tasks, kanbanColumns]);

  // Analytics de produtividade
  const analytics = useMemo(() => {
    if (!tasks.length) return null;

    const now = new Date();
    const timeRanges = {
      day: 1,
      week: 7,
      month: 30
    };

    const daysBack = timeRanges[selectedTimeframe];
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const recentTasks = tasks.filter(task => 
      task.createdAt && task.createdAt >= startDate
    );

    const completedTasks = recentTasks.filter(task => 
      task.status === (TASK_STATUS?.COMPLETA || 'completa')
    );

    const overdueTasks = tasks.filter(task => isOverdue && isOverdue(task));
    
    // Produtividade por dia
    const productivityByDay = {};
    for (let i = 0; i < daysBack; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toDateString();
      productivityByDay[dateKey] = {
        completed: 0,
        created: 0,
        overdue: 0
      };
    }

    recentTasks.forEach(task => {
      const createdKey = task.createdAt.toDateString();
      if (productivityByDay[createdKey]) {
        productivityByDay[createdKey].created++;
      }

      if (task.completedAt && task.completedAt >= startDate) {
        const completedKey = task.completedAt.toDateString();
        if (productivityByDay[completedKey]) {
          productivityByDay[completedKey].completed++;
        }
      }
    });

    // Estatísticas por tipo
    const tasksByType = {};
    recentTasks.forEach(task => {
      if (!tasksByType[task.type]) {
        tasksByType[task.type] = { total: 0, completed: 0 };
      }
      tasksByType[task.type].total++;
      if (task.status === (TASK_STATUS?.COMPLETA || 'completa')) {
        tasksByType[task.type].completed++;
      }
    });

    // Estatísticas por prioridade
    const tasksByPriority = {};
    recentTasks.forEach(task => {
      if (!tasksByPriority[task.priority]) {
        tasksByPriority[task.priority] = { total: 0, completed: 0 };
      }
      tasksByPriority[task.priority].total++;
      if (task.status === (TASK_STATUS?.COMPLETA || 'completa')) {
        tasksByPriority[task.priority].completed++;
      }
    });

    // Tempo médio de conclusão
    const completionTimes = completedTasks
      .filter(task => task.createdAt && task.completedAt)
      .map(task => task.completedAt - task.createdAt);
    
    const avgCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
      : 0;

    return {
      totalTasks: recentTasks.length,
      completedTasks: completedTasks.length,
      completionRate: recentTasks.length > 0 ? (completedTasks.length / recentTasks.length) * 100 : 0,
      overdueTasks: overdueTasks.length,
      avgCompletionTime: avgCompletionTime / (1000 * 60 * 60 * 24), // dias
      productivityByDay,
      tasksByType,
      tasksByPriority,
      mostProductiveDay: Object.entries(productivityByDay)
        .sort(([,a], [,b]) => b.completed - a.completed)[0]
    };
  }, [tasks, selectedTimeframe, TASK_STATUS, isOverdue]);

  // Handlers de Drag & Drop
  const handleDragStart = useCallback((e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.5';
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = '1';
    setDraggedTask(null);
    setDragOverColumn(null);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e, columnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  }, []);

  const handleDrop = useCallback((e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask && draggedTask.status !== newStatus && onUpdateTask) {
      onUpdateTask(draggedTask.id, { status: newStatus });
    }
    setDraggedTask(null);
  }, [draggedTask, onUpdateTask]);

  // Renderizar card de tarefa no Kanban
  const renderTaskCard = (task) => {
    const statusColors = TASK_STATUS_COLORS?.[task.status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    const priorityColors = PRIORITY_COLORS?.[task.priority] || { bg: 'bg-gray-100', text: 'text-gray-800' };
    const overdue = isOverdue ? isOverdue(task) : false;
    const dueToday = isDueToday ? isDueToday(task) : false;

    const getPriorityIcon = (priority) => {
      const icons = {
        baixa: '🟢',
        media: '🔵',
        alta: '🟡',
        urgente: '🔴',
        critica: '🟣'
      };
      return icons[priority] || '⚪';
    };

    return (
      <div
        key={task.id}
        draggable
        onDragStart={(e) => handleDragStart(e, task)}
        onDragEnd={handleDragEnd}
        className={`
          p-3 mb-3 bg-white rounded-lg shadow-sm border cursor-move transition-all
          ${overdue ? 'border-red-300 bg-red-50' : dueToday ? 'border-orange-300 bg-orange-50' : 'border-gray-200'}
          ${draggedTask?.id === task.id ? 'opacity-50' : ''}
          hover:shadow-md
        `}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm truncate flex-1">{task.title}</h4>
          <span className="text-lg ml-2">{getPriorityIcon(task.priority)}</span>
        </div>

        {task.description && (
          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-1 rounded ${priorityColors.bg} ${priorityColors.text}`}>
            {task.priority}
          </span>
          <span className="text-gray-500">
            {formatTaskDate ? formatTaskDate(task.dueDate) : task.dueDate?.toLocaleDateString('pt-PT')}
          </span>
        </div>

        {(overdue || dueToday) && (
          <div className="mt-2 text-xs">
            {overdue && (
              <span className="text-red-600 font-medium">⚠️ Em atraso</span>
            )}
            {dueToday && !overdue && (
              <span className="text-orange-600 font-medium">🔔 Vence hoje</span>
            )}
          </div>
        )}
      </div>
    );
  };

  // Renderizar vista Kanban
  const renderKanban = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {kanbanColumns.map(column => {
        const columnTasks = tasksByStatus[column.id] || [];
        const isDragOver = dragOverColumn === column.id;

        return (
          <div key={column.id} className="flex flex-col">
            <div className={`p-4 rounded-lg mb-4 ${
              column.color === 'yellow' ? 'bg-yellow-100 border-yellow-200' :
              column.color === 'blue' ? 'bg-blue-100 border-blue-200' :
              column.color === 'orange' ? 'bg-orange-100 border-orange-200' :
              column.color === 'green' ? 'bg-green-100 border-green-200' :
              'bg-gray-100 border-gray-200'
            } border`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{column.icon}</span>
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {columnTasks.length}
                </span>
              </div>
            </div>

            <div
              className={`flex-1 min-h-[400px] p-2 rounded-lg transition-colors ${
                isDragOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : 'bg-gray-50'
              }`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {columnTasks.length > 0 ? (
                columnTasks.map(task => renderTaskCard(task))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm">Nenhuma tarefa</p>
                  {isDragOver && (
                    <p className="text-xs mt-1 text-blue-600">Solte aqui</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Renderizar analytics
  const renderAnalytics = () => {
    if (!analytics) {
      return (
        <div className="text-center py-8 text-gray-500">
          <p>Dados insuficientes para analytics</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ThemedCard className="p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Tarefas Criadas</h3>
            <p className="text-2xl font-bold text-blue-600">{analytics.totalTasks}</p>
          </ThemedCard>
          
          <ThemedCard className="p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Concluídas</h3>
            <p className="text-2xl font-bold text-green-600">{analytics.completedTasks}</p>
          </ThemedCard>
          
          <ThemedCard className="p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Taxa de Conclusão</h3>
            <p className="text-2xl font-bold text-purple-600">{analytics.completionRate.toFixed(1)}%</p>
          </ThemedCard>
          
          <ThemedCard className="p-4">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Em Atraso</h3>
            <p className="text-2xl font-bold text-red-600">{analytics.overdueTasks}</p>
          </ThemedCard>
        </div>

        {/* Análise por tipo */}
        <ThemedCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Análise por Tipo de Tarefa</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analytics.tasksByType).map(([type, data]) => (
              <div key={type} className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 capitalize">{type.replace('_', ' ')}</h4>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-medium">{data.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Concluídas:</span>
                    <span className="font-medium text-green-600">{data.completed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa:</span>
                    <span className="font-medium">
                      {data.total > 0 ? ((data.completed / data.total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ThemedCard>

        {/* Análise por prioridade */}
        <ThemedCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Análise por Prioridade</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analytics.tasksByPriority).map(([priority, data]) => (
              <div key={priority} className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 capitalize">{priority}</h4>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-medium">{data.total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Concluídas:</span>
                    <span className="font-medium text-green-600">{data.completed}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa:</span>
                    <span className="font-medium">
                      {data.total > 0 ? ((data.completed / data.total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ThemedCard>

        {/* Insights */}
        <ThemedCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Insights de Produtividade</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tempo médio de conclusão:</strong> {' '}
                {analytics.avgCompletionTime > 0 
                  ? `${analytics.avgCompletionTime.toFixed(1)} dias`
                  : 'Dados insuficientes'
                }
              </p>
            </div>
            
            {analytics.mostProductiveDay && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Dia mais produtivo:</strong> {' '}
                  {new Date(analytics.mostProductiveDay[0]).toLocaleDateString('pt-PT')} {' '}
                  ({analytics.mostProductiveDay[1].completed} tarefas concluídas)
                </p>
              </div>
            )}
            
            {analytics.overdueTasks > 0 && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Atenção:</strong> Existem {analytics.overdueTasks} tarefa(s) em atraso que requerem atenção imediata
                </p>
              </div>
            )}
          </div>
        </ThemedCard>
      </div>
    );
  };

  // Renderizar automações
  const renderAutomation = () => (
    <div className="space-y-6">
      <ThemedCard className="p-6">
        <h3 className="text-lg font-semibold mb-4">Automações Disponíveis</h3>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Follow-up Automático</h4>
            <p className="text-sm text-gray-600 mb-3">
              Criar automaticamente tarefas de follow-up após visitas ou reuniões
            </p>
            <ThemedButton size="sm" variant="outline">
              Configurar
            </ThemedButton>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Lembretes Inteligentes</h4>
            <p className="text-sm text-gray-600 mb-3">
              Enviar lembretes personalizados baseados na prioridade e prazo
            </p>
            <ThemedButton size="sm" variant="outline">
              Configurar
            </ThemedButton>
          </div>
          
          <div className="p-4 border rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Relatórios Semanais</h4>
            <p className="text-sm text-gray-600 mb-3">
              Receber relatórios automáticos de produtividade todas as semanas
            </p>
            <ThemedButton size="sm" variant="outline">
              Configurar
            </ThemedButton>
          </div>
        </div>
      </ThemedCard>
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando gestão de tarefas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com navegação */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">Gestão Avançada</h2>
          {activeView === 'analytics' && (
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="day">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
            </select>
          )}
        </div>

        <div className="flex space-x-2">
          <ThemedButton
            variant={activeView === 'kanban' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveView('kanban')}
          >
            📋 Kanban
          </ThemedButton>
          <ThemedButton
            variant={activeView === 'analytics' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveView('analytics')}
          >
            📊 Analytics
          </ThemedButton>
          <ThemedButton
            variant={activeView === 'automation' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveView('automation')}
          >
            🤖 Automação
          </ThemedButton>
        </div>
      </div>

      {/* Conteúdo baseado na vista ativa */}
      {activeView === 'kanban' && renderKanban()}
      {activeView === 'analytics' && renderAnalytics()}
      {activeView === 'automation' && renderAutomation()}
    </div>
  );
};

export default TaskManager;