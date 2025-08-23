// src/utils/ConversionDebug.js
// 🔧 SISTEMA DE DEBUG E LOGS PARA CONVERSÃO
// ==========================================
// MyImoMate 3.0 - Sistema avançado de debug e monitorização
// ✅ Logs detalhados de todo o processo de conversão
// ✅ Captura de erros com stack trace
// ✅ Monitorização de performance
// ✅ Debug visual no modal
// ✅ Relatórios de diagnóstico
// ✅ Sistema de alertas para problemas

// ✅ TIPOS DE LOG
const LOG_TYPES = {
  DEBUG: 'debug',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical',
  PERFORMANCE: 'performance',
  USER_ACTION: 'user_action',
  SYSTEM: 'system',
  VALIDATION: 'validation',
  CONVERSION: 'conversion'
};

// ✅ NÍVEIS DE DEBUG
const DEBUG_LEVELS = {
  NONE: 0,        // Sem debug
  BASIC: 1,       // Logs básicos
  DETAILED: 2,    // Logs detalhados
  VERBOSE: 3,     // Todos os logs
  DIAGNOSTIC: 4   // Modo diagnóstico completo
};

// ✅ CONFIGURAÇÃO DE DEBUG
const DEBUG_CONFIG = {
  ENABLED: true,
  LEVEL: DEBUG_LEVELS.DETAILED,
  MAX_LOGS: 500,
  CONSOLE_OUTPUT: true,
  VISUAL_DISPLAY: true,
  PERFORMANCE_TRACKING: true,
  ERROR_REPORTING: true,
  EXPORT_LOGS: true
};

// ✅ CLASSE PRINCIPAL DE DEBUG
export class ConversionDebugger {
  constructor(config = {}) {
    this.config = { ...DEBUG_CONFIG, ...config };
    this.logs = [];
    this.errors = [];
    this.performanceMetrics = {};
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.isActive = this.config.ENABLED;
    this.timers = new Map();
    
    this.initializeDebugger();
  }

  // 🚀 INICIALIZAR DEBUGGER
  initializeDebugger() {
    if (!this.isActive) return;

    this.log('system', '🔧 Debugger de conversão iniciado', {
      sessionId: this.sessionId,
      level: this.config.LEVEL,
      config: this.config
    });

    // Interceptar erros globais
    if (this.config.ERROR_REPORTING) {
      this.setupErrorInterception();
    }

    // Configurar métricas de performance
    if (this.config.PERFORMANCE_TRACKING) {
      this.setupPerformanceTracking();
    }
  }

  // 📝 FUNÇÃO PRINCIPAL DE LOG
  log(type, message, data = null, level = DEBUG_LEVELS.BASIC) {
    if (!this.isActive || level > this.config.LEVEL) return;

    const logEntry = this.createLogEntry(type, message, data, level);
    this.logs.push(logEntry);

    // Limitar número de logs
    if (this.logs.length > this.config.MAX_LOGS) {
      this.logs = this.logs.slice(-this.config.MAX_LOGS);
    }

    // Output para console se habilitado
    if (this.config.CONSOLE_OUTPUT) {
      this.outputToConsole(logEntry);
    }

    return logEntry;
  }

  // 📋 CRIAR ENTRADA DE LOG
  createLogEntry(type, message, data, level) {
    const timestamp = Date.now();
    const timeFromStart = timestamp - this.startTime;
    
    return {
      id: this.generateLogId(),
      sessionId: this.sessionId,
      timestamp,
      timeFromStart,
      datetime: new Date(timestamp).toISOString(),
      localTime: new Date(timestamp).toLocaleString('pt-PT'),
      type,
      level,
      message,
      data: this.sanitizeData(data),
      stackTrace: level >= DEBUG_LEVELS.VERBOSE ? this.getStackTrace() : null,
      memoryUsage: this.getMemoryUsage(),
      url: window.location.href,
      userAgent: navigator.userAgent.substring(0, 100)
    };
  }

  // 🏷️ LOGS ESPECÍFICOS PARA CONVERSÃO
  
  logModalOpen(leadData) {
    return this.log('conversion', '🔄 Modal de conversão aberto', {
      leadId: leadData?.id,
      leadName: leadData?.name,
      leadEmail: leadData?.email,
      leadSource: leadData?.source
    }, DEBUG_LEVELS.BASIC);
  }

