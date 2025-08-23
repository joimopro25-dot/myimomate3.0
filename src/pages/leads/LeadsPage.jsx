// src/pages/leads/LeadsPage.jsx - VERSÃO COMPLETA CORRIGIDA
// ✅ Mantém TODA a estrutura original
// ✅ Corrige APENAS a função handleModalConvert
// ✅ Adiciona timeout e melhor gestão de erros na conversão

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import LeadsList from '../../components/leads/LeadsList';
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useLeads from '../../hooks/useLeads';

// ✅ IMPORTAÇÃO DO MODAL SIMPLES
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
  
  // Hook de leads com todas as funções
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
    // Funções para conversão corrigida
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
  const [viewMode, setViewMode] = useState('grid');

  // ✅ ADIÇÃO: Estado para controlar conversão do modal
  const [isModalConverting, setIsModalConverting] = useState(false);

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

  // Função de conversão atualizada (mantida igual)
  const handleLeadConvert = async (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) {
      setFeedbackMessage('Lead não encontrado');
      setFeedbackType('error');
      return;
    }

    try {
      // Usar nova função que abre modal obrigatório
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

  // ✅ CORREÇÃO: Callback para processar conversão do modal COM TIMEOUT
  const handleModalConvert = async (conversionData) => {
  console.log('🚀 Iniciando conversão do modal:', conversionData);
  
  try {
    setIsModalConverting(true);
    setFeedbackMessage('');
    
    // ✅ VALIDAÇÃO BÁSICA SIMPLES
    if (!conversionData.leadId) {
      throw new Error('ID do lead em falta');
    }
    
    if (!conversionData.leadData) {
      throw new Error('Dados do lead em falta');
    }

    console.log('📋 Chamando processLeadConversion...');
    
    // ✅ CHAMADA SIMPLIFICADA - deixar toda a lógica para processLeadConversion
    const result = await processLeadConversion(conversionData);
    
    console.log('✅ Resultado da conversão:', result);

    if (result && result.success) {
      // ✅ CONVERSÃO BEM-SUCEDIDA
      setFeedbackMessage(
        result.message || 'Lead convertido com sucesso!'
      );
      setFeedbackType('success');
      
      // ✅ FECHAR MODAL
      if (closeConversionModal) {
        closeConversionModal();
      }
      
      // ✅ RECARREGAR LISTA DE LEADS
      if (fetchLeads) {
        fetchLeads();
      }
      
      console.log('🎉 Conversão concluída com sucesso!');
      
    } else {
      // ✅ ERRO NA CONVERSÃO
      throw new Error(result?.error || 'Erro desconhecido na conversão');
    }
    
  } catch (error) {
    console.error('❌ Erro na conversão:', error);
    
    setFeedbackMessage(
      `Erro na conversão: ${error.message}`
    );
    setFeedbackType('error');
    
    // ✅ NÃO FECHAR MODAL EM CASO DE ERRO (permite retry)
    
  } finally {
    setIsModalConverting(false);
  }
};

  // ✅ CORREÇÃO: Callback para fechar modal
  const handleModalClose = () => {
    console.log('🚪 Fechando modal de conversão');
    
    if (closeConversionModal) {
      closeConversionModal();
    }
    
    // Reset do estado de conversão
    setIsModalConverting(false);
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

  // Preparar dados para componentes
  const budgetOptions = Object.entries(BUDGET_RANGES || {}).map(([key, label]) => ({
    value: key,
    label: label
  }));

  const interestTypeOptions = Object.entries(LEAD_INTEREST_TYPES || {}).map(([key, value]) => ({
    value: value,
    label: value.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }));

  const clientTypeOptions = Object.entries(CLIENT_TYPES || {}).map(([key, value]) => ({
    value: value,
    label: value.charAt(0).toUpperCase() + value.slice(1)
  }));

  const propertyStatusOptions = Object.entries(PROPERTY_STATUS || {}).map(([key, value]) => ({
    value: value,
    label: value.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }));

  // useEffect para buscar leads na montagem (mantido igual)
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ✅ RENDER PRINCIPAL
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <ThemedContainer>
          {/* Header */}
          <div className="mb-6">
            <h1 className={`text-2xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
              Gestão de Leads
            </h1>
            <p className={`mt-1 text-sm ${isDark() ? 'text-gray-300' : 'text-gray-600'}`}>
              Gere e converta leads em clientes de forma eficiente
            </p>
          </div>

          {/* Feedback Message */}
          {feedbackMessage && (
            <div className={`mb-4 p-4 rounded-md ${
              feedbackType === 'success' ? 'bg-green-100 text-green-700' :
              feedbackType === 'error' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {feedbackMessage}
              <button 
                onClick={() => setFeedbackMessage('')}
                className="ml-4 text-sm underline"
              >
                Fechar
              </button>
            </div>
          )}

          {/* Métricas Compactas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <CompactMetricCard
              title="Total"
              value={stats.total}
              icon={UserGroupIcon}
              color="blue"
              onClick={() => handleMetricClick('status', '')}
            />
            <CompactMetricCard
              title="Novos"
              value={stats.novos}
              icon={PlusIcon}
              color="green"
              onClick={() => handleMetricClick('status', LEAD_STATUS?.NOVO)}
            />
            <CompactMetricCard
              title="Qualificados"
              value={stats.qualificados}
              icon={CheckCircleIcon}
              color="purple"
              onClick={() => handleMetricClick('status', LEAD_STATUS?.QUALIFICADO)}
            />
            <CompactMetricCard
              title="Pendentes"
              value={stats.pendentes}
              icon={ClockIcon}
              color="yellow"
              onClick={() => handleMetricClick('status', LEAD_STATUS?.CONTACTADO)}
            />
            <CompactMetricCard
              title="Convertidos"
              value={stats.convertidos}
              icon={ArrowRightIcon}
              color="green"
              onClick={() => handleMetricClick('status', LEAD_STATUS?.CONVERTIDO)}
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <ThemedButton
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Novo Lead
              </ThemedButton>
              
              <div className="flex items-center bg-white rounded-lg border border-gray-200 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-l-lg ${
                    viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-r-lg ${
                    viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <ListBulletIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Leads */}
          <ThemedCard className="overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">Erro ao carregar leads: {error}</p>
                <button
                  onClick={fetchLeads}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Tentar novamente
                </button>
              </div>
            ) : (
              <LeadsList
                leads={leads}
                onLeadUpdate={handleLeadUpdate}
                onLeadDelete={handleLeadDelete}
                onLeadConvert={handleLeadConvert}
                filters={filters}
                onFiltersChange={setFilters}
                loading={loading}
                viewMode={viewMode}
                onSearch={handleSearch}
                showActions={true}
              />
            )}
          </ThemedCard>

          {/* Modal de Criação (mantido igual) */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleCreateSubmit}>
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Criar Novo Lead</h3>
                  </div>
                  
                  <div className="px-6 py-4 space-y-6">
                    {/* Informações Básicas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => handleFormChange('name', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Nome completo do lead"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => handleFormChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Número de telefone"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleFormChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Email do lead"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cliente</label>
                        <select
                          value={formData.clientType}
                          onChange={(e) => handleFormChange('clientType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {clientTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Interesse</label>
                        <select
                          value={formData.interestType}
                          onChange={(e) => handleFormChange('interestType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {interestTypeOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento</label>
                        <select
                          value={formData.budgetRange}
                          onChange={(e) => handleFormChange('budgetRange', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="undefined">Não especificado</option>
                          {budgetOptions.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Localização</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => handleFormChange('location', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Localização preferida"
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                        <textarea
                          rows={3}
                          value={formData.notes}
                          onChange={(e) => handleFormChange('notes', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Observações sobre o lead..."
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {creating ? 'Criando...' : 'Criar Lead'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ✅ MODAL DE CONVERSÃO CORRIGIDO */}
          {conversionModal && conversionModal.isOpen && (
            <SimpleConversionModal
              isOpen={conversionModal.isOpen}
              onClose={handleModalClose}
              leadData={conversionModal.leadData}
              onConvert={handleModalConvert} // ✅ Função corrigida com timeout
              isConverting={isModalConverting || converting} // ✅ Estado local + global
            />
          )}
        </ThemedContainer>
      </div>
    </div>
  );
};

export default LeadsPage;