// src/hooks/useLeads.js
// 🎯 HOOK UNIFICADO PARA GESTÃO DE LEADS - MyImoMate 3.0
// ====================================================
// VERSÃO UNIFICADA com estrutura padronizada
// Funcionalidades: CRUD, Conversão, Validações Unificadas, Estrutura Base

import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  updateDoc,
  doc,
  deleteDoc,
  limit,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

// 📚 IMPORTS DA ESTRUTURA UNIFICADA
// =================================
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
  applyCoreStructure,
  validateCoreStructure,
  LEAD_TEMPLATE
} from '../constants/coreStructure.js';

import {
  validateLead,
  validateForDuplicates,
  formatValidatedData,
  validatePortuguesePhone,
  validateEmail
} from '../constants/validations.js';

// 🔧 CONFIGURAÇÕES DO HOOK
// ========================
const LEADS_COLLECTION = 'leads';
const CLIENTS_COLLECTION = 'clients';
const OPPORTUNITIES_COLLECTION = 'opportunities';
const FETCH_LIMIT = 50;

// 🎨 CORES POR STATUS (mantendo compatibilidade)
export const LEAD_STATUS_COLORS = {
  [UNIFIED_LEAD_STATUS.NOVO]: 'bg-blue-100 text-blue-800',
  [UNIFIED_LEAD_STATUS.CONTACTADO]: 'bg-yellow-100 text-yellow-800',
  [UNIFIED_LEAD_STATUS.QUALIFICADO]: 'bg-green-100 text-green-800',
  [UNIFIED_LEAD_STATUS.CONVERTIDO]: 'bg-purple-100 text-purple-800',
  [UNIFIED_LEAD_STATUS.PERDIDO]: 'bg-red-100 text-red-800',
  [UNIFIED_LEAD_STATUS.INATIVO]: 'bg-gray-100 text-gray-800'
};

