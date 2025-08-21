// src/hooks/useVisits.js
// 🎯 HOOK UNIFICADO PARA GESTÃO DE VISITAS - MyImoMate 3.0
// =======================================================
// VERSÃO UNIFICADA com estrutura padronizada
// Funcionalidades: Agendamento, Confirmações, Feedback, Partilhas, Controlo Temporal

import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

// 📚 IMPORTS DA ESTRUTURA UNIFICADA
// =================================
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

// 🔧 CONFIGURAÇÕES DO HOOK
// ========================
const VISITS_COLLECTION = 'visits';
const CLIENTS_COLLECTION = 'clients';
const OPPORTUNITIES_COLLECTION = 'opportunities';
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
  [VISIT_TYPES.PRESENCIAL]: 'Visita Presencial',
  [VISIT_TYPES.VIRTUAL]: 'Visita Virtual',
  [VISIT_TYPES.AVALIACAO]: 'Avaliação de Imóvel',
  [VISIT_TYPES.APRESENTACAO]: 'Apresentação de Proposta',
  [VISIT_TYPES.SEGUNDA_VISITA]: 'Segunda Visita',
  [VISIT_TYPES.VISITA_TECNICA]: 'Visita Técnica'
};

// 📊 TIPOS DE OPERAÇÃO
export const OPERATION_TYPES = {
  VENDA: 'venda',
  ARRENDAMENTO: 'arrendamento',
  COMPRA: 'compra',
  AVALIACAO: 'avaliacao'
};

export const OPERATION_TYPE_LABELS = {
  [OPERATION_TYPES.VENDA]: 'Venda',
  [OPERATION_TYPES.ARRENDAMENTO]: 'Arrendamento',
  [OPERATION_TYPES.COMPRA]: 'Compra',
  [OPERATION_TYPES.AVALIACAO]: 'Avaliação'
};

// 🎯 RESULTADOS DE VISITA
export const VISIT_OUTCOMES = {
  MUITO_INTERESSADO: 'muito_interessado',
  INTERESSADO: 'interessado',
  POUCO_INTERESSADO: 'pouco_interessado',
  NAO_INTERESSADO: 'nao_interessado',
  QUER_PENSAR: 'quer_pensar',
  PRECO_ALTO: 'preco_alto',
  NAO_ADEQUADO: 'nao_adequado',
  FARA_PROPOSTA: 'fara_proposta',
  NAO_COMPARECEU: 'nao_compareceu'
};

export const VISIT_OUTCOME_LABELS = {
  [VISIT_OUTCOMES.MUITO_INTERESSADO]: 'Muito Interessado',
  [VISIT_OUTCOMES.INTERESSADO]: 'Interessado',
  [VISIT_OUTCOMES.POUCO_INTERESSADO]: 'Pouco Interessado',
  [VISIT_OUTCOMES.NAO_INTERESSADO]: 'Não Interessado',
  [VISIT_OUTCOMES.QUER_PENSAR]: 'Quer Pensar',
  [VISIT_OUTCOMES.PRECO_ALTO]: 'Preço Alto',
  [VISIT_OUTCOMES.NAO_ADEQUADO]: 'Não Adequado',
  [VISIT_OUTCOMES.FARA_PROPOSTA]: 'Fará Proposta',
  [VISIT_OUTCOMES.NAO_COMPARECEU]: 'Não Compareceu'
};

// 🎨 CORES PARA STATUS (usando constantes unificadas)
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

