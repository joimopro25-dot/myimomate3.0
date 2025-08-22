// src/pages/visits/VisitsPage.jsx
// LAYOUT SIDEBAR REUTILIZÁVEL - BASEADO NO CÓDIGO ORIGINAL
// ✅ Aplicando mesmo padrão do ClientsPage.jsx
// ✅ Removendo DashboardLayout e aplicando Sidebar reutilizável
// ✅ Mantendo 100% das funcionalidades existentes

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  ThemedContainer, 
  ThemedCard, 
  ThemedButton,
  ThemedText,
  ThemedHeading 
} from '../../components/common/ThemedComponents';

// ✅ SIDEBAR REUTILIZÁVEL EM VEZ DE DASHBOARDLAYOUT
import Sidebar from '../../components/layout/Sidebar';

// Hooks personalizados
import useVisits from '../../hooks/useVisits';
import useClients from '../../hooks/useClients';

// Icons
import { 
  CalendarIcon, 
  PlusIcon, 
  EyeIcon,
  CheckCircleIcon,
  ClockIcon,
  EllipsisVerticalIcon,
  UserIcon,
  HomeIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

// ✅ COMPONENTE MÉTRICA COMPACTA (EXATAMENTE IGUAL ÀS OUTRAS PÁGINAS)
const CompactMetricCard = ({ title, value, trend, icon: Icon, color = 'blue', onClick }) => {
  const { isDark } = useTheme();
  
  const colorClasses = {
    blue: isDark() 
      ? 'from-blue-600 to-blue-700' 
      : 'from-blue-500 to-blue-600',
    green: isDark() 
      ? 'from-green-600 to-green-700' 
      : 'from-green-500 to-green-600',
    yellow: isDark() 
      ? 'from-yellow-600 to-yellow-700' 
      : 'from-yellow-500 to-yellow-600',
    purple: isDark() 
      ? 'from-purple-600 to-purple-700' 
      : 'from-purple-500 to-purple-600',
    red: isDark() 
      ? 'from-red-600 to-red-700' 
      : 'from-red-500 to-red-600'
  };

  return (
    <div 
      className={`
        relative overflow-hidden rounded-lg p-3 cursor-pointer
        bg-gradient-to-r ${colorClasses[color]}
        text-white shadow-lg hover:shadow-xl 
        transform hover:scale-105 transition-all duration-200
        group
      `}
      onClick={onClick}
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

const VisitsPage = () => {
  const navigate = useNavigate();
  const { theme, isDark } = useTheme();
  
  // Hook personalizado de visitas (mantido 100% idêntico)
  const {
    visits,
    loading,
    error,
    creating,
    updating,
    confirming,
    createVisit,
    confirmVisit,
    updateVisitStatus,
    addVisitFeedback,
    shareVisit,
    cancelVisit,
    getVisitStats,
    VISIT_STATUS,
    VISIT_TYPES,
    PROPERTY_TYPES,
    OPERATION_TYPES,
    VISIT_OUTCOMES,
    VISIT_STATUS_COLORS,
    filters,
    setFilters
  } = useVisits();

  // Hook de clientes para seleção (mantido idêntico)
  const { clients } = useClients();

  // Estados locais (mantidos idênticos)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [viewMode, setViewMode] = useState('list'); // list, calendar
  const [openDropdown, setOpenDropdown] = useState(null);

  // Estados do formulário de agendamento (mantidos idênticos)
  const [formData, setFormData] = useState({
    clientId: '',
    clientName: '',
    scheduledDate: '',
    scheduledTime: '',
    duration: 60,
    visitType: VISIT_TYPES?.PRESENCIAL || 'presencial',
    property: {
      type: PROPERTY_TYPES?.APARTAMENTO || 'apartamento',
      operation: OPERATION_TYPES?.VENDA || 'venda',
      address: {
        street: '',
        number: '',
        floor: '',
        postalCode: '',
        city: '',
        district: '',
        country: 'Portugal'
      },
      area: '',
      rooms: '',
      bathrooms: '',
      price: '',
      description: '',
      condition: 'good',
      internal_ref: '',
      external_ref: ''
    },
    notes: '',
    internal_notes: ''
  });

  // Estados do formulário de feedback (mantidos idênticos)
  const [feedbackForm, setFeedbackForm] = useState({
    outcome: VISIT_OUTCOMES?.INTERESSADO || 'interessado',
    feedback: '',
    client_feedback: '',
    next_steps: '',
    follow_up_date: ''
  });

  // Estados do formulário de partilha (mantidos idênticos)
  const [shareForm, setShareForm] = useState({
    consultorIds: [],
    notes: ''
  });

  // Obter estatísticas (mantido idêntico)
  const stats = getVisitStats?.() || { total: 0, today: 0, upcoming: 0, confirmed: 0, conversion_rate: 0 };

  // TODAS AS FUNÇÕES MANTIDAS EXATAMENTE COMO ESTAVAM
  const handleFormChange = (field, value) => {
    if (field.includes('.')) {
      const parts = field.split('.');
      if (parts.length === 2) {
        setFormData(prev => ({
          ...prev,
          [parts[0]]: { ...prev[parts[0]], [parts[1]]: value }
        }));
      } else if (parts.length === 3) {
        setFormData(prev => ({
          ...prev,
          [parts[0]]: {
            ...prev[parts[0]],
            [parts[1]]: { ...prev[parts[0]][parts[1]], [parts[2]]: value }
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      clientName: '',
      scheduledDate: '',
      scheduledTime: '',
      duration: 60,
      visitType: VISIT_TYPES?.PRESENCIAL || 'presencial',
      property: {
        type: PROPERTY_TYPES?.APARTAMENTO || 'apartamento',
        operation: OPERATION_TYPES?.VENDA || 'venda',
        address: {
          street: '',
          number: '',
          floor: '',
          postalCode: '',
          city: '',
          district: '',
          country: 'Portugal'
        },
        area: '',
        rooms: '',
        bathrooms: '',
        price: '',
        description: '',
        condition: 'good',
        internal_ref: '',
        external_ref: ''
      },
      notes: '',
      internal_notes: ''
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await createVisit(formData);
      
      if (result.success) {
        setFeedbackMessage('Visita agendada com sucesso!');
        setFeedbackType('success');
        setShowCreateForm(false);
        resetForm();
      } else {
        setFeedbackMessage(result.error || 'Erro ao agendar visita');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao agendar visita');
      setFeedbackType('error');
    }
  };

  const handleConfirmVisit = async (visitId) => {
    try {
      const result = await confirmVisit(visitId);
      
      if (result.success) {
        setFeedbackMessage('Visita confirmada com sucesso!');
        setFeedbackType('success');
        setShowConfirmModal(false);
        setSelectedVisit(null);
      } else {
        setFeedbackMessage(result.error || 'Erro ao confirmar visita');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao confirmar visita');
      setFeedbackType('error');
    }
  };

  const handleAddFeedback = async () => {
    if (!selectedVisit || !feedbackForm.outcome || !feedbackForm.feedback.trim()) {
      setFeedbackMessage('Preencha todos os campos obrigatórios do feedback');
      setFeedbackType('error');
      return;
    }

    try {
      const result = await addVisitFeedback(selectedVisit.id, feedbackForm);
      
      if (result.success) {
        setFeedbackMessage('Feedback registrado com sucesso!');
        setFeedbackType('success');
        setShowFeedbackModal(false);
        setSelectedVisit(null);
        setFeedbackForm({
          outcome: VISIT_OUTCOMES?.INTERESSADO || 'interessado',
          feedback: '',
          client_feedback: '',
          next_steps: '',
          follow_up_date: ''
        });
      } else {
        setFeedbackMessage(result.error || 'Erro ao registrar feedback');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao registrar feedback');
      setFeedbackType('error');
    }
  };

  const handleStatusUpdate = async (visitId, newStatus) => {
    try {
      const result = await updateVisitStatus(visitId, newStatus);
      
      if (result.success) {
        setFeedbackMessage('Status atualizado com sucesso!');
        setFeedbackType('success');
        setOpenDropdown(null);
      } else {
        setFeedbackMessage(result.error || 'Erro ao atualizar status');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao atualizar status');
      setFeedbackType('error');
    }
  };

  const handleCancelVisit = async (visitId, visitName) => {
    if (!window.confirm(`Tem certeza que deseja cancelar a visita "${visitName}"?`)) return;
    
    try {
      const result = await cancelVisit(visitId);
      
      if (result.success) {
        setFeedbackMessage('Visita cancelada com sucesso!');
        setFeedbackType('success');
        setOpenDropdown(null);
      } else {
        setFeedbackMessage(result.error || 'Erro ao cancelar visita');
        setFeedbackType('error');
      }
    } catch (error) {
      setFeedbackMessage('Erro inesperado ao cancelar visita');
      setFeedbackType('error');
    }
  };

  // Funções auxiliares mantidas idênticas
  const getVisitTypeLabel = (type) => {
    const labels = {
      'presencial': 'Presencial',
      'virtual': 'Virtual',
      'avaliacao': 'Avaliação',
      'segunda_visita': 'Segunda Visita',
      'grupo': 'Grupo'
    };
    return labels[type] || type;
  };

  const getPropertyTypeLabel = (type) => {
    const labels = {
      'apartamento': 'Apartamento',
      'casa': 'Casa',
      'terreno': 'Terreno',
      'comercial': 'Comercial',
      'escritorio': 'Escritório',
      'armazem': 'Armazém',
      'garagem': 'Garagem',
      'outros': 'Outros'
    };
    return labels[type] || type;
  };

  const getOperationTypeLabel = (operation) => {
    const labels = {
      'venda': 'Venda',
      'arrendamento': 'Arrendamento',
      'trespasse': 'Trespasse',
      'investimento': 'Investimento'
    };
    return labels[operation] || operation;
  };

  const getStatusColor = (status) => {
    return VISIT_STATUS_COLORS?.[status] || 'bg-gray-100 text-gray-800';
  };

  // Efeito para limpar mensagens de feedback (mantido idêntico)
  useEffect(() => {
    if (feedbackMessage) {
      const timer = setTimeout(() => {
        setFeedbackMessage('');
        setFeedbackType('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [feedbackMessage]);

  // ✅ RETURN COM LAYOUT TRANSFORMADO - PADRÃO SIDEBAR REUTILIZÁVEL
  return (
    <div className="flex">
      {/* ✅ SIDEBAR REUTILIZÁVEL */}
      <Sidebar />
      
      {/* ✅ ÁREA PRINCIPAL SEM ML-64 (LAYOUT HARMONIOSO) */}
      <div className="flex-1 min-h-screen bg-gray-50">
        <div className="p-6">
          
          {/* ✅ HEADER COMPACTO PADRONIZADO */}
          <div className="mb-6">
            <ThemedHeading size="xl" className="text-2xl font-bold text-gray-900 mb-2">
              Sistema de Visitas
            </ThemedHeading>
            <ThemedText className="text-gray-600">
              Agendamento e gestão completa de visitas imobiliárias
            </ThemedText>
          </div>

          {/* ✅ MÉTRICAS COMPACTAS IGUAIS ÀS OUTRAS PÁGINAS */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
            <CompactMetricCard
              title="Total de Visitas"
              value={stats.total}
              icon={CalendarIcon}
              color="blue"
              onClick={() => console.log('Ver todas as visitas')}
            />
            <CompactMetricCard
              title="Visitas Hoje"
              value={stats.today}
              trend="Agendadas hoje"
              icon={ClockIcon}
              color="green"
              onClick={() => console.log('Filtrar visitas de hoje')}
            />
            <CompactMetricCard
              title="Próximas Visitas"
              value={stats.upcoming}
              trend="Futuras"
              icon={EyeIcon}
              color="yellow"
              onClick={() => console.log('Ver próximas visitas')}
            />
            <CompactMetricCard
              title="Confirmadas"
              value={stats.confirmed}
              icon={CheckCircleIcon}
              color="purple"
              onClick={() => console.log('Ver confirmadas')}
            />
            <CompactMetricCard
              title="Taxa Conversão"
              value={`${stats.conversion_rate}%`}
              trend="Taxa sucesso"
              icon={ChatBubbleLeftIcon}
              color="red"
              onClick={() => console.log('Ver relatório conversão')}
            />
          </div>

          {/* RESTO DO CONTEÚDO MANTIDO EXATAMENTE IGUAL */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Coluna Principal - Lista/Calendário */}
            <div className="lg:col-span-3">
              <ThemedCard className="p-6">
                
                {/* Cabeçalho com controles */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {viewMode === 'list' ? 'Lista de Visitas' : 'Calendário de Visitas'} ({visits?.length || 0})
                    </h3>
                    {loading && (
                      <p className="text-gray-500 mt-2">Carregando visitas...</p>
                    )}
                    {error && (
                      <p className="text-red-600 mt-2">Erro: {error}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Alternador de vista */}
                    <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                      <button
                        onClick={() => setViewMode('list')}
                        className={`px-3 py-2 text-sm font-medium transition-colors ${
                          viewMode === 'list'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Lista
                      </button>
                      <button
                        onClick={() => setViewMode('calendar')}
                        className={`px-3 py-2 text-sm font-medium transition-colors ${
                          viewMode === 'calendar'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        Calendário
                      </button>
                    </div>
                    
                    {/* Botão Nova Visita */}
                    <ThemedButton
                      onClick={() => setShowCreateForm(true)}
                      variant="primary"
                      className="flex items-center gap-2"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Nova Visita
                    </ThemedButton>
                  </div>
                </div>

                {/* Feedback Messages */}
                {feedbackMessage && (
                  <div className={`p-4 rounded-lg mb-4 ${
                    feedbackType === 'success' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : feedbackType === 'error'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}>
                    {feedbackMessage}
                  </div>
                )}

                {/* Vista Lista ou Calendário */}
                {viewMode === 'list' ? (
                  <div>
                    {visits?.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b-2 border-gray-200">
                              <th className="text-left p-3 font-medium text-gray-700">Cliente</th>
                              <th className="text-left p-3 font-medium text-gray-700">Imóvel</th>
                              <th className="text-left p-3 font-medium text-gray-700">Data/Hora</th>
                              <th className="text-left p-3 font-medium text-gray-700">Status</th>
                              <th className="text-center p-3 font-medium text-gray-700">Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {visits.map((visit) => (
                              <tr key={visit.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-3">
                                  <div className="font-medium text-gray-900">{visit.clientName}</div>
                                  <div className="text-sm text-gray-500">
                                    {visit.duration} min • {getVisitTypeLabel(visit.visitType)}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="font-medium">
                                    {getPropertyTypeLabel(visit.property?.type)} - {getOperationTypeLabel(visit.property?.operation)}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {visit.property?.address?.street}
                                  </div>
                                  {visit.property?.price && (
                                    <div className="text-sm text-gray-500">
                                      €{visit.property.price.toLocaleString()}
                                    </div>
                                  )}
                                </td>
                                <td className="p-3">
                                  <div className="font-medium">
                                    {visit.scheduledDate?.toLocaleDateString?.('pt-PT') || 'Data inválida'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {visit.scheduledTime || 'Hora não definida'}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                                    {visit.status}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex justify-center relative">
                                    <button
                                      onClick={() => setOpenDropdown(openDropdown === visit.id ? null : visit.id)}
                                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                                    >
                                      <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
                                    </button>
                                    
                                    {openDropdown === visit.id && (
                                      <div className="absolute right-0 z-10 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                                        <div className="py-1">
                                          <button
                                            onClick={() => {
                                              setSelectedVisit(visit);
                                              setShowConfirmModal(true);
                                              setOpenDropdown(null);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                          >
                                            Confirmar Visita
                                          </button>
                                          <button
                                            onClick={() => {
                                              setSelectedVisit(visit);
                                              setShowFeedbackModal(true);
                                              setOpenDropdown(null);
                                            }}
                                            className="block w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                                          >
                                            Adicionar Feedback
                                          </button>
                                          <div className="border-t border-gray-100 my-1"></div>
                                          <button
                                            onClick={() => handleCancelVisit(visit.id, visit.clientName)}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                          >
                                            Cancelar Visita
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhuma visita agendada</h3>
                        <p className="mt-1 text-sm text-gray-500">Comece agendando uma nova visita.</p>
                        <div className="mt-6">
                          <ThemedButton onClick={() => setShowCreateForm(true)}>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Agendar Primeira Visita
                          </ThemedButton>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Vista de Calendário</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Funcionalidade em desenvolvimento. Use a vista em lista por enquanto.
                    </p>
                    <div className="mt-6">
                      <ThemedButton onClick={() => setViewMode('list')}>
                        Ver Lista
                      </ThemedButton>
                    </div>
                  </div>
                )}
              </ThemedCard>
            </div>

            {/* Coluna Lateral - Filtros e Ações Rápidas */}
            <div className="space-y-6">
              
              {/* Filtros */}
              <ThemedCard className="p-4">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Filtros
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={filters?.status || ''}
                      onChange={(e) => setFilters?.(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Todos</option>
                      <option value="agendada">Agendada</option>
                      <option value="confirmada">Confirmada</option>
                      <option value="realizada">Realizada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Visita
                    </label>
                    <select
                      value={filters?.visitType || ''}
                      onChange={(e) => setFilters?.(prev => ({ ...prev, visitType: e.target.value }))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Todos</option>
                      <option value="presencial">Presencial</option>
                      <option value="virtual">Virtual</option>
                      <option value="avaliacao">Avaliação</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data
                    </label>
                    <input
                      type="date"
                      value={filters?.date || ''}
                      onChange={(e) => setFilters?.(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </ThemedCard>

              {/* Ações Rápidas */}
              <ThemedCard className="p-4">
                <h4 className="font-medium text-gray-900 mb-4">
                  Ações Rápidas
                </h4>
                
                <div className="space-y-2">
                  <ThemedButton
                    onClick={() => setShowCreateForm(true)}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Nova Visita
                  </ThemedButton>
                  
                  <ThemedButton
                    onClick={() => navigate('/calendar')}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    Ver Calendário
                  </ThemedButton>
                  
                  <ThemedButton
                    onClick={() => navigate('/clients')}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                  >
                    <UserIcon className="w-4 h-4" />
                    Gestão Clientes
                  </ThemedButton>
                </div>
              </ThemedCard>
            </div>
          </div>

          {/* MODAIS MANTIDOS IDÊNTICOS - Formulário de Criação */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Agendar Nova Visita</h3>
                  
                  <form onSubmit={handleCreateSubmit} className="space-y-6">
                    {/* Informações do Cliente */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Cliente</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cliente *
                          </label>
                          <select
                            required
                            value={formData.clientId}
                            onChange={(e) => {
                              const selectedClient = clients?.find(c => c.id === e.target.value);
                              handleFormChange('clientId', e.target.value);
                              handleFormChange('clientName', selectedClient?.name || '');
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Selecionar cliente...</option>
                            {clients?.map(client => (
                              <option key={client.id} value={client.id}>
                                {client.name} - {client.phone}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome do Cliente
                          </label>
                          <input
                            type="text"
                            value={formData.clientName}
                            onChange={(e) => handleFormChange('clientName', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nome será preenchido automaticamente"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    {/* Data e Hora */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Data e Hora</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data *
                          </label>
                          <input
                            type="date"
                            required
                            value={formData.scheduledDate}
                            onChange={(e) => handleFormChange('scheduledDate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hora *
                          </label>
                          <input
                            type="time"
                            required
                            value={formData.scheduledTime}
                            onChange={(e) => handleFormChange('scheduledTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Duração (min)
                          </label>
                          <select
                            value={formData.duration}
                            onChange={(e) => handleFormChange('duration', parseInt(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value={30}>30 minutos</option>
                            <option value={60}>1 hora</option>
                            <option value={90}>1h 30min</option>
                            <option value={120}>2 horas</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Dados do Imóvel */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-3">Dados do Imóvel</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Morada *
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.property.address.street}
                            onChange={(e) => handleFormChange('property.address.street', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Rua, número, andar..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cidade
                          </label>
                          <input
                            type="text"
                            value={formData.property.address.city}
                            onChange={(e) => handleFormChange('property.address.city', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Lisboa"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas da Visita
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => handleFormChange('notes', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Informações adicionais sobre a visita..."
                      />
                    </div>

                    {/* Botões do formulário */}
                    <div className="flex justify-end space-x-3 pt-4">
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
                      >
                        {creating ? 'Agendando...' : 'Agendar Visita'}
                      </ThemedButton>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Confirmação */}
          {showConfirmModal && selectedVisit && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Confirmar Visita</h3>
                <p className="text-gray-600 mb-4">
                  Confirmar visita de <strong>{selectedVisit.clientName}</strong>?
                </p>
                <div className="flex justify-end space-x-3">
                  <ThemedButton
                    variant="outline"
                    onClick={() => {
                      setShowConfirmModal(false);
                      setSelectedVisit(null);
                    }}
                  >
                    Cancelar
                  </ThemedButton>
                  <ThemedButton
                    onClick={() => handleConfirmVisit(selectedVisit.id)}
                    disabled={confirming}
                  >
                    {confirming ? 'Confirmando...' : 'Confirmar'}
                  </ThemedButton>
                </div>
              </div>
            </div>
          )}

          {/* Modal de Feedback */}
          {showFeedbackModal && selectedVisit && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-lg">
                <h3 className="text-lg font-semibold mb-4">Feedback da Visita</h3>
                <p className="text-gray-600 mb-4">
                  Cliente: <strong>{selectedVisit.clientName}</strong>
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Resultado da Visita
                    </label>
                    <select
                      value={feedbackForm.outcome}
                      onChange={(e) => setFeedbackForm(prev => ({ ...prev, outcome: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="interessado">Interessado</option>
                      <option value="muito_interessado">Muito Interessado</option>
                      <option value="neutro">Neutro</option>
                      <option value="nao_interessado">Não Interessado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Feedback do Consultor *
                    </label>
                    <textarea
                      value={feedbackForm.feedback}
                      onChange={(e) => setFeedbackForm(prev => ({ ...prev, feedback: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Como correu a visita..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6">
                  <ThemedButton
                    variant="outline"
                    onClick={() => {
                      setShowFeedbackModal(false);
                      setSelectedVisit(null);
                      setFeedbackForm({
                        outcome: 'interessado',
                        feedback: '',
                        client_feedback: '',
                        next_steps: '',
                        follow_up_date: ''
                      });
                    }}
                  >
                    Cancelar
                  </ThemedButton>
                  <ThemedButton
                    onClick={handleAddFeedback}
                  >
                    Salvar Feedback
                  </ThemedButton>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VisitsPage;