// src/utils/FirebaseService.js
// FIREBASE SERVICE MULTI-TENANT DEFINITIVO - MyImoMate 3.0
// ========================================================
// Solução definitiva para arquitetura multi-tenant enterprise
// Substitui completamente a versão anterior com isolamento total
// Data: Agosto 2025 | Versão: 3.0 Multi-Tenant FINAL

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
  runTransaction,
  startAfter,
  endBefore
} from 'firebase/firestore';

import { db } from '../config/firebase';

// CONFIGURAÇÕES E CONSTANTES
export const SUBCOLLECTIONS = {
  // Core CRM modules - ISOLADOS por utilizador
  LEADS: 'leads',
  CLIENTS: 'clients', 
  OPPORTUNITIES: 'opportunities',
  DEALS: 'deals',
  VISITS: 'visits',
  TASKS: 'tasks',
  
  // Analytics e relatórios - PRIVADOS
  REPORTS: 'reports',
  ANALYTICS: 'analytics',
  ACTIVITY_LOGS: 'activity_logs',
  
  // Automações e integrações - PESSOAIS
  AUTOMATIONS: 'automations',
  INTEGRATIONS: 'integrations',
  WEBHOOKS: 'webhooks',
  
  // Calendário e agendamento - INDIVIDUAIS  
  CALENDAR_EVENTS: 'calendar_events',
  REMINDERS: 'reminders',
  
  // Configurações e templates - CUSTOMIZADAS
  USER_SETTINGS: 'user_settings',
  TEMPLATES: 'templates',
  NOTIFICATIONS: 'notifications'
};

export const CONFIG = {
  CACHE_TTL: 5 * 60 * 1000, // 5 minutos
  DEFAULT_LIMIT: 25,
  MAX_LIMIT: 100,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  BATCH_SIZE: 500
};

// CLASSE PRINCIPAL FIREBASE SERVICE
class FirebaseService {
  constructor() {
    this.currentUser = null;
    this.cache = new Map();
    this.listeners = new Map();
    this.retryQueue = new Map();
    
    console.log('🏗️ FirebaseService Multi-Tenant inicializado');
  }

