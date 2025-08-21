// src/hooks/useDeals.js
// 🎯 HOOK UNIFICADO PARA GESTÃO DE NEGÓCIOS - MyImoMate 3.0
// ========================================================
// VERSÃO UNIFICADA com estrutura padronizada
// Funcionalidades: Pipeline Completo, Contratos, Financiamento, CRUD, Validações Unificadas

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
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

// 📚 IMPORTS DA ESTRUTURA UNIFICADA
// =================================
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

// 🔧 CONFIGURAÇÕES DO HOOK
// ========================
const DEALS_COLLECTION = 'deals';
const CLIENTS_COLLECTION = 'clients';
const OPPORTUNITIES_COLLECTION = 'opportunities';
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

// 📋 STATUS DE CONTRATO
export const CONTRACT_STATUS = {
  PENDENTE: 'pendente',
  PROMESSA: 'promessa',
  DEFINITIVO: 'definitivo',
  ASSINADO: 'assinado',
  REGISTADO: 'registado',
  CANCELADO: 'cancelado'
};

export const CONTRACT_STATUS_LABELS = {
  [CONTRACT_STATUS.PENDENTE]: 'Pendente',
  [CONTRACT_STATUS.PROMESSA]: 'Contrato Promessa',
  [CONTRACT_STATUS.DEFINITIVO]: 'Contrato Definitivo',
  [CONTRACT_STATUS.ASSINADO]: 'Assinado',
  [CONTRACT_STATUS.REGISTADO]: 'Registado',
  [CONTRACT_STATUS.CANCELADO]: 'Cancelado'
};

// 💰 STATUS DE FINANCIAMENTO
export const FINANCING_STATUS = {
  NAO_APLICAVEL: 'nao_aplicavel',
  SOLICITADO: 'solicitado',
  PRE_APROVADO: 'pre_aprovado',
  APROVADO: 'aprovado',
  REJEITADO: 'rejeitado',
  DESISTENCIA: 'desistencia'
};

export const FINANCING_STATUS_LABELS = {
  [FINANCING_STATUS.NAO_APLICAVEL]: 'Não Aplicável',
  [FINANCING_STATUS.SOLICITADO]: 'Solicitado',
  [FINANCING_STATUS.PRE_APROVADO]: 'Pré-Aprovado',
  [FINANCING_STATUS.APROVADO]: 'Aprovado',
  [FINANCING_STATUS.REJEITADO]: 'Rejeitado',
  [FINANCING_STATUS.DESISTENCIA]: 'Desistência'
};

