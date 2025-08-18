// src/hooks/useOpportunities.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

// 🎯 HOOK PRINCIPAL PARA GESTÃO DE OPORTUNIDADES
// =============================================
// MyImoMate 3.0 - Sistema completo de pipeline de vendas
// Funcionalidades: CRUD, Pipeline, Probabilidades, Previsões, Análise

// 📊 CONSTANTES DO NEGÓCIO
const OPPORTUNITIES_COLLECTION = 'opportunities';
const CLIENTS_COLLECTION = 'clients';
const PROPERTIES_COLLECTION = 'properties';
const FETCH_LIMIT = 500;

// Status das oportunidades (pipeline de vendas)
const OPPORTUNITY_STATUS = {
  IDENTIFICACAO: 'identificacao',
  QUALIFICACAO: 'qualificacao',
  APRESENTACAO: 'apresentacao',
  NEGOCIACAO: 'negociacao',
  PROPOSTA: 'proposta',
  CONTRATO: 'contrato',
  FECHADO_GANHO: 'fechado_ganho',
  FECHADO_PERDIDO: 'fechado_perdido',
  PAUSADO: 'pausado'
};

// Probabilidades por status (%)
const STATUS_PROBABILITIES = {
  identificacao: 10,
  qualificacao: 25,
  apresentacao: 40,
  negociacao: 60,
  proposta: 80,
  contrato: 95,
  fechado_ganho: 100,
  fechado_perdido: 0,
  pausado: 0
};

// Tipos de oportunidade
const OPPORTUNITY_TYPES = {
  VENDA: 'venda',
  COMPRA: 'compra',
  ARRENDAMENTO: 'arrendamento',
  AVALIACAO: 'avaliacao',
  INVESTIMENTO: 'investimento'
};

// Prioridades
const OPPORTUNITY_PRIORITIES = {
  BAIXA: 'baixa',
  MEDIA: 'media',
  ALTA: 'alta',
  URGENTE: 'urgente'
};

// Origens da oportunidade
const OPPORTUNITY_SOURCES = {
  LEAD_CONVERSION: 'lead_conversion',
  CLIENT_DIRECT: 'client_direct',
  REFERRAL: 'referral',
  WEBSITE: 'website',
  SOCIAL_MEDIA: 'social_media',
  ADVERTISEMENT: 'advertisement',
  COLD_CALL: 'cold_call',
  EVENT: 'event',
  OTHER: 'other'
};

// Cores dos status para UI
const STATUS_COLORS = {
  identificacao: 'bg-gray-100 text-gray-800',
  qualificacao: 'bg-blue-100 text-blue-800',
  apresentacao: 'bg-yellow-100 text-yellow-800',
  negociacao: 'bg-orange-100 text-orange-800',
  proposta: 'bg-purple-100 text-purple-800',
  contrato: 'bg-green-100 text-green-800',
  fechado_ganho: 'bg-green-200 text-green-900',
  fechado_perdido: 'bg-red-100 text-red-800',
  pausado: 'bg-gray-200 text-gray-700'
};

// Regex para validações
const CURRENCY_REGEX = /^[0-9]+(\.[0-9]{1,2})?$/;
const PERCENTAGE_REGEX = /^[0-9]{1,3}$/;

