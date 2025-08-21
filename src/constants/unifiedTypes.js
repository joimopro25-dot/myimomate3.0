// src/constants/unifiedTypes.js
// 🎯 TIPOS UNIFICADOS - MyImoMate 3.0
// ===================================
// Sistema padronizado para eliminar inconsistências entre módulos
// Todos os módulos devem importar e usar estas constantes

// 🏠 TIPOS DE INTERESSE UNIFICADOS (17 tipos completos)
// ====================================================
// Utilizados em: Leads, Clientes, Oportunidades, Negócios
export const UNIFIED_INTEREST_TYPES = {
  // COMPRA
  COMPRA_CASA: 'compra_casa',
  COMPRA_APARTAMENTO: 'compra_apartamento',
  COMPRA_TERRENO: 'compra_terreno',
  COMPRA_COMERCIAL: 'compra_comercial',
  COMPRA_QUINTA: 'compra_quinta',
  
  // VENDA
  VENDA_CASA: 'venda_casa',
  VENDA_APARTAMENTO: 'venda_apartamento',
  VENDA_TERRENO: 'venda_terreno',
  VENDA_COMERCIAL: 'venda_comercial',
  VENDA_QUINTA: 'venda_quinta',
  
  // ARRENDAMENTO
  ARRENDAMENTO_CASA: 'arrendamento_casa',
  ARRENDAMENTO_APARTAMENTO: 'arrendamento_apartamento',
  ARRENDAMENTO_COMERCIAL: 'arrendamento_comercial',
  
  // SERVIÇOS
  INVESTIMENTO: 'investimento',
  AVALIACAO: 'avaliacao',
  CONSULTORIA: 'consultoria',
  GESTAO_PATRIMONIAL: 'gestao_patrimonial'
};

// 🏷️ RÓTULOS LEGÍVEIS PARA TIPOS DE INTERESSE
export const UNIFIED_INTEREST_LABELS = {
  [UNIFIED_INTEREST_TYPES.COMPRA_CASA]: 'Compra de Moradia',
  [UNIFIED_INTEREST_TYPES.COMPRA_APARTAMENTO]: 'Compra de Apartamento',
  [UNIFIED_INTEREST_TYPES.COMPRA_TERRENO]: 'Compra de Terreno',
  [UNIFIED_INTEREST_TYPES.COMPRA_COMERCIAL]: 'Compra de Imóvel Comercial',
  [UNIFIED_INTEREST_TYPES.COMPRA_QUINTA]: 'Compra de Quinta/Herdade',
  
  [UNIFIED_INTEREST_TYPES.VENDA_CASA]: 'Venda de Moradia',
  [UNIFIED_INTEREST_TYPES.VENDA_APARTAMENTO]: 'Venda de Apartamento',
  [UNIFIED_INTEREST_TYPES.VENDA_TERRENO]: 'Venda de Terreno',
  [UNIFIED_INTEREST_TYPES.VENDA_COMERCIAL]: 'Venda de Imóvel Comercial',
  [UNIFIED_INTEREST_TYPES.VENDA_QUINTA]: 'Venda de Quinta/Herdade',
  
  [UNIFIED_INTEREST_TYPES.ARRENDAMENTO_CASA]: 'Arrendamento de Moradia',
  [UNIFIED_INTEREST_TYPES.ARRENDAMENTO_APARTAMENTO]: 'Arrendamento de Apartamento',
  [UNIFIED_INTEREST_TYPES.ARRENDAMENTO_COMERCIAL]: 'Arrendamento Comercial',
  
  [UNIFIED_INTEREST_TYPES.INVESTIMENTO]: 'Investimento Imobiliário',
  [UNIFIED_INTEREST_TYPES.AVALIACAO]: 'Avaliação de Imóvel',
  [UNIFIED_INTEREST_TYPES.CONSULTORIA]: 'Consultoria Imobiliária',
  [UNIFIED_INTEREST_TYPES.GESTAO_PATRIMONIAL]: 'Gestão Patrimonial'
};

// 💰 FAIXAS DE ORÇAMENTO UNIFICADAS (11 faixas otimizadas para mercado português)
// =============================================================================
export const UNIFIED_BUDGET_RANGES = {
  'ate_50k': 'Até €50.000',
  '50k_100k': '€50.000 - €100.000',
  '100k_150k': '€100.000 - €150.000',
  '150k_250k': '€150.000 - €250.000',
  '250k_350k': '€250.000 - €350.000',
  '350k_500k': '€350.000 - €500.000',
  '500k_750k': '€500.000 - €750.000',
  '750k_1M': '€750.000 - €1.000.000',
  '1M_1_5M': '€1.000.000 - €1.500.000',
  '1_5M_2M': '€1.500.000 - €2.000.000',
  '2M_plus': 'Acima de €2.000.000',
  'indefinido': 'A definir'
};

