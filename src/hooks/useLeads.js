// src/hooks/useLeads.js
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

// 🎯 HOOK PERSONALIZADO PARA GESTÃO DE LEADS
// ==========================================
// MyImoMate 3.0 - Módulo Core de Leads
// Funcionalidades: CRUD, Conversão, Duplicados, Firebase

// 📋 TIPOS DE INTERESSE DISPONÍVEIS
export const LEAD_INTEREST_TYPES = {
  COMPRA_CASA: 'compra_casa',
  COMPRA_APARTAMENTO: 'compra_apartamento', 
  COMPRA_TERRENO: 'compra_terreno',
  COMPRA_COMERCIAL: 'compra_comercial',
  VENDA_CASA: 'venda_casa',
  VENDA_APARTAMENTO: 'venda_apartamento',
  VENDA_TERRENO: 'venda_terreno',
  VENDA_COMERCIAL: 'venda_comercial',
  ARRENDAMENTO_CASA: 'arrendamento_casa',
  ARRENDAMENTO_APARTAMENTO: 'arrendamento_apartamento',
  ARRENDAMENTO_COMERCIAL: 'arrendamento_comercial',
  INVESTIMENTO: 'investimento',
  AVALIACAO: 'avaliacao',
  CONSULTORIA: 'consultoria'
};

// 📊 STATUS DOS LEADS
export const LEAD_STATUS = {
  NOVO: 'novo',
  CONTACTADO: 'contactado',
  QUALIFICADO: 'qualificado',
  CONVERTIDO: 'convertido',
  PERDIDO: 'perdido',
  INATIVO: 'inativo'
};

// 🎨 CORES POR STATUS (para UI)
export const LEAD_STATUS_COLORS = {
  [LEAD_STATUS.NOVO]: 'bg-blue-100 text-blue-800',
  [LEAD_STATUS.CONTACTADO]: 'bg-yellow-100 text-yellow-800',
  [LEAD_STATUS.QUALIFICADO]: 'bg-green-100 text-green-800',
  [LEAD_STATUS.CONVERTIDO]: 'bg-purple-100 text-purple-800',
  [LEAD_STATUS.PERDIDO]: 'bg-red-100 text-red-800',
  [LEAD_STATUS.INATIVO]: 'bg-gray-100 text-gray-800'
};

// 💰 FAIXAS DE ORÇAMENTO
export const BUDGET_RANGES = {
  '0-100k': 'Até €100.000',
  '100k-200k': '€100.000 - €200.000',
  '200k-300k': '€200.000 - €300.000', 
  '300k-500k': '€300.000 - €500.000',
  '500k-750k': '€500.000 - €750.000',
  '750k-1M': '€750.000 - €1.000.000',
  '1M+': 'Acima de €1.000.000',
  'undefined': 'A definir'
};

// 🔧 CONFIGURAÇÕES DO HOOK
const LEADS_COLLECTION = 'leads';
const CLIENTS_COLLECTION = 'clients';
const FETCH_LIMIT = 50;

