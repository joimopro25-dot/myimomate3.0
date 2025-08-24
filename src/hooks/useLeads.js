// src/hooks/useLeads.js
// 🎯 HOOK UNIFICADO PARA GESTÃO DE LEADS - MyImoMate 3.0 MULTI-TENANT COMPLETO
// =============================================================================
// VERSÃO HÍBRIDA: Multi-tenant + Todas as funcionalidades avançadas
// Inclui: Sistema conversão, validações PT, gestão gestores, temperatura leads
// Data: Agosto 2025 | Versão: 3.1 Multi-Tenant Complete

import { useState, useEffect, useCallback, useRef } from 'react';
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
  UNIFIED_INTEREST_TYPES,
  UNIFIED_BUDGET_RANGES,
  UNIFIED_LEAD_STATUS,
  UNIFIED_PRIORITIES,
  UNIFIED_LEAD_SOURCES,
  getInterestTypeLabel,
  getBudgetRangeLabel,
  formatCurrency
} from '../constants/unifiedTypes.js';

import {
  CORE_DATA_STRUCTURE,
  PERSONAL_DATA_STRUCTURE,
  applyCoreStructure,
  validateCoreStructure,
  LEAD_TEMPLATE
} from '../constants/coreStructure.js';

import {
  validateLead,
  validateForDuplicates,
  formatValidatedData,
  validatePortuguesePhone,
  validateEmail,
  validatePostalCode
} from '../constants/validations.js';

// 🔄 IMPORTS DO SISTEMA DE CONVERSÃO AVANÇADO
import { validateLeadConversionRelaxed } from '../utils/ConversionValidation_Relaxed';
import { validateLeadConversion } from '../utils/ConversionValidation';
import { initializeDebugger, debugLog, debugError } from '../utils/ConversionDebug';

// 🎯 CONFIGURAÇÕES DO HOOK MULTI-TENANT
const LEADS_SUBCOLLECTION = SUBCOLLECTIONS.LEADS;
const CLIENTS_SUBCOLLECTION = SUBCOLLECTIONS.CLIENTS;
const OPPORTUNITIES_SUBCOLLECTION = SUBCOLLECTIONS.OPPORTUNITIES;
const FETCH_LIMIT = 100;

// 🎯 TIPOS DE CLIENTE ESPECÍFICOS
export const CLIENT_TYPES = {
  COMPRADOR: 'comprador',
  VENDEDOR: 'vendedor',
  ARRENDATARIO: 'arrendatario',
  SENHORIO: 'senhorio',
  INVESTIDOR: 'investidor'
};

// 🏠 STATUS DA PROPRIEDADE
export const PROPERTY_STATUS = {
  NAO_IDENTIFICADO: 'nao_identificado',
  DISPONIVEL: 'disponivel',
  RESERVADO: 'reservado',
  VENDIDO: 'vendido',
  RETIRADO: 'retirado',
  EM_CONSTRUCAO: 'em_construcao'
};

// 🌡️ CORES PARA STATUS DE LEADS
export const LEAD_STATUS_COLORS = {
  [UNIFIED_LEAD_STATUS.NOVO]: 'bg-blue-100 text-blue-800 border-blue-200',
  [UNIFIED_LEAD_STATUS.CONTACTADO]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [UNIFIED_LEAD_STATUS.QUALIFICADO]: 'bg-purple-100 text-purple-800 border-purple-200',
  [UNIFIED_LEAD_STATUS.INTERESSADO]: 'bg-green-100 text-green-800 border-green-200',
  [UNIFIED_LEAD_STATUS.NAO_INTERESSADO]: 'bg-gray-100 text-gray-800 border-gray-200',
  [UNIFIED_LEAD_STATUS.CONVERTIDO]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  [UNIFIED_LEAD_STATUS.PERDIDO]: 'bg-red-100 text-red-800 border-red-200',
  [UNIFIED_LEAD_STATUS.INATIVO]: 'bg-slate-100 text-slate-800 border-slate-200'
};

