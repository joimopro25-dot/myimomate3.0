// src/components/clients/ClientsList.jsx
import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedButton } from '../common/ThemedComponents';
import useClients from '../../hooks/useClients';

// 🎯 COMPONENTE DE LISTAGEM AVANÇADA DE CLIENTES
// ==============================================
// MyImoMate 3.0 - Lista inteligente com filtros, ordenação e ações
// Funcionalidades: Ordenação, Filtros múltiplos, Seleção, Exportação, Interações

const ClientsList = ({
  showFilters = true,
  showActions = true,
  showSelection = true,
  compactMode = false,
  onClientSelect,
  onClientEdit,
  onAddInteraction,
  maxHeight = '700px'
}) => {
  const { theme } = useTheme();
  
  // Hook de clientes
  const {
    clients,
    loading,
    error,
    updating,
    updateClient,
    updateClientStatus,
    deleteClient,
    addInteraction,
    CLIENT_STATUS,
    CLIENT_TYPES,
    CLIENT_BUDGET_RANGES,
    CLIENT_STATUS_COLORS
  } = useClients();

  // Estados de ordenação
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Estados de filtros
  const [localFilters, setLocalFilters] = useState({
    status: '',
    clientType: '',
    budgetRange: '',
    city: '',
    hasInteractions: false,
    isVIP: false,
    dateRange: 'all',
    contactMethod: ''
  });
  
  // Estados de seleção
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Estados de UI
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showQuickInteraction, setShowQuickInteraction] = useState(false);
  const [selectedClientForAction, setSelectedClientForAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(compactMode ? 25 : 15);
  
  // Estados de ações
  const [actionLoading, setActionLoading] = useState({});
  const [quickInteractionForm, setQuickInteractionForm] = useState({
    type: 'call',
    subject: '',
    description: '',
    outcome: 'neutral'
  });

  // 🔄 ORDENAR DADOS
  const sortedClients = useMemo(() => {
    if (!clients.length) return [];
    
    return [...clients].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Tratamento especial para campos nested
      if (sortField === 'address.city') {
        aValue = a.address?.city || '';
        bValue = b.address?.city || '';
      }
      
      // Tratamento especial para datas
      if (sortField === 'createdAt' || sortField === 'updatedAt' || sortField === 'lastInteraction') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      // Tratamento para strings
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      // Tratamento para números
      if (sortField === 'totalInteractions') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [clients, sortField, sortDirection]);

  // 🔍 FILTRAR DADOS
  const filteredClients = useMemo(() => {
    let filtered = sortedClients;

    // Filtro por status
    if (localFilters.status) {
      filtered = filtered.filter(client => client.status === localFilters.status);
    }

    // Filtro por tipo de cliente
    if (localFilters.clientType) {
      filtered = filtered.filter(client => client.clientType === localFilters.clientType);
    }

    // Filtro por faixa de orçamento
    if (localFilters.budgetRange) {
      filtered = filtered.filter(client => client.budgetRange === localFilters.budgetRange);
    }

    // Filtro por cidade
    if (localFilters.city) {
      filtered = filtered.filter(client => 
        client.address?.city?.toLowerCase().includes(localFilters.city.toLowerCase())
      );
    }

    // Filtro apenas VIP
    if (localFilters.isVIP) {
      filtered = filtered.filter(client => client.isVIP);
    }

    // Filtro apenas com interações
    if (localFilters.hasInteractions) {
      filtered = filtered.filter(client => (client.totalInteractions || 0) > 0);
    }

    // Filtro por método de contacto preferido
    if (localFilters.contactMethod) {
      filtered = filtered.filter(client => client.preferredContactMethod === localFilters.contactMethod);
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
        case '3months':
          filterDate.setMonth(now.getMonth() - 3);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter(client => new Date(client.createdAt) >= filterDate);
    }

    return filtered;
  }, [sortedClients, localFilters]);

  // 📄 PAGINAÇÃO
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredClients.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredClients, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

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
  const handleSelectClient = (clientId) => {
    setSelectedClients(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedClients([]);
    } else {
      setSelectedClients(paginatedClients.map(client => client.id));
    }
    setSelectAll(!selectAll);
  };

  // 🔄 ATUALIZAR STATUS EM LOTE
  const handleBulkStatusUpdate = async (newStatus) => {
    setActionLoading(prev => ({ ...prev, bulkStatus: true }));
    
    try {
      const promises = selectedClients.map(clientId => 
        updateClientStatus(clientId, newStatus)
      );
      
      await Promise.all(promises);
      setSelectedClients([]);
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
    if (!window.confirm(`Eliminar ${selectedClients.length} clientes selecionados?`)) {
      return;
    }

    setActionLoading(prev => ({ ...prev, bulkDelete: true }));
    
    try {
      const promises = selectedClients.map(clientId => deleteClient(clientId));
      await Promise.all(promises);
      
      setSelectedClients([]);
      setSelectAll(false);
      setShowBulkActions(false);
    } catch (error) {
      console.error('Erro na eliminação em lote:', error);
    } finally {
      setActionLoading(prev => ({ ...prev, bulkDelete: false }));
    }
  };

  // 📞 INTERAÇÃO RÁPIDA
  const handleQuickInteractionSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClientForAction) return;

    try {
      const result = await addInteraction(selectedClientForAction.id, quickInteractionForm);
      
      if (result.success) {
        setShowQuickInteraction(false);
        setSelectedClientForAction(null);
        setQuickInteractionForm({
          type: 'call',
          subject: '',
          description: '',
          outcome: 'neutral'
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar interação:', error);
    }
  };

  // 📊 EXPORTAR CLIENTES
  const handleExport = (format = 'csv') => {
    const dataToExport = selectedClients.length > 0 
      ? clients.filter(client => selectedClients.includes(client.id))
      : filteredClients;

    if (format === 'csv') {
      exportToCSV(dataToExport);
    } else if (format === 'json') {
      exportToJSON(dataToExport);
    }
    
    setShowExportModal(false);
  };

  const exportToCSV = (data) => {
    const headers = [
      'Nome', 'Tipo', 'Status', 'Telefone Principal', 'Email Principal', 
      'NIF', 'Cidade', 'Orçamento', 'Total Interações', 'Última Interação', 'Data Criação'
    ];
    
    const csvContent = [
      headers.join(','),
      ...data.map(client => [
        `"${client.name}"`,
        `"${getClientTypeLabel(client.clientType)}"`,
        `"${getStatusLabel(client.status)}"`,
        `"${client.phone || ''}"`,
        `"${client.email || ''}"`,
        `"${client.nif || ''}"`,
        `"${client.address?.city || ''}"`,
        `"${CLIENT_BUDGET_RANGES[client.budgetRange] || ''}"`,
        `"${client.totalInteractions || 0}"`,
        `"${client.lastInteraction?.toLocaleDateString('pt-PT') || 'Nunca'}"`,
        `"${client.createdAt?.toLocaleDateString('pt-PT') || ''}"`
      ].join(','))
    ].join('\n');

    downloadFile(csvContent, 'clientes.csv', 'text/csv');
  };

  const exportToJSON = (data) => {
    const exportData = data.map(client => ({
      id: client.id,
      name: client.name,
      clientType: client.clientType,
      status: client.status,
      phone: client.phone,
      email: client.email,
      nif: client.nif,
      address: client.address,
      budgetRange: client.budgetRange,
      totalInteractions: client.totalInteractions,
      lastInteraction: client.lastInteraction,
      createdAt: client.createdAt,
      notes: client.notes
    }));
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    downloadFile(jsonContent, 'clientes.json', 'application/json');
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
  const getClientTypeLabel = (type) => {
    const labels = {
      [CLIENT_TYPES.COMPRADOR]: 'Comprador',
      [CLIENT_TYPES.VENDEDOR]: 'Vendedor',
      [CLIENT_TYPES.INQUILINO]: 'Inquilino',
      [CLIENT_TYPES.SENHORIO]: 'Senhorio',
      [CLIENT_TYPES.INVESTIDOR]: 'Investidor',
      [CLIENT_TYPES.MISTO]: 'Misto'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status) => {
    const labels = {
      [CLIENT_STATUS.ATIVO]: 'Ativo',
      [CLIENT_STATUS.INATIVO]: 'Inativo',
      [CLIENT_STATUS.VIP]: 'VIP',
      [CLIENT_STATUS.PROSPECT]: 'Prospect',
      [CLIENT_STATUS.EX_CLIENTE]: 'Ex-Cliente',
      [CLIENT_STATUS.BLOQUEADO]: 'Bloqueado'
    };
    return labels[status] || status;
  };

  // ⚡ EFEITOS
  useEffect(() => {
    setCurrentPage(1);
  }, [localFilters]);

  useEffect(() => {
    setSelectAll(false);
    setSelectedClients([]);
  }, [currentPage]);

  useEffect(() => {
    setShowBulkActions(selectedClients.length > 0);
  }, [selectedClients]);

  return (
    <div className="clients-list">
      
      {/* BARRA DE FILTROS */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            
            {/* Filtro Status */}
            <select
              value={localFilters.status}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todos Status</option>
              {Object.values(CLIENT_STATUS).map(status => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>

            {/* Filtro Tipo */}
            <select
              value={localFilters.clientType}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, clientType: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todos Tipos</option>
              {Object.values(CLIENT_TYPES).map(type => (
                <option key={type} value={type}>
                  {getClientTypeLabel(type)}
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
              {Object.entries(CLIENT_BUDGET_RANGES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>

            {/* Filtro Cidade */}
            <input
              type="text"
              placeholder="Filtrar por cidade"
              value={localFilters.city}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, city: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />

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
              <option value="3months">Últimos 3 Meses</option>
            </select>

            {/* Filtros especiais */}
            <div className="flex gap-2">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={localFilters.isVIP}
                  onChange={(e) => setLocalFilters(prev => ({ ...prev, isVIP: e.target.checked }))}
                  className="mr-1"
                />
                Apenas VIP
              </label>
            </div>
          </div>

          {/* Segunda linha de filtros */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            
            {/* Método de Contacto */}
            <select
              value={localFilters.contactMethod}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, contactMethod: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Todos Métodos Contacto</option>
              <option value="phone">Telefone</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="sms">SMS</option>
            </select>

            {/* Com Interações */}
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={localFilters.hasInteractions}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, hasInteractions: e.target.checked }))}
                className="mr-2"
              />
              Apenas com Interações
            </label>

            {/* Botão Limpar */}
            <button
              onClick={() => setLocalFilters({
                status: '',
                clientType: '',
                budgetRange: '',
                city: '',
                hasInteractions: false,
                isVIP: false,
                dateRange: 'all',
                contactMethod: ''
              })}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm border border-gray-300 rounded-lg"
            >
              🔄 Limpar Filtros
            </button>
          </div>
        </div>
      )}

      {/* AÇÕES EM LOTE */}
      {showBulkActions && showActions && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedClients.length} clientes selecionados
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
                {Object.values(CLIENT_STATUS).map(status => (
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
          Mostrando {paginatedClients.length} de {filteredClients.length} clientes
          {filteredClients.length !== clients.length && ` (${clients.length} total)`}
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value={10}>10 por página</option>
            <option value={15}>15 por página</option>
            <option value={25}>25 por página</option>
            <option value={50}>50 por página</option>
          </select>
          
          {!selectedClients.length && showActions && (
            <button
              onClick={() => setShowExportModal(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              📊 Exportar Todos
            </button>
          )}
        </div>
      </div>

      {/* TABELA DE CLIENTES */}
      <div 
        className="bg-white rounded-lg shadow overflow-hidden"
        style={{ maxHeight: maxHeight }}
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-gray-600">Carregando clientes...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <div className="text-2xl mb-2">❌</div>
            <p className="text-red-600">{error}</p>
          </div>
        ) : paginatedClients.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-2">👥</div>
            <p className="text-gray-600">Nenhum cliente encontrado</p>
            <p className="text-sm text-gray-500 mt-2">
              {Object.values(localFilters).some(f => f) 
                ? 'Tente ajustar os filtros' 
                : 'Comece criando o seu primeiro cliente'
              }
            </p>
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
                    Cliente {getSortIcon('name')}
                  </th>
                  
                  <th 
                    className="p-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('clientType')}
                  >
                    Tipo {getSortIcon('clientType')}
                  </th>
                  
                  <th 
                    className="p-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    Status {getSortIcon('status')}
                  </th>
                  
                  <th className="p-3 text-left font-medium text-gray-700">
                    Contacto
                  </th>
                  
                  <th 
                    className="p-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('address.city')}
                  >
                    Localização {getSortIcon('address.city')}
                  </th>
                  
                  <th 
                    className="p-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalInteractions')}
                  >
                    Interações {getSortIcon('totalInteractions')}
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
                {paginatedClients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-gray-50">
                    
                    {/* Checkbox */}
                    {showSelection && (
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(client.id)}
                          onChange={() => handleSelectClient(client.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                    )}
                    
                    {/* Cliente */}
                    <td className="p-3">
                      <div 
                        className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 flex items-center gap-2"
                        onClick={() => onClientSelect?.(client)}
                      >
                        {client.name}
                        {client.isVIP && <span className="text-purple-600" title="Cliente VIP">👑</span>}
                      </div>
                      {client.nif && (
                        <div className="text-xs text-gray-500">NIF: {client.nif}</div>
                      )}
                    </td>

                    {/* Tipo */}
                    <td className="p-3">
                      <div className="text-sm">
                        {getClientTypeLabel(client.clientType)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${CLIENT_STATUS_COLORS[client.status]}`}>
                        {getStatusLabel(client.status)}
                      </span>
                    </td>

                    {/* Contacto */}
                    <td className="p-3">
                      {client.phone && (
                        <div className="text-sm">📞 {client.phone}</div>
                      )}
                      {client.email && (
                        <div className="text-sm">✉️ {client.email}</div>
                      )}
                      {client.preferredContactMethod && (
                        <div className="text-xs text-gray-500">
                          Pref: {client.preferredContactMethod}
                        </div>
                      )}
                    </td>

                    {/* Localização */}
                    <td className="p-3">
                      {client.address?.city && (
                        <div className="text-sm">📍 {client.address.city}</div>
                      )}
                      {client.address?.postalCode && (
                        <div className="text-xs text-gray-500">{client.address.postalCode}</div>
                      )}
                    </td>

                    {/* Interações */}
                    <td className="p-3">
                      <div className="text-sm">
                        <div className="font-medium">{client.totalInteractions || 0}</div>
                        {client.lastInteraction && (
                          <div className="text-xs text-gray-500">
                            {client.lastInteraction.toLocaleDateString('pt-PT')}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Data criação */}
                    <td className="p-3">
                      <div className="text-sm text-gray-500">
                        {client.createdAt?.toLocaleDateString('pt-PT')}
                      </div>
                    </td>

                    {/* Ações */}
                    {showActions && (
                      <td className="p-3">
                        <div className="flex justify-center gap-1">
                          
                          {/* Ver detalhes */}
                          <button
                            onClick={() => onClientSelect?.(client)}
                            className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 rounded"
                            title="Ver Detalhes"
                          >
                            👁️
                          </button>

                          {/* Adicionar interação */}
                          <button
                            onClick={() => {
                              setSelectedClientForAction(client);
                              setShowQuickInteraction(true);
                            }}
                            className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded"
                            title="Nova Interação"
                          >
                            📞
                          </button>

                          {/* Editar */}
                          <button
                            onClick={() => onClientEdit?.(client)}
                            className="text-orange-600 hover:text-orange-800 text-xs px-2 py-1 rounded"
                            title="Editar Cliente"
                          >
                            ✏️
                          </button>
                          
                          {/* Alterar Status */}
                          <select
                            value={client.status}
                            onChange={(e) => updateClientStatus(client.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-1 py-1"
                            title="Alterar Status"
                          >
                            {Object.values(CLIENT_STATUS).map(status => (
                              <option key={status} value={status}>
                                {getStatusLabel(status)}
                              </option>
                            ))}
                          </select>
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
            <h3 className="text-xl font-bold mb-4">Exportar Clientes</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 mb-2">
                  {selectedClients.length > 0 
                    ? `Exportar ${selectedClients.length} clientes selecionados`
                    : `Exportar ${filteredClients.length} clientes filtrados`
                  }
                </p>
              </div>

              <div className="flex gap-3">
                <ThemedButton
                  onClick={() => handleExport('csv')}
                  className="flex-1"
                >
                  📊 CSV (Excel)
                </ThemedButton>
                
                <ThemedButton
                  onClick={() => handleExport('json')}
                  className="flex-1"
                >
                  📄 JSON (Dados)
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

      {/* MODAL DE INTERAÇÃO RÁPIDA */}
      {showQuickInteraction && selectedClientForAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Nova Interação</h3>
            
            <div className="mb-4">
              <p className="text-gray-600">
                Cliente: <strong>{selectedClientForAction.name}</strong>
              </p>
            </div>

            <form onSubmit={handleQuickInteractionSubmit} className="space-y-4">
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Interação
                </label>
                <select
                  value={quickInteractionForm.type}
                  onChange={(e) => setQuickInteractionForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="call">Chamada Telefónica</option>
                  <option value="email">Email</option>
                  <option value="meeting">Reunião</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="note">Nota</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assunto
                </label>
                <input
                  type="text"
                  value={quickInteractionForm.subject}
                  onChange={(e) => setQuickInteractionForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Resumo da interação"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={quickInteractionForm.description}
                  onChange={(e) => setQuickInteractionForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Detalhes da interação..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resultado
                </label>
                <select
                  value={quickInteractionForm.outcome}
                  onChange={(e) => setQuickInteractionForm(prev => ({ ...prev, outcome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="positive">Positivo</option>
                  <option value="neutral">Neutro</option>
                  <option value="negative">Negativo</option>
                  <option value="follow_up_needed">Requer Follow-up</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <ThemedButton
                  type="submit"
                  className="flex-1"
                >
                  ✅ Registar
                </ThemedButton>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickInteraction(false);
                    setSelectedClientForAction(null);
                    setQuickInteractionForm({
                      type: 'call',
                      subject: '',
                      description: '',
                      outcome: 'neutral'
                    });
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
    </div>
  );
};

export default ClientsList;