// 🎯 HOOK PRINCIPAL
const useOpportunities = () => {
  // Estados principais
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estados de filtros
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    clientId: '',
    source: '',
    dateRange: 'all',
    searchTerm: ''
  });

  // Context de autenticação
  const { user } = useAuth();

  // 📥 BUSCAR TODAS AS OPORTUNIDADES
  const fetchOpportunities = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const oppQuery = query(
        collection(db, OPPORTUNITIES_COLLECTION),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(FETCH_LIMIT)
      );

      const querySnapshot = await getDocs(oppQuery);
      const oppsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        expectedCloseDate: doc.data().expectedCloseDate?.toDate(),
        actualCloseDate: doc.data().actualCloseDate?.toDate()
      }));

      setOpportunities(oppsData);
    } catch (err) {
      console.error('Erro ao buscar oportunidades:', err);
      setError('Erro ao carregar oportunidades. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ➕ CRIAR NOVA OPORTUNIDADE
  const createOpportunity = async (opportunityData) => {
    if (!user) return { success: false, error: 'Utilizador não autenticado' };
    
    setCreating(true);
    setError(null);
    
    try {
      // Validar dados obrigatórios
      const validation = validateOpportunityData(opportunityData);
      if (!validation.isValid) {
        setCreating(false);
        return { success: false, error: validation.errors.join(', ') };
      }

      // Preparar dados para criação
      const newOpportunity = {
        ...opportunityData,
        userId: user.uid,
        status: opportunityData.status || OPPORTUNITY_STATUS.IDENTIFICACAO,
        probability: opportunityData.probability || STATUS_PROBABILITIES[opportunityData.status || 'identificacao'],
        totalValue: parseFloat(opportunityData.totalValue || 0),
        commissionValue: parseFloat(opportunityData.commissionValue || 0),
        commissionPercentage: parseFloat(opportunityData.commissionPercentage || 0),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        // Dados de auditoria
        createdBy: user.uid,
        updatedBy: user.uid,
        createdFromIP: await getUserIP(),
        userAgent: navigator.userAgent
      };

      // Adicionar à base de dados
      const docRef = await addDoc(collection(db, OPPORTUNITIES_COLLECTION), newOpportunity);
      
      // Atualizar lista local
      const createdOpportunity = {
        id: docRef.id,
        ...newOpportunity,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setOpportunities(prev => [createdOpportunity, ...prev]);
      
      // Atualizar contador do cliente (se existir)
      if (opportunityData.clientId) {
        await updateClientOpportunityCount(opportunityData.clientId, 'increment');
      }

      setCreating(false);
      return { success: true, opportunity: createdOpportunity };
      
    } catch (err) {
      console.error('Erro ao criar oportunidade:', err);
      setError('Erro ao criar oportunidade. Tente novamente.');
      setCreating(false);
      return { success: false, error: err.message };
    }
  };

  // ✏️ ATUALIZAR OPORTUNIDADE
  const updateOpportunity = async (opportunityId, updates) => {
    if (!user) return { success: false, error: 'Utilizador não autenticado' };
    
    setUpdating(true);
    setError(null);
    
    try {
      // Validar dados
      const validation = validateOpportunityData(updates, false);
      if (!validation.isValid) {
        setUpdating(false);
        return { success: false, error: validation.errors.join(', ') };
      }

      // Preparar dados para atualização
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid
      };

      // Atualizar probabilidade se status mudou
      if (updates.status && STATUS_PROBABILITIES[updates.status] !== undefined) {
        updateData.probability = STATUS_PROBABILITIES[updates.status];
      }

      // Atualizar valores monetários se fornecidos
      if (updates.totalValue !== undefined) {
        updateData.totalValue = parseFloat(updates.totalValue);
      }
      if (updates.commissionValue !== undefined) {
        updateData.commissionValue = parseFloat(updates.commissionValue);
      }
      if (updates.commissionPercentage !== undefined) {
        updateData.commissionPercentage = parseFloat(updates.commissionPercentage);
      }

      // Atualizar na base de dados
      const oppRef = doc(db, OPPORTUNITIES_COLLECTION, opportunityId);
      await updateDoc(oppRef, updateData);
      
      // Atualizar lista local
      setOpportunities(prev => prev.map(opp => 
        opp.id === opportunityId 
          ? { ...opp, ...updateData, updatedAt: new Date() }
          : opp
      ));

      setUpdating(false);
      return { success: true };
      
    } catch (err) {
      console.error('Erro ao atualizar oportunidade:', err);
      setError('Erro ao atualizar oportunidade. Tente novamente.');
      setUpdating(false);
      return { success: false, error: err.message };
    }
  };

  // 🔄 ATUALIZAR STATUS DA OPORTUNIDADE
  const updateOpportunityStatus = async (opportunityId, newStatus, reason = '') => {
    const updates = { 
      status: newStatus,
      probability: STATUS_PROBABILITIES[newStatus] || 0,
      statusChangeReason: reason
    };

    // Se fechou (ganho ou perdido), adicionar data de fecho
    if (newStatus === OPPORTUNITY_STATUS.FECHADO_GANHO || newStatus === OPPORTUNITY_STATUS.FECHADO_PERDIDO) {
      updates.actualCloseDate = serverTimestamp();
    }

    return await updateOpportunity(opportunityId, updates);
  };

  // 🗑️ ELIMINAR OPORTUNIDADE
  const deleteOpportunity = async (opportunityId) => {
    if (!user) return { success: false, error: 'Utilizador não autenticado' };
    
    setDeleting(true);
    setError(null);
    
    try {
      // Encontrar a oportunidade para obter o clientId
      const opportunity = opportunities.find(opp => opp.id === opportunityId);
      
      // Eliminar da base de dados
      await deleteDoc(doc(db, OPPORTUNITIES_COLLECTION, opportunityId));
      
      // Atualizar lista local
      setOpportunities(prev => prev.filter(opp => opp.id !== opportunityId));
      
      // Atualizar contador do cliente (se existir)
      if (opportunity?.clientId) {
        await updateClientOpportunityCount(opportunity.clientId, 'decrement');
      }

      setDeleting(false);
      return { success: true };
      
    } catch (err) {
      console.error('Erro ao eliminar oportunidade:', err);
      setError('Erro ao eliminar oportunidade. Tente novamente.');
      setDeleting(false);
      return { success: false, error: err.message };
    }
  };

  // 📞 ADICIONAR ATIVIDADE À OPORTUNIDADE
  const addActivity = async (opportunityId, activityData) => {
    if (!user) return { success: false, error: 'Utilizador não autenticado' };
    
    try {
      const activity = {
        ...activityData,
        id: Date.now().toString(),
        userId: user.uid,
        createdAt: new Date(),
        createdBy: user.uid
      };

      // Atualizar oportunidade com nova atividade
      const opportunity = opportunities.find(opp => opp.id === opportunityId);
      if (!opportunity) {
        return { success: false, error: 'Oportunidade não encontrada' };
      }

      const activities = [...(opportunity.activities || []), activity];
      
      await updateOpportunity(opportunityId, { 
        activities,
        lastActivityDate: serverTimestamp()
      });

      return { success: true, activity };
      
    } catch (err) {
      console.error('Erro ao adicionar atividade:', err);
      return { success: false, error: err.message };
    }
  };

  // 🔍 PESQUISAR OPORTUNIDADES
  const searchOpportunities = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      await fetchOpportunities();
      return;
    }

    setLoading(true);
    
    try {
      // Buscar por múltiplos campos
      const filtered = opportunities.filter(opp =>
        opp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.propertyAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setOpportunities(filtered);
    } catch (err) {
      console.error('Erro na pesquisa:', err);
      setError('Erro na pesquisa. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // 📊 ESTATÍSTICAS DAS OPORTUNIDADES
  const getOpportunityStats = useMemo(() => {
    const stats = {
      total: opportunities.length,
      byStatus: {},
      byType: {},
      byPriority: {},
      totalValue: 0,
      averageValue: 0,
      conversionRate: 0,
      pipelineValue: 0
    };

    opportunities.forEach(opp => {
      // Contagem por status
      stats.byStatus[opp.status] = (stats.byStatus[opp.status] || 0) + 1;
      
      // Contagem por tipo
      stats.byType[opp.type] = (stats.byType[opp.type] || 0) + 1;
      
      // Contagem por prioridade
      stats.byPriority[opp.priority] = (stats.byPriority[opp.priority] || 0) + 1;
      
      // Valores monetários
      const value = parseFloat(opp.totalValue || 0);
      stats.totalValue += value;
      
      // Valor do pipeline (apenas oportunidades ativas)
      if (opp.status !== OPPORTUNITY_STATUS.FECHADO_GANHO && 
          opp.status !== OPPORTUNITY_STATUS.FECHADO_PERDIDO) {
        stats.pipelineValue += value * (opp.probability / 100);
      }
    });

    // Valor médio
    stats.averageValue = stats.total > 0 ? stats.totalValue / stats.total : 0;

    // Taxa de conversão
    const wonOpps = stats.byStatus[OPPORTUNITY_STATUS.FECHADO_GANHO] || 0;
    const lostOpps = stats.byStatus[OPPORTUNITY_STATUS.FECHADO_PERDIDO] || 0;
    const closedOpps = wonOpps + lostOpps;
    stats.conversionRate = closedOpps > 0 ? (wonOpps / closedOpps * 100) : 0;

    return stats;
  }, [opportunities]);

  // 🔧 FUNÇÕES AUXILIARES

  // Validar dados da oportunidade
  const validateOpportunityData = (data, isCreate = true) => {
    const errors = [];

    if (isCreate || data.title !== undefined) {
      if (!data.title || data.title.trim().length < 3) {
        errors.push('Título deve ter pelo menos 3 caracteres');
      }
    }

    if (isCreate || data.clientId !== undefined) {
      if (!data.clientId) {
        errors.push('Cliente é obrigatório');
      }
    }

    if (data.totalValue !== undefined) {
      if (!CURRENCY_REGEX.test(data.totalValue.toString())) {
        errors.push('Valor total inválido');
      }
    }

    if (data.commissionPercentage !== undefined) {
      const percentage = parseInt(data.commissionPercentage);
      if (!PERCENTAGE_REGEX.test(percentage.toString()) || percentage > 100) {
        errors.push('Percentagem de comissão inválida (0-100)');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Atualizar contador de oportunidades do cliente
  const updateClientOpportunityCount = async (clientId, operation) => {
    try {
      const clientRef = doc(db, CLIENTS_COLLECTION, clientId);
      const incrementValue = operation === 'increment' ? 1 : -1;
      
      await updateDoc(clientRef, {
        totalOpportunities: increment(incrementValue),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Erro ao atualizar contador do cliente:', err);
    }
  };

  // Obter IP do utilizador
  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  // Validar valor monetário
  const isValidCurrency = (value) => {
    return CURRENCY_REGEX.test(value.toString());
  };

  // Formatar valor monetário
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value || 0);
  };

  // Calcular comissão
  const calculateCommission = (totalValue, percentage) => {
    return (parseFloat(totalValue || 0) * parseFloat(percentage || 0)) / 100;
  };

  // 🔄 EFEITOS
  useEffect(() => {
    if (user) {
      fetchOpportunities();
    }
  }, [user, fetchOpportunities]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 📤 RETORNO DO HOOK
  return {
    // Estados
    opportunities,
    loading,
    error,
    creating,
    updating,
    deleting,
    filters,

    // Ações principais
    createOpportunity,
    updateOpportunity,
    updateOpportunityStatus,
    deleteOpportunity,
    addActivity,
    
    // Busca e filtros
    fetchOpportunities,
    searchOpportunities,
    setFilters,
    
    // Estatísticas
    getOpportunityStats,
    
    // Constantes úteis
    OPPORTUNITY_STATUS,
    OPPORTUNITY_TYPES,
    OPPORTUNITY_PRIORITIES,
    OPPORTUNITY_SOURCES,
    STATUS_COLORS,
    STATUS_PROBABILITIES,
    
    // Helpers
    isValidCurrency,
    formatCurrency,
    calculateCommission,
    validateOpportunityData,
    
    // Estado de conectividade
    isConnected: !!user && !error
  };
};

export default useOpportunities;