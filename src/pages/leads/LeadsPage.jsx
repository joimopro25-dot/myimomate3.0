// src/pages/leads/LeadsPage.jsx - VERSÃO ESTÁVEL COM CORREÇÃO DE SINCRONIZAÇÃO + ATUALIZAÇÃO INSTANTÂNEA
// ✅ Mantém TODAS as funcionalidades existentes (100%) - REGRA DE MESTRE RESPEITADA
// ✅ CORREÇÃO: Sincronização pós-conversão com clientes e oportunidades  
// ✅ CORREÇÃO: Atualização instantânea da lista após edição (sem reload)
// ✅ Small cards "Mornos" e "Frios" funcionais
// ✅ Todas as funcionalidades originais preservadas

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import LeadsList from '../../components/leads/LeadsList';
import LeadForm from '../../components/leads/LeadForm';
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useLeads from '../../hooks/useLeads';

// Importação do modal de conversão
import SimpleConversionModal from '../../components/modals/SimpleConversionModal';

import { 
  UserGroupIcon, 
  PlusIcon, 
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  ArrowRightIcon,
  FireIcon,        // Para "Mornos" (era "Qualificados")
  CloudIcon        // Para "Frios" (era "Pendentes")
} from '@heroicons/react/24/outline';

// Componente de Métrica Compacta - Padrão do Sistema (MANTIDO 100%)
const CompactMetricCard = ({ title, value, trend, icon: Icon, color, onClick }) => {
  const { isDark } = useTheme();
  
  const colorClasses = {
    blue: isDark() ? 'from-blue-600 to-blue-700' : 'from-blue-500 to-blue-600',
    green: isDark() ? 'from-green-600 to-green-700' : 'from-green-500 to-green-600',
    yellow: isDark() ? 'from-yellow-600 to-yellow-700' : 'from-yellow-500 to-yellow-600',
    purple: isDark() ? 'from-purple-600 to-purple-700' : 'from-purple-500 to-purple-600',
    orange: isDark() ? 'from-orange-600 to-orange-700' : 'from-orange-500 to-orange-600', // Para "Mornos"
    slate: isDark() ? 'from-slate-600 to-slate-700' : 'from-slate-500 to-slate-600',     // Para "Frios"
    red: isDark() ? 'from-red-600 to-red-700' : 'from-red-500 to-red-600'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-gradient-to-r ${colorClasses[color]} p-4 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-all duration-200 transform hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div className="text-white">
          <p className="text-sm font-medium opacity-90">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p className="text-xs opacity-75 mt-1">{trend}</p>
          )}
        </div>
        <Icon className="h-8 w-8 text-white opacity-80" />
      </div>
    </div>
  );
};

