// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// 🔥 CONFIGURAÇÃO FIREBASE - MyImoMate 3.0
// ============================================

// Configuração Firebase (Produção)
const firebaseConfig = {
  apiKey: "AIzaSyDczFgGCwPPnLcvYSkWn0trshH9BMqVoiA",
  authDomain: "myimomate3-0.firebaseapp.com",
  projectId: "myimomate3-0",
  storageBucket: "myimomate3-0.firebasestorage.app",
  messagingSenderId: "971739318329",
  appId: "1:971739318329:web:7d59f6602c259a940325e8"
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

// Função para detectar ambiente
const isProduction = () => {
  return import.meta.env.PROD || window.location.hostname !== 'localhost';
};

const isDevelopment = () => {
  return import.meta.env.DEV || window.location.hostname === 'localhost';
};

// Função de inicialização com tratamento de erros
const initializeFirebaseApp = () => {
  try {
    // Validar configuração antes de inicializar
    validateConfig(firebaseConfig);
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    
    console.log('🔥 Firebase inicializado com sucesso!');
    console.log('📱 App Name:', app.name);
    console.log('🏗️ Project ID:', firebaseConfig.projectId);
    console.log('🌍 Ambiente:', isProduction() ? 'Produção' : 'Desenvolvimento');
    
    return app;
    
  } catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    console.error('🔧 Configuração utilizada:', {
      ...firebaseConfig,
      apiKey: firebaseConfig.apiKey.substring(0, 10) + '...' // Ocultar API key nos logs
    });
    throw error;
  }
};

// Inicializar app
let app;
try {
  app = initializeFirebaseApp();
} catch (error) {
  console.error('💥 Firebase não conseguiu inicializar:', error.message);
  // Em caso de erro, criar um objeto mock para evitar crashes
  app = {
    name: '[ERROR]',
    options: firebaseConfig
  };
}

// 🔥 INICIALIZAR SERVIÇOS FIREBASE
// ================================

// Firestore Database
let db;
try {
  db = getFirestore(app);
  
  // Conectar ao emulador em desenvolvimento (opcional)
  if (isDevelopment() && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
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
  if (isDevelopment() && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
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
      environment: isProduction() ? 'production' : 'development',
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

// Mapear códigos de erro Firebase para mensagens amigáveis
export const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    // Auth errors
    'auth/user-not-found': 'Utilizador não encontrado. Verifique o email.',
    'auth/wrong-password': 'Password incorreta. Tente novamente.',
    'auth/email-already-in-use': 'Este email já está registado. Tente fazer login.',
    'auth/weak-password': 'Password muito fraca. Use pelo menos 6 caracteres.',
    'auth/invalid-email': 'Email inválido. Verifique o formato.',
    'auth/network-request-failed': 'Erro de rede. Verifique a sua conexão.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
    'auth/user-disabled': 'Esta conta foi desativada.',
    'auth/requires-recent-login': 'É necessário fazer login novamente.',
    'auth/invalid-api-key': 'Chave de API inválida. Contacte o suporte.',
    
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

// Log de inicialização final
console.log('✅ Firebase config carregado:', {
  app: !!app && app.name !== '[ERROR]',
  auth: !!auth,
  firestore: !!db,
  projectId: firebaseConfig.projectId,
  environment: isProduction() ? 'production' : 'development'
});

// Executar diagnósticos em desenvolvimento
if (isDevelopment()) {
  // Aguardar um pouco para o Firebase terminar de carregar
  setTimeout(() => {
    runFirebaseDiagnostics();
  }, 2000);
}