// 🎨 CORES PARA STATUS (usando constantes unificadas)
export const DEAL_STATUS_COLORS = {
  [UNIFIED_DEAL_STATUS.PROPOSTA]: 'bg-blue-100 text-blue-800 border-blue-200',
  [UNIFIED_DEAL_STATUS.ACEITA]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [UNIFIED_DEAL_STATUS.EM_NEGOCIACAO]: 'bg-orange-100 text-orange-800 border-orange-200',
  [UNIFIED_DEAL_STATUS.CONTRATO_PROMESSA]: 'bg-purple-100 text-purple-800 border-purple-200',
  [UNIFIED_DEAL_STATUS.CONDICOES_SUSPENSIVAS]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [UNIFIED_DEAL_STATUS.FINANCIAMENTO_APROVADO]: 'bg-green-100 text-green-800 border-green-200',
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

// 🎯 HOOK PRINCIPAL UNIFICADO
// ===========================
const useDeals = () => {
  // Estados principais
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estados de filtros expandidos
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

  // Context de autenticação
  const { user } = useAuth();
  const isUserReady = !!user?.uid;

  // 📥 BUSCAR TODOS OS NEGÓCIOS COM ESTRUTURA UNIFICADA
  // ==================================================
  const fetchDeals = useCallback(async () => {
    if (!isUserReady) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Query simplificada para evitar problemas de índice
      let dealQuery = query(
        collection(db, DEALS_COLLECTION),
        where('userId', '==', user.uid),
        limit(FETCH_LIMIT)
      );

      const querySnapshot = await getDocs(dealQuery);
      const dealsData = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          
          // Aplicar migração automática se necessário
          const migratedData = migrateDealData(data);
          
          return {
            id: doc.id,
            ...migratedData,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            expectedCloseDate: data.expectedCloseDate?.toDate(),
            actualCloseDate: data.actualCloseDate?.toDate(),
            contractSignedDate: data.contractSignedDate?.toDate(),
            deedDate: data.deedDate?.toDate()
          };
        })
        .filter(deal => deal.isActive !== false) // Filtrar inativos
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); // Ordenar por data

      // Aplicar filtros client-side
      let filteredDeals = dealsData;
      
      if (filters.status && Object.values(UNIFIED_DEAL_STATUS).includes(filters.status)) {
        filteredDeals = filteredDeals.filter(deal => deal.status === filters.status);
      }
      
      if (filters.dealType) {
        filteredDeals = filteredDeals.filter(deal => deal.dealType === filters.dealType);
      }
      
      if (filters.priority && Object.values(UNIFIED_PRIORITIES).includes(filters.priority)) {
        filteredDeals = filteredDeals.filter(deal => deal.priority === filters.priority);
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredDeals = filteredDeals.filter(deal => 
          deal.title?.toLowerCase().includes(term) ||
          deal.description?.toLowerCase().includes(term) ||
          deal.clientName?.toLowerCase().includes(term) ||
          deal.propertyAddress?.toLowerCase().includes(term)
        );
      }

      setDeals(filteredDeals);
      console.log(`Carregados ${filteredDeals.length} negócios com estrutura unificada`);
      
    } catch (err) {
      console.error('Erro ao buscar negócios:', err);
      setError(`Erro ao carregar negócios: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [isUserReady, user, filters]);

  // 🔄 MIGRAÇÃO AUTOMÁTICA DE DADOS ANTIGOS
  // =======================================
  const migrateDealData = useCallback((oldData) => {
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
      structureVersion: '3.0',
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
  // ==================================
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

  // ➕ CRIAR NOVO NEGÓCIO COM ESTRUTURA UNIFICADA
  // ============================================
  const createDeal = useCallback(async (dealData) => {
    if (!isUserReady) {
      throw new Error('Utilizador não autenticado');
    }

    setCreating(true);
    setError(null);

    try {
      // 1. VALIDAÇÃO BÁSICA
      if (!dealData.title?.trim()) {
        throw new Error('Título do negócio é obrigatório');
      }
      
      if (!dealData.clientId?.trim()) {
        throw new Error('Cliente é obrigatório');
      }

      if (!dealData.dealValue || dealData.dealValue <= 0) {
        throw new Error('Valor do negócio deve ser maior que zero');
      }

      // Validações específicas
      if (!validateCurrency(dealData.dealValue)) {
        throw new Error('Valor do negócio inválido');
      }

      if (dealData.commissionPercentage && !validateCommissionPercentage(dealData.commissionPercentage)) {
        throw new Error('Percentagem de comissão deve estar entre 0 e 100');
      }

      // 2. PREPARAR DADOS COM ESTRUTURA UNIFICADA
      const dealValue = parseFloat(dealData.dealValue);
      const commissionPercentage = parseFloat(dealData.commissionPercentage) || 2.5;
      const commissionValue = (dealValue * commissionPercentage) / 100;
      const probability = STATUS_PROBABILITY[dealData.status] || 20;
      const expectedValue = (dealValue * probability) / 100;

      // Calcular impostos portugueses se aplicável
      const imt = dealData.dealType === DEAL_TYPES.VENDA ? calculateIMT(dealValue) : 0;
      const stampDuty = dealData.dealType === DEAL_TYPES.VENDA ? calculateStampDuty(dealValue) : 0;

      // 3. CRIAR OBJETO DO NEGÓCIO COM ESTRUTURA UNIFICADA
      const newDeal = {
        // Dados básicos obrigatórios
        title: dealData.title.trim(),
        description: dealData.description?.trim() || '',
        
        // Referências obrigatórias
        clientId: dealData.clientId,
        clientName: dealData.clientName?.trim() || '',
        
        // Dados financeiros principais
        dealValue: dealValue,
        commissionPercentage: commissionPercentage,
        commissionValue: commissionValue,
        expectedValue: expectedValue,
        probability: probability,
        
        // Impostos e taxas portuguesas
        imt: imt,
        stampDuty: stampDuty,
        notaryFees: dealData.notaryFees || 0,
        totalTaxes: imt + stampDuty + (dealData.notaryFees || 0),
        
        // Tipo e categorização
        dealType: dealData.dealType || DEAL_TYPES.VENDA,
        interestType: dealData.interestType || UNIFIED_INTEREST_TYPES.COMPRA_CASA,
        priority: dealData.priority || UNIFIED_PRIORITIES.NORMAL,
        
        // Status do negócio
        status: dealData.status || UNIFIED_DEAL_STATUS.PROPOSTA,
        contractStatus: dealData.contractStatus || CONTRACT_STATUS.PENDENTE,
        financingStatus: dealData.financingStatus || FINANCING_STATUS.NAO_APLICAVEL,
        
        // Dados da propriedade (BUSINESS_DATA_STRUCTURE)
        propertyReference: dealData.propertyReference?.trim() || '',
        propertyType: dealData.propertyType || '',
        propertyAddress: dealData.propertyAddress?.trim() || '',
        
        // Datas importantes
        expectedCloseDate: dealData.expectedCloseDate || null,
        contractSignedDate: null,
        deedDate: null,
        actualCloseDate: null,
        
        // Detalhes de financiamento (BUSINESS_DATA_STRUCTURE)
        financingDetails: {
          hasFinancing: dealData.financingDetails?.hasFinancing || false,
          loanAmount: dealData.financingDetails?.loanAmount || 0,
          downPayment: dealData.financingDetails?.downPayment || 0,
          bankName: dealData.financingDetails?.bankName?.trim() || '',
          preApproved: dealData.financingDetails?.preApproved || false,
          interestRate: dealData.financingDetails?.interestRate || 0,
          loanTerm: dealData.financingDetails?.loanTerm || 0
        },
        
        // Partes envolvidas (BUSINESS_DATA_STRUCTURE)
        parties: {
          buyer: dealData.parties?.buyer?.trim() || '',
          seller: dealData.parties?.seller?.trim() || '',
          buyerLawyer: dealData.parties?.buyerLawyer?.trim() || '',
          sellerLawyer: dealData.parties?.sellerLawyer?.trim() || '',
          notary: dealData.parties?.notary?.trim() || '',
          bankRepresentative: dealData.parties?.bankRepresentative?.trim() || ''
        },
        
        // Documentação (BUSINESS_DATA_STRUCTURE)
        documents: {
          promissoryContract: dealData.documents?.promissoryContract || false,
          deedOfSale: dealData.documents?.deedOfSale || false,
          energyCertificate: dealData.documents?.energyCertificate || false,
          habitationLicense: dealData.documents?.habitationLicense || false,
          propertyRegistration: dealData.documents?.propertyRegistration || false,
          taxClearance: dealData.documents?.taxClearance || false
        },
        
        // Atividades e histórico
        activities: [],
        followUps: [],
        notes: dealData.notes?.trim() || '',
        
        // Dados de auditoria obrigatórios
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Flags de controlo
        isActive: true,
        isConverted: false,
        
        // Referências cruzadas
        leadId: dealData.leadId || null,
        clientId: dealData.clientId,
        opportunityId: dealData.opportunityId || null,
        dealId: null, // Auto-preenchido após criação
        
        // Fonte e rastreamento
        source: dealData.source || 'manual',
        
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

      // 4. INSERIR NO FIREBASE
      const docRef = await addDoc(collection(db, DEALS_COLLECTION), newDeal);
      
      // 5. CRIAR OBJETO COMPLETO PARA RETORNO
      const createdDeal = {
        id: docRef.id,
        ...newDeal,
        dealId: docRef.id, // Atualizar referência própria
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 6. ATUALIZAR LISTA LOCAL
      setDeals(prev => [createdDeal, ...prev]);

      // 7. ATUALIZAR CONTADOR DA OPORTUNIDADE
      if (dealData.opportunityId) {
        await updateOpportunityDealCount(dealData.opportunityId, 'increment');
      }

      console.log('Negócio criado com estrutura unificada:', docRef.id);
      
      return {
        success: true,
        deal: createdDeal,
        message: 'Negócio criado com sucesso!'
      };

    } catch (err) {
      console.error('Erro ao criar negócio:', err);
      setError(err.message);
      
      return {
        success: false,
        error: err.message,
        message: `Erro ao criar negócio: ${err.message}`
      };
    } finally {
      setCreating(false);
    }
  }, [isUserReady, user]);

  // 🔄 ATUALIZAR NEGÓCIO
  // ===================
  const updateDeal = useCallback(async (dealId, updates) => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    setUpdating(true);
    setError(null);
    
    try {
      // Preparar dados para atualização
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid,
        structureVersion: '3.0'
      };

      // Atualizar probabilidade se status mudou
      if (updates.status) {
        updateData.probability = STATUS_PROBABILITY[updates.status] || updateData.probability;
      }

      // Recalcular valores monetários se necessário
      if (updates.dealValue !== undefined || updates.commissionPercentage !== undefined) {
        const currentDeal = deals.find(deal => deal.id === dealId);
        const dealValue = parseFloat(updates.dealValue) || currentDeal?.dealValue || 0;
        const commissionPercentage = parseFloat(updates.commissionPercentage) || currentDeal?.commissionPercentage || 2.5;
        
        updateData.dealValue = dealValue;
        updateData.commissionPercentage = commissionPercentage;
        updateData.commissionValue = (dealValue * commissionPercentage) / 100;
        updateData.expectedValue = (dealValue * updateData.probability) / 100;
        
        // Recalcular impostos se necessário
        if (updates.dealValue !== undefined && currentDeal?.dealType === DEAL_TYPES.VENDA) {
          updateData.imt = calculateIMT(dealValue);
          updateData.stampDuty = calculateStampDuty(dealValue);
          updateData.totalTaxes = updateData.imt + updateData.stampDuty + (currentDeal?.notaryFees || 0);
        }
      }

      // Datas importantes baseadas no status
      if (updates.status === UNIFIED_DEAL_STATUS.CONTRATO_PROMESSA && !updateData.contractSignedDate) {
        updateData.contractSignedDate = serverTimestamp();
      }
      
      if (updates.status === UNIFIED_DEAL_STATUS.ESCRITURA_REALIZADA && !updateData.actualCloseDate) {
        updateData.actualCloseDate = serverTimestamp();
        updateData.deedDate = serverTimestamp();
        updateData.isConverted = true;
      }

      // Atualizar na base de dados
      const dealRef = doc(db, DEALS_COLLECTION, dealId);
      await updateDoc(dealRef, updateData);
      
      // Atualizar lista local
      setDeals(prev => prev.map(deal => 
        deal.id === dealId 
          ? { ...deal, ...updateData, updatedAt: new Date() }
          : deal
      ));

      console.log(`Negócio ${dealId} atualizado`);
      
      return { success: true, message: 'Negócio atualizado com sucesso!' };
      
    } catch (err) {
      console.error('Erro ao atualizar negócio:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, [isUserReady, user, deals]);

  // 🔄 ATUALIZAR STATUS DO NEGÓCIO COM AUDITORIA
  // ============================================
  const updateDealStatus = useCallback(async (dealId, newStatus, notes = '') => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };

    try {
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
          notes: notes.trim(),
          userId: user.uid
        });
        
        console.log(`Status do negócio ${dealId} atualizado para: ${newStatus}`);
      }
      
      return result;

    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, user, deals, updateDeal]);

  // 🗑️ ELIMINAR NEGÓCIO (SOFT DELETE)
  // =================================
  const deleteDeal = useCallback(async (dealId, hardDelete = false) => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    setDeleting(true);
    setError(null);
    
    try {
      const deal = deals.find(d => d.id === dealId);
      const dealRef = doc(db, DEALS_COLLECTION, dealId);
      
      if (hardDelete) {
        // Eliminação definitiva
        await deleteDoc(dealRef);
        console.log(`Negócio ${dealId} eliminado permanentemente`);
      } else {
        // Soft delete (recomendado)
        await updateDoc(dealRef, {
          isActive: false,
          status: UNIFIED_DEAL_STATUS.CANCELADO,
          deletedAt: serverTimestamp(),
          deletedBy: user.uid,
          updatedAt: serverTimestamp()
        });
        console.log(`Negócio ${dealId} marcado como cancelado`);
      }
      
      // Remover da lista local
      setDeals(prev => prev.filter(d => d.id !== dealId));
      
      // Atualizar contador da oportunidade
      if (deal?.opportunityId) {
        await updateOpportunityDealCount(deal.opportunityId, 'decrement');
      }

      return { 
        success: true, 
        message: hardDelete ? 'Negócio eliminado permanentemente!' : 'Negócio cancelado!' 
      };
      
    } catch (err) {
      console.error('Erro ao eliminar negócio:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setDeleting(false);
    }
  }, [isUserReady, user, deals]);

  // 📝 ADICIONAR ATIVIDADE AO NEGÓCIO
  // ================================
  const addActivity = useCallback(async (dealId, activityData) => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    try {
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
        structureVersion: '3.0'
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

      await updateDeal(dealId, updateData);

      console.log(`Atividade adicionada ao negócio ${dealId}`);
      
      return { success: true, activity, message: 'Atividade registada com sucesso!' };
      
    } catch (err) {
      console.error('Erro ao adicionar atividade:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, user, deals, updateDeal]);

  // 🔍 PESQUISAR NEGÓCIOS
  // =====================
  const searchDeals = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  // 🏠 CRIAR VISITA AUTOMÁTICA A PARTIR DO DEAL (FASE 3)
// ====================================================
const autoCreateVisitFromDeal = useCallback(async (dealId, visitData) => {
  if (!user?.uid || !dealId) {
    setError('Dados inválidos para criar visita');
    return { success: false, message: 'Dados inválidos' };
  }

  try {
    // 1. BUSCAR DADOS DO DEAL
    const dealRef = doc(db, 'deals', dealId);
    const dealSnap = await getDoc(dealRef);
    
    if (!dealSnap.exists()) {
      throw new Error('Negócio não encontrado');
    }

    const dealData = dealSnap.data();

    // 2. VALIDAR DADOS MÍNIMOS PARA VISITA
    if (!visitData.scheduledDate) {
      throw new Error('Data da visita é obrigatória');
    }

    if (!visitData.scheduledTime) {
      throw new Error('Hora da visita é obrigatória');
    }

    // 3. PREPARAR DADOS DA VISITA
    const baseVisitData = {
      // Referências do deal
      dealId: dealId,
      opportunityId: dealData.opportunityId || '',
      clientId: dealData.clientId,
      leadId: dealData.originalLeadId || '',
      
      // Dados do cliente
      clientName: dealData.clientName,
      clientPhone: dealData.clientPhone,
      clientEmail: dealData.clientEmail,
      
      // Dados da propriedade
      propertyId: dealData.propertyId || '',
      propertyAddress: dealData.propertyAddress || visitData.propertyAddress,
      propertyType: dealData.propertyType || visitData.propertyType || 'casa',
      
      // Dados da visita
      title: visitData.title || `Visita - ${dealData.propertyAddress}`,
      description: visitData.description || `Visita à propriedade relacionada com o negócio: ${dealData.title}`,
      
      // Agendamento
      scheduledDate: Timestamp.fromDate(new Date(visitData.scheduledDate)),
      scheduledTime: visitData.scheduledTime,
      duration: visitData.duration || 60, // minutos
      
      // Status e controlo
      status: 'agendada',
      visitType: visitData.visitType || 'mostrar',
      priority: visitData.priority || dealData.priority || 'normal',
      
      // Confirmações (sistema duplo)
      clientConfirmed: false,
      consultorConfirmed: false,
      confirmedAt: null,
      
      // Resultados (para depois da visita)
      result: '',
      feedback: '',
      interested: null,
      nextSteps: '',
      followUpDate: null,
      
      // Notas
      notes: visitData.notes || `Visita automática criada a partir do negócio: ${dealData.title}`,
      internalNotes: visitData.internalNotes || '',
      
      // Partilha (se necessário)
      sharedWith: visitData.sharedWith || [],
      shareNotes: visitData.shareNotes || '',
      
      // Campos de auditoria
      userId: user.uid,
      userEmail: user.email,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      createdBy: user.uid,
      lastModifiedBy: user.uid,
      
      // Rastreamento e metadados
      source: `auto_created_from_deal_${dealId}`,
      autoCreated: true,
      structureVersion: '3.0',
      metadata: {
        autoCreatedFromDeal: true,
        creationDate: new Date().toISOString(),
        dealTitle: dealData.title,
        dealValue: dealData.value,
        userAgent: navigator.userAgent
      }
    };

    // 4. CRIAR VISITA NO FIREBASE
    const visitDocRef = await addDoc(collection(db, 'visits'), baseVisitData);

    // 5. ATUALIZAR DEAL COM REFERÊNCIA À VISITA
    await updateDoc(dealRef, {
      hasVisits: true,
      lastVisitId: visitDocRef.id,
      lastVisitScheduled: Timestamp.now(),
      updatedAt: Timestamp.now(),
      
      // Array de visitas (se não existir, criar)
      visitIds: arrayUnion(visitDocRef.id)
    });

    // 6. CRIAR EVENTOS AUTOMÁTICOS NO CALENDÁRIO
    const calendarEvents = await createCalendarEventsForVisit(visitDocRef.id, baseVisitData);

    // 7. CRIAR TAREFAS DE LEMBRETE AUTOMÁTICAS
    const reminderTasks = await createVisitReminderTasks(visitDocRef.id, baseVisitData);

    // 8. ADICIONAR ATIVIDADE AO DEAL
    await addActivity(dealId, {
      type: 'visit_created',
      description: `Visita automática criada para ${baseVisitData.scheduledDate.toDate().toLocaleDateString('pt-PT')} às ${baseVisitData.scheduledTime}`,
      visitId: visitDocRef.id
    });

    console.log(`Visita ${visitDocRef.id} criada automaticamente para deal ${dealId}`);
    console.log(`${calendarEvents.length} eventos de calendário criados`);
    console.log(`${reminderTasks.length} tarefas de lembrete criadas`);
    
    return {
      success: true,
      dealId: dealId,
      visitId: visitDocRef.id,
      calendarEventsCreated: calendarEvents.length,
      reminderTasksCreated: reminderTasks.length,
      message: `Visita criada automaticamente! ${calendarEvents.length} eventos no calendário e ${reminderTasks.length} lembretes criados.`
    };

  } catch (err) {
    console.error('Erro ao criar visita automática:', err);
    setError(err.message || 'Erro ao criar visita automática');
    
    return {
      success: false,
      message: err.message || 'Erro ao criar visita automática'
    };
  }
}, [user?.uid, user?.email, addActivity]);

// CRIAR EVENTOS NO CALENDÁRIO PARA A VISITA
const createCalendarEventsForVisit = async (visitId, visitData) => {
  const events = [];
  
  try {
    const visitDateTime = new Date(visitData.scheduledDate.toDate());
    visitDateTime.setHours(
      parseInt(visitData.scheduledTime.split(':')[0]),
      parseInt(visitData.scheduledTime.split(':')[1])
    );

    // Evento principal da visita
    const mainEvent = {
      title: `VISITA: ${visitData.propertyAddress}`,
      description: `Visita com ${visitData.clientName}\nTelefone: ${visitData.clientPhone}\nEndereço: ${visitData.propertyAddress}`,
      type: 'visit',
      status: 'scheduled',
      
      startDate: Timestamp.fromDate(visitDateTime),
      startTime: visitData.scheduledTime,
      endTime: calculateEndTime(visitData.scheduledTime, visitData.duration),
      allDay: false,
      
      // Associações
      visitId: visitId,
      dealId: visitData.dealId,
      clientId: visitData.clientId,
      
      // Lembretes
      reminderTimes: [1440, 60, 15], // 1 dia, 1 hora, 15 minutos antes
      
      // Metadados
      userId: visitData.userId,
      userEmail: visitData.userEmail,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      autoCreated: true,
      source: `visit_${visitId}`
    };

    const mainEventRef = await addDoc(collection(db, 'calendar_events'), mainEvent);
    events.push({ id: mainEventRef.id, ...mainEvent });

    console.log(`Evento principal criado no calendário: ${mainEventRef.id}`);

  } catch (err) {
    console.warn('Erro ao criar eventos no calendário:', err);
  }
  
  return events;
};

// CRIAR TAREFAS DE LEMBRETE PARA A VISITA
const createVisitReminderTasks = async (visitId, visitData) => {
  const tasks = [];
  
  try {
    const visitDateTime = new Date(visitData.scheduledDate.toDate());
    
    // Tarefa: Lembrete 1 dia antes
    const oneDayBefore = new Date(visitDateTime.getTime() - 24 * 60 * 60 * 1000);
    const reminderTask1 = {
      title: 'Lembrete: Visita amanhã',
      description: `Lembrete para visita com ${visitData.clientName} amanhã às ${visitData.scheduledTime}`,
      type: 'lembrete',
      priority: 'media',
      status: 'pendente',
      dueDate: Timestamp.fromDate(oneDayBefore),
      
      associatedTo: 'visita',
      associatedId: visitId,
      associatedName: visitData.title,
      visitId: visitId,
      dealId: visitData.dealId,
      clientId: visitData.clientId,
      
      userId: visitData.userId,
      userEmail: visitData.userEmail,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      autoCreated: true
    };
    
    const reminderTask1Ref = await addDoc(collection(db, 'tasks'), reminderTask1);
    tasks.push({ id: reminderTask1Ref.id, ...reminderTask1 });

    // Tarefa: Lembrete 6 horas antes
    const sixHoursBefore = new Date(visitDateTime.getTime() - 6 * 60 * 60 * 1000);
    const reminderTask2 = {
      title: 'Lembrete: Visita hoje',
      description: `Confirmar visita com ${visitData.clientName} hoje às ${visitData.scheduledTime}`,
      type: 'ligacao',
      priority: 'alta',
      status: 'pendente',
      dueDate: Timestamp.fromDate(sixHoursBefore),
      
      associatedTo: 'visita',
      associatedId: visitId,
      associatedName: visitData.title,
      visitId: visitId,
      dealId: visitData.dealId,
      clientId: visitData.clientId,
      
      userId: visitData.userId,
      userEmail: visitData.userEmail,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      autoCreated: true
    };
    
    const reminderTask2Ref = await addDoc(collection(db, 'tasks'), reminderTask2);
    tasks.push({ id: reminderTask2Ref.id, ...reminderTask2 });

    // Tarefa: Follow-up pós-visita
    const followUpDate = new Date(visitDateTime.getTime() + 24 * 60 * 60 * 1000);
    const followUpTask = {
      title: 'Follow-up pós-visita',
      description: `Contactar ${visitData.clientName} para feedback da visita de ontem`,
      type: 'follow_up',
      priority: 'alta',
      status: 'pendente',
      dueDate: Timestamp.fromDate(followUpDate),
      
      associatedTo: 'visita',
      associatedId: visitId,
      associatedName: visitData.title,
      visitId: visitId,
      dealId: visitData.dealId,
      clientId: visitData.clientId,
      
      userId: visitData.userId,
      userEmail: visitData.userEmail,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      autoCreated: true
    };
    
    const followUpTaskRef = await addDoc(collection(db, 'tasks'), followUpTask);
    tasks.push({ id: followUpTaskRef.id, ...followUpTask });

    console.log(`${tasks.length} tarefas de lembrete criadas para visita ${visitId}`);

  } catch (err) {
    console.warn('Erro ao criar tarefas de lembrete:', err);
  }
  
  return tasks;
};

// FUNÇÃO AUXILIAR: Calcular hora de fim baseada na duração
const calculateEndTime = (startTime, durationMinutes) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  
  const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
  
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
};


  // 📊 ESTATÍSTICAS UNIFICADAS
  // ==========================
  const getDealStats = useCallback(() => {
    const stats = {
      total: deals.length,
      byStatus: {},
      byDealType: {},
      byPriority: {},
      byContractStatus: {},
      financials: {
        totalValue: 0,
        totalCommission: 0,
        expectedValue: 0,
        averageValue: 0,
        conversionRate: 0,
        totalTaxes: 0
      }
    };

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

    // Calcular métricas financeiras
    const totalValue = deals.reduce((sum, deal) => sum + (deal.dealValue || 0), 0);
    const totalCommission = deals.reduce((sum, deal) => sum + (deal.commissionValue || 0), 0);
    const expectedValue = deals.reduce((sum, deal) => sum + (deal.expectedValue || 0), 0);
    const totalTaxes = deals.reduce((sum, deal) => sum + (deal.totalTaxes || 0), 0);
    
    const closedCount = stats.byStatus[UNIFIED_DEAL_STATUS.ESCRITURA_REALIZADA] || 0;
    const cancelledCount = stats.byStatus[UNIFIED_DEAL_STATUS.CANCELADO] || 0;
    const totalClosed = closedCount + cancelledCount;
    
    stats.financials = {
      totalValue,
      totalCommission,
      expectedValue,
      totalTaxes,
      averageValue: stats.total > 0 ? totalValue / stats.total : 0,
      conversionRate: totalClosed > 0 ? (closedCount / totalClosed * 100).toFixed(1) : 0
    };

    return stats;
  }, [deals]);

  // 🔧 FUNÇÕES AUXILIARES
  // =====================
  const updateOpportunityDealCount = async (opportunityId, action) => {
    try {
      const oppRef = doc(db, OPPORTUNITIES_COLLECTION, opportunityId);
      const oppDoc = await getDoc(oppRef);
      
      if (oppDoc.exists()) {
        const currentCount = oppDoc.data().dealCount || 0;
        const newCount = action === 'increment' ? currentCount + 1 : Math.max(0, currentCount - 1);
        
        await updateDoc(oppRef, {
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

  // 🔄 EFFECTS
  // ==========
  useEffect(() => {
    if (isUserReady) {
      console.log('useDeals: Utilizador pronto, carregando negócios...');
      fetchDeals();
    }
  }, [isUserReady, fetchDeals]);

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
    
    // Novos: constantes unificadas
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
    
    // Informações da estrutura
    structureVersion: '3.0',
    isUnified: true
  };
};

export default useDeals;