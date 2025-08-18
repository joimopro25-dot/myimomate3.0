// src/hooks/useTasks.js
import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

// Hook personalizado para Sistema de Tarefas
// MyImoMate 3.0 - Gestão completa de follow-ups e produtividade
// Funcionalidades: CRUD, Lembretes, Templates, Associações, Analytics

const useTasks = () => {
  const { user } = useAuth();
  
  // Estados principais
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estados para filtros e pesquisa
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    type: 'all',
    associatedTo: 'all',
    dateRange: 'all',
    searchTerm: '',
    assignedTo: 'all',
    overdue: false
  });

  // Constantes do sistema de tarefas
  const TASK_STATUS = {
    PENDENTE: 'pendente',
    EM_PROGRESSO: 'em_progresso',
    AGUARDANDO: 'aguardando',
    COMPLETA: 'completa',
    CANCELADA: 'cancelada',
    ADIADA: 'adiada'
  };

  const TASK_PRIORITY = {
    BAIXA: 'baixa',
    MEDIA: 'media',
    ALTA: 'alta',
    URGENTE: 'urgente',
    CRITICA: 'critica'
  };

  const TASK_TYPES = {
    FOLLOW_UP: 'follow_up',
    LIGACAO: 'ligacao',
    EMAIL: 'email',
    REUNIAO: 'reuniao',
    VISITA: 'visita',
    DOCUMENTOS: 'documentos',
    PESQUISA: 'pesquisa',
    PROPOSTA: 'proposta',
    CONTRATO: 'contrato',
    ADMINISTRATIVO: 'administrativo',
    OUTRO: 'outro'
  };

  const TASK_ASSOCIATIONS = {
    LEAD: 'lead',
    CLIENTE: 'cliente',
    VISITA: 'visita',
    OPORTUNIDADE: 'oportunidade',
    NEGOCIO: 'negocio',
    GERAL: 'geral'
  };

  // Cores dos status para UI
  const TASK_STATUS_COLORS = {
    [TASK_STATUS.PENDENTE]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    [TASK_STATUS.EM_PROGRESSO]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    [TASK_STATUS.AGUARDANDO]: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    [TASK_STATUS.COMPLETA]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    [TASK_STATUS.CANCELADA]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    [TASK_STATUS.ADIADA]: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
  };

  const PRIORITY_COLORS = {
    [TASK_PRIORITY.BAIXA]: { bg: 'bg-green-100', text: 'text-green-800' },
    [TASK_PRIORITY.MEDIA]: { bg: 'bg-blue-100', text: 'text-blue-800' },
    [TASK_PRIORITY.ALTA]: { bg: 'bg-orange-100', text: 'text-orange-800' },
    [TASK_PRIORITY.URGENTE]: { bg: 'bg-red-100', text: 'text-red-800' },
    [TASK_PRIORITY.CRITICA]: { bg: 'bg-purple-100', text: 'text-purple-800' }
  };

  // Carregar tarefas do Firebase
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', user.uid),
      orderBy('dueDate', 'asc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          dueDate: doc.data().dueDate?.toDate(),
          completedAt: doc.data().completedAt?.toDate(),
          reminderDate: doc.data().reminderDate?.toDate()
        }));
        setTasks(tasksData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Erro ao carregar tarefas:', err);
        setError('Erro ao carregar tarefas. Tente novamente.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Criar nova tarefa
  const createTask = useCallback(async (taskData) => {
    if (!user?.uid) {
      setError('Utilizador não autenticado');
      return false;
    }

    setCreating(true);
    setError(null);

    try {
      // Validações obrigatórias
      if (!taskData.title?.trim()) {
        throw new Error('Título da tarefa é obrigatório');
      }
      if (!taskData.dueDate) {
        throw new Error('Data de vencimento é obrigatória');
      }

      // Validar data de vencimento
      const dueDate = new Date(taskData.dueDate);
      if (dueDate < new Date()) {
        throw new Error('Data de vencimento não pode ser no passado');
      }

      const newTask = {
        ...taskData,
        userId: user.uid,
        status: taskData.status || TASK_STATUS.PENDENTE,
        priority: taskData.priority || TASK_PRIORITY.MEDIA,
        type: taskData.type || TASK_TYPES.FOLLOW_UP,
        dueDate: Timestamp.fromDate(dueDate),
        reminderDate: taskData.reminderDate ? Timestamp.fromDate(new Date(taskData.reminderDate)) : null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        completedAt: null,
        estimatedDuration: taskData.estimatedDuration || 30, // minutos
        actualDuration: null,
        // Auditoria
        createdBy: user.uid,
        lastModifiedBy: user.uid,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          ip: 'client-ip'
        }
      };

      const docRef = await addDoc(collection(db, 'tasks'), newTask);

      // Criar lembrete automático se especificado
      if (taskData.autoReminder && taskData.reminderDate) {
        await createReminder(docRef.id, taskData.reminderDate);
      }

      setCreating(false);
      return docRef.id;
    } catch (err) {
      console.error('Erro ao criar tarefa:', err);
      setError(err.message || 'Erro ao criar tarefa');
      setCreating(false);
      return false;
    }
  }, [user?.uid]);

  // Atualizar tarefa
  const updateTask = useCallback(async (taskId, updateData) => {
    if (!user?.uid || !taskId) {
      setError('Dados inválidos para atualização');
      return false;
    }

    setUpdating(true);
    setError(null);

    try {
      const taskRef = doc(db, 'tasks', taskId);
      
      const updates = {
        ...updateData,
        updatedAt: Timestamp.now(),
        lastModifiedBy: user.uid
      };

      // Se mudou para completa, definir data de conclusão
      if (updateData.status === TASK_STATUS.COMPLETA) {
        updates.completedAt = Timestamp.now();
      }

      // Atualizar data de vencimento se fornecida
      if (updateData.dueDate) {
        updates.dueDate = Timestamp.fromDate(new Date(updateData.dueDate));
      }

      // Atualizar lembrete se fornecido
      if (updateData.reminderDate) {
        updates.reminderDate = Timestamp.fromDate(new Date(updateData.reminderDate));
      }

      await updateDoc(taskRef, updates);
      setUpdating(false);
      return true;
    } catch (err) {
      console.error('Erro ao atualizar tarefa:', err);
      setError('Erro ao atualizar tarefa');
      setUpdating(false);
      return false;
    }
  }, [user?.uid]);

  // Marcar tarefa como completa
  const completeTask = useCallback(async (taskId, notes = '') => {
    if (!user?.uid || !taskId) {
      setError('Dados inválidos');
      return false;
    }

    try {
      const updates = {
        status: TASK_STATUS.COMPLETA,
        completedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastModifiedBy: user.uid
      };

      if (notes.trim()) {
        updates.completionNotes = notes;
      }

      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, updates);
      return true;
    } catch (err) {
      console.error('Erro ao completar tarefa:', err);
      setError('Erro ao completar tarefa');
      return false;
    }
  }, [user?.uid]);

  // Excluir tarefa
  const deleteTask = useCallback(async (taskId) => {
    if (!user?.uid || !taskId) {
      setError('Dados inválidos para exclusão');
      return false;
    }

    setDeleting(true);
    setError(null);

    try {
      await deleteDoc(doc(db, 'tasks', taskId));
      setDeleting(false);
      return true;
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
      setError('Erro ao excluir tarefa');
      setDeleting(false);
      return false;
    }
  }, [user?.uid]);

  // Criar lembrete
  const createReminder = useCallback(async (taskId, reminderDate) => {
    if (!user?.uid || !taskId) return false;

    try {
      const reminderData = {
        taskId,
        userId: user.uid,
        reminderDate: Timestamp.fromDate(new Date(reminderDate)),
        sent: false,
        type: 'task_reminder',
        createdAt: Timestamp.now()
      };

      await addDoc(collection(db, 'reminders'), reminderData);
      return true;
    } catch (err) {
      console.error('Erro ao criar lembrete:', err);
      return false;
    }
  }, [user?.uid]);

  // Criar tarefa a partir de template
  const createFromTemplate = useCallback(async (templateData, customData = {}) => {
    const taskData = {
      ...templateData,
      ...customData,
      title: customData.title || templateData.title,
      description: customData.description || templateData.description,
      dueDate: customData.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h default
    };

    return await createTask(taskData);
  }, [createTask]);

  // Templates de tarefas comuns
  const TASK_TEMPLATES = {
    FOLLOW_UP_LEAD: {
      title: 'Follow-up com Lead',
      description: 'Contactar lead para verificar interesse',
      type: TASK_TYPES.FOLLOW_UP,
      priority: TASK_PRIORITY.MEDIA,
      estimatedDuration: 15
    },
    CHAMADA_POS_VISITA: {
      title: 'Chamada pós-visita',
      description: 'Contactar cliente após visita para feedback',
      type: TASK_TYPES.LIGACAO,
      priority: TASK_PRIORITY.ALTA,
      estimatedDuration: 20
    },
    PREPARAR_PROPOSTA: {
      title: 'Preparar proposta',
      description: 'Elaborar proposta comercial',
      type: TASK_TYPES.PROPOSTA,
      priority: TASK_PRIORITY.ALTA,
      estimatedDuration: 60
    },
    ENVIAR_DOCUMENTOS: {
      title: 'Enviar documentos',
      description: 'Enviar documentação necessária ao cliente',
      type: TASK_TYPES.DOCUMENTOS,
      priority: TASK_PRIORITY.MEDIA,
      estimatedDuration: 10
    }
  };

  // Estatísticas das tarefas
  const getTaskStats = useMemo(() => {
    if (!tasks.length) {
      return {
        total: 0,
        byStatus: {},
        byPriority: {},
        byType: {},
        overdue: 0,
        dueToday: 0,
        dueThisWeek: 0,
        completionRate: 0,
        avgCompletionTime: 0
      };
    }

    const stats = {
      total: tasks.length,
      byStatus: {},
      byPriority: {},
      byType: {},
      overdue: 0,
      dueToday: 0,
      dueThisWeek: 0,
      completionRate: 0,
      avgCompletionTime: 0
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    let completedTasks = 0;
    let totalCompletionTime = 0;

    tasks.forEach(task => {
      // Contagem por status
      stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;
      
      // Contagem por prioridade
      stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;
      
      // Contagem por tipo
      stats.byType[task.type] = (stats.byType[task.type] || 0) + 1;

      // Tarefas em atraso
      if (task.dueDate && task.dueDate < now && task.status !== TASK_STATUS.COMPLETA) {
        stats.overdue++;
      }

      // Tarefas para hoje
      if (task.dueDate && task.dueDate >= today && task.dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)) {
        stats.dueToday++;
      }

      // Tarefas para esta semana
      if (task.dueDate && task.dueDate >= today && task.dueDate <= weekEnd) {
        stats.dueThisWeek++;
      }

      // Taxa de conclusão
      if (task.status === TASK_STATUS.COMPLETA) {
        completedTasks++;
        if (task.createdAt && task.completedAt) {
          totalCompletionTime += task.completedAt - task.createdAt;
        }
      }
    });

    stats.completionRate = (completedTasks / tasks.length) * 100;
    stats.avgCompletionTime = completedTasks > 0 ? totalCompletionTime / completedTasks / (1000 * 60 * 60 * 24) : 0; // dias

    return stats;
  }, [tasks]);

  // Tarefas filtradas
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    // Filtro por status
    if (filters.status !== 'all') {
      filtered = filtered.filter(task => task.status === filters.status);
    }

    // Filtro por prioridade
    if (filters.priority !== 'all') {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Filtro por tipo
    if (filters.type !== 'all') {
      filtered = filtered.filter(task => task.type === filters.type);
    }

    // Filtro por associação
    if (filters.associatedTo !== 'all') {
      filtered = filtered.filter(task => task.associatedTo === filters.associatedTo);
    }

    // Filtro por termo de pesquisa
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(task => 
        task.title?.toLowerCase().includes(term) ||
        task.description?.toLowerCase().includes(term) ||
        task.associatedName?.toLowerCase().includes(term)
      );
    }

    // Filtro por tarefas em atraso
    if (filters.overdue) {
      const now = new Date();
      filtered = filtered.filter(task => 
        task.dueDate && 
        task.dueDate < now && 
        task.status !== TASK_STATUS.COMPLETA
      );
    }

    // Filtro por faixa de data
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(task => 
            task.dueDate && 
            task.dueDate >= today && 
            task.dueDate < new Date(today.getTime() + 24 * 60 * 60 * 1000)
          );
          break;
        case 'tomorrow':
          const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
          filtered = filtered.filter(task => 
            task.dueDate && 
            task.dueDate >= tomorrow && 
            task.dueDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
          );
          break;
        case 'week':
          const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(task => 
            task.dueDate && 
            task.dueDate >= today && 
            task.dueDate <= weekEnd
          );
          break;
        case 'overdue':
          filtered = filtered.filter(task => 
            task.dueDate && 
            task.dueDate < now && 
            task.status !== TASK_STATUS.COMPLETA
          );
          break;
      }
    }

    return filtered;
  }, [tasks, filters]);

  // Funções de utilidade
  const isOverdue = (task) => {
    return task.dueDate && task.dueDate < new Date() && task.status !== TASK_STATUS.COMPLETA;
  };

  const isDueToday = (task) => {
    if (!task.dueDate) return false;
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return taskDate.toDateString() === today.toDateString();
  };

  const getDaysUntilDue = (task) => {
    if (!task.dueDate) return null;
    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const formatTaskDate = (date) => {
    if (!date) return '---';
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return {
    // Estados
    tasks: filteredTasks,
    allTasks: tasks,
    loading,
    error,
    creating,
    updating,
    deleting,

    // Ações CRUD
    createTask,
    updateTask,
    completeTask,
    deleteTask,

    // Ações específicas
    createFromTemplate,
    createReminder,

    // Estatísticas e utilidades
    getTaskStats,
    isOverdue,
    isDueToday,
    getDaysUntilDue,
    formatTaskDate,

    // Constantes
    TASK_STATUS,
    TASK_PRIORITY,
    TASK_TYPES,
    TASK_ASSOCIATIONS,
    TASK_STATUS_COLORS,
    PRIORITY_COLORS,
    TASK_TEMPLATES,

    // Filtros
    filters,
    setFilters
  };
};

export default useTasks;