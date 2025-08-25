/**
 * 🔥 FIREBASE SERVICE MULTI-TENANT - VERSÃO CORRIGIDA COM FALLBACKS
 * ================================================================
 * 
 * PRINCIPAIS MELHORIAS:
 * - ✅ Fallbacks para queries que requerem índices
 * - ✅ Retry logic com backoff exponencial  
 * - ✅ Queries simplificadas quando índices não existem
 * - ✅ Tratamento graceful de erros de Firestore
 * - ✅ Manutenção de todas as funcionalidades existentes
 */

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
    console.log('🏗️ FirebaseService Multi-Tenant inicializado');
  }

  // GESTÃO DE UTILIZADOR
  setCurrentUser(user) {
    if (user?.uid !== this.currentUser?.uid) {
      this.clearCache();
      this.clearAllListeners();
      this.currentUser = user;
      console.log(`👤 Utilizador definido: ${user.email} (${user.uid})`);
    }
  }

  getCurrentUserId() {
    return this.currentUser?.uid || null;
  }

  // REFERÊNCIAS FIREBASE - Multi-tenant
  getUserCollection() {
    if (!this.currentUser) {
      throw new Error('Utilizador não autenticado');
    }
    return collection(db, 'users', this.currentUser.uid);
  }

  getUserSubcollection(subcollectionName) {
    if (!VALID_SUBCOLLECTIONS.includes(subcollectionName)) {
      throw new Error(`Subcoleção inválida: ${subcollectionName}`);
    }
    return collection(this.getUserCollection(), subcollectionName);
  }

  getUserDocument(subcollectionName, documentId) {
    return doc(this.getUserSubcollection(subcollectionName), documentId);
  }

  // UTILITIES
  generateCacheKey(subcollectionName, options = {}) {
    const key = `${this.currentUser.uid}_${subcollectionName}_${JSON.stringify(options)}`;
    return key;
  }

  /**
   * SLEEP FUNCTION PARA RETRY LOGIC
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * VERIFICAR SE É ERRO DE ÍNDICE
   */
  isIndexError(error) {
    return error.code === 'failed-precondition' || 
           error.message?.includes('requires an index') ||
           error.message?.includes('composite index');
  }

  /**
   * CRIAR QUERY SIMPLES SEM ÍNDICE (FALLBACK)
   */
  buildFallbackQuery(subcollectionRef, options) {
    const { includeInactive = false, limitCount = CONFIG.DEFAULT_LIMIT } = options;
    
    let queryRef = subcollectionRef;
    
    // Aplicar apenas filtro básico de isActive (não requer índice composto)
    if (!includeInactive) {
      queryRef = query(queryRef, where('isActive', '==', true));
    }

    // Aplicar limite sem ordenação (evita necessidade de índice)
    if (limitCount) {
      queryRef = query(queryRef, limit(Math.min(limitCount, CONFIG.MAX_LIMIT)));
    }

    return queryRef;
  }

  /**
   * CRIAR QUERY COMPLETA (COM POSSIBILIDADE DE FALHAR)
   */
  buildComplexQuery(subcollectionRef, options) {
    const {
      whereClause = [],
      orderByClause = [],
      limitCount = CONFIG.DEFAULT_LIMIT,
      includeInactive = false,
      startAfterDoc = null
    } = options;

    let queryRef = subcollectionRef;
    
    // FILTRO ATIVO POR DEFEITO
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

    return queryRef;
  }

  /**
   * EXECUTAR QUERY COM FALLBACK E RETRY
   */
  async executeQueryWithFallback(subcollectionRef, options, attempt = 1) {
    try {
      // Tentar query completa primeiro
      const complexQuery = this.buildComplexQuery(subcollectionRef, options);
      const snapshot = await getDocs(complexQuery);
      
      console.log(`✅ Query completa executada com sucesso (tentativa ${attempt})`);
      return {
        snapshot,
        queryType: 'complex'
      };

    } catch (error) {
      console.warn(`⚠️ Query completa falhou (tentativa ${attempt}):`, error.message);

      // Se for erro de índice e fallback estiver ativo
      if (this.isIndexError(error) && CONFIG.FALLBACK_ENABLED) {
        console.log('🔄 Tentando query simplificada (fallback)...');
        
        try {
          const fallbackQuery = this.buildFallbackQuery(subcollectionRef, options);
          const snapshot = await getDocs(fallbackQuery);
          
          console.log('✅ Query simplificada executada com sucesso');
          return {
            snapshot,
            queryType: 'fallback',
            fallbackReason: 'missing_index'
          };

        } catch (fallbackError) {
          console.error('❌ Query simplificada também falhou:', fallbackError.message);
          
          // Se ainda assim falhar e temos mais tentativas
          if (attempt < CONFIG.RETRY_ATTEMPTS) {
            const delay = CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1); // Backoff exponencial
            console.log(`🔄 Aguardando ${delay}ms antes da próxima tentativa...`);
            await this.sleep(delay);
            return this.executeQueryWithFallback(subcollectionRef, options, attempt + 1);
          }
          
          throw fallbackError;
        }
      }

      // Se não for erro de índice ou fallback desativado, tentar retry
      if (attempt < CONFIG.RETRY_ATTEMPTS) {
        const delay = CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`🔄 Retry ${attempt}/${CONFIG.RETRY_ATTEMPTS} em ${delay}ms...`);
        await this.sleep(delay);
        return this.executeQueryWithFallback(subcollectionRef, options, attempt + 1);
      }
      
      throw error;
    }
  }

  /**
   * CRIAR DOCUMENTO
   */
  async createDocument(subcollectionName, data) {
    if (!this.currentUser) {
      throw new Error('Utilizador não autenticado');
    }

    try {
      const subcollectionRef = this.getUserSubcollection(subcollectionName);
      
      const enrichedData = {
        ...data,
        userId: this.currentUser.uid,
        userEmail: this.currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: this.currentUser.uid,
        lastModifiedBy: this.currentUser.uid,
        isActive: data.hasOwnProperty('isActive') ? data.isActive : true,
        structureVersion: '3.0'
      };

      const docRef = await addDoc(subcollectionRef, enrichedData);
      
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
   * LER DOCUMENTOS - Com fallbacks robustos
   */
  async readDocuments(subcollectionName, options = {}) {
    if (!this.currentUser) {
      throw new Error('Utilizador não autenticado');
    }

    try {
      const {
        useCache = true,
        limitCount = CONFIG.DEFAULT_LIMIT
      } = options;

      // Verificar cache primeiro
      const cacheKey = this.generateCacheKey(subcollectionName, options);
      if (useCache && this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < CONFIG.CACHE_TTL) {
          console.log(`💾 Cache hit: ${subcollectionName}`);
          return cached.data;
        }
      }

      const subcollectionRef = this.getUserSubcollection(subcollectionName);
      
      // Executar query com fallback automático
      const { snapshot, queryType, fallbackReason } = await this.executeQueryWithFallback(
        subcollectionRef, 
        options
      );
      
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || null,
        updatedAt: doc.data().updatedAt?.toDate() || null
      }));

      // Ordenação manual se usámos fallback
      if (queryType === 'fallback' && documents.length > 0) {
        documents.sort((a, b) => {
          const dateA = a.createdAt || new Date(0);
          const dateB = b.createdAt || new Date(0);
          return dateB.getTime() - dateA.getTime(); // Desc
        });

        // Aplicar limite manual
        if (options.limitCount && documents.length > options.limitCount) {
          documents.splice(options.limitCount);
        }
      }

      const result = {
        success: true,
        data: documents,
        count: documents.length,
        hasMore: snapshot.docs.length === limitCount,
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        queryInfo: {
          type: queryType,
          fallbackReason: fallbackReason || null,
          subcollection: subcollectionName
        }
      };

      // Armazenar em cache
      if (useCache) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }

      const statusEmoji = queryType === 'fallback' ? '🔄' : '📖';
      console.log(`${statusEmoji} Lidos ${documents.length} documentos de ${subcollectionName} (${queryType})`);
      
      return result;

    } catch (error) {
      console.error(`❌ Erro ao ler documentos ${subcollectionName}:`, error);
      
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
      
      const existingDoc = await this.readDocument(subcollectionName, documentId);
      if (!existingDoc.success) {
        return existingDoc;
      }

      if (hardDelete) {
        await deleteDoc(docRef);
        console.log(`🗑️ Documento eliminado permanentemente: ${subcollectionName}/${documentId}`);
      } else {
        const softDeleteData = {
          isActive: false,
          deletedAt: serverTimestamp(),
          deletedBy: this.currentUser.uid
        };
        
        await updateDoc(docRef, softDeleteData);
        console.log(`🗑️ Documento desativado: ${subcollectionName}/${documentId}`);
      }
      
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
              createdAt: serverTimestamp(),
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
      
      // Invalidar caches relevantes
      const subcollections = [...new Set(operations.map(op => op.subcollection))];
      subcollections.forEach(sub => this.invalidateCache(sub));
      
      console.log(`✅ Operação em lote executada: ${operations.length} operações`);
      
      return { success: true };

    } catch (error) {
      console.error('❌ Erro em operação batch:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * SUBSCREVER A COLEÇÃO (REAL-TIME)
   */
  subscribeToCollection(subcollectionName, callback, options = {}) {
    if (!this.currentUser) {
      throw new Error('Utilizador não autenticado');
    }

    try {
      const subcollectionRef = this.getUserSubcollection(subcollectionName);
      
      // Para subscriptions, usar query simplificada para evitar problemas de índice
      const simpleQuery = this.buildFallbackQuery(subcollectionRef, options);
      
      const listenerId = `${subcollectionName}_${Date.now()}`;
      
      const unsubscribe = onSnapshot(
        simpleQuery,
        (snapshot) => {
          const documents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || null,
            updatedAt: doc.data().updatedAt?.toDate() || null
          }));

          // Ordenação manual
          documents.sort((a, b) => {
            const dateA = a.createdAt || new Date(0);
            const dateB = b.createdAt || new Date(0);
            return dateB.getTime() - dateA.getTime();
          });

          console.log(`🔔 Atualização em tempo real: ${subcollectionName} (${documents.length})`);
          
          callback({
            success: true,
            data: documents,
            count: documents.length,
            queryInfo: {
              type: 'realtime_fallback',
              subcollection: subcollectionName
            }
          });
        },
        (error) => {
          console.error(`❌ Erro na subscription ${subcollectionName}:`, error);
          callback({
            success: false,
            error: error.message,
            data: [],
            count: 0
          });
        }
      );

      this.listeners.set(listenerId, unsubscribe);
      console.log(`👂 Listener ativo: ${listenerId}`);
      
      return listenerId;

    } catch (error) {
      console.error(`❌ Erro ao criar subscription ${subcollectionName}:`, error);
      throw error;
    }
  }

  // MÉTODOS DE GESTÃO DE CACHE E LISTENERS (inalterados)
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

  /**
   * DIAGNÓSTICO E DEBUG
   */
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
        queryInfo: result.queryInfo || {},
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
      version: '3.0-MULTI-TENANT-FALLBACK',
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

// EXPORTS - Versão limpa sem duplicações
export default firebaseService;
export { firebaseService, useFirebaseService, createCRUDHelpers, SUBCOLLECTIONS };