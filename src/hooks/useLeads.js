// src/hooks/useLeads.js
// 🎯 HOOK UNIFICADO PARA GESTÃO DE LEADS - MyImoMate 3.0 MULTI-TENANT COMPLETO
// =============================================================================
// VERSÃO HÍBRIDA: Multi-tenant + Todas as funcionalidades avançadas
// Inclui: Sistema conversão, validações PT, gestão gestores, temperatura leads
// Data: Agosto 2025 | Versão: 3.1 Multi-Tenant Complete

import { useState, useEffect, useCallback } from 'react';
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
const FETCH_LIMIT = 50;

// 🎯 TIPOS ESPECÍFICOS DO SISTEMA AVANÇADO
export const CLIENT_TYPES = {
  COMPRADOR: 'comprador',
  ARRENDATARIO: 'arrendatario',
  INQUILINO: 'inquilino',
  VENDEDOR: 'vendedor',
  SENHORIO: 'senhorio',
  INVESTIDOR: 'Investidor'
};

export const PROPERTY_STATUS = {
  NAO_IDENTIFICADO: 'nao_identificado',
  IDENTIFICADO: 'identificado',
  VISITADO: 'visitado',
  REJEITADO: 'rejeitado',
  APROVADO: 'aprovado'
};

export const LEAD_STATUS_COLORS = {
  [UNIFIED_LEAD_STATUS.NOVO]: 'bg-blue-100 text-blue-800 border-blue-200',
  [UNIFIED_LEAD_STATUS.CONTACTADO]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [UNIFIED_LEAD_STATUS.QUALIFICADO]: 'bg-orange-100 text-orange-800 border-orange-200',
  [UNIFIED_LEAD_STATUS.INTERESSADO]: 'bg-green-100 text-green-800 border-green-200',
  [UNIFIED_LEAD_STATUS.NAO_INTERESSADO]: 'bg-red-100 text-red-800 border-red-200',
  [UNIFIED_LEAD_STATUS.CONVERTIDO]: 'bg-purple-100 text-purple-800 border-purple-200',
  [UNIFIED_LEAD_STATUS.PERDIDO]: 'bg-gray-100 text-gray-800 border-gray-200',
  [UNIFIED_LEAD_STATUS.INATIVO]: 'bg-gray-100 text-gray-800 border-gray-200'
};

