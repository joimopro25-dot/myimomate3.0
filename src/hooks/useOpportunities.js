// src/hooks/useOpportunities.js
// 🎯 HOOK UNIFICADO PARA GESTÃO DE OPORTUNIDADES - MyImoMate 3.0
// ==============================================================
// VERSÃO UNIFICADA com estrutura padronizada
// Funcionalidades: Pipeline de Vendas, CRUD, Validações Unificadas, Estrutura Base

import { useState, useEffect, useCallback } from 'react';
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
  UNIFIED_INTEREST_TYPES,
  UNIFIED_BUDGET_RANGES,
  UNIFIED_OPPORTUNITY_STATUS,
  UNIFIED_OPPORTUNITY_PROBABILITIES,
  UNIFIED_PRIORITIES,
  UNIFIED_PROPERTY_TYPES,
  getInterestTypeLabel,
  getBudgetRangeLabel,
  formatCurrency,
  getOpportunityProbability
} from '../constants/unifiedTypes.js';

import {
  CORE_DATA_STRUCTURE,
  PROPERTY_DATA_STRUCTURE,
  applyCoreStructure,
  validateCoreStructure,
  OPPORTUNITY_TEMPLATE
} from '../constants/coreStructure.js';

import {
  validateOpportunity,
  validateForDuplicates,
  formatValidatedData,
  validateCurrency,
  validateCommissionPercentage
} from '../constants/validations.js';

// 🔧 CONFIGURAÇÕES DO HOOK
// ========================
const OPPORTUNITIES_COLLECTION = 'opportunities';
const CLIENTS_COLLECTION = 'clients';
const DEALS_COLLECTION = 'deals';
const FETCH_LIMIT = 100;

// 🎯 TIPOS DE OPORTUNIDADE ESPECÍFICOS
export const OPPORTUNITY_TYPES = {
  VENDAS: 'vendas',
  CAPTACAO: 'captacao',
  ARRENDAMENTO: 'arrendamento',
  INVESTIMENTO: 'investimento',
  AVALIACAO: 'avaliacao',
  CONSULTORIA: 'consultoria'
};

export const OPPORTUNITY_TYPE_LABELS = {
  [OPPORTUNITY_TYPES.VENDAS]: 'Vendas',
  [OPPORTUNITY_TYPES.CAPTACAO]: 'Captação',
  [OPPORTUNITY_TYPES.ARRENDAMENTO]: 'Arrendamento',
  [OPPORTUNITY_TYPES.INVESTIMENTO]: 'Investimento',
  [OPPORTUNITY_TYPES.AVALIACAO]: 'Avaliação',
  [OPPORTUNITY_TYPES.CONSULTORIA]: 'Consultoria'
};

// 🎨 CORES PARA STATUS (usando constantes unificadas)
export const OPPORTUNITY_STATUS_COLORS = {
  [UNIFIED_OPPORTUNITY_STATUS.IDENTIFICACAO]: 'bg-blue-100 text-blue-800 border-blue-200',
  [UNIFIED_OPPORTUNITY_STATUS.QUALIFICACAO]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [UNIFIED_OPPORTUNITY_STATUS.APRESENTACAO]: 'bg-orange-100 text-orange-800 border-orange-200',
  [UNIFIED_OPPORTUNITY_STATUS.NEGOCIACAO]: 'bg-purple-100 text-purple-800 border-purple-200',
  [UNIFIED_OPPORTUNITY_STATUS.PROPOSTA]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  [UNIFIED_OPPORTUNITY_STATUS.CONTRATO]: 'bg-green-100 text-green-800 border-green-200',
  [UNIFIED_OPPORTUNITY_STATUS.FECHADO_GANHO]: 'bg-green-100 text-green-800 border-green-200',
  [UNIFIED_OPPORTUNITY_STATUS.FECHADO_PERDIDO]: 'bg-red-100 text-red-800 border-red-200',
  [UNIFIED_OPPORTUNITY_STATUS.PAUSADO]: 'bg-gray-100 text-gray-800 border-gray-200'
};

// 📊 TIPOS DE ATIVIDADE
export const ACTIVITY_TYPES = {
  CHAMADA: 'chamada',
  EMAIL: 'email',
  REUNIAO: 'reuniao',
  VISITA: 'visita',
  PROPOSTA: 'proposta',
  NEGOCIACAO: 'negociacao',
  FOLLOW_UP: 'follow_up',
  DOCUMENTO: 'documento',
  OUTRO: 'outro'
};

export const ACTIVITY_TYPE_LABELS = {
  [ACTIVITY_TYPES.CHAMADA]: 'Chamada',
  [ACTIVITY_TYPES.EMAIL]: 'Email',
  [ACTIVITY_TYPES.REUNIAO]: 'Reunião',
  [ACTIVITY_TYPES.VISITA]: 'Visita a Imóvel',
  [ACTIVITY_TYPES.PROPOSTA]: 'Proposta Enviada',
  [ACTIVITY_TYPES.NEGOCIACAO]: 'Negociação',
  [ACTIVITY_TYPES.FOLLOW_UP]: 'Follow-up',
  [ACTIVITY_TYPES.DOCUMENTO]: 'Documento',
  [ACTIVITY_TYPES.OUTRO]: 'Outro'
};

