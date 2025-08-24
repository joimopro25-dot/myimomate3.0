// src/utils/FirebaseService.js
// 🏗️ FIREBASE SERVICE MULTI-TENANT - FOUNDATION LAYER
// =======================================================
// Sistema centralizado para gestão de subcoleções por utilizador
// Garante isolamento total de dados entre consultores
// Versão: 3.1 Multi-Tenant | Data: Agosto 2025

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
  limit,
  startAfter,
  serverTimestamp,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config/firebase';

// 🎯 ESTRUTURA MULTI-TENANT CENTRALIZADA
// =====================================

/**
 * Nomes das subcoleções por utilizador
 */
export const SUBCOLLECTIONS = {
  LEADS: 'leads',
  CLIENTS: 'clients', 
  OPPORTUNITIES: 'opportunities',
  DEALS: 'deals',
  VISITS: 'visits',
  TASKS: 'tasks',
  ACTIVITIES: 'activities',
  DOCUMENTS: 'documents',
  SETTINGS: 'settings'
};

/**
 * Configurações globais do serviço
 */
const CONFIG = {
  DEFAULT_PAGE_SIZE: 50,
  MAX_PAGE_SIZE: 100,
  BATCH_SIZE: 500,
  RETRY_ATTEMPTS: 3,
  TIMEOUT_MS: 10000
};

// 🔧 CORE FIRESTORE SERVICE CLASS
// ===============================

class FirebaseService {
  constructor() {
    this.currentUser = null;
    this.cache = new Map();
    this.listeners = new Map();
  }

  /**
   * 🔐 Definir utilizador atual (obrigatório para todas as operações)
   */
  setCurrentUser(user) {
    if (!user || !user.uid) {
      throw new Error('FirebaseService: utilizador inválido');
    }
    
    this.currentUser = user;
    console.log(`🔐 FirebaseService: Utilizador definido: ${user.uid}`);
    
    // Limpar cache quando mudar utilizador
    this.cache.clear();
    this.clearAllListeners();
  }

  /**
   * 📁 Obter referência para subcoleção do utilizador
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
        isActive: data.isActive !== undefined ? data.isActive : true,
        structureVersion: '3.1'
      };

      const docRef = await addDoc(subcollectionRef, enrichedData);
      
      console.log(`➕ Documento criado em ${subcollectionName}: ${docRef.id}`);
      
      // Invalidar cache
      this.invalidateCache(subcollectionName);
      
      return {
        success: true,
        id: docRef.id,
        data: { ...enrichedData, id: docRef.id }
      };

    } catch (error) {
      console.error(`❌ Erro ao criar em ${subcollectionName}:`, error);
      throw new Error(`Falha ao criar documento: ${error.message}`);
    }
  }

  /**
   * 📖 Ler documentos de uma subcoleção
   */
  async readDocuments(subcollectionName, options = {}) {
    try {
      const {
        orderBy: orderByField = 'createdAt',
        orderDirection = 'desc',
        limitCount = CONFIG.DEFAULT_PAGE_SIZE,
        where: whereConditions = [],
        startAfterDoc = null,
        includeInactive = false
      } = options;

      // Verificar cache primeiro
      const cacheKey = this.getCacheKey(subcollectionName, options);
      if (this.cache.has(cacheKey)) {
        console.log(`💾 Cache hit para ${subcollectionName}`);
        return this.cache.get(cacheKey);
      }

      const subcollectionRef = this.getUserSubcollection(subcollectionName);
      
      // Construir query
      let q = query(subcollectionRef);

      // Filtro por ativo (se não especificado incluir inativos)
      if (!includeInactive) {
        q = query(q, where('isActive', '==', true));
      }

      // Adicionar condições where personalizadas
      whereConditions.forEach(condition => {
        q = query(q, where(condition.field, condition.operator, condition.value));
      });

      // Ordenação
      q = query(q, orderBy(orderByField, orderDirection));

      // Limite
      if (limitCount && limitCount > 0) {
        q = query(q, limit(Math.min(limitCount, CONFIG.MAX_PAGE_SIZE)));
      }

      // Paginação
      if (startAfterDoc) {
        q = query(q, startAfter(startAfterDoc));
      }

      const snapshot = await getDocs(q);
      const documents = [];

      snapshot.forEach(doc => {
        documents.push({
          id: doc.id,
          ...doc.data(),
          // Converter timestamps para dates se necessário
          createdAt: doc.data().createdAt?.toDate() || null,
          updatedAt: doc.data().updatedAt?.toDate() || null
        });
      });

      console.log(`📖 Lidos ${documents.length} documentos de ${subcollectionName}`);

      // Cache resultado
      const result = {
        success: true,
        data: documents,
        count: documents.length,
        hasMore: documents.length === limitCount
      };

      this.cache.set(cacheKey, result);
      
      return result;

    } catch (error) {
      console.error(`❌ Erro ao ler ${subcollectionName}:`, error);
      throw new Error(`Falha ao ler documentos: ${error.message}`);
    }
  }

  /**
   * 📖 Ler documento específico
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
        createdAt: docSnap.data().createdAt?.toDate() || null,
        updatedAt: docSnap.data().updatedAt?.toDate() || null
      };

      console.log(`📖 Documento lido: ${subcollectionName}/${documentId}`);

      return {
        success: true,
        data
      };

    } catch (error) {
      console.error(`❌ Erro ao ler documento ${subcollectionName}/${documentId}:`, error);
      throw new Error(`Falha ao ler documento: ${error.message}`);
    }
  }

  /**
   * ✏️ Atualizar documento
   */
  async updateDocument(subcollectionName, documentId, updates) {
    try {
      const docRef = this.getUserDocument(subcollectionName, documentId);
      
      // Adicionar metadados de atualização
      const enrichedUpdates = {
        ...updates,
        updatedAt: serverTimestamp(),
        lastModifiedBy: this.currentUser.uid
      };

      await updateDoc(docRef, enrichedUpdates);
      
      console.log(`✏️ Documento atualizado: ${subcollectionName}/${documentId}`);
      
      // Invalidar cache
      this.invalidateCache(subcollectionName);
      
      return {
        success: true,
        id: documentId,
        message: 'Documento atualizado com sucesso'
      };

    } catch (error) {
      console.error(`❌ Erro ao atualizar ${subcollectionName}/${documentId}:`, error);
      throw new Error(`Falha ao atualizar documento: ${error.message}`);
    }
  }

