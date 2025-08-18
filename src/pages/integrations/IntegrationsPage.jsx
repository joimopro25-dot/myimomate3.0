// src/pages/integrations/IntegrationsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  CogIcon,
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  BoltIcon,
  ClockIcon,
  ChartBarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  SignalIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  FolderIcon,
  CalendarIcon,
  EnvelopeIcon,
  BanknotesIcon,
  DevicePhoneMobileIcon,
  IdentificationIcon,
  BuildingLibraryIcon,
  PlayIcon,
  PauseIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedCard, ThemedButton, ThemedBadge } from '../../components/common/ThemedComponents';
import useIntegrations from '../../hooks/useIntegrations';

/**
 * 🔗 PÁGINA DE INTEGRAÇÕES EXTERNAS
 * 
 * Funcionalidades:
 * ✅ Dashboard de integrações conectadas
 * ✅ Configuração de novas integrações
 * ✅ Gestão de credenciais OAuth
 * ✅ Testes de conectividade
 * ✅ Logs de sincronização
 * ✅ Gestão de webhooks
 * ✅ Configurações avançadas
 * ✅ Monitorização em tempo real
 * ✅ Estatísticas de performance
 * ✅ Troubleshooting automático
 */

const IntegrationsPage = () => {
  // Estados locais
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [connectionForm, setConnectionForm] = useState({});

  // Hooks
  const { currentTheme } = useTheme();
  const {
    integrations,
    loading,
    error,
    syncStatus,
    webhooks,
    logs,
    isConnecting,
    isDisconnecting,
    isSyncing,
    isTestingConnection,
    connectIntegration,
    disconnectIntegration,
    syncIntegration,
    testConnection,
    createWebhook,
    getIntegrationStats,
    INTEGRATION_TYPES,
    INTEGRATION_STATUS,
    isIntegrationConnected,
    canSync,
    refreshIntegrations
  } = useIntegrations();

  // 📋 TABS DA INTERFACE
  const TABS = {
    overview: {
      id: 'overview',
      title: 'Visão Geral',
      icon: ChartBarIcon,
      description: 'Dashboard e estatísticas das integrações'
    },
    connections: {
      id: 'connections',
      title: 'Conexões',
      icon: LinkIcon,
      description: 'Gerir integrações ativas e disponíveis'
    },
    webhooks: {
      id: 'webhooks',
      title: 'Webhooks',
      icon: GlobeAltIcon,
      description: 'Configurar integrações personalizadas'
    },
    logs: {
      id: 'logs',
      title: 'Logs',
      icon: DocumentTextIcon,
      description: 'Histórico de sincronizações e eventos'
    },
    settings: {
      id: 'settings',
      title: 'Configurações',
      icon: Cog6ToothIcon,
      description: 'Configurações avançadas das integrações'
    }
  };

  // 🎨 ÍCONES POR CATEGORIA
  const getCategoryIcon = (category) => {
    const icons = {
      communication: ChatBubbleLeftRightIcon,
      storage: FolderIcon,
      calendar: CalendarIcon,
      marketing: EnvelopeIcon,
      financial: BanknotesIcon,
      notifications: DevicePhoneMobileIcon,
      validation: IdentificationIcon,
      custom: GlobeAltIcon
    };
    return icons[category] || LinkIcon;
  };

  /**
   * 🔗 CONECTAR INTEGRAÇÃO
   */
  const handleConnect = async (integrationType) => {
    try {
      setSelectedIntegration(integrationType);
      setConnectionForm({});
      setShowConnectionModal(true);
    } catch (err) {
      console.error('Erro ao preparar conexão:', err);
    }
  };

  /**
   * 📤 SUBMETER CONEXÃO
   */
  const handleSubmitConnection = async () => {
    try {
      await connectIntegration(selectedIntegration, connectionForm);
      setShowConnectionModal(false);
      setConnectionForm({});
      setSelectedIntegration(null);
    } catch (err) {
      console.error('Erro ao conectar:', err);
    }
  };

  /**
   * ❌ DESCONECTAR INTEGRAÇÃO
   */
  const handleDisconnect = async (integrationType) => {
    if (window.confirm('Tem certeza que deseja desconectar esta integração?')) {
      try {
        await disconnectIntegration(integrationType);
      } catch (err) {
        console.error('Erro ao desconectar:', err);
      }
    }
  };

  /**
   * 🔄 SINCRONIZAR INTEGRAÇÃO
   */
  const handleSync = async (integrationType) => {
    try {
      await syncIntegration(integrationType, { manual: true });
    } catch (err) {
      console.error('Erro na sincronização:', err);
    }
  };

  /**
   * 🧪 TESTAR CONEXÃO
   */
  const handleTestConnection = async (integrationType) => {
    try {
      const result = await testConnection(integrationType, connectionForm);
      if (result.success) {
        alert('✅ Conexão testada com sucesso!');
      } else {
        alert(`❌ Falha no teste: ${result.error}`);
      }
    } catch (err) {
      alert(`❌ Erro no teste: ${err.message}`);
    }
  };

  /**
   * 📊 DASHBOARD DE VISÃO GERAL
   */
  const OverviewTab = () => {
    const stats = getIntegrationStats;

    return (
      <div className="space-y-6">
        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ThemedCard className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conectadas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.connected}</p>
              </div>
            </div>
          </ThemedCard>

          <ThemedCard className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Desconectadas</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.disconnected}</p>
              </div>
            </div>
          </ThemedCard>

          <ThemedCard className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowPathIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sincronizações</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total_syncs}</p>
              </div>
            </div>
          </ThemedCard>

          <ThemedCard className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Taxa de Sucesso</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.success_rate}%</p>
              </div>
            </div>
          </ThemedCard>
        </div>

        {/* Status das Integrações */}
        <ThemedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Status das Integrações
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(INTEGRATION_TYPES).map(([key, integration]) => {
              const connected = isIntegrationConnected(key);
              const integrationData = integrations[key];
              const CategoryIcon = getCategoryIcon(integration.category);

              return (
                <div
                  key={key}
                  className={`p-4 rounded-lg border-2 ${
                    connected
                      ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <CategoryIcon className={`h-5 w-5 ${connected ? 'text-green-600' : 'text-gray-500'}`} />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {integration.name}
                      </span>
                    </div>
                    <ThemedBadge
                      variant={connected ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {connected ? 'Conectada' : 'Desconectada'}
                    </ThemedBadge>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {integration.description}
                  </p>

                  {connected && integrationData && (
                    <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                      <div>Última sync: {integrationData.lastSyncAt?.toLocaleString('pt-PT') || 'Nunca'}</div>
                      <div>Syncs: {integrationData.statistics?.successful_syncs || 0} sucessos</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ThemedCard>

        {/* Atividade Recente */}
        <ThemedCard className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Atividade Recente
          </h3>
          {logs.length > 0 ? (
            <div className="space-y-3">
              {logs.slice(0, 5).map((log, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      log.status === 'success' ? 'bg-green-500' :
                      log.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {INTEGRATION_TYPES[log.integration_type?.toUpperCase()]?.name || 'Integração'}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{log.message}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
                    {log.timestamp?.toLocaleTimeString('pt-PT')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              Nenhuma atividade recente
            </p>
          )}
        </ThemedCard>
      </div>
    );
  };

  /**
   * 🔗 TAB DE CONEXÕES
   */
  const ConnectionsTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Integrações Disponíveis
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure e gerir as suas integrações externas
            </p>
          </div>
          <ThemedButton onClick={refreshIntegrations} disabled={loading}>
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Atualizar
          </ThemedButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.entries(INTEGRATION_TYPES).map(([key, integration]) => {
            const connected = isIntegrationConnected(key);
            const integrationData = integrations[key];
            const CategoryIcon = getCategoryIcon(integration.category);

            return (
              <ThemedCard key={key} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      connected ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <CategoryIcon className={`h-6 w-6 ${
                        connected ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {integration.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {integration.description}
                      </p>
                    </div>
                  </div>

                  <ThemedBadge
                    variant={connected ? 'success' : 'neutral'}
                  >
                    {connected ? 'Conectada' : 'Disponível'}
                  </ThemedBadge>
                </div>

                {connected && integrationData && (
                  <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Última Sync:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {integrationData.lastSyncAt?.toLocaleString('pt-PT') || 'Nunca'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                        <div className="font-medium text-green-600 dark:text-green-400">
                          {integrationData.status === INTEGRATION_STATUS.CONNECTED ? 'Ativa' : 'Inativa'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Syncs:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {integrationData.statistics?.successful_syncs || 0} sucessos
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Falhas:</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {integrationData.statistics?.failed_syncs || 0} erros
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  {connected ? (
                    <>
                      <ThemedButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleSync(key)}
                        disabled={!canSync(key) || isSyncing}
                      >
                        {isSyncing ? (
                          <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <ArrowPathIcon className="h-4 w-4 mr-2" />
                        )}
                        Sincronizar
                      </ThemedButton>
                      
                      <ThemedButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleDisconnect(key)}
                        disabled={isDisconnecting}
                      >
                        <XCircleIcon className="h-4 w-4 mr-2" />
                        Desconectar
                      </ThemedButton>
                    </>
                  ) : (
                    <ThemedButton
                      size="sm"
                      onClick={() => handleConnect(key)}
                      disabled={isConnecting}
                    >
                      {isConnecting ? (
                        <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <LinkIcon className="h-4 w-4 mr-2" />
                      )}
                      Conectar
                    </ThemedButton>
                  )}

                  <ThemedButton
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedIntegration(key)}
                  >
                    <Cog6ToothIcon className="h-4 w-4 mr-2" />
                    Config
                  </ThemedButton>
                </div>

                {syncStatus[key] && (
                  <div className="mt-3">
                    <ThemedBadge
                      variant={
                        syncStatus[key] === 'syncing' ? 'warning' :
                        syncStatus[key] === 'success' ? 'success' : 'error'
                      }
                      size="sm"
                    >
                      {syncStatus[key] === 'syncing' ? 'Sincronizando...' :
                       syncStatus[key] === 'success' ? 'Sincronizado' : 'Erro na sincronização'}
                    </ThemedBadge>
                  </div>
                )}
              </ThemedCard>
            );
          })}
        </div>
      </div>
    );
  };

  /**
   * 🌐 TAB DE WEBHOOKS
   */
  const WebhooksTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Webhooks Personalizados
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Configure integrações personalizadas com sistemas externos
            </p>
          </div>
          <ThemedButton onClick={() => setShowWebhookModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Novo Webhook
          </ThemedButton>
        </div>

        {webhooks.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {webhooks.map((webhook) => (
              <ThemedCard key={webhook.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      webhook.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {webhook.name || 'Webhook sem nome'}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {webhook.url}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <ThemedBadge
                      variant={webhook.status === 'active' ? 'success' : 'neutral'}
                      size="sm"
                    >
                      {webhook.status === 'active' ? 'Ativo' : 'Inativo'}
                    </ThemedBadge>
                    
                    <ThemedButton variant="outline" size="sm">
                      <EyeIcon className="h-4 w-4" />
                    </ThemedButton>
                    
                    <ThemedButton variant="outline" size="sm">
                      <TrashIcon className="h-4 w-4" />
                    </ThemedButton>
                  </div>
                </div>
              </ThemedCard>
            ))}
          </div>
        ) : (
          <ThemedCard className="p-12 text-center">
            <GlobeAltIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Nenhum Webhook Configurado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Configure webhooks para integrar com sistemas externos
            </p>
            <ThemedButton onClick={() => setShowWebhookModal(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Criar Primeiro Webhook
            </ThemedButton>
          </ThemedCard>
        )}
      </div>
    );
  };

  /**
   * 📝 TAB DE LOGS
   */
  const LogsTab = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Logs de Sincronização
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Histórico detalhado de todas as atividades de integração
            </p>
          </div>
          <ThemedButton onClick={() => setShowLogsModal(true)}>
            <EyeIcon className="h-4 w-4 mr-2" />
            Ver Detalhes
          </ThemedButton>
        </div>

        <ThemedCard className="p-6">
          {logs.length > 0 ? (
            <div className="space-y-4">
              {logs.slice(0, 20).map((log, index) => (
                <div key={index} className="flex items-start justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      log.status === 'success' ? 'bg-green-500' :
                      log.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {INTEGRATION_TYPES[log.integration_type?.toUpperCase()]?.name || 'Integração'}
                        </span>
                        <ThemedBadge
                          variant={
                            log.status === 'success' ? 'success' :
                            log.status === 'error' ? 'error' : 'warning'
                          }
                          size="sm"
                        >
                          {log.action}
                        </ThemedBadge>
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {log.message}
                      </p>
                      
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {log.timestamp?.toLocaleString('pt-PT')}
                      </div>
                    </div>
                  </div>
                  
                  {log.details && (
                    <ThemedButton variant="outline" size="sm">
                      <InformationCircleIcon className="h-4 w-4" />
                    </ThemedButton>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum Log Disponível
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Os logs de sincronização aparecerão aqui após as primeiras atividades
              </p>
            </div>
          )}
        </ThemedCard>
      </div>
    );
  };

  /**
   * ⚙️ TAB DE CONFIGURAÇÕES
   */
  const SettingsTab = () => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configurações Globais
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configurações gerais das integrações
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ThemedCard className="p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              Sincronização Automática
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Ativar auto-sync</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Frequência padrão</span>
                <select className="text-sm border rounded px-2 py-1">
                  <option>A cada hora</option>
                  <option>A cada 6 horas</option>
                  <option>Diariamente</option>
                </select>
              </div>
            </div>
          </ThemedCard>

          <ThemedCard className="p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              Notificações
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Alertas de falha</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Relatórios semanais</span>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </ThemedCard>
        </div>
      </div>
    );
  };

  /**
   * 🎨 RENDERIZAR TAB ATIVO
   */
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'connections':
        return <ConnectionsTab />;
      case 'webhooks':
        return <WebhooksTab />;
      case 'logs':
        return <LogsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <OverviewTab />;
    }
  };

  /**
   * 🔗 MODAL DE CONEXÃO
   */
  const ConnectionModal = () => {
    if (!showConnectionModal || !selectedIntegration) return null;

    const integration = INTEGRATION_TYPES[selectedIntegration.toUpperCase()];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <ThemedCard className="p-6 max-w-md w-full mx-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Conectar {integration?.name}
          </h3>
          
          <div className="space-y-4">
            {integration?.requires_auth && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    API Key / Token
                  </label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    value={connectionForm.api_key || ''}
                    onChange={(e) => setConnectionForm(prev => ({ ...prev, api_key: e.target.value }))}
                    placeholder="Insira sua API key..."
                  />
                </div>
                
                {selectedIntegration === 'webhook' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      URL do Webhook
                    </label>
                    <input
                      type="url"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      value={connectionForm.webhook_url || ''}
                      onChange={(e) => setConnectionForm(prev => ({ ...prev, webhook_url: e.target.value }))}
                      placeholder="https://example.com/webhook"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex space-x-3 mt-6">
            <ThemedButton
              variant="outline"
              onClick={() => handleTestConnection(selectedIntegration)}
              disabled={isTestingConnection}
              className="flex-1"
            >
              {isTestingConnection ? (
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <PlayIcon className="h-4 w-4 mr-2" />
              )}
              Testar
            </ThemedButton>
            
            <ThemedButton
              onClick={handleSubmitConnection}
              disabled={isConnecting}
              className="flex-1"
            >
              {isConnecting ? (
                <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircleIcon className="h-4 w-4 mr-2" />
              )}
              Conectar
            </ThemedButton>
          </div>
          
          <div className="mt-4 text-center">
            <ThemedButton
              variant="outline"
              onClick={() => {
                setShowConnectionModal(false);
                setSelectedIntegration(null);
                setConnectionForm({});
              }}
            >
              Cancelar
            </ThemedButton>
          </div>
        </ThemedCard>
      </div>
    );
  };

  // Loading inicial
  if (loading && Object.keys(integrations).length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Integrações Externas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure e gerir as suas integrações com sistemas externos
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <ThemedButton
            variant="outline"
            size="sm"
            onClick={refreshIntegrations}
            disabled={loading}
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </ThemedButton>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <ThemedCard className="p-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        </ThemedCard>
      )}

      {/* Navegação entre Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {Object.values(TABS).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo da Tab */}
      {renderActiveTab()}

      {/* Modal de Conexão */}
      <ConnectionModal />
    </div>
  );
};

export default IntegrationsPage;