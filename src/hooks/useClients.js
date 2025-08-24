// src/hooks/useClients.js
// 🎯 HOOK UNIFICADO PARA GESTÃO DE CLIENTES - MyImoMate 3.0 MULTI-TENANT COMPLETO
// ===============================================================================
// VERSÃO HÍBRIDA: Multi-tenant + Todas as funcionalidades avançadas + ANTI-LOOP
// Inclui: Conversão cliente→oportunidade, sincronização, migração, GDPR, auditoria
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
  UNIFIED_CLIENT_STATUS,
  UNIFIED_PRIORITIES,
  UNIFIED_CONTACT_TIMES,
  getInterestTypeLabel,
  getBudgetRangeLabel,
  formatCurrency
} from '../constants/unifiedTypes.js';

import {
  CORE_DATA_STRUCTURE,
  PERSONAL_DATA_STRUCTURE,
  applyCoreStructure,
  validateCoreStructure,
  CLIENT_TEMPLATE
} from '../constants/coreStructure.js';

import {
  validateClient,
  validateForDuplicates,
  formatValidatedData,
  validatePortuguesePhone,
  validateEmail,
  validateNIF,
  validatePostalCode
} from '../constants/validations.js';

// 🎯 CONFIGURAÇÕES DO HOOK MULTI-TENANT
const CLIENTS_SUBCOLLECTION = SUBCOLLECTIONS.CLIENTS;
const OPPORTUNITIES_SUBCOLLECTION = SUBCOLLECTIONS.OPPORTUNITIES;
const VISITS_SUBCOLLECTION = SUBCOLLECTIONS.VISITS;
const DEALS_SUBCOLLECTION = SUBCOLLECTIONS.DEALS;
const FETCH_LIMIT = 100;

// 🎯 TIPOS DE CLIENTE ESPECÍFICOS
export const CLIENT_TYPES = {
  COMPRADOR: 'comprador',
  VENDEDOR: 'vendedor',
  ARRENDATARIO: 'arrendatario',
  SENHORIO: 'senhorio',
  INVESTIDOR: 'investidor'
};

export const CLIENT_TYPE_LABELS = {
  [CLIENT_TYPES.COMPRADOR]: 'Comprador',
  [CLIENT_TYPES.VENDEDOR]: 'Vendedor',
  [CLIENT_TYPES.ARRENDATARIO]: 'Arrendatário',
  [CLIENT_TYPES.SENHORIO]: 'Senhorio',
  [CLIENT_TYPES.INVESTIDOR]: 'Investidor'
};

