// src/hooks/useTasks.js
// 🎯 HOOK UNIFICADO PARA SISTEMA DE TAREFAS - MyImoMate 3.0 MULTI-TENANT
// =====================================================================
// VERSÃO ATUALIZADA: Multi-tenant + Todas as funcionalidades existentes preservadas
// Funcionalidades: CRUD, Lembretes, Templates, Associações, Analytics, Follow-ups automáticos
// Data: Agosto 2025 | Versão: 3.1 Multi-Tenant

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  serverTimestamp,
  getDoc,
  doc,
  updateDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

// 🏗️ IMPORTS DO SISTEMA MULTI-TENANT
import firebaseService, { 
  SUBCOLLECTIONS, 
  createCRUDHelpers,
  useFirebaseService 
} from '../utils/FirebaseService';

// 🎯 CONFIGURAÇÕES DO HOOK MULTI-TENANT
const TASKS_SUBCOLLECTION = SUBCOLLECTIONS.TASKS;
const CLIENTS_SUBCOLLECTION = SUBCOLLECTIONS.CLIENTS;
const LEADS_SUBCOLLECTION = SUBCOLLECTIONS.LEADS;
const OPPORTUNITIES_SUBCOLLECTION = SUBCOLLECTIONS.OPPORTUNITIES;
const DEALS_SUBCOLLECTION = SUBCOLLECTIONS.DEALS;
const VISITS_SUBCOLLECTION = SUBCOLLECTIONS.VISITS;
const crudHelpers = createCRUDHelpers(TASKS_SUBCOLLECTION);

