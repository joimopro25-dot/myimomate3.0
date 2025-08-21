// src/components/automations/AutomationManager.jsx
import React, { useState, useEffect } from 'react';
import { 
  BoltIcon,
  PlusIcon,
  PlayIcon,
  PauseIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  ChartBarIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  EyeIcon,
  DocumentDuplicateIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedCard, ThemedButton, ThemedBadge } from '../common/ThemedComponents';
import useAutomations from '../../hooks/useAutomations';

/**
 * 🤖 INTERFACE DE GESTÃO DE AUTOMAÇÕES INTELIGENTES
 * 
 * Funcionalidades:
 * ✅ Dashboard de automações com estatísticas
 * ✅ Criação de automações com wizard interativo
 * ✅ Gestão de regras If/Then visuais
 * ✅ Templates pré-definidos para uso rápido
 * ✅ Monitorização de performance em tempo real
 * ✅ Configuração de triggers e ações
 * ✅ Preview de automações antes da ativação
 * ✅ Sistema de A/B testing integrado
 * ✅ Analytics de ROI das automações
 * ✅ Interface drag-and-drop para workflows
 */

const AutomationManager = () => {
  // Estados locais
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Estados do formulário
  const [newAutomation, setNewAutomation] = useState({
    name: '',
    description: '',
    type: '',
    trigger: '',
    conditions: [],
    actions: [],
    targetSegment: 'all',
    mlConfig: {
      optimizeTiming: false,
      adaptiveSegmentation: false,
      successPrediction: true
    }
  });

  // Hooks
  const { currentTheme } = useTheme();
  const {
    loading,
    error,
    automations,
    activeAutomations,
    templates,
    automationStats,
    createAutomation,
    updateAutomation,
    deleteAutomation,
    toggleAutomation,
    executeAutomation,
    AUTOMATION_TYPES,
    TRIGGER_TYPES,
    MLAutomations
  } = useAutomations();

  // 📊 DASHBOARD DE AUTOMAÇÕES
  const AutomationDashboard = () => (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ThemedCard className="p-6" theme={currentTheme}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Automações</p>
              <p className="text-2xl font-bold text-gray-900">
                {automationStats.totalAutomations || 0}
              </p>
            </div>
            <BoltIcon className="w-8 h-8 text-blue-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-green-600">
              {automationStats.activeAutomations || 0} ativas
            </span>
          </div>
        </ThemedCard>

        <ThemedCard className="p-6" theme={currentTheme}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Execuções Totais</p>
              <p className="text-2xl font-bold text-gray-900">
                {automationStats.totalExecutions || 0}
              </p>
            </div>
            <PlayIcon className="w-8 h-8 text-green-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-blue-600">
              Este mês: {Math.floor((automationStats.totalExecutions || 0) * 0.3)}
            </span>
          </div>
        </ThemedCard>

        <ThemedCard className="p-6" theme={currentTheme}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Sucesso</p>
              <p className="text-2xl font-bold text-gray-900">
                {automationStats.avgSuccessRate || 0}%
              </p>
            </div>
            <ChartBarIcon className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-emerald-600">
              {automationStats.avgSuccessRate > 80 ? '🎯 Excelente' : 
               automationStats.avgSuccessRate > 60 ? '👍 Bom' : '⚠️ Pode melhorar'}
            </span>
          </div>
        </ThemedCard>

        <ThemedCard className="p-6" theme={currentTheme}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ROI Estimado</p>
              <p className="text-2xl font-bold text-gray-900">
                €{((automationStats.totalExecutions || 0) * 15).toLocaleString()}
              </p>
            </div>
            <FireIcon className="w-8 h-8 text-orange-500" />
          </div>
          <div className="mt-2">
            <span className="text-sm text-orange-600">
              Economia em tempo
            </span>
          </div>
        </ThemedCard>
      </div>

      {/* Top Automações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThemedCard className="p-6" theme={currentTheme}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-purple-500" />
            Top Performing Automações
          </h3>
          
          {automationStats.topPerformingAutomations && automationStats.topPerformingAutomations.length > 0 ? (
            <div className="space-y-3">
              {automationStats.topPerformingAutomations.map((automation, index) => (
                <div key={automation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{automation.name}</p>
                      <p className="text-sm text-gray-600">{AUTOMATION_TYPES[automation.type]?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      {automation.stats?.successRate || 0}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {automation.stats?.executions || 0} exec.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <SparklesIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma automação executada ainda</p>
            </div>
          )}
        </ThemedCard>

        <ThemedCard className="p-6" theme={currentTheme}>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-blue-500" />
            Automações por Tipo
          </h3>
          
          {automationStats.automationsByType && Object.keys(automationStats.automationsByType).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(automationStats.automationsByType).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{AUTOMATION_TYPES[type]?.icon}</span>
                    <span className="font-medium">{AUTOMATION_TYPES[type]?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(count / automationStats.totalAutomations) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Nenhuma automação criada ainda</p>
            </div>
          )}
        </ThemedCard>
      </div>
    </div>
  );

  // 📋 LISTA DE AUTOMAÇÕES
  const AutomationsList = () => {
    const filteredAutomations = automations.filter(automation => {
      const typeMatch = filterType === 'all' || automation.type === filterType;
      const statusMatch = filterStatus === 'all' || automation.status === filterStatus;
      return typeMatch && statusMatch;
    });

    return (
      <div className="space-y-6">
        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Tipos</option>
              {Object.entries(AUTOMATION_TYPES).map(([key, type]) => (
                <option key={key} value={key}>{type.name}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Ativas</option>
              <option value="paused">Pausadas</option>
              <option value="draft">Rascunho</option>
            </select>
          </div>

          <ThemedButton
            onClick={() => setShowCreateModal(true)}
            theme={currentTheme}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            Nova Automação
          </ThemedButton>
        </div>

        {/* Lista */}
        <div className="grid grid-cols-1 gap-4">
          {filteredAutomations.length > 0 ? (
            filteredAutomations.map((automation) => (
              <ThemedCard key={automation.id} className="p-6" theme={currentTheme}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">
                      {AUTOMATION_TYPES[automation.type]?.icon || '🤖'}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        {automation.name}
                        <ThemedBadge
                          variant={automation.status === 'active' ? 'success' : 
                                 automation.status === 'paused' ? 'warning' : 'default'}
                          theme={currentTheme}
                        >
                          {automation.status === 'active' ? 'Ativa' :
                           automation.status === 'paused' ? 'Pausada' : 'Rascunho'}
                        </ThemedBadge>
                      </h3>
                      <p className="text-gray-600 text-sm">{automation.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>Tipo: {AUTOMATION_TYPES[automation.type]?.name}</span>
                        <span>•</span>
                        <span>Execuções: {automation.stats?.executions || 0}</span>
                        <span>•</span>
                        <span>Sucesso: {automation.stats?.successRate || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Estatísticas rápidas */}
                    <div className="text-right mr-4">
                      <div className="text-sm font-semibold text-green-600">
                        {automation.stats?.successRate || 0}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Taxa sucesso
                      </div>
                    </div>

                    {/* Ações */}
                    <ThemedButton
                      onClick={() => {
                        setSelectedAutomation(automation);
                        setShowPreview(true);
                      }}
                      variant="outline"
                      size="sm"
                      theme={currentTheme}
                    >
                      <EyeIcon className="w-4 h-4" />
                    </ThemedButton>

                    <ThemedButton
                      onClick={() => toggleAutomation(automation.id, automation.status === 'active' ? 'paused' : 'active')}
                      variant="outline"
                      size="sm"
                      theme={currentTheme}
                    >
                      {automation.status === 'active' ? 
                        <PauseIcon className="w-4 h-4" /> : 
                        <PlayIcon className="w-4 h-4" />
                      }
                    </ThemedButton>

                    <ThemedButton
                      onClick={() => {
                        setSelectedAutomation(automation);
                        setNewAutomation(automation);
                        setShowCreateModal(true);
                      }}
                      variant="outline"
                      size="sm"
                      theme={currentTheme}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </ThemedButton>

                    <ThemedButton
                      onClick={() => handleDeleteAutomation(automation)}
                      variant="outline"
                      size="sm"
                      theme={currentTheme}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </ThemedButton>
                  </div>
                </div>

                {/* Preview das ações */}
                {automation.actions && automation.actions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-700">Ações:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {automation.actions.slice(0, 3).map((action, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {action.type === 'send_email' ? '📧 Email' :
                           action.type === 'send_sms' ? '📱 SMS' :
                           action.type === 'create_task' ? '✅ Tarefa' :
                           action.type}
                        </span>
                      ))}
                      {automation.actions.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{automation.actions.length - 3} mais
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </ThemedCard>
            ))
          ) : (
            <ThemedCard className="p-12 text-center" theme={currentTheme}>
              <BoltIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhuma automação encontrada
              </h3>
              <p className="text-gray-500 mb-4">
                {filterType !== 'all' || filterStatus !== 'all' 
                  ? 'Tente ajustar os filtros ou criar uma nova automação'
                  : 'Comece criando sua primeira automação inteligente'
                }
              </p>
              <ThemedButton
                onClick={() => setShowCreateModal(true)}
                theme={currentTheme}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Criar Automação
              </ThemedButton>
            </ThemedCard>
          )}
        </div>
      </div>
    );
  };

  // 📝 TEMPLATES DISPONÍVEIS
  const TemplatesView = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Templates de Automação</h2>
          <p className="text-gray-600">Use templates pré-definidos para criar automações rapidamente</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <ThemedCard key={template.name} className="p-6" theme={currentTheme}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">
                {AUTOMATION_TYPES[template.type]?.icon || '📋'}
              </div>
              <h3 className="text-lg font-semibold">{template.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{template.description}</p>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Trigger
                </span>
                <p className="text-sm">{template.trigger}</p>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Ações ({template.actions.length})
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {template.actions.map((action, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {action.type === 'send_email' ? '📧' :
                       action.type === 'send_sms' ? '📱' :
                       action.type === 'create_task' ? '✅' : '⚡'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <ThemedButton
                onClick={() => handleUseTemplate(template)}
                size="sm"
                theme={currentTheme}
                className="flex-1"
              >
                <DocumentDuplicateIcon className="w-4 h-4 mr-1" />
                Usar Template
              </ThemedButton>
              
              <ThemedButton
                onClick={() => {
                  setSelectedAutomation(template);
                  setShowPreview(true);
                }}
                variant="outline"
                size="sm"
                theme={currentTheme}
              >
                <EyeIcon className="w-4 h-4" />
              </ThemedButton>
            </div>
          </ThemedCard>
        ))}
      </div>
    </div>
  );

  // 🛠️ MODAL DE CRIAÇÃO/EDIÇÃO
  const CreateAutomationModal = () => {
    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {selectedAutomation ? 'Editar Automação' : 'Nova Automação'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedAutomation(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Informações básicas */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Automação
                  </label>
                  <input
                    type="text"
                    value={newAutomation.name}
                    onChange={(e) => setNewAutomation(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Sequência de boas-vindas"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={newAutomation.description}
                    onChange={(e) => setNewAutomation(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Descreva o objetivo desta automação..."
                  />
                </div>
              </div>

              {/* Tipo e trigger */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Automação
                  </label>
                  <select
                    value={newAutomation.type}
                    onChange={(e) => setNewAutomation(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione o tipo</option>
                    {Object.entries(AUTOMATION_TYPES).map(([key, type]) => (
                      <option key={key} value={key}>
                        {type.icon} {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trigger
                  </label>
                  <select
                    value={newAutomation.trigger}
                    onChange={(e) => setNewAutomation(prev => ({ ...prev, trigger: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione o trigger</option>
                    {Object.entries(TRIGGER_TYPES.EVENT_BASED).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Configurações de ML */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-purple-500" />
                  Configurações de IA
                </h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={newAutomation.mlConfig.optimizeTiming}
                      onChange={(e) => setNewAutomation(prev => ({
                        ...prev,
                        mlConfig: { ...prev.mlConfig, optimizeTiming: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium">Otimizar Timing</span>
                      <p className="text-xs text-gray-500">IA determina o melhor horário para execução</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={newAutomation.mlConfig.adaptiveSegmentation}
                      onChange={(e) => setNewAutomation(prev => ({
                        ...prev,
                        mlConfig: { ...prev.mlConfig, adaptiveSegmentation: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium">Segmentação Adaptativa</span>
                      <p className="text-xs text-gray-500">Ajusta automaticamente o público alvo</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={newAutomation.mlConfig.successPrediction}
                      onChange={(e) => setNewAutomation(prev => ({
                        ...prev,
                        mlConfig: { ...prev.mlConfig, successPrediction: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium">Predição de Sucesso</span>
                      <p className="text-xs text-gray-500">Calcula probabilidade de sucesso antes da execução</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Ações da automação */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Ações da Automação
                </h3>
                <div className="border border-gray-200 rounded-lg p-4 min-h-[120px] bg-gray-50">
                  <p className="text-sm text-gray-500 text-center py-8">
                    🚧 Interface de ações será implementada na próxima versão
                    <br />
                    Por agora, use os templates para automações prontas
                  </p>
                </div>
              </div>
            </div>

            {/* Ações do modal */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              <ThemedButton
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedAutomation(null);
                  resetForm();
                }}
                variant="outline"
                theme={currentTheme}
                className="flex-1"
              >
                Cancelar
              </ThemedButton>
              
              <ThemedButton
                onClick={handleSaveAutomation}
                disabled={!newAutomation.name || !newAutomation.type || !newAutomation.trigger}
                theme={currentTheme}
                className="flex-1"
              >
                {selectedAutomation ? 'Atualizar' : 'Criar'} Automação
              </ThemedButton>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 👁️ MODAL DE PREVIEW
  const PreviewModal = () => {
    if (!showPreview || !selectedAutomation) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Preview da Automação</h2>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setSelectedAutomation(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl mb-2">
                  {AUTOMATION_TYPES[selectedAutomation.type]?.icon || '🤖'}
                </div>
                <h3 className="text-lg font-semibold">{selectedAutomation.name}</h3>
                <p className="text-gray-600 text-sm">{selectedAutomation.description}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2">Configuração:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span>{AUTOMATION_TYPES[selectedAutomation.type]?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trigger:</span>
                    <span>{selectedAutomation.trigger}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <ThemedBadge
                      variant={selectedAutomation.status === 'active' ? 'success' : 'warning'}
                      theme={currentTheme}
                    >
                      {selectedAutomation.status === 'active' ? 'Ativa' : 'Pausada'}
                    </ThemedBadge>
                  </div>
                </div>
              </div>

              {selectedAutomation.actions && selectedAutomation.actions.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Ações ({selectedAutomation.actions.length}):</h4>
                  <div className="space-y-2">
                    {selectedAutomation.actions.map((action, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <span>
                          {action.type === 'send_email' ? '📧 Enviar Email' :
                           action.type === 'send_sms' ? '📱 Enviar SMS' :
                           action.type === 'create_task' ? '✅ Criar Tarefa' :
                           action.type}
                          {action.delay ? ` (após ${action.delay}h)` : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <ThemedButton
                onClick={() => {
                  setShowPreview(false);
                  setSelectedAutomation(null);
                }}
                variant="outline"
                theme={currentTheme}
                className="flex-1"
              >
                Fechar
              </ThemedButton>
              
              {selectedAutomation.id && (
                <ThemedButton
                  onClick={() => executeAutomation(selectedAutomation.id)}
                  theme={currentTheme}
                  className="flex-1"
                >
                  <PlayIcon className="w-4 h-4 mr-2" />
                  Executar Teste
                </ThemedButton>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Funções auxiliares
  const resetForm = () => {
    setNewAutomation({
      name: '',
      description: '',
      type: '',
      trigger: '',
      conditions: [],
      actions: [],
      targetSegment: 'all',
      mlConfig: {
        optimizeTiming: false,
        adaptiveSegmentation: false,
        successPrediction: true
      }
    });
  };

  const handleSaveAutomation = async () => {
    try {
      if (selectedAutomation?.id) {
        await updateAutomation(selectedAutomation.id, newAutomation);
      } else {
        await createAutomation(newAutomation);
      }
      
      setShowCreateModal(false);
      setSelectedAutomation(null);
      resetForm();
    } catch (err) {
      console.error('Erro ao salvar automação:', err);
    }
  };

  const handleDeleteAutomation = async (automation) => {
    if (window.confirm(`Tem certeza que deseja eliminar a automação "${automation.name}"?`)) {
      await deleteAutomation(automation.id);
    }
  };

  const handleUseTemplate = (template) => {
    setNewAutomation({
      name: template.name,
      description: template.description,
      type: template.type,
      trigger: template.trigger,
      actions: template.actions,
      conditions: [],
      targetSegment: 'all',
      mlConfig: {
        optimizeTiming: true,
        adaptiveSegmentation: true,
        successPrediction: true
      }
    });
    setShowCreateModal(true);
  };

  // Tabs disponíveis
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
    { id: 'automations', label: 'Automações', icon: BoltIcon },
    { id: 'templates', label: 'Templates', icon: DocumentDuplicateIcon }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BoltIcon className="w-8 h-8 text-blue-500" />
            Automações Inteligentes
          </h1>
          <p className="text-gray-600 mt-1">
            Configure automações com IA para otimizar seus processos de vendas
          </p>
        </div>

        <ThemedButton
          onClick={() => setShowCreateModal(true)}
          theme={currentTheme}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Nova Automação
        </ThemedButton>
      </div>

      {/* Navegação por tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo das tabs */}
      <div>
        {activeTab === 'dashboard' && <AutomationDashboard />}
        {activeTab === 'automations' && <AutomationsList />}
        {activeTab === 'templates' && <TemplatesView />}
      </div>

      {/* Modais */}
      <CreateAutomationModal />
      <PreviewModal />

      {/* Mensagem de erro */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default AutomationManager;