// 🌡️ CORES PARA STATUS DE CLIENTES
export const CLIENT_STATUS_COLORS = {
  [UNIFIED_CLIENT_STATUS.ATIVO]: 'bg-green-100 text-green-800 border-green-200',
  [UNIFIED_CLIENT_STATUS.INATIVO]: 'bg-gray-100 text-gray-800 border-gray-200',
  [UNIFIED_CLIENT_STATUS.PROSPETO]: 'bg-blue-100 text-blue-800 border-blue-200',
  [UNIFIED_CLIENT_STATUS.SUSPENSO]: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

// 🎯 HOOK PRINCIPAL MULTI-TENANT COM CORREÇÕES ANTI-LOOP
const useClients = () => {
  // 🔐 AUTENTICAÇÃO E INICIALIZAÇÃO MULTI-TENANT
  const { currentUser: user, userProfile } = useAuth();
  const fbService = useFirebaseService(user);

  // 📊 STATES PRINCIPAIS
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [converting, setConverting] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState(false);

  // 📊 FILTROS E PESQUISA - COM CONTROLE ANTI-LOOP
  const [filters, setFilters] = useState({
    status: '',
    clientType: '',
    interestType: '',
    budgetRange: '',
    priority: '',
    searchTerm: ''
  });

  // 🔧 CONTROLES ANTI-LOOP
  const fetchTimeoutRef = useRef(null);
  const lastFetchFilters = useRef('');
  const mountedRef = useRef(false);

  // 🎯 HELPERS CRUD MULTI-TENANT
  const crudHelpers = createCRUDHelpers(CLIENTS_SUBCOLLECTION);

  // 🔐 VERIFICAR SE UTILIZADOR ESTÁ PRONTO
  const isUserReady = user && user.uid && fbService;

  // 🔧 FUNÇÕES AUXILIARES PARA CÁLCULOS
  const calculateDataCompleteness = useCallback((clientData) => {
    if (!clientData) return 0;
    
    const requiredFields = [
      'name', 'primaryEmail', 'primaryPhone', 'interestType', 
      'budgetRange', 'clientType', 'preferredLocation'
    ];
    const optionalFields = [
      'secondaryPhone', 'alternativeEmail', 'nif', 'cc', 
      'address.street', 'address.city', 'dateOfBirth'
    ];
    
    let completedRequired = 0;
    let completedOptional = 0;
    
    requiredFields.forEach(field => {
      if (getNestedValue(clientData, field)) completedRequired++;
    });
    
    optionalFields.forEach(field => {
      if (getNestedValue(clientData, field)) completedOptional++;
    });
    
    const requiredWeight = 0.7;
    const optionalWeight = 0.3;
    
    return Math.round(
      (completedRequired / requiredFields.length) * requiredWeight * 100 +
      (completedOptional / optionalFields.length) * optionalWeight * 100
    );
  }, []);

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const isRecentlyActive = useCallback((lastInteraction, createdAt) => {
    if (!lastInteraction && !createdAt) return false;
    
    const referenceDate = lastInteraction || createdAt;
    const date = referenceDate instanceof Date ? referenceDate : 
                 referenceDate.toDate ? referenceDate.toDate() : new Date(referenceDate);
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return date >= thirtyDaysAgo;
  }, []);

  const isHighValueClient = useCallback((budgetRange, interestType) => {
    const highValueBudgets = [
      UNIFIED_BUDGET_RANGES.ATE_500K,
      UNIFIED_BUDGET_RANGES.ACIMA_500K
    ];
    
    const highValueTypes = [
      UNIFIED_INTEREST_TYPES.INVESTIMENTO_COMERCIAL,
      UNIFIED_INTEREST_TYPES.INVESTIMENTO_RESIDENCIAL
    ];
    
    return highValueBudgets.includes(budgetRange) || 
           highValueTypes.includes(interestType);
  }, []);

  const suggestNextAction = useCallback((clientData) => {
    if (!clientData) return 'Contactar cliente';
    
    if (!clientData.lastInteraction) return 'Primeiro contacto';
    if (clientData.hasOpportunities) return 'Acompanhar oportunidades';
    if (clientData.dataCompleteness < 80) return 'Completar dados';
    return 'Agendar follow-up';
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
    const daysToAdd = priority === UNIFIED_PRIORITIES.ALTA ? 3 : 
                     priority === UNIFIED_PRIORITIES.NORMAL ? 7 : 14;
    
    const followUpDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    return followUpDate;
  }, []);

  // 📥 BUSCAR TODOS OS CLIENTES COM ESTRUTURA UNIFICADA (MULTI-TENANT) - ANTI-LOOP
  const fetchClients = useCallback(async (forceRefresh = false) => {
    if (!isUserReady) {
      console.log('useClients: Aguardando utilizador...');
      return;
    }
    
    // Evitar múltiplas chamadas desnecessárias
    const currentFiltersString = JSON.stringify(filters);
    if (!forceRefresh && lastFetchFilters.current === currentFiltersString && clients.length > 0) {
      console.log('useClients: Filtros inalterados, skip fetch');
      return;
    }
    
    // Cancelar fetch anterior se existir
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`📊 Carregando clientes para utilizador: ${user.uid}`);
      
      // Construir query com filtros
      const queryOptions = {
        orderBy: [{ field: 'createdAt', direction: 'desc' }],
        limitCount: FETCH_LIMIT
      };

      // Aplicar filtros ao nível da query quando possível
      const whereConditions = [];
      
      if (filters.status && Object.values(UNIFIED_CLIENT_STATUS).includes(filters.status)) {
        whereConditions.push({ field: 'status', operator: '==', value: filters.status });
      }
      
      if (filters.clientType && Object.values(CLIENT_TYPES).includes(filters.clientType)) {
        whereConditions.push({ field: 'clientType', operator: '==', value: filters.clientType });
      }
      
      if (filters.priority && Object.values(UNIFIED_PRIORITIES).includes(filters.priority)) {
        whereConditions.push({ field: 'priority', operator: '==', value: filters.priority });
      }

      if (whereConditions.length > 0) {
        queryOptions.where = whereConditions;
      }

      // Executar query usando FirebaseService multi-tenant
      const result = await fbService.readDocuments(CLIENTS_SUBCOLLECTION, queryOptions);

      if (result.success && Array.isArray(result.data)) {
        console.log(`📊 Encontrados ${result.data.length} clientes brutos`);

        // Processar e enriquecer dados
        let clientsData = result.data.map(clientDoc => {
          const migratedData = migrateClientData(clientDoc);
          
          return {
            id: clientDoc.id,
            ...migratedData,
            
            // Enriquecimentos para UI
            clientTypeLabel: CLIENT_TYPE_LABELS[migratedData.clientType] || 'N/A',
            interestTypeLabel: getInterestTypeLabel(migratedData.interestType),
            budgetRangeLabel: getBudgetRangeLabel(migratedData.budgetRange),
            budgetDisplay: formatCurrency(getBudgetRangeMiddleValue(migratedData.budgetRange)),
            statusColor: CLIENT_STATUS_COLORS[migratedData.status],
            
            // Cálculos temporais
            ageInDays: migratedData.createdAt ? 
              Math.floor((new Date() - new Date(migratedData.createdAt)) / (1000 * 60 * 60 * 24)) : 0,
            
            // Status de atividade
            isRecentlyActive: isRecentlyActive(migratedData.lastInteraction, migratedData.createdAt),
            
            // Completude dos dados
            dataCompleteness: calculateDataCompleteness(migratedData),
            
            // Flags úteis
            hasOpportunities: migratedData.hasOpportunities || false,
            hasMultipleContacts: !!(migratedData.primaryPhone && migratedData.secondaryPhone),
            isHighValue: isHighValueClient(migratedData.budgetRange, migratedData.interestType),
            
            // Próxima ação sugerida
            nextAction: suggestNextAction(migratedData)
          };
        });

        // Aplicar filtros client-side adicionais
        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          clientsData = clientsData.filter(client => 
            client.name?.toLowerCase().includes(term) ||
            client.primaryEmail?.toLowerCase().includes(term) ||
            client.primaryPhone?.includes(term.replace(/\s/g, '')) ||
            client.secondaryPhone?.includes(term.replace(/\s/g, '')) ||
            client.nif?.includes(term) ||
            client.cc?.includes(term) ||
            client.address?.city?.toLowerCase().includes(term) ||
            client.preferredLocation?.toLowerCase().includes(term)
          );
        }

        if (filters.interestType) {
          clientsData = clientsData.filter(client => client.interestType === filters.interestType);
        }

        if (filters.budgetRange) {
          clientsData = clientsData.filter(client => client.budgetRange === filters.budgetRange);
        }

        setClients(clientsData);
        lastFetchFilters.current = currentFiltersString;
        console.log(`✅ Carregados ${clientsData.length} clientes com estrutura unificada para utilizador ${user.uid}`);
      } else {
        throw new Error('Falha ao carregar clientes');
      }
      
    } catch (err) {
      console.error('❌ Erro ao buscar clientes:', err);
      setError(`Erro ao carregar clientes: ${err.message}`);
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [isUserReady, user, fbService, filters, clients.length, calculateDataCompleteness, isRecentlyActive, isHighValueClient, suggestNextAction, getBudgetRangeMiddleValue]);

  // 🔄 MIGRAÇÃO AUTOMÁTICA DE DADOS ANTIGOS
  const migrateClientData = useCallback((oldData) => {
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
      clientType: oldData.clientType || CLIENT_TYPES.COMPRADOR,
      
      // Migrar status
      status: oldData.status || UNIFIED_CLIENT_STATUS.PROSPETO,
      
      // Garantir campos obrigatórios
      name: oldData.name || 'Cliente sem nome',
      primaryEmail: oldData.email || oldData.primaryEmail || '',
      primaryPhone: oldData.phone || oldData.primaryPhone || '',
      
      // Estrutura expandida
      estimatedBudget: oldData.estimatedBudget || getBudgetRangeMiddleValue(oldData.budgetRange),
      dataCompleteness: oldData.dataCompleteness || calculateDataCompleteness(oldData),
      
      // Adicionar campos novos
      structureVersion: '3.1',
      isMultiTenant: true,
      migratedAt: new Date().toISOString(),
      
      // Referências cruzadas
      leadId: oldData.leadId || oldData.originalLeadId || null,
      clientId: oldData.id || null,
      opportunityIds: oldData.opportunityIds || []
    };

    return migrated;
  }, [getBudgetRangeMiddleValue, calculateDataCompleteness]);

  // 🔍 VERIFICAR DUPLICADOS - MOVIDA PARA ANTES DE createClient
  const checkForDuplicates = useCallback(async (phone, email) => {
    if (!isUserReady) return { hasDuplicates: false, duplicates: [] };
    
    setDuplicateCheck(true);
    
    try {
      const duplicates = [];
      
      if (phone) {
        const phoneResult = await fbService.readDocuments(CLIENTS_SUBCOLLECTION, {
          where: [{ field: 'primaryPhone', operator: '==', value: phone.trim() }],
          limitCount: 1
        });
        
        if (phoneResult.success && phoneResult.data.length > 0) {
          duplicates.push({
            ...phoneResult.data[0],
            duplicateField: 'phone'
          });
        }
      }
      
      if (email && duplicates.length === 0) {
        const emailResult = await fbService.readDocuments(CLIENTS_SUBCOLLECTION, {
          where: [{ field: 'primaryEmail', operator: '==', value: email.toLowerCase().trim() }],
          limitCount: 1
        });
        
        if (emailResult.success && emailResult.data.length > 0) {
          duplicates.push({
            ...emailResult.data[0],
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
  }, [isUserReady, fbService]);

  // ➕ CRIAR NOVO CLIENTE COM ESTRUTURA UNIFICADA (MULTI-TENANT)
  const createClient = useCallback(async (clientData) => {
    if (!isUserReady) {
      throw new Error('Utilizador não autenticado');
    }

    setCreating(true);
    setError(null);

    try {
      console.log('➕ Criando novo cliente multi-tenant...');

      // 1. VALIDAÇÕES BÁSICAS
      if (!clientData.name?.trim()) {
        throw new Error('Nome é obrigatório');
      }
      
      if (!clientData.primaryPhone?.trim() && !clientData.primaryEmail?.trim()) {
        throw new Error('Telefone ou email é obrigatório');
      }

      // Validações específicas
      if (clientData.primaryPhone && !validatePortuguesePhone(clientData.primaryPhone)) {
        throw new Error('Formato de telefone inválido');
      }

      if (clientData.primaryEmail && !validateEmail(clientData.primaryEmail)) {
        throw new Error('Formato de email inválido');
      }

      if (clientData.nif && !validateNIF(clientData.nif)) {
        throw new Error('Formato de NIF inválido');
      }

      // 2. VERIFICAR DUPLICADOS
      const duplicateCheck = await checkForDuplicates(clientData.primaryPhone, clientData.primaryEmail);
      if (duplicateCheck.hasDuplicates) {
        const duplicateInfo = duplicateCheck.duplicates[0];
        throw new Error(
          `Já existe um cliente com este ${
            duplicateInfo.duplicateField === 'phone' ? 'telefone' : 'email'
          }`
        );
      }

      // 3. PREPARAR DADOS COM ESTRUTURA UNIFICADA
      const estimatedBudget = getBudgetRangeMiddleValue(clientData.budgetRange);
      
      // 4. CRIAR OBJETO DO CLIENTE COM ESTRUTURA UNIFICADA
      const newClient = {
        // Aplicar estrutura core
        ...applyCoreStructure(clientData, CLIENT_TEMPLATE),
        
        // Dados básicos obrigatórios
        name: clientData.name.trim(),
        primaryEmail: clientData.primaryEmail?.toLowerCase().trim() || '',
        primaryPhone: clientData.primaryPhone?.trim() || '',
        
        // Dados secundários
        secondaryPhone: clientData.secondaryPhone?.trim() || '',
        alternativeEmail: clientData.alternativeEmail?.toLowerCase().trim() || '',
        
        // Identificação
        nif: clientData.nif?.trim() || '',
        cc: clientData.cc?.trim() || '',
        
        // Classificação
        clientType: clientData.clientType || CLIENT_TYPES.COMPRADOR,
        interestType: clientData.interestType || UNIFIED_INTEREST_TYPES.COMPRA_CASA,
        budgetRange: clientData.budgetRange || UNIFIED_BUDGET_RANGES.INDEFINIDO,
        status: UNIFIED_CLIENT_STATUS.PROSPETO,
        priority: clientData.priority || UNIFIED_PRIORITIES.NORMAL,
        source: clientData.source || 'manual',
        
        // Localização e preferências
        preferredLocation: clientData.preferredLocation?.trim() || '',
        preferredLocations: clientData.preferredLocation ? [clientData.preferredLocation] : [],
        preferredContactTime: clientData.preferredContactTime || UNIFIED_CONTACT_TIMES.QUALQUER_HORA,
        
        // Endereço estruturado
        address: {
          street: clientData.address?.street?.trim() || '',
          city: clientData.address?.city?.trim() || '',
          postalCode: clientData.address?.postalCode?.trim() || '',
          district: clientData.address?.district?.trim() || '',
          country: clientData.address?.country || 'Portugal'
        },
        
        // Dados pessoais
        dateOfBirth: clientData.dateOfBirth || null,
        nationality: clientData.nationality || 'Portuguesa',
        maritalStatus: clientData.maritalStatus || '',
        profession: clientData.profession?.trim() || '',
        
        // Dados calculados
        estimatedBudget: estimatedBudget,
        dataCompleteness: calculateDataCompleteness(clientData),
        
        // Dados de auditoria obrigatórios MULTI-TENANT
        userId: user.uid,
        userEmail: user.email,
        consultantId: user.uid,
        consultantName: userProfile?.displayName || user.displayName || 'Consultor',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Histórico e rastreamento
        interactions: {},
        lastInteraction: null,
        nextFollowUp: calculateNextFollowUp(clientData.priority),
        
        // Stats expandido
        stats: {
          totalInteractions: 0,
          lastContactDate: null,
          nextFollowUpDate: null
        },
        
        // Flags
        hasOpportunities: false,
        isHighValue: isHighValueClient(clientData.budgetRange, clientData.interestType),
        requiresFollowUp: true,
        isActive: true,
        
        // Referências cruzadas
        leadId: clientData.leadId || clientData.originalLeadId || null,
        clientId: null, // Auto-preenchido após criação
        opportunityId: null,
        opportunityIds: [],
        dealId: null,
        
        // Notas
        notes: clientData.notes?.trim() || '',
        internalNotes: clientData.internalNotes?.trim() || '',
        
        // Origem e conversão
        originalLeadId: clientData.originalLeadId || null,
        convertedFromLead: clientData.convertedFromLead || false,
        leadConvertedAt: clientData.leadConvertedAt || null,
        
        // Versão da estrutura
        structureVersion: '3.1',
        isMultiTenant: true,
        
        // Metadados técnicos
        sourceDetails: {
          platform: clientData.sourcePlatform || 'manual',
          campaign: clientData.sourceCampaign || null,
          referrer: clientData.sourceReferrer || null,
          created_via: 'web_form',
          form_version: '3.1',
          timestamp: new Date().toISOString()
        }
      };

      // 5. CRIAR USANDO FIREBASESERVICE
      const result = await fbService.createDocument(CLIENTS_SUBCOLLECTION, newClient);
      
      if (result) {
        // 6. CRIAR OBJETO COMPLETO PARA RETORNO
        const createdClient = {
          ...result,
          clientId: result.id, // Atualizar referência própria
          
          // Dados enriquecidos para UI
          clientTypeLabel: CLIENT_TYPE_LABELS[result.clientType],
          interestTypeLabel: getInterestTypeLabel(result.interestType),
          budgetRangeLabel: getBudgetRangeLabel(result.budgetRange),
          budgetDisplay: formatCurrency(result.estimatedBudget),
          statusColor: CLIENT_STATUS_COLORS[result.status],
          ageInDays: 0,
          isRecentlyActive: true,
          dataCompleteness: calculateDataCompleteness(result),
          nextAction: 'Primeiro contacto'
        };

        // 7. ATUALIZAR LISTA LOCAL
        setClients(prev => [createdClient, ...prev]);

        console.log('✅ Cliente criado com estrutura unificada:', result.id);
        
        return {
          success: true,
          client: createdClient,
          message: 'Cliente criado com sucesso!'
        };
      } else {
        throw new Error('Falha ao criar cliente');
      }
      
    } catch (err) {
      console.error('❌ Erro ao criar cliente:', err);
      setError(err.message);
      throw err;
    } finally {
      setCreating(false);
    }
  }, [isUserReady, user, userProfile, fbService, checkForDuplicates, applyCoreStructure, getBudgetRangeMiddleValue, calculateDataCompleteness, calculateNextFollowUp, isHighValueClient]);

  // ✏️ ATUALIZAR CLIENTE (MULTI-TENANT)
  const updateClient = useCallback(async (clientId, updates) => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    try {
      console.log('✏️ Atualizando cliente:', clientId);

      // Preparar dados para atualização
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid,
        structureVersion: '3.1'
      };

      // Normalizar campos se fornecidos
      if (updates.primaryEmail) {
        updateData.primaryEmail = updates.primaryEmail.toLowerCase().trim();
      }

      if (updates.alternativeEmail) {
        updateData.alternativeEmail = updates.alternativeEmail.toLowerCase().trim();
      }

      // Recalcular dados derivados se necessário
      if (updates.budgetRange) {
        updateData.estimatedBudget = getBudgetRangeMiddleValue(updates.budgetRange);
      }

      // Recalcular completude se dados pessoais mudaram
      const currentClient = clients.find(client => client.id === clientId);
      if (currentClient) {
        const updatedClientData = { ...currentClient, ...updateData };
        updateData.dataCompleteness = calculateDataCompleteness(updatedClientData);
      }

      const result = await fbService.updateDocument(CLIENTS_SUBCOLLECTION, clientId, updateData);
      
      if (result) {
        // Atualizar lista local
        setClients(prev => prev.map(client => 
          client.id === clientId 
            ? { 
                ...client, 
                ...updateData, 
                id: clientId,
                budgetRangeLabel: updates.budgetRange ? getBudgetRangeLabel(updates.budgetRange) : client.budgetRangeLabel,
                interestTypeLabel: updates.interestType ? getInterestTypeLabel(updates.interestType) : client.interestTypeLabel,
                clientTypeLabel: updates.clientType ? CLIENT_TYPE_LABELS[updates.clientType] : client.clientTypeLabel,
                statusColor: updates.status ? CLIENT_STATUS_COLORS[updates.status] : client.statusColor
              }
            : client
        ));

        console.log('✅ Cliente atualizado com sucesso');
        return { success: true, message: 'Cliente atualizado com sucesso!' };
      } else {
        throw new Error('Falha ao atualizar cliente');
      }
      
    } catch (err) {
      console.error('❌ Erro ao atualizar cliente:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [isUserReady, user, fbService, clients, getBudgetRangeMiddleValue, calculateDataCompleteness]);

  // 🗑️ ELIMINAR CLIENTE (SOFT DELETE MULTI-TENANT)
  const deleteClient = useCallback(async (clientId, hardDelete = false) => {
    if (!isUserReady) return { success: false, error: 'Utilizador não autenticado' };
    
    try {
      console.log('🗑️ Eliminando cliente:', clientId);

      if (hardDelete) {
        // Eliminação definitiva
        const result = await fbService.deleteDocument(CLIENTS_SUBCOLLECTION, clientId);
        
        if (result) {
          // Remover da lista local
          setClients(prev => prev.filter(client => client.id !== clientId));
          console.log(`Cliente ${clientId} eliminado permanentemente`);
        }
      } else {
        // Soft delete (recomendado)
        const result = await fbService.updateDocument(CLIENTS_SUBCOLLECTION, clientId, {
          isActive: false,
          status: UNIFIED_CLIENT_STATUS.INATIVO,
          deletedAt: serverTimestamp(),
          deletedBy: user.uid,
          updatedAt: serverTimestamp()
        });
        
        if (result) {
          // Remover da lista local (filtro por isActive)
          setClients(prev => prev.filter(client => client.id !== clientId));
          console.log(`Cliente ${clientId} marcado como inativo`);
        }
      }
        
      console.log(`Cliente ${clientId} ${hardDelete ? 
        'eliminado permanentemente' : 'marcado como inativo'}`);
        
      return { 
        success: true, 
        message: hardDelete ? 'Cliente eliminado permanentemente!' : 'Cliente removido da lista!' 
      };

    } catch (err) {
      console.error('❌ Erro ao eliminar cliente:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, user, fbService]);



  // 🔍 PESQUISAR CLIENTES - OTIMIZADO
  const searchClients = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
    
    // Debounce para evitar múltiplas queries
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    fetchTimeoutRef.current = setTimeout(() => {
      fetchClients(true); // Force refresh com novos filtros
    }, 500);
  }, [fetchClients]);

  // 📊 OBTER ESTATÍSTICAS DOS CLIENTES
  const getClientStats = useCallback(() => {
    const stats = {
      total: clients.length,
      byStatus: {},
      byClientType: {},
      byInterestType: {},
      byBudgetRange: {},
      byPriority: {},
      averageDataCompleteness: 0,
      highValueClients: 0,
      recentlyActive: 0
    };

    if (clients.length === 0) return stats;

    // Estatísticas por status
    Object.values(UNIFIED_CLIENT_STATUS).forEach(status => {
      stats.byStatus[status] = clients.filter(client => client.status === status).length;
    });

    // Estatísticas por tipo de cliente
    Object.values(CLIENT_TYPES).forEach(type => {
      stats.byClientType[type] = clients.filter(client => client.clientType === type).length;
    });

    // Cálculos adicionais
    const totalCompleteness = clients.reduce((sum, client) => sum + (client.dataCompleteness || 0), 0);
    stats.averageDataCompleteness = Math.round(totalCompleteness / clients.length);
    
    stats.highValueClients = clients.filter(client => client.isHighValue).length;
    stats.recentlyActive = clients.filter(client => client.isRecentlyActive).length;

    return stats;
  }, [clients]);

  // 🎯 EFFECT PRINCIPAL - CARREGAR DADOS COM DEBOUNCE OTIMIZADO
  useEffect(() => {
    if (isUserReady) {
      // Apenas carrega na primeira vez ou quando user muda
      if (clients.length === 0 && !mountedRef.current) {
        mountedRef.current = true;
        fetchClients(true);
      }
    } else {
      setClients([]);
      setLoading(false);
    }
  }, [isUserReady]); // Removido fetchClients das dependências para evitar loop

  // 🎯 EFFECT PARA FILTROS - SEPARADO E OTIMIZADO
  useEffect(() => {
    if (isUserReady && clients.length > 0) {
      // Trigger fetch apenas se filtros mudaram de facto
      const currentFiltersString = JSON.stringify(filters);
      if (lastFetchFilters.current !== currentFiltersString) {
        console.log('🔍 Filtros de clientes alterados, refrescando dados...');
        
        // Debounce para evitar múltiplas queries
        if (fetchTimeoutRef.current) {
          clearTimeout(fetchTimeoutRef.current);
        }
        
        fetchTimeoutRef.current = setTimeout(() => {
          fetchClients(true);
        }, 300);
      }
    }
  }, [filters, isUserReady, clients.length]);

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

  // 📤 RETORNO DO HOOK MULTI-TENANT COMPLETO
  return {
    // Estados principais
    clients,
    loading,
    error,
    creating,
    converting,
    duplicateCheck,
    filters,

    // Ações principais
    createClient,
    updateClient,
    deleteClient,
    
    // Busca e filtros
    fetchClients,
    searchClients,
    setFilters,
    checkForDuplicates,
    
    // Estatísticas
    getClientStats,
    
    // Constantes unificadas
    CLIENT_TYPES,
    CLIENT_TYPE_LABELS,
    CLIENT_STATUS_COLORS,
    UNIFIED_CLIENT_STATUS,
    UNIFIED_INTEREST_TYPES,
    UNIFIED_BUDGET_RANGES,
    UNIFIED_PRIORITIES,
    UNIFIED_CONTACT_TIMES,
    
    // Helpers
    getInterestTypeLabel,
    getBudgetRangeLabel,
    formatCurrency,
    calculateDataCompleteness,
    isHighValueClient,
    
    // Estado de conectividade
    isConnected: !loading && !error,
    isUserReady,
    
    // Informações da versão
    version: '3.1',
    isMultiTenant: true,
    structureVersion: '3.1-multi-tenant'
  };
};

export default useClients;