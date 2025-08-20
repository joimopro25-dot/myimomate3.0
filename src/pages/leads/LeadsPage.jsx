// src/pages/leads/LeadsPage.jsx - LAYOUT OTIMIZADO
// ✅ Aplicando padrão DashboardLayout otimizado
// ✅ Sistema de 2 colunas sem widgets laterais  
// ✅ Métricas compactas no topo específicas de Leads
// ✅ MANTÉM TODAS AS FUNCIONALIDADES EXISTENTES
// ✅ Apenas muda o layout, zero funcionalidades perdidas
// 🔥 ADICIONADO: Componente LeadsList.jsx com edição inline

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useLeads from '../../hooks/useLeads';
import LeadsList from '../../components/leads/LeadsList'; // 🔥 NOVO IMPORT
import { 
  UserGroupIcon, 
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

// 🎯 PÁGINA PRINCIPAL DO MÓDULO DE LEADS
// =====================================
// MyImoMate 3.0 - Interface completa para gestão de leads
// Funcionalidades: Listagem, Filtros, CRUD, Conversão rápida

const LeadsPage = () => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  
  // Hook personalizado de leads
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
    fetchLeads, // 🔥 ADICIONADO para refresh
    LEAD_STATUS,
    LEAD_INTEREST_TYPES,
    BUDGET_RANGES,
    LEAD_STATUS_COLORS
  } = useLeads();

  // Estados locais
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState(''); // success, error, info

  // Estados do formulário
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

  // Obter estatísticas
  const stats = getLeadStats();

  // 📝 MANIPULAR MUDANÇAS NO FORMULÁRIO
  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 🔄 RESET DO FORMULÁRIO
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

  // 📝 SUBMETER FORMULÁRIO DE CRIAÇÃO
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
        setFeedbackMessage(result.message || 'Erro ao criar lead');
        setFeedbackType('error');
      }
    } catch (err) {
      setFeedbackMessage(`Erro inesperado: ${err.message}`);
      setFeedbackType('error');
    }
  };

  // 🔄 CONVERTER LEAD PARA CLIENTE
  const handleConvertLead = async (lead) => {
    try {
      const result = await convertLeadToClient(lead.id, {
        // Dados adicionais do cliente se necessário
        preferredContactTime: 'anytime',
        source_details: {
          converted_from_lead: true,
          conversion_date: new Date().toISOString()
        }
      });

      if (result.success) {
        setFeedbackMessage(`Lead "${lead.name}" convertido para cliente com sucesso!`);
        setFeedbackType('success');
        setShowConvertModal(false);
        setSelectedLead(null);
        
        // Navegar para o cliente criado (implementar later)
        // navigate(`/clients/${result.clientId}`);
      } else {
        setFeedbackMessage(result.message || 'Erro ao converter lead');
        setFeedbackType('error');
      }
    } catch (err) {
      setFeedbackMessage(`Erro inesperado: ${err.message}`);
      setFeedbackType('error');
    }
  };

  // 🔄 ATUALIZAR STATUS
  const handleStatusChange = async (leadId, newStatus) => {
    const result = await updateLeadStatus(leadId, newStatus);
    
    if (result.success) {
      setFeedbackMessage('Status atualizado com sucesso!');
      setFeedbackType('success');
    } else {
      setFeedbackMessage(result.error || 'Erro ao atualizar status');
      setFeedbackType('error');
    }
  };

  // 🗑️ ELIMINAR LEAD
  const handleDeleteLead = async (leadId, leadName) => {
    if (!window.confirm(`Tem certeza que deseja eliminar o lead "${leadName}"?`)) {
      return;
    }

    const result = await deleteLead(leadId);
    
    if (result.success) {
      setFeedbackMessage('Lead eliminado com sucesso!');
      setFeedbackType('success');
    } else {
      setFeedbackMessage(result.error || 'Erro ao eliminar lead');
      setFeedbackType('error');
    }
  };

  // 🔥 NOVOS HANDLERS PARA LeadsList.jsx
  const handleLeadUpdate = async () => {
    await fetchLeads(); // Refresh da lista
    setFeedbackMessage('Lead atualizado com sucesso!');
    setFeedbackType('success');
  };

  const handleLeadDelete = async () => {
    await fetchLeads(); // Refresh da lista
    setFeedbackMessage('Lead eliminado com sucesso!');
    setFeedbackType('success');
  };

  // 🔍 OBTER RÓTULO LEGÍVEL PARA TIPO DE INTERESSE
  const getInterestTypeLabel = (type) => {
    const labels = {
      [LEAD_INTEREST_TYPES.COMPRA_CASA]: 'Compra Casa',
      [LEAD_INTEREST_TYPES.COMPRA_APARTAMENTO]: 'Compra Apartamento',
      [LEAD_INTEREST_TYPES.COMPRA_TERRENO]: 'Compra Terreno',
      [LEAD_INTEREST_TYPES.COMPRA_COMERCIAL]: 'Compra Comercial',
      [LEAD_INTEREST_TYPES.VENDA_CASA]: 'Venda Casa',
      [LEAD_INTEREST_TYPES.VENDA_APARTAMENTO]: 'Venda Apartamento',
      [LEAD_INTEREST_TYPES.VENDA_TERRENO]: 'Venda Terreno',
      [LEAD_INTEREST_TYPES.VENDA_COMERCIAL]: 'Venda Comercial',
      [LEAD_INTEREST_TYPES.ARRENDAMENTO_CASA]: 'Arrendamento Casa',
      [LEAD_INTEREST_TYPES.ARRENDAMENTO_APARTAMENTO]: 'Arrendamento Apartamento',
      [LEAD_INTEREST_TYPES.ARRENDAMENTO_COMERCIAL]: 'Arrendamento Comercial',
      [LEAD_INTEREST_TYPES.INVESTIMENTO]: 'Investimento',
      [LEAD_INTEREST_TYPES.AVALIACAO]: 'Avaliação',
      [LEAD_INTEREST_TYPES.CONSULTORIA]: 'Consultoria'
    };
    return labels[type] || type;
  };

  // 🔍 OBTER RÓTULO LEGÍVEL PARA STATUS
  const getStatusLabel = (status) => {
    const labels = {
      [LEAD_STATUS.NOVO]: 'Novo',
      [LEAD_STATUS.CONTACTADO]: 'Contactado',
      [LEAD_STATUS.QUALIFICADO]: 'Qualificado',
      [LEAD_STATUS.CONVERTIDO]: 'Convertido',
      [LEAD_STATUS.PERDIDO]: 'Perdido',
      [LEAD_STATUS.INATIVO]: 'Inativo'
    };
    return labels[status] || status;
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
              📋 Gestão de Leads
            </h2>
            <p className={`text-xs ${isDark() ? 'text-gray-400' : 'text-gray-600'}`}>
              Gerir prospects e conversões | Layout Otimizado 🚀 | ✨ <strong>Duplo clique para editar</strong>
            </p>
          </div>
        </div>

        {/* Métricas compactas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 flex-shrink-0" style={{height: '80px'}}>
          <CompactMetricCard
            title="Total Leads"
            value={stats.total.toString()}
            trend={`${stats.conversionRate}% conversão`}
            icon={UserGroupIcon}
            color="blue"
            onClick={() => console.log('Ver todos os leads')}
          />
          <CompactMetricCard
            title="Novos"
            value={(stats.byStatus.novo || 0).toString()}
            trend="Para contactar"
            icon={PlusIcon}
            color="green"
            onClick={() => setShowCreateForm(true)}
          />
          <CompactMetricCard
            title="Contactados"
            value={(stats.byStatus.contactado || 0).toString()}
            trend="Em qualificação"
            icon={ClockIcon}
            color="yellow"
            onClick={() => console.log('Ver contactados')}
          />
          <CompactMetricCard
            title="Convertidos"
            value={(stats.byStatus.convertido || 0).toString()}
            trend="🎉 Sucesso"
            icon={CheckCircleIcon}
            color="purple"
            onClick={() => console.log('Ver convertidos')}
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
                
                {/* Botão Criar Lead */}
                <ThemedButton
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="lg:w-auto"
                  disabled={creating}
                >
                  {creating ? '⏳ Criando...' : '➕ Novo Lead'}
                </ThemedButton>

                {/* Barra de pesquisa */}
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Pesquisar por nome, email ou telefone..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => searchLeads(e.target.value)}
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
                    {Object.values(LEAD_STATUS).map(status => (
                      <option key={status} value={status}>
                        {getStatusLabel(status)}
                      </option>
                    ))}
                  </select>

                  {/* Filtro por Tipo de Interesse */}
                  <select
                    value={filters.interestType}
                    onChange={(e) => setFilters(prev => ({ ...prev, interestType: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos os Tipos</option>
                    {Object.values(LEAD_INTEREST_TYPES).map(type => (
                      <option key={type} value={type}>
                        {getInterestTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </ThemedCard>

            {/* FORMULÁRIO DE CRIAÇÃO DE LEAD */}
            {showCreateForm && (
              <ThemedCard className="p-6">
                <h3 className="text-xl font-bold mb-4">Criar Novo Lead</h3>
                
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Nome */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Nome completo do lead"
                      />
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleFormChange('phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="9XX XXX XXX"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="email@exemplo.com"
                      />
                    </div>

                    {/* Tipo de Interesse */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Interesse
                      </label>
                      <select
                        value={formData.interestType}
                        onChange={(e) => handleFormChange('interestType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(LEAD_INTEREST_TYPES).map(([key, value]) => (
                          <option key={value} value={value}>
                            {getInterestTypeLabel(value)}
                          </option>
                        ))}
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
                        {Object.entries(BUDGET_RANGES).map(([key, label]) => (
                          <option key={key} value={key}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Localização */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Localização Preferida
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleFormChange('location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Cidade, distrito, zona..."
                      />
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
                      placeholder="Informações adicionais sobre o lead..."
                    />
                  </div>

                  {/* Botões do formulário */}
                  <div className="flex gap-3 pt-4">
                    <ThemedButton
                      type="submit"
                      disabled={creating || duplicateCheck}
                      className="flex-1 md:flex-none"
                    >
                      {creating ? '⏳ Criando...' : duplicateCheck ? '🔍 Verificando...' : '✅ Criar Lead'}
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

            {/* 🔥 LISTA DE LEADS - COMPONENTE COM EDIÇÃO INLINE */}
            <ThemedCard className="p-6">
              <div className="mb-4">
                <h3 className="text-xl font-bold">
                  Lista de Leads ({leads.length})
                </h3>
                <p className="text-gray-600 mt-1">
                  ✨ <strong>Duplo clique</strong> em qualquer campo para editar inline | 
                  ✏️ <strong>Editar Completo</strong> | 👁️ <strong>Ver Detalhes</strong> | 🗑️ <strong>Eliminar</strong>
                </p>
              </div>

              {/* 🔥 SUBSTITUIR TABELA ANTIGA PELO NOVO COMPONENTE */}
              <LeadsList
                leads={leads}
                loading={loading}
                error={error}
                onLeadConvert={handleConvertLead}
                onLeadUpdate={handleLeadUpdate}
                onLeadDelete={handleLeadDelete}
                showSelection={true}
                showActions={true}
                showFilters={true}
                maxHeight="500px"
              />
            </ThemedCard>

            {/* MODAL DE CONFIRMAÇÃO DE CONVERSÃO */}
            {showConvertModal && selectedLead && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                  <h3 className="text-xl font-bold mb-4">Converter Lead para Cliente</h3>
                  
                  <div className="mb-6">
                    <p className="text-gray-600 mb-2">
                      Confirma a conversão do lead para cliente?
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="font-medium">{selectedLead.name}</div>
                      <div className="text-sm text-gray-600">{selectedLead.phone}</div>
                      <div className="text-sm text-gray-600">{selectedLead.email}</div>
                      <div className="text-sm font-medium mt-2">
                        {getInterestTypeLabel(selectedLead.interestType)}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <ThemedButton
                      onClick={() => handleConvertLead(selectedLead)}
                      disabled={converting}
                      className="flex-1"
                    >
                      {converting ? '⏳ Convertendo...' : '✅ Converter'}
                    </ThemedButton>
                    
                    <button
                      onClick={() => {
                        setShowConvertModal(false);
                        setSelectedLead(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
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

export default LeadsPage;