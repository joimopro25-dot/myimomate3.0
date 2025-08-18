// src/pages/clients/ClientsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useClients from '../../hooks/useClients';

// 🎯 PÁGINA PRINCIPAL DO MÓDULO DE CLIENTES
// =========================================
// MyImoMate 3.0 - Interface completa para gestão de clientes
// Funcionalidades: CRUD, Duplicados, Histórico, Interações, Múltiplos contactos

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
    createClient,
    updateClient,
    updateClientStatus,
    deleteClient,
    addInteraction,
    getClientStats,
    checkForDuplicates,
    CLIENT_STATUS,
    CLIENT_TYPES,
    CLIENT_BUDGET_RANGES,
    PROPERTY_INTERESTS,
    CLIENT_STATUS_COLORS,
    CONTACT_TYPES,
    isValidEmail,
    isValidPhone,
    isValidNIF,
    isValidPostalCode,
    filters,
    setFilters
  } = useClients();

  // Estados locais
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [showDuplicatesModal, setShowDuplicatesModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [viewMode, setViewMode] = useState('list'); // list, cards

  // Estados do formulário de criação
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    phoneSecondary: '',
    email: '',
    emailSecondary: '',
    nif: '',
    clientType: CLIENT_TYPES?.COMPRADOR || 'comprador',
    status: CLIENT_STATUS?.ATIVO || 'ativo',
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
    propertyInterests: [PROPERTY_INTERESTS?.COMPRA_CASA || 'compra_casa'],
    budgetRange: 'undefined',
    preferredLocations: [],
    preferredContactMethod: 'phone',
    preferredContactTime: 'anytime',
    contactNotes: '',
    profession: '',
    company: '',
    notes: '',
    allowsMarketing: true
  });

  // Estados do formulário de interação
  const [interactionForm, setInteractionForm] = useState({
    type: 'call',
    description: '',
    outcome: '',
    followUpDate: '',
    notes: ''
  });

  // Estados de duplicados encontrados
  const [duplicatesFound, setDuplicatesFound] = useState([]);

  // Obter estatísticas
  const stats = getClientStats?.() || { 
    total: 0, 
    byStatus: {}, 
    byType: {},
    activeClients: 0,
    vipClients: 0,
    withInteractions: 0,
    recentClients: 0
  };

  // 📝 MANIPULAR MUDANÇAS NO FORMULÁRIO
  const handleFormChange = (field, value) => {
    if (field.includes('.')) {
      const parts = field.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // 📝 MANIPULAR MUDANÇAS NO FORMULÁRIO DE INTERAÇÃO
  const handleInteractionChange = (field, value) => {
    setInteractionForm(prev => ({ ...prev, [field]: value }));
  };

  // 🔄 RESET DO FORMULÁRIO
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      phoneSecondary: '',
      email: '',
      emailSecondary: '',
      nif: '',
      clientType: CLIENT_TYPES?.COMPRADOR || 'comprador',
      status: CLIENT_STATUS?.ATIVO || 'ativo',
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
      propertyInterests: [PROPERTY_INTERESTS?.COMPRA_CASA || 'compra_casa'],
      budgetRange: 'undefined',
      preferredLocations: [],
      preferredContactMethod: 'phone',
      preferredContactTime: 'anytime',
      contactNotes: '',
      profession: '',
      company: '',
      notes: '',
      allowsMarketing: true
    });
  };

  // 🔍 VERIFICAR DUPLICADOS
  const handleCheckDuplicates = async () => {
    if (!formData.phone && !formData.email) return;

    try {
      const duplicates = await checkForDuplicates?.(formData.phone, formData.email);
      if (duplicates?.found) {
        setDuplicatesFound(duplicates.clients || []);
        setShowDuplicatesModal(true);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Erro ao verificar duplicados:', err);
      return true;
    }
  };

  // 📝 SUBMETER FORMULÁRIO DE CRIAÇÃO
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Verificar duplicados primeiro
      const noDuplicates = await handleCheckDuplicates();
      if (!noDuplicates) return;

      const result = await createClient?.(formData);
      
      if (result?.success) {
        setFeedbackMessage('Cliente criado com sucesso!');
        setFeedbackType('success');
        setShowCreateForm(false);
        resetForm();
      } else {
        setFeedbackMessage(result?.error || 'Erro ao criar cliente');
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
      const result = await addInteraction?.(selectedClient.id, interactionForm);
      
      if (result?.success) {
        setFeedbackMessage('Interação registada com sucesso!');
        setFeedbackType('success');
        setShowInteractionModal(false);
        setSelectedClient(null);
        setInteractionForm({
          type: 'call',
          description: '',
          outcome: '',
          followUpDate: '',
          notes: ''
        });
      } else {
        setFeedbackMessage(result?.error || 'Erro ao registar interação');
        setFeedbackType('error');
      }
    } catch (err) {
      setFeedbackMessage(`Erro inesperado: ${err.message}`);
      setFeedbackType('error');
    }
  };

  // 🔄 ATUALIZAR STATUS DO CLIENTE
  const handleStatusChange = async (clientId, newStatus) => {
    const result = await updateClientStatus?.(clientId, newStatus);
    
    if (result?.success) {
      setFeedbackMessage('Status atualizado com sucesso!');
      setFeedbackType('success');
    } else {
      setFeedbackMessage(result?.error || 'Erro ao atualizar status');
      setFeedbackType('error');
    }
  };

  // 📞 ADICIONAR INTERAÇÃO RÁPIDA
  const handleQuickInteraction = (client) => {
    setSelectedClient(client);
    setShowInteractionModal(true);
  };

  // 🗑️ ELIMINAR CLIENTE
  const handleDeleteClient = async (clientId, clientName) => {
    const confirmation = window.confirm(`Tem certeza que deseja eliminar o cliente ${clientName}?`);
    if (!confirmation) return;

    const result = await deleteClient?.(clientId);
    
    if (result?.success) {
      setFeedbackMessage('Cliente eliminado com sucesso!');
      setFeedbackType('success');
    } else {
      setFeedbackMessage(result?.error || 'Erro ao eliminar cliente');
      setFeedbackType('error');
    }
  };

  // 🔍 OBTER RÓTULOS LEGÍVEIS
  const getClientTypeLabel = (type) => {
    const labels = {
      'comprador': 'Comprador',
      'vendedor': 'Vendedor',
      'inquilino': 'Inquilino',
      'senhorio': 'Senhorio',
      'investidor': 'Investidor',
      'misto': 'Misto'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status) => {
    const labels = {
      'ativo': 'Ativo',
      'inativo': 'Inativo',
      'vip': 'VIP',
      'prospect': 'Prospect',
      'ex_cliente': 'Ex-Cliente',
      'bloqueado': 'Bloqueado'
    };
    return labels[status] || status;
  };

  const getBudgetRangeLabel = (range) => {
    const labels = {
      '0-50k': 'Até €50.000',
      '50k-100k': '€50.000 - €100.000',
      '100k-200k': '€100.000 - €200.000',
      '200k-300k': '€200.000 - €300.000',
      '300k-500k': '€300.000 - €500.000',
      '500k-750k': '€500.000 - €750.000',
      '750k-1M': '€750.000 - €1.000.000',
      '1M-2M': '€1.000.000 - €2.000.000',
      '2M+': 'Acima de €2.000.000',
      'unlimited': 'Sem limite',
      'undefined': 'A definir'
    };
    return labels[range] || range;
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
              Base de dados completa com histórico de interações e verificação de duplicados
            </p>
          </div>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
              <div className="text-2xl font-bold text-orange-600">{stats.recentClients}</div>
              <div className="text-sm text-gray-500">Recentes</div>
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
              {creating ? '⏳ Criando...' : '👤 Novo Cliente'}
            </ThemedButton>

            {/* Alternância de View */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                📋 Lista
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'cards' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                🃏 Cartões
              </button>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 flex-1">
              {/* Filtro por Status */}
              <select
                value={filters?.status || ''}
                onChange={(e) => setFilters?.(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="vip">VIP</option>
                <option value="prospect">Prospect</option>
                <option value="ex_cliente">Ex-Cliente</option>
                <option value="bloqueado">Bloqueado</option>
              </select>

              {/* Filtro por Tipo */}
              <select
                value={filters?.clientType || ''}
                onChange={(e) => setFilters?.(prev => ({ ...prev, clientType: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os Tipos</option>
                <option value="comprador">Comprador</option>
                <option value="vendedor">Vendedor</option>
                <option value="inquilino">Inquilino</option>
                <option value="senhorio">Senhorio</option>
                <option value="investidor">Investidor</option>
                <option value="misto">Misto</option>
              </select>

              {/* Filtro por Orçamento */}
              <select
                value={filters?.budgetRange || ''}
                onChange={(e) => setFilters?.(prev => ({ ...prev, budgetRange: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os Orçamentos</option>
                <option value="0-50k">Até €50k</option>
                <option value="50k-100k">€50k-€100k</option>
                <option value="100k-200k">€100k-€200k</option>
                <option value="200k-300k">€200k-€300k</option>
                <option value="300k-500k">€300k-€500k</option>
                <option value="500k+">Acima €500k</option>
              </select>
            </div>
          </div>
        </ThemedCard>

        {/* FORMULÁRIO DE CRIAÇÃO */}
        {showCreateForm && (
          <ThemedCard className="p-6">
            <h3 className="text-xl font-bold mb-4">Criar Novo Cliente</h3>
            
            <form onSubmit={handleCreateSubmit} className="space-y-6">
              
              {/* DADOS BÁSICOS */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Dados Básicos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Nome */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="João Silva"
                      required
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
                      <option value="comprador">Comprador</option>
                      <option value="vendedor">Vendedor</option>
                      <option value="inquilino">Inquilino</option>
                      <option value="senhorio">Senhorio</option>
                      <option value="investidor">Investidor</option>
                      <option value="misto">Misto</option>
                    </select>
                  </div>

                  {/* Telefone Principal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone Principal *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="912 345 678"
                      required
                    />
                  </div>

                  {/* Email Principal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Principal *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="joao@email.com"
                      required
                    />
                  </div>

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
                      <option value="undefined">A definir</option>
                      <option value="0-50k">Até €50.000</option>
                      <option value="50k-100k">€50.000 - €100.000</option>
                      <option value="100k-200k">€100.000 - €200.000</option>
                      <option value="200k-300k">€200.000 - €300.000</option>
                      <option value="300k-500k">€300.000 - €500.000</option>
                      <option value="500k-750k">€500.000 - €750.000</option>
                      <option value="750k-1M">€750.000 - €1.000.000</option>
                      <option value="1M+">Acima de €1.000.000</option>
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
                      placeholder="Rua da República"
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
                      placeholder="3º Esq"
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

              {/* NOTAS */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas e Observações
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Informações adicionais sobre o cliente..."
                />
              </div>

              {/* Botões do formulário */}
              <div className="flex gap-3 pt-4">
                <ThemedButton
                  type="submit"
                  disabled={creating}
                  className="flex-1 md:flex-none"
                >
                  {creating ? '⏳ Criando...' : '👤 Criar Cliente'}
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
              {viewMode === 'list' ? 'Lista de Clientes' : 'Cartões de Clientes'} ({clients?.length || 0})
            </h3>
            {loading && (
              <p className="text-gray-500 mt-2">⏳ Carregando clientes...</p>
            )}
            {error && (
              <p className="text-red-600 mt-2">❌ {error}</p>
            )}
          </div>

          {/* Vista Lista */}
          {viewMode === 'list' && (
            <div>
              {clients?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left p-3 font-medium text-gray-700">Cliente</th>
                        <th className="text-left p-3 font-medium text-gray-700">Contactos</th>
                        <th className="text-left p-3 font-medium text-gray-700">Tipo/Status</th>
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
                            <div className="font-medium text-gray-900">{client.name}</div>
                            <div className="text-sm text-gray-500">
                              {client.address?.city && `📍 ${client.address.city}`}
                            </div>
                            {client.profession && (
                              <div className="text-sm text-gray-500">💼 {client.profession}</div>
                            )}
                          </td>

                          {/* Contactos */}
                          <td className="p-3">
                            <div className="text-sm">
                              {client.phone && (
                                <div className="mb-1">📞 {client.phone}</div>
                              )}
                              {client.email && (
                                <div className="text-blue-600">✉️ {client.email}</div>
                              )}
                            </div>
                          </td>

                          {/* Tipo/Status */}
                          <td className="p-3">
                            <div className="font-medium">{getClientTypeLabel(client.clientType)}</div>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                              CLIENT_STATUS_COLORS?.[client.status] || 'bg-gray-100 text-gray-800'
                            }`}>
                              {getStatusLabel(client.status)}
                            </span>
                          </td>

                          {/* Orçamento */}
                          <td className="p-3">
                            <div className="text-sm">
                              {getBudgetRangeLabel(client.budgetRange)}
                            </div>
                          </td>

                          {/* Interações */}
                          <td className="p-3">
                            <div className="text-sm">
                              <div className="font-medium">{client.totalInteractions || 0} interações</div>
                              {client.lastInteraction && (
                                <div className="text-gray-500">
                                  Última: {client.lastInteraction.toLocaleDateString?.('pt-PT') || 'N/A'}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Ações */}
                          <td className="p-3">
                            <div className="flex justify-center gap-1 flex-wrap">
                              
                              {/* Adicionar Interação */}
                              <button
                                onClick={() => handleQuickInteraction(client)}
                                className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded"
                                title="Adicionar Interação"
                              >
                                📞
                              </button>

                              {/* Alterar Status */}
                              <select
                                value={client.status}
                                onChange={(e) => handleStatusChange(client.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-1 py-1"
                                title="Alterar Status"
                              >
                                <option value="ativo">Ativo</option>
                                <option value="inativo">Inativo</option>
                                <option value="vip">VIP</option>
                                <option value="prospect">Prospect</option>
                                <option value="ex_cliente">Ex-Cliente</option>
                                <option value="bloqueado">Bloqueado</option>
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
                    {Object.values(filters || {}).some(f => f)
                      ? 'Tente ajustar os filtros de pesquisa'
                      : 'Comece criando o seu primeiro cliente'
                    }
                  </p>
                  {!showCreateForm && (
                    <ThemedButton
                      onClick={() => setShowCreateForm(true)}
                    >
                      👤 Criar Primeiro Cliente
                    </ThemedButton>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Vista Cartões - Placeholder */}
          {viewMode === 'cards' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🃏</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Vista de Cartões
              </h3>
              <p className="text-gray-500 mb-6">
                Funcionalidade em desenvolvimento. Use a vista de lista por agora.
              </p>
              <button
                onClick={() => setViewMode('list')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                📋 Ver Lista
              </button>
            </div>
          )}
        </ThemedCard>

        {/* MODAL DE INTERAÇÃO */}
        {showInteractionModal && selectedClient && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Nova Interação</h3>
              
              <div className="mb-4">
                <p className="text-gray-600">
                  <strong>Cliente:</strong> {selectedClient.name}<br/>
                  <strong>Tipo:</strong> {getClientTypeLabel(selectedClient.clientType)}
                </p>
              </div>

              <form onSubmit={handleInteractionSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Interação
                  </label>
                  <select
                    value={interactionForm.type}
                    onChange={(e) => handleInteractionChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="call">Chamada</option>
                    <option value="email">Email</option>
                    <option value="meeting">Reunião</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="visit">Visita</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={interactionForm.description}
                    onChange={(e) => handleInteractionChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva o que foi discutido..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resultado
                  </label>
                  <select
                    value={interactionForm.outcome}
                    onChange={(e) => handleInteractionChange('outcome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecionar resultado</option>
                    <option value="positive">Positivo</option>
                    <option value="neutral">Neutro</option>
                    <option value="negative">Negativo</option>
                    <option value="follow_up_needed">Necessário follow-up</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <ThemedButton
                    type="submit"
                    disabled={updating}
                    className="flex-1"
                  >
                    {updating ? '⏳ Registando...' : '📞 Registar Interação'}
                  </ThemedButton>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowInteractionModal(false);
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

        {/* MODAL DE DUPLICADOS */}
        {showDuplicatesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4 text-red-600">⚠️ Duplicados Encontrados</h3>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-3">
                  Encontrámos clientes com dados similares:
                </p>
                {duplicatesFound.map((duplicate, index) => (
                  <div key={index} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-2">
                    <div className="font-medium">{duplicate.name}</div>
                    <div className="text-sm text-gray-600">{duplicate.phone} • {duplicate.email}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDuplicatesModal(false);
                    // Continuar criação mesmo com duplicados
                    handleCreateSubmit({ preventDefault: () => {} });
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Criar Mesmo Assim
                </button>
                
                <button
                  onClick={() => setShowDuplicatesModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
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