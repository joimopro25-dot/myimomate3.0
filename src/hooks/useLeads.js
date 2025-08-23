// src/hooks/useLeads.js - VERSÃO CORRIGIDA COMPLETA
// Substitua todo o conteúdo do arquivo por este código:

import { validateLeadConversionRelaxed } from '../utils/ConversionValidation_Relaxed';
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

import { validateLeadConversion } from '../utils/ConversionValidation';
import { initializeDebugger, debugLog, debugError } from '../utils/ConversionDebug';

const LEADS_COLLECTION = 'leads';
const CLIENTS_COLLECTION = 'clients';
const OPPORTUNITIES_COLLECTION = 'opportunities';
const FETCH_LIMIT = 50;

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
  [UNIFIED_LEAD_STATUS.NOVO]: 'bg-blue-100 text-blue-800',
  [UNIFIED_LEAD_STATUS.CONTACTADO]: 'bg-yellow-100 text-yellow-800',
  [UNIFIED_LEAD_STATUS.QUALIFICADO]: 'bg-green-100 text-green-800',
  [UNIFIED_LEAD_STATUS.CONVERTIDO]: 'bg-purple-100 text-purple-800',
  [UNIFIED_LEAD_STATUS.PERDIDO]: 'bg-red-100 text-red-800',
  [UNIFIED_LEAD_STATUS.INATIVO]: 'bg-gray-100 text-gray-800'
};

const useLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [converting, setConverting] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState(false);

  const [conversionModal, setConversionModal] = useState({
    isOpen: false,
    leadData: null,
    debugger: null
  });

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

  const { user } = useAuth();

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

  const fetchLeads = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let leadQuery = query(
        collection(db, LEADS_COLLECTION),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(FETCH_LIMIT)
      );

      if (filters.status && Object.values(UNIFIED_LEAD_STATUS).includes(filters.status)) {
        leadQuery = query(leadQuery, where('status', '==', filters.status));
      }
      
      if (filters.interestType && Object.values(UNIFIED_INTEREST_TYPES).includes(filters.interestType)) {
        leadQuery = query(leadQuery, where('interestType', '==', filters.interestType));
      }

      if (filters.priority && Object.values(UNIFIED_PRIORITIES).includes(filters.priority)) {
        leadQuery = query(leadQuery, where('priority', '==', filters.priority));
      }

      if (filters.clientType && Object.values(CLIENT_TYPES).includes(filters.clientType)) {
        leadQuery = query(leadQuery, where('clientType', '==', filters.clientType));
      }

      const querySnapshot = await getDocs(leadQuery);
      const leadsData = querySnapshot.docs
        .map(doc => {
          const data = doc.data();
          const migratedData = migrateLeadData(data);
          
          return {
            id: doc.id,
            ...migratedData,
            createdAt: data.createdAt?.toDate(),
            updatedAt: data.updatedAt?.toDate()
          };
        })
        .filter(lead => lead.isActive !== false);

      let filteredLeads = leadsData;
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredLeads = leadsData.filter(lead => 
          lead.name?.toLowerCase().includes(term) ||
          lead.email?.toLowerCase().includes(term) ||
          lead.phone?.includes(term.replace(/\s/g, '')) ||
          lead.managerName?.toLowerCase().includes(term) ||
          lead.propertyReference?.toLowerCase().includes(term) ||
          getInterestTypeLabel(lead.interestType)?.toLowerCase().includes(term)
        );
      }

      setLeads(filteredLeads);
      console.log(`✅ Carregados ${filteredLeads.length} leads com estrutura expandida`);
      
    } catch (err) {
      console.error('❌ Erro ao buscar leads:', err);
      setError(`Erro ao carregar leads: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  const migrateLeadData = useCallback((oldData) => {
    if (oldData.structureVersion === '3.1') {
      return oldData;
    }

    const migrated = {
      ...oldData,
      isActive: oldData.isActive !== undefined ? oldData.isActive : true,
      priority: oldData.priority || UNIFIED_PRIORITIES.NORMAL,
      status: migrateStatus(oldData.status),
      interestType: migrateInterestType(oldData.interestType),
      budgetRange: migrateBudgetRange(oldData.budgetRange),
      phoneNormalized: oldData.phoneNormalized || oldData.phone?.replace(/\s|-/g, '') || '',
      clientType: oldData.clientType || CLIENT_TYPES.COMPRADOR,
      propertyStatus: oldData.propertyStatus || PROPERTY_STATUS.NAO_IDENTIFICADO,
      propertyReference: oldData.propertyReference || '',
      propertyLink: oldData.propertyLink || '',
      managerName: oldData.managerName || '',
      managerPhone: oldData.managerPhone || '',
      managerEmail: oldData.managerEmail || '',
      managerContactHistory: oldData.managerContactHistory || [],
      managerNotes: oldData.managerNotes || '',
      source: oldData.source || UNIFIED_LEAD_SOURCES.MANUAL,
      structureVersion: '3.1',
      migratedAt: new Date().toISOString()
    };

    return migrated;
  }, []);

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

  const checkForDuplicates = useCallback(async (phone, email) => {
    setDuplicateCheck(true);
    
    try {
      const duplicates = [];
      
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

  const createLead = useCallback(async (leadData) => {
    if (!user) {
      throw new Error('Utilizador não autenticado');
    }

    setCreating(true);
    setError(null);

    try {
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

      const normalizedPhone = leadData.phone?.replace(/\s|-/g, '') || '';
      const normalizedEmail = leadData.email?.toLowerCase().trim() || '';
      
      const newLead = {
        name: leadData.name.trim(),
        phone: leadData.phone?.trim() || '',
        phoneNormalized: normalizedPhone,
        email: normalizedEmail,
        interestType: leadData.interestType || UNIFIED_INTEREST_TYPES.COMPRA_CASA,
        budgetRange: leadData.budgetRange || UNIFIED_BUDGET_RANGES.INDEFINIDO,
        notes: leadData.notes?.trim() || '',
        clientType: leadData.clientType || CLIENT_TYPES.COMPRADOR,
        propertyStatus: leadData.propertyStatus || PROPERTY_STATUS.NAO_IDENTIFICADO,
        propertyReference: leadData.propertyReference?.trim() || '',
        propertyLink: leadData.propertyLink?.trim() || '',
        managerName: leadData.managerName?.trim() || '',
        managerPhone: leadData.managerPhone?.trim() || '',
        managerEmail: leadData.managerEmail?.toLowerCase().trim() || '',
        managerContactHistory: leadData.managerContactHistory || [],
        managerNotes: leadData.managerNotes?.trim() || '',
        status: UNIFIED_LEAD_STATUS.NOVO,
        source: leadData.source || UNIFIED_LEAD_SOURCES.MANUAL,
        priority: leadData.priority || UNIFIED_PRIORITIES.NORMAL,
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        location: leadData.location?.trim() || '',
        preferredContactTime: leadData.preferredContactTime || 'qualquer_hora',
        isActive: true,
        isConverted: false,
        leadId: null,
        clientId: null,
        opportunityId: null,
        dealId: null,
        structureVersion: '3.1',
        userAgent: navigator.userAgent,
        ipAddress: 'N/A',
        source_details: {
          created_via: 'web_form',
          form_version: '3.1',
          timestamp: new Date().toISOString()
        }
      };

      const duplicateCheck = await checkForDuplicates(leadData.phone, leadData.email);
      if (duplicateCheck.hasDuplicates) {
        const duplicateInfo = duplicateCheck.duplicates[0];
        throw new Error(
          `Já existe um lead com este ${
            duplicateInfo.duplicateField === 'phone' ? 'telefone' : 'email'
          }`
        );
      }

      const docRef = await addDoc(collection(db, LEADS_COLLECTION), newLead);
      
      const createdLead = {
        id: docRef.id,
        ...newLead,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setLeads(prev => [createdLead, ...prev]);

      console.log('Lead criado com estrutura expandida:', docRef.id);
      
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
        'managerContactHistory'
      ];

      const validUpdateData = {};
      Object.keys(updateData).forEach(key => {
        if (allowedFields.includes(key)) {
          validUpdateData[key] = updateData[key];
        }
      });

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

      const leadRef = doc(db, LEADS_COLLECTION, leadId);
      const finalUpdateData = {
        ...validUpdateData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(leadRef, finalUpdateData);

      console.log('✅ Lead atualizado:', leadId);

      setLeads(prev => prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, ...validUpdateData, updatedAt: new Date() }
          : lead
      ));

      return { success: true, leadId };

    } catch (err) {
      console.error('❌ Erro ao atualizar lead:', err);
      return { success: false, error: err.message };
    }
  }, [user]);

  const addManagerContact = useCallback(async (leadId, contactData) => {
    if (!user?.uid) {
      return { success: false, error: 'Utilizador não autenticado' };
    }

    try {
      const leadRef = doc(db, LEADS_COLLECTION, leadId);
      const leadDoc = await getDoc(leadRef);
      
      if (!leadDoc.exists()) {
        return { success: false, error: 'Lead não encontrado' };
      }

      const lead = leadDoc.data();
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

      await updateDoc(leadRef, {
        managerContactHistory: updatedHistory,
        updatedAt: serverTimestamp()
      });

      setLeads(prev => prev.map(lead => 
        lead.id === leadId 
          ? { ...lead, managerContactHistory: updatedHistory, updatedAt: new Date() }
          : lead
      ));

      return { success: true, contact: newContact };

    } catch (err) {
      console.error('❌ Erro ao adicionar contacto:', err);
      return { success: false, error: err.message };
    }
  }, [user]);

  const updateLeadStatus = useCallback(async (leadId, newStatus, notes = '') => {
    if (!user) return;

    try {
      if (!Object.values(UNIFIED_LEAD_STATUS).includes(newStatus)) {
        throw new Error(`Status inválido: ${newStatus}`);
      }

      const leadRef = doc(db, LEADS_COLLECTION, leadId);
      
      const updateData = {
        status: newStatus,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid,
        statusHistory: {
          [`change_${Date.now()}`]: {
            from: '',
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
        updateData.lastStatusChange = serverTimestamp();
      }

      await updateDoc(leadRef, updateData);

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

  // ✅ FUNÇÃO PRINCIPAL DE CONVERSÃO CORRIGIDA
  const convertLeadToClient = useCallback(async (leadId, additionalClientData = {}) => {
    if (!user) {
      return { success: false, error: 'Utilizador não autenticado' };
    }

    if (!additionalClientData.fromModal && !additionalClientData.skipModal) {
      debugLog('conversion', 'Abrindo modal de conversão obrigatório', { leadId });

      try {
        const leadRef = doc(db, LEADS_COLLECTION, leadId);
        const leadSnap = await getDoc(leadRef);
        
        if (!leadSnap.exists()) {
          return { success: false, error: 'Lead não encontrado' };
        }

        const leadData = { id: leadSnap.id, ...leadSnap.data() };
        
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

    // ✅ VALIDAÇÃO RELAXADA CORRIGIDA
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
      const leadRef = doc(db, LEADS_COLLECTION, leadId);
      const leadSnap = await getDoc(leadRef);
      
      if (!leadSnap.exists()) {
        throw new Error('Lead não encontrado');
      }

      const leadData = { id: leadSnap.id, ...leadSnap.data() };
      
      if (leadData.isConverted || leadData.status === UNIFIED_LEAD_STATUS.CONVERTIDO) {
        return { 
          success: false, 
          error: 'Este lead já foi convertido anteriormente' 
        };
      }

      console.log('👤 Preparando dados do cliente...');
      const clientData = {
        name: leadData.name,
        email: leadData.email || '',
        phone: leadData.phone,
        clientType: leadData.clientType || 'comprador',
        interestType: leadData.interestType,
        budgetRange: leadData.budgetRange || 'indefinido',
        location: leadData.location || '',
        preferredLocations: leadData.location ? [leadData.location] : [],
        propertyStatus: leadData.propertyStatus || 'nao_identificado',
        propertyReference: leadData.propertyReference || '',
        propertyLink: leadData.propertyLink || '',
        managerName: leadData.managerName || '',
        managerPhone: leadData.managerPhone || '',
        managerEmail: leadData.managerEmail || '',
        managerNotes: leadData.managerNotes || '',
        ...(additionalClientData.clientData || {}),
        source: leadData.source || 'lead_conversion',
        originalLeadId: leadId,
        convertedFromLead: true,
        leadConvertedAt: new Date().toISOString(),
        notes: `${leadData.notes || ''}\n\nConvertido do lead em ${new Date().toLocaleDateString('pt-PT')}\nOrigem: ${leadData.source || 'Manual'}`,
        status: 'ativo',
        priority: leadData.priority || 'normal',
        ...additionalClientData,
        isActive: true,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid,
        structureVersion: '3.1'
      };

      console.log('💾 Criando cliente no Firestore...');
      const clientRef = await addDoc(collection(db, CLIENTS_COLLECTION), clientData);
      const clientId = clientRef.id;
      
      console.log('✅ Cliente criado com ID:', clientId);

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
        clientId: clientId,
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
        ],
        isActive: true,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid,
        structureVersion: '3.1'
      };

      console.log('💾 Criando oportunidade no Firestore...');
      const opportunityRef = await addDoc(collection(db, OPPORTUNITIES_COLLECTION), opportunityData);
      const opportunityId = opportunityRef.id;
      
      console.log('✅ Oportunidade criada com ID:', opportunityId);

      await updateDoc(clientRef, {
        hasOpportunities: true,
        lastOpportunityId: opportunityId,
        lastOpportunityCreated: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('🔄 Atualizando status do lead...');
      await updateDoc(leadRef, {
        status: UNIFIED_LEAD_STATUS.CONVERTIDO,
        isConverted: true,
        convertedAt: serverTimestamp(),
        convertedToClientId: clientId,
        convertedToOpportunityId: opportunityId,
        conversionDetails: {
          clientCreated: true,
          opportunityCreated: true,
          convertedBy: user.uid,
          conversionDate: new Date().toISOString(),
          automatedConversion: !additionalClientData.fromModal,
          modalValidation: !!additionalClientData.fromModal
        },
        updatedAt: serverTimestamp(),
        lastModifiedBy: user.uid
      });

      setLeads(prev => 
        prev.map(lead => 
          lead.id === leadId 
            ? { 
                ...lead, 
                status: UNIFIED_LEAD_STATUS.CONVERTIDO,
                isConverted: true,
                convertedAt: new Date(),
                convertedToClientId: clientId,
                convertedToOpportunityId: opportunityId,
                updatedAt: new Date()
              }
            : lead
        )
      );

      if (conversionModal.isOpen) {
        setConversionModal(prev => ({
          ...prev,
          isOpen: false,
          leadData: null
        }));
      }

      setConverting(false);
      
      console.log('🎉 Conversão concluída com sucesso!');
      console.log('Cliente ID:', clientId);
      console.log('Oportunidade ID:', opportunityId);
      
      return {
        success: true,
        clientId: clientId,
        opportunityId: opportunityId,
        clientData: { id: clientId, ...clientData },
        opportunityData: { id: opportunityId, ...opportunityData },
        message: `Lead convertido com sucesso!\n✅ Cliente criado: ${leadData.name}\n✅ Oportunidade criada: ${opportunityData.title}`
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
  }, [user, conversionModal]);

  // ✅ FUNÇÃO SIMPLIFICADA processLeadConversion
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

  const handleDebugLog = useCallback((logEntry) => {
    debugLog('debug', 'Log do modal de conversão', logEntry);
  }, []);

  const deleteLead = useCallback(async (leadId, hardDelete = false) => {
    if (!user) return;

    try {
      const leadRef = doc(db, LEADS_COLLECTION, leadId);
      
      if (hardDelete) {
        await deleteDoc(leadRef);
        console.log(`✅ Lead ${leadId} eliminado permanentemente`);
      } else {
        await updateDoc(leadRef, {
          isActive: false,
          deletedAt: serverTimestamp(),
          deletedBy: user.uid,
          updatedAt: serverTimestamp()
        });
        console.log(`✅ Lead ${leadId} marcado como inativo`);
      }
      
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

  const searchLeads = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

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

    Object.values(UNIFIED_LEAD_STATUS).forEach(status => {
      stats.byStatus[status] = leads.filter(lead => lead.status === status).length;
    });

    Object.values(CLIENT_TYPES).forEach(type => {
      stats.byClientType[type] = leads.filter(lead => lead.clientType === type).length;
    });

    Object.values(PROPERTY_STATUS).forEach(status => {
      stats.byPropertyStatus[status] = leads.filter(lead => lead.propertyStatus === status).length;
    });

    const convertedCount = stats.byStatus[UNIFIED_LEAD_STATUS.CONVERTIDO] || 0;
    const qualifiedCount = stats.byStatus[UNIFIED_LEAD_STATUS.QUALIFICADO] || 0;
    
    stats.conversionRate = stats.total > 0 ? (convertedCount / stats.total * 100).toFixed(1) : 0;
    stats.qualificationRate = stats.total > 0 ? (qualifiedCount / stats.total * 100).toFixed(1) : 0;

    return stats;
  }, [leads]);

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

  return {
    leads,
    loading,
    error,
    creating,
    converting,
    duplicateCheck,
    filters,
    conversionModal,
    processLeadConversion,
    closeConversionModal,
    handleDebugLog,
    createLead,
    updateLead,
    convertLeadToClient,
    updateLeadStatus,
    deleteLead,
    addManagerContact,
    fetchLeads,
    searchLeads,
    setFilters,
    checkForDuplicates,
    getLeadStats,
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
    isValidEmail: validateEmail,
    isValidPhone: validatePortuguesePhone,
    normalizePhone: (phone) => phone?.replace(/\s|-/g, '') || '',
    getInterestTypeLabel,
    getBudgetRangeLabel,
    formatCurrency,
    getStatusLabel,
    isConnected: !!user && !error,
    structureVersion: '3.1',
    isUnified: true
  };
};

export default useLeads;