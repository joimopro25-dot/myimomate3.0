// src/contexts/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  collection,
  getDocs
} from 'firebase/firestore';
import { auth, db, getFirebaseErrorMessage } from '../config/firebase';
import { ensureUserHasProfile } from '../utils/createUserProfile';

// 🔐 CONTEXTO DE AUTENTICAÇÃO FIREBASE
// ====================================

const AuthContext = createContext();

// Hook para usar o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provider do contexto
export const AuthProvider = ({ children }) => {
  // Estados principais
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initializationComplete, setInitializationComplete] = useState(false);

  // Estados específicos de operações
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // 🔥 FUNÇÃO DE REGISTO
  // ===================
  const register = async (email, password, userData) => {
    if (!email || !password) {
      const message = 'Email e password são obrigatórios';
      setError(message);
      return { success: false, message };
    }

    if (password.length < 6) {
      const message = 'Password deve ter pelo menos 6 caracteres';
      setError(message);
      return { success: false, message };
    }

    setIsRegistering(true);
    setError('');

    try {
      console.log('🔄 Iniciando registo para:', email);

      // Verificar se Firebase Auth está disponível
      if (!auth) {
        throw new Error('Firebase Auth não está inicializado');
      }

      // Verificar se o email já existe (opcional - Firebase já faz isso)
      const existingUser = await checkEmailExists(email);
      if (existingUser) {
        throw new Error('Este email já está registado');
      }

      // Criar utilizador no Firebase Auth
      console.log('📝 Criando utilizador no Firebase Auth...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('✅ Utilizador criado no Auth:', user.uid);

      // Atualizar perfil com nome de exibição
      if (userData.name) {
        console.log('🏷️ Atualizando perfil com nome...');
        await updateProfile(user, {
          displayName: userData.name.trim()
        });
      }

      // Criar documento do utilizador no Firestore
      console.log('💾 Criando perfil no Firestore...');
      const userDocData = {
        uid: user.uid,
        name: userData.name?.trim() || '',
        email: email.toLowerCase(),
        company: userData.company?.trim() || '',
        phone: userData.phone?.trim() || '',
        role: userData.role || 'consultor',
        plan: userData.plan || 'starter',
        avatar: userData.avatar || '',
        
        // Configurações padrão
        settings: {
          theme: 'corporate',
          language: 'pt',
          timezone: 'Europe/Lisbon',
          notifications: {
            email: true,
            whatsapp: false,
            browser: true,
            sms: false
          },
          privacy: {
            profileVisible: true,
            contactSharing: false,
            analyticsOptIn: true
          },
          dashboard: {
            showWelcome: true,
            defaultView: 'overview'
          }
        },

        // Estatísticas iniciais
        stats: {
          leadsCreated: 0,
          clientsConverted: 0,
          visitsScheduled: 0,
          dealsWon: 0,
          totalCommission: 0,
          loginCount: 1,
          lastActivity: serverTimestamp()
        },

        // Metadados
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: false,
        isActive: true,
        lastLogin: serverTimestamp(),
        registrationIP: await getUserIP(),
        userAgent: navigator.userAgent
      };

      await setDoc(doc(db, 'users', user.uid), userDocData);
      console.log('✅ Perfil criado no Firestore');

      // Enviar email de verificação
      try {
        console.log('📧 Enviando email de verificação...');
        await sendEmailVerification(user);
        console.log('✅ Email de verificação enviado');
      } catch (emailError) {
        console.warn('⚠️ Erro ao enviar email de verificação:', emailError);
        // Não falhar o registo se o email não conseguir ser enviado
      }

      // Carregar perfil criado
      await loadUserProfile(user.uid);

      console.log('🎉 Registo concluído com sucesso!');
      return { 
        success: true, 
        message: 'Conta criada com sucesso! Verifique o seu email para ativar a conta.',
        user: user
      };

    } catch (error) {
      console.error('❌ Erro no registo:', error);
      
      const errorMessage = getFirebaseErrorMessage(error.code) || error.message;
      setError(errorMessage);

      // Log detalhado para debug
      console.error('Detalhes do erro:', {
        code: error.code,
        message: error.message,
        email: email
      });

      return { success: false, message: errorMessage };

    } finally {
      setIsRegistering(false);
    }
  };

  // 🔑 FUNÇÃO DE LOGIN
  // =================
  const login = async (email, password) => {
    if (!email || !password) {
      const message = 'Email e password são obrigatórios';
      setError(message);
      return { success: false, message };
    }

    setIsLoggingIn(true);
    setError('');

    try {
      console.log('🔄 Iniciando login para:', email);

      // Verificar se Firebase Auth está disponível
      if (!auth) {
        throw new Error('Firebase Auth não está inicializado');
      }

      // Fazer login no Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
      const user = userCredential.user;
      
      console.log('✅ Login realizado no Auth:', user.uid);

      // Atualizar estatísticas de login no Firestore
      try {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const currentStats = userDoc.data().stats || {};
          await updateDoc(userRef, {
            lastLogin: serverTimestamp(),
            'stats.loginCount': (currentStats.loginCount || 0) + 1,
            'stats.lastActivity': serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          console.log('📊 Estatísticas de login atualizadas');
        }
      } catch (statsError) {
        console.warn('⚠️ Erro ao atualizar estatísticas:', statsError);
        // Não falhar o login se as estatísticas não conseguirem ser atualizadas
      }

      // Carregar perfil do utilizador
      await loadUserProfile(user.uid);

      console.log('🎉 Login concluído com sucesso!');
      return { 
        success: true, 
        message: 'Login realizado com sucesso!',
        user: user
      };

    } catch (error) {
      console.error('❌ Erro no login:', error);
      
      const errorMessage = getFirebaseErrorMessage(error.code) || 'Erro no login';
      setError(errorMessage);

      // Log detalhado para debug
      console.error('Detalhes do erro:', {
        code: error.code,
        message: error.message,
        email: email
      });

      return { success: false, message: errorMessage };

    } finally {
      setIsLoggingIn(false);
    }
  };

  // 🚪 FUNÇÃO DE LOGOUT
  // ==================
  const logout = async () => {
    setIsLoggingOut(true);
    setError('');

    try {
      console.log('🔄 Fazendo logout...');

      // Atualizar última atividade antes de sair
      if (currentUser) {
        try {
          await updateDoc(doc(db, 'users', currentUser.uid), {
            'stats.lastActivity': serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (updateError) {
          console.warn('⚠️ Erro ao atualizar última atividade:', updateError);
        }
      }

      // Fazer logout no Firebase
      await signOut(auth);
      
      // Limpar estados locais
      setCurrentUser(null);
      setUserProfile(null);
      setError('');

      console.log('✅ Logout realizado com sucesso!');
      return { success: true, message: 'Logout realizado com sucesso!' };

    } catch (error) {
      console.error('❌ Erro no logout:', error);
      
      const errorMessage = 'Erro ao fazer logout';
      setError(errorMessage);
      return { success: false, message: errorMessage };

    } finally {
      setIsLoggingOut(false);
    }
  };

  // 🔄 FUNÇÃO DE RESET DE PASSWORD
  // ==============================
  const resetPassword = async (email) => {
    if (!email) {
      const message = 'Email é obrigatório';
      setError(message);
      return { success: false, message };
    }

    setIsResettingPassword(true);
    setError('');

    try {
      console.log('🔄 Enviando email de recuperação para:', email);

      await sendPasswordResetEmail(auth, email.toLowerCase());
      
      console.log('✅ Email de recuperação enviado');
      return { 
        success: true, 
        message: 'Email de recuperação enviado! Verifique a sua caixa de entrada.' 
      };

    } catch (error) {
      console.error('❌ Erro no reset de password:', error);
      
      const errorMessage = getFirebaseErrorMessage(error.code) || 'Erro ao enviar email de recuperação';
      setError(errorMessage);
      return { success: false, message: errorMessage };

    } finally {
      setIsResettingPassword(false);
    }
  };

  // 👤 CARREGAR PERFIL DO UTILIZADOR
  // ================================
  const loadUserProfile = async (uid) => {
    if (!uid) return null;

    try {
      console.log('📖 Carregando perfil para UID:', uid);
      
      const userDoc = await getDoc(doc(db, 'users', uid));
      
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        setUserProfile(profileData);
        console.log('✅ Perfil carregado:', profileData.name);
        return profileData;
      } else {
        console.warn('⚠️ Perfil não encontrado no Firestore para UID:', uid);
        setUserProfile(null);
        return null;
      }

    } catch (error) {
      console.error('❌ Erro ao carregar perfil:', error);
      setUserProfile(null);
      return null;
    }
  };

  // ✏️ ATUALIZAR PERFIL DO UTILIZADOR
  // =================================
  const updateUserProfile = async (updates) => {
    if (!currentUser) {
      const message = 'Utilizador não autenticado';
      setError(message);
      return { success: false, message };
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔄 Atualizando perfil...', updates);

      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Atualizar no Firestore
      await updateDoc(userRef, updateData);

      // Atualizar perfil no Auth se nome mudou
      if (updates.name && updates.name !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: updates.name
        });
      }

      // Recarregar perfil
      await loadUserProfile(currentUser.uid);

      console.log('✅ Perfil atualizado com sucesso');
      return { success: true, message: 'Perfil atualizado com sucesso!' };

    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      
      const errorMessage = 'Erro ao atualizar perfil';
      setError(errorMessage);
      return { success: false, message: errorMessage };

    } finally {
      setLoading(false);
    }
  };

  // 🔍 FUNÇÕES UTILITÁRIAS
  // ======================

  // Verificar se email já existe
  const checkEmailExists = async (email) => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.warn('⚠️ Erro ao verificar email existente:', error);
      return false; // Em caso de erro, assumir que não existe
    }
  };

  // Obter IP do utilizador (para logs de segurança)
  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.warn('⚠️ Erro ao obter IP:', error);
      return 'unknown';
    }
  };

  // Reenviar email de verificação
  const resendVerificationEmail = async () => {
    if (!currentUser) {
      return { success: false, message: 'Utilizador não encontrado' };
    }

    try {
      await sendEmailVerification(currentUser);
      return { success: true, message: 'Email de verificação reenviado!' };
    } catch (error) {
      console.error('❌ Erro ao reenviar email:', error);
      return { success: false, message: 'Erro ao reenviar email de verificação' };
    }
  };

  // Eliminar conta
  const deleteAccount = async (password) => {
    if (!currentUser) {
      return { success: false, message: 'Utilizador não encontrado' };
    }

    try {
      // Reautenticar antes de eliminar
      const credential = EmailAuthProvider.credential(currentUser.email, password);
      await reauthenticateWithCredential(currentUser, credential);

      // Eliminar documento do Firestore
      await deleteDoc(doc(db, 'users', currentUser.uid));

      // Eliminar utilizador do Auth
      await deleteUser(currentUser);

      return { success: true, message: 'Conta eliminada com sucesso' };
    } catch (error) {
      console.error('❌ Erro ao eliminar conta:', error);
      return { success: false, message: 'Erro ao eliminar conta' };
    }
  };

  // 📡 LISTENER DE MUDANÇAS NO AUTH
  // ===============================
  useEffect(() => {
  console.log('🔄 Configurando listener de autenticação...');

  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    console.log('👤 Estado de auth mudou:', user ? `Utilizador: ${user.email}` : 'Sem utilizador');
    
    setCurrentUser(user);
    
    if (user) {
      try {
        // Verificar se utilizador tem perfil, criar se necessário
        const profile = await ensureUserHasProfile(user, loadUserProfile);
        
        if (profile && !profile.stats?.profileCompleted) {
          console.log('⚠️ Utilizador precisa completar perfil');
          // O ProfileGuard irá redirecionar para /create-profile
        }
        
      } catch (error) {
        console.error('❌ Erro ao verificar perfil:', error);
        // Continuar mesmo com erro para não bloquear login
      }
    } else {
      // Limpar perfil se utilizador saiu
      setUserProfile(null);
    }
    
    setLoading(false);
    setInitializationComplete(true);
  });

  return () => {
    console.log('🔄 Removendo listener de autenticação...');
    unsubscribe();
  };
}, []);

