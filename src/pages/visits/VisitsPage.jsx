// src/pages/visits/VisitsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ThemedContainer, ThemedCard, ThemedButton } from '../../components/common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';
import useVisits from '../../hooks/useVisits';
import useClients from '../../hooks/useClients';

// 🎯 PÁGINA PRINCIPAL DO MÓDULO DE VISITAS
// ========================================
// MyImoMate 3.0 - Interface completa para gestão de visitas (CORE DO NEGÓCIO)
// Funcionalidades: Agendamento, Confirmações, Feedback, Partilhas, Lembretes

const VisitsPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Hook personalizado de visitas
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

  // Hook de clientes para seleção
  const { clients } = useClients();

  // Estados locais
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [viewMode, setViewMode] = useState('list'); // list, calendar

  // Estados do formulário de agendamento
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

  // Estados do formulário de feedback
  const [feedbackForm, setFeedbackForm] = useState({
    outcome: VISIT_OUTCOMES?.INTERESSADO || 'interessado',
    feedback: '',
    client_feedback: '',
    next_steps: '',
    follow_up_date: ''
  });

  // Estados do formulário de partilha
  const [shareForm, setShareForm] = useState({
    consultorIds: [],
    notes: ''
  });

  // Obter estatísticas
  const stats = getVisitStats?.() || { total: 0, today: 0, upcoming: 0, confirmed: 0, conversion_rate: 0 };

  // 📝 MANIPULAR MUDANÇAS NO FORMULÁRIO DE AGENDAMENTO
  const handleFormChange = (field, value) => {
    if (field.includes('.')) {
      const parts = field.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      } else if (parts.length === 3) {
        const [parent, middle, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [middle]: {
              ...prev[parent][middle],
              [child]: value
            }
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  // 📝 MANIPULAR MUDANÇAS NO FORMULÁRIO DE FEEDBACK
  const handleFeedbackChange = (field, value) => {
    setFeedbackForm(prev => ({ ...prev, [field]: value }));
  };

  // 🔄 RESET DO FORMULÁRIO DE AGENDAMENTO
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

  // 📝 SUBMETER FORMULÁRIO DE AGENDAMENTO
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Combinar data e hora
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      const visitData = {
        ...formData,
        scheduledDate: scheduledDateTime
      };

      const result = await createVisit(visitData);
      
      if (result?.success) {
        setFeedbackMessage('Visita agendada com sucesso!');
        setFeedbackType('success');
        setShowCreateForm(false);
        resetForm();
      } else {
        setFeedbackMessage(result?.message || 'Erro ao agendar visita');
        setFeedbackType('error');
      }
    } catch (err) {
      setFeedbackMessage(`Erro inesperado: ${err.message}`);
      setFeedbackType('error');
    }
  };

  // 📝 SUBMETER FEEDBACK DA VISITA
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedVisit) return;

    try {
      const result = await addVisitFeedback(selectedVisit.id, feedbackForm);
      
      if (result?.success) {
        setFeedbackMessage('Feedback registado com sucesso!');
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
        setFeedbackMessage(result?.error || 'Erro ao registar feedback');
        setFeedbackType('error');
      }
    } catch (err) {
      setFeedbackMessage(`Erro inesperado: ${err.message}`);
      setFeedbackType('error');
    }
  };

  // ✅ CONFIRMAR VISITA
  const handleConfirmVisit = async (visitId, confirmerType = 'consultor') => {
    const result = await confirmVisit(visitId, confirmerType);
    
    if (result?.success) {
      setFeedbackMessage(result.message);
      setFeedbackType('success');
    } else {
      setFeedbackMessage(result?.error || 'Erro ao confirmar visita');
      setFeedbackType('error');
    }
  };

  // 🔄 ATUALIZAR STATUS
  const handleStatusChange = async (visitId, newStatus) => {
    const result = await updateVisitStatus(visitId, newStatus);
    
    if (result?.success) {
      setFeedbackMessage('Status atualizado com sucesso!');
      setFeedbackType('success');
    } else {
      setFeedbackMessage(result?.error || 'Erro ao atualizar status');
      setFeedbackType('error');
    }
  };

  // 📞 ADICIONAR FEEDBACK RÁPIDO
  const handleQuickFeedback = (visit) => {
    setSelectedVisit(visit);
    setShowFeedbackModal(true);
  };

  // 🤝 PARTILHAR VISITA
  const handleShareVisit = async () => {
    if (!selectedVisit) return;

    try {
      const result = await shareVisit(selectedVisit.id, shareForm.consultorIds, shareForm.notes);
      
      if (result?.success) {
        setFeedbackMessage('Visita partilhada com sucesso!');
        setFeedbackType('success');
        setShowShareModal(false);
        setSelectedVisit(null);
        setShareForm({ consultorIds: [], notes: '' });
      } else {
        setFeedbackMessage(result?.error || 'Erro ao partilhar visita');
        setFeedbackType('error');
      }
    } catch (err) {
      setFeedbackMessage(`Erro inesperado: ${err.message}`);
      setFeedbackType('error');
    }
  };

  // ❌ CANCELAR VISITA
  const handleCancelVisit = async (visitId, visitClient) => {
    const reason = window.prompt(`Motivo do cancelamento da visita com ${visitClient}:`);
    if (reason === null) return; // User cancelled

    const result = await cancelVisit(visitId, reason);
    
    if (result?.success) {
      setFeedbackMessage('Visita cancelada com sucesso!');
      setFeedbackType('success');
    } else {
      setFeedbackMessage(result?.error || 'Erro ao cancelar visita');
      setFeedbackType('error');
    }
  };

  // 🔍 OBTER RÓTULOS LEGÍVEIS
  const getPropertyTypeLabel = (type) => {
    const labels = {
      'casa': 'Casa',
      'apartamento': 'Apartamento',
      'terreno': 'Terreno',
      'comercial': 'Comercial',
      'escritorio': 'Escritório',
      'armazem': 'Armazém',
      'quintas': 'Quinta',
      'outros': 'Outros'
    };
    return labels[type] || type;
  };

  const getOperationTypeLabel = (type) => {
    const labels = {
      'venda': 'Venda',
      'arrendamento': 'Arrendamento',
      'investimento': 'Investimento',
      'avaliacao': 'Avaliação'
    };
    return labels[type] || type;
  };

  const getVisitTypeLabel = (type) => {
    const labels = {
      'presencial': 'Presencial',
      'virtual': 'Virtual',
      'avaliacao': 'Avaliação',
      'segunda_visita': 'Segunda Visita',
      'visita_tecnica': 'Visita Técnica'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status) => {
    const labels = {
      'agendada': 'Agendada',
      'confirmada_cliente': 'Confirmada Cliente',
      'confirmada_consultor': 'Confirmada Consultor',
      'confirmada_ambos': 'Confirmada Ambos',
      'em_curso': 'Em Curso',
      'realizada': 'Realizada',
      'nao_compareceu': 'Não Compareceu',
      'cancelada': 'Cancelada',
      'reagendada': 'Reagendada'
    };
    return labels[status] || status;
  };

  // 📅 OBTER PRÓXIMAS DATAS DISPONÍVEIS
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // mínimo 1 hora no futuro
    return now.toISOString().slice(0, 16);
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
    <DashboardLayout>
      <ThemedContainer className="space-y-6">
        
        {/* HEADER COM TÍTULO E ESTATÍSTICAS */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sistema de Visitas
            </h1>
            <p className="text-gray-600">
              Agendamento, confirmações e gestão completa de visitas imobiliárias
            </p>
          </div>

          {/* Estatísticas rápidas */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.today}</div>
              <div className="text-sm text-gray-500">Hoje</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.upcoming}</div>
              <div className="text-sm text-gray-500">Próximas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.confirmed}</div>
              <div className="text-sm text-gray-500">Confirmadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">{stats.conversion_rate}%</div>
              <div className="text-sm text-gray-500">Taxa Conversão</div>
            </div>
          </div>
        </div>

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
            
            {/* Botão Agendar Visita */}
            <ThemedButton
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="lg:w-auto"
              disabled={creating}
            >
              {creating ? '⏳ Agendando...' : '📅 Agendar Visita'}
            </ThemedButton>

            {/* Alternância de View */}
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                📋 Lista
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 text-sm font-medium ${
                  viewMode === 'calendar' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                📅 Calendário
              </button>
            </div>

            {/* Filtros */}
            <div className="flex gap-2 flex-1">
              {/* Filtro por Status */}
              <select
                value={filters?.status || ''}
                onChange={(e) => setFilters?.(prev => ({ ...prev, status: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os Status</option>
                <option value="agendada">Agendada</option>
                <option value="confirmada">Confirmada</option>
                <option value="realizada">Realizada</option>
                <option value="cancelada">Cancelada</option>
              </select>

              {/* Filtro por Tipo de Visita */}
              <select
                value={filters?.visitType || ''}
                onChange={(e) => setFilters?.(prev => ({ ...prev, visitType: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os Tipos</option>
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
                <option value="avaliacao">Avaliação</option>
              </select>

              {/* Filtro por Data */}
              <select
                value={filters?.dateRange || 'upcoming'}
                onChange={(e) => setFilters?.(prev => ({ ...prev, dateRange: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="upcoming">Próximas</option>
                <option value="today">Hoje</option>
                <option value="week">Esta Semana</option>
                <option value="past">Passadas</option>
                <option value="all">Todas</option>
              </select>
            </div>
          </div>
        </ThemedCard>

        {/* FORMULÁRIO DE AGENDAMENTO */}
        {showCreateForm && (
          <ThemedCard className="p-6">
            <h3 className="text-xl font-bold mb-4">Agendar Nova Visita</h3>
            
            <form onSubmit={handleCreateSubmit} className="space-y-6">
              
              {/* DADOS DA VISITA */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Dados da Visita</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Cliente */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cliente *
                    </label>
                    <select
                      value={formData.clientId}
                      onChange={(e) => {
                        const selectedClient = clients?.find(c => c.id === e.target.value);
                        handleFormChange('clientId', e.target.value);
                        handleFormChange('clientName', selectedClient?.name || '');
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Selecionar cliente</option>
                      {clients?.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.name} - {client.phone || client.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tipo de Visita */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Visita
                    </label>
                    <select
                      value={formData.visitType}
                      onChange={(e) => handleFormChange('visitType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="presencial">Presencial</option>
                      <option value="virtual">Virtual</option>
                      <option value="avaliacao">Avaliação</option>
                      <option value="segunda_visita">Segunda Visita</option>
                      <option value="visita_tecnica">Visita Técnica</option>
                    </select>
                  </div>

                  {/* Data */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data *
                    </label>
                    <input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => handleFormChange('scheduledDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Hora */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora *
                    </label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => handleFormChange('scheduledTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Duração */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duração (minutos)
                    </label>
                    <select
                      value={formData.duration}
                      onChange={(e) => handleFormChange('duration', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={30}>30 minutos</option>
                      <option value={60}>1 hora</option>
                      <option value={90}>1h30</option>
                      <option value={120}>2 horas</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* DADOS DO IMÓVEL */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">Dados do Imóvel</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  
                  {/* Tipo de Imóvel */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Imóvel *
                    </label>
                    <select
                      value={formData.property.type}
                      onChange={(e) => handleFormChange('property.type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="apartamento">Apartamento</option>
                      <option value="casa">Casa</option>
                      <option value="terreno">Terreno</option>
                      <option value="comercial">Comercial</option>
                      <option value="escritorio">Escritório</option>
                      <option value="armazem">Armazém</option>
                    </select>
                  </div>

                  {/* Operação */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Operação
                    </label>
                    <select
                      value={formData.property.operation}
                      onChange={(e) => handleFormChange('property.operation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="venda">Venda</option>
                      <option value="arrendamento">Arrendamento</option>
                      <option value="investimento">Investimento</option>
                      <option value="avaliacao">Avaliação</option>
                    </select>
                  </div>

                  {/* Preço */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preço (€)
                    </label>
                    <input
                      type="number"
                      value={formData.property.price}
                      onChange={(e) => handleFormChange('property.price', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="250000"
                    />
                  </div>

                  {/* Morada */}
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Morada *
                    </label>
                    <input
                      type="text"
                      value={formData.property.address.street}
                      onChange={(e) => handleFormChange('property.address.street', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Rua da República, 123, Lisboa"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Botões do formulário */}
              <div className="flex gap-3 pt-4">
                <ThemedButton
                  type="submit"
                  disabled={creating}
                  className="flex-1 md:flex-none"
                >
                  {creating ? '⏳ Agendando...' : '📅 Agendar Visita'}
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

        {/* LISTA DE VISITAS */}
        <ThemedCard className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold">
              {viewMode === 'list' ? 'Lista de Visitas' : 'Calendário de Visitas'} ({visits?.length || 0})
            </h3>
            {loading && (
              <p className="text-gray-500 mt-2">⏳ Carregando visitas...</p>
            )}
            {error && (
              <p className="text-red-600 mt-2">❌ {error}</p>
            )}
          </div>

          {/* Vista Lista */}
          {viewMode === 'list' && (
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
                          
                          {/* Cliente */}
                          <td className="p-3">
                            <div className="font-medium text-gray-900">{visit.clientName}</div>
                            <div className="text-sm text-gray-500">
                              {visit.duration} min • {getVisitTypeLabel(visit.visitType)}
                            </div>
                          </td>

                          {/* Imóvel */}
                          <td className="p-3">
                            <div className="font-medium">
                              {getPropertyTypeLabel(visit.property?.type)} - {getOperationTypeLabel(visit.property?.operation)}
                            </div>
                            <div className="text-sm text-gray-500">
                              📍 {visit.property?.address?.street}
                            </div>
                            {visit.property?.price && (
                              <div className="text-sm text-gray-500">
                                💰 €{visit.property.price.toLocaleString()}
                              </div>
                            )}
                          </td>

                          {/* Data/Hora */}
                          <td className="p-3">
                            <div className="font-medium">
                              {visit.scheduledDate?.toLocaleDateString?.('pt-PT') || 'N/A'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ⏰ {visit.scheduledDate?.toLocaleTimeString?.('pt-PT', { hour: '2-digit', minute: '2-digit' }) || 'N/A'}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              VISIT_STATUS_COLORS?.[visit.status] || 'bg-gray-100 text-gray-800'
                            }`}>
                              {getStatusLabel(visit.status)}
                            </span>
                            {visit.is_shared && (
                              <div className="text-xs text-blue-600 mt-1">🤝 Partilhada</div>
                            )}
                          </td>

                          {/* Ações */}
                          <td className="p-3">
                            <div className="flex justify-center gap-1 flex-wrap">
                              
                              {/* Confirmar Visita */}
                              {visit.status === 'agendada' && (
                                <button
                                  onClick={() => handleConfirmVisit(visit.id, 'consultor')}
                                  disabled={confirming}
                                  className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded"
                                  title="Confirmar como Consultor"
                                >
                                  ✅
                                </button>
                              )}

                              {/* Adicionar Feedback */}
                              {visit.status === 'confirmada_ambos' && (
                                <button
                                  onClick={() => handleQuickFeedback(visit)}
                                  className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded"
                                  title="Adicionar Feedback"
                                >
                                  📝
                                </button>
                              )}

                              {/* Partilhar */}
                              <button
                                onClick={() => {
                                  setSelectedVisit(visit);
                                  setShowShareModal(true);
                                }}
                                className="text-purple-600 hover:text-purple-800 text-xs px-2 py-1 rounded"
                                title="Partilhar Visita"
                              >
                                🤝
                              </button>

                              {/* Cancelar */}
                              {visit.status !== 'cancelada' && visit.status !== 'realizada' && (
                                <button
                                  onClick={() => handleCancelVisit(visit.id, visit.clientName)}
                                  className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded"
                                  title="Cancelar Visita"
                                >
                                  ❌
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                // Estado vazio
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-medium text-gray-900 mb-2">
                    Nenhuma visita encontrada
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {Object.values(filters || {}).some(f => f) && filters?.dateRange !== 'upcoming'
                      ? 'Tente ajustar os filtros de pesquisa'
                      : 'Comece agendando a sua primeira visita'
                    }
                  </p>
                  {!showCreateForm && (
                    <ThemedButton
                      onClick={() => setShowCreateForm(true)}
                    >
                      📅 Agendar Primeira Visita
                    </ThemedButton>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Vista Calendário - Placeholder */}
          {viewMode === 'calendar' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Vista de Calendário
              </h3>
              <p className="text-gray-500 mb-6">
                Funcionalidade em desenvolvimento. Use a vista de lista por agora.
              </p>
              <button
                onClick={() => setViewMode('list')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                📋 Ver Lista
              </button>
            </div>
          )}
        </ThemedCard>

        {/* MODAL DE FEEDBACK */}
        {showFeedbackModal && selectedVisit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Feedback da Visita</h3>
              
              <div className="mb-4">
                <p className="text-gray-600">
                  <strong>Cliente:</strong> {selectedVisit.clientName}<br/>
                  <strong>Imóvel:</strong> {getPropertyTypeLabel(selectedVisit.property?.type)} - {selectedVisit.property?.address?.street}
                </p>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Resultado da Visita
                  </label>
                  <select
                    value={feedbackForm.outcome}
                    onChange={(e) => handleFeedbackChange('outcome', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="interessado">Interessado</option>
                    <option value="nao_interessado">Não Interessado</option>
                    <option value="proposta">Fez Proposta</option>
                    <option value="segunda_visita">Segunda Visita</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações do Consultor
                  </label>
                  <textarea
                    value={feedbackForm.feedback}
                    onChange={(e) => handleFeedbackChange('feedback', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Como correu a visita, pontos positivos/negativos..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <ThemedButton
                    type="submit"
                    disabled={updating}
                    className="flex-1"
                  >
                    {updating ? '⏳ Registando...' : '✅ Registar Feedback'}
                  </ThemedButton>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowFeedbackModal(false);
                      setSelectedVisit(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE PARTILHA */}
        {showShareModal && selectedVisit && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold mb-4">Partilhar Visita</h3>
              
              <div className="mb-4">
                <p className="text-gray-600">
                  <strong>Visita:</strong> {selectedVisit.clientName}<br/>
                  <strong>Data:</strong> {selectedVisit.scheduledDate?.toLocaleDateString?.('pt-PT') || 'N/A'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas da Partilha
                  </label>
                  <textarea
                    value={shareForm.notes}
                    onChange={(e) => setShareForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Motivo da partilha, instruções especiais..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleShareVisit}
                    disabled={true} // Temporariamente desabilitado
                    className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed"
                  >
                    🤝 Partilhar (Em breve)
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowShareModal(false);
                      setSelectedVisit(null);
                      setShareForm({ consultorIds: [], notes: '' });
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </ThemedContainer>
    </DashboardLayout>
  );
};

export default VisitsPage;