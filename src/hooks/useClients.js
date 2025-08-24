// src/hooks/useClients.js
// 🎯 HOOK UNIFICADO PARA GESTÃO DE CLIENTES - MyImoMate 3.0
// =========================================================
// VERSÃO UNIFICADA com estrutura padronizada
// Funcionalidades: CRUD, Interações, Validações Unificadas, Estrutura Base

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
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

// 📚 IMPORTS DA ESTRUTURA UNIFICADA
// =================================
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

// 🔧 CONFIGURAÇÕES DO HOOK
// ========================
const CLIENTS_COLLECTION = 'clients';
const LEADS_COLLECTION = 'leads';
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
  OUTRO: 'outro'
};

export const CONTACT_TYPE_LABELS = {
  [CONTACT_TYPES.CHAMADA]: 'Chamada Telefónica',
  [CONTACT_TYPES.EMAIL]: 'Email',
  [CONTACT_TYPES.WHATSAPP]: 'WhatsApp',
  [CONTACT_TYPES.REUNIAO]: 'Reunião Presencial',
  [CONTACT_TYPES.VISITA]: 'Visita a Imóvel',
  [CONTACT_TYPES.SMS]: 'SMS',
  [CONTACT_TYPES.VIDEOCHAMADA]: 'Videochamada',
  [CONTACT_TYPES.OUTRO]: 'Outro'
};