// Adicionar função para marcar perfil como completo após criação
const markProfileAsCompleted = async () => {
  if (!currentUser?.uid) return;
  
  try {
    await updateDoc(doc(db, 'users', currentUser.uid), {
      'stats.profileCompleted': true,
      'needsProfileCompletion': false,
      'stats.profileCompletedAt': serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Recarregar perfil
    await loadUserProfile(currentUser.uid);
    
    console.log('✅ Perfil marcado como completo');
    
  } catch (error) {
    console.error('❌ Erro ao marcar perfil como completo:', error);
  }
};
  // 📊 VALOR DO CONTEXTO
  // ===================
  const value = {
    // Estados principais
    currentUser,
    userProfile,
    loading,
    error,
    initializationComplete,

    // Estados de operações específicas
    isRegistering,
    isLoggingIn,
    isLoggingOut,
    isResettingPassword,

    // Funções de autenticação
    register,
    login,
    logout,
    resetPassword,

    // Funções de perfil
    loadUserProfile,
    updateUserProfile,
    resendVerificationEmail,
    deleteAccount,

    // Funções de verificação
    isAuthenticated: () => !!currentUser,
    isEmailVerified: () => currentUser?.emailVerified || false,
    
    // Novas funções
    markProfileAsCompleted,

    // Getters úteis
    getUserId: () => currentUser?.uid || null,
    getUserEmail: () => currentUser?.email || '',
    getUserName: () => userProfile?.name || currentUser?.displayName || '',
    getUserPlan: () => userProfile?.plan || 'starter',
    getUserRole: () => userProfile?.role || 'consultor',
    
    // Funções utilitárias
    clearError: () => setError(''),
    checkEmailExists
  };

  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};