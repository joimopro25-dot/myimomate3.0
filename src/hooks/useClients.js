// src/hooks/useClients.js
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
  getDoc,
  and,
  or
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

// 🎯 HOOK PERSONALIZADO PARA GESTÃO DE CLIENTES
// =============================================
// MyImoMate 3.0 - Módulo Core de Clientes
// Funcionalidades: CRUD, Duplicados, Histórico, Múltiplos contactos, Firebase

// 👥 TIPOS DE CLIENTE DISPONÍVEIS
export const CLIENT_TYPES = {
  COMPRADOR: 'comprador',
  VENDEDOR: 'vendedor',
  INQUILINO: 'inquilino',
  SENHORIO: 'senhorio',
  INVESTIDOR: 'investidor',
  MISTO: 'misto' // Cliente com múltiplos perfis
};

// 📊 STATUS DOS CLIENTES
export const CLIENT_STATUS = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  VIP: 'vip',
  PROSPECT: 'prospect',
  EX_CLIENTE: 'ex_cliente',
  BLOQUEADO: 'bloqueado'
};

// 🎨 CORES POR STATUS (para UI)
export const CLIENT_STATUS_COLORS = {
  [CLIENT_STATUS.ATIVO]: 'bg-green-100 text-green-800',
  [CLIENT_STATUS.INATIVO]: 'bg-gray-100 text-gray-800',
  [CLIENT_STATUS.VIP]: 'bg-purple-100 text-purple-800',
  [CLIENT_STATUS.PROSPECT]: 'bg-blue-100 text-blue-800',
  [CLIENT_STATUS.EX_CLIENTE]: 'bg-orange-100 text-orange-800',
  [CLIENT_STATUS.BLOQUEADO]: 'bg-red-100 text-red-800'
};

// 📞 TIPOS DE CONTACTO
export const CONTACT_TYPES = {
  PHONE_PRIMARY: 'phone_primary',
  PHONE_SECONDARY: 'phone_secondary',
  EMAIL_PRIMARY: 'email_primary',
  EMAIL_SECONDARY: 'email_secondary',
  WHATSAPP: 'whatsapp',
  LINKEDIN: 'linkedin',
  FACEBOOK: 'facebook'
};

// 🏠 TIPOS DE INTERESSE IMOBILIÁRIO
export const PROPERTY_INTERESTS = {
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
  INVESTIMENTO_COMPRA: 'investimento_compra',
  INVESTIMENTO_RENDA: 'investimento_renda'
};

// 💰 FAIXAS DE ORÇAMENTO (expandidas para clientes)
export const CLIENT_BUDGET_RANGES = {
  '0-50k': 'Até €50.000',
  '50k-100k': '€50.000 - €100.000',
  '100k-200k': '€100.000 - €200.000',
  '200k-300k': '€200.000 - €300.000', 
  '300k-500k': '€300.000 - €500.000',
  '500k-750k': '€500.000 - €750.000',
  '750k-1M': '€750.000 - €1.000.000',
  '1M-2M': '€1.000.000 - €2.000.000',
  '2M+': 'Acima de €2.000.000',
  'unlimited': 'Sem limite definido'
};

// 🔧 CONFIGURAÇÕES DO HOOK
const CLIENTS_COLLECTION = 'clients';
const INTERACTIONS_COLLECTION = 'client_interactions';
const FETCH_LIMIT = 50;

// 📱 REGEX PARA VALIDAÇÕES
const PORTUGUESE_PHONE_REGEX = /^(\+351|351|00351)?[ -]?9[1236][0-9][ -]?[0-9]{3}[ -]?[0-9]{3}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NIF_REGEX = /^[1-9][0-9]{8}$/;
const POSTAL_CODE_REGEX = /^[0-9]{4}-[0-9]{3}$/;