// 📊 PRIORIDADES UNIFICADAS
// =========================
export const UNIFIED_PRIORITIES = {
  BAIXA: 'baixa',
  NORMAL: 'normal',
  ALTA: 'alta',
  URGENTE: 'urgente'
};

export const UNIFIED_PRIORITY_LABELS = {
  [UNIFIED_PRIORITIES.BAIXA]: 'Baixa',
  [UNIFIED_PRIORITIES.NORMAL]: 'Normal',
  [UNIFIED_PRIORITIES.ALTA]: 'Alta',
  [UNIFIED_PRIORITIES.URGENTE]: 'Urgente'
};

// 🎨 CORES PARA PRIORIDADES
export const UNIFIED_PRIORITY_COLORS = {
  [UNIFIED_PRIORITIES.BAIXA]: 'bg-gray-100 text-gray-800',
  [UNIFIED_PRIORITIES.NORMAL]: 'bg-blue-100 text-blue-800',
  [UNIFIED_PRIORITIES.ALTA]: 'bg-orange-100 text-orange-800',
  [UNIFIED_PRIORITIES.URGENTE]: 'bg-red-100 text-red-800'
};

// 📈 STATUS DE LEAD UNIFICADOS
// ============================
export const UNIFIED_LEAD_STATUS = {
  NOVO: 'novo',
  CONTACTADO: 'contactado',
  QUALIFICADO: 'qualificado',
  CONVERTIDO: 'convertido',
  PERDIDO: 'perdido',
  INATIVO: 'inativo'
};

export const UNIFIED_LEAD_STATUS_LABELS = {
  [UNIFIED_LEAD_STATUS.NOVO]: 'Novo Lead',
  [UNIFIED_LEAD_STATUS.CONTACTADO]: 'Contactado',
  [UNIFIED_LEAD_STATUS.QUALIFICADO]: 'Qualificado',
  [UNIFIED_LEAD_STATUS.CONVERTIDO]: 'Convertido',
  [UNIFIED_LEAD_STATUS.PERDIDO]: 'Perdido',
  [UNIFIED_LEAD_STATUS.INATIVO]: 'Inativo'
};

// 👤 STATUS DE CLIENTE UNIFICADOS
// ===============================
export const UNIFIED_CLIENT_STATUS = {
  ATIVO: 'ativo',
  POTENCIAL: 'potencial',
  NEGOCIACAO: 'negociacao',
  FECHADO: 'fechado',
  INATIVO: 'inativo'
};

export const UNIFIED_CLIENT_STATUS_LABELS = {
  [UNIFIED_CLIENT_STATUS.ATIVO]: 'Cliente Ativo',
  [UNIFIED_CLIENT_STATUS.POTENCIAL]: 'Cliente Potencial',
  [UNIFIED_CLIENT_STATUS.NEGOCIACAO]: 'Em Negociação',
  [UNIFIED_CLIENT_STATUS.FECHADO]: 'Negócio Fechado',
  [UNIFIED_CLIENT_STATUS.INATIVO]: 'Cliente Inativo'
};

// 🎯 STATUS DE OPORTUNIDADE UNIFICADOS (Pipeline)
// ===============================================
export const UNIFIED_OPPORTUNITY_STATUS = {
  IDENTIFICACAO: 'identificacao',
  QUALIFICACAO: 'qualificacao',
  APRESENTACAO: 'apresentacao',
  NEGOCIACAO: 'negociacao',
  PROPOSTA: 'proposta',
  CONTRATO: 'contrato',
  FECHADO_GANHO: 'fechado_ganho',
  FECHADO_PERDIDO: 'fechado_perdido',
  PAUSADO: 'pausado'
};

