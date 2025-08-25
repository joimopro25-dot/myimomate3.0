// src/utils/migrationScript.js
// SCRIPT DE MIGRAÇÃO MULTI-TENANT DEFINITIVO
// ==========================================
// Migra dados da estrutura global para multi-tenant
// EXECUTAR UMA ÚNICA VEZ após implementar o novo FirebaseService
// Data: Agosto 2025 | Versão: 3.0 Migration

import { 
  collection, 
  getDocs, 
  doc, 
  addDoc, 
  deleteDoc, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import firebaseService from './FirebaseService';

// CONFIGURAÇÕES DE MIGRAÇÃO
const MIGRATION_CONFIG = {
  BATCH_SIZE: 500,
  DRY_RUN: true, // Alterar para false para executar migração real
  BACKUP_COLLECTIONS: true,
  DELETE_OLD_DATA: false // Alterar para true após confirmar sucesso
};

// MAPEAMENTO DE COLEÇÕES
const COLLECTIONS_TO_MIGRATE = [
  'leads',
  'clients', 
  'opportunities',
  'deals',
  'visits',
  'tasks'
];

class MigrationService {
  constructor() {
    this.results = {
      processed: 0,
      migrated: 0,
      errors: 0,
      skipped: 0,
      details: []
    };
  }

  // EXECUTAR MIGRAÇÃO COMPLETA
  async executeMigration() {
    console.log('🚀 Iniciando migração multi-tenant...');
    console.log(`🔧 Modo: ${MIGRATION_CONFIG.DRY_RUN ? 'DRY RUN (simulação)' : 'EXECUÇÃO REAL'}`);
    
    try {
      // 1. AUDITORIA INICIAL
      await this.auditCurrentData();
      
      // 2. MIGRAR CADA COLEÇÃO
      for (const collectionName of COLLECTIONS_TO_MIGRATE) {
        await this.migrateCollection(collectionName);
      }
      
      // 3. VALIDAR MIGRAÇÃO
      await this.validateMigration();
      
      // 4. RELATÓRIO FINAL
      this.generateReport();
      
      return {
        success: true,
        results: this.results
      };
      
    } catch (error) {
      console.error('❌ Erro na migração:', error);
      return {
        success: false,
        error: error.message,
        results: this.results
      };
    }
  }

  // AUDITORIA DOS DADOS ATUAIS
  async auditCurrentData() {
    console.log('🔍 Auditando dados existentes...');
    
    for (const collectionName of COLLECTIONS_TO_MIGRATE) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        console.log(`📊 ${collectionName}: ${snapshot.docs.length} documentos encontrados`);
        
        // Verificar estrutura dos documentos
        if (snapshot.docs.length > 0) {
          const sampleDoc = snapshot.docs[0].data();
          const hasUserId = 'userId' in sampleDoc;
          const hasUserEmail = 'userEmail' in sampleDoc;
          
          console.log(`   🔍 userId present: ${hasUserId}`);
          console.log(`   🔍 userEmail present: ${hasUserEmail}`);
          
          if (!hasUserId) {
            console.warn(`   ⚠️  ATENÇÃO: ${collectionName} não tem campo userId - migração necessária`);
          }
        }
        
      } catch (error) {
        console.error(`❌ Erro na auditoria de ${collectionName}:`, error);
      }
    }
  }

  // MIGRAR UMA COLEÇÃO
  async migrateCollection(collectionName) {
    console.log(`\n🔄 Migrando coleção: ${collectionName}`);
    
    try {
      // Ler todos os documentos da coleção global
      const globalCollectionRef = collection(db, collectionName);
      const snapshot = await getDocs(globalCollectionRef);
      
      if (snapshot.empty) {
        console.log(`   ✅ ${collectionName}: Nenhum documento para migrar`);
        return;
      }
      
      console.log(`   📊 ${snapshot.docs.length} documentos a migrar`);
      
      // Agrupar documentos por utilizador
      const documentsByUser = new Map();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const userId = data.userId;
        
        if (!userId) {
          console.warn(`   ⚠️  Documento ${doc.id} sem userId - será ignorado`);
          this.results.skipped++;
          return;
        }
        
        if (!documentsByUser.has(userId)) {
          documentsByUser.set(userId, []);
        }
        
        documentsByUser.get(userId).push({
          id: doc.id,
          data: {
            ...data,
            // Garantir metadados multi-tenant
            structureVersion: '3.0',
            migratedAt: serverTimestamp()
          }
        });
      });

      // Migrar documentos para subcoleções de cada utilizador
      let migratedCount = 0;
      
      for (const [userId, documents] of documentsByUser) {
        console.log(`   👤 Migrando ${documents.length} documentos para utilizador: ${userId}`);
        
        if (MIGRATION_CONFIG.DRY_RUN) {
          console.log(`   🔄 [DRY RUN] Simularia migração de ${documents.length} documentos`);
          migratedCount += documents.length;
          continue;
        }

        try {
          // Configurar FirebaseService para este utilizador
          const mockUser = { uid: userId, email: documents[0].data.userEmail || 'unknown@email.com' };
          firebaseService.setCurrentUser(mockUser);

          // Criar documentos em lote na subcoleção do utilizador
          const batch = writeBatch(db);
          const userDocRef = doc(db, 'users', userId);

          documents.forEach((document) => {
            const subcollectionRef = collection(userDocRef, collectionName);
            const newDocRef = doc(subcollectionRef, document.id);
            batch.set(newDocRef, document.data);
          });

          await batch.commit();
          migratedCount += documents.length;
          
          console.log(`   ✅ ${documents.length} documentos migrados para utilizador ${userId}`);

        } catch (error) {
          console.error(`   ❌ Erro ao migrar documentos do utilizador ${userId}:`, error);
          this.results.errors += documents.length;
        }
      }

      this.results.processed += snapshot.docs.length;
      this.results.migrated += migratedCount;
      
      console.log(`   ✅ ${collectionName}: ${migratedCount}/${snapshot.docs.length} documentos migrados`);

    } catch (error) {
      console.error(`❌ Erro ao migrar ${collectionName}:`, error);
      this.results.errors++;
    }
  }

  // VALIDAR MIGRAÇÃO
  async validateMigration() {
    console.log('\n🔍 Validando migração...');
    
    for (const collectionName of COLLECTIONS_TO_MIGRATE) {
      try {
        // Contar documentos na coleção global original
        const globalCollectionRef = collection(db, collectionName);
        const globalSnapshot = await getDocs(globalCollectionRef);
        const globalCount = globalSnapshot.docs.length;

        // Contar documentos migrados (sample de alguns utilizadores)
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        
        let migratedCount = 0;
        let checkedUsers = 0;
        const maxUsersToCheck = 5; // Limitar verificação para performance

        for (const userDoc of usersSnapshot.docs) {
          if (checkedUsers >= maxUsersToCheck) break;
          
          try {
            const userSubcollectionRef = collection(userDoc.ref, collectionName);
            const subcollectionSnapshot = await getDocs(userSubcollectionRef);
            migratedCount += subcollectionSnapshot.docs.length;
            checkedUsers++;
          } catch (error) {
            // Subcoleção pode não existir - normal
          }
        }

        console.log(`   📊 ${collectionName}: ${globalCount} originais, ~${migratedCount} migrados (amostra)`);

      } catch (error) {
        console.error(`❌ Erro na validação de ${collectionName}:`, error);
      }
    }
  }

  // LIMPAR DADOS ANTIGOS (OPCIONAL E PERIGOSO)
  async cleanupOldData() {
    if (!MIGRATION_CONFIG.DELETE_OLD_DATA) {
      console.log('🔒 Limpeza de dados antigos desabilitada (MIGRATION_CONFIG.DELETE_OLD_DATA = false)');
      return;
    }

    console.log('⚠️  ATENÇÃO: Iniciando limpeza de dados antigos...');
    console.log('⚠️  Esta operação é IRREVERSÍVEL!');
    
    // Aguardar confirmação em ambiente real
    if (!MIGRATION_CONFIG.DRY_RUN) {
      const confirmation = confirm('Tem a certeza que quer ELIMINAR os dados antigos? Esta ação é IRREVERSÍVEL!');
      if (!confirmation) {
        console.log('🛑 Limpeza cancelada pelo utilizador');
        return;
      }
    }

    for (const collectionName of COLLECTIONS_TO_MIGRATE) {
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);

        if (MIGRATION_CONFIG.DRY_RUN) {
          console.log(`🔄 [DRY RUN] Eliminaria ${snapshot.docs.length} documentos de ${collectionName}`);
          continue;
        }

        const batch = writeBatch(db);
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });

        await batch.commit();
        console.log(`🗑️  ${snapshot.docs.length} documentos eliminados de ${collectionName}`);

      } catch (error) {
        console.error(`❌ Erro ao limpar ${collectionName}:`, error);
      }
    }
  }

  // GERAR RELATÓRIO FINAL
  generateReport() {
    console.log('\n📋 RELATÓRIO DE MIGRAÇÃO');
    console.log('========================');
    console.log(`🔧 Modo: ${MIGRATION_CONFIG.DRY_RUN ? 'DRY RUN (simulação)' : 'EXECUÇÃO REAL'}`);
    console.log(`📊 Documentos processados: ${this.results.processed}`);
    console.log(`✅ Documentos migrados: ${this.results.migrated}`);
    console.log(`⏭️  Documentos ignorados: ${this.results.skipped}`);
    console.log(`❌ Erros: ${this.results.errors}`);
    console.log(`📈 Taxa de sucesso: ${((this.results.migrated / this.results.processed) * 100).toFixed(1)}%`);
    
    if (MIGRATION_CONFIG.DRY_RUN) {
      console.log('\n🔄 PRÓXIMOS PASSOS:');
      console.log('1. Revisar este relatório');
      console.log('2. Alterar MIGRATION_CONFIG.DRY_RUN = false');
      console.log('3. Executar migração real');
      console.log('4. Validar dados migrados');
      console.log('5. Opcionalmente limpar dados antigos');
    } else {
      console.log('\n✅ MIGRAÇÃO CONCLUÍDA!');
      console.log('🔍 Verificar dados no Firebase Console');
      console.log('🧪 Testar aplicação com nova arquitetura');
    }
  }
}

