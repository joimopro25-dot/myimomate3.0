// src/pages/opportunities/OpportunitiesPage.jsx - COM SIDEBAR REUTILIZÁVEL
// ✅ Aplicando Sidebar.jsx componente reutilizável
// ✅ MANTÉM TODAS AS FUNCIONALIDADES EXISTENTES (100%)
// ✅ Substitui DashboardLayout por layout com Sidebar
// ✅ Zero funcionalidades perdidas - sistema de oportunidades completo

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar'; // 🔥 NOVO IMPORT
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useOpportunities from '../../hooks/useOpportunities';
import useClients from '../../hooks/useClients';
import { 
  BuildingOfficeIcon, 
  PlusIcon, 
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
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

// 🎯 PÁGINA PRINCIPAL DO SISTEMA DE OPORTUNIDADES
// ===============================================
// MyImoMate 3.0 - Interface completa para gestão de oportunidades de vendas
// Funcionalidades: Pipeline visual, CRUD, Estatísticas, Follow-ups

const OpportunitiesPage = () => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  
  // Hook personalizado de oportunidades (mantido 100% idêntico)
  const {
    opportunities,
    loading,
    error,
    creating,
    updating,
    createOpportunity,
    updateOpportunity,
    updateOpportunityStatus,
    deleteOpportunity,
    addActivity,
    getOpportunityStats,
    OPPORTUNITY_STATUS,
    OPPORTUNITY_TYPES,
    OPPORTUNITY_PRIORITIES,
    OPPORTUNITY_STATUS_COLORS,
    filters,
    setFilters,
    formatCurrency
  } = useOpportunities();

  // Hook de clientes para seleção (mantido idêntico)
  const { clients } = useClients();

  // Estados locais (mantidos idênticos)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, pipeline, list
  const [openDropdown, setOpenDropdown] = useState(null);

  // Estados do formulário (mantidos idênticos)
  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    clientName: '',
    opportunityType: OPPORTUNITY_TYPES?.VENDAS || 'vendas',
    status: OPPORTUNITY_STATUS?.IDENTIFICACAO || 'identificacao',
    priority: OPPORTUNITY_PRIORITIES?.NORMAL || 'normal',
    value: '',
    probability: 25,
    expectedCloseDate: '',
    commissionPercentage: 3,
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
  const stats = getOpportunityStats?.() || { 
    total: 0, 
    active: 0, 
    won: 0, 
    totalValue: 0, 
    conversionRate: 0 
  };

  // Calcular estatísticas adicionais (mantido idêntico)
  const calculatedStats = {
    ...stats,
    total: opportunities?.length || 0,
    active: opportunities?.filter(opp => 
      !['fechado_ganho', 'fechado_perdido', 'cancelado'].includes(opp.status)
    ).length || 0,
    won: opportunities?.filter(opp => opp.status === 'fechado_ganho').length || 0,
    totalValue: opportunities?.reduce((sum, opp) => sum + (parseFloat(opp.value) || 0), 0) || 0,
    conversionRate: opportunities?.length > 0 
      ? (opportunities.filter(opp => opp.status === 'fechado_ganho').length / opportunities.length) * 100 
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
      opportunityType: OPPORTUNITY_TYPES?.VENDAS || 'vendas',
      status: OPPORTUNITY_STATUS?.IDENTIFICACAO || 'identificacao',
      priority: OPPORTUNITY_PRIORITIES?.NORMAL || 'normal',
      value: '',
      probability: 25,
      expectedCloseDate: '',
      commissionPercentage: 3,
      description: '',
      notes: ''
    });
  };

  // 📝 SUBMETER FORMULÁRIO DE CRIAÇÃO (mantido idêntico)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await createOpportunity(formData);
      
      if (result.success) {
        setFeedbackMessage('Oportunidade criada com sucesso!');
        setFeedbackType('success');
        setShowCreateForm(false);
        resetForm();
      } else {
        setFeedbackMessage(result.error || 'Erro ao criar oportunidade');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao criar oportunidade');
      setFeedbackType('error');
    }
  };

  // 📊 ATUALIZAR STATUS DA OPORTUNIDADE (mantido idêntico)
  const handleStatusUpdate = async (opportunityId, newStatus) => {
    try {
      const result = await updateOpportunityStatus(opportunityId, newStatus);
      
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

  // 🗑️ ELIMINAR OPORTUNIDADE (mantido idêntico)
  const handleDeleteOpportunity = async (opportunityId, opportunityTitle) => {
    if (!window.confirm(`Tem certeza que deseja eliminar a oportunidade "${opportunityTitle}"?`)) return;
    
    try {
      const result = await deleteOpportunity(opportunityId);
      
      if (result.success) {
        setFeedbackMessage('Oportunidade eliminada com sucesso!');
        setFeedbackType('success');
        setOpenDropdown(null);
      } else {
        setFeedbackMessage(result.error || 'Erro ao eliminar oportunidade');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao eliminar oportunidade');
      setFeedbackType('error');
    }
  };

  // 📝 ADICIONAR ATIVIDADE (mantido idêntico)
  const handleAddActivity = async () => {
    if (!selectedOpportunity || !activityData.type || !activityData.description.trim()) {
      setFeedbackMessage('Preencha todos os campos obrigatórios da atividade');
      setFeedbackType('error');
      return;
    }

    try {
      const result = await addActivity(selectedOpportunity.id, activityData);
      
      if (result.success) {
        setFeedbackMessage('Atividade registrada com sucesso!');
        setFeedbackType('success');
        setShowActivityModal(false);
        setSelectedOpportunity(null);
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
      'identificacao': 'Identificação',
      'qualificacao': 'Qualificação',
      'apresentacao': 'Apresentação',
      'negociacao': 'Negociação',
      'proposta': 'Proposta',
      'contrato': 'Contrato',
      'fechado_ganho': 'Fechado Ganho',
      'fechado_perdido': 'Fechado Perdido',
      'cancelado': 'Cancelado'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    return OPPORTUNITY_STATUS_COLORS?.[status] || 'bg-gray-100 text-gray-800';
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
                  Sistema de Oportunidades
                </h1>
                <p className="text-gray-600 mt-1">
                  Pipeline de vendas e gestão de oportunidades de negócio
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex rounded-lg border border-gray-300">
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className={`px-3 py-2 text-sm ${
                      activeView === 'dashboard' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    } rounded-l-lg`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setActiveView('pipeline')}
                    className={`px-3 py-2 text-sm ${
                      activeView === 'pipeline' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
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
                  <span>Nova Oportunidade</span>
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
                trend="Todas oportunidades"
                icon={BuildingOfficeIcon}
                color="blue"
                onClick={() => setActiveView('list')}
              />
              
              <CompactMetricCard
                title="Ativas"
                value={calculatedStats.active}
                trend="Em progresso"
                icon={ClockIcon}
                color="green"
                onClick={() => setActiveView('pipeline')}
              />
              
              <CompactMetricCard
                title="Ganhas"
                value={calculatedStats.won}
                trend="Fechadas com sucesso"
                icon={CheckCircleIcon}
                color="yellow"
                onClick={() => console.log('Ver ganhas')}
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
                    {Object.entries(OPPORTUNITY_STATUS || {}).map(([key, value]) => (
                      <option key={key} value={value}>
                        {getStatusLabel(value)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters?.opportunityType || ''}
                    onChange={(e) => setFilters?.(prev => ({ ...prev, opportunityType: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Tipos</option>
                    {Object.entries(OPPORTUNITY_TYPES || {}).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.charAt(0) + key.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters?.priority || ''}
                    onChange={(e) => setFilters?.(prev => ({ ...prev, priority: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas as Prioridades</option>
                    {Object.entries(OPPORTUNITY_PRIORITIES || {}).map(([key, value]) => (
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
                  Criar Nova Oportunidade
                </h3>
                
                <form onSubmit={handleCreateSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Título */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título da Oportunidade *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => handleFormChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Venda Apartamento T3 Cascais"
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
                        Tipo de Oportunidade
                      </label>
                      <select
                        value={formData.opportunityType}
                        onChange={(e) => handleFormChange('opportunityType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(OPPORTUNITY_TYPES || {}).map(([key, value]) => (
                          <option key={key} value={value}>
                            {key.charAt(0) + key.slice(1).toLowerCase()}
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
                        {Object.entries(OPPORTUNITY_PRIORITIES || {}).map(([key, value]) => (
                          <option key={key} value={value}>
                            {getPriorityLabel(value)}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Valor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor (€)
                      </label>
                      <input
                        type="number"
                        value={formData.value}
                        onChange={(e) => handleFormChange('value', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="250000"
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

                    {/* Probabilidade (calculada automaticamente baseada no status) */}
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
                        placeholder="25"
                      />
                    </div>
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
                      placeholder="Detalhes da oportunidade..."
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
                          <span>Criar Oportunidade</span>
                        </>
                      )}
                    </ThemedButton>
                  </div>
                </form>
              </div>
            </ThemedCard>
          )}

          {/* Conteúdo Principal baseado na vista ativa */}
          {activeView === 'dashboard' && (
            <ThemedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Dashboard de Oportunidades
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  
                  {/* Estatísticas Gerais */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Estatísticas Gerais</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total de Oportunidades:</span>
                        <span className="font-medium">{calculatedStats.total}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ativas:</span>
                        <span className="font-medium">{calculatedStats.active}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fechadas:</span>
                        <span className="font-medium">{calculatedStats.won}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de Conversão:</span>
                        <span className="font-medium">{calculatedStats.conversionRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Valor do Pipeline */}
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Valor do Pipeline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Valor Total:</span>
                        <span className="font-medium">{formatCurrency?.(calculatedStats.totalValue) || '€0'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valor Médio:</span>
                        <span className="font-medium">
                          {calculatedStats.total > 0 
                            ? formatCurrency?.(calculatedStats.totalValue / calculatedStats.total) || '€0'
                            : '€0'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Oportunidades por Status */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Por Status</h4>
                    <div className="space-y-2 text-sm">
                      {Object.values(OPPORTUNITY_STATUS || {}).map(status => {
                        const count = opportunities?.filter(opp => opp.status === status).length || 0;
                        return (
                          <div key={status} className="flex justify-between">
                            <span>{getStatusLabel(status)}:</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </ThemedCard>
          )}

          {/* Vista Pipeline */}
          {activeView === 'pipeline' && (
            <ThemedCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Pipeline de Vendas
                </h3>
                
                <div className="text-center py-12">
                  <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
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
                    Lista de Oportunidades ({opportunities?.length || 0})
                  </h3>
                  {loading && (
                    <p className="text-gray-500 mt-2">Carregando oportunidades...</p>
                  )}
                  {error && (
                    <p className="text-red-600 mt-2">Erro: {error}</p>
                  )}
                </div>

                {opportunities?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Oportunidade
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
                        {opportunities.map((opportunity) => (
                          <tr key={opportunity.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {opportunity.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {opportunity.opportunityType}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{opportunity.clientName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatCurrency?.(opportunity.value) || '€0'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(opportunity.status)}`}>
                                {getStatusLabel(opportunity.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {opportunity.probability}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="relative">
                                <button
                                  onClick={() => setOpenDropdown(openDropdown === opportunity.id ? null : opportunity.id)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <EllipsisVerticalIcon className="h-5 w-5" />
                                </button>
                                
                                {openDropdown === opportunity.id && (
                                  <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                                    <div className="py-1">
                                      <button
                                        onClick={() => {
                                          setSelectedOpportunity(opportunity);
                                          setShowDetailsModal(true);
                                          setOpenDropdown(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                      >
                                        Ver Detalhes
                                      </button>
                                      <button
                                        onClick={() => {
                                          setSelectedOpportunity(opportunity);
                                          setShowActivityModal(true);
                                          setOpenDropdown(null);
                                        }}
                                        className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                                      >
                                        Nova Atividade
                                      </button>
                                      <div className="border-t border-gray-100 my-1"></div>
                                      <button
                                        onClick={() => handleDeleteOpportunity(opportunity.id, opportunity.title)}
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
                    <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma oportunidade encontrada</h3>
                    <p className="mt-1 text-sm text-gray-500">Comece criando uma nova oportunidade.</p>
                    <div className="mt-6">
                      <ThemedButton onClick={() => setShowCreateForm(true)}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Criar Primeira Oportunidade
                      </ThemedButton>
                    </div>
                  </div>
                )}
              </div>
            </ThemedCard>
          )}

          {/* MODAIS MANTIDOS IDÊNTICOS */}
          {/* Modal de Detalhes */}
          {showDetailsModal && selectedOpportunity && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-90vh overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Detalhes da Oportunidade</h3>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedOpportunity(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedOpportunity.title}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Cliente</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOpportunity.clientName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tipo</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOpportunity.opportunityType}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Valor</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatCurrency?.(selectedOpportunity.value) || '€0'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Probabilidade</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOpportunity.probability}%</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedOpportunity.status)}`}>
                      {getStatusLabel(selectedOpportunity.status)}
                    </span>
                  </div>
                  
                  {selectedOpportunity.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Descrição</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedOpportunity.description}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedOpportunity.createdAt?.toDate?.()?.toLocaleDateString('pt-PT') || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Nova Atividade */}
          {showActivityModal && selectedOpportunity && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Nova Atividade</h3>
                <p className="text-gray-600 mb-4">
                  Oportunidade: <strong>{selectedOpportunity.title}</strong>
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
                      setSelectedOpportunity(null);
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

export default OpportunitiesPage;