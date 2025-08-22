// src/pages/leads/LeadsPage.jsx - VERSÃO CORRIGIDA SEM ERROS
// ✅ Sidebar reutilizável aplicado
// ✅ Vista cards/lista toggle implementada  
// ✅ Espaçamento otimizado
// ✅ Código limpo e funcional

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useLeads from '../../hooks/useLeads';
import { 
  UserGroupIcon, 
  PlusIcon, 
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// Componente de Métrica Compacta
const CompactMetricCard = ({ title, value, trend, icon: Icon, color, onClick }) => {
  const { isDark } = useTheme();
  
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

// Card de Lead Individual
const LeadCard = ({ lead, onSelect, getStatusColor }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
      onClick={() => onSelect(lead)}
    >
      <div className="p-4">
        {/* Header do Card */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {lead.name}
            </h3>
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
              {lead.status}
            </span>
          </div>
          <div className="ml-4">
            <UserGroupIcon className="h-8 w-8 text-gray-400" />
          </div>
        </div>

        {/* Informações de Contacto */}
        <div className="space-y-2 mb-3">
          {lead.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
              {lead.phone}
            </div>
          )}
          
          {lead.email && (
            <div className="flex items-center text-sm text-gray-600">
              <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
              {lead.email}
            </div>
          )}
          
          {lead.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
              {lead.location}
            </div>
          )}
        </div>

        {/* Interesse e Orçamento */}
        <div className="space-y-1 mb-3">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Interesse:</span>
            <span className="ml-1 text-gray-600">
              {lead.interestType?.replace('_', ' ') || 'N/A'}
            </span>
          </div>
          
          {lead.budgetRange && (
            <div className="text-sm">
              <span className="font-medium text-gray-700">Orçamento:</span>
              <span className="ml-1 text-gray-600">
                {lead.budgetRange.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>

        {/* Notas (se existirem) */}
        {lead.notes && (
          <div className="mb-3">
            <p className="text-sm text-gray-600 line-clamp-2">
              {lead.notes}
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            {lead.createdAt?.toDate?.()?.toLocaleDateString('pt-PT') || 'N/A'}
          </div>
          
          <div className="text-blue-600 font-medium">
            Clique para ver →
          </div>
        </div>
      </div>
    </div>
  );
};

// Página principal
const LeadsPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  // Estados de vista
  const [viewMode, setViewMode] = useState('cards');
  
  // Hook personalizado de leads
  const {
    leads,
    loading,
    error,
    creating,
    converting,
    filters,
    createLead,
    convertLeadToClient,
    updateLeadStatus,
    deleteLead,
    searchLeads,
    setFilters,
    getLeadStats,
    LEAD_STATUS,
    LEAD_INTEREST_TYPES,
    BUDGET_RANGES,
    LEAD_STATUS_COLORS
  } = useLeads();

  // Estados para modais
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interestType: LEAD_INTEREST_TYPES?.COMPRA_CASA || '',
    budgetRange: 'undefined',
    location: '',
    notes: '',
    source: 'manual',
    priority: 'normal'
  });

  // Funções
  const stats = getLeadStats();
  
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      interestType: LEAD_INTEREST_TYPES?.COMPRA_CASA || '',
      budgetRange: 'undefined',
      location: '',
      notes: '',
      source: 'manual',
      priority: 'normal'
    });
  };

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

  const handleConvertLead = async (leadId) => {
    try {
      const result = await convertLeadToClient(leadId);
      
      if (result.success) {
        setFeedbackMessage(result.message || 'Lead convertido para cliente com sucesso!');
        setFeedbackType('success');
        setShowConvertModal(false);
        setSelectedLead(null);
        setShowDetailsModal(false);
      } else {
        setFeedbackMessage(result.error || 'Erro ao converter lead');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao converter lead');
      setFeedbackType('error');
    }
  };

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Tem certeza que deseja eliminar este lead?')) return;
    
    try {
      const result = await deleteLead(leadId);
      
      if (result.success) {
        setFeedbackMessage('Lead eliminado com sucesso!');
        setFeedbackType('success');
        setShowDetailsModal(false);
        setSelectedLead(null);
      } else {
        setFeedbackMessage(result.error || 'Erro ao eliminar lead');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao eliminar lead');
      setFeedbackType('error');
    }
  };

  const handleSearch = (searchTerm) => {
    searchLeads(searchTerm);
  };

  const handleMetricClick = (filterType, filterValue) => {
    setFilters(prev => ({ 
      ...prev, 
      [filterType]: prev[filterType] === filterValue ? '' : filterValue 
    }));
  };

  const getStatusColor = (status) => {
    return LEAD_STATUS_COLORS?.[status] || 'bg-gray-100 text-gray-800';
  };

  const handleSelectLead = (lead) => {
    setSelectedLead(lead);
    setShowDetailsModal(true);
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
    <div className="flex">
      <Sidebar />
      
      {/* ✅ CORREÇÃO: Removido ml-64 aqui - mudança da linha 349 */}
      <div className="flex-1 min-h-screen bg-gray-50">
        <div className="px-4 py-4">
          
          {/* Header da Página */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
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

            {/* Feedback Messages */}
            {feedbackMessage && (
              <div className={`p-3 rounded-lg mb-4 ${
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
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              <CompactMetricCard
                title="Total de Leads"
                value={stats?.total || 0}
                trend={`${leads?.length || 0} ativos`}
                icon={UserGroupIcon}
                color="blue"
                onClick={() => handleMetricClick('status', '')}
              />
              
              <CompactMetricCard
                title="Novos"
                value={stats?.byStatus?.novo || 0}
                trend="Aguardam contacto"
                icon={ClockIcon}
                color="yellow"
                onClick={() => handleMetricClick('status', LEAD_STATUS?.NOVO)}
              />
              
              <CompactMetricCard
                title="Qualificados"
                value={stats?.byStatus?.qualificado || 0}
                trend="Potencial confirmado"
                icon={CheckCircleIcon}
                color="green"
                onClick={() => handleMetricClick('status', LEAD_STATUS?.QUALIFICADO)}
              />
              
              <CompactMetricCard
                title="Convertidos"
                value={stats?.byStatus?.convertido || 0}
                trend={`${stats?.conversionRate || 0}% taxa`}
                icon={CheckCircleIcon}
                color="purple"
                onClick={() => handleMetricClick('status', LEAD_STATUS?.CONVERTIDO)}
              />
              
              <CompactMetricCard
                title="Em Seguimento"
                value={stats?.byStatus?.contactado || 0}
                trend="Processo ativo"
                icon={EyeIcon}
                color="blue"
                onClick={() => handleMetricClick('status', LEAD_STATUS?.CONTACTADO)}
              />
            </div>
          </div>

          {/* Filtros e Pesquisa */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
            <div className="p-3">
              <div className="flex flex-col md:flex-row gap-3">
                
                {/* Campo de Pesquisa */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Pesquisar por nome, telefone ou email..."
                    value={filters?.searchTerm || ''}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Filtros */}
                <div className="flex flex-col md:flex-row gap-2">
                  <select
                    value={filters?.status || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Status</option>
                    {LEAD_STATUS && Object.entries(LEAD_STATUS).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters?.interestType || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, interestType: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Tipos</option>
                    {LEAD_INTEREST_TYPES && Object.entries(LEAD_INTEREST_TYPES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters?.budgetRange || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, budgetRange: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas as Faixas</option>
                    {BUDGET_RANGES && Object.entries(BUDGET_RANGES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de Leads */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-3">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lista de Leads ({leads?.length || 0})
                </h3>
                
                {/* Toggle Vista */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'cards' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-blue-100 text-blue-600' 
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                </div>
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
              ) : !leads || leads.length === 0 ? (
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
                viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                    {leads.map((lead) => (
                      <LeadCard
                        key={lead.id}
                        lead={lead}
                        onSelect={handleSelectLead}
                        getStatusColor={getStatusColor}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interesse</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orçamento</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {leads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleSelectLead(lead)}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                <div className="text-sm text-gray-500">{lead.location}</div>
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
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectLead(lead);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Ver Detalhes
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Modal de Detalhes */}
          {showDetailsModal && selectedLead && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg w-full max-w-2xl max-h-90vh overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedLead.name}</h3>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedLead.status)} mt-1`}>
                      {selectedLead.status}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setSelectedLead(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Informações de Contacto</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                          <span className="text-gray-900">{selectedLead.phone}</span>
                        </div>
                        
                        {selectedLead.email && (
                          <div className="flex items-center">
                            <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <span className="text-gray-900">{selectedLead.email}</span>
                          </div>
                        )}
                        
                        {selectedLead.location && (
                          <div className="flex items-center">
                            <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <span className="text-gray-900">{selectedLead.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Detalhes do Interesse</h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Tipo de Interesse</label>
                          <p className="mt-1 text-gray-900">{selectedLead.interestType?.replace('_', ' ') || 'N/A'}</p>
                        </div>
                        
                        {selectedLead.budgetRange && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Orçamento</label>
                            <p className="mt-1 text-gray-900">{selectedLead.budgetRange.replace('_', ' ')}</p>
                          </div>
                        )}
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Data de Criação</label>
                          <p className="mt-1 text-gray-900">
                            {selectedLead.createdAt?.toDate?.()?.toLocaleDateString('pt-PT') || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedLead.notes && (
                    <div className="mt-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Notas</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedLead.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
                  <div className="flex space-x-3">
                    <ThemedButton
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingLead(selectedLead);
                        setShowEditForm(true);
                        setShowDetailsModal(false);
                      }}
                      className="flex items-center"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Editar
                    </ThemedButton>
                    
                    <ThemedButton
                      variant="success"
                      size="sm"
                      onClick={() => {
                        handleConvertLead(selectedLead.id);
                      }}
                      disabled={converting}
                      className="flex items-center"
                    >
                      {converting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Convertendo...
                        </>
                      ) : (
                        <>
                          <ArrowRightIcon className="w-4 h-4 mr-2" />
                          Converter p/ Cliente
                        </>
                      )}
                    </ThemedButton>
                  </div>
                  
                  <ThemedButton
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteLead(selectedLead.id)}
                    className="flex items-center"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Eliminar
                  </ThemedButton>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Criação */}
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

        </div>
      </div>
    </div>
  );
};

export default LeadsPage;