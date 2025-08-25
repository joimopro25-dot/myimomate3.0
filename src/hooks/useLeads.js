// src/hooks/useLeads.js
// HOOK DE LEADS MULTI-TENANT DEFINITIVO - MyImoMate 3.0
// =====================================================
// CORREÇÃO: Adicionada função getLeadStats em falta
// Migração completa para arquitetura multi-tenant
// Todas as funcionalidades preservadas com isolamento total
// Data: Agosto 2025 | Versão: 3.0 Multi-Tenant FINAL + FIXED

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

// IMPORTS DO SISTEMA MULTI-TENANT (DEFINITIVO)
import firebaseService, { 
  SUBCOLLECTIONS, 
  createCRUDHelpers,
  useFirebaseService 
} from '../utils/FirebaseService';

// IMPORTS DA ESTRUTURA UNIFICADA (PRESERVADOS)
import {
  UNIFIED_INTEREST_TYPES,
  UNIFIED_BUDGET_RANGES,
  UNIFIED_LEAD_STATUS,
  UNIFIED_PRIORITIES,
  UNIFIED_LEAD_SOURCES,
  getInterestTypeLabel,
  getBudgetRangeLabel,
  getBudgetRangeMiddleValue,
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

// CONFIGURAÇÕES DO HOOK
const LEADS_SUBCOLLECTION = SUBCOLLECTIONS.LEADS;
const CLIENTS_SUBCOLLECTION = SUBCOLLECTIONS.CLIENTS;
const OPPORTUNITIES_SUBCOLLECTION = SUBCOLLECTIONS.OPPORTUNITIES;

// TIPOS E CONSTANTES (PRESERVADOS)
export const CLIENT_TYPES = {
  COMPRADOR: 'comprador',
  VENDEDOR: 'vendedor',
  ARRENDATARIO: 'arrendatario',
  SENHORIO: 'senhorio',
  INVESTIDOR: 'investidor'
};

export const PROPERTY_STATUS = {
  PROCURA: 'procura',
  VENDA: 'venda',
  ARRENDAMENTO: 'arrendamento',
  VENDIDO: 'vendido',
  ARRENDADO: 'arrendado'
};

export const LEAD_STATUS_COLORS = {
  [UNIFIED_LEAD_STATUS.NOVO]: 'bg-blue-100 text-blue-800',
  [UNIFIED_LEAD_STATUS.CONTACTADO]: 'bg-yellow-100 text-yellow-800',
  [UNIFIED_LEAD_STATUS.QUALIFICADO]: 'bg-green-100 text-green-800',
  [UNIFIED_LEAD_STATUS.INTERESSADO]: 'bg-purple-100 text-purple-800',
  [UNIFIED_LEAD_STATUS.CONVERTIDO]: 'bg-emerald-100 text-emerald-800',
  [UNIFIED_LEAD_STATUS.PERDIDO]: 'bg-red-100 text-red-800',
  [UNIFIED_LEAD_STATUS.INATIVO]: 'bg-gray-100 text-gray-800'
};

// SISTEMA DE TEMPERATURA DE LEADS (PRESERVADO)
export const LEAD_TEMPERATURE = {
  QUENTE: 'quente',
  MORNO: 'morno',
  FRIO: 'frio'
};

export const LEAD_TEMPERATURE_COLORS = {
  [LEAD_TEMPERATURE.QUENTE]: 'bg-red-100 text-red-800',
  [LEAD_TEMPERATURE.MORNO]: 'bg-orange-100 text-orange-800',
  [LEAD_TEMPERATURE.FRIO]: 'bg-blue-100 text-blue-800'
};

// CONSTANTES EXPORTADAS PARA COMPATIBILIDADE COM LEADFORM
export const LEAD_INTEREST_TYPES = UNIFIED_INTEREST_TYPES;
export const BUDGET_RANGES = UNIFIED_BUDGET_RANGES;
export { UNIFIED_PRIORITIES, UNIFIED_LEAD_SOURCES };

// FUNÇÕES DE VALIDAÇÃO EXPORTADAS
export const isValidPhone = (phone) => {
  if (!phone) return true; // Campo opcional
  return validatePortuguesePhone(phone);
};

export const isValidEmail = (email) => {
  if (!email) return true; // Campo opcional
  return validateEmail(email);
};

/**
 * HOOK DE LEADS MULTI-TENANT DEFINITIVO
 * 
 * Funcionalidades COMPLETAMENTE PRESERVADAS:
 * - Sistema de conversão Lead→Cliente+Oportunidade
 * - Validações portuguesas completas
 * - Sistema de temperatura e urgência
 * - Detecção de duplicados
 * - Gestão de gestores/equipas
 * - Sistema de follow-up automático
 * - Auditoria e logs completos
 * - Cache e performance otimizada
 * - Filtros e pesquisa avançada
 * - Estatísticas em tempo real
 * - Sistema de notificações
 * - Integração com outros módulos
 * 
 * NOVA ARQUITETURA MULTI-TENANT:
 * - Isolamento TOTAL de dados por utilizador
 * - Performance otimizada com subcoleções
 * - Segurança máxima - zero vazamento de dados
 * - Escalabilidade infinita
 */
export const useLeads = () => {
  const { user } = useAuth();
  
  // INICIALIZAR FIREBASE SERVICE MULTI-TENANT
  const fbService = useFirebaseService(user);
  const leadsAPI = useMemo(() => createCRUDHelpers(LEADS_SUBCOLLECTION), []);
  const clientsAPI = useMemo(() => createCRUDHelpers(CLIENTS_SUBCOLLECTION), []);
  const opportunitiesAPI = useMemo(() => createCRUDHelpers(OPPORTUNITIES_SUBCOLLECTION), []);

  // ESTADOS PRINCIPAIS
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [converting, setConverting] = useState(false);

  // ESTADOS DE CONVERSÃO VIA MODAL
const [conversionModal, setConversionModal] = useState({
  isOpen: false,
  leadData: null,
  step: 'qualification'
});
  
  // ESTADOS DE GESTÃO
  const [filters, setFilters] = useState({
    status: '',
    interestType: '',
    budgetRange: '',
    priority: '',
    temperature: '',
    source: '',
    dateRange: { start: '', end: '' },
    search: ''
  });
  
  // ESTADOS DE CACHE E OTIMIZAÇÃO
  const [stats, setStats] = useState({
    total: 0,
    novos: 0,
    contactados: 0,
    qualificados: 0,
    interessados: 0,
    convertidos: 0,
    perdidos: 0,
    mornos: 0,
    frios: 0,
    overdue: 0,
    highValue: 0
  });
  
  const [duplicateCheck, setDuplicateCheck] = useState(null);
  const fetchTimeoutRef = useRef(null);
  const lastFetchFilters = useRef('');

  // CALCULADORES E UTILS (PRESERVADOS)
  const calculateInitialLeadScore = useCallback((leadData) => {
    let score = 50; // Base score
    
    // Ajustes por tipo de interesse
    if (leadData.interestType === UNIFIED_INTEREST_TYPES.COMPRA_CASA) score += 20;
    if (leadData.interestType === UNIFIED_INTEREST_TYPES.INVESTIMENTO) score += 15;
    
    // Ajustes por orçamento
    if (leadData.budgetRange && leadData.budgetRange.includes('500k')) score += 30;
    if (leadData.budgetRange && leadData.budgetRange.includes('300k')) score += 20;
    
    // Ajustes por fonte
    if (leadData.source === UNIFIED_LEAD_SOURCES?.REFERENCIA) score += 25;
    if (leadData.source === UNIFIED_LEAD_SOURCES?.WEBSITE) score += 10;
    
    // Ajustes por completude de dados
    if (leadData.email) score += 5;
    if (leadData.location) score += 5;
    if (leadData.notes) score += 5;
    
    return Math.min(Math.max(score, 0), 100);
  }, []);

  const calculateUrgencyLevel = useCallback((createdAt, status) => {
    if (!createdAt) return LEAD_TEMPERATURE.MORNO;
    
    const now = new Date();
    const leadDate = createdAt instanceof Date ? createdAt : new Date(createdAt);
    const daysDiff = Math.floor((now - leadDate) / (1000 * 60 * 60 * 24));
    
    // Lead convertido ou perdido não tem temperatura
    if ([UNIFIED_LEAD_STATUS.CONVERTIDO, UNIFIED_LEAD_STATUS.PERDIDO].includes(status)) {
      return null;
    }
    
    // Lead novo (menos de 3 dias) = QUENTE
    if (daysDiff <= 3) return LEAD_TEMPERATURE.QUENTE;
    
    // Lead com 4-14 dias = MORNO  
    if (daysDiff <= 14) return LEAD_TEMPERATURE.MORNO;
    
    // Lead com mais de 14 dias = FRIO
    return LEAD_TEMPERATURE.FRIO;
  }, []);

  const calculateNextFollowUp = useCallback((priority) => {
    const now = new Date();
    const daysToAdd = 
      priority === UNIFIED_PRIORITIES?.ALTA ? 1 : 
      priority === UNIFIED_PRIORITIES?.NORMAL ? 3 : 7;
    
    const followUpDate = new Date(now);
    followUpDate.setDate(now.getDate() + daysToAdd);
    return followUpDate;
  }, []);

  // MIGRAÇÃO E ENRIQUECIMENTO DE DADOS (PRESERVADO)
  const migrateLead = useCallback((rawData) => {
    if (rawData.structureVersion === '3.0') return rawData;

    return {
      ...rawData,
      structureVersion: '3.0',
      isActive: rawData.isActive !== false,
      leadTemperature: calculateUrgencyLevel(rawData.createdAt, rawData.status),
      statusColor: LEAD_STATUS_COLORS[rawData.status] || LEAD_STATUS_COLORS[UNIFIED_LEAD_STATUS.NOVO],
      canConvert: ![UNIFIED_LEAD_STATUS.CONVERTIDO, UNIFIED_LEAD_STATUS.PERDIDO].includes(rawData.status),
      isConverted: rawData.status === UNIFIED_LEAD_STATUS.CONVERTIDO || rawData.isConverted === true,
      budgetRangeValue: getBudgetRangeMiddleValue(rawData.budgetRange) || 0,
      interestTypeLabel: getInterestTypeLabel(rawData.interestType),
      budgetRangeLabel: getBudgetRangeLabel(rawData.budgetRange)
    };
  }, [calculateUrgencyLevel]);

  const enrichLeadData = useCallback((migratedData) => {
    return {
      ...migratedData,
      
      // Métricas temporais
      daysOld: migratedData.createdAt ? 
        Math.floor((new Date() - new Date(migratedData.createdAt)) / (1000 * 60 * 60 * 24)) : 0,
      
      // Score e follow-up
      leadScore: migratedData.leadScore || calculateInitialLeadScore(migratedData),
      nextFollowUpDate: migratedData.nextFollowUpDate || calculateNextFollowUp(migratedData.priority || UNIFIED_PRIORITIES?.NORMAL),
      
      // Metadados úteis
      isOverdue: migratedData.nextFollowUpDate ? new Date(migratedData.nextFollowUpDate) < new Date() : false,
      formattedBudget: getBudgetRangeMiddleValue(migratedData.budgetRange) ? 
        formatCurrency(getBudgetRangeMiddleValue(migratedData.budgetRange)) : 'N/A'
    };
  }, [calculateInitialLeadScore, calculateNextFollowUp]);

  // CÁLCULO DE ESTATÍSTICAS (PRESERVADO)
  const calculateStats = useCallback((leadsData) => {
    const newStats = {
      total: leadsData.length,
      novos: leadsData.filter(l => l.status === UNIFIED_LEAD_STATUS.NOVO).length,
      contactados: leadsData.filter(l => l.status === UNIFIED_LEAD_STATUS.CONTACTADO).length,
      qualificados: leadsData.filter(l => l.status === UNIFIED_LEAD_STATUS.QUALIFICADO).length,
      interessados: leadsData.filter(l => l.status === UNIFIED_LEAD_STATUS.INTERESSADO).length,
      convertidos: leadsData.filter(l => l.status === UNIFIED_LEAD_STATUS.CONVERTIDO).length,
      perdidos: leadsData.filter(l => l.status === UNIFIED_LEAD_STATUS.PERDIDO).length,
      
      // Sistema de temperatura
      mornos: leadsData.filter(l => l.leadTemperature === LEAD_TEMPERATURE.MORNO).length,
      frios: leadsData.filter(l => l.leadTemperature === LEAD_TEMPERATURE.FRIO).length,
      
      // Métricas adicionais
      overdue: leadsData.filter(l => l.isOverdue).length,
      highValue: leadsData.filter(l => l.budgetRangeValue > 300000).length
    };
    
    setStats(newStats);
    return newStats;
  }, []);

  // VERIFICAÇÃO DE DUPLICADOS (CORRIGIDA COM VALIDAÇÃO DE DADOS)
  const checkForDuplicates = useCallback(async (leadData) => {
    if (!user || !leadData) return { hasDuplicates: false };

    // Validar dados de entrada
    if (!leadData.phone && !leadData.email) {
      return { hasDuplicates: false };
    }

    try {
      console.log('Verificando duplicados...');
      
      // Verificar por telefone (se fornecido)
      if (leadData.phone && leadData.phone.trim()) {
        const phoneResults = await leadsAPI.read({
          whereClause: [['phone', '==', leadData.phone.trim()]],
          useCache: false
        });

        if (phoneResults.success && phoneResults.data.length > 0) {
          return {
            hasDuplicates: true,
            duplicateType: 'phone',
            existingLead: phoneResults.data[0],
            message: `Já existe um lead com o telefone ${leadData.phone}`
          };
        }
      }

      // Verificar por email (se fornecido)
      if (leadData.email && leadData.email.trim()) {
        const emailResults = await leadsAPI.read({
          whereClause: [['email', '==', leadData.email.trim()]],
          useCache: false
        });

        if (emailResults.success && emailResults.data.length > 0) {
          return {
            hasDuplicates: true,
            duplicateType: 'email',
            existingLead: emailResults.data[0],
            message: `Já existe um lead com o email ${leadData.email}`
          };
        }
      }

      return { hasDuplicates: false };

    } catch (error) {
      console.error('Erro ao verificar duplicados:', error);
      return { hasDuplicates: false, error: error.message };
    }
  }, [user, leadsAPI]);

  // BUSCAR LEADS (MULTI-TENANT COM FILTROS)
  const fetchLeads = useCallback(async (forceRefresh = false) => {
    if (!user) return;
    
    if (!forceRefresh && leads.length > 0) {
      console.log('Leads já carregados, pulando busca');
      return;
    }

    const currentFiltersString = JSON.stringify(filters);
    if (!forceRefresh && lastFetchFilters.current === currentFiltersString) {
      console.log('Filtros inalterados, pulando busca');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Construir whereClause baseado nos filtros
      let whereClause = [];
      
      if (filters.status && filters.status !== 'todos') {
        whereClause.push(['status', '==', filters.status]);
      }
      
      if (filters.interestType) {
        whereClause.push(['interestType', '==', filters.interestType]);
      }
      
      if (filters.budgetRange) {
        whereClause.push(['budgetRange', '==', filters.budgetRange]);
      }

      if (filters.priority) {
        whereClause.push(['priority', '==', filters.priority]);
      }

      if (filters.source) {
        whereClause.push(['source', '==', filters.source]);
      }

      // Buscar leads no Firebase
      const result = await leadsAPI.read({
        whereClause,
        orderByClause: [['createdAt', 'desc']],
        useCache: !forceRefresh
      });

      if (result.success) {
        let leadsData = result.data;

        // Migrar e enriquecer dados
        leadsData = leadsData.map(lead => {
          const migrated = migrateLead(lead);
          return enrichLeadData(migrated);
        });

        // Aplicar filtros do lado do cliente
        if (filters.temperature) {
          leadsData = leadsData.filter(lead => lead.leadTemperature === filters.temperature);
        }

        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          leadsData = leadsData.filter(lead => 
            lead.name.toLowerCase().includes(searchTerm) ||
            lead.phone.includes(searchTerm) ||
            (lead.email && lead.email.toLowerCase().includes(searchTerm)) ||
            (lead.location && lead.location.toLowerCase().includes(searchTerm))
          );
        }
        
        if (filters.dateRange.start && filters.dateRange.end) {
          const startDate = new Date(filters.dateRange.start);
          const endDate = new Date(filters.dateRange.end);
          leadsData = leadsData.filter(lead => {
            const leadDate = new Date(lead.createdAt);
            return leadDate >= startDate && leadDate <= endDate;
          });
        }
        
        // ORDENAÇÃO FINAL
        leadsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setLeads(leadsData);
        calculateStats(leadsData);
        lastFetchFilters.current = currentFiltersString;
        
        console.log(`${leadsData.length} leads carregados com sucesso`);
        
      } else {
        throw new Error(result.error || 'Falha ao carregar leads');
      }

    } catch (err) {
      console.error('Erro ao buscar leads:', err);
      setError(err.message);
      setLeads([]);
      setStats({ total: 0, novos: 0, contactados: 0, qualificados: 0, interessados: 0, convertidos: 0, perdidos: 0, mornos: 0, frios: 0, overdue: 0, highValue: 0 });
    } finally {
      setLoading(false);
    }
  }, [user, filters, leadsAPI, enrichLeadData, calculateStats, leads.length, migrateLead]);

  // CRIAR LEAD (MULTI-TENANT)
  const createLead = useCallback(async (leadData) => {
    if (!user) return { success: false, error: 'Utilizador não autenticado' };

    setCreating(true);
    setError(null);
    setDuplicateCheck(null);

    try {
      console.log('Criando lead...');

      // VALIDAÇÃO COMPLETA  
      const validation = validateLead(leadData);
      if (!validation.isValid) {
        let errorMessage;
        if (typeof validation.errors === 'object' && validation.errors !== null) {
          errorMessage = Object.values(validation.errors).join(', ');
        } else {
          errorMessage = 'Dados de lead inválidos';
        }
        throw new Error(`Dados inválidos: ${errorMessage}`);
      }

      // VERIFICAÇÃO DE DUPLICADOS
      const duplicateResult = await checkForDuplicates(leadData);
      if (duplicateResult.hasDuplicates) {
        setDuplicateCheck(duplicateResult);
        return { 
          success: false, 
          error: duplicateResult.message,
          duplicateInfo: duplicateResult
        };
      }

      // PREPARAR DADOS PADRONIZADOS
      const leadToCreate = applyCoreStructure ? applyCoreStructure(leadData, LEAD_TEMPLATE) : {
        ...leadData,
        status: UNIFIED_LEAD_STATUS.NOVO,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };
      
      // Enriquecer com campos calculados
      leadToCreate.leadScore = calculateInitialLeadScore(leadData);
      leadToCreate.leadTemperature = LEAD_TEMPERATURE.QUENTE; // Novo lead = sempre quente
      leadToCreate.nextFollowUpDate = calculateNextFollowUp(leadData.priority || UNIFIED_PRIORITIES?.NORMAL);
      leadToCreate.statusColor = LEAD_STATUS_COLORS[leadToCreate.status];
      leadToCreate.canConvert = true;
      leadToCreate.budgetRangeValue = getBudgetRangeMiddleValue(leadToCreate.budgetRange) || 0;
      
      // Criar no Firebase
      const result = await leadsAPI.create(leadToCreate);
      
      if (result.success) {
        // Atualizar lista local
        const newLead = enrichLeadData({
          id: result.id,
          ...leadToCreate
        });
        
        setLeads(prev => [newLead, ...prev]);
        calculateStats([newLead, ...leads]);
        
        console.log('Lead criado com sucesso:', result.id);
        return { 
          success: true, 
          id: result.id,
          data: newLead,
          message: 'Lead criado com sucesso!'
        };
      } else {
        throw new Error(result.error);
      }

    } catch (err) {
      console.error('Erro ao criar lead:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setCreating(false);
    }
  }, [user, leadsAPI, checkForDuplicates, calculateInitialLeadScore, calculateNextFollowUp, enrichLeadData, leads, calculateStats]);

  // ATUALIZAR LEAD
  const updateLead = useCallback(async (leadId, updates) => {
    if (!user) return { success: false, error: 'Utilizador não autenticado' };

    try {
      const result = await leadsAPI.update(leadId, updates);
      
      if (result.success) {
        setLeads(prev => 
          prev.map(lead => 
            lead.id === leadId 
              ? enrichLeadData({ ...lead, ...updates })
              : lead
          )
        );
        
        const updatedLeads = leads.map(lead => 
          lead.id === leadId ? { ...lead, ...updates } : lead
        );
        calculateStats(updatedLeads);
        
        console.log('Lead atualizado:', leadId);
        return { success: true, message: 'Lead atualizado com sucesso' };
      } else {
        throw new Error(result.error);
      }

    } catch (err) {
      console.error('Erro ao atualizar lead:', err);
      return { success: false, error: err.message };
    }
  }, [user, leadsAPI, leads, enrichLeadData, calculateStats]);

  // ELIMINAR LEAD
  const deleteLead = useCallback(async (leadId, hardDelete = false) => {
    if (!user) return { success: false, error: 'Utilizador não autenticado' };

    try {
      const result = await leadsAPI.delete(leadId, hardDelete);
      
      if (result.success) {
        if (hardDelete) {
          setLeads(prev => prev.filter(lead => lead.id !== leadId));
        } else {
          setLeads(prev => 
            prev.map(lead => 
              lead.id === leadId 
                ? { ...lead, isActive: false } 
                : lead
            )
          );
        }
        
        // Recalcular stats
        const updatedLeads = hardDelete ? 
          leads.filter(l => l.id !== leadId) : 
          leads.map(l => l.id === leadId ? { ...l, isActive: false } : l);
        calculateStats(updatedLeads);
        
        console.log(`Lead ${hardDelete ? 'eliminado' : 'desativado'}: ${leadId}`);
        return { 
          success: true, 
          message: `Lead ${hardDelete ? 'eliminado' : 'desativado'} com sucesso` 
        };
      } else {
        throw new Error(result.error);
      }

    } catch (err) {
      console.error('Erro ao eliminar lead:', err);
      return { success: false, error: err.message };
    }
  }, [user, leadsAPI, leads, calculateStats]);

  // CONVERSÃO LEAD→CLIENTE (MULTI-TENANT E PRESERVADA)
  const convertLeadToClient = useCallback(async (leadId, additionalData = {}) => {
    if (!user) return { success: false, error: 'Utilizador não autenticado' };

    setConverting(true);
    setError(null);

    try {
      console.log('Iniciando conversão de lead:', leadId);
      
      // Buscar dados do lead
      const leadResult = await leadsAPI.readOne(leadId);
      
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

      // PREPARAR DADOS DO CLIENTE
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
        
        // Origem e conversão
        originalLeadId: leadId,
        convertedFromLead: true,
        leadConvertedAt: serverTimestamp(),
        
        // Dados adicionais
        ...additionalData
      };

      // Criar cliente
      const clientResult = await clientsAPI.create(clientData);
      
      if (!clientResult.success) {
        throw new Error('Erro ao criar cliente: ' + clientResult.error);
      }

      // Atualizar lead como convertido
      await leadsAPI.update(leadId, {
        status: UNIFIED_LEAD_STATUS.CONVERTIDO,
        isConverted: true,
        convertedAt: serverTimestamp(),
        clientId: clientResult.id
      });

      // Atualizar lista local de leads
      setLeads(prev =>
        prev.map(lead =>
          lead.id === leadId 
            ? { 
                ...lead, 
                status: UNIFIED_LEAD_STATUS.CONVERTIDO,
                isConverted: true,
                statusColor: LEAD_STATUS_COLORS[UNIFIED_LEAD_STATUS.CONVERTIDO],
                canConvert: false
              }
            : lead
        )
      );

      console.log('Conversão de lead concluída com sucesso');
      
      return {
        success: true,
        clientId: clientResult.id,
        message: 'Lead convertido com sucesso!',
        data: {
          client: clientResult.data,
          lead: leadData
        }
      };

    } catch (err) {
      console.error('Erro na conversão:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setConverting(false);
    }
  }, [user, leadsAPI, clientsAPI]);

  // APLICAR FILTROS
  const applyFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // LIMPAR FILTROS
  const clearFilters = useCallback(() => {
    setFilters({
      status: '',
      interestType: '',
      budgetRange: '',
      priority: '',
      temperature: '',
      source: '',
      dateRange: { start: '', end: '' },
      search: ''
    });
  }, []);

  // FUNÇÃO GETLEADSTATS (ADICIONADA - ERA ESTA QUE FALTAVA)
  const getLeadStats = useCallback(() => {
    return stats;
  }, [stats]);

  // EFEITO PRINCIPAL - CARREGAMENTO
  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user, filters, fetchLeads]);

  // CLEANUP
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // FUNÇÕES DE CONVERSÃO VIA MODAL
const initiateLeadConversion = useCallback((leadData) => {
  if (!leadData) {
    console.error('Dados da lead não fornecidos para conversão');
    return { success: false, error: 'Dados da lead não fornecidos' };
  }

  console.log('Iniciando conversão via modal para lead:', leadData.id);
  
  setConversionModal({
    isOpen: true,
    leadData: leadData,
    step: 'qualification'
  });

  return { 
    success: true, 
    modalOpened: true,
    message: `Modal de conversão aberto para ${leadData.name}`
  };
}, []);

