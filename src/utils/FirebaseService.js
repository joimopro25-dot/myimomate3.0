// src/utils/FirebaseService.js
// 🏗️ FIREBASE SERVICE MULTI-TENANT - MyImoMate 3.0
// ================================================
// Serviço centralizado para operações Firebase com isolamento multi-tenant
// Data: Agosto 2025 | Versão: 3.0 Multi-Tenant

import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  increment as firestoreIncrement,
  writeBatch,
  runTransaction
} from 'firebase/firestore';

import { db } from '../config/firebase';

// 🎯 CONFIGURAÇÕES E CONSTANTES
// =============================

/**
 * 📂 SUBCOLEÇÕES ISOLADAS POR UTILIZADOR
 * Cada utilizador tem as suas próprias subcoleções dentro de users/{userId}/
 */
export const SUBCOLLECTIONS = {
  // Core CRM modules
  LEADS: 'leads',
  CLIENTS: 'clients',
  OPPORTUNITIES: 'opportunities', 
  DEALS: 'deals',
  VISITS: 'visits',
  TASKS: 'tasks',
  
  // Analytics and reporting
  REPORTS: 'reports',
  ANALYTICS: 'analytics',
  
  // Automations and integrations
  AUTOMATIONS: 'automations',
  INTEGRATIONS: 'integrations',
  
  // Calendar and scheduling
  CALENDAR_EVENTS: 'calendar_events',
  REMINDERS: 'reminders',
  
  // Logs and audit
  ACTIVITY_LOGS: 'activity_logs',
  AUTOMATION_LOGS: 'automation_logs',
  INTEGRATION_LOGS: 'integration_logs',
  
  // Notifications and communication
  NOTIFICATIONS: 'notifications',
  WEBHOOKS: 'webhooks',
  
  // Configuration
  USER_SETTINGS: 'user_settings',
  TEMPLATES: 'templates'
};

/**
 * ⚙️ CONFIGURAÇÕES DO SERVIÇO
 */
export const CONFIG = {
  CACHE_TTL: 5 * 60 * 1000, // 5 minutos
  DEFAULT_LIMIT: 25,
  MAX_LIMIT: 100,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  BATCH_SIZE: 500
};

// 🏭 CLASSE PRINCIPAL DO SERVIÇO
// ==============================

class FirebaseService {
  constructor() {
    this.currentUser = null;
    this.cache = new Map();
    this.listeners = new Map();
    
    console.log('🏗️ FirebaseService inicializado');
  }

  // 👤 GESTÃO DE UTILIZADOR
  // =======================

  /**
   * 🔐 Definir utilizador atual
   */
  setCurrentUser(user) {
    if (!user) {
      this.currentUser = null;
      this.clearCache();
      this.clearAllListeners();
      console.log('👤 Utilizador removido');
      return;
    }

    if (this.currentUser?.uid !== user.uid) {
      this.currentUser = user;
      this.clearCache();
      this.clearAllListeners();
      console.log(`👤 Utilizador definido: ${user.email} (${user.uid})`);
    }
  }

  /**
   * 📂 Obter referência para subcoleção do utilizador
   */
  getUserSubcollection(subcollectionName) {
    if (!this.currentUser) {
      throw new Error('FirebaseService: Utilizador não definido. Use setCurrentUser() primeiro.');
    }

    const userDocRef = doc(db, 'users', this.currentUser.uid);
    return collection(userDocRef, subcollectionName);
  }

  /**
   * 📝 Obter referência para documento específico na subcoleção
   */
  getUserDocument(subcollectionName, documentId) {
    if (!this.currentUser) {
      throw new Error('FirebaseService: Utilizador não definido. Use setCurrentUser() primeiro.');
    }

    const userDocRef = doc(db, 'users', this.currentUser.uid);
    const subcollectionRef = collection(userDocRef, subcollectionName);
    return doc(subcollectionRef, documentId);
  }

  // 📊 OPERAÇÕES CRUD PARA SUBCOLEÇÕES
  // =================================