// FUNÇÕES AUXILIARES PARA EXECUÇÃO MANUAL

// Executar migração completa
export const executeMigration = async () => {
  const migrationService = new MigrationService();
  return await migrationService.executeMigration();
};

// Apenas auditoria (sem migração)
export const auditData = async () => {
  const migrationService = new MigrationService();
  return await migrationService.auditCurrentData();
};

// Validar migração existente
export const validateMigration = async () => {
  const migrationService = new MigrationService();
  return await migrationService.validateMigration();
};

// Limpar dados antigos (PERIGOSO)
export const cleanupOldData = async () => {
  const migrationService = new MigrationService();
  return await migrationService.cleanupOldData();
};

// INSTRUÇÕES DE USO
export const MIGRATION_INSTRUCTIONS = `
🚀 COMO EXECUTAR A MIGRAÇÃO MULTI-TENANT

1. PREPARAÇÃO:
   - Fazer backup completo da base de dados
   - Confirmar que não há utilizadores ativos
   - Rever configurações em MIGRATION_CONFIG

2. AUDITORIA (OPCIONAL):
   import { auditData } from './utils/migrationScript';
   auditData();

3. MIGRAÇÃO DRY RUN (RECOMENDADO):
   - Manter MIGRATION_CONFIG.DRY_RUN = true
   import { executeMigration } from './utils/migrationScript';
   executeMigration();

4. MIGRAÇÃO REAL:
   - Alterar MIGRATION_CONFIG.DRY_RUN = false
   executeMigration();

5. VALIDAÇÃO:
   import { validateMigration } from './utils/migrationScript';
   validateMigration();

6. LIMPEZA (OPCIONAL):
   - Alterar MIGRATION_CONFIG.DELETE_OLD_DATA = true
   import { cleanupOldData } from './utils/migrationScript';
   cleanupOldData();

⚠️  IMPORTANTE:
- Executar em ambiente de teste primeiro
- Fazer backup antes da migração real
- Validar dados após migração
- Testar aplicação completamente
`;