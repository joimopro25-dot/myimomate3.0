// src/pages/support/SupportPage.jsx - PÁGINA DE SUPORTE COMPLETA
// ✅ Aplicando Sidebar.jsx componente reutilizável
// ✅ Sistema completo de suporte e help desk
// ✅ Interface profissional com FAQs e tickets

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import { ThemedCard, ThemedButton, ThemedInput } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  PhoneIcon,
  TicketIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon
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

const SupportPage = () => {
  // Estados locais
  const [activeTab, setActiveTab] = useState('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');

  // Hooks
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { userProfile } = useAuth();

  // Dados simulados de suporte
  const supportMetrics = {
    openTickets: 2,
    resolvedTickets: 18,
    averageResponse: '2h',
    satisfaction: '4.8/5'
  };

  // FAQs organizadas por categoria
  const faqCategories = [
    {
      id: 'getting_started',
      title: 'Primeiros Passos',
      icon: QuestionMarkCircleIcon,
      questions: [
        {
          question: 'Como começar a usar o MyImoMate?',
          answer: 'Após criar sua conta, complete seu perfil na aba Configurações. Em seguida, comece adicionando seus primeiros leads através do módulo Leads. O sistema irá guiá-lo através do processo.'
        },
        {
          question: 'Qual a diferença entre Lead, Cliente e Oportunidade?',
          answer: 'Lead é um contato inicial interessado. Cliente é um lead qualificado com potencial real. Oportunidade é um negócio específico com um cliente. O MyImoMate ajuda a gerir esta progressão.'
        },
        {
          question: 'Como importar minha base de dados existente?',
          answer: 'Vá para Configurações > Importar Dados. Suportamos ficheiros Excel, CSV e integração direta com outros CRMs. O processo é guiado passo-a-passo.'
        }
      ]
    },
    {
      id: 'features',
      title: 'Funcionalidades',
      icon: DocumentTextIcon,
      questions: [
        {
          question: 'Como funciona o sistema de tarefas automáticas?',
          answer: 'O MyImoMate cria automaticamente tarefas de follow-up baseadas em templates. Por exemplo, após adicionar um lead, são criadas tarefas para contacto em 24h, 1 semana e 1 mês.'
        },
        {
          question: 'Posso personalizar os relatórios?',
          answer: 'Sim! No módulo Relatórios pode escolher períodos, filtros e tipos de dados. Pode exportar em PDF, Excel ou CSV. Relatórios personalizados estão disponíveis no plano Pro.'
        },
        {
          question: 'Como configurar integrações externas?',
          answer: 'Vá para Integrações e conecte suas ferramentas favoritas como WhatsApp Business, Google Drive, calendários. Cada integração tem um assistente de configuração.'
        }
      ]
    },
    {
      id: 'billing',
      title: 'Faturação e Planos',
      icon: TicketIcon,
      questions: [
        {
          question: 'Posso mudar de plano a qualquer altura?',
          answer: 'Sim, pode fazer upgrade ou downgrade a qualquer momento. O valor será ajustado proporcionalmente na próxima faturação. Não há taxas de mudança de plano.'
        },
        {
          question: 'Que métodos de pagamento aceitam?',
          answer: 'Aceitamos cartões de crédito/débito (Visa, Mastercard), MBWay, transferência bancária e PayPal. Todos os pagamentos são processados de forma segura.'
        },
        {
          question: 'Há descontos para pagamento anual?',
          answer: 'Sim! Pagamentos anuais têm 20% de desconto. Agências com mais de 10 utilizadores têm descontos especiais. Contacte-nos para condições personalizadas.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Suporte Técnico',
      icon: VideoCameraIcon,
      questions: [
        {
          question: 'O MyImoMate funciona offline?',
          answer: 'Algumas funcionalidades funcionam offline (visualização de dados já carregados). A sincronização acontece automaticamente quando a ligação à internet é restaurada.'
        },
        {
          question: 'Como posso fazer backup dos meus dados?',
          answer: 'Os dados são automaticamente guardados em backup na cloud. Pode exportar seus dados a qualquer momento através de Configurações > Exportar Dados.'
        },
        {
          question: 'Que browsers são suportados?',
          answer: 'Suportamos Chrome, Firefox, Safari e Edge nas versões mais recentes. Para melhor experiência, recomendamos Chrome ou Firefox atualizados.'
        }
      ]
    }
  ];

  // Tickets de exemplo
  const recentTickets = [
    {
      id: 'TK001',
      subject: 'Problema com importação de leads',
      status: 'open',
      priority: 'high',
      created: '2025-08-22T10:30:00',
      category: 'technical',
      lastUpdate: '2025-08-22T14:20:00'
    },
    {
      id: 'TK002',
      subject: 'Dúvida sobre relatórios personalizados',
      status: 'resolved',
      priority: 'medium',
      created: '2025-08-20T09:15:00',
      category: 'features',
      lastUpdate: '2025-08-21T16:45:00'
    }
  ];

  // Canais de contacto
  const contactChannels = [
    {
      type: 'email',
      title: 'Email de Suporte',
      description: 'Resposta em até 24h',
      contact: 'suporte@myimomate.pt',
      icon: DocumentTextIcon,
      available: true
    },
    {
      type: 'chat',
      title: 'Chat ao Vivo',
      description: 'Seg-Sex, 9h-18h',
      contact: 'Iniciar Chat',
      icon: ChatBubbleLeftRightIcon,
      available: true
    },
    {
      type: 'phone',
      title: 'Telefone',
      description: 'Suporte premium',
      contact: '+351 210 123 456',
      icon: PhoneIcon,
      available: userProfile?.plan === 'pro' || userProfile?.plan === 'enterprise'
    },
    {
      type: 'video',
      title: 'Videochamada',
      description: 'Demonstrações e formação',
      contact: 'Agendar Sessão',
      icon: VideoCameraIcon,
      available: userProfile?.plan === 'enterprise'
    }
  ];

  // Filtrar FAQs baseado na pesquisa
  const filteredFAQs = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  // Handlers
  const handleCreateTicket = () => {
    setLoading(true);
    
    // Simular criação de ticket
    setTimeout(() => {
      setLoading(false);
      setShowTicketModal(false);
      setTicketForm({ subject: '', category: '', priority: 'medium', description: '' });
      setFeedbackMessage('Ticket criado com sucesso! Número: TK003');
      setFeedbackType('success');
      setTimeout(() => setFeedbackMessage(''), 5000);
    }, 1500);
  };

  const handleStartChat = () => {
    setFeedbackMessage('Chat ao vivo será implementado em breve!');
    setFeedbackType('info');
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  const renderStatusBadge = (status) => {
    const statusConfig = {
      open: { color: 'bg-red-100 text-red-800', text: 'Aberto' },
      resolved: { color: 'bg-green-100 text-green-800', text: 'Resolvido' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pendente' }
    };
    
    const config = statusConfig[status];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const renderPriorityBadge = (priority) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', text: 'Baixa' },
      medium: { color: 'bg-blue-100 text-blue-800', text: 'Média' },
      high: { color: 'bg-red-100 text-red-800', text: 'Alta' }
    };
    
    const config = priorityConfig[priority];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  // Tabs de navegação
  const tabs = [
    { id: 'faq', label: 'FAQs', icon: QuestionMarkCircleIcon },
    { id: 'tickets', label: 'Meus Tickets', icon: TicketIcon },
    { id: 'contact', label: 'Contactar Suporte', icon: ChatBubbleLeftRightIcon },
    { id: 'resources', label: 'Recursos', icon: DocumentTextIcon }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* SIDEBAR REUTILIZÁVEL */}
      <Sidebar />

      {/* CONTEÚDO PRINCIPAL */}
      <div className="flex-1">
        <div className="p-6">
          {/* HEADER */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Centro de Suporte</h1>
            <p className="text-gray-600">Encontre respostas, crie tickets e contacte nossa equipa</p>
          </div>

          {/* FEEDBACK MESSAGES */}
          {feedbackMessage && (
            <div className={`p-4 rounded-lg mb-6 ${
              feedbackType === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : feedbackType === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              {feedbackMessage}
            </div>
          )}

          {/* MÉTRICAS COMPACTAS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <CompactMetricCard
              title="Tickets Abertos"
              value={supportMetrics.openTickets}
              trend="Necessitam atenção"
              icon={TicketIcon}
              color="red"
              onClick={() => setActiveTab('tickets')}
            />
            
            <CompactMetricCard
              title="Tickets Resolvidos"
              value={supportMetrics.resolvedTickets}
              trend="Este mês"
              icon={CheckCircleIcon}
              color="green"
              onClick={() => setActiveTab('tickets')}
            />
            
            <CompactMetricCard
              title="Tempo de Resposta"
              value={supportMetrics.averageResponse}
              trend="Média atual"
              icon={ClockIcon}
              color="blue"
              onClick={() => setActiveTab('contact')}
            />
            
            <CompactMetricCard
              title="Satisfação"
              value={supportMetrics.satisfaction}
              trend="Avaliação média"
              icon={QuestionMarkCircleIcon}
              color="purple"
              onClick={() => setActiveTab('faq')}
            />
          </div>

          {/* TABS DE NAVEGAÇÃO */}
          <ThemedCard className="mb-6">
            <div className="border-b">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
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

          {/* CONTEÚDO DAS TABS */}
          {activeTab === 'faq' && (
            <div className="space-y-6">
              {/* BARRA DE PESQUISA */}
              <ThemedCard className="p-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Pesquisar nas FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </ThemedCard>

              {/* CATEGORIAS DE FAQs */}
              {filteredFAQs.map((category) => {
                const Icon = category.icon;
                return (
                  <ThemedCard key={category.id}>
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <Icon className="h-6 w-6 text-blue-600 mr-3" />
                        <h3 className="text-lg font-semibold">{category.title}</h3>
                      </div>
                      
                      <div className="space-y-4">
                        {category.questions.map((faq, index) => (
                          <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                            <h4 className="font-medium text-gray-900 mb-2">{faq.question}</h4>
                            <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </ThemedCard>
                );
              })}
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="space-y-6">
              {/* HEADER DOS TICKETS */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Meus Tickets de Suporte</h3>
                <ThemedButton onClick={() => setShowTicketModal(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Criar Ticket
                </ThemedButton>
              </div>

              {/* LISTA DE TICKETS */}
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <ThemedCard key={ticket.id}>
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="font-medium text-gray-900">#{ticket.id}</span>
                            {renderStatusBadge(ticket.status)}
                            {renderPriorityBadge(ticket.priority)}
                          </div>
                          
                          <h4 className="font-medium text-gray-900 mb-2">{ticket.subject}</h4>
                          
                          <div className="flex items-center text-sm text-gray-500 space-x-4">
                            <span>Criado: {new Date(ticket.created).toLocaleDateString('pt-PT')}</span>
                            <span>Última atualização: {new Date(ticket.lastUpdate).toLocaleDateString('pt-PT')}</span>
                          </div>
                        </div>
                        
                        <ThemedButton variant="outline" size="sm">
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </ThemedButton>
                      </div>
                    </div>
                  </ThemedCard>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {contactChannels.map((channel) => {
                const Icon = channel.icon;
                return (
                  <ThemedCard key={channel.type}>
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <Icon className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{channel.title}</h3>
                          <p className="text-sm text-gray-600">{channel.description}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-lg font-medium text-gray-900">{channel.contact}</p>
                      </div>
                      
                      <ThemedButton
                        disabled={!channel.available}
                        onClick={channel.type === 'chat' ? handleStartChat : undefined}
                        className="w-full"
                      >
                        {!channel.available ? 'Indisponível no seu plano' : 
                         channel.type === 'email' ? 'Enviar Email' :
                         channel.type === 'chat' ? 'Iniciar Chat' :
                         channel.type === 'phone' ? 'Ligar Agora' :
                         'Agendar'}
                      </ThemedButton>
                    </div>
                  </ThemedCard>
                );
              })}
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ThemedCard>
                <div className="p-6">
                  <DocumentTextIcon className="h-8 w-8 text-blue-600 mb-4" />
                  <h3 className="font-semibold mb-2">Manual do Utilizador</h3>
                  <p className="text-gray-600 text-sm mb-4">Guia completo para usar todas as funcionalidades do MyImoMate.</p>
                  <ThemedButton variant="outline" size="sm">Ver Manual</ThemedButton>
                </div>
              </ThemedCard>

              <ThemedCard>
                <div className="p-6">
                  <VideoCameraIcon className="h-8 w-8 text-blue-600 mb-4" />
                  <h3 className="font-semibold mb-2">Vídeos Tutoriais</h3>
                  <p className="text-gray-600 text-sm mb-4">Aprenda através de vídeos práticos e demonstrações.</p>
                  <ThemedButton variant="outline" size="sm">Ver Vídeos</ThemedButton>
                </div>
              </ThemedCard>

              <ThemedCard>
                <div className="p-6">
                  <QuestionMarkCircleIcon className="h-8 w-8 text-blue-600 mb-4" />
                  <h3 className="font-semibold mb-2">Base de Conhecimento</h3>
                  <p className="text-gray-600 text-sm mb-4">Artigos detalhados sobre funcionalidades específicas.</p>
                  <ThemedButton variant="outline" size="sm">Explorar</ThemedButton>
                </div>
              </ThemedCard>
            </div>
          )}

          {/* MODAL CRIAR TICKET */}
          {showTicketModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Criar Novo Ticket</h3>
                  <button
                    onClick={() => setShowTicketModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleCreateTicket(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assunto
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketForm.subject}
                      onChange={(e) => setTicketForm({...ticketForm, subject: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descreva brevemente o problema"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoria
                    </label>
                    <select
                      required
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({...ticketForm, category: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="technical">Suporte Técnico</option>
                      <option value="features">Funcionalidades</option>
                      <option value="billing">Faturação</option>
                      <option value="account">Conta</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridade
                    </label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({...ticketForm, priority: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descrição
                    </label>
                    <textarea
                      required
                      rows="4"
                      value={ticketForm.description}
                      onChange={(e) => setTicketForm({...ticketForm, description: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Descreva o problema em detalhe..."
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <ThemedButton
                      type="button"
                      variant="outline"
                      onClick={() => setShowTicketModal(false)}
                    >
                      Cancelar
                    </ThemedButton>
                    <ThemedButton
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? 'Criando...' : 'Criar Ticket'}
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

export default SupportPage;
