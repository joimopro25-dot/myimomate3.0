// src/pages/opportunities/OpportunitiesPage.jsx
import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedButton, ThemedContainer } from '../../components/common/ThemedComponents';
import useOpportunities from '../../hooks/useOpportunities';
import useClients from '../../hooks/useClients';

// Interface principal do Sistema de Oportunidades
// Pipeline de vendas com dashboard, criação e gestão completa

const OpportunitiesPage = () => {
  const { theme } = useTheme();
  
  // Hooks principais
  const {
    opportunities,
    loading,
    error,
    creating,
    createOpportunity,
    updateOpportunityStatus,
    deleteOpportunity,
    addActivity,
    getOpportunityStats,
    OPPORTUNITY_STATUS,
    OPPORTUNITY_TYPES,
    OPPORTUNITY_PRIORITIES,
    STATUS_COLORS,
    formatCurrency,
    calculateCommission
  } = useOpportunities();

  const { clients } = useClients();

  // Estados da interface
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, pipeline, list, create
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    clientId: ''
  });

  // Estados do formulário
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    type: 'venda',
    priority: 'media',
    status: 'identificacao',
    totalValue: '',
    commissionPercentage: '',
    expectedCloseDate: '',
    propertyType: '',
    propertyAddress: '',
    source: 'client_direct'
  });

  // Estados de atividade
  const [activityForm, setActivityForm] = useState({
    type: 'call',
    subject: '',
    description: '',
    outcome: 'positive'
  });

  // Estatísticas calculadas
  const stats = getOpportunityStats;

  // Filtrar oportunidades
  const filteredOpportunities = opportunities.filter(opp => {
    if (filters.status && opp.status !== filters.status) return false;
    if (filters.type && opp.type !== filters.type) return false;
    if (filters.priority && opp.priority !== filters.priority) return false;
    if (filters.clientId && opp.clientId !== filters.clientId) return false;
    return true;
  });

  // Agrupar por status para pipeline
  const opportunitiesByStatus = Object.values(OPPORTUNITY_STATUS).reduce((acc, status) => {
    acc[status] = filteredOpportunities.filter(opp => opp.status === status);
    return acc;
  }, {});

  // Manipular criação
  const handleCreate = async (e) => {
    e.preventDefault();
    
    const result = await createOpportunity({
      ...formData,
      commissionValue: calculateCommission(formData.totalValue, formData.commissionPercentage),
      expectedCloseDate: formData.expectedCloseDate ? new Date(formData.expectedCloseDate) : null
    });

    if (result.success) {
      setShowCreateForm(false);
      resetForm();
    }
  };

  // Reset do formulário
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      clientId: '',
      type: 'venda',
      priority: 'media',
      status: 'identificacao',
      totalValue: '',
      commissionPercentage: '',
      expectedCloseDate: '',
      propertyType: '',
      propertyAddress: '',
      source: 'client_direct'
    });
  };

  // Manipular status
  const handleStatusChange = async (opportunityId, newStatus) => {
    await updateOpportunityStatus(opportunityId, newStatus);
  };

  // Adicionar atividade
  const handleAddActivity = async (e) => {
    e.preventDefault();
    
    if (!selectedOpportunity) return;

    const result = await addActivity(selectedOpportunity.id, activityForm);
    
    if (result.success) {
      setShowActivityModal(false);
      setActivityForm({ type: 'call', subject: '', description: '', outcome: 'positive' });
    }
  };

  // Obter nome do cliente
  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
  };

  // Obter cor do status
  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  };

  // Render do dashboard
  const renderDashboard = () => (
    <div className="space-y-6">
      
      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <span className="text-xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Oportunidades</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <span className="text-xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor do Pipeline</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.pipelineValue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <span className="text-xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-gray-900">{stats.conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <span className="text-xl">💎</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Valor Médio</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico por status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Oportunidades por Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(status)}`}>
                {status.replace('_', ' ')}
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render do pipeline visual
  const renderPipeline = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Pipeline de Vendas</h3>
      </div>
      
      <div className="p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {Object.values(OPPORTUNITY_STATUS).filter(status => 
            status !== 'fechado_perdido' && status !== 'pausado'
          ).map(status => (
            <div key={status} className="flex-shrink-0 w-80">
              <div className={`p-3 rounded-lg mb-4 ${getStatusColor(status)}`}>
                <h4 className="font-medium text-center">
                  {status.replace('_', ' ').toUpperCase()}
                </h4>
                <p className="text-sm text-center mt-1">
                  {opportunitiesByStatus[status]?.length || 0} oportunidades
                </p>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {opportunitiesByStatus[status]?.map(opp => (
                  <div key={opp.id} className="bg-gray-50 p-4 rounded-lg border">
                    <h5 className="font-medium text-gray-900">{opp.title}</h5>
                    <p className="text-sm text-gray-600 mt-1">{getClientName(opp.clientId)}</p>
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      {formatCurrency(opp.totalValue)}
                    </p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setSelectedOpportunity(opp);
                          setShowActivityModal(true);
                        }}
                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                      >
                        + Atividade
                      </button>
                      {status !== 'fechado_ganho' && (
                        <select
                          value={opp.status}
                          onChange={(e) => handleStatusChange(opp.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-1"
                        >
                          {Object.entries(OPPORTUNITY_STATUS).map(([key, value]) => (
                            <option key={value} value={value}>
                              {key.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render da lista
  const renderList = () => (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Lista de Oportunidades</h3>
          
          {/* Filtros */}
          <div className="flex gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todos os status</option>
              {Object.entries(OPPORTUNITY_STATUS).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.replace('_', ' ')}
                </option>
              ))}
            </select>
            
            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todos os tipos</option>
              {Object.entries(OPPORTUNITY_TYPES).map(([key, value]) => (
                <option key={value} value={value}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Oportunidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Valor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Probabilidade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOpportunities.map(opp => (
              <tr key={opp.id}>
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{opp.title}</div>
                    <div className="text-sm text-gray-500">{opp.type}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {getClientName(opp.clientId)}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(opp.status)}`}>
                    {opp.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatCurrency(opp.totalValue)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {opp.probability}%
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedOpportunity(opp);
                        setShowActivityModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      💬
                    </button>
                    <button
                      onClick={() => deleteOpportunity(opp.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render do formulário de criação
  const renderCreateForm = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-6">Nova Oportunidade</h3>
      
      <form onSubmit={handleCreate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Título */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título da Oportunidade *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Venda de apartamento T2"
              required
            />
          </div>

          {/* Cliente */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cliente *
            </label>
            <select
              value={formData.clientId}
              onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecionar cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(OPPORTUNITY_TYPES).map(([key, value]) => (
                <option key={value} value={value}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Total (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.totalValue}
              onChange={(e) => setFormData(prev => ({ ...prev, totalValue: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="250000"
            />
          </div>

          {/* Comissão */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comissão (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.commissionPercentage}
              onChange={(e) => setFormData(prev => ({ ...prev, commissionPercentage: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="3"
            />
          </div>

          {/* Descrição */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Detalhes da oportunidade..."
            />
          </div>
        </div>

        <div className="flex gap-3">
          <ThemedButton type="submit" disabled={creating}>
            {creating ? 'Criando...' : 'Criar Oportunidade'}
          </ThemedButton>
          
          <button
            type="button"
            onClick={() => {
              setShowCreateForm(false);
              resetForm();
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <ThemedContainer>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sistema de Oportunidades</h1>
            <p className="text-gray-600">Gestão completa do pipeline de vendas</p>
          </div>
          
          <ThemedButton onClick={() => setShowCreateForm(true)}>
            + Nova Oportunidade
          </ThemedButton>
        </div>

        {/* Navegação das vistas */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'pipeline', label: 'Pipeline', icon: '🎯' },
              { id: 'list', label: 'Lista', icon: '📋' }
            ].map(view => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeView === view.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {view.icon} {view.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Conteúdo */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-gray-600">Carregando oportunidades...</p>
          </div>
        ) : showCreateForm ? (
          renderCreateForm()
        ) : activeView === 'dashboard' ? (
          renderDashboard()
        ) : activeView === 'pipeline' ? (
          renderPipeline()
        ) : (
          renderList()
        )}

        {/* Modal de atividade */}
        {showActivityModal && selectedOpportunity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold mb-4">
                Nova Atividade - {selectedOpportunity.title}
              </h3>
              
              <form onSubmit={handleAddActivity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo
                  </label>
                  <select
                    value={activityForm.type}
                    onChange={(e) => setActivityForm(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="call">Chamada</option>
                    <option value="email">Email</option>
                    <option value="meeting">Reunião</option>
                    <option value="note">Nota</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assunto
                  </label>
                  <input
                    type="text"
                    value={activityForm.subject}
                    onChange={(e) => setActivityForm(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    value={activityForm.description}
                    onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <ThemedButton type="submit">
                    Adicionar
                  </ThemedButton>
                  
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ThemedContainer>
  );
};

export default OpportunitiesPage;