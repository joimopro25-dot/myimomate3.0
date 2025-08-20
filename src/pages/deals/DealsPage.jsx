// src/pages/deals/DealsPage.jsx - LAYOUT OTIMIZADO
// ✅ Aplicando padrão DashboardLayout otimizado
// ✅ Sistema de 2 colunas sem widgets laterais  
// ✅ Métricas compactas no topo específicas de Negócios
// ✅ BASEADO NO CÓDIGO ORIGINAL FUNCIONAL
// ✅ Preserva todas as funcionalidades existentes

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useDeals from '../../hooks/useDeals';
import { 
  CurrencyEuroIcon,
  ClockIcon,
  CheckCircleIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// Componente de Métrica Compacta (reutilizado do padrão estabelecido)
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
  
  // Hook personalizado de negócios
  const {
    deals,
    loading,
    error,
    creating,
    updating,
    deleting,
    createDeal,
    updateDeal,
    updateDealStatus,
    deleteDeal,
    addActivity,
    addDocument,
    createFollowUp,
    getDealStats,
    DEAL_STATUS,
    DEAL_TYPES,
    DEAL_PRIORITY,
    PROPERTY_TYPES,
    CONTRACT_STATUS,
    FINANCING_STATUS,
    DEAL_STATUS_COLORS,
    STATUS_PROBABILITY,
    formatCurrency,
    isValidMonetaryValue,
    filters,
    setFilters
  } = useDeals();

  // Estados locais
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [viewMode, setViewMode] = useState('pipeline'); // pipeline, list

  // Estados do formulário de criação
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    dealType: 'venda',
    status: 'proposta',
    priority: 'media',
    value: '',
    commissionPercentage: '3',
    propertyType: 'apartamento',
    propertyAddress: '',
    propertyDetails: '',
    expectedCloseDate: '',
    contractStatus: 'pendente',
    financingStatus: 'nao_aplicavel',
    notes: '',
    tags: []
  });

  // Estados do formulário de atividade
  const [activityForm, setActivityForm] = useState({
    type: 'call',
    description: '',
    outcome: '',
    followUpDate: '',
    notes: ''
  });

  // Estados do formulário de documento
  const [documentForm, setDocumentForm] = useState({
    name: '',
    type: 'contract',
    description: '',
    file: null
  });

  // Obter estatísticas
  const stats = getDealStats || {};

  // Calcular estatísticas para métricas compactas
  const calculatedStats = {
    total: stats.total || deals?.length || 0,
    active: deals?.filter(deal => 
      deal.status !== 'fechado' && deal.status !== 'cancelado'
    ).length || 0,
    won: deals?.filter(deal => deal.status === 'fechado').length || 0,
    totalValue: stats.totalValue || 0,
    conversionRate: stats.conversionRate || 0
  };

  // Efeito para limpar feedback
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage('');
        setFeedbackType('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // 📝 MANIPULADORES DE FORMULÁRIO
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleActivityChange = (e) => {
    const { name, value } = e.target;
    setActivityForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentChange = (e) => {
    const { name, value, files } = e.target;
    setDocumentForm(prev => ({
      ...prev,
      [name]: name === 'file' ? files[0] : value
    }));
  };

  // 🆕 CRIAR NEGÓCIO
  const handleCreateDeal = async (e) => {
    e.preventDefault();
    
    try {
      // Validações básicas
      if (!formData.title.trim()) {
        throw new Error('Título é obrigatório');
      }
      if (!formData.clientName.trim()) {
        throw new Error('Nome do cliente é obrigatório');
      }
      if (!formData.value || parseFloat(formData.value) <= 0) {
        throw new Error('Valor do negócio deve ser válido e maior que zero');
      }

      const dealData = {
        ...formData,
        value: parseFloat(formData.value),
        commissionPercentage: parseFloat(formData.commissionPercentage),
        expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : null,
        tags: formData.tags.filter(tag => tag.trim())
      };

      const success = await createDeal(dealData);
      
      if (success) {
        setFeedbackMessage('Negócio criado com sucesso!');
        setFeedbackType('success');
        setShowCreateForm(false);
        resetForm();
      }
    } catch (err) {
      setFeedbackMessage(err.message || 'Erro ao criar negócio');
      setFeedbackType('error');
    }
  };

  // ✏️ ATUALIZAR STATUS
  const handleStatusUpdate = async (dealId, newStatus) => {
    try {
      const success = await updateDealStatus(dealId, newStatus);
      if (success) {
        setFeedbackMessage('Status atualizado com sucesso!');
        setFeedbackType('success');
      }
    } catch (err) {
      setFeedbackMessage('Erro ao atualizar status');
      setFeedbackType('error');
    }
  };

  // 📝 ADICIONAR ATIVIDADE
  const handleAddActivity = async (e) => {
    e.preventDefault();
    
    try {
      if (!selectedDeal?.id || !activityForm.description.trim()) {
        throw new Error('Descrição da atividade é obrigatória');
      }

      const success = await addActivity(selectedDeal.id, {
        type: activityForm.type,
        description: activityForm.description,
        outcome: activityForm.outcome,
        followUpDate: activityForm.followUpDate ? new Date(activityForm.followUpDate) : null,
        notes: activityForm.notes
      });

      if (success) {
        setFeedbackMessage('Atividade adicionada com sucesso!');
        setFeedbackType('success');
        setShowActivityModal(false);
        setActivityForm({ type: 'call', description: '', outcome: '', followUpDate: '', notes: '' });
      }
    } catch (err) {
      setFeedbackMessage(err.message || 'Erro ao adicionar atividade');
      setFeedbackType('error');
    }
  };

  // 📎 ADICIONAR DOCUMENTO
  const handleAddDocument = async (e) => {
    e.preventDefault();
    
    try {
      if (!selectedDeal?.id || !documentForm.name.trim()) {
        throw new Error('Nome do documento é obrigatório');
      }

      const success = await addDocument(selectedDeal.id, {
        name: documentForm.name,
        type: documentForm.type,
        description: documentForm.description,
        fileName: documentForm.file?.name || '',
        fileSize: documentForm.file?.size || 0,
        fileType: documentForm.file?.type || ''
      });

      if (success) {
        setFeedbackMessage('Documento adicionado com sucesso!');
        setFeedbackType('success');
        setShowDocumentModal(false);
        setDocumentForm({ name: '', type: 'contract', description: '', file: null });
      }
    } catch (err) {
      setFeedbackMessage(err.message || 'Erro ao adicionar documento');
      setFeedbackType('error');
    }
  };

  // 🗑️ EXCLUIR NEGÓCIO
  const handleDeleteDeal = async (dealId) => {
    if (!window.confirm('Tem certeza que deseja excluir este negócio?')) {
      return;
    }

    try {
      const success = await deleteDeal(dealId);
      if (success) {
        setFeedbackMessage('Negócio excluído com sucesso!');
        setFeedbackType('success');
      }
    } catch (err) {
      setFeedbackMessage('Erro ao excluir negócio');
      setFeedbackType('error');
    }
  };

  // 🔄 FUNÇÕES AUXILIARES
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      clientId: '',
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      dealType: 'venda',
      status: 'proposta',
      priority: 'media',
      value: '',
      commissionPercentage: '3',
      propertyType: 'apartamento',
      propertyAddress: '',
      propertyDetails: '',
      expectedCloseDate: '',
      contractStatus: 'pendente',
      financingStatus: 'nao_aplicavel',
      notes: '',
      tags: []
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      'proposta': 'Proposta',
      'aceita': 'Aceita',
      'negociacao': 'Negociação',
      'contrato': 'Contrato',
      'assinado': 'Assinado',
      'condicoes': 'Condições',
      'financiamento': 'Financiamento',
      'escritura': 'Escritura',
      'fechado': 'Fechado',
      'cancelado': 'Cancelado',
      'suspenso': 'Suspenso'
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      'baixa': 'Baixa',
      'media': 'Média',
      'alta': 'Alta',
      'urgente': 'Urgente',
      'critica': 'Crítica'
    };
    return labels[priority] || priority;
  };

  const getDealTypeLabel = (type) => {
    const labels = {
      'venda': 'Venda',
      'arrendamento': 'Arrendamento',
      'compra': 'Compra',
      'permuta': 'Permuta',
      'avaliacao': 'Avaliação',
      'consultoria': 'Consultoria'
    };
    return labels[type] || type;
  };

  // 🎨 RENDERIZAÇÃO DOS COMPONENTES
  
  // Pipeline Visual por Status
  const renderPipeline = () => {
    const statusColumns = ['proposta', 'aceita', 'negociacao', 'contrato', 'assinado', 'fechado'];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statusColumns.map(status => {
          const statusDeals = deals.filter(deal => deal.status === status);
          
          return (
            <div key={status} className="space-y-3">
              <div className="p-3 rounded-lg bg-gray-100 border border-gray-200">
                <h3 className="font-semibold text-sm text-gray-800">
                  {getStatusLabel(status)}
                </h3>
                <p className="text-xs text-gray-600">
                  {statusDeals.length} negócio{statusDeals.length !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-600">
                  {formatCurrency && formatCurrency(statusDeals.reduce((sum, deal) => sum + (deal.value || 0), 0))}
                </p>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {statusDeals.map(deal => (
                  <ThemedCard
                    key={deal.id}
                    className="p-3 cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => {
                      setSelectedDeal(deal);
                      setShowDealModal(true);
                    }}
                  >
                    <h4 className="font-medium text-sm mb-1 truncate">{deal.title}</h4>
                    <p className="text-xs text-gray-600 mb-2">{deal.clientName}</p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-green-600">
                        {formatCurrency && formatCurrency(deal.value)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        deal.priority === 'urgente' || deal.priority === 'critica'
                          ? 'bg-red-100 text-red-800'
                          : deal.priority === 'alta'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {getPriorityLabel(deal.priority)}
                      </span>
                    </div>
                  </ThemedCard>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Lista de Negócios
  const renderList = () => (
    <div className="space-y-4">
      {deals.map(deal => (
        <ThemedCard key={deal.id} className="p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-semibold text-lg">{deal.title}</h3>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {getStatusLabel(deal.status)}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Cliente:</p>
                  <p className="font-medium">{deal.clientName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Valor:</p>
                  <p className="font-semibold text-green-600">{formatCurrency && formatCurrency(deal.value)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tipo:</p>
                  <p className="font-medium">{getDealTypeLabel(deal.dealType)}</p>
                </div>
              </div>
              
              {deal.propertyAddress && (
                <div className="mt-2">
                  <p className="text-gray-600 text-xs">Propriedade:</p>
                  <p className="text-sm">{deal.propertyAddress}</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 ml-4">
              <ThemedButton
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedDeal(deal);
                  setShowDealModal(true);
                }}
              >
                Ver
              </ThemedButton>
              <ThemedButton
                variant="outline"
                size="sm"
                onClick={() => handleDeleteDeal(deal.id)}
                className="text-red-600 hover:text-red-800"
              >
                Excluir
              </ThemedButton>
            </div>
          </div>
        </ThemedCard>
      ))}
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout showWidgets={false}>
        <ThemedContainer className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando negócios...</p>
        </ThemedContainer>
      </DashboardLayout>
    );
  }

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
              Sistema de Negócios
            </h2>
            <p className={`text-xs ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
              Gestão completa do pipeline de vendas | Layout Otimizado
            </p>
          </div>
        </div>

        {/* Métricas compactas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4 flex-shrink-0" style={{height: '80px'}}>
          <CompactMetricCard
            title="Total"
            value={calculatedStats.total.toString()}
            trend="Todos negócios"
            icon={CurrencyEuroIcon}
            color="blue"
            onClick={() => setViewMode('list')}
          />
          <CompactMetricCard
            title="Ativos"
            value={calculatedStats.active.toString()}
            trend="Em progresso"
            icon={ClockIcon}
            color="green"
            onClick={() => setViewMode('pipeline')}
          />
          <CompactMetricCard
            title="Fechados"
            value={calculatedStats.won.toString()}
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
            icon={PlusIcon}
            color="red"
            onClick={() => setShowCreateForm(true)}
          />
        </div>

        {/* Conteúdo principal - expande para ocupar todo o espaço restante */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ThemedContainer className="space-y-6 h-full overflow-y-auto">

            {/* Cabeçalho com ações */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div className="flex space-x-3">
                <ThemedButton
                  variant="outline"
                  onClick={() => setViewMode(viewMode === 'pipeline' ? 'list' : 'pipeline')}
                >
                  {viewMode === 'pipeline' ? 'Vista Lista' : 'Vista Pipeline'}
                </ThemedButton>
                
                <ThemedButton
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  + Novo Negócio
                </ThemedButton>
              </div>
            </div>

            {/* Feedback */}
            {feedbackMessage && (
              <div className={`p-4 rounded-lg ${
                feedbackType === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {feedbackMessage}
              </div>
            )}

            {/* Filtros */}
            <ThemedCard className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  value={filters?.status || 'all'}
                  onChange={(e) => setFilters && setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todos os Status</option>
                  <option value="proposta">Proposta</option>
                  <option value="aceita">Aceita</option>
                  <option value="negociacao">Negociação</option>
                  <option value="contrato">Contrato</option>
                  <option value="assinado">Assinado</option>
                  <option value="fechado">Fechado</option>
                  <option value="cancelado">Cancelado</option>
                </select>

                <select
                  value={filters?.dealType || 'all'}
                  onChange={(e) => setFilters && setFilters(prev => ({ ...prev, dealType: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todos os Tipos</option>
                  <option value="venda">Venda</option>
                  <option value="arrendamento">Arrendamento</option>
                  <option value="compra">Compra</option>
                  <option value="permuta">Permuta</option>
                  <option value="avaliacao">Avaliação</option>
                  <option value="consultoria">Consultoria</option>
                </select>

                <select
                  value={filters?.priority || 'all'}
                  onChange={(e) => setFilters && setFilters(prev => ({ ...prev, priority: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">Todas as Prioridades</option>
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                  <option value="critica">Crítica</option>
                </select>

                <input
                  type="text"
                  placeholder="Pesquisar negócios..."
                  value={filters?.searchTerm || ''}
                  onChange={(e) => setFilters && setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </ThemedCard>

            {/* Erro */}
            {error && (
              <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Conteúdo Principal */}
            {deals && deals.length === 0 ? (
              <ThemedCard className="p-8 text-center">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum negócio encontrado</h3>
                <p className="text-gray-600 mb-4">Comece criando o seu primeiro negócio</p>
                <ThemedButton onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                  + Criar Primeiro Negócio
                </ThemedButton>
              </ThemedCard>
            ) : (
              viewMode === 'pipeline' ? renderPipeline() : renderList()
            )}

            {/* Modal de Criação */}
            {showCreateForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Criar Novo Negócio</h2>
                      <button
                        onClick={() => setShowCreateForm(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleCreateDeal} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Título do Negócio *
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cliente *
                          </label>
                          <input
                            type="text"
                            name="clientName"
                            value={formData.clientName}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Valor do Negócio (€) *
                          </label>
                          <input
                            type="number"
                            name="value"
                            value={formData.value}
                            onChange={handleInputChange}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comissão (%)
                          </label>
                          <input
                            type="number"
                            name="commissionPercentage"
                            value={formData.commissionPercentage}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Negócio
                          </label>
                          <select
                            name="dealType"
                            value={formData.dealType}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="venda">Venda</option>
                            <option value="arrendamento">Arrendamento</option>
                            <option value="compra">Compra</option>
                            <option value="permuta">Permuta</option>
                            <option value="avaliacao">Avaliação</option>
                            <option value="consultoria">Consultoria</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prioridade
                          </label>
                          <select
                            name="priority"
                            value={formData.priority}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="baixa">Baixa</option>
                            <option value="media">Média</option>
                            <option value="alta">Alta</option>
                            <option value="urgente">Urgente</option>
                            <option value="critica">Crítica</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Endereço da Propriedade
                        </label>
                        <input
                          type="text"
                          name="propertyAddress"
                          value={formData.propertyAddress}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Observações
                        </label>
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <ThemedButton
                          type="button"
                          variant="outline"
                          onClick={() => setShowCreateForm(false)}
                        >
                          Cancelar
                        </ThemedButton>
                        <ThemedButton
                          type="submit"
                          disabled={creating}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {creating ? 'Criando...' : 'Criar Negócio'}
                        </ThemedButton>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Detalhes do Negócio */}
            {showDealModal && selectedDeal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">{selectedDeal.title}</h2>
                      <button
                        onClick={() => setShowDealModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Informações Básicas */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Informações Básicas</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Cliente:</span>
                              <span className="font-medium">{selectedDeal.clientName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Valor:</span>
                              <span className="font-semibold text-green-600">{formatCurrency && formatCurrency(selectedDeal.value)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Status:</span>
                              <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                                {getStatusLabel(selectedDeal.status)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Prioridade:</span>
                              <span className="font-medium">{getPriorityLabel(selectedDeal.priority)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Tipo:</span>
                              <span className="font-medium">{getDealTypeLabel(selectedDeal.dealType)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Alterar Status */}
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Alterar Status</h3>
                          <select
                            value={selectedDeal.status}
                            onChange={(e) => handleStatusUpdate(selectedDeal.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="proposta">Proposta</option>
                            <option value="aceita">Aceita</option>
                            <option value="negociacao">Negociação</option>
                            <option value="contrato">Contrato</option>
                            <option value="assinado">Assinado</option>
                            <option value="fechado">Fechado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </div>

                        {/* Ações Rápidas */}
                        <div className="flex space-x-2">
                          <ThemedButton
                            size="sm"
                            onClick={() => setShowActivityModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            + Atividade
                          </ThemedButton>
                          <ThemedButton
                            size="sm"
                            variant="outline"
                            onClick={() => setShowDocumentModal(true)}
                          >
                            + Documento
                          </ThemedButton>
                        </div>
                      </div>

                      {/* Atividades Recentes */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Atividades Recentes</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {selectedDeal.activities?.length > 0 ? (
                            selectedDeal.activities.slice(-5).reverse().map((activity, index) => (
                              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex justify-between items-start">
                                  <span className="text-sm font-medium">{activity.description}</span>
                                  <span className="text-xs text-gray-500">
                                    {activity.timestamp?.toDate?.()?.toLocaleDateString('pt-PT')}
                                  </span>
                                </div>
                                {activity.outcome && (
                                  <p className="text-xs text-gray-600 mt-1">{activity.outcome}</p>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">Nenhuma atividade registada</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Documentos */}
                    {selectedDeal.documents?.length > 0 && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Documentos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {selectedDeal.documents.map((doc, index) => (
                            <div key={index} className="p-2 bg-gray-50 rounded flex items-center space-x-2">
                              <span className="text-sm font-medium">{doc.name}</span>
                              <span className="text-xs text-gray-500">({doc.type})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Observações */}
                    {selectedDeal.notes && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Observações</h3>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedDeal.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Adicionar Atividade */}
            {showActivityModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Adicionar Atividade</h2>
                      <button
                        onClick={() => setShowActivityModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleAddActivity} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Atividade
                        </label>
                        <select
                          name="type"
                          value={activityForm.type}
                          onChange={handleActivityChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="call">Chamada</option>
                          <option value="email">Email</option>
                          <option value="meeting">Reunião</option>
                          <option value="visit">Visita</option>
                          <option value="proposal">Proposta</option>
                          <option value="contract">Contrato</option>
                          <option value="other">Outro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descrição *
                        </label>
                        <textarea
                          name="description"
                          value={activityForm.description}
                          onChange={handleActivityChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Resultado
                        </label>
                        <input
                          type="text"
                          name="outcome"
                          value={activityForm.outcome}
                          onChange={handleActivityChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Data de Follow-up
                        </label>
                        <input
                          type="datetime-local"
                          name="followUpDate"
                          value={activityForm.followUpDate}
                          onChange={handleActivityChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <ThemedButton
                          type="button"
                          variant="outline"
                          onClick={() => setShowActivityModal(false)}
                        >
                          Cancelar
                        </ThemedButton>
                        <ThemedButton
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Adicionar
                        </ThemedButton>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Modal de Adicionar Documento */}
            {showDocumentModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Adicionar Documento</h2>
                      <button
                        onClick={() => setShowDocumentModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>

                    <form onSubmit={handleAddDocument} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Documento *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={documentForm.name}
                          onChange={handleDocumentChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Documento
                        </label>
                        <select
                          name="type"
                          value={documentForm.type}
                          onChange={handleDocumentChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="contract">Contrato</option>
                          <option value="proposal">Proposta</option>
                          <option value="identification">Identificação</option>
                          <option value="financial">Financeiro</option>
                          <option value="legal">Legal</option>
                          <option value="other">Outro</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descrição
                        </label>
                        <textarea
                          name="description"
                          value={documentForm.description}
                          onChange={handleDocumentChange}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ficheiro
                        </label>
                        <input
                          type="file"
                          name="file"
                          onChange={handleDocumentChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <ThemedButton
                          type="button"
                          variant="outline"
                          onClick={() => setShowDocumentModal(false)}
                        >
                          Cancelar
                        </ThemedButton>
                        <ThemedButton
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Adicionar
                        </ThemedButton>
                      </div>
                    </form>
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

export default DealsPage;