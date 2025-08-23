// src/pages/leads/LeadsPage.jsx - VERSÃO COM CORREÇÃO DE CONVERSÃO INTEGRADA
// ✅ Mantém estrutura original completa
// ✅ Adiciona apenas modal corrigido e funções necessárias
// ✅ Correção minimalista e eficaz

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import LeadsList from '../../components/leads/LeadsList';
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useLeads from '../../hooks/useLeads';

// ✅ IMPORTAÇÃO DO MODAL SIMPLES (sem loops)
import SimpleConversionModal from '../../components/modals/SimpleConversionModal';

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

// Componente de Métrica Compacta (mantido igual)
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
  
  // ✅ ADIÇÃO: Extrair funções de conversão do hook atualizado
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
    PROPERTY_STATUS,
    // ✅ ADIÇÃO: Novas funções para conversão corrigida
    conversionModal,
    initiateLeadConversion,
    processLeadConversion,
    closeConversionModal,
    handleDebugLog
  } = useLeads();

  // Estados para modais (mantidos iguais)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');

  // Estados do formulário expandido (mantidos iguais)
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

  // Funções (mantidas iguais)
  const stats = getLeadStats();
  
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

  // Funções para integração com LeadsList (mantidas iguais)
  const handleLeadUpdate = () => {
    fetchLeads();
  };

  const handleLeadDelete = () => {
    fetchLeads();
  };

  // ✅ CORREÇÃO: Função de conversão atualizada
  const handleLeadConvert = async (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) {
      setFeedbackMessage('Lead não encontrado');
      setFeedbackType('error');
      return;
    }

    try {
      // ✅ Usar nova função que abre modal obrigatório
      const result = initiateLeadConversion ? 
        initiateLeadConversion(lead) : 
        await convertLeadToClient(leadId); // Fallback para versão antiga
      
      if (result.success) {
        if (result.modalOpened) {
          // Modal foi aberto - aguardar conversão
          console.log('Modal de conversão aberto para lead:', lead.name);
        } else {
          // Conversão direta (versão antiga)
          setFeedbackMessage(result.message || 'Lead convertido para cliente com sucesso!');
          setFeedbackType('success');
        }
      } else {
        setFeedbackMessage(result.error || 'Erro ao converter lead');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao converter lead');
      setFeedbackType('error');
    }
  };

  // ✅ ADIÇÃO: Callback para processar conversão do modal
  const handleModalConvert = async (conversionData) => {
    try {
      const result = processLeadConversion ? 
        await processLeadConversion(conversionData) :
        { success: false, error: 'Função de conversão não disponível' };
      
      if (result.success) {
        setFeedbackMessage(result.message || 'Lead convertido com sucesso!');
        setFeedbackType('success');
      } else {
        setFeedbackMessage(result.error || 'Erro na conversão');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado durante a conversão');
      setFeedbackType('error');
    }
  };

  // ✅ ADIÇÃO: Callback para fechar modal
  const handleModalClose = () => {
    if (closeConversionModal) {
      closeConversionModal();
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

  // Helper functions para labels (mantidas iguais)
  const getClientTypeLabel = (type) => {
    const labels = {
      [CLIENT_TYPES.COMPRADOR]: 'Comprador',
      [CLIENT_TYPES.ARRENDATARIO]: 'Arrendatário',
      [CLIENT_TYPES.INQUILINO]: 'Inquilino',
      [CLIENT_TYPES.VENDEDOR]: 'Vendedor',
      [CLIENT_TYPES.SENHORIO]: 'Senhorio'
    };
    return labels[type] || type;
  };

  const getPropertyStatusLabel = (status) => {
    const labels = {
      [PROPERTY_STATUS.NAO_IDENTIFICADO]: 'Não Identificado',
      [PROPERTY_STATUS.IDENTIFICADO]: 'Identificado',
      [PROPERTY_STATUS.VISITADO]: 'Visitado',
      [PROPERTY_STATUS.REJEITADO]: 'Rejeitado',
      [PROPERTY_STATUS.APROVADO]: 'Aprovado'
    };
    return labels[status] || status;
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
      
      <div className="flex-1 min-h-screen bg-gray-50">
        <div className="px-4 py-4">
          
          {/* Header da Página (mantido igual) */}
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

            {/* Feedback Messages (mantido igual) */}
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

            {/* Métricas Compactas (mantidas iguais) */}
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

          {/* Filtros e Pesquisa (mantidos iguais) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
            <div className="p-3">
              <div className="flex flex-col md:flex-row gap-3">
                
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Pesquisar por nome, telefone, email, gestor ou referência..."
                    value={filters?.searchTerm || ''}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

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
                    value={filters?.clientType || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, clientType: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Tipos</option>
                    {CLIENT_TYPES && Object.entries(CLIENT_TYPES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {getClientTypeLabel(value)}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters?.interestType || ''}
                    onChange={(e) => setFilters(prev => ({ ...prev, interestType: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

          {/* LeadsList Componente (mantido igual) */}
          <LeadsList
            leads={leads}
            loading={loading}
            error={error}
            onLeadUpdate={handleLeadUpdate}
            onLeadDelete={handleLeadDelete}
            onLeadConvert={handleLeadConvert}  // ✅ Usa função corrigida
            showSelection={true}
            showActions={true}
            showFilters={false}
            maxHeight="calc(100vh - 300px)"
          />

          {/* ✅ MODAL SIMPLES - sem loops de renderização */}
          {conversionModal?.isOpen && conversionModal?.leadData && (
            <SimpleConversionModal
              isOpen={true}
              onClose={handleModalClose}
              leadData={conversionModal.leadData}
              onConvert={handleModalConvert}
              isConverting={converting}
            />
          )}

          {/* Modal de criação expandido (mantido igual) */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Criar Novo Lead</h3>
                
                <form onSubmit={handleCreateSubmit} className="space-y-6">
                  
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
                          Tipo de Cliente
                        </label>
                        <select
                          value={formData.clientType}
                          onChange={(e) => handleFormChange('clientType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {CLIENT_TYPES && Object.entries(CLIENT_TYPES).map(([key, value]) => (
                            <option key={key} value={value}>
                              {getClientTypeLabel(value)}
                            </option>
                          ))}
                        </select>
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
                          {LEAD_INTEREST_TYPES && Object.entries(LEAD_INTEREST_TYPES).map(([key, value]) => (
                            <option key={key} value={value}>
                              {key.charAt(0) + key.slice(1).toLowerCase().replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Orçamento
                        </label>
                        <select
                          value={formData.budgetRange}
                          onChange={(e) => handleFormChange('budgetRange', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="undefined">Não definido</option>
                          {BUDGET_RANGES && Object.entries(BUDGET_RANGES).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Localização Preferida
                        </label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleFormChange('location', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Cidade, distrito..."
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
                      Informações do Imóvel
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status do Imóvel
                        </label>
                        <select
                          value={formData.propertyStatus}
                          onChange={(e) => handleFormChange('propertyStatus', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {PROPERTY_STATUS && Object.entries(PROPERTY_STATUS).map(([key, value]) => (
                            <option key={key} value={value}>
                              {getPropertyStatusLabel(value)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Referência do Imóvel
                        </label>
                        <input
                          type="text"
                          value={formData.propertyReference}
                          onChange={(e) => handleFormChange('propertyReference', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Ex: IMO001, REF123..."
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Link do Imóvel
                        </label>
                        <input
                          type="url"
                          value={formData.propertyLink}
                          onChange={(e) => handleFormChange('propertyLink', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
                      Informações do Gestor do Imóvel
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Gestor
                        </label>
                        <input
                          type="text"
                          value={formData.managerName}
                          onChange={(e) => handleFormChange('managerName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefone do Gestor
                        </label>
                        <input
                          type="tel"
                          value={formData.managerPhone}
                          onChange={(e) => handleFormChange('managerPhone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email do Gestor
                        </label>
                        <input
                          type="email"
                          value={formData.managerEmail}
                          onChange={(e) => handleFormChange('managerEmail', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Notas sobre o Gestor
                        </label>
                        <textarea
                          value={formData.managerNotes}
                          onChange={(e) => handleFormChange('managerNotes', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Informações sobre contactos com o gestor..."
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-1">
                      Notas e Observações
                    </h4>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleFormChange('notes', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Informações adicionais sobre o lead..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
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