  logModalClose(reason = 'user_action') {
    return this.log('conversion', '❌ Modal de conversão fechado', {
      reason,
      sessionDuration: Date.now() - this.startTime
    }, DEBUG_LEVELS.BASIC);
  }

  logValidationStart(formData) {
    const startTimer = this.startPerformanceTimer('validation');
    
    return this.log('validation', '🔍 Validação iniciada', {
      formDataKeys: Object.keys(formData || {}),
      formDataSize: JSON.stringify(formData || {}).length,
      timer: startTimer.id
    }, DEBUG_LEVELS.BASIC);
  }

  logValidationResult(validationResult) {
    this.stopPerformanceTimer('validation');
    
    return this.log('validation', '📊 Resultado da validação', {
      isValid: validationResult.isValid,
      errorsCount: validationResult.errors?.length || 0,
      warningsCount: validationResult.warnings?.length || 0,
      qualityScore: validationResult.qualityScore,
      validationDuration: this.getTimerDuration('validation')
    }, DEBUG_LEVELS.BASIC);
  }

  logConversionStart(conversionData) {
    const startTimer = this.startPerformanceTimer('conversion');
    
    return this.log('conversion', '🚀 Conversão iniciada', {
      leadId: conversionData.leadId,
      createSpouse: conversionData.createSpouse,
      createOpportunity: conversionData.createOpportunity,
      timer: startTimer.id
    }, DEBUG_LEVELS.BASIC);
  }

  logConversionSuccess(result) {
    this.stopPerformanceTimer('conversion');
    
    return this.log('conversion', '✅ Conversão concluída com sucesso', {
      mainClientId: result.mainClient?.id,
      spouseClientId: result.spouseClient?.id,
      opportunityId: result.opportunity?.id,
      documentsUploaded: result.documentsUploaded,
      conversionDuration: this.getTimerDuration('conversion')
    }, DEBUG_LEVELS.BASIC);
  }

  logConversionError(error, context = {}) {
    this.stopPerformanceTimer('conversion');
    
    const errorEntry = this.log('error', '❌ Erro na conversão', {
      error: error.message,
      stack: error.stack,
      context,
      conversionDuration: this.getTimerDuration('conversion')
    }, DEBUG_LEVELS.BASIC);

    this.errors.push({
      ...errorEntry,
      error,
      context
    });

    return errorEntry;
  }

  logFieldUpdate(fieldPath, value, validationError = null) {
    return this.log('user_action', '📝 Campo atualizado', {
      fieldPath,
      valueType: typeof value,
      hasValidationError: !!validationError,
      validationError: validationError?.message
    }, DEBUG_LEVELS.VERBOSE);
  }

  logTabChange(fromTab, toTab) {
    return this.log('user_action', '📑 Tab alterado', {
      fromTab,
      toTab,
      timestamp: Date.now()
    }, DEBUG_LEVELS.DETAILED);
  }

  logApprovalToggle(approved, validationPassed) {
    return this.log('user_action', '🔐 Aprovação alterada', {
      approved,
      validationPassed,
      canProceed: approved && validationPassed
    }, DEBUG_LEVELS.BASIC);
  }

  // ⏱️ SISTEMA DE PERFORMANCE TIMERS
  
  startPerformanceTimer(name) {
    const timer = {
      id: this.generateLogId(),
      name,
      startTime: Date.now(),
      startMemory: this.getMemoryUsage()
    };
    
    this.timers.set(name, timer);
    
    this.log('performance', `⏱️ Timer iniciado: ${name}`, {
      timerId: timer.id,
      startMemory: timer.startMemory
    }, DEBUG_LEVELS.DETAILED);
    
    return timer;
  }

