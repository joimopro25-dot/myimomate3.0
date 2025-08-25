// src/utils/FirebaseService.js
// FIREBASE SERVICE MULTI-TENANT - VERSÃO CORRIGIDA
// ================================================
// CORREÇÃO CRÍTICA: Referências de coleção com segmentos corretos
// MANTÉM: Todas as funcionalidades existentes (regra MESTRE)
// Data: Agosto 2025 | Versão: 3.1-FIXED

import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  writeBatch,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

// CONFIGURAÇÕES
const CONFIG = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 1000,
  CACHE_TTL: 5 * 60 * 1000, // 5 minutos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  FALLBACK_ENABLED: true
};

// CONSTANTES DE SUBCOLEÇÕES - Para compatibilidade com hooks existentes
const SUBCOLLECTIONS = {
  LEADS: 'leads',
  CLIENTS: 'clients', 
  VISITS: 'visits',
  OPPORTUNITIES: 'opportunities',
  DEALS: 'deals',
  TASKS: 'tasks',
  REPORTS: 'reports',
  ANALYTICS: 'analytics',
  AUTOMATIONS: 'automations',
  INTEGRATIONS: 'integrations',
  CALENDAR_EVENTS: 'calendar_events',
  ACTIVITY_LOGS: 'activity_logs',
  NOTIFICATIONS: 'notifications'
};

// COLEÇÕES VÁLIDAS (subcoleções do utilizador)
const VALID_SUBCOLLECTIONS = [
  'leads', 'clients', 'visits', 'opportunities', 'deals', 
  'tasks', 'reports', 'analytics', 'automations', 'integrations',
  'calendar_events', 'activity_logs', 'notifications'
];

class FirebaseService {
  constructor() {
    this.currentUser = null;
    this.cache = new Map();
    this.listeners = new Map();
    console.log('FirebaseService Multi-Tenant inicializado');
  }

