// src/hooks/useClients.js
// 🎯 HOOK UNIFICADO PARA GESTÃO DE CLIENTES - MyImoMate 3.0 MULTI-TENANT COMPLETO
// ===============================================================================
// VERSÃO HÍBRIDA: Multi-tenant + Todas as funcionalidades avançadas
// Inclui: Conversão cliente→oportunidade, sincronização, migração, GDPR, auditoria
// Data: Agosto 2025 | Versão: 3.1 Multi-Tenant Complete

import { useState, useEffect, useCallback } from 'react';
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
  limit,
  serverTimestamp,
  writeBatch,
  arrayUnion
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
const LEADS_SUBCOLLECTION = SUBCOLLECTIONS.LEADS;
const FETCH_LIMIT = 100;

// 🎯 TIPOS DE CLIENTE ESPECÍFICOS (mantendo compatibilidade)
export const CLIENT_TYPES = {
  COMPRADOR: 'comprador',
  VENDEDOR: 'vendedor',
  INQUILINO: 'inquilino',
  SENHORIO: 'senhorio',
  INVESTIDOR: 'investidor',
  AMBOS: 'ambos' // Comprador e vendedor
};

export const CLIENT_TYPE_LABELS = {
  [CLIENT_TYPES.COMPRADOR]: 'Comprador',
  [CLIENT_TYPES.VENDEDOR]: 'Vendedor',
  [CLIENT_TYPES.INQUILINO]: 'Inquilino',
  [CLIENT_TYPES.SENHORIO]: 'Senhorio',
  [CLIENT_TYPES.INVESTIDOR]: 'Investidor',
  [CLIENT_TYPES.AMBOS]: 'Comprador & Vendedor'
};

