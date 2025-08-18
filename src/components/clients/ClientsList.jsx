// src/components/clients/ClientsList.jsx
import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedButton } from '../common/ThemedComponents';
import useClients from '../../hooks/useClients';

// 🎯 COMPONENTE DE LISTAGEM ENTERPRISE DE CLIENTES
// ===============================================
// MyImoMate 3.0 - Lista profissional com filtros avançados, ordenação e ações em lote
// Funcionalidades: 8 Filtros, Ordenação, Seleção múltipla, Exportação, Interações rápidas

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
  
  // Estados de filtros avançados (8 filtros)
  const [localFilters, setLocalFilters] = useState({
    status: '',
    clientType: '',
    budgetRange: '',
    city: '',
    hasInteractions: false,
    isVIP: false,
    dateRange: 'all',
    contactMethod: '',
    searchTerm: ''
  });
  
  // Estados de seleção múltipla
  const [selectedClients, setSelectedClients] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Estados de UI e modais
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showQuickInteraction, setShowQuickInteraction] = useState(false);
  const [selectedClientForAction, setSelectedClientForAction] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(compactMode ? 20 : 15);
  
  // Estados de ações e loading
  const [actionLoading, setActionLoading] = useState({});
  const [quickInteractionForm, setQuickInteractionForm] = useState({
    type: 'call',
    subject: '',
    description: '',
    outcome: 'neutral'
  });

  // 🔄 ORDENAR DADOS POR MÚLTIPLAS COLUNAS
  const sortedClients = useMemo(() => {
    if (!clients.length) return [];
    
    return [...clients].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Tratamento especial para datas
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      // Tratamento para campos aninhados (address.city)
      if (sortField === 'city') {
        aValue = a.address?.city || '';
        bValue = b.address?.city || '';
      }
      
      // Tratamento para contagem de interações
      if (sortField === 'totalInteractions') {
        aValue = a.totalInteractions || 0;
        bValue = b.totalInteractions || 0;
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
  }, [clients, sortField, sortDirection]);

  // 🔍 FILTRAR DADOS COM 8 FILTROS AVANÇADOS
  const filteredClients = useMemo(() => {
    let filtered = sortedClients;

    // Filtro por termo de pesquisa global
    if (localFilters.searchTerm) {
      const term = localFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(term) ||
        client.phone.includes(term) ||
        client.email.toLowerCase().includes(term) ||
        (client.company && client.company.toLowerCase().includes(term)) ||
        (client.profession && client.profession.toLowerCase().includes(term))
      );
    }

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

    // Filtro apenas VIP (checkbox especial)
    if (localFilters.isVIP) {
      filtered = filtered.filter(client => client.status === 'vip');
    }

    // Filtro apenas com interações (checkbox especial)
    if (localFilters.hasInteractions) {
      filtered = filtered.filter(client => (client.totalInteractions || 0) > 0);
    }

    // Filtro por método de contacto preferido
    if (localFilters.contactMethod) {
      filtered = filtered.filter(client => client.preferredContactMethod === localFilters.contactMethod);
    }

    // Filtro por data de criação
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

  // 📄 PAGINAÇÃO INTELIGENTE
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

  // ✅ MANIPULAR SELEÇÃO MÚLTIPLA
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

  // 📊 EXPORTAR CLIENTES (CSV ESTRUTURADO E JSON)
  const handleExport = (format = 'csv') => {
    const dataToExport = selectedClients.length > 0 
      ? clients.filter(client => selectedClients.includes(client.id))
      : filteredClients;

    if (format === 'csv') {
      // CSV estruturado para Excel
      const csvContent = [
        // Cabeçalho
        [
          'Nome',
          'Telefone',
          'Email',
          'Tipo',
          'Status',
          'Orçamento',
          'Cidade',
          'Profissão',
          'Empresa',
          'Interações',
          'Criado em'
        ].join(','),
        // Dados
        ...dataToExport.map(client => [
          `"${client.name}"`,
          `"${client.phone}"`,
          `"${client.email}"`,
          `"${CLIENT_TYPES[client.clientType] || client.clientType}"`,
          `"${CLIENT_STATUS[client.status] || client.status}"`,
          `"${CLIENT_BUDGET_RANGES[client.budgetRange] || 'N/A'}"`,
          `"${client.address?.city || 'N/A'}"`,
          `"${client.profession || 'N/A'}"`,
          `"${client.company || 'N/A'}"`,
          client.totalInteractions || 0,
          `"${new Date(client.createdAt).toLocaleDateString('pt-PT')}"`
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } else if (format === 'json') {
      // JSON completo para backup/importação
      const jsonContent = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `clientes_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
    }

    setShowExportModal(false);
  };

  // 🔄 ATUALIZAR FILTROS
  const updateFilter = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset para primeira página
  };

  // 🗑️ LIMPAR FILTROS
  const clearFilters = () => {
    setLocalFilters({
      status: '',
      clientType: '',
      budgetRange: '',
      city: '',
      hasInteractions: false,
      isVIP: false,
      dateRange: 'all',
      contactMethod: '',
      searchTerm: ''
    });
    setCurrentPage(1);
  };

  // 🎨 OBTER COR DO STATUS
  const getStatusColor = (status) => {
    const colors = {
      'ativo': 'bg-green-100 text-green-800',
      'inativo': 'bg-gray-100 text-gray-800',
      'vip': 'bg-purple-100 text-purple-800',
      'prospect': 'bg-blue-100 text-blue-800',
      'ex_cliente': 'bg-orange-100 text-orange-800',
      'bloqueado': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // 🔄 EFEITOS
  useEffect(() => {
    setShowBulkActions(selectedClients.length > 0);
  }, [selectedClients]);

  useEffect(() => {
    // Reset seleção quando filtros mudam
    setSelectedClients([]);
    setSelectAll(false);
  }, [localFilters]);

  return (
    <div className="clients-list">
      
      {/* FILTROS AVANÇADOS (2 LINHAS) */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          
          {/* Primeira linha de filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Pesquisa Global */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pesquisa Global
              </label>
              <input
                type="text"
                value={localFilters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Nome, telefone, email, empresa..."
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={localFilters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="vip">VIP</option>
                <option value="prospect">Prospect</option>
                <option value="ex_cliente">Ex-Cliente</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
            </div>

            {/* Tipo de Cliente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                value={localFilters.clientType}
                onChange={(e) => updateFilter('clientType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os tipos</option>
                <option value="comprador">Comprador</option>
                <option value="vendedor">Vendedor</option>
                <option value="inquilino">Inquilino</option>
                <option value="senhorio">Senhorio</option>
                <option value="investidor">Investidor</option>
                <option value="misto">Misto</option>
              </select>
            </div>

            {/* Faixa de Orçamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orçamento
              </label>
              <select
                value={localFilters.budgetRange}
                onChange={(e) => updateFilter('budgetRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as faixas</option>
                <option value="0-50k">Até €50.000</option>
                <option value="50k-100k">€50.000 - €100.000</option>
                <option value="100k-200k">€100.000 - €200.000</option>
                <option value="200k-300k">€200.000 - €300.000</option>
                <option value="300k-500k">€300.000 - €500.000</option>
                <option value="500k-750k">€500.000 - €750.000</option>
                <option value="750k-1M">€750.000 - €1.000.000</option>
                <option value="1M-2M">€1.000.000 - €2.000.000</option>
                <option value="2M+">Acima de €2.000.000</option>
                <option value="unlimited">Sem limite</option>
              </select>
            </div>
          </div>

          {/* Segunda linha de filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Cidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade
              </label>
              <input
                type="text"
                value={localFilters.city}
                onChange={(e) => updateFilter('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Lisboa, Porto..."
              />
            </div>

            {/* Método de Contacto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contacto Preferido
              </label>
              <select
                value={localFilters.contactMethod}
                onChange={(e) => updateFilter('contactMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="phone">Telefone</option>
                <option value="email">Email</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
              </select>
            </div>

            {/* Data de Criação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Criado
              </label>
              <select
                value={localFilters.dateRange}
                onChange={(e) => updateFilter('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todo o período</option>
                <option value="today">Hoje</option>
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
                <option value="3months">Últimos 3 meses</option>
              </select>
            </div>

            {/* Checkboxes Especiais */}
            <div className="flex flex-col gap-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.isVIP}
                  onChange={(e) => updateFilter('isVIP', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">👑 Apenas VIP</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={localFilters.hasInteractions}
                  onChange={(e) => updateFilter('hasInteractions', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">💬 Com Interações</span>
              </label>
            </div>

            {/* Botão Limpar Filtros */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                🗑️ Limpar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AÇÕES EM LOTE */}
      {showBulkActions && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              {selectedClients.length} cliente(s) selecionado(s)
            </div>
            
            <div className="flex gap-2">
              <select
                onChange={(e) => e.target.value && handleBulkStatusUpdate(e.target.value)}
                className="px-3 py-1 text-sm border border-blue-300 rounded"
                value=""
              >
                <option value="">Alterar Status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="vip">VIP</option>
                <option value="prospect">Prospect</option>
                <option value="bloqueado">Bloqueado</option>
              </select>
              
              <button
                onClick={() => handleExport('csv')}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                📊 Exportar CSV
              </button>
              
              <button
                onClick={handleBulkDelete}
                disabled={actionLoading.bulkDelete}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
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
                    Contactos
                  </th>
                  
                  <th 
                    className="p-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('city')}
                  >
                    Cidade {getSortIcon('city')}
                  </th>
                  
                  <th 
                    className="p-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('budgetRange')}
                  >
                    Orçamento {getSortIcon('budgetRange')}
                  </th>
                  
                  <th 
                    className="p-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('totalInteractions')}
                  >
                    Interações {getSortIcon('totalInteractions')}
                  </th>
                  
                  {showActions && (
                    <th className="p-3 text-center font-medium text-gray-700">
                      Ações
                    </th>
                  )}
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-200">
                {paginatedClients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    
                    {/* Checkbox seleção */}
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

                    {/* Nome e detalhes */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium text-gray-900 flex items-center gap-1">
                            {client.name}
                            {client.status === 'vip' && <span className="text-yellow-500">👑</span>}
                          </div>
                          {client.profession && (
                            <div className="text-sm text-gray-500">{client.profession}</div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Tipo */}
                    <td className="p-3">
                      <span className="text-sm text-gray-700 capitalize">
                        {client.clientType.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                        {client.status === 'vip' ? 'VIP' : client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </span>
                    </td>

                    {/* Contactos */}
                    <td className="p-3">
                      <div className="text-sm">
                        <div className="text-gray-900">{client.phone}</div>
                        <div className="text-gray-500">{client.email}</div>
                      </div>
                    </td>

                    {/* Cidade */}
                    <td className="p-3">
                      <span className="text-sm text-gray-700">
                        {client.address?.city || 'N/A'}
                      </span>
                    </td>

                    {/* Orçamento */}
                    <td className="p-3">
                      <span className="text-sm text-gray-700">
                        {CLIENT_BUDGET_RANGES[client.budgetRange] || 'A definir'}
                      </span>
                    </td>

                    {/* Interações */}
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-700">
                          {client.totalInteractions || 0}
                        </span>
                        {(client.totalInteractions || 0) > 0 && (
                          <span className="text-blue-500">💬</span>
                        )}
                      </div>
                    </td>

                    {/* Ações */}
                    {showActions && (
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          
                          {/* Interação rápida */}
                          <button
                            onClick={() => {
                              setSelectedClientForAction(client);
                              setShowQuickInteraction(true);
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Adicionar interação"
                          >
                            💬
                          </button>

                          {/* Editar */}
                          <button
                            onClick={() => onClientEdit?.(client)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Editar cliente"
                          >
                            ✏️
                          </button>

                          {/* Ver detalhes */}
                          <button
                            onClick={() => onClientSelect?.(client)}
                            className="p-1 text-gray-600 hover:text-gray-800"
                            title="Ver detalhes"
                          >
                            👁️
                          </button>

                          {/* Eliminar */}
                          <button
                            onClick={async () => {
                              if (window.confirm(`Eliminar ${client.name}?`)) {
                                await deleteClient(client.id);
                              }
                            }}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Eliminar cliente"
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
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Página {currentPage} de {totalPages}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              ← Anterior
            </button>
            
            {/* Números das páginas */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return pageNum <= totalPages ? (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 text-sm border rounded ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              ) : null;
            })}
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Próximo →
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE EXPORTAÇÃO */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Exportar Clientes</h3>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleExport('csv')}
                className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <div className="font-medium">📊 CSV para Excel</div>
                <div className="text-sm text-gray-500">
                  Formato estruturado para análise em Excel
                </div>
              </button>
              
              <button
                onClick={() => handleExport('json')}
                className="w-full p-3 text-left border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <div className="font-medium">📄 JSON Completo</div>
                <div className="text-sm text-gray-500">
                  Backup completo com todos os dados
                </div>
              </button>
            </div>

            <div className="flex gap-3">
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
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-bold mb-4">
              Nova Interação - {selectedClientForAction.name}
            </h3>
            
            <form onSubmit={handleQuickInteractionSubmit} className="space-y-4">
              {/* Tipo de Interação */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Interação
                </label>
                <select
                  value={quickInteractionForm.type}
                  onChange={(e) => setQuickInteractionForm(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="call">📞 Chamada</option>
                  <option value="email">📧 Email</option>
                  <option value="meeting">🤝 Reunião</option>
                  <option value="whatsapp">💬 WhatsApp</option>
                  <option value="note">📝 Nota</option>
                </select>
              </div>

              {/* Assunto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assunto
                </label>
                <input
                  type="text"
                  value={quickInteractionForm.subject}
                  onChange={(e) => setQuickInteractionForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Breve descrição da interação"
                  required
                />
              </div>

              {/* Descrição */}
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

              {/* Resultado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resultado
                </label>
                <select
                  value={quickInteractionForm.outcome}
                  onChange={(e) => setQuickInteractionForm(prev => ({ ...prev, outcome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="positive">✅ Positivo</option>
                  <option value="neutral">➖ Neutro</option>
                  <option value="negative">❌ Negativo</option>
                  <option value="follow_up">🔄 Requer Follow-up</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <ThemedButton type="submit" className="flex-1">
                  💬 Adicionar Interação
                </ThemedButton>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickInteraction(false);
                    setSelectedClientForAction(null);
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