// 🎯 HOOK PRINCIPAL
const useClients = () => {
  // Estados principais
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState(false);

  // Estados de filtros
  const [filters, setFilters] = useState({
    status: '',
    clientType: '',
    budgetRange: '',
    searchTerm: '',
    city: '',
    hasInteractions: false
  });

  // Context de autenticação
  const { user } = useAuth();

  // 📥 BUSCAR TODOS OS CLIENTES
  const fetchClients = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let clientQuery = query(
        collection(db, CLIENTS_COLLECTION),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(FETCH_LIMIT)
      );

      // Aplicar filtros se existirem
      if (filters.status) {
        clientQuery = query(clientQuery, where('status', '==', filters.status));
      }
      
      if (filters.clientType) {
        clientQuery = query(clientQuery, where('clientType', '==', filters.clientType));
      }

      const querySnapshot = await getDocs(clientQuery);
      const clientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        lastInteraction: doc.data().lastInteraction?.toDate()
      }));

      // Filtrar por termo de busca (client-side para busca mais flexível)
      let filteredClients = clientsData;
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filteredClients = clientsData.filter(client => 
          client.name?.toLowerCase().includes(term) ||
          client.email?.toLowerCase().includes(term) ||
          client.phone?.includes(term.replace(/\s/g, '')) ||
          client.nif?.includes(term) ||
          client.address?.city?.toLowerCase().includes(term)
        );
      }

      // Filtrar por cidade
      if (filters.city) {
        filteredClients = filteredClients.filter(client => 
          client.address?.city?.toLowerCase().includes(filters.city.toLowerCase())
        );
      }

      setClients(filteredClients);
      console.log(`✅ Carregados ${filteredClients.length} clientes`);
      
    } catch (err) {
      console.error('❌ Erro ao buscar clientes:', err);
      setError(`Erro ao carregar clientes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);
  
// 🔍 VERIFICAR DUPLICADOS (mais rigoroso que leads)
const checkForDuplicates = useCallback(async (phone, email, nif, excludeId = null) => {
  // ✅ VERIFICAÇÃO ADICIONADA
  if (!user?.uid) {
    console.error('❌ Utilizador não autenticado para verificar duplicados');
    return { hasDuplicates: false, duplicates: [], error: 'Utilizador não autenticado' };
  }

  setDuplicateCheck(true);
    
    try {
      const duplicates = [];
      
      // Verificar por telefone (normalizado)
      if (phone) {
        const normalizedPhone = phone.replace(/\s|-/g, '');
        const phoneQuery = query(
          collection(db, CLIENTS_COLLECTION),
          where('userId', '==', user.uid),
          where('phoneNormalized', '==', normalizedPhone)
        );
        const phoneSnapshot = await getDocs(phoneQuery);
        
        phoneSnapshot.docs.forEach(doc => {
          if (doc.id !== excludeId) {
            duplicates.push({ id: doc.id, ...doc.data(), duplicateField: 'phone' });
          }
        });
      }

      // Verificar por email
      if (email) {
        const emailQuery = query(
          collection(db, CLIENTS_COLLECTION),
          where('userId', '==', user.uid),
          where('email', '==', email.toLowerCase())
        );
        const emailSnapshot = await getDocs(emailQuery);
        
        emailSnapshot.docs.forEach(doc => {
          if (doc.id !== excludeId && !duplicates.find(d => d.id === doc.id)) {
            duplicates.push({ id: doc.id, ...doc.data(), duplicateField: 'email' });
          }
        });
      }

      // Verificar por NIF (se fornecido)
      if (nif) {
        const nifQuery = query(
          collection(db, CLIENTS_COLLECTION),
          where('userId', '==', user.uid),
          where('nif', '==', nif)
        );
        const nifSnapshot = await getDocs(nifQuery);
        
        nifSnapshot.docs.forEach(doc => {
          if (doc.id !== excludeId && !duplicates.find(d => d.id === doc.id)) {
            duplicates.push({ id: doc.id, ...doc.data(), duplicateField: 'nif' });
          }
        });
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

  // ➕ CRIAR NOVO CLIENTE
  const createClient = useCallback(async (clientData) => {
    if (!user) {
      throw new Error('Utilizador não autenticado');
    }

    setCreating(true);
    setError(null);

    try {
      // Validações obrigatórias
      if (!clientData.name?.trim()) {
        throw new Error('Nome é obrigatório');
      }
      
      if (!clientData.phone?.trim() && !clientData.email?.trim()) {
        throw new Error('Telefone ou email é obrigatório');
      }

      // Validar formato de telefone se fornecido
      if (clientData.phone && !PORTUGUESE_PHONE_REGEX.test(clientData.phone)) {
        throw new Error('Formato de telefone inválido');
      }

      // Validar formato de email se fornecido
      if (clientData.email && !EMAIL_REGEX.test(clientData.email)) {
        throw new Error('Formato de email inválido');
      }

      // Validar NIF se fornecido
      if (clientData.nif && !NIF_REGEX.test(clientData.nif)) {
        throw new Error('Formato de NIF inválido (9 dígitos)');
      }

      // Validar código postal se fornecido
      if (clientData.address?.postalCode && !POSTAL_CODE_REGEX.test(clientData.address.postalCode)) {
        throw new Error('Formato de código postal inválido (XXXX-XXX)');
      }

      // Verificar duplicados antes de criar
      const duplicateCheck = await checkForDuplicates(
        clientData.phone, 
        clientData.email, 
        clientData.nif
      );
      
      if (duplicateCheck.hasDuplicates) {
        const duplicateInfo = duplicateCheck.duplicates[0];
        const fieldName = duplicateInfo.duplicateField === 'phone' ? 'telefone' : 
                         duplicateInfo.duplicateField === 'email' ? 'email' : 'NIF';
        throw new Error(`Já existe um cliente com este ${fieldName}`);
      }

      // Preparar dados para inserção
      const normalizedPhone = clientData.phone?.replace(/\s|-/g, '') || '';
      const normalizedEmail = clientData.email?.toLowerCase().trim() || '';
      
      const newClient = {
        // Dados básicos
        name: clientData.name.trim(),
        phone: clientData.phone?.trim() || '',
        phoneNormalized: normalizedPhone,
        phoneSecondary: clientData.phoneSecondary?.trim() || '',
        email: normalizedEmail,
        emailSecondary: clientData.emailSecondary?.toLowerCase().trim() || '',
        
        // Dados fiscais
        nif: clientData.nif?.trim() || '',
        
        // Tipo e status
        clientType: clientData.clientType || CLIENT_TYPES.COMPRADOR,
        status: clientData.status || CLIENT_STATUS.ATIVO,
        
        // Morada completa
        address: {
          street: clientData.address?.street?.trim() || '',
          number: clientData.address?.number?.trim() || '',
          floor: clientData.address?.floor?.trim() || '',
          door: clientData.address?.door?.trim() || '',
          postalCode: clientData.address?.postalCode?.trim() || '',
          city: clientData.address?.city?.trim() || '',
          district: clientData.address?.district?.trim() || '',
          country: clientData.address?.country?.trim() || 'Portugal'
        },
        
        // Dados de interesse
        propertyInterests: clientData.propertyInterests || [PROPERTY_INTERESTS.COMPRA_CASA],
        budgetRange: clientData.budgetRange || 'undefined',
        preferredLocations: clientData.preferredLocations || [],
        
        // Preferências de contacto
        preferredContactMethod: clientData.preferredContactMethod || 'phone',
        preferredContactTime: clientData.preferredContactTime || 'anytime',
        contactNotes: clientData.contactNotes?.trim() || '',
        
        // Dados profissionais (opcional)
        profession: clientData.profession?.trim() || '',
        company: clientData.company?.trim() || '',
        
        // Relacionamento com leads
        sourceLeadId: clientData.sourceLeadId || null,
        sourceType: clientData.sourceType || 'manual', // manual, lead_conversion, referral
        
        // Notas e observações
        notes: clientData.notes?.trim() || '',
        
        // Dados de auditoria
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Estatísticas
        totalInteractions: 0,
        lastInteraction: null,
        
        // Flags
        isActive: true,
        isVIP: clientData.status === CLIENT_STATUS.VIP,
        allowsMarketing: clientData.allowsMarketing !== false, // GDPR
        
        // Metadados técnicos
        userAgent: navigator.userAgent,
        ipAddress: 'N/A',
        source_details: {
          created_via: 'web_form',
          form_version: '1.0',
          timestamp: new Date().toISOString(),
          conversion_from_lead: !!clientData.sourceLeadId
        }
      };

      // Inserir no Firebase
      const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), newClient);
      
      // Criar objeto completo para retorno
      const createdClient = {
        id: docRef.id,
        ...newClient,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Atualizar lista local
      setClients(prev => [createdClient, ...prev]);

      console.log('✅ Cliente criado com sucesso:', docRef.id);
      
      return {
        success: true,
        client: createdClient,
        message: 'Cliente criado com sucesso!'
      };

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
  }, [user, checkForDuplicates]);

  // ✏️ ATUALIZAR CLIENTE
  const updateClient = useCallback(async (clientId, updateData) => {
    if (!user) return;

    setUpdating(true);
    setError(null);

    try {
      // Validações se campos críticos estão sendo alterados
      if (updateData.phone && !PORTUGUESE_PHONE_REGEX.test(updateData.phone)) {
        throw new Error('Formato de telefone inválido');
      }

      if (updateData.email && !EMAIL_REGEX.test(updateData.email)) {
        throw new Error('Formato de email inválido');
      }

      if (updateData.nif && !NIF_REGEX.test(updateData.nif)) {
        throw new Error('Formato de NIF inválido');
      }

      // Verificar duplicados se dados críticos mudaram
      if (updateData.phone || updateData.email || updateData.nif) {
        const duplicateCheck = await checkForDuplicates(
          updateData.phone, 
          updateData.email, 
          updateData.nif,
          clientId // Excluir o próprio cliente da verificação
        );
        
        if (duplicateCheck.hasDuplicates) {
          const duplicateInfo = duplicateCheck.duplicates[0];
          const fieldName = duplicateInfo.duplicateField === 'phone' ? 'telefone' : 
                           duplicateInfo.duplicateField === 'email' ? 'email' : 'NIF';
          throw new Error(`Já existe outro cliente com este ${fieldName}`);
        }
      }

      const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
      
      const finalUpdateData = {
        ...updateData,
        updatedAt: serverTimestamp()
      };

      // Normalizar telefone se foi alterado
      if (updateData.phone) {
        finalUpdateData.phoneNormalized = updateData.phone.replace(/\s|-/g, '');
      }

      // Normalizar email se foi alterado
      if (updateData.email) {
        finalUpdateData.email = updateData.email.toLowerCase().trim();
      }

      await updateDoc(clientRef, finalUpdateData);

      // Atualizar lista local
      setClients(prev => 
        prev.map(client => 
          client.id === clientId 
            ? { ...client, ...finalUpdateData, updatedAt: new Date() }
            : client
        )
      );

      console.log(`✅ Cliente ${clientId} atualizado com sucesso`);
      
      return { success: true, message: 'Cliente atualizado com sucesso!' };

    } catch (err) {
      console.error('❌ Erro ao atualizar cliente:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUpdating(false);
    }
  }, [user, checkForDuplicates]);

  // 🔄 ATUALIZAR STATUS DO CLIENTE
  const updateClientStatus = useCallback(async (clientId, newStatus, notes = '') => {
    if (!user) return;

    try {
      const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
      
      const updateData = {
        status: newStatus,
        isVIP: newStatus === CLIENT_STATUS.VIP,
        isActive: ![CLIENT_STATUS.INATIVO, CLIENT_STATUS.EX_CLIENTE, CLIENT_STATUS.BLOQUEADO].includes(newStatus),
        updatedAt: serverTimestamp()
      };

      // Adicionar nota se fornecida
      if (notes.trim()) {
        updateData.statusChangeNote = notes.trim();
        updateData.lastStatusChange = serverTimestamp();
      }

      await updateDoc(clientRef, updateData);

      // Atualizar lista local
      setClients(prev => 
        prev.map(client => 
          client.id === clientId 
            ? { ...client, ...updateData, updatedAt: new Date() }
            : client
        )
      );

      console.log(`✅ Status do cliente ${clientId} atualizado para: ${newStatus}`);
      
      return { success: true, message: 'Status atualizado com sucesso!' };

    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      return { success: false, error: err.message };
    }
  }, [user]);

  // 📝 ADICIONAR INTERAÇÃO
  const addInteraction = useCallback(async (clientId, interactionData) => {
    if (!user) return;

    try {
      // Criar registo de interação
      const interaction = {
        clientId,
        userId: user.uid,
        type: interactionData.type || 'note', // call, email, meeting, note, whatsapp
        subject: interactionData.subject?.trim() || '',
        description: interactionData.description?.trim() || '',
        duration: interactionData.duration || null, // em minutos
        outcome: interactionData.outcome || '', // positive, negative, neutral, follow_up_needed
        nextAction: interactionData.nextAction?.trim() || '',
        scheduledFollowUp: interactionData.scheduledFollowUp || null,
        createdAt: serverTimestamp(),
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };

      // Adicionar interação à coleção
      await addDoc(collection(db, INTERACTIONS_COLLECTION), interaction);

      // Atualizar contador no cliente
      const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
      await updateDoc(clientRef, {
        totalInteractions: (clients.find(c => c.id === clientId)?.totalInteractions || 0) + 1,
        lastInteraction: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log(`✅ Interação adicionada ao cliente ${clientId}`);
      
      return { success: true, message: 'Interação registada com sucesso!' };

    } catch (err) {
      console.error('❌ Erro ao adicionar interação:', err);
      return { success: false, error: err.message };
    }
  }, [user, clients]);

  // 🗑️ ELIMINAR CLIENTE
  const deleteClient = useCallback(async (clientId) => {
    if (!user) return;

    try {
      // TODO: Em produção, implementar soft delete em vez de hard delete
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId));
      
      // Remover da lista local
      setClients(prev => prev.filter(client => client.id !== clientId));
      
      console.log(`✅ Cliente ${clientId} eliminado`);
      return { success: true, message: 'Cliente eliminado com sucesso!' };

    } catch (err) {
      console.error('❌ Erro ao eliminar cliente:', err);
      return { success: false, error: err.message };
    }
  }, [user]);

  // 🔍 BUSCAR CLIENTES COM FILTROS
  const searchClients = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  // 📊 ESTATÍSTICAS DOS CLIENTES
  const getClientStats = useCallback(() => {
    const stats = {
      total: clients.length,
      byStatus: {},
      byType: {},
      byBudgetRange: {},
      activeClients: 0,
      vipClients: 0,
      withInteractions: 0,
      recentClients: 0
    };

    // Contar por status
    Object.values(CLIENT_STATUS).forEach(status => {
      stats.byStatus[status] = clients.filter(client => client.status === status).length;
    });

    // Contar por tipo
    Object.values(CLIENT_TYPES).forEach(type => {
      stats.byType[type] = clients.filter(client => client.clientType === type).length;
    });

    // Contar por faixa de orçamento
    Object.keys(CLIENT_BUDGET_RANGES).forEach(range => {
      stats.byBudgetRange[range] = clients.filter(client => client.budgetRange === range).length;
    });

    // Estatísticas especiais
    stats.activeClients = clients.filter(client => client.isActive).length;
    stats.vipClients = clients.filter(client => client.isVIP).length;
    stats.withInteractions = clients.filter(client => client.totalInteractions > 0).length;
    
    // Clientes criados nos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    stats.recentClients = clients.filter(client => 
      client.createdAt && client.createdAt >= thirtyDaysAgo
    ).length;

    return stats;
  }, [clients]);

  // 🔄 Carregar clientes quando user ou filtros mudarem
  useEffect(() => {
    if (user) {
      fetchClients();
    }
  }, [user, fetchClients]);

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
    
    // Constantes úteis
    CLIENT_STATUS,
    CLIENT_TYPES,
    CLIENT_BUDGET_RANGES,
    PROPERTY_INTERESTS,
    CLIENT_STATUS_COLORS,
    CONTACT_TYPES,
    
    // Helpers de validação
    isValidEmail: (email) => EMAIL_REGEX.test(email),
    isValidPhone: (phone) => PORTUGUESE_PHONE_REGEX.test(phone),
    isValidNIF: (nif) => NIF_REGEX.test(nif),
    isValidPostalCode: (code) => POSTAL_CODE_REGEX.test(code),
    normalizePhone: (phone) => phone?.replace(/\s|-/g, '') || '',
    
    // Estado de conectividade
    isConnected: !!user && !error
  };
};

export default useClients;