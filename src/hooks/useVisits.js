// src/hooks/useVisits.js
import { useState, useEffect, useCallback, useMemo } from 'react';
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

// 🎯 HOOK PERSONALIZADO PARA GESTÃO DE VISITAS
// =============================================
// MyImoMate 3.0 - Módulo Core de Visitas (CORE DO NEGÓCIO)
// Funcionalidades: Agendamento, Confirmações, Feedback, Partilhas, Lembretes, Firebase

// 📊 STATUS DAS VISITAS (fluxo do negócio)
export const VISIT_STATUS = {
  AGENDADA: 'agendada',
  CONFIRMADA_CLIENTE: 'confirmada_cliente',
  CONFIRMADA_CONSULTOR: 'confirmada_consultor', 
  CONFIRMADA_AMBOS: 'confirmada_ambos',
  EM_CURSO: 'em_curso',
  REALIZADA: 'realizada',
  NAO_COMPARECEU: 'nao_compareceu',
  CANCELADA: 'cancelada',
  REAGENDADA: 'reagendada'
};

// 🎨 CORES POR STATUS (para UI)
export const VISIT_STATUS_COLORS = {
  [VISIT_STATUS.AGENDADA]: 'bg-blue-100 text-blue-800',
  [VISIT_STATUS.CONFIRMADA_CLIENTE]: 'bg-yellow-100 text-yellow-800',
  [VISIT_STATUS.CONFIRMADA_CONSULTOR]: 'bg-orange-100 text-orange-800',
  [VISIT_STATUS.CONFIRMADA_AMBOS]: 'bg-green-100 text-green-800',
  [VISIT_STATUS.EM_CURSO]: 'bg-purple-100 text-purple-800',
  [VISIT_STATUS.REALIZADA]: 'bg-emerald-100 text-emerald-800',
  [VISIT_STATUS.NAO_COMPARECEU]: 'bg-red-100 text-red-800',
  [VISIT_STATUS.CANCELADA]: 'bg-gray-100 text-gray-800',
  [VISIT_STATUS.REAGENDADA]: 'bg-indigo-100 text-indigo-800'
};

// 🏠 TIPOS DE VISITA
export const VISIT_TYPES = {
  PRESENCIAL: 'presencial',
  VIRTUAL: 'virtual',
  AVALIACAO: 'avaliacao',
  SEGUNDA_VISITA: 'segunda_visita',
  VISITA_TECNICA: 'visita_tecnica'
};

// 🏡 TIPOS DE PROPRIEDADE
export const PROPERTY_TYPES = {
  CASA: 'casa',
  APARTAMENTO: 'apartamento',
  TERRENO: 'terreno',
  COMERCIAL: 'comercial',
  ESCRITORIO: 'escritorio',
  ARMAZEM: 'armazem',
  QUINTAS: 'quintas',
  OUTROS: 'outros'
};

// 💼 TIPOS DE OPERAÇÃO
export const OPERATION_TYPES = {
  VENDA: 'venda',
  ARRENDAMENTO: 'arrendamento',
  INVESTIMENTO: 'investimento',
  AVALIACAO: 'avaliacao'
};

// 📊 RESULTADOS DAS VISITAS
export const VISIT_OUTCOMES = {
  INTERESSADO: 'interessado',
  NAO_INTERESSADO: 'nao_interessado',
  PROPOSTA: 'proposta',
  SEGUNDA_VISITA: 'segunda_visita',
  NECESSITA_FINANCIAMENTO: 'necessita_financiamento',
  PRECO_ELEVADO: 'preco_elevado',
  NAO_COMPARECEU: 'nao_compareceu',
  CANCELOU: 'cancelou'
};

// 🔧 CONFIGURAÇÕES DO HOOK
const VISITS_COLLECTION = 'visits';
const CLIENTS_COLLECTION = 'clients';
const VISIT_FEEDBACK_COLLECTION = 'visit_feedback';
const FETCH_LIMIT = 50;