export const UNIFIED_OPPORTUNITY_STATUS_LABELS = {
  [UNIFIED_OPPORTUNITY_STATUS.IDENTIFICACAO]: 'Identificação',
  [UNIFIED_OPPORTUNITY_STATUS.QUALIFICACAO]: 'Qualificação',
  [UNIFIED_OPPORTUNITY_STATUS.APRESENTACAO]: 'Apresentação',
  [UNIFIED_OPPORTUNITY_STATUS.NEGOCIACAO]: 'Negociação',
  [UNIFIED_OPPORTUNITY_STATUS.PROPOSTA]: 'Proposta',
  [UNIFIED_OPPORTUNITY_STATUS.CONTRATO]: 'Contrato',
  [UNIFIED_OPPORTUNITY_STATUS.FECHADO_GANHO]: 'Fechado (Ganho)',
  [UNIFIED_OPPORTUNITY_STATUS.FECHADO_PERDIDO]: 'Fechado (Perdido)',
  [UNIFIED_OPPORTUNITY_STATUS.PAUSADO]: 'Pausado'
};

// 📊 PROBABILIDADES DE FECHAMENTO POR STATUS
export const UNIFIED_OPPORTUNITY_PROBABILITIES = {
  [UNIFIED_OPPORTUNITY_STATUS.IDENTIFICACAO]: 10,
  [UNIFIED_OPPORTUNITY_STATUS.QUALIFICACAO]: 25,
  [UNIFIED_OPPORTUNITY_STATUS.APRESENTACAO]: 40,
  [UNIFIED_OPPORTUNITY_STATUS.NEGOCIACAO]: 60,
  [UNIFIED_OPPORTUNITY_STATUS.PROPOSTA]: 80,
  [UNIFIED_OPPORTUNITY_STATUS.CONTRATO]: 95,
  [UNIFIED_OPPORTUNITY_STATUS.FECHADO_GANHO]: 100,
  [UNIFIED_OPPORTUNITY_STATUS.FECHADO_PERDIDO]: 0,
  [UNIFIED_OPPORTUNITY_STATUS.PAUSADO]: 0
};

// 💼 STATUS DE NEGÓCIO UNIFICADOS
// ===============================
export const UNIFIED_DEAL_STATUS = {
  EM_NEGOCIACAO: 'em_negociacao',
  PROPOSTA_ENVIADA: 'proposta_enviada',
  PROPOSTA_ACEITE: 'proposta_aceite',
  CPCV_ASSINADO: 'cpcv_assinado',
  FINANCIAMENTO_APROVADO: 'financiamento_aprovado',
  ESCRITURA_AGENDADA: 'escritura_agendada',
  ESCRITURA_REALIZADA: 'escritura_realizada',
  CANCELADO: 'cancelado',
  SUSPENSO: 'suspenso'
};

export const UNIFIED_DEAL_STATUS_LABELS = {
  [UNIFIED_DEAL_STATUS.EM_NEGOCIACAO]: 'Em Negociação',
  [UNIFIED_DEAL_STATUS.PROPOSTA_ENVIADA]: 'Proposta Enviada',
  [UNIFIED_DEAL_STATUS.PROPOSTA_ACEITE]: 'Proposta Aceite',
  [UNIFIED_DEAL_STATUS.CPCV_ASSINADO]: 'CPCV Assinado',
  [UNIFIED_DEAL_STATUS.FINANCIAMENTO_APROVADO]: 'Financiamento Aprovado',
  [UNIFIED_DEAL_STATUS.ESCRITURA_AGENDADA]: 'Escritura Agendada',
  [UNIFIED_DEAL_STATUS.ESCRITURA_REALIZADA]: 'Escritura Realizada',
  [UNIFIED_DEAL_STATUS.CANCELADO]: 'Cancelado',
  [UNIFIED_DEAL_STATUS.SUSPENSO]: 'Suspenso'
};

// ✅ STATUS DE TAREFA UNIFICADOS
// ==============================
export const UNIFIED_TASK_STATUS = {
  PENDENTE: 'pendente',
  EM_PROGRESSO: 'em_progresso',
  CONCLUIDA: 'concluida',
  CANCELADA: 'cancelada',
  ATRASADA: 'atrasada'
};

export const UNIFIED_TASK_STATUS_LABELS = {
  [UNIFIED_TASK_STATUS.PENDENTE]: 'Pendente',
  [UNIFIED_TASK_STATUS.EM_PROGRESSO]: 'Em Progresso',
  [UNIFIED_TASK_STATUS.CONCLUIDA]: 'Concluída',
  [UNIFIED_TASK_STATUS.CANCELADA]: 'Cancelada',
  [UNIFIED_TASK_STATUS.ATRASADA]: 'Atrasada'
};

