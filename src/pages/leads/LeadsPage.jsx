// src/pages/leads/LeadsPage.jsx - VERSÃO SIMPLES FUNCIONAL
// 🔄 LEADSPAGE QUE FUNCIONA COM ESTRUTURA EXISTENTE
// =================================================
// MyImoMate 3.0 - Versão simplificada que usa apenas imports existentes
// ✅ Remove imports problemáticos
// ✅ Usa apenas componentes já implementados
// ✅ Mantém funcionalidade básica
// ✅ Preparado para futuras integrações

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import LeadsList from '../../components/leads/LeadsList';
import { ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useLeads from '../../hooks/useLeads';
import { 
  UserGroupIcon, 
  PlusIcon, 
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  UserPlusIcon,
  PhoneIcon,
  ExclamationTriangleIcon
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

// Página principal
const LeadsPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
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
    searchLeads,
    setFilters,
    getLeadStats,
    fetchLeads,
    LEAD_STATUS,
    LEAD_INTEREST_TYPES,
    BUDGET_RANGES,
    LEAD_STATUS_COLORS,
    CLIENT_TYPES,
    PROPERTY_STATUS
  } = useLeads();

  // Estados para modais e feedback
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');

  // Estados do formulário de criação
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    clientType: CLIENT_TYPES?.COMPRADOR || 'comprador',
    interestType: LEAD_INTEREST_TYPES?.COMPRA_CASA || '',
    budgetRange: 'undefined',
    location: '',
    notes: '',
    source: 'manual',
    priority: 'normal',
    propertyStatus: PROPERTY_STATUS?.NAO_IDENTIFICADO || 'nao_identificado',
    propertyReference: '',
    propertyLink: '',
    managerName: '',
    managerPhone: '',
    managerEmail: '',
    managerNotes: ''
  });

  // Funções básicas
  const stats = getLeadStats() || {};
  
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      clientType: CLIENT_TYPES?.COMPRADOR || 'comprador',
      interestType: LEAD_INTEREST_TYPES?.COMPRA_CASA || '',
      budgetRange: 'undefined',
      location: '',
      notes: '',
      source: 'manual',
      priority: 'normal',
      propertyStatus: PROPERTY_STATUS?.NAO_IDENTIFICADO || 'nao_identificado',
      propertyReference: '',
      propertyLink: '',
      managerName: '',
      managerPhone: '',
      managerEmail: '',
      managerNotes: ''
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await createLead(formData);
      
      if (result && result.success) {
        setFeedbackMessage('Lead criado com sucesso!');
        setFeedbackType('success');
        setShowCreateForm(false);
        resetForm();
      } else {
        setFeedbackMessage(result?.error || 'Erro ao criar lead');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao criar lead');
      setFeedbackType('error');
    }
  };

  // Funções para integração com LeadsList
  const handleLeadUpdate = () => {
    if (fetchLeads) fetchLeads();
  };

  const handleLeadDelete = () => {
    if (fetchLeads) fetchLeads();
  };

  // ✅ CONVERSÃO SIMPLES (função existente)
  const handleLeadConvert = async (leadId) => {
    try {
      console.log('Convertendo lead:', leadId);
      
      if (!convertLeadToClient) {
        setFeedbackMessage('Função de conversão não disponível');
        setFeedbackType('error');
        return;
      }

      const result = await convertLeadToClient(leadId);
      
      if (result && result.success) {
        setFeedbackMessage(result.message || 'Lead convertido para cliente com sucesso!');
        setFeedbackType('success');
        
        // Recarregar lista
        if (fetchLeads) fetchLeads();
        
        // Opcional: navegar para clientes
        setTimeout(() => {
          navigate('/clients', {
            state: { fromConversion: true, leadId: leadId }
          });
        }, 2000);
        
      } else {
        setFeedbackMessage(result?.error || 'Erro ao converter lead');
        setFeedbackType('error');
      }
    } catch (error) {
      console.error('Erro na conversão:', error);
      setFeedbackMessage('Erro inesperado ao converter lead');
      setFeedbackType('error');
    }
  };

  const handleSearch = (searchTerm) => {
    if (searchLeads) {
      searchLeads(searchTerm);
    }
  };

  const handleMetricClick = (filterType, filterValue) => {
    if (setFilters) {
      setFilters(prev => ({ 
        ...prev, 
        [filterType]: prev[filterType] === filterValue ? '' : filterValue 
      }));
    }
  };

  // Helper functions para labels
  const getClientTypeLabel = (type) => {
    const labels = {
      'comprador': 'Comprador',
      'arrendatario': 'Arrendatário',
      'inquilino': 'Inquilino',
      'vendedor': 'Vendedor',
      'senhorio': 'Senhorio'
    };
    return labels[type] || type;
  };

  const getPropertyStatusLabel = (status) => {
    const labels = {
      'nao_identificado': 'Não Identificado',
      'identificado': 'Identificado',
      'visitado': 'Visitado',
      'rejeitado': 'Rejeitado',
      'aprovado': 'Aprovado'
    };
    return labels[status] || status;
  };

  // Limpar mensagens de feedback
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

            {/* ✅ FEEDBACK MESSAGES */}
            {feedbackMessage && (
              <div className={`p-3 rounded-lg mb-4 flex items-start space-x-3 ${
                feedbackType === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : feedbackType === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : feedbackType === 'warning'
                  ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                <div className="flex-shrink-0">
                  {feedbackType === 'success' && <CheckCircleIcon className="h-5 w-5" />}
                  {feedbackType === 'error' && <ExclamationTriangleIcon className="h-5 w-5" />}
                  {feedbackType === 'warning' && <ClockIcon className="h-5 w-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{feedbackMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* MÉTRICAS PRINCIPAIS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <CompactMetricCard
              title="Total Leads"
              value={stats.total || leads?.length || 0}
              trend="Todos"
              icon={UserGroupIcon}
              color="blue"
              onClick={() => handleMetricClick('status', '')}
            />
            <CompactMetricCard
              title="Novos"
              value={stats.new || 0}
              trend="Recentes"
              icon={PlusIcon}
              color="green"
              onClick={() => handleMetricClick('status', 'novo')}
            />
            <CompactMetricCard
              title="Em Contacto"
              value={stats.contacted || 0}
              trend="Em progresso"
              icon={PhoneIcon}
              color="yellow"
              onClick={() => handleMetricClick('status', 'contactado')}
            />
            <CompactMetricCard
              title="Qualificados"
              value={stats.qualified || 0}
              trend="Prontos"
              icon={CheckCircleIcon}
              color="purple"
              onClick={() => handleMetricClick('status', 'qualificado')}
            />
            <CompactMetricCard
              title="Convertidos"
              value={stats.converted || 0}
              trend="Sucesso"
              icon={UserPlusIcon}
              color="green"
              onClick={() => handleMetricClick('status', 'convertido')}
            />
          </div>

          {/* FILTROS PRINCIPAIS */}
          <div className="mb-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filters?.status || ''}
                    onChange={(e) => handleMetricClick('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Status</option>
                    {LEAD_STATUS && Object.values(LEAD_STATUS).map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Cliente
                  </label>
                  <select
                    value={filters?.clientType || ''}
                    onChange={(e) => handleMetricClick('clientType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Tipos</option>
                    {CLIENT_TYPES && Object.values(CLIENT_TYPES).map(type => (
                      <option key={type} value={type}>
                        {getClientTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Orçamento
                  </label>
                  <select
                    value={filters?.budgetRange || ''}
                    onChange={(e) => handleMetricClick('budgetRange', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Orçamentos</option>
                    {BUDGET_RANGES && Object.entries(BUDGET_RANGES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.replace('_', ' ').charAt(0).toUpperCase() + key.replace('_', ' ').slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Interesse
                  </label>
                  <select
                    value={filters?.interestType || ''}
                    onChange={(e) => handleMetricClick('interestType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Interesses</option>
                    {LEAD_INTEREST_TYPES && Object.entries(LEAD_INTEREST_TYPES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ LEADLIST COM CONVERSÃO SIMPLES */}
          <LeadsList
            leads={leads || []}
            loading={loading}
            error={error}
            onLeadUpdate={handleLeadUpdate}
            onLeadDelete={handleLeadDelete}
            onLeadConvert={handleLeadConvert}
            showSelection={true}
            showActions={true}
            showFilters={false}
            maxHeight="calc(100vh - 300px)"
          />

          {/* MODAL DE CRIAÇÃO DE LEAD */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Criar Novo Lead</h3>
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Fechar</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <form onSubmit={handleCreateSubmit} className="space-y-6">
                  
                  {/* SECÇÃO: INFORMAÇÕES BÁSICAS */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
                      Informações Básicas
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
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
                          placeholder="+351 900 000 000"
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
                          placeholder="exemplo@email.com"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                          {CLIENT_TYPES && Object.values(CLIENT_TYPES).map(type => (
                            <option key={type} value={type}>
                              {getClientTypeLabel(type)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t">
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
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
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
                    </button>
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