// src/utils/createUserProfile.js
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Criar perfil básico para utilizador existente que não tem perfil no Firestore
export const createBasicProfileForExistingUser = async (user) => {
  if (!user?.uid) {
    throw new Error('Utilizador não válido');
  }

  try {
    const currentDate = new Date();
    const subscriptionEndDate = new Date(currentDate);
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // 1 mês grátis

    // Perfil básico com plano Starter gratuito por 1 mês
    const basicProfile = {
      uid: user.uid,
      email: user.email,
      
      // Informações básicas (vazias para o utilizador preencher)
      name: user.displayName || '',
      company: '',
      phone: '',
      nif: '',
      
      // Dados profissionais padrão
      role: 'consultor',
      department: '',
      licenseNumber: '',
      
      // Morada vazia
      address: {
        street: '',
        number: '',
        floor: '',
        postalCode: '',
        city: '',
        district: '',
        country: 'Portugal'
      },
      
      // Assinatura Starter com 1 mês grátis
      subscription: {
        plan: 'starter',
        status: 'active',
        startDate: currentDate,
        endDate: subscriptionEndDate,
        isActive: true,
        autoRenew: false, // Não renovar automaticamente trial
        trialUsed: true,
        isTrial: true,
        limits: {
          leads: 100,
          clients: 10,
          visits: 50,
          opportunities: 25,
          deals: 10,
          storage: 1000,
          users: 1
        },
        features: [
          '100 leads por mês',
          '10 clientes ativos',
          'Agendamento básico',
          'Relatórios simples',
          'Suporte por email'
        ]
      },
      
      // Informações de faturação vazias
      billing: {
        method: 'credit_card',
        lastFourDigits: '',
        billingEmail: user.email,
        vatNumber: '',
        billingAddress: {}
      },
      
      // Configurações padrão
      settings: {
        theme: 'corporate',
        language: 'pt',
        timezone: 'Europe/Lisbon',
        currency: 'EUR',
        notifications: {
          email: true,
          whatsapp: false,
          browser: true,
          sms: false
        },
        privacy: {
          profileVisible: true,
          contactSharing: false,
          analyticsOptIn: true,
          marketingOptIn: false
        },
        dashboard: {
          showWelcome: true,
          defaultView: 'overview',
          showMetrics: true
        }
      },
      
      // Estatísticas iniciais
      stats: {
        leadsCreated: 0,
        clientsConverted: 0,
        visitsScheduled: 0,
        opportunitiesCreated: 0,
        dealsWon: 0,
        totalCommission: 0,
        loginCount: 1,
        lastActivity: serverTimestamp(),
        profileCompleted: false, // Indica que precisa completar perfil
        subscriptionStarted: currentDate
      },
      
      // Utilizações atuais
      usage: {
        leads: 0,
        clients: 0,
        visits: 0,
        opportunities: 0,
        deals: 0,
        storage: 0,
        users: 1,
        lastReset: currentDate
      },
      
      // Metadados
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      emailVerified: user.emailVerified || false,
      isActive: true,
      lastLogin: serverTimestamp(),
      
      // Flags especiais
      isFirstLogin: true,
      hasCompletedOnboarding: false,
      needsProfileCompletion: true, // Flag para mostrar que precisa completar
      
      // Versão do perfil
      profileVersion: '1.0'
    };

    // Salvar no Firestore
    await setDoc(doc(db, 'users', user.uid), basicProfile);

    console.log('✅ Perfil básico criado para utilizador existente:', user.uid);
    
    return {
      success: true,
      profile: basicProfile,
      message: 'Perfil básico criado com sucesso!'
    };

  } catch (error) {
    console.error('❌ Erro ao criar perfil básico:', error);
    throw error;
  }
};

// Verificar se utilizador precisa de perfil e criar se necessário
export const ensureUserHasProfile = async (user, loadUserProfile) => {
  if (!user?.uid) return null;

  try {
    // Tentar carregar perfil existente
    const existingProfile = await loadUserProfile(user.uid);
    
    if (!existingProfile) {
      console.log('👤 Utilizador sem perfil, criando perfil básico...');
      
      // Criar perfil básico
      const result = await createBasicProfileForExistingUser(user);
      
      if (result.success) {
        // Recarregar perfil após criação
        await loadUserProfile(user.uid);
        return result.profile;
      }
    }
    
    return existingProfile;
    
  } catch (error) {
    console.error('❌ Erro ao verificar/criar perfil:', error);
    return null;
  }
};

export default {
  createBasicProfileForExistingUser,
  ensureUserHasProfile
};