// 🎯 HOOK PRINCIPAL MULTI-TENANT
const useTasks = () => {
  // 🔐 AUTENTICAÇÃO E INICIALIZAÇÃO MULTI-TENANT
  const { currentUser: user, userProfile } = useAuth();
  const fbService = useFirebaseService(user);
  
  // 📊 STATES PRINCIPAIS
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 🔍 STATES DE FILTROS E PESQUISA
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

  // 🔐 VERIFICAR SE UTILIZADOR ESTÁ PRONTO
  const isUserReady = user && user.uid && fbService;

  // 🎯 CONSTANTES DO SISTEMA DE TAREFAS
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

  // 🎨 CORES DOS STATUS PARA UI
  const TASK_STATUS_COLORS = {
    [TASK_STATUS.PENDENTE]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    [TASK_STATUS.EM_PROGRESSO]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    [TASK_STATUS.AGUARDANDO]: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    [TASK_STATUS.COMPLETA]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    [TASK_STATUS.CANCELADA]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    [TASK_STATUS.ADIADA]: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
  };

  const PRIORITY_COLORS = {
    [TASK_PRIORITY.BAIXA]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    [TASK_PRIORITY.MEDIA]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    [TASK_PRIORITY.ALTA]: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    [TASK_PRIORITY.URGENTE]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    [TASK_PRIORITY.CRITICA]: { bg: 'bg-red-200', text: 'text-red-900', border: 'border-red-300' }
  };

  // 📥 BUSCAR TODAS AS TAREFAS (MULTI-TENANT)
  const fetchTasks = useCallback(async () => {
    if (!isUserReady) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Buscando tarefas multi-tenant...');

      // Construir query multi-tenant
      const queryOptions = {
        orderBy: [{ field: 'dueDate', direction: 'asc' }],
        limitCount: 200
      };

      // Aplicar filtros específicos
      if (filters.status && filters.status !== 'all') {
        queryOptions.where = queryOptions.where || [];
        queryOptions.where.push({ field: 'status', operator: '==', value: filters.status });
      }

      if (filters.priority && filters.priority !== 'all') {
        queryOptions.where = queryOptions.where || [];
        queryOptions.where.push({ field: 'priority', operator: '==', value: filters.priority });
      }

      if (filters.type && filters.type !== 'all') {
        queryOptions.where = queryOptions.where || [];
        queryOptions.where.push({ field: 'type', operator: '==', value: filters.type });
      }

      if (filters.associatedTo && filters.associatedTo !== 'all') {
        queryOptions.where = queryOptions.where || [];
        queryOptions.where.push({ field: 'associatedTo', operator: '==', value: filters.associatedTo });
      }

      // Executar query usando FirebaseService
      const result = await fbService.readDocuments(TASKS_SUBCOLLECTION, queryOptions);
      
      let fetchedTasks = result.data || [];

      // Aplicar migração automática se necessário
      fetchedTasks = fetchedTasks.map(task => {
        const migratedData = migrateTaskData(task);
        return {
          id: task.id,
          ...migratedData,
          dueDate: task.dueDate?.toDate?.() || task.dueDate,
          createdAt: task.createdAt?.toDate?.() || task.createdAt,
          updatedAt: task.updatedAt?.toDate?.() || task.updatedAt,
          completedAt: task.completedAt?.toDate?.() || task.completedAt,
          reminderDate: task.reminderDate?.toDate?.() || task.reminderDate
        };
      });

      // Aplicar filtros client-side adicionais
      if (filters.overdue) {
        const now = new Date();
        fetchedTasks = fetchedTasks.filter(task => 
          task.dueDate && new Date(task.dueDate) < now && task.status !== TASK_STATUS.COMPLETA
        );
      }

      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        fetchedTasks = fetchedTasks.filter(task => {
          const taskDate = task.dueDate;
          if (!taskDate) return false;

          switch (filters.dateRange) {
            case 'today':
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);
              return taskDate >= today && taskDate < tomorrow;
            case 'week':
              const weekEnd = new Date(now);
              weekEnd.setDate(now.getDate() + 7);
              return taskDate >= now && taskDate <= weekEnd;
            case 'month':
              const monthEnd = new Date(now);
              monthEnd.setMonth(now.getMonth() + 1);
              return taskDate >= now && taskDate <= monthEnd;
            case 'overdue':
              return taskDate < now && task.status !== TASK_STATUS.COMPLETA;
            default:
              return true;
          }
        });
      }

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        fetchedTasks = fetchedTasks.filter(task => 
          task.title?.toLowerCase().includes(term) ||
          task.description?.toLowerCase().includes(term) ||
          task.associatedName?.toLowerCase().includes(term)
        );
      }

      setTasks(fetchedTasks);
      console.log(`✅ ${fetchedTasks.length} tarefas carregadas (multi-tenant)`);
      
    } catch (err) {
      console.error('❌ Erro ao buscar tarefas:', err);
      setError(`Erro ao carregar tarefas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [isUserReady, fbService, filters]);

  // 🔄 MIGRAÇÃO AUTOMÁTICA DE DADOS ANTIGOS
  const migrateTaskData = useCallback((oldData) => {
    // Se já tem estrutura nova, retornar como está
    if (oldData.structureVersion === '3.1') {
      return oldData;
    }

    // Mapear campos antigos para novos
    const migrated = {
      ...oldData,
      
      // Garantir estrutura base obrigatória
      status: oldData.status || TASK_STATUS.PENDENTE,
      priority: oldData.priority || TASK_PRIORITY.MEDIA,
      type: oldData.type || TASK_TYPES.FOLLOW_UP,
      
      // Garantir campos obrigatórios
      title: oldData.title || 'Tarefa sem título',
      description: oldData.description || '',
      
      // Associações
      associatedTo: oldData.associatedTo || TASK_ASSOCIATIONS.GERAL,
      associatedId: oldData.associatedId || null,
      associatedName: oldData.associatedName || '',
      
      // Datas
      dueDate: oldData.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
      
      // Lembretes e estimativas
      reminderDate: oldData.reminderDate || null,
      estimatedDuration: oldData.estimatedDuration || 30,
      
      // Adicionar campos novos
      structureVersion: '3.1',
      isMultiTenant: true,
      migratedAt: new Date().toISOString(),
      
      // Controlo e auditoria
      isRecurring: oldData.isRecurring || false,
      recurringFrequency: oldData.recurringFrequency || null,
      completionNotes: oldData.completionNotes || '',
      
      // Assignação
      assignedTo: oldData.assignedTo || oldData.userId,
      assignedBy: oldData.assignedBy || oldData.userId
    };

    return migrated;
  }, []);

  // ➕ CRIAR NOVA TAREFA (MULTI-TENANT)
  const createTask = useCallback(async (taskData) => {
    if (!isUserReady) {
      throw new Error('Utilizador não autenticado');
    }

    setCreating(true);
    setError(null);

    try {
      console.log('➕ Criando nova tarefa multi-tenant...');

      // 1. VALIDAÇÃO BÁSICA
      if (!taskData.title?.trim()) {
        throw new Error('Título da tarefa é obrigatório');
      }

      if (!taskData.dueDate) {
        throw new Error('Data de conclusão é obrigatória');
      }

      // 2. CRIAR OBJETO DA TAREFA COM ESTRUTURA COMPLETA
      const newTask = {
        // Dados básicos
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        
        // Status e prioridade
        status: taskData.status || TASK_STATUS.PENDENTE,
        priority: taskData.priority || TASK_PRIORITY.MEDIA,
        type: taskData.type || TASK_TYPES.FOLLOW_UP,
        
        // Datas
        dueDate: taskData.dueDate,
        reminderDate: taskData.reminderDate || null,
        estimatedDuration: taskData.estimatedDuration || 30,
        
        // Associações
        associatedTo: taskData.associatedTo || TASK_ASSOCIATIONS.GERAL,
        associatedId: taskData.associatedId || null,
        associatedName: taskData.associatedName || '',
        
        // Assignação
        assignedTo: taskData.assignedTo || user.uid,
        assignedBy: user.uid,
        
        // Recorrência
        isRecurring: taskData.isRecurring || false,
        recurringFrequency: taskData.recurringFrequency || null,
        
        // Notas e observações
        notes: taskData.notes?.trim() || '',
        tags: taskData.tags || [],
        
        // Dados de auditoria obrigatórios MULTI-TENANT
        userId: user.uid,
        userEmail: user.email,
        createdBy: user.uid,
        createdByName: userProfile?.displayName || user.displayName || 'Consultor',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Flags de controlo
        isActive: true,
        isCompleted: false,
        
        // Versão da estrutura
        structureVersion: '3.1',
        isMultiTenant: true,
        
        // Metadados técnicos
        userAgent: navigator.userAgent,
        source_details: {
          created_via: 'web_form',
          form_version: '3.1',
          timestamp: new Date().toISOString()
        }
      };

      // 3. CRIAR USANDO FIREBASESERVICE
      const createdTask = await fbService.createDocument(TASKS_SUBCOLLECTION, newTask);
      
      // 4. CRIAR LEMBRETE SE SOLICITADO
      if (taskData.reminderDate) {
        await createReminder(createdTask.id, taskData.reminderDate);
      }
      
      // 5. ATUALIZAR LISTA LOCAL
      setTasks(prev => [createdTask, ...prev]);

      console.log('✅ Tarefa criada com sucesso:', createdTask.id);
      
      return {
        success: true,
        task: createdTask,
        message: 'Tarefa criada com sucesso!'
      };

    } catch (err) {
      console.error('❌ Erro ao criar tarefa:', err);
      setError(err.message);
      
      return {
        success: false,
        error: err.message,
        message: `Erro ao criar tarefa: ${err.message}`
      };
    } finally {
      setCreating(false);
    }
  }, [isUserReady, fbService, user, userProfile]);

  // ✏️ ATUALIZAR TAREFA (MULTI-TENANT)
  const updateTask = useCallback(async (taskId, updateData) => {
    if (!isUserReady || !taskId) {
      return { success: false, error: 'Dados inválidos para atualização' };
    }

    setUpdating(true);
    setError(null);

    try {
      console.log('✏️ Atualizando tarefa:', taskId);

      // Preparar dados para atualização
      const updates = {
        ...updateData,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid,
        structureVersion: '3.1'
      };

      // Se atualizando data de lembrete, converter para timestamp
      if (updates.reminderDate && updates.reminderDate instanceof Date) {
        updates.reminderDate = updates.reminderDate;
      }

      // Atualizar usando FirebaseService
      await fbService.updateDocument(TASKS_SUBCOLLECTION, taskId, updates);
      
      // Atualizar lista local
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, id: taskId }
          : task
      ));

      console.log('✅ Tarefa atualizada com sucesso');
      setUpdating(false);
      
      return { success: true, message: 'Tarefa atualizada com sucesso!' };

    } catch (err) {
      console.error('❌ Erro ao atualizar tarefa:', err);
      setError(err.message);
      setUpdating(false);
      return { success: false, error: err.message };
    }
  }, [isUserReady, fbService, user]);

  // ✅ MARCAR TAREFA COMO COMPLETA (MULTI-TENANT)
  const completeTask = useCallback(async (taskId, notes = '') => {
    if (!isUserReady || !taskId) {
      setError('Dados inválidos');
      return false;
    }

    try {
      console.log('✅ Completando tarefa:', taskId);

      const updates = {
        status: TASK_STATUS.COMPLETA,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid,
        isCompleted: true
      };

      if (notes.trim()) {
        updates.completionNotes = notes;
      }

      // Atualizar usando FirebaseService
      await fbService.updateDocument(TASKS_SUBCOLLECTION, taskId, updates);
      
      // Atualizar lista local
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, id: taskId }
          : task
      ));

      console.log('✅ Tarefa completada com sucesso');
      return { success: true, message: 'Tarefa completada com sucesso!' };

    } catch (err) {
      console.error('❌ Erro ao completar tarefa:', err);
      setError('Erro ao completar tarefa');
      return { success: false, error: err.message };
    }
  }, [isUserReady, fbService, user]);

  // 🗑️ ELIMINAR TAREFA (MULTI-TENANT)
  const deleteTask = useCallback(async (taskId) => {
    if (!isUserReady || !taskId) {
      setError('Dados inválidos para exclusão');
      return false;
    }

    setDeleting(true);
    setError(null);

    try {
      console.log('🗑️ Eliminando tarefa:', taskId);

      // Eliminar usando FirebaseService
      await fbService.deleteDocument(TASKS_SUBCOLLECTION, taskId);
      
      // Remover da lista local
      setTasks(prev => prev.filter(task => task.id !== taskId));

      console.log('✅ Tarefa eliminada com sucesso');
      setDeleting(false);
      
      return { success: true, message: 'Tarefa eliminada com sucesso!' };

    } catch (err) {
      console.error('❌ Erro ao eliminar tarefa:', err);
      setError('Erro ao eliminar tarefa');
      setDeleting(false);
      return { success: false, error: err.message };
    }
  }, [isUserReady, fbService]);

  // 🔔 CRIAR LEMBRETE (MULTI-TENANT)
  const createReminder = useCallback(async (taskId, reminderDate) => {
    if (!isUserReady || !taskId) return false;

    try {
      console.log('🔔 Criando lembrete para tarefa:', taskId);

      const reminderData = {
        taskId,
        userId: user.uid,
        reminderDate: reminderDate,
        sent: false,
        type: 'task_reminder',
        createdAt: serverTimestamp(),
        structureVersion: '3.1'
      };

      // Usar subcoleção de lembretes
      await fbService.createDocument('reminders', reminderData);
      
      console.log('✅ Lembrete criado com sucesso');
      return { success: true };

    } catch (err) {
      console.error('❌ Erro ao criar lembrete:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, fbService, user]);

  // 📋 CRIAR TAREFA A PARTIR DE TEMPLATE (MULTI-TENANT)
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

  // 🎯 TEMPLATES DE TAREFAS COMUNS
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
    },
    REUNIAO_CLIENTE: {
      title: 'Reunião com cliente',
      description: 'Reunião presencial ou virtual com cliente',
      type: TASK_TYPES.REUNIAO,
      priority: TASK_PRIORITY.ALTA,
      estimatedDuration: 45
    },
    PESQUISA_IMOVEIS: {
      title: 'Pesquisar imóveis',
      description: 'Pesquisar imóveis que correspondam ao perfil do cliente',
      type: TASK_TYPES.PESQUISA,
      priority: TASK_PRIORITY.MEDIA,
      estimatedDuration: 30
    }
  };

  // 📊 ESTATÍSTICAS DAS TAREFAS (MULTI-TENANT)
  const getTaskStats = useMemo(() => {
    if (!tasks.length) {
      return {
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
        dueToday: 0,
        completionRate: 0,
        averageDuration: 0,
        byStatus: {},
        byPriority: {},
        byType: {},
        byAssociation: {}
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const stats = {
      total: tasks.length,
      completed: 0,
      pending: 0,
      overdue: 0,
      dueToday: 0,
      completionRate: 0,
      averageDuration: 0,
      byStatus: {},
      byPriority: {},
      byType: {},
      byAssociation: {}
    };

    let totalDuration = 0;
    
    // Inicializar contadores
    Object.values(TASK_STATUS).forEach(status => {
      stats.byStatus[status] = 0;
    });
    
    Object.values(TASK_PRIORITY).forEach(priority => {
      stats.byPriority[priority] = 0;
    });
    
    Object.values(TASK_TYPES).forEach(type => {
      stats.byType[type] = 0;
    });
    
    Object.values(TASK_ASSOCIATIONS).forEach(assoc => {
      stats.byAssociation[assoc] = 0;
    });

    // Calcular estatísticas
    tasks.forEach(task => {
      // Por status
      if (task.status) {
        stats.byStatus[task.status]++;
      }
      
      // Por prioridade
      if (task.priority) {
        stats.byPriority[task.priority]++;
      }
      
      // Por tipo
      if (task.type) {
        stats.byType[task.type]++;
      }
      
      // Por associação
      if (task.associatedTo) {
        stats.byAssociation[task.associatedTo]++;
      }

      // Contadores específicos
      if (task.status === TASK_STATUS.COMPLETA) {
        stats.completed++;
      } else {
        stats.pending++;
      }

      // Tarefas em atraso
      if (task.dueDate && new Date(task.dueDate) < now && task.status !== TASK_STATUS.COMPLETA) {
        stats.overdue++;
      }

      // Tarefas devido hoje
      if (task.dueDate) {
        const taskDate = new Date(task.dueDate);
        if (taskDate >= today && taskDate < tomorrow) {
          stats.dueToday++;
        }
      }

      // Duração média
      if (task.estimatedDuration) {
        totalDuration += task.estimatedDuration;
      }
    });

    // Calcular médias
    stats.completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    stats.averageDuration = stats.total > 0 ? Math.round(totalDuration / stats.total) : 0;

    return stats;
  }, [tasks]);

  // 🔧 FUNÇÕES AUXILIARES
  const isOverdue = (task) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== TASK_STATUS.COMPLETA;
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

  // 🔄 CARREGAR DADOS INICIAIS
  useEffect(() => {
    if (isUserReady) {
      console.log('🔄 Carregando tarefas iniciais...');
      fetchTasks();
    }
  }, [isUserReady, fetchTasks]);

  // 🔄 RECARREGAR QUANDO FILTROS MUDAM
  useEffect(() => {
    if (isUserReady) {
      console.log('🔍 Aplicando filtros...');
      fetchTasks();
    }
  }, [filters.status, filters.priority, filters.type, filters.associatedTo, filters.dateRange, filters.overdue]);

  // 🔄 LIMPAR ERROS AUTOMATICAMENTE
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 📤 RETORNO DO HOOK MULTI-TENANT COMPLETO
  return {
    // Estados principais
    tasks: tasks,
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
    setFilters,

    // Estado de conectividade
    isConnected: isUserReady && !error,
    isUserReady,

    // Informações da versão
    version: '3.1',
    isMultiTenant: true,
    structureVersion: '3.1-multi-tenant'
  };
};

export default useTasks;