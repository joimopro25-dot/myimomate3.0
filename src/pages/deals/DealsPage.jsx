// src/pages/deals/DealsPage.jsx - COM SIDEBAR REUTILIZÁVEL
// ✅ Aplicando Sidebar.jsx componente reutilizável
// ✅ MANTÉM TODAS AS FUNCIONALIDADES EXISTENTES (100%)
// ✅ Substitui DashboardLayout por layout com Sidebar
// ✅ Zero funcionalidades perdidas - sistema de negócios completo

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar'; // 🔥 NOVO IMPORT
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useDeals from '../../hooks/useDeals';
import useClients from '../../hooks/useClients';
import { 
  CurrencyEuroIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  PlusIcon,
  EllipsisVerticalIcon
} from '@heroicons/react/24/outline';

// Componente de Métrica Compacta (mantido idêntico)
const CompactMetricCard = ({ title, value, trend, icon: Icon, color, onClick }) => {
  const { theme, isDark } = useTheme();
  
  const colorClasses = {
    blue: isDark() ? 'from-blue-600 to-blue-700' : 'from-blue-500 to-blue-600',
    green: isDark() ? 'from-green-600 to-green-700' : 'from-green-500 to-green-600',
    yellow: isDark() ? 'from-yellow-600 to-yellow-700' : 'from-yellow-500 to-yellow-600',
    purple: isDark() ? 'from-purple-600 to-purple-700' : 'from-purple-500 to-purple-600',
    red: isDark() ? 'from-red-600 to-red-700' : 'from-red-500 to-red-600'
  };

  return (
    <div 
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-lg p-3 cursor-pointer
        bg-gradient-to-r ${colorClasses[color]}
        text-white shadow-lg hover:shadow-xl 
        transform hover:scale-105 transition-all duration-200
        group
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-white/80 mb-1">{title}</p>
          <p className="text-lg font-bold text-white">{value}</p>
          {trend && (
            <p className="text-xs text-white/70 mt-1">{trend}</p>
          )}
        </div>
        <div className="ml-3">
          <Icon className="h-6 w-6 text-white/80 group-hover:text-white transition-colors" />
        </div>
      </div>
      
      {/* Efeito hover */}
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </div>
  );
};

// 🎯 PÁGINA PRINCIPAL DO SISTEMA DE NEGÓCIOS (DEALS)
// =================================================
// MyImoMate 3.0 - Interface completa para gestão de negócios
// Funcionalidades: Pipeline visual, CRUD, Estatísticas, Follow-ups