  stopPerformanceTimer(name) {
    const timer = this.timers.get(name);
    if (!timer) {
      this.log('warning', `⚠️ Timer não encontrado: ${name}`, null, DEBUG_LEVELS.BASIC);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - timer.startTime;
    const endMemory = this.getMemoryUsage();
    const memoryDelta = endMemory - timer.startMemory;

    const result = {
      ...timer,
      endTime,
      duration,
      endMemory,
      memoryDelta
    };

    this.performanceMetrics[name] = result;
    this.timers.delete(name);

    this.log('performance', `🏁 Timer finalizado: ${name}`, {
      duration,
      memoryDelta,
      timerId: timer.id
    }, DEBUG_LEVELS.DETAILED);

    return result;
  }

  getTimerDuration(name) {
    const metric = this.performanceMetrics[name];
    return metric ? metric.duration : null;
  }

  // 🚨 SISTEMA DE INTERCEPTAÇÃO DE ERROS
  
  setupErrorInterception() {
    // Interceptar erros JavaScript
    window.addEventListener('error', (event) => {
      this.log('critical', '🚨 Erro JavaScript interceptado', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      }, DEBUG_LEVELS.BASIC);
    });

    // Interceptar promesas rejeitadas
    window.addEventListener('unhandledrejection', (event) => {
      this.log('critical', '🚨 Promise rejeitada interceptada', {
        reason: event.reason,
        stack: event.reason?.stack
      }, DEBUG_LEVELS.BASIC);
    });
  }

