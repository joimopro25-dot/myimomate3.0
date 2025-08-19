// src/hooks/useProfile.js
import { useState, useEffect, useCallback } from 'react';
import { 
  doc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

// PLANOS DISPONÍVEIS
export const SUBSCRIPTION_PLANS = {
  STARTER: {
    id: 'starter',
    name: 'Starter',
    price: 29,
    currency: 'EUR',
    interval: 'month',
    features: [
      '100 leads por mês',
      '10 clientes ativos',
      'Agendamento básico',
      'Relatórios simples',
      'Suporte por email'
    ],
    limits: {
      leads: 100,
      clients: 10,
      visits: 50,
      opportunities: 25,
      deals: 10,
      storage: 1000, // MB
      users: 1
    },
    popular: false
  },
  PROFESSIONAL: {
    id: 'professional',
    name: 'Professional',
    price: 59,
    currency: 'EUR',
    interval: 'month',
    features: [
      '500 leads por mês',
      '100 clientes ativos',
      'Agendamento avançado',
      'Relatórios completos',
      'Integrações WhatsApp',
      'Suporte prioritário',
      'Analytics avançado'
    ],
    limits: {
      leads: 500,
      clients: 100,
      visits: 250,
      opportunities: 100,
      deals: 50,
      storage: 5000, // MB
      users: 3
    },
    popular: true
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    currency: 'EUR',
    interval: 'month',
    features: [
      'Leads ilimitados',
      'Clientes ilimitados',
      'Agendamento completo',
      'Relatórios personalizados',
      'Todas as integrações',
      'Suporte 24/7',
      'White-label',
      'API personalizada'
    ],
    limits: {
      leads: -1, // ilimitado
      clients: -1,
      visits: -1,
      opportunities: -1,
      deals: -1,
      storage: -1,
      users: -1
    },
    popular: false
  }
};

// MÉTODOS DE PAGAMENTO DISPONÍVEIS
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  BANK_TRANSFER: 'bank_transfer',
  MBWAY: 'mbway',
  PAYPAL: 'paypal',
  MULTIBANCO: 'multibanco'
};

// STATUS DE ASSINATURA
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
  PENDING: 'pending',
  TRIAL: 'trial',
  SUSPENDED: 'suspended'
};

