// src/hooks/useClients.js

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

// 🏢 CONSTANTES E CONFIGURAÇÕES
// =============================

const CLIENTS_COLLECTION = 'clients';

// Status dos clientes
export const CLIENT_STATUS = {
  ATIVO: 'ativo',
  INATIVO: 'inativo',
  PROSPETO: 'prospeto',
  EX_CLIENTE: 'ex_cliente'
};

// Tipos de cliente
export const CLIENT_TYPES = {
  COMPRADOR: 'comprador',
  VENDEDOR: 'vendedor',
  INQUILINO: 'inquilino',
  SENHORIO: 'senhorio',
  INVESTIDOR: 'investidor'
};

// Ranges de orçamento
export const CLIENT_BUDGET_RANGES = {
  ATE_100K: 'ate_100k',
  DE_100K_250K: '100k_250k',
  DE_250K_500K: '250k_500k',
  DE_500K_1M: '500k_1m',
  ACIMA_1M: 'acima_1m'
};

// Interesses imobiliários
export const PROPERTY_INTERESTS = {
  APARTAMENTO: 'apartamento',
  MORADIA: 'moradia',
  TERRENO: 'terreno',
  COMERCIAL: 'comercial',
  INDUSTRIAL: 'industrial',
  ESCRITORIO: 'escritorio'
};

// Cores para status
export const CLIENT_STATUS_COLORS = {
  [CLIENT_STATUS.ATIVO]: 'green',
  [CLIENT_STATUS.INATIVO]: 'gray',
  [CLIENT_STATUS.PROSPETO]: 'blue',
  [CLIENT_STATUS.EX_CLIENTE]: 'red'
};

// Tipos de contacto/interação
export const CONTACT_TYPES = {
  CHAMADA: 'chamada',
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
  REUNIAO: 'reuniao',
  VISITA: 'visita',
  OUTRO: 'outro'
};

// 🔍 REGEX DE VALIDAÇÃO
// =====================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PORTUGUESE_PHONE_REGEX = /^(\+351|351)?\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{3}$/;
const NIF_REGEX = /^[0-9]{9}$/;
const POSTAL_CODE_REGEX = /^[0-9]{4}-[0-9]{3}$/;

// 🎯 HOOK PRINCIPAL
// ================

