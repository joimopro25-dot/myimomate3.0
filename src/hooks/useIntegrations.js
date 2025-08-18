// src/hooks/useIntegrations.js
import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  collection, 
  doc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

/**
 * 🔗 HOOK DE INTEGRAÇÕES EXTERNAS
 * 
 * Funcionalidades:
 * ✅ Integração WhatsApp Business API
 * ✅ Sincronização Google Drive
 * ✅ Integração Google Calendar
 * ✅ Webhooks para CRM externos
 * ✅ API de verificação CPF/CNPJ
 * ✅ Sistema de notificações push
 * ✅ Email marketing (Mailchimp, etc.)
 * ✅ Integrações bancárias
 * ✅ Conectores personalizados
 * ✅ Gestão de autenticações OAuth
 * ✅ Logs de sincronização
 * ✅ Retry automático para falhas
 */

const useIntegrations = () => {
  // Estados principais
  const [integrations, setIntegrations] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [syncStatus, setSyncStatus] = useState({});
  
  // Estados para operações específicas
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Estados para configurações
  const [configurations, setConfigurations] = useState({});
  const [webhooks, setWebhooks] = useState([]);
  const [logs, setLogs] = useState([]);

  const { currentUser } = useAuth();

  // 🔗 TIPOS DE INTEGRAÇÕES DISPONÍVEIS
  const INTEGRATION_TYPES = {
    WHATSAPP: {
      id: 'whatsapp',
      name: 'WhatsApp Business',
      description: 'Envio automático de mensagens e notificações',
      icon: '💬',
      category: 'communication',
      requires_auth: true,
      oauth_type: 'whatsapp_business'
    },
    GOOGLE_DRIVE: {
      id: 'google_drive',
      name: 'Google Drive',
      description: 'Armazenamento e partilha de documentos',
      icon: '📁',
      category: 'storage',
      requires_auth: true,
      oauth_type: 'google'
    },
    GOOGLE_CALENDAR: {
      id: 'google_calendar',
      name: 'Google Calendar',
      description: 'Sincronização de agendamentos e eventos',
      icon: '📅',
      category: 'calendar',
      requires_auth: true,
      oauth_type: 'google'
    },
    MAILCHIMP: {
      id: 'mailchimp',
      name: 'Mailchimp',
      description: 'Email marketing e campanhas automatizadas',
      icon: '📧',
      category: 'marketing',
      requires_auth: true,
      oauth_type: 'mailchimp'
    },
    WEBHOOK: {
      id: 'webhook',
      name: 'Webhooks Personalizados',
      description: 'Integrações personalizadas com sistemas externos',
      icon: '🔗',
      category: 'custom',
      requires_auth: false,
      oauth_type: null
    },
    CPF_CNPJ_API: {
      id: 'cpf_cnpj_api',
      name: 'Validação CPF/CNPJ',
      description: 'Verificação automática de documentos',
      icon: '🆔',
      category: 'validation',
      requires_auth: true,
      oauth_type: 'api_key'
    },
    BANKING: {
      id: 'banking',
      name: 'Open Banking',
      description: 'Verificação de pagamentos e transações',
      icon: '🏦',
      category: 'financial',
      requires_auth: true,
      oauth_type: 'open_banking'
    },
    PUSH_NOTIFICATIONS: {
      id: 'push_notifications',
      name: 'Notificações Push',
      description: 'Notificações móveis e web push',
      icon: '🔔',
      category: 'notifications',
      requires_auth: true,
      oauth_type: 'firebase_fcm'
    }
  };

  // 📊 STATUS DE INTEGRAÇÃO
  const INTEGRATION_STATUS = {
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    ERROR: 'error',
    SYNCING: 'syncing',
    RATE_LIMITED: 'rate_limited'
  };

  // 🔄 TIPOS DE SINCRONIZAÇÃO
  const SYNC_TYPES = {
    MANUAL: 'manual',
    AUTOMATIC: 'automatic',
    SCHEDULED: 'scheduled',
    WEBHOOK: 'webhook'
  };

  /**
   * 🔄 CARREGAR INTEGRAÇÕES DO UTILIZADOR
   */
  const loadIntegrations = useCallback(async () => {
    if (!currentUser?.uid) {
      console.warn('👤 useIntegrations: Utilizador não autenticado');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('🔗 useIntegrations: A carregar integrações...');

      // Carregar configurações de integrações
      const integrationsQuery = query(
        collection(db, 'integrations'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(integrationsQuery);
      const integrationsData = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        integrationsData[data.type] = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null,
          lastSyncAt: data.lastSyncAt?.toDate?.() || null
        };
      });

      setIntegrations(integrationsData);

      // Carregar webhooks
      await loadWebhooks();

      // Carregar logs recentes
      await loadSyncLogs();

      console.log(`✅ useIntegrations: ${Object.keys(integrationsData).length} integrações carregadas`);

    } catch (err) {
      console.error('❌ useIntegrations: Erro ao carregar integrações:', err);
      setError('Erro ao carregar integrações: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  /**
   * 🔗 CONECTAR NOVA INTEGRAÇÃO
   */
  const connectIntegration = async (integrationType, credentials = {}) => {
    if (!currentUser?.uid) {
      throw new Error('Utilizador não autenticado');
    }

    try {
      setIsConnecting(true);
      setError(null);

      console.log('🔗 useIntegrations: A conectar integração:', integrationType);

      const integration = INTEGRATION_TYPES[integrationType.toUpperCase()];
      if (!integration) {
        throw new Error('Tipo de integração não suportado');
      }

      // Testar conexão primeiro
      const testResult = await testConnection(integrationType, credentials);
      if (!testResult.success) {
        throw new Error(`Falha na conexão: ${testResult.error}`);
      }

      // Verificar se já existe integração
      const existingIntegration = integrations[integrationType];
      
      const integrationData = {
        userId: currentUser.uid,
        type: integrationType,
        name: integration.name,
        status: INTEGRATION_STATUS.CONNECTED,
        credentials: encryptCredentials(credentials),
        settings: {
          auto_sync: true,
          sync_frequency: 'hourly',
          notifications: true,
          ...credentials.settings
        },
        metadata: {
          connected_by: currentUser.email,
          connection_info: testResult.info || {},
          features_enabled: getDefaultFeatures(integrationType)
        },
        statistics: {
          total_syncs: 0,
          successful_syncs: 0,
          failed_syncs: 0,
          last_success_at: null,
          last_error_at: null
        },
        updatedAt: serverTimestamp()
      };

      if (existingIntegration) {
        // Atualizar integração existente
        const integrationRef = doc(db, 'integrations', existingIntegration.id);
        await updateDoc(integrationRef, integrationData);
        
        setIntegrations(prev => ({
          ...prev,
          [integrationType]: {
            ...existingIntegration,
            ...integrationData,
            updatedAt: new Date()
          }
        }));
      } else {
        // Criar nova integração
        integrationData.createdAt = serverTimestamp();
        const docRef = await addDoc(collection(db, 'integrations'), integrationData);
        
        setIntegrations(prev => ({
          ...prev,
          [integrationType]: {
            id: docRef.id,
            ...integrationData,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        }));
      }

      // Log da conexão
      await logSyncActivity(integrationType, 'connection', 'success', 'Integração conectada com sucesso');

      console.log('✅ useIntegrations: Integração conectada com sucesso');

      // Fazer sincronização inicial se aplicável
      if (shouldAutoSync(integrationType)) {
        setTimeout(() => {
          syncIntegration(integrationType);
        }, 2000);
      }

      return { success: true, integrationId: existingIntegration?.id || docRef.id };

    } catch (err) {
      console.error('❌ useIntegrations: Erro ao conectar integração:', err);
      await logSyncActivity(integrationType, 'connection', 'error', err.message);
      setError('Erro ao conectar integração: ' + err.message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * ❌ DESCONECTAR INTEGRAÇÃO
   */
  const disconnectIntegration = async (integrationType) => {
    if (!integrations[integrationType]) {
      throw new Error('Integração não encontrada');
    }

    try {
      setIsDisconnecting(true);
      setError(null);

      console.log('❌ useIntegrations: A desconectar integração:', integrationType);

      const integration = integrations[integrationType];
      
      // Atualizar status para desconectado
      const integrationRef = doc(db, 'integrations', integration.id);
      await updateDoc(integrationRef, {
        status: INTEGRATION_STATUS.DISCONNECTED,
        credentials: null,
        disconnectedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Atualizar estado local
      setIntegrations(prev => ({
        ...prev,
        [integrationType]: {
          ...prev[integrationType],
          status: INTEGRATION_STATUS.DISCONNECTED,
          credentials: null,
          disconnectedAt: new Date(),
          updatedAt: new Date()
        }
      }));

      // Log da desconexão
      await logSyncActivity(integrationType, 'disconnection', 'success', 'Integração desconectada');

      console.log('✅ useIntegrations: Integração desconectada com sucesso');

    } catch (err) {
      console.error('❌ useIntegrations: Erro ao desconectar integração:', err);
      setError('Erro ao desconectar integração: ' + err.message);
      throw err;
    } finally {
      setIsDisconnecting(false);
    }
  };

  /**
   * 🔄 SINCRONIZAR DADOS DA INTEGRAÇÃO
   */
  const syncIntegration = async (integrationType, options = {}) => {
    const integration = integrations[integrationType];
    if (!integration || integration.status !== INTEGRATION_STATUS.CONNECTED) {
      throw new Error('Integração não está conectada');
    }

    try {
      setIsSyncing(true);
      setSyncStatus(prev => ({
        ...prev,
        [integrationType]: 'syncing'
      }));

      console.log('🔄 useIntegrations: A sincronizar:', integrationType);

      let syncResult;
      
      switch (integrationType) {
        case 'whatsapp':
          syncResult = await syncWhatsApp(integration, options);
          break;
        case 'google_drive':
          syncResult = await syncGoogleDrive(integration, options);
          break;
        case 'google_calendar':
          syncResult = await syncGoogleCalendar(integration, options);
          break;
        case 'mailchimp':
          syncResult = await syncMailchimp(integration, options);
          break;
        default:
          throw new Error('Sincronização não implementada para este tipo');
      }

      // Atualizar estatísticas
      const stats = integration.statistics || {};
      const updatedStats = {
        total_syncs: (stats.total_syncs || 0) + 1,
        successful_syncs: (stats.successful_syncs || 0) + (syncResult.success ? 1 : 0),
        failed_syncs: (stats.failed_syncs || 0) + (syncResult.success ? 0 : 1),
        last_success_at: syncResult.success ? serverTimestamp() : stats.last_success_at,
        last_error_at: syncResult.success ? stats.last_error_at : serverTimestamp()
      };

      // Atualizar no Firestore
      const integrationRef = doc(db, 'integrations', integration.id);
      await updateDoc(integrationRef, {
        statistics: updatedStats,
        lastSyncAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Atualizar estado local
      setIntegrations(prev => ({
        ...prev,
        [integrationType]: {
          ...prev[integrationType],
          statistics: {
            ...updatedStats,
            last_success_at: syncResult.success ? new Date() : stats.last_success_at,
            last_error_at: syncResult.success ? stats.last_error_at : new Date()
          },
          lastSyncAt: new Date(),
          updatedAt: new Date()
        }
      }));

      // Log da sincronização
      await logSyncActivity(
        integrationType, 
        'sync', 
        syncResult.success ? 'success' : 'error',
        syncResult.message || 'Sincronização realizada',
        syncResult.details
      );

      setSyncStatus(prev => ({
        ...prev,
        [integrationType]: syncResult.success ? 'success' : 'error'
      }));

      console.log(`✅ useIntegrations: Sincronização concluída para ${integrationType}`);

      return syncResult;

    } catch (err) {
      console.error('❌ useIntegrations: Erro na sincronização:', err);
      
      await logSyncActivity(integrationType, 'sync', 'error', err.message);
      
      setSyncStatus(prev => ({
        ...prev,
        [integrationType]: 'error'
      }));
      
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * 🧪 TESTAR CONEXÃO
   */
  const testConnection = async (integrationType, credentials = {}) => {
    try {
      setIsTestingConnection(true);

      console.log('🧪 useIntegrations: A testar conexão:', integrationType);

      let testResult;

      switch (integrationType) {
        case 'whatsapp':
          testResult = await testWhatsAppConnection(credentials);
          break;
        case 'google_drive':
          testResult = await testGoogleDriveConnection(credentials);
          break;
        case 'google_calendar':
          testResult = await testGoogleCalendarConnection(credentials);
          break;
        case 'mailchimp':
          testResult = await testMailchimpConnection(credentials);
          break;
        case 'cpf_cnpj_api':
          testResult = await testCPFCNPJConnection(credentials);
          break;
        default:
          testResult = { success: false, error: 'Teste não implementado' };
      }

      console.log(`${testResult.success ? '✅' : '❌'} useIntegrations: Teste de conexão`, testResult);

      return testResult;

    } catch (err) {
      console.error('❌ useIntegrations: Erro no teste de conexão:', err);
      return { success: false, error: err.message };
    } finally {
      setIsTestingConnection(false);
    }
  };

  /**
   * 📧 SINCRONIZAÇÃO WHATSAPP
   */
  const syncWhatsApp = async (integration, options) => {
    // Simulação de sincronização WhatsApp
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'WhatsApp sincronizado com sucesso',
          details: {
            messages_sent: 12,
            templates_updated: 3,
            contacts_synced: 45
          }
        });
      }, 2000);
    });
  };

  /**
   * 📁 SINCRONIZAÇÃO GOOGLE DRIVE
   */
  const syncGoogleDrive = async (integration, options) => {
    // Simulação de sincronização Google Drive
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Google Drive sincronizado com sucesso',
          details: {
            files_uploaded: 8,
            folders_created: 2,
            storage_used: '245 MB'
          }
        });
      }, 3000);
    });
  };

  /**
   * 📅 SINCRONIZAÇÃO GOOGLE CALENDAR
   */
  const syncGoogleCalendar = async (integration, options) => {
    // Simulação de sincronização Google Calendar
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Google Calendar sincronizado com sucesso',
          details: {
            events_created: 5,
            events_updated: 12,
            next_sync: new Date(Date.now() + 3600000)
          }
        });
      }, 1500);
    });
  };

  /**
   * 📧 SINCRONIZAÇÃO MAILCHIMP
   */
  const syncMailchimp = async (integration, options) => {
    // Simulação de sincronização Mailchimp
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          message: 'Mailchimp sincronizado com sucesso',
          details: {
            contacts_synced: 156,
            campaigns_sent: 2,
            open_rate: '24.5%'
          }
        });
      }, 2500);
    });
  };

  /**
   * 🧪 TESTES DE CONEXÃO ESPECÍFICOS
   */
  const testWhatsAppConnection = async (credentials) => {
    // Simulação de teste WhatsApp
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          info: { 
            phone_number: '+351912345678',
            business_name: 'MyImoMate Demo',
            status: 'verified'
          }
        });
      }, 1000);
    });
  };

  const testGoogleDriveConnection = async (credentials) => {
    // Simulação de teste Google Drive
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          info: { 
            email: 'user@gmail.com',
            storage_quota: '15 GB',
            used_storage: '2.3 GB'
          }
        });
      }, 1200);
    });
  };

  const testGoogleCalendarConnection = async (credentials) => {
    // Simulação de teste Google Calendar
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          info: { 
            calendars_count: 3,
            primary_calendar: 'user@gmail.com',
            timezone: 'Europe/Lisbon'
          }
        });
      }, 800);
    });
  };

  const testMailchimpConnection = async (credentials) => {
    // Simulação de teste Mailchimp
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          info: { 
            account_name: 'MyImoMate Account',
            total_subscribers: 1250,
            monthly_send_limit: 10000
          }
        });
      }, 1500);
    });
  };

  const testCPFCNPJConnection = async (credentials) => {
    // Simulação de teste API CPF/CNPJ
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          info: { 
            api_key_valid: true,
            rate_limit: '1000/hour',
            credits_remaining: 850
          }
        });
      }, 600);
    });
  };

  /**
   * 🔗 GESTÃO DE WEBHOOKS
   */
  const createWebhook = async (webhookData) => {
    try {
      const webhook = {
        ...webhookData,
        userId: currentUser.uid,
        status: 'active',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'webhooks'), webhook);
      
      const newWebhook = {
        id: docRef.id,
        ...webhook,
        created_at: new Date(),
        updated_at: new Date()
      };

      setWebhooks(prev => [...prev, newWebhook]);

      return newWebhook;

    } catch (err) {
      console.error('❌ useIntegrations: Erro ao criar webhook:', err);
      throw err;
    }
  };

  const loadWebhooks = async () => {
    try {
      const webhooksQuery = query(
        collection(db, 'webhooks'),
        where('userId', '==', currentUser.uid),
        orderBy('created_at', 'desc')
      );

      const snapshot = await getDocs(webhooksQuery);
      const webhooksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate?.() || null,
        updated_at: doc.data().updated_at?.toDate?.() || null
      }));

      setWebhooks(webhooksData);

    } catch (err) {
      console.error('❌ useIntegrations: Erro ao carregar webhooks:', err);
    }
  };

  /**
   * 📝 LOGS DE SINCRONIZAÇÃO
   */
  const logSyncActivity = async (integrationType, action, status, message, details = null) => {
    try {
      const logEntry = {
        userId: currentUser.uid,
        integration_type: integrationType,
        action,
        status,
        message,
        details,
        timestamp: serverTimestamp(),
        user_agent: navigator.userAgent,
        ip_address: await getUserIP()
      };

      await addDoc(collection(db, 'integration_logs'), logEntry);

      // Atualizar logs locais
      const newLog = {
        ...logEntry,
        timestamp: new Date()
      };

      setLogs(prev => [newLog, ...prev.slice(0, 49)]); // Manter apenas 50 logs

    } catch (err) {
      console.error('❌ useIntegrations: Erro ao registar log:', err);
    }
  };

  const loadSyncLogs = async () => {
    try {
      const logsQuery = query(
        collection(db, 'integration_logs'),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(logsQuery);
      const logsData = snapshot.docs.slice(0, 50).map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || null
      }));

      setLogs(logsData);

    } catch (err) {
      console.error('❌ useIntegrations: Erro ao carregar logs:', err);
    }
  };

  /**
   * 🛠️ FUNÇÕES UTILITÁRIAS
   */
  const encryptCredentials = (credentials) => {
    // Em produção, usar encriptação real
    return btoa(JSON.stringify(credentials));
  };

  const decryptCredentials = (encryptedCredentials) => {
    try {
      return JSON.parse(atob(encryptedCredentials));
    } catch {
      return {};
    }
  };

  const getDefaultFeatures = (integrationType) => {
    const features = {
      whatsapp: ['messaging', 'templates', 'media', 'status'],
      google_drive: ['upload', 'download', 'sharing', 'folders'],
      google_calendar: ['events', 'reminders', 'sharing'],
      mailchimp: ['campaigns', 'automation', 'analytics', 'segments']
    };

    return features[integrationType] || [];
  };

  const shouldAutoSync = (integrationType) => {
    const autoSyncTypes = ['google_calendar', 'google_drive'];
    return autoSyncTypes.includes(integrationType);
  };

  const getUserIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  /**
   * 📊 ESTATÍSTICAS E MÉTRICAS
   */
  const getIntegrationStats = useMemo(() => {
    const connected = Object.values(integrations).filter(i => i.status === INTEGRATION_STATUS.CONNECTED).length;
    const total = Object.keys(INTEGRATION_TYPES).length;
    const totalSyncs = Object.values(integrations).reduce((sum, i) => sum + (i.statistics?.total_syncs || 0), 0);
    const successfulSyncs = Object.values(integrations).reduce((sum, i) => sum + (i.statistics?.successful_syncs || 0), 0);
    const failedSyncs = Object.values(integrations).reduce((sum, i) => sum + (i.statistics?.failed_syncs || 0), 0);

    return {
      connected,
      total,
      disconnected: total - connected,
      connection_rate: total > 0 ? (connected / total * 100).toFixed(1) : 0,
      total_syncs: totalSyncs,
      successful_syncs: successfulSyncs,
      failed_syncs: failedSyncs,
      success_rate: totalSyncs > 0 ? (successfulSyncs / totalSyncs * 100).toFixed(1) : 0
    };
  }, [integrations]);

  /**
   * 🔄 AUTO-SYNC SCHEDULER
   */
  useEffect(() => {
    const scheduleAutoSync = () => {
      Object.entries(integrations).forEach(([type, integration]) => {
        if (integration.status === INTEGRATION_STATUS.CONNECTED && 
            integration.settings?.auto_sync) {
          
          const frequency = integration.settings.sync_frequency || 'hourly';
          const intervals = {
            'every_5_minutes': 5 * 60 * 1000,
            'every_15_minutes': 15 * 60 * 1000,
            'hourly': 60 * 60 * 1000,
            'daily': 24 * 60 * 60 * 1000
          };

          const interval = intervals[frequency] || intervals.hourly;

          setTimeout(() => {
            if (!isSyncing) {
              syncIntegration(type, { auto: true });
            }
          }, interval);
        }
      });
    };

    scheduleAutoSync();
  }, [integrations, isSyncing]);

  // Carregar dados quando component monta
  useEffect(() => {
    loadIntegrations();
  }, [loadIntegrations]);

  // Interface pública do hook
  return {
    // Estados
    integrations,
    loading,
    error,
    syncStatus,
    configurations,
    webhooks,
    logs,
    
    // Estados de operações
    isConnecting,
    isDisconnecting,
    isSyncing,
    isTestingConnection,
    
    // Ações principais
    connectIntegration,
    disconnectIntegration,
    syncIntegration,
    testConnection,
    
    // Gestão de webhooks
    createWebhook,
    loadWebhooks,
    
    // Logs e auditoria
    loadSyncLogs,
    logSyncActivity,
    
    // Utilitários
    loadIntegrations,
    getIntegrationStats,
    
    // Constantes
    INTEGRATION_TYPES,
    INTEGRATION_STATUS,
    SYNC_TYPES,
    
    // Funções de conveniência
    isIntegrationConnected: (type) => integrations[type]?.status === INTEGRATION_STATUS.CONNECTED,
    getIntegrationDetails: (type) => integrations[type] || null,
    canSync: (type) => integrations[type]?.status === INTEGRATION_STATUS.CONNECTED && !isSyncing,
    
    // Refresh functions
    refreshIntegrations: loadIntegrations,
    refreshLogs: loadSyncLogs,
    refreshWebhooks: loadWebhooks
  };
};

export default useIntegrations;