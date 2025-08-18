// src/pages/clients/ClientsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useClients from '../../hooks/useClients';

// 🎯 PÁGINA PRINCIPAL DO MÓDULO DE CLIENTES
// ========================================
// MyImoMate 3.0 - Interface completa para gestão de clientes
// Funcionalidades: CRUD, Interações, Filtros, Ações lote, Integração leads

const ClientsPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Hook personalizado de clientes
  const {
    clients,
    loading,
    error,
    creating,
    updating,
    duplicateCheck,
    filters,
    createClient,
    updateClient,
    updateClientStatus,
    deleteClient,
    addInteraction,
    searchClients,
    setFilters,
    checkForDuplicates,
    getClientStats,
    CLIENT_STATUS,
    CLIENT_TYPES,
    CLIENT_BUDGET_RANGES,
    PROPERTY_INTERESTS,
    CLIENT_STATUS_COLORS,
    CONTACT_TYPES
  } = useClients();

  // Estados locais
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');

  // Estados do formulário principal
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    phoneSecondary: '',
    email: '',
    emailSecondary: '',
    nif: '',
    clientType: CLIENT_TYPES.COMPRADOR,
    status: CLIENT_STATUS.ATIVO,
    address: {
      street: '',
      number: '',
      floor: '',
      door: '',
      postalCode: '',
      city: '',
      district: '',
      country: 'Portugal'
    },
    propertyInterests: [PROPERTY_INTERESTS.COMPRA_CASA],
    budgetRange: 'undefined',
    preferredLocations: [],
    preferredContactMethod: 'phone',
    preferredContactTime: 'anytime',
    profession: '',
    company: '',
    notes: '',
    allowsMarketing: true
  });

  // Estados do formulário de interação
  const [interactionForm, setInteractionForm] = useState({
    type: 'call',
    subject: '',
    description: '',
    duration: '',
    outcome: 'neutral',
    nextAction: '',
    scheduledFollowUp: ''
  });

  // Obter estatísticas
  const stats = getClientStats();

  // 📝 MANIPULAR MUDANÇAS NO FORMULÁRIO PRINCIPAL
  const handleFormChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // 📝 MANIPULAR MUDANÇAS NO FORMULÁRIO DE INTERAÇÃO
  const handleInteractionChange = (field, value) => {
    setInteractionForm(prev => ({ ...prev, [field]: value }));
  };

  // 🔄 RESET DO FORMULÁRIO PRINCIPAL
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      phoneSecondary: '',
      email: '',
      emailSecondary: '',
      nif: '',
      clientType: CLIENT_TYPES.COMPRADOR,
      status: CLIENT_STATUS.ATIVO,
      address: {
        street: '',
        number: '',
        floor: '',
        door: '',
        postalCode: '',
        city: '',
        district: '',
        country: 'Portugal'
      },
      propertyInterests: [PROPERTY_INTERESTS.COMPRA_CASA],
      budgetRange: 'undefined',
      preferredLocations: [],
      preferredContactMethod: 'phone',
      preferredContactTime: 'anytime',
      profession: '',
      company: '',
      notes: '',
      allowsMarketing: true
    });
  };

  // 🔄 RESET DO FORMULÁRIO DE INTERAÇÃO
  const resetInteractionForm = () => {
    setInteractionForm({
      type: 'call',
      subject: '',
      description: '',
      duration: '',
      outcome: 'neutral',
      nextAction: '',
      scheduledFollowUp: ''
    });
  };

  // 📝 SUBMETER FORMULÁRIO DE CRIAÇÃO
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await createClient(formData);
      
      if (result.success) {
        setFeedbackMessage('Cliente criado com sucesso!');
        setFeedbackType('success');
        setShowCreateForm(false);
        resetForm();
      } else {
        setFeedbackMessage(result.message || 'Erro ao criar cliente');
        setFeedbackType('error');
      }
    } catch (err) {
      setFeedbackMessage(`Erro inesperado: ${err.message}`);
      setFeedbackType('error');
    }
  };

  // 📝 SUBMETER INTERAÇÃO
  const handleInteractionSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClient) return;

    try {
      const result = await addInteraction(selectedClient.id, interactionForm);
      
      if (result.success) {
        setFeedbackMessage('Interação registada com sucesso!');
        setFeedbackType('success');
        setShowInteractionModal(false);
        resetInteractionForm();
        setSelectedClient(null);
      } else {
        setFeedbackMessage(result.error || 'Erro ao registar interação');
        setFeedbackType('error');
      }
    } catch (err) {
      setFeedbackMessage(`Erro inesperado: ${err.message}`);
      setFeedbackType('error');
    }
  };

  // 🔄 ATUALIZAR STATUS
  const handleStatusChange = async (clientId, newStatus) => {
    const result = await updateClientStatus(clientId, newStatus);
    
    if (result.success) {
      setFeedbackMessage('Status atualizado com sucesso!');
      setFeedbackType('success');
    } else {
      setFeedbackMessage(result.error || 'Erro ao atualizar status');
      setFeedbackType('error');
    }
  };

  // 🗑️ ELIMINAR CLIENTE
  const handleDeleteClient = async (clientId, clientName) => {
    if (!window.confirm(`Tem certeza que deseja eliminar o cliente "${clientName}"?`)) {
      return;
    }

    const result = await deleteClient(clientId);
    
    if (result.success) {
      setFeedbackMessage('Cliente eliminado com sucesso!');
      setFeedbackType('success');
    } else {
      setFeedbackMessage(result.error || 'Erro ao eliminar cliente');
      setFeedbackType('error');
    }
  };

  // 👁️ VER DETALHES DO CLIENTE
  const handleViewClient = (client) => {
    setSelectedClient(client);
    setShowClientDetails(true);
  };

  // 📞 ADICIONAR INTERAÇÃO RÁPIDA
  const handleQuickInteraction = (client, type = 'call') => {
    setSelectedClient(client);
    setInteractionForm(prev => ({ ...prev, type }));
    setShowInteractionModal(true);
  };

  // 🔍 OBTER RÓTULOS LEGÍVEIS
  const getClientTypeLabel = (type) => {
    const labels = {
      [CLIENT_TYPES.COMPRADOR]: 'Comprador',
      [CLIENT_TYPES.VENDEDOR]: 'Vendedor',
      [CLIENT_TYPES.INQUILINO]: 'Inquilino',
      [CLIENT_TYPES.SENHORIO]: 'Senhorio',
      [CLIENT_TYPES.INVESTIDOR]: 'Investidor',
      [CLIENT_TYPES.MISTO]: 'Misto'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status) => {
    const labels = {
      [CLIENT_STATUS.ATIVO]: 'Ativo',
      [CLIENT_STATUS.INATIVO]: 'Inativo',
      [CLIENT_STATUS.VIP]: 'VIP',
      [CLIENT_STATUS.PROSPECT]: 'Prospect',
      [CLIENT_STATUS.EX_CLIENTE]: 'Ex-Cliente',
      [CLIENT_STATUS.BLOQUEADO]: 'Bloqueado'
    };
    return labels[status] || status;
  };

  const getPropertyInterestLabel = (interest) => {
    const labels = {
      [PROPERTY_INTERESTS.COMPRA_CASA]: 'Compra Casa',
      [PROPERTY_INTERESTS.COMPRA_APARTAMENTO]: 'Compra Apartamento',
      [PROPERTY_INTERESTS.COMPRA_TERRENO]: 'Compra Terreno',
      [PROPERTY_INTERESTS.COMPRA_COMERCIAL]: 'Compra Comercial',
      [PROPERTY_INTERESTS.VENDA_CASA]: 'Venda Casa',
      [PROPERTY_INTERESTS.VENDA_APARTAMENTO]: 'Venda Apartamento',
      [PROPERTY_INTERESTS.VENDA_TERRENO]: 'Venda Terreno',
      [PROPERTY_INTERESTS.VENDA_COMERCIAL]: 'Venda Comercial',
      [PROPERTY_INTERESTS.ARRENDAMENTO_CASA]: 'Arrendamento Casa',
      [PROPERTY_INTERESTS.ARRENDAMENTO_APARTAMENTO]: 'Arrendamento Apartamento',
      [PROPERTY_INTERESTS.ARRENDAMENTO_COMERCIAL]: 'Arrendamento Comercial',
      [PROPERTY_INTERESTS.INVESTIMENTO_COMPRA]: 'Investimento Compra',
      [PROPERTY_INTERESTS.INVESTIMENTO_RENDA]: 'Investimento Renda'
    };
    return labels[interest] || interest;
  };

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
    <DashboardLayout>
      <ThemedContainer className="space-y-6">
        
        {/* HEADER COM TÍTULO E ESTATÍSTICAS */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gestão de Clientes
            </h1>
            <p className="text-gray-600">
              Base de dados completa com histórico de interações
            </p>
          </div>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.activeClients}</div>
              <div className="text-sm text-gray-500">Ativos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.vipClients}</div>
              <div className="text-sm text-gray-500">VIP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.withInteractions}</div>
              <div className="text-sm text-gray-500">Com Interações</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">{stats.recentClients}</div>
              <div className="text-sm text-gray-500">Novos (30d)</div>
            </div>
          </div>
        </div>

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

        {/* BARRA DE AÇÕES E FILTROS */}
        <ThemedCard className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Botão Criar Cliente */}
            <ThemedButton
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="lg:w-auto"
              disabled={creating}
            >
              {creating ? '⏳ Criando...' : '➕ Novo Cliente'}
            </ThemedButton>

            {/* Barra de pesquisa */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Pesquisar por nome, email, telefone, NIF ou cidade..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onChange={(e) => searchClients(e.target.value)}
                value={filters.searchTerm}
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              {/* Filtro por Status */}
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os Status</option>
                {Object.values(CLIENT_STATUS).map(status => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>

              {/* Filtro por Tipo */}
              <select
                value={filters.clientType}
                onChange={(e) => setFilters(prev => ({ ...prev, clientType: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os Tipos</option>
                {Object.values(CLIENT_TYPES).map(type => (
                  <option key={type} value={type}>
                    {getClientTypeLabel(type)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ThemedCard>

        {/* FORMULÁRIO DE CRIAÇÃO DE CLIENTE */}
        {showCreateForm && (
          <ThemedCard className="p-6">
            <h3 className="text-xl font-bold mb-4">Criar Novo Cliente</h3>
            
            <form onSubmit={handleCreateSubmit} className="space-y-6">
              
              {/* DADOS BÁSICOS */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Dados Básicos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Nome */}
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome completo do cliente"
                    />
                  </div>

                  {/* Telefone Primário */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone Principal *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="9XX XXX XXX"
                    />
                  </div>

                  {/* Telefone Secundário */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone Secundário
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneSecondary}
                      onChange={(e) => handleFormChange('phoneSecondary', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="9XX XXX XXX"
                    />
                  </div>

                  {/* Email Principal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Principal
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  {/* Email Secundário */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Secundário
                    </label>
                    <input
                      type="email"
                      value={formData.emailSecondary}
                      onChange={(e) => handleFormChange('emailSecondary', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="email2@exemplo.com"
                    />
                  </div>

                  {/* NIF */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIF
                    </label>
                    <input
                      type="text"
                      value={formData.nif}
                      onChange={(e) => handleFormChange('nif', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="123456789"
                      maxLength={9}
                    />
                  </div>

                  {/* Tipo de Cliente */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Cliente
                    </label>
                    <select
                      value={formData.clientType}
                      onChange={(e) => handleFormChange('clientType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.values(CLIENT_TYPES).map(type => (
                        <option key={type} value={type}>
                          {getClientTypeLabel(type)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleFormChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.values(CLIENT_STATUS).map(status => (
                        <option key={status} value={status}>
                          {getStatusLabel(status)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* MORADA */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Morada</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Rua */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Rua/Avenida
                    </label>
                    <input
                      type="text"
                      value={formData.address.street}
                      onChange={(e) => handleFormChange('address.street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Nome da rua ou avenida"
                    />
                  </div>

                  {/* Número */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número
                    </label>
                    <input
                      type="text"
                      value={formData.address.number}
                      onChange={(e) => handleFormChange('address.number', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="123"
                    />
                  </div>

                  {/* Andar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Andar
                    </label>
                    <input
                      type="text"
                      value={formData.address.floor}
                      onChange={(e) => handleFormChange('address.floor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="3º"
                    />
                  </div>

                  {/* Porta */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Porta
                    </label>
                    <input
                      type="text"
                      value={formData.address.door}
                      onChange={(e) => handleFormChange('address.door', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Esq"
                    />
                  </div>

                  {/* Código Postal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      value={formData.address.postalCode}
                      onChange={(e) => handleFormChange('address.postalCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="1000-001"
                    />
                  </div>

                  {/* Cidade */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleFormChange('address.city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Lisboa"
                    />
                  </div>

                  {/* Distrito */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Distrito
                    </label>
                    <input
                      type="text"
                      value={formData.address.district}
                      onChange={(e) => handleFormChange('address.district', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Lisboa"
                    />
                  </div>
                </div>
              </div>

              {/* PREFERÊNCIAS */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Preferências</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Orçamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Faixa de Orçamento
                    </label>
                    <select
                      value={formData.budgetRange}
                      onChange={(e) => handleFormChange('budgetRange', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(CLIENT_BUDGET_RANGES).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Método de contacto preferido */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Método de Contacto Preferido
                    </label>
                    <select
                      value={formData.preferredContactMethod}
                      onChange={(e) => handleFormChange('preferredContactMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="phone">Telefone</option>
                      <option value="email">Email</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="sms">SMS</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* NOTAS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas / Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Informações adicionais sobre o cliente..."
                />
              </div>

              {/* GDPR */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowsMarketing"
                  checked={formData.allowsMarketing}
                  onChange={(e) => handleFormChange('allowsMarketing', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="allowsMarketing" className="ml-2 text-sm text-gray-700">
                  Cliente autoriza contacto para marketing (GDPR)
                </label>
              </div>

              {/* Botões do formulário */}
              <div className="flex gap-3 pt-4">
                <ThemedButton
                  type="submit"
                  disabled={creating || duplicateCheck}
                  className="flex-1 md:flex-none"
                >
                  {creating ? '⏳ Criando...' : duplicateCheck ? '🔍 Verificando...' : '✅ Criar Cliente'}
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

        {/* LISTA DE CLIENTES */}
        <ThemedCard className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold">
              Lista de Clientes ({clients.length})
            </h3>
            {loading && (
              <p className="text-gray-500 mt-2">⏳ Carregando clientes...</p>
            )}
            {error && (
              <p className="text-red-600 mt-2">❌ {error}</p>
            )}
          </div>

          {/* Tabela de clientes */}
          {clients.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-medium text-gray-700">Cliente</th>
                    <th className="text-left p-3 font-medium text-gray-700">Contacto</th>
                    <th className="text-left p-3 font-medium text-gray-700">Tipo</th>
                    <th className="text-left p-3 font-medium text-gray-700">Status</th>
                    <th className="text-left p-3 font-medium text-gray-700">Orçamento</th>
                    <th className="text-left p-3 font-medium text-gray-700">Interações</th>
                    <th className="text-center p-3 font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                      
                      {/* Cliente */}
                      <td className="p-3">
                        <div 
                          className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                          onClick={() => handleViewClient(client)}
                        >
                          {client.name}
                          {client.isVIP && <span className="ml-2 text-purple-600">👑</span>}
                        </div>
                        {client.address?.city && (
                          <div className="text-sm text-gray-500">📍 {client.address.city}</div>
                        )}
                        {client.nif && (
                          <div className="text-sm text-gray-500">NIF: {client.nif}</div>
                        )}
                      </td>

                      {/* Contacto */}
                      <td className="p-3">
                        {client.phone && (
                          <div className="text-sm">📞 {client.phone}</div>
                        )}
                        {client.email && (
                          <div className="text-sm">✉️ {client.email}</div>
                        )}
                      </td>

                      {/* Tipo */}
                      <td className="p-3">
                        <div className="text-sm">
                          {getClientTypeLabel(client.clientType)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${CLIENT_STATUS_COLORS[client.status]}`}>
                          {getStatusLabel(client.status)}
                        </span>
                      </td>

                      {/* Orçamento */}
                      <td className="p-3">
                        <div className="text-sm">
                          {CLIENT_BUDGET_RANGES[client.budgetRange] || 'N/A'}
                        </div>
                      </td>

                      {/* Interações */}
                      <td className="p-3">
                        <div className="text-sm">
                          <div>{client.totalInteractions || 0} interações</div>
                          {client.lastInteraction && (
                            <div className="text-gray-500">
                              Última: {client.lastInteraction.toLocaleDateString('pt-PT')}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Ações */}
                      <td className="p-3">
                        <div className="flex justify-center gap-1">
                          
                          {/* Ver detalhes */}
                          <button
                            onClick={() => handleViewClient(client)}
                            className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded"
                            title="Ver Detalhes"
                          >
                            👁️
                          </button>

                          {/* Adicionar interação */}
                          <button
                            onClick={() => handleQuickInteraction(client)}
                            className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded"
                            title="Adicionar Interação"
                          >
                            📞
                          </button>
                          
                          {/* Atualizar Status */}
                          <select
                            value={client.status}
                            onChange={(e) => handleStatusChange(client.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-1 py-1"
                            title="Alterar Status"
                          >
                            {Object.values(CLIENT_STATUS).map(status => (
                              <option key={status} value={status}>
                                {getStatusLabel(status)}
                              </option>
                            ))}
                          </select>

                          {/* Eliminar */}
                          <button
                            onClick={() => handleDeleteClient(client.id, client.name)}
                            className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded"
                            title="Eliminar Cliente"
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
          ) : (
            // Estado vazio
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Nenhum cliente encontrado
              </h3>
              <p className="text-gray-500 mb-6">
                {filters.searchTerm || filters.status || filters.clientType
                  ? 'Tente ajustar os filtros de pesquisa'
                  : 'Comece criando o seu primeiro cliente'
                }
              </p>
              {!showCreateForm && (
                <ThemedButton
                  onClick={() => setShowCreateForm(true)}
                >
                  ➕ Criar Primeiro Cliente
                </ThemedButton>
              )}
            </div>
          )}
        </ThemedCard>

        {/* MODAL DE INTERAÇÃO */}
        {showInteractionModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Nova Interação</h3>
              
              <div className="mb-4">
                <p className="text-gray-600">Cliente: <strong>{selectedClient.name}</strong></p>
              </div>

              <form onSubmit={handleInteractionSubmit} className="space-y-4">
                
                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Interação
                  </label>
                  <select
                    value={interactionForm.type}
                    onChange={(e) => handleInteractionChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="call">Chamada Telefónica</option>
                    <option value="email">Email</option>
                    <option value="meeting">Reunião</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="note">Nota</option>
                  </select>
                </div>

                {/* Assunto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assunto
                  </label>
                  <input
                    type="text"
                    value={interactionForm.subject}
                    onChange={(e) => handleInteractionChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Resumo da interação"
                  />
                </div>

                {/* Descrição */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={interactionForm.description}
                    onChange={(e) => handleInteractionChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Detalhes da interação..."
                  />
                </div>

                {/* Outcome */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resultado
                  </label>
                  <select
                    value={interactionForm.outcome}
                    onChange={(e) => handleInteractionChange('outcome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="positive">Positivo</option>
                    <option value="neutral">Neutro</option>
                    <option value="negative">Negativo</option>
                    <option value="follow_up_needed">Requer Follow-up</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <ThemedButton
                    type="submit"
                    className="flex-1"
                  >
                    ✅ Registar
                  </ThemedButton>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowInteractionModal(false);
                      resetInteractionForm();
                      setSelectedClient(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE DETALHES DO CLIENTE */}
        {showClientDetails && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Detalhes do Cliente</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Informações Básicas</h4>
                  <div className="space-y-1 text-sm">
                    <div><strong>Nome:</strong> {selectedClient.name}</div>
                    <div><strong>Tipo:</strong> {getClientTypeLabel(selectedClient.clientType)}</div>
                    <div><strong>Status:</strong> {getStatusLabel(selectedClient.status)}</div>
                    {selectedClient.nif && <div><strong>NIF:</strong> {selectedClient.nif}</div>}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Contacto</h4>
                  <div className="space-y-1 text-sm">
                    {selectedClient.phone && <div><strong>Telefone:</strong> {selectedClient.phone}</div>}
                    {selectedClient.email && <div><strong>Email:</strong> {selectedClient.email}</div>}
                    {selectedClient.phoneSecondary && <div><strong>Tel. Secundário:</strong> {selectedClient.phoneSecondary}</div>}
                  </div>
                </div>

                {selectedClient.address?.city && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-2">Morada</h4>
                    <div className="text-sm">
                      {[
                        selectedClient.address.street,
                        selectedClient.address.number,
                        selectedClient.address.floor,
                        selectedClient.address.door
                      ].filter(Boolean).join(', ')}
                      {selectedClient.address.postalCode && `, ${selectedClient.address.postalCode}`}
                      {selectedClient.address.city && `, ${selectedClient.address.city}`}
                    </div>
                  </div>
                )}

                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-2">Estatísticas</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Interações:</strong> {selectedClient.totalInteractions || 0}</div>
                    <div><strong>Orçamento:</strong> {CLIENT_BUDGET_RANGES[selectedClient.budgetRange] || 'N/A'}</div>
                    <div><strong>Criado:</strong> {selectedClient.createdAt?.toLocaleDateString('pt-PT')}</div>
                    {selectedClient.lastInteraction && (
                      <div><strong>Última Interação:</strong> {selectedClient.lastInteraction.toLocaleDateString('pt-PT')}</div>
                    )}
                  </div>
                </div>

                {selectedClient.notes && (
                  <div className="md:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
                    <p className="text-sm text-gray-600">{selectedClient.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <ThemedButton
                  onClick={() => handleQuickInteraction(selectedClient)}
                  className="flex-1"
                >
                  📞 Nova Interação
                </ThemedButton>
                
                <button
                  onClick={() => {
                    setShowClientDetails(false);
                    setSelectedClient(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </ThemedContainer>
    </DashboardLayout>
  );
};

export default ClientsPage;