// 📱 REGEX PARA VALIDAÇÃO DE TELEFONE PORTUGUÊS
const PORTUGUESE_PHONE_REGEX = /^(\+351|351|00351)?[ -]?9[1236][0-9][ -]?[0-9]{3}[ -]?[0-9]{3}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 🎯 HOOK PRINCIPAL
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
    searchTerm: ''
  });

  // Context de autenticação
  const { user } = useAuth();

  // 📥 BUSCAR TODOS OS LEADS
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

      // Aplicar filtros se existirem
      if (filters.status) {
        leadQuery = query(leadQuery, where('status', '==', filters.status));
      }
      
      if (filters.interestType) {
        leadQuery = query(leadQuery, where('interestType', '==', filters.interestType));
      }

      const querySnapshot = await getDocs(leadQuery);
      const leadsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));

      // Filtrar por termo de busca (client-side)
      let filteredLeads = leadsData;
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredLeads = leadsData.filter(lead => 
          lead.name?.toLowerCase().includes(term) ||
          lead.email?.toLowerCase().includes(term) ||
          lead.phone?.includes(term.replace(/\s/g, ''))
        );
      }

      setLeads(filteredLeads);
      console.log(`✅ Carregados ${filteredLeads.length} leads`);
      
    } catch (err) {
      console.error('❌ Erro ao buscar leads:', err);
      setError(`Erro ao carregar leads: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  // 🔍 VERIFICAR DUPLICADOS
  const checkForDuplicates = useCallback(async (phone, email) => {
    setDuplicateCheck(true);
    
    try {
      const duplicates = [];
      
      // Verificar por telefone (normalizado)
      if (phone) {
        const normalizedPhone = phone.replace(/\s|-/g, '');
        const phoneQuery = query(
          collection(db, LEADS_COLLECTION),
          where('userId', '==', user.uid),
          where('phoneNormalized', '==', normalizedPhone)
        );
        const phoneSnapshot = await getDocs(phoneQuery);
        
        phoneSnapshot.docs.forEach(doc => {
          duplicates.push({ id: doc.id, ...doc.data(), duplicateField: 'phone' });
        });
      }

      // Verificar por email
      if (email) {
        const emailQuery = query(
          collection(db, LEADS_COLLECTION),
          where('userId', '==', user.uid),
          where('email', '==', email.toLowerCase())
        );
        const emailSnapshot = await getDocs(emailQuery);
        
        emailSnapshot.docs.forEach(doc => {
          if (!duplicates.find(d => d.id === doc.id)) {
            duplicates.push({ id: doc.id, ...doc.data(), duplicateField: 'email' });
          }
        });
      }

      // Verificar também na coleção de clientes
      if (phone || email) {
        const clientQueries = [];
        
        if (phone) {
          const normalizedPhone = phone.replace(/\s|-/g, '');
          clientQueries.push(
            query(
              collection(db, CLIENTS_COLLECTION),
              where('userId', '==', user.uid),
              where('phoneNormalized', '==', normalizedPhone)
            )
          );
        }
        
        if (email) {
          clientQueries.push(
            query(
              collection(db, CLIENTS_COLLECTION),
              where('userId', '==', user.uid),
              where('email', '==', email.toLowerCase())
            )
          );
        }

        for (const clientQuery of clientQueries) {
          const clientSnapshot = await getDocs(clientQuery);
          clientSnapshot.docs.forEach(doc => {
            duplicates.push({ 
              id: doc.id, 
              ...doc.data(), 
              duplicateField: 'client',
              isClient: true 
            });
          });
        }
      }

      return {
        hasDuplicates: duplicates.length > 0,
        duplicates,
        count: duplicates.length
      };
      
    } catch (err) {
      console.error('❌ Erro ao verificar duplicados:', err);
      return { hasDuplicates: false, duplicates: [], error: err.message };
    } finally {
      setDuplicateCheck(false);
    }
  }, [user]);

  // ➕ CRIAR NOVO LEAD
  const createLead = useCallback(async (leadData) => {
    if (!user) {
      throw new Error('Utilizador não autenticado');
    }

    setCreating(true);
    setError(null);

    try {
      // Validações obrigatórias
      if (!leadData.name?.trim()) {
        throw new Error('Nome é obrigatório');
      }
      
      if (!leadData.phone?.trim() && !leadData.email?.trim()) {
        throw new Error('Telefone ou email é obrigatório');
      }

      // Validar formato de telefone se fornecido
      if (leadData.phone && !PORTUGUESE_PHONE_REGEX.test(leadData.phone)) {
        throw new Error('Formato de telefone inválido');
      }

      // Validar formato de email se fornecido
      if (leadData.email && !EMAIL_REGEX.test(leadData.email)) {
        throw new Error('Formato de email inválido');
      }

      // Verificar duplicados antes de criar
      const duplicateCheck = await checkForDuplicates(leadData.phone, leadData.email);
      if (duplicateCheck.hasDuplicates) {
        const duplicateInfo = duplicateCheck.duplicates[0];
        throw new Error(
          `Já existe um ${duplicateInfo.isClient ? 'cliente' : 'lead'} com este ${
            duplicateInfo.duplicateField === 'phone' ? 'telefone' : 'email'
          }`
        );
      }

      // Preparar dados para inserção
      const normalizedPhone = leadData.phone?.replace(/\s|-/g, '') || '';
      const normalizedEmail = leadData.email?.toLowerCase().trim() || '';
      
      const newLead = {
        // Dados básicos
        name: leadData.name.trim(),
        phone: leadData.phone?.trim() || '',
        phoneNormalized: normalizedPhone,
        email: normalizedEmail,
        
        // Dados de interesse
        interestType: leadData.interestType || LEAD_INTEREST_TYPES.COMPRA_CASA,
        budgetRange: leadData.budgetRange || 'undefined',
        notes: leadData.notes?.trim() || '',
        
        // Status e metadados
        status: LEAD_STATUS.NOVO,
        source: leadData.source || 'manual',
        priority: leadData.priority || 'normal',
        
        // Dados de auditoria
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Dados adicionais
        location: leadData.location?.trim() || '',
        preferredContactTime: leadData.preferredContactTime || '',
        
        // Flags
        isActive: true,
        isConverted: false,
        
        // Metadados técnicos
        userAgent: navigator.userAgent,
        ipAddress: 'N/A', // Pode ser implementado later
        source_details: {
          created_via: 'web_form',
          form_version: '1.0',
          timestamp: new Date().toISOString()
        }
      };

      // Inserir no Firebase
      const docRef = await addDoc(collection(db, LEADS_COLLECTION), newLead);
      
      // Criar objeto completo para retorno
      const createdLead = {
        id: docRef.id,
        ...newLead,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Atualizar lista local
      setLeads(prev => [createdLead, ...prev]);

      console.log('✅ Lead criado com sucesso:', docRef.id);
      
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

  // 🔄 ATUALIZAR STATUS DO LEAD
  const updateLeadStatus = useCallback(async (leadId, newStatus, notes = '') => {
    if (!user) return;

    try {
      const leadRef = doc(db, LEADS_COLLECTION, leadId);
      
      const updateData = {
        status: newStatus,
        updatedAt: serverTimestamp()
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
      
      return { success: true, message: 'Status atualizado com sucesso!' };

    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      return { success: false, error: err.message };
    }
  }, [user]);

  // 🔄 CONVERTER LEAD PARA CLIENTE
  const convertLeadToClient = useCallback(async (leadId, additionalClientData = {}) => {
    if (!user) {
      throw new Error('Utilizador não autenticado');
    }

    setConverting(true);
    setError(null);

    try {
      // Buscar dados do lead
      const leadRef = doc(db, LEADS_COLLECTION, leadId);
      const leadSnap = await getDoc(leadRef);
      
      if (!leadSnap.exists()) {
        throw new Error('Lead não encontrado');
      }

      const leadData = leadSnap.data();

      // Verificar se já foi convertido
      if (leadData.isConverted) {
        throw new Error('Lead já foi convertido para cliente');
      }

      // Preparar dados do cliente
      const clientData = {
        // Dados básicos do lead
        name: leadData.name,
        phone: leadData.phone,
        phoneNormalized: leadData.phoneNormalized,
        email: leadData.email,
        
        // Dados específicos do cliente
        clientType: 'individual', // individual, company
        status: 'active',
        
        // Dados de interesse originais
        primaryInterest: leadData.interestType,
        budgetRange: leadData.budgetRange,
        location: leadData.location,
        
        // Dados adicionais
        notes: leadData.notes,
        source: `converted_from_lead_${leadId}`,
        
        // Dados de auditoria
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Referência ao lead original
        originalLeadId: leadId,
        convertedAt: serverTimestamp(),
        
        // Flags
        isActive: true,
        
        // Dados adicionais fornecidos
        ...additionalClientData
      };

      // Criar cliente no Firebase
      const clientDocRef = await addDoc(collection(db, CLIENTS_COLLECTION), clientData);

      // Atualizar lead como convertido
      await updateDoc(leadRef, {
        status: LEAD_STATUS.CONVERTIDO,
        isConverted: true,
        convertedAt: serverTimestamp(),
        convertedToClientId: clientDocRef.id,
        updatedAt: serverTimestamp()
      });

      // Atualizar lista local de leads
      setLeads(prev => 
        prev.map(lead => 
          lead.id === leadId 
            ? { 
                ...lead, 
                status: LEAD_STATUS.CONVERTIDO, 
                isConverted: true,
                convertedAt: new Date(),
                convertedToClientId: clientDocRef.id,
                updatedAt: new Date()
              }
            : lead
        )
      );

      console.log(`✅ Lead ${leadId} convertido para cliente ${clientDocRef.id}`);
      
      return {
        success: true,
        clientId: clientDocRef.id,
        message: 'Lead convertido para cliente com sucesso!',
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

  // 🗑️ ELIMINAR LEAD
  const deleteLead = useCallback(async (leadId) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, LEADS_COLLECTION, leadId));
      
      // Remover da lista local
      setLeads(prev => prev.filter(lead => lead.id !== leadId));
      
      console.log(`✅ Lead ${leadId} eliminado`);
      return { success: true, message: 'Lead eliminado com sucesso!' };

    } catch (err) {
      console.error('❌ Erro ao eliminar lead:', err);
      return { success: false, error: err.message };
    }
  }, [user]);

  // 🔍 BUSCAR LEADS COM FILTROS
  const searchLeads = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  // 📊 ESTATÍSTICAS DOS LEADS
  const getLeadStats = useCallback(() => {
    const stats = {
      total: leads.length,
      byStatus: {},
      byInterestType: {},
      byBudgetRange: {},
      conversionRate: 0
    };

    // Contar por status
    Object.values(LEAD_STATUS).forEach(status => {
      stats.byStatus[status] = leads.filter(lead => lead.status === status).length;
    });

    // Contar por tipo de interesse
    Object.values(LEAD_INTEREST_TYPES).forEach(type => {
      stats.byInterestType[type] = leads.filter(lead => lead.interestType === type).length;
    });

    // Contar por faixa de orçamento
    Object.keys(BUDGET_RANGES).forEach(range => {
      stats.byBudgetRange[range] = leads.filter(lead => lead.budgetRange === range).length;
    });

    // Calcular taxa de conversão
    const convertedCount = stats.byStatus[LEAD_STATUS.CONVERTIDO] || 0;
    stats.conversionRate = stats.total > 0 ? (convertedCount / stats.total * 100).toFixed(1) : 0;

    return stats;
  }, [leads]);

  // 🔄 Carregar leads quando user ou filtros mudarem
  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user, fetchLeads]);

  // 🧹 Limpar erro após 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 📤 RETORNO DO HOOK
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
    
    // Constantes úteis
    LEAD_STATUS,
    LEAD_INTEREST_TYPES,
    BUDGET_RANGES,
    LEAD_STATUS_COLORS,
    
    // Helpers
    isValidEmail: (email) => EMAIL_REGEX.test(email),
    isValidPhone: (phone) => PORTUGUESE_PHONE_REGEX.test(phone),
    normalizePhone: (phone) => phone?.replace(/\s|-/g, '') || '',
    
    // Estado de conectividade
    isConnected: !!user && !error
  };
};

export default useLeads;