// 🎯 HOOK PRINCIPAL UNIFICADO
// ===========================
const useLeads = () => {
  // Estados principais
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [converting, setConverting] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState(false);

  // Estados de filtros
  const [filters, setFilters] = useState({
    status: '',
    interestType: '',
    budgetRange: '',
    priority: '',
    source: '',
    searchTerm: ''
  });

  // Context de autenticação
  const { user } = useAuth();

  // 📥 BUSCAR TODOS OS LEADS COM ESTRUTURA UNIFICADA
  // ===============================================
  const fetchLeads = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Query simplificada para evitar erro de índice
      let leadQuery = query(
        collection(db, LEADS_COLLECTION),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(FETCH_LIMIT)
      );

      // Aplicar filtros unificados
      if (filters.status && Object.values(UNIFIED_LEAD_STATUS).includes(filters.status)) {
        leadQuery = query(leadQuery, where('status', '==', filters.status));
      }
      
      if (filters.interestType && Object.values(UNIFIED_INTEREST_TYPES).includes(filters.interestType)) {
        leadQuery = query(leadQuery, where('interestType', '==', filters.interestType));
      }

      if (filters.priority && Object.values(UNIFIED_PRIORITIES).includes(filters.priority)) {
        leadQuery = query(leadQuery, where('priority', '==', filters.priority));
      }

      // Filtrar por ativo no client-side para evitar índice composto
      const querySnapshot = await getDocs(leadQuery);
      const leadsData = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          
          // Aplicar migração automática se necessário
          const migratedData = migrateLeadData(data);
          
          return {
            id: doc.id,
            ...migratedData,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          };
        })
        .filter(lead => lead.isActive !== false); // Filtrar inativos no client-side

      // Filtrar por termo de busca (client-side)
      let filteredLeads = leadsData;
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredLeads = leadsData.filter(lead => 
          lead.name?.toLowerCase().includes(term) ||
          lead.email?.toLowerCase().includes(term) ||
          lead.phone?.includes(term.replace(/\s/g, '')) ||
          getInterestTypeLabel(lead.interestType)?.toLowerCase().includes(term)
        );
      }

      setLeads(filteredLeads);
      console.log(`✅ Carregados ${filteredLeads.length} leads com estrutura unificada`);
      
    } catch (err) {
      console.error('❌ Erro ao buscar leads:', err);
      setError(`Erro ao carregar leads: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  // 🔄 MIGRAÇÃO AUTOMÁTICA DE DADOS ANTIGOS
  // =======================================
  const migrateLeadData = useCallback((oldData) => {
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
      
      // Migrar status antigos
      status: migrateStatus(oldData.status),
      
      // Migrar tipos de interesse antigos
      interestType: migrateInterestType(oldData.interestType),
      
      // Migrar faixas de orçamento
      budgetRange: migrateBudgetRange(oldData.budgetRange),
      
      // Garantir campos obrigatórios
      phoneNormalized: oldData.phoneNormalized || oldData.phone?.replace(/\s|-/g, '') || '',
      
      // Adicionar campos novos
      source: oldData.source || UNIFIED_LEAD_SOURCES.MANUAL,
      structureVersion: '3.0',
      migratedAt: new Date().toISOString()
    };

    return migrated;
  }, []);

  // 🔄 FUNÇÕES DE MIGRAÇÃO
  // ======================
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
      // Adicionar outros mapeamentos conforme necessário
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

  // 🔍 VERIFICAR DUPLICADOS SIMPLIFICADO
  // ===================================
  const checkForDuplicates = useCallback(async (phone, email) => {
    setDuplicateCheck(true);
    
    try {
      const duplicates = [];
      
      // Verificar por telefone normalizado
      if (phone) {
        const normalizedPhone = phone.replace(/\s|-/g, '');
        const phoneQuery = query(
          collection(db, LEADS_COLLECTION),
          where('userId', '==', user.uid),
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

      // Verificar por email (query separada)
      if (email) {
        const emailQuery = query(
          collection(db, LEADS_COLLECTION),
          where('userId', '==', user.uid),
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
  }, [user]);

  // ➕ CRIAR NOVO LEAD COM ESTRUTURA UNIFICADA
  // =========================================
  const createLead = useCallback(async (leadData) => {
    if (!user) {
      throw new Error('Utilizador não autenticado');
    }

    setCreating(true);
    setError(null);

    try {
      // 1. VALIDAÇÃO BÁSICA SIMPLES (para evitar erro .join)
      if (!leadData.name?.trim()) {
        throw new Error('Nome é obrigatório');
      }
      
      if (!leadData.phone?.trim() && !leadData.email?.trim()) {
        throw new Error('Telefone ou email é obrigatório');
      }

      // Validar formato de telefone se fornecido
      if (leadData.phone && !validatePortuguesePhone(leadData.phone)) {
        throw new Error('Formato de telefone inválido');
      }

      // Validar formato de email se fornecido
      if (leadData.email && !validateEmail(leadData.email)) {
        throw new Error('Formato de email inválido');
      }

      // 3. PREPARAR DADOS BÁSICOS NORMALIZADOS
      const normalizedPhone = leadData.phone?.replace(/\s|-/g, '') || '';
      const normalizedEmail = leadData.email?.toLowerCase().trim() || '';
      
      // 4. CRIAR OBJETO DO LEAD COM ESTRUTURA SIMPLIFICADA
      const newLead = {
        // Dados básicos
        name: leadData.name.trim(),
        phone: leadData.phone?.trim() || '',
        phoneNormalized: normalizedPhone,
        email: normalizedEmail,
        
        // Dados de interesse com valores padrão
        interestType: leadData.interestType || UNIFIED_INTEREST_TYPES.COMPRA_CASA,
        budgetRange: leadData.budgetRange || UNIFIED_BUDGET_RANGES.INDEFINIDO,
        notes: leadData.notes?.trim() || '',
        
        // Status e metadados
        status: UNIFIED_LEAD_STATUS.NOVO,
        source: leadData.source || UNIFIED_LEAD_SOURCES.MANUAL,
        priority: leadData.priority || UNIFIED_PRIORITIES.NORMAL,
        
        // Dados de auditoria obrigatórios
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Dados adicionais
        location: leadData.location?.trim() || '',
        preferredContactTime: leadData.preferredContactTime || 'qualquer_hora',
        
        // Flags de controlo
        isActive: true,
        isConverted: false,
        
        // Referências cruzadas (inicialmente vazias)
        leadId: null,
        clientId: null,
        opportunityId: null,
        dealId: null,
        
        // Versão da estrutura
        structureVersion: '3.0',
        
        // Metadados técnicos básicos
        userAgent: navigator.userAgent,
        ipAddress: 'N/A',
        source_details: {
          created_via: 'web_form',
          form_version: '3.0',
          timestamp: new Date().toISOString()
        }
      };

      // 5. VERIFICAR DUPLICADOS ANTES DE INSERIR
      const duplicateCheck = await checkForDuplicates(leadData.phone, leadData.email);
      if (duplicateCheck.hasDuplicates) {
        const duplicateInfo = duplicateCheck.duplicates[0];
        throw new Error(
          `Já existe um lead com este ${
            duplicateInfo.duplicateField === 'phone' ? 'telefone' : 'email'
          }`
        );
      }

      // 6. INSERIR NO FIREBASE
      const docRef = await addDoc(collection(db, LEADS_COLLECTION), newLead);
      
      // 7. CRIAR OBJETO COMPLETO PARA RETORNO
      const createdLead = {
        id: docRef.id,
        ...newLead,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // 8. ATUALIZAR LISTA LOCAL
      setLeads(prev => [createdLead, ...prev]);

      console.log('Lead criado com estrutura unificada:', docRef.id);
      
      return {
        success: true,
        lead: createdLead,
        message: 'Lead criado com sucesso!'
      };

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
  }, [user, checkForDuplicates]);

  // 🔄 ATUALIZAR STATUS COM AUDITORIA
  // =================================
  const updateLeadStatus = useCallback(async (leadId, newStatus, notes = '') => {
    if (!user) return;

    try {
      // Validar se o status é válido
      if (!Object.values(UNIFIED_LEAD_STATUS).includes(newStatus)) {
        throw new Error(`Status inválido: ${newStatus}`);
      }

      const leadRef = doc(db, LEADS_COLLECTION, leadId);
      
      const updateData = {
        status: newStatus,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid,
        
        // Auditoria expandida
        statusHistory: {
          [`change_${Date.now()}`]: {
            from: '', // Será preenchido pelo cliente se necessário
            to: newStatus,
            changedBy: user.uid,
            changedAt: new Date().toISOString(),
            notes: notes.trim(),
            userAgent: navigator.userAgent
          }
        }
      };

      // Adicionar nota se fornecida
      if (notes.trim()) {
        updateData.statusChangeNote = notes.trim();
        updateData.lastStatusChange = serverTimestamp();
      }

      await updateDoc(leadRef, updateData);

      // Atualizar lista local
      setLeads(prev => 
        prev.map(lead => 
          lead.id === leadId 
            ? { ...lead, status: newStatus, updatedAt: new Date() }
            : lead
        )
      );

      console.log(`✅ Status do lead ${leadId} atualizado para: ${newStatus}`);
      
      return { 
        success: true, 
        message: `Status atualizado para ${getStatusLabel(newStatus)}!` 
      };

    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      return { success: false, error: err.message };
    }
  }, [user]);

  // 🔄 CONVERTER LEAD PARA CLIENTE COM ESTRUTURA UNIFICADA
  // ======================================================
  const convertLeadToClient = useCallback(async (leadId, additionalClientData = {}) => {
    if (!user) {
      throw new Error('Utilizador não autenticado');
    }

    setConverting(true);
    setError(null);

    try {
      // 1. BUSCAR DADOS DO LEAD
      const leadRef = doc(db, LEADS_COLLECTION, leadId);
      const leadSnap = await getDoc(leadRef);
      
      if (!leadSnap.exists()) {
        throw new Error('Lead não encontrado');
      }

      const leadData = leadSnap.data();

      // 2. VERIFICAR SE JÁ FOI CONVERTIDO
      if (leadData.isConverted) {
        throw new Error('Lead já foi convertido para cliente');
      }

      // 3. PREPARAR DADOS DO CLIENTE COM ESTRUTURA UNIFICADA
      const baseClientData = {
        // Dados básicos do lead (preservar completamente)
        name: leadData.name,
        phone: leadData.phone,
        phoneNormalized: leadData.phoneNormalized,
        email: leadData.email,
        
        // Usar estrutura unificada
        interestType: leadData.interestType, // Já migrado se necessário
        budgetRange: leadData.budgetRange,   // Já migrado se necessário
        priority: leadData.priority || UNIFIED_PRIORITIES.NORMAL,
        
        // Dados específicos do cliente
        clientType: 'individual',
        status: 'ativo', // Status específico de cliente
        
        // Preservar dados de interesse
        primaryInterest: leadData.interestType,
        location: leadData.location,
        notes: leadData.notes,
        
        // Rastreamento da conversão
        source: `converted_from_lead_${leadId}`,
        originalLeadId: leadId,
        convertedAt: serverTimestamp(),
        
        // Estrutura base obrigatória
        structureVersion: '3.0',
        
        // Dados adicionais fornecidos
        ...additionalClientData
      };

      // 4. APLICAR ESTRUTURA UNIFICADA AO CLIENTE
      const clientData = applyCoreStructure(baseClientData, user.uid, user.email);

      // 5. CRIAR CLIENTE NO FIREBASE
      const clientDocRef = await addDoc(collection(db, CLIENTS_COLLECTION), clientData);

      // 6. CRIAR OPORTUNIDADE AUTOMATICAMENTE (se aplicável)
      let opportunityId = null;
      try {
        const opportunityData = {
          title: `Oportunidade ${getInterestTypeLabel(leadData.interestType)} - ${leadData.name}`,
          clientId: clientDocRef.id,
          clientName: leadData.name,
          leadId: leadId,
          
          // Usar estrutura unificada
          status: 'identificacao',
          interestType: leadData.interestType,
          budgetRange: leadData.budgetRange,
          priority: leadData.priority || UNIFIED_PRIORITIES.NORMAL,
          
          // Dados de negócio
          estimatedValue: getBudgetRangeMiddleValue(leadData.budgetRange),
          probability: 10, // 10% inicial
          expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          
          // Estrutura unificada
          structureVersion: '3.0'
        };

        const structuredOpportunity = applyCoreStructure(opportunityData, user.uid, user.email);
        const opportunityDocRef = await addDoc(collection(db, OPPORTUNITIES_COLLECTION), structuredOpportunity);
        opportunityId = opportunityDocRef.id;
        
        console.log(`✅ Oportunidade criada automaticamente: ${opportunityId}`);
        
      } catch (oppErr) {
        console.warn('⚠️ Erro ao criar oportunidade automática:', oppErr.message);
      }

      // 7. ATUALIZAR LEAD COMO CONVERTIDO
      await updateDoc(leadRef, {
        status: UNIFIED_LEAD_STATUS.CONVERTIDO,
        isConverted: true,
        convertedAt: serverTimestamp(),
        convertedToClientId: clientDocRef.id,
        opportunityId: opportunityId,
        updatedAt: serverTimestamp(),
        
        // Auditoria da conversão
        conversionAudit: {
          convertedBy: user.uid,
          convertedAt: new Date().toISOString(),
          clientId: clientDocRef.id,
          opportunityId: opportunityId,
          userAgent: navigator.userAgent
        }
      });

      // 8. ATUALIZAR LISTA LOCAL
      setLeads(prev => 
        prev.map(lead => 
          lead.id === leadId 
            ? { 
                ...lead, 
                status: UNIFIED_LEAD_STATUS.CONVERTIDO, 
                isConverted: true,
                convertedAt: new Date(),
                convertedToClientId: clientDocRef.id,
                opportunityId: opportunityId,
                updatedAt: new Date()
              }
            : lead
        )
      );

      console.log(`✅ Lead ${leadId} convertido com estrutura unificada`);
      
      return {
        success: true,
        clientId: clientDocRef.id,
        opportunityId: opportunityId,
        message: `Lead convertido para cliente${opportunityId ? ' e oportunidade criada automaticamente' : ''}!`,
        client: {
          id: clientDocRef.id,
          ...clientData,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

    } catch (err) {
      console.error('❌ Erro ao converter lead:', err);
      setError(err.message);
      
      return {
        success: false,
        error: err.message,
        message: `Erro ao converter lead: ${err.message}`
      };
    } finally {
      setConverting(false);
    }
  }, [user]);

  // 🗑️ ELIMINAR LEAD (SOFT DELETE)
  // ==============================
  const deleteLead = useCallback(async (leadId, hardDelete = false) => {
    if (!user) return;

    try {
      const leadRef = doc(db, LEADS_COLLECTION, leadId);
      
      if (hardDelete) {
        // Eliminação definitiva
        await deleteDoc(leadRef);
        console.log(`✅ Lead ${leadId} eliminado permanentemente`);
      } else {
        // Soft delete (recomendado)
        await updateDoc(leadRef, {
          isActive: false,
          deletedAt: serverTimestamp(),
          deletedBy: user.uid,
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Lead ${leadId} marcado como inativo`);
      }
      
      // Remover da lista local
      setLeads(prev => prev.filter(lead => lead.id !== leadId));
      
      return { 
        success: true, 
        message: hardDelete ? 'Lead eliminado permanentemente!' : 'Lead removido da lista!' 
      };

    } catch (err) {
      console.error('❌ Erro ao eliminar lead:', err);
      return { success: false, error: err.message };
    }
  }, [user]);

  // 🔍 BUSCAR LEADS COM FILTROS AVANÇADOS
  // =====================================
  const searchLeads = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  // 📊 ESTATÍSTICAS UNIFICADAS
  // ==========================
  const getLeadStats = useCallback(() => {
    const stats = {
      total: leads.length,
      byStatus: {},
      byInterestType: {},
      byBudgetRange: {},
      byPriority: {},
      bySource: {},
      conversionRate: 0,
      qualificationRate: 0
    };

    // Contar por status unificado
    Object.values(UNIFIED_LEAD_STATUS).forEach(status => {
      stats.byStatus[status] = leads.filter(lead => lead.status === status).length;
    });

    // Contar por tipo de interesse unificado
    Object.values(UNIFIED_INTEREST_TYPES).forEach(type => {
      stats.byInterestType[type] = leads.filter(lead => lead.interestType === type).length;
    });

    // Contar por faixa de orçamento unificada
    Object.values(UNIFIED_BUDGET_RANGES).forEach(range => {
      stats.byBudgetRange[range] = leads.filter(lead => lead.budgetRange === range).length;
    });

    // Contar por prioridade
    Object.values(UNIFIED_PRIORITIES).forEach(priority => {
      stats.byPriority[priority] = leads.filter(lead => lead.priority === priority).length;
    });

    // Contar por fonte
    Object.values(UNIFIED_LEAD_SOURCES).forEach(source => {
      stats.bySource[source] = leads.filter(lead => lead.source === source).length;
    });

    // Calcular taxas
    const convertedCount = stats.byStatus[UNIFIED_LEAD_STATUS.CONVERTIDO] || 0;
    const qualifiedCount = stats.byStatus[UNIFIED_LEAD_STATUS.QUALIFICADO] || 0;
    
    stats.conversionRate = stats.total > 0 ? (convertedCount / stats.total * 100).toFixed(1) : 0;
    stats.qualificationRate = stats.total > 0 ? (qualifiedCount / stats.total * 100).toFixed(1) : 0;

    return stats;
  }, [leads]);

  // 🔧 FUNÇÕES AUXILIARES
  // =====================
  const getStatusLabel = (status) => {
    const labels = {
      [UNIFIED_LEAD_STATUS.NOVO]: 'Novo',
      [UNIFIED_LEAD_STATUS.CONTACTADO]: 'Contactado', 
      [UNIFIED_LEAD_STATUS.QUALIFICADO]: 'Qualificado',
      [UNIFIED_LEAD_STATUS.CONVERTIDO]: 'Convertido',
      [UNIFIED_LEAD_STATUS.PERDIDO]: 'Perdido',
      [UNIFIED_LEAD_STATUS.INATIVO]: 'Inativo'
    };
    return labels[status] || status;
  };

  const getBudgetRangeMiddleValue = (range) => {
    const values = {
      [UNIFIED_BUDGET_RANGES.ATE_100K]: 75000,
      [UNIFIED_BUDGET_RANGES.DE_100K_200K]: 150000,
      [UNIFIED_BUDGET_RANGES.DE_200K_300K]: 250000,
      [UNIFIED_BUDGET_RANGES.DE_300K_500K]: 400000,
      [UNIFIED_BUDGET_RANGES.DE_500K_750K]: 625000,
      [UNIFIED_BUDGET_RANGES.DE_750K_1M]: 875000,
      [UNIFIED_BUDGET_RANGES.ACIMA_1M]: 1250000,
      [UNIFIED_BUDGET_RANGES.INDEFINIDO]: 200000
    };
    return values[range] || 200000;
  };

  // 🔄 EFFECTS
  // ==========
  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user, fetchLeads]);

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
    leads,
    loading,
    error,
    creating,
    converting,
    duplicateCheck,
    filters,

    // Ações principais
    createLead,
    convertLeadToClient,
    updateLeadStatus,
    deleteLead,
    
    // Busca e filtros
    fetchLeads,
    searchLeads,
    setFilters,
    checkForDuplicates,
    
    // Estatísticas
    getLeadStats,
    
    // Constantes unificadas (compatibilidade)
    LEAD_STATUS: UNIFIED_LEAD_STATUS,
    LEAD_INTEREST_TYPES: UNIFIED_INTEREST_TYPES,
    BUDGET_RANGES: UNIFIED_BUDGET_RANGES,
    LEAD_STATUS_COLORS,
    
    // Novos: constantes unificadas
    UNIFIED_LEAD_STATUS,
    UNIFIED_INTEREST_TYPES,
    UNIFIED_BUDGET_RANGES,
    UNIFIED_PRIORITIES,
    UNIFIED_LEAD_SOURCES,
    
    // Helpers unificados
    isValidEmail: validateEmail,
    isValidPhone: validatePortuguesePhone,
    normalizePhone: (phone) => phone?.replace(/\s|-/g, '') || '',
    getInterestTypeLabel,
    getBudgetRangeLabel,
    formatCurrency,
    getStatusLabel,
    
    // Estado de conectividade
    isConnected: !!user && !error,
    
    // Informações da estrutura
    structureVersion: '3.0',
    isUnified: true
  };
};

export default useLeads;