// src/components/leads/LeadsList.jsx
import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedButton } from '../common/ThemedComponents';
import useLeads from '../../hooks/useLeads';

// 🎯 COMPONENTE DE LISTAGEM AVANÇADA DE LEADS
// ===========================================
// MyImoMate 3.0 - Lista inteligente com filtros, ordenação e ações
// Funcionalidades: Ordenação, Filtros, Seleção múltipla, Exportação, Paginação

const LeadsList = ({
  showFilters = true,
  showActions = true,
  showSelection = true,
  compactMode = false,
  onLeadSelect,
  onLeadConvert,
  maxHeight = '600px'
}) => {
  const { theme } = useTheme();
  
  // Hook de leads
  const {
    leads,
    loading,
    error,
    converting,
    updateLeadStatus,
    convertLeadToClient,
    deleteLead,
    LEAD_STATUS,
    LEAD_INTEREST_TYPES,
    BUDGET_RANGES,
    LEAD_STATUS_COLORS
  } = useLeads();

  // Estados de ordenação
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Estados de filtros
  const [localFilters, setLocalFilters] = useState({
    status: '',
    interestType: '',
    budgetRange: '',
    priority: '',
    source: '',
    dateRange: 'all'
  });
  
  // Estados de seleção
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Estados de UI
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(compactMode ? 20 : 10);
  
  // Estados de ações
  const [actionLoading, setActionLoading] = useState({});

  // 🔄 ORDENAR DADOS
  const sortedLeads = useMemo(() => {
    if (!leads.length) return [];
    
    return [...leads].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Tratamento especial para datas
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      // Tratamento para strings
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [leads, sortField, sortDirection]);

  // 🔍 FILTRAR DADOS
  const filteredLeads = useMemo(() => {
    let filtered = sortedLeads;

    // Filtro por status
    if (localFilters.status) {
      filtered = filtered.filter(lead => lead.status === localFilters.status);
    }

    // Filtro por tipo de interesse
    if (localFilters.interestType) {
      filtered = filtered.filter(lead => lead.interestType === localFilters.interestType);
    }

    // Filtro por faixa de orçamento
    if (localFilters.budgetRange) {
      filtered = filtered.filter(lead => lead.budgetRange === localFilters.budgetRange);
    }

    // Filtro por prioridade
    if (localFilters.priority) {
      filtered = filtered.filter(lead => lead.priority === localFilters.priority);
    }

    // Filtro por fonte
    if (localFilters.source) {
      filtered = filtered.filter(lead => lead.source === localFilters.source);
    }

    // Filtro por data
    if (localFilters.dateRange && localFilters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (localFilters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter(lead => new Date(lead.createdAt) >= filterDate);
    }

    return filtered;
  }, [sortedLeads, localFilters]);

  // 📄 PAGINAÇÃO
  const paginatedLeads = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLeads, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  // 🔄 MANIPULAR ORDENAÇÃO
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // 🔍 OBTER ÍCONE DE ORDENAÇÃO
  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '⬆️' : '⬇️';
  };

  // ✅ MANIPULAR SELEÇÃO
  const handleSelectLead = (leadId) => {
    setSelectedLeads(prev => 
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(paginatedLeads.map(lead => lead.id));
    }
    setSelectAll(!selectAll);
  };

  // 🔄 ATUALIZAR STATUS EM LOTE
  const handleBulkStatusUpdate = async (newStatus) => {
    setActionLoading(prev => ({ ...prev, bulkStatus: true }));
    
    try {
      const promises = selectedLeads.map(leadId => 
        updateLeadStatus(leadId, newStatus)
      );
      
      await Promise.all(promises);
      setSelectedLeads([]);
      setSelectAll(false);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Erro no update em lote:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, bulkStatus: false }));
    }
  };

  // 🗑️ ELIMINAR EM LOTE
  const handleBulkDelete = async () => {
    if (!window.confirm(`Eliminar ${selectedLeads.length} leads selecionados?`)) {
      return;
    }

    setActionLoading(prev => ({ ...prev, bulkDelete: true }));
    
    try {
      const promises = selectedLeads.map(leadId => deleteLead(leadId));
      await Promise.all(promises);
      
      setSelectedLeads([]);
      setSelectAll(false);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Erro na eliminação em lote:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, bulkDelete: false }));
    }
  };

  // 📊 EXPORTAR LEADS
  const handleExport = (format = 'csv') => {
    const dataToExport = selectedLeads.length > 0 
      ? leads.filter(lead => selectedLeads.includes(lead.id))
      : filteredLeads;

    if (format === 'csv') {
      exportToCSV(dataToExport);
    } else if (format === 'json') {
      exportToJSON(dataToExport);
    }
    
    setShowExportModal(false);
  };

  const exportToCSV = (data) => {
    const headers = ['Nome', 'Telefone', 'Email', 'Tipo Interesse', 'Orçamento', 'Status', 'Data Criação'];
    const csvContent = [
      headers.join(','),
      ...data.map(lead => [
        `"${lead.name}"`,
        `"${lead.phone || ''}"`,
        `"${lead.email || ''}"`,
        `"${getInterestTypeLabel(lead.interestType)}"`,
        `"${BUDGET_RANGES[lead.budgetRange] || ''}"`,
        `"${getStatusLabel(lead.status)}"`,
        `"${lead.createdAt?.toLocaleDateString('pt-PT') || ''}"`
      ].join(','))
    ].join('\n');

    downloadFile(csvContent, 'leads.csv', 'text/csv');
  };

  const exportToJSON = (data) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, 'leads.json', 'application/json');
  };

  const downloadFile = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 🔍 OBTER RÓTULOS LEGÍVEIS
  const getInterestTypeLabel = (type) => {
    const labels = {
      [LEAD_INTEREST_TYPES.COMPRA_CASA]: 'Compra Casa',
      [LEAD_INTEREST_TYPES.COMPRA_APARTAMENTO]: 'Compra Apartamento',
      [LEAD_INTEREST_TYPES.COMPRA_TERRENO]: 'Compra Terreno',
      [LEAD_INTEREST_TYPES.COMPRA_COMERCIAL]: 'Compra Comercial',
      [LEAD_INTEREST_TYPES.VENDA_CASA]: 'Venda Casa',
      [LEAD_INTEREST_TYPES.VENDA_APARTAMENTO]: 'Venda Apartamento',
      [LEAD_INTEREST_TYPES.VENDA_TERRENO]: 'Venda Terreno',
      [LEAD_INTEREST_TYPES.VENDA_COMERCIAL]: 'Venda Comercial',
      [LEAD_INTEREST_TYPES.ARRENDAMENTO_CASA]: 'Arrendamento Casa',
      [LEAD_INTEREST_TYPES.ARRENDAMENTO_APARTAMENTO]: 'Arrendamento Apartamento',
      [LEAD_INTEREST_TYPES.ARRENDAMENTO_COMERCIAL]: 'Arrendamento Comercial',
      [LEAD_INTEREST_TYPES.INVESTIMENTO]: 'Investimento',
      [LEAD_INTEREST_TYPES.AVALIACAO]: 'Avaliação',
      [LEAD_INTEREST_TYPES.CONSULTORIA]: 'Consultoria'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status) => {
    const labels = {
      [LEAD_STATUS.NOVO]: 'Novo',
      [LEAD_STATUS.CONTACTADO]: 'Contactado',
      [LEAD_STATUS.QUALIFICADO]: 'Qualificado',
      [LEAD_STATUS.CONVERTIDO]: 'Convertido',
      [LEAD_STATUS.PERDIDO]: 'Perdido',
      [LEAD_STATUS.INATIVO]: 'Inativo'
    };
    return labels[status] || status;
  };

  // ⚡ EFEITOS
  useEffect(() => {
    setCurrentPage(1);
  }, [localFilters]);

  useEffect(() => {
    setSelectAll(false);
    setSelectedLeads([]);
  }, [currentPage]);

  useEffect(() => {
    setShowBulkActions(selectedLeads.length > 0);
  }, [selectedLeads]);

  return (
    <div className="leads-list">
      
      {/* BARRA DE FILTROS */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            
            {/* Filtro Status */}
            <select
              value={localFilters.status}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todos Status</option>
              {Object.values(LEAD_STATUS).map(status => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>

            {/* Filtro Tipo */}
            <select
              value={localFilters.interestType}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, interestType: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todos Tipos</option>
              {Object.values(LEAD_INTEREST_TYPES).map(type => (
                <option key={type} value={type}>
                  {getInterestTypeLabel(type)}
                </option>
              ))}
            </select>

            {/* Filtro Orçamento */}
            <select
              value={localFilters.budgetRange}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, budgetRange: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todos Orçamentos</option>
              {Object.entries(BUDGET_RANGES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {/* Filtro Prioridade */}
            <select
              value={localFilters.priority}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todas Prioridades</option>
              <option value="low">Baixa</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>

            {/* Filtro Data */}
            <select
              value={localFilters.dateRange}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="all">Todas as Datas</option>
              <option value="today">Hoje</option>
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
            </select>

            {/* Botão Limpar */}
            <button
              onClick={() => setLocalFilters({
                status: '',
                interestType: '',
                budgetRange: '',
                priority: '',
                source: '',
                dateRange: 'all'
              })}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              🔄 Limpar
            </button>
          </div>
        </div>
      )}

      {/* AÇÕES EM LOTE */}
      {showBulkActions && showActions && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedLeads.length} leads selecionados
            </span>
            
            <div className="flex gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkStatusUpdate(e.target.value);
                    e.target.value = '';
                  }
                }}
                className="px-3 py-1 border border-blue-300 rounded text-sm"
                disabled={actionLoading.bulkStatus}
              >
                <option value="">Alterar Status</option>
                {Object.values(LEAD_STATUS).map(status => (
                  <option key={status} value={status}>
                    {getStatusLabel(status)}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setShowExportModal(true)}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                📊 Exportar
              </button>
              
              <button
                onClick={handleBulkDelete}
                disabled={actionLoading.bulkDelete}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                {actionLoading.bulkDelete ? '⏳' : '🗑️'} Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INFO E ESTATÍSTICAS */}
      <div className="mb-4 flex justify-between items-center text-sm text-gray-600">
        <div>
          Mostrando {paginatedLeads.length} de {filteredLeads.length} leads
          {filteredLeads.length !== leads.length && ` (${leads.length} total)`}
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>
          
          {!selectedLeads.length && showActions && (
            <button
              onClick={() => setShowExportModal(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              📊 Exportar Todos
            </button>
          )}
        </div>
      </div>

      {/* TABELA DE LEADS */}
      <div 
        className="bg-white rounded-lg shadow overflow-hidden"
        style={{ maxHeight: maxHeight }}
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-gray-600">Carregando leads...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-2xl mb-2">❌</div>
            <p className="text-red-600">{error}</p>
          </div>
        ) : paginatedLeads.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-gray-600">Nenhum lead encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {/* Checkbox seleção */}
                  {showSelection && (
                    <th className="p-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                  )}
                  
                  {/* Headers ordenáveis */}
                  <th 
                    className="p-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Nome {getSortIcon('name')}
                  </th>
                  
                  <th className="p-3 text-left font-medium text-gray-700">
                    Contacto
                  </th>
                  
                  <th 
                    className="p-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('interestType')}
                  >
                    Interesse {getSortIcon('interestType')}
                  </th>
                  
                  <th className="p-3 text-left font-medium text-gray-700">
                    Orçamento
                  </th>
                  
                  <th 
                    className="p-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    Status {getSortIcon('status')}
                  </th>
                  
                  <th 
                    className="p-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    Criado {getSortIcon('createdAt')}
                  </th>
                  
                  {showActions && (
                    <th className="p-3 text-center font-medium text-gray-700">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              
              <tbody>
                {paginatedLeads.map((lead) => (
                  <tr key={lead.id} className="border-b hover:bg-gray-50">
                    
                    {/* Checkbox */}
                    {showSelection && (
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => handleSelectLead(lead.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                    )}
                    
                    {/* Nome */}
                    <td className="p-3">
                      <div 
                        className="font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                        onClick={() => onLeadSelect?.(lead)}
                      >
                        {lead.name}
                      </div>
                      {lead.location && (
                        <div className="text-sm text-gray-500">📍 {lead.location}</div>
                      )}
                    </td>

                    {/* Contacto */}
                    <td className="p-3">
                      {lead.phone && (
                        <div className="text-sm">📞 {lead.phone}</div>
                      )}
                      {lead.email && (
                        <div className="text-sm">✉️ {lead.email}</div>
                      )}
                    </td>

                    {/* Interesse */}
                    <td className="p-3">
                      <div className="text-sm">
                        {getInterestTypeLabel(lead.interestType)}
                      </div>
                    </td>

                    {/* Orçamento */}
                    <td className="p-3">
                      <div className="text-sm">
                        {BUDGET_RANGES[lead.budgetRange] || 'N/A'}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${LEAD_STATUS_COLORS[lead.status]}`}>
                        {getStatusLabel(lead.status)}
                      </span>
                    </td>

                    {/* Data criação */}
                    <td className="p-3">
                      <div className="text-sm text-gray-500">
                        {lead.createdAt?.toLocaleDateString('pt-PT')}
                      </div>
                    </td>

                    {/* Ações */}
                    {showActions && (
                      <td className="p-3">
                        <div className="flex justify-center gap-1">
                          {lead.status !== LEAD_STATUS.CONVERTIDO && (
                            <button
                              onClick={() => onLeadConvert?.(lead)}
                              disabled={converting}
                              className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded"
                              title="Converter para Cliente"
                            >
                              🔄
                            </button>
                          )}
                          
                          <button
                            onClick={() => onLeadSelect?.(lead)}
                            className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded"
                            title="Ver/Editar"
                          >
                            👁️
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAGINAÇÃO */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              ← Anterior
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 border rounded text-sm ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              Próxima →
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE EXPORTAÇÃO */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Exportar Leads</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 mb-2">
                  {selectedLeads.length > 0 
                    ? `Exportar ${selectedLeads.length} leads selecionados`
                    : `Exportar ${filteredLeads.length} leads filtrados`
                  }
                </p>
              </div>

              <div className="flex gap-3">
                <ThemedButton
                  onClick={() => handleExport('csv')}
                  className="flex-1"
                >
                  📊 CSV
                </ThemedButton>
                
                <ThemedButton
                  onClick={() => handleExport('json')}
                  className="flex-1"
                >
                  📄 JSON
                </ThemedButton>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsList;