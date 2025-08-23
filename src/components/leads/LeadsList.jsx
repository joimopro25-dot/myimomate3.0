// src/components/leads/LeadsList.jsx - VERSÃO COM VIEWMODE FUNCIONAL
// ✅ Edição inline mantida
// ✅ Modal de edição usando LeadForm expandido
// ✅ ADICIONADO: Suporte para viewMode (grid/list)
// ✅ Todas as funcionalidades preservadas

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedButton } from '../common/ThemedComponents';
import LeadForm from './LeadForm';
import useLeads from '../../hooks/useLeads';

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
  compact = false,
  viewMode = 'list' 
}) => {

    // Debug temporário
  console.log('LeadsList viewMode:', viewMode);
  const { theme } = useTheme();
  
  // Hook de leads para ações
  const {
    updateLead,
    deleteLead,
    updateLeadStatus,
    addManagerContact,
    LEAD_STATUS,
    LEAD_INTEREST_TYPES,
    BUDGET_RANGES,
    LEAD_STATUS_COLORS,
    CLIENT_TYPES,
    PROPERTY_STATUS,
    isValidPhone,
    isValidEmail
  } = useLeads();

  // Estados de filtros locais
  const [localFilters, setLocalFilters] = useState({
    status: '',
    interestType: '',
    budgetRange: '',
    priority: '',
    source: '',
    dateRange: 'all',
    clientType: '',
    propertyStatus: ''
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
  const [actionLoading, setActionLoading] = useState({
    bulkStatus: false,
    bulkDelete: false,
    individual: {}
  });

  // Estados para edição (ATUALIZADOS)
  const [editingCell, setEditingCell] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(null);

  // Estados para gestão de contactos
  const [showManagerContactModal, setShowManagerContactModal] = useState(false);
  const [managerContactForm, setManagerContactForm] = useState({
    contactDate: new Date().toISOString().split('T')[0],
    contactType: 'phone',
    notes: '',
    outcome: ''
  });

  // ✅ NOVA FUNÇÃO: Cores de status para vista grid
  const getStatusColor = (status) => {
    const colors = {
      'novo': 'bg-blue-100 text-blue-800',
      'contactado': 'bg-yellow-100 text-yellow-800', 
      'qualificado': 'bg-green-100 text-green-800',
      'convertido': 'bg-purple-100 text-purple-800',
      'perdido': 'bg-red-100 text-red-800',
      'inativo': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Filtrar e ordenar leads (MANTIDO IGUAL)
  const filteredLeads = useMemo(() => {
    let filtered = [...leads];

    // Aplicar filtros existentes
    if (localFilters.status) {
      filtered = filtered.filter(lead => lead.status === localFilters.status);
    }
    if (localFilters.interestType) {
      filtered = filtered.filter(lead => lead.interestType === localFilters.interestType);
    }
    if (localFilters.budgetRange) {
      filtered = filtered.filter(lead => lead.budgetRange === localFilters.budgetRange);
    }
    if (localFilters.clientType) {
      filtered = filtered.filter(lead => lead.clientType === localFilters.clientType);
    }
    if (localFilters.propertyStatus) {
      filtered = filtered.filter(lead => lead.propertyStatus === localFilters.propertyStatus);
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

      if (sortField.includes('At') || sortField.includes('Date')) {
        aValue = aValue?.toDate ? aValue.toDate() : new Date(aValue || 0);
        bValue = bValue?.toDate ? bValue.toDate() : new Date(bValue || 0);
      }

      if (typeof aValue === 'string') aValue = aValue.toLowerCase();
      if (typeof bValue === 'string') bValue = bValue.toLowerCase();

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [leads, localFilters, sortField, sortDirection]);

  // Paginação (MANTIDA IGUAL)
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLeads = filteredLeads.slice(startIndex, startIndex + itemsPerPage);

  // TODAS AS FUNÇÕES MANTIDAS IGUAIS
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

    if ((field === 'phone' || field === 'managerPhone') && newValue && !isValidPhone(newValue)) {
      alert('Formato de telefone inválido');
      return;
    }
    if ((field === 'email' || field === 'managerEmail') && newValue && !isValidEmail(newValue)) {
      alert('Formato de email inválido');
      return;
    }

    try {
      setActionLoading(prev => ({
        ...prev,
        individual: { ...prev.individual, [leadId]: true }
      }));

      const result = await updateLead(leadId, { [field]: newValue });
      
      if (result.success) {
        setEditingCell(null);
        setEditValues({});
        
        if (onLeadUpdate) onLeadUpdate();
      } else {
        alert(`Erro ao atualizar: ${result.error}`);
      }

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

  const handleEditComplete = (lead) => {
    setEditingLead({ ...lead });
    setShowEditModal(true);
    setShowDetailsModal(null);
  };

  const handleEditFormSubmit = async (updatedLeadData) => {
    if (!editingLead) return;

    try {
      const result = await updateLead(editingLead.id, updatedLeadData);
      
      if (result.success) {
        setShowEditModal(false);
        setEditingLead(null);
        if (onLeadUpdate) onLeadUpdate();
      } else {
        throw new Error(result.error || 'Erro ao atualizar lead');
      }

    } catch (error) {
      console.error('Erro ao atualizar lead:', error);
      alert(`Erro ao atualizar: ${error.message}`);
    }
  };

  const handleEditFormCancel = () => {
    setShowEditModal(false);
    setEditingLead(null);
  };

  const handleAddManagerContact = async () => {
    if (!editingLead) return;

    try {
      const result = await addManagerContact(editingLead.id, managerContactForm);
      
      if (result.success) {
        setEditingLead(prev => ({
          ...prev,
          managerContactHistory: [...(prev.managerContactHistory || []), result.contact]
        }));
        
        setManagerContactForm({
          contactDate: new Date().toISOString().split('T')[0],
          contactType: 'phone',
          notes: '',
          outcome: ''
        });
        
        setShowManagerContactModal(false);
        if (onLeadUpdate) onLeadUpdate();
      } else {
        alert(`Erro ao adicionar contacto: ${result.error}`);
      }
    } catch (error) {
      alert(`Erro ao adicionar contacto: ${error.message}`);
    }
  };

  const handleDelete = async (leadId) => {
    try {
      setActionLoading(prev => ({
        ...prev,
        individual: { ...prev.individual, [leadId]: true }
      }));

      const result = await deleteLead(leadId);
      
      if (result.success) {
        setShowDeleteConfirm(null);
        if (onLeadDelete) onLeadDelete();
      } else {
        alert(`Erro ao eliminar: ${result.error}`);
      }

    } catch (error) {
      alert(`Erro ao eliminar: ${error.message}`);
    } finally {
      setActionLoading(prev => ({
        ...prev,
        individual: { ...prev.individual, [leadId]: false }
      }));
    }
  };

  // Helper functions (MANTIDAS)
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

  const getClientTypeLabel = (type) => {
    const labels = {
      [CLIENT_TYPES.COMPRADOR]: 'Comprador',
      [CLIENT_TYPES.ARRENDATARIO]: 'Arrendatário',
      [CLIENT_TYPES.INQUILINO]: 'Inquilino',
      [CLIENT_TYPES.VENDEDOR]: 'Vendedor',
      [CLIENT_TYPES.SENHORIO]: 'Senhorio',
      [CLIENT_TYPES.INVESTIDOR]: 'Investidor'
    };
    return labels[type] || type;
  };

  const getPropertyStatusLabel = (status) => {
    const labels = {
      [PROPERTY_STATUS.NAO_IDENTIFICADO]: 'Não Identificado',
      [PROPERTY_STATUS.IDENTIFICADO]: 'Identificado',
      [PROPERTY_STATUS.VISITADO]: 'Visitado',
      [PROPERTY_STATUS.REJEITADO]: 'Rejeitado',
      [PROPERTY_STATUS.APROVADO]: 'Aprovado'
    };
    return labels[status] || status;
  };

  // Componente de Célula Editável (MANTIDO)
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
        {field === 'clientType' && getClientTypeLabel(value)}
        {field === 'propertyStatus' && getPropertyStatusLabel(value)}
        {field === 'budgetRange' && getBudgetLabel(value)}
        {field === 'interestType' && getInterestLabel(value)}
        {!['status', 'clientType', 'propertyStatus', 'budgetRange', 'interestType'].includes(field) && (value || 'N/A')}
      </div>
    );
  };

  // Estados de loading e erro (MANTIDOS)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">Carregando leads...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="text-red-800">Erro ao carregar leads: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden" style={{ maxHeight }}>
      {/* CABEÇALHO (MANTIDO) */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Leads ({filteredLeads.length})
          </h3>
          
          {showActions && (
            <div className="flex items-center gap-3">
              {selectedLeads.length > 0 && (
                <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200">
                  Ações ({selectedLeads.length})
                </button>
              )}
              
              <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                Exportar
              </button>
            </div>
          )}
        </div>

        {/* FILTROS EXPANDIDOS (MANTIDOS) */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <select
              value={localFilters.status}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">Todos os Status</option>
              {Object.values(LEAD_STATUS).map(status => (
                <option key={status} value={status}>{getStatusLabel(status)}</option>
              ))}
            </select>

            <select
              value={localFilters.clientType}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, clientType: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">Todos os Tipos</option>
              {Object.values(CLIENT_TYPES).map(type => (
                <option key={type} value={type}>{getClientTypeLabel(type)}</option>
              ))}
            </select>

            <select
              value={localFilters.propertyStatus}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, propertyStatus: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">Status Imóvel</option>
              {Object.values(PROPERTY_STATUS).map(status => (
                <option key={status} value={status}>{getPropertyStatusLabel(status)}</option>
              ))}
            </select>

            <select
              value={localFilters.interestType}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, interestType: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">Todos os Interesses</option>
              {Object.values(LEAD_INTEREST_TYPES).map(type => (
                <option key={type} value={type}>{getInterestLabel(type)}</option>
              ))}
            </select>

            <select
              value={localFilters.budgetRange}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, budgetRange: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="">Todos os Orçamentos</option>
              {Object.entries(BUDGET_RANGES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={localFilters.dateRange}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-3 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="all">Todas as Datas</option>
              <option value="today">Hoje</option>
              <option value="week">Última Semana</option>
              <option value="month">Último Mês</option>
            </select>
          </div>
        )}
      </div>

      {/* ✅ CONTEÚDO BASEADO NO VIEWMODE */}
      <div className="p-6">
        {paginatedLeads.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Nenhum lead encontrado
          </div>
        ) : viewMode === 'grid' ? (
          // ✅ VISTA GRID/CARDS
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedLeads.map(lead => (
              <div key={lead.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 truncate">{lead.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                    {getStatusLabel(lead.status)}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <span className="font-medium w-16">Tipo:</span>
                    <span className="truncate">{getClientTypeLabel(lead.clientType)}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-16">Tel:</span>
                    <span className="truncate">{lead.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-16">Email:</span>
                    <span className="truncate">{lead.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium w-16">Imóvel:</span>
                    <span className="truncate">{lead.propertyStatus ? getPropertyStatusLabel(lead.propertyStatus) : 'Não identificado'}</span>
                  </div>
                </div>
                
                {showActions && (
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-1">
                    <button
                      onClick={() => setShowDetailsModal(lead)}
                      className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleEditComplete(lead)}
                      className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded"
                    >
                      Editar
                    </button>
                    {onLeadConvert && (
                      <button
                        onClick={() => onLeadConvert(lead.id)}
                        className="text-purple-600 hover:text-purple-800 text-xs px-2 py-1 rounded"
                      >
                        Converter
                      </button>
                    )}
                    <button
                      onClick={() => setShowDeleteConfirm(lead.id)}
                      className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // ✅ VISTA LISTA/TABLE - código existente mantido
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {showSelection && (
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={(e) => {
                          setSelectAll(e.target.checked);
                          if (e.target.checked) {
                            setSelectedLeads(paginatedLeads.map(lead => lead.id));
                          } else {
                            setSelectedLeads([]);
                          }
                        }}
                        className="rounded"
                      />
                    </th>
                  )}
                  
                  <th onClick={() => handleSort('name')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Nome {getSortIcon('name')}
                  </th>
                  
                  <th onClick={() => handleSort('status')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Status {getSortIcon('status')}
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo Cliente
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Imóvel
                  </th>
                  
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gestor
                  </th>
                  
                  <th onClick={() => handleSort('createdAt')} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
                    Criado {getSortIcon('createdAt')}
                  </th>
                  
                  {showActions && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    {showSelection && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeads(prev => [...prev, lead.id]);
                            } else {
                              setSelectedLeads(prev => prev.filter(id => id !== lead.id));
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                    )}
                    
                    <td className="px-6 py-4">
                      <EditableCell lead={lead} field="name" value={lead.name} />
                    </td>
                    
                    <td className="px-6 py-4">
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
                    
                    <td className="px-6 py-4">
                      <EditableCell 
                        lead={lead} 
                        field="clientType" 
                        value={lead.clientType || CLIENT_TYPES.COMPRADOR}
                        type="select"
                        options={Object.values(CLIENT_TYPES).map(type => ({
                          value: type,
                          label: getClientTypeLabel(type)
                        }))}
                      />
                    </td>
                    
                    <td className="px-6 py-4 text-sm">
                      <div className="space-y-1">
                        <EditableCell lead={lead} field="phone" value={lead.phone} type="tel" />
                        <EditableCell lead={lead} field="email" value={lead.email} type="email" />
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm">
                      <div className="space-y-1">
                        <EditableCell 
                          lead={lead} 
                          field="propertyStatus" 
                          value={lead.propertyStatus || PROPERTY_STATUS.NAO_IDENTIFICADO}
                          type="select"
                          options={Object.values(PROPERTY_STATUS).map(status => ({
                            value: status,
                            label: getPropertyStatusLabel(status)
                          }))}
                        />
                        <EditableCell lead={lead} field="propertyReference" value={lead.propertyReference} />
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm">
                      <div className="space-y-1">
                        <EditableCell lead={lead} field="managerName" value={lead.managerName} />
                        <EditableCell lead={lead} field="managerPhone" value={lead.managerPhone} type="tel" />
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {lead.createdAt?.toLocaleDateString?.('pt-PT') || 
                       (lead.createdAt?.toDate ? lead.createdAt.toDate().toLocaleDateString('pt-PT') : 'N/A')}
                    </td>
                    
                    {showActions && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowDetailsModal(lead)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                          >
                            Ver
                          </button>
                          
                          <button
                            onClick={() => handleEditComplete(lead)}
                            className="text-green-600 hover:text-green-800 text-sm"
                          >
                            Editar
                          </button>
                          
                          {onLeadConvert && (
                            <button
                              onClick={() => onLeadConvert(lead.id)}
                              className="text-purple-600 hover:text-purple-800 text-sm"
                            >
                              Converter
                            </button>
                          )}
                          
                          <button
                            onClick={() => setShowDeleteConfirm(lead.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Eliminar
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

      {/* PAGINAÇÃO (MANTIDA) */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredLeads.length)} de {filteredLeads.length} leads
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
              >
                ← Anterior
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 border rounded text-sm ${
                      pageNum === currentPage 
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
        </div>
      )}

      {/* TODOS OS MODAIS EXISTENTES MANTIDOS IGUAIS */}
      {/* Modal de Edição usando LeadForm */}
      {showEditModal && editingLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Editar Lead: {editingLead.name}
              </h3>
              <button
                onClick={handleEditFormCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <LeadForm
                initialData={editingLead}
                onSubmit={handleEditFormSubmit}
                onCancel={handleEditFormCancel}
                submitButtonText="Guardar Alterações"
                showPreview={true}
                compactMode={false}
                autoFocus={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal para adicionar contacto com gestor */}
      {showManagerContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Adicionar Contacto com Gestor</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data do Contacto</label>
                <input
                  type="date"
                  value={managerContactForm.contactDate}
                  onChange={(e) => setManagerContactForm(prev => ({ ...prev, contactDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Contacto</label>
                <select
                  value={managerContactForm.contactType}
                  onChange={(e) => setManagerContactForm(prev => ({ ...prev, contactType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="phone">Telefone</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="meeting">Reunião</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resultado</label>
                <select
                  value={managerContactForm.outcome}
                  onChange={(e) => setManagerContactForm(prev => ({ ...prev, outcome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                >
                  <option value="">Selecionar...</option>
                  <option value="contacted">Contactado com sucesso</option>
                  <option value="no_answer">Sem resposta</option>
                  <option value="callback_requested">Solicitou retorno</option>
                  <option value="meeting_scheduled">Reunião agendada</option>
                  <option value="not_interested">Não interessado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
                <textarea
                  value={managerContactForm.notes}
                  onChange={(e) => setManagerContactForm(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  rows="3"
                  placeholder="Detalhes da conversa..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <ThemedButton onClick={handleAddManagerContact} className="flex-1">
                Adicionar Contacto
              </ThemedButton>
              <button
                onClick={() => setShowManagerContactModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes expandido */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Detalhes do Lead</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Informações Básicas</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nome:</strong> {showDetailsModal.name}</p>
                    <p><strong>Tipo:</strong> {getClientTypeLabel(showDetailsModal.clientType)}</p>
                    <p><strong>Telefone:</strong> {showDetailsModal.phone || 'N/A'}</p>
                    <p><strong>Email:</strong> {showDetailsModal.email || 'N/A'}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${LEAD_STATUS_COLORS[showDetailsModal.status] || 'bg-gray-100'}`}>
                        {getStatusLabel(showDetailsModal.status)}
                      </span>
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Interesse</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Tipo:</strong> {getInterestLabel(showDetailsModal.interestType)}</p>
                    <p><strong>Orçamento:</strong> {getBudgetLabel(showDetailsModal.budgetRange)}</p>
                    <p><strong>Localização:</strong> {showDetailsModal.location || 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Imóvel</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Status:</strong> {getPropertyStatusLabel(showDetailsModal.propertyStatus)}</p>
                    <p><strong>Referência:</strong> {showDetailsModal.propertyReference || 'N/A'}</p>
                    {showDetailsModal.propertyLink && (
                      <p><strong>Link:</strong> 
                        <a href={showDetailsModal.propertyLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                          Ver Imóvel
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Gestor</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Nome:</strong> {showDetailsModal.managerName || 'N/A'}</p>
                    <p><strong>Telefone:</strong> {showDetailsModal.managerPhone || 'N/A'}</p>
                    <p><strong>Email:</strong> {showDetailsModal.managerEmail || 'N/A'}</p>
                    <p><strong>Contactos:</strong> {showDetailsModal.managerContactHistory?.length || 0}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Metadados</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Criado:</strong> {
                      showDetailsModal.createdAt?.toDate ? 
                        showDetailsModal.createdAt.toDate().toLocaleDateString('pt-PT') :
                        new Date(showDetailsModal.createdAt).toLocaleDateString('pt-PT')
                    }</p>
                  </div>
                </div>
              </div>
            </div>
            
            {showDetailsModal.notes && (
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-2">Notas</h4>
                <p className="text-sm p-3 bg-gray-50 rounded">{showDetailsModal.notes}</p>
              </div>
            )}

            {showDetailsModal.managerNotes && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-800 mb-2">Notas do Gestor</h4>
                <p className="text-sm p-3 bg-gray-50 rounded">{showDetailsModal.managerNotes}</p>
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

      {/* Modal de confirmação de eliminação */}
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