// 🎯 HOOK PRINCIPAL UNIFICADO
// ===========================
const useClients = () => {
  // Estados principais
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
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

  // Hook de autenticação
  const { user, currentUser, isAuthenticated, loading: authLoading } = useAuth();
  
  // Verificação de autenticação melhorada
  const activeUser = currentUser || user;
  const isUserReady = !authLoading && !!activeUser && activeUser.uid;


  // 📥 BUSCAR TODOS OS CLIENTES COM ESTRUTURA UNIFICADA
  // ==================================================
  const fetchClients = useCallback(async () => {
    if (!isUserReady) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Query simplificada para evitar erro de índice
      let clientQuery = query(
        collection(db, CLIENTS_COLLECTION),
        where('userId', '==', activeUser.uid),
        limit(FETCH_LIMIT)
      );

      const querySnapshot = await getDocs(clientQuery);
      const clientsData = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          
          // Aplicar migração automática se necessário
          let migratedData;
try {
  migratedData = migrateClientData(data);
} catch (error) {
  console.warn('⚠️ Migração falhou:', error);
  migratedData = data;
}
          
          return {
            id: doc.id,
            ...migratedData,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate(),
            lastInteraction: data.lastInteraction?.toDate()
          };
        })
        .filter(client => client.isActive !== false) // Filtrar inativos
        .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)); // Ordenar por data criação

      // Aplicar filtros client-side
      let filteredClients = clientsData;
      
      if (filters.status && Object.values(UNIFIED_CLIENT_STATUS).includes(filters.status)) {
        filteredClients = filteredClients.filter(client => client.status === filters.status);
      }
      
      if (filters.clientType) {
        filteredClients = filteredClients.filter(client => client.clientType === filters.clientType);
      }
      
      if (filters.interestType && Object.values(UNIFIED_INTEREST_TYPES).includes(filters.interestType)) {
        filteredClients = filteredClients.filter(client => 
          client.interestType === filters.interestType || 
          client.primaryInterest === filters.interestType
        );
      }
      
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredClients = filteredClients.filter(client => 
          client.name?.toLowerCase().includes(term) ||
          client.email?.toLowerCase().includes(term) ||
          client.phone?.includes(term.replace(/\s/g, '')) ||
          client.nif?.includes(term)
        );
      }

      setClients(filteredClients);
      console.log(`Carregados ${filteredClients.length} clientes com estrutura unificada`);
      
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
      setError(`Erro ao carregar clientes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [isUserReady, activeUser, filters]);

  // 🔄 MIGRAÇÃO AUTOMÁTICA DE DADOS ANTIGOS
  // =======================================
  const migrateClientData = useCallback((oldData) => {
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
      
      // Migrar status de cliente
      status: migrateClientStatus(oldData.status),
      
      // Migrar tipos de interesse
      interestType: migrateInterestType(oldData.primaryInterest || oldData.interestType),
      primaryInterest: migrateInterestType(oldData.primaryInterest || oldData.interestType),
      
      // Migrar faixas de orçamento
      budgetRange: migrateBudgetRange(oldData.budgetRange),
      
      // Garantir campos obrigatórios
      phoneNormalized: oldData.phoneNormalized || oldData.phone?.replace(/\s|-/g, '') || '',
      
      // Adicionar campos novos
      structureVersion: '3.0',
      migratedAt: new Date().toISOString(),
      
      // Migrar preferências de contacto
      preferredContactTime: oldData.preferredContactTime || UNIFIED_CONTACT_TIMES.QUALQUER_HORA,
      
      // Garantir referências cruzadas
      leadId: oldData.originalLeadId || oldData.leadId || null,
      clientId: oldData.id || null,
      opportunityId: oldData.opportunityId || null,
      dealId: oldData.dealId || null
    };

    return migrated;
  }, []);

  // 🔄 FUNÇÕES DE MIGRAÇÃO ESPECÍFICAS
  // ==================================
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

  // 🔍 VERIFICAR DUPLICADOS SIMPLIFICADO
  // ====================================
  const checkForDuplicates = useCallback(async (phone, email, nif = null) => {
    setDuplicateCheck(true);
    
    try {
      const duplicates = [];
      
      // Verificar por telefone normalizado
      if (phone) {
        const normalizedPhone = phone.replace(/\s|-/g, '');
        const phoneQuery = query(
          collection(db, CLIENTS_COLLECTION),
          where('userId', '==', activeUser.uid),
          where('phoneNormalized', '==', normalizedPhone),
          limit(5)
        );
        const phoneSnapshot = await getDocs(phoneQuery);
        
        phoneSnapshot.docs.forEach(doc => {
          duplicates.push({ 
            id: doc.id, 
            ...doc.data(), 
            duplicateField: 'phone' 
          });
        });
      }

      // Verificar por email
      if (email) {
        const emailQuery = query(
          collection(db, CLIENTS_COLLECTION),
          where('userId', '==', activeUser.uid),
          where('email', '==', email.toLowerCase()),
          limit(5)
        );
        const emailSnapshot = await getDocs(emailQuery);
        
        emailSnapshot.docs.forEach(doc => {
          if (!duplicates.find(d => d.id === doc.id)) {
            duplicates.push({ 
              id: doc.id, 
              ...doc.data(), 
              duplicateField: 'email' 
            });
          }
        });
      }

      // Verificar por NIF se fornecido
      if (nif) {
        const nifQuery = query(
          collection(db, CLIENTS_COLLECTION),
          where('userId', '==', activeUser.uid),
          where('nif', '==', nif),
          limit(5)
        );
        const nifSnapshot = await getDocs(nifQuery);
        
        nifSnapshot.docs.forEach(doc => {
          if (!duplicates.find(d => d.id === doc.id)) {
            duplicates.push({ 
              id: doc.id, 
              ...doc.data(), 
              duplicateField: 'nif' 
            });
          }
        });
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
  }, [activeUser]);

  // ➕ CRIAR NOVO CLIENTE COM ESTRUTURA UNIFICADA
  // ============================================
  const createClient = useCallback(async (clientData) => {
    if (!isUserReady) {
      throw new Error('Utilizador não autenticado');
    }

    setCreating(true);
    setError(null);

    try {
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
      
      // 4. CRIAR OBJETO DO CLIENTE COM ESTRUTURA UNIFICADA
      const newClient = {
        // Dados básicos obrigatórios
        name: clientData.name.trim(),
        phone: clientData.phone?.trim() || '',
        phoneNormalized: normalizedPhone,
        email: normalizedEmail,
        
        // Dados específicos do cliente
        clientType: clientData.clientType || CLIENT_TYPES.COMPRADOR,
        
        // Dados pessoais expandidos (PERSONAL_DATA_STRUCTURE)
        nameFirst: clientData.nameFirst?.trim() || '',
        nameLast: clientData.nameLast?.trim() || '',
        phoneSecondary: clientData.phoneSecondary?.trim() || '',
        emailSecondary: clientData.emailSecondary?.toLowerCase().trim() || '',
        nif: clientData.nif?.trim() || '',
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
        
        // Preferências de contacto
        preferredContactTime: clientData.preferredContactTime || UNIFIED_CONTACT_TIMES.QUALQUER_HORA,
        preferredContactMethod: clientData.preferredContactMethod || 'telefone',
        
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
        
        // Dados de auditoria obrigatórios
        userId: activeUser.uid,
        userEmail: activeUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Flags de controlo
        isActive: true,
        isConverted: false,
        
        // Referências cruzadas
        leadId: clientData.leadId || clientData.originalLeadId || null,
        clientId: null, // Auto-preenchido após criação
        opportunityId: null,
        dealId: null,
        
        // Dados de interação
        interactions: {},
        stats: {
          totalInteractions: 0,
          lastContactDate: null,
          nextFollowUpDate: null
        },
        
        // Observações
        notes: clientData.notes?.trim() || '',
        
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

      // 5. INSERIR NO FIREBASE
      const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), newClient);
      
      // 6. CRIAR OBJETO COMPLETO PARA RETORNO
      const createdClient = {
        id: docRef.id,
        ...newClient,
        clientId: docRef.id, // Atualizar referência própria
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 7. ATUALIZAR LISTA LOCAL
      setClients(prev => [createdClient, ...prev]);

      console.log('Cliente criado com estrutura unificada:', docRef.id);
      
      return {
        success: true,
        client: createdClient,
        message: 'Cliente criado com sucesso!'
      };

    } catch (err) {
      console.error('Erro ao criar cliente:', err);
      setError(err.message);
      
      return {
        success: false,
        error: err.message,
        message: `Erro ao criar cliente: ${err.message}`
      };
    } finally {
      setCreating(false);
    }
  }, [isUserReady, activeUser, checkForDuplicates]);

  // 🔄 ATUALIZAR CLIENTE
  // ====================
  const updateClient = useCallback(async (clientId, clientData) => {
    if (!isUserReady) return;

    setUpdating(true);
    setError(null);

    try {
      const updateData = {
        ...clientData,
        updatedAt: serverTimestamp(),
        lastModifiedBy: activeUser.uid,
        structureVersion: '3.0'
      };

      // Normalizar dados se necessário
      if (clientData.phone) {
        updateData.phoneNormalized = clientData.phone.replace(/\s|-/g, '');
      }
      
      if (clientData.email) {
        updateData.email = clientData.email.toLowerCase().trim();
      }

      await updateDoc(doc(db, CLIENTS_COLLECTION, clientId), updateData);

      // Atualizar lista local
      setClients(prev => 
        prev.map(client => 
          client.id === clientId 
            ? { ...client, ...updateData, updatedAt: new Date() }
            : client
        )
      );

      console.log(`Cliente ${clientId} atualizado`);
      
      return { success: true, message: 'Cliente atualizado com sucesso!' };

    } catch (err) {
      console.error('Erro ao atualizar cliente:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, [isUserReady, activeUser]);

  // 🔄 ATUALIZAR STATUS DO CLIENTE
  // ==============================
  const updateClientStatus = useCallback(async (clientId, newStatus, notes = '') => {
    if (!isUserReady) return;

    try {
      // Validar se o status é válido
      if (!Object.values(UNIFIED_CLIENT_STATUS).includes(newStatus)) {
        throw new Error(`Status inválido: ${newStatus}`);
      }

      const updateData = {
        status: newStatus,
        updatedAt: serverTimestamp(),
        lastModifiedBy: activeUser.uid
      };

      // Adicionar auditoria de mudança de status
      if (notes.trim()) {
        updateData.statusChangeNote = notes.trim();
        updateData.lastStatusChange = serverTimestamp();
        updateData[`statusHistory.change_${Date.now()}`] = {
          to: newStatus,
          changedBy: activeUser.uid,
          changedAt: new Date().toISOString(),
          notes: notes.trim(),
          userAgent: navigator.userAgent
        };
      }

      await updateDoc(doc(db, CLIENTS_COLLECTION, clientId), updateData);

      // Atualizar lista local
      setClients(prev => 
        prev.map(client => 
          client.id === clientId 
            ? { ...client, status: newStatus, updatedAt: new Date() }
            : client
        )
      );

      console.log(`Status do cliente ${clientId} atualizado para: ${newStatus}`);
      
      return { 
        success: true, 
        message: `Status atualizado para ${getStatusLabel(newStatus)}!` 
      };

    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      return { success: false, error: err.message };
    }
  }, [isUserReady, activeUser]);

  // Adicionar esta função ao useClients.js existente, após updateClientStatus e antes de deleteClient

// 🔄 CONVERTER CLIENTE PARA OPORTUNIDADE (FASE 3)
// ===============================================
const convertClientToOpportunity = useCallback(async (clientId, opportunityData = {}) => {
  if (!isUserReady || !activeUser?.uid || !clientId) {
    setError('Dados inválidos para conversão');
    return { success: false, message: 'Dados inválidos' };
  }

  setConverting(true);
  setError(null);

  try {
    // 1. BUSCAR DADOS DO CLIENTE
    const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
    const clientSnap = await getDoc(clientRef);
    
    if (!clientSnap.exists()) {
      throw new Error('Cliente não encontrado');
    }

    const clientData = clientSnap.data();

    // 2. VALIDAR DADOS MÍNIMOS PARA OPORTUNIDADE
    if (!opportunityData.interestType) {
      throw new Error('Tipo de interesse é obrigatório para criar oportunidade');
    }

    if (!opportunityData.budgetRange) {
      throw new Error('Faixa de orçamento é obrigatória para criar oportunidade');
    }

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
      convertedAt: serverTimestamp(),
      
      // Estrutura base
      userId: activeUser.uid,
      userEmail: activeUser.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: activeUser.uid,
      lastModifiedBy: activeUser.uid,
      
      // Metadados
      structureVersion: '3.0',
      metadata: {
        convertedFromClient: true,
        conversionDate: new Date().toISOString(),
        userAgent: navigator.userAgent
      }
    };

    // 4. CRIAR OPORTUNIDADE NO FIREBASE
    const opportunityDocRef = await addDoc(collection(db, 'opportunities'), baseOpportunityData);

    // 5. ATUALIZAR CLIENTE COM REFERÊNCIA À OPORTUNIDADE
    await updateDoc(clientRef, {
      hasOpportunities: true,
      lastOpportunityId: opportunityDocRef.id,
      lastOpportunityCreated: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastModifiedBy: activeUser.uid,
      
      // Array de oportunidades (se não existir, criar)
      opportunityIds: arrayUnion(opportunityDocRef.id)
    });

    // 6. ATUALIZAR LISTA LOCAL DE CLIENTES
    setClients(prev => 
      prev.map(client => 
        client.id === clientId 
          ? { 
              ...client, 
              hasOpportunities: true,
              lastOpportunityId: opportunityDocRef.id,
              lastOpportunityCreated: new Date(),
              updatedAt: new Date()
            }
          : client
      )
    );

    setConverting(false);
    
    console.log(`Cliente ${clientId} convertido para oportunidade ${opportunityDocRef.id}`);
    
    return {
      success: true,
      clientId: clientId,
      opportunityId: opportunityDocRef.id,
      message: `Cliente convertido para oportunidade com sucesso!`
    };

  } catch (err) {
    console.error('Erro ao converter cliente para oportunidade:', err);
    setError(err.message || 'Erro ao converter cliente');
    setConverting(false);
    
    return {
      success: false,
      message: err.message || 'Erro ao converter cliente para oportunidade'
    };
  }
}, [isUserReady, activeUser?.uid, activeUser?.email]);

// FUNÇÃO AUXILIAR: Obter valor médio da faixa de orçamento
const getBudgetRangeMiddleValue = (range) => {
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
  return values[range] || 200000;
};

// ADICIONAR AO FINAL DO RETURN DO HOOK:
// Adicionar 'convertClientToOpportunity' na lista de ações principais

  // 🗑️ ELIMINAR CLIENTE (SOFT DELETE)
  // =================================
  const deleteClient = useCallback(async (clientId, hardDelete = false) => {
    if (!isUserReady) return;

    try {
      const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
      
      if (hardDelete) {
        // Eliminação definitiva
        await deleteDoc(clientRef);
        console.log(`Cliente ${clientId} eliminado permanentemente`);
      } else {
        // Soft delete (recomendado)
        await updateDoc(clientRef, {
          isActive: false,
          status: UNIFIED_CLIENT_STATUS.INATIVO,
          deletedAt: serverTimestamp(),
          deletedBy: activeUser.uid,
          updatedAt: serverTimestamp()
        });
        console.log(`Cliente ${clientId} marcado como inativo`);
      }
      
      // Remover da lista local
      setClients(prev => prev.filter(client => client.id !== clientId));
      
      return { 
        success: true, 
        message: hardDelete ? 'Cliente eliminado permanentemente!' : 'Cliente removido da lista!' 
      };

    } catch (err) {
      console.error('Erro ao eliminar cliente:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [isUserReady, activeUser]);

  // 💬 ADICIONAR INTERAÇÃO COM AUDITORIA
  // ====================================
  const addInteraction = useCallback(async (clientId, interactionData) => {
    if (!isUserReady) return;

    try {
      const interaction = {
        id: Date.now().toString(),
        type: interactionData.type || CONTACT_TYPES.OUTRO,
        title: interactionData.title?.trim() || '',
        description: interactionData.description?.trim() || '',
        outcome: interactionData.outcome?.trim() || '',
        nextAction: interactionData.nextAction?.trim() || '',
        createdAt: serverTimestamp(),
        userId: activeUser.uid,
        userEmail: activeUser.email,
        structureVersion: '3.0'
      };

      const updateData = {
        [`interactions.${interaction.id}`]: interaction,
        lastInteraction: serverTimestamp(),
        'stats.totalInteractions': (clients.find(c => c.id === clientId)?.stats?.totalInteractions || 0) + 1,
        'stats.lastContactDate': serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Definir próximo follow-up se especificado
      if (interactionData.nextFollowUpDate) {
        updateData['stats.nextFollowUpDate'] = interactionData.nextFollowUpDate;
      }

      await updateDoc(doc(db, CLIENTS_COLLECTION, clientId), updateData);

      // Atualizar lista local
      setClients(prev => 
        prev.map(client => 
          client.id === clientId 
            ? { 
                ...client, 
                interactions: { ...client.interactions, [interaction.id]: interaction },
                lastInteraction: new Date(),
                stats: { 
                  ...client.stats, 
                  totalInteractions: (client.stats?.totalInteractions || 0) + 1,
                  lastContactDate: new Date()
                }
              }
            : client
        )
      );

      console.log(`Interação adicionada ao cliente ${clientId}`);
      
      return { success: true, interaction, message: 'Interação registada com sucesso!' };

    } catch (err) {
      console.error('Erro ao adicionar interação:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [isUserReady, activeUser, clients]);

  // 🔍 BUSCAR CLIENTES COM FILTROS
  // ==============================
  const searchClients = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  // 📊 ESTATÍSTICAS UNIFICADAS
  // ==========================
  const getClientStats = useCallback(() => {
    const stats = {
      total: clients.length,
      byStatus: {},
      byClientType: {},
      byInterestType: {},
      byBudgetRange: {},
      byPriority: {},
      recentInteractions: 0
    };

    // Contar por status unificado
    Object.values(UNIFIED_CLIENT_STATUS).forEach(status => {
      stats.byStatus[status] = clients.filter(client => client.status === status).length;
    });

    // Contar por tipo de cliente
    Object.values(CLIENT_TYPES).forEach(type => {
      stats.byClientType[type] = clients.filter(client => client.clientType === type).length;
    });

    // Contar por tipo de interesse unificado
    Object.values(UNIFIED_INTEREST_TYPES).forEach(type => {
      stats.byInterestType[type] = clients.filter(client => 
        client.interestType === type || client.primaryInterest === type
      ).length;
    });

    // Contar por faixa de orçamento unificada
    Object.values(UNIFIED_BUDGET_RANGES).forEach(range => {
      stats.byBudgetRange[range] = clients.filter(client => client.budgetRange === range).length;
    });

    // Contar por prioridade
    Object.values(UNIFIED_PRIORITIES).forEach(priority => {
      stats.byPriority[priority] = clients.filter(client => client.priority === priority).length;
    });

    // Interações recentes (últimos 30 dias)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    stats.recentInteractions = clients.filter(client => 
      client.lastInteraction && client.lastInteraction > thirtyDaysAgo
    ).length;

    return stats;
  }, [clients]);

  // 🔧 FUNÇÕES AUXILIARES
  // =====================
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
  // ==========
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

    // 🔄 SINCRONIZAÇÃO PÓS-CONVERSÃO - ADICIONAR AQUI
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

  // 📤 RETORNO DO HOOK UNIFICADO
  // ============================
  return {
    // Estados
    clients,
    loading,
    error,
    creating,
    updating,
    duplicateCheck,
    filters,

    // Ações principais
    createClient,
    updateClient,
    updateClientStatus,
    deleteClient,
    addInteraction,
    
    // Busca e filtros
    fetchClients,
    searchClients,
    setFilters,
    checkForDuplicates,
    
    // Estatísticas
    getClientStats,
    
    // Constantes unificadas (compatibilidade)
    CLIENT_STATUS: UNIFIED_CLIENT_STATUS,
    CLIENT_TYPES,
    CLIENT_BUDGET_RANGES: UNIFIED_BUDGET_RANGES,
    PROPERTY_INTERESTS: UNIFIED_INTEREST_TYPES,
    CLIENT_STATUS_COLORS,
    CONTACT_TYPES,
    
    // Novos: constantes unificadas
    UNIFIED_CLIENT_STATUS,
    UNIFIED_INTEREST_TYPES,
    UNIFIED_BUDGET_RANGES,
    UNIFIED_PRIORITIES,
    UNIFIED_CONTACT_TIMES,
    CLIENT_TYPE_LABELS,
    CONTACT_TYPE_LABELS,
    
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
    structureVersion: '3.0',
    isUnified: true
  };
};

export default useClients;