// 🎯 HOOK PRINCIPAL MULTI-TENANT
const useLeads = () => {
  // 🔐 AUTENTICAÇÃO E INICIALIZAÇÃO MULTI-TENANT
  const { currentUser: user, userProfile } = useAuth();
  const fbService = useFirebaseService(user);

  // 📊 STATES PRINCIPAIS
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [converting, setConverting] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState(false);

  // 📊 STATES DO SISTEMA DE CONVERSÃO AVANÇADO
  const [conversionModal, setConversionModal] = useState({
    isOpen: false,
    leadData: null,
    debugger: null
  });

  // 📊 FILTROS E PESQUISA - USANDO useRef PARA EVITAR LOOPS
  const [filters, setFilters] = useState({
    status: '',
    interestType: '',
    budgetRange: '',
    priority: '',
    source: '',
    searchTerm: '',
    clientType: '',
    propertyStatus: ''
  });

  // 🔧 REF PARA CONTROLAR FETCH E EVITAR LOOPS
  const fetchTimeoutRef = useRef(null);
  const lastFetchFilters = useRef('');

  // 🎯 HELPERS CRUD MULTI-TENANT
  const crudHelpers = createCRUDHelpers(LEADS_SUBCOLLECTION);

  // 🔧 INICIALIZAÇÃO DO DEBUGGER DE CONVERSÃO
  useEffect(() => {
    if (!conversionModal.debugger && user) {
      const debuggerInstance = initializeDebugger({
        ENABLED: true,
        LEVEL: 2,
        userId: user.uid
      });
      
      setConversionModal(prev => ({
        ...prev,
        debugger: debuggerInstance
      }));

      debugLog('system', 'useLeads hook inicializado com correção de modal', { userId: user.uid });
    }
  }, [user]);

  // 🔧 FUNÇÕES AUXILIARES PARA SISTEMA DE TEMPERATURA
  const calculateUrgencyLevel = useCallback((createdDate, status) => {
    if (!createdDate) return 'hot';
    
    const now = new Date();
    const created = createdDate instanceof Date ? createdDate : new Date(createdDate);
    const daysDiff = Math.floor((now - created) / (1000 * 60 * 60 * 24));

    if (status === UNIFIED_LEAD_STATUS.CONVERTIDO || status === UNIFIED_LEAD_STATUS.PERDIDO) {
      return 'converted';
    }

    if (daysDiff <= 7) return 'hot';
    if (daysDiff <= 30) return 'warm';
    return 'cold';
  }, []);

  const calculateInitialLeadScore = useCallback((leadData) => {
    let score = 50; // Base score

    // Boost por dados completos
    if (leadData.email) score += 10;
    if (leadData.phone) score += 10;
    if (leadData.budgetRange && leadData.budgetRange !== UNIFIED_BUDGET_RANGES.INDEFINIDO) score += 15;
    if (leadData.location) score += 10;

    // Boost por prioridade
    if (leadData.priority === UNIFIED_PRIORITIES.ALTA) score += 20;
    else if (leadData.priority === UNIFIED_PRIORITIES.NORMAL) score += 10;

    return Math.min(100, Math.max(0, score));
  }, []);

  const getBudgetRangeMiddleValue = useCallback((budgetRange) => {
    const ranges = {
      [UNIFIED_BUDGET_RANGES.ATE_100K]: 75000,
      [UNIFIED_BUDGET_RANGES.ATE_200K]: 150000,
      [UNIFIED_BUDGET_RANGES.ATE_300K]: 250000,
      [UNIFIED_BUDGET_RANGES.ATE_500K]: 400000,
      [UNIFIED_BUDGET_RANGES.ACIMA_500K]: 650000,
      [UNIFIED_BUDGET_RANGES.INDEFINIDO]: 200000
    };
    return ranges[budgetRange] || 200000;
  }, []);

  const calculateNextFollowUp = useCallback((priority) => {
    const now = new Date();
    const daysToAdd = priority === UNIFIED_PRIORITIES.ALTA ? 1 : 
                     priority === UNIFIED_PRIORITIES.NORMAL ? 3 : 7;
    
    const followUpDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    return followUpDate;
  }, []);

  // 📊 CARREGAR LEADS COM FILTROS (MULTI-TENANT) - OTIMIZADO CONTRA LOOPS
  const fetchLeads = useCallback(async (forceRefresh = false) => {
    if (!user) {
      console.log('useLeads: Aguardando utilizador...');
      return;
    }
    
    // Evitar múltiplas chamadas desnecessárias
    const currentFiltersString = JSON.stringify(filters);
    if (!forceRefresh && lastFetchFilters.current === currentFiltersString && leads.length > 0) {
      console.log('useLeads: Filtros inalterados, skip fetch');
      return;
    }
    
    // Cancelar fetch anterior se existir
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`📊 Carregando leads para utilizador: ${user.uid}`);
      
      // Preparar condições de query baseadas nos filtros ativos
      const queryOptions = {
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
        limit: FETCH_LIMIT
      };

      // Aplicar filtros ao nível da query (mais eficiente)
      const whereConditions = [];
      
      if (filters.status && Object.values(UNIFIED_LEAD_STATUS).includes(filters.status)) {
        whereConditions.push({ field: 'status', operator: '==', value: filters.status });
      }
      
      if (filters.interestType && Object.values(UNIFIED_INTEREST_TYPES).includes(filters.interestType)) {
        whereConditions.push({ field: 'interestType', operator: '==', value: filters.interestType });
      }
      
      if (filters.priority && Object.values(UNIFIED_PRIORITIES).includes(filters.priority)) {
        whereConditions.push({ field: 'priority', operator: '==', value: filters.priority });
      }
      
      if (filters.source && Object.values(UNIFIED_LEAD_SOURCES).includes(filters.source)) {
        whereConditions.push({ field: 'source', operator: '==', value: filters.source });
      }

      if (whereConditions.length > 0) {
        queryOptions.where = whereConditions;
      }

      // Executar query usando FirebaseService multi-tenant
      const result = await fbService.getDocuments(LEADS_SUBCOLLECTION, queryOptions);

      if (result.success && Array.isArray(result.docs)) {
        console.log(`📊 Encontrados ${result.docs.length} leads brutos`);

        // Processar e enriquecer dados
        let leadsData = result.docs.map(leadDoc => {
          const migratedData = migrateLead(leadDoc);
          
          return {
            id: leadDoc.id,
            ...migratedData,
            
            // Enriquecimentos para UI
            interestTypeLabel: getInterestTypeLabel(migratedData.interestType),
            budgetRangeLabel: getBudgetRangeLabel(migratedData.budgetRange),
            budgetDisplay: formatCurrency(getBudgetRangeMiddleValue(migratedData.budgetRange)),
            statusColor: LEAD_STATUS_COLORS[migratedData.status],
            
            // Cálculos temporais
            ageInDays: migratedData.createdAt ? 
              Math.floor((new Date() - new Date(migratedData.createdAt)) / (1000 * 60 * 60 * 24)) : 0,
            
            // Status de urgência baseado na idade
            urgencyLevel: calculateUrgencyLevel(migratedData.createdAt, migratedData.status),
            
            // Flag de conversão disponível
            canConvert: migratedData.status !== UNIFIED_LEAD_STATUS.CONVERTIDO && migratedData.status !== UNIFIED_LEAD_STATUS.PERDIDO
          };
        });

        // Aplicar filtro de pesquisa client-side (mais flexível)
        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          leadsData = leadsData.filter(lead => 
            lead.name?.toLowerCase().includes(term) ||
            lead.email?.toLowerCase().includes(term) ||
            lead.phone?.includes(term.replace(/\s/g, '')) ||
            lead.managerName?.toLowerCase().includes(term) ||
            lead.propertyReference?.toLowerCase().includes(term) ||
            getInterestTypeLabel(lead.interestType)?.toLowerCase().includes(term)
          );
        }

        // Aplicar filtros client-side adicionais
        if (filters.clientType) {
          leadsData = leadsData.filter(lead => lead.clientType === filters.clientType);
        }

        if (filters.propertyStatus) {
          leadsData = leadsData.filter(lead => lead.propertyStatus === filters.propertyStatus);
        }

        if (filters.budgetRange) {
          leadsData = leadsData.filter(lead => lead.budgetRange === filters.budgetRange);
        }

        setLeads(leadsData);
        lastFetchFilters.current = currentFiltersString;
        console.log(`✅ Carregados ${leadsData.length} leads com estrutura expandida para utilizador ${user.uid}`);
      } else {
        throw new Error('Falha ao carregar leads');
      }
      
    } catch (err) {
      console.error('❌ Erro ao buscar leads:', err);
      setError(`Erro ao carregar leads: ${err.message}`);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [user, fbService, filters, leads.length, calculateUrgencyLevel, getBudgetRangeMiddleValue]);

  // 🔄 MIGRAÇÃO DE DADOS PARA COMPATIBILIDADE
  const migrateLead = useCallback((leadData) => {
    if (leadData.structureVersion === '3.1') {
      return leadData;
    }

    const migrated = {
      ...leadData,
      isActive: leadData.isActive !== undefined ? leadData.isActive : true,
      priority: leadData.priority || UNIFIED_PRIORITIES.NORMAL,
      source: leadData.source || UNIFIED_LEAD_SOURCES.MANUAL,
      clientType: leadData.clientType || CLIENT_TYPES.COMPRADOR,
      propertyStatus: leadData.propertyStatus || PROPERTY_STATUS.NAO_IDENTIFICADO,
      urgencyLevel: calculateUrgencyLevel(leadData.createdAt, leadData.status),
      leadScore: leadData.leadScore || calculateInitialLeadScore(leadData),
      estimatedBudget: leadData.estimatedBudget || getBudgetRangeMiddleValue(leadData.budgetRange),
      structureVersion: '3.1',
      isMultiTenant: true,
      migratedAt: new Date().toISOString()
    };

    return migrated;
  }, [calculateUrgencyLevel, calculateInitialLeadScore, getBudgetRangeMiddleValue]);

  // 🔍 VERIFICAR DUPLICADOS
  const checkForDuplicates = useCallback(async (phone, email) => {
    if (!user) return { hasDuplicates: false, duplicates: [] };
    
    setDuplicateCheck(true);
    
    try {
      const duplicates = [];
      
      if (phone) {
        const phoneResult = await fbService.getDocuments(LEADS_SUBCOLLECTION, {
          where: [{ field: 'phoneNormalized', operator: '==', value: phone.replace(/\s|-/g, '') }],
          limit: 1
        });
        
        if (phoneResult.success && phoneResult.docs.length > 0) {
          duplicates.push({
            ...phoneResult.docs[0],
            duplicateField: 'phone'
          });
        }
      }
      
      if (email && duplicates.length === 0) {
        const emailResult = await fbService.getDocuments(LEADS_SUBCOLLECTION, {
          where: [{ field: 'email', operator: '==', value: email.toLowerCase().trim() }],
          limit: 1
        });
        
        if (emailResult.success && emailResult.docs.length > 0) {
          duplicates.push({
            ...emailResult.docs[0],
            duplicateField: 'email'
          });
        }
      }

      return {
        hasDuplicates: duplicates.length > 0,
        duplicates: duplicates
      };
      
    } catch (err) {
      console.error('Erro ao verificar duplicados:', err);
      return { hasDuplicates: false, duplicates: [], error: err.message };
    } finally {
      setDuplicateCheck(false);
    }
  }, [user, fbService]);

  // ➕ CRIAR NOVO LEAD (MULTI-TENANT)
  const createLead = useCallback(async (leadData) => {
    if (!user) {
      throw new Error('Utilizador não autenticado');
    }

    setCreating(true);
    setError(null);

    try {
      // Validações básicas
      if (!leadData.name?.trim()) {
        throw new Error('Nome é obrigatório');
      }
      
      if (!leadData.phone?.trim() && !leadData.email?.trim()) {
        throw new Error('Telefone ou email é obrigatório');
      }

      if (leadData.phone && !validatePortuguesePhone(leadData.phone)) {
        throw new Error('Formato de telefone inválido');
      }

      if (leadData.email && !validateEmail(leadData.email)) {
        throw new Error('Formato de email inválido');
      }

      if (leadData.managerPhone && !validatePortuguesePhone(leadData.managerPhone)) {
        throw new Error('Formato de telefone do gestor inválido');
      }

      if (leadData.managerEmail && !validateEmail(leadData.managerEmail)) {
        throw new Error('Formato de email do gestor inválido');
      }

      // Verificar duplicados
      const duplicateCheck = await checkForDuplicates(leadData.phone, leadData.email);
      if (duplicateCheck.hasDuplicates) {
        const duplicateInfo = duplicateCheck.duplicates[0];
        throw new Error(
          `Já existe um lead com este ${
            duplicateInfo.duplicateField === 'phone' ? 'telefone' : 'email'
          }`
        );
      }

      // Preparar dados do lead
      const normalizedPhone = leadData.phone?.replace(/\s|-/g, '') || '';
      const normalizedEmail = leadData.email?.toLowerCase().trim() || '';
      
      const newLead = {
        // Aplicar estrutura core
        ...applyCoreStructure(leadData, LEAD_TEMPLATE),
        
        // Dados básicos
        name: leadData.name.trim(),
        phone: leadData.phone?.trim() || '',
        phoneNormalized: normalizedPhone,
        email: normalizedEmail,
        
        // Classificação
        interestType: leadData.interestType || UNIFIED_INTEREST_TYPES.COMPRA_CASA,
        budgetRange: leadData.budgetRange || UNIFIED_BUDGET_RANGES.INDEFINIDO,
        status: UNIFIED_LEAD_STATUS.NOVO,
        source: leadData.source || UNIFIED_LEAD_SOURCES.MANUAL,
        priority: leadData.priority || UNIFIED_PRIORITIES.NORMAL,
        
        // Dados específicos do sistema avançado
        clientType: leadData.clientType || CLIENT_TYPES.COMPRADOR,
        propertyStatus: leadData.propertyStatus || PROPERTY_STATUS.NAO_IDENTIFICADO,
        propertyReference: leadData.propertyReference?.trim() || '',
        propertyLink: leadData.propertyLink?.trim() || '',
        
        // Gestão de gestores
        managerName: leadData.managerName?.trim() || '',
        managerPhone: leadData.managerPhone?.trim() || '',
        managerEmail: leadData.managerEmail?.toLowerCase().trim() || '',
        managerContactHistory: leadData.managerContactHistory || [],
        managerNotes: leadData.managerNotes?.trim() || '',
        
        // Dados calculados
        estimatedBudget: getBudgetRangeMiddleValue(leadData.budgetRange),
        urgencyLevel: 'hot', // Novo lead é sempre quente
        leadScore: calculateInitialLeadScore(leadData),
        
        // Localização e contacto
        location: leadData.location?.trim() || '',
        preferredContactTime: leadData.preferredContactTime || 'qualquer_hora',
        notes: leadData.notes?.trim() || '',
        
        // Dados de auditoria multi-tenant
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Tracking e flags
        lastActivity: null,
        nextFollowUp: calculateNextFollowUp(leadData.priority),
        canConvert: true,
        hasBeenContacted: false,
        isConverted: false,
        isActive: true,
        
        // Versão da estrutura
        structureVersion: '3.1',
        isMultiTenant: true,
        
        // Metadados técnicos
        sourceDetails: {
          platform: leadData.sourcePlatform || 'manual',
          campaign: leadData.sourceCampaign || null,
          referrer: leadData.sourceReferrer || null,
          created_via: 'web_form',
          form_version: '3.1',
          timestamp: new Date().toISOString()
        }
      };

      // Criar no Firebase (subcoleção do utilizador)
      const result = await fbService.createDocument(LEADS_SUBCOLLECTION, newLead);

      if (result) {
        // Enriquecer dados para UI
        const enrichedLead = {
          ...result,
          interestTypeLabel: getInterestTypeLabel(result.interestType),
          budgetRangeLabel: getBudgetRangeLabel(result.budgetRange),
          budgetDisplay: formatCurrency(result.estimatedBudget),
          statusColor: LEAD_STATUS_COLORS[result.status],
          ageInDays: 0,
          urgencyLevel: 'hot',
          canConvert: true
        };

        // Atualizar lista local
        setLeads(prev => [enrichedLead, ...prev]);

        console.log('Lead criado com estrutura expandida:', result.id);
        
        return {
          success: true,
          lead: enrichedLead,
          message: 'Lead criado com sucesso!'
        };
      } else {
        throw new Error('Falha ao criar lead');
      }
      
    } catch (err) {
      console.error('❌ Erro ao criar lead:', err);
      setError(err.message);
      throw err;
    } finally {
      setCreating(false);
    }
  }, [user, fbService, checkForDuplicates, applyCoreStructure, getBudgetRangeMiddleValue, calculateInitialLeadScore, calculateNextFollowUp]);

  // ✏️ ATUALIZAR LEAD (MULTI-TENANT)
  const updateLead = useCallback(async (leadId, updates) => {
    if (!user) return { success: false, error: 'Utilizador não autenticado' };
    
    try {
      console.log('✏️ Atualizando lead:', leadId);

      // Preparar dados para atualização
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid,
        structureVersion: '3.1'
      };

      // Normalizar telefone se fornecido
      if (updates.phone) {
        updateData.phoneNormalized = updates.phone.replace(/\s|-/g, '');
      }

      // Normalizar email se fornecido
      if (updates.email) {
        updateData.email = updates.email.toLowerCase().trim();
      }

      // Recalcular dados derivados se necessário
      if (updates.budgetRange) {
        updateData.estimatedBudget = getBudgetRangeMiddleValue(updates.budgetRange);
      }

      const result = await fbService.updateDocument(LEADS_SUBCOLLECTION, leadId, updateData);
      
      if (result) {
        // Atualizar lista local
        setLeads(prev => prev.map(lead => 
          lead.id === leadId 
            ? { 
                ...lead, 
                ...updateData, 
                id: leadId,
                budgetRangeLabel: updates.budgetRange ? getBudgetRangeLabel(updates.budgetRange) : lead.budgetRangeLabel,
                interestTypeLabel: updates.interestType ? getInterestTypeLabel(updates.interestType) : lead.interestTypeLabel,
                statusColor: updates.status ? LEAD_STATUS_COLORS[updates.status] : lead.statusColor
              }
            : lead
        ));

        console.log('✅ Lead atualizado com sucesso');
        return { success: true, message: 'Lead atualizado com sucesso!' };
      } else {
        throw new Error('Falha ao atualizar lead');
      }
      
    } catch (err) {
      console.error('❌ Erro ao atualizar lead:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [user, fbService, getBudgetRangeMiddleValue]);

  // 🗑️ ELIMINAR LEAD (MULTI-TENANT)
  const deleteLead = useCallback(async (leadId, hardDelete = false) => {
    if (!user) return { success: false, error: 'Utilizador não autenticado' };
    
    try {
      console.log('🗑️ Eliminando lead:', leadId);

      if (hardDelete) {
        // Eliminação definitiva
        const result = await fbService.deleteDocument(LEADS_SUBCOLLECTION, leadId);
        
        if (result) {
          // Remover da lista local
          setLeads(prev => prev.filter(lead => lead.id !== leadId));
          console.log(`Lead ${leadId} eliminado permanentemente`);
        }
      } else {
        // Soft delete (recomendado)
        const result = await fbService.updateDocument(LEADS_SUBCOLLECTION, leadId, {
          isActive: false,
          status: UNIFIED_LEAD_STATUS.INATIVO,
          deletedAt: serverTimestamp(),
          deletedBy: user.uid,
          updatedAt: serverTimestamp()
        });
        
        if (result) {
          // Remover da lista local (filtro por isActive)
          setLeads(prev => prev.filter(lead => lead.id !== leadId));
          console.log(`Lead ${leadId} marcado como inativo`);
        }
        
        console.log(`Lead ${leadId} ${hardDelete ? 
          'eliminado permanentemente' : 'marcado como inativo'}`);
        
        return { 
          success: true, 
          message: hardDelete ? 'Lead eliminado permanentemente!' : 'Lead removido da lista!' 
        };
      }

    } catch (err) {
      console.error('❌ Erro ao eliminar lead:', err);
      return { success: false, error: err.message };
    }
  }, [user, fbService]);

  // 🔄 ATUALIZAR STATUS DO LEAD
  const updateLeadStatus = useCallback(async (leadId, newStatus, notes = '') => {
    if (!user) return { success: false, error: 'Utilizador não autenticado' };

    try {
      console.log('📊 Atualizando status do lead:', leadId, newStatus);

      const updates = {
        status: newStatus,
        lastActivity: serverTimestamp(),
        hasBeenContacted: newStatus !== UNIFIED_LEAD_STATUS.NOVO,
        urgencyLevel: calculateUrgencyLevel(new Date(), newStatus),
        statusChangeReason: notes.trim(),
        
        // Auditoria de mudança de status
        [`statusHistory.change_${Date.now()}`]: {
          from: leads.find(l => l.id === leadId)?.status || 'unknown',
          to: newStatus,
          changedBy: user.uid,
          changedAt: new Date().toISOString(),
          reason: notes.trim(),
          userAgent: navigator.userAgent
        }
      };

      const result = await updateLead(leadId, updates);
      
      if (result.success) {
        console.log(`✅ Status do lead ${leadId} atualizado para: ${newStatus}`);
      }
      
      return result;

    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      return { success: false, error: err.message };
    }
  }, [user, updateLead, calculateUrgencyLevel, leads]);

  // 🔄 CONVERSÃO DE LEADS - Sistema Avançado Multi-etapas
  const convertLeadToClient = useCallback(async (leadId, additionalData = {}) => {
    if (!user) return { success: false, error: 'Utilizador não autenticado' };

    setConverting(true);
    setError(null);

    try {
      console.log('🔄 Iniciando conversão de lead:', leadId);
      
      // Buscar dados do lead
      const leadResult = await fbService.getDocument(LEADS_SUBCOLLECTION, leadId);
      
      if (!leadResult) {
        throw new Error('Lead não encontrado');
      }

      const leadData = leadResult;
      
      if (leadData.isConverted || leadData.status === UNIFIED_LEAD_STATUS.CONVERTIDO) {
        return { 
          success: false, 
          error: 'Este lead já foi convertido anteriormente' 
        };
      }

      // Preparar dados do cliente
      const clientData = {
        // Dados básicos do lead
        name: leadData.name,
        email: leadData.email || '',
        phone: leadData.phone,
        
        // Classificação
        clientType: leadData.clientType || 'comprador',
        interestType: leadData.interestType,
        budgetRange: leadData.budgetRange || 'indefinido',
        
        // Localização e propriedade
        location: leadData.location || '',
        preferredLocations: leadData.location ? [leadData.location] : [],
        propertyStatus: leadData.propertyStatus || 'nao_identificado',
        propertyReference: leadData.propertyReference || '',
        propertyLink: leadData.propertyLink || '',
        
        // Gestão de gestores
        managerName: leadData.managerName || '',
        managerPhone: leadData.managerPhone || '',
        managerEmail: leadData.managerEmail || '',
        managerNotes: leadData.managerNotes || '',
        
        // Dados da conversão
        ...additionalData,
        source: leadData.source || 'lead_conversion',
        originalLeadId: leadId,
        convertedFromLead: true,
        leadConvertedAt: new Date().toISOString(),
        notes: `${leadData.notes || ''}\n\nConvertido do lead em ${new Date().toLocaleDateString('pt-PT')}\nOrigem: ${leadData.source || 'Manual'}`,
        status: 'ativo',
        priority: leadData.priority || 'normal',
        
        // Dados de auditoria
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        structureVersion: '3.1',
        isMultiTenant: true,
        isActive: true
      };

      // Usar transação para garantir consistência
      const result = await fbService.runTransaction(async (transaction, service) => {
        console.log('💾 Criando cliente na subcoleção...');
        const clientResult = await service.createDocument(CLIENTS_SUBCOLLECTION, clientData);
        
        console.log('🔄 Atualizando status do lead...');
        await service.updateDocument(LEADS_SUBCOLLECTION, leadId, {
          status: UNIFIED_LEAD_STATUS.CONVERTIDO,
          isConverted: true,
          convertedAt: serverTimestamp(),
          convertedToClientId: clientResult.id,
          convertedBy: user.uid,
          updatedAt: serverTimestamp()
        });

        return {
          success: true,
          clientId: clientResult.id,
          message: 'Lead convertido para cliente com sucesso!'
        };
      });

      // Atualizar lista local de leads
      setLeads(prev => prev.map(lead => 
        lead.id === leadId 
          ? { 
              ...lead, 
              status: UNIFIED_LEAD_STATUS.CONVERTIDO,
              isConverted: true,
              statusColor: LEAD_STATUS_COLORS[UNIFIED_LEAD_STATUS.CONVERTIDO],
              canConvert: false
            }
          : lead
      ));

      console.log('✅ Conversão de lead concluída com sucesso');
      
      return result;

    } catch (err) {
      console.error('❌ Erro na conversão de lead:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setConverting(false);
    }
  }, [user, fbService]);

  // 🔍 PESQUISAR LEADS - OTIMIZADO
  const searchLeads = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
    
    // Debounce para evitar muitas queries
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = setTimeout(() => {
      fetchLeads(true); // Force refresh com novos filtros
    }, 500);
  }, [fetchLeads]);

  // 📊 OBTER ESTATÍSTICAS DOS LEADS
  const getLeadStats = useCallback(() => {
    const stats = {
      total: leads.length,
      byStatus: {},
      byInterestType: {},
      byBudgetRange: {},
      byPriority: {},
      bySource: {},
      byClientType: {},
      byPropertyStatus: {},
      conversionRate: 0,
      qualificationRate: 0
    };

    if (leads.length === 0) return stats;

    // Estatísticas por status
    Object.values(UNIFIED_LEAD_STATUS).forEach(status => {
      stats.byStatus[status] = leads.filter(lead => lead.status === status).length;
    });

    // Estatísticas por tipo de cliente
    Object.values(CLIENT_TYPES).forEach(type => {
      stats.byClientType[type] = leads.filter(lead => lead.clientType === type).length;
    });

    // Estatísticas por status da propriedade
    Object.values(PROPERTY_STATUS).forEach(status => {
      stats.byPropertyStatus[status] = leads.filter(lead => lead.propertyStatus === status).length;
    });

    // Cálculos de taxa
    const convertedCount = stats.byStatus[UNIFIED_LEAD_STATUS.CONVERTIDO] || 0;
    const qualifiedCount = stats.byStatus[UNIFIED_LEAD_STATUS.QUALIFICADO] || 0;
    
    stats.conversionRate = stats.total > 0 ? (convertedCount / stats.total * 100).toFixed(1) : 0;
    stats.qualificationRate = stats.total > 0 ? (qualifiedCount / stats.total * 100).toFixed(1) : 0;

    // Sistema de temperatura dos leads
    const agora = new Date();
    const quinzeDiasAtras = new Date(agora.getTime() - (15 * 24 * 60 * 60 * 1000));
    const trintaDiasAtras = new Date(agora.getTime() - (30 * 24 * 60 * 60 * 1000));

    let novosQuentes = 0;
    let leadsMornos = 0;  
    let leadsFrios = 0;

    leads.forEach(lead => {
      const dataLead = lead.createdAt?.seconds 
        ? new Date(lead.createdAt.seconds * 1000)
        : lead.createdAt 
          ? new Date(lead.createdAt)
          : new Date();

      const ultimaAtualizacao = lead.updatedAt?.seconds
        ? new Date(lead.updatedAt.seconds * 1000)
        : lead.updatedAt
          ? new Date(lead.updatedAt)
          : dataLead;

      if (ultimaAtualizacao > quinzeDiasAtras) {
        novosQuentes++;
      } else if (ultimaAtualizacao > trintaDiasAtras) {
        leadsMornos++;
      } else {
        leadsFrios++;
      }
    });

    stats.temperatura = {
      quentes: novosQuentes,
      mornos: leadsMornos,
      frios: leadsFrios
    };

    return stats;
  }, [leads]);

  // 📊 OBTER LEADS POR STATUS
  const getLeadsByStatus = useCallback((status) => {
    return leads.filter(lead => lead.status === status);
  }, [leads]);

  // 📊 OBTER LEADS POR URGÊNCIA/TEMPERATURA
  const getLeadsByUrgency = useCallback((urgencyLevel) => {
    return leads.filter(lead => lead.urgencyLevel === urgencyLevel);
  }, [leads]);

  // 🏠 OBTER DIAGNÓSTICO DA SUBCOLEÇÃO
  const getDiagnostics = useCallback(async () => {
    if (!user) return null;
    
    try {
      return await fbService.diagnoseSubcollection(LEADS_SUBCOLLECTION);
    } catch (error) {
      console.error('❌ Erro ao obter diagnósticos:', error);
      return null;
    }
  }, [user, fbService]);

  // 🎯 HELPER PARA LABELS DE STATUS
  const getStatusLabel = (status) => {
    const labels = {
      [UNIFIED_LEAD_STATUS.NOVO]: 'Novo',
      [UNIFIED_LEAD_STATUS.CONTACTADO]: 'Contactado', 
      [UNIFIED_LEAD_STATUS.QUALIFICADO]: 'Qualificado',
      [UNIFIED_LEAD_STATUS.INTERESSADO]: 'Interessado',
      [UNIFIED_LEAD_STATUS.NAO_INTERESSADO]: 'Não Interessado',
      [UNIFIED_LEAD_STATUS.CONVERTIDO]: 'Convertido',
      [UNIFIED_LEAD_STATUS.PERDIDO]: 'Perdido',
      [UNIFIED_LEAD_STATUS.INATIVO]: 'Inativo'
    };
    return labels[status] || status;
  };

  // 🎯 EFFECT PRINCIPAL - CARREGAR DADOS COM DEBOUNCE OTIMIZADO
  useEffect(() => {
    if (user) {
      // Apenas carrega na primeira vez ou quando user muda
      if (leads.length === 0) {
        fetchLeads(true);
      }
    } else {
      setLeads([]);
      setLoading(false);
    }
  }, [user]); // Removido fetchLeads das dependências para evitar loop

  // 🎯 EFFECT PARA FILTROS - SEPARADO E OTIMIZADO
  useEffect(() => {
    if (user && leads.length > 0) {
      // Trigger fetch apenas se filtros mudaram de facto
      const currentFiltersString = JSON.stringify(filters);
      if (lastFetchFilters.current !== currentFiltersString) {
        console.log('🔍 Filtros alterados, refrescando dados...');
        
        // Debounce para evitar múltiplas queries
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        
        fetchTimeoutRef.current = setTimeout(() => {
          fetchLeads(true);
        }, 300);
      }
    }
  }, [filters, user, leads.length]); // Agora filtros podem estar aqui sem problemas

  // 🧹 LIMPAR ERRO APÓS 5 SEGUNDOS
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 🧹 LIMPEZA
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // 🎯 RETURN COMPLETO DO HOOK
  return {
    // 📊 Dados
    leads,
    loading,
    error,
    creating,
    converting,
    duplicateCheck,
    filters,
    conversionModal,
    
    // 🔄 Ações CRUD
    createLead,
    updateLead,
    deleteLead,
    
    // 🔄 Ações específicas
    convertLeadToClient,
    updateLeadStatus,
    
    // 🔍 Utilitários
    fetchLeads,
    searchLeads,
    setFilters,
    checkForDuplicates,
    getLeadStats,
    getLeadsByStatus,
    getLeadsByUrgency,
    
    // 🧪 Diagnóstico
    getDiagnostics,
    
    // 📚 Constantes para UI
    LEAD_STATUS: UNIFIED_LEAD_STATUS,
    LEAD_INTEREST_TYPES: UNIFIED_INTEREST_TYPES,
    BUDGET_RANGES: UNIFIED_BUDGET_RANGES,
    LEAD_STATUS_COLORS,
    CLIENT_TYPES,
    PROPERTY_STATUS,
    UNIFIED_LEAD_STATUS,
    UNIFIED_INTEREST_TYPES,
    UNIFIED_BUDGET_RANGES,
    UNIFIED_PRIORITIES,
    UNIFIED_LEAD_SOURCES,
    
    // 🛠️ Helpers
    isValidEmail: validateEmail,
    isValidPhone: validatePortuguesePhone,
    normalizePhone: (phone) => phone?.replace(/\s|-/g, '') || '',
    getInterestTypeLabel,
    getBudgetRangeLabel,
    formatCurrency,
    getStatusLabel,
    
    // 📊 Status e metadata
    isConnected: !loading && !error,
    isUserReady: !!user,
    
    // 📊 Informações da versão
    version: '3.1',
    isMultiTenant: true,
    structureVersion: '3.1-multi-tenant'
  };
};

export default useLeads;