// 🎯 HOOK PRINCIPAL MULTI-TENANT COMPLETO
const useLeads = () => {
  // 🔐 AUTENTICAÇÃO E INICIALIZAÇÃO MULTI-TENANT
  const { currentUser: user, userProfile } = useAuth();
  const fbService = useFirebaseService(user);
  
  // 📊 STATES PRINCIPAIS
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // 📊 FILTROS E PESQUISA
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

  // 📊 CARREGAR LEADS COM FILTROS (MULTI-TENANT)
  const fetchLeads = useCallback(async () => {
    if (!user) {
      console.log('useLeads: Aguardando utilizador...');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`📊 Carregando leads para utilizador: ${user.uid}`);
      
      // Construir condições de filtro
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

      if (filters.clientType && Object.values(CLIENT_TYPES).includes(filters.clientType)) {
        whereConditions.push({ field: 'clientType', operator: '==', value: filters.clientType });
      }

      if (filters.propertyStatus && Object.values(PROPERTY_STATUS).includes(filters.propertyStatus)) {
        whereConditions.push({ field: 'propertyStatus', operator: '==', value: filters.propertyStatus });
      }

      const result = await crudHelpers.read({
        orderBy: 'createdAt',
        orderDirection: 'desc',
        limitCount: FETCH_LIMIT,
        where: whereConditions,
        includeInactive: false
      });

      if (result.success) {
        let leadsData = result.data.map(lead => {
          const migratedData = migrateLeadData(lead);
          
          return {
            ...migratedData,
            // Enriquecer com labels para UI
            interestTypeLabel: getInterestTypeLabel(migratedData.interestType),
            budgetRangeLabel: getBudgetRangeLabel(migratedData.budgetRange),
            budgetDisplay: formatCurrency(migratedData.estimatedBudget),
            statusColor: LEAD_STATUS_COLORS[migratedData.status] || LEAD_STATUS_COLORS[UNIFIED_LEAD_STATUS.NOVO],
            
            // Calcular idade do lead
            ageInDays: migratedData.createdAt ? Math.floor((new Date() - new Date(migratedData.createdAt)) / (1000 * 60 * 60 * 24)) : 0,
            
            // Status de urgência baseado na idade
            urgencyLevel: calculateUrgencyLevel(migratedData.createdAt, migratedData.status),
            
            // Flag de conversão disponível
            canConvert: migratedData.status !== UNIFIED_LEAD_STATUS.CONVERTIDO && migratedData.status !== UNIFIED_LEAD_STATUS.PERDIDO
          };
        });

        // Aplicar filtro de pesquisa se existir
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

        setLeads(leadsData);
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
  }, [user, filters, crudHelpers]);

  // 🔄 MIGRAÇÃO DE DADOS PARA COMPATIBILIDADE
  const migrateLeadData = useCallback((leadData) => {
    if (leadData.structureVersion === '3.1') {
      return leadData;
    }

    const migrated = {
      ...leadData,
      isActive: leadData.isActive !== undefined ? leadData.isActive : true,
      priority: leadData.priority || UNIFIED_PRIORITIES.NORMAL,
      status: migrateStatus(leadData.status),
      interestType: migrateInterestType(leadData.interestType),
      budgetRange: migrateBudgetRange(leadData.budgetRange),
      phoneNormalized: leadData.phoneNormalized || leadData.phone?.replace(/\s|-/g, '') || '',
      clientType: leadData.clientType || CLIENT_TYPES.COMPRADOR,
      propertyStatus: leadData.propertyStatus || PROPERTY_STATUS.NAO_IDENTIFICADO,
      propertyReference: leadData.propertyReference || '',
      propertyLink: leadData.propertyLink || '',
      managerName: leadData.managerName || '',
      managerPhone: leadData.managerPhone || '',
      managerEmail: leadData.managerEmail || '',
      managerContactHistory: leadData.managerContactHistory || [],
      managerNotes: leadData.managerNotes || '',
      source: leadData.source || UNIFIED_LEAD_SOURCES.MANUAL,
      estimatedBudget: getBudgetRangeMiddleValue(leadData.budgetRange),
      structureVersion: '3.1',
      migratedAt: new Date().toISOString()
    };

    return migrated;
  }, []);

  // 🔄 HELPERS DE MIGRAÇÃO
  const migrateStatus = (oldStatus) => {
    const statusMap = {
      'novo': UNIFIED_LEAD_STATUS.NOVO,
      'contactado': UNIFIED_LEAD_STATUS.CONTACTADO,
      'qualificado': UNIFIED_LEAD_STATUS.QUALIFICADO,
      'convertido': UNIFIED_LEAD_STATUS.CONVERTIDO,
      'perdido': UNIFIED_LEAD_STATUS.PERDIDO,
      'inativo': UNIFIED_LEAD_STATUS.INATIVO
    };
    return statusMap[oldStatus] || UNIFIED_LEAD_STATUS.NOVO;
  };

  const migrateInterestType = (oldType) => {
    const typeMap = {
      'compra_casa': UNIFIED_INTEREST_TYPES.COMPRA_CASA,
      'compra_apartamento': UNIFIED_INTEREST_TYPES.COMPRA_APARTAMENTO,
      'venda_casa': UNIFIED_INTEREST_TYPES.VENDA_CASA,
      'venda_apartamento': UNIFIED_INTEREST_TYPES.VENDA_APARTAMENTO,
      'arrendamento_casa': UNIFIED_INTEREST_TYPES.ARRENDAMENTO_CASA,
      'arrendamento_apartamento': UNIFIED_INTEREST_TYPES.ARRENDAMENTO_APARTAMENTO,
    };
    return typeMap[oldType] || UNIFIED_INTEREST_TYPES.COMPRA_CASA;
  };

  const migrateBudgetRange = (oldRange) => {
    const rangeMap = {
      '0-100k': UNIFIED_BUDGET_RANGES.ATE_100K,
      '100k-200k': UNIFIED_BUDGET_RANGES.DE_100K_200K,
      '200k-300k': UNIFIED_BUDGET_RANGES.DE_200K_300K,
      '300k-500k': UNIFIED_BUDGET_RANGES.DE_300K_500K,
      '500k-750k': UNIFIED_BUDGET_RANGES.DE_500K_750K,
      '750k-1M': UNIFIED_BUDGET_RANGES.DE_750K_1M,
      '1M+': UNIFIED_BUDGET_RANGES.ACIMA_1M,
      'undefined': UNIFIED_BUDGET_RANGES.INDEFINIDO
    };
    return rangeMap[oldRange] || UNIFIED_BUDGET_RANGES.INDEFINIDO;
  };

  // ⏰ CALCULAR NÍVEL DE URGÊNCIA/TEMPERATURA
  const calculateUrgencyLevel = useCallback((createdAt, status) => {
    if (!createdAt) return 'normal';
    
    const ageInDays = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    
    // Leads já convertidos ou perdidos não têm urgência
    if (status === UNIFIED_LEAD_STATUS.CONVERTIDO || status === UNIFIED_LEAD_STATUS.PERDIDO) {
      return 'resolved';
    }
    
    // Sistema de temperatura baseado na idade
    if (ageInDays <= 1) return 'hot';      // Últimas 24h
    if (ageInDays <= 7) return 'warm';     // Última semana
    if (ageInDays <= 30) return 'cool';    // Último mês
    return 'cold';                         // Mais de 1 mês
  }, []);

  // 🔍 VERIFICAÇÃO DE DUPLICADOS (MULTI-TENANT)
  const checkForDuplicates = useCallback(async (phone, email) => {
    setDuplicateCheck(true);
    
    try {
      const duplicates = [];
      
      if (phone) {
        const normalizedPhone = phone.replace(/\s|-/g, '');
        const phoneResult = await crudHelpers.read({
          where: [{ field: 'phoneNormalized', operator: '==', value: normalizedPhone }],
          limitCount: 5
        });
        
        if (phoneResult.success) {
          phoneResult.data.forEach(lead => {
            duplicates.push({ 
              ...lead, 
              duplicateField: 'phone' 
            });
          });
        }
      }

      if (email) {
        const emailResult = await crudHelpers.read({
          where: [{ field: 'email', operator: '==', value: email.toLowerCase() }],
          limitCount: 5
        });
        
        if (emailResult.success) {
          emailResult.data.forEach(lead => {
            if (!duplicates.find(d => d.id === lead.id)) {
              duplicates.push({ 
                ...lead, 
                duplicateField: 'email' 
              });
            }
          });
        }
      }

      console.log(`Verificação de duplicados: ${duplicates.length} encontrados`);
      
      return {
        hasDuplicates: duplicates.length > 0,
        duplicates,
        count: duplicates.length
      };
      
    } catch (err) {
      console.error('Erro ao verificar duplicados:', err);
      return { hasDuplicates: false, duplicates: [], error: err.message };
    } finally {
      setDuplicateCheck(false);
    }
  }, [crudHelpers]);

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
        
        // Tracking e flags
        lastActivity: null,
        nextFollowUp: calculateNextFollowUp(leadData.priority),
        canConvert: true,
        hasBeenContacted: false,
        isConverted: false,
        
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
      const result = await crudHelpers.create(newLead);

      if (result.success) {
        // Enriquecer dados para UI
        const enrichedLead = {
          ...result.data,
          interestTypeLabel: getInterestTypeLabel(result.data.interestType),
          budgetRangeLabel: getBudgetRangeLabel(result.data.budgetRange),
          budgetDisplay: formatCurrency(result.data.estimatedBudget),
          statusColor: LEAD_STATUS_COLORS[result.data.status],
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
      }

    } catch (err) {
      console.error('❌ Erro ao criar lead:', err);
      setError(err.message);
      
      return {
        success: false,
        error: err.message,
        message: `Erro ao criar lead: ${err.message}`
      };
    } finally {
      setCreating(false);
    }
  }, [user, checkForDuplicates, crudHelpers]);

  // ✏️ ATUALIZAR LEAD (MULTI-TENANT)
  const updateLead = useCallback(async (leadId, updateData) => {
    if (!user?.uid) {
      return { success: false, error: 'Utilizador não autenticado' };
    }

    if (!leadId) {
      return { success: false, error: 'ID do lead é obrigatório' };
    }

    try {
      setError(null);

      const allowedFields = [
        'name', 'phone', 'email', 'interestType', 'budgetRange', 
        'location', 'notes', 'status', 'priority', 'source',
        'clientType', 'propertyStatus', 'propertyReference', 'propertyLink',
        'managerName', 'managerPhone', 'managerEmail', 'managerNotes',
        'managerContactHistory', 'preferredContactTime'
      ];

      const validUpdateData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          validUpdateData[key] = updateData[key];
        }
      });

      // Validações específicas
      if (validUpdateData.phone && !validatePortuguesePhone(validUpdateData.phone)) {
        return { success: false, error: 'Formato de telefone inválido' };
      }

      if (validUpdateData.email && !validateEmail(validUpdateData.email)) {
        return { success: false, error: 'Formato de email inválido' };
      }

      if (validUpdateData.managerPhone && !validatePortuguesePhone(validUpdateData.managerPhone)) {
        return { success: false, error: 'Formato de telefone do gestor inválido' };
      }

      if (validUpdateData.managerEmail && !validateEmail(validUpdateData.managerEmail)) {
        return { success: false, error: 'Formato de email do gestor inválido' };
      }

      // Preparar dados finais
      const finalUpdateData = {
        ...validUpdateData,
        
        // Recalcular campos dependentes
        ...(validUpdateData.budgetRange && { 
          estimatedBudget: getBudgetRangeMiddleValue(validUpdateData.budgetRange)
        }),
        
        ...(validUpdateData.status && {
          lastStatusChange: new Date(),
          hasBeenContacted: validUpdateData.status !== UNIFIED_LEAD_STATUS.NOVO
        }),
        
        // Atualizar última atividade
        lastActivity: new Date(),
        
        // Normalizar telefone se atualizado
        ...(validUpdateData.phone && {
          phoneNormalized: validUpdateData.phone.replace(/\s|-/g, '')
        }),
        
        // Normalizar email se atualizado
        ...(validUpdateData.email && {
          email: validUpdateData.email.toLowerCase()
        })
      };

      const result = await crudHelpers.update(leadId, finalUpdateData);

      if (result.success) {
        // Atualizar lista local
        setLeads(prev => prev.map(lead => {
          if (lead.id === leadId) {
            const updatedLead = {
              ...lead,
              ...finalUpdateData,
              updatedAt: new Date(),
              interestTypeLabel: getInterestTypeLabel(finalUpdateData.interestType || lead.interestType),
              budgetRangeLabel: getBudgetRangeLabel(finalUpdateData.budgetRange || lead.budgetRange),
              budgetDisplay: formatCurrency(finalUpdateData.estimatedBudget || lead.estimatedBudget),
              statusColor: LEAD_STATUS_COLORS[finalUpdateData.status || lead.status],
              urgencyLevel: calculateUrgencyLevel(lead.createdAt, finalUpdateData.status || lead.status),
              canConvert: (finalUpdateData.status || lead.status) !== UNIFIED_LEAD_STATUS.CONVERTIDO && 
                         (finalUpdateData.status || lead.status) !== UNIFIED_LEAD_STATUS.PERDIDO
            };
            return updatedLead;
          }
          return lead;
        }));

        console.log('✅ Lead atualizado:', leadId);

        return { success: true, leadId };
      }

    } catch (err) {
      console.error('❌ Erro ao atualizar lead:', err);
      return { success: false, error: err.message };
    }
  }, [user, crudHelpers, calculateUrgencyLevel]);

  // 📞 ADICIONAR CONTACTO COM GESTOR
  const addManagerContact = useCallback(async (leadId, contactData) => {
    if (!user?.uid) {
      return { success: false, error: 'Utilizador não autenticado' };
    }

    try {
      // Ler lead atual
      const leadResult = await crudHelpers.readOne(leadId);
      
      if (!leadResult.success) {
        return { success: false, error: 'Lead não encontrado' };
      }

      const lead = leadResult.data;
      const currentHistory = lead.managerContactHistory || [];
      
      const newContact = {
        id: Date.now().toString(),
        contactDate: contactData.contactDate || new Date().toISOString(),
        contactType: contactData.contactType || 'phone',
        notes: contactData.notes || '',
        outcome: contactData.outcome || '',
        addedBy: user.uid,
        addedAt: new Date().toISOString()
      };

      const updatedHistory = [...currentHistory, newContact];

      const result = await crudHelpers.update(leadId, {
        managerContactHistory: updatedHistory
      });

      if (result.success) {
        // Atualizar lista local
        setLeads(prev => prev.map(lead => 
          lead.id === leadId 
            ? { ...lead, managerContactHistory: updatedHistory, updatedAt: new Date() }
            : lead
        ));

        return { success: true, contact: newContact };
      }

      return { success: false, error: 'Falha ao atualizar histórico' };

    } catch (err) {
      console.error('❌ Erro ao adicionar contacto:', err);
      return { success: false, error: err.message };
    }
  }, [user, crudHelpers]);

  // 🔄 ATUALIZAR STATUS DO LEAD
  const updateLeadStatus = useCallback(async (leadId, newStatus, notes = '') => {
    if (!user) return;

    try {
      if (!Object.values(UNIFIED_LEAD_STATUS).includes(newStatus)) {
        throw new Error(`Status inválido: ${newStatus}`);
      }

      const updateData = {
        status: newStatus,
        lastStatusChange: new Date(),
        hasBeenContacted: newStatus !== UNIFIED_LEAD_STATUS.NOVO,
        statusHistory: {
          [`change_${Date.now()}`]: {
            from: '', // Poderia ser obtido do lead atual
            to: newStatus,
            changedBy: user.uid,
            changedAt: new Date().toISOString(),
            notes: notes.trim(),
            userAgent: navigator.userAgent
          }
        }
      };

      if (notes.trim()) {
        updateData.statusChangeNote = notes.trim();
      }

      const result = await crudHelpers.update(leadId, updateData);

      if (result.success) {
        setLeads(prev => 
          prev.map(lead => 
            lead.id === leadId 
              ? { 
                  ...lead, 
                  status: newStatus, 
                  statusColor: LEAD_STATUS_COLORS[newStatus],
                  updatedAt: new Date() 
                }
              : lead
          )
        );

        console.log(`✅ Status do lead ${leadId} atualizado para: ${newStatus}`);
        
        return { 
          success: true, 
          message: `Status atualizado para ${getStatusLabel(newStatus)}!` 
        };
      }

    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      return { success: false, error: err.message };
    }
  }, [user, crudHelpers]);

  // 🔄 CONVERSÃO COMPLETA LEAD→CLIENTE+OPORTUNIDADE (MULTI-TENANT)
  const convertLeadToClient = useCallback(async (leadId, additionalClientData = {}) => {
    if (!user) {
      return { success: false, error: 'Utilizador não autenticado' };
    }

    // Se não vem do modal, abrir modal obrigatório
    if (!additionalClientData.fromModal && !additionalClientData.skipModal) {
      debugLog('conversion', 'Abrindo modal de conversão obrigatório', { leadId });

      try {
        const leadResult = await crudHelpers.readOne(leadId);
        
        if (!leadResult.success) {
          return { success: false, error: 'Lead não encontrado' };
        }

        const leadData = leadResult.data;
        
        if (leadData.isConverted || leadData.status === UNIFIED_LEAD_STATUS.CONVERTIDO) {
          return { 
            success: false, 
            error: 'Este lead já foi convertido anteriormente' 
          };
        }

        setConversionModal(prev => ({
          ...prev,
          isOpen: true,
          leadData: leadData
        }));

        if (conversionModal.debugger) {
          conversionModal.debugger.logModalOpen(leadData);
        }

        return { success: true, modalOpened: true, message: 'Modal de conversão aberto' };

      } catch (err) {
        debugError(err, { action: 'openConversionModal', leadId });
        return { success: false, error: 'Erro ao abrir modal de conversão' };
      }
    }

    // Validação relaxada se vem do modal
    if (additionalClientData.fromModal && additionalClientData.clientData) {
      console.log('🔍 Aplicando validação relaxada para dados do modal...');
      
      const validation = validateLeadConversionRelaxed(
        additionalClientData.leadData, 
        additionalClientData.clientData, 
        { allowIncomplete: true }
      );
      
      console.log('📊 Resultado validação relaxada:', validation);

      if (!validation.isValid && validation.errors.some(err => err.type === 'critical')) {
        console.log('❌ Validação crítica falhou:', validation.errors);
        return {
          success: false,
          error: 'Dados críticos em falta (nome e telefone)',
          validationErrors: validation.errors
        };
      }

      console.log('✅ Validação relaxada passou - continuando conversão...');
      
      // Melhorar dados do cliente
      const improvedClientData = {
        name: additionalClientData.clientData.nome || additionalClientData.leadData?.name || '',
        email: additionalClientData.clientData.email || additionalClientData.leadData?.email || '',
        phone: additionalClientData.clientData.telefone || additionalClientData.leadData?.phone || '',
        numeroCC: additionalClientData.clientData.numeroCC || '',
        numeroFiscal: additionalClientData.clientData.numeroFiscal || '',
        profissao: additionalClientData.clientData.profissao || 'Não especificado',
        dataNascimento: additionalClientData.clientData.dataNascimento || '',
        estadoCivil: additionalClientData.clientData.estadoCivil || 'nao_especificado',
        notes: [
          additionalClientData.clientData.observacoesConsultor || '',
          '',
          `--- CONVERSÃO DE LEAD (${new Date().toLocaleDateString('pt-PT')}) ---`,
          `Pontuação de qualidade: ${validation.qualityScore}/100`,
          validation.warnings.length > 0 ? 'AVISOS: Dados incompletos detectados' : '',
          ...validation.warnings.map(w => `• ${w.message}`)
        ].filter(Boolean).join('\n')
      };
      
      additionalClientData.clientData = improvedClientData;
      
      console.log('👤 Dados do cliente melhorados:', improvedClientData);
    }

    setConverting(true);
    setError(null);

    try {
      console.log('📋 Buscando dados do lead:', leadId);
      
      const leadResult = await crudHelpers.readOne(leadId);
      
      if (!leadResult.success) {
        throw new Error('Lead não encontrado');
      }

      const leadData = leadResult.data;
      
      if (leadData.isConverted || leadData.status === UNIFIED_LEAD_STATUS.CONVERTIDO) {
        return { 
          success: false, 
          error: 'Este lead já foi convertido anteriormente' 
        };
      }

      // Usar transação para garantir consistência
      const result = await fbService.runTransaction(async (transaction, service) => {
        console.log('👤 Preparando dados do cliente...');
        
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
          ...(additionalClientData.clientData || {}),
          source: leadData.source || 'lead_conversion',
          originalLeadId: leadId,
          convertedFromLead: true,
          leadConvertedAt: new Date().toISOString(),
          notes: `${leadData.notes || ''}\n\nConvertido do lead em ${new Date().toLocaleDateString('pt-PT')}\nOrigem: ${leadData.source || 'Manual'}`,
          status: 'ativo',
          priority: leadData.priority || 'normal',
          ...additionalClientData
        };

        console.log('💾 Criando cliente na subcoleção...');
        const clientResult = await service.createDocument(CLIENTS_SUBCOLLECTION, clientData);

        console.log('🎯 Preparando dados da oportunidade...');
        
        const getOpportunityType = (interestType) => {
          if (interestType?.includes('compra')) return 'compra';
          if (interestType?.includes('venda')) return 'venda';
          if (interestType?.includes('arrendamento')) return 'arrendamento';
          if (interestType?.includes('aluguer')) return 'aluguer';
          return 'compra';
        };

        const getBudgetValue = (budgetRange) => {
          const values = {
            'ate_50k': 35000,
            'de_50k_100k': 75000,
            'de_100k_200k': 150000,
            'de_200k_300k': 250000,
            'de_300k_500k': 400000,
            'de_500k_750k': 625000,
            'de_750k_1m': 875000,
            'acima_1m': 1250000,
            'indefinido': 200000
          };
          return values[budgetRange] || 200000;
        };

        const opportunityData = {
          title: `${getOpportunityType(leadData.interestType).charAt(0).toUpperCase() + getOpportunityType(leadData.interestType).slice(1)} - ${leadData.name}`,
          description: `Oportunidade criada automaticamente da conversão do lead ${leadData.name}.\nTipo: ${leadData.interestType || 'Não especificado'}\nLocalização: ${leadData.location || 'Não especificada'}`,
          clientId: clientResult.id,
          clientName: leadData.name,
          clientEmail: leadData.email || '',
          clientPhone: leadData.phone,
          opportunityType: getOpportunityType(leadData.interestType),
          status: 'qualificacao',
          priority: leadData.priority || 'normal',
          value: getBudgetValue(leadData.budgetRange),
          probability: 25,
          estimatedCloseDate: (() => {
            const now = new Date();
            now.setMonth(now.getMonth() + 3);
            return now.toISOString().split('T')[0];
          })(),
          propertyDetails: {
            type: leadData.interestType || '',
            location: leadData.location || '',
            reference: leadData.propertyReference || '',
            link: leadData.propertyLink || '',
            budget: getBudgetValue(leadData.budgetRange),
            status: leadData.propertyStatus || 'nao_identificado'
          },
          managerInfo: leadData.managerName ? {
            name: leadData.managerName,
            phone: leadData.managerPhone || '',
            email: leadData.managerEmail || '',
            notes: leadData.managerNotes || ''
          } : null,
          source: leadData.source || 'lead_conversion',
          leadId: leadId,
          convertedFromLead: true,
          notes: `Convertido automaticamente do lead ${leadData.name} em ${new Date().toLocaleDateString('pt-PT')}.\n\nObservações do lead: ${leadData.notes || 'Nenhuma'}`,
          activities: [
            {
              id: Date.now(),
              type: 'conversao',
              title: 'Lead convertido para oportunidade',
              description: `Lead ${leadData.name} convertido para cliente e oportunidade automaticamente.`,
              date: new Date().toISOString(),
              createdBy: user.uid,
              outcome: 'Conversão realizada com sucesso'
            }
          ],
          nextActions: [
            'Contactar cliente para validar interesse',
            'Agendar reunião/visita',
            'Apresentar opções disponíveis',
            'Qualificar orçamento específico'
          ]
        };

        console.log('💾 Criando oportunidade na subcoleção...');
        const opportunityResult = await service.createDocument(OPPORTUNITIES_SUBCOLLECTION, opportunityData);

        // Atualizar cliente com referência à oportunidade
        await service.updateDocument(CLIENTS_SUBCOLLECTION, clientResult.id, {
          hasOpportunities: true,
          lastOpportunityId: opportunityResult.id,
          lastOpportunityCreated: new Date()
        });

        console.log('🔄 Atualizando status do lead...');
        await service.updateDocument(LEADS_SUBCOLLECTION, leadId, {
          status: UNIFIED_LEAD_STATUS.CONVERTIDO,
          isConverted: true,
          convertedAt: new Date(),
          convertedToClientId: clientResult.id,
          convertedToOpportunityId: opportunityResult.id,
          conversionDetails: {
            clientCreated: true,
            opportunityCreated: true,
            convertedBy: user.uid,
            conversionDate: new Date().toISOString(),
            automatedConversion: !additionalClientData.fromModal,
            modalValidation: !!additionalClientData.fromModal
          }
        });

        return {
          clientId: clientResult.id,
          opportunityId: opportunityResult.id,
          client: clientResult.data,
          opportunity: opportunityResult.data
        };
      });

      // Atualizar lista local
      setLeads(prev => 
        prev.map(lead => 
          lead.id === leadId 
            ? { 
                ...lead, 
                status: UNIFIED_LEAD_STATUS.CONVERTIDO,
                isConverted: true,
                convertedAt: new Date(),
                convertedToClientId: result.result.clientId,
                convertedToOpportunityId: result.result.opportunityId,
                statusColor: LEAD_STATUS_COLORS[UNIFIED_LEAD_STATUS.CONVERTIDO],
                urgencyLevel: 'resolved',
                canConvert: false,
                updatedAt: new Date()
              }
            : lead
        )
      );

      // Fechar modal se estava aberto
      if (conversionModal.isOpen) {
        setConversionModal(prev => ({
          ...prev,
          isOpen: false,
          leadData: null
        }));
      }

      setConverting(false);
      
      console.log('🎉 Conversão concluída com sucesso!');
      console.log('Cliente ID:', result.result.clientId);
      console.log('Oportunidade ID:', result.result.opportunityId);
      
      return {
        success: true,
        clientId: result.result.clientId,
        opportunityId: result.result.opportunityId,
        clientData: result.result.client,
        opportunityData: result.result.opportunity,
        message: `Lead convertido com sucesso!\n✅ Cliente criado: ${leadData.name}\n✅ Oportunidade criada: ${result.result.opportunity.title}`
      };

    } catch (err) {
      console.error('❌ Erro na conversão:', err);
      setError(err.message || 'Erro ao converter lead');
      setConverting(false);
      
      debugError(err, { action: 'convertLeadToClient', leadId });
      
      return {
        success: false,
        error: err.message || 'Erro inesperado ao converter lead para cliente'
      };
    }
  }, [user, crudHelpers, fbService, conversionModal]);

  // 🔄 PROCESSAMENTO SIMPLIFICADO DE CONVERSÃO
  const processLeadConversion = useCallback(async (conversionData) => {
    console.log('🔄 [processLeadConversion] Iniciando...', { leadId: conversionData.leadId });
    
    try {
      const result = await convertLeadToClient(conversionData.leadId, {
        fromModal: true,
        skipModal: true,
        leadData: conversionData.leadData,
        clientData: conversionData.clientData,
        createOpportunity: conversionData.createOpportunity !== false,
        createSpouse: conversionData.createSpouse && conversionData.clientData?.temConjuge,
        conversionApproved: conversionData.conversionApproved
      });

      console.log('✅ [processLeadConversion] Resultado:', result);
      return result;

    } catch (error) {
      console.error('❌ [processLeadConversion] Erro:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }, [convertLeadToClient]);

  // 🔄 FECHAR MODAL DE CONVERSÃO
  const closeConversionModal = useCallback(() => {
    if (conversionModal.debugger && conversionModal.leadData) {
      conversionModal.debugger.logModalClose('user_cancelled');
    }

    debugLog('conversion', 'Modal de conversão fechado pelo usuário');

    setConversionModal(prev => ({
      ...prev,
      isOpen: false,
      leadData: null
    }));
  }, [conversionModal.debugger, conversionModal.leadData]);

  // 📊 DEBUG LOG HANDLER
  const handleDebugLog = useCallback((logEntry) => {
    debugLog('debug', 'Log do modal de conversão', logEntry);
  }, []);

  // 🗑️ ELIMINAR LEAD (MULTI-TENANT)
  const deleteLead = useCallback(async (leadId, hardDelete = false) => {
    if (!user) return;

    try {
      const result = await crudHelpers.delete(leadId, hardDelete);
      
      if (result.success) {
        // Remover da lista local
        setLeads(prev => prev.filter(lead => lead.id !== leadId));
        
        console.log(`✅ Lead ${leadId} ${hardDelete ? 'eliminado permanentemente' : 'marcado como inativo'}`);
        
        return { 
          success: true, 
          message: hardDelete ? 'Lead eliminado permanentemente!' : 'Lead removido da lista!' 
        };
      }

    } catch (err) {
      console.error('❌ Erro ao eliminar lead:', err);
      return { success: false, error: err.message };
    }
  }, [user, crudHelpers]);

  // 🔍 PESQUISAR LEADS
  const searchLeads = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

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

      // Se já foi convertido, não conta para temperatura
      if (lead.status === UNIFIED_LEAD_STATUS.CONVERTIDO) {
        return;
      }

      // NOVOS QUENTES: Leads criados nos últimos 15 dias com status "novo"
      if (dataLead >= quinzeDiasAtras && lead.status === UNIFIED_LEAD_STATUS.NOVO) {
        novosQuentes++;
      }
      // MORNOS: Leads qualificados/contactados há 15-30 dias sem conversão
      else if (
        (lead.status === UNIFIED_LEAD_STATUS.QUALIFICADO || lead.status === UNIFIED_LEAD_STATUS.CONTACTADO) &&
        ultimaAtualizacao < quinzeDiasAtras &&
        ultimaAtualizacao >= trintaDiasAtras
      ) {
        leadsMornos++;
      }
      // FRIOS: Leads antigos (>30 dias) sem conversão
      else if (dataLead < trintaDiasAtras && lead.status !== UNIFIED_LEAD_STATUS.CONVERTIDO) {
        leadsFrios++;
      }
    });

    // Compatibilidade com cards do sistema original
    stats.novos = novosQuentes;
    stats.qualificados = stats.byStatus[UNIFIED_LEAD_STATUS.QUALIFICADO] || 0;
    stats.pendentes = leadsMornos; // "Pendentes" → "Mornos"
    stats.convertidos = stats.byStatus[UNIFIED_LEAD_STATUS.CONVERTIDO] || 0;
    stats.frios = leadsFrios;

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

  // 🎯 EFFECT PRINCIPAL - CARREGAR DADOS
  useEffect(() => {
    if (user) {
      fetchLeads();
    } else {
      setLeads([]);
      setLoading(false);
    }
  }, [user, fetchLeads]);

  // 🧹 LIMPAR ERRO APÓS 5 SEGUNDOS
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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
    processLeadConversion,
    updateLeadStatus,
    addManagerContact,
    
    // 🔄 Modal de conversão
    closeConversionModal,
    handleDebugLog,
    
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
    isConnected: !!user && !error,
    structureVersion: '3.1',
    isUnified: true,
    isMultiTenant: true
  };
};

