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
  BuildingOfficeIcon, 
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
  const [activeView, setActiveView] = useState('dashboard');
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

  // Estatísticas calculadas - CORRIGIDO: getOpportunityStats é um valor, não função
  const stats = getOpportunityStats || {
    total: 0,
    byStatus: {},
    totalValue: 0,
    conversionRate: 0,
    pipelineValue: 0,
    averageValue: 0
  };

  // Calcular estatísticas específicas para as métricas compactas
  const calculatedStats = {
    total: stats.total || opportunities?.length || 0,
    active: opportunities?.filter(opp => 
      opp.status !== 'fechado_ganho' && opp.status !== 'fechado_perdido'
    ).length || 0,
    won: stats.byStatus?.fechado_ganho || 0,
    totalValue: stats.totalValue || 0,
    conversionRate: stats.conversionRate || 0
  };

  // Filtrar oportunidades
  const filteredOpportunities = opportunities?.filter(opp => {
    if (filters.status && opp.status !== filters.status) return false;
    if (filters.type && opp.type !== filters.type) return false;
    if (filters.priority && opp.priority !== filters.priority) return false;
    if (filters.clientId && opp.clientId !== filters.clientId) return false;
    return true;
  }) || [];

  // Agrupar por status para pipeline
  const opportunitiesByStatus = Object.values(OPPORTUNITY_STATUS || {}).reduce((acc, status) => {
    acc[status] = filteredOpportunities.filter(opp => opp.status === status);
    return acc;
  }, {});

  // Reset do formulário
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

  // Manipular criação
  const handleCreate = async (e) => {
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

  // Manipular status
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

  // Adicionar atividade
  const handleAddActivity = async (e) => {
    e.preventDefault();
    
    if (!selectedOpportunity) return;

    try {
      const result = await addActivity?.(selectedOpportunity.id, activityForm);
      
      if (result?.success) {
        setFeedbackMessage('Atividade adicionada com sucesso!');
        setFeedbackType('success');
        setShowActivityModal(false);
        setActivityForm({ type: 'call', subject: '', description: '', outcome: 'positive' });
      } else {
        setFeedbackMessage(result?.error || 'Erro ao adicionar atividade');
        setFeedbackType('error');
      }
    } catch (err) {
      setFeedbackMessage(`Erro inesperado: ${err.message}`);
      setFeedbackType('error');
    }
  };

  // Obter nome do cliente
  const getClientName = (clientId) => {
    const client = clients?.find(c => c.id === clientId);
    return client?.name || 'Cliente não encontrado';
  };

  // Obter cor do status
  const getStatusColor = (status) => {
    return STATUS_COLORS?.[status] || 'bg-gray-100 text-gray-800';
  };

  // Limpar feedback após 5 segundos
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage('');
        setFeedbackType('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // Render do dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      
      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <span className="text-xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Oportunidades</p>
              <p className="text-2xl font-bold text-gray-900">{calculatedStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <span className="text-xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor do Pipeline</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency?.(stats.pipelineValue) || '€0'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <span className="text-xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-gray-900">{calculatedStats.conversionRate?.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <span className="text-xl">💎</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Médio</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency?.(stats.averageValue) || '€0'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico por status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Oportunidades por Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(stats.byStatus || {}).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(status)}`}>
                {status.replace('_', ' ')}
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render do pipeline visual
  const renderPipeline = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Pipeline de Vendas</h3>
      </div>
      
      <div className="p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {Object.values(OPPORTUNITY_STATUS || {}).filter(status => 
            status !== 'fechado_perdido' && status !== 'pausado'
          ).map(status => (
            <div key={status} className="flex-shrink-0 w-80">
              <div className={`p-3 rounded-lg mb-4 ${getStatusColor(status)}`}>
                <h4 className="font-medium text-center">
                  {status.replace('_', ' ').toUpperCase()}
                </h4>
                <p className="text-sm text-center mt-1">
                  {opportunitiesByStatus[status]?.length || 0} oportunidades
                </p>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {opportunitiesByStatus[status]?.map(opp => (
                  <div key={opp.id} className="bg-gray-50 p-4 rounded-lg border">
                    <h5 className="font-medium text-gray-900">{opp.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">{getClientName(opp.clientId)}</p>
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      {formatCurrency?.(opp.totalValue) || '€0'}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setSelectedOpportunity(opp);
                          setShowActivityModal(true);
                        }}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        + Atividade
                      </button>
                      {status !== 'fechado_ganho' && (
                        <select
                          value={opp.status}
                          onChange={(e) => handleStatusChange(opp.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-1"
                        >
                          {Object.entries(OPPORTUNITY_STATUS || {}).map(([key, value]) => (
                            <option key={value} value={value}>
                              {key.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render da lista
  const renderList = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Lista de Oportunidades</h3>
          
          {/* Filtros */}
          <div className="flex gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todos os status</option>
              {Object.entries(OPPORTUNITY_STATUS || {}).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.replace('_', ' ')}
                </option>
              ))}
            </select>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todos os tipos</option>
              {Object.entries(OPPORTUNITY_TYPES || {}).map(([key, value]) => (
                <option key={value} value={value}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Oportunidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Probabilidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOpportunities.map(opp => (
              <tr key={opp.id}>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{opp.title}</div>
                    <div className="text-sm text-gray-500">{opp.type}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {getClientName(opp.clientId)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(opp.status)}`}>
                    {opp.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatCurrency?.(opp.totalValue) || '€0'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {opp.probability || 0}%
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedOpportunity(opp);
                        setShowActivityModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      💬
                    </button>
                    <button
                      onClick={() => deleteOpportunity?.(opp.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render do formulário de criação
  const renderCreateForm = () => (
    <ThemedCard className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Nova Oportunidade</h3>
      
      <form onSubmit={handleCreate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Título */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título da Oportunidade *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Venda de apartamento T2"
              required
            />
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente *
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
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
              Tipo
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(OPPORTUNITY_TYPES || {}).map(([key, value]) => (
                <option key={value} value={value}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Total (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.totalValue}
              onChange={(e) => setFormData(prev => ({ ...prev, totalValue: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="250000"
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
              onChange={(e) => setFormData(prev => ({ ...prev, commissionPercentage: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="3"
            />
          </div>

          {/* Descrição */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Detalhes da oportunidade..."
            />
          </div>
        </div>

        <div className="flex gap-3">
          <ThemedButton type="submit" disabled={creating}>
            {creating ? 'Criando...' : 'Criar Oportunidade'}
          </ThemedButton>
          
          <button
            type="button"
            onClick={() => {
              setShowCreateForm(false);
              resetForm();
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </ThemedCard>
  );

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
              Pipeline de vendas e gestão de oportunidades | Layout Otimizado
            </p>
          </div>
        </div>

        {/* Métricas compactas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4 flex-shrink-0" style={{height: '80px'}}>
          <CompactMetricCard
            title="Total"
            value={calculatedStats.total.toString()}
            trend="Todas oportunidades"
            icon={BuildingOfficeIcon}
            color="blue"
            onClick={() => setActiveView('list')}
          />
          <CompactMetricCard
            title="Ativas"
            value={calculatedStats.active.toString()}
            trend="Em progresso"
            icon={ClockIcon}
            color="green"
            onClick={() => setActiveView('pipeline')}
          />
          <CompactMetricCard
            title="Ganhas"
            value={calculatedStats.won.toString()}
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
                  {creating ? 'Criando...' : '+ Nova Oportunidade'}
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

            {/* CONTEÚDO PRINCIPAL BASEADO NA VISTA ATIVA */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="text-2xl mb-2">⏳</div>
                <p className="text-gray-600">Carregando oportunidades...</p>
              </div>
            ) : showCreateForm ? (
              renderCreateForm()
            ) : activeView === 'dashboard' ? (
              renderDashboard()
            ) : activeView === 'pipeline' ? (
              renderPipeline()
            ) : (
              renderList()
            )}

            {/* Modal de atividade */}
            {showActivityModal && selectedOpportunity && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-lg font-bold mb-4">
                    Nova Atividade - {selectedOpportunity.title}
                  </h3>
                  
                  <form onSubmit={handleAddActivity} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo
                      </label>
                      <select
                        value={activityForm.type}
                        onChange={(e) => setActivityForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="call">Chamada</option>
                        <option value="email">Email</option>
                        <option value="meeting">Reunião</option>
                        <option value="note">Nota</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assunto
                      </label>
                      <input
                        type="text"
                        value={activityForm.subject}
                        onChange={(e) => setActivityForm(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        value={activityForm.description}
                        onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <ThemedButton type="submit">
                        Adicionar
                      </ThemedButton>
                      
                      <button
                        type="button"
                        onClick={() => setShowActivityModal(false)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
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