// 📅 STATUS DE VISITA UNIFICADOS
// ==============================
export const UNIFIED_VISIT_STATUS = {
  AGENDADA: 'agendada',
  CONFIRMADA_CLIENTE: 'confirmada_cliente',
  CONFIRMADA_CONSULTOR: 'confirmada_consultor',
  CONFIRMADA_DUPLA: 'confirmada_dupla',
  EM_CURSO: 'em_curso',
  REALIZADA: 'realizada',
  NAO_COMPARECEU_CLIENTE: 'nao_compareceu_cliente',
  NAO_COMPARECEU_CONSULTOR: 'nao_compareceu_consultor',
  CANCELADA: 'cancelada',
  REMARCADA: 'remarcada'
};

export const UNIFIED_VISIT_STATUS_LABELS = {
  [UNIFIED_VISIT_STATUS.AGENDADA]: 'Agendada',
  [UNIFIED_VISIT_STATUS.CONFIRMADA_CLIENTE]: 'Confirmada pelo Cliente',
  [UNIFIED_VISIT_STATUS.CONFIRMADA_CONSULTOR]: 'Confirmada pelo Consultor',
  [UNIFIED_VISIT_STATUS.CONFIRMADA_DUPLA]: 'Confirmada (Ambos)',
  [UNIFIED_VISIT_STATUS.EM_CURSO]: 'Em Curso',
  [UNIFIED_VISIT_STATUS.REALIZADA]: 'Realizada',
  [UNIFIED_VISIT_STATUS.NAO_COMPARECEU_CLIENTE]: 'Cliente Não Compareceu',
  [UNIFIED_VISIT_STATUS.NAO_COMPARECEU_CONSULTOR]: 'Consultor Não Compareceu',
  [UNIFIED_VISIT_STATUS.CANCELADA]: 'Cancelada',
  [UNIFIED_VISIT_STATUS.REMARCADA]: 'Remarcada'
};

// 🏢 TIPOS DE IMÓVEL UNIFICADOS
// =============================
export const UNIFIED_PROPERTY_TYPES = {
  APARTAMENTO: 'apartamento',
  MORADIA: 'moradia',
  TERRENO: 'terreno',
  COMERCIAL: 'comercial',
  QUINTA_HERDADE: 'quinta_herdade',
  ESCRITORIO: 'escritorio',
  ARMAZEM: 'armazem',
  GARAGEM: 'garagem'
};

export const UNIFIED_PROPERTY_TYPE_LABELS = {
  [UNIFIED_PROPERTY_TYPES.APARTAMENTO]: 'Apartamento',
  [UNIFIED_PROPERTY_TYPES.MORADIA]: 'Moradia',
  [UNIFIED_PROPERTY_TYPES.TERRENO]: 'Terreno',
  [UNIFIED_PROPERTY_TYPES.COMERCIAL]: 'Comercial',
  [UNIFIED_PROPERTY_TYPES.QUINTA_HERDADE]: 'Quinta/Herdade',
  [UNIFIED_PROPERTY_TYPES.ESCRITORIO]: 'Escritório',
  [UNIFIED_PROPERTY_TYPES.ARMAZEM]: 'Armazém',
  [UNIFIED_PROPERTY_TYPES.GARAGEM]: 'Garagem'
};

// 🎯 FONTES DE LEAD UNIFICADAS
// ============================
export const UNIFIED_LEAD_SOURCES = {
  WEBSITE: 'website',
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  GOOGLE_ADS: 'google_ads',
  REFERENCIA: 'referencia',
  TELEFONE: 'telefone',
  EMAIL: 'email',
  WHATSAPP: 'whatsapp',
  PORTAL_IMOBILIARIO: 'portal_imobiliario',
  EVENTO: 'evento',
  OUTDOOR: 'outdoor',
  RADIO: 'radio',
  JORNAL: 'jornal',
  OUTROS: 'outros'
};

export const UNIFIED_LEAD_SOURCE_LABELS = {
  [UNIFIED_LEAD_SOURCES.WEBSITE]: 'Website',
  [UNIFIED_LEAD_SOURCES.FACEBOOK]: 'Facebook',
  [UNIFIED_LEAD_SOURCES.INSTAGRAM]: 'Instagram',
  [UNIFIED_LEAD_SOURCES.GOOGLE_ADS]: 'Google Ads',
  [UNIFIED_LEAD_SOURCES.REFERENCIA]: 'Referência',
  [UNIFIED_LEAD_SOURCES.TELEFONE]: 'Telefone',
  [UNIFIED_LEAD_SOURCES.EMAIL]: 'Email',
  [UNIFIED_LEAD_SOURCES.WHATSAPP]: 'WhatsApp',
  [UNIFIED_LEAD_SOURCES.PORTAL_IMOBILIARIO]: 'Portal Imobiliário',
  [UNIFIED_LEAD_SOURCES.EVENTO]: 'Evento',
  [UNIFIED_LEAD_SOURCES.OUTDOOR]: 'Outdoor',
  [UNIFIED_LEAD_SOURCES.RADIO]: 'Rádio',
  [UNIFIED_LEAD_SOURCES.JORNAL]: 'Jornal',
  [UNIFIED_LEAD_SOURCES.OUTROS]: 'Outros'
};