const processLeadConversion = useCallback(async (conversionData) => {
  if (!user) {
    return { success: false, error: 'Utilizador não autenticado' };
  }

  console.log('🔄 NOVA VERSÃO - Processando conversão do modal:', conversionData);
  
  setConverting(true);
  setError(null);

  try {
    const { leadId, leadData, clientData, createOpportunity = true, createSpouse = false } = conversionData;

    if (!leadId || !clientData) {
      throw new Error('Dados de conversão incompletos');
    }

    console.log('📋 Dados recebidos para conversão:', {
      leadId,
      leadName: leadData.name,
      clientDataKeys: Object.keys(clientData),
      createOpportunity,
      createSpouse
    });

    let mainClientResult = null;
    let spouseClientResult = null;
    let opportunityResult = null;

    // =================================================================
    // 1. CRIAR CLIENTE PRINCIPAL COM DADOS COMPLETOS
    // =================================================================
    console.log('👤 Criando cliente principal...');
    
    const mainClientData = {
      // DADOS BÁSICOS DA LEAD (PRESERVADOS)
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      
      // DADOS DO FORMULÁRIO DE CONVERSÃO (NOVOS)
      // Dados pessoais portugueses
      numeroCC: clientData.numeroCC || '',
      numeroFiscal: clientData.numeroFiscal || clientData.nif || '',
      dataNascimento: clientData.dataNascimento || '',
      estadoCivil: clientData.estadoCivil || 'solteiro',
      nacionalidade: clientData.nacionalidade || 'portuguesa',
      
      // Residência completa
      residencia: {
        rua: clientData.residencia?.rua || clientData.morada || '',
        numero: clientData.residencia?.numero || '',
        andar: clientData.residencia?.andar || '',
        codigoPostal: clientData.residencia?.codigoPostal || clientData.codigoPostal || '',
        localidade: clientData.residencia?.localidade || clientData.cidade || '',
        concelho: clientData.residencia?.concelho || '',
        distrito: clientData.residencia?.distrito || ''
      },
      
      // Naturalidade
      naturalidade: {
        freguesia: clientData.naturalidade?.freguesia || '',
        concelho: clientData.naturalidade?.concelho || '',
        distrito: clientData.naturalidade?.distrito || ''
      },
      
      // Informações profissionais e financeiras
      profissao: clientData.profissao || clientData.profession || '',
      empresa: clientData.empresa || clientData.company || '',
      situacaoLaboral: clientData.situacaoLaboral || clientData.employmentStatus || '',
      rendimentoMensal: clientData.rendimentoMensal || clientData.monthlyIncome || '',
      rendimentoAnual: clientData.rendimentoAnual || clientData.annualIncome || '',
      
      // Informações bancárias
      bancoRelacionamento: clientData.bancoRelacionamento || clientData.bankName || '',
      temPreAprovacao: clientData.temPreAprovacao || clientData.hasPreApproval || false,
      valorPreAprovacao: clientData.valorPreAprovacao || clientData.preApprovalAmount || '',
      
      // Dados de contacto expandidos
      telefoneAlternativo: clientData.telefoneAlternativo || '',
      emailAlternativo: clientData.emailAlternativo || '',
      preferenciaContacto: clientData.preferenciaContacto || 'telefone',
      melhorHorarioContacto: clientData.melhorHorarioContacto || 'qualquer_altura',
      
      // Preferências e motivações
      tipoImovelProcurado: Array.isArray(clientData.tipoImovelProcurado) ? 
        clientData.tipoImovelProcurado : [clientData.tipoImovelProcurado].filter(Boolean),
      localizacaoPreferida: clientData.localizacaoPreferida || leadData.location || '',
      caracteristicasEspecificas: clientData.caracteristicasEspecificas || '',
      motivoTransacao: clientData.motivoTransacao || 'habitacao_propria',
      urgencia: clientData.urgencia || leadData.urgency || 'normal',
      prazoDecisao: clientData.prazoDecisao || '1_3_meses',
      
      // Orçamento detalhado
      orcamentoMinimo: clientData.orcamentoMinimo || '',
      orcamentoMaximo: clientData.orcamentoMaximo || leadData.budget || '',
      tipoFinanciamento: clientData.tipoFinanciamento || 'credito_habitacao',
      valorEntrada: clientData.valorEntrada || clientData.entrada || '',
      percentagemEntrada: clientData.percentagemEntrada || '',
      
      // Documentação e anexos
      documentosDisponiveis: clientData.documentosDisponiveis || [],
      anexos: clientData.anexos || [],
      
      // Observações e notas
      observacoes: clientData.observacoes || clientData.notes || '',
      observacoesConsultor: clientData.observacoesConsultor || `Cliente convertido automaticamente do lead em ${new Date().toLocaleDateString('pt-PT')}.\n\nDados originais da lead:\n- Origem: ${leadData.source || 'N/A'}\n- Interesse: ${leadData.interestType || 'N/A'}\n- Data criação: ${leadData.createdAt ? new Date(leadData.createdAt).toLocaleDateString('pt-PT') : 'N/A'}`,
      notasInternas: clientData.notasInternas || '',
      
      // Classificação e segmentação
      prioridade: clientData.prioridadeCliente || leadData.priority || 'normal',
      segmento: clientData.segmento || 'residencial',
      fonte: clientData.fonte || leadData.source || 'conversao_lead',
      consultor: clientData.consultor || user.displayName || user.email || '',
      
      // Rastreamento e auditoria
      originalLeadId: leadId,
      convertedFromLead: true,
      leadConvertedAt: serverTimestamp(),
      conversaoAprovada: true,
      dataConversao: new Date().toISOString(),
      utilizadorConversao: user.uid,
      
      // Status e atividade
      status: 'ativo',
      isActive: true,
      clienteSince: serverTimestamp(),
      
      // Metadados
      createdAt: serverTimestamp(),
      createdBy: user.uid,
      updatedAt: serverTimestamp(),
      lastModifiedBy: user.uid,
      version: '3.1_conversion_fix'
    };

    console.log('📝 Dados do cliente preparados:', {
      name: mainClientData.name,
      numeroCC: mainClientData.numeroCC ? 'Preenchido' : 'Vazio',
      numeroFiscal: mainClientData.numeroFiscal ? 'Preenchido' : 'Vazio',
      orcamentoMaximo: mainClientData.orcamentoMaximo || 'Não definido',
      tipoImovelProcurado: mainClientData.tipoImovelProcurado
    });

    mainClientResult = await clientsAPI.create(mainClientData);
    
    if (!mainClientResult.success) {
      throw new Error('Erro ao criar cliente principal: ' + mainClientResult.error);
    }

    console.log('✅ Cliente principal criado:', mainClientResult.id);

    // =================================================================
    // 2. CRIAR CÔNJUGE (SE SOLICITADO)
    // =================================================================
    if (createSpouse && clientData.conjuge && clientData.temConjuge) {
      console.log('👫 Criando cônjuge...');
      
      const spouseData = {
        // Dados básicos do cônjuge
        name: clientData.conjuge.nome || '',
        email: clientData.conjuge.email || '',
        phone: clientData.conjuge.telefone || '',
        
        // Dados pessoais do cônjuge
        numeroCC: clientData.conjuge.numeroCC || '',
        numeroFiscal: clientData.conjuge.numeroFiscal || '',
        dataNascimento: clientData.conjuge.dataNascimento || '',
        estadoCivil: clientData.estadoCivil || 'casado',
        nacionalidade: clientData.conjuge.nacionalidade || 'portuguesa',
        
        // Herdar dados de residência do cliente principal
        residencia: mainClientData.residencia,
        
        // Dados específicos do cônjuge
        profissao: clientData.conjuge.profissao || '',
        empresa: clientData.conjuge.empresa || '',
        rendimentoMensal: clientData.conjuge.rendimentoMensal || '',
        
        // Relação familiar
        clientePrincipalId: mainClientResult.id,
        tipoRelacao: 'conjuge',
        comunhaoBens: clientData.comunhaoBens || 'geral',
        
        // Rastreamento
        originalLeadId: leadId,
        convertedFromLead: true,
        leadConvertedAt: serverTimestamp(),
        isSpouse: true,
        
        // Metadados
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        updatedAt: serverTimestamp(),
        isActive: true
      };

      spouseClientResult = await clientsAPI.create(spouseData);
      
      if (!spouseClientResult.success) {
        console.warn('⚠️ Erro ao criar cônjuge:', spouseClientResult.error);
        // Não falhar a conversão por causa do cônjuge
      } else {
        console.log('✅ Cônjuge criado:', spouseClientResult.id);
      }
    }

    // =================================================================
    // 3. CRIAR OPORTUNIDADE COM DADOS COMPLETOS
    // =================================================================
    if (createOpportunity) {
      console.log('🏢 Criando oportunidade com dados completos...');
      
      const opportunityData = {
        // REFERÊNCIAS E IDENTIFICAÇÃO
        clientId: mainClientResult.id,
        clientName: leadData.name,
        leadId: leadId,
        originalLeadId: leadId,
        spouseClientId: spouseClientResult?.id || null,
        
        // DADOS BÁSICOS DA OPORTUNIDADE
        title: `${leadData.name} - ${clientData.tipoImovelProcurado?.[0] || 'Imóvel'} em ${clientData.localizacaoPreferida || leadData.location || 'Localização a definir'}`,
        description: `Oportunidade criada automaticamente a partir da conversão do lead "${leadData.name}".
        
Detalhes do Cliente:
• Tipo de interesse: ${leadData.interestType || 'N/A'}
• Orçamento: ${clientData.orcamentoMaximo ? `€${clientData.orcamentoMaximo}` : 'A definir'}
• Localização pretendida: ${clientData.localizacaoPreferida || leadData.location || 'A definir'}
• Prazo de decisão: ${clientData.prazoDecisao || 'A definir'}
• Urgência: ${clientData.urgencia || 'Normal'}`,
        
        // CLASSIFICAÇÃO E PIPELINE
        status: 'ativo',
        stage: 'qualificacao',
        pipeline: 'vendas_padrao',
        priority: clientData.urgencia || leadData.priority || 'normal',
        
        // VALORES E ESTIMATIVAS
        estimatedValue: parseFloat(clientData.orcamentoMaximo) || parseFloat(leadData.budget) || 0,
        minValue: parseFloat(clientData.orcamentoMinimo) || 0,
        maxValue: parseFloat(clientData.orcamentoMaximo) || parseFloat(leadData.budget) || 0,
        currency: 'EUR',
        
        // PROBABILIDADE BASEADA NA QUALIFICAÇÃO
        probability: clientData.numeroFiscal && clientData.numeroCC ? 50 : // Cliente qualificado
                     clientData.temPreAprovacao ? 70 : // Com pré-aprovação
                     25, // Probabilidade base
        
        // DATAS IMPORTANTES
        expectedCloseDate: clientData.prazoDecisao === 'imediato' ? 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : // +30 dias
          clientData.prazoDecisao === '1_3_meses' ?
          new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) : // +60 dias
          new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // +120 dias
        
        nextActionDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 dias
        lastContactDate: new Date(),
        
        // DETALHES DO IMÓVEL PROCURADO
        propertyRequirements: {
          propertyTypes: clientData.tipoImovelProcurado || [leadData.propertyType || 'apartamento'],
          preferredLocations: clientData.localizacaoPreferida ? 
            [clientData.localizacaoPreferida] : 
            leadData.location ? [leadData.location] : [],
          budgetMin: parseFloat(clientData.orcamentoMinimo) || 0,
          budgetMax: parseFloat(clientData.orcamentoMaximo) || 0,
          specificFeatures: clientData.caracteristicasEspecificas || '',
          urgencyLevel: clientData.urgencia || 'normal',
          decisionTimeframe: clientData.prazoDecisao || '1_3_meses'
        },
        
        // INFORMAÇÕES FINANCEIRAS
        financing: {
          type: clientData.tipoFinanciamento || 'credito_habitacao',
          hasPreApproval: clientData.temPreAprovacao || false,
          preApprovalAmount: parseFloat(clientData.valorPreAprovacao) || 0,
          downPayment: parseFloat(clientData.valorEntrada) || 0,
          monthlyIncome: parseFloat(clientData.rendimentoMensal) || 0,
          bankRelationship: clientData.bancoRelacionamento || ''
        },
        
        // ORIGEM E RASTREAMENTO
        source: leadData.source || 'lead_conversion',
        sourceDetails: `Convertido do lead ID: ${leadId}`,
        originalSource: leadData.source || 'unknown',
        conversionDate: new Date().toISOString(),
        
        // EQUIPA E RESPONSABILIDADE
        assignedTo: user.uid,
        assignedToName: user.displayName || user.email || 'Sistema',
        team: 'vendas',
        consultant: user.displayName || user.email || '',
        
        // ATIVIDADES E PRÓXIMOS PASSOS
        nextActions: [
          'Agendar reunião inicial com cliente',
          'Validar documentação financeira',
          'Apresentar portfólio de imóveis compatíveis',
          'Definir critérios específicos de pesquisa',
          clientData.temPreAprovacao ? 'Verificar validade da pré-aprovação' : 'Orientar processo de pré-aprovação'
        ].filter(Boolean),
        
        // ATIVIDADES INICIAIS
        activities: [
          {
            id: Date.now(),
            type: 'conversao',
            title: 'Lead convertido para oportunidade',
            description: `Cliente ${leadData.name} qualificado com sucesso e oportunidade criada automaticamente.`,
            date: new Date().toISOString(),
            createdBy: user.uid,
            outcome: 'Cliente qualificado e interessado'
          }
        ],
        
        // OBSERVAÇÕES E NOTAS
        notes: clientData.observacoes || '',
        internalNotes: `${clientData.observacoesConsultor || ''}

DADOS DA CONVERSÃO:
- Lead Original: ${leadData.name} (${leadId})
- Data Conversão: ${new Date().toLocaleDateString('pt-PT')}
- Utilizador: ${user.displayName || user.email}
- Interesse Original: ${leadData.interestType || 'N/A'}
- Origem Lead: ${leadData.source || 'N/A'}
- Cliente Qualificado: ${clientData.numeroCC ? 'Sim' : 'Não'}
- Pré-aprovação: ${clientData.temPreAprovacao ? 'Sim' : 'Não'}
- Cônjuge: ${createSpouse ? 'Criado' : 'Não aplicável'}`,
        
        // TAGS E CATEGORIZAÇÃO
        tags: [
          'lead_convertida',
          clientData.urgencia || 'normal',
          clientData.tipoFinanciamento || 'credito',
          clientData.temPreAprovacao ? 'pre_aprovado' : 'sem_pre_aprovacao',
          ...(clientData.tipoImovelProcurado || [])
        ].filter(Boolean),
        
        // METADADOS E AUDITORIA
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid,
        isActive: true,
        version: '3.1_conversion_fix'
      };

      console.log('📈 Dados da oportunidade preparados:', {
        title: opportunityData.title,
        estimatedValue: opportunityData.estimatedValue,
        probability: opportunityData.probability,
        stage: opportunityData.stage,
        nextActions: opportunityData.nextActions.length
      });

      opportunityResult = await opportunitiesAPI.create(opportunityData);
      
      if (!opportunityResult.success) {
        console.warn('⚠️ Erro ao criar oportunidade:', opportunityResult.error);
        // Não falhar a conversão por causa da oportunidade
      } else {
        console.log('✅ Oportunidade criada:', opportunityResult.id);
      }
    }

    // =================================================================
    // 4. ATUALIZAR LEAD COMO CONVERTIDA
    // =================================================================
    console.log('🔄 Atualizando status da lead...');
    
    await leadsAPI.update(leadId, {
      status: UNIFIED_LEAD_STATUS.CONVERTIDO,
      isConverted: true,
      convertedAt: serverTimestamp(),
      
      // IDs dos registos criados
      clientId: mainClientResult.id,
      spouseClientId: spouseClientResult?.id || null,
      opportunityId: opportunityResult?.id || null,
      
      // Detalhes da conversão
      conversionDetails: {
        mainClientCreated: !!mainClientResult.success,
        spouseClientCreated: !!spouseClientResult?.success,
        opportunityCreated: !!opportunityResult?.success,
        conversionDate: new Date().toISOString(),
        convertedBy: user.uid,
        dataQuality: {
          hasCC: !!clientData.numeroCC,
          hasNIF: !!clientData.numeroFiscal,
          hasPreApproval: !!clientData.temPreAprovacao,
          hasSpouse: createSpouse
        }
      },
      
      // Metadados
      updatedAt: serverTimestamp(),
      lastModifiedBy: user.uid
    });

    // =================================================================
    // 5. ATUALIZAR LISTA LOCAL
    // =================================================================
    setLeads(prev =>
      prev.map(lead =>
        lead.id === leadId 
          ? { 
              ...lead, 
              status: UNIFIED_LEAD_STATUS.CONVERTIDO,
              isConverted: true,
              statusColor: LEAD_STATUS_COLORS[UNIFIED_LEAD_STATUS.CONVERTIDO],
              canConvert: false,
              clientId: mainClientResult.id,
              opportunityId: opportunityResult?.id || null
            }
          : lead
      )
    );

    // =================================================================
    // 6. RESULTADO FINAL
    // =================================================================
    const conversionSummary = {
      success: true,
      leadId: leadId,
      mainClient: {
        id: mainClientResult.id,
        name: leadData.name,
        created: true
      },
      spouseClient: spouseClientResult ? {
        id: spouseClientResult.id,
        created: true
      } : null,
      opportunity: opportunityResult ? {
        id: opportunityResult.id,
        title: opportunityData.title,
        value: opportunityData.estimatedValue,
        created: true
      } : null,
      message: `Conversão completa! ${leadData.name} convertido para cliente${spouseClientResult ? ' + cônjuge' : ''}${opportunityResult ? ' + oportunidade' : ''}.`
    };

    console.log('🎉 CONVERSÃO COMPLETA:', conversionSummary);

    return conversionSummary;

  } catch (error) {
    console.error('❌ ERRO NA CONVERSÃO:', error);
    setError(error.message);
    
    return {
      success: false,
      error: error.message
    };
    
  } finally {
    setConverting(false);
  }
}, [user, leadsAPI, clientsAPI, opportunitiesAPI, UNIFIED_LEAD_STATUS, LEAD_STATUS_COLORS]);

