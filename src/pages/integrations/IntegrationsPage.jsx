// src/pages/integrations/IntegrationsPage.jsx - COM SIDEBAR REUTILIZÁVEL
// ✅ Aplicando Sidebar.jsx componente reutilizável
// ✅ Sistema completo de integrações externas
// ✅ Interface profissional com gestão de conexões

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar'; // 🔥 NOVO IMPORT
import { ThemedCard, ThemedButton, ThemedBadge } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  LinkIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  CogIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  FolderIcon,
  CalendarIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  CloudIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

// Componente de Métrica Compacta
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

// Status de integração
const INTEGRATION_STATUS = {
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error',
  SYNCING: 'syncing'
};

const IntegrationsPage = () => {
  // Estados locais
  const [activeTab, setActiveTab] = useState('overview');
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');

  // Hooks
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();

  // Dados simulados de integrações
  const integrations = [
    {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Integração com WhatsApp Business API para mensagens automáticas',
      icon: ChatBubbleLeftRightIcon,
      status: INTEGRATION_STATUS.CONNECTED,
      lastSync: '2025-08-22T10:30:00Z',
      category: 'communication',
      features: ['Mensagens automáticas', 'Templates', 'Webhooks'],
      connected: true
    },
    {
      id: 'google_drive',
      name: 'Google Drive',
      description: 'Sincronização automática de documentos e contratos',
      icon: FolderIcon,
      status: INTEGRATION_STATUS.CONNECTED,
      lastSync: '2025-08-22T09:15:00Z',
      category: 'storage',
      features: ['Upload automático', 'Organização por cliente', 'Backup'],
      connected: true
    },
    {
      id: 'google_calendar',
      name: 'Google Calendar',
      description: 'Sincronização bidirecional de eventos e compromissos',
      icon: CalendarIcon,
      status: INTEGRATION_STATUS.SYNCING,
      lastSync: '2025-08-22T11:00:00Z',
      category: 'calendar',
      features: ['Sync bidirecional', 'Notificações', 'Múltiplos calendários'],
      connected: true
    },
    {
      id: 'email_marketing',
      name: 'Email Marketing',
      description: 'Integração com plataformas de email marketing',
      icon: EnvelopeIcon,
      status: INTEGRATION_STATUS.DISCONNECTED,
      lastSync: null,
      category: 'marketing',
      features: ['Campanhas automáticas', 'Segmentação', 'Analytics'],
      connected: false
    },
    {
      id: 'zapier',
      name: 'Zapier',
      description: 'Conecte com +5000 aplicações através do Zapier',
      icon: LinkIcon,
      status: INTEGRATION_STATUS.DISCONNECTED,
      lastSync: null,
      category: 'automation',
      features: ['5000+ apps', 'Automações', 'Triggers personalizados'],
      connected: false
    },
    {
      id: 'sms_gateway',
      name: 'SMS Gateway',
      description: 'Envio de SMS automáticos para clientes e leads',
      icon: DevicePhoneMobileIcon,
      status: INTEGRATION_STATUS.ERROR,
      lastSync: '2025-08-21T16:45:00Z',
      category: 'communication',
      features: ['SMS automáticos', 'Templates', 'Relatórios'],
      connected: true,
      error: 'Erro de autenticação - credenciais inválidas'
    }
  ];

  // Estatísticas
  const stats = {
    total: integrations.length,
    connected: integrations.filter(i => i.connected).length,
    active: integrations.filter(i => i.status === INTEGRATION_STATUS.CONNECTED).length,
    errors: integrations.filter(i => i.status === INTEGRATION_STATUS.ERROR).length
  };

  // 🔧 HANDLERS
  const handleConnect = (integration) => {
    setSelectedIntegration(integration);
    setShowConnectionModal(true);
  };

  const handleDisconnect = (integrationId) => {
    if (window.confirm('Deseja desconectar esta integração?')) {
      setLoading(true);
      // Simular desconexão
      setTimeout(() => {
        setLoading(false);
        setFeedbackMessage('Integração desconectada com sucesso!');
        setFeedbackType('success');
        setTimeout(() => setFeedbackMessage(''), 3000);
      }, 1500);
    }
  };

  const handleSync = (integrationId) => {
    setLoading(true);
    // Simular sincronização
    setTimeout(() => {
      setLoading(false);
      setFeedbackMessage('Sincronização concluída com sucesso!');
      setFeedbackType('success');
      setTimeout(() => setFeedbackMessage(''), 3000);
    }, 2000);
  };

  const handleTestConnection = (integrationId) => {
    setLoading(true);
    // Simular teste de conexão
    setTimeout(() => {
      setLoading(false);
      setFeedbackMessage('Conexão testada com sucesso!');
      setFeedbackType('success');
      setTimeout(() => setFeedbackMessage(''), 3000);
    }, 1000);
  };

  // Renderizar status badge
  const renderStatusBadge = (status) => {
    const statusConfig = {
      [INTEGRATION_STATUS.CONNECTED]: { color: 'green', text: 'Conectado' },
      [INTEGRATION_STATUS.DISCONNECTED]: { color: 'gray', text: 'Desconectado' },
      [INTEGRATION_STATUS.ERROR]: { color: 'red', text: 'Erro' },
      [INTEGRATION_STATUS.SYNCING]: { color: 'blue', text: 'Sincronizando' }
    };

    const config = statusConfig[status];
    return (
      <ThemedBadge color={config.color} className="text-xs">
        {config.text}
      </ThemedBadge>
    );
  };

  // Renderizar ícone de status
  const renderStatusIcon = (status) => {
    switch (status) {
      case INTEGRATION_STATUS.CONNECTED:
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case INTEGRATION_STATUS.ERROR:
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case INTEGRATION_STATUS.SYNCING:
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <XCircleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  // Tabs de navegação
  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: GlobeAltIcon },
    { id: 'communication', label: 'Comunicação', icon: ChatBubbleLeftRightIcon },
    { id: 'storage', label: 'Armazenamento', icon: FolderIcon },
    { id: 'automation', label: 'Automação', icon: CogIcon }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 🎨 SIDEBAR REUTILIZÁVEL */}
      <Sidebar />

      {/* 📱 CONTEÚDO PRINCIPAL */}
      <div className="flex-1">
        <div className="p-6">
          {/* 📊 HEADER */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Integrações</h1>
              <p className="text-gray-600">Conecte o MyImoMate com suas ferramentas favoritas</p>
            </div>

            <div className="flex space-x-3">
              <ThemedButton
                onClick={() => handleSync('all')}
                variant="outline"
                className="flex items-center"
                disabled={loading}
              >
                <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Sincronizar Todas
              </ThemedButton>
              
              <ThemedButton
                onClick={() => setShowConnectionModal(true)}
                className="flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nova Integração
              </ThemedButton>
            </div>
          </div>

          {/* FEEDBACK MESSAGES */}
          {feedbackMessage && (
            <div className={`p-4 rounded-lg mb-6 ${
              feedbackType === 'success' 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {feedbackMessage}
            </div>
          )}

          {/* 📊 MÉTRICAS COMPACTAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <CompactMetricCard
              title="Total de Integrações"
              value={stats.total}
              trend="Disponíveis"
              icon={LinkIcon}
              color="blue"
              onClick={() => setActiveTab('overview')}
            />
            
            <CompactMetricCard
              title="Conectadas"
              value={stats.connected}
              trend="Ativas"
              icon={CheckCircleIcon}
              color="green"
              onClick={() => setActiveTab('overview')}
            />
            
            <CompactMetricCard
              title="Funcionando"
              value={stats.active}
              trend="Sem erros"
              icon={ShieldCheckIcon}
              color="purple"
              onClick={() => setActiveTab('overview')}
            />
            
            <CompactMetricCard
              title="Com Erros"
              value={stats.errors}
              trend="Requer atenção"
              icon={ExclamationTriangleIcon}
              color="red"
              onClick={() => setActiveTab('overview')}
            />
          </div>

          {/* 🏷️ TABS DE NAVEGAÇÃO */}
          <ThemedCard className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 p-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </ThemedCard>

          {/* 📊 CONTEÚDO DAS TABS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {integrations
              .filter(integration => 
                activeTab === 'overview' || integration.category === activeTab
              )
              .map((integration) => {
                const Icon = integration.icon;
                
                return (
                  <ThemedCard key={integration.id}>
                    <div className="p-6">
                      {/* Header da integração */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <Icon className="h-6 w-6 text-gray-700" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{integration.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              {renderStatusIcon(integration.status)}
                              {renderStatusBadge(integration.status)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Descrição */}
                      <p className="text-sm text-gray-600 mb-4">
                        {integration.description}
                      </p>

                      {/* Features */}
                      <div className="mb-4">
                        <h4 className="text-xs font-medium text-gray-700 mb-2">Funcionalidades:</h4>
                        <div className="flex flex-wrap gap-1">
                          {integration.features.map((feature, index) => (
                            <span
                              key={index}
                              className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Última sincronização */}
                      {integration.lastSync && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500">
                            Última sync: {new Date(integration.lastSync).toLocaleString('pt-PT')}
                          </p>
                        </div>
                      )}

                      {/* Erro */}
                      {integration.error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-700">{integration.error}</p>
                        </div>
                      )}

                      {/* Ações */}
                      <div className="flex space-x-2">
                        {integration.connected ? (
                          <>
                            <ThemedButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleSync(integration.id)}
                              disabled={loading}
                            >
                              <ArrowPathIcon className="h-4 w-4 mr-1" />
                              Sync
                            </ThemedButton>
                            
                            <ThemedButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleTestConnection(integration.id)}
                              disabled={loading}
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              Testar
                            </ThemedButton>
                            
                            <ThemedButton
                              size="sm"
                              variant="outline"
                              onClick={() => handleDisconnect(integration.id)}
                              disabled={loading}
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Desconectar
                            </ThemedButton>
                          </>
                        ) : (
                          <ThemedButton
                            size="sm"
                            onClick={() => handleConnect(integration)}
                            disabled={loading}
                            className="w-full"
                          >
                            <LinkIcon className="h-4 w-4 mr-1" />
                            Conectar
                          </ThemedButton>
                        )}
                      </div>
                    </div>
                  </ThemedCard>
                );
              })}
          </div>

          {/* MODAL DE CONEXÃO */}
          {showConnectionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {selectedIntegration ? `Conectar ${selectedIntegration.name}` : 'Nova Integração'}
                  </h3>
                  <button
                    onClick={() => setShowConnectionModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircleIcon className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {selectedIntegration ? (
                    <>
                      <p className="text-sm text-gray-600">
                        Para conectar o {selectedIntegration.name}, você precisará:
                      </p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Ter uma conta ativa no {selectedIntegration.name}</li>
                        <li>• Permissões de administrador</li>
                        <li>• Chaves de API válidas</li>
                      </ul>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          Esta funcionalidade estará disponível em breve. 
                          Entre em contato conosco para mais informações.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <CloudIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h4 className="mt-2 text-sm font-medium text-gray-900">Mais Integrações</h4>
                      <p className="mt-1 text-sm text-gray-500">
                        Sugestões de novas integrações? Entre em contato conosco!
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <ThemedButton
                    variant="outline"
                    onClick={() => setShowConnectionModal(false)}
                  >
                    Cancelar
                  </ThemedButton>
                  {selectedIntegration && (
                    <ThemedButton>
                      Conectar
                    </ThemedButton>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;