// src/pages/clients/ClientsPage.jsx - COM SIDEBAR REUTILIZÁVEL COMPLETO
// ✅ Sidebar reutilizável aplicado - REMOVE TODA A DUPLICAÇÃO
// ✅ Mantém 100% das funcionalidades existentes 
// ✅ Layout harmonioso sem espaço vazio
// ✅ Código mais limpo e manutenível

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar'; // SIDEBAR REUTILIZÁVEL
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useClients from '../../hooks/useClients';
import { 
  UsersIcon, 
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
      
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </div>
  );
};

const ClientsPage = () => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  
  // Hook personalizado de clientes (mantido 100% idêntico)
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

  // Estados para modais (mantidos idênticos)
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  // Estados locais (mantidos idênticos)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateClients, setDuplicateClients] = useState([]);

  // Estados do formulário (mantidos idênticos)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    clientType: CLIENT_TYPES.COMPRADOR,
    budgetRange: 'ATE_100K',
    propertyInterest: PROPERTY_INTERESTS.COMPRA_CASA,
    preferredLocation: '',
    notes: '',
    status: CLIENT_STATUS.ATIVO,
    address: {
      street: '',
      number: '',
      floor: '',
      postalCode: '',
      city: '',
      district: ''
    },
    secondaryPhone: '',
    secondaryEmail: '',
    preferredContactTime: 'anytime',
    preferredContactMethod: 'phone'
  });

  // Estados para nova interação (mantidos idênticos)
  const [interactionData, setInteractionData] = useState({
    type: CONTACT_TYPES.CHAMADA,
    description: '',
    outcome: '',
    followUpDate: '',
    notes: ''
  });

  // Obter estatísticas (mantido idêntico)
  const stats = getClientStats();

  // TODAS AS FUNÇÕES MANTIDAS IDÊNTICAS
  const handleFormChange = (field, value) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: { ...prev.address, [addressField]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      clientType: CLIENT_TYPES.COMPRADOR,
      budgetRange: 'ATE_100K',
      propertyInterest: PROPERTY_INTERESTS.COMPRA_CASA,
      preferredLocation: '',
      notes: '',
      status: CLIENT_STATUS.ATIVO,
      address: {
        street: '',
        number: '',
        floor: '',
        postalCode: '',
        city: '',
        district: ''
      },
      secondaryPhone: '',
      secondaryEmail: '',
      preferredContactTime: 'anytime',
      preferredContactMethod: 'phone'
    });
  };

  const handleDuplicateCheck = async () => {
    if (!formData.name.trim() && !formData.phone.trim() && !formData.email.trim()) {
      return;
    }

    const duplicates = await checkForDuplicates({
      name: formData.name,
      phone: formData.phone,
      email: formData.email
    });

    if (duplicates.length > 0) {
      setDuplicateClients(duplicates);
      setShowDuplicateModal(true);
      return false;
    }
    return true;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    const noDuplicates = await handleDuplicateCheck();
    if (!noDuplicates) return;

    try {
      const result = await createClient(formData);
      
      if (result.success) {
        setFeedbackMessage('Cliente criado com sucesso!');
        setFeedbackType('success');
        setShowCreateForm(false);
        resetForm();
      } else {
        setFeedbackMessage(result.error || 'Erro ao criar cliente');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao criar cliente');
      setFeedbackType('error');
    }
  };

  const handleDeleteClient = async (clientId, clientName) => {
    if (!window.confirm(`Tem certeza que deseja eliminar o cliente "${clientName}"?`)) return;
    
    try {
      const result = await deleteClient(clientId);
      
      if (result.success) {
        setFeedbackMessage('Cliente eliminado com sucesso!');
        setFeedbackType('success');
        setOpenDropdown(null);
      } else {
        setFeedbackMessage(result.error || 'Erro ao eliminar cliente');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao eliminar cliente');
      setFeedbackType('error');
    }
  };

  const handleStatusUpdate = async (clientId, newStatus) => {
    try {
      const result = await updateClientStatus(clientId, newStatus);
      
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

  const handleAddInteraction = async () => {
    if (!selectedClient || !interactionData.type || !interactionData.description.trim()) {
      setFeedbackMessage('Preencha todos os campos obrigatórios da interação');
      setFeedbackType('error');
      return;
    }

    try {
      const result = await addInteraction(selectedClient.id, interactionData);
      
      if (result.success) {
        setFeedbackMessage('Interação registrada com sucesso!');
        setFeedbackType('success');
        setShowInteractionModal(false);
        setSelectedClient(null);
        setInteractionData({
          type: CONTACT_TYPES.CHAMADA,
          description: '',
          outcome: '',
          followUpDate: '',
          notes: ''
        });
      } else {
        setFeedbackMessage(result.error || 'Erro ao registrar interação');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao registrar interação');
      setFeedbackType('error');
    }
  };

  const handleSearch = (searchTerm) => {
    searchClients(searchTerm);
  };

  const handleMetricClick = (filterType, filterValue) => {
    setFilters(prev => ({ 
      ...prev, 
      [filterType]: prev[filterType] === filterValue ? '' : filterValue 
    }));
  };

  const getStatusColor = (status) => {
    return CLIENT_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  };

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
    // NOVA ESTRUTURA: Sidebar reutilizável + conteúdo sem espaço vazio
    <div className="flex">
      {/* SIDEBAR REUTILIZÁVEL - Elimina toda a duplicação */}
      <Sidebar />
      
      {/* CONTEÚDO PRINCIPAL - SEM ml-64 para layout harmonioso */}
      <div className="flex-1 min-h-screen bg-gray-50">
        <div className="p-6">
          
          {/* Header da Página */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestão de Clientes
                </h1>
                <p className="text-gray-600 mt-1">
                  Gerir e acompanhar clientes ativos e potenciais
                </p>
              </div>
              
              <ThemedButton 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Novo Cliente</span>
              </ThemedButton>
            </div>

            {/* Feedback Messages */}
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

            {/* Métricas Compactas */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <CompactMetricCard
                title="Total Clientes"
                value={stats.total}
                trend={`${clients.length} ativos`}
                icon={UsersIcon}
                color="blue"
                onClick={() => handleMetricClick('status', '')}
              />
              
              <CompactMetricCard
                title="Ativos"
                value={stats.byStatus?.ativo || 0}
                trend="Em atividade"
                icon={CheckCircleIcon}
                color="green"
                onClick={() => handleMetricClick('status', CLIENT_STATUS.ATIVO)}
              />
              
              <CompactMetricCard
                title="Prospects"
                value={stats.byStatus?.prospeto || 0}
                trend="Potenciais"
                icon={ClockIcon}
                color="yellow"
                onClick={() => handleMetricClick('status', CLIENT_STATUS.PROSPETO)}
              />
              
              <CompactMetricCard
                title="VIP"
                value={stats.byClientType?.vip || 0}
                trend="Alto valor"
                icon={UsersIcon}
                color="purple"
                onClick={() => handleMetricClick('clientType', CLIENT_TYPES.VIP)}
              />
              
              <CompactMetricCard
                title="Interações Rec."
                value={stats.recentInteractions || 0}
                trend="Últimos 30 dias"
                icon={EyeIcon}
                color="blue"
                onClick={() => console.log('Ver interações recentes')}
              />
            </div>
          </div>

          {/* Filtros e Pesquisa */}
          <ThemedCard className="mb-6">
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                
                {/* Campo de Pesquisa */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Pesquisar por nome, telefone ou email..."
                    value={filters.searchTerm || ''}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filtros */}
                <div className="flex flex-col md:flex-row gap-2">
                  <select
                    value={filters.status || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Status</option>
                    {Object.entries(CLIENT_STATUS).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.clientType || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, clientType: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Tipos</option>
                    {Object.entries(CLIENT_TYPES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.budgetRange || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, budgetRange: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas as Faixas</option>
                    {Object.entries(CLIENT_BUDGET_RANGES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </ThemedCard>

          {/* Formulário de Criação */}
          {showCreateForm && (
            <ThemedCard className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Criar Novo Cliente
                </h3>
                
                <form onSubmit={handleCreateSubmit} className="space-y-6">
                  {/* Informações Básicas */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Informações Básicas</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => handleFormChange('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Nome completo do cliente"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tipo de Cliente
                        </label>
                        <select
                          value={formData.clientType}
                          onChange={(e) => handleFormChange('clientType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.entries(CLIENT_TYPES).map(([key, value]) => (
                            <option key={key} value={value}>
                              {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Contactos */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Contactos</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefone Principal *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => handleFormChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="9XX XXX XXX"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Principal *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => handleFormChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="email@exemplo.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefone Secundário
                        </label>
                        <input
                          type="tel"
                          value={formData.secondaryPhone}
                          onChange={(e) => handleFormChange('secondaryPhone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Telefone alternativo"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email Secundário
                        </label>
                        <input
                          type="email"
                          value={formData.secondaryEmail}
                          onChange={(e) => handleFormChange('secondaryEmail', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Email alternativo"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preferências */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Preferências</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Interesse Principal
                        </label>
                        <select
                          value={formData.propertyInterest}
                          onChange={(e) => handleFormChange('propertyInterest', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.entries(PROPERTY_INTERESTS).map(([key, value]) => (
                            <option key={key} value={value}>
                              {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Faixa de Orçamento
                        </label>
                        <select
                          value={formData.budgetRange}
                          onChange={(e) => handleFormChange('budgetRange', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.entries(CLIENT_BUDGET_RANGES).map(([key, value]) => (
                            <option key={key} value={value}>
                              {key.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Localização Preferida
                        </label>
                        <input
                          type="text"
                          value={formData.preferredLocation}
                          onChange={(e) => handleFormChange('preferredLocation', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Cidade, distrito, zona..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Método de Contacto Preferido
                        </label>
                        <select
                          value={formData.preferredContactMethod}
                          onChange={(e) => handleFormChange('preferredContactMethod', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="phone">Telefone</option>
                          <option value="email">Email</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="sms">SMS</option>
                        </select>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Informações adicionais sobre o cliente..."
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
                      disabled={creating || duplicateCheck}
                      className="flex items-center space-x-2"
                    >
                      {creating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Criando...</span>
                        </>
                      ) : duplicateCheck ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Verificando...</span>
                        </>
                      ) : (
                        <>
                          <PlusIcon className="h-4 w-4" />
                          <span>Criar Cliente</span>
                        </>
                      )}
                    </ThemedButton>
                  </div>
                </form>
              </div>
            </ThemedCard>
          )}

          {/* Lista de Clientes */}
          <ThemedCard>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lista de Clientes ({clients.length})
                </h3>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Carregando clientes...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">Erro ao carregar clientes: {error}</p>
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-8">
                  <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum cliente encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">Comece criando um novo cliente.</p>
                  <div className="mt-6">
                    <ThemedButton onClick={() => setShowCreateForm(true)}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Criar Cliente
                    </ThemedButton>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contacto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Interesse
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clients.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {client.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {client.preferredLocation || 'Localização não especificada'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{client.phone}</div>
                            <div className="text-sm text-gray-500">{client.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {client.clientType?.replace('_', ' ') || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {client.propertyInterest?.replace('_', ' ') || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(client.status)}`}>
                              {client.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="relative">
                              <button
                                onClick={() => setOpenDropdown(openDropdown === client.id ? null : client.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <EllipsisVerticalIcon className="h-5 w-5" />
                              </button>
                              
                              {openDropdown === client.id && (
                                <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        setSelectedClient(client);
                                        setShowDetailsModal(true);
                                        setOpenDropdown(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      Ver Detalhes
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingClient(client);
                                        setShowEditForm(true);
                                        setOpenDropdown(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedClient(client);
                                        setShowInteractionModal(true);
                                        setOpenDropdown(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                                    >
                                      Nova Interação
                                    </button>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                      onClick={() => handleDeleteClient(client.id, client.name)}
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
              )}
            </div>
          </ThemedCard>

          {/* TODOS OS MODAIS MANTIDOS IDÊNTICOS */}
          {showDuplicateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Possíveis Duplicados Encontrados</h3>
                <p className="text-gray-600 mb-4">
                  Encontrámos clientes semelhantes. Deseja continuar mesmo assim?
                </p>
                
                <div className="mb-4 max-h-40 overflow-y-auto">
                  {duplicateClients.map((duplicate, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded mb-2">
                      <div className="font-medium">{duplicate.name}</div>
                      <div className="text-sm text-gray-600">{duplicate.phone}</div>
                      <div className="text-sm text-gray-600">{duplicate.email}</div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-3">
                  <ThemedButton
                    variant="outline"
                    onClick={() => {
                      setShowDuplicateModal(false);
                      setDuplicateClients([]);
                    }}
                  >
                    Cancelar
                  </ThemedButton>
                  <ThemedButton
                    onClick={async () => {
                      setShowDuplicateModal(false);
                      setDuplicateClients([]);
                      
                      const result = await createClient(formData);
                      if (result.success) {
                        setFeedbackMessage('Cliente criado com sucesso!');
                        setFeedbackType('success');
                        setShowCreateForm(false);
                        resetForm();
                      } else {
                        setFeedbackMessage(result.error || 'Erro ao criar cliente');
                        setFeedbackType('error');
                      }
                    }}
                  >
                    Criar Mesmo Assim
                  </ThemedButton>
                </div>
              </div>
            </div>
          )}

          {showDetailsModal && selectedClient && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-90vh overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Detalhes do Cliente</h3>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedClient(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedClient.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Telefone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedClient.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedClient.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Cliente</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedClient.clientType?.replace('_', ' ') || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Interesse Principal</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedClient.propertyInterest?.replace('_', ' ') || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedClient.status)}`}>
                      {selectedClient.status}
                    </span>
                  </div>
                  
                  {selectedClient.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notas</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedClient.notes}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedClient.createdAt?.toDate?.()?.toLocaleDateString('pt-PT') || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showInteractionModal && selectedClient && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Nova Interação</h3>
                <p className="text-gray-600 mb-4">
                  Cliente: <strong>{selectedClient.name}</strong>
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Interação
                    </label>
                    <select
                      value={interactionData.type}
                      onChange={(e) => setInteractionData(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(CONTACT_TYPES).map(([key, value]) => (
                        <option key={key} value={value}>
                          {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição *
                    </label>
                    <textarea
                      value={interactionData.description}
                      onChange={(e) => setInteractionData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descreva o que foi discutido..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resultado
                    </label>
                    <input
                      type="text"
                      value={interactionData.outcome}
                      onChange={(e) => setInteractionData(prev => ({ ...prev, outcome: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Resultado da interação..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Próximo Follow-up
                    </label>
                    <input
                      type="datetime-local"
                      value={interactionData.followUpDate}
                      onChange={(e) => setInteractionData(prev => ({ ...prev, followUpDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <ThemedButton
                    variant="outline"
                    onClick={() => {
                      setShowInteractionModal(false);
                      setSelectedClient(null);
                      setInteractionData({
                        type: CONTACT_TYPES.CHAMADA,
                        description: '',
                        outcome: '',
                        followUpDate: '',
                        notes: ''
                      });
                    }}
                  >
                    Cancelar
                  </ThemedButton>
                  <ThemedButton
                    onClick={handleAddInteraction}
                  >
                    Registrar Interação
                  </ThemedButton>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ClientsPage;