// 🎯 HOOK PRINCIPAL UNIFICADO
// ===========================
const useVisits = () => {
  // Estados principais
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Estados de filtros expandidos
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

  // Context de autenticação
  const { user } = useAuth();
  const isUserReady = !!user;

  // 📥 BUSCAR TODAS AS VISITAS COM ESTRUTURA UNIFICADA
  // =================================================
  const fetchVisits = useCallback(async () => {
    if (!isUserReady) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Query simplificada para evitar problemas de índice
      let visitQuery = query(
        collection(db, VISITS_COLLECTION),
        where('userId', '==', user.uid),
        limit(FETCH_LIMIT)
      );

      const querySnapshot = await getDocs(visitQuery);
      const visitsData = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          
          // Aplicar migração automática se necessário
          const migratedData = migrateVisitData(data);
          
          return {
            id: doc.id,
            ...migratedData,
            scheduledDate: data.scheduledDate?.toDate(),
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            confirmedAt: data.confirmedAt?.toDate(),
            completedAt: data.completedAt?.toDate()
          };
        })
        .filter(visit => visit.isActive !== false) // Filtrar inativos
        .sort((a, b) => (b.scheduledDate || 0) - (a.scheduledDate || 0)); // Ordenar por data de visita

      // Aplicar filtros client-side
      let filteredVisits = visitsData;
      
      if (filters.status && Object.values(UNIFIED_VISIT_STATUS).includes(filters.status)) {
        filteredVisits = filteredVisits.filter(visit => visit.status === filters.status);
      }
      
      if (filters.visitType) {
        filteredVisits = filteredVisits.filter(visit => visit.visitType === filters.visitType);
      }
      
      if (filters.propertyType && Object.values(UNIFIED_PROPERTY_TYPES).includes(filters.propertyType)) {
        filteredVisits = filteredVisits.filter(visit => visit.property?.type === filters.propertyType);
      }
      
      if (filters.clientName) {
        filteredVisits = filteredVisits.filter(visit => 
          visit.clientName?.toLowerCase().includes(filters.clientName.toLowerCase())
        );
      }

      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        filteredVisits = filteredVisits.filter(visit => {
          const visitDate = visit.scheduledDate;
          if (!visitDate) return false;
          
          switch (filters.dateRange) {
            case 'today':
              const visitDay = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());
              return visitDay.getTime() === today.getTime();
            case 'week':
              const weekEnd = new Date(today);
              weekEnd.setDate(today.getDate() + 7);
              return visitDate >= today && visitDate <= weekEnd;
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
        filteredVisits = filteredVisits.filter(visit => 
          visit.clientName?.toLowerCase().includes(term) ||
          visit.property?.address?.street?.toLowerCase().includes(term) ||
          visit.property?.address?.city?.toLowerCase().includes(term) ||
          visit.property?.description?.toLowerCase().includes(term)
        );
      }

      setVisits(filteredVisits);
      console.log(`Carregadas ${filteredVisits.length} visitas com estrutura unificada`);
      
    } catch (err) {
      console.error('Erro ao buscar visitas:', err);
      setError(`Erro ao carregar visitas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [isUserReady, user, filters]);

  // 🔄 MIGRAÇÃO AUTOMÁTICA DE DADOS ANTIGOS
  // =======================================
  const migrateVisitData = useCallback((oldData) => {
    // Se já tem estrutura nova, retornar como está
    if (oldData.structureVersion === '3.0') {
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
      
      // Migrar tipo de propriedade
      property: {
        ...oldData.property,
        type: migratePropertyType(oldData.property?.type),
        operation: oldData.property?.operation || OPERATION_TYPES.VENDA
      },
      
      // Garantir campos obrigatórios
      visitType: oldData.visitType || VISIT_TYPES.PRESENCIAL,
      duration: oldData.duration || 60,
      
      // Adicionar campos novos
      structureVersion: '3.0',
      migratedAt: new Date().toISOString(),
      
      // Garantir referências cruzadas
      leadId: oldData.leadId || null,
      clientId: oldData.clientId || null,
      opportunityId: oldData.opportunityId || null,
      dealId: oldData.dealId || null,
      
      // Dados de controlo temporal
      scheduledFor: oldData.scheduledDate,
      confirmedBy: oldData.confirmedBy || null,
      completedBy: oldData.completedBy || null
    };

    return migrated;
  }, []);

  // 🔄 FUNÇÕES DE MIGRAÇÃO ESPECÍFICAS
  // ==================================
  const migrateVisitStatus = (oldStatus) => {
    const statusMap = {
      'agendada': UNIFIED_VISIT_STATUS.AGENDADA,
      'confirmada': UNIFIED_VISIT_STATUS.CONFIRMADA_DUPLA,
      'confirmada_cliente': UNIFIED_VISIT_STATUS.CONFIRMADA_CLIENTE,
      'confirmada_consultor': UNIFIED_VISIT_STATUS.CONFIRMADA_CONSULTOR,
      'em_curso': UNIFIED_VISIT_STATUS.EM_CURSO,
      'realizada': UNIFIED_VISIT_STATUS.REALIZADA,
      'nao_compareceu': UNIFIED_VISIT_STATUS.NAO_COMPARECEU_CLIENTE,
      'cancelada': UNIFIED_VISIT_STATUS.CANCELADA,
      'remarcada': UNIFIED_VISIT_STATUS.REMARCADA
    };
    return statusMap[oldStatus] || UNIFIED_VISIT_STATUS.AGENDADA;
  };

  const migratePropertyType = (oldType) => {
    const typeMap = {
      'apartamento': UNIFIED_PROPERTY_TYPES.APARTAMENTO,
      'moradia': UNIFIED_PROPERTY_TYPES.MORADIA,
      'terreno': UNIFIED_PROPERTY_TYPES.TERRENO,
      'comercial': UNIFIED_PROPERTY_TYPES.COMERCIAL,
      'quinta': UNIFIED_PROPERTY_TYPES.QUINTA_HERDADE,
      'escritorio': UNIFIED_PROPERTY_TYPES.ESCRITORIO,
      'armazem': UNIFIED_PROPERTY_TYPES.ARMAZEM,
      'garagem': UNIFIED_PROPERTY_TYPES.GARAGEM
    };
    return typeMap[oldType] || UNIFIED_PROPERTY_TYPES.APARTAMENTO;
  };

  // ➕ CRIAR NOVA VISITA COM ESTRUTURA UNIFICADA
  // ===========================================
  const createVisit = useCallback(async (visitData) => {
    if (!isUserReady) {
      throw new Error('Utilizador não autenticado');
    }

    setCreating(true);
    setError(null);

    try {
      // 1. VALIDAÇÃO BÁSICA
      if (!visitData.clientId || !visitData.clientName) {
        throw new Error('Cliente é obrigatório');
      }

      if (!visitData.scheduledDate) {
        throw new Error('Data de agendamento é obrigatória');
      }

      if (!visitData.property?.address?.street) {
        throw new Error('Morada do imóvel é obrigatória');
      }

      // Verificar se a data não está no passado
      const scheduledDate = new Date(visitData.scheduledDate);
      const now = new Date();
      if (scheduledDate < now) {
        throw new Error('Não é possível agendar visita no passado');
      }

      // 2. PREPARAR DADOS COM ESTRUTURA UNIFICADA
      const newVisit = {
        // Dados básicos obrigatórios
        clientId: visitData.clientId,
        clientName: visitData.clientName.trim(),
        scheduledDate: visitData.scheduledDate,
        duration: visitData.duration || 60,
        visitType: visitData.visitType || VISIT_TYPES.PRESENCIAL,
        
        // Status e prioridade
        status: UNIFIED_VISIT_STATUS.AGENDADA,
        priority: visitData.priority || UNIFIED_PRIORITIES.NORMAL,
        
        // Dados da propriedade (PROPERTY_DATA_STRUCTURE expandida)
        propertyReference: visitData.propertyReference?.trim() || '',
        propertyType: visitData.property?.type || UNIFIED_PROPERTY_TYPES.APARTAMENTO,
        property: {
          type: visitData.property?.type || UNIFIED_PROPERTY_TYPES.APARTAMENTO,
          operation: visitData.property?.operation || OPERATION_TYPES.VENDA,
          address: {
            street: visitData.property.address.street.trim(),
            number: visitData.property.address.number?.trim() || '',
            floor: visitData.property.address.floor?.trim() || '',
            postalCode: visitData.property.address.postalCode?.trim() || '',
            city: visitData.property.address.city?.trim() || '',
            district: visitData.property.address.district?.trim() || '',
            country: visitData.property.address.country || 'Portugal',
            coordinates: visitData.property.address.coordinates || null
          },
          features: {
            area: visitData.property.area || null,
            bedrooms: visitData.property.rooms || null,
            bathrooms: visitData.property.bathrooms || null,
            parkingSpaces: visitData.property.parking || null,
            buildYear: visitData.property.buildYear || null,
            condition: visitData.property.condition || 'good',
            energyRating: visitData.property.energyRating || ''
          },
          financials: {
            askingPrice: visitData.property.price || null,
            pricePerSqm: visitData.property.price && visitData.property.area ? 
              (visitData.property.price / visitData.property.area) : null
          },
          description: visitData.property.description?.trim() || '',
          internal_ref: visitData.property.internal_ref?.trim() || '',
          external_ref: visitData.property.external_ref?.trim() || ''
        },
        
        // Notas e observações
        notes: visitData.notes?.trim() || '',
        internal_notes: visitData.internal_notes?.trim() || '',
        
        // Dados de controlo temporal
        scheduledFor: visitData.scheduledDate,
        confirmedBy: null,
        confirmedAt: null,
        completedBy: null,
        completedAt: null,
        
        // Sistema de partilhas
        sharedWith: visitData.sharedWith || [],
        isShared: false,
        
        // Feedback pós-visita
        feedback: null,
        outcome: null,
        nextSteps: null,
        followUpDate: null,
        
        // Dados de auditoria obrigatórios
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Flags de controlo
        isActive: true,
        isConverted: false,
        
        // Referências cruzadas
        leadId: visitData.leadId || null,
        clientId: visitData.clientId,
        opportunityId: visitData.opportunityId || null,
        dealId: visitData.dealId || null,
        
        // Versão da estrutura
        structureVersion: '3.0',
        
        // Metadados técnicos
        userAgent: navigator.userAgent,
        source_details: {
          created_via: 'web_form',
          form_version: '3.0',
          timestamp: new Date().toISOString()
        }
      };

      // 3. INSERIR NO FIREBASE
      const docRef = await addDoc(collection(db, VISITS_COLLECTION), newVisit);
      
      // 4. CRIAR OBJETO COMPLETO PARA RETORNO
      const createdVisit = {
        id: docRef.id,
        ...newVisit,
        scheduledDate: new Date(visitData.scheduledDate),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 5. ATUALIZAR LISTA LOCAL
      setVisits(prev => [createdVisit, ...prev]);

      console.log('Visita criada com estrutura unificada:', docRef.id);
      
      return {
        success: true,
        visit: createdVisit,
        message: 'Visita agendada com sucesso!'
      };

    } catch (err) {
      console.error('Erro ao criar visita:', err);
      setError(err.message);
      
      return {
        success: false,
        error: err.message,
        message: `Erro ao agendar visita: ${err.message}`
      };
    } finally {
      setCreating(false);
    }
  }, [isUserReady, user]);

  // 🔄 CONFIRMAR VISITA (DUPLA CONFIRMAÇÃO)
  // =======================================
  const confirmVisit = useCallback(async (visitId, confirmationType = 'cliente', notes = '') => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    setConfirming(true);
    setError(null);
    
    try {
      const visit = visits.find(v => v.id === visitId);
      if (!visit) {
        throw new Error('Visita não encontrada');
      }

      let newStatus;
      const currentStatus = visit.status;
      
      // Lógica de confirmação dupla
      if (confirmationType === 'cliente') {
        if (currentStatus === UNIFIED_VISIT_STATUS.AGENDADA) {
          newStatus = UNIFIED_VISIT_STATUS.CONFIRMADA_CLIENTE;
        } else if (currentStatus === UNIFIED_VISIT_STATUS.CONFIRMADA_CONSULTOR) {
          newStatus = UNIFIED_VISIT_STATUS.CONFIRMADA_DUPLA;
        } else {
          newStatus = UNIFIED_VISIT_STATUS.CONFIRMADA_CLIENTE;
        }
      } else if (confirmationType === 'consultor') {
        if (currentStatus === UNIFIED_VISIT_STATUS.AGENDADA) {
          newStatus = UNIFIED_VISIT_STATUS.CONFIRMADA_CONSULTOR;
        } else if (currentStatus === UNIFIED_VISIT_STATUS.CONFIRMADA_CLIENTE) {
          newStatus = UNIFIED_VISIT_STATUS.CONFIRMADA_DUPLA;
        } else {
          newStatus = UNIFIED_VISIT_STATUS.CONFIRMADA_CONSULTOR;
        }
      }

      const updateData = {
        status: newStatus,
        confirmedBy: confirmationType,
        confirmedAt: serverTimestamp(),
        confirmationNotes: notes.trim(),
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid,
        
        // Auditoria de confirmação
        [`confirmationHistory.${confirmationType}_${Date.now()}`]: {
          type: confirmationType,
          confirmedBy: user.uid,
          confirmedAt: new Date().toISOString(),
          notes: notes.trim(),
          userAgent: navigator.userAgent
        }
      };

      const visitRef = doc(db, VISITS_COLLECTION, visitId);
      await updateDoc(visitRef, updateData);
      
      // Atualizar lista local
      setVisits(prev => prev.map(v => 
        v.id === visitId 
          ? { ...v, ...updateData, confirmedAt: new Date(), updatedAt: new Date() }
          : v
      ));

      console.log(`Visita ${visitId} confirmada por ${confirmationType}`);
      
      return { 
        success: true, 
        message: `Visita confirmada pelo ${confirmationType}!`,
        status: newStatus
      };
      
    } catch (err) {
      console.error('Erro ao confirmar visita:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setConfirming(false);
    }
  }, [isUserReady, user, visits]);

  // 🔄 ATUALIZAR STATUS DA VISITA
  // =============================
  const updateVisitStatus = useCallback(async (visitId, newStatus, notes = '') => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };

    try {
      // Validar se o status é válido
      if (!Object.values(UNIFIED_VISIT_STATUS).includes(newStatus)) {
        throw new Error(`Status inválido: ${newStatus}`);
      }

      const updateData = {
        status: newStatus,
        statusChangeReason: notes.trim(),
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid,
        
        // Auditoria de mudança de status
        [`statusHistory.change_${Date.now()}`]: {
          to: newStatus,
          changedBy: user.uid,
          changedAt: new Date().toISOString(),
          reason: notes.trim(),
          userAgent: navigator.userAgent
        }
      };

      // Lógica específica por status
      if (newStatus === UNIFIED_VISIT_STATUS.EM_CURSO) {
        updateData.startedAt = serverTimestamp();
      }
      
      if (newStatus === UNIFIED_VISIT_STATUS.REALIZADA) {
        updateData.completedAt = serverTimestamp();
        updateData.completedBy = user.uid;
      }

      const visitRef = doc(db, VISITS_COLLECTION, visitId);
      await updateDoc(visitRef, updateData);
      
      // Atualizar lista local
      setVisits(prev => prev.map(visit => 
        visit.id === visitId 
          ? { ...visit, ...updateData, updatedAt: new Date() }
          : visit
      ));

      console.log(`Status da visita ${visitId} atualizado para: ${newStatus}`);
      
      return { 
        success: true, 
        message: `Status atualizado para ${getStatusLabel(newStatus)}!` 
      };

    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, user]);

  // 💬 ADICIONAR FEEDBACK PÓS-VISITA
  // ================================
  const addVisitFeedback = useCallback(async (visitId, feedbackData) => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    try {
      const feedback = {
        outcome: feedbackData.outcome || VISIT_OUTCOMES.INTERESSADO,
        rating: feedbackData.rating || null,
        clientFeedback: feedbackData.clientFeedback?.trim() || '',
        consultorFeedback: feedbackData.consultorFeedback?.trim() || '',
        nextSteps: feedbackData.nextSteps?.trim() || '',
        followUpDate: feedbackData.followUpDate || null,
        willMakeOffer: feedbackData.willMakeOffer || false,
        offerAmount: feedbackData.offerAmount || null,
        additionalVisits: feedbackData.additionalVisits || false,
        
        // Auditoria
        createdBy: user.uid,
        createdAt: new Date().toISOString(),
        structureVersion: '3.0'
      };

      const updateData = {
        feedback: feedback,
        outcome: feedbackData.outcome,
        nextSteps: feedbackData.nextSteps?.trim() || '',
        followUpDate: feedbackData.followUpDate,
        status: UNIFIED_VISIT_STATUS.REALIZADA,
        completedAt: serverTimestamp(),
        completedBy: user.uid,
        updatedAt: serverTimestamp()
      };

      const visitRef = doc(db, VISITS_COLLECTION, visitId);
      await updateDoc(visitRef, updateData);
      
      // Atualizar lista local
      setVisits(prev => prev.map(visit => 
        visit.id === visitId 
          ? { ...visit, ...updateData, completedAt: new Date(), updatedAt: new Date() }
          : visit
      ));

      console.log(`Feedback adicionado à visita ${visitId}`);
      
      return { 
        success: true, 
        feedback,
        message: 'Feedback registado com sucesso!' 
      };
      
    } catch (err) {
      console.error('Erro ao adicionar feedback:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, user]);

  // 🔗 PARTILHAR VISITA COM OUTROS CONSULTORES
  // ==========================================
  const shareVisit = useCallback(async (visitId, consultorIds, notes = '') => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    try {
      const shareData = {
        sharedWith: consultorIds,
        isShared: consultorIds.length > 0,
        shareNotes: notes.trim(),
        sharedBy: user.uid,
        sharedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const visitRef = doc(db, VISITS_COLLECTION, visitId);
      await updateDoc(visitRef, shareData);
      
      // Atualizar lista local
      setVisits(prev => prev.map(visit => 
        visit.id === visitId 
          ? { ...visit, ...shareData, sharedAt: new Date(), updatedAt: new Date() }
          : visit
      ));

      console.log(`Visita ${visitId} partilhada com ${consultorIds.length} consultores`);
      
      return { 
        success: true, 
        message: `Visita partilhada com ${consultorIds.length} consultor(es)!` 
      };
      
    } catch (err) {
      console.error('Erro ao partilhar visita:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, user]);

  // ❌ CANCELAR VISITA
  // ==================
  const cancelVisit = useCallback(async (visitId, reason = '') => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    try {
      const updateData = {
        status: UNIFIED_VISIT_STATUS.CANCELADA,
        cancellationReason: reason.trim(),
        cancelledBy: user.uid,
        cancelledAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const visitRef = doc(db, VISITS_COLLECTION, visitId);
      await updateDoc(visitRef, updateData);
      
      // Atualizar lista local
      setVisits(prev => prev.map(visit => 
        visit.id === visitId 
          ? { ...visit, ...updateData, cancelledAt: new Date(), updatedAt: new Date() }
          : visit
      ));

      console.log(`Visita ${visitId} cancelada`);
      
      return { 
        success: true, 
        message: 'Visita cancelada com sucesso!' 
      };
      
    } catch (err) {
      console.error('Erro ao cancelar visita:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, user]);

  // 🗑️ ELIMINAR VISITA (SOFT DELETE)
  // ================================
  const deleteVisit = useCallback(async (visitId, hardDelete = false) => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    try {
      const visitRef = doc(db, VISITS_COLLECTION, visitId);
      
      if (hardDelete) {
        // Eliminação definitiva
        await deleteDoc(visitRef);
        console.log(`Visita ${visitId} eliminada permanentemente`);
      } else {
        // Soft delete (recomendado)
        await updateDoc(visitRef, {
          isActive: false,
          status: UNIFIED_VISIT_STATUS.CANCELADA,
          deletedAt: serverTimestamp(),
          deletedBy: user.uid,
          updatedAt: serverTimestamp()
        });
        console.log(`Visita ${visitId} marcada como inativa`);
      }
      
      // Remover da lista local
      setVisits(prev => prev.filter(visit => visit.id !== visitId));
      
      return { 
        success: true, 
        message: hardDelete ? 'Visita eliminada permanentemente!' : 'Visita removida da lista!' 
      };
      
    } catch (err) {
      console.error('Erro ao eliminar visita:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, user]);

  // 🔍 PESQUISAR VISITAS
  // ====================
  const searchVisits = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  // 📊 ESTATÍSTICAS UNIFICADAS
  // ==========================
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
  // =====================
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

  // 🔄 EFFECTS
  // ==========
  useEffect(() => {
    if (isUserReady) {
      console.log('useVisits: Utilizador pronto, carregando visitas...');
      fetchVisits();
    }
  }, [isUserReady, fetchVisits]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 📤 RETORNO DO HOOK UNIFICADO
  // ============================
  return {
    // Estados
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
    
    // Novos: constantes unificadas
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
    
    // Informações da estrutura
    structureVersion: '3.0',
    isUnified: true
  };
};

export default useVisits;