// ⏰ HORÁRIOS PREFERENCIAIS DE CONTACTO
// =====================================
export const UNIFIED_CONTACT_TIMES = {
  MANHA: 'manha',
  TARDE: 'tarde',
  NOITE: 'noite',
  QUALQUER_HORA: 'qualquer_hora',
  HORARIO_COMERCIAL: 'horario_comercial',
  FINS_SEMANA: 'fins_semana'
};

export const UNIFIED_CONTACT_TIME_LABELS = {
  [UNIFIED_CONTACT_TIMES.MANHA]: 'Manhã (9h-12h)',
  [UNIFIED_CONTACT_TIMES.TARDE]: 'Tarde (14h-18h)',
  [UNIFIED_CONTACT_TIMES.NOITE]: 'Noite (19h-21h)',
  [UNIFIED_CONTACT_TIMES.QUALQUER_HORA]: 'Qualquer Hora',
  [UNIFIED_CONTACT_TIMES.HORARIO_COMERCIAL]: 'Horário Comercial',
  [UNIFIED_CONTACT_TIMES.FINS_SEMANA]: 'Fins de Semana'
};

// 🎨 CORES PADRONIZADAS PARA STATUS (Tailwind CSS)
// ================================================
export const UNIFIED_STATUS_COLORS = {
  // Cores para Lead Status
  [UNIFIED_LEAD_STATUS.NOVO]: 'bg-blue-100 text-blue-800 border-blue-200',
  [UNIFIED_LEAD_STATUS.CONTACTADO]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [UNIFIED_LEAD_STATUS.QUALIFICADO]: 'bg-green-100 text-green-800 border-green-200',
  [UNIFIED_LEAD_STATUS.CONVERTIDO]: 'bg-purple-100 text-purple-800 border-purple-200',
  [UNIFIED_LEAD_STATUS.PERDIDO]: 'bg-red-100 text-red-800 border-red-200',
  [UNIFIED_LEAD_STATUS.INATIVO]: 'bg-gray-100 text-gray-800 border-gray-200',
  
  // Cores para Client Status
  [UNIFIED_CLIENT_STATUS.ATIVO]: 'bg-green-100 text-green-800 border-green-200',
  [UNIFIED_CLIENT_STATUS.POTENCIAL]: 'bg-blue-100 text-blue-800 border-blue-200',
  [UNIFIED_CLIENT_STATUS.NEGOCIACAO]: 'bg-orange-100 text-orange-800 border-orange-200',
  [UNIFIED_CLIENT_STATUS.FECHADO]: 'bg-purple-100 text-purple-800 border-purple-200',
  [UNIFIED_CLIENT_STATUS.INATIVO]: 'bg-gray-100 text-gray-800 border-gray-200',
  
  // Cores para Opportunity Status
  [UNIFIED_OPPORTUNITY_STATUS.IDENTIFICACAO]: 'bg-gray-100 text-gray-800 border-gray-200',
  [UNIFIED_OPPORTUNITY_STATUS.QUALIFICACAO]: 'bg-blue-100 text-blue-800 border-blue-200',
  [UNIFIED_OPPORTUNITY_STATUS.APRESENTACAO]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [UNIFIED_OPPORTUNITY_STATUS.NEGOCIACAO]: 'bg-orange-100 text-orange-800 border-orange-200',
  [UNIFIED_OPPORTUNITY_STATUS.PROPOSTA]: 'bg-purple-100 text-purple-800 border-purple-200',
  [UNIFIED_OPPORTUNITY_STATUS.CONTRATO]: 'bg-green-100 text-green-800 border-green-200',
  [UNIFIED_OPPORTUNITY_STATUS.FECHADO_GANHO]: 'bg-green-200 text-green-900 border-green-300',
  [UNIFIED_OPPORTUNITY_STATUS.FECHADO_PERDIDO]: 'bg-red-100 text-red-800 border-red-200',
  [UNIFIED_OPPORTUNITY_STATUS.PAUSADO]: 'bg-gray-200 text-gray-700 border-gray-300'
};

