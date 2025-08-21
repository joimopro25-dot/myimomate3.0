// src/pages/leads/LeadsPage.jsx - COM SIDEBAR REUTILIZÁVEL
// ✅ Aplicando Sidebar.jsx componente reutilizável
// ✅ MANTÉM TODAS AS FUNCIONALIDADES EXISTENTES (100%)
// ✅ Apenas substitui sidebar inline pelo componente
// ✅ Zero funcionalidades perdidas - código idêntico

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar'; // 🔥 NOVO IMPORT
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useLeads from '../../hooks/useLeads';
import { 
  UserGroupIcon, 
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

// 🎯 PÁGINA PRINCIPAL DO MÓDULO DE LEADS
// =====================================
// MyImoMate 3.0 - Interface completa para gestão de leads
// Funcionalidades: Listagem, Filtros, CRUD, Conversão rápida

const LeadsPage = () => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  
  // Hook personalizado de leads (mantido 100% idêntico)
  const {
    leads,
    loading,
    error,
    creating,
    converting,
    duplicateCheck,
    filters,
    createLead,
    convertLeadToClient,
    updateLeadStatus,
    deleteLead,
    searchLeads,
    setFilters,
    checkForDuplicates,
    getLeadStats,
    LEAD_STATUS,
    LEAD_INTEREST_TYPES,
    BUDGET_RANGES,
    LEAD_STATUS_COLORS
  } = useLeads();

  // Estados para modais (mantidos idênticos)
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  // Estados locais (mantidos idênticos)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState(''); // success, error, info
  const [openDropdown, setOpenDropdown] = useState(null);

  // Estados do formulário (mantidos idênticos)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interestType: LEAD_INTEREST_TYPES.COMPRA_CASA,
    budgetRange: 'undefined',
    location: '',
    notes: '',
    source: 'manual',
    priority: 'normal'
  });

  // Obter estatísticas (mantido idêntico)
  const stats = getLeadStats();

  // 📝 MANIPULAR MUDANÇAS NO FORMULÁRIO (mantido idêntico)
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 🔄 RESET DO FORMULÁRIO (mantido idêntico)
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      interestType: LEAD_INTEREST_TYPES.COMPRA_CASA,
      budgetRange: 'undefined',
      location: '',
      notes: '',
      source: 'manual',
      priority: 'normal'
    });
  };

  // 📝 SUBMETER FORMULÁRIO DE CRIAÇÃO (mantido idêntico)
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await createLead(formData);
      
      if (result.success) {
        setFeedbackMessage('Lead criado com sucesso!');
        setFeedbackType('success');
        setShowCreateForm(false);
        resetForm();
      } else {
        setFeedbackMessage(result.error || 'Erro ao criar lead');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao criar lead');
      setFeedbackType('error');
    }
  };

  // 🔄 CONVERTER LEAD PARA CLIENTE (mantido idêntico)
  const handleConvertLead = async (leadId) => {
    try {
      const result = await convertLeadToClient(leadId);
      
      if (result.success) {
        setFeedbackMessage(result.message || 'Lead convertido para cliente com sucesso!');
        setFeedbackType('success');
        setShowConvertModal(false);
        setSelectedLead(null);
      } else {
        setFeedbackMessage(result.error || 'Erro ao converter lead');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao converter lead');
      setFeedbackType('error');
    }
  };

  // 🗑️ ELIMINAR LEAD (mantido idêntico)
  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Tem certeza que deseja eliminar este lead?')) return;
    
    try {
      const result = await deleteLead(leadId);
      
      if (result.success) {
        setFeedbackMessage('Lead eliminado com sucesso!');
        setFeedbackType('success');
        setOpenDropdown(null);
      } else {
        setFeedbackMessage(result.error || 'Erro ao eliminar lead');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao eliminar lead');
      setFeedbackType('error');
    }
  };

  // 📊 ATUALIZAR STATUS DO LEAD (mantido idêntico)
  const handleStatusUpdate = async (leadId, newStatus) => {
    try {
      const result = await updateLeadStatus(leadId, newStatus);
      
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

  // 🔍 LIDAR COM PESQUISA (mantido idêntico)
  const handleSearch = (searchTerm) => {
    searchLeads(searchTerm);
  };

  // ⚡ LIDAR COM CLICK RÁPIDO NAS MÉTRICAS (mantido idêntico)
  const handleMetricClick = (filterType, filterValue) => {
    setFilters(prev => ({ 
      ...prev, 
      [filterType]: prev[filterType] === filterValue ? '' : filterValue 
    }));
  };

  // 🎨 OBTER COR DO STATUS (mantido idêntico)
  const getStatusColor = (status) => {
    return LEAD_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
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
      {/* 🔥 SIDEBAR REUTILIZÁVEL - SUBSTITUIU SIDEBAR INLINE */}
      <Sidebar />
      
      {/* Conteúdo Principal - MANTÉM MARGEM LEFT PARA SIDEBAR */}
      <div className="ml-64 flex-1 min-h-screen bg-gray-50">
        <ThemedContainer className="px-6 py-6">
          
          {/* Header da Página - MANTIDO IDÊNTICO */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestão de Leads
                </h1>
                <p className="text-gray-600 mt-1">
                  Gerir e converter leads em clientes potenciais
                </p>
              </div>
              
              <ThemedButton 
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Novo Lead</span>
              </ThemedButton>
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
                title="Total de Leads"
                value={stats.total}
                trend={`${leads.length} ativos`}
                icon={UserGroupIcon}
                color="blue"
                onClick={() => handleMetricClick('status', '')}
              />
              
              <CompactMetricCard
                title="Novos"
                value={stats.byStatus?.novo || 0}
                trend="Aguardam contacto"
                icon={ClockIcon}
                color="yellow"
                onClick={() => handleMetricClick('status', LEAD_STATUS.NOVO)}
              />
              
              <CompactMetricCard
                title="Qualificados"
                value={stats.byStatus?.qualificado || 0}
                trend="Potencial confirmado"
                icon={CheckCircleIcon}
                color="green"
                onClick={() => handleMetricClick('status', LEAD_STATUS.QUALIFICADO)}
              />
              
              <CompactMetricCard
                title="Convertidos"
                value={stats.byStatus?.convertido || 0}
                trend={`${stats.conversionRate}% taxa`}
                icon={CheckCircleIcon}
                color="purple"
                onClick={() => handleMetricClick('status', LEAD_STATUS.CONVERTIDO)}
              />
              
              <CompactMetricCard
                title="Em Seguimento"
                value={stats.byStatus?.contactado || 0}
                trend="Processo ativo"
                icon={EyeIcon}
                color="blue"
                onClick={() => handleMetricClick('status', LEAD_STATUS.CONTACTADO)}
              />
            </div>
          </div>

          {/* Filtros e Pesquisa - MANTIDOS IDÊNTICOS */}
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
                    {Object.entries(LEAD_STATUS).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.interestType || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, interestType: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Tipos</option>
                    {Object.entries(LEAD_INTEREST_TYPES).map(([key, value]) => (
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
                    {Object.entries(BUDGET_RANGES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </ThemedCard>

          {/* Lista de Leads - MANTIDA IDÊNTICA */}
          <ThemedCard>
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lista de Leads ({leads.length})
                </h3>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600">Carregando leads...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600">Erro ao carregar leads: {error}</p>
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum lead encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">Comece criando um novo lead.</p>
                  <div className="mt-6">
                    <ThemedButton onClick={() => setShowCreateForm(true)}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Criar Lead
                    </ThemedButton>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lead
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contacto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Interesse
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orçamento
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
                      {leads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {lead.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {lead.location}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{lead.phone}</div>
                            <div className="text-sm text-gray-500">{lead.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {lead.interestType?.replace('_', ' ') || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {lead.budgetRange?.replace('_', ' ') || 'N/A'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                              {lead.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="relative">
                              <button
                                onClick={() => setOpenDropdown(openDropdown === lead.id ? null : lead.id)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <EllipsisVerticalIcon className="h-5 w-5" />
                              </button>
                              
                              {openDropdown === lead.id && (
                                <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        setSelectedLead(lead);
                                        setShowDetailsModal(true);
                                        setOpenDropdown(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      Ver Detalhes
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingLead(lead);
                                        setShowEditForm(true);
                                        setOpenDropdown(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedLead(lead);
                                        setShowConvertModal(true);
                                        setOpenDropdown(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                    >
                                      Converter p/ Cliente
                                    </button>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                      onClick={() => handleDeleteLead(lead.id)}
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

          {/* Modal de Criação - MANTIDO IDÊNTICO */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-90vh overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Criar Novo Lead</h3>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleFormChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleFormChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Interesse
                    </label>
                    <select
                      value={formData.interestType}
                      onChange={(e) => handleFormChange('interestType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.entries(LEAD_INTEREST_TYPES).map(([key, value]) => (
                        <option key={key} value={value}>
                          {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Localização
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleFormChange('location', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

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
                          <span>Criar Lead</span>
                        </>
                      )}
                    </ThemedButton>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal de Conversão - MANTIDO IDÊNTICO */}
          {showConvertModal && selectedLead && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Converter Lead para Cliente</h3>
                <p className="text-gray-600 mb-4">
                  Tem certeza que deseja converter <strong>{selectedLead.name}</strong> de lead para cliente?
                </p>
                <div className="flex justify-end space-x-3">
                  <ThemedButton
                    variant="outline"
                    onClick={() => {
                      setShowConvertModal(false);
                      setSelectedLead(null);
                    }}
                  >
                    Cancelar
                  </ThemedButton>
                  <ThemedButton
                    onClick={() => handleConvertLead(selectedLead.id)}
                    disabled={converting}
                    className="flex items-center space-x-2"
                  >
                    {converting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Convertendo...</span>
                      </>
                    ) : (
                      <span>Confirmar Conversão</span>
                    )}
                  </ThemedButton>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Detalhes - MANTIDO IDÊNTICO */}
          {showDetailsModal && selectedLead && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-90vh overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Detalhes do Lead</h3>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedLead(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLead.name}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Telefone</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLead.phone}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLead.email || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Interesse</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedLead.interestType?.replace('_', ' ') || 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Localização</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLead.location || 'N/A'}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedLead.status)}`}>
                      {selectedLead.status}
                    </span>
                  </div>
                  
                  {selectedLead.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notas</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedLead.notes}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedLead.createdAt?.toDate?.()?.toLocaleDateString('pt-PT') || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </ThemedContainer>
      </div>
    </div>
  );
};

export default LeadsPage;