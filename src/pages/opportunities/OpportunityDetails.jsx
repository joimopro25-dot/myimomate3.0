// src/components/opportunities/OpportunityDetails.jsx
import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedButton } from '../common/ThemedComponents';
import useOpportunities from '../../hooks/useOpportunities';

// Componente de detalhes e atividades da oportunidade
// Modal ou painel lateral com informações completas e gestão de atividades

const OpportunityDetails = ({
  opportunity,
  onClose,
  onUpdate,
  clients = [],
  isModal = true
}) => {
  const { theme } = useTheme();
  
  const {
    updateOpportunity,
    addActivity,
    OPPORTUNITY_STATUS,
    OPPORTUNITY_TYPES,
    OPPORTUNITY_PRIORITIES,
    STATUS_COLORS,
    formatCurrency,
    calculateCommission
  } = useOpportunities();

  // Estados do componente
  const [activeTab, setActiveTab] = useState('details'); // details, activities, edit
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(opportunity || {});
  const [newActivity, setNewActivity] = useState({
    type: 'call',
    subject: '',
    description: '',
    outcome: 'positive'
  });

  // Estados de loading
  const [updating, setUpdating] = useState(false);
  const [addingActivity, setAddingActivity] = useState(false);

  if (!opportunity) return null;

  // Obter nome do cliente
  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Cliente não encontrado';
  };

  // Obter cor do status
  const getStatusColor = (status) => {
    return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  };

  // Calcular dias restantes para fecho
  const getDaysToClose = () => {
    if (!opportunity.expectedCloseDate) return null;
    const today = new Date();
    const closeDate = new Date(opportunity.expectedCloseDate);
    const diffTime = closeDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Atualizar oportunidade
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const result = await updateOpportunity(opportunity.id, {
        ...editData,
        commissionValue: calculateCommission(editData.totalValue, editData.commissionPercentage)
      });

      if (result.success) {
        setIsEditing(false);
        onUpdate?.(editData);
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    } finally {
      setUpdating(false);
    }
  };

  // Adicionar atividade
  const handleAddActivity = async (e) => {
    e.preventDefault();
    setAddingActivity(true);

    try {
      const result = await addActivity(opportunity.id, {
        ...newActivity,
        createdAt: new Date()
      });

      if (result.success) {
        setNewActivity({
          type: 'call',
          subject: '',
          description: '',
          outcome: 'positive'
        });
        // Recarregar dados se necessário
        onUpdate?.();
      }
    } catch (error) {
      console.error('Erro ao adicionar atividade:', error);
    } finally {
      setAddingActivity(false);
    }
  };

  // Render do cabeçalho
  const renderHeader = () => (
    <div className="flex justify-between items-start p-6 border-b border-gray-200">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{opportunity.title}</h2>
        <div className="flex items-center gap-3 mt-2">
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(opportunity.status)}`}>
            {opportunity.status.replace('_', ' ')}
          </span>
          <span className="text-sm text-gray-600">
            {getClientName(opportunity.clientId)}
          </span>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(opportunity.totalValue)}
          </span>
        </div>
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );

  // Render das tabs
  const renderTabs = () => (
    <div className="border-b border-gray-200">
      <nav className="flex px-6">
        {[
          { id: 'details', label: 'Detalhes', icon: '📋' },
          { id: 'activities', label: 'Atividades', icon: '💬' },
          { id: 'edit', label: 'Editar', icon: '✏️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 px-4 border-b-2 font-medium text-sm ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );

  // Render dos detalhes
  const renderDetails = () => {
    const daysToClose = getDaysToClose();
    
    return (
      <div className="p-6 space-y-6">
        
        {/* Informações principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Gerais</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Tipo</dt>
                <dd className="text-sm text-gray-900 capitalize">{opportunity.type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Prioridade</dt>
                <dd className="text-sm text-gray-900 capitalize">{opportunity.priority}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Origem</dt>
                <dd className="text-sm text-gray-900 capitalize">{opportunity.source?.replace('_', ' ')}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Probabilidade</dt>
                <dd className="text-sm text-gray-900">{opportunity.probability}%</dd>
              </div>
            </dl>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Valores Financeiros</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Valor Total</dt>
                <dd className="text-lg font-bold text-gray-900">{formatCurrency(opportunity.totalValue)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Comissão</dt>
                <dd className="text-sm text-gray-900">
                  {opportunity.commissionPercentage}% ({formatCurrency(opportunity.commissionValue)})
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Valor Esperado</dt>
                <dd className="text-sm font-bold text-green-600">
                  {formatCurrency((opportunity.totalValue || 0) * (opportunity.probability / 100))}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Datas importantes */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cronograma</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Criada em</dt>
              <dd className="text-sm text-gray-900">
                {opportunity.createdAt?.toLocaleDateString('pt-PT')}
              </dd>
            </div>
            {opportunity.expectedCloseDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Data Prevista Fecho</dt>
                <dd className="text-sm text-gray-900">
                  {opportunity.expectedCloseDate.toLocaleDateString('pt-PT')}
                  {daysToClose !== null && (
                    <span className={`ml-2 text-xs px-2 py-1 rounded ${
                      daysToClose < 0 ? 'bg-red-100 text-red-800' :
                      daysToClose < 7 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {daysToClose < 0 ? `${Math.abs(daysToClose)} dias atrasado` :
                       daysToClose === 0 ? 'Hoje' :
                       `${daysToClose} dias restantes`}
                    </span>
                  )}
                </dd>
              </div>
            )}
            {opportunity.actualCloseDate && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Data Real Fecho</dt>
                <dd className="text-sm text-gray-900">
                  {opportunity.actualCloseDate.toLocaleDateString('pt-PT')}
                </dd>
              </div>
            )}
          </div>
        </div>

        {/* Descrição */}
        {opportunity.description && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Descrição</h3>
            <p className="text-sm text-gray-600">{opportunity.description}</p>
          </div>
        )}

        {/* Propriedade */}
        {opportunity.propertyAddress && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Propriedade</h3>
            <p className="text-sm text-gray-600">{opportunity.propertyAddress}</p>
            {opportunity.propertyType && (
              <p className="text-sm text-gray-500 mt-1">Tipo: {opportunity.propertyType}</p>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render das atividades
  const renderActivities = () => (
    <div className="p-6">
      
      {/* Formulário de nova atividade */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Nova Atividade</h3>
        
        <form onSubmit={handleAddActivity} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={newActivity.type}
                onChange={(e) => setNewActivity(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="call">📞 Chamada</option>
                <option value="email">📧 Email</option>
                <option value="meeting">🤝 Reunião</option>
                <option value="whatsapp">💬 WhatsApp</option>
                <option value="note">📝 Nota</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Resultado
              </label>
              <select
                value={newActivity.outcome}
                onChange={(e) => setNewActivity(prev => ({ ...prev, outcome: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="positive">✅ Positivo</option>
                <option value="neutral">➖ Neutro</option>
                <option value="negative">❌ Negativo</option>
                <option value="follow_up">🔄 Requer Follow-up</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assunto
            </label>
            <input
              type="text"
              value={newActivity.subject}
              onChange={(e) => setNewActivity(prev => ({ ...prev, subject: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Assunto da atividade"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={newActivity.description}
              onChange={(e) => setNewActivity(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Detalhes da atividade..."
            />
          </div>

          <ThemedButton type="submit" disabled={addingActivity}>
            {addingActivity ? 'Adicionando...' : 'Adicionar Atividade'}
          </ThemedButton>
        </form>
      </div>

      {/* Lista de atividades */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Histórico de Atividades ({opportunity.activities?.length || 0})
        </h3>
        
        {opportunity.activities && opportunity.activities.length > 0 ? (
          <div className="space-y-4">
            {opportunity.activities.map((activity, index) => (
              <div key={activity.id || index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        {activity.type === 'call' ? '📞' :
                         activity.type === 'email' ? '📧' :
                         activity.type === 'meeting' ? '🤝' :
                         activity.type === 'whatsapp' ? '💬' : '📝'} 
                        {activity.subject}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        activity.outcome === 'positive' ? 'bg-green-100 text-green-800' :
                        activity.outcome === 'negative' ? 'bg-red-100 text-red-800' :
                        activity.outcome === 'follow_up' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {activity.outcome === 'positive' ? 'Positivo' :
                         activity.outcome === 'negative' ? 'Negativo' :
                         activity.outcome === 'follow_up' ? 'Follow-up' : 'Neutro'}
                      </span>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 ml-4">
                    {activity.createdAt instanceof Date ? 
                      activity.createdAt.toLocaleDateString('pt-PT') :
                      new Date(activity.createdAt).toLocaleDateString('pt-PT')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">💬</div>
            <p>Nenhuma atividade registada</p>
            <p className="text-sm">Adicione a primeira atividade acima</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render do formulário de edição
  const renderEdit = () => (
    <div className="p-6">
      <form onSubmit={handleUpdate} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={editData.title || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={editData.status || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {Object.entries(OPPORTUNITY_STATUS).map(([key, value]) => (
                <option key={value} value={value}>
                  {key.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Valor Total (€)
            </label>
            <input
              type="number"
              step="0.01"
              value={editData.totalValue || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, totalValue: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comissão (%)
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={editData.commissionPercentage || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, commissionPercentage: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prioridade
            </label>
            <select
              value={editData.priority || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              {Object.entries(OPPORTUNITY_PRIORITIES).map(([key, value]) => (
                <option key={value} value={value}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Prevista Fecho
            </label>
            <input
              type="date"
              value={editData.expectedCloseDate ? 
                (editData.expectedCloseDate instanceof Date ? 
                  editData.expectedCloseDate.toISOString().split('T')[0] :
                  editData.expectedCloseDate.split('T')[0]) : ''}
              onChange={(e) => setEditData(prev => ({ ...prev, expectedCloseDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={editData.description || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Descrição detalhada da oportunidade..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Endereço da Propriedade
          </label>
          <input
            type="text"
            value={editData.propertyAddress || ''}
            onChange={(e) => setEditData(prev => ({ ...prev, propertyAddress: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            placeholder="Rua da República, 123, Lisboa"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <ThemedButton type="submit" disabled={updating}>
            {updating ? 'Atualizando...' : 'Atualizar Oportunidade'}
          </ThemedButton>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab('details');
              setEditData(opportunity);
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );

  // Container principal
  const containerClass = isModal
    ? "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    : "w-full";

  const contentClass = isModal
    ? "bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
    : "bg-white rounded-lg shadow w-full";

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {renderHeader()}
        {renderTabs()}
        
        <div className={isModal ? "flex-1 overflow-y-auto" : ""}>
          {activeTab === 'details' && renderDetails()}
          {activeTab === 'activities' && renderActivities()}
          {activeTab === 'edit' && renderEdit()}
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetails;