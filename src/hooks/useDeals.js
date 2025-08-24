// src/hooks/useDeals.js
// 🎯 HOOK UNIFICADO PARA GESTÃO DE NEGÓCIOS - MyImoMate 3.0 MULTI-TENANT
// ======================================================================
// VERSÃO ATUALIZADA: Multi-tenant + Todas as funcionalidades existentes preservadas
// Funcionalidades: Pipeline Completo, Contratos, Financiamento, CRUD, Validações Unificadas
// Data: Agosto 2025 | Versão: 3.1 Multi-Tenant

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  serverTimestamp,
  writeBatch,
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
  UNIFIED_INTEREST_TYPES,
  UNIFIED_BUDGET_RANGES,
  UNIFIED_DEAL_STATUS,
  UNIFIED_PRIORITIES,
  UNIFIED_PROPERTY_TYPES,
  getInterestTypeLabel,
  getBudgetRangeLabel,
  formatCurrency
} from '../constants/unifiedTypes.js';

import {
  CORE_DATA_STRUCTURE,
  BUSINESS_DATA_STRUCTURE,
  applyCoreStructure,
  validateCoreStructure,
  DEAL_TEMPLATE
} from '../constants/coreStructure.js';

import {
  validateDeal,
  validateForDuplicates,
  formatValidatedData,
  validateCurrency,
  validateCommissionPercentage,
  calculateIMT,
  calculateStampDuty
} from '../constants/validations.js';

// 🎯 CONFIGURAÇÕES DO HOOK MULTI-TENANT
const DEALS_SUBCOLLECTION = SUBCOLLECTIONS.DEALS;
const CLIENTS_SUBCOLLECTION = SUBCOLLECTIONS.CLIENTS;
const OPPORTUNITIES_SUBCOLLECTION = SUBCOLLECTIONS.OPPORTUNITIES;
const crudHelpers = createCRUDHelpers(DEALS_SUBCOLLECTION);
const FETCH_LIMIT = 100;

// 🎯 TIPOS DE NEGÓCIO ESPECÍFICOS
export const DEAL_TYPES = {
  VENDA: 'venda',
  ARRENDAMENTO: 'arrendamento',
  COMPRA: 'compra',
  INVESTIMENTO: 'investimento',
  PERMUTA: 'permuta',
  AVALIACAO: 'avaliacao'
};

export const DEAL_TYPE_LABELS = {
  [DEAL_TYPES.VENDA]: 'Venda',
  [DEAL_TYPES.ARRENDAMENTO]: 'Arrendamento',
  [DEAL_TYPES.COMPRA]: 'Compra',
  [DEAL_TYPES.INVESTIMENTO]: 'Investimento',
  [DEAL_TYPES.PERMUTA]: 'Permuta',
  [DEAL_TYPES.AVALIACAO]: 'Avaliação'
};

// 💼 TIPOS DE CONTRATO
export const CONTRACT_STATUS = {
  PENDENTE: 'pendente',
  PROMESSA: 'promessa',
  COMPRA_VENDA: 'compra_venda',
  REGISTADO: 'registado',
  CANCELADO: 'cancelado'
};

export const CONTRACT_STATUS_LABELS = {
  [CONTRACT_STATUS.PENDENTE]: 'Pendente',
  [CONTRACT_STATUS.PROMESSA]: 'Contrato Promessa',
  [CONTRACT_STATUS.COMPRA_VENDA]: 'Escritura Compra e Venda',
  [CONTRACT_STATUS.REGISTADO]: 'Registado',
  [CONTRACT_STATUS.CANCELADO]: 'Cancelado'
};

// 🏦 STATUS DO FINANCIAMENTO
export const FINANCING_STATUS = {
  NAO_APLICAVEL: 'nao_aplicavel',
  PENDENTE: 'pendente',
  PRE_APROVADO: 'pre_aprovado',
  APROVADO: 'aprovado',
  REJEITADO: 'rejeitado',
  CANCELADO: 'cancelado'
};

