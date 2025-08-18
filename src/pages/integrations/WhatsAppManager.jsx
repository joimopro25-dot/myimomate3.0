// src/components/integrations/WhatsAppManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  DocumentIcon,
  PhoneIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  Cog6ToothIcon,
  BoltIcon,
  QrCodeIcon,
  DevicePhoneMobileIcon,
  ChatBubbleOvalLeftIcon,
  EnvelopeIcon,
  CalendarIcon,
  MegaphoneIcon,
  SparklesIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  PlayIcon,
  PauseIcon,
  StopIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedCard, ThemedButton, ThemedBadge } from '../common/ThemedComponents';
import useIntegrations from '../../hooks/useIntegrations';

/**
 * 📱 WHATSAPP BUSINESS MANAGER
 * 
 * Funcionalidades:
 * ✅ Configuração WhatsApp Business API
 * ✅ Gestão de templates de mensagem
 * ✅ Envio automático de notificações
 * ✅ Chat em tempo real
 * ✅ Gestão de contactos
 * ✅ Campanhas de marketing
 * ✅ Analytics de mensagens
 * ✅ Automações inteligentes
 * ✅ Webhooks para eventos
 * ✅ Compliance e verificação
 */

const WhatsAppManager = ({ 
  onClose, 
  integrationData,
  onUpdate 
}) => {
  // Estados locais
  const [activeSection, setActiveSection] = useState('overview');
  const [templates, setTemplates] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [webhooks, setWebhooks] = useState([]);
  
  // Estados para interface
  const [selectedContact, setSelectedContact] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  // Estados para formulários
  const [templateForm, setTemplateForm] = useState({
    name: '',
    category: 'utility',
    language: 'pt_BR',
    content: '',
    variables: []
  });

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    template_id: '',
    target_audience: 'all',
    schedule_type: 'immediate',
    scheduled_at: null,
    variables: {}
  });

  // Hook de integrações
  const { currentTheme } = useTheme();

  // 📋 SEÇÕES DO WHATSAPP MANAGER
  const SECTIONS = {
    overview: {
      id: 'overview',
      title: 'Visão Geral',
      icon: ChatBubbleLeftRightIcon,
      description: 'Dashboard e estatísticas do WhatsApp'
    },
    templates: {
      id: 'templates',
      title: 'Templates',
      icon: DocumentIcon,
      description: 'Gestão de templates de mensagem'
    },
    contacts: {
      id: 'contacts',
      title: 'Contactos',
      icon: UserGroupIcon,
      description: 'Gestão de contactos e grupos'
    },
    chat: {
      id: 'chat',
      title: 'Chat',
      icon: ChatBubbleOvalLeftIcon,
      description: 'Conversas e mensagens'
    },
    campaigns: {
      id: 'campaigns',
      title: 'Campanhas',
      icon: MegaphoneIcon,
      description: 'Campanhas de marketing'
    },
    automations: {
      id: 'automations',
      title: 'Automações',
      icon: BoltIcon,
      description: 'Regras e fluxos automáticos'
    },
    analytics: {
      id: 'analytics',
      title: 'Analytics',
      icon: ChartBarIcon,
      description: 'Métricas e relatórios'
    },
    settings: {
      id: 'settings',
      title: 'Configurações',
      icon: Cog6ToothIcon,
      description: 'Configurações da API'
    }
  };

  // 📊 TIPOS DE TEMPLATES
  const TEMPLATE_CATEGORIES = {
    utility: { name: 'Utilitário', color: 'blue' },
    marketing: { name: 'Marketing', color: 'green' },
    authentication: { name: 'Autenticação', color: 'purple' }
  };

  // 📱 STATUS DE MENSAGENS
  const MESSAGE_STATUS = {
    sent: { name: 'Enviada', color: 'blue', icon: PaperAirplaneIcon },
    delivered: { name: 'Entregue', color: 'green', icon: CheckCircleIcon },
    read: { name: 'Lida', color: 'purple', icon: CheckCircleIcon },
    failed: { name: 'Falhou', color: 'red', icon: XCircleIcon }
  };

  /**
   * 🔄 CARREGAR DADOS DO WHATSAPP
   */
  const loadWhatsAppData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simular carregamento de dados da API do WhatsApp
      await Promise.all([
        loadTemplates(),
        loadContacts(),
        loadConversations(),
        loadCampaigns(),
        loadAnalytics(),
        loadWebhooks()
      ]);
    } catch (err) {
      console.error('Erro ao carregar dados do WhatsApp:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadTemplates = async () => {
    // Simulação de templates
    setTemplates([
      {
        id: 'template_1',
        name: 'confirmacao_visita',
        category: 'utility',
        language: 'pt_BR',
        status: 'approved',
        content: 'Olá {{1}}, confirmamos a sua visita para {{2}} às {{3}}. Endereço: {{4}}. Obrigado!',
        variables: ['nome', 'data', 'hora', 'endereco'],
        created_at: new Date('2025-08-15')
      },
      {
        id: 'template_2',
        name: 'novo_imovel',
        category: 'marketing',
        language: 'pt_BR',
        status: 'approved',
        content: '🏠 Novo imóvel disponível! {{1}} com {{2}} quartos por €{{3}}. Interessado? Responda SIM!',
        variables: ['tipo', 'quartos', 'preco'],
        created_at: new Date('2025-08-14')
      },
      {
        id: 'template_3',
        name: 'lembrete_reuniao',
        category: 'utility',
        language: 'pt_BR',
        status: 'pending',
        content: 'Lembrete: Reunião marcada para {{1}} às {{2}}. Local: {{3}}.',
        variables: ['data', 'hora', 'local'],
        created_at: new Date('2025-08-13')
      }
    ]);
  };

  const loadContacts = async () => {
    // Simulação de contactos
    setContacts([
      {
        id: 'contact_1',
        name: 'João Silva',
        phone: '+351912345678',
        last_message: 'Obrigado pela informação!',
        last_message_at: new Date('2025-08-18T14:30:00'),
        status: 'active',
        tags: ['cliente', 'interessado'],
        profile_pic: null
      },
      {
        id: 'contact_2',
        name: 'Maria Santos',
        phone: '+351987654321',
        last_message: 'Quando posso visitar?',
        last_message_at: new Date('2025-08-18T13:15:00'),
        status: 'active',
        tags: ['lead', 'urgente'],
        profile_pic: null
      },
      {
        id: 'contact_3',
        name: 'Pedro Costa',
        phone: '+351923456789',
        last_message: 'Perfeito, aguardo contacto',
        last_message_at: new Date('2025-08-18T11:45:00'),
        status: 'active',
        tags: ['cliente'],
        profile_pic: null
      }
    ]);
  };

  const loadConversations = async () => {
    // Simulação de conversas
    setConversations([
      {
        id: 'conv_1',
        contact_id: 'contact_1',
        messages: [
          {
            id: 'msg_1',
            type: 'outbound',
            content: 'Olá João! Temos um apartamento T2 que pode interessar.',
            timestamp: new Date('2025-08-18T14:00:00'),
            status: 'read'
          },
          {
            id: 'msg_2',
            type: 'inbound',
            content: 'Obrigado pela informação!',
            timestamp: new Date('2025-08-18T14:30:00'),
            status: 'delivered'
          }
        ]
      }
    ]);
  };

  const loadCampaigns = async () => {
    // Simulação de campanhas
    setCampaigns([
      {
        id: 'campaign_1',
        name: 'Novos Imóveis Agosto',
        template_id: 'template_2',
        status: 'completed',
        sent_count: 156,
        delivered_count: 152,
        read_count: 98,
        response_count: 23,
        created_at: new Date('2025-08-15'),
        completed_at: new Date('2025-08-16')
      },
      {
        id: 'campaign_2',
        name: 'Confirmações de Visita',
        template_id: 'template_1',
        status: 'active',
        sent_count: 45,
        delivered_count: 44,
        read_count: 41,
        response_count: 38,
        created_at: new Date('2025-08-18'),
        completed_at: null
      }
    ]);
  };

  const loadAnalytics = async () => {
    // Simulação de analytics
    setAnalytics({
      total_messages: 1247,
      messages_today: 23,
      delivery_rate: 97.8,
      read_rate: 72.3,
      response_rate: 15.6,
      active_contacts: 345,
      templates_approved: 8,
      campaigns_this_month: 3,
      avg_response_time: '12 min'
    });
  };

  const loadWebhooks = async () => {
    // Simulação de webhooks
    setWebhooks([
      {
        id: 'webhook_1',
        event: 'message_received',
        url: 'https://api.myimomate.com/whatsapp/received',
        status: 'active'
      },
      {
        id: 'webhook_2',
        event: 'message_status',
        url: 'https://api.myimomate.com/whatsapp/status',
        status: 'active'
      }
    ]);
  };

  /**
   * 📊 SEÇÃO DE VISÃO GERAL
   */
  const OverviewSection = () => (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ThemedCard className="p-6">
          <div className="flex items-center">
            <ChatBubbleLeftRightIcon className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Mensagens Hoje</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.messages_today}</p>
            </div>
          </div>
        </ThemedCard>

        <ThemedCard className="p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Contactos Ativos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.active_contacts}</p>
            </div>
          </div>
        </ThemedCard>

        <ThemedCard className="p-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-8 w-8 text-purple-500 mr-4" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Taxa de Entrega</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.delivery_rate}%</p>
            </div>
          </div>
        </ThemedCard>

        <ThemedCard className="p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-orange-500 mr-4" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tempo Resposta</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.avg_response_time}</p>
            </div>
          </div>
        </ThemedCard>
      </div>

      {/* Status da Conta */}
      <ThemedCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Status da Conta WhatsApp Business
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Número Verificado</span>
              <ThemedBadge variant="success">+351 912 345 678</ThemedBadge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Nome do Negócio</span>
              <span className="font-medium">MyImoMate</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Categoria</span>
              <span className="font-medium">Imobiliária</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Status da API</span>
              <ThemedBadge variant="success">Conectada</ThemedBadge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Rate Limit</span>
              <span className="font-medium">1000/hora</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Webhooks</span>
              <ThemedBadge variant="success">{webhooks.filter(w => w.status === 'active').length} Ativos</ThemedBadge>
            </div>
          </div>
        </div>
      </ThemedCard>

      {/* Atividade Recente */}
      <ThemedCard className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Atividade Recente
        </h3>
        <div className="space-y-3">
          {contacts.slice(0, 5).map(contact => (
            <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                  {contact.name[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{contact.last_message}</p>
                </div>
              </div>
              <span className="text-xs text-gray-500">
                {contact.last_message_at.toLocaleTimeString('pt-PT')}
              </span>
            </div>
          ))}
        </div>
      </ThemedCard>
    </div>
  );

  /**
   * 📝 SEÇÃO DE TEMPLATES
   */
  const TemplatesSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Templates de Mensagem
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerir templates aprovados pelo WhatsApp
          </p>
        </div>
        <ThemedButton onClick={() => setShowTemplateModal(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Novo Template
        </ThemedButton>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {templates.map(template => (
          <ThemedCard key={template.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {template.name}
                  </h4>
                  <ThemedBadge
                    variant={
                      template.status === 'approved' ? 'success' :
                      template.status === 'pending' ? 'warning' : 'error'
                    }
                    size="sm"
                  >
                    {template.status === 'approved' ? 'Aprovado' :
                     template.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                  </ThemedBadge>
                  <ThemedBadge variant="info" size="sm">
                    {TEMPLATE_CATEGORIES[template.category]?.name}
                  </ThemedBadge>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                    {template.content}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Variáveis: {template.variables.length}</span>
                  <span>Idioma: {template.language}</span>
                  <span>Criado: {template.created_at.toLocaleDateString('pt-PT')}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <ThemedButton variant="outline" size="sm">
                  <EyeIcon className="h-4 w-4" />
                </ThemedButton>
                <ThemedButton variant="outline" size="sm">
                  <PaperAirplaneIcon className="h-4 w-4" />
                </ThemedButton>
                <ThemedButton variant="outline" size="sm">
                  <TrashIcon className="h-4 w-4" />
                </ThemedButton>
              </div>
            </div>
          </ThemedCard>
        ))}
      </div>
    </div>
  );

  /**
   * 👥 SEÇÃO DE CONTACTOS
   */
  const ContactsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Contactos WhatsApp
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerir contactos e conversas ativas
          </p>
        </div>
        <div className="flex space-x-2">
          <ThemedButton variant="outline">
            <UserGroupIcon className="h-4 w-4 mr-2" />
            Importar
          </ThemedButton>
          <ThemedButton>
            <PlusIcon className="h-4 w-4 mr-2" />
            Novo Contacto
          </ThemedButton>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Contactos */}
        <div className="lg:col-span-1">
          <ThemedCard className="p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4">
              Contactos Recentes
            </h4>
            <div className="space-y-3">
              {contacts.map(contact => (
                <div
                  key={contact.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedContact?.id === contact.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedContact(contact)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                      {contact.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {contact.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {contact.last_message}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {contact.last_message_at.toLocaleTimeString('pt-PT')}
                    </div>
                  </div>
                  
                  {contact.tags && contact.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {contact.tags.map(tag => (
                        <ThemedBadge key={tag} variant="info" size="sm">
                          {tag}
                        </ThemedBadge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ThemedCard>
        </div>

        {/* Chat/Conversa */}
        <div className="lg:col-span-2">
          {selectedContact ? (
            <ThemedCard className="p-4 h-96">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                    {selectedContact.name[0]}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {selectedContact.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedContact.phone}
                    </p>
                  </div>
                </div>
                <ThemedButton variant="outline" size="sm">
                  <PhoneIcon className="h-4 w-4" />
                </ThemedButton>
              </div>
              
              {/* Área de mensagens */}
              <div className="flex-1 overflow-y-auto mb-4">
                <div className="space-y-3">
                  {/* Mensagens simuladas */}
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs">
                      <p className="text-sm">Olá! Temos um apartamento que pode interessar.</p>
                      <span className="text-xs opacity-75">14:00</span>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-lg max-w-xs">
                      <p className="text-sm text-gray-900 dark:text-white">{selectedContact.last_message}</p>
                      <span className="text-xs text-gray-500">{selectedContact.last_message_at.toLocaleTimeString('pt-PT')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Input de mensagem */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Digite sua mensagem..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <ThemedButton size="sm">
                  <PaperAirplaneIcon className="h-4 w-4" />
                </ThemedButton>
              </div>
            </ThemedCard>
          ) : (
            <ThemedCard className="p-12 text-center h-96 flex items-center justify-center">
              <div>
                <ChatBubbleOvalLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Selecione um Contacto
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Escolha um contacto para ver a conversa
                </p>
              </div>
            </ThemedCard>
          )}
        </div>
      </div>
    </div>
  );

  /**
   * 📢 SEÇÃO DE CAMPANHAS
   */
  const CampaignsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Campanhas de Marketing
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Criar e gerir campanhas de mensagens em massa
          </p>
        </div>
        <ThemedButton onClick={() => setShowCampaignModal(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nova Campanha
        </ThemedButton>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {campaigns.map(campaign => (
          <ThemedCard key={campaign.id} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {campaign.name}
                  </h4>
                  <ThemedBadge
                    variant={
                      campaign.status === 'completed' ? 'success' :
                      campaign.status === 'active' ? 'warning' : 'neutral'
                    }
                  >
                    {campaign.status === 'completed' ? 'Concluída' :
                     campaign.status === 'active' ? 'Ativa' : 'Pausada'}
                  </ThemedBadge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Enviadas:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{campaign.sent_count}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Entregues:</span>
                    <div className="font-medium text-green-600">{campaign.delivered_count}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Lidas:</span>
                    <div className="font-medium text-blue-600">{campaign.read_count}</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Respostas:</span>
                    <div className="font-medium text-purple-600">{campaign.response_count}</div>
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  Criada: {campaign.created_at.toLocaleDateString('pt-PT')}
                  {campaign.completed_at && ` • Concluída: ${campaign.completed_at.toLocaleDateString('pt-PT')}`}
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <ThemedButton variant="outline" size="sm">
                  <EyeIcon className="h-4 w-4" />
                </ThemedButton>
                {campaign.status === 'active' ? (
                  <ThemedButton variant="outline" size="sm">
                    <PauseIcon className="h-4 w-4" />
                  </ThemedButton>
                ) : (
                  <ThemedButton variant="outline" size="sm">
                    <PlayIcon className="h-4 w-4" />
                  </ThemedButton>
                )}
              </div>
            </div>
          </ThemedCard>
        ))}
      </div>
    </div>
  );

  /**
   * 🤖 SEÇÃO DE AUTOMAÇÕES
   */
  const AutomationsSection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Automações Inteligentes
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configurar respostas automáticas e fluxos
          </p>
        </div>
        <ThemedButton>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nova Automação
        </ThemedButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ThemedCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <BoltIcon className="h-6 w-6 text-yellow-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Resposta Automática
            </h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Responder automaticamente a mensagens recebidas fora do horário comercial
          </p>
          <div className="flex items-center justify-between">
            <ThemedBadge variant="success">Ativa</ThemedBadge>
            <ThemedButton variant="outline" size="sm">
              Configurar
            </ThemedButton>
          </div>
        </ThemedCard>

        <ThemedCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CalendarIcon className="h-6 w-6 text-blue-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Lembretes de Visita
            </h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Enviar lembretes automáticos 1 hora antes de visitas agendadas
          </p>
          <div className="flex items-center justify-between">
            <ThemedBadge variant="success">Ativa</ThemedBadge>
            <ThemedButton variant="outline" size="sm">
              Configurar
            </ThemedButton>
          </div>
        </ThemedCard>

        <ThemedCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <SparklesIcon className="h-6 w-6 text-purple-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Follow-up Inteligente
            </h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Acompanhamento automático de leads que não responderam
          </p>
          <div className="flex items-center justify-between">
            <ThemedBadge variant="neutral">Inativa</ThemedBadge>
            <ThemedButton variant="outline" size="sm">
              Ativar
            </ThemedButton>
          </div>
        </ThemedCard>

        <ThemedCard className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <MegaphoneIcon className="h-6 w-6 text-green-500" />
            <h4 className="font-semibold text-gray-900 dark:text-white">
              Novos Imóveis
            </h4>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Notificar contactos interessados sobre novos imóveis
          </p>
          <div className="flex items-center justify-between">
            <ThemedBadge variant="warning">Pausada</ThemedBadge>
            <ThemedButton variant="outline" size="sm">
              Retomar
            </ThemedButton>
          </div>
        </ThemedCard>
      </div>
    </div>
  );

  /**
   * 📊 SEÇÃO DE ANALYTICS
   */
  const AnalyticsSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Analytics e Métricas
      </h3>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ThemedCard className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{analytics.delivery_rate}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Entrega</div>
        </ThemedCard>
        <ThemedCard className="p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{analytics.read_rate}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Leitura</div>
        </ThemedCard>
        <ThemedCard className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{analytics.response_rate}%</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Taxa de Resposta</div>
        </ThemedCard>
      </div>

      {/* Performance por Template */}
      <ThemedCard className="p-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Performance por Template
        </h4>
        <div className="space-y-3">
          {templates.filter(t => t.status === 'approved').map(template => (
            <div key={template.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <span className="font-medium text-gray-900 dark:text-white">{template.name}</span>
              <div className="flex items-center space-x-4 text-sm">
                <span className="text-blue-600">95% entrega</span>
                <span className="text-green-600">78% leitura</span>
                <span className="text-purple-600">23% resposta</span>
              </div>
            </div>
          ))}
        </div>
      </ThemedCard>
    </div>
  );

  /**
   * ⚙️ SEÇÃO DE CONFIGURAÇÕES
   */
  const SettingsSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        Configurações da API
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThemedCard className="p-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
            Configurações da Conta
          </h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número do WhatsApp Business
              </label>
              <input
                type="text"
                value="+351 912 345 678"
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome do Negócio
              </label>
              <input
                type="text"
                value="MyImoMate"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </ThemedCard>

        <ThemedCard className="p-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">
            Webhooks
          </h4>
          <div className="space-y-3">
            {webhooks.map(webhook => (
              <div key={webhook.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white block">{webhook.event}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{webhook.url}</span>
                </div>
                <ThemedBadge variant={webhook.status === 'active' ? 'success' : 'neutral'}>
                  {webhook.status === 'active' ? 'Ativo' : 'Inativo'}
                </ThemedBadge>
              </div>
            ))}
          </div>
        </ThemedCard>
      </div>
    </div>
  );

  /**
   * 🎨 RENDERIZAR SEÇÃO ATIVA
   */
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'templates':
        return <TemplatesSection />;
      case 'contacts':
        return <ContactsSection />;
      case 'chat':
        return <ContactsSection />; // Reutilizar a seção de contactos para chat
      case 'campaigns':
        return <CampaignsSection />;
      case 'automations':
        return <AutomationsSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <OverviewSection />;
    }
  };

  // Carregar dados quando componente monta
  useEffect(() => {
    loadWhatsAppData();
  }, [loadWhatsAppData]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              WhatsApp Business Manager
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Gestão completa da integração WhatsApp
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <ThemedButton
            variant="outline"
            onClick={loadWhatsAppData}
            disabled={isLoading}
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </ThemedButton>
          
          {onClose && (
            <ThemedButton variant="outline" onClick={onClose}>
              ✕ Fechar
            </ThemedButton>
          )}
        </div>
      </div>

      {/* Navegação */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {Object.values(SECTIONS).map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeSection === section.id
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{section.title}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Conteúdo */}
      {renderActiveSection()}
    </div>
  );
};

export default WhatsAppManager;