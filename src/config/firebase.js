// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// 🔥 CONFIGURAÇÃO FIREBASE - MyImoMate 3.0
// ============================================

// 🚨 CONFIGURAÇÃO FIREBASE - API KEY ATUALIZADA
// =============================================
// PROBLEMA IDENTIFICADO: API key anterior inválida/desativada
// SOLUÇÃO: Nova API key obtida do Firebase Console

const firebaseConfig = {
  apiKey: "AIzaSyDczFqGCwPPnLcvY5kWn0trshH9BMqVo1A",
  authDomain: "myimomate3-0.firebaseapp.com",
  projectId: "myimomate3-0",
  storageBucket: "myimomate3-0.firebasestorage.app",
  messagingSenderId: "971739318329",
  appId: "1:971739318329:web:704690b62e852a840325e8"
};



// Validação da configuração
const validateConfig = (config) => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Configuração Firebase inválida. Campos em falta: ${missingFields.join(', ')}`);
  }
  
  // Validar formato da API key
  if (!config.apiKey.startsWith('AIza')) {
    console.warn('⚠️ API Key Firebase pode estar incorreta');
  }
  
  // Validar domínio
  if (!config.authDomain.includes('.firebaseapp.com')) {
    console.warn('⚠️ Auth Domain Firebase pode estar incorreto');
  }
  
  return true;
};

// Função para detectar e resolver problemas de API key
const diagnoseApiKeyIssue = () => {
  console.log('🔧 === DIAGNÓSTICO DE API KEY ===');
  console.log('');
  console.log('🚨 PROBLEMA IDENTIFICADO: API key inválida');
  console.log('📍 Erro: auth/api-key-not-valid.-please-pass-a-valid-api-key.');
  console.log('');
  console.log('✅ SOLUÇÕES POSSÍVEIS:');
  console.log('');
  console.log('1. 🔄 OBTER NOVA API KEY:');
  console.log('   • Vá a: https://console.firebase.google.com/project/myimomate3-0');
  console.log('   • Project Settings > General > Your apps');
  console.log('   • Clique na app web (ícone </>) ');
  console.log('   • Copie a nova API key');
  console.log('');
  console.log('2. 🔍 VERIFICAR RESTRIÇÕES:');
  console.log('   • Google Cloud Console > APIs & Services > Credentials');
  console.log('   • Verifique se a API key não tem restrições excessivas');
  console.log('');
  console.log('3. ➕ ADICIONAR DOMÍNIOS AUTORIZADOS:');
  console.log('   • Firebase Console > Authentication > Settings');
  console.log('   • Authorized domains: adicionar localhost, 127.0.0.1');
  console.log('');
  console.log('4. 🔄 REGENERAR SE NECESSÁRIO:');
  console.log('   • Eliminar a API key problemática');
  console.log('   • Gerar nova configuração Firebase');
  console.log('');
  console.log('📝 Após obter nova API key, substitua em src/config/firebase.js');
};

// Função para testar conectividade
const testFirebaseConnectivity = async () => {
  console.log('🧪 Testando conectividade Firebase...');
  
  try {
    // Testar se conseguimos fazer uma operação simples
    if (auth) {
      console.log('✅ Firebase Auth objeto criado');
      console.log('🔑 Auth settings:', {
        apiKey: firebaseConfig.apiKey.substring(0, 10) + '...',
        authDomain: firebaseConfig.authDomain,
        languageCode: auth.languageCode
      });
    } else {
      console.error('❌ Firebase Auth objeto é null');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro no teste de conectividade:', error);
    return false;
  }
};

// Função de inicialização com tratamento específico de erros de API key
const initializeFirebaseApp = () => {
  try {
    // Validar configuração antes de inicializar
    validateConfig(firebaseConfig);
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    
    console.log('🔥 Firebase inicializado com sucesso!');
    console.log('📱 App Name:', app.name);
    console.log('🏗️ Project ID:', firebaseConfig.projectId);
    console.log('🌍 Ambiente:', import.meta.env.PROD ? 'Produção' : 'Desenvolvimento');
    
    return app;
    
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    
    // Verificar se é erro específico de API key
    if (error.message.includes('api-key') || error.code?.includes('api-key')) {
      console.error('🚨 ERRO ESPECÍFICO DE API KEY DETECTADO!');
      diagnoseApiKeyIssue();
    }
    
    console.error('🔧 Configuração utilizada:', {
      ...firebaseConfig,
      apiKey: firebaseConfig.apiKey.substring(0, 10) + '...' // Ocultar API key nos logs
    });
    
    throw error;
  }
};

// Inicializar app com fallback para API key alternativa
let app;
try {
  app = initializeFirebaseApp();
  
  // Testar conectividade após inicialização
  setTimeout(() => {
    testFirebaseConnectivity();
  }, 1000);
  
} catch (error) {
  console.error('💥 Firebase não conseguiu inicializar:', error.message);
  
  // Se for erro de API key, mostrar instruções específicas
  if (error.message.includes('api-key') || error.code?.includes('api-key')) {
    console.log('');
    console.log('🎯 AÇÃO REQUERIDA: Atualizar API key em src/config/firebase.js');
    console.log('📋 Instruções detalhadas mostradas acima ⬆️');
    console.log('');
  }
  
  // Em caso de erro, criar um objeto mock para evitar crashes
  app = {
    name: '[ERROR:API-KEY]',
    options: firebaseConfig,
    error: error.message
  };
}

// 🔥 INICIALIZAR SERVIÇOS FIREBASE
// ================================

// Firestore Database
let db;
try {
  db = getFirestore(app);
  
  // Conectar ao emulador em desenvolvimento (opcional)
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    try {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('🔌 Conectado ao emulador Firestore');
    } catch (emulatorError) {
      console.log('ℹ️ Emulador Firestore não disponível, usando produção');
    }
  }
  
  console.log('🗄️ Firestore inicializado');
} catch (error) {
  console.error('❌ Erro ao inicializar Firestore:', error);
  db = null;
}

// Firebase Authentication
let auth;
try {
  auth = getAuth(app);
  
  // Configurações de Auth
  auth.languageCode = 'pt'; // Português
  auth.useDeviceLanguage(); // Usar idioma do dispositivo
  
  // Conectar ao emulador em desenvolvimento (opcional)
  if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
    try {
      connectAuthEmulator(auth, 'http://localhost:9099');
      console.log('🔌 Conectado ao emulador Auth');
    } catch (emulatorError) {
      console.log('ℹ️ Emulador Auth não disponível, usando produção');
    }
  }
  
  console.log('🔐 Firebase Auth inicializado');
} catch (error) {
  console.error('❌ Erro ao inicializar Auth:', error);
  auth = null;
}

// 🔍 FUNÇÕES DE DIAGNÓSTICO
// =========================

// Verificar conexão com Firebase
export const checkFirebaseConnection = async () => {
  const status = {
    app: !!app && app.name !== '[ERROR]',
    auth: !!auth,
    firestore: !!db,
    timestamp: new Date().toISOString()
  };
  
  console.log('🔍 Status Firebase:', status);
  return status;
};

// Verificar configurações de domínio
export const validateDomainConfig = () => {
  const currentDomain = window.location.origin;
  const authorizedDomains = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://myimomate3-0.firebaseapp.com',
    'https://myimomate3-0.web.app'
  ];
  
  const isAuthorized = authorizedDomains.includes(currentDomain);
  
  if (!isAuthorized) {
    console.warn('⚠️ Domínio atual não está na lista de domínios autorizados do Firebase:');
    console.warn('🌐 Domínio atual:', currentDomain);
    console.warn('✅ Domínios autorizados:', authorizedDomains);
    console.warn('🔧 Adicione este domínio nas configurações do Firebase Console');
  }
  
  return {
    currentDomain,
    isAuthorized,
    authorizedDomains
  };
};

// Diagnóstico completo
export const runFirebaseDiagnostics = async () => {
  console.log('🔍 === DIAGNÓSTICO FIREBASE ===');
  
  try {
    // Verificar conexão
    const connection = await checkFirebaseConnection();
    
    // Verificar domínio
    const domain = validateDomainConfig();
    
    // Verificar configuração
    const config = {
      hasValidConfig: validateConfig(firebaseConfig),
      environment: import.meta.env.PROD ? 'production' : 'development',
      userAgent: navigator.userAgent
    };
    
    const diagnostic = {
      connection,
      domain,
      config,
      timestamp: new Date().toISOString()
    };
    
    console.log('📊 Diagnóstico completo:', diagnostic);
    return diagnostic;
    
  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    return { error: error.message };
  }
};

// 🚨 TRATAMENTO DE ERROS ESPECÍFICOS
// ==================================

// Mapear códigos de erro Firebase para mensagens amigáveis (atualizado)
export const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    // Auth errors - API Key específicos
    'auth/api-key-not-valid': 'API key Firebase inválida. Contacte o administrador para atualizar a configuração.',
    'auth/invalid-api-key': 'API key Firebase inválida. Contacte o administrador para atualizar a configuração.',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'API key Firebase foi desativada ou restringida. É necessário obter uma nova chave.',
    
    // Auth errors - outros
    'auth/user-not-found': 'Utilizador não encontrado. Verifique o email.',
    'auth/wrong-password': 'Password incorreta. Tente novamente.',
    'auth/email-already-in-use': 'Este email já está registado. Tente fazer login.',
    'auth/weak-password': 'Password muito fraca. Use pelo menos 6 caracteres.',
    'auth/invalid-email': 'Email inválido. Verifique o formato.',
    'auth/network-request-failed': 'Erro de rede. Verifique a sua conexão.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/user-disabled': 'Esta conta foi desativada.',
    'auth/requires-recent-login': 'É necessário fazer login novamente.',
    
    // Firestore errors
    'firestore/permission-denied': 'Sem permissão para esta operação.',
    'firestore/unavailable': 'Serviço temporariamente indisponível.',
    'firestore/deadline-exceeded': 'Timeout na operação. Tente novamente.',
    
    // Generic
    'default': 'Ocorreu um erro inesperado. Tente novamente.'
  };
  
  return errorMessages[errorCode] || errorMessages.default;
};

// 📤 EXPORTS PRINCIPAIS
// ====================

// Verificar se os serviços estão disponíveis antes de exportar
if (!app || app.name === '[ERROR]') {
  console.error('💥 Firebase App não está disponível');
}

if (!auth) {
  console.error('💥 Firebase Auth não está disponível');
}

if (!db) {
  console.error('💥 Firebase Firestore não está disponível');
}

// Exports principais
export { auth, db };
export default app;

// 🔧 CONFIGURAÇÕES ADICIONAIS
// ===========================

// Configurações de timeout para operações
export const FIREBASE_CONFIG = {
  timeouts: {
    auth: 30000, // 30 segundos
    firestore: 15000, // 15 segundos
    storage: 60000 // 60 segundos
  },
  retry: {
    maxAttempts: 3,
    delayMs: 1000
  }
};

// Log de inicialização final com verificação de API key
const finalStatus = {
  app: !!app && !app.name?.includes('ERROR'),
  auth: !!auth,
  firestore: !!db,
  projectId: firebaseConfig.projectId,
  environment: import.meta.env.PROD ? 'production' : 'development',
  apiKeyStatus: app?.name?.includes('ERROR') ? '❌ INVÁLIDA' : '✅ VÁLIDA'
};

console.log('✅ Firebase config carregado:', finalStatus);

// Verificação específica para API key inválida
if (app?.name?.includes('ERROR')) {
  console.warn('');
  console.warn('🚨 ATENÇÃO: Firebase não está funcional devido a API key inválida');
  console.warn('🔧 Execute no console: firebaseDebug.fixApiKey() para obter ajuda');
  console.warn('');
}

// 🛠️ FUNÇÕES DE DEBUG GLOBAIS
// ============================
window.firebaseDebug = {
  // Verificar status atual
  status: () => finalStatus,
  
  // Diagnosticar problemas de API key
  fixApiKey: () => {
    diagnoseApiKeyIssue();
    console.log('');
    console.log('💡 Após obter nova API key:');
    console.log('1. Substitua em src/config/firebase.js');
    console.log('2. Reinicie o servidor: npm run dev');
    console.log('3. Verifique se o erro desapareceu');
  },
  
  // Verificar conexão
  checkConnection: checkFirebaseConnection,
  
  // Validar domínio
  validateDomain: validateDomainConfig,
  
  // Executar diagnósticos completos
  runDiagnostics: runFirebaseDiagnostics,
  
  // Ver configuração atual (sem mostrar API key completa)
  config: () => ({
    ...firebaseConfig,
    apiKey: firebaseConfig.apiKey.substring(0, 10) + '...'
  }),
  
  // Testar conectividade
  testConnection: testFirebaseConnectivity
};

// Executar diagnósticos em desenvolvimento se houver problemas
if (import.meta.env.DEV && app?.name?.includes('ERROR')) {
  console.log('🔧 Executando diagnósticos devido a erro de inicialização...');
  setTimeout(() => {
    diagnoseApiKeyIssue();
  }, 1500);
} else if (import.meta.env.DEV) {
  // Executar diagnósticos normais em desenvolvimento
  setTimeout(() => {
    runFirebaseDiagnostics();
  }, 2000);
}

// 💡 HELPER: Mostrar instruções no console
if (app?.name?.includes('ERROR')) {
  console.log('💡 Para resolver o problema, digite no console: firebaseDebug.fixApiKey()');
} else {
  console.log('💡 Para debugging, digite no console: firebaseDebug.status()');
}