// 📱 REGEX PARA VALIDAÇÕES PORTUGUESAS
const PORTUGUESE_PHONE_REGEX = /^(\+351|351|00351)?[ -]?9[1236][0-9][ -]?[0-9]{3}[ -]?[0-9]{3}$/;
const POSTAL_CODE_REGEX = /^[0-9]{4}-[0-9]{3}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 🎯 HOOK PRINCIPAL
const useVisits = () => {
  // Estados principais
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Estados de filtros
  const [filters, setFilters] = useState({
    status: '',
    visitType: '',
    dateRange: 'upcoming',
    clientName: '',
    propertyType: ''
  });

  // Context de autenticação
  const { user } = useAuth();

  // 📥 BUSCAR TODAS AS VISITAS
  const fetchVisits = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      let visitQuery = query(
        collection(db, VISITS_COLLECTION),
        where('userId', '==', user.uid),
        orderBy('scheduledDate', 'desc'),
        limit(FETCH_LIMIT)
      );

      // Aplicar filtros se existirem
      if (filters.status) {
        visitQuery = query(visitQuery, where('status', '==', filters.status));
      }
      
      if (filters.visitType) {
        visitQuery = query(visitQuery, where('visitType', '==', filters.visitType));
      }

      const querySnapshot = await getDocs(visitQuery);
      const visitsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledDate: doc.data().scheduledDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));

      // Aplicar filtros locais (para campos que não podem ser filtrados no Firebase)
      let filteredVisits = visitsData;

      if (filters.clientName) {
        filteredVisits = filteredVisits.filter(visit => 
          visit.clientName?.toLowerCase().includes(filters.clientName.toLowerCase())
        );
      }

      if (filters.dateRange && filters.dateRange !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        filteredVisits = filteredVisits.filter(visit => {
          const visitDate = visit.scheduledDate;
          if (!visitDate) return false;
          
          switch (filters.dateRange) {
            case 'today':
              const visitDay = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());
              return visitDay.getTime() === today.getTime();
            case 'week':
              const weekEnd = new Date(today);
              weekEnd.setDate(today.getDate() + 7);
              return visitDate >= today && visitDate <= weekEnd;
            case 'upcoming':
              return visitDate >= now;
            case 'past':
              return visitDate < now;
            default:
              return true;
          }
        });
      }

      setVisits(filteredVisits);
      console.log(`✅ ${filteredVisits.length} visitas carregadas`);

    } catch (err) {
      console.error('❌ Erro ao buscar visitas:', err);
      setError(`Erro ao carregar visitas: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  // 📝 CRIAR NOVA VISITA
  const createVisit = useCallback(async (visitData) => {
    if (!user) {
      throw new Error('Utilizador não autenticado');
    }

    setCreating(true);
    setError(null);

    try {
      // Validações básicas
      if (!visitData.clientId || !visitData.clientName) {
        throw new Error('Cliente é obrigatório');
      }

      if (!visitData.scheduledDate) {
        throw new Error('Data de agendamento é obrigatória');
      }

      if (!visitData.property?.address?.street) {
        throw new Error('Morada do imóvel é obrigatória');
      }

      // Verificar se a data não está no passado
      const scheduledDate = new Date(visitData.scheduledDate);
      const now = new Date();
      if (scheduledDate < now) {
        throw new Error('Não é possível agendar visita no passado');
      }

      // Preparar dados para inserção
      const newVisit = {
        // Dados básicos da visita
        clientId: visitData.clientId,
        clientName: visitData.clientName.trim(),
        scheduledDate: visitData.scheduledDate,
        duration: visitData.duration || 60,
        visitType: visitData.visitType || VISIT_TYPES.PRESENCIAL,
        
        // Dados do imóvel
        property: {
          type: visitData.property.type || PROPERTY_TYPES.APARTAMENTO,
          operation: visitData.property.operation || OPERATION_TYPES.VENDA,
          address: {
            street: visitData.property.address.street.trim(),
            number: visitData.property.address.number?.trim() || '',
            floor: visitData.property.address.floor?.trim() || '',
            postalCode: visitData.property.address.postalCode?.trim() || '',
            city: visitData.property.address.city?.trim() || '',
            district: visitData.property.address.district?.trim() || '',
            country: visitData.property.address.country || 'Portugal'
          },
          area: visitData.property.area || '',
          rooms: visitData.property.rooms || '',
          bathrooms: visitData.property.bathrooms || '',
          price: visitData.property.price || '',
          description: visitData.property.description?.trim() || '',
          condition: visitData.property.condition || 'good',
          internal_ref: visitData.property.internal_ref?.trim() || '',
          external_ref: visitData.property.external_ref?.trim() || ''
        },
        
        // Notas
        notes: visitData.notes?.trim() || '',
        internal_notes: visitData.internal_notes?.trim() || '',
        
        // Status e controle
        status: VISIT_STATUS.AGENDADA,
        
        // Confirmações
        confirmedByClient: false,
        confirmedByConsultor: false,
        clientConfirmedAt: null,
        consultorConfirmedAt: null,
        
        // Resultado da visita (preenchido depois)
        outcome: null,
        feedback: '',
        client_feedback: '',
        next_steps: '',
        follow_up_date: null,
        
        // Partilhas
        is_shared: false,
        shared_with: [],
        shared_notes: '',
        
        // Dados de auditoria
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        
        // Flags
        isActive: true,
        isCompleted: false,
        
        // Metadados técnicos
        userAgent: navigator.userAgent,
        ipAddress: 'N/A',
        source_details: {
          created_via: 'web_form',
          form_version: '1.0',
          timestamp: new Date().toISOString()
        }
      };

      // Inserir no Firebase
      const docRef = await addDoc(collection(db, VISITS_COLLECTION), newVisit);
      
      // Criar objeto completo para retorno
      const createdVisit = {
        id: docRef.id,
        ...newVisit,
        scheduledDate: new Date(visitData.scheduledDate),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Atualizar lista local
      setVisits(prev => [createdVisit, ...prev]);

      console.log('✅ Visita criada com sucesso:', docRef.id);
      
      return {
        success: true,
        visit: createdVisit,
        message: 'Visita agendada com sucesso!'
      };

    } catch (err) {
      console.error('❌ Erro ao criar visita:', err);
      const errorMessage = err.message || 'Erro inesperado ao agendar visita';
      setError(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setCreating(false);
    }
  }, [user]);

  // ✅ CONFIRMAR VISITA (dupla confirmação)
  const confirmVisit = useCallback(async (visitId, confirmerType = 'consultor') => {
    if (!user) {
      throw new Error('Utilizador não autenticado');
    }

    setConfirming(true);
    setError(null);

    try {
      const visitRef = doc(db, VISITS_COLLECTION, visitId);
      const visitSnap = await getDoc(visitRef);
      
      if (!visitSnap.exists()) {
        throw new Error('Visita não encontrada');
      }

      const visitData = visitSnap.data();
      
      // Preparar dados de confirmação
      const now = serverTimestamp();
      let updates = {
        updatedAt: now
      };

      if (confirmerType === 'consultor') {
        updates.confirmedByConsultor = true;
        updates.consultorConfirmedAt = now;
        
        // Se cliente já confirmou, marcar como confirmada por ambos
        if (visitData.confirmedByClient) {
          updates.status = VISIT_STATUS.CONFIRMADA_AMBOS;
        } else {
          updates.status = VISIT_STATUS.CONFIRMADA_CONSULTOR;
        }
      } else if (confirmerType === 'cliente') {
        updates.confirmedByClient = true;
        updates.clientConfirmedAt = now;
        
        // Se consultor já confirmou, marcar como confirmada por ambos
        if (visitData.confirmedByConsultor) {
          updates.status = VISIT_STATUS.CONFIRMADA_AMBOS;
        } else {
          updates.status = VISIT_STATUS.CONFIRMADA_CLIENTE;
        }
      }

      // Atualizar no Firebase
      await updateDoc(visitRef, updates);

      // Atualizar lista local
      setVisits(prev => 
        prev.map(visit => 
          visit.id === visitId 
            ? { 
                ...visit, 
                ...updates,
                updatedAt: new Date()
              }
            : visit
        )
      );

      const statusMessage = updates.status === VISIT_STATUS.CONFIRMADA_AMBOS 
        ? 'Visita confirmada por ambas as partes!'
        : `Visita confirmada pelo ${confirmerType}`;

      console.log(`✅ Visita ${visitId} confirmada por ${confirmerType}`);
      
      return { 
        success: true, 
        message: statusMessage 
      };

    } catch (err) {
      console.error('❌ Erro ao confirmar visita:', err);
      return { 
        success: false, 
        error: err.message 
      };
    } finally {
      setConfirming(false);
    }
  }, [user]);

  // 📝 ADICIONAR FEEDBACK DA VISITA
  const addVisitFeedback = useCallback(async (visitId, feedbackData) => {
    if (!user) {
      throw new Error('Utilizador não autenticado');
    }

    setUpdating(true);
    setError(null);

    try {
      const visitRef = doc(db, VISITS_COLLECTION, visitId);
      
      const updates = {
        outcome: feedbackData.outcome || VISIT_OUTCOMES.INTERESSADO,
        feedback: feedbackData.feedback?.trim() || '',
        client_feedback: feedbackData.client_feedback?.trim() || '',
        next_steps: feedbackData.next_steps?.trim() || '',
        follow_up_date: feedbackData.follow_up_date || null,
        status: VISIT_STATUS.REALIZADA,
        isCompleted: true,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Atualizar no Firebase
      await updateDoc(visitRef, updates);

      // Atualizar lista local
      setVisits(prev => 
        prev.map(visit => 
          visit.id === visitId 
            ? { 
                ...visit, 
                ...updates,
                updatedAt: new Date()
              }
            : visit
        )
      );

      console.log(`✅ Feedback adicionado à visita ${visitId}`);
      
      return { 
        success: true, 
        message: 'Feedback registado com sucesso!' 
      };

    } catch (err) {
      console.error('❌ Erro ao adicionar feedback:', err);
      return { 
        success: false, 
        error: err.message 
      };
    } finally {
      setUpdating(false);
    }
  }, [user]);

  // 🔄 ATUALIZAR STATUS DA VISITA
  const updateVisitStatus = useCallback(async (visitId, newStatus) => {
    if (!user) {
      throw new Error('Utilizador não autenticado');
    }

    setUpdating(true);
    setError(null);

    try {
      const visitRef = doc(db, VISITS_COLLECTION, visitId);
      
      const updates = {
        status: newStatus,
        updatedAt: serverTimestamp()
      };

      // Adicionar timestamps específicos baseados no status
      if (newStatus === VISIT_STATUS.EM_CURSO) {
        updates.startedAt = serverTimestamp();
      } else if (newStatus === VISIT_STATUS.REALIZADA) {
        updates.completedAt = serverTimestamp();
        updates.isCompleted = true;
      } else if (newStatus === VISIT_STATUS.CANCELADA) {
        updates.cancelledAt = serverTimestamp();
      }

      // Atualizar no Firebase
      await updateDoc(visitRef, updates);

      // Atualizar lista local
      setVisits(prev => 
        prev.map(visit => 
          visit.id === visitId 
            ? { 
                ...visit, 
                status: newStatus, 
                updatedAt: new Date() 
              }
            : visit
        )
      );

      console.log(`✅ Status da visita ${visitId} atualizado para: ${newStatus}`);
      
      return { 
        success: true, 
        message: 'Status atualizado com sucesso!' 
      };

    } catch (err) {
      console.error('❌ Erro ao atualizar status:', err);
      return { 
        success: false, 
        error: err.message 
      };
    } finally {
      setUpdating(false);
    }
  }, [user]);

  // 🤝 PARTILHAR VISITA COM OUTROS CONSULTORES
  const shareVisit = useCallback(async (visitId, consultorIds, notes = '') => {
    if (!user) {
      throw new Error('Utilizador não autenticado');
    }

    setUpdating(true);
    setError(null);

    try {
      const visitRef = doc(db, VISITS_COLLECTION, visitId);
      
      const updates = {
        is_shared: true,
        shared_with: consultorIds,
        shared_notes: notes.trim(),
        sharedAt: serverTimestamp(),
        sharedBy: user.uid,
        updatedAt: serverTimestamp()
      };

      // Atualizar no Firebase
      await updateDoc(visitRef, updates);

      // Atualizar lista local
      setVisits(prev => 
        prev.map(visit => 
          visit.id === visitId 
            ? { 
                ...visit, 
                ...updates,
                updatedAt: new Date()
              }
            : visit
        )
      );

      console.log(`✅ Visita ${visitId} partilhada com consultores`);
      
      return { 
        success: true, 
        message: 'Visita partilhada com sucesso!' 
      };

    } catch (err) {
      console.error('❌ Erro ao partilhar visita:', err);
      return { 
        success: false, 
        error: err.message 
      };
    } finally {
      setUpdating(false);
    }
  }, [user]);

  // ❌ CANCELAR VISITA
  const cancelVisit = useCallback(async (visitId, reason = '') => {
    if (!user) {
      throw new Error('Utilizador não autenticado');
    }

    setUpdating(true);
    setError(null);

    try {
      const visitRef = doc(db, VISITS_COLLECTION, visitId);
      
      const updates = {
        status: VISIT_STATUS.CANCELADA,
        cancelReason: reason.trim(),
        cancelledAt: serverTimestamp(),
        cancelledBy: user.uid,
        updatedAt: serverTimestamp()
      };

      // Atualizar no Firebase
      await updateDoc(visitRef, updates);

      // Atualizar lista local
      setVisits(prev => 
        prev.map(visit => 
          visit.id === visitId 
            ? { 
                ...visit, 
                ...updates,
                updatedAt: new Date()
              }
            : visit
        )
      );

      console.log(`✅ Visita ${visitId} cancelada`);
      
      return { 
        success: true, 
        message: 'Visita cancelada com sucesso!' 
      };

    } catch (err) {
      console.error('❌ Erro ao cancelar visita:', err);
      return { 
        success: false, 
        error: err.message 
      };
    } finally {
      setUpdating(false);
    }
  }, [user]);

  // 🗑️ ELIMINAR VISITA
  const deleteVisit = useCallback(async (visitId) => {
    if (!user) {
      throw new Error('Utilizador não autenticado');
    }

    setUpdating(true);
    setError(null);

    try {
      // Eliminar do Firebase
      await deleteDoc(doc(db, VISITS_COLLECTION, visitId));

      // Remover da lista local
      setVisits(prev => prev.filter(visit => visit.id !== visitId));

      console.log(`✅ Visita ${visitId} eliminada`);
      
      return { 
        success: true, 
        message: 'Visita eliminada com sucesso!' 
      };

    } catch (err) {
      console.error('❌ Erro ao eliminar visita:', err);
      return { 
        success: false, 
        error: err.message 
      };
    } finally {
      setUpdating(false);
    }
  }, [user]);

  // 📊 OBTER ESTATÍSTICAS DAS VISITAS
  const getVisitStats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const stats = {
      total: visits.length,
      today: 0,
      upcoming: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0,
      conversion_rate: 0
    };

    visits.forEach(visit => {
      const visitDate = visit.scheduledDate;
      
      // Visitas de hoje
      if (visitDate && visitDate >= today && visitDate < tomorrow) {
        stats.today++;
      }
      
      // Visitas futuras
      if (visitDate && visitDate >= now) {
        stats.upcoming++;
      }
      
      // Por status
      if (visit.status === VISIT_STATUS.CONFIRMADA_AMBOS || 
          visit.status === VISIT_STATUS.CONFIRMADA_CLIENTE ||
          visit.status === VISIT_STATUS.CONFIRMADA_CONSULTOR) {
        stats.confirmed++;
      }
      
      if (visit.status === VISIT_STATUS.REALIZADA) {
        stats.completed++;
      }
      
      if (visit.status === VISIT_STATUS.CANCELADA) {
        stats.cancelled++;
      }
    });

    // Taxa de conversão (visitas realizadas vs total agendado)
    const totalScheduled = stats.total - stats.cancelled;
    stats.conversion_rate = totalScheduled > 0 
      ? Math.round((stats.completed / totalScheduled) * 100) 
      : 0;

    return stats;
  }, [visits]);

  // 🔍 BUSCAR VISITAS (por nome do cliente ou morada)
  const searchVisits = useCallback((searchTerm) => {
    if (!searchTerm.trim()) {
      fetchVisits();
      return;
    }

    const filtered = visits.filter(visit => 
      visit.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.property?.address?.street?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.property?.address?.city?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setVisits(filtered);
  }, [visits, fetchVisits]);

  // 🔄 Carregar visitas quando user ou filtros mudarem
  useEffect(() => {
    if (user) {
      fetchVisits();
    }
  }, [user, fetchVisits]);

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
    visits,
    loading,
    error,
    creating,
    updating,
    confirming,
    filters,

    // Ações principais
    createVisit,
    confirmVisit,
    updateVisitStatus,
    addVisitFeedback,
    shareVisit,
    cancelVisit,
    deleteVisit,
    
    // Busca e filtros
    fetchVisits,
    searchVisits,
    setFilters,
    
    // Estatísticas
    getVisitStats,
    
    // Constantes úteis
    VISIT_STATUS,
    VISIT_TYPES,
    PROPERTY_TYPES,
    OPERATION_TYPES,
    VISIT_OUTCOMES,
    VISIT_STATUS_COLORS,
    
    // Helpers de validação
    isValidEmail: (email) => EMAIL_REGEX.test(email),
    isValidPhone: (phone) => PORTUGUESE_PHONE_REGEX.test(phone),
    isValidPostalCode: (code) => POSTAL_CODE_REGEX.test(code),
    normalizePhone: (phone) => phone?.replace(/\s|-/g, '') || '',
    
    // Estado de conectividade
    isConnected: !!user && !error
  };
};

export default useVisits;