  // GESTÃO DE UTILIZADOR
  setCurrentUser(user) {
    if (!user) {
      this.currentUser = null;
      this.clearCache();
      this.clearAllListeners();
      console.log('👤 Utilizador removido - cache e listeners limpos');
      return;
    }

    if (this.currentUser?.uid !== user.uid) {
      this.currentUser = user;
      this.clearCache();
      this.clearAllListeners();
      console.log(`👤 Utilizador definido: ${user.email} (${user.uid})`);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // REFERÊNCIAS DE SUBCOLEÇÕES ISOLADAS
  getUserSubcollection(subcollectionName) {
    if (!this.currentUser) {
      throw new Error('FirebaseService: Utilizador não definido. Faça login primeiro.');
    }

    if (!Object.values(SUBCOLLECTIONS).includes(subcollectionName)) {
      throw new Error(`FirebaseService: Subcoleção inválida: ${subcollectionName}`);
    }

    // ISOLAMENTO TOTAL: users/{userId}/{subcollection}
    const userDocRef = doc(db, 'users', this.currentUser.uid);
    return collection(userDocRef, subcollectionName);
  }

  getUserDocument(subcollectionName, documentId) {
    const subcollectionRef = this.getUserSubcollection(subcollectionName);
    return doc(subcollectionRef, documentId);
  }

  // OPERAÇÕES CRUD PRINCIPAIS
  
  /**
   * CRIAR DOCUMENTO - Com isolamento multi-tenant
   */
  async createDocument(subcollectionName, data) {
    if (!this.currentUser) {
      throw new Error('Utilizador não autenticado');
    }

    try {
      const subcollectionRef = this.getUserSubcollection(subcollectionName);
      
      // DADOS ENRIQUECIDOS COM METADADOS MULTI-TENANT
      const enrichedData = {
        ...data,
        // Metadados obrigatórios para isolamento
        userId: this.currentUser.uid,
        userEmail: this.currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: data.isActive !== undefined ? data.isActive : true,
        // Versão da estrutura para migrações futuras
        structureVersion: '3.0'
      };

      const docRef = await addDoc(subcollectionRef, enrichedData);
      
      // Invalidar cache
      this.invalidateCache(subcollectionName);
      
      console.log(`✅ Documento criado: ${subcollectionName}/${docRef.id}`);
      
      return {
        success: true,
        id: docRef.id,
        data: { id: docRef.id, ...enrichedData }
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
   * LER DOCUMENTOS - Com filtros e paginação
   */
  async readDocuments(subcollectionName, options = {}) {
    if (!this.currentUser) {
      throw new Error('Utilizador não autenticado');
    }

    try {
      const {
        whereClause = [],
        orderByClause = [],
        limitCount = CONFIG.DEFAULT_LIMIT,
        includeInactive = false,
        startAfterDoc = null,
        useCache = true
      } = options;

      // Verificar cache primeiro (se solicitado)
      const cacheKey = this.generateCacheKey(subcollectionName, options);
      if (useCache && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CONFIG.CACHE_TTL) {
          console.log(`💾 Cache hit: ${subcollectionName}`);
          return cached.data;
        }
      }

      let queryRef = this.getUserSubcollection(subcollectionName);
      
      // FILTRO ATIVO POR DEFEITO (isolamento + performance)
      if (!includeInactive) {
        queryRef = query(queryRef, where('isActive', '==', true));
      }

      // APLICAR FILTROS WHERE
      whereClause.forEach(([field, operator, value]) => {
        queryRef = query(queryRef, where(field, operator, value));
      });

      // APLICAR ORDENAÇÃO
      if (orderByClause.length > 0) {
        orderByClause.forEach(([field, direction = 'desc']) => {
          queryRef = query(queryRef, orderBy(field, direction));
        });
      } else {
        // Ordenação padrão por data de criação
        queryRef = query(queryRef, orderBy('createdAt', 'desc'));
      }

      // APLICAR LIMITE
      if (limitCount) {
        queryRef = query(queryRef, limit(Math.min(limitCount, CONFIG.MAX_LIMIT)));
      }

      // PAGINAÇÃO
      if (startAfterDoc) {
        queryRef = query(queryRef, startAfter(startAfterDoc));
      }

      const snapshot = await getDocs(queryRef);
      
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Converter timestamps para objetos Date
        createdAt: doc.data().createdAt?.toDate() || null,
        updatedAt: doc.data().updatedAt?.toDate() || null
      }));

      const result = {
        success: true,
        data: documents,
        count: documents.length,
        hasMore: snapshot.docs.length === limitCount,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null
      };

      // Armazenar em cache
      if (useCache) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      console.log(`📖 Lidos ${documents.length} documentos de ${subcollectionName}`);
      
      return result;

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
   * LER DOCUMENTO ÚNICO
   */
  async readDocument(subcollectionName, documentId) {
    if (!this.currentUser) {
      throw new Error('Utilizador não autenticado');
    }

    try {
      const docRef = this.getUserDocument(subcollectionName, documentId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return {
          success: false,
          error: 'Documento não encontrado'
        };
      }

      const data = docSnap.data();
      
      // Verificar se pertence ao utilizador atual
      if (data.userId !== this.currentUser.uid) {
        return {
          success: false,
          error: 'Acesso negado: documento não pertence ao utilizador'
        };
      }

      const document = {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || null,
        updatedAt: data.updatedAt?.toDate() || null
      };

      console.log(`📄 Documento lido: ${subcollectionName}/${documentId}`);
      
      return {
        success: true,
        data: document
      };

    } catch (error) {
      console.error(`❌ Erro ao ler documento ${subcollectionName}/${documentId}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * ATUALIZAR DOCUMENTO
   */
  async updateDocument(subcollectionName, documentId, updates) {
    if (!this.currentUser) {
      throw new Error('Utilizador não autenticado');
    }

    try {
      const docRef = this.getUserDocument(subcollectionName, documentId);
      
      // Verificar se documento existe e pertence ao utilizador
      const existingDoc = await this.readDocument(subcollectionName, documentId);
      if (!existingDoc.success) {
        return existingDoc;
      }

      const updateData = {
        ...updates,
        updatedAt: serverTimestamp(),
        lastModifiedBy: this.currentUser.uid
      };

      await updateDoc(docRef, updateData);
      
      // Invalidar cache
      this.invalidateCache(subcollectionName);
      
      console.log(`🔄 Documento atualizado: ${subcollectionName}/${documentId}`);
      
      return {
        success: true,
        id: documentId,
        data: updateData
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
   * ELIMINAR DOCUMENTO (soft delete por defeito)
   */
  async deleteDocument(subcollectionName, documentId, hardDelete = false) {
    if (!this.currentUser) {
      throw new Error('Utilizador não autenticado');
    }

    try {
      const docRef = this.getUserDocument(subcollectionName, documentId);
      
      // Verificar se documento existe e pertence ao utilizador
      const existingDoc = await this.readDocument(subcollectionName, documentId);
      if (!existingDoc.success) {
        return existingDoc;
      }

      if (hardDelete) {
        // Eliminação permanente
        await deleteDoc(docRef);
        console.log(`🗑️ Documento eliminado permanentemente: ${subcollectionName}/${documentId}`);
      } else {
        // Soft delete - apenas desativar
        const softDeleteData = {
          isActive: false,
          deletedAt: serverTimestamp(),
          deletedBy: this.currentUser.uid
        };
        
        await updateDoc(docRef, softDeleteData);
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

  /**
   * CONTAR DOCUMENTOS
   */
  async countDocuments(subcollectionName, whereClause = [], includeInactive = false) {
    const result = await this.readDocuments(subcollectionName, {
      whereClause,
      includeInactive,
      limitCount: CONFIG.MAX_LIMIT,
      useCache: false
    });

    return {
      success: result.success,
      count: result.success ? result.count : 0,
      error: result.error
    };
  }

  /**
   * OPERAÇÕES EM LOTE (BATCH)
   */
  async batchOperation(operations) {
    if (!this.currentUser) {
      throw new Error('Utilizador não autenticado');
    }

    try {
      const batch = writeBatch(db);
      
      operations.forEach(({ type, subcollection, id, data }) => {
        const docRef = id ? 
          this.getUserDocument(subcollection, id) : 
          doc(this.getUserSubcollection(subcollection));

        switch (type) {
          case 'create':
            batch.set(docRef, {
              ...data,
              userId: this.currentUser.uid,
              userEmail: this.currentUser.email,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              isActive: true
            });
            break;
          case 'update':
            batch.update(docRef, {
              ...data,
              updatedAt: serverTimestamp(),
              lastModifiedBy: this.currentUser.uid
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      });

      await batch.commit();
      
      // Invalidar cache para todas as subcoleções afetadas
      const affectedCollections = [...new Set(operations.map(op => op.subcollection))];
      affectedCollections.forEach(coll => this.invalidateCache(coll));
      
      console.log(`✅ Operação em lote concluída: ${operations.length} operações`);
      
      return {
        success: true,
        operationsCount: operations.length
      };

    } catch (error) {
      console.error('❌ Erro na operação em lote:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // LISTENERS EM TEMPO REAL
  subscribeToCollection(subcollectionName, callback, options = {}) {
    if (!this.currentUser) {
      throw new Error('Utilizador não autenticado');
    }

    try {
      const {
        whereClause = [],
        orderByClause = [],
        limitCount = CONFIG.DEFAULT_LIMIT,
        includeInactive = false
      } = options;

      let queryRef = this.getUserSubcollection(subcollectionName);
      
      if (!includeInactive) {
        queryRef = query(queryRef, where('isActive', '==', true));
      }

      whereClause.forEach(([field, operator, value]) => {
        queryRef = query(queryRef, where(field, operator, value));
      });

      if (orderByClause.length > 0) {
        orderByClause.forEach(([field, direction = 'desc']) => {
          queryRef = query(queryRef, orderBy(field, direction));
        });
      } else {
        queryRef = query(queryRef, orderBy('createdAt', 'desc'));
      }

      if (limitCount) {
        queryRef = query(queryRef, limit(Math.min(limitCount, CONFIG.MAX_LIMIT)));
      }

      const unsubscribe = onSnapshot(
        queryRef,
        (snapshot) => {
          const documents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || null,
            updatedAt: doc.data().updatedAt?.toDate() || null
          }));

          callback({
            success: true,
            data: documents,
            count: documents.length
          });
        },
        (error) => {
          console.error(`❌ Erro no listener ${subcollectionName}:`, error);
          callback({
            success: false,
            error: error.message,
            data: []
          });
        }
      );

      const listenerId = `${subcollectionName}_${Date.now()}`;
      this.listeners.set(listenerId, unsubscribe);
      
      console.log(`👂 Listener ativo: ${subcollectionName} (${listenerId})`);
      
      return listenerId;

    } catch (error) {
      console.error(`❌ Erro ao criar listener ${subcollectionName}:`, error);
      return null;
    }
  }

  // GESTÃO DE CACHE
  generateCacheKey(subcollectionName, options) {
    return `${this.currentUser.uid}_${subcollectionName}_${JSON.stringify(options)}`;
  }

  invalidateCache(subcollectionName) {
    const keysToDelete = [];
    for (const [key] of this.cache) {
      if (key.includes(`${this.currentUser.uid}_${subcollectionName}`)) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
    console.log(`💾 Cache invalidado: ${subcollectionName} (${keysToDelete.length} entradas)`);
  }

  clearCache() {
    this.cache.clear();
    console.log('💾 Cache completamente limpo');
  }

  // GESTÃO DE LISTENERS
  removeListener(listenerId) {
    if (this.listeners.has(listenerId)) {
      this.listeners.get(listenerId)();
      this.listeners.delete(listenerId);
      console.log(`🔇 Listener removido: ${listenerId}`);
    }
  }

  clearAllListeners() {
    this.listeners.forEach(unsubscribe => unsubscribe());
    this.listeners.clear();
    console.log('🔇 Todos os listeners removidos');
  }

  // DIAGNÓSTICO E DEBUG
  async diagnoseSubcollection(subcollectionName) {
    if (!this.currentUser) {
      return { error: 'Utilizador não autenticado' };
    }

    try {
      const result = await this.readDocuments(subcollectionName, {
        limitCount: 5,
        includeInactive: true,
        useCache: false
      });

      return {
        subcollection: subcollectionName,
        userId: this.currentUser.uid,
        userEmail: this.currentUser.email,
        documentsFound: result.count,
        sampleData: result.data.slice(0, 2),
        cacheSize: this.cache.size,
        activeListeners: this.listeners.size,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        subcollection: subcollectionName,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  getServiceStatus() {
    return {
      currentUser: this.currentUser ? {
        uid: this.currentUser.uid,
        email: this.currentUser.email
      } : null,
      cacheSize: this.cache.size,
      activeListeners: this.listeners.size,
      timestamp: new Date().toISOString(),
      version: '3.0-MULTI-TENANT'
    };
  }
}

// INSTÂNCIA SINGLETON
const firebaseService = new FirebaseService();

// EXPORTS
export default firebaseService;
export { firebaseService };

// HELPER HOOK PARA HOOKS
export const useFirebaseService = (user) => {
  if (user && firebaseService.currentUser?.uid !== user.uid) {
    firebaseService.setCurrentUser(user);
  }
  return firebaseService;
};

// HELPER PARA OPERAÇÕES CRUD SIMPLIFICADAS
export const createCRUDHelpers = (subcollectionName) => {
  return {
    create: (data) => firebaseService.createDocument(subcollectionName, data),
    read: (options) => firebaseService.readDocuments(subcollectionName, options),
    readOne: (id) => firebaseService.readDocument(subcollectionName, id),
    update: (id, data) => firebaseService.updateDocument(subcollectionName, id, data),
    delete: (id, hard = false) => firebaseService.deleteDocument(subcollectionName, id, hard),
    count: (where, includeInactive) => firebaseService.countDocuments(subcollectionName, where, includeInactive),
    subscribe: (callback, options) => firebaseService.subscribeToCollection(subcollectionName, callback, options)
  };
};