// 🎯 HOOK PRINCIPAL UNIFICADO
// ===========================
const useOpportunities = () => {
  // Estados principais
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estados de filtros expandidos
  const [filters, setFilters] = useState({
    status: '',
    opportunityType: '',
    priority: '',
    interestType: '',
    budgetRange: '',
    clientId: '',
    propertyType: '',
    dateRange: 'all',
    searchTerm: ''
  });

  // Context de autenticação
  const { user } = useAuth();
  const isUserReady = !!user;

  // 📥 BUSCAR TODAS AS OPORTUNIDADES COM ESTRUTURA UNIFICADA
  // =======================================================
  const fetchOpportunities = useCallback(async () => {
    if (!isUserReady) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Query simplificada para evitar problemas de índice
      let oppQuery = query(
        collection(db, OPPORTUNITIES_COLLECTION),
        where('userId', '==', user.uid),
        limit(FETCH_LIMIT)
      );

      const querySnapshot = await getDocs(oppQuery);
      const oppsData = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          
          // Aplicar migração automática se necessário
          const migratedData = migrateOpportunityData(data);
          
          return {
            id: doc.id,
            ...migratedData,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            expectedCloseDate: data.expectedCloseDate?.toDate(),
            actualCloseDate: data.actualCloseDate?.toDate(),
            lastActivityDate: data.lastActivityDate?.toDate()
          };
        })
        .filter(opp => opp.isActive !== false) // Filtrar inativos
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); // Ordenar por data

      // Aplicar filtros client-side
      let filteredOpportunities = oppsData;
      
      if (filters.status && Object.values(UNIFIED_OPPORTUNITY_STATUS).includes(filters.status)) {
        filteredOpportunities = filteredOpportunities.filter(opp => opp.status === filters.status);
      }
      
      if (filters.opportunityType) {
        filteredOpportunities = filteredOpportunities.filter(opp => opp.opportunityType === filters.opportunityType);
      }
      
      if (filters.priority && Object.values(UNIFIED_PRIORITIES).includes(filters.priority)) {
        filteredOpportunities = filteredOpportunities.filter(opp => opp.priority === filters.priority);
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredOpportunities = filteredOpportunities.filter(opp => 
          opp.title?.toLowerCase().includes(term) ||
          opp.description?.toLowerCase().includes(term) ||
          opp.clientName?.toLowerCase().includes(term) ||
          opp.propertyAddress?.toLowerCase().includes(term)
        );
      }

      setOpportunities(filteredOpportunities);
      console.log(`Carregadas ${filteredOpportunities.length} oportunidades com estrutura unificada`);
      
    } catch (err) {
      console.error('Erro ao buscar oportunidades:', err);
      setError(`Erro ao carregar oportunidades: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [isUserReady, user, filters]);

  // 🔄 MIGRAÇÃO AUTOMÁTICA DE DADOS ANTIGOS
  // =======================================
  const migrateOpportunityData = useCallback((oldData) => {
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
      
      // Migrar status de oportunidade
      status: migrateOpportunityStatus(oldData.status),
      
      // Migrar tipos de interesse
      interestType: migrateInterestType(oldData.interestType),
      
      // Migrar faixas de orçamento
      budgetRange: migrateBudgetRange(oldData.budgetRange),
      
      // Atualizar probabilidade baseada no status
      probability: getOpportunityProbability(oldData.status) || oldData.probability || 10,
      
      // Garantir campos obrigatórios
      title: oldData.title || oldData.name || 'Oportunidade sem título',
      
      // Adicionar campos novos
      structureVersion: '3.0',
      migratedAt: new Date().toISOString(),
      
      // Garantir referências cruzadas
      leadId: oldData.leadId || null,
      clientId: oldData.clientId || null,
      opportunityId: oldData.id || null,
      dealId: oldData.dealId || null
    };

    return migrated;
  }, []);

  // 🔄 FUNÇÕES DE MIGRAÇÃO ESPECÍFICAS
  // ==================================
  const migrateOpportunityStatus = (oldStatus) => {
    const statusMap = {
      'identificacao': UNIFIED_OPPORTUNITY_STATUS.IDENTIFICACAO,
      'qualificacao': UNIFIED_OPPORTUNITY_STATUS.QUALIFICACAO,
      'apresentacao': UNIFIED_OPPORTUNITY_STATUS.APRESENTACAO,
      'negociacao': UNIFIED_OPPORTUNITY_STATUS.NEGOCIACAO,
      'proposta': UNIFIED_OPPORTUNITY_STATUS.PROPOSTA,
      'contrato': UNIFIED_OPPORTUNITY_STATUS.CONTRATO,
      'fechado_ganho': UNIFIED_OPPORTUNITY_STATUS.FECHADO_GANHO,
      'fechado_perdido': UNIFIED_OPPORTUNITY_STATUS.FECHADO_PERDIDO,
      'pausado': UNIFIED_OPPORTUNITY_STATUS.PAUSADO
    };
    return statusMap[oldStatus] || UNIFIED_OPPORTUNITY_STATUS.IDENTIFICACAO;
  };

  const migrateInterestType = (oldType) => {
    const typeMap = {
      'compra_casa': UNIFIED_INTEREST_TYPES.COMPRA_CASA,
      'compra_apartamento': UNIFIED_INTEREST_TYPES.COMPRA_APARTAMENTO,
      'venda_casa': UNIFIED_INTEREST_TYPES.VENDA_CASA,
      'venda_apartamento': UNIFIED_INTEREST_TYPES.VENDA_APARTAMENTO,
      'arrendamento_casa': UNIFIED_INTEREST_TYPES.ARRENDAMENTO_CASA,
      'arrendamento_apartamento': UNIFIED_INTEREST_TYPES.ARRENDAMENTO_APARTAMENTO
    };
    return typeMap[oldType] || UNIFIED_INTEREST_TYPES.COMPRA_CASA;
  };

  const migrateBudgetRange = (oldRange) => {
    const rangeMap = {
      'ate_100k': UNIFIED_BUDGET_RANGES.ATE_100K,
      '100k_200k': UNIFIED_BUDGET_RANGES.DE_100K_200K,
      '200k_300k': UNIFIED_BUDGET_RANGES.DE_200K_300K,
      '300k_500k': UNIFIED_BUDGET_RANGES.DE_300K_500K,
      '500k_750k': UNIFIED_BUDGET_RANGES.DE_500K_750K,
      '750k_1M': UNIFIED_BUDGET_RANGES.DE_750K_1M,
      '1M+': UNIFIED_BUDGET_RANGES.ACIMA_1M
    };
    return rangeMap[oldRange] || UNIFIED_BUDGET_RANGES.INDEFINIDO;
  };

  // ➕ CRIAR NOVA OPORTUNIDADE COM ESTRUTURA UNIFICADA
  // =================================================
  const createOpportunity = useCallback(async (opportunityData) => {
    if (!isUserReady) {
      throw new Error('Utilizador não autenticado');
    }

    setCreating(true);
    setError(null);

    try {
      // 1. VALIDAÇÃO BÁSICA
      if (!opportunityData.title?.trim()) {
        throw new Error('Título é obrigatório');
      }
      
      if (!opportunityData.clientId?.trim()) {
        throw new Error('Cliente é obrigatório');
      }

      // Validações específicas
      if (opportunityData.estimatedValue && !validateCurrency(opportunityData.estimatedValue)) {
        throw new Error('Valor estimado inválido');
      }

      if (opportunityData.commissionPercentage && !validateCommissionPercentage(opportunityData.commissionPercentage)) {
        throw new Error('Percentagem de comissão deve estar entre 0 e 100');
      }

      // 2. PREPARAR DADOS COM ESTRUTURA UNIFICADA
      const estimatedValue = parseFloat(opportunityData.estimatedValue) || 0;
      const commissionPercentage = parseFloat(opportunityData.commissionPercentage) || 2.5;
      const commissionValue = (estimatedValue * commissionPercentage) / 100;
      const probability = getOpportunityProbability(opportunityData.status) || 10;
      const pipelineValue = (estimatedValue * probability) / 100;

      // 3. CRIAR OBJETO DA OPORTUNIDADE COM ESTRUTURA UNIFICADA
      const newOpportunity = {
        // Dados básicos obrigatórios
        title: opportunityData.title.trim(),
        description: opportunityData.description?.trim() || '',
        
        // Referências obrigatórias
        clientId: opportunityData.clientId,
        clientName: opportunityData.clientName?.trim() || '',
        
        // Dados de interesse com estrutura unificada
        interestType: opportunityData.interestType || UNIFIED_INTEREST_TYPES.COMPRA_CASA,
        budgetRange: opportunityData.budgetRange || UNIFIED_BUDGET_RANGES.INDEFINIDO,
        
        // Dados de propriedade (PROPERTY_DATA_STRUCTURE)
        propertyReference: opportunityData.propertyReference?.trim() || '',
        propertyType: opportunityData.propertyType || '',
        propertyAddress: {
          street: opportunityData.propertyAddress?.street?.trim() || '',
          postalCode: opportunityData.propertyAddress?.postalCode?.trim() || '',
          city: opportunityData.propertyAddress?.city?.trim() || '',
          district: opportunityData.propertyAddress?.district?.trim() || '',
          coordinates: opportunityData.propertyAddress?.coordinates || null
        },
        propertyFeatures: {
          area: opportunityData.propertyFeatures?.area || null,
          bedrooms: opportunityData.propertyFeatures?.bedrooms || null,
          bathrooms: opportunityData.propertyFeatures?.bathrooms || null,
          parkingSpaces: opportunityData.propertyFeatures?.parkingSpaces || null,
          buildYear: opportunityData.propertyFeatures?.buildYear || null,
          condition: opportunityData.propertyFeatures?.condition || '',
          energyRating: opportunityData.propertyFeatures?.energyRating || ''
        },
        
        // Dados financeiros
        estimatedValue: estimatedValue,
        commissionPercentage: commissionPercentage,
        commissionValue: commissionValue,
        pipelineValue: pipelineValue,
        
        // Pipeline e status
        status: opportunityData.status || UNIFIED_OPPORTUNITY_STATUS.IDENTIFICACAO,
        probability: probability,
        opportunityType: opportunityData.opportunityType || OPPORTUNITY_TYPES.VENDAS,
        priority: opportunityData.priority || UNIFIED_PRIORITIES.NORMAL,
        
        // Datas importantes
        expectedCloseDate: opportunityData.expectedCloseDate || null,
        lastActivityDate: null,
        actualCloseDate: null,
        
        // Atividades e histórico
        activities: [],
        documents: [],
        notes: opportunityData.notes?.trim() || '',
        
        // Dados de auditoria obrigatórios
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Flags de controlo
        isActive: true,
        isConverted: false,
        
        // Referências cruzadas
        leadId: opportunityData.leadId || null,
        clientId: opportunityData.clientId,
        opportunityId: null, // Auto-preenchido após criação
        dealId: null,
        
        // Fonte e rastreamento
        source: opportunityData.source || 'manual',
        
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
      const docRef = await addDoc(collection(db, OPPORTUNITIES_COLLECTION), newOpportunity);
      
      // 5. CRIAR OBJETO COMPLETO PARA RETORNO
      const createdOpportunity = {
        id: docRef.id,
        ...newOpportunity,
        opportunityId: docRef.id, // Atualizar referência própria
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 6. ATUALIZAR LISTA LOCAL
      setOpportunities(prev => [createdOpportunity, ...prev]);

      // 7. ATUALIZAR CONTADOR DO CLIENTE
      if (opportunityData.clientId) {
        await updateClientOpportunityCount(opportunityData.clientId, 'increment');
      }

      console.log('Oportunidade criada com estrutura unificada:', docRef.id);
      
      return {
        success: true,
        opportunity: createdOpportunity,
        message: 'Oportunidade criada com sucesso!'
      };

    } catch (err) {
      console.error('Erro ao criar oportunidade:', err);
      setError(err.message);
      
      return {
        success: false,
        error: err.message,
        message: `Erro ao criar oportunidade: ${err.message}`
      };
    } finally {
      setCreating(false);
    }
  }, [isUserReady, user]);

  // 🔄 ATUALIZAR OPORTUNIDADE
  // =========================
  const updateOpportunity = useCallback(async (opportunityId, updates) => {
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
        updateData.probability = getOpportunityProbability(updates.status) || updateData.probability;
      }

      // Recalcular valores monetários se necessário
      if (updates.estimatedValue !== undefined || updates.commissionPercentage !== undefined) {
        const currentOpp = opportunities.find(opp => opp.id === opportunityId);
        const estimatedValue = parseFloat(updates.estimatedValue) || currentOpp?.estimatedValue || 0;
        const commissionPercentage = parseFloat(updates.commissionPercentage) || currentOpp?.commissionPercentage || 2.5;
        
        updateData.estimatedValue = estimatedValue;
        updateData.commissionPercentage = commissionPercentage;
        updateData.commissionValue = (estimatedValue * commissionPercentage) / 100;
        updateData.pipelineValue = (estimatedValue * updateData.probability) / 100;
      }

      // Atualizar na base de dados
      const oppRef = doc(db, OPPORTUNITIES_COLLECTION, opportunityId);
      await updateDoc(oppRef, updateData);
      
      // Atualizar lista local
      setOpportunities(prev => prev.map(opp => 
        opp.id === opportunityId 
          ? { ...opp, ...updateData, updatedAt: new Date() }
          : opp
      ));

      console.log(`Oportunidade ${opportunityId} atualizada`);
      
      return { success: true, message: 'Oportunidade atualizada com sucesso!' };
      
    } catch (err) {
      console.error('Erro ao atualizar oportunidade:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, [isUserReady, user, opportunities]);

  // 🔄 ATUALIZAR STATUS DA OPORTUNIDADE COM AUDITORIA
  // =================================================
  const updateOpportunityStatus = useCallback(async (opportunityId, newStatus, reason = '') => {
    if (!isUserReady) return;

    try {
      // Validar se o status é válido
      if (!Object.values(UNIFIED_OPPORTUNITY_STATUS).includes(newStatus)) {
        throw new Error(`Status inválido: ${newStatus}`);
      }

      const updates = { 
        status: newStatus,
        probability: getOpportunityProbability(newStatus) || 0,
        statusChangeReason: reason.trim(),
        
        // Auditoria de mudança de status
        [`statusHistory.change_${Date.now()}`]: {
          to: newStatus,
          changedBy: user.uid,
          changedAt: new Date().toISOString(),
          reason: reason.trim(),
          userAgent: navigator.userAgent
        }
      };

      // Se fechou (ganho ou perdido), adicionar data de fecho
      if (newStatus === UNIFIED_OPPORTUNITY_STATUS.FECHADO_GANHO || 
          newStatus === UNIFIED_OPPORTUNITY_STATUS.FECHADO_PERDIDO) {
        updates.actualCloseDate = serverTimestamp();
        updates.isConverted = newStatus === UNIFIED_OPPORTUNITY_STATUS.FECHADO_GANHO;
      }

      const result = await updateOpportunity(opportunityId, updates);
      
      if (result.success) {
        console.log(`Status da oportunidade ${opportunityId} atualizado para: ${newStatus}`);
      }
      
      return result;

    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, user, updateOpportunity]);

// 🔄 CONVERTER OPORTUNIDADE PARA DEAL/NEGÓCIO (FASE 3)
// ====================================================
const convertOpportunityToDeal = useCallback(async (opportunityId, dealData = {}) => {
  if (!isUserReady || !user?.uid || !opportunityId) {
    setError('Dados inválidos para conversão');
    return { success: false, message: 'Dados inválidos' };
  }

  setUpdating(true); // Usar setUpdating em vez de setConverting
  setError(null);

  try {
    // 1. BUSCAR DADOS DA OPORTUNIDADE
    const opportunityRef = doc(db, OPPORTUNITIES_COLLECTION, opportunityId);
    const opportunitySnap = await getDoc(opportunityRef);
    
    if (!opportunitySnap.exists()) {
      throw new Error('Oportunidade não encontrada');
    }

    const opportunityData = opportunitySnap.data();

    // 2. VERIFICAR SE JÁ FOI CONVERTIDA
    if (opportunityData.isConverted) {
      throw new Error('Oportunidade já foi convertida para negócio');
    }

    // 3. VALIDAR DADOS MÍNIMOS PARA DEAL
    if (!dealData.propertyAddress && !dealData.propertyId) {
      throw new Error('Endereço ou ID da propriedade é obrigatório para criar negócio');
    }

    if (!dealData.dealValue && !opportunityData.estimatedValue) {
      throw new Error('Valor do negócio é obrigatório');
    }

    // 4. PREPARAR DADOS DO DEAL/NEGÓCIO
    const baseDealData = {
      // Referências da oportunidade
      opportunityId: opportunityId,
      clientId: opportunityData.clientId,
      clientName: opportunityData.clientName,
      clientPhone: opportunityData.clientPhone,
      clientEmail: opportunityData.clientEmail,
      
      // Dados do negócio
      title: dealData.title || `Negócio ${opportunityData.interestType} - ${opportunityData.clientName}`,
      description: dealData.description || `Negócio criado a partir da oportunidade: ${opportunityData.title}`,
      
      // Tipo e categoria
      dealType: dealData.dealType || getDealTypeFromInterest(opportunityData.interestType),
      interestType: opportunityData.interestType,
      category: dealData.category || 'residencial',
      
      // Status e pipeline
      status: dealData.status || 'proposta', // Status inicial do deal
      priority: dealData.priority || opportunityData.priority || 'normal',
      
      // Dados financeiros
      dealValue: dealData.dealValue || opportunityData.estimatedValue,
      commissionPercentage: dealData.commissionPercentage || opportunityData.commissionPercentage || 2.5,
      commissionValue: 0, // Calculado automaticamente
      expectedCommission: 0, // Calculado automaticamente
      
      // Dados da propriedade
      propertyId: dealData.propertyId || '',
      propertyAddress: dealData.propertyAddress || '',
      propertyType: dealData.propertyType || opportunityData.propertyType || '',
      propertySize: dealData.propertySize || '',
      propertyCondition: dealData.propertyCondition || 'bom',
      
      // Datas importantes
      proposalDate: dealData.proposalDate || new Date(),
      expectedClosingDate: dealData.expectedClosingDate || opportunityData.expectedCloseDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
      
      // Financiamento (se aplicável)
      financing: {
        required: dealData.financingRequired || false,
        bank: dealData.financingBank || '',
        amount: dealData.financingAmount || 0,
        status: dealData.financingStatus || 'pendente',
        preApproved: dealData.preApproved || false
      },
      
      // Partes envolvidas
      buyerName: dealData.buyerName || (opportunityData.interestType && opportunityData.interestType.includes('compra') ? opportunityData.clientName : ''),
      sellerName: dealData.sellerName || (opportunityData.interestType && opportunityData.interestType.includes('venda') ? opportunityData.clientName : ''),
      
      // Documentação
      documentsRequired: dealData.documentsRequired || getRequiredDocuments(opportunityData.interestType),
      documentsStatus: 'pendente',
      
      // Notas e observações
      notes: dealData.notes || `Negócio criado a partir da oportunidade: ${opportunityData.title}`,
      internalNotes: dealData.internalNotes || '',
      
      // Rastreamento
      source: `converted_from_opportunity_${opportunityId}`,
      originalOpportunityId: opportunityId,
      convertedAt: serverTimestamp(),
      
      // Campos de auditoria
      userId: user.uid,
      userEmail: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: user.uid,
      lastModifiedBy: user.uid,
      
      // Estrutura e metadados
      structureVersion: '3.0',
      metadata: {
        convertedFromOpportunity: true,
        conversionDate: new Date().toISOString(),
        opportunityTitle: opportunityData.title,
        opportunityValue: opportunityData.estimatedValue,
        userAgent: navigator.userAgent
      }
    };

    // 5. CALCULAR COMISSÕES AUTOMATICAMENTE
    if (baseDealData.dealValue && baseDealData.commissionPercentage) {
      baseDealData.commissionValue = (baseDealData.dealValue * baseDealData.commissionPercentage) / 100;
      baseDealData.expectedCommission = baseDealData.commissionValue;
    }

    // 6. CRIAR DEAL/NEGÓCIO NO FIREBASE
    const dealDocRef = await addDoc(collection(db, DEALS_COLLECTION), baseDealData);

    // 7. ATUALIZAR OPORTUNIDADE COMO CONVERTIDA
    await updateDoc(opportunityRef, {
      status: UNIFIED_OPPORTUNITY_STATUS.FECHADO_GANHO, // Oportunidade fechada com sucesso
      isConverted: true,
      convertedAt: serverTimestamp(),
      convertedToDealId: dealDocRef.id,
      updatedAt: serverTimestamp(),
      lastModifiedBy: user.uid,
      
      // Auditoria da conversão
      conversionAudit: {
        convertedBy: user.uid,
        convertedAt: new Date().toISOString(),
        dealId: dealDocRef.id,
        dealValue: baseDealData.dealValue,
        userAgent: navigator.userAgent
      }
    });

    // 8. CRIAR TAREFAS AUTOMÁTICAS INICIAIS PARA O DEAL
    const initialTasks = await createInitialDealTasks(dealDocRef.id, baseDealData);

    // 9. ATUALIZAR LISTA LOCAL DE OPORTUNIDADES
    setOpportunities(prev => 
      prev.map(opp => 
        opp.id === opportunityId 
          ? { 
              ...opp, 
              status: UNIFIED_OPPORTUNITY_STATUS.FECHADO_GANHO,
              isConverted: true,
              convertedAt: new Date(),
              convertedToDealId: dealDocRef.id,
              updatedAt: new Date()
            }
          : opp
      )
    );

    setUpdating(false); // Usar setUpdating
    
    console.log(`Oportunidade ${opportunityId} convertida para deal ${dealDocRef.id}`);
    
    return {
      success: true,
      opportunityId: opportunityId,
      dealId: dealDocRef.id,
      tasksCreated: initialTasks.length,
      message: `Oportunidade convertida para negócio com sucesso! ${initialTasks.length} tarefas iniciais criadas.`
    };

  } catch (err) {
    console.error('Erro ao converter oportunidade para deal:', err);
    setError(err.message || 'Erro ao converter oportunidade');
    setUpdating(false); // Usar setUpdating
    
    return {
      success: false,
      message: err.message || 'Erro ao converter oportunidade para negócio'
    };
  }
}, [isUserReady, user?.uid, user?.email]);

// FUNÇÕES AUXILIARES PARA CONVERSÃO (inalteradas)

// Determinar tipo de deal baseado no interesse
const getDealTypeFromInterest = (interestType) => {
  if (interestType && interestType.includes('venda')) return 'venda';
  if (interestType && interestType.includes('compra')) return 'compra';
  if (interestType && interestType.includes('arrendamento')) return 'arrendamento';
  if (interestType && interestType.includes('aluguer')) return 'aluguer';
  return 'venda'; // padrão
};

// Obter documentos obrigatórios por tipo de interesse
const getRequiredDocuments = (interestType) => {
  const baseDocuments = ['documento_identidade', 'nif'];
  
  if (interestType && interestType.includes('venda')) {
    return [...baseDocuments, 'certidao_predial', 'licenca_habitacao', 'certidao_energetica'];
  }
  
  if (interestType && interestType.includes('compra')) {
    return [...baseDocuments, 'comprovativo_rendimentos', 'declaracao_financeira'];
  }
  
  if (interestType && interestType.includes('arrendamento')) {
    return [...baseDocuments, 'contrato_arrendamento', 'comprovativo_seguros'];
  }
  
  return baseDocuments;
};

// Criar tarefas iniciais para o deal
const createInitialDealTasks = async (dealId, dealData) => {
  const tasks = [];
  
  try {
    // Tarefa 1: Preparar documentação
    const docTask = {
      title: 'Preparar documentação do negócio',
      description: 'Recolher e validar toda a documentação necessária',
      type: 'documentos',
      priority: 'alta',
      status: 'pendente',
      dueDate: Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)), // 3 dias
      associatedTo: 'negocio',
      associatedId: dealId,
      associatedName: dealData.title,
      dealId: dealId,
      clientId: dealData.clientId,
      userId: dealData.userId,
      userEmail: dealData.userEmail,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docTaskRef = await addDoc(collection(db, 'tasks'), docTask);
    tasks.push({ id: docTaskRef.id, ...docTask });

    // Tarefa 2: Agendar visita (se necessário)
    if (dealData.propertyAddress) {
      const visitTask = {
        title: 'Agendar visita à propriedade',
        description: `Agendar visita para ${dealData.propertyAddress}`,
        type: 'visita',
        priority: 'alta',
        status: 'pendente',
        dueDate: Timestamp.fromDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)), // 5 dias
        associatedTo: 'negocio',
        associatedId: dealId,
        associatedName: dealData.title,
        dealId: dealId,
        clientId: dealData.clientId,
        userId: dealData.userId,
        userEmail: dealData.userEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const visitTaskRef = await addDoc(collection(db, 'tasks'), visitTask);
      tasks.push({ id: visitTaskRef.id, ...visitTask });
    }

    // Tarefa 3: Follow-up com cliente
    const followUpTask = {
      title: 'Follow-up - Confirmação de interesse',
      description: `Contactar ${dealData.clientName} para confirmar interesse no negócio`,
      type: 'follow_up',
      priority: 'media',
      status: 'pendente',
      dueDate: Timestamp.fromDate(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)), // 1 dia
      associatedTo: 'negocio',
      associatedId: dealId,
      associatedName: dealData.title,
      dealId: dealId,
      clientId: dealData.clientId,
      userId: dealData.userId,
      userEmail: dealData.userEmail,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const followUpTaskRef = await addDoc(collection(db, 'tasks'), followUpTask);
    tasks.push({ id: followUpTaskRef.id, ...followUpTask });

    console.log(`${tasks.length} tarefas iniciais criadas para deal ${dealId}`);
    
  } catch (err) {
    console.warn('Erro ao criar tarefas iniciais:', err);
  }
  
  return tasks;
};


  // 🗑️ ELIMINAR OPORTUNIDADE (SOFT DELETE)
  // ======================================
  const deleteOpportunity = useCallback(async (opportunityId, hardDelete = false) => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    setDeleting(true);
    setError(null);
    
    try {
      const opportunity = opportunities.find(opp => opp.id === opportunityId);
      const oppRef = doc(db, OPPORTUNITIES_COLLECTION, opportunityId);
      
      if (hardDelete) {
        // Eliminação definitiva
        await deleteDoc(oppRef);
        console.log(`Oportunidade ${opportunityId} eliminada permanentemente`);
      } else {
        // Soft delete (recomendado)
        await updateDoc(oppRef, {
          isActive: false,
          status: UNIFIED_OPPORTUNITY_STATUS.FECHADO_PERDIDO,
          deletedAt: serverTimestamp(),
          deletedBy: user.uid,
          updatedAt: serverTimestamp()
        });
        console.log(`Oportunidade ${opportunityId} marcada como inativa`);
      }
      
      // Remover da lista local
      setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
      
      // Atualizar contador do cliente
      if (opportunity?.clientId) {
        await updateClientOpportunityCount(opportunity.clientId, 'decrement');
      }

      return { 
        success: true, 
        message: hardDelete ? 'Oportunidade eliminada permanentemente!' : 'Oportunidade removida da lista!' 
      };
      
    } catch (err) {
      console.error('Erro ao eliminar oportunidade:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setDeleting(false);
    }
  }, [isUserReady, user, opportunities]);

  // 📞 ADICIONAR ATIVIDADE À OPORTUNIDADE
  // ====================================
  const addActivity = useCallback(async (opportunityId, activityData) => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    try {
      const activity = {
        id: Date.now().toString(),
        type: activityData.type || ACTIVITY_TYPES.OUTRO,
        title: activityData.title?.trim() || '',
        description: activityData.description?.trim() || '',
        outcome: activityData.outcome?.trim() || '',
        nextAction: activityData.nextAction?.trim() || '',
        duration: activityData.duration || null,
        cost: activityData.cost || null,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email,
        structureVersion: '3.0'
      };

      // Encontrar a oportunidade
      const opportunity = opportunities.find(opp => opp.id === opportunityId);
      if (!opportunity) {
        return { success: false, error: 'Oportunidade não encontrada' };
      }

      const activities = [...(opportunity.activities || []), activity];
      
      const updateData = {
        activities,
        lastActivityDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateOpportunity(opportunityId, updateData);

      console.log(`Atividade adicionada à oportunidade ${opportunityId}`);
      
      return { success: true, activity, message: 'Atividade registada com sucesso!' };
      
    } catch (err) {
      console.error('Erro ao adicionar atividade:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, user, opportunities, updateOpportunity]);

  // 🔍 PESQUISAR OPORTUNIDADES
  // ==========================
  const searchOpportunities = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  // 📊 ESTATÍSTICAS UNIFICADAS
  // ==========================
  const getOpportunityStats = useCallback(() => {
    const stats = {
      total: opportunities.length,
      byStatus: {},
      byOpportunityType: {},
      byInterestType: {},
      byPriority: {},
      financials: {
        totalValue: 0,
        totalCommission: 0,
        pipelineValue: 0,
        averageValue: 0,
        conversionRate: 0
      }
    };

    // Contar por status unificado
    Object.values(UNIFIED_OPPORTUNITY_STATUS).forEach(status => {
      stats.byStatus[status] = opportunities.filter(opp => opp.status === status).length;
    });

    // Contar por tipo de oportunidade
    Object.values(OPPORTUNITY_TYPES).forEach(type => {
      stats.byOpportunityType[type] = opportunities.filter(opp => opp.opportunityType === type).length;
    });

    // Contar por tipo de interesse unificado
    Object.values(UNIFIED_INTEREST_TYPES).forEach(type => {
      stats.byInterestType[type] = opportunities.filter(opp => opp.interestType === type).length;
    });

    // Contar por prioridade
    Object.values(UNIFIED_PRIORITIES).forEach(priority => {
      stats.byPriority[priority] = opportunities.filter(opp => opp.priority === priority).length;
    });

    // Calcular métricas financeiras
    const totalValue = opportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0);
    const totalCommission = opportunities.reduce((sum, opp) => sum + (opp.commissionValue || 0), 0);
    const pipelineValue = opportunities.reduce((sum, opp) => sum + (opp.pipelineValue || 0), 0);
    
    const wonCount = stats.byStatus[UNIFIED_OPPORTUNITY_STATUS.FECHADO_GANHO] || 0;
    const lostCount = stats.byStatus[UNIFIED_OPPORTUNITY_STATUS.FECHADO_PERDIDO] || 0;
    const totalClosed = wonCount + lostCount;
    
    stats.financials = {
      totalValue,
      totalCommission,
      pipelineValue,
      averageValue: stats.total > 0 ? totalValue / stats.total : 0,
      conversionRate: totalClosed > 0 ? (wonCount / totalClosed * 100).toFixed(1) : 0
    };

    return stats;
  }, [opportunities]);

  // 🔧 FUNÇÕES AUXILIARES
  // =====================
  const updateClientOpportunityCount = async (clientId, action) => {
    try {
      const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
      const clientDoc = await getDoc(clientRef);
      
      if (clientDoc.exists()) {
        const currentCount = clientDoc.data().opportunityCount || 0;
        const newCount = action === 'increment' ? currentCount + 1 : Math.max(0, currentCount - 1);
        
        await updateDoc(clientRef, {
          opportunityCount: newCount,
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.warn('Erro ao atualizar contador do cliente:', err);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      [UNIFIED_OPPORTUNITY_STATUS.IDENTIFICACAO]: 'Identificação',
      [UNIFIED_OPPORTUNITY_STATUS.QUALIFICACAO]: 'Qualificação',
      [UNIFIED_OPPORTUNITY_STATUS.APRESENTACAO]: 'Apresentação',
      [UNIFIED_OPPORTUNITY_STATUS.NEGOCIACAO]: 'Negociação',
      [UNIFIED_OPPORTUNITY_STATUS.PROPOSTA]: 'Proposta',
      [UNIFIED_OPPORTUNITY_STATUS.CONTRATO]: 'Contrato',
      [UNIFIED_OPPORTUNITY_STATUS.FECHADO_GANHO]: 'Fechado Ganho',
      [UNIFIED_OPPORTUNITY_STATUS.FECHADO_PERDIDO]: 'Fechado Perdido',
      [UNIFIED_OPPORTUNITY_STATUS.PAUSADO]: 'Pausado'
    };
    return labels[status] || status;
  };

  // 🔄 EFFECTS
  // ==========
  useEffect(() => {
    if (isUserReady) {
      console.log('useOpportunities: Utilizador pronto, carregando oportunidades...');
      fetchOpportunities();
    }
  }, [isUserReady, fetchOpportunities]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 🔄 SINCRONIZAÇÃO PÓS-CONVERSÃO - ADICIONAR AQUI
useEffect(() => {
  const handleCrmSync = (event) => {
    console.log('useOpportunities: Sincronização recebida', event.detail);
    if (event.detail.type === 'lead-conversion') {
      console.log('Atualizando lista de oportunidades após conversão...');
      fetchOpportunities();
    }
  };

  window.refreshOpportunities = fetchOpportunities;
  window.addEventListener('crm-data-sync', handleCrmSync);

  return () => {
    window.removeEventListener('crm-data-sync', handleCrmSync);
    delete window.refreshOpportunities;
  };
}, [fetchOpportunities]);

  // 📤 RETORNO DO HOOK UNIFICADO
  // ============================
  return {
    // Estados
    opportunities,
    loading,
    error,
    creating,
    updating,
    deleting,
    filters,

    // Ações principais
    createOpportunity,
    updateOpportunity,
    updateOpportunityStatus,
    deleteOpportunity,
    addActivity,
    
    // Busca e filtros
    fetchOpportunities,
    searchOpportunities,
    setFilters,
    
    // Estatísticas
    getOpportunityStats,
    
    // Constantes unificadas (compatibilidade)
    OPPORTUNITY_STATUS: UNIFIED_OPPORTUNITY_STATUS,
    OPPORTUNITY_TYPES,
    ACTIVITY_TYPES,
    OPPORTUNITY_STATUS_COLORS,
    
    // Novos: constantes unificadas
    UNIFIED_OPPORTUNITY_STATUS,
    UNIFIED_OPPORTUNITY_PROBABILITIES,
    UNIFIED_INTEREST_TYPES,
    UNIFIED_PRIORITIES,
    UNIFIED_PROPERTY_TYPES,
    OPPORTUNITY_TYPE_LABELS,
    ACTIVITY_TYPE_LABELS,
    
    // Helpers unificados
    getInterestTypeLabel,
    getBudgetRangeLabel,
    formatCurrency,
    getOpportunityProbability,
    getStatusLabel,
    
    // Estado de conectividade
    isConnected: isUserReady && !error,
    isUserReady,
    
    // Informações da estrutura
    structureVersion: '3.0',
    isUnified: true
  };
};

export default useOpportunities;