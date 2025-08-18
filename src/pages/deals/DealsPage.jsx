// src/pages/deals/DealsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useDeals from '../../hooks/useDeals';

// 🎯 PÁGINA PRINCIPAL DO SISTEMA DE NEGÓCIOS (DEALS)
// =================================================
// MyImoMate 3.0 - Interface completa para gestão de negócios
// Funcionalidades: Pipeline visual, CRUD, Estatísticas, Follow-ups

const DealsPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
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
    dealType: DEAL_TYPES?.VENDA || 'venda',
    status: DEAL_STATUS?.PROPOSTA || 'proposta',
    priority: DEAL_PRIORITY?.MEDIA || 'media',
    value: '',
    commissionPercentage: '3',
    propertyType: PROPERTY_TYPES?.APARTAMENTO || 'apartamento',
    propertyAddress: '',
    propertyDetails: '',
    expectedCloseDate: '',
    contractStatus: CONTRACT_STATUS?.PENDENTE || 'pendente',
    financingStatus: FINANCING_STATUS?.NAO_APLICAVEL || 'nao_aplicavel',
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
      // Validações
      if (!formData.title.trim()) {
        throw new Error('Título é obrigatório');
      }
      if (!formData.clientName.trim()) {
        throw new Error('Nome do cliente é obrigatório');
      }
      if (!formData.value || !isValidMonetaryValue(parseFloat(formData.value))) {
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
      dealType: DEAL_TYPES?.VENDA || 'venda',
      status: DEAL_STATUS?.PROPOSTA || 'proposta',
      priority: DEAL_PRIORITY?.MEDIA || 'media',
      value: '',
      commissionPercentage: '3',
      propertyType: PROPERTY_TYPES?.APARTAMENTO || 'apartamento',
      propertyAddress: '',
      propertyDetails: '',
      expectedCloseDate: '',
      contractStatus: CONTRACT_STATUS?.PENDENTE || 'pendente',
      financingStatus: FINANCING_STATUS?.NAO_APLICAVEL || 'nao_aplicavel',
      notes: '',
      tags: []
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      [DEAL_STATUS.PROPOSTA]: 'Proposta',
      [DEAL_STATUS.ACEITA]: 'Aceita',
      [DEAL_STATUS.NEGOCIACAO]: 'Negociação',
      [DEAL_STATUS.CONTRATO]: 'Contrato',
      [DEAL_STATUS.ASSINADO]: 'Assinado',
      [DEAL_STATUS.CONDICOES]: 'Condições',
      [DEAL_STATUS.FINANCIAMENTO]: 'Financiamento',
      [DEAL_STATUS.ESCRITURA]: 'Escritura',
      [DEAL_STATUS.FECHADO]: 'Fechado',
      [DEAL_STATUS.CANCELADO]: 'Cancelado',
      [DEAL_STATUS.SUSPENSO]: 'Suspenso'
    };
    return labels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      [DEAL_PRIORITY.BAIXA]: 'Baixa',
      [DEAL_PRIORITY.MEDIA]: 'Média',
      [DEAL_PRIORITY.ALTA]: 'Alta',
      [DEAL_PRIORITY.URGENTE]: 'Urgente',
      [DEAL_PRIORITY.CRITICA]: 'Crítica'
    };
    return labels[priority] || priority;
  };

  const getDealTypeLabel = (type) => {
    const labels = {
      [DEAL_TYPES.VENDA]: 'Venda',
      [DEAL_TYPES.ARRENDAMENTO]: 'Arrendamento',
      [DEAL_TYPES.COMPRA]: 'Compra',
      [DEAL_TYPES.PERMUTA]: 'Permuta',
      [DEAL_TYPES.AVALIACAO]: 'Avaliação',
      [DEAL_TYPES.CONSULTORIA]: 'Consultoria'
    };
    return labels[type] || type;
  };

  // 🎨 RENDERIZAÇÃO DOS COMPONENTES
  
  // Pipeline Visual por Status
  const renderPipeline = () => {
    const statusColumns = [
      DEAL_STATUS.PROPOSTA,
      DEAL_STATUS.ACEITA,
      DEAL_STATUS.NEGOCIACAO,
      DEAL_STATUS.CONTRATO,
      DEAL_STATUS.ASSINADO,
      DEAL_STATUS.FECHADO
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statusColumns.map(status => {
          const statusDeals = deals.filter(deal => deal.status === status);
          const statusColors = DEAL_STATUS_COLORS[status];
          
          return (
            <div key={status} className="space-y-3">
              <div className={`p-3 rounded-lg ${statusColors?.bg || 'bg-gray-100'} ${statusColors?.border || 'border-gray-200'} border`}>
                <h3 className={`font-semibold text-sm ${statusColors?.text || 'text-gray-800'}`}>
                  {getStatusLabel(status)}
                </h3>
                <p className={`text-xs ${statusColors?.text || 'text-gray-800'} opacity-75`}>
                  {statusDeals.length} negócio{statusDeals.length !== 1 ? 's' : ''}
                </p>
                <p className={`text-xs ${statusColors?.text || 'text-gray-800'} opacity-75`}>
                  {formatCurrency(statusDeals.reduce((sum, deal) => sum + (deal.value || 0), 0))}
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
                        {formatCurrency(deal.value)}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        deal.priority === DEAL_PRIORITY.URGENTE || deal.priority === DEAL_PRIORITY.CRITICA
                          ? 'bg-red-100 text-red-800'
                          : deal.priority === DEAL_PRIORITY.ALTA
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
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  DEAL_STATUS_COLORS[deal.status]?.bg || 'bg-gray-100'
                } ${DEAL_STATUS_COLORS[deal.status]?.text || 'text-gray-800'}`}>
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
                  <p className="font-semibold text-green-600">{formatCurrency(deal.value)}</p>
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

  // Estatísticas em Cards
  const renderStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <ThemedCard className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Total de Negócios</h3>
        <p className="text-2xl font-bold text-blue-600">{stats.total || 0}</p>
      </ThemedCard>
      
      <ThemedCard className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Valor Total</h3>
        <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue || 0)}</p>
      </ThemedCard>
      
      <ThemedCard className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Receita Esperada</h3>
        <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.expectedRevenue || 0)}</p>
      </ThemedCard>
      
      <ThemedCard className="p-4">
        <h3 className="text-sm font-medium text-gray-600 mb-1">Taxa de Conversão</h3>
        <p className="text-2xl font-bold text-orange-600">{(stats.conversionRate || 0).toFixed(1)}%</p>
      </ThemedCard>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <ThemedContainer className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando negócios...</p>
        </ThemedContainer>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ThemedContainer className="space-y-6">
        {/* Cabeçalho */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sistema de Negócios</h1>
            <p className="text-gray-600 mt-1">Gestão completa do pipeline de vendas</p>
          </div>
          
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
              {DEAL_STATUS && Object.values(DEAL_STATUS).map(status => (
                <option key={status} value={status}>{getStatusLabel(status)}</option>
              ))}
            </select>

            <select
              value={filters?.dealType || 'all'}
              onChange={(e) => setFilters && setFilters(prev => ({ ...prev, dealType: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os Tipos</option>
              {DEAL_TYPES && Object.values(DEAL_TYPES).map(type => (
                <option key={type} value={type}>{getDealTypeLabel(type)}</option>
              ))}
            </select>

            <select
              value={filters?.priority || 'all'}
              onChange={(e) => setFilters && setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todas as Prioridades</option>
              {DEAL_PRIORITY && Object.values(DEAL_PRIORITY).map(priority => (
                <option key={priority} value={priority}>{getPriorityLabel(priority)}</option>
              ))}
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

        {/* Estatísticas */}
        {renderStats()}

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
                        {DEAL_TYPES && Object.values(DEAL_TYPES).map(type => (
                          <option key={type} value={type}>{getDealTypeLabel(type)}</option>
                        ))}
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
                        {DEAL_PRIORITY && Object.values(DEAL_PRIORITY).map(priority => (
                          <option key={priority} value={priority}>{getPriorityLabel(priority)}</option>
                        ))}
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
                          <span className="font-semibold text-green-600">{formatCurrency(selectedDeal.value)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Comissão:</span>
                          <span className="font-medium">{formatCurrency(selectedDeal.commissionValue)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            DEAL_STATUS_COLORS[selectedDeal.status]?.bg || 'bg-gray-100'
                          } ${DEAL_STATUS_COLORS[selectedDeal.status]?.text || 'text-gray-800'}`}>
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
                        {DEAL_STATUS && Object.values(DEAL_STATUS).map(status => (
                          <option key={status} value={status}>{getStatusLabel(status)}</option>
                        ))}
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
                        selectedDeal.activities.slice(-5).reverse().map(activity => (
                          <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
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
                      {selectedDeal.documents.map(doc => (
                        <div key={doc.id} className="p-2 bg-gray-50 rounded flex items-center space-x-2">
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
    </DashboardLayout>
  );
};

export default DealsPage;