// 🎨 CORES PARA STATUS (usando constantes unificadas)
export const CLIENT_STATUS_COLORS = {
  [UNIFIED_CLIENT_STATUS.ATIVO]: 'bg-green-100 text-green-800 border-green-200',
  [UNIFIED_CLIENT_STATUS.INATIVO]: 'bg-gray-100 text-gray-800 border-gray-200',
  [UNIFIED_CLIENT_STATUS.PROSPETO]: 'bg-blue-100 text-blue-800 border-blue-200',
  [UNIFIED_CLIENT_STATUS.EX_CLIENTE]: 'bg-red-100 text-red-800 border-red-200',
  [UNIFIED_CLIENT_STATUS.SUSPENSO]: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

// 💬 TIPOS DE INTERAÇÃO/CONTACTO
export const CONTACT_TYPES = {
  CHAMADA: 'chamada',
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
  REUNIAO: 'reuniao',
  VISITA: 'visita',
  SMS: 'sms',
  VIDEOCHAMADA: 'videochamada',
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  OUTRO: 'outro'
};

export const CONTACT_TYPE_LABELS = {
  [CONTACT_TYPES.CHAMADA]: 'Chamada Telefónica',
  [CONTACT_TYPES.EMAIL]: 'E-mail',
  [CONTACT_TYPES.WHATSAPP]: 'WhatsApp',
  [CONTACT_TYPES.REUNIAO]: 'Reunião Presencial',
  [CONTACT_TYPES.VISITA]: 'Visita ao Imóvel',
  [CONTACT_TYPES.SMS]: 'SMS',
  [CONTACT_TYPES.VIDEOCHAMADA]: 'Videochamada',
  [CONTACT_TYPES.FACEBOOK]: 'Facebook Messenger',
  [CONTACT_TYPES.INSTAGRAM]: 'Instagram Direct',
  [CONTACT_TYPES.OUTRO]: 'Outro'
};

// 🎯 HOOK PRINCIPAL MULTI-TENANT COMPLETO
const useClients = () => {
  // 🔐 AUTENTICAÇÃO E INICIALIZAÇÃO MULTI-TENANT
  const { currentUser: user, userProfile, isAuthenticated, loading: authLoading } = useAuth();
  const fbService = useFirebaseService(user);
  
  // Estados principais
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [converting, setConverting] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState(false);

  // Filtros expandidos
  const [filters, setFilters] = useState({
    status: '',
    clientType: '',
    interestType: '',
    budgetRange: '',
    priority: '',
    city: '',
    searchTerm: ''
  });

  // Verificação de autenticação melhorada
  const activeUser = user;
  const isUserReady = !authLoading && !!activeUser && activeUser.uid;

  // 🎯 HELPERS CRUD MULTI-TENANT
  const crudHelpers = createCRUDHelpers(CLIENTS_SUBCOLLECTION);

  // 📊 CARREGAR CLIENTES COM ESTRUTURA UNIFICADA (MULTI-TENANT)
  const fetchClients = useCallback(async () => {
    if (!isUserReady) {
      console.log('useClients: Aguardando utilizador...');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`📊 Carregando clientes para utilizador: ${activeUser.uid}`);
      
      // Construir condições de filtro
      const whereConditions = [];
      
      if (filters.status && Object.values(UNIFIED_CLIENT_STATUS).includes(filters.status)) {
        whereConditions.push({ field: 'status', operator: '==', value: filters.status });
      }
      
      if (filters.clientType && Object.values(CLIENT_TYPES).includes(filters.clientType)) {
        whereConditions.push({ field: 'clientType', operator: '==', value: filters.clientType });
      }

      if (filters.interestType && Object.values(UNIFIED_INTEREST_TYPES).includes(filters.interestType)) {
        whereConditions.push({ field: 'interestType', operator: '==', value: filters.interestType });
      }

      if (filters.budgetRange && Object.values(UNIFIED_BUDGET_RANGES).includes(filters.budgetRange)) {
        whereConditions.push({ field: 'budgetRange', operator: '==', value: filters.budgetRange });
      }

      if (filters.priority && Object.values(UNIFIED_PRIORITIES).includes(filters.priority)) {
        whereConditions.push({ field: 'priority', operator: '==', value: filters.priority });
      }

      if (filters.city) {
        whereConditions.push({ field: 'address.city', operator: '==', value: filters.city });
      }

      const result = await crudHelpers.read({
        orderBy: 'createdAt',
        orderDirection: 'desc',
        limitCount: FETCH_LIMIT,
        where: whereConditions,
        includeInactive: false
      });

      if (result.success) {
        let clientsData = result.data.map(client => {
          // Aplicar migração automática se necessário
          let migratedData;
          try {
            migratedData = migrateClientData(client);
          } catch (error) {
            console.warn('⚠️ Migração falhou:', error);
            migratedData = client;
          }
          
          return {
            ...migratedData,
            // Enriquecer com dados calculados
            clientTypeLabel: CLIENT_TYPE_LABELS[migratedData.clientType] || migratedData.clientType,
            interestTypeLabel: getInterestTypeLabel(migratedData.interestType),
            budgetRangeLabel: getBudgetRangeLabel(migratedData.budgetRange),
            budgetDisplay: formatCurrency(migratedData.estimatedBudget),
            statusColor: CLIENT_STATUS_COLORS[migratedData.status] || CLIENT_STATUS_COLORS[UNIFIED_CLIENT_STATUS.ATIVO],
            
            // Calcular idade do cliente
            ageInDays: migratedData.createdAt ? Math.floor((new Date() - new Date(migratedData.createdAt)) / (1000 * 60 * 60 * 24)) : 0,
            
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

        // Aplicar filtro de pesquisa se existir
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

        setClients(clientsData);
        console.log(`✅ Carregados ${clientsData.length} clientes com estrutura unificada para utilizador ${activeUser.uid}`);
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
  }, [isUserReady, activeUser, filters, crudHelpers]);

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
      
      // Migrar status de cliente
      status: migrateClientStatus(oldData.status),
      
      // Migrar tipos de interesse
      interestType: migrateInterestType(oldData.primaryInterest || oldData.interestType),
      primaryInterest: migrateInterestType(oldData.primaryInterest || oldData.interestType),
      
      // Migrar faixas de orçamento
      budgetRange: migrateBudgetRange(oldData.budgetRange),
      
      // Garantir campos obrigatórios
      phoneNormalized: oldData.phoneNormalized || oldData.phone?.replace(/\s|-/g, '') || '',
      primaryPhone: oldData.primaryPhone || oldData.phone || '',
      primaryEmail: oldData.primaryEmail || oldData.email || '',
      
      // Dados calculados
      estimatedBudget: getBudgetRangeMiddleValue(oldData.budgetRange),
      
      // Adicionar campos novos
      structureVersion: '3.1',
      migratedAt: new Date().toISOString(),
      
      // Migrar preferências de contacto
      preferredContactTime: oldData.preferredContactTime || UNIFIED_CONTACT_TIMES.QUALQUER_HORA,
      
      // Garantir referências cruzadas
      leadId: oldData.originalLeadId || oldData.leadId || null,
      clientId: oldData.id || null,
      opportunityId: oldData.opportunityId || null,
      dealId: oldData.dealId || null,
      
      // Estrutura de marketing consent (GDPR)
      marketingConsent: oldData.marketingConsent || {
        email: false,
        sms: false,
        phone: false,
        whatsapp: false,
        consentDate: new Date().toISOString(),
        gdprCompliant: true
      },
      
      // Dados profissionais
      profession: oldData.profession || '',
      employer: oldData.employer || '',
      monthlyIncome: oldData.monthlyIncome || null,
      
      // Sistema de interações expandido
      interactions: oldData.interactions || {},
      stats: oldData.stats || {
        totalInteractions: 0,
        lastContactDate: null,
        nextFollowUpDate: null
      }
    };

    return migrated;
  }, []);

  // 🔄 FUNÇÕES DE MIGRAÇÃO ESPECÍFICAS
  const migrateClientStatus = (oldStatus) => {
    const statusMap = {
      'ativo': UNIFIED_CLIENT_STATUS.ATIVO,
      'inativo': UNIFIED_CLIENT_STATUS.INATIVO,
      'prospeto': UNIFIED_CLIENT_STATUS.PROSPETO,
      'ex_cliente': UNIFIED_CLIENT_STATUS.EX_CLIENTE,
      'active': UNIFIED_CLIENT_STATUS.ATIVO,
      'inactive': UNIFIED_CLIENT_STATUS.INATIVO
    };
    return statusMap[oldStatus] || UNIFIED_CLIENT_STATUS.ATIVO;
  };

  const migrateInterestType = (oldType) => {
    const typeMap = {
      'apartamento': UNIFIED_INTEREST_TYPES.COMPRA_APARTAMENTO,
      'moradia': UNIFIED_INTEREST_TYPES.COMPRA_CASA,
      'comercial': UNIFIED_INTEREST_TYPES.COMPRA_COMERCIAL,
      'terreno': UNIFIED_INTEREST_TYPES.COMPRA_TERRENO,
      'compra_casa': UNIFIED_INTEREST_TYPES.COMPRA_CASA,
      'compra_apartamento': UNIFIED_INTEREST_TYPES.COMPRA_APARTAMENTO,
      'venda_casa': UNIFIED_INTEREST_TYPES.VENDA_CASA,
      'venda_apartamento': UNIFIED_INTEREST_TYPES.VENDA_APARTAMENTO
    };
    return typeMap[oldType] || UNIFIED_INTEREST_TYPES.COMPRA_CASA;
  };

  const migrateBudgetRange = (oldRange) => {
    const rangeMap = {
      'ate_100k': UNIFIED_BUDGET_RANGES.ATE_100K,
      '100k_250k': UNIFIED_BUDGET_RANGES.DE_100K_200K,
      '250k_500k': UNIFIED_BUDGET_RANGES.DE_300K_500K,
      '500k_1m': UNIFIED_BUDGET_RANGES.DE_500K_750K,
      'acima_1m': UNIFIED_BUDGET_RANGES.ACIMA_1M
    };
    return rangeMap[oldRange] || UNIFIED_BUDGET_RANGES.INDEFINIDO;
  };

  // 🔍 VERIFICAR DUPLICADOS COMPLETO (MULTI-TENANT)
  const checkForDuplicates = useCallback(async (phone, email, nif = null) => {
    setDuplicateCheck(true);
    
    try {
      const duplicates = [];
      
      // Verificar por telefone normalizado
      if (phone) {
        const normalizedPhone = phone.replace(/\s|-/g, '');
        const phoneResult = await crudHelpers.read({
          where: [{ field: 'phoneNormalized', operator: '==', value: normalizedPhone }],
          limitCount: 5
        });
        
        if (phoneResult.success) {
          phoneResult.data.forEach(client => {
            duplicates.push({ 
              ...client, 
              duplicateField: 'phone' 
            });
          });
        }
      }

      // Verificar por email
      if (email) {
        const emailResult = await crudHelpers.read({
          where: [{ field: 'primaryEmail', operator: '==', value: email.toLowerCase() }],
          limitCount: 5
        });
        
        if (emailResult.success) {
          emailResult.data.forEach(client => {
            if (!duplicates.find(d => d.id === client.id)) {
              duplicates.push({ 
                ...client, 
                duplicateField: 'email' 
              });
            }
          });
        }
      }

      // Verificar por NIF se fornecido
      if (nif) {
        const nifResult = await crudHelpers.read({
          where: [{ field: 'nif', operator: '==', value: nif }],
          limitCount: 5
        });
        
        if (nifResult.success) {
          nifResult.data.forEach(client => {
            if (!duplicates.find(d => d.id === client.id)) {
              duplicates.push({ 
                ...client, 
                duplicateField: 'nif' 
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

  // ➕ CRIAR NOVO CLIENTE COM ESTRUTURA UNIFICADA COMPLETA (MULTI-TENANT)
  const createClient = useCallback(async (clientData) => {
    if (!isUserReady) {
      throw new Error('Utilizador não autenticado');
    }

    setCreating(true);
    setError(null);

    try {
      console.log('➕ Criando novo cliente:', clientData);

      // 1. VALIDAÇÃO BÁSICA
      if (!clientData.name?.trim()) {
        throw new Error('Nome é obrigatório');
      }
      
      if (!clientData.phone?.trim() && !clientData.email?.trim()) {
        throw new Error('Telefone ou email é obrigatório');
      }

      // Validações específicas
      if (clientData.phone && !validatePortuguesePhone(clientData.phone)) {
        throw new Error('Formato de telefone inválido');
      }

      if (clientData.email && !validateEmail(clientData.email)) {
        throw new Error('Formato de email inválido');
      }

      if (clientData.nif && !validateNIF(clientData.nif)) {
        throw new Error('NIF deve ter 9 dígitos');
      }

      // 2. VERIFICAR DUPLICADOS
      const duplicateCheck = await checkForDuplicates(
        clientData.phone, 
        clientData.email, 
        clientData.nif
      );
      
      if (duplicateCheck.hasDuplicates) {
        const duplicateInfo = duplicateCheck.duplicates[0];
        const field = duplicateInfo.duplicateField === 'phone' ? 'telefone' : 
                     duplicateInfo.duplicateField === 'email' ? 'email' : 'NIF';
        throw new Error(`Já existe um cliente com este ${field}`);
      }

      // 3. PREPARAR DADOS NORMALIZADOS
      const normalizedPhone = clientData.phone?.replace(/\s|-/g, '') || '';
      const normalizedEmail = clientData.email?.toLowerCase().trim() || '';
      
      // 4. CRIAR OBJETO DO CLIENTE COM ESTRUTURA UNIFICADA COMPLETA
      const newClient = {
        // Aplicar estrutura core
        ...applyCoreStructure(clientData, CLIENT_TEMPLATE),
        
        // Dados básicos obrigatórios
        name: clientData.name.trim(),
        primaryPhone: clientData.phone?.trim() || '',
        secondaryPhone: clientData.secondaryPhone?.trim() || '',
        phoneNormalized: normalizedPhone,
        primaryEmail: normalizedEmail,
        secondaryEmail: clientData.secondaryEmail?.toLowerCase().trim() || '',
        
        // Dados específicos do cliente
        clientType: clientData.clientType || CLIENT_TYPES.COMPRADOR,
        
        // Dados pessoais expandidos (PERSONAL_DATA_STRUCTURE)
        nameFirst: clientData.nameFirst?.trim() || '',
        nameLast: clientData.nameLast?.trim() || '',
        nif: clientData.nif?.trim() || '',
        cc: clientData.cc?.trim() || '',
        dateOfBirth: clientData.dateOfBirth || null,
        nationality: clientData.nationality || 'Portuguesa',
        maritalStatus: clientData.maritalStatus || '',
        
        // Morada completa
        address: {
          street: clientData.address?.street?.trim() || '',
          number: clientData.address?.number?.trim() || '',
          floor: clientData.address?.floor?.trim() || '',
          postalCode: clientData.address?.postalCode?.trim() || '',
          city: clientData.address?.city?.trim() || '',
          district: clientData.address?.district?.trim() || '',
          country: clientData.address?.country || 'Portugal'
        },
        
        // Dados de interesse com estrutura unificada
        interestType: clientData.interestType || UNIFIED_INTEREST_TYPES.COMPRA_CASA,
        primaryInterest: clientData.primaryInterest || clientData.interestType || UNIFIED_INTEREST_TYPES.COMPRA_CASA,
        budgetRange: clientData.budgetRange || UNIFIED_BUDGET_RANGES.INDEFINIDO,
        
        // Dados calculados
        estimatedBudget: getBudgetRangeMiddleValue(clientData.budgetRange || UNIFIED_BUDGET_RANGES.INDEFINIDO),
        clientScore: calculateInitialClientScore(clientData),
        
        // Preferências de contacto
        preferredContactTime: clientData.preferredContactTime || UNIFIED_CONTACT_TIMES.QUALQUER_HORA,
        preferredContactMethod: clientData.preferredContactMethod || 'telefone',
        preferredLocation: clientData.preferredLocation?.trim() || '',
        preferredLocations: clientData.preferredLocations || [],
        
        // Dados profissionais
        profession: clientData.profession?.trim() || '',
        employer: clientData.employer?.trim() || '',
        monthlyIncome: clientData.monthlyIncome || null,
        
        // Dados de marketing (GDPR)
        marketingConsent: {
          email: clientData.marketingConsent?.email || false,
          sms: clientData.marketingConsent?.sms || false,
          phone: clientData.marketingConsent?.phone || false,
          whatsapp: clientData.marketingConsent?.whatsapp || false,
          consentDate: new Date().toISOString(),
          gdprCompliant: true
        },
        
        // Status e metadados
        status: UNIFIED_CLIENT_STATUS.ATIVO,
        priority: clientData.priority || UNIFIED_PRIORITIES.NORMAL,
        source: clientData.source || 'manual',
        
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

      // 5. INSERIR NO FIREBASE (usando subcoleção do utilizador)
      const result = await crudHelpers.create(newClient);
      
      if (result.success) {
        // 6. CRIAR OBJETO COMPLETO PARA RETORNO
        const createdClient = {
          ...result.data,
          clientId: result.id, // Atualizar referência própria
          
          // Dados enriquecidos para UI
          clientTypeLabel: CLIENT_TYPE_LABELS[result.data.clientType],
          interestTypeLabel: getInterestTypeLabel(result.data.interestType),
          budgetRangeLabel: getBudgetRangeLabel(result.data.budgetRange),
          budgetDisplay: formatCurrency(result.data.estimatedBudget),
          statusColor: CLIENT_STATUS_COLORS[result.data.status],
          ageInDays: 0,
          isRecentlyActive: true,
          dataCompleteness: calculateDataCompleteness(result.data),
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
      }

    } catch (err) {
      console.error('❌ Erro ao criar cliente:', err);
      setError(err.message);
      
      return {
        success: false,
        error: err.message,
        message: `Erro ao criar cliente: ${err.message}`
      };
    } finally {
      setCreating(false);
    }
  }, [isUserReady, checkForDuplicates, crudHelpers]);

  // ✏️ ATUALIZAR CLIENTE (MULTI-TENANT)
  const updateClient = useCallback(async (clientId, clientData) => {
    if (!isUserReady) return;

    setUpdating(true);
    setError(null);

    try {
      console.log(`✏️ Atualizando cliente ${clientId}:`, clientData);

      // 1. VALIDAR ATUALIZAÇÕES (se campos críticos mudaram)
      if (clientData.primaryEmail || clientData.primaryPhone || clientData.nif) {
        const validation = validateClient({ ...clientData });
        if (!validation.isValid && validation.errors.some(e => e.includes('obrigatório'))) {
          throw new Error(`Dados inválidos: ${validation.errors.join(', ')}`);
        }
      }

      // 2. PREPARAR DADOS DE ATUALIZAÇÃO
      const updateData = {
        ...clientData,
        
        // Normalizar dados se necessário
        ...(clientData.primaryPhone && { 
          phoneNormalized: clientData.primaryPhone.replace(/\s|-/g, '')
        }),
        ...(clientData.primaryEmail && { 
          primaryEmail: clientData.primaryEmail.toLowerCase().trim()
        }),
        ...(clientData.secondaryEmail && { 
          secondaryEmail: clientData.secondaryEmail.toLowerCase().trim()
        }),
        
        // Recalcular campos dependentes
        ...(clientData.budgetRange && { 
          estimatedBudget: getBudgetRangeMiddleValue(clientData.budgetRange),
          isHighValue: isHighValueClient(clientData.budgetRange, clientData.interestType)
        }),
        
        // Atualizar última atividade
        lastActivity: new Date(),
        
        // Recalcular client score se dados relevantes mudaram
        ...(clientData.interestType || clientData.budgetRange || clientData.priority) && {
          clientScore: calculateClientScore({
            interestType: clientData.interestType,
            budgetRange: clientData.budgetRange,
            priority: clientData.priority
          })
        }
      };

      const result = await crudHelpers.update(clientId, updateData);

      if (result.success) {
        // Atualizar lista local
        setClients(prev => prev.map(client => {
          if (client.id === clientId) {
            const updatedClient = {
              ...client,
              ...updateData,
              updatedAt: new Date(),
              // Recalcular dados enriquecidos
              clientTypeLabel: CLIENT_TYPE_LABELS[updateData.clientType || client.clientType],
              interestTypeLabel: getInterestTypeLabel(updateData.interestType || client.interestType),
              budgetRangeLabel: getBudgetRangeLabel(updateData.budgetRange || client.budgetRange),
              budgetDisplay: formatCurrency(updateData.estimatedBudget || client.estimatedBudget),
              statusColor: CLIENT_STATUS_COLORS[updateData.status || client.status],
              dataCompleteness: calculateDataCompleteness({...client, ...updateData})
            };
            return updatedClient;
          }
          return client;
        }));

        console.log('✅ Cliente atualizado com sucesso:', clientId);

        return {
          success: true,
          message: 'Cliente atualizado com sucesso!'
        };
      }

    } catch (err) {
      console.error('❌ Erro ao atualizar cliente:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, [isUserReady, crudHelpers]);

  // 🔄 ATUALIZAR STATUS DO CLIENTE COM AUDITORIA
  const updateClientStatus = useCallback(async (clientId, newStatus, notes = '') => {
    if (!isUserReady) return;

    try {
      // Validar se o status é válido
      if (!Object.values(UNIFIED_CLIENT_STATUS).includes(newStatus)) {
        throw new Error(`Status inválido: ${newStatus}`);
      }

      const updateData = {
        status: newStatus,
        lastStatusChange: new Date()
      };

      // Adicionar auditoria de mudança de status
      if (notes.trim()) {
        updateData.statusChangeNote = notes.trim();
        updateData[`statusHistory.change_${Date.now()}`] = {
          from: '', // Poderia ser obtido do cliente atual
          to: newStatus,
          changedBy: activeUser.uid,
          changedAt: new Date().toISOString(),
          notes: notes.trim(),
          userAgent: navigator.userAgent
        };
      }

      const result = await crudHelpers.update(clientId, updateData);

      if (result.success) {
        // Atualizar lista local
        setClients(prev => 
          prev.map(client => 
            client.id === clientId 
              ? { 
                  ...client, 
                  status: newStatus, 
                  statusColor: CLIENT_STATUS_COLORS[newStatus],
                  updatedAt: new Date() 
                }
              : client
          )
        );

        console.log(`✅ Status do cliente ${clientId} atualizado para: ${newStatus}`);
        
        return { 
          success: true, 
          message: `Status atualizado para ${getStatusLabel(newStatus)}!` 
        };
      }

    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, activeUser, crudHelpers]);

  // 🔄 CONVERTER CLIENTE PARA OPORTUNIDADE COMPLETO (MULTI-TENANT)
  const convertClientToOpportunity = useCallback(async (clientId, opportunityData = {}) => {
    if (!isUserReady || !activeUser?.uid || !clientId) {
      setError('Dados inválidos para conversão');
      return { success: false, message: 'Dados inválidos' };
    }

    setConverting(true);
    setError(null);

    try {
      console.log(`🔄 Convertendo cliente ${clientId} para oportunidade`);

      // 1. BUSCAR DADOS DO CLIENTE
      const clientResult = await crudHelpers.readOne(clientId);
      
      if (!clientResult.success) {
        throw new Error('Cliente não encontrado');
      }

      const clientData = clientResult.data;

      // 2. VALIDAR DADOS MÍNIMOS PARA OPORTUNIDADE
      if (!opportunityData.interestType) {
        throw new Error('Tipo de interesse é obrigatório para criar oportunidade');
      }

      if (!opportunityData.budgetRange) {
        throw new Error('Faixa de orçamento é obrigatória para criar oportunidade');
      }

      // Usar transação para garantir consistência
      const result = await fbService.runTransaction(async (transaction, service) => {
        // 3. PREPARAR DADOS DA OPORTUNIDADE
        const baseOpportunityData = {
          // Dados do cliente
          clientId: clientId,
          clientName: clientData.name,
          clientPhone: clientData.primaryPhone || clientData.phone,
          clientEmail: clientData.primaryEmail || clientData.email,
          
          // Dados da oportunidade
          title: opportunityData.title || `Oportunidade ${opportunityData.interestType} - ${clientData.name}`,
          description: opportunityData.description || `Oportunidade criada para cliente ${clientData.name}`,
          
          // Classificação da oportunidade
          interestType: opportunityData.interestType,
          budgetRange: opportunityData.budgetRange,
          priority: opportunityData.priority || clientData.priority || 'normal',
          status: opportunityData.status || 'identificacao', // 10% inicial
          
          // Dados financeiros
          estimatedValue: opportunityData.estimatedValue || getBudgetRangeMiddleValue(opportunityData.budgetRange),
          probability: opportunityData.probability || 10, // 10% inicial
          commissionPercentage: opportunityData.commissionPercentage || 2.5,
          
          // Datas
          expectedCloseDate: opportunityData.expectedCloseDate || new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 dias
          
          // Localização e preferências
          location: opportunityData.location || clientData.address?.city || '',
          propertyType: opportunityData.propertyType || '',
          
          // Notas e observações
          notes: opportunityData.notes || `Oportunidade criada a partir do cliente ${clientData.name}`,
          
          // Rastreamento
          source: `converted_from_client_${clientId}`,
          originalClientId: clientId,
          convertedAt: new Date(),
          
          // Metadados
          metadata: {
            convertedFromClient: true,
            conversionDate: new Date().toISOString(),
            userAgent: navigator.userAgent
          }
        };

        // 4. CRIAR OPORTUNIDADE NA SUBCOLEÇÃO
        const opportunityResult = await service.createDocument(OPPORTUNITIES_SUBCOLLECTION, baseOpportunityData);

        // 5. ATUALIZAR CLIENTE COM REFERÊNCIA À OPORTUNIDADE
        await service.updateDocument(CLIENTS_SUBCOLLECTION, clientId, {
          hasOpportunities: true,
          lastOpportunityId: opportunityResult.id,
          lastOpportunityCreated: new Date(),
          // Array de oportunidades (garantir que existe)
          opportunityIds: [...(clientData.opportunityIds || []), opportunityResult.id]
        });

        return {
          opportunityId: opportunityResult.id,
          opportunity: opportunityResult.data
        };
      });

      // 6. ATUALIZAR LISTA LOCAL DE CLIENTES
      setClients(prev => 
        prev.map(client => 
          client.id === clientId 
            ? { 
                ...client, 
                hasOpportunities: true,
                lastOpportunityId: result.result.opportunityId,
                lastOpportunityCreated: new Date(),
                updatedAt: new Date()
              }
            : client
        )
      );

      setConverting(false);
      
      console.log(`✅ Cliente ${clientId} convertido para oportunidade ${result.result.opportunityId}`);
      
      return {
        success: true,
        clientId: clientId,
        opportunityId: result.result.opportunityId,
        opportunity: result.result.opportunity,
        message: `Cliente convertido para oportunidade com sucesso!`
      };

    } catch (err) {
      console.error('❌ Erro ao converter cliente para oportunidade:', err);
      setError(err.message || 'Erro ao converter cliente');
      setConverting(false);
      
      return {
        success: false,
        message: err.message || 'Erro ao converter cliente para oportunidade'
      };
    }
  }, [isUserReady, activeUser?.uid, crudHelpers, fbService]);

  // 🗑️ ELIMINAR CLIENTE (SOFT DELETE)
  const deleteClient = useCallback(async (clientId, hardDelete = false) => {
    if (!isUserReady) return;

    try {
      console.log(`🗑️ Eliminando cliente ${clientId} (hard: ${hardDelete})`);

      const result = await crudHelpers.delete(clientId, hardDelete);
      
      if (result.success) {
        // Remover da lista local ou marcar como inativo
        if (hardDelete) {
          setClients(prev => prev.filter(client => client.id !== clientId));
        } else {
          setClients(prev => prev.map(client => 
            client.id === clientId 
              ? { 
                  ...client, 
                  isActive: false, 
                  status: UNIFIED_CLIENT_STATUS.INATIVO,
                  deletedAt: new Date() 
                }
              : client
          ));
        }
        
        console.log(`✅ Cliente ${clientId} ${hardDelete ? 'eliminado permanentemente' : 'marcado como inativo'}`);
        
        return { 
          success: true, 
          message: hardDelete ? 'Cliente eliminado permanentemente!' : 'Cliente removido da lista!' 
        };
      }

    } catch (err) {
      console.error('❌ Erro ao eliminar cliente:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [isUserReady, crudHelpers]);

  // 💬 ADICIONAR INTERAÇÃO COM AUDITORIA COMPLETA
  const addInteraction = useCallback(async (clientId, interactionData) => {
    if (!isUserReady) return;

    try {
      // Ler cliente atual
      const clientResult = await crudHelpers.readOne(clientId);
      
      if (!clientResult.success) {
        throw new Error('Cliente não encontrado');
      }

      const client = clientResult.data;
      const currentInteractions = client.interactions || {};
      const currentStats = client.stats || { totalInteractions: 0 };
      
      const interaction = {
        id: Date.now().toString(),
        type: interactionData.type || CONTACT_TYPES.OUTRO,
        title: interactionData.title?.trim() || '',
        description: interactionData.description?.trim() || '',
        outcome: interactionData.outcome?.trim() || '',
        nextAction: interactionData.nextAction?.trim() || '',
        followUpRequired: interactionData.followUpRequired || false,
        followUpDate: interactionData.followUpDate || null,
        duration: interactionData.duration || null, // em minutos
        rating: interactionData.rating || null, // 1-5
        createdAt: new Date().toISOString(),
        userId: activeUser.uid,
        userEmail: activeUser.email,
        structureVersion: '3.1'
      };

      const updatedInteractions = { ...currentInteractions, [interaction.id]: interaction };
      
      const updateData = {
        interactions: updatedInteractions,
        lastInteraction: new Date(),
        stats: {
          ...currentStats,
          totalInteractions: (currentStats.totalInteractions || 0) + 1,
          lastContactDate: new Date(),
          nextFollowUpDate: interaction.followUpDate ? new Date(interaction.followUpDate) : currentStats.nextFollowUpDate
        },
        requiresFollowUp: interaction.followUpRequired
      };

      const result = await crudHelpers.update(clientId, updateData);

      if (result.success) {
        // Atualizar lista local
        setClients(prev => 
          prev.map(client => 
            client.id === clientId 
              ? { 
                  ...client, 
                  ...updateData,
                  updatedAt: new Date(),
                  isRecentlyActive: true,
                  nextAction: interaction.nextAction || suggestNextAction({...client, ...updateData})
                }
              : client
          )
        );

        console.log(`💬 Interação adicionada ao cliente ${clientId}`);
        
        return { success: true, interaction, message: 'Interação registada com sucesso!' };
      }

      return { success: false, error: 'Falha ao registrar interação' };

    } catch (err) {
      console.error('❌ Erro ao adicionar interação:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [isUserReady, activeUser, crudHelpers]);

  // 🔍 BUSCAR CLIENTES COM FILTROS
  const searchClients = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  // 📊 ESTATÍSTICAS UNIFICADAS COMPLETAS
  const getClientStats = useCallback(() => {
    const stats = {
      total: clients.length,
      byStatus: {},
      byClientType: {},
      byInterestType: {},
      byBudgetRange: {},
      byPriority: {},
      recentInteractions: 0,
      withOpportunities: 0,
      highValue: 0,
      averageDataCompleteness: 0
    };

    clients.forEach(client => {
      // Por status unificado
      stats.byStatus[client.status] = (stats.byStatus[client.status] || 0) + 1;
      
      // Por tipo de cliente
      stats.byClientType[client.clientType] = (stats.byClientType[client.clientType] || 0) + 1;
      
      // Por tipo de interesse unificado
      stats.byInterestType[client.interestType] = (stats.byInterestType[client.interestType] || 0) + 1;
      
      // Por faixa de orçamento unificada
      stats.byBudgetRange[client.budgetRange] = (stats.byBudgetRange[client.budgetRange] || 0) + 1;
      
      // Por prioridade
      stats.byPriority[client.priority] = (stats.byPriority[client.priority] || 0) + 1;
      
      // Flags especiais
      if (client.hasOpportunities) stats.withOpportunities++;
      if (client.isHighValue) stats.highValue++;
      if (client.isRecentlyActive) stats.recentInteractions++;
      
      // Completude média dos dados
      stats.averageDataCompleteness += client.dataCompleteness || 0;
    });

    if (clients.length > 0) {
      stats.averageDataCompleteness = Math.round(stats.averageDataCompleteness / clients.length);
    }

    return stats;
  }, [clients]);

  // 📊 OBTER CLIENTES POR CRITÉRIO
  const getClientsByStatus = useCallback((status) => {
    return clients.filter(client => client.status === status);
  }, [clients]);

  const getClientsByType = useCallback((clientType) => {
    return clients.filter(client => client.clientType === clientType);
  }, [clients]);

  const getHighValueClients = useCallback(() => {
    return clients.filter(client => client.isHighValue);
  }, [clients]);

  const getClientsRequiringFollowUp = useCallback(() => {
    return clients.filter(client => client.requiresFollowUp);
  }, [clients]);

  // 🏠 OBTER DIAGNÓSTICO DA SUBCOLEÇÃO
  const getDiagnostics = useCallback(async () => {
    if (!activeUser) return null;
    
    try {
      return await fbService.diagnoseSubcollection(CLIENTS_SUBCOLLECTION);
    } catch (error) {
      console.error('❌ Erro ao obter diagnósticos:', error);
      return null;
    }
  }, [activeUser, fbService]);

  // 🔧 FUNÇÕES AUXILIARES
  const getStatusLabel = (status) => {
    const labels = {
      [UNIFIED_CLIENT_STATUS.ATIVO]: 'Ativo',
      [UNIFIED_CLIENT_STATUS.INATIVO]: 'Inativo',
      [UNIFIED_CLIENT_STATUS.PROSPETO]: 'Prospeto',
      [UNIFIED_CLIENT_STATUS.EX_CLIENTE]: 'Ex-Cliente',
      [UNIFIED_CLIENT_STATUS.SUSPENSO]: 'Suspenso'
    };
    return labels[status] || status;
  };

  // 🔄 EFFECTS
  useEffect(() => {
    if (isUserReady) {
      console.log('useClients: Utilizador pronto, carregando clientes...');
      fetchClients();
    }
  }, [isUserReady, fetchClients]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 🔄 SINCRONIZAÇÃO PÓS-CONVERSÃO COMPLETA
  useEffect(() => {
    const handleCrmSync = (event) => {
      console.log('useClients: Sincronização recebida', event.detail);
      if (event.detail.type === 'lead-conversion') {
        console.log('Refrescando lista de clientes após conversão...');
        fetchClients();
      }
    };

    // Criar função global para refresh
    window.refreshClients = async () => {
      console.log('RefreshClients chamada globalmente');
      await fetchClients();
    };

    // Adicionar listener
    window.addEventListener('crm-data-sync', handleCrmSync);

    // Cleanup
    return () => {
      window.removeEventListener('crm-data-sync', handleCrmSync);
      delete window.refreshClients;
    };
  }, [fetchClients]);

  // 📤 RETORNO DO HOOK UNIFICADO COMPLETO
  return {
    // Estados
    clients,
    loading,
    error,
    creating,
    updating,
    converting,
    duplicateCheck,
    filters,

    // Ações principais
    createClient,
    updateClient,
    updateClientStatus,
    convertClientToOpportunity,
    deleteClient,
    addInteraction,
    
    // Busca e filtros
    fetchClients,
    searchClients,
    setFilters,
    checkForDuplicates,
    
    // Estatísticas
    getClientStats,
    getClientsByStatus,
    getClientsByType,
    getHighValueClients,
    getClientsRequiringFollowUp,
    
    // Diagnóstico
    getDiagnostics,
    
    // Constantes unificadas (compatibilidade)
    CLIENT_STATUS: UNIFIED_CLIENT_STATUS,
    CLIENT_TYPES,
    CLIENT_TYPE_LABELS,
    CLIENT_BUDGET_RANGES: UNIFIED_BUDGET_RANGES,
    PROPERTY_INTERESTS: UNIFIED_INTEREST_TYPES,
    CLIENT_STATUS_COLORS,
    CONTACT_TYPES,
    CONTACT_TYPE_LABELS,
    
    // Novos: constantes unificadas
    UNIFIED_CLIENT_STATUS,
    UNIFIED_INTEREST_TYPES,
    UNIFIED_BUDGET_RANGES,
    UNIFIED_PRIORITIES,
    UNIFIED_CONTACT_TIMES,
    
    // Helpers unificados
    isValidEmail: validateEmail,
    isValidPhone: validatePortuguesePhone,
    isValidNIF: validateNIF,
    isValidPostalCode: validatePostalCode,
    normalizePhone: (phone) => phone?.replace(/\s|-/g, '') || '',
    getInterestTypeLabel,
    getBudgetRangeLabel,
    formatCurrency,
    getStatusLabel,
    
    // Estado de conectividade
    isConnected: isUserReady && !error,
    isUserReady,
    authStatus: {
      isAuthenticated,
      hasUser: !!activeUser,
      userId: activeUser?.uid,
      authLoading
    },
    
    // Informações da estrutura
    structureVersion: '3.1',
    isUnified: true,
    isMultiTenant: true
  };
};

// 🎯 HELPER FUNCTIONS COMPLETAS
// =============================

/**
 * Calcular completude dos dados do cliente (0-100%)
 */
const calculateDataCompleteness = (clientData) => {
  const fields = [
    'name', 'primaryEmail', 'primaryPhone', 'nif', 'cc',
    'address.street', 'address.city', 'address.postalCode',
    'interestType', 'budgetRange', 'preferredLocation',
    'profession', 'maritalStatus'
  ];
  
  let completedFields = 0;
  
  fields.forEach(field => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (clientData[parent] && clientData[parent][child]) {
        completedFields++;
      }
    } else {
      if (clientData[field]) {
        completedFields++;
      }
    }
  });
  
  return Math.round((completedFields / fields.length) * 100);
};

/**
 * Verificar se cliente é de alto valor
 */
const isHighValueClient = (budgetRange, interestType) => {
  const highValueRanges = [
    UNIFIED_BUDGET_RANGES.DE_500K_750K,
    UNIFIED_BUDGET_RANGES.DE_750K_1M,
    UNIFIED_BUDGET_RANGES.ACIMA_1M
  ];
  
  const isHighBudget = highValueRanges.includes(budgetRange);
  const isCommercialInterest = interestType?.includes('comercial');
  
  return isHighBudget || isCommercialInterest;
};

/**
 * Verificar se cliente está recentemente ativo
 */
const isRecentlyActive = (lastInteraction, createdAt) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const lastActivity = lastInteraction || createdAt;
  if (!lastActivity) return false;
  
  const activityDate = new Date(lastActivity);
  return activityDate >= thirtyDaysAgo;
};

/**
 * Sugerir próxima ação para o cliente
 */
const suggestNextAction = (clientData) => {
  if (!clientData.interactions || Object.keys(clientData.interactions).length === 0) {
    return 'Primeiro contacto';
  }
  
  const interactions = Object.values(clientData.interactions);
  const lastInteraction = interactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
  
  if (!lastInteraction) return 'Primeiro contacto';
  
  const daysSinceLastContact = Math.floor(
    (new Date() - new Date(lastInteraction.createdAt)) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceLastContact > 14) {
    return 'Follow-up necessário';
  }
  
  if (clientData.requiresFollowUp) {
    return 'Follow-up agendado';
  }
  
  if (!clientData.hasOpportunities) {
    return 'Criar oportunidade';
  }
  
  return 'Contacto regular';
};

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
 * Calcular score inicial do cliente
 */
const calculateInitialClientScore = (clientData) => {
  let score = 50; // Base score
  
  // Bonus por orçamento mais alto
  if (clientData.budgetRange === UNIFIED_BUDGET_RANGES.ACIMA_1M) score += 30;
  else if (clientData.budgetRange === UNIFIED_BUDGET_RANGES.DE_500K_750K) score += 20;
  else if (clientData.budgetRange === UNIFIED_BUDGET_RANGES.DE_300K_500K) score += 15;
  
  // Bonus por prioridade
  if (clientData.priority === UNIFIED_PRIORITIES.ALTA) score += 20;
  else if (clientData.priority === UNIFIED_PRIORITIES.MEDIA) score += 10;
  
  // Bonus por completude dos dados
  const completeness = calculateDataCompleteness(clientData);
  score += Math.floor(completeness / 10); // 10 pontos por cada 10% de completude
  
  return Math.min(100, Math.max(0, score));
};

/**
 * Calcular score do cliente (versão completa)
 */
const calculateClientScore = (clientData) => {
  return calculateInitialClientScore(clientData);
};

/**
 * Calcular próximo follow-up
 */
const calculateNextFollowUp = (priority) => {
  const now = new Date();
  switch (priority) {
    case UNIFIED_PRIORITIES.ALTA:
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 dias
    case UNIFIED_PRIORITIES.MEDIA:
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias
    default:
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 dias
  }
};

export default useClients;