/**
 * 🔗 SUBCOLLECTIONS CONSTANTS - COMPATIBILIDADE COM HOOKS EXISTENTES
 * ================================================================
 * 
 * Este ficheiro garante compatibilidade total com todos os hooks
 * que estavam a importar SUBCOLLECTIONS do FirebaseService.js
 */

// CONSTANTES DE SUBCOLEÇÕES MULTI-TENANT
export const SUBCOLLECTIONS = {
  LEADS: 'leads',
  CLIENTS: 'clients', 
  VISITS: 'visits',
  OPPORTUNITIES: 'opportunities',
  DEALS: 'deals',
  TASKS: 'tasks',
  REPORTS: 'reports',
  ANALYTICS: 'analytics',
  AUTOMATIONS: 'automations',
  INTEGRATIONS: 'integrations',
  CALENDAR_EVENTS: 'calendar_events',
  ACTIVITY_LOGS: 'activity_logs',
  NOTIFICATIONS: 'notifications'
};

// LISTA DE VALIDAÇÃO
export const VALID_SUBCOLLECTIONS = [
  'leads', 'clients', 'visits', 'opportunities', 'deals', 
  'tasks', 'reports', 'analytics', 'automations', 'integrations',
  'calendar_events', 'activity_logs', 'notifications'
];

// MAPEAMENTO PARA LABELS DISPLAY
export const SUBCOLLECTION_LABELS = {
  [SUBCOLLECTIONS.LEADS]: 'Leads',
  [SUBCOLLECTIONS.CLIENTS]: 'Clientes',
  [SUBCOLLECTIONS.VISITS]: 'Visitas',
  [SUBCOLLECTIONS.OPPORTUNITIES]: 'Oportunidades',
  [SUBCOLLECTIONS.DEALS]: 'Negócios',
  [SUBCOLLECTIONS.TASKS]: 'Tarefas',
  [SUBCOLLECTIONS.REPORTS]: 'Relatórios',
  [SUBCOLLECTIONS.ANALYTICS]: 'Analytics',
  [SUBCOLLECTIONS.AUTOMATIONS]: 'Automações',
  [SUBCOLLECTIONS.INTEGRATIONS]: 'Integrações',
  [SUBCOLLECTIONS.CALENDAR_EVENTS]: 'Eventos',
  [SUBCOLLECTIONS.ACTIVITY_LOGS]: 'Logs de Atividade',
  [SUBCOLLECTIONS.NOTIFICATIONS]: 'Notificações'
};

// HELPER FUNCTIONS
export const isValidSubcollection = (name) => {
  return VALID_SUBCOLLECTIONS.includes(name);
};

export const getSubcollectionLabel = (name) => {
  return SUBCOLLECTION_LABELS[name] || name;
};

// DEFAULT EXPORT
export default SUBCOLLECTIONS;