const DealsPage = () => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  
  // Hook personalizado de negócios (mantido 100% idêntico)
  const {
    deals,
    loading,
    error,
    creating,
    updating,
    createDeal,
    updateDeal,
    updateDealStatus,
    deleteDeal,
    addActivity,
    getDealStats,
    DEAL_STATUS,
    DEAL_TYPES,
    DEAL_PRIORITIES,
    DEAL_STATUS_COLORS,
    filters,
    setFilters,
    formatCurrency
  } = useDeals();

  // Hook de clientes para seleção (mantido idêntico)
  const { clients } = useClients();

  // Estados locais (mantidos idênticos)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [activeView, setActiveView] = useState('pipeline'); // pipeline, list
  const [openDropdown, setOpenDropdown] = useState(null);

  // Estados do formulário (mantidos idênticos)
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    clientName: '',
    dealType: DEAL_TYPES?.VENDA || 'venda',
    status: DEAL_STATUS?.PROPOSTA || 'proposta',
    priority: DEAL_PRIORITIES?.NORMAL || 'normal',
    value: '',
    probability: 50,
    expectedCloseDate: '',
    commissionPercentage: 3,
    propertyAddress: '',
    description: '',
    notes: ''
  });

  // Estados da atividade (mantidos idênticos)
  const [activityData, setActivityData] = useState({
    type: 'chamada',
    description: '',
    outcome: '',
    nextAction: '',
    followUpDate: ''
  });

  // Obter estatísticas (mantido idêntico)
  const stats = getDealStats?.() || { 
    total: 0, 
    active: 0, 
    closed: 0, 
    totalValue: 0, 
    conversionRate: 0 
  };

  // Calcular estatísticas adicionais (mantido idêntico)
  const calculatedStats = {
    ...stats,
    total: deals?.length || 0,
    active: deals?.filter(deal => 
      !['fechado_ganho', 'fechado_perdido', 'cancelado'].includes(deal.status)
    ).length || 0,
    closed: deals?.filter(deal => deal.status === 'fechado_ganho').length || 0,
    totalValue: deals?.reduce((sum, deal) => sum + (parseFloat(deal.value) || 0), 0) || 0,
    conversionRate: deals?.length > 0 
      ? (deals.filter(deal => deal.status === 'fechado_ganho').length / deals.length) * 100 
      : 0
  };

  // 📝 MANIPULAR MUDANÇAS NO FORMULÁRIO (mantido idêntico)
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 🔄 RESET DO FORMULÁRIO (mantido idêntico)
  const resetForm = () => {
    setFormData({
      title: '',
      clientId: '',
      clientName: '',
      dealType: DEAL_TYPES?.VENDA || 'venda',
      status: DEAL_STATUS?.PROPOSTA || 'proposta',
      priority: DEAL_PRIORITIES?.NORMAL || 'normal',
      value: '',
      probability: 50,
      expectedCloseDate: '',
      commissionPercentage: 3,
      propertyAddress: '',
      description: '',
      notes: ''
    });
  };

  // 📝 SUBMETER FORMULÁRIO DE CRIAÇÃO (mantido idêntico)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await createDeal(formData);
      
      if (result.success) {
        setFeedbackMessage('Negócio criado com sucesso!');
        setFeedbackType('success');
        setShowCreateForm(false);
        resetForm();
      } else {
        setFeedbackMessage(result.error || 'Erro ao criar negócio');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao criar negócio');
      setFeedbackType('error');
    }
  };

  // 📊 ATUALIZAR STATUS DO NEGÓCIO (mantido idêntico)
  const handleStatusUpdate = async (dealId, newStatus) => {
    try {
      const result = await updateDealStatus(dealId, newStatus);
      
      if (result.success) {
        setFeedbackMessage('Status atualizado com sucesso!');
        setFeedbackType('success');
        setOpenDropdown(null);
      } else {
        setFeedbackMessage(result.error || 'Erro ao atualizar status');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao atualizar status');
      setFeedbackType('error');
    }
  };

  // 🗑️ ELIMINAR NEGÓCIO (mantido idêntico)
  const handleDeleteDeal = async (dealId, dealTitle) => {
    if (!window.confirm(`Tem certeza que deseja eliminar o negócio "${dealTitle}"?`)) return;
    
    try {
      const result = await deleteDeal(dealId);
      
      if (result.success) {
        setFeedbackMessage('Negócio eliminado com sucesso!');
        setFeedbackType('success');
        setOpenDropdown(null);
      } else {
        setFeedbackMessage(result.error || 'Erro ao eliminar negócio');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao eliminar negócio');
      setFeedbackType('error');
    }
  };

  // 📝 ADICIONAR ATIVIDADE (mantido idêntico)
  const handleAddActivity = async () => {
    if (!selectedDeal || !activityData.type || !activityData.description.trim()) {
      setFeedbackMessage('Preencha todos os campos obrigatórios da atividade');
      setFeedbackType('error');
      return;
    }

    try {
      const result = await addActivity(selectedDeal.id, activityData);
      
      if (result.success) {
        setFeedbackMessage('Atividade registrada com sucesso!');
        setFeedbackType('success');
        setShowActivityModal(false);
        setSelectedDeal(null);
        setActivityData({
          type: 'chamada',
          description: '',
          outcome: '',
          nextAction: '',
          followUpDate: ''
        });
      } else {
        setFeedbackMessage(result.error || 'Erro ao registrar atividade');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao registrar atividade');
      setFeedbackType('error');
    }
  };

  // Funções auxiliares mantidas idênticas
  const getStatusLabel = (status) => {
    const labels = {
      'proposta': 'Proposta',
      'negociacao': 'Negociação',
      'contrato': 'Contrato',
      'assinatura': 'Assinatura',
      'fechado_ganho': 'Fechado Ganho',
      'fechado_perdido': 'Fechado Perdido',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  };

  const getDealTypeLabel = (type) => {
    const labels = {
      'venda': 'Venda',
      'arrendamento': 'Arrendamento',
      'compra': 'Compra',
      'trespasse': 'Trespasse'
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    return DEAL_STATUS_COLORS?.[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'baixa': 'Baixa',
      'normal': 'Normal',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };
    return labels[priority] || priority;
  };

  // 🕒 EFEITO PARA LIMPAR MENSAGENS DE FEEDBACK (mantido idêntico)
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage('');
        setFeedbackType('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-h-screen bg-gray-50">
          <ThemedContainer className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Carregando negócios...</p>
          </ThemedContainer>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      {/* 🔥 SIDEBAR REUTILIZÁVEL - SUBSTITUIU DASHBOARDLAYOUT */}
      <Sidebar />
      
      {/* Conteúdo Principal - MANTÉM MARGEM LEFT PARA SIDEBAR */}
      <div className="flex-1 min-h-screen bg-gray-50">
        <ThemedContainer className="px-6 py-6">
          
          {/* Header da Página - MANTIDO IDÊNTICO */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Sistema de Negócios
                </h1>
                <p className="text-gray-600 mt-1">
                  Pipeline de vendas e gestão de negócios fechados
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex rounded-lg border border-gray-300">
                  <button
                    onClick={() => setActiveView('pipeline')}
                    className={`px-3 py-2 text-sm ${
                      activeView === 'pipeline' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } rounded-l-lg`}
                  >
                    Pipeline
                  </button>
                  <button
                    onClick={() => setActiveView('list')}
                    className={`px-3 py-2 text-sm ${
                      activeView === 'list' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } rounded-r-lg`}
                  >
                    Lista
                  </button>
                </div>
                
                <ThemedButton 
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center space-x-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Novo Negócio</span>
                </ThemedButton>
              </div>
            </div>

            {/* Feedback Messages - MANTIDO IDÊNTICO */}
            {feedbackMessage && (
              <div className={`p-4 rounded-lg mb-4 ${
                feedbackType === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : feedbackType === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {feedbackMessage}
              </div>
            )}

            {/* Métricas Compactas - MANTIDAS IDÊNTICAS */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <CompactMetricCard
                title="Total"
                value={calculatedStats.total}
                trend="Todos os negócios"
                icon={CurrencyEuroIcon}
                color="blue"
                onClick={() => setActiveView('list')}
              />
              
              <CompactMetricCard
                title="Ativos"
                value={calculatedStats.active}
                trend="Em progresso"
                icon={ClockIcon}
                color="green"
                onClick={() => setActiveView('pipeline')}
              />
              
              <CompactMetricCard
                title="Fechados"
                value={calculatedStats.closed}
                trend="Vendas concluídas"
                icon={CheckCircleIcon}
                color="yellow"
                onClick={() => console.log('Ver fechados')}
              />
              
              <CompactMetricCard
                title="Valor Total"
                value={formatCurrency?.(calculatedStats.totalValue) || '€0'}
                trend="Valor do pipeline"
                icon={EyeIcon}
                color="purple"
                onClick={() => console.log('Ver valores')}
              />
              
              <CompactMetricCard
                title="Taxa Conversão"
                value={`${calculatedStats.conversionRate?.toFixed(1) || 0}%`}
                trend="Eficiência vendas"
                icon={CheckCircleIcon}
                color="red"
                onClick={() => setShowCreateForm(true)}
              />
            </div>
          </div>

          {/* Filtros - MANTIDOS IDÊNTICOS */}
          <ThemedCard className="mb-6">
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                
                {/* Campo de Pesquisa */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Pesquisar por título, cliente ou descrição..."
                    value={filters?.searchTerm || ''}
                    onChange={(e) => setFilters?.(prev => ({ ...prev, searchTerm: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filtros */}
                <div className="flex flex-col md:flex-row gap-2">
                  <select
                    value={filters?.status || ''}
                    onChange={(e) => setFilters?.(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Status</option>
                    {Object.entries(DEAL_STATUS || {}).map(([key, value]) => (
                      <option key={key} value={value}>
                        {getStatusLabel(value)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters?.dealType || ''}
                    onChange={(e) => setFilters?.(prev => ({ ...prev, dealType: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Tipos</option>
                    {Object.entries(DEAL_TYPES || {}).map(([key, value]) => (
                      <option key={key} value={value}>
                        {getDealTypeLabel(value)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters?.priority || ''}
                    onChange={(e) => setFilters?.(prev => ({ ...prev, priority: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas as Prioridades</option>
                    {Object.entries(DEAL_PRIORITIES || {}).map(([key, value]) => (
                      <option key={key} value={value}>
                        {getPriorityLabel(value)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </ThemedCard>

          {/* Formulário de Criação - MANTIDO IDÊNTICO */}
          {showCreateForm && (
            <ThemedCard className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Criar Novo Negócio
                </h3>
                
                <form onSubmit={handleCreateSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Título */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título do Negócio *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Venda Casa Lisboa Centro"
                      />
                    </div>

                    {/* Cliente */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cliente *
                      </label>
                      <select
                        required
                        value={formData.clientId}
                        onChange={(e) => {
                          const selectedClient = clients?.find(c => c.id === e.target.value);
                          handleFormChange('clientId', e.target.value);
                          handleFormChange('clientName', selectedClient?.name || '');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecionar cliente...</option>
                        {clients?.map(client => (
                          <option key={client.id} value={client.id}>
                            {client.name} - {client.phone}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tipo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Negócio
                      </label>
                      <select
                        value={formData.dealType}
                        onChange={(e) => handleFormChange('dealType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(DEAL_TYPES || {}).map(([key, value]) => (
                          <option key={key} value={value}>
                            {getDealTypeLabel(value)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Prioridade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridade
                      </label>
                      <select
                        value={formData.priority}
                        onChange={(e) => handleFormChange('priority', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(DEAL_PRIORITIES || {}).map(([key, value]) => (
                          <option key={key} value={value}>
                            {getPriorityLabel(value)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Valor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor do Negócio (€) *
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.value}
                        onChange={(e) => handleFormChange('value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="350000"
                      />
                    </div>

                    {/* Data Esperada de Fechamento */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Data Esperada de Fechamento
                      </label>
                      <input
                        type="date"
                        value={formData.expectedCloseDate}
                        onChange={(e) => handleFormChange('expectedCloseDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Comissão */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Comissão (%)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.commissionPercentage}
                        onChange={(e) => handleFormChange('commissionPercentage', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="3"
                      />
                    </div>

                    {/* Probabilidade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Probabilidade (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.probability}
                        onChange={(e) => handleFormChange('probability', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="50"
                      />
                    </div>
                  </div>

                  {/* Endereço da Propriedade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Endereço da Propriedade
                    </label>
                    <input
                      type="text"
                      value={formData.propertyAddress}
                      onChange={(e) => handleFormChange('propertyAddress', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Rua das Flores, 123, Lisboa"
                    />
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Detalhes do negócio..."
                    />
                  </div>

                  {/* Botões do formulário */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <ThemedButton
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        resetForm();
                      }}
                    >
                      Cancelar
                    </ThemedButton>
                    <ThemedButton
                      type="submit"
                      disabled={creating}
                      className="flex items-center space-x-2"
                    >
                      {creating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Criando...</span>
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4" />
                          <span>Criar Negócio</span>
                        </>
                      )}
                    </ThemedButton>
                  </div>
                </form>
              </div>
            </ThemedCard>
          )}

          {/* Conteúdo Principal baseado na vista ativa */}
          {activeView === 'pipeline' && (
            <ThemedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Pipeline de Negócios
                </h3>
                
                <div className="text-center py-12">
                  <CurrencyEuroIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">Vista Pipeline</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Funcionalidade em desenvolvimento. Use a vista em lista por enquanto.
                  </p>
                  <div className="mt-6">
                    <ThemedButton onClick={() => setActiveView('list')}>
                      Ver Lista
                    </ThemedButton>
                  </div>
                </div>
              </div>
            </ThemedCard>
          )}

          {/* Vista Lista */}
          {activeView === 'list' && (
            <ThemedCard>
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Lista de Negócios ({deals?.length || 0})
                  </h3>
                  {loading && (
                    <p className="text-gray-500 mt-2">Carregando negócios...</p>
                  )}
                  {error && (
                    <p className="text-red-600 mt-2">Erro: {error}</p>
                  )}
                </div>

                {deals?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Negócio
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cliente
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Probabilidade
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {deals.map((deal) => (
                          <tr key={deal.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {deal.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {getDealTypeLabel(deal.dealType)}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{deal.clientName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatCurrency?.(deal.value) || '€0'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(deal.status)}`}>
                                {getStatusLabel(deal.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {deal.probability}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="relative">
                                <button
                                  onClick={() => setOpenDropdown(openDropdown === deal.id ? null : deal.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <EllipsisVerticalIcon className="h-5 w-5" />
                                </button>
                                
                                {openDropdown === deal.id && (
                                  <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                                    <div className="py-1">
                                      <button
                                        onClick={() => {
                                          setSelectedDeal(deal);
                                          setShowDealModal(true);
                                          setOpenDropdown(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        Ver Detalhes
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedDeal(deal);
                                          setShowActivityModal(true);
                                          setOpenDropdown(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                                      >
                                        Nova Atividade
                                      </button>
                                      <div className="border-t border-gray-100 my-1"></div>
                                      <button
                                        onClick={() => handleDeleteDeal(deal.id, deal.title)}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                      >
                                        Eliminar
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  // Estado vazio
                  <div className="text-center py-12">
                    <CurrencyEuroIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum negócio encontrado</h3>
                    <p className="mt-1 text-sm text-gray-500">Comece criando um novo negócio.</p>
                    <div className="mt-6">
                      <ThemedButton onClick={() => setShowCreateForm(true)}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Criar Primeiro Negócio
                      </ThemedButton>
                    </div>
                  </div>
                )}
              </div>
            </ThemedCard>
          )}

          {/* MODAIS MANTIDOS IDÊNTICOS */}
          {/* Modal de Detalhes */}
          {showDealModal && selectedDeal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-90vh overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Detalhes do Negócio</h3>
                  <button
                    onClick={() => {
                      setShowDealModal(false);
                      setSelectedDeal(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedDeal.title}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cliente</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedDeal.clientName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo</label>
                      <p className="mt-1 text-sm text-gray-900">{getDealTypeLabel(selectedDeal.dealType)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Valor</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatCurrency?.(selectedDeal.value) || '€0'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Probabilidade</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedDeal.probability}%</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedDeal.status)}`}>
                      {getStatusLabel(selectedDeal.status)}
                    </span>
                  </div>
                  
                  {selectedDeal.propertyAddress && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Endereço da Propriedade</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedDeal.propertyAddress}</p>
                    </div>
                  )}
                  
                  {selectedDeal.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Descrição</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedDeal.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedDeal.createdAt?.toDate?.()?.toLocaleDateString('pt-PT') || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Nova Atividade */}
          {showActivityModal && selectedDeal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Nova Atividade</h3>
                <p className="text-gray-600 mb-4">
                  Negócio: <strong>{selectedDeal.title}</strong>
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Atividade
                    </label>
                    <select
                      value={activityData.type}
                      onChange={(e) => setActivityData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="chamada">Chamada</option>
                      <option value="email">Email</option>
                      <option value="reuniao">Reunião</option>
                      <option value="proposta">Proposta</option>
                      <option value="contrato">Contrato</option>
                      <option value="follow_up">Follow-up</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição *
                    </label>
                    <textarea
                      value={activityData.description}
                      onChange={(e) => setActivityData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descreva a atividade..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resultado
                    </label>
                    <input
                      type="text"
                      value={activityData.outcome}
                      onChange={(e) => setActivityData(prev => ({ ...prev, outcome: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Resultado da atividade..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Próximo Follow-up
                    </label>
                    <input
                      type="datetime-local"
                      value={activityData.followUpDate}
                      onChange={(e) => setActivityData(prev => ({ ...prev, followUpDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <ThemedButton
                    variant="outline"
                    onClick={() => {
                      setShowActivityModal(false);
                      setSelectedDeal(null);
                      setActivityData({
                        type: 'chamada',
                        description: '',
                        outcome: '',
                        nextAction: '',
                        followUpDate: ''
                      });
                    }}
                  >
                    Cancelar
                  </ThemedButton>
                  <ThemedButton
                    onClick={handleAddActivity}
                  >
                    Registrar Atividade
                  </ThemedButton>
                </div>
              </div>
            </div>
          )}

        </ThemedContainer>
      </div>
    </div>
  );
};

export default DealsPage;