export const FINANCING_STATUS_LABELS = {
  [FINANCING_STATUS.NAO_APLICAVEL]: 'Não aplicável',
  [FINANCING_STATUS.PENDENTE]: 'Pendente',
  [FINANCING_STATUS.PRE_APROVADO]: 'Pré-aprovado',
  [FINANCING_STATUS.APROVADO]: 'Aprovado',
  [FINANCING_STATUS.REJEITADO]: 'Rejeitado',
  [FINANCING_STATUS.CANCELADO]: 'Cancelado'
};

// 🎨 CORES PARA STATUS (usando constantes unificadas)
export const DEAL_STATUS_COLORS = {
  [UNIFIED_DEAL_STATUS.PROPOSTA]: 'bg-blue-100 text-blue-800 border-blue-200',
  [UNIFIED_DEAL_STATUS.ACEITA]: 'bg-green-100 text-green-800 border-green-200',
  [UNIFIED_DEAL_STATUS.EM_NEGOCIACAO]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [UNIFIED_DEAL_STATUS.CONTRATO_PROMESSA]: 'bg-purple-100 text-purple-800 border-purple-200',
  [UNIFIED_DEAL_STATUS.CONDICOES_SUSPENSIVAS]: 'bg-orange-100 text-orange-800 border-orange-200',
  [UNIFIED_DEAL_STATUS.FINANCIAMENTO_APROVADO]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [UNIFIED_DEAL_STATUS.ESCRITURA_AGENDADA]: 'bg-teal-100 text-teal-800 border-teal-200',
  [UNIFIED_DEAL_STATUS.ESCRITURA_REALIZADA]: 'bg-green-100 text-green-800 border-green-200',
  [UNIFIED_DEAL_STATUS.CANCELADO]: 'bg-red-100 text-red-800 border-red-200',
  [UNIFIED_DEAL_STATUS.SUSPENSO]: 'bg-gray-100 text-gray-800 border-gray-200'
};

// 📊 PROBABILIDADES POR STATUS
const STATUS_PROBABILITY = {
  [UNIFIED_DEAL_STATUS.PROPOSTA]: 20,
  [UNIFIED_DEAL_STATUS.ACEITA]: 40,
  [UNIFIED_DEAL_STATUS.EM_NEGOCIACAO]: 60,
  [UNIFIED_DEAL_STATUS.CONTRATO_PROMESSA]: 80,
  [UNIFIED_DEAL_STATUS.CONDICOES_SUSPENSIVAS]: 85,
  [UNIFIED_DEAL_STATUS.FINANCIAMENTO_APROVADO]: 95,
  [UNIFIED_DEAL_STATUS.ESCRITURA_AGENDADA]: 98,
  [UNIFIED_DEAL_STATUS.ESCRITURA_REALIZADA]: 100,
  [UNIFIED_DEAL_STATUS.CANCELADO]: 0,
  [UNIFIED_DEAL_STATUS.SUSPENSO]: 0
};

// 📝 TIPOS DE ATIVIDADE
export const ACTIVITY_TYPES = {
  CHAMADA: 'chamada',
  EMAIL: 'email',
  REUNIAO: 'reuniao',
  VISITA: 'visita',
  NEGOCIACAO: 'negociacao',
  DOCUMENTACAO: 'documentacao',
  FINANCIAMENTO: 'financiamento',
  JURIDICO: 'juridico',
  FOLLOW_UP: 'follow_up',
  OUTRO: 'outro'
};