  /**
   * 🗑️ Eliminar documento (soft delete por padrão)
   */
  async deleteDocument(subcollectionName, documentId, hardDelete = false) {
    try {
      const docRef = this.getUserDocument(subcollectionName, documentId);

      if (hardDelete) {
        // Eliminação permanente
        await deleteDoc(docRef);
        console.log(`🗑️ Documento eliminado permanentemente: ${subcollectionName}/${documentId}`);
      } else {
        // Soft delete - marcar como inativo
        await updateDoc(docRef, {
          isActive: false,
          deletedAt: serverTimestamp(),
          deletedBy: this.currentUser.uid,
          updatedAt: serverTimestamp(),
          lastModifiedBy: this.currentUser.uid
        });
        console.log(`🗑️ Documento marcado como inativo: ${subcollectionName}/${documentId}`);
      }
      
      // Invalidar cache
      this.invalidateCache(subcollectionName);
      
      return {
        success: true,
        id: documentId,
        message: hardDelete ? 'Documento eliminado permanentemente' : 'Documento marcado como inativo'
      };

    } catch (error) {
      console.error(`❌ Erro ao eliminar ${subcollectionName}/${documentId}:`, error);
      throw new Error(`Falha ao eliminar documento: ${error.message}`);
    }
  }

  // 🔄 OPERAÇÕES AVANÇADAS
  // =====================

  /**
   * 📊 Contar documentos numa subcoleção
   */
  async countDocuments(subcollectionName, whereConditions = [], includeInactive = false) {
    try {
      const result = await this.readDocuments(subcollectionName, {
        where: whereConditions,
        includeInactive,
        limitCount: null // Sem limite para contar tudo
      });

      return {
        success: true,
        count: result.data.length
      };

    } catch (error) {
      console.error(`❌ Erro ao contar ${subcollectionName}:`, error);
      throw new Error(`Falha ao contar documentos: ${error.message}`);
    }
  }

  /**
   * 🔄 Operação batch (múltiplas operações numa transação)
   */
  async batchOperation(operations) {
    try {
      const batch = writeBatch(db);

      for (const operation of operations) {
        const { type, subcollectionName, documentId, data } = operation;

        switch (type) {
          case 'create':
            const createRef = doc(this.getUserSubcollection(subcollectionName));
            batch.set(createRef, {
              ...data,
              userId: this.currentUser.uid,
              userEmail: this.currentUser.email,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              createdBy: this.currentUser.uid,
              lastModifiedBy: this.currentUser.uid
            });
            break;

          case 'update':
            const updateRef = this.getUserDocument(subcollectionName, documentId);
            batch.update(updateRef, {
              ...data,
              updatedAt: serverTimestamp(),
              lastModifiedBy: this.currentUser.uid
            });
            break;

          case 'delete':
            const deleteRef = this.getUserDocument(subcollectionName, documentId);
            if (operation.hardDelete) {
              batch.delete(deleteRef);
            } else {
              batch.update(deleteRef, {
                isActive: false,
                deletedAt: serverTimestamp(),
                deletedBy: this.currentUser.uid,
                updatedAt: serverTimestamp()
              });
            }
            break;
        }
      }

      await batch.commit();
      
      console.log(`🔄 Batch de ${operations.length} operações executado com sucesso`);
      
      // Invalidar cache de todas as subcoleções afetadas
      const affectedSubcollections = [...new Set(operations.map(op => op.subcollectionName))];
      affectedSubcollections.forEach(subcol => this.invalidateCache(subcol));
      
      return {
        success: true,
        operationsCount: operations.length,
        message: 'Todas as operações executadas com sucesso'
      };

    } catch (error) {
      console.error('❌ Erro na operação batch:', error);
      throw new Error(`Falha na operação batch: ${error.message}`);
    }
  }

  /**
   * 🔄 Transação (para operações que requerem consistência)
   */
  async runTransaction(transactionFunction) {
    try {
      const result = await runTransaction(db, async (transaction) => {
        return await transactionFunction(transaction, this);
      });

      console.log('🔄 Transação executada com sucesso');
      
      return {
        success: true,
        result,
        message: 'Transação executada com sucesso'
      };

    } catch (error) {
      console.error('❌ Erro na transação:', error);
      throw new Error(`Falha na transação: ${error.message}`);
    }
  }

  // 💾 SISTEMA DE CACHE
  // ==================

  /**
   * 🔑 Gerar chave de cache
   */
  getCacheKey(subcollectionName, options) {
    return `${this.currentUser?.uid}_${subcollectionName}_${JSON.stringify(options)}`;
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
   * 👂 Adicionar listener em tempo real
   */
  addRealtimeListener(subcollectionName, callback, options = {}) {
    const listenerId = `${subcollectionName}_${Date.now()}`;
    
    // TODO: Implementar listeners em tempo real
    // Por agora, fazer polling simples
    console.log(`👂 Listener adicionado: ${listenerId}`);
    
    return listenerId;
  }

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
export {
  firebaseService,
  SUBCOLLECTIONS,
  CONFIG as FIREBASE_CONFIG
};

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