// src/components/leads/LeadsList.jsx
import { useState, useMemo, useCallback, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedButton } from '../common/ThemedComponents';
import useLeads from '../../hooks/useLeads';

// 🎯 COMPONENTE DE LISTA AVANÇADA EDITÁVEL PARA LEADS
// ===================================================
// MyImoMate 3.0 - Lista inteligente com edição inline + modal completo
// Funcionalidades: Edição inline, Modal completo, Ações, Validações

const LeadsList = ({
  leads = [],
  loading = false,
  error = null,
  onLeadSelect,
  onLeadConvert,
  onLeadUpdate,
  onLeadDelete,
  showSelection = true,
  showActions = true,
  showFilters = true,
  maxHeight = '600px',
  compact = false
}) => {
  const { theme } = useTheme();
  
  // Hook de leads para ações
  const {
    deleteLead,
    updateLeadStatus,
    LEAD_STATUS,
    LEAD_INTEREST_TYPES,
    BUDGET_RANGES,
    LEAD_STATUS_COLORS,
    isValidPhone,
    isValidEmail
  } = useLeads();

  // 🔄 FUNÇÃO LOCAL DE ATUALIZAÇÃO (será movida para useLeads posteriormente)
  const updateLead = async (leadId, updateData) => {
    try {
      const leadRef = doc(db, 'leads', leadId);
      await updateDoc(leadRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
      
      // Atualizar lista local se onLeadUpdate estiver disponível
      if (onLeadUpdate) {
        onLeadUpdate();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      throw error;
    }
  };

  // Estados de filtros locais
  const [localFilters, setLocalFilters] = useState({
    status: '',
    interestType: '',
    budgetRange: '',
    priority: '',
    source: '',
    dateRange: 'all'
  });

  // Estados de ordenação
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Estados de seleção
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Estados de paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Estados de ações
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    bulkStatus: false,
    bulkDelete: false,
    individual: {}
  });

  // 🔥 NOVOS ESTADOS PARA EDIÇÃO
  const [editingCell, setEditingCell] = useState(null); // { leadId, field }
  const [editValues, setEditValues] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(null);

  // 📊 FILTRAR E ORDENAR LEADS
  const filteredLeads = useMemo(() => {
    let filtered = [...leads];

    // Aplicar filtros
    if (localFilters.status) {
      filtered = filtered.filter(lead => lead.status === localFilters.status);
    }
    if (localFilters.interestType) {
      filtered = filtered.filter(lead => lead.interestType === localFilters.interestType);
    }
    if (localFilters.budgetRange) {
      filtered = filtered.filter(lead => lead.budgetRange === localFilters.budgetRange);
    }
    if (localFilters.priority) {
      filtered = filtered.filter(lead => lead.priority === localFilters.priority);
    }
    if (localFilters.source) {
      filtered = filtered.filter(lead => lead.source === localFilters.source);
    }

    // Filtro por data
    if (localFilters.dateRange !== 'all') {
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
      }
      
      filtered = filtered.filter(lead => {
        const leadDate = lead.createdAt?.toDate ? lead.createdAt.toDate() : new Date(lead.createdAt);
        return leadDate >= filterDate;
      });
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Tratar datas
      if (sortField.includes('At') || sortField.includes('Date')) {
        aValue = aValue?.toDate ? aValue.toDate() : new Date(aValue || 0);
        bValue = bValue?.toDate ? bValue.toDate() : new Date(bValue || 0);
      }

      // Tratar strings
      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [leads, localFilters, sortField, sortDirection]);

  // 📄 PAGINAÇÃO
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  // 🔄 FUNÇÕES DE ORDENAÇÃO
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '⬆️' : '⬇️';
  };

  // 🔥 FUNÇÕES DE EDIÇÃO INLINE
  const handleCellDoubleClick = (lead, field) => {
    if (!showActions) return;
    
    setEditingCell({ leadId: lead.id, field });
    setEditValues({ [lead.id]: { [field]: lead[field] || '' } });
  };

  const handleCellEdit = (leadId, field, value) => {
    setEditValues(prev => ({
      ...prev,
      [leadId]: {
        ...prev[leadId],
        [field]: value
      }
    }));
  };

  const handleCellSave = async (leadId, field) => {
    const newValue = editValues[leadId]?.[field];
    if (newValue === undefined) return;

    // Validações específicas
    if (field === 'phone' && newValue && !isValidPhone(newValue)) {
      alert('Formato de telefone inválido');
      return;
    }
    if (field === 'email' && newValue && !isValidEmail(newValue)) {
      alert('Formato de email inválido');
      return;
    }

    try {
      setActionLoading(prev => ({
        ...prev,
        individual: { ...prev.individual, [leadId]: true }
      }));

      await updateLead(leadId, { [field]: newValue });
      
      setEditingCell(null);
      setEditValues({});
      
      if (onLeadUpdate) onLeadUpdate();
    } catch (error) {
      alert(`Erro ao atualizar: ${error.message}`);
    } finally {
      setActionLoading(prev => ({
        ...prev,
        individual: { ...prev.individual, [leadId]: false }
      }));
    }
  };

  const handleCellCancel = () => {
    setEditingCell(null);
    setEditValues({});
  };

  // 🔥 FUNÇÕES DO MODAL DE EDIÇÃO COMPLETA
  const handleEditComplete = (lead) => {
    setEditingLead({ ...lead });
    setShowEditModal(true);
  };

  const handleSaveComplete = async () => {
    if (!editingLead) return;

    try {
      await updateLead(editingLead.id, editingLead);
      setShowEditModal(false);
      setEditingLead(null);
      if (onLeadUpdate) onLeadUpdate();
    } catch (error) {
      alert(`Erro ao atualizar: ${error.message}`);
    }
  };

  // 🗑️ FUNÇÃO DE ELIMINAÇÃO
  const handleDelete = async (leadId) => {
    try {
      setActionLoading(prev => ({
        ...prev,
        individual: { ...prev.individual, [leadId]: true }
      }));

      await deleteLead(leadId);
      setShowDeleteConfirm(null);
      
      if (onLeadDelete) onLeadDelete();
    } catch (error) {
      alert(`Erro ao eliminar: ${error.message}`);
    } finally {
      setActionLoading(prev => ({
        ...prev,
        individual: { ...prev.individual, [leadId]: false }
      }));
    }
  };

  // 🎨 HELPER FUNCTIONS
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

  const getBudgetLabel = (budget) => BUDGET_RANGES[budget] || budget;
  const getInterestLabel = (interest) => {
    const labels = {
      [LEAD_INTEREST_TYPES.COMPRA_CASA]: 'Compra Casa',
      [LEAD_INTEREST_TYPES.COMPRA_APARTAMENTO]: 'Compra Apartamento',
      [LEAD_INTEREST_TYPES.VENDA_CASA]: 'Venda Casa',
      [LEAD_INTEREST_TYPES.ARRENDAMENTO_CASA]: 'Arrendamento',
      [LEAD_INTEREST_TYPES.INVESTIMENTO]: 'Investimento'
    };
    return labels[interest] || interest;
  };

  // 🎯 COMPONENTE DE CÉLULA EDITÁVEL
  const EditableCell = ({ lead, field, value, type = 'text', options = null }) => {
    const isEditing = editingCell?.leadId === lead.id && editingCell?.field === field;
    const currentValue = editValues[lead.id]?.[field] ?? value;
    const isLoading = actionLoading.individual[lead.id];

    if (isEditing) {
      return (
        <div className="flex items-center gap-1">
          {type === 'select' ? (
            <select
              value={currentValue}
              onChange={(e) => handleCellEdit(lead.id, field, e.target.value)}
              onBlur={() => handleCellSave(lead.id, field)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCellSave(lead.id, field);
                if (e.key === 'Escape') handleCellCancel();
              }}
              className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
              autoFocus
            >
              {options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={type}
              value={currentValue}
              onChange={(e) => handleCellEdit(lead.id, field, e.target.value)}
              onBlur={() => handleCellSave(lead.id, field)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCellSave(lead.id, field);
                if (e.key === 'Escape') handleCellCancel();
              }}
              className="w-full px-2 py-1 border border-blue-300 rounded text-sm"
              autoFocus
            />
          )}
          <button
            onClick={() => handleCellSave(lead.id, field)}
            className="text-green-600 hover:text-green-800 text-xs"
            disabled={isLoading}
          >
            ✓
          </button>
          <button
            onClick={handleCellCancel}
            className="text-red-600 hover:text-red-800 text-xs"
            disabled={isLoading}
          >
            ✕
          </button>
        </div>
      );
    }

    return (
      <div
        onDoubleClick={() => handleCellDoubleClick(lead, field)}
        className="cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
        title="Duplo clique para editar"
      >
        {field === 'status' && (
          <span className={`px-2 py-1 rounded-full text-xs ${LEAD_STATUS_COLORS[value] || 'bg-gray-100'}`}>
            {getStatusLabel(value)}
          </span>
        )}
        {field === 'budgetRange' && getBudgetLabel(value)}
        {field === 'interestType' && getInterestLabel(value)}
        {!['status', 'budgetRange', 'interestType'].includes(field) && value}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* FILTROS */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <select
              value={localFilters.status}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">Todos os Status</option>
              {Object.values(LEAD_STATUS).map(status => (
                <option key={status} value={status}>{getStatusLabel(status)}</option>
              ))}
            </select>

            <select
              value={localFilters.interestType}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, interestType: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">Todos os Tipos</option>
              {Object.values(LEAD_INTEREST_TYPES).map(type => (
                <option key={type} value={type}>{getInterestLabel(type)}</option>
              ))}
            </select>

            <select
              value={localFilters.budgetRange}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, budgetRange: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">Todos os Orçamentos</option>
              {Object.entries(BUDGET_RANGES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={localFilters.priority}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">Todas as Prioridades</option>
              <option value="baixa">Baixa</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>

            <select
              value={localFilters.dateRange}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="all">Todas as Datas</option>
              <option value="today">Hoje</option>
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
            </select>

            <button
              onClick={() => setLocalFilters({
                status: '',
                interestType: '',
                budgetRange: '',
                priority: '',
                source: '',
                dateRange: 'all'
              })}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm border border-gray-300 rounded"
            >
              🔄 Limpar
            </button>
          </div>
        </div>
      )}

      {/* ESTATÍSTICAS */}
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
        </div>
      </div>

      {/* TABELA DE LEADS */}
      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ maxHeight }}>
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
                  {showSelection && (
                    <th className="p-3 text-left">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </th>
                  )}
                  
                  <th 
                    className="p-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    Nome {getSortIcon('name')}
                  </th>
                  
                  <th 
                    className="p-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('phone')}
                  >
                    Contacto {getSortIcon('phone')}
                  </th>
                  
                  <th 
                    className="p-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('interestType')}
                  >
                    Interesse {getSortIcon('interestType')}
                  </th>
                  
                  <th 
                    className="p-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('budgetRange')}
                  >
                    Orçamento {getSortIcon('budgetRange')}
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
                    <th className="p-3 text-left font-medium text-gray-700">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-200">
                {paginatedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    {showSelection && (
                      <td className="p-3">
                        <input type="checkbox" className="rounded border-gray-300" />
                      </td>
                    )}
                    
                    <td className="p-3">
                      <div className="space-y-1">
                        <EditableCell 
                          lead={lead} 
                          field="name" 
                          value={lead.name}
                        />
                        <EditableCell 
                          lead={lead} 
                          field="email" 
                          value={lead.email}
                          type="email"
                        />
                      </div>
                    </td>
                    
                    <td className="p-3">
                      <EditableCell 
                        lead={lead} 
                        field="phone" 
                        value={lead.phone}
                        type="tel"
                      />
                    </td>
                    
                    <td className="p-3">
                      <EditableCell 
                        lead={lead} 
                        field="interestType" 
                        value={lead.interestType}
                        type="select"
                        options={Object.entries(LEAD_INTEREST_TYPES).map(([key, value]) => ({
                          value: key,
                          label: getInterestLabel(key)
                        }))}
                      />
                    </td>
                    
                    <td className="p-3">
                      <EditableCell 
                        lead={lead} 
                        field="budgetRange" 
                        value={lead.budgetRange}
                        type="select"
                        options={Object.entries(BUDGET_RANGES).map(([key, label]) => ({
                          value: key,
                          label
                        }))}
                      />
                    </td>
                    
                    <td className="p-3">
                      <EditableCell 
                        lead={lead} 
                        field="status" 
                        value={lead.status}
                        type="select"
                        options={Object.values(LEAD_STATUS).map(status => ({
                          value: status,
                          label: getStatusLabel(status)
                        }))}
                      />
                    </td>
                    
                    <td className="p-3 text-sm text-gray-600">
                      {lead.createdAt?.toDate ? 
                        lead.createdAt.toDate().toLocaleDateString('pt-PT') :
                        new Date(lead.createdAt).toLocaleDateString('pt-PT')
                      }
                    </td>
                    
                    {showActions && (
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditComplete(lead)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                            title="Editar Completo"
                          >
                            ✏️
                          </button>
                          
                          <button
                            onClick={() => setShowDetailsModal(lead)}
                            className="text-green-600 hover:text-green-800 text-sm"
                            title="Ver Detalhes"
                          >
                            👁️
                          </button>
                          
                          {onLeadConvert && !lead.isConverted && (
                            <button
                              onClick={() => onLeadConvert(lead)}
                              className="text-purple-600 hover:text-purple-800 text-sm"
                              title="Converter"
                            >
                              🔄
                            </button>
                          )}
                          
                          <button
                            onClick={() => setShowDeleteConfirm(lead.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                            title="Eliminar"
                          >
                            🗑️
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
        <div className="flex justify-center">
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
            >
              ← Anterior
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
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
            ))}
            
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

      {/* MODAL DE EDIÇÃO COMPLETA */}
      {showEditModal && editingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Editar Lead Completo</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  type="text"
                  value={editingLead.name || ''}
                  onChange={(e) => setEditingLead(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input
                  type="tel"
                  value={editingLead.phone || ''}
                  onChange={(e) => setEditingLead(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingLead.email || ''}
                  onChange={(e) => setEditingLead(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Interesse</label>
                <select
                  value={editingLead.interestType || ''}
                  onChange={(e) => setEditingLead(prev => ({ ...prev, interestType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  {Object.entries(LEAD_INTEREST_TYPES).map(([key, value]) => (
                    <option key={key} value={key}>{getInterestLabel(key)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Orçamento</label>
                <select
                  value={editingLead.budgetRange || ''}
                  onChange={(e) => setEditingLead(prev => ({ ...prev, budgetRange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  {Object.entries(BUDGET_RANGES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingLead.status || ''}
                  onChange={(e) => setEditingLead(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  {Object.values(LEAD_STATUS).map(status => (
                    <option key={status} value={status}>{getStatusLabel(status)}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Localização Preferida</label>
                <input
                  type="text"
                  value={editingLead.location || ''}
                  onChange={(e) => setEditingLead(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  placeholder="Cidade, distrito, zona..."
                />
              </div>
              
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Observações</label>
                <textarea
                  value={editingLead.notes || ''}
                  onChange={(e) => setEditingLead(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows="4"
                  placeholder="Informações adicionais sobre o lead..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <ThemedButton onClick={handleSaveComplete} className="flex-1">
                Guardar Alterações
              </ThemedButton>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingLead(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DETALHES */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Detalhes do Lead</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><strong>Nome:</strong> {showDetailsModal.name}</p>
                <p><strong>Telefone:</strong> {showDetailsModal.phone || 'N/A'}</p>
                <p><strong>Email:</strong> {showDetailsModal.email || 'N/A'}</p>
                <p><strong>Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${LEAD_STATUS_COLORS[showDetailsModal.status] || 'bg-gray-100'}`}>
                    {getStatusLabel(showDetailsModal.status)}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <p><strong>Interesse:</strong> {getInterestLabel(showDetailsModal.interestType)}</p>
                <p><strong>Orçamento:</strong> {getBudgetLabel(showDetailsModal.budgetRange)}</p>
                <p><strong>Localização:</strong> {showDetailsModal.location || 'N/A'}</p>
                <p><strong>Criado:</strong> {
                  showDetailsModal.createdAt?.toDate ? 
                    showDetailsModal.createdAt.toDate().toLocaleDateString('pt-PT') :
                    new Date(showDetailsModal.createdAt).toLocaleDateString('pt-PT')
                }</p>
              </div>
            </div>
            
            {showDetailsModal.notes && (
              <div className="mt-4">
                <strong>Notas:</strong>
                <p className="mt-1 p-3 bg-gray-50 rounded">{showDetailsModal.notes}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDetailsModal(null);
                  handleEditComplete(showDetailsModal);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Editar
              </button>
              <button
                onClick={() => setShowDetailsModal(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE ELIMINAÇÃO */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4 text-red-600">Confirmar Eliminação</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja eliminar este lead? Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={actionLoading.individual[showDeleteConfirm]}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading.individual[showDeleteConfirm] ? '⏳ Eliminando...' : 'Sim, Eliminar'}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
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