const useProfile = () => {
  const { user, userProfile, loadUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [usage, setUsage] = useState({});

  // CRIAR PERFIL COMPLETO PARA UTILIZADOR EXISTENTE
  const createCompleteProfile = useCallback(async (profileData) => {
    if (!user?.uid) {
      throw new Error('Utilizador não autenticado');
    }

    setLoading(true);
    setError(null);

    try {
      const currentDate = new Date();
      const subscriptionPlan = SUBSCRIPTION_PLANS[profileData.selectedPlan?.toUpperCase()] || SUBSCRIPTION_PLANS.STARTER;
      
      // Calcular datas da assinatura
      const subscriptionStartDate = currentDate;
      const subscriptionEndDate = new Date(currentDate);
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1); // 1 mês

      // Dados completos do perfil
      const completeProfileData = {
        uid: user.uid,
        email: user.email,
        
        // Informações pessoais
        name: profileData.name?.trim() || '',
        company: profileData.company?.trim() || '',
        phone: profileData.phone?.trim() || '',
        nif: profileData.nif?.trim() || '',
        
        // Dados profissionais
        role: profileData.role || 'consultor',
        department: profileData.department?.trim() || '',
        licenseNumber: profileData.licenseNumber?.trim() || '',
        
        // Localização
        address: {
          street: profileData.address?.street?.trim() || '',
          number: profileData.address?.number?.trim() || '',
          floor: profileData.address?.floor?.trim() || '',
          postalCode: profileData.address?.postalCode?.trim() || '',
          city: profileData.address?.city?.trim() || '',
          district: profileData.address?.district?.trim() || '',
          country: profileData.address?.country || 'Portugal'
        },
        
        // Dados da assinatura
        subscription: {
          plan: subscriptionPlan.id,
          status: SUBSCRIPTION_STATUS.ACTIVE,
          startDate: subscriptionStartDate,
          endDate: subscriptionEndDate,
          isActive: true,
          autoRenew: profileData.autoRenew !== false,
          trialUsed: false,
          limits: subscriptionPlan.limits,
          features: subscriptionPlan.features
        },
        
        // Informações de pagamento (não salvar dados sensíveis)
        billing: {
          method: profileData.paymentMethod || PAYMENT_METHODS.CREDIT_CARD,
          lastFourDigits: profileData.cardLastFour || '',
          billingEmail: profileData.billingEmail || user.email,
          vatNumber: profileData.vatNumber?.trim() || '',
          billingAddress: profileData.billingAddress || profileData.address
        },
        
        // Configurações
        settings: {
          theme: profileData.theme || 'corporate',
          language: profileData.language || 'pt',
          timezone: profileData.timezone || 'Europe/Lisbon',
          currency: profileData.currency || 'EUR',
          notifications: {
            email: profileData.notifications?.email !== false,
            whatsapp: profileData.notifications?.whatsapp === true,
            browser: profileData.notifications?.browser !== false,
            sms: profileData.notifications?.sms === true
          },
          privacy: {
            profileVisible: profileData.privacy?.profileVisible !== false,
            contactSharing: profileData.privacy?.contactSharing === true,
            analyticsOptIn: profileData.privacy?.analyticsOptIn !== false,
            marketingOptIn: profileData.privacy?.marketingOptIn !== false
          },
          dashboard: {
            showWelcome: true,
            defaultView: profileData.dashboardView || 'overview',
            showMetrics: profileData.showMetrics !== false
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
          subscriptionStarted: subscriptionStartDate,
          profileCompleted: true
        },
        
        // Utilizações atuais (para controlo de limites)
        usage: {
          leads: 0,
          clients: 0,
          visits: 0,
          opportunities: 0,
          deals: 0,
          storage: 0, // MB utilizados
          users: 1,
          lastReset: subscriptionStartDate // reset mensal
        },
        
        // Metadados
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        profileCompletedAt: serverTimestamp(),
        emailVerified: user.emailVerified || false,
        isActive: true,
        lastLogin: serverTimestamp(),
        registrationIP: await getUserIP(),
        userAgent: navigator.userAgent,
        
        // Versão do perfil (para migrações futuras)
        profileVersion: '1.0',
        
        // Flags especiais
        isFirstLogin: true,
        hasCompletedOnboarding: false,
        needsRevalidation: false
      };

      // Salvar perfil no Firestore
      await setDoc(doc(db, 'users', user.uid), completeProfileData);

      // Criar registo inicial de assinatura
      await createSubscriptionRecord(user.uid, subscriptionPlan, {
        paymentMethod: profileData.paymentMethod,
        autoRenew: profileData.autoRenew,
        promoCode: profileData.promoCode
      });

      // Criar primeiro registo de pagamento (simulado)
      await createPaymentRecord(user.uid, {
        amount: subscriptionPlan.price,
        currency: subscriptionPlan.currency,
        method: profileData.paymentMethod,
        status: 'completed',
        description: `Assinatura ${subscriptionPlan.name} - ${new Date().toLocaleDateString('pt-PT')}`
      });

      // Recarregar perfil no contexto
      await loadUserProfile(user.uid);

      console.log('✅ Perfil completo criado com sucesso');
      
      return {
        success: true,
        message: 'Perfil criado com sucesso!',
        subscription: completeProfileData.subscription
      };

    } catch (err) {
      console.error('❌ Erro ao criar perfil:', err);
      setError(err.message);
      
      return {
        success: false,
        error: err.message,
        message: `Erro ao criar perfil: ${err.message}`
      };
    } finally {
      setLoading(false);
    }
  }, [user, loadUserProfile]);

  // ATUALIZAR PERFIL EXISTENTE
  const updateProfile = useCallback(async (updates) => {
    if (!user?.uid) {
      throw new Error('Utilizador não autenticado');
    }

    setUpdating(true);
    setError(null);

    try {
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      // Se estiver atualizando configurações, manter estrutura
      if (updates.settings) {
        updateData.settings = {
          ...userProfile?.settings,
          ...updates.settings
        };
      }

      await updateDoc(doc(db, 'users', user.uid), updateData);
      await loadUserProfile(user.uid);

      console.log('✅ Perfil atualizado com sucesso');
      
      return {
        success: true,
        message: 'Perfil atualizado com sucesso!'
      };

    } catch (err) {
      console.error('❌ Erro ao atualizar perfil:', err);
      setError(err.message);
      
      return {
        success: false,
        error: err.message
      };
    } finally {
      setUpdating(false);
    }
  }, [user, userProfile, loadUserProfile]);

  // ATUALIZAR PLANO DE ASSINATURA
  const updateSubscriptionPlan = useCallback(async (newPlanId, paymentData = {}) => {
    if (!user?.uid) {
      throw new Error('Utilizador não autenticado');
    }

    setUpdating(true);
    setError(null);

    try {
      const newPlan = SUBSCRIPTION_PLANS[newPlanId?.toUpperCase()];
      if (!newPlan) {
        throw new Error('Plano inválido');
      }

      const currentDate = new Date();
      const newEndDate = new Date(currentDate);
      newEndDate.setMonth(newEndDate.getMonth() + 1);

      const subscriptionUpdate = {
        'subscription.plan': newPlan.id,
        'subscription.endDate': newEndDate,
        'subscription.limits': newPlan.limits,
        'subscription.features': newPlan.features,
        'subscription.updatedAt': serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'users', user.uid), subscriptionUpdate);

      // Criar registo de mudança de plano
      await createSubscriptionRecord(user.uid, newPlan, {
        ...paymentData,
        previousPlan: userProfile?.subscription?.plan,
        changeReason: 'upgrade'
      });

      // Criar registo de pagamento se necessário
      if (newPlan.price > 0) {
        await createPaymentRecord(user.uid, {
          amount: newPlan.price,
          currency: newPlan.currency,
          method: paymentData.paymentMethod,
          status: 'completed',
          description: `Upgrade para ${newPlan.name}`
        });
      }

      await loadUserProfile(user.uid);

      console.log(`✅ Plano atualizado para: ${newPlan.name}`);
      
      return {
        success: true,
        message: `Plano atualizado para ${newPlan.name}!`,
        newPlan
      };

    } catch (err) {
      console.error('❌ Erro ao atualizar plano:', err);
      setError(err.message);
      
      return {
        success: false,
        error: err.message
      };
    } finally {
      setUpdating(false);
    }
  }, [user, userProfile, loadUserProfile]);

  // CRIAR REGISTO DE ASSINATURA
  const createSubscriptionRecord = useCallback(async (userId, plan, metadata = {}) => {
    try {
      const subscriptionRecord = {
        userId,
        planId: plan.id,
        planName: plan.name,
        price: plan.price,
        currency: plan.currency,
        interval: plan.interval,
        status: SUBSCRIPTION_STATUS.ACTIVE,
        startDate: new Date(),
        paymentMethod: metadata.paymentMethod || PAYMENT_METHODS.CREDIT_CARD,
        autoRenew: metadata.autoRenew !== false,
        promoCode: metadata.promoCode || null,
        previousPlan: metadata.previousPlan || null,
        changeReason: metadata.changeReason || 'new_subscription',
        createdAt: serverTimestamp(),
        metadata: {
          userAgent: navigator.userAgent,
          ip: await getUserIP(),
          ...metadata
        }
      };

      await addDoc(collection(db, 'subscriptions'), subscriptionRecord);
      console.log('✅ Registo de assinatura criado');
      
    } catch (error) {
      console.error('❌ Erro ao criar registo de assinatura:', error);
    }
  }, []);

  // CRIAR REGISTO DE PAGAMENTO
  const createPaymentRecord = useCallback(async (userId, paymentData) => {
    try {
      const paymentRecord = {
        userId,
        amount: paymentData.amount,
        currency: paymentData.currency || 'EUR',
        method: paymentData.method,
        status: paymentData.status || 'pending',
        description: paymentData.description || '',
        transactionId: paymentData.transactionId || `TXN_${Date.now()}`,
        processorResponse: paymentData.processorResponse || null,
        createdAt: serverTimestamp(),
        processedAt: paymentData.status === 'completed' ? serverTimestamp() : null,
        metadata: {
          userAgent: navigator.userAgent,
          ip: await getUserIP(),
          ...paymentData.metadata
        }
      };

      await addDoc(collection(db, 'payments'), paymentRecord);
      console.log('✅ Registo de pagamento criado');
      
    } catch (error) {
      console.error('❌ Erro ao criar registo de pagamento:', error);
    }
  }, []);

  // CARREGAR HISTÓRICO DE PAGAMENTOS
  const loadPaymentHistory = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const paymentsQuery = query(
        collection(db, 'payments'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const querySnapshot = await getDocs(paymentsQuery);
      const payments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        processedAt: doc.data().processedAt?.toDate()
      }));

      setPaymentHistory(payments);
      
    } catch (error) {
      console.error('❌ Erro ao carregar histórico de pagamentos:', error);
    }
  }, [user]);

  // VERIFICAR LIMITES DE UTILIZAÇÃO
  const checkUsageLimits = useCallback((feature) => {
    if (!userProfile?.subscription || !userProfile?.usage) {
      return { allowed: true, remaining: Infinity };
    }

    const limits = userProfile.subscription.limits;
    const usage = userProfile.usage;
    
    if (limits[feature] === -1) {
      return { allowed: true, remaining: Infinity };
    }

    const used = usage[feature] || 0;
    const limit = limits[feature] || 0;
    const remaining = Math.max(0, limit - used);

    return {
      allowed: remaining > 0,
      remaining,
      used,
      limit,
      percentage: limit > 0 ? (used / limit) * 100 : 0
    };
  }, [userProfile]);

  // INCREMENTAR UTILIZAÇÃO
  const incrementUsage = useCallback(async (feature, amount = 1) => {
    if (!user?.uid || !userProfile?.usage) return;

    try {
      const currentUsage = userProfile.usage[feature] || 0;
      const newUsage = currentUsage + amount;

      await updateDoc(doc(db, 'users', user.uid), {
        [`usage.${feature}`]: newUsage,
        'stats.lastActivity': serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Recarregar perfil para atualizar dados
      await loadUserProfile(user.uid);

    } catch (error) {
      console.error('❌ Erro ao incrementar utilização:', error);
    }
  }, [user, userProfile, loadUserProfile]);

  // OBTER IP DO UTILIZADOR
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

  // Efeitos
  useEffect(() => {
    if (user?.uid) {
      loadPaymentHistory();
    }
  }, [user, loadPaymentHistory]);

  // Retorno do hook
  return {
    // Estados
    loading,
    updating,
    error,
    subscription: userProfile?.subscription,
    paymentHistory,
    usage: userProfile?.usage,
    
    // Funções principais
    createCompleteProfile,
    updateProfile,
    updateSubscriptionPlan,
    
    // Gestão de utilização
    checkUsageLimits,
    incrementUsage,
    
    // Dados úteis
    currentPlan: userProfile?.subscription?.plan ? SUBSCRIPTION_PLANS[userProfile.subscription.plan.toUpperCase()] : null,
    isSubscriptionActive: userProfile?.subscription?.status === SUBSCRIPTION_STATUS.ACTIVE,
    subscriptionEndDate: userProfile?.subscription?.endDate,
    
    // Constantes
    SUBSCRIPTION_PLANS,
    PAYMENT_METHODS,
    SUBSCRIPTION_STATUS,
    
    // Funções utilitárias
    clearError: () => setError(null)
  };
};

export default useProfile;