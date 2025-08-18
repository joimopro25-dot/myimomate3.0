// src/components/deals/DealPipeline.jsx
import { useState, useMemo, useCallback } from 'react';
import { ThemedCard, ThemedButton } from '../common/ThemedComponents';
import { useTheme } from '../../contexts/ThemeContext';

// 🎯 PIPELINE VISUAL AVANÇADO PARA NEGÓCIOS
// ========================================
// MyImoMate 3.0 - Componente Kanban profissional
// Funcionalidades: Drag&Drop, Filtros, Métricas, Animações

const DealPipeline = ({ 
  deals = [], 
  onStatusUpdate, 
  onDealClick,
  onCreateDeal,
  formatCurrency,
  DEAL_STATUS,
  DEAL_STATUS_COLORS,
  DEAL_PRIORITY,
  getDealStats,
  loading = false 
}) => {
  const { theme } = useTheme();
  
  // Estados locais
  const [draggedDeal, setDraggedDeal] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [showMetrics, setShowMetrics] = useState(true);
  const [compactView, setCompactView] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('all');

  // Colunas do pipeline
  const pipelineColumns = useMemo(() => [
    {
      id: DEAL_STATUS?.PROPOSTA || 'proposta',
      title: 'Proposta',
      description: 'Propostas enviadas',
      icon: '📋',
      probability: 10
    },
    {
      id: DEAL_STATUS?.ACEITA || 'aceita',
      title: 'Aceita',
      description: 'Propostas aceitas',
      icon: '✅',
      probability: 25
    },
    {
      id: DEAL_STATUS?.NEGOCIACAO || 'negociacao',
      title: 'Negociação',
      description: 'Em negociação',
      icon: '💬',
      probability: 40
    },
    {
      id: DEAL_STATUS?.CONTRATO || 'contrato',
      title: 'Contrato',
      description: 'Preparação contrato',
      icon: '📄',
      probability: 60
    },
    {
      id: DEAL_STATUS?.ASSINADO || 'assinado',
      title: 'Assinado',
      description: 'Contrato assinado',
      icon: '✍️',
      probability: 75
    },
    {
      id: DEAL_STATUS?.FECHADO || 'fechado',
      title: 'Fechado',
      description: 'Negócio concluído',
      icon: '🎉',
      probability: 100
    }
  ], [DEAL_STATUS]);

  // Filtrar deals por prioridade
  const filteredDeals = useMemo(() => {
    if (selectedPriority === 'all') return deals;
    return deals.filter(deal => deal.priority === selectedPriority);
  }, [deals, selectedPriority]);

  // Agrupar deals por status
  const dealsByStatus = useMemo(() => {
    const grouped = {};
    pipelineColumns.forEach(column => {
      grouped[column.id] = filteredDeals.filter(deal => deal.status === column.id);
    });
    return grouped;
  }, [filteredDeals, pipelineColumns]);

  // Calcular métricas por coluna
  const columnMetrics = useMemo(() => {
    const metrics = {};
    pipelineColumns.forEach(column => {
      const columnDeals = dealsByStatus[column.id] || [];
      metrics[column.id] = {
        count: columnDeals.length,
        totalValue: columnDeals.reduce((sum, deal) => sum + (deal.value || 0), 0),
        avgValue: columnDeals.length > 0 
          ? columnDeals.reduce((sum, deal) => sum + (deal.value || 0), 0) / columnDeals.length 
          : 0,
        expectedValue: columnDeals.reduce((sum, deal) => sum + (deal.expectedValue || 0), 0)
      };
    });
    return metrics;
  }, [dealsByStatus, pipelineColumns]);

  // Handlers de Drag & Drop
  const handleDragStart = useCallback((e, deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.5';
  }, []);

  const handleDragEnd = useCallback((e) => {
    e.target.style.opacity = '1';
    setDraggedDeal(null);
    setDragOverColumn(null);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e, columnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback((e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverColumn(null);
    }
  }, []);

  const handleDrop = useCallback((e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedDeal && draggedDeal.status !== newStatus) {
      onStatusUpdate && onStatusUpdate(draggedDeal.id, newStatus);
    }
    setDraggedDeal(null);
  }, [draggedDeal, onStatusUpdate]);

  // Obter cor da prioridade
  const getPriorityColor = (priority) => {
    const colors = {
      baixa: 'bg-green-100 text-green-800',
      media: 'bg-blue-100 text-blue-800',
      alta: 'bg-orange-100 text-orange-800',
      urgente: 'bg-red-100 text-red-800',
      critica: 'bg-purple-100 text-purple-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  // Renderizar card do deal
  const renderDealCard = (deal) => {
    const statusColors = DEAL_STATUS_COLORS?.[deal.status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200'
    };

    return (
      <div
        key={deal.id}
        draggable
        onDragStart={(e) => handleDragStart(e, deal)}
        onDragEnd={handleDragEnd}
        onClick={() => onDealClick && onDealClick(deal)}
        className={`
          p-3 rounded-lg cursor-pointer transition-all duration-200
          ${compactView ? 'mb-2' : 'mb-3'}
          bg-white border shadow-sm hover:shadow-md
          ${draggedDeal?.id === deal.id ? 'opacity-50' : ''}
          ${statusColors.border}
        `}
      >
        {/* Cabeçalho do card */}
        <div className="flex justify-between items-start mb-2">
          <h4 className={`font-medium ${compactView ? 'text-xs' : 'text-sm'} truncate flex-1 mr-2`}>
            {deal.title}
          </h4>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(deal.priority)}`}>
            {deal.priority === 'urgente' ? '🔥' : 
             deal.priority === 'critica' ? '⚡' :
             deal.priority === 'alta' ? '⬆️' : ''}
          </span>
        </div>

        {/* Informações do cliente */}
        <p className={`text-gray-600 ${compactView ? 'text-xs' : 'text-sm'} mb-2 truncate`}>
          👤 {deal.clientName}
        </p>

        {/* Valor e probabilidade */}
        <div className="flex justify-between items-center">
          <span className={`font-semibold text-green-600 ${compactView ? 'text-xs' : 'text-sm'}`}>
            {formatCurrency ? formatCurrency(deal.value) : `€${deal.value}`}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${statusColors.bg} ${statusColors.text}`}>
            {deal.expectedValue ? formatCurrency(deal.expectedValue) : '---'}
          </span>
        </div>

        {/* Endereço da propriedade (se existir) */}
        {deal.propertyAddress && !compactView && (
          <p className="text-xs text-gray-500 mt-1 truncate">
            🏠 {deal.propertyAddress}
          </p>
        )}

        {/* Data de criação */}
        <p className="text-xs text-gray-400 mt-1">
          {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString('pt-PT') : '---'}
        </p>
      </div>
    );
  };

  // Renderizar cabeçalho da coluna
  const renderColumnHeader = (column) => {
    const metrics = columnMetrics[column.id] || {};
    const statusColors = DEAL_STATUS_COLORS?.[column.id] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      border: 'border-gray-200'
    };

    return (
      <div className={`p-4 rounded-lg ${statusColors.bg} ${statusColors.border} border mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{column.icon}</span>
            <h3 className={`font-semibold ${compactView ? 'text-sm' : 'text-base'} ${statusColors.text}`}>
              {column.title}
            </h3>
          </div>
          <span className={`text-xs px-2 py-1 rounded bg-white ${statusColors.text} opacity-75`}>
            {column.probability}%
          </span>
        </div>

        {!compactView && (
          <p className={`text-xs ${statusColors.text} opacity-75 mb-2`}>
            {column.description}
          </p>
        )}

        {/* Métricas da coluna */}
        <div className={`grid grid-cols-2 gap-2 text-xs ${statusColors.text}`}>
          <div>
            <p className="opacity-75">Negócios</p>
            <p className="font-semibold">{metrics.count || 0}</p>
          </div>
          <div>
            <p className="opacity-75">Valor Total</p>
            <p className="font-semibold">
              {formatCurrency ? formatCurrency(metrics.totalValue || 0) : `€${metrics.totalValue || 0}`}
            </p>
          </div>
          {showMetrics && !compactView && (
            <>
              <div>
                <p className="opacity-75">Valor Médio</p>
                <p className="font-semibold">
                  {formatCurrency ? formatCurrency(metrics.avgValue || 0) : `€${metrics.avgValue || 0}`}
                </p>
              </div>
              <div>
                <p className="opacity-75">Esperado</p>
                <p className="font-semibold">
                  {formatCurrency ? formatCurrency(metrics.expectedValue || 0) : `€${metrics.expectedValue || 0}`}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando pipeline...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controlos do Pipeline */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4">
          <h2 className="font-semibold text-gray-900">Pipeline de Negócios</h2>
          <span className="text-sm text-gray-600">
            {filteredDeals.length} negócio{filteredDeals.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Filtro por prioridade */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todas as Prioridades</option>
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
            <option value="critica">Crítica</option>
          </select>

          {/* Toggles de vista */}
          <button
            onClick={() => setCompactView(!compactView)}
            className={`px-3 py-1 text-sm rounded-lg border ${
              compactView
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Vista Compacta
          </button>

          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className={`px-3 py-1 text-sm rounded-lg border ${
              showMetrics
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Métricas
          </button>

          {/* Botão de criar negócio */}
          {onCreateDeal && (
            <ThemedButton
              onClick={onCreateDeal}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              + Novo
            </ThemedButton>
          )}
        </div>
      </div>

      {/* Pipeline Kanban */}
      <div className={`grid gap-4 ${compactView ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'}`}>
        {pipelineColumns.map(column => {
          const columnDeals = dealsByStatus[column.id] || [];
          const isDragOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              className={`min-h-[400px] transition-all duration-200 ${
                isDragOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
              }`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Cabeçalho da coluna */}
              {renderColumnHeader(column)}

              {/* Lista de deals */}
              <div className={`space-y-2 min-h-[200px] ${compactView ? 'max-h-64 overflow-y-auto' : 'max-h-96 overflow-y-auto'}`}>
                {columnDeals.length > 0 ? (
                  columnDeals.map(deal => renderDealCard(deal))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">Nenhum negócio</p>
                    {isDragOver && (
                      <p className="text-xs mt-1 text-blue-600">Solte aqui para mover</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo do Pipeline */}
      {showMetrics && !compactView && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total de Negócios</p>
            <p className="text-2xl font-bold text-blue-600">{filteredDeals.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Valor Total</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency ? formatCurrency(
                filteredDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
              ) : `€${filteredDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)}`}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Valor Esperado</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency ? formatCurrency(
                filteredDeals.reduce((sum, deal) => sum + (deal.expectedValue || 0), 0)
              ) : `€${filteredDeals.reduce((sum, deal) => sum + (deal.expectedValue || 0), 0)}`}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Taxa de Conversão</p>
            <p className="text-2xl font-bold text-orange-600">
              {filteredDeals.length > 0
                ? (filteredDeals.filter(d => d.status === (DEAL_STATUS?.FECHADO || 'fechado')).length / filteredDeals.length * 100).toFixed(1)
                : 0
              }%
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DealPipeline;