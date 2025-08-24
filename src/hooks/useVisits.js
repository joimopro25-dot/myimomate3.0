// src/hooks/useVisits.js
// 🎯 HOOK UNIFICADO PARA GESTÃO DE VISITAS - MyImoMate 3.0 MULTI-TENANT
// =====================================================================
// VERSÃO ATUALIZADA: Multi-tenant + Todas as funcionalidades existentes preservadas
// Funcionalidades: Agendamento, Confirmações, Feedback, Partilhas, Controlo Temporal
// Data: Agosto 2025 | Versão: 3.1 Multi-Tenant

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  serverTimestamp,
  getDoc,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

// 🏗️ IMPORTS DO SISTEMA MULTI-TENANT
import firebaseService, { 
  SUBCOLLECTIONS, 
  createCRUDHelpers,
  useFirebaseService 
} from '../utils/FirebaseService';

// 📚 IMPORTS DA ESTRUTURA UNIFICADA
import {
  UNIFIED_VISIT_STATUS,
  UNIFIED_PRIORITIES,
  UNIFIED_PROPERTY_TYPES,
  UNIFIED_INTEREST_TYPES,
  formatCurrency
} from '../constants/unifiedTypes.js';

import {
  CORE_DATA_STRUCTURE,
  PROPERTY_DATA_STRUCTURE,
  applyCoreStructure,
  validateCoreStructure
} from '../constants/coreStructure.js';

import {
  validatePortuguesePhone,
  validateEmail,
  validatePostalCode
} from '../constants/validations.js';

// 🎯 CONFIGURAÇÕES DO HOOK MULTI-TENANT
const VISITS_SUBCOLLECTION = SUBCOLLECTIONS.VISITS;
const CLIENTS_SUBCOLLECTION = SUBCOLLECTIONS.CLIENTS;
const OPPORTUNITIES_SUBCOLLECTION = SUBCOLLECTIONS.OPPORTUNITIES;
const crudHelpers = createCRUDHelpers(VISITS_SUBCOLLECTION);
const FETCH_LIMIT = 100;

// 🎯 TIPOS DE VISITA ESPECÍFICOS
export const VISIT_TYPES = {
  PRESENCIAL: 'presencial',
  VIRTUAL: 'virtual',
  AVALIACAO: 'avaliacao',
  APRESENTACAO: 'apresentacao',
  SEGUNDA_VISITA: 'segunda_visita',
  VISITA_TECNICA: 'visita_tecnica'
};

export const VISIT_TYPE_LABELS = {
  [VISIT_TYPES.PRESENCIAL]: 'Presencial',
  [VISIT_TYPES.VIRTUAL]: 'Virtual',
  [VISIT_TYPES.AVALIACAO]: 'Avaliação',
  [VISIT_TYPES.APRESENTACAO]: 'Apresentação',
  [VISIT_TYPES.SEGUNDA_VISITA]: 'Segunda Visita',
  [VISIT_TYPES.VISITA_TECNICA]: 'Visita Técnica'
};

// 🏠 TIPOS DE OPERAÇÃO IMOBILIÁRIA
export const OPERATION_TYPES = {
  VENDA: 'venda',
  COMPRA: 'compra',
  ARRENDAMENTO: 'arrendamento',
  ALUGUER: 'aluguer',
  AVALIACAO: 'avaliacao',
  CONSULTORIA: 'consultoria'
};

export const OPERATION_TYPE_LABELS = {
  [OPERATION_TYPES.VENDA]: 'Venda',
  [OPERATION_TYPES.COMPRA]: 'Compra',
  [OPERATION_TYPES.ARRENDAMENTO]: 'Arrendamento',
  [OPERATION_TYPES.ALUGUER]: 'Aluguer',
  [OPERATION_TYPES.AVALIACAO]: 'Avaliação',
  [OPERATION_TYPES.CONSULTORIA]: 'Consultoria'
};

// 📊 RESULTADOS DE VISITA
export const VISIT_OUTCOMES = {
  PENDENTE: 'pendente',
  MUITO_INTERESSADO: 'muito_interessado',
  INTERESSADO: 'interessado',
  POUCO_INTERESSADO: 'pouco_interessado',
  NAO_INTERESSADO: 'nao_interessado',
  PRECISA_PENSAR: 'precisa_pensar',
  QUER_SEGUNDA_VISITA: 'quer_segunda_visita',
  PROPOSTA_FEITA: 'proposta_feita'
};

export const VISIT_OUTCOME_LABELS = {
  [VISIT_OUTCOMES.PENDENTE]: 'Pendente',
  [VISIT_OUTCOMES.MUITO_INTERESSADO]: 'Muito Interessado',
  [VISIT_OUTCOMES.INTERESSADO]: 'Interessado',
  [VISIT_OUTCOMES.POUCO_INTERESSADO]: 'Pouco Interessado',
  [VISIT_OUTCOMES.NAO_INTERESSADO]: 'Não Interessado',
  [VISIT_OUTCOMES.PRECISA_PENSAR]: 'Precisa Pensar',
  [VISIT_OUTCOMES.QUER_SEGUNDA_VISITA]: 'Quer Segunda Visita',
  [VISIT_OUTCOMES.PROPOSTA_FEITA]: 'Proposta Feita'
};

// 🎨 CORES PARA STATUS
export const VISIT_STATUS_COLORS = {
  [UNIFIED_VISIT_STATUS.AGENDADA]: 'bg-blue-100 text-blue-800 border-blue-200',
  [UNIFIED_VISIT_STATUS.CONFIRMADA_CLIENTE]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [UNIFIED_VISIT_STATUS.CONFIRMADA_CONSULTOR]: 'bg-orange-100 text-orange-800 border-orange-200',
  [UNIFIED_VISIT_STATUS.CONFIRMADA_DUPLA]: 'bg-green-100 text-green-800 border-green-200',
  [UNIFIED_VISIT_STATUS.EM_CURSO]: 'bg-purple-100 text-purple-800 border-purple-200',
  [UNIFIED_VISIT_STATUS.REALIZADA]: 'bg-green-100 text-green-800 border-green-200',
  [UNIFIED_VISIT_STATUS.NAO_COMPARECEU_CLIENTE]: 'bg-red-100 text-red-800 border-red-200',
  [UNIFIED_VISIT_STATUS.NAO_COMPARECEU_CONSULTOR]: 'bg-red-100 text-red-800 border-red-200',
  [UNIFIED_VISIT_STATUS.CANCELADA]: 'bg-gray-100 text-gray-800 border-gray-200',
  [UNIFIED_VISIT_STATUS.REMARCADA]: 'bg-indigo-100 text-indigo-800 border-indigo-200'
};

