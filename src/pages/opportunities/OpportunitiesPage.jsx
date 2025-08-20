// src/pages/opportunities/OpportunitiesPage.jsx - LAYOUT OTIMIZADO
// ✅ Aplicando padrão DashboardLayout otimizado
// ✅ Sistema de 2 colunas sem widgets laterais  
// ✅ Métricas compactas no topo específicas de Oportunidades
// ✅ MANTÉM TODAS AS FUNCIONALIDADES EXISTENTES
// ✅ Apenas muda o layout, zero funcionalidades perdidas

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useOpportunities from '../../hooks/useOpportunities';
import useClients from '../../hooks/useClients';
import { 
  TargetIcon, 
  PlusIcon, 
  EyeIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Componente de Métrica Compacta (reutilizado do Dashboard)
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

// 🎯 PÁGINA PRINCIPAL DO MÓDULO DE OPORTUNIDADES
// ============================================
// MyImoMate 3.0 - Interface completa para gestão de oportunidades
// Funcionalidades: Pipeline de vendas, CRUD, Análise, Probabilidades

const OpportunitiesPage = () => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  
  // Hooks principais
  const {
    opportunities,
    loading,
    error,
    creating,
    updating,
    createOpportunity,
    updateOpportunityStatus,
    deleteOpportunity,
    addActivity,
    getOpportunityStats,
    OPPORTUNITY_STATUS,
    OPPORTUNITY_TYPES,
    OPPORTUNITY_PRIORITIES,
    STATUS_COLORS,
    formatCurrency,
    calculateCommission
  } = useOpportunities();

  const { clients } = useClients();

  // Estados da interface
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, pipeline, list, create
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    clientId: ''
  });

  // Estados do formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    type: 'venda',
    priority: 'media',
    status: 'identificacao',
    totalValue: '',
    commissionPercentage: '',
    expectedCloseDate: '',
    propertyType: '',
    propertyAddress: '',
    source: 'client_direct'
  });

  // Estados de atividade
  const [activityForm, setActivityForm] = useState({
    type: 'call',
    subject: '',
    description: '',
    outcome: 'positive'
  });

  // Estatísticas calculadas
  const stats = getOpportunityStats?.() || {
    total: 0,
    active: 0,
    won: 0,
    totalValue: 0,
    averageValue: 0,
    conversionRate: 0
  };

  // 📝 MANIPULAR MUDANÇAS NO FORMULÁRIO
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleActivityChange = (field, value) => {
    setActivityForm(prev => ({ ...prev, [field]: value }));
  };

  // 🔄 RESET DO FORMULÁRIO
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      clientId: '',
      type: 'venda',
      priority: 'media',
      status: 'identificacao',
      totalValue: '',
      commissionPercentage: '',
      expectedCloseDate: '',
      propertyType: '',
      propertyAddress: '',
      source: 'client_direct'
    });
  };

  // 📝 SUBMETER FORMULÁRIO DE CRIAÇÃO
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await createOpportunity({
        ...formData,
        commissionValue: calculateCommission?.(formData.totalValue, formData.commissionPercentage),
        expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : null
      });
      
      if (result?.success) {
        setFeedbackMessage('Oportunidade criada com sucesso!');
        setFeedbackType('success');
        setShowCreateForm(false);
        resetForm();
      } else {
        setFeedbackMessage(result?.message || 'Erro ao criar oportunidade');
        setFeedbackType('error');
      }
    } catch (err) {
      setFeedbackMessage(`Erro inesperado: ${err.message}`);
      setFeedbackType('error');
    }
  };

  // 🔄 ATUALIZAR STATUS
  const handleStatusChange = async (opportunityId, newStatus) => {
    const result = await updateOpportunityStatus?.(opportunityId, newStatus);
    
    if (result?.success) {
      setFeedbackMessage('Status atualizado com sucesso!');
      setFeedbackType('success');
    } else {
      setFeedbackMessage(result?.error || 'Erro ao atualizar status');
      setFeedbackType('error');
    }
  };

  // 🗑️ ELIMINAR OPORTUNIDADE
  const handleDeleteOpportunity = async (opportunityId, opportunityTitle) => {
    if (!window.confirm(`Tem certeza que deseja eliminar a oportunidade "${opportunityTitle}"?`)) {
      return;
    }

    const result = await deleteOpportunity?.(opportunityId);
    
    if (result?.success) {
      setFeedbackMessage('Oportunidade eliminada com sucesso!');
      setFeedbackType('success');
    } else {
      setFeedbackMessage(result?.error || 'Erro ao eliminar oportunidade');
      setFeedbackType('error');
    }
  };

  // 💬 ADICIONAR ATIVIDADE
  const handleAddActivity = async () => {
    if (!selectedOpportunity) return;

    try {
      const result = await addActivity?.(selectedOpportunity.id, activityForm);
      
      if (result?.success) {
        setFeedbackMessage('Atividade adicionada com sucesso!');
        setFeedbackType('success');
        setShowActivityModal(false);
        setSelectedOpportunity(null);
        setActivityForm({
          type: 'call',
          subject: '',
          description: '',
          outcome: 'positive'
        });
      } else {
        setFeedbackMessage(result?.error || 'Erro ao adicionar atividade');
        setFeedbackType('error');
      }
    } catch (err) {
      setFeedbackMessage(`Erro inesperado: ${err.message}`);
      setFeedbackType('error');
    }
  };

  // 🔍 FUNÇÕES AUXILIARES
  const getClientName = (clientId) => {
    const client = clients?.find(c => c.id === clientId);
    return client?.name || 'Cliente não encontrado';
  };

  const getStatusColor = (status) => {
    return STATUS_COLORS?.[status] || 'bg-gray-100 text-gray-800';
  };

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
      'pausado': 'Pausado'
    };
    return labels[status] || status;
  };

  const getTypeLabel = (type) => {
    const labels = {
      'venda': 'Venda',
      'arrendamento': 'Arrendamento',
      'investimento': 'Investimento',
      'avaliacao': 'Avaliação'
    };
    return labels[type] || type;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'baixa': 'Baixa',
      'media': 'Média',
      'alta': 'Alta',
      'urgente': 'Urgente'
    };
    return labels[priority] || priority;
  };

  // Filtrar oportunidades
  const filteredOpportunities = opportunities?.filter(opp => {
    if (filters.status && opp.status !== filters.status) return false;
    if (filters.type && opp.type !== filters.type) return false;
    if (filters.priority && opp.priority !== filters.priority) return false;
    if (filters.clientId && opp.clientId !== filters.clientId) return false;
    return true;
  }) || [];

  // 🧹 Limpar feedback após 5 segundos
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
    <DashboardLayout showWidgets={false}>
      <div className="h-full flex flex-col overflow-hidden p-4">
        
        {/* Header compacto */}
        <div className={`
          rounded-lg p-4 mb-4 flex-shrink-0
          ${isDark() ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
        `}>
          <div className="text-center">
            <h2 className={`text-lg font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              🎯 Sistema de Oportunidades
            </h2>
            <p className={`text-xs ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
              Pipeline de vendas e gestão de oportunidades | Layout Otimizado 🚀
            </p>
          </div>
        </div>

        {/* Métricas compactas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4 flex-shrink-0" style={{height: '80px'}}>
          <CompactMetricCard
            title="Total"
            value={(stats.total || 0).toString()}
            trend="Todas oportunidades"
            icon={TargetIcon}
            color="blue"
            onClick={() => setActiveView('list')}
          />
          <CompactMetricCard
            title="Ativas"
            value={(stats.active || 0).toString()}
            trend="Em progresso"
            icon={ClockIcon}
            color="green"
            onClick={() => setActiveView('pipeline')}
          />
          <CompactMetricCard
            title="Ganhas"
            value={(stats.won || 0).toString()}
            trend="Fechadas com sucesso"
            icon={CheckCircleIcon}
            color="yellow"
            onClick={() => console.log('Ver ganhas')}
          />
          <CompactMetricCard
            title="Valor Total"
            value={formatCurrency?.(stats.totalValue || 0) || '€0'}
            trend="Valor do pipeline"
            icon={EyeIcon}
            color="purple"
            onClick={() => console.log('Ver valores')}
          />
          <CompactMetricCard
            title="Taxa Conversão"
            value={`${stats.conversionRate || 0}%`}
            trend="Eficiência vendas"
            icon={PlusIcon}
            color="red"
            onClick={() => setShowCreateForm(true)}
          />
        </div>

        {/* Conteúdo principal - expande para ocupar todo o espaço restante */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ThemedContainer className="space-y-6 h-full overflow-y-auto">

            {/* FEEDBACK MESSAGE */}
            {feedbackMessage && (
              <div className={`p-4 rounded-lg ${
                feedbackType === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
                feedbackType === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
                'bg-blue-100 text-blue-800 border border-blue-200'
              }`}>
                {feedbackMessage}
              </div>
            )}

            {/* BARRA DE AÇÕES E NAVEGAÇÃO */}
            <ThemedCard className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                
                {/* Botão Criar Oportunidade */}
                <ThemedButton
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="lg:w-auto"
                  disabled={creating}
                >
                  {creating ? '⏳ Criando...' : '🎯 Nova Oportunidade'}
                </ThemedButton>

                {/* Navegação entre vistas */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setActiveView('dashboard')}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeView === 'dashboard' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    📊 Dashboard
                  </button>
                  <button
                    onClick={() => setActiveView('pipeline')}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeView === 'pipeline' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    🔄 Pipeline
                  </button>
                  <button
                    onClick={() => setActiveView('list')}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeView === 'list' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    📋 Lista
                  </button>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 flex-1">
                  {/* Filtro por Status */}
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Status</option>
                    <option value="identificacao">Identificação</option>
                    <option value="qualificacao">Qualificação</option>
                    <option value="negociacao">Negociação</option>
                    <option value="proposta">Proposta</option>
                    <option value="fechado_ganho">Fechado Ganho</option>
                  </select>

                  {/* Filtro por Tipo */}
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Tipos</option>
                    <option value="venda">Venda</option>
                    <option value="arrendamento">Arrendamento</option>
                    <option value="investimento">Investimento</option>
                    <option value="avaliacao">Avaliação</option>
                  </select>

                  {/* Filtro por Cliente */}
                  <select
                    value={filters.clientId}
                    onChange={(e) => setFilters({...filters, clientId: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Clientes</option>
                    {clients?.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </ThemedCard>

            {/* FORMULÁRIO DE CRIAÇÃO */}
            {showCreateForm && (
              <ThemedCard className="p-6">
                <h3 className="text-xl font-bold mb-4">Criar Nova Oportunidade</h3>
                
                <form onSubmit={handleCreateSubmit} className="space-y-6">
                  
                  {/* INFORMAÇÕES BÁSICAS */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Informações Básicas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Título */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Título da Oportunidade *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => handleFormChange('title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: Venda Apartamento T3 Lisboa"
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
                          onChange={(e) => handleFormChange('clientId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Selecionar cliente</option>
                          {clients?.map(client => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Tipo */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Operação
                        </label>
                        <select
                          value={formData.type}
                          onChange={(e) => handleFormChange('type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="venda">Venda</option>
                          <option value="arrendamento">Arrendamento</option>
                          <option value="investimento">Investimento</option>
                          <option value="avaliacao">Avaliação</option>
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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="baixa">Baixa</option>
                          <option value="media">Média</option>
                          <option value="alta">Alta</option>
                          <option value="urgente">Urgente</option>
                        </select>
                      </div>

                      {/* Valor Total */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valor Total (€)
                        </label>
                        <input
                          type="number"
                          value={formData.totalValue}
                          onChange={(e) => handleFormChange('totalValue', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="250000"
                        />
                      </div>

                      {/* Data Esperada de Fecho */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data Esperada de Fecho
                        </label>
                        <input
                          type="date"
                          value={formData.expectedCloseDate}
                          onChange={(e) => handleFormChange('expectedCloseDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Morada da Propriedade */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Morada da Propriedade
                        </label>
                        <input
                          type="text"
                          value={formData.propertyAddress}
                          onChange={(e) => handleFormChange('propertyAddress', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Rua da República, 123, Lisboa"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição da Oportunidade
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Detalhes sobre a oportunidade, necessidades do cliente, etc..."
                    />
                  </div>

                  {/* Botões do formulário */}
                  <div className="flex gap-3 pt-4">
                    <ThemedButton
                      type="submit"
                      disabled={creating}
                      className="flex-1 md:flex-none"
                    >
                      {creating ? '⏳ Criando...' : '✅ Criar Oportunidade'}
                    </ThemedButton>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        resetForm();
                      }}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </ThemedCard>
            )}

            {/* CONTEÚDO PRINCIPAL BASEADO NA VISTA ATIVA */}
            <ThemedCard className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold">
                  {activeView === 'dashboard' && 'Dashboard de Oportunidades'}
                  {activeView === 'pipeline' && 'Pipeline de Vendas'}
                  {activeView === 'list' && `Lista de Oportunidades (${filteredOpportunities.length})`}
                </h3>
                {loading && (
                  <p className="text-gray-500 mt-2">⏳ Carregando oportunidades...</p>
                )}
                {error && (
                  <p className="text-red-600 mt-2">❌ {error}</p>
                )}
              </div>

              {/* Vista Dashboard */}
              {activeView === 'dashboard' && (
                <div>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Dashboard de Oportunidades
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Análise detalhada do pipeline de vendas em desenvolvimento.
                    </p>
                    <button
                      onClick={() => setActiveView('list')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      📋 Ver Lista
                    </button>
                  </div>
                </div>
              )}

              {/* Vista Pipeline */}
              {activeView === 'pipeline' && (
                <div>
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔄</div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Pipeline de Vendas
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Vista Kanban do pipeline em desenvolvimento.
                    </p>
                    <button
                      onClick={() => setActiveView('list')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      📋 Ver Lista
                    </button>
                  </div>
                </div>
              )}

              {/* Vista Lista */}
              {activeView === 'list' && (
                <div>
                  {filteredOpportunities.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left p-3 font-medium text-gray-700">Oportunidade</th>
                            <th className="text-left p-3 font-medium text-gray-700">Cliente</th>
                            <th className="text-left p-3 font-medium text-gray-700">Status</th>
                            <th className="text-left p-3 font-medium text-gray-700">Valor</th>
                            <th className="text-left p-3 font-medium text-gray-700">Data Fecho</th>
                            <th className="text-center p-3 font-medium text-gray-700">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredOpportunities.map((opportunity) => (
                            <tr key={opportunity.id} className="border-b border-gray-100 hover:bg-gray-50">
                              
                              {/* Oportunidade */}
                              <td className="p-3">
                                <div className="font-medium text-gray-900">{opportunity.title}</div>
                                <div className="text-sm text-gray-500">
                                  {getTypeLabel(opportunity.type)} - {getPriorityLabel(opportunity.priority)}
                                </div>
                              </td>

                              {/* Cliente */}
                              <td className="p-3">
                                <div className="text-sm text-gray-900">
                                  {getClientName(opportunity.clientId)}
                                </div>
                              </td>

                              {/* Status */}
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(opportunity.status)}`}>
                                  {getStatusLabel(opportunity.status)}
                                </span>
                              </td>

                              {/* Valor */}
                              <td className="p-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {formatCurrency?.(opportunity.totalValue) || 'N/A'}
                                </div>
                                {opportunity.commissionValue && (
                                  <div className="text-xs text-gray-500">
                                    Comissão: {formatCurrency?.(opportunity.commissionValue)}
                                  </div>
                                )}
                              </td>

                              {/* Data Fecho */}
                              <td className="p-3">
                                <div className="text-sm text-gray-900">
                                  {opportunity.expectedCloseDate ? 
                                    opportunity.expectedCloseDate.toLocaleDateString('pt-PT') : 
                                    'Não definida'
                                  }
                                </div>
                              </td>

                              {/* Ações */}
                              <td className="p-3">
                                <div className="flex justify-center gap-1">
                                  
                                  {/* Ver Detalhes */}
                                  <button
                                    onClick={() => setSelectedOpportunity(opportunity)}
                                    className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded"
                                    title="Ver Detalhes"
                                  >
                                    Ver
                                  </button>

                                  {/* Adicionar Atividade */}
                                  <button
                                    onClick={() => {
                                      setSelectedOpportunity(opportunity);
                                      setShowActivityModal(true);
                                    }}
                                    className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded"
                                    title="Adicionar Atividade"
                                  >
                                    Atividade
                                  </button>

                                  {/* Atualizar Status */}
                                  <select
                                    value={opportunity.status}
                                    onChange={(e) => handleStatusChange(opportunity.id, e.target.value)}
                                    className="text-xs border border-gray-300 rounded px-1 py-1"
                                    title="Alterar Status"
                                  >
                                    <option value="identificacao">Identificação</option>
                                    <option value="qualificacao">Qualificação</option>
                                    <option value="apresentacao">Apresentação</option>
                                    <option value="negociacao">Negociação</option>
                                    <option value="proposta">Proposta</option>
                                    <option value="contrato">Contrato</option>
                                    <option value="fechado_ganho">Fechado Ganho</option>
                                    <option value="fechado_perdido">Fechado Perdido</option>
                                  </select>

                                  {/* Eliminar */}
                                  <button
                                    onClick={() => handleDeleteOpportunity(opportunity.id, opportunity.title)}
                                    className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded"
                                    title="Eliminar Oportunidade"
                                  >
                                    Eliminar
                                  </button>
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
                      <div className="text-6xl mb-4">🎯</div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Nenhuma oportunidade encontrada
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {Object.values(filters).some(f => f) 
                          ? 'Tente ajustar os filtros de pesquisa'
                          : 'Comece criando a sua primeira oportunidade de negócio'
                        }
                      </p>
                      {!showCreateForm && (
                        <ThemedButton
                          onClick={() => setShowCreateForm(true)}
                        >
                          Criar Primeira Oportunidade
                        </ThemedButton>
                      )}
                    </div>
                  )}
                </div>
              )}
            </ThemedCard>

            {/* MODAL DE ATIVIDADE */}
            {showActivityModal && selectedOpportunity && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-xl font-bold mb-4">Nova Atividade</h3>
                  
                  <div className="mb-4">
                    <p className="text-gray-600">
                      <strong>Oportunidade:</strong> {selectedOpportunity.title}<br/>
                      <strong>Cliente:</strong> {getClientName(selectedOpportunity.clientId)}
                    </p>
                  </div>

                  <div className="space-y-4">
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Atividade
                      </label>
                      <select
                        value={activityForm.type}
                        onChange={(e) => handleActivityChange('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="call">Chamada</option>
                        <option value="email">Email</option>
                        <option value="meeting">Reunião</option>
                        <option value="presentation">Apresentação</option>
                        <option value="proposal">Proposta</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assunto
                      </label>
                      <input
                        type="text"
                        value={activityForm.subject}
                        onChange={(e) => handleActivityChange('subject', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Assunto da atividade..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={activityForm.description}
                        onChange={(e) => handleActivityChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Detalhes da atividade realizada..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resultado
                      </label>
                      <select
                        value={activityForm.outcome}
                        onChange={(e) => handleActivityChange('outcome', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="positive">Positivo</option>
                        <option value="neutral">Neutro</option>
                        <option value="negative">Negativo</option>
                        <option value="follow_up">Requer seguimento</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <ThemedButton
                        onClick={handleAddActivity}
                        disabled={updating}
                        className="flex-1"
                      >
                        {updating ? 'Adicionando...' : 'Adicionar Atividade'}
                      </ThemedButton>
                      
                      <button
                        onClick={() => {
                          setShowActivityModal(false);
                          setSelectedOpportunity(null);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </ThemedContainer>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default OpportunitiesPage;