  // GESTÃO DE UTILIZADOR
  setCurrentUser(user) {
    if (user?.uid !== this.currentUser?.uid) {
      this.clearCache();
      this.clearAllListeners();
      this.currentUser = user;
      console.log(`Utilizador definido: ${user?.email} (${user?.uid})`);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // CORREÇÃO CRÍTICA: REFERÊNCIA DE COLEÇÃO COM SEGMENTOS CORRETOS
  getUserCollection(subcollectionName) {
    if (!this.currentUser?.uid) {
      throw new Error('Utilizador não autenticado');
    }

    if (!VALID_SUBCOLLECTIONS.includes(subcollectionName)) {
      throw new Error(`Subcoleção inválida: ${subcollectionName}`);
    }

    // CAMINHO CORRETO: users/{uid}/{subcollection} = 3 segmentos (ímpar)
    return collection(db, 'users', this.currentUser.uid, subcollectionName);
  }

  // REFERÊNCIA DE DOCUMENTO ESPECÍFICO
  getUserDocument(subcollectionName, documentId) {
    if (!this.currentUser?.uid) {
      throw new Error('Utilizador não autenticado');
    }

    if (!VALID_SUBCOLLECTIONS.includes(subcollectionName)) {
      throw new Error(`Subcoleção inválida: ${subcollectionName}`);
    }

    // CAMINHO CORRETO: users/{uid}/{subcollection}/{docId} = 4 segmentos
    return doc(db, 'users', this.currentUser.uid, subcollectionName, documentId);
  }

  // GESTÃO DE CACHE
  getCacheKey(subcollection, options = {}) {
    const key = JSON.stringify({ subcollection, ...options });
    return `${this.currentUser?.uid || 'anonymous'}_${key}`;
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < CONFIG.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  invalidateCache(pattern = null) {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    const keysToDelete = Array.from(this.cache.keys())
      .filter(key => key.includes(pattern));
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  clearCache() {
    this.cache.clear();
    console.log('Cache completamente limpo');
  }

  // GESTÃO DE LISTENERS
  clearAllListeners() {
    this.listeners.forEach((unsubscribe, key) => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners.clear();
    console.log('Todos os listeners removidos');
  }

  // OPERAÇÕES DE DOCUMENTOS

  /**
   * CRIAR DOCUMENTO
   */
  async createDocument(subcollectionName, data) {
    if (!this.currentUser) {
      throw new Error('Utilizador não autenticado');
    }

    try {
      const collectionRef = this.getUserCollection(subcollectionName);
      
      const documentData = {
        ...data,
        userId: this.currentUser.uid,
        userEmail: this.currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      };

      const docRef = await addDoc(collectionRef, documentData);
      
      this.invalidateCache(subcollectionName);
      
      console.log(`Documento criado: ${subcollectionName}/${docRef.id}`);
      
      return {
        success: true,
        id: docRef.id,
        data: documentData
      };

    } catch (error) {
      console.error(`Erro ao criar documento ${subcollectionName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * LER DOCUMENTOS COM QUERY OTIMIZADA E FALLBACKS
   */
  async readDocuments(subcollectionName, options = {}) {
    if (!this.currentUser) {
      throw new Error('Utilizador não autenticado');
    }

    const {
      whereClause = [],
      orderByClause = [],
      limitCount = CONFIG.DEFAULT_LIMIT,
      useCache = true,
      includeInactive = false
    } = options;

    const cacheKey = this.getCacheKey(subcollectionName, options);
    
    // Verificar cache
    if (useCache) {
      const cachedData = this.getFromCache(cacheKey);
      if (cachedData) {
        console.log(`Cache hit: ${subcollectionName}`);
        return cachedData;
      }
    }

    try {
      const collectionRef = this.getUserCollection(subcollectionName);
      let q = query(collectionRef);

      // Aplicar filtros de utilizador (sempre primeiro)
      q = query(q, where('userId', '==', this.currentUser.uid));

      // Filtrar documentos ativos (se necessário)
      if (!includeInactive) {
        q = query(q, where('isActive', '==', true));
      }

      // Aplicar whereClause adicional
      if (whereClause.length > 0) {
        whereClause.forEach(([field, operator, value]) => {
          q = query(q, where(field, operator, value));
        });
      }

      // Aplicar ordenação com fallback
      if (orderByClause.length > 0) {
        try {
          orderByClause.forEach(([field, direction = 'desc']) => {
            q = query(q, orderBy(field, direction));
          });
        } catch (orderError) {
          console.warn(`Fallback: orderBy falhou para ${subcollectionName}, usando query básica`);
          // Reconstruir query sem orderBy em caso de índice não existir
          q = query(collectionRef, where('userId', '==', this.currentUser.uid));
          if (!includeInactive) {
            q = query(q, where('isActive', '==', true));
          }
          if (whereClause.length > 0) {
            whereClause.forEach(([field, operator, value]) => {
              q = query(q, where(field, operator, value));
            });
          }
        }
      }

      // Aplicar limite
      q = query(q, limit(Math.min(limitCount, CONFIG.MAX_LIMIT)));

      // Executar query
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        documents.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || null,
          updatedAt: data.updatedAt?.toDate() || null
        });
      });

      const result = {
        success: true,
        data: documents,
        count: documents.length,
        hasMore: documents.length === limitCount,
        queryInfo: {
          type: orderByClause.length > 0 ? 'ordered' : 'basic',
          subcollection: subcollectionName,
          filters: whereClause.length,
          orderBy: orderByClause.length
        }
      };

      // Armazenar no cache
      if (useCache) {
        this.setCache(cacheKey, result);
      }

      const queryType = result.queryInfo.type === 'ordered' ? 'ordenada' : 'basica';
      const statusIcon = result.queryInfo.type === 'ordered' ? '' : '';
      console.log(`${statusIcon} Lidos ${documents.length} documentos de ${subcollectionName} (${queryType})`);
      
      return result;

    } catch (error) {
      console.error(`Erro ao ler documentos ${subcollectionName}:`, error);
      
      // Retorno graceful mesmo em caso de erro total
      return {
        success: false,
        error: error.message,
        data: [],
        count: 0,
        hasMore: false,
        queryInfo: {
          type: 'failed',
          error: error.message,
          subcollection: subcollectionName
        }
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

      console.log(`Documento lido: ${subcollectionName}/${documentId}`);
      
      return {
        success: true,
        data: document
      };

    } catch (error) {
      console.error(`Erro ao ler documento ${subcollectionName}/${documentId}:`, error);
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
      
      this.invalidateCache(subcollectionName);
      
      console.log(`Documento atualizado: ${subcollectionName}/${documentId}`);
      
      return {
        success: true,
        id: documentId,
        data: updateData
      };

    } catch (error) {
      console.error(`Erro ao atualizar documento ${subcollectionName}/${documentId}:`, error);
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
      
      const existingDoc = await this.readDocument(subcollectionName, documentId);
      if (!existingDoc.success) {
        return existingDoc;
      }

      if (hardDelete) {
        await deleteDoc(docRef);
        console.log(`Documento eliminado permanentemente: ${subcollectionName}/${documentId}`);
      } else {
        const softDeleteData = {
          isActive: false,
          deletedAt: serverTimestamp(),
          deletedBy: this.currentUser.uid
        };
        
        await updateDoc(docRef, softDeleteData);
        console.log(`Documento desativado: ${subcollectionName}/${documentId}`);
      }
      
      this.invalidateCache(subcollectionName);
      
      return {
        success: true,
        id: documentId
      };

    } catch (error) {
      console.error(`Erro ao eliminar documento ${subcollectionName}/${documentId}:`, error);
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
          doc(this.getUserCollection(subcollection));

        switch (type) {
          case 'create':
            batch.set(docRef, {
              ...data,
              userId: this.currentUser.uid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              isActive: true
            });
            break;
          case 'update':
            batch.update(docRef, {
              ...data,
              updatedAt: serverTimestamp()
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
      affectedCollections.forEach(subcollection => {
        this.invalidateCache(subcollection);
      });

      console.log(`Operação em lote executada: ${operations.length} operações`);
      
      return {
        success: true,
        operations: operations.length
      };

    } catch (error) {
      console.error('Erro na operação em lote:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * SUBSCREVER A COLEÇÃO (Real-time)
   */
  subscribeToCollection(subcollectionName, callback, options = {}) {
    if (!this.currentUser) {
      throw new Error('Utilizador não autenticado');
    }

    try {
      const collectionRef = this.getUserCollection(subcollectionName);
      const {
        whereClause = [],
        orderByClause = [],
        limitCount = CONFIG.DEFAULT_LIMIT,
        includeInactive = false
      } = options;

      let q = query(collectionRef);

      // Filtro de utilizador (sempre aplicado)
      q = query(q, where('userId', '==', this.currentUser.uid));

      // Filtro de documentos ativos
      if (!includeInactive) {
        q = query(q, where('isActive', '==', true));
      }

      // Aplicar filtros adicionais
      whereClause.forEach(([field, operator, value]) => {
        q = query(q, where(field, operator, value));
      });

      // Aplicar ordenação (com fallback)
      try {
        orderByClause.forEach(([field, direction = 'desc']) => {
          q = query(q, orderBy(field, direction));
        });
      } catch (error) {
        console.warn(`Subscrição fallback para ${subcollectionName}: sem ordenação`);
      }

      // Aplicar limite
      q = query(q, limit(limitCount));

      const listenerKey = `${subcollectionName}_${Date.now()}`;
      
      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const documents = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            documents.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || null,
              updatedAt: data.updatedAt?.toDate() || null
            });
          });

          callback({
            success: true,
            data: documents,
            count: documents.length
          });
        },
        (error) => {
          console.error(`Erro na subscrição ${subcollectionName}:`, error);
          callback({
            success: false,
            error: error.message,
            data: []
          });
        }
      );

      this.listeners.set(listenerKey, unsubscribe);
      console.log(`Listener criado: ${subcollectionName}`);

      // Retornar função para cancelar subscrição
      return () => {
        unsubscribe();
        this.listeners.delete(listenerKey);
        console.log(`Listener removido: ${subcollectionName}`);
      };

    } catch (error) {
      console.error(`Erro ao criar listener ${subcollectionName}:`, error);
      callback({
        success: false,
        error: error.message,
        data: []
      });
      return () => {}; // Função vazia para evitar erros
    }
  }

  // MÉTODOS DE DEPURAÇÃO E STATUS
  getStatus() {
    return {
      isAuthenticated: !!this.currentUser,
      user: this.currentUser ? {
        uid: this.currentUser.uid,
        email: this.currentUser.email
      } : null,
      cacheSize: this.cache.size,
      activeListeners: this.listeners.size,
      timestamp: new Date().toISOString(),
      version: '3.1-FIXED-MULTI-TENANT',
      config: {
        fallbackEnabled: CONFIG.FALLBACK_ENABLED,
        retryAttempts: CONFIG.RETRY_ATTEMPTS,
        cacheRetryMs: CONFIG.CACHE_TTL
      }
    };
  }
}

// INSTÂNCIA SINGLETON
const firebaseService = new FirebaseService();

// HELPER HOOK PARA HOOKS
const useFirebaseService = (user) => {
  if (user && firebaseService.currentUser?.uid !== user.uid) {
    firebaseService.setCurrentUser(user);
  }
  return firebaseService;
};

// HELPER PARA OPERAÇÕES CRUD SIMPLIFICADAS
const createCRUDHelpers = (subcollectionName) => {
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

// EXPORTS LIMPOS
export default firebaseService;
export { firebaseService, useFirebaseService, createCRUDHelpers, SUBCOLLECTIONS };