// src/contexts/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Função para registar novo utilizador
  const register = async (email, password, userData) => {
    try {
      setError('');
      setLoading(true);

      // Criar utilizador no Firebase Auth
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Atualizar perfil com nome
      await updateProfile(user, {
        displayName: userData.name
      });

      // Criar documento do utilizador no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: userData.name,
        email: userData.email,
        company: userData.company || '',
        phone: userData.phone || '',
        role: userData.role || 'consultor',
        plan: userData.plan || 'starter',
        avatar: userData.avatar || '',
        settings: {
          theme: 'corporate',
          notifications: {
            email: true,
            whatsapp: true,
            browser: true
          },
          privacy: {
            profileVisible: true,
            contactSharing: false
          }
        },
        stats: {
          leadsCreated: 0,
          clientsConverted: 0,
          visitsScheduled: 0,
          dealsWon: 0,
          totalCommission: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: false,
        isActive: true,
        lastLogin: serverTimestamp()
      });

      // Enviar email de verificação
      await sendEmailVerification(user);

      return { 
        success: true, 
        message: 'Conta criada com sucesso! Verifique o seu email.' 
      };

    } catch (error) {
      console.error('Erro no registo:', error);
      let errorMessage = 'Erro desconhecido no registo';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email já está registado';
          break;
        case 'auth/weak-password':
          errorMessage = 'A password deve ter pelo menos 6 caracteres';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Operação não permitida';
          break;
        default:
          errorMessage = error.message;
      }

      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer login
  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);

      const { user } = await signInWithEmailAndPassword(auth, email, password);

      // Atualizar último login no Firestore
      await setDoc(doc(db, 'users', user.uid), {
        lastLogin: serverTimestamp()
      }, { merge: true });

      return { 
        success: true, 
        message: 'Login realizado com sucesso!' 
      };

    } catch (error) {
      console.error('Erro no login:', error);
      let errorMessage = 'Erro desconhecido no login';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Utilizador não encontrado';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Password incorreta';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Conta desativada';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Muitas tentativas. Tente novamente mais tarde';
          break;
        default:
          errorMessage = 'Email ou password incorretos';
      }

      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Função para fazer logout
  const logout = async () => {
    try {
      setError('');
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      return { success: true, message: 'Logout realizado com sucesso!' };
    } catch (error) {
      console.error('Erro no logout:', error);
      setError('Erro ao fazer logout');
      return { success: false, message: 'Erro ao fazer logout' };
    }
  };

  // Função para resetar password
  const resetPassword = async (email) => {
    try {
      setError('');
      setLoading(true);
      
      await sendPasswordResetEmail(auth, email);
      
      return { 
        success: true, 
        message: 'Email de recuperação enviado!' 
      };
    } catch (error) {
      console.error('Erro no reset da password:', error);
      let errorMessage = 'Erro ao enviar email de recuperação';

      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Email não encontrado';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido';
          break;
        default:
          errorMessage = error.message;
      }

      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Função para carregar perfil do utilizador
  const loadUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        setUserProfile(profileData);
        return profileData;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      return null;
    }
  };

  // Função para atualizar perfil
  const updateUserProfile = async (updates) => {
    try {
      if (!currentUser) return { success: false, message: 'Utilizador não autenticado' };

      setError('');
      setLoading(true);

      // Atualizar no Firebase Auth se necessário
      if (updates.displayName && updates.displayName !== currentUser.displayName) {
        await updateProfile(currentUser, {
          displayName: updates.displayName
        });
      }

      // Atualizar no Firestore
      await setDoc(doc(db, 'users', currentUser.uid), {
        ...updates,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Recarregar perfil
      await loadUserProfile(currentUser.uid);

      return { success: true, message: 'Perfil atualizado com sucesso!' };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError('Erro ao atualizar perfil');
      return { success: false, message: 'Erro ao atualizar perfil' };
    } finally {
      setLoading(false);
    }
  };

  // Verificar se utilizador está logado
  const isAuthenticated = () => {
    return currentUser !== null;
  };

  // Verificar se email está verificado
  const isEmailVerified = () => {
    return currentUser?.emailVerified || false;
  };

  // Reenviar email de verificação
  const resendVerificationEmail = async () => {
    try {
      if (!currentUser) return { success: false, message: 'Utilizador não encontrado' };
      
      await sendEmailVerification(currentUser);
      return { success: true, message: 'Email de verificação reenviado!' };
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      return { success: false, message: 'Erro ao reenviar email de verificação' };
    }
  };

  // Listener para mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Carregar perfil do utilizador
        await loadUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Limpar erros após 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  const value = {
    // Estado atual
    currentUser,
    userProfile,
    loading,
    error,

    // Funções de autenticação
    register,
    login,
    logout,
    resetPassword,

    // Funções de perfil
    loadUserProfile,
    updateUserProfile,

    // Funções de verificação
    isAuthenticated,
    isEmailVerified,
    resendVerificationEmail,

    // Funções utilitárias
    clearError: () => setError(''),
    
    // Getters úteis
    getUserId: () => currentUser?.uid || null,
    getUserEmail: () => currentUser?.email || '',
    getUserName: () => userProfile?.name || currentUser?.displayName || '',
    getUserPlan: () => userProfile?.plan || 'starter',
    getUserRole: () => userProfile?.role || 'consultor'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};