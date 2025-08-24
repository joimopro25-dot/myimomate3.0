// src/hooks/useOpportunities.js
// 🎯 HOOK UNIFICADO PARA GESTÃO DE OPORTUNIDADES - MyImoMate 3.0 MULTI-TENANT COMPLETO
// ===================================================================================
// VERSÃO HÍBRIDA: Multi-tenant + Todas as funcionalidades avançadas
// Inclui: Pipeline Kanban, sistema probabilidades, conversão negócio, comissões, atividades
// Data: Agosto 2025 | Versão: 3.1 Multi-Tenant Complete

import { useState, useEffect, useCallback } from 'react';
import { 
  serverTimestamp,
  getDoc,
  doc,
  updateDoc,
  writeBatch,
  runTransaction
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

// 🎯 CONFIGURAÇÕES DO HOOK MULTI-TENANT
const OPPORTUNITIES_SUBCOLLECTION = SUBCOLLECTIONS.OPPORTUNITIES;
const CLIENTS_SUBCOLLECTION = SUBCOLLECTIONS.CLIENTS;
const DEALS_SUBCOLLECTION = SUBCOLLECTIONS.DEALS;
const crudHelpers = createCRUDHelpers(OPPORTUNITIES_SUBCOLLECTION);
const FETCH_LIMIT = 50;

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

// 🏃‍♂️ TIPOS DE ATIVIDADE
export const ACTIVITY_TYPES = {
  CHAMADA: 'chamada',
  EMAIL: 'email',
  REUNIAO: 'reuniao',
  VISITA: 'visita',
  PROPOSTA: 'proposta',
  NEGOCIACAO: 'negociacao',
  CONTRATO: 'contrato',
  FOLLOWUP: 'followup',
  NOTA: 'nota'
};

export const ACTIVITY_TYPE_LABELS = {
  [ACTIVITY_TYPES.CHAMADA]: 'Chamada',
  [ACTIVITY_TYPES.EMAIL]: 'Email',
  [ACTIVITY_TYPES.REUNIAO]: 'Reunião',
  [ACTIVITY_TYPES.VISITA]: 'Visita',
  [ACTIVITY_TYPES.PROPOSTA]: 'Proposta',
  [ACTIVITY_TYPES.NEGOCIACAO]: 'Negociação',
  [ACTIVITY_TYPES.CONTRATO]: 'Contrato',
  [ACTIVITY_TYPES.FOLLOWUP]: 'Follow-up',
  [ACTIVITY_TYPES.NOTA]: 'Nota'
};

// 🎯 HOOK PRINCIPAL MULTI-TENANT COMPLETO
const useOpportunities = () => {
  // 🔐 AUTENTICAÇÃO E INICIALIZAÇÃO MULTI-TENANT
  const { currentUser: user, userProfile } = useAuth();
  const fbService = useFirebaseService(user);
  
  // 📊 STATES PRINCIPAIS
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 🔍 STATES DE FILTROS E PESQUISA
  const [filters, setFilters] = useState({
    status: '',
    opportunityType: '',
    interestType: '',
    priority: '',
    clientId: '',
    searchTerm: '',
    dateRange: 'all',
    budgetMin: null,
    budgetMax: null,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // 📊 STATES DE CACHE E PERFORMANCE
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // 🔐 VERIFICAR SE UTILIZADOR ESTÁ PRONTO
  const isUserReady = user && user.uid && fbService;

  // 🎯 HELPER: MIGRAÇÃO DE DADOS LEGADOS (COMPATIBILIDADE)
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

  // 🏃‍♂️ ADICIONAR ATIVIDADE À OPORTUNIDADE - MOVIDA PARA ANTES DAS FUNÇÕES QUE A USAM
  const addActivity = useCallback(async (opportunityId, activityData) => {
    if (!isUserReady || !opportunityId || !activityData) {
      throw new Error('Dados inválidos para atividade');
    }

    try {
      console.log('🏃‍♂️ Adicionando atividade:', opportunityId);

      const opportunity = opportunities.find(o => o.id === opportunityId);
      if (!opportunity) {
        throw new Error('Oportunidade não encontrada');
      }

      // Preparar dados da atividade
      const newActivity = {
        id: Date.now().toString(),
        type: activityData.type || ACTIVITY_TYPES.NOTA,
        title: activityData.title?.trim() || 'Nova atividade',
        description: activityData.description?.trim() || '',
        date: activityData.date || new Date().toISOString(),
        userId: user.uid,
        userName: userProfile?.displayName || user.displayName || 'Consultor',
        isSystemGenerated: activityData.isSystemGenerated || false,
        createdAt: new Date().toISOString()
      };

      // Atualizar oportunidade com nova atividade
      const updatedActivities = [...(opportunity.activities || []), newActivity];
      
      await updateOpportunity(opportunityId, {
        activities: updatedActivities,
        activitiesCount: updatedActivities.length,
        lastActivity: newActivity,
        lastContactDate: serverTimestamp()
      });

      console.log('✅ Atividade adicionada com sucesso');
      return { success: true, activity: newActivity };
      
    } catch (err) {
      console.error('❌ Erro ao adicionar atividade:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, user, userProfile, opportunities]); // Removemos updateOpportunity das dependências para evitar ciclo

  // 📥 BUSCAR OPORTUNIDADES COM FILTROS AVANÇADOS (MULTI-TENANT)
  const fetchOpportunities = useCallback(async (additionalFilters = {}) => {
    if (!isUserReady) {
      console.log('❌ User não pronto para fetch');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Buscando oportunidades multi-tenant...');

      // Combinar filtros
      const activeFilters = { ...filters, ...additionalFilters };
      
      // Construir query multi-tenant
      const queryOptions = {
        orderBy: [{ field: activeFilters.sortBy, direction: activeFilters.sortOrder }],
        limitCount: FETCH_LIMIT
      };

      // Aplicar filtros específicos
      if (activeFilters.status) {
        queryOptions.where = queryOptions.where || [];
        queryOptions.where.push({ field: 'status', operator: '==', value: activeFilters.status });
      }

      if (activeFilters.opportunityType) {
        queryOptions.where = queryOptions.where || [];
        queryOptions.where.push({ field: 'opportunityType', operator: '==', value: activeFilters.opportunityType });
      }

      if (activeFilters.interestType) {
        queryOptions.where = queryOptions.where || [];
        queryOptions.where.push({ field: 'interestType', operator: '==', value: activeFilters.interestType });
      }

      if (activeFilters.priority) {
        queryOptions.where = queryOptions.where || [];
        queryOptions.where.push({ field: 'priority', operator: '==', value: activeFilters.priority });
      }

      if (activeFilters.clientId) {
        queryOptions.where = queryOptions.where || [];
        queryOptions.where.push({ field: 'clientId', operator: '==', value: activeFilters.clientId });
      }

      // Executar query usando FirebaseService
      const result = await fbService.readDocuments(OPPORTUNITIES_SUBCOLLECTION, queryOptions);
      
      let fetchedOpportunities = result.data || [];

      // Aplicar filtros locais (pesquisa de texto, ranges de budget)
      if (activeFilters.searchTerm) {
        const searchTerm = activeFilters.searchTerm.toLowerCase();
        fetchedOpportunities = fetchedOpportunities.filter(opp => 
          opp.title?.toLowerCase().includes(searchTerm) ||
          opp.clientName?.toLowerCase().includes(searchTerm) ||
          opp.description?.toLowerCase().includes(searchTerm) ||
          opp.propertyReference?.toLowerCase().includes(searchTerm)
        );
      }

      if (activeFilters.budgetMin || activeFilters.budgetMax) {
        fetchedOpportunities = fetchedOpportunities.filter(opp => {
          const value = opp.estimatedValue || 0;
          const meetsMin = !activeFilters.budgetMin || value >= activeFilters.budgetMin;
          const meetsMax = !activeFilters.budgetMax || value <= activeFilters.budgetMax;
          return meetsMin && meetsMax;
        });
      }

      // Filtro por data
      if (activeFilters.dateRange !== 'all') {
        const now = new Date();
        const daysAgo = {
          'today': 0,
          'week': 7,
          'month': 30,
          'quarter': 90
        }[activeFilters.dateRange] || 0;

        if (daysAgo > 0) {
          const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
          fetchedOpportunities = fetchedOpportunities.filter(opp => 
            opp.createdAt && new Date(opp.createdAt.seconds * 1000) >= cutoffDate
          );
        } else if (activeFilters.dateRange === 'today') {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          fetchedOpportunities = fetchedOpportunities.filter(opp => 
            opp.createdAt && new Date(opp.createdAt.seconds * 1000) >= today
          );
        }
      }

      setOpportunities(fetchedOpportunities);
      setTotalCount(fetchedOpportunities.length);
      setLastFetchTime(Date.now());

      console.log(`✅ ${fetchedOpportunities.length} oportunidades carregadas`);

    } catch (err) {
      console.error('❌ Erro ao buscar oportunidades:', err);
      setError(`Erro ao carregar oportunidades: ${err.message}`);
      setOpportunities([]);
    } finally {
      setLoading(false);
    }
  }, [isUserReady, fbService, filters]);

  // ➕ CRIAR NOVA OPORTUNIDADE COM ESTRUTURA UNIFICADA (MULTI-TENANT)
  const createOpportunity = useCallback(async (opportunityData) => {
    if (!isUserReady) {
      throw new Error('Utilizador não autenticado');
    }

    setCreating(true);
    setError(null);

    try {
      console.log('➕ Criando nova oportunidade multi-tenant...');

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
        lastContactDate: opportunityData.lastContactDate || null,
        nextFollowUpDate: opportunityData.nextFollowUpDate || null,
        
        // Dados de sistema e auditoria
        userId: user.uid,
        consultantId: user.uid,
        consultantName: userProfile?.displayName || user.displayName || 'Consultor',
        
        // Sistema de atividades
        activities: [],
        activitiesCount: 0,
        lastActivity: null,
        
        // Metadados
        tags: opportunityData.tags || [],
        notes: opportunityData.notes || '',
        source: opportunityData.source || 'manual',
        
        // Timestamps
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Aplicar estrutura core
        ...applyCoreStructure(OPPORTUNITY_TEMPLATE)
      };

      // 4. USAR TRANSAÇÃO PARA CRIAR OPORTUNIDADE + ATUALIZAR CLIENTE
      const result = await runTransaction(db, async (transaction) => {
        // Criar oportunidade usando FirebaseService
        const createdDoc = await fbService.createDocument(OPPORTUNITIES_SUBCOLLECTION, newOpportunity);
        
        // Atualizar contador de oportunidades no cliente
        const clientRef = fbService.getDocumentRef(CLIENTS_SUBCOLLECTION, opportunityData.clientId);
        const clientDoc = await transaction.get(clientRef);
        
        if (clientDoc.exists()) {
          const currentCount = clientDoc.data().opportunityCount || 0;
          transaction.update(clientRef, {
            opportunityCount: currentCount + 1,
            lastOpportunityDate: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }

        return createdDoc;
      });

      // 5. ATUALIZAR STATE LOCAL
      setOpportunities(prev => [result, ...prev]);
      setTotalCount(prev => prev + 1);

      console.log('✅ Oportunidade criada com sucesso:', result.id);
      return { success: true, data: result };

    } catch (err) {
      console.error('❌ Erro ao criar oportunidade:', err);
      setError(`Erro ao criar oportunidade: ${err.message}`);
      throw err;
    } finally {
      setCreating(false);
    }
  }, [isUserReady, fbService, user, userProfile]);

  // ✏️ ATUALIZAR OPORTUNIDADE (MULTI-TENANT)
  const updateOpportunity = useCallback(async (opportunityId, updates) => {
    if (!isUserReady || !opportunityId) {
      throw new Error('Dados inválidos para atualização');
    }

    setUpdating(true);
    setError(null);

    try {
      console.log('✏️ Atualizando oportunidade:', opportunityId);

      // Preparar dados de atualização
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Se atualizando dados financeiros, recalcular métricas
      if (updates.estimatedValue !== undefined || updates.commissionPercentage !== undefined) {
        const opportunity = opportunities.find(o => o.id === opportunityId);
        if (opportunity) {
          const estimatedValue = parseFloat(updates.estimatedValue || opportunity.estimatedValue) || 0;
          const commissionPercentage = parseFloat(updates.commissionPercentage || opportunity.commissionPercentage) || 2.5;
          const commissionValue = (estimatedValue * commissionPercentage) / 100;
          const status = updates.status || opportunity.status;
          const probability = getOpportunityProbability(status);
          const pipelineValue = (estimatedValue * probability) / 100;

          updateData.estimatedValue = estimatedValue;
          updateData.commissionPercentage = commissionPercentage;
          updateData.commissionValue = commissionValue;
          updateData.probability = probability;
          updateData.pipelineValue = pipelineValue;
        }
      }

      // Atualizar usando FirebaseService
      await fbService.updateDocument(OPPORTUNITIES_SUBCOLLECTION, opportunityId, updateData);

      // Atualizar state local
      setOpportunities(prev => 
        prev.map(opportunity => 
          opportunity.id === opportunityId 
            ? { ...opportunity, ...updateData, id: opportunityId }
            : opportunity
        )
      );

      console.log('✅ Oportunidade atualizada com sucesso');
      return { success: true };

    } catch (err) {
      console.error('❌ Erro ao atualizar oportunidade:', err);
      setError(`Erro ao atualizar oportunidade: ${err.message}`);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [isUserReady, fbService, opportunities]);

  // 📊 ATUALIZAR STATUS COM PIPELINE AUTOMÁTICO
  const updateOpportunityStatus = useCallback(async (opportunityId, newStatus, additionalData = {}) => {
    if (!isUserReady || !opportunityId || !newStatus) {
      throw new Error('Dados inválidos para atualização de status');
    }

    try {
      console.log('📊 Atualizando status da oportunidade:', opportunityId, newStatus);

      const opportunity = opportunities.find(o => o.id === opportunityId);
      if (!opportunity) {
        throw new Error('Oportunidade não encontrada');
      }

      // Calcular nova probabilidade baseada no status
      const newProbability = getOpportunityProbability(newStatus);
      const newPipelineValue = (opportunity.estimatedValue || 0) * (newProbability / 100);

      // Preparar dados de atualização
      const updateData = {
        status: newStatus,
        probability: newProbability,
        pipelineValue: newPipelineValue,
        ...additionalData,
        updatedAt: serverTimestamp()
      };

      // Se status é "fechado ganho", preparar para conversão em negócio
      if (newStatus === UNIFIED_OPPORTUNITY_STATUS.FECHADO_GANHO) {
        updateData.closedAt = serverTimestamp();
        updateData.wonAt = serverTimestamp();
      } else if (newStatus === UNIFIED_OPPORTUNITY_STATUS.FECHADO_PERDIDO) {
        updateData.closedAt = serverTimestamp();
        updateData.lostAt = serverTimestamp();
        updateData.lostReason = additionalData.lostReason || '';
      }

      await updateOpportunity(opportunityId, updateData);

      // Adicionar atividade automática de mudança de status
      await addActivity(opportunityId, {
        type: ACTIVITY_TYPES.NOTA,
        title: 'Status alterado',
        description: `Status alterado para: ${newStatus}`,
        isSystemGenerated: true
      });

      return { success: true };

    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      throw err;
    }
  }, [isUserReady, opportunities, updateOpportunity, addActivity]);

  // 🔄 CONVERTER OPORTUNIDADE PARA DEAL/NEGÓCIO (VERSÃO COMPLETA MULTI-TENANT)
  const convertOpportunityToDeal = useCallback(async (opportunityId, dealData = {}) => {
    if (!isUserReady || !user?.uid || !opportunityId) {
      setError('Dados inválidos para conversão');
      return { success: false, message: 'Dados inválidos' };
    }

    setUpdating(true);
    setError(null);

    try {
      console.log('🔄 Convertendo oportunidade para negócio (multi-tenant):', opportunityId);

      // 1. BUSCAR DADOS DA OPORTUNIDADE (MULTI-TENANT)
      const opportunity = await fbService.getDocument(OPPORTUNITIES_SUBCOLLECTION, opportunityId);
      
      if (!opportunity) {
        throw new Error('Oportunidade não encontrada');
      }

      // 2. VERIFICAR SE JÁ FOI CONVERTIDA
      if (opportunity.isConverted) {
        throw new Error('Oportunidade já foi convertida para negócio');
      }

      // 3. VALIDAR DADOS MÍNIMOS PARA DEAL
      if (!dealData.propertyAddress && !dealData.propertyId && !opportunity.propertyReference) {
        throw new Error('Endereço ou referência da propriedade é obrigatório para criar negócio');
      }

      if (!dealData.dealValue && !opportunity.estimatedValue) {
        throw new Error('Valor do negócio é obrigatório');
      }

      // 4. PREPARAR DADOS DO DEAL/NEGÓCIO COM MULTI-TENANT
      const baseDealData = {
        // Referências da oportunidade
        opportunityId: opportunityId,
        clientId: opportunity.clientId,
        clientName: opportunity.clientName,
        clientPhone: opportunity.clientPhone,
        clientEmail: opportunity.clientEmail,
        
        // Dados do negócio
        title: dealData.title || `Negócio ${opportunity.interestType} - ${opportunity.clientName}`,
        description: dealData.description || `Negócio criado a partir da oportunidade: ${opportunity.title}`,
        
        // Tipo e categoria
        dealType: dealData.dealType || getDealTypeFromInterest(opportunity.interestType),
        interestType: opportunity.interestType,
        category: dealData.category || 'residencial',
        
        // Status e pipeline
        status: dealData.status || 'proposta',
        priority: dealData.priority || opportunity.priority || UNIFIED_PRIORITIES.NORMAL,
        
        // Dados financeiros
        dealValue: dealData.dealValue || opportunity.estimatedValue,
        commissionPercentage: dealData.commissionPercentage || opportunity.commissionPercentage || 2.5,
        commissionValue: 0, // Calculado automaticamente
        expectedCommission: 0, // Calculado automaticamente
        
        // Dados da propriedade
        propertyId: dealData.propertyId || '',
        propertyReference: opportunity.propertyReference || '',
        propertyAddress: opportunity.propertyAddress || dealData.propertyAddress || '',
        propertyType: dealData.propertyType || opportunity.propertyType || '',
        propertyFeatures: opportunity.propertyFeatures || {},
        
        // Datas importantes
        proposalDate: dealData.proposalDate || new Date(),
        expectedClosingDate: dealData.expectedClosingDate || opportunity.expectedCloseDate || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        
        // Financiamento (se aplicável)
        financing: {
          required: dealData.financingRequired || false,
          bank: dealData.financingBank || '',
          amount: dealData.financingAmount || 0,
          status: dealData.financingStatus || 'pendente',
          preApproved: dealData.preApproved || false
        },
        
        // Partes envolvidas
        buyerName: dealData.buyerName || (opportunity.interestType?.includes('compra') ? opportunity.clientName : ''),
        sellerName: dealData.sellerName || (opportunity.interestType?.includes('venda') ? opportunity.clientName : ''),
        
        // Documentação
        documentsRequired: dealData.documentsRequired || getRequiredDocuments(opportunity.interestType),
        documentsStatus: 'pendente',
        
        // Notas e observações
        notes: dealData.notes || `Negócio criado a partir da oportunidade: ${opportunity.title}`,
        internalNotes: dealData.internalNotes || '',
        
        // Rastreamento
        source: `converted_from_opportunity_${opportunityId}`,
        originalOpportunityId: opportunityId,
        convertedAt: serverTimestamp(),
        
        // Campos de auditoria MULTI-TENANT
        userId: user.uid,
        userEmail: user.email,
        consultantId: user.uid,
        consultantName: userProfile?.displayName || user.displayName || 'Consultor',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user.uid,
        lastModifiedBy: user.uid,
        
        // Estrutura e metadados
        structureVersion: '3.1',
        isMultiTenant: true,
        metadata: {
          convertedFromOpportunity: true,
          conversionDate: new Date().toISOString(),
          opportunityTitle: opportunity.title,
          opportunityValue: opportunity.estimatedValue,
          userAgent: navigator.userAgent
        }
      };

      // 5. CALCULAR COMISSÕES AUTOMATICAMENTE
      if (baseDealData.dealValue && baseDealData.commissionPercentage) {
        baseDealData.commissionValue = (baseDealData.dealValue * baseDealData.commissionPercentage) / 100;
        baseDealData.expectedCommission = baseDealData.commissionValue;
      }

      // 6. USAR TRANSAÇÃO ATÓMICA MULTI-TENANT
      const result = await runTransaction(db, async (transaction) => {
        // Criar deal usando FirebaseService
        const dealDocRef = await fbService.createDocument(DEALS_SUBCOLLECTION, baseDealData);

        // Atualizar oportunidade como convertida
        const opportunityRef = fbService.getDocumentRef(OPPORTUNITIES_SUBCOLLECTION, opportunityId);
        transaction.update(opportunityRef, {
          status: UNIFIED_OPPORTUNITY_STATUS.FECHADO_GANHO,
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

        return dealDocRef;
      });

      // 7. CRIAR TAREFAS AUTOMÁTICAS INICIAIS PARA O DEAL (MULTI-TENANT)
      const initialTasks = await createInitialDealTasks(result.id, baseDealData);

      // 8. ATUALIZAR LISTA LOCAL DE OPORTUNIDADES
      setOpportunities(prev => 
        prev.map(opp => 
          opp.id === opportunityId 
            ? { 
                ...opp, 
                status: UNIFIED_OPPORTUNITY_STATUS.FECHADO_GANHO,
                isConverted: true,
                convertedAt: new Date(),
                convertedToDealId: result.id,
                updatedAt: new Date()
              }
            : opp
        )
      );

      console.log(`✅ Oportunidade ${opportunityId} convertida para deal ${result.id} (multi-tenant)`);
      
      return {
        success: true,
        opportunityId: opportunityId,
        dealId: result.id,
        tasksCreated: initialTasks.length,
        message: `Oportunidade convertida para negócio com sucesso! ${initialTasks.length} tarefas iniciais criadas.`
      };

    } catch (err) {
      console.error('❌ Erro ao converter oportunidade para deal:', err);
      setError(err.message || 'Erro ao converter oportunidade');
      
      return {
        success: false,
        message: err.message || 'Erro ao converter oportunidade para negócio'
      };
    } finally {
      setUpdating(false);
    }
  }, [isUserReady, user, userProfile, fbService]);

  // FUNÇÕES AUXILIARES PARA CONVERSÃO (MULTI-TENANT)
  const getDealTypeFromInterest = (interestType) => {
    if (interestType?.includes('venda')) return 'venda';
    if (interestType?.includes('compra')) return 'compra';
    if (interestType?.includes('arrendamento')) return 'arrendamento';
    if (interestType?.includes('aluguer')) return 'aluguer';
    return 'venda';
  };

  const getRequiredDocuments = (interestType) => {
    const baseDocuments = ['documento_identidade', 'nif'];
    
    if (interestType?.includes('venda')) {
      return [...baseDocuments, 'certidao_predial', 'licenca_habitacao', 'certidao_energetica'];
    }
    
    if (interestType?.includes('compra')) {
      return [...baseDocuments, 'comprovativo_rendimentos', 'declaracao_financeira'];
    }
    
    if (interestType?.includes('arrendamento')) {
      return [...baseDocuments, 'contrato_arrendamento', 'comprovativo_seguros'];
    }
    
    return baseDocuments;
  };

  const createInitialDealTasks = async (dealId, dealData) => {
    const tasks = [];
    
    try {
      // Tarefa 1: Preparar documentação
      const docTask = {
        title: 'Preparar documentação do negócio',
        description: 'Recolher e validar toda a documentação necessária',
        type: 'documentos',
        priority: UNIFIED_PRIORITIES.ALTA,
        status: 'pendente',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        associatedTo: 'negocio',
        associatedId: dealId,
        associatedName: dealData.title,
        dealId: dealId,
        clientId: dealData.clientId,
        userId: dealData.userId,
        userEmail: dealData.userEmail,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        structureVersion: '3.1'
      };
      
      const docTaskRef = await fbService.createDocument(SUBCOLLECTIONS.TASKS, docTask);
      tasks.push({ id: docTaskRef.id, ...docTask });

      // Tarefa 2: Agendar visita
      if (dealData.propertyAddress || dealData.propertyReference) {
        const visitTask = {
          title: 'Agendar visita à propriedade',
          description: `Agendar visita para ${dealData.propertyAddress || dealData.propertyReference}`,
          type: 'visita',
          priority: UNIFIED_PRIORITIES.ALTA,
          status: 'pendente',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          associatedTo: 'negocio',
          associatedId: dealId,
          dealId: dealId,
          clientId: dealData.clientId,
          userId: dealData.userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          structureVersion: '3.1'
        };
        
        const visitTaskRef = await fbService.createDocument(SUBCOLLECTIONS.TASKS, visitTask);
        tasks.push({ id: visitTaskRef.id, ...visitTask });
      }

      // Tarefa 3: Follow-up
      const followUpTask = {
        title: 'Follow-up - Confirmação de interesse',
        description: `Contactar ${dealData.clientName} para confirmar interesse no negócio`,
        type: 'follow_up',
        priority: UNIFIED_PRIORITIES.NORMAL,
        status: 'pendente',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        associatedTo: 'negocio',
        associatedId: dealId,
        dealId: dealId,
        clientId: dealData.clientId,
        userId: dealData.userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        structureVersion: '3.1'
      };
      
      const followUpTaskRef = await fbService.createDocument(SUBCOLLECTIONS.TASKS, followUpTask);
      tasks.push({ id: followUpTaskRef.id, ...followUpTask });

      console.log(`${tasks.length} tarefas iniciais criadas para deal ${dealId} (multi-tenant)`);
      
    } catch (err) {
      console.warn('Erro ao criar tarefas iniciais:', err);
    }
    
    return tasks;
  };

  // 🗑️ ELIMINAR OPORTUNIDADE (MULTI-TENANT)
  const deleteOpportunity = useCallback(async (opportunityId) => {
    if (!isUserReady || !opportunityId) {
      throw new Error('ID da oportunidade é obrigatório');
    }

    setDeleting(true);
    setError(null);

    try {
      console.log('🗑️ Eliminando oportunidade:', opportunityId);

      const opportunity = opportunities.find(o => o.id === opportunityId);
      if (!opportunity) {
        throw new Error('Oportunidade não encontrada');
      }

      // Usar transação para atualizar cliente também
      await runTransaction(db, async (transaction) => {
        // Eliminar oportunidade
        await fbService.deleteDocument(OPPORTUNITIES_SUBCOLLECTION, opportunityId);
        
        // Atualizar contador no cliente
        if (opportunity.clientId) {
          const clientRef = fbService.getDocumentRef(CLIENTS_SUBCOLLECTION, opportunity.clientId);
          const clientDoc = await transaction.get(clientRef);
          
          if (clientDoc.exists()) {
            const currentCount = clientDoc.data().opportunityCount || 0;
            transaction.update(clientRef, {
              opportunityCount: Math.max(0, currentCount - 1),
              updatedAt: serverTimestamp()
            });
          }
        }
      });

      // Atualizar state local
      setOpportunities(prev => prev.filter(opportunity => opportunity.id !== opportunityId));
      setTotalCount(prev => Math.max(0, prev - 1));

      console.log('✅ Oportunidade eliminada com sucesso');
      return { success: true };

    } catch (err) {
      console.error('❌ Erro ao eliminar oportunidade:', err);
      setError(`Erro ao eliminar oportunidade: ${err.message}`);
      throw err;
    } finally {
      setDeleting(false);
    }
  }, [isUserReady, fbService, opportunities]);

  // 🔍 PESQUISAR OPORTUNIDADES
  const searchOpportunities = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  // 📊 ESTATÍSTICAS UNIFICADAS E AVANÇADAS
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
        conversionRate: 0,
        averageDealSize: 0,
        totalWonValue: 0,
        totalLostValue: 0
      },
      pipeline: {
        totalOpportunities: 0,
        weightedValue: 0,
        averageProbability: 0
      },
      timeMetrics: {
        averageTimeToClose: 0,
        averageTimeInStage: {},
        oldestOpportunity: null,
        newestOpportunity: null
      }
    };

    if (opportunities.length === 0) return stats;

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

    // Calcular métricas financeiras avançadas
    const totalValue = opportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0);
    const totalCommission = opportunities.reduce((sum, opp) => sum + (opp.commissionValue || 0), 0);
    const pipelineValue = opportunities.reduce((sum, opp) => sum + (opp.pipelineValue || 0), 0);
    
    const wonOpportunities = opportunities.filter(opp => opp.status === UNIFIED_OPPORTUNITY_STATUS.FECHADO_GANHO);
    const lostOpportunities = opportunities.filter(opp => opp.status === UNIFIED_OPPORTUNITY_STATUS.FECHADO_PERDIDO);
    const totalClosed = wonOpportunities.length + lostOpportunities.length;
    
    const totalWonValue = wonOpportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0);
    const totalLostValue = lostOpportunities.reduce((sum, opp) => sum + (opp.estimatedValue || 0), 0);

    stats.financials = {
      totalValue,
      totalCommission,
      pipelineValue,
      averageValue: stats.total > 0 ? totalValue / stats.total : 0,
      conversionRate: totalClosed > 0 ? (wonOpportunities.length / totalClosed * 100).toFixed(1) : 0,
      averageDealSize: wonOpportunities.length > 0 ? totalWonValue / wonOpportunities.length : 0,
      totalWonValue,
      totalLostValue
    };

    // Métricas de pipeline
    const activeOpportunities = opportunities.filter(opp => 
      opp.status !== UNIFIED_OPPORTUNITY_STATUS.FECHADO_GANHO && 
      opp.status !== UNIFIED_OPPORTUNITY_STATUS.FECHADO_PERDIDO
    );
    
    const totalProbabilities = activeOpportunities.reduce((sum, opp) => sum + (opp.probability || 0), 0);
    
    stats.pipeline = {
      totalOpportunities: activeOpportunities.length,
      weightedValue: pipelineValue,
      averageProbability: activeOpportunities.length > 0 ? totalProbabilities / activeOpportunities.length : 0
    };

    // Métricas de tempo
    const opportunitiesWithDates = opportunities.filter(opp => opp.createdAt);
    if (opportunitiesWithDates.length > 0) {
      const dates = opportunitiesWithDates.map(opp => new Date(opp.createdAt.seconds * 1000));
      stats.timeMetrics.oldestOpportunity = new Date(Math.min(...dates));
      stats.timeMetrics.newestOpportunity = new Date(Math.max(...dates));
    }

    return stats;
  }, [opportunities]);

  // 📈 OBTER DADOS PARA PIPELINE VISUAL
  const getPipelineData = useCallback(() => {
    const pipeline = {};
    
    // Inicializar pipeline com todos os status
    Object.values(UNIFIED_OPPORTUNITY_STATUS).forEach(status => {
      pipeline[status] = {
        opportunities: [],
        count: 0,
        totalValue: 0,
        totalCommission: 0,
        pipelineValue: 0
      };
    });

    // Agrupar oportunidades por status
    opportunities.forEach(opportunity => {
      const status = opportunity.status || UNIFIED_OPPORTUNITY_STATUS.IDENTIFICACAO;
      if (pipeline[status]) {
        pipeline[status].opportunities.push(opportunity);
        pipeline[status].count++;
        pipeline[status].totalValue += opportunity.estimatedValue || 0;
        pipeline[status].totalCommission += opportunity.commissionValue || 0;
        pipeline[status].pipelineValue += opportunity.pipelineValue || 0;
      }
    });

    return pipeline;
  }, [opportunities]);

  // 📊 OBTER OPORTUNIDADES POR CLIENTE
  const getOpportunitiesByClient = useCallback((clientId) => {
    if (!clientId) return [];
    return opportunities.filter(opp => opp.clientId === clientId);
  }, [opportunities]);

  // 🔄 CARREGAR DADOS INICIAIS
  useEffect(() => {
    if (isUserReady) {
      console.log('🔄 Carregando oportunidades iniciais...');
      fetchOpportunities();
    }
  }, [isUserReady, fetchOpportunities]);

  // 🔄 RECARREGAR QUANDO FILTROS MUDAM
  useEffect(() => {
    if (isUserReady && lastFetchTime) {
      console.log('🔍 Aplicando filtros...');
      fetchOpportunities();
    }
  }, [filters.status, filters.opportunityType, filters.interestType, filters.priority, filters.clientId, filters.dateRange]);

  // 🎯 FUNÇÃO AUXILIAR: OBTER LABEL DE STATUS
  const getStatusLabel = useCallback((status) => {
    const statusLabels = {
      [UNIFIED_OPPORTUNITY_STATUS.IDENTIFICACAO]: 'Identificação',
      [UNIFIED_OPPORTUNITY_STATUS.QUALIFICACAO]: 'Qualificação',
      [UNIFIED_OPPORTUNITY_STATUS.APRESENTACAO]: 'Apresentação',
      [UNIFIED_OPPORTUNITY_STATUS.NEGOCIACAO]: 'Negociação',
      [UNIFIED_OPPORTUNITY_STATUS.PROPOSTA]: 'Proposta',
      [UNIFIED_OPPORTUNITY_STATUS.CONTRATO]: 'Contrato',
      [UNIFIED_OPPORTUNITY_STATUS.FECHADO_GANHO]: 'Fechado (Ganho)',
      [UNIFIED_OPPORTUNITY_STATUS.FECHADO_PERDIDO]: 'Fechado (Perdido)',
      [UNIFIED_OPPORTUNITY_STATUS.PAUSADO]: 'Pausado'
    };
    return statusLabels[status] || status;
  }, []);

  // 🎯 FUNÇÃO AUXILIAR: ATUALIZAR CONTADOR DE OPORTUNIDADES DO CLIENTE
  const updateClientOpportunityCount = async (clientId, action) => {
    try {
      const clientRef = fbService.getDocumentRef(CLIENTS_SUBCOLLECTION, clientId);
      const clientDoc = await fbService.getDocument(CLIENTS_SUBCOLLECTION, clientId);
      
      if (clientDoc) {
        const currentCount = clientDoc.opportunityCount || 0;
        const newCount = action === 'increment' ? currentCount + 1 : Math.max(0, currentCount - 1);
        
        await fbService.updateDocument(CLIENTS_SUBCOLLECTION, clientId, {
          opportunityCount: newCount,
          updatedAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error('❌ Erro ao atualizar contador do cliente:', err);
    }
  };

  // 🎯 RETORNO DO HOOK - INTERFACE COMPLETA
  return {
    // Estados principais
    opportunities,
    loading,
    error,
    creating,
    updating,
    deleting,
    filters,

    // Ações principais (CRUD)
    createOpportunity,
    updateOpportunity,
    updateOpportunityStatus,
    deleteOpportunity,
    convertToDeal: convertOpportunityToDeal, // Alias para compatibilidade
    convertOpportunityToDeal,
    addActivity,
    
    // Busca e filtros
    fetchOpportunities,
    searchOpportunities,
    setFilters,
    
    // Estatísticas e analytics
    getOpportunityStats,
    getPipelineData,
    getOpportunitiesByClient,
    
    // Dados computados
    totalCount,
    hasMore,
    lastFetchTime,
    
    // Constantes e helpers
    OPPORTUNITY_STATUS: UNIFIED_OPPORTUNITY_STATUS,
    OPPORTUNITY_TYPES,
    ACTIVITY_TYPES,
    OPPORTUNITY_STATUS_COLORS,
    
    // Constantes unificadas (exportar para compatibilidade)
    UNIFIED_OPPORTUNITY_STATUS,
    UNIFIED_OPPORTUNITY_PROBABILITIES,
    UNIFIED_INTEREST_TYPES,
    UNIFIED_PRIORITIES,
    UNIFIED_PROPERTY_TYPES,
    OPPORTUNITY_TYPE_LABELS,
    ACTIVITY_TYPE_LABELS,
    
    // Funções auxiliares
    getInterestTypeLabel,
    getBudgetRangeLabel,
    formatCurrency,
    getOpportunityProbability,
    getStatusLabel,
    
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

export default useOpportunities;