// 🔧 FUNÇÕES AUXILIARES PARA OBTER RÓTULOS
// ========================================

/**
 * Obter rótulo legível para tipo de interesse
 */
export const getInterestTypeLabel = (type) => {
  return UNIFIED_INTEREST_LABELS[type] || type;
};

/**
 * Obter rótulo legível para faixa de orçamento
 */
export const getBudgetRangeLabel = (range) => {
  return UNIFIED_BUDGET_RANGES[range] || range;
};

/**
 * Obter cor para status (qualquer tipo)
 */
export const getStatusColor = (status) => {
  return UNIFIED_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Obter probabilidade para status de oportunidade
 */
export const getOpportunityProbability = (status) => {
  return UNIFIED_OPPORTUNITY_PROBABILITIES[status] || 0;
};

/**
 * Converter valor monetário para formato português
 */
export const formatCurrency = (value) => {
  if (!value) return '€0';
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Obter todas as opções para um select
 */
export const getSelectOptions = (constantObject, labelObject) => {
  return Object.entries(constantObject).map(([key, value]) => ({
    value: value,
    label: labelObject[value] || value,
    key: key
  }));
};

// 📊 CONFIGURAÇÕES DE RELATÓRIOS
// ==============================
export const UNIFIED_REPORT_PERIODS = {
  HOJE: 'hoje',
  ESTA_SEMANA: 'esta_semana',
  ESTE_MES: 'este_mes',
  ULTIMO_MES: 'ultimo_mes',
  ULTIMOS_3_MESES: 'ultimos_3_meses',
  ESTE_ANO: 'este_ano',
  ULTIMO_ANO: 'ultimo_ano',
  PERSONALIZADO: 'personalizado'
};

export const UNIFIED_REPORT_PERIOD_LABELS = {
  [UNIFIED_REPORT_PERIODS.HOJE]: 'Hoje',
  [UNIFIED_REPORT_PERIODS.ESTA_SEMANA]: 'Esta Semana',
  [UNIFIED_REPORT_PERIODS.ESTE_MES]: 'Este Mês',
  [UNIFIED_REPORT_PERIODS.ULTIMO_MES]: 'Último Mês',
  [UNIFIED_REPORT_PERIODS.ULTIMOS_3_MESES]: 'Últimos 3 Meses',
  [UNIFIED_REPORT_PERIODS.ESTE_ANO]: 'Este Ano',
  [UNIFIED_REPORT_PERIODS.ULTIMO_ANO]: 'Último Ano',
  [UNIFIED_REPORT_PERIODS.PERSONALIZADO]: 'Período Personalizado'
};

// 🚀 EXPORTAÇÃO FINAL
// ===================
export default {
  UNIFIED_INTEREST_TYPES,
  UNIFIED_INTEREST_LABELS,
  UNIFIED_BUDGET_RANGES,
  UNIFIED_PRIORITIES,
  UNIFIED_PRIORITY_LABELS,
  UNIFIED_PRIORITY_COLORS,
  UNIFIED_LEAD_STATUS,
  UNIFIED_LEAD_STATUS_LABELS,
  UNIFIED_CLIENT_STATUS,
  UNIFIED_CLIENT_STATUS_LABELS,
  UNIFIED_OPPORTUNITY_STATUS,
  UNIFIED_OPPORTUNITY_STATUS_LABELS,
  UNIFIED_OPPORTUNITY_PROBABILITIES,
  UNIFIED_DEAL_STATUS,
  UNIFIED_DEAL_STATUS_LABELS,
  UNIFIED_TASK_STATUS,
  UNIFIED_TASK_STATUS_LABELS,
  UNIFIED_VISIT_STATUS,
  UNIFIED_VISIT_STATUS_LABELS,
  UNIFIED_PROPERTY_TYPES,
  UNIFIED_PROPERTY_TYPE_LABELS,
  UNIFIED_LEAD_SOURCES,
  UNIFIED_LEAD_SOURCE_LABELS,
  UNIFIED_CONTACT_TIMES,
  UNIFIED_CONTACT_TIME_LABELS,
  UNIFIED_STATUS_COLORS,
  UNIFIED_REPORT_PERIODS,
  UNIFIED_REPORT_PERIOD_LABELS,
  
  // Funções auxiliares
  getInterestTypeLabel,
  getBudgetRangeLabel,
  getStatusColor,
  getOpportunityProbability,
  formatCurrency,
  getSelectOptions
};