// 🎯 HELPER FUNCTIONS
// ==================

/**
 * Obter valor médio da faixa de orçamento
 */
const getBudgetRangeMiddleValue = (budgetRange) => {
  const values = {
    [UNIFIED_BUDGET_RANGES.ATE_50K]: 35000,
    [UNIFIED_BUDGET_RANGES.DE_50K_100K]: 75000,
    [UNIFIED_BUDGET_RANGES.DE_100K_200K]: 150000,
    [UNIFIED_BUDGET_RANGES.DE_200K_300K]: 250000,
    [UNIFIED_BUDGET_RANGES.DE_300K_500K]: 400000,
    [UNIFIED_BUDGET_RANGES.DE_500K_750K]: 625000,
    [UNIFIED_BUDGET_RANGES.DE_750K_1M]: 875000,
    [UNIFIED_BUDGET_RANGES.ACIMA_1M]: 1250000,
    [UNIFIED_BUDGET_RANGES.INDEFINIDO]: 200000
  };
  
  return values[budgetRange] || 200000;
};

/**
 * Calcular score inicial do lead
 */
const calculateInitialLeadScore = (leadData) => {
  let score = 50; // Base score
  
  // Bonus por orçamento mais alto
  if (leadData.budgetRange === UNIFIED_BUDGET_RANGES.ACIMA_1M) score += 30;
  else if (leadData.budgetRange === UNIFIED_BUDGET_RANGES.DE_500K_750K) score += 20;
  else if (leadData.budgetRange === UNIFIED_BUDGET_RANGES.DE_300K_500K) score += 15;
  
  // Bonus por prioridade
  if (leadData.priority === UNIFIED_PRIORITIES.ALTA) score += 20;
  else if (leadData.priority === UNIFIED_PRIORITIES.MEDIA) score += 10;
  
  // Bonus por interesse específico
  if (leadData.interestType === UNIFIED_INTEREST_TYPES.COMPRA_CASA) score += 15;
  else if (leadData.interestType === UNIFIED_INTEREST_TYPES.VENDA_CASA) score += 10;
  
  return Math.min(100, Math.max(0, score));
};

/**
 * Calcular próximo follow-up
 */
const calculateNextFollowUp = (priority) => {
  const now = new Date();
  switch (priority) {
    case UNIFIED_PRIORITIES.ALTA:
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 dia
    case UNIFIED_PRIORITIES.MEDIA:
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 dias
    default:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias
  }
};

export default useLeads;