  /**
   * ➕ Criar documento numa subcoleção
   */
  async createDocument(subcollectionName, data) {
    try {
      const subcollectionRef = this.getUserSubcollection(subcollectionName);
      
      // Adicionar metadados obrigatórios
      const enrichedData = {
        ...data,
        userId: this.currentUser.uid,
        userEmail: this.currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: this.currentUser.uid,
        lastModifiedBy: this.currentUser.uid,
        isActive: data.isActive !== undefined ? data.isActive : true
      };

      const docRef = await addDoc(subcollectionRef, enrichedData);
      
      // Invalidar cache
      this.invalidateCache(subcollectionName);
      
      console.log(`✅ Documento criado: ${subcollectionName}/${docRef.id}`);
      
      return {
        success: true,
        id: docRef.id,
        data: enrichedData
      };

    } catch (error) {
      console.error(`❌ Erro ao criar documento ${subcollectionName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 📖 Ler documentos de uma subcoleção
   */
  async readDocuments(subcollectionName, options = {}) {
    try {
      const {
        whereClause = [],
        orderByClause = [],
        limitCount = CONFIG.DEFAULT_LIMIT,
        includeInactive = false
      } = options;

      let queryRef = this.getUserSubcollection(subcollectionName);
      
      // Filtro de documentos ativos por defeito
      if (!includeInactive) {
        queryRef = query(queryRef, where('isActive', '==', true));
      }

      // Aplicar filtros where
      if (whereClause.length > 0) {
        whereClause.forEach(([field, operator, value]) => {
          queryRef = query(queryRef, where(field, operator, value));
        });
      }

      // Aplicar ordenação
      if (orderByClause.length > 0) {
        orderByClause.forEach(([field, direction = 'desc']) => {
          queryRef = query(queryRef, orderBy(field, direction));
        });
      } else {
        // Ordenação padrão
        queryRef = query(queryRef, orderBy('createdAt', 'desc'));
      }

      // Aplicar limite
      if (limitCount) {
        queryRef = query(queryRef, limit(Math.min(limitCount, CONFIG.MAX_LIMIT)));
      }

      const snapshot = await getDocs(queryRef);
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Converter timestamps para datas se necessário
        createdAt: doc.data().createdAt?.toDate?.() || null,
        updatedAt: doc.data().updatedAt?.toDate?.() || null
      }));

      console.log(`📖 ${documents.length} documentos lidos: ${subcollectionName}`);

      return {
        success: true,
        data: documents,
        count: documents.length,
        hasMore: documents.length === limitCount
      };

    } catch (error) {
      console.error(`❌ Erro ao ler documentos ${subcollectionName}:`, error);
      return {
        success: false,
        error: error.message,
        data: [],
        count: 0
      };
    }
  }

  /**
   * 📖 Ler um documento específico
   */
  async readDocument(subcollectionName, documentId) {
    try {
      const docRef = this.getUserDocument(subcollectionName, documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Documento não encontrado',
          data: null
        };
      }

      const data = {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.() || null,
        updatedAt: docSnap.data().updatedAt?.toDate?.() || null
      };

      console.log(`📖 Documento lido: ${subcollectionName}/${documentId}`);

      return {
        success: true,
        data: data
      };

    } catch (error) {
      console.error(`❌ Erro ao ler documento ${subcollectionName}/${documentId}:`, error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * 🔄 Atualizar documento
   */
  async updateDocument(subcollectionName, documentId, updates) {
    try {
      const docRef = this.getUserDocument(subcollectionName, documentId);
      
      const enrichedUpdates = {
        ...updates,
        updatedAt: serverTimestamp(),
        lastModifiedBy: this.currentUser.uid
      };

      await updateDoc(docRef, enrichedUpdates);
      
      // Invalidar cache
      this.invalidateCache(subcollectionName);
      
      console.log(`🔄 Documento atualizado: ${subcollectionName}/${documentId}`);
      
      return {
        success: true,
        id: documentId
      };

    } catch (error) {
      console.error(`❌ Erro ao atualizar documento ${subcollectionName}/${documentId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 🗑️ Eliminar documento (soft delete por defeito)
   */
  async deleteDocument(subcollectionName, documentId, hardDelete = false) {
    try {
      const docRef = this.getUserDocument(subcollectionName, documentId);
      
      if (hardDelete) {
        await deleteDoc(docRef);
        console.log(`🗑️ Documento eliminado permanentemente: ${subcollectionName}/${documentId}`);
      } else {
        // Soft delete
        const softDeleteUpdates = {
          isActive: false,
          deletedAt: serverTimestamp(),
          deletedBy: this.currentUser.uid
        };
        
        await updateDoc(docRef, softDeleteUpdates);
        console.log(`🗑️ Documento desativado: ${subcollectionName}/${documentId}`);
      }
      
      // Invalidar cache
      this.invalidateCache(subcollectionName);
      
      return {
        success: true,
        id: documentId
      };

    } catch (error) {
      console.error(`❌ Erro ao eliminar documento ${subcollectionName}/${documentId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 📊 OPERAÇÕES AVANÇADAS
  // ======================

  /**
   * 🔢 Contar documentos
   */
  async countDocuments(subcollectionName, whereClause = [], includeInactive = false) {
    try {
      const result = await this.readDocuments(subcollectionName, {
        whereClause,
        includeInactive,
        limitCount: CONFIG.MAX_LIMIT
      });

      return {
        success: true,
        count: result.count
      };

    } catch (error) {
      console.error(`❌ Erro ao contar documentos ${subcollectionName}:`, error);
      return {
        success: false,
        count: 0,
        error: error.message
      };
    }
  }

  /**
   * 👂 Subscrever mudanças em tempo real
   */
  async subscribeToCollection(subcollectionName, onData, onError, options = {}) {
    try {
      const {
        whereClause = [],
        orderByClause = [],
        limitCount = CONFIG.DEFAULT_LIMIT,
        includeInactive = false
      } = options;

      let queryRef = this.getUserSubcollection(subcollectionName);
      
      // Filtro de documentos ativos por defeito
      if (!includeInactive) {
        queryRef = query(queryRef, where('isActive', '==', true));
      }

      // Aplicar filtros where
      if (whereClause.length > 0) {
        whereClause.forEach(([field, operator, value]) => {
          queryRef = query(queryRef, where(field, operator, value));
        });
      }

      // Aplicar ordenação
      if (orderByClause.length > 0) {
        orderByClause.forEach(([field, direction = 'desc']) => {
          queryRef = query(queryRef, orderBy(field, direction));
        });
      } else {
        queryRef = query(queryRef, orderBy('createdAt', 'desc'));
      }

      // Aplicar limite
      if (limitCount) {
        queryRef = query(queryRef, limit(Math.min(limitCount, CONFIG.MAX_LIMIT)));
      }

      const unsubscribe = onSnapshot(
        queryRef,
        (snapshot) => {
          const documents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || null,
            updatedAt: doc.data().updatedAt?.toDate?.() || null
          }));

          console.log(`👂 Dados atualizados: ${subcollectionName} (${documents.length} docs)`);
          onData(documents);
        },
        (error) => {
          console.error(`❌ Erro na subscrição ${subcollectionName}:`, error);
          if (onError) onError(error);
        }
      );

      // Guardar referência do listener
      const listenerId = `${subcollectionName}_${Date.now()}`;
      this.listeners.set(listenerId, unsubscribe);
      
      console.log(`👂 Listener criado: ${listenerId}`);
      
      return unsubscribe;

    } catch (error) {
      console.error(`❌ Erro ao criar subscrição ${subcollectionName}:`, error);
      if (onError) onError(error);
    }
  }

  /**
   * ⚡ Operações em lote
   */
  async batchOperation(operations) {
    try {
      const batch = writeBatch(db);
      
      for (const operation of operations) {
        const { type, subcollectionName, documentId, data } = operation;
        
        switch (type) {
          case 'create':
            const createRef = this.getUserDocument(subcollectionName, documentId);
            batch.set(createRef, {
              ...data,
              userId: this.currentUser.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            break;
            
          case 'update':
            const updateRef = this.getUserDocument(subcollectionName, documentId);
            batch.update(updateRef, {
              ...data,
              updatedAt: serverTimestamp()
            });
            break;
            
          case 'delete':
            const deleteRef = this.getUserDocument(subcollectionName, documentId);
            batch.update(deleteRef, {
              isActive: false,
              deletedAt: serverTimestamp()
            });
            break;
        }
      }
      
      await batch.commit();
      
      console.log(`⚡ ${operations.length} operações em lote concluídas`);
      
      return {
        success: true,
        operationsCount: operations.length
      };

    } catch (error) {
      console.error(`❌ Erro em operações lote:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 🛠️ UTILIDADES
  // =============

  /**
   * 🔢 Incrementar valor
   */
  increment(value = 1) {
    return firestoreIncrement(value);
  }

  /**
   * ⏰ Timestamp do servidor
   */
  timestamp() {
    return serverTimestamp();
  }

  // 💾 GESTÃO DE CACHE
  // ==================

  /**
   * 💾 Obter do cache
   */
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  /**
   * 💾 Adicionar ao cache
   */
  addToCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * 🗑️ Invalidar cache de uma subcoleção
   */
  invalidateCache(subcollectionName) {
    const keysToDelete = [];
    
    for (const [key] of this.cache) {
      if (key.includes(`_${subcollectionName}_`)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`💾 Cache invalidado para ${subcollectionName}: ${keysToDelete.length} entradas removidas`);
  }

  /**
   * 🧹 Limpar todo o cache
   */
  clearCache() {
    this.cache.clear();
    console.log('💾 Cache completamente limpo');
  }

  // 👂 SISTEMA DE LISTENERS
  // ======================

  /**
   * 🔇 Remover listener
   */
  removeListener(listenerId) {
    if (this.listeners.has(listenerId)) {
      this.listeners.get(listenerId)();
      this.listeners.delete(listenerId);
      console.log(`🔇 Listener removido: ${listenerId}`);
    }
  }

  /**
   * 🔇 Remover todos os listeners
   */
  clearAllListeners() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
    console.log('🔇 Todos os listeners removidos');
  }

  // 🧪 UTILIDADES DE DIAGNÓSTICO
  // ============================

  /**
   * 🔍 Diagnosticar subcoleção
   */
  async diagnoseSubcollection(subcollectionName) {
    try {
      const result = await this.readDocuments(subcollectionName, {
        limitCount: 5,
        includeInactive: true
      });

      const diagnosis = {
        subcollection: subcollectionName,
        userId: this.currentUser.uid,
        totalDocuments: result.count,
        sampleDocuments: result.data,
        cacheStatus: this.cache.size > 0 ? 'active' : 'empty',
        timestamp: new Date().toISOString()
      };

      console.log(`🔍 Diagnóstico ${subcollectionName}:`, diagnosis);
      
      return diagnosis;

    } catch (error) {
      console.error(`❌ Erro no diagnóstico ${subcollectionName}:`, error);
      return {
        subcollection: subcollectionName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * 📊 Status geral do serviço
   */
  getServiceStatus() {
    return {
      currentUser: this.currentUser ? {
        uid: this.currentUser.uid,
        email: this.currentUser.email
      } : null,
      cacheSize: this.cache.size,
      activeListeners: this.listeners.size,
      timestamp: new Date().toISOString()
    };
  }
}

// 🏭 INSTÂNCIA SINGLETON
// ======================
const firebaseService = new FirebaseService();

// 🚀 EXPORTS
// ==========
export default firebaseService;

// Exports nomeados para facilitar importação
export { firebaseService };

// 🎯 HELPER FUNCTIONS PARA HOOKS
// ==============================

/**
 * 🎣 Hook helper para inicializar serviço com user
 */
export const useFirebaseService = (user) => {
  if (user && firebaseService.currentUser?.uid !== user.uid) {
    firebaseService.setCurrentUser(user);
  }
  
  return firebaseService;
};

/**
 * 📋 Helper para operações CRUD simples
 */
export const createCRUDHelpers = (subcollectionName) => {
  return {
    create: (data) => firebaseService.createDocument(subcollectionName, data),
    read: (options) => firebaseService.readDocuments(subcollectionName, options),
    readOne: (id) => firebaseService.readDocument(subcollectionName, id),
    update: (id, data) => firebaseService.updateDocument(subcollectionName, id, data),
    delete: (id, hard = false) => firebaseService.deleteDocument(subcollectionName, id, hard),
    count: (where, includeInactive) => firebaseService.countDocuments(subcollectionName, where, includeInactive)
  };
};