const useClients = () => {
  // Estados principais
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [duplicateCheck, setDuplicateCheck] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    status: '',
    clientType: '',
    city: '',
    searchTerm: ''
  });

  // Hook de autenticação
  const { user, currentUser, isAuthenticated, loading: authLoading } = useAuth();

  // ✅ VERIFICAÇÃO DE AUTENTICAÇÃO MELHORADA
  const isUserReady = !!(user?.uid || currentUser?.uid) && !authLoading;
  const activeUser = user || currentUser;

  // 🔄 LIMPAR ERRO AUTOMATICAMENTE
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 📊 BUSCAR CLIENTES - QUERY OTIMIZADA SEM ÍNDICE COMPOSTO
  const fetchClients = useCallback(async () => {
    if (!isUserReady) {
      console.log('🔄 useClients: Aguardando autenticação...');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('📊 Buscando clientes para utilizador:', activeUser.uid);

      // ✅ QUERY SIMPLES - SEM ORDERBY PARA EVITAR ÍNDICE COMPOSTO
      const clientsQuery = query(
        collection(db, CLIENTS_COLLECTION),
        where('userId', '==', activeUser.uid)
        // Removido orderBy para evitar necessidade de índice composto
      );

      const querySnapshot = await getDocs(clientsQuery);
      const clientsData = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        clientsData.push({
          id: doc.id,
          ...data,
          // Converter timestamps
          createdAt: data.createdAt?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null,
          lastInteraction: data.lastInteraction?.toDate?.() || null,
        });
      });

      // ✅ ORDENAÇÃO CLIENT-SIDE PARA EVITAR ÍNDICE
      clientsData.sort((a, b) => {
        const dateA = a.createdAt || new Date(0);
        const dateB = b.createdAt || new Date(0);
        return dateB - dateA; // Mais recentes primeiro
      });

      // Aplicar filtros client-side
      let filteredClients = clientsData;

      // Filtrar por termo de busca
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

      // Filtrar por status
      if (filters.status) {
        filteredClients = filteredClients.filter(client => 
          client.status === filters.status
        );
      }

      // Filtrar por tipo
      if (filters.clientType) {
        filteredClients = filteredClients.filter(client => 
          client.clientType === filters.clientType
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
  }, [isUserReady, activeUser, filters]);

  // 🔍 VERIFICAR DUPLICADOS - MELHORADA
  const checkForDuplicates = useCallback(async (phone, email, nif, excludeId = null) => {
    // ✅ VERIFICAÇÃO ROBUSTA DE AUTENTICAÇÃO
    if (!isUserReady) {
      console.log('⏳ useClients: Aguardando autenticação para verificar duplicados...');
      return { hasDuplicates: false, duplicates: [], error: 'Aguardando autenticação' };
    }

    setDuplicateCheck(true);
    
    try {
      console.log('🔍 Verificando duplicados para:', { phone, email, nif });
      const duplicates = [];
      
      // Verificar por telefone (normalizado)
      if (phone) {
        const normalizedPhone = phone.replace(/\s|-/g, '');
        const phoneQuery = query(
          collection(db, CLIENTS_COLLECTION),
          where('userId', '==', activeUser.uid),
          where('phoneNormalized', '==', normalizedPhone)
        );
        
        const phoneSnapshot = await getDocs(phoneQuery);
        phoneSnapshot.forEach((doc) => {
          if (!excludeId || doc.id !== excludeId) {
            duplicates.push({
              id: doc.id,
              name: doc.data().name,
              duplicateField: 'phone',
              value: doc.data().phone
            });
          }
        });
      }

      // Verificar por email
      if (email) {
        const emailQuery = query(
          collection(db, CLIENTS_COLLECTION),
          where('userId', '==', activeUser.uid),
          where('email', '==', email.toLowerCase())
        );
        
        const emailSnapshot = await getDocs(emailQuery);
        emailSnapshot.forEach((doc) => {
          if (!excludeId || doc.id !== excludeId) {
            const alreadyFound = duplicates.find(d => d.id === doc.id);
            if (!alreadyFound) {
              duplicates.push({
                id: doc.id,
                name: doc.data().name,
                duplicateField: 'email',
                value: doc.data().email
              });
            }
          }
        });
      }

      // Verificar por NIF
      if (nif) {
        const nifQuery = query(
          collection(db, CLIENTS_COLLECTION),
          where('userId', '==', activeUser.uid),
          where('nif', '==', nif)
        );
        
        const nifSnapshot = await getDocs(nifQuery);
        nifSnapshot.forEach((doc) => {
          if (!excludeId || doc.id !== excludeId) {
            const alreadyFound = duplicates.find(d => d.id === doc.id);
            if (!alreadyFound) {
              duplicates.push({
                id: doc.id,
                name: doc.data().name,
                duplicateField: 'nif',
                value: doc.data().nif
              });
            }
          }
        });
      }

      console.log(`✅ Verificação de duplicados concluída: ${duplicates.length} encontrados`);

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
  }, [isUserReady, activeUser]);

  // ➕ CRIAR NOVO CLIENTE
  const createClient = useCallback(async (clientData) => {
    if (!isUserReady) {
      throw new Error('Utilizador não autenticado');
    }

    setCreating(true);
    setError(null);

    try {
      console.log('📝 Criando novo cliente:', clientData.name);

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
          postalCode: clientData.address?.postalCode?.trim() || '',
          city: clientData.address?.city?.trim() || '',
          district: clientData.address?.district?.trim() || '',
          country: clientData.address?.country?.trim() || 'Portugal'
        },
        
        // Preferências imobiliárias
        preferences: {
          propertyTypes: clientData.preferences?.propertyTypes || [],
          budgetRange: clientData.preferences?.budgetRange || '',
          locations: clientData.preferences?.locations || [],
          urgency: clientData.preferences?.urgency || 'media'
        },
        
        // Metadados
        userId: activeUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Estatísticas iniciais
        stats: {
          totalInteractions: 0,
          lastInteraction: null,
          leadsConverted: 0,
          propertiesViewed: 0
        },
        
        // Notas e observações
        notes: clientData.notes?.trim() || '',
        tags: clientData.tags || [],
        
        // Dados de origem
        source: clientData.source || 'manual',
        referral: clientData.referral?.trim() || ''
      };

      // Inserir no Firestore
      const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), newClient);
      
      // Adicionar à lista local
      const clientWithId = {
        id: docRef.id,
        ...newClient,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setClients(prev => [clientWithId, ...prev]);

      console.log(`✅ Cliente ${clientData.name} criado com ID: ${docRef.id}`);
      
      return {
        success: true,
        id: docRef.id,
        client: clientWithId,
        message: `Cliente ${clientData.name} criado com sucesso!`
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
  }, [isUserReady, activeUser, checkForDuplicates]);

  // ✏️ ATUALIZAR CLIENTE
  const updateClient = useCallback(async (clientId, updateData) => {
    if (!isUserReady) return;

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
      
      return {
        success: false,
        error: err.message,
        message: `Erro ao atualizar cliente: ${err.message}`
      };
    } finally {
      setUpdating(false);
    }
  }, [isUserReady, checkForDuplicates]);

  // 🎯 ATUALIZAR STATUS DO CLIENTE
  const updateClientStatus = useCallback(async (clientId, newStatus) => {
    return await updateClient(clientId, { status: newStatus });
  }, [updateClient]);

  // 🗑️ ELIMINAR CLIENTE
  const deleteClient = useCallback(async (clientId) => {
    if (!isUserReady) return;

    try {
      await deleteDoc(doc(db, CLIENTS_COLLECTION, clientId));
      
      // Remover da lista local
      setClients(prev => prev.filter(client => client.id !== clientId));
      
      console.log(`✅ Cliente ${clientId} eliminado`);
      return { success: true, message: 'Cliente eliminado com sucesso!' };

    } catch (err) {
      console.error('❌ Erro ao eliminar cliente:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [isUserReady]);

  // 💬 ADICIONAR INTERAÇÃO
  const addInteraction = useCallback(async (clientId, interactionData) => {
    if (!isUserReady) return;

    try {
      const interaction = {
        ...interactionData,
        id: Date.now().toString(),
        createdAt: serverTimestamp(),
        userId: activeUser.uid
      };

      await updateDoc(doc(db, CLIENTS_COLLECTION, clientId), {
        [`interactions.${interaction.id}`]: interaction,
        lastInteraction: serverTimestamp(),
        'stats.totalInteractions': (clients.find(c => c.id === clientId)?.stats?.totalInteractions || 0) + 1,
        updatedAt: serverTimestamp()
      });

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
                  totalInteractions: (client.stats?.totalInteractions || 0) + 1 
                }
              }
            : client
        )
      );

      return { success: true, interaction };

    } catch (err) {
      console.error('❌ Erro ao adicionar interação:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [isUserReady, activeUser, clients]);

  // 🔍 BUSCA DE CLIENTES
  const searchClients = useCallback((searchTerm) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  // 📊 ESTATÍSTICAS DOS CLIENTES
  const getClientStats = useCallback(() => {
    const total = clients.length;
    const active = clients.filter(c => c.status === CLIENT_STATUS.ATIVO).length;
    const prospects = clients.filter(c => c.status === CLIENT_STATUS.PROSPETO).length;
    
    return {
      total,
      active,
      prospects,
      inactive: total - active - prospects,
      byType: {
        buyers: clients.filter(c => c.clientType === CLIENT_TYPES.COMPRADOR).length,
        sellers: clients.filter(c => c.clientType === CLIENT_TYPES.VENDEDOR).length,
        tenants: clients.filter(c => c.clientType === CLIENT_TYPES.INQUILINO).length,
        landlords: clients.filter(c => c.clientType === CLIENT_TYPES.SENHORIO).length
      }
    };
  }, [clients]);

  // 🔄 EFFECT PRINCIPAL - CARREGAR DADOS
  useEffect(() => {
    if (isUserReady && !authLoading) {
      console.log('🚀 useClients: Utilizador pronto, carregando clientes...');
      fetchClients();
    }
  }, [isUserReady, authLoading, fetchClients]);

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
    isConnected: isUserReady && !error,
    isUserReady,
    authStatus: {
      isAuthenticated,
      hasUser: !!activeUser,
      userId: activeUser?.uid,
      authLoading
    }
  };
};

export default useClients;