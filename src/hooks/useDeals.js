// src/hooks/useDeals.js
import { useState, useEffect, useMemo, useCallback } from 'react';
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
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

// 🎯 HOOK PERSONALIZADO PARA SISTEMA DE NEGÓCIOS (DEALS)
// =====================================================
// MyImoMate 3.0 - Gestão completa do fecho de vendas
// Funcionalidades: Pipeline, Contratos, Comissões, Follow-ups, Métricas

const useDeals = () => {
  const { user } = useAuth();
  
  // Estados principais
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estados para filtros e pesquisa
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    dealType: 'all',
    dateRange: 'all',
    searchTerm: '',
    clientName: '',
    propertyType: 'all',
    valueRange: 'all'
  });

  // 📋 CONSTANTES DO SISTEMA DE NEGÓCIOS
  // ====================================

  const DEAL_STATUS = {
    PROPOSTA: 'proposta',
    ACEITA: 'aceita',
    NEGOCIACAO: 'negociacao',
    CONTRATO: 'contrato',
    ASSINADO: 'assinado',
    CONDICOES: 'condicoes',
    FINANCIAMENTO: 'financiamento',
    ESCRITURA: 'escritura',
    FECHADO: 'fechado',
    CANCELADO: 'cancelado',
    SUSPENSO: 'suspenso'
  };

  const DEAL_TYPES = {
    VENDA: 'venda',
    ARRENDAMENTO: 'arrendamento',
    COMPRA: 'compra',
    PERMUTA: 'permuta',
    AVALIACAO: 'avaliacao',
    CONSULTORIA: 'consultoria'
  };

  const DEAL_PRIORITY = {
    BAIXA: 'baixa',
    MEDIA: 'media',
    ALTA: 'alta',
    URGENTE: 'urgente',
    CRITICA: 'critica'
  };

  const PROPERTY_TYPES = {
    APARTAMENTO: 'apartamento',
    MORADIA: 'moradia',
    TERRENO: 'terreno',
    COMERCIAL: 'comercial',
    INDUSTRIAL: 'industrial',
    ESCRITORIO: 'escritorio',
    LOJA: 'loja',
    ARMAZEM: 'armazem'
  };

  const CONTRACT_STATUS = {
    PENDENTE: 'pendente',
    PREPARACAO: 'preparacao',
    REVISAO: 'revisao',
    ASSINATURA: 'assinatura',
    ASSINADO: 'assinado',
    REGISTADO: 'registado'
  };

  const FINANCING_STATUS = {
    NAO_APLICAVEL: 'nao_aplicavel',
    PENDENTE: 'pendente',
    ANALISE: 'analise',
    APROVADO: 'aprovado',
    REJEITADO: 'rejeitado',
    CONDICIONAL: 'condicional'
  };

  // 🎨 CORES DOS STATUS (para UI)
  const DEAL_STATUS_COLORS = {
    [DEAL_STATUS.PROPOSTA]: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    [DEAL_STATUS.ACEITA]: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    [DEAL_STATUS.NEGOCIACAO]: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    [DEAL_STATUS.CONTRATO]: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    [DEAL_STATUS.ASSINADO]: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
    [DEAL_STATUS.CONDICOES]: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    [DEAL_STATUS.FINANCIAMENTO]: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' },
    [DEAL_STATUS.ESCRITURA]: { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-200' },
    [DEAL_STATUS.FECHADO]: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
    [DEAL_STATUS.CANCELADO]: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    [DEAL_STATUS.SUSPENSO]: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
  };

  // 📊 PERCENTAGENS DE PROBABILIDADE POR STATUS
  const STATUS_PROBABILITY = {
    [DEAL_STATUS.PROPOSTA]: 10,
    [DEAL_STATUS.ACEITA]: 25,
    [DEAL_STATUS.NEGOCIACAO]: 40,
    [DEAL_STATUS.CONTRATO]: 60,
    [DEAL_STATUS.ASSINADO]: 75,
    [DEAL_STATUS.CONDICOES]: 80,
    [DEAL_STATUS.FINANCIAMENTO]: 85,
    [DEAL_STATUS.ESCRITURA]: 95,
    [DEAL_STATUS.FECHADO]: 100,
    [DEAL_STATUS.CANCELADO]: 0,
    [DEAL_STATUS.SUSPENSO]: 0
  };

  // 🔄 CARREGAR NEGÓCIOS DO FIREBASE
  // ================================
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const dealsRef = collection(db, 'deals');
    const q = query(
      dealsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const dealsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
          expectedCloseDate: doc.data().expectedCloseDate?.toDate(),
          contractDate: doc.data().contractDate?.toDate(),
          closedDate: doc.data().closedDate?.toDate()
        }));
        setDeals(dealsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Erro ao carregar negócios:', err);
        setError('Erro ao carregar negócios. Tente novamente.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // 🆕 CRIAR NOVO NEGÓCIO
  // ====================
  const createDeal = useCallback(async (dealData) => {
    if (!user?.uid) {
      setError('Utilizador não autenticado');
      return false;
    }

    setCreating(true);
    setError(null);

    try {
      // Validações obrigatórias
      if (!dealData.title?.trim()) {
        throw new Error('Título do negócio é obrigatório');
      }
      if (!dealData.clientId?.trim()) {
        throw new Error('Cliente é obrigatório');
      }
      if (!dealData.value || dealData.value <= 0) {
        throw new Error('Valor do negócio deve ser maior que zero');
      }

      // Calcular comissão automaticamente
      const commissionValue = dealData.value * (dealData.commissionPercentage / 100);
      const expectedValue = dealData.value * (STATUS_PROBABILITY[dealData.status] / 100);

      const newDeal = {
        ...dealData,
        userId: user.uid,
        commissionValue,
        expectedValue,
        status: dealData.status || DEAL_STATUS.PROPOSTA,
        priority: dealData.priority || DEAL_PRIORITY.MEDIA,
        dealType: dealData.dealType || DEAL_TYPES.VENDA,
        contractStatus: CONTRACT_STATUS.PENDENTE,
        financingStatus: FINANCING_STATUS.NAO_APLICAVEL,
        activities: [],
        documents: [],
        followUps: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        // Auditoria
        createdBy: user.uid,
        lastModifiedBy: user.uid,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          ip: 'client-ip'
        }
      };

      const docRef = await addDoc(collection(db, 'deals'), newDeal);

      // Log de atividade
      await addActivity(docRef.id, {
        type: 'creation',
        description: 'Negócio criado',
        userId: user.uid
      });

      setCreating(false);
      return docRef.id;
    } catch (err) {
      console.error('Erro ao criar negócio:', err);
      setError(err.message || 'Erro ao criar negócio');
      setCreating(false);
      return false;
    }
  }, [user?.uid]);

  // ✏️ ATUALIZAR NEGÓCIO
  // ===================
  const updateDeal = useCallback(async (dealId, updateData) => {
    if (!user?.uid || !dealId) {
      setError('Dados inválidos para atualização');
      return false;
    }

    setUpdating(true);
    setError(null);

    try {
      const dealRef = doc(db, 'deals', dealId);
      
      // Recalcular valores se necessário
      const updates = { ...updateData };
      if (updateData.value || updateData.commissionPercentage || updateData.status) {
        const currentDeal = deals.find(d => d.id === dealId);
        const value = updateData.value || currentDeal.value;
        const commissionPercentage = updateData.commissionPercentage || currentDeal.commissionPercentage;
        const status = updateData.status || currentDeal.status;
        
        updates.commissionValue = value * (commissionPercentage / 100);
        updates.expectedValue = value * (STATUS_PROBABILITY[status] / 100);
      }

      updates.updatedAt = Timestamp.now();
      updates.lastModifiedBy = user.uid;

      await updateDoc(dealRef, updates);

      // Log de atividade
      await addActivity(dealId, {
        type: 'update',
        description: `Negócio atualizado: ${Object.keys(updateData).join(', ')}`,
        userId: user.uid
      });

      setUpdating(false);
      return true;
    } catch (err) {
      console.error('Erro ao atualizar negócio:', err);
      setError('Erro ao atualizar negócio');
      setUpdating(false);
      return false;
    }
  }, [user?.uid, deals]);

  // 🔄 ATUALIZAR STATUS DO NEGÓCIO
  // =============================
  const updateDealStatus = useCallback(async (dealId, newStatus, notes = '') => {
    if (!user?.uid || !dealId || !newStatus) {
      setError('Dados inválidos para atualização de status');
      return false;
    }

    try {
      const currentDeal = deals.find(d => d.id === dealId);
      if (!currentDeal) {
        throw new Error('Negócio não encontrado');
      }

      const updates = {
        status: newStatus,
        expectedValue: currentDeal.value * (STATUS_PROBABILITY[newStatus] / 100),
        updatedAt: Timestamp.now(),
        lastModifiedBy: user.uid
      };

      // Se fechado com sucesso, definir data de fecho
      if (newStatus === DEAL_STATUS.FECHADO) {
        updates.closedDate = Timestamp.now();
        updates.actualCloseDate = Timestamp.now();
      }

      const dealRef = doc(db, 'deals', dealId);
      await updateDoc(dealRef, updates);

      // Log de atividade
      await addActivity(dealId, {
        type: 'status_change',
        description: `Status alterado para: ${newStatus}${notes ? ` - ${notes}` : ''}`,
        userId: user.uid,
        oldStatus: currentDeal.status,
        newStatus
      });

      return true;
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      setError('Erro ao atualizar status do negócio');
      return false;
    }
  }, [user?.uid, deals]);

  // 🗑️ EXCLUIR NEGÓCIO
  // ==================
  const deleteDeal = useCallback(async (dealId) => {
    if (!user?.uid || !dealId) {
      setError('Dados inválidos para exclusão');
      return false;
    }

    setDeleting(true);
    setError(null);

    try {
      await deleteDoc(doc(db, 'deals', dealId));
      setDeleting(false);
      return true;
    } catch (err) {
      console.error('Erro ao excluir negócio:', err);
      setError('Erro ao excluir negócio');
      setDeleting(false);
      return false;
    }
  }, [user?.uid]);

  // 📝 ADICIONAR ATIVIDADE AO NEGÓCIO
  // ================================
  const addActivity = useCallback(async (dealId, activityData) => {
    if (!user?.uid || !dealId) return false;

    try {
      const dealRef = doc(db, 'deals', dealId);
      const deal = await getDoc(dealRef);
      
      if (!deal.exists()) {
        throw new Error('Negócio não encontrado');
      }

      const currentActivities = deal.data().activities || [];
      const newActivity = {
        id: Date.now().toString(),
        ...activityData,
        timestamp: Timestamp.now(),
        userId: user.uid
      };

      await updateDoc(dealRef, {
        activities: [...currentActivities, newActivity],
        updatedAt: Timestamp.now()
      });

      return true;
    } catch (err) {
      console.error('Erro ao adicionar atividade:', err);
      return false;
    }
  }, [user?.uid]);

  // 📎 ADICIONAR DOCUMENTO AO NEGÓCIO
  // ================================
  const addDocument = useCallback(async (dealId, documentData) => {
    if (!user?.uid || !dealId) return false;

    try {
      const dealRef = doc(db, 'deals', dealId);
      const deal = await getDoc(dealRef);
      
      if (!deal.exists()) {
        throw new Error('Negócio não encontrado');
      }

      const currentDocuments = deal.data().documents || [];
      const newDocument = {
        id: Date.now().toString(),
        ...documentData,
        uploadedAt: Timestamp.now(),
        uploadedBy: user.uid
      };

      await updateDoc(dealRef, {
        documents: [...currentDocuments, newDocument],
        updatedAt: Timestamp.now()
      });

      // Log de atividade
      await addActivity(dealId, {
        type: 'document_added',
        description: `Documento adicionado: ${documentData.name}`,
        userId: user.uid
      });

      return true;
    } catch (err) {
      console.error('Erro ao adicionar documento:', err);
      return false;
    }
  }, [user?.uid]);

  // ⏰ CRIAR FOLLOW-UP
  // ==================
  const createFollowUp = useCallback(async (dealId, followUpData) => {
    if (!user?.uid || !dealId) return false;

    try {
      const dealRef = doc(db, 'deals', dealId);
      const deal = await getDoc(dealRef);
      
      if (!deal.exists()) {
        throw new Error('Negócio não encontrado');
      }

      const currentFollowUps = deal.data().followUps || [];
      const newFollowUp = {
        id: Date.now().toString(),
        ...followUpData,
        createdAt: Timestamp.now(),
        createdBy: user.uid,
        completed: false
      };

      await updateDoc(dealRef, {
        followUps: [...currentFollowUps, newFollowUp],
        updatedAt: Timestamp.now()
      });

      // Log de atividade
      await addActivity(dealId, {
        type: 'followup_created',
        description: `Follow-up criado para: ${followUpData.scheduledDate}`,
        userId: user.uid
      });

      return true;
    } catch (err) {
      console.error('Erro ao criar follow-up:', err);
      return false;
    }
  }, [user?.uid]);

  // 📊 ESTATÍSTICAS DOS NEGÓCIOS
  // ===========================
  const getDealStats = useMemo(() => {
    if (!deals.length) {
      return {
        total: 0,
        byStatus: {},
        byType: {},
        byPriority: {},
        totalValue: 0,
        averageValue: 0,
        totalCommission: 0,
        expectedRevenue: 0,
        conversionRate: 0,
        pipelineValue: 0
      };
    }

    const stats = {
      total: deals.length,
      byStatus: {},
      byType: {},
      byPriority: {},
      totalValue: 0,
      averageValue: 0,
      totalCommission: 0,
      expectedRevenue: 0,
      conversionRate: 0,
      pipelineValue: 0
    };

    let closedWon = 0;
    let closedTotal = 0;

    deals.forEach(deal => {
      // Contagem por status
      stats.byStatus[deal.status] = (stats.byStatus[deal.status] || 0) + 1;
      
      // Contagem por tipo
      stats.byType[deal.dealType] = (stats.byType[deal.dealType] || 0) + 1;
      
      // Contagem por prioridade
      stats.byPriority[deal.priority] = (stats.byPriority[deal.priority] || 0) + 1;
      
      // Valores financeiros
      stats.totalValue += deal.value || 0;
      stats.totalCommission += deal.commissionValue || 0;
      stats.expectedRevenue += deal.expectedValue || 0;
      stats.pipelineValue += deal.expectedValue || 0;

      // Taxa de conversão
      if (deal.status === DEAL_STATUS.FECHADO) {
        closedWon++;
      }
      if ([DEAL_STATUS.FECHADO, DEAL_STATUS.CANCELADO].includes(deal.status)) {
        closedTotal++;
      }
    });

    stats.averageValue = stats.totalValue / deals.length;
    stats.conversionRate = closedTotal > 0 ? (closedWon / closedTotal) * 100 : 0;

    return stats;
  }, [deals]);

  // 🔍 NEGÓCIOS FILTRADOS
  // =====================
  const filteredDeals = useMemo(() => {
    let filtered = [...deals];

    // Filtro por status
    if (filters.status !== 'all') {
      filtered = filtered.filter(deal => deal.status === filters.status);
    }

    // Filtro por prioridade
    if (filters.priority !== 'all') {
      filtered = filtered.filter(deal => deal.priority === filters.priority);
    }

    // Filtro por tipo de negócio
    if (filters.dealType !== 'all') {
      filtered = filtered.filter(deal => deal.dealType === filters.dealType);
    }

    // Filtro por tipo de propriedade
    if (filters.propertyType !== 'all') {
      filtered = filtered.filter(deal => deal.propertyType === filters.propertyType);
    }

    // Filtro por termo de pesquisa
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.title?.toLowerCase().includes(term) ||
        deal.clientName?.toLowerCase().includes(term) ||
        deal.propertyAddress?.toLowerCase().includes(term)
      );
    }

    // Filtro por nome do cliente
    if (filters.clientName) {
      const term = filters.clientName.toLowerCase();
      filtered = filtered.filter(deal => 
        deal.clientName?.toLowerCase().includes(term)
      );
    }

    // Filtro por faixa de valor
    if (filters.valueRange !== 'all') {
      const ranges = {
        'baixo': [0, 100000],
        'medio': [100000, 300000],
        'alto': [300000, 500000],
        'premium': [500000, Infinity]
      };
      const [min, max] = ranges[filters.valueRange] || [0, Infinity];
      filtered = filtered.filter(deal => 
        deal.value >= min && deal.value < max
      );
    }

    return filtered;
  }, [deals, filters]);

  // 🔄 FUNÇÕES DE UTILIDADE
  // =======================

  // Validação de NIF português
  const isValidNIF = (nif) => {
    if (!nif || typeof nif !== 'string') return false;
    const cleanNif = nif.replace(/\s/g, '');
    return /^[0-9]{9}$/.test(cleanNif);
  };

  // Validação de código postal português
  const isValidPostalCode = (postalCode) => {
    if (!postalCode || typeof postalCode !== 'string') return false;
    return /^\d{4}-\d{3}$/.test(postalCode);
  };

  // Validação de valor monetário
  const isValidMonetaryValue = (value) => {
    return typeof value === 'number' && value > 0 && value < 10000000;
  };

  // Formatação de moeda
  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '€0,00';
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  return {
    // Estados
    deals: filteredDeals,
    allDeals: deals,
    loading,
    error,
    creating,
    updating,
    deleting,

    // Ações CRUD
    createDeal,
    updateDeal,
    updateDealStatus,
    deleteDeal,

    // Ações específicas
    addActivity,
    addDocument,
    createFollowUp,

    // Estatísticas
    getDealStats,

    // Constantes
    DEAL_STATUS,
    DEAL_TYPES,
    DEAL_PRIORITY,
    PROPERTY_TYPES,
    CONTRACT_STATUS,
    FINANCING_STATUS,
    DEAL_STATUS_COLORS,
    STATUS_PROBABILITY,

    // Validações
    isValidNIF,
    isValidPostalCode,
    isValidMonetaryValue,
    formatCurrency,

    // Filtros
    filters,
    setFilters
  };
};

export default useDeals;