// 🎯 HOOK PRINCIPAL MULTI-TENANT
const useDeals = () => {
  // 🔐 AUTENTICAÇÃO E INICIALIZAÇÃO MULTI-TENANT
  const { currentUser: user, userProfile } = useAuth();
  const fbService = useFirebaseService(user);
  
  // 📊 STATES PRINCIPAIS
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 🔍 STATES DE FILTROS E PESQUISA
  const [filters, setFilters] = useState({
    status: '',
    dealType: '',
    priority: '',
    contractStatus: '',
    financingStatus: '',
    propertyType: '',
    valueRange: '',
    clientName: '',
    dateRange: 'all',
    searchTerm: ''
  });

  // 🔐 VERIFICAR SE UTILIZADOR ESTÁ PRONTO
  const isUserReady = user && user.uid && fbService;

  // 📥 BUSCAR TODOS OS NEGÓCIOS COM ESTRUTURA UNIFICADA (MULTI-TENANT)
  const fetchDeals = useCallback(async () => {
    if (!isUserReady) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Buscando negócios multi-tenant...');

      // Construir query multi-tenant
      const queryOptions = {
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
        limitCount: FETCH_LIMIT
      };

      // Executar query usando FirebaseService
      const result = await fbService.readDocuments(DEALS_SUBCOLLECTION, queryOptions);
      
      let fetchedDeals = result.data || [];

      // Aplicar migração automática se necessário
      fetchedDeals = fetchedDeals.map(deal => {
        const migratedData = migrateDealData(deal);
        return {
          id: deal.id,
          ...migratedData,
          createdAt: deal.createdAt?.toDate?.() || deal.createdAt,
          updatedAt: deal.updatedAt?.toDate?.() || deal.updatedAt,
          expectedCloseDate: deal.expectedCloseDate?.toDate?.() || deal.expectedCloseDate,
          actualCloseDate: deal.actualCloseDate?.toDate?.() || deal.actualCloseDate,
          contractSignedDate: deal.contractSignedDate?.toDate?.() || deal.contractSignedDate,
          deedDate: deal.deedDate?.toDate?.() || deal.deedDate
        };
      });

      // Filtrar inativos
      fetchedDeals = fetchedDeals.filter(deal => deal.isActive !== false);

      // Aplicar filtros client-side
      if (filters.status && Object.values(UNIFIED_DEAL_STATUS).includes(filters.status)) {
        fetchedDeals = fetchedDeals.filter(deal => deal.status === filters.status);
      }
      
      if (filters.dealType) {
        fetchedDeals = fetchedDeals.filter(deal => deal.dealType === filters.dealType);
      }
      
      if (filters.priority && Object.values(UNIFIED_PRIORITIES).includes(filters.priority)) {
        fetchedDeals = fetchedDeals.filter(deal => deal.priority === filters.priority);
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        fetchedDeals = fetchedDeals.filter(deal => 
          deal.title?.toLowerCase().includes(term) ||
          deal.description?.toLowerCase().includes(term) ||
          deal.clientName?.toLowerCase().includes(term) ||
          deal.propertyAddress?.toLowerCase().includes(term)
        );
      }

      setDeals(fetchedDeals);
      console.log(`✅ ${fetchedDeals.length} negócios carregados (multi-tenant)`);
      
    } catch (err) {
      console.error('❌ Erro ao buscar negócios:', err);
      setError(`Erro ao carregar negócios: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [isUserReady, fbService, filters]);

  // 🔄 MIGRAÇÃO AUTOMÁTICA DE DADOS ANTIGOS
  const migrateDealData = useCallback((oldData) => {
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
      
      // Migrar status de negócio
      status: migrateDealStatus(oldData.status),
      
      // Migrar tipos de interesse
      interestType: migrateInterestType(oldData.interestType),
      
      // Garantir campos obrigatórios
      title: oldData.title || oldData.name || 'Negócio sem título',
      dealValue: oldData.dealValue || oldData.value || 0,
      
      // Atualizar probabilidade baseada no status
      probability: STATUS_PROBABILITY[oldData.status] || oldData.probability || 20,
      
      // Calcular valores se em falta
      expectedValue: oldData.expectedValue || (oldData.dealValue * (oldData.probability || 20)) / 100,
      
      // Adicionar campos novos
      structureVersion: '3.1',
      isMultiTenant: true,
      migratedAt: new Date().toISOString(),
      
      // Garantir referências cruzadas
      leadId: oldData.leadId || null,
      clientId: oldData.clientId || null,
      opportunityId: oldData.opportunityId || null,
      dealId: oldData.id || null,
      
      // Estrutura de negócio expandida
      contractStatus: oldData.contractStatus || CONTRACT_STATUS.PENDENTE,
      financingStatus: oldData.financingStatus || FINANCING_STATUS.NAO_APLICAVEL
    };

    return migrated;
  }, []);

  // 🔄 FUNÇÕES DE MIGRAÇÃO ESPECÍFICAS
  const migrateDealStatus = (oldStatus) => {
    const statusMap = {
      'proposta': UNIFIED_DEAL_STATUS.PROPOSTA,
      'aceita': UNIFIED_DEAL_STATUS.ACEITA,
      'negociacao': UNIFIED_DEAL_STATUS.EM_NEGOCIACAO,
      'contrato': UNIFIED_DEAL_STATUS.CONTRATO_PROMESSA,
      'condicoes': UNIFIED_DEAL_STATUS.CONDICOES_SUSPENSIVAS,
      'financiamento': UNIFIED_DEAL_STATUS.FINANCIAMENTO_APROVADO,
      'escritura': UNIFIED_DEAL_STATUS.ESCRITURA_AGENDADA,
      'fechado': UNIFIED_DEAL_STATUS.ESCRITURA_REALIZADA,
      'cancelado': UNIFIED_DEAL_STATUS.CANCELADO,
      'suspenso': UNIFIED_DEAL_STATUS.SUSPENSO
    };
    return statusMap[oldStatus] || UNIFIED_DEAL_STATUS.PROPOSTA;
  };

  const migrateInterestType = (oldType) => {
    const typeMap = {
      'compra_casa': UNIFIED_INTEREST_TYPES.COMPRA_CASA,
      'compra_apartamento': UNIFIED_INTEREST_TYPES.COMPRA_APARTAMENTO,
      'venda_casa': UNIFIED_INTEREST_TYPES.VENDA_CASA,
      'venda_apartamento': UNIFIED_INTEREST_TYPES.VENDA_APARTAMENTO
    };
    return typeMap[oldType] || UNIFIED_INTEREST_TYPES.COMPRA_CASA;
  };

  // ➕ CRIAR NOVO NEGÓCIO COM ESTRUTURA UNIFICADA (MULTI-TENANT)
  const createDeal = useCallback(async (dealData) => {
    if (!isUserReady) {
      throw new Error('Utilizador não autenticado');
    }

    setCreating(true);
    setError(null);

    try {
      console.log('➕ Criando novo negócio multi-tenant...');

      // 1. VALIDAÇÃO BÁSICA
      if (!dealData.title?.trim()) {
        throw new Error('Título é obrigatório');
      }
      
      if (!dealData.clientId?.trim()) {
        throw new Error('Cliente é obrigatório');
      }

      if (!dealData.dealValue || dealData.dealValue <= 0) {
        throw new Error('Valor do negócio deve ser maior que zero');
      }

      // Validações específicas
      if (dealData.dealValue && !validateCurrency(dealData.dealValue)) {
        throw new Error('Valor do negócio inválido');
      }

      if (dealData.commissionPercentage && !validateCommissionPercentage(dealData.commissionPercentage)) {
        throw new Error('Percentagem de comissão deve estar entre 0 e 100');
      }

      // 2. PREPARAR DADOS COM ESTRUTURA UNIFICADA
      const dealValue = parseFloat(dealData.dealValue) || 0;
      const commissionPercentage = parseFloat(dealData.commissionPercentage) || 2.5;
      const commissionValue = (dealValue * commissionPercentage) / 100;
      const probability = STATUS_PROBABILITY[dealData.status] || 20;
      const expectedValue = (dealValue * probability) / 100;

      // 3. CRIAR OBJETO DO NEGÓCIO COM ESTRUTURA UNIFICADA
      const newDeal = {
        // Dados básicos obrigatórios
        title: dealData.title.trim(),
        description: dealData.description?.trim() || '',
        
        // Referências obrigatórias
        clientId: dealData.clientId,
        clientName: dealData.clientName?.trim() || '',
        opportunityId: dealData.opportunityId || null,
        
        // Tipo e categoria
        dealType: dealData.dealType || DEAL_TYPES.VENDA,
        interestType: dealData.interestType || UNIFIED_INTEREST_TYPES.COMPRA_CASA,
        category: dealData.category || 'residencial',
        
        // Dados financeiros
        dealValue: dealValue,
        commissionPercentage: commissionPercentage,
        commissionValue: commissionValue,
        expectedValue: expectedValue,
        
        // Impostos portugueses
        imt: calculateIMT ? calculateIMT(dealValue) : 0,
        stampDuty: calculateStampDuty ? calculateStampDuty(dealValue) : 0,
        
        // Pipeline e status
        status: dealData.status || UNIFIED_DEAL_STATUS.PROPOSTA,
        probability: probability,
        priority: dealData.priority || UNIFIED_PRIORITIES.NORMAL,
        
        // Contratos e financiamento
        contractStatus: dealData.contractStatus || CONTRACT_STATUS.PENDENTE,
        financingStatus: dealData.financingStatus || FINANCING_STATUS.NAO_APLICAVEL,
        
        // Dados da propriedade
        propertyReference: dealData.propertyReference?.trim() || '',
        propertyType: dealData.propertyType || '',
        propertyAddress: dealData.propertyAddress || '',
        propertySize: dealData.propertySize || '',
        propertyCondition: dealData.propertyCondition || 'bom',
        
        // Datas importantes
        expectedCloseDate: dealData.expectedCloseDate || null,
        contractSignedDate: null,
        deedDate: null,
        actualCloseDate: null,
        
        // Partes envolvidas
        buyerName: dealData.buyerName || '',
        sellerName: dealData.sellerName || '',
        
        // Documentação
        documentsRequired: dealData.documentsRequired || [],
        documentsStatus: 'pendente',
        
        // Atividades e histórico
        activities: [],
        notes: dealData.notes?.trim() || '',
        internalNotes: dealData.internalNotes?.trim() || '',
        
        // Dados de auditoria obrigatórios MULTI-TENANT
        userId: user.uid,
        userEmail: user.email,
        consultantId: user.uid,
        consultantName: userProfile?.displayName || user.displayName || 'Consultor',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Flags de controlo
        isActive: true,
        isConverted: false,
        
        // Fonte e rastreamento
        source: dealData.source || 'manual',
        
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

      // 4. CRIAR USANDO FIREBASESERVICE
      const createdDeal = await fbService.createDocument(DEALS_SUBCOLLECTION, newDeal);
      
      // 5. ATUALIZAR LISTA LOCAL
      setDeals(prev => [createdDeal, ...prev]);

      // 6. ATUALIZAR CONTADOR NA OPORTUNIDADE (SE APLICÁVEL)
      if (dealData.opportunityId) {
        await updateOpportunityDealCount(dealData.opportunityId, 'increment');
      }

      console.log('✅ Negócio criado com sucesso:', createdDeal.id);
      
      return {
        success: true,
        deal: createdDeal,
        message: 'Negócio criado com sucesso!'
      };

    } catch (err) {
      console.error('❌ Erro ao criar negócio:', err);
      setError(err.message);
      
      return {
        success: false,
        error: err.message,
        message: `Erro ao criar negócio: ${err.message}`
      };
    } finally {
      setCreating(false);
    }
  }, [isUserReady, fbService, user, userProfile]);

  // ✏️ ATUALIZAR NEGÓCIO (MULTI-TENANT)
  const updateDeal = useCallback(async (dealId, updates) => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    setUpdating(true);
    setError(null);
    
    try {
      console.log('✏️ Atualizando negócio:', dealId);

      // Preparar dados para atualização
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid,
        structureVersion: '3.1'
      };

      // Recalcular valores financeiros se necessário
      if (updates.dealValue !== undefined || updates.commissionPercentage !== undefined || updates.status !== undefined) {
        const currentDeal = deals.find(deal => deal.id === dealId);
        if (currentDeal) {
          const dealValue = parseFloat(updates.dealValue || currentDeal.dealValue) || 0;
          const commissionPercentage = parseFloat(updates.commissionPercentage || currentDeal.commissionPercentage) || 2.5;
          const status = updates.status || currentDeal.status;
          const probability = STATUS_PROBABILITY[status] || 20;
          
          updateData.dealValue = dealValue;
          updateData.commissionPercentage = commissionPercentage;
          updateData.commissionValue = (dealValue * commissionPercentage) / 100;
          updateData.probability = probability;
          updateData.expectedValue = (dealValue * probability) / 100;
          
          // Recalcular impostos se valor mudou
          if (updates.dealValue !== undefined) {
            updateData.imt = calculateIMT ? calculateIMT(dealValue) : 0;
            updateData.stampDuty = calculateStampDuty ? calculateStampDuty(dealValue) : 0;
          }
        }
      }

      // Atualizar usando FirebaseService
      await fbService.updateDocument(DEALS_SUBCOLLECTION, dealId, updateData);
      
      // Atualizar lista local
      setDeals(prev => prev.map(deal => 
        deal.id === dealId 
          ? { ...deal, ...updateData, id: dealId }
          : deal
      ));

      console.log('✅ Negócio atualizado com sucesso');
      
      return { success: true, message: 'Negócio atualizado com sucesso!' };
      
    } catch (err) {
      console.error('❌ Erro ao atualizar negócio:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, [isUserReady, fbService, user, deals]);

  // 📝 ADICIONAR ATIVIDADE AO NEGÓCIO (MULTI-TENANT) - MOVIDA PARA ANTES DE updateDealStatus
  const addActivity = useCallback(async (dealId, activityData) => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    try {
      console.log('🏃‍♂️ Adicionando atividade ao negócio:', dealId);

      const activity = {
        id: Date.now().toString(),
        type: activityData.type || ACTIVITY_TYPES.OUTRO,
        description: activityData.description?.trim() || '',
        notes: activityData.notes?.trim() || '',
        duration: activityData.duration || null,
        cost: activityData.cost || null,
        outcome: activityData.outcome?.trim() || '',
        nextAction: activityData.nextAction?.trim() || '',
        createdAt: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email,
        userName: userProfile?.displayName || user.displayName || 'Consultor',
        structureVersion: '3.1'
      };

      // Encontrar o negócio
      const deal = deals.find(d => d.id === dealId);
      if (!deal) {
        return { success: false, error: 'Negócio não encontrado' };
      }

      const activities = [...(deal.activities || []), activity];
      
      const updateData = {
        activities,
        lastActivityDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await fbService.updateDocument(DEALS_SUBCOLLECTION, dealId, updateData);
      
      // Atualizar lista local
      setDeals(prev => prev.map(d => 
        d.id === dealId 
          ? { ...d, ...updateData, id: dealId }
          : d
      ));

      console.log('✅ Atividade adicionada com sucesso');
      
      return { success: true, activity, message: 'Atividade registada com sucesso!' };
      
    } catch (err) {
      console.error('❌ Erro ao adicionar atividade:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, user, userProfile, deals, fbService]);

  // 🔄 ATUALIZAR STATUS DO NEGÓCIO COM AUDITORIA (MULTI-TENANT)
  const updateDealStatus = useCallback(async (dealId, newStatus, notes = '') => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };

    try {
      console.log('📊 Atualizando status do negócio:', dealId, newStatus);

      // Validar se o status é válido
      if (!Object.values(UNIFIED_DEAL_STATUS).includes(newStatus)) {
        throw new Error(`Status inválido: ${newStatus}`);
      }

      const currentDeal = deals.find(deal => deal.id === dealId);
      if (!currentDeal) {
        throw new Error('Negócio não encontrado');
      }

      const updates = {
        status: newStatus,
        probability: STATUS_PROBABILITY[newStatus] || 0,
        expectedValue: (currentDeal.dealValue * (STATUS_PROBABILITY[newStatus] || 0)) / 100,
        statusChangeReason: notes.trim(),
        
        // Auditoria de mudança de status
        [`statusHistory.change_${Date.now()}`]: {
          from: currentDeal.status,
          to: newStatus,
          changedBy: user.uid,
          changedAt: new Date().toISOString(),
          reason: notes.trim(),
          userAgent: navigator.userAgent
        }
      };

      // Lógica específica por status
      if (newStatus === UNIFIED_DEAL_STATUS.CONTRATO_PROMESSA) {
        updates.contractSignedDate = serverTimestamp();
        updates.contractStatus = CONTRACT_STATUS.PROMESSA;
      }
      
      if (newStatus === UNIFIED_DEAL_STATUS.ESCRITURA_REALIZADA) {
        updates.actualCloseDate = serverTimestamp();
        updates.deedDate = serverTimestamp();
        updates.isConverted = true;
        updates.contractStatus = CONTRACT_STATUS.REGISTADO;
      }

      if (newStatus === UNIFIED_DEAL_STATUS.CANCELADO || newStatus === UNIFIED_DEAL_STATUS.SUSPENSO) {
        updates.isConverted = false;
      }

      const result = await updateDeal(dealId, updates);
      
      if (result.success) {
        // Log de atividade
        await addActivity(dealId, {
          type: ACTIVITY_TYPES.FOLLOW_UP,
          description: `Status alterado para: ${getStatusLabel(newStatus)}`,
          notes: notes.trim()
        });
        
        console.log(`✅ Status do negócio ${dealId} atualizado para: ${newStatus}`);
      }
      
      return result;

    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, user, deals, updateDeal, addActivity]);

  // 🗑️ ELIMINAR NEGÓCIO (SOFT DELETE MULTI-TENANT)
  const deleteDeal = useCallback(async (dealId, hardDelete = false) => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    setDeleting(true);
    setError(null);
    
    try {
      console.log('🗑️ Eliminando negócio:', dealId);

      const deal = deals.find(d => d.id === dealId);
      
      if (hardDelete) {
        // Eliminação definitiva
        await fbService.deleteDocument(DEALS_SUBCOLLECTION, dealId);
        console.log(`Negócio ${dealId} eliminado permanentemente`);
      } else {
        // Soft delete (recomendado)
        await fbService.updateDocument(DEALS_SUBCOLLECTION, dealId, {
          isActive: false,
          status: UNIFIED_DEAL_STATUS.CANCELADO,
          deletedAt: serverTimestamp(),
          deletedBy: user.uid,
          updatedAt: serverTimestamp()
        });
        console.log(`Negócio ${dealId} marcado como inativo`);
      }
      
      // Remover da lista local
      setDeals(prev => prev.filter(d => d.id !== dealId));
      
      // Atualizar contador na oportunidade
      if (deal?.opportunityId) {
        await updateOpportunityDealCount(deal.opportunityId, 'decrement');
      }

      console.log('✅ Negócio eliminado com sucesso');
      
      return { 
        success: true, 
        message: hardDelete ? 'Negócio eliminado permanentemente!' : 'Negócio cancelado!' 
      };
      
    } catch (err) {
      console.error('❌ Erro ao eliminar negócio:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setDeleting(false);
    }
  }, [isUserReady, fbService, user, deals]);

  // 🔍 PESQUISAR NEGÓCIOS
  const searchDeals = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  // 📊 ESTATÍSTICAS UNIFICADAS E AVANÇADAS (MULTI-TENANT)
  const getDealStats = useCallback(() => {
    const stats = {
      total: deals.length,
      byStatus: {},
      byDealType: {},
      byPriority: {},
      byContractStatus: {},
      byFinancingStatus: {},
      financials: {
        totalValue: 0,
        totalCommission: 0,
        expectedValue: 0,
        averageValue: 0,
        conversionRate: 0,
        totalIMT: 0,
        totalStampDuty: 0
      }
    };

    if (deals.length === 0) return stats;

    // Contar por status unificado
    Object.values(UNIFIED_DEAL_STATUS).forEach(status => {
      stats.byStatus[status] = deals.filter(deal => deal.status === status).length;
    });

    // Contar por tipo de negócio
    Object.values(DEAL_TYPES).forEach(type => {
      stats.byDealType[type] = deals.filter(deal => deal.dealType === type).length;
    });

    // Contar por prioridade
    Object.values(UNIFIED_PRIORITIES).forEach(priority => {
      stats.byPriority[priority] = deals.filter(deal => deal.priority === priority).length;
    });

    // Contar por status de contrato
    Object.values(CONTRACT_STATUS).forEach(status => {
      stats.byContractStatus[status] = deals.filter(deal => deal.contractStatus === status).length;
    });

    // Contar por status de financiamento
    Object.values(FINANCING_STATUS).forEach(status => {
      stats.byFinancingStatus[status] = deals.filter(deal => deal.financingStatus === status).length;
    });

    // Calcular métricas financeiras
    const totalValue = deals.reduce((sum, deal) => sum + (deal.dealValue || 0), 0);
    const totalCommission = deals.reduce((sum, deal) => sum + (deal.commissionValue || 0), 0);
    const expectedValue = deals.reduce((sum, deal) => sum + (deal.expectedValue || 0), 0);
    const totalIMT = deals.reduce((sum, deal) => sum + (deal.imt || 0), 0);
    const totalStampDuty = deals.reduce((sum, deal) => sum + (deal.stampDuty || 0), 0);
    
    const closedCount = stats.byStatus[UNIFIED_DEAL_STATUS.ESCRITURA_REALIZADA] || 0;
    const cancelledCount = stats.byStatus[UNIFIED_DEAL_STATUS.CANCELADO] || 0;
    const totalClosed = closedCount + cancelledCount;
    
    stats.financials = {
      totalValue,
      totalCommission,
      expectedValue,
      averageValue: stats.total > 0 ? totalValue / stats.total : 0,
      conversionRate: totalClosed > 0 ? (closedCount / totalClosed * 100).toFixed(1) : 0,
      totalIMT,
      totalStampDuty
    };

    return stats;
  }, [deals]);

  // 🔧 FUNÇÕES AUXILIARES (MULTI-TENANT)
  const updateOpportunityDealCount = async (opportunityId, action) => {
    try {
      const opportunityDoc = await fbService.getDocument(OPPORTUNITIES_SUBCOLLECTION, opportunityId);
      
      if (opportunityDoc) {
        const currentCount = opportunityDoc.dealCount || 0;
        const newCount = action === 'increment' ? currentCount + 1 : Math.max(0, currentCount - 1);
        
        await fbService.updateDocument(OPPORTUNITIES_SUBCOLLECTION, opportunityId, {
          dealCount: newCount,
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.warn('Erro ao atualizar contador da oportunidade:', err);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      [UNIFIED_DEAL_STATUS.PROPOSTA]: 'Proposta',
      [UNIFIED_DEAL_STATUS.ACEITA]: 'Aceita',
      [UNIFIED_DEAL_STATUS.EM_NEGOCIACAO]: 'Em Negociação',
      [UNIFIED_DEAL_STATUS.CONTRATO_PROMESSA]: 'Contrato Promessa',
      [UNIFIED_DEAL_STATUS.CONDICOES_SUSPENSIVAS]: 'Condições Suspensivas',
      [UNIFIED_DEAL_STATUS.FINANCIAMENTO_APROVADO]: 'Financiamento Aprovado',
      [UNIFIED_DEAL_STATUS.ESCRITURA_AGENDADA]: 'Escritura Agendada',
      [UNIFIED_DEAL_STATUS.ESCRITURA_REALIZADA]: 'Escritura Realizada',
      [UNIFIED_DEAL_STATUS.CANCELADO]: 'Cancelado',
      [UNIFIED_DEAL_STATUS.SUSPENSO]: 'Suspenso'
    };
    return labels[status] || status;
  };

  // 🔄 CARREGAR DADOS INICIAIS
  useEffect(() => {
    if (isUserReady) {
      console.log('🔄 Carregando negócios iniciais...');
      fetchDeals();
    }
  }, [isUserReady, fetchDeals]);

  // 🔄 RECARREGAR QUANDO FILTROS MUDAM
  useEffect(() => {
    if (isUserReady) {
      console.log('🔍 Aplicando filtros...');
      fetchDeals();
    }
  }, [filters.status, filters.dealType, filters.priority, filters.contractStatus, filters.financingStatus]);

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
    deals,
    loading,
    error,
    creating,
    updating,
    deleting,
    filters,

    // Ações principais
    createDeal,
    updateDeal,
    updateDealStatus,
    deleteDeal,
    addActivity,
    
    // Busca e filtros
    fetchDeals,
    searchDeals,
    setFilters,
    
    // Estatísticas
    getDealStats,
    
    // Constantes unificadas (compatibilidade)
    DEAL_STATUS: UNIFIED_DEAL_STATUS,
    DEAL_TYPES,
    CONTRACT_STATUS,
    FINANCING_STATUS,
    ACTIVITY_TYPES,
    DEAL_STATUS_COLORS,
    
    // Constantes expandidas
    UNIFIED_DEAL_STATUS,
    UNIFIED_PRIORITIES,
    UNIFIED_PROPERTY_TYPES,
    DEAL_TYPE_LABELS,
    CONTRACT_STATUS_LABELS,
    FINANCING_STATUS_LABELS,
    STATUS_PROBABILITY,
    
    // Helpers unificados
    getInterestTypeLabel,
    getBudgetRangeLabel,
    formatCurrency,
    getStatusLabel,
    calculateIMT,
    calculateStampDuty,
    
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

export default useDeals;