  setupPerformanceTracking() {
    // Observer para mudanças de performance
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.log('performance', '📈 Métrica de performance', {
              name: entry.name,
              type: entry.entryType,
              duration: entry.duration,
              startTime: entry.startTime
            }, DEBUG_LEVELS.VERBOSE);
          }
        });
        
        observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
      } catch (error) {
        this.log('warning', '⚠️ PerformanceObserver não suportado', { error: error.message });
      }
    }
  }

  // 🛠️ FUNÇÕES UTILITÁRIAS
  
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  sanitizeData(data) {
    if (!data) return null;
    
    try {
      // Remover dados sensíveis
      const sanitized = JSON.parse(JSON.stringify(data));
      
      // Lista de campos sensíveis a sanitizar
      const sensitiveFields = ['numeroCC', 'numeroFiscal', 'password', 'token', 'email'];
      
      const sanitizeObject = (obj) => {
        if (typeof obj !== 'object' || obj === null) return obj;
        
        for (const key in obj) {
          if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
            obj[key] = this.maskSensitiveData(obj[key]);
          } else if (typeof obj[key] === 'object') {
            sanitizeObject(obj[key]);
          }
        }
        return obj;
      };
      
      return sanitizeObject(sanitized);
    } catch (error) {
      return { error: 'Erro na sanitização dos dados', original: String(data) };
    }
  }

  maskSensitiveData(value) {
    if (!value) return value;
    const str = String(value);
    if (str.length <= 4) return '***';
    return str.substring(0, 2) + '*'.repeat(str.length - 4) + str.substring(str.length - 2);
  }

  getStackTrace() {
    try {
      throw new Error();
    } catch (error) {
      return error.stack?.split('\n').slice(2, 8) || null; // Limitar a 6 linhas
    }
  }

  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  }

  outputToConsole(logEntry) {
    const emoji = this.getLogEmoji(logEntry.type, logEntry.level);
    const timestamp = logEntry.localTime.split(' ')[1]; // Apenas a hora
    
    const style = this.getConsoleStyle(logEntry.type, logEntry.level);
    
    if (logEntry.data) {
      console.groupCollapsed(`${emoji} [${timestamp}] ${logEntry.message}`);
      console.log('%cTipo:', 'font-weight: bold;', logEntry.type);
      console.log('%cDados:', 'font-weight: bold;', logEntry.data);
      if (logEntry.stackTrace) {
        console.log('%cStack:', 'font-weight: bold;', logEntry.stackTrace);
      }
      console.groupEnd();
    } else {
      console.log(`${emoji} [${timestamp}] ${logEntry.message}`);
    }
  }

  getLogEmoji(type, level) {
    const emojiMap = {
      [LOG_TYPES.DEBUG]: '🔍',
      [LOG_TYPES.INFO]: 'ℹ️',
      [LOG_TYPES.WARNING]: '⚠️',
      [LOG_TYPES.ERROR]: '❌',
      [LOG_TYPES.CRITICAL]: '🚨',
      [LOG_TYPES.PERFORMANCE]: '⏱️',
      [LOG_TYPES.USER_ACTION]: '👤',
      [LOG_TYPES.SYSTEM]: '🔧',
      [LOG_TYPES.VALIDATION]: '✅',
      [LOG_TYPES.CONVERSION]: '🔄'
    };
    
    return emojiMap[type] || '📝';
  }

  getConsoleStyle(type, level) {
    const styleMap = {
      [LOG_TYPES.DEBUG]: 'color: #6B7280;',
      [LOG_TYPES.INFO]: 'color: #3B82F6;',
      [LOG_TYPES.WARNING]: 'color: #F59E0B; font-weight: bold;',
      [LOG_TYPES.ERROR]: 'color: #EF4444; font-weight: bold;',
      [LOG_TYPES.CRITICAL]: 'color: #DC2626; font-weight: bold; background: #FEE2E2;',
      [LOG_TYPES.PERFORMANCE]: 'color: #10B981;',
      [LOG_TYPES.USER_ACTION]: 'color: #8B5CF6;',
      [LOG_TYPES.SYSTEM]: 'color: #059669;',
      [LOG_TYPES.VALIDATION]: 'color: #059669;',
      [LOG_TYPES.CONVERSION]: 'color: #3B82F6; font-weight: bold;'
    };
    
    return styleMap[type] || '';
  }

  // 📊 RELATÓRIOS E ESTATÍSTICAS
  
  generateSessionReport() {
    const sessionDuration = Date.now() - this.startTime;
    const errorCount = this.errors.length;
    const logsByType = this.logs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {});

    return {
      sessionId: this.sessionId,
      duration: sessionDuration,
      startTime: this.startTime,
      endTime: Date.now(),
      totalLogs: this.logs.length,
      errorCount,
      logsByType,
      performanceMetrics: this.performanceMetrics,
      memoryUsage: this.getMemoryUsage(),
      config: this.config
    };
  }

  generateValidationReport() {
    const validationLogs = this.logs.filter(log => log.type === 'validation');
    
    return {
      totalValidations: validationLogs.length,
      validationResults: validationLogs.map(log => ({
        timestamp: log.timestamp,
        result: log.data
      })),
      averageValidationTime: this.performanceMetrics.validation?.duration || null
    };
  }

  generateConversionReport() {
    const conversionLogs = this.logs.filter(log => log.type === 'conversion');
    
    return {
      totalConversions: conversionLogs.length,
      conversionAttempts: conversionLogs.filter(log => log.message.includes('iniciada')).length,
      successfulConversions: conversionLogs.filter(log => log.message.includes('sucesso')).length,
      failedConversions: conversionLogs.filter(log => log.message.includes('erro')).length,
      averageConversionTime: this.performanceMetrics.conversion?.duration || null
    };
  }

  // 📤 EXPORTAÇÃO DE LOGS
  
  exportLogs(format = 'json') {
    const report = this.generateSessionReport();
    const exportData = {
      report,
      logs: this.logs,
      errors: this.errors,
      exportedAt: new Date().toISOString()
    };

    switch (format) {
      case 'json':
        return this.exportAsJSON(exportData);
      case 'csv':
        return this.exportAsCSV(exportData);
      case 'txt':
        return this.exportAsText(exportData);
      default:
        return this.exportAsJSON(exportData);
    }
  }

  exportAsJSON(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const filename = `conversion-debug-${this.sessionId}-${Date.now()}.json`;
    
    this.downloadFile(url, filename);
    return { success: true, filename, format: 'json' };
  }

  exportAsCSV(data) {
    const headers = ['Timestamp', 'Tipo', 'Nível', 'Mensagem', 'Dados'];
    const rows = data.logs.map(log => [
      log.localTime,
      log.type,
      log.level,
      log.message,
      log.data ? JSON.stringify(log.data) : ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const filename = `conversion-debug-${this.sessionId}-${Date.now()}.csv`;
    
    this.downloadFile(url, filename);
    return { success: true, filename, format: 'csv' };
  }

  exportAsText(data) {
    const content = data.logs
      .map(log => `[${log.localTime}] ${log.type.toUpperCase()}: ${log.message}${log.data ? '\n  Dados: ' + JSON.stringify(log.data, null, 2) : ''}`)
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const filename = `conversion-debug-${this.sessionId}-${Date.now()}.txt`;
    
    this.downloadFile(url, filename);
    return { success: true, filename, format: 'txt' };
  }

  downloadFile(url, filename) {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // 🧹 LIMPEZA E GESTÃO
  
  clearLogs() {
    const clearedCount = this.logs.length;
    this.logs = [];
    this.errors = [];
    this.performanceMetrics = {};
    
    this.log('system', '🧹 Logs limpos', { clearedCount }, DEBUG_LEVELS.BASIC);
    return clearedCount;
  }

  setLevel(newLevel) {
    const oldLevel = this.config.LEVEL;
    this.config.LEVEL = newLevel;
    
    this.log('system', '🔧 Nível de debug alterado', {
      oldLevel,
      newLevel
    }, DEBUG_LEVELS.BASIC);
  }

  enable() {
    this.isActive = true;
    this.config.ENABLED = true;
    this.log('system', '✅ Debug ativado', null, DEBUG_LEVELS.BASIC);
  }

  disable() {
    this.log('system', '❌ Debug desativado', null, DEBUG_LEVELS.BASIC);
    this.isActive = false;
    this.config.ENABLED = false;
  }

  // 📱 INTERFACE PARA REACT COMPONENTS
  
  getDebugInfo() {
    return {
      isActive: this.isActive,
      level: this.config.LEVEL,
      sessionId: this.sessionId,
      logsCount: this.logs.length,
      errorsCount: this.errors.length,
      sessionDuration: Date.now() - this.startTime,
      memoryUsage: this.getMemoryUsage()
    };
  }

  getRecentLogs(count = 10) {
    return this.logs.slice(-count);
  }

  getLogsByType(type) {
    return this.logs.filter(log => log.type === type);
  }

  getErrors() {
    return this.errors;
  }

  searchLogs(query) {
    const lowerQuery = query.toLowerCase();
    return this.logs.filter(log => 
      log.message.toLowerCase().includes(lowerQuery) ||
      log.type.toLowerCase().includes(lowerQuery) ||
      (log.data && JSON.stringify(log.data).toLowerCase().includes(lowerQuery))
    );
  }
}

// ✅ INSTÂNCIA GLOBAL DO DEBUGGER
let globalDebugger = null;

// ✅ FUNÇÕES DE CONVENIÊNCIA PARA USO EM COMPONENTES
export const initializeDebugger = (config = {}) => {
  globalDebugger = new ConversionDebugger(config);
  return globalDebugger;
};

export const getDebugger = () => {
  if (!globalDebugger) {
    globalDebugger = new ConversionDebugger();
  }
  return globalDebugger;
};

export const debugLog = (type, message, data = null, level = DEBUG_LEVELS.BASIC) => {
  const debuggerInstance = getDebugger();
  return debuggerInstance.log(type, message, data, level);
};

export const debugError = (error, context = {}) => {
  const debuggerInstance = getDebugger();
  return debuggerInstance.logConversionError(error, context);
};

export const debugPerformance = (name, fn) => {
  const debuggerInstance = getDebugger();
  debuggerInstance.startPerformanceTimer(name);
  
  try {
    const result = fn();
    debuggerInstance.stopPerformanceTimer(name);
    return result;
  } catch (error) {
    debuggerInstance.stopPerformanceTimer(name);
    debuggerInstance.logConversionError(error, { performanceTest: name });
    throw error;
  }
};

// ✅ HOOK PARA REACT (se necessário)
export const useConversionDebugger = () => {
  const debuggerInstance = getDebugger();
  
  return {
    log: debuggerInstance.log.bind(debuggerInstance),
    logModalOpen: debuggerInstance.logModalOpen.bind(debuggerInstance),
    logModalClose: debuggerInstance.logModalClose.bind(debuggerInstance),
    logValidationStart: debuggerInstance.logValidationStart.bind(debuggerInstance),
    logValidationResult: debuggerInstance.logValidationResult.bind(debuggerInstance),
    logConversionStart: debuggerInstance.logConversionStart.bind(debuggerInstance),
    logConversionSuccess: debuggerInstance.logConversionSuccess.bind(debuggerInstance),
    logConversionError: debuggerInstance.logConversionError.bind(debuggerInstance),
    logFieldUpdate: debuggerInstance.logFieldUpdate.bind(debuggerInstance),
    logTabChange: debuggerInstance.logTabChange.bind(debuggerInstance),
    logApprovalToggle: debuggerInstance.logApprovalToggle.bind(debuggerInstance),
    getDebugInfo: debuggerInstance.getDebugInfo.bind(debuggerInstance),
    getRecentLogs: debuggerInstance.getRecentLogs.bind(debuggerInstance),
    exportLogs: debuggerInstance.exportLogs.bind(debuggerInstance),
    clearLogs: debuggerInstance.clearLogs.bind(debuggerInstance)
  };
};

// ✅ EXPORTAÇÕES PRINCIPAIS
export {
  LOG_TYPES,
  DEBUG_LEVELS,
  DEBUG_CONFIG
};

export default ConversionDebugger;