// Página Principal
const LeadsPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  
  // Hook de leads com todas as funções (MANTIDO 100%)
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
    refreshLeads, // ✅ ADIÇÃO: para invalidar cache e forçar atualização
    LEAD_STATUS,
    LEAD_INTEREST_TYPES,
    BUDGET_RANGES,
    LEAD_STATUS_COLORS,
    CLIENT_TYPES,
    PROPERTY_STATUS,
    conversionModal,
    initiateLeadConversion,
    processLeadConversion,
    closeConversionModal,
    handleDebugLog
  } = useLeads();

  // Estados para modais (MANTIDOS 100%)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [isModalConverting, setIsModalConverting] = useState(false);

  // Funções (MANTIDAS 100%)
  const stats = getLeadStats();

  // ✅ NOVA FUNCIONALIDADE: Handler para atualização instantânea da lista
  const handleLeadUpdate = useCallback(async () => {
    console.log('🔄 Lead atualizada - atualizando lista instantaneamente...');
    
    try {
      // Usar refreshLeads para invalidar cache e buscar dados frescos
      if (refreshLeads) {
        await refreshLeads();
      } else {
        // Fallback para fetchLeads se refreshLeads não estiver disponível
        await fetchLeads();
      }
      
      console.log('✅ Lista de leads atualizada com sucesso!');
      
      // Feedback visual discreto
      setFeedbackMessage('Lead atualizada com sucesso!');
      setFeedbackType('success');
      
      // Limpar feedback após 3 segundos
      setTimeout(() => {
        setFeedbackMessage('');
        setFeedbackType('');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Erro ao atualizar lista de leads:', error);
      
      setFeedbackMessage(`Erro ao atualizar lista: ${error.message}`);
      setFeedbackType('error');
    }
  }, [refreshLeads, fetchLeads]);

  // ✅ NOVA FUNCIONALIDADE: Handler para eliminação com atualização instantânea
  const handleLeadDelete = useCallback(async () => {
    console.log('🔄 Lead eliminada - atualizando lista instantaneamente...');
    
    try {
      if (refreshLeads) {
        await refreshLeads();
      } else {
        await fetchLeads();
      }
      
      console.log('✅ Lista de leads atualizada após eliminação!');
      
      setFeedbackMessage('Lead eliminada com sucesso!');
      setFeedbackType('success');
      
      setTimeout(() => {
        setFeedbackMessage('');
        setFeedbackType('');
      }, 3000);
      
    } catch (error) {
      console.error('❌ Erro ao atualizar lista após eliminação:', error);
    }
  }, [refreshLeads, fetchLeads]);

  // Função de criação (MANTIDA 100%)
  const handleCreateSubmit = async (leadData) => {
    try {
      const result = await createLead(leadData);
      
      if (result.success) {
        setFeedbackMessage('Lead criado com sucesso!');
        setFeedbackType('success');
        setShowCreateForm(false);
        
        // A lista já atualiza automaticamente via hook
        console.log('Lead criado com sucesso:', result.id);
      } else {
        setFeedbackMessage(result.error || 'Erro ao criar lead');
        setFeedbackType('error');
      }
    } catch (error) {
      console.error('Erro ao criar lead:', error);
      setFeedbackMessage('Erro inesperado ao criar lead');
      setFeedbackType('error');
    }
  };

  // Função de cancelamento (MANTIDA 100%)
  const handleCreateCancel = () => {
    setShowCreateForm(false);
  };

  // Função de conversão (MANTIDA 100%)
  const handleLeadConvert = async (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) {
      setFeedbackMessage('Lead não encontrado');
      setFeedbackType('error');
      return;
    }

    try {
      const result = initiateLeadConversion ? 
        initiateLeadConversion(lead) : 
        await convertLeadToClient(leadId);
      
      if (result.success) {
        if (result.modalOpened) {
          console.log('Modal de conversão aberto para lead:', lead.name);
        } else {
          setFeedbackMessage(result.message || 'Lead convertido para cliente com sucesso!');
          setFeedbackType('success');
        }
      } else {
        setFeedbackMessage(result.error || 'Erro ao converter lead');
        setFeedbackType('error');
      }
    } catch (error) {
      console.error('Erro ao converter lead:', error);
      setFeedbackMessage('Erro inesperado ao converter lead');
      setFeedbackType('error');
    }
  };

  // CORREÇÃO: Handler com sincronização pós-conversão (MANTIDA + MELHORADA)
  const handleModalConvert = async (conversionData) => {
    console.log('Iniciando conversão do modal:', conversionData);
    
    try {
      setIsModalConverting(true);
      setFeedbackMessage('');
      
      if (!conversionData.leadId) {
        throw new Error('ID do lead em falta');
      }
      
      if (!conversionData.leadData) {
        throw new Error('Dados do lead em falta');
      }

      console.log('Chamando processLeadConversion...');
      
      const result = await processLeadConversion(conversionData);
      
      console.log('Resultado da conversão:', result);

      if (result && result.success) {
        setFeedbackMessage(
          result.message || 'Lead convertido com sucesso!'
        );
        setFeedbackType('success');
        
        // ✅ CORREÇÃO: Sincronização forçada melhorada
        console.log('🔄 Sincronizando dados após conversão...');
        
        // Atualizar lista de leads com invalidação de cache
        if (refreshLeads) {
          await refreshLeads();
        } else if (fetchLeads) {
          await fetchLeads();
        }
        
        // Forçar atualização de clientes via função global
        if (typeof window.refreshClients === 'function') {
          console.log('Atualizando lista de clientes...');
          await window.refreshClients();
        }
        
        // Forçar atualização de oportunidades via função global
        if (typeof window.refreshOpportunities === 'function') {
          console.log('Atualizando lista de oportunidades...');
          await window.refreshOpportunities();
        }
        
        // Broadcast event para sincronização global
        const syncEvent = new CustomEvent('crm-data-sync', {
          detail: {
            type: 'lead-conversion',
            leadId: conversionData.leadId,
            clientId: result.clientId,
            opportunityId: result.opportunityId,
            timestamp: new Date().toISOString()
          }
        });
        window.dispatchEvent(syncEvent);
        
        if (closeConversionModal) {
          closeConversionModal();
        }
        
        console.log('✅ Conversão e sincronização concluídas com sucesso!');
        
      } else {
        throw new Error(result?.error || 'Erro desconhecido na conversão');
      }
      
    } catch (error) {
      console.error('Erro na conversão:', error);
      
      setFeedbackMessage(
        `Erro na conversão: ${error.message}`
      );
      setFeedbackType('error');
      
    } finally {
      setIsModalConverting(false);
    }
  };

  // Função de fechamento do modal (MANTIDA 100%)
  const handleModalClose = () => {
    console.log('Fechando modal de conversão');
    
    if (closeConversionModal) {
      closeConversionModal();
    }
    
    setIsModalConverting(false);
  };

  // Função de pesquisa (MANTIDA 100%)
  const handleSearch = (searchTerm) => {
    searchLeads(searchTerm);
  };

  // Função de clique em métricas (MANTIDA 100%)
  const handleMetricClick = (filterType, filterValue) => {
    setFilters(prev => ({ 
      ...prev, 
      [filterType]: prev[filterType] === filterValue ? '' : filterValue 
    }));
  };

  // Effect de inicialização (MANTIDO 100%)
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ✅ NOVA FUNCIONALIDADE: Auto-limpeza de feedback messages
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage('');
        setFeedbackType('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // RENDER PRINCIPAL (MANTIDO 100% + MELHORIAS)
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Header (MANTIDO 100%) */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-3xl font-bold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                  Gestão de Leads
                </h1>
                <p className={`mt-1 text-sm ${isDark() ? 'text-gray-300' : 'text-gray-600'}`}>
                  Gere e converta leads em clientes de forma eficiente
                </p>
              </div>
              
              <ThemedButton 
                onClick={() => setShowCreateForm(true)}
                disabled={creating}
                className="flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                {creating ? 'Criando...' : 'Novo Lead'}
              </ThemedButton>
            </div>
          </div>

          {/* Feedback Message (MANTIDO + MELHORADO) */}
          {feedbackMessage && (
            <div className={`mb-6 p-4 rounded-lg border ${
              feedbackType === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center space-x-2">
                {feedbackType === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <XCircleIcon className="h-5 w-5" />
                )}
                <p className="text-sm font-medium">{feedbackMessage}</p>
              </div>
            </div>
          )}

          {/* Small Cards Atualizados - Mornos e Frios (MANTIDOS 100%) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <CompactMetricCard
              title="Total"
              value={stats.total || 0}
              icon={UserGroupIcon}
              color="blue"
              onClick={() => handleMetricClick('status', '')}
            />
            <CompactMetricCard
              title="Novos"
              value={stats.novos || 0}
              icon={PlusIcon}
              color="green"
              onClick={() => handleMetricClick('status', 'novo')}
            />
            {/* ALTERAÇÃO: "Qualificados" → "Mornos" */}
            <CompactMetricCard
              title="Mornos"
              value={stats.qualificados || 0}
              trend="2-4 semanas"
              icon={FireIcon}
              color="orange"
              onClick={() => handleMetricClick('status', 'qualificado')}
            />
            {/* ALTERAÇÃO: "Pendentes" → "Frios" */}
            <CompactMetricCard
              title="Frios"
              value={stats.pendentes || 0}
              trend="Mais de 1 mês"
              icon={CloudIcon}
              color="slate"
              onClick={() => handleMetricClick('status', 'pendente')}
            />
            <CompactMetricCard
              title="Convertidos"
              value={stats.convertidos || 0}
              icon={ArrowRightIcon}
              color="green"
              onClick={() => handleMetricClick('status', 'convertido')}
            />
          </div>

          {/* Barra de Ações com Botões de Visualização (MANTIDA 100%) */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-4">
              <span className={`text-sm font-medium ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                Visualização:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    console.log('Clicou em grid');
                    setViewMode('grid');
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    console.log('Clicou em list');
                    setViewMode('list');
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <input
              type="text"
              placeholder="Pesquisar leads..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[250px]"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Lista de Leads (MANTIDA + CALLBACKS ATUALIZADOS) */}
          <div className="bg-white rounded-lg shadow-sm">
            <LeadsList
              leads={leads}
              loading={loading}
              error={error}
              onLeadConvert={handleLeadConvert}
              onLeadUpdate={handleLeadUpdate} // ✅ CORREÇÃO: callback com atualização instantânea
              onLeadDelete={handleLeadDelete}  // ✅ CORREÇÃO: callback com atualização instantânea
              showActions={true}
              showFilters={true}
              viewMode={viewMode}
              maxHeight="calc(100vh - 500px)"
            />
          </div>

          {/* Modal de Criação (MANTIDO 100%) */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900">Criar Novo Lead</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Preencha os dados do lead para adicionar ao sistema
                  </p>
                </div>
                
                <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
                  <LeadForm
                    onSubmit={handleCreateSubmit}
                    onCancel={handleCreateCancel}
                    submitButtonText="Criar Lead"
                    showPreview={true}
                    compactMode={false}
                    autoFocus={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Modal de Conversão com sincronização (MANTIDO + MELHORADO) */}
          {conversionModal && conversionModal.isOpen && (
            <SimpleConversionModal
              isOpen={conversionModal.isOpen}
              onClose={handleModalClose}
              leadData={conversionModal.leadData}
              onConvert={handleModalConvert}
              isConverting={isModalConverting || converting}
              onDebugLog={handleDebugLog}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadsPage;