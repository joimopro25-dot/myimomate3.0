// src/pages/clients/ClientsPage.jsx - LAYOUT OTIMIZADO
// ✅ Aplicando padrão DashboardLayout otimizado
// ✅ Sistema de 2 colunas sem widgets laterais  
// ✅ Métricas compactas no topo específicas de Clientes
// ✅ MANTÉM TODAS AS FUNCIONALIDADES EXISTENTES
// ✅ Apenas muda o layout, zero funcionalidades perdidas

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useClients from '../../hooks/useClients';
import { 
  UsersIcon, 
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

// 🎯 PÁGINA PRINCIPAL DO MÓDULO DE CLIENTES
// ========================================
// MyImoMate 3.0 - Interface completa para gestão de clientes
// Funcionalidades: CRUD, Interações, Duplicados, Morada PT, GDPR

const ClientsPage = () => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  
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
    deleteClient,
    addInteraction,
    checkForDuplicates,
    getClientStats,
    CLIENT_TYPES,
    CLIENT_STATUS,
    CLIENT_STATUS_COLORS,
    BUDGET_RANGES,
    INTERACTION_TYPES,
    filters,
    setFilters
  } = useClients();

  // Estados locais
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [viewMode, setViewMode] = useState('list'); // list, cards

  // Estados do formulário de cliente
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    phone_secondary: '',
    email_secondary: '',
    clientType: CLIENT_TYPES?.COMPRADOR || 'comprador',
    status: CLIENT_STATUS?.ATIVO || 'ativo',
    budgetRange: 'undefined',
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
    profession: '',
    company: '',
    nif: '',
    preferredContactTime: 'anytime',
    preferredContactMethod: 'phone',
    notes: '',
    internal_notes: '',
    marketing_consent: false,
    privacy_consent: true
  });

  // Estados do formulário de interação
  const [interactionForm, setInteractionForm] = useState({
    type: INTERACTION_TYPES?.CHAMADA || 'chamada',
    subject: '',
    notes: '',
    outcome: '',
    next_action: '',
    next_action_date: ''
  });

  // Obter estatísticas
  const stats = getClientStats?.() || { 
    total: 0, 
    active: 0, 
    vip: 0, 
    prospects: 0,
    this_month: 0,
    conversion_rate: 0 
  };

  // 📝 MANIPULAR MUDANÇAS NO FORMULÁRIO DE CLIENTE
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

  // 🔄 RESET DO FORMULÁRIO DE CLIENTE
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      phone_secondary: '',
      email_secondary: '',
      clientType: CLIENT_TYPES?.COMPRADOR || 'comprador',
      status: CLIENT_STATUS?.ATIVO || 'ativo',
      budgetRange: 'undefined',
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
      profession: '',
      company: '',
      nif: '',
      preferredContactTime: 'anytime',
      preferredContactMethod: 'phone',
      notes: '',
      internal_notes: '',
      marketing_consent: false,
      privacy_consent: true
    });
  };

  // 📝 SUBMETER FORMULÁRIO DE CRIAÇÃO
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await createClient(formData);
      
      if (result?.success) {
        setFeedbackMessage('Cliente criado com sucesso!');
        setFeedbackType('success');
        setShowCreateForm(false);
        resetForm();
      } else {
        setFeedbackMessage(result?.message || 'Erro ao criar cliente');
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
      
      if (result?.success) {
        setFeedbackMessage('Interação registada com sucesso!');
        setFeedbackType('success');
        setShowInteractionModal(false);
        setSelectedClient(null);
        setInteractionForm({
          type: INTERACTION_TYPES?.CHAMADA || 'chamada',
          subject: '',
          notes: '',
          outcome: '',
          next_action: '',
          next_action_date: ''
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
    const result = await updateClient(clientId, { status: newStatus });
    
    if (result?.success) {
      setFeedbackMessage('Status atualizado com sucesso!');
      setFeedbackType('success');
    } else {
      setFeedbackMessage(result?.error || 'Erro ao atualizar status');
      setFeedbackType('error');
    }
  };

  // 🗑️ ELIMINAR CLIENTE
  const handleDeleteClient = async (clientId, clientName) => {
    if (!window.confirm(`Tem certeza que deseja eliminar o cliente "${clientName}"?`)) {
      return;
    }

    const result = await deleteClient(clientId);
    
    if (result?.success) {
      setFeedbackMessage('Cliente eliminado com sucesso!');
      setFeedbackType('success');
    } else {
      setFeedbackMessage(result?.error || 'Erro ao eliminar cliente');
      setFeedbackType('error');
    }
  };

  // 📞 ADICIONAR INTERAÇÃO RÁPIDA
  const handleQuickInteraction = (client) => {
    setSelectedClient(client);
    setShowInteractionModal(true);
  };

  // 👁️ VER DETALHES DO CLIENTE
  const handleViewDetails = (client) => {
    setSelectedClient(client);
    setShowDetailsModal(true);
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

  const getInteractionTypeLabel = (type) => {
    const labels = {
      'chamada': 'Chamada',
      'email': 'Email',
      'reuniao': 'Reunião',
      'whatsapp': 'WhatsApp',
      'nota': 'Nota'
    };
    return labels[type] || type;
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
    <DashboardLayout showWidgets={false}>
      <div className="h-full flex flex-col overflow-hidden p-4">
        
        {/* Header compacto */}
        <div className={`
          rounded-lg p-4 mb-4 flex-shrink-0
          ${isDark() ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}
        `}>
          <div className="text-center">
            <h2 className={`text-lg font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              👥 Gestão de Clientes
            </h2>
            <p className={`text-xs ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
              Base de dados completa de clientes | Layout Otimizado 🚀
            </p>
          </div>
        </div>

        {/* Métricas compactas */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4 flex-shrink-0" style={{height: '80px'}}>
          <CompactMetricCard
            title="Total"
            value={(stats.total || 0).toString()}
            trend="Todos os clientes"
            icon={UsersIcon}
            color="blue"
            onClick={() => console.log('Ver todos')}
          />
          <CompactMetricCard
            title="Ativos"
            value={(stats.active || 0).toString()}
            trend="Em atividade"
            icon={CheckCircleIcon}
            color="green"
            onClick={() => console.log('Ver ativos')}
          />
          <CompactMetricCard
            title="VIP"
            value={(stats.vip || 0).toString()}
            trend="Clientes premium"
            icon={EyeIcon}
            color="yellow"
            onClick={() => console.log('Ver VIP')}
          />
          <CompactMetricCard
            title="Prospects"
            value={(stats.prospects || 0).toString()}
            trend="Potenciais"
            icon={ClockIcon}
            color="purple"
            onClick={() => console.log('Ver prospects')}
          />
          <CompactMetricCard
            title="Este Mês"
            value={(stats.this_month || 0).toString()}
            trend="Novos clientes"
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

            {/* BARRA DE AÇÕES E FILTROS */}
            <ThemedCard className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                
                {/* Botão Criar Cliente */}
                <ThemedButton
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="lg:w-auto"
                  disabled={creating}
                >
                  {creating ? '⏳ Criando...' : '👥 Novo Cliente'}
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
                    📇 Cartões
                  </button>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 flex-1">
                  {/* Barra de pesquisa */}
                  <input
                    type="text"
                    placeholder="Pesquisar por nome, telefone ou email..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setFilters?.({...filters, searchTerm: e.target.value})}
                    value={filters?.searchTerm || ''}
                  />

                  {/* Filtro por Status */}
                  <select
                    value={filters?.status || ''}
                    onChange={(e) => setFilters?.({...filters, status: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Status</option>
                    <option value="ativo">Ativo</option>
                    <option value="vip">VIP</option>
                    <option value="prospect">Prospect</option>
                    <option value="inativo">Inativo</option>
                  </select>

                  {/* Filtro por Tipo */}
                  <select
                    value={filters?.clientType || ''}
                    onChange={(e) => setFilters?.({...filters, clientType: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Tipos</option>
                    <option value="comprador">Comprador</option>
                    <option value="vendedor">Vendedor</option>
                    <option value="inquilino">Inquilino</option>
                    <option value="senhorio">Senhorio</option>
                    <option value="investidor">Investidor</option>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Nome */}
                      <div>
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

                      {/* Telefone Principal */}
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

                      {/* Email Principal */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Principal *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleFormChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="email@exemplo.com"
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

                      {/* Faixa de Orçamento */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Faixa de Orçamento
                        </label>
                        <select
                          value={formData.budgetRange}
                          onChange={(e) => handleFormChange('budgetRange', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="undefined">Não definido</option>
                          <option value="50k">Até €50.000</option>
                          <option value="100k">€50.000 - €100.000</option>
                          <option value="200k">€100.000 - €200.000</option>
                          <option value="300k">€200.000 - €300.000</option>
                          <option value="500k">€300.000 - €500.000</option>
                          <option value="1M">€500.000 - €1.000.000</option>
                          <option value="1M+">Mais de €1.000.000</option>
                        </select>
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
                    </div>
                  </div>

                  {/* MORADA */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Morada</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Rua e Número */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Rua e Número
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={formData.address.street}
                            onChange={(e) => handleFormChange('address.street', e.target.value)}
                            className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Rua da República"
                          />
                          <input
                            type="text"
                            value={formData.address.number}
                            onChange={(e) => handleFormChange('address.number', e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Nº"
                          />
                        </div>
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
                          placeholder="1234-567"
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
                    </div>
                  </div>

                  {/* Notas */}
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
                  <div className="border-t pt-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.privacy_consent}
                        onChange={(e) => handleFormChange('privacy_consent', e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                        required
                      />
                      <label className="ml-2 text-sm text-gray-600">
                        Cliente consente o tratamento de dados pessoais (obrigatório) *
                      </label>
                    </div>
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
                  {viewMode === 'list' ? 'Lista de Clientes' : 'Cartões de Clientes'} ({clients?.length || 0})
                </h3>
                {loading && (
                  <p className="text-gray-500 mt-2">Carregando clientes...</p>
                )}
                {error && (
                  <p className="text-red-600 mt-2">{error}</p>
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
                                  {client.address?.city && `${client.address.city}`}
                                </div>
                                {client.profession && (
                                  <div className="text-sm text-gray-500">{client.profession}</div>
                                )}
                              </td>

                              {/* Contactos */}
                              <td className="p-3">
                                <div className="text-sm">
                                  {client.phone && (
                                    <div className="mb-1">{client.phone}</div>
                                  )}
                                  {client.email && (
                                    <div className="text-blue-600">{client.email}</div>
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
                                  {BUDGET_RANGES?.[client.budgetRange] || 'Não definido'}
                                </div>
                              </td>

                              {/* Interações */}
                              <td className="p-3">
                                <div className="text-sm text-gray-500">
                                  {client.interactions?.length || 0} interações
                                </div>
                                <div className="text-xs text-gray-400">
                                  Última: {client.lastInteraction ? 
                                    new Date(client.lastInteraction).toLocaleDateString('pt-PT') : 
                                    'Nunca'
                                  }
                                </div>
                              </td>

                              {/* Ações */}
                              <td className="p-3">
                                <div className="flex justify-center gap-1">
                                  
                                  {/* Ver Detalhes */}
                                  <button
                                    onClick={() => handleViewDetails(client)}
                                    className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded"
                                    title="Ver Detalhes"
                                  >
                                    Ver
                                  </button>

                                  {/* Adicionar Interação */}
                                  <button
                                    onClick={() => handleQuickInteraction(client)}
                                    className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded"
                                    title="Adicionar Interação"
                                  >
                                    Interação
                                  </button>

                                  {/* Atualizar Status */}
                                  <select
                                    value={client.status}
                                    onChange={(e) => handleStatusChange(client.id, e.target.value)}
                                    className="text-xs border border-gray-300 rounded px-1 py-1"
                                    title="Alterar Status"
                                  >
                                    <option value="ativo">Ativo</option>
                                    <option value="vip">VIP</option>
                                    <option value="prospect">Prospect</option>
                                    <option value="inativo">Inativo</option>
                                    <option value="bloqueado">Bloqueado</option>
                                  </select>

                                  {/* Eliminar */}
                                  <button
                                    onClick={() => handleDeleteClient(client.id, client.name)}
                                    className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded"
                                    title="Eliminar Cliente"
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
                      <div className="text-6xl mb-4">👥</div>
                      <h3 className="text-xl font-medium text-gray-900 mb-2">
                        Nenhum cliente encontrado
                      </h3>
                      <p className="text-gray-500 mb-6">
                        {filters?.searchTerm || filters?.status || filters?.clientType
                          ? 'Tente ajustar os filtros de pesquisa'
                          : 'Comece criando o seu primeiro cliente'
                        }
                      </p>
                      {!showCreateForm && (
                        <ThemedButton
                          onClick={() => setShowCreateForm(true)}
                        >
                          Criar Primeiro Cliente
                        </ThemedButton>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Vista Cartões - Placeholder */}
              {viewMode === 'cards' && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📇</div>
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
                    Ver Lista
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
                      <strong>Contacto:</strong> {selectedClient.phone || selectedClient.email}
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
                        <option value="chamada">Chamada</option>
                        <option value="email">Email</option>
                        <option value="reuniao">Reunião</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="nota">Nota</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assunto
                      </label>
                      <input
                        type="text"
                        value={interactionForm.subject}
                        onChange={(e) => handleInteractionChange('subject', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Assunto da interação..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas da Interação
                      </label>
                      <textarea
                        value={interactionForm.notes}
                        onChange={(e) => handleInteractionChange('notes', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="O que foi discutido, resultado da conversa..."
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <ThemedButton
                        type="submit"
                        disabled={updating}
                        className="flex-1"
                      >
                        {updating ? 'Registando...' : 'Registar Interação'}
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

            {/* MODAL DE DETALHES */}
            {showDetailsModal && selectedClient && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
                  <h3 className="text-xl font-bold mb-4">Detalhes do Cliente</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Informações Básicas */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Informações Básicas</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Nome:</strong> {selectedClient.name}</p>
                        <p><strong>Telefone:</strong> {selectedClient.phone}</p>
                        <p><strong>Email:</strong> {selectedClient.email}</p>
                        <p><strong>Tipo:</strong> {getClientTypeLabel(selectedClient.clientType)}</p>
                        <p><strong>Status:</strong> {getStatusLabel(selectedClient.status)}</p>
                        {selectedClient.nif && <p><strong>NIF:</strong> {selectedClient.nif}</p>}
                      </div>
                    </div>

                    {/* Morada */}
                    {selectedClient.address && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Morada</h4>
                        <div className="text-sm">
                          <p>{selectedClient.address.street} {selectedClient.address.number}</p>
                          <p>{selectedClient.address.postalCode} {selectedClient.address.city}</p>
                          <p>{selectedClient.address.district}</p>
                        </div>
                      </div>
                    )}

                    {/* Interações Recentes */}
                    <div className="md:col-span-2">
                      <h4 className="font-medium text-gray-900 mb-2">Interações Recentes</h4>
                      {selectedClient.interactions?.length > 0 ? (
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {selectedClient.interactions.slice(0, 5).map((interaction, index) => (
                            <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                              <div className="flex justify-between">
                                <span className="font-medium">{getInteractionTypeLabel(interaction.type)}</span>
                                <span className="text-gray-500">
                                  {new Date(interaction.createdAt).toLocaleDateString('pt-PT')}
                                </span>
                              </div>
                              {interaction.subject && <p className="mt-1">{interaction.subject}</p>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Nenhuma interação registada</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <button
                      onClick={() => {
                        setShowDetailsModal(false);
                        setSelectedClient(null);
                      }}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Fechar
                    </button>
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

export default ClientsPage;