const closeConversionModal = useCallback(() => {
  setConversionModal({
    isOpen: false,
    leadData: null,
    step: 'qualification'
  });
}, []);

const handleDebugLog = useCallback((logData) => {
  console.log('DEBUG LOG:', logData);
}, []);

  // INTERFACE PÚBLICA DO HOOK COMPLETA
  return {
    // DADOS
    leads,
    stats,
    filters,
    duplicateCheck,
    
    // ESTADOS
    loading,
    error,
    creating,
    converting,
    
    // AÇÕES PRINCIPAIS
    fetchLeads,
    createLead,
    updateLead,
    deleteLead,
    convertLeadToClient,
    
    // GESTÃO DE FILTROS
    applyFilters,
    clearFilters,
    
    // UTILS E HELPERS
    refreshLeads: () => fetchLeads(true),
    clearError: () => setError(null),
    clearDuplicateCheck: () => setDuplicateCheck(null),
    checkForDuplicates,
    
    // FUNÇÃO EM FALTA - ADICIONADA AGORA
    getLeadStats,
    
    // CALCULADORES (EXPOSTOS PARA OUTROS COMPONENTES)
    calculateInitialLeadScore,
    calculateUrgencyLevel,
    calculateNextFollowUp,
    
    // CONSTANTES EXPORTADAS
    LEAD_INTEREST_TYPES,
    BUDGET_RANGES,
    LEAD_STATUS_COLORS,
    LEAD_TEMPERATURE_COLORS,
    CLIENT_TYPES,
    PROPERTY_STATUS,
    
    // ADICIONAR ESTAS LINHAS:
    conversionModal,
    initiateLeadConversion,
    processLeadConversion,
    closeConversionModal,
    handleDebugLog,

    // FUNÇÕES DE VALIDAÇÃO
    isValidPhone,
    isValidEmail
  };
};

export default useLeads;