// 🎯 HOOK PRINCIPAL MULTI-TENANT
const useVisits = () => {
  // 🔐 AUTENTICAÇÃO E INICIALIZAÇÃO MULTI-TENANT
  const { currentUser: user, userProfile } = useAuth();
  const fbService = useFirebaseService(user);
  
  // 📊 STATES PRINCIPAIS
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // 🔍 STATES DE FILTROS E PESQUISA
  const [filters, setFilters] = useState({
    status: '',
    visitType: '',
    operationType: '',
    propertyType: '',
    priority: '',
    outcome: '',
    clientName: '',
    dateRange: 'all',
    searchTerm: ''
  });

  // 🔐 VERIFICAR SE UTILIZADOR ESTÁ PRONTO
  const isUserReady = user && user.uid && fbService;

  // 📥 BUSCAR TODAS AS VISITAS COM ESTRUTURA UNIFICADA (MULTI-TENANT)
  const fetchVisits = useCallback(async () => {
    if (!isUserReady) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Buscando visitas multi-tenant...');

      // Construir query multi-tenant
      const queryOptions = {
        orderBy: [{ field: 'scheduledDate', direction: 'desc' }],
        limit: FETCH_LIMIT
      };

      // Aplicar filtros específicos
      if (filters.status) {
        queryOptions.where = queryOptions.where || [];
        queryOptions.where.push({ field: 'status', operator: '==', value: filters.status });
      }

      if (filters.visitType) {
        queryOptions.where = queryOptions.where || [];
        queryOptions.where.push({ field: 'visitType', operator: '==', value: filters.visitType });
      }

      if (filters.operationType) {
        queryOptions.where = queryOptions.where || [];
        queryOptions.where.push({ field: 'operationType', operator: '==', value: filters.operationType });
      }

      // Executar query usando FirebaseService
      const result = await fbService.getDocuments(VISITS_SUBCOLLECTION, queryOptions);
      
      let fetchedVisits = result.docs || [];

      // Aplicar migração automática se necessário
      fetchedVisits = fetchedVisits.map(visit => {
        const migratedData = migrateVisitData(visit);
        return {
          id: visit.id,
          ...migratedData,
          scheduledDate: visit.scheduledDate?.toDate?.() || visit.scheduledDate,
          createdAt: visit.createdAt?.toDate?.() || visit.createdAt,
          updatedAt: visit.updatedAt?.toDate?.() || visit.updatedAt,
          confirmedAt: visit.confirmedAt?.toDate?.() || visit.confirmedAt,
          completedAt: visit.completedAt?.toDate?.() || visit.completedAt
        };
      });

      // Filtrar inativos
      fetchedVisits = fetchedVisits.filter(visit => visit.isActive !== false);

      // Aplicar filtros client-side adicionais
      if (filters.priority && Object.values(UNIFIED_PRIORITIES).includes(filters.priority)) {
        fetchedVisits = fetchedVisits.filter(visit => visit.priority === filters.priority);
      }

      if (filters.outcome) {
        fetchedVisits = fetchedVisits.filter(visit => visit.outcome === filters.outcome);
      }

      if (filters.clientName) {
        const term = filters.clientName.toLowerCase();
        fetchedVisits = fetchedVisits.filter(visit => 
          visit.clientName?.toLowerCase().includes(term)
        );
      }

      // Filtro por período
      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        fetchedVisits = fetchedVisits.filter(visit => {
          const visitDate = visit.scheduledDate;
          if (!visitDate) return false;

          switch (filters.dateRange) {
            case 'today':
              const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
              const tomorrow = new Date(today);
              tomorrow.setDate(today.getDate() + 1);
              return visitDate >= today && visitDate < tomorrow;
            case 'week':
              const weekStart = new Date(now);
              weekStart.setDate(now.getDate() - now.getDay());
              weekStart.setHours(0, 0, 0, 0);
              const weekEnd = new Date(weekStart);
              weekEnd.setDate(weekStart.getDate() + 7);
              return visitDate >= weekStart && visitDate < weekEnd;
            case 'month':
              const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
              const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
              return visitDate >= monthStart && visitDate < monthEnd;
            case 'upcoming':
              return visitDate >= now;
            case 'past':
              return visitDate < now;
            default:
              return true;
          }
        });
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        fetchedVisits = fetchedVisits.filter(visit => 
          visit.clientName?.toLowerCase().includes(term) ||
          visit.property?.address?.street?.toLowerCase().includes(term) ||
          visit.property?.address?.city?.toLowerCase().includes(term) ||
          visit.property?.description?.toLowerCase().includes(term)
        );
      }

      setVisits(fetchedVisits);
      console.log(`✅ ${fetchedVisits.length} visitas carregadas (multi-tenant)`);
      
    } catch (err) {
      console.error('❌ Erro ao buscar visitas:', err);
      setError(`Erro ao carregar visitas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [isUserReady, fbService, filters]);

  // 🔄 MIGRAÇÃO AUTOMÁTICA DE DADOS ANTIGOS
  const migrateVisitData = useCallback((oldData) => {
    // Se já tem estrutura nova, retornar como está
    if (oldData.structureVersion === '3.1') {
      return oldData;
    }

    // Mapear campos antigos para novos
    const migrated = {
      ...oldData,
      
      // Garantir estrutura base obrigatória
      isActive: oldData.isActive !== undefined ? oldData.isActive : true,
      priority: oldData.priority || UNIFIED_PRIORITIES.NORMAL,
      
      // Migrar status de visita
      status: migrateVisitStatus(oldData.status),
      
      // Garantir campos obrigatórios
      clientName: oldData.clientName || 'Cliente não identificado',
      scheduledDate: oldData.scheduledDate || oldData.date || new Date(),
      
      // Estrutura de propriedade padronizada
      property: {
        address: {
          street: oldData.property?.address?.street || oldData.address || '',
          postalCode: oldData.property?.address?.postalCode || '',
          city: oldData.property?.address?.city || '',
          district: oldData.property?.address?.district || ''
        },
        type: oldData.property?.type || oldData.propertyType || '',
        description: oldData.property?.description || '',
        price: oldData.property?.price || oldData.price || 0,
        features: oldData.property?.features || {}
      },
      
      // Dados do cliente estruturados
      client: {
        id: oldData.clientId || null,
        name: oldData.clientName || '',
        phone: oldData.clientPhone || '',
        email: oldData.clientEmail || '',
        notes: oldData.clientNotes || ''
      },
      
      // Confirmações
      confirmations: {
        client: oldData.confirmations?.client || false,
        consultant: oldData.confirmations?.consultant || false,
        clientConfirmedAt: oldData.confirmations?.clientConfirmedAt || null,
        consultantConfirmedAt: oldData.confirmations?.consultantConfirmedAt || null
      },
      
      // Resultado e feedback
      outcome: oldData.outcome || VISIT_OUTCOMES.PENDENTE,
      feedback: {
        clientRating: oldData.feedback?.clientRating || null,
        clientComments: oldData.feedback?.clientComments || '',
        consultantNotes: oldData.feedback?.consultantNotes || '',
        nextSteps: oldData.feedback?.nextSteps || '',
        followUpDate: oldData.feedback?.followUpDate || null
      },
      
      // Adicionar campos novos
      structureVersion: '3.1',
      isMultiTenant: true,
      migratedAt: new Date().toISOString(),
      
      // Garantir referências cruzadas
      clientId: oldData.clientId || null,
      opportunityId: oldData.opportunityId || null,
      dealId: oldData.dealId || null,
      
      // Tipo de visita e operação
      visitType: oldData.visitType || VISIT_TYPES.PRESENCIAL,
      operationType: oldData.operationType || OPERATION_TYPES.VENDA
    };

    return migrated;
  }, []);

  // 🔄 FUNÇÕES DE MIGRAÇÃO ESPECÍFICAS
  const migrateVisitStatus = (oldStatus) => {
    const statusMap = {
      'agendada': UNIFIED_VISIT_STATUS.AGENDADA,
      'confirmada_cliente': UNIFIED_VISIT_STATUS.CONFIRMADA_CLIENTE,
      'confirmada_consultor': UNIFIED_VISIT_STATUS.CONFIRMADA_CONSULTOR,
      'confirmada_dupla': UNIFIED_VISIT_STATUS.CONFIRMADA_DUPLA,
      'em_curso': UNIFIED_VISIT_STATUS.EM_CURSO,
      'realizada': UNIFIED_VISIT_STATUS.REALIZADA,
      'nao_compareceu_cliente': UNIFIED_VISIT_STATUS.NAO_COMPARECEU_CLIENTE,
      'nao_compareceu_consultor': UNIFIED_VISIT_STATUS.NAO_COMPARECEU_CONSULTOR,
      'cancelada': UNIFIED_VISIT_STATUS.CANCELADA,
      'remarcada': UNIFIED_VISIT_STATUS.REMARCADA
    };
    return statusMap[oldStatus] || UNIFIED_VISIT_STATUS.AGENDADA;
  };

  // ➕ CRIAR NOVA VISITA (MULTI-TENANT)
  const createVisit = useCallback(async (visitData) => {
    if (!isUserReady) {
      throw new Error('Utilizador não autenticado');
    }

    setCreating(true);
    setError(null);

    try {
      console.log('➕ Criando nova visita multi-tenant...');

      // 1. VALIDAÇÃO BÁSICA
      if (!visitData.clientName?.trim()) {
        throw new Error('Nome do cliente é obrigatório');
      }
      
      if (!visitData.scheduledDate) {
        throw new Error('Data da visita é obrigatória');
      }

      if (!visitData.property?.address?.street?.trim()) {
        throw new Error('Endereço da propriedade é obrigatório');
      }

      // Validações específicas
      if (visitData.clientPhone && !validatePortuguesePhone(visitData.clientPhone)) {
        throw new Error('Número de telefone português inválido');
      }

      if (visitData.clientEmail && !validateEmail(visitData.clientEmail)) {
        throw new Error('Email inválido');
      }

      // 2. CRIAR OBJETO DA VISITA COM ESTRUTURA UNIFICADA
      const newVisit = {
        // Dados básicos da visita
        clientName: visitData.clientName.trim(),
        scheduledDate: visitData.scheduledDate,
        scheduledTime: visitData.scheduledTime || null,
        duration: visitData.duration || 60, // minutos
        
        // Dados da propriedade
        property: {
          address: {
            street: visitData.property.address.street.trim(),
            postalCode: visitData.property.address.postalCode?.trim() || '',
            city: visitData.property.address.city?.trim() || '',
            district: visitData.property.address.district?.trim() || '',
            coordinates: visitData.property.address.coordinates || null
          },
          type: visitData.property.type || '',
          description: visitData.property.description?.trim() || '',
          price: parseFloat(visitData.property.price) || 0,
          features: visitData.property.features || {}
        },
        
        // Dados do cliente
        client: {
          id: visitData.clientId || null,
          name: visitData.clientName.trim(),
          phone: visitData.clientPhone?.trim() || '',
          email: visitData.clientEmail?.trim() || '',
          notes: visitData.clientNotes?.trim() || ''
        },
        
        // Tipo e categoria
        visitType: visitData.visitType || VISIT_TYPES.PRESENCIAL,
        operationType: visitData.operationType || OPERATION_TYPES.VENDA,
        
        // Status e controlo
        status: visitData.status || UNIFIED_VISIT_STATUS.AGENDADA,
        priority: visitData.priority || UNIFIED_PRIORITIES.NORMAL,
        
        // Confirmações
        confirmations: {
          client: false,
          consultant: false,
          clientConfirmedAt: null,
          consultantConfirmedAt: null
        },
        
        // Resultado e feedback
        outcome: VISIT_OUTCOMES.PENDENTE,
        feedback: {
          clientRating: null,
          clientComments: '',
          consultantNotes: '',
          nextSteps: '',
          followUpDate: null
        },
        
        // Partilhas e colaboração
        sharedWith: visitData.sharedWith || [],
        isShared: visitData.sharedWith?.length > 0 || false,
        
        // Notas e observações
        notes: visitData.notes?.trim() || '',
        internalNotes: visitData.internalNotes?.trim() || '',
        
        // Dados de auditoria obrigatórios MULTI-TENANT
        userId: user.uid,
        userEmail: user.email,
        consultantId: user.uid,
        consultantName: userProfile?.displayName || user.displayName || 'Consultor',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Flags de controlo
        isActive: true,
        isCompleted: false,
        
        // Referências cruzadas
        clientId: visitData.clientId || null,
        opportunityId: visitData.opportunityId || null,
        dealId: visitData.dealId || null,
        
        // Fonte e rastreamento
        source: visitData.source || 'manual',
        
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
      const createdVisit = await fbService.createDocument(VISITS_SUBCOLLECTION, newVisit);
      
      // 4. ATUALIZAR LISTA LOCAL
      setVisits(prev => [createdVisit, ...prev]);

      console.log('✅ Visita criada com sucesso:', createdVisit.id);
      
      return {
        success: true,
        visit: createdVisit,
        message: 'Visita agendada com sucesso!'
      };

    } catch (err) {
      console.error('❌ Erro ao criar visita:', err);
      setError(err.message);
      
      return {
        success: false,
        error: err.message,
        message: `Erro ao agendar visita: ${err.message}`
      };
    } finally {
      setCreating(false);
    }
  }, [isUserReady, fbService, user, userProfile]);

  // ✅ CONFIRMAR VISITA (MULTI-TENANT)
  const confirmVisit = useCallback(async (visitId, confirmedBy = 'consultant', notes = '') => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    setConfirming(true);
    setError(null);
    
    try {
      console.log('✅ Confirmando visita:', visitId, 'por:', confirmedBy);

      const visit = visits.find(v => v.id === visitId);
      if (!visit) {
        throw new Error('Visita não encontrada');
      }

      // Preparar dados de confirmação
      const confirmationData = {
        [`confirmations.${confirmedBy}`]: true,
        [`confirmations.${confirmedBy}ConfirmedAt`]: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid
      };

      // Determinar novo status baseado nas confirmações
      const currentConfirmations = visit.confirmations || {};
      let newStatus = visit.status;

      if (confirmedBy === 'client') {
        if (currentConfirmations.consultant) {
          newStatus = UNIFIED_VISIT_STATUS.CONFIRMADA_DUPLA;
        } else {
          newStatus = UNIFIED_VISIT_STATUS.CONFIRMADA_CLIENTE;
        }
      } else if (confirmedBy === 'consultant') {
        if (currentConfirmations.client) {
          newStatus = UNIFIED_VISIT_STATUS.CONFIRMADA_DUPLA;
        } else {
          newStatus = UNIFIED_VISIT_STATUS.CONFIRMADA_CONSULTOR;
        }
      }

      confirmationData.status = newStatus;
      
      if (notes.trim()) {
        confirmationData[`confirmationNotes.${confirmedBy}`] = notes.trim();
      }

      // Atualizar usando FirebaseService
      await fbService.updateDocument(VISITS_SUBCOLLECTION, visitId, confirmationData);
      
      // Atualizar lista local
      setVisits(prev => prev.map(v => 
        v.id === visitId 
          ? { 
              ...v, 
              ...confirmationData, 
              confirmations: {
                ...v.confirmations,
                [confirmedBy]: true,
                [`${confirmedBy}ConfirmedAt`]: new Date()
              },
              status: newStatus,
              updatedAt: new Date()
            }
          : v
      ));

      console.log('✅ Visita confirmada com sucesso');
      
      return { 
        success: true, 
        message: `Visita confirmada por ${confirmedBy === 'client' ? 'cliente' : 'consultor'}!`,
        newStatus
      };
      
    } catch (err) {
      console.error('❌ Erro ao confirmar visita:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setConfirming(false);
    }
  }, [isUserReady, fbService, user, visits]);

  // 🔄 ATUALIZAR STATUS DA VISITA (MULTI-TENANT)
  const updateVisitStatus = useCallback(async (visitId, newStatus, additionalData = {}) => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    setUpdating(true);
    setError(null);
    
    try {
      console.log('📊 Atualizando status da visita:', visitId, newStatus);

      // Validar se o status é válido
      if (!Object.values(UNIFIED_VISIT_STATUS).includes(newStatus)) {
        throw new Error(`Status inválido: ${newStatus}`);
      }

      const updateData = {
        status: newStatus,
        ...additionalData,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid
      };

      // Lógica específica por status
      if (newStatus === UNIFIED_VISIT_STATUS.REALIZADA) {
        updateData.completedAt = serverTimestamp();
        updateData.isCompleted = true;
      }

      if (newStatus === UNIFIED_VISIT_STATUS.EM_CURSO) {
        updateData.startedAt = serverTimestamp();
      }

      // Atualizar usando FirebaseService
      await fbService.updateDocument(VISITS_SUBCOLLECTION, visitId, updateData);
      
      // Atualizar lista local
      setVisits(prev => prev.map(visit => 
        visit.id === visitId 
          ? { ...visit, ...updateData, id: visitId }
          : visit
      ));

      console.log('✅ Status da visita atualizado com sucesso');
      
      return { success: true, message: 'Status atualizado com sucesso!' };
      
    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, [isUserReady, fbService, user]);

  // 📝 ADICIONAR FEEDBACK À VISITA (MULTI-TENANT)
  const addVisitFeedback = useCallback(async (visitId, feedbackData) => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    try {
      console.log('📝 Adicionando feedback à visita:', visitId);

      const updateData = {
        outcome: feedbackData.outcome || VISIT_OUTCOMES.PENDENTE,
        feedback: {
          clientRating: feedbackData.clientRating || null,
          clientComments: feedbackData.clientComments?.trim() || '',
          consultantNotes: feedbackData.consultantNotes?.trim() || '',
          nextSteps: feedbackData.nextSteps?.trim() || '',
          followUpDate: feedbackData.followUpDate || null
        },
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid
      };

      // Se não estava realizada, marcar como realizada
      const visit = visits.find(v => v.id === visitId);
      if (visit && visit.status !== UNIFIED_VISIT_STATUS.REALIZADA) {
        updateData.status = UNIFIED_VISIT_STATUS.REALIZADA;
        updateData.completedAt = serverTimestamp();
        updateData.isCompleted = true;
      }

      // Atualizar usando FirebaseService
      await fbService.updateDocument(VISITS_SUBCOLLECTION, visitId, updateData);
      
      // Atualizar lista local
      setVisits(prev => prev.map(v => 
        v.id === visitId 
          ? { ...v, ...updateData, id: visitId }
          : v
      ));

      console.log('✅ Feedback adicionado com sucesso');
      
      return { success: true, message: 'Feedback registado com sucesso!' };
      
    } catch (err) {
      console.error('❌ Erro ao adicionar feedback:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, fbService, user, visits]);

  // 🔗 PARTILHAR VISITA COM OUTROS CONSULTORES (MULTI-TENANT)
  const shareVisit = useCallback(async (visitId, consultantIds, message = '') => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    try {
      console.log('🔗 Partilhando visita:', visitId, 'com:', consultantIds);

      if (!Array.isArray(consultantIds) || consultantIds.length === 0) {
        throw new Error('Lista de consultores é obrigatória');
      }

      const updateData = {
        sharedWith: consultantIds,
        isShared: true,
        shareMessage: message.trim(),
        sharedAt: serverTimestamp(),
        sharedBy: user.uid,
        updatedAt: serverTimestamp()
      };

      // Atualizar usando FirebaseService
      await fbService.updateDocument(VISITS_SUBCOLLECTION, visitId, updateData);
      
      // Atualizar lista local
      setVisits(prev => prev.map(v => 
        v.id === visitId 
          ? { ...v, ...updateData, id: visitId }
          : v
      ));

      console.log('✅ Visita partilhada com sucesso');
      
      return { 
        success: true, 
        message: `Visita partilhada com ${consultantIds.length} consultor(es)!` 
      };
      
    } catch (err) {
      console.error('❌ Erro ao partilhar visita:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, fbService, user]);

  // ❌ CANCELAR VISITA (MULTI-TENANT)
  const cancelVisit = useCallback(async (visitId, reason = '') => {
    return await updateVisitStatus(visitId, UNIFIED_VISIT_STATUS.CANCELADA, {
      cancellationReason: reason.trim(),
      cancelledAt: serverTimestamp(),
      cancelledBy: user.uid
    });
  }, [updateVisitStatus, user]);

  // 🗑️ ELIMINAR VISITA (SOFT DELETE MULTI-TENANT)
  const deleteVisit = useCallback(async (visitId, hardDelete = false) => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    try {
      console.log('🗑️ Eliminando visita:', visitId);

      if (hardDelete) {
        // Eliminação definitiva
        await fbService.deleteDocument(VISITS_SUBCOLLECTION, visitId);
        console.log(`Visita ${visitId} eliminada permanentemente`);
      } else {
        // Soft delete (recomendado)
        await fbService.updateDocument(VISITS_SUBCOLLECTION, visitId, {
          isActive: false,
          status: UNIFIED_VISIT_STATUS.CANCELADA,
          deletedAt: serverTimestamp(),
          deletedBy: user.uid,
          updatedAt: serverTimestamp()
        });
        console.log(`Visita ${visitId} marcada como inativa`);
      }
      
      // Remover da lista local
      setVisits(prev => prev.filter(v => v.id !== visitId));

      console.log('✅ Visita eliminada com sucesso');
      
      return { 
        success: true, 
        message: hardDelete ? 'Visita eliminada permanentemente!' : 'Visita removida da lista!' 
      };
      
    } catch (err) {
      console.error('❌ Erro ao eliminar visita:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, fbService, user]);

  // 🔍 PESQUISAR VISITAS
  const searchVisits = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  // 📊 ESTATÍSTICAS UNIFICADAS E AVANÇADAS (MULTI-TENANT)
  const visitStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const stats = {
      total: visits.length,
      today: 0,
      upcoming: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      conversionRate: 0,
      byStatus: {},
      byVisitType: {},
      byOutcome: {},
      byPropertyType: {}
    };

    if (visits.length === 0) return stats;

    // Contar por status unificado
    Object.values(UNIFIED_VISIT_STATUS).forEach(status => {
      stats.byStatus[status] = visits.filter(visit => visit.status === status).length;
    });

    // Contar por tipo de visita
    Object.values(VISIT_TYPES).forEach(type => {
      stats.byVisitType[type] = visits.filter(visit => visit.visitType === type).length;
    });

    // Contar por resultado
    Object.values(VISIT_OUTCOMES).forEach(outcome => {
      stats.byOutcome[outcome] = visits.filter(visit => visit.outcome === outcome).length;
    });

    // Contar por tipo de propriedade
    Object.values(UNIFIED_PROPERTY_TYPES).forEach(type => {
      stats.byPropertyType[type] = visits.filter(visit => visit.property?.type === type).length;
    });

    // Calcular métricas específicas
    visits.forEach(visit => {
      const visitDate = visit.scheduledDate;
      
      // Visitas de hoje
      if (visitDate && visitDate >= today && visitDate < tomorrow) {
        stats.today++;
      }
      
      // Visitas futuras
      if (visitDate && visitDate >= now) {
        stats.upcoming++;
      }
      
      // Visitas confirmadas
      if (visit.status === UNIFIED_VISIT_STATUS.CONFIRMADA_DUPLA || 
          visit.status === UNIFIED_VISIT_STATUS.CONFIRMADA_CLIENTE ||
          visit.status === UNIFIED_VISIT_STATUS.CONFIRMADA_CONSULTOR) {
        stats.confirmed++;
      }
      
      // Visitas realizadas
      if (visit.status === UNIFIED_VISIT_STATUS.REALIZADA) {
        stats.completed++;
      }
      
      // Visitas canceladas
      if (visit.status === UNIFIED_VISIT_STATUS.CANCELADA ||
          visit.status === UNIFIED_VISIT_STATUS.NAO_COMPARECEU_CLIENTE ||
          visit.status === UNIFIED_VISIT_STATUS.NAO_COMPARECEU_CONSULTOR) {
        stats.cancelled++;
      }
    });

    // Taxa de conversão (visitas realizadas vs agendadas)
    const totalScheduled = stats.completed + stats.cancelled;
    stats.conversionRate = totalScheduled > 0 ? 
      Math.round((stats.completed / totalScheduled) * 100) : 0;

    return stats;
  }, [visits]);

  // 🔧 FUNÇÕES AUXILIARES
  const getStatusLabel = (status) => {
    const labels = {
      [UNIFIED_VISIT_STATUS.AGENDADA]: 'Agendada',
      [UNIFIED_VISIT_STATUS.CONFIRMADA_CLIENTE]: 'Confirmada pelo Cliente',
      [UNIFIED_VISIT_STATUS.CONFIRMADA_CONSULTOR]: 'Confirmada pelo Consultor',
      [UNIFIED_VISIT_STATUS.CONFIRMADA_DUPLA]: 'Confirmada (Ambos)',
      [UNIFIED_VISIT_STATUS.EM_CURSO]: 'Em Curso',
      [UNIFIED_VISIT_STATUS.REALIZADA]: 'Realizada',
      [UNIFIED_VISIT_STATUS.NAO_COMPARECEU_CLIENTE]: 'Cliente Não Compareceu',
      [UNIFIED_VISIT_STATUS.NAO_COMPARECEU_CONSULTOR]: 'Consultor Não Compareceu',
      [UNIFIED_VISIT_STATUS.CANCELADA]: 'Cancelada',
      [UNIFIED_VISIT_STATUS.REMARCADA]: 'Remarcada'
    };
    return labels[status] || status;
  };

  // Função para compatibilidade
  const getVisitStats = useCallback(() => visitStats, [visitStats]);

  // 🔄 CARREGAR DADOS INICIAIS
  useEffect(() => {
    if (isUserReady) {
      console.log('🔄 Carregando visitas iniciais...');
      fetchVisits();
    }
  }, [isUserReady, fetchVisits]);

  // 🔄 RECARREGAR QUANDO FILTROS MUDAM
  useEffect(() => {
    if (isUserReady) {
      console.log('🔍 Aplicando filtros...');
      fetchVisits();
    }
  }, [filters.status, filters.visitType, filters.operationType, filters.dateRange]);

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
    visits,
    loading,
    error,
    creating,
    updating,
    confirming,
    filters,

    // Ações principais
    createVisit,
    confirmVisit,
    updateVisitStatus,
    addVisitFeedback,
    shareVisit,
    cancelVisit,
    deleteVisit,
    
    // Busca e filtros
    fetchVisits,
    searchVisits,
    setFilters,
    
    // Estatísticas
    visitStats,
    getVisitStats,
    
    // Constantes unificadas (compatibilidade)
    VISIT_STATUS: UNIFIED_VISIT_STATUS,
    VISIT_TYPES,
    PROPERTY_TYPES: UNIFIED_PROPERTY_TYPES,
    OPERATION_TYPES,
    VISIT_OUTCOMES,
    VISIT_STATUS_COLORS,
    
    // Constantes expandidas
    UNIFIED_VISIT_STATUS,
    UNIFIED_PROPERTY_TYPES,
    UNIFIED_PRIORITIES,
    VISIT_TYPE_LABELS,
    OPERATION_TYPE_LABELS,
    VISIT_OUTCOME_LABELS,
    
    // Helpers unificados
    validatePortuguesePhone,
    validateEmail,
    validatePostalCode,
    formatCurrency,
    getStatusLabel,
    normalizePhone: (phone) => phone?.replace(/\s|-/g, '') || '',
    
    // Estado de conectividade
    isConnected: isUserReady && !error,
    isUserReady,
    
    // Informações da versão
    version: '3.1',
    isMultiTenant: true,
    isUnified: true,
    structureVersion: '3.1-multi-tenant'
  };
};

export default useVisits;