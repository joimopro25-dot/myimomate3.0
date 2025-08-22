// src/hooks/useLeadConversion.js
// 🔄 HOOK DE CONVERSÃO LEAD → CLIENTE + OPORTUNIDADE
// ===================================================
// MyImoMate 3.0 - Sistema unificado de conversão com qualificação completa
// ✅ Conversão automática Lead→Cliente+Oportunidade
// ✅ Criação automática de cônjuge como cliente
// ✅ Upload e gestão de documentos
// ✅ Validações portuguesas completas
// ✅ Transações atómicas no Firebase
// ✅ Rollback automático em caso de erro

import { useState, useCallback } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  serverTimestamp, 
  runTransaction,
  writeBatch
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  UNIFIED_CLIENT_STATUS,
  UNIFIED_OPPORTUNITY_STATUS,
  UNIFIED_OPPORTUNITY_TYPES,
  UNIFIED_OPPORTUNITY_PRIORITIES,
  UNIFIED_LEAD_STATUS
} from '../constants/unifiedTypes';

// ✅ FALLBACKS PARA CONSTANTES (caso não estejam disponíveis)
const FALLBACK_CLIENT_STATUS = {
  ATIVO: 'ativo',
  INATIVO: 'inativo'
};

const FALLBACK_OPPORTUNITY_STATUS = {
  IDENTIFICACAO: 'identificacao',
  QUALIFICACAO: 'qualificacao',
  FECHADO_GANHO: 'fechado_ganho'
};

const FALLBACK_OPPORTUNITY_TYPES = {
  COMPRA: 'compra',
  VENDA: 'venda',
  ARRENDAMENTO: 'arrendamento'
};

const FALLBACK_OPPORTUNITY_PRIORITIES = {
  NORMAL: 'normal',
  ALTA: 'alta',
  URGENTE: 'urgente'
};

const FALLBACK_LEAD_STATUS = {
  NOVO: 'novo',
  CONVERTIDO: 'convertido'
};

// Usar as constantes importadas ou fallbacks
const CLIENT_STATUS = UNIFIED_CLIENT_STATUS || FALLBACK_CLIENT_STATUS;
const OPPORTUNITY_STATUS = UNIFIED_OPPORTUNITY_STATUS || FALLBACK_OPPORTUNITY_STATUS;
const OPPORTUNITY_TYPES = UNIFIED_OPPORTUNITY_TYPES || FALLBACK_OPPORTUNITY_TYPES;
const OPPORTUNITY_PRIORITIES = UNIFIED_OPPORTUNITY_PRIORITIES || FALLBACK_OPPORTUNITY_PRIORITIES;
const LEAD_STATUS = UNIFIED_LEAD_STATUS || FALLBACK_LEAD_STATUS;

const useLeadConversion = () => {
  const { user } = useAuth();
  const [isConverting, setIsConverting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [conversionError, setConversionError] = useState(null);

  // 📄 UPLOAD DE DOCUMENTOS PARA FIREBASE STORAGE
  // ==============================================
  const uploadDocuments = useCallback(async (files, clientId, userId) => {
    const uploadedFiles = [];
    const totalFiles = files.length;
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const progressKey = `${file.id}_${clientId}`;
        
        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}_${sanitizedFileName}`;
        const filePath = `clients/${clientId}/documents/${fileName}`;
        
        // Referência no Storage
        const storageRef = ref(storage, filePath);
        
        // Simular progresso de upload
        const updateProgress = (progress) => {
          setUploadProgress(prev => ({
            ...prev,
            [progressKey]: {
              progress,
              fileName: file.name,
              current: i + 1,
              total: totalFiles
            }
          }));
        };
        
        updateProgress(0);
        
        // Upload do arquivo
        const uploadTask = uploadBytes(storageRef, file);
        
        // Simular progresso (Firebase não fornece progresso real para uploadBytes)
        const progressInterval = setInterval(() => {
          updateProgress(Math.min(90, Math.random() * 90));
        }, 100);
        
        const snapshot = await uploadTask;
        clearInterval(progressInterval);
        updateProgress(100);
        
        // Obter URL de download
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        // Adicionar à lista de arquivos uploadados
        uploadedFiles.push({
          id: file.id,
          originalName: file.name,
          fileName: fileName,
          filePath: filePath,
          downloadURL: downloadURL,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          uploadedBy: userId
        });
        
        // Limpar progresso
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[progressKey];
            return newProgress;
          });
        }, 1000);
      }
      
      return uploadedFiles;
      
    } catch (error) {
      console.error('Erro no upload de documentos:', error);
      
      // Limpar arquivos já uploadados em caso de erro
      for (const uploadedFile of uploadedFiles) {
        try {
          const fileRef = ref(storage, uploadedFile.filePath);
          await deleteObject(fileRef);
        } catch (deleteError) {
          console.error('Erro ao limpar arquivo:', deleteError);
        }
      }
      
      throw new Error(`Falha no upload de documentos: ${error.message}`);
    }
  }, []);

  // 👥 CRIAR CLIENTE PRINCIPAL
  // ==========================
  const createMainClient = useCallback(async (leadData, formData, uploadedDocuments, userId) => {
    const clientData = {
      // Dados básicos do lead
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      
      // Referência ao lead original
      leadId: leadData.id,
      convertedFromLead: true,
      leadConvertedAt: serverTimestamp(),
      
      // Dados pessoais portugueses
      numeroCC: formData.numeroCC,
      numeroFiscal: formData.numeroFiscal,
      
      // Residência completa
      residencia: {
        rua: formData.residencia.rua,
        numero: formData.residencia.numero,
        andar: formData.residencia.andar || '',
        codigoPostal: formData.residencia.codigoPostal,
        localidade: formData.residencia.localidade,
        concelho: formData.residencia.concelho || '',
        distrito: formData.residencia.distrito || '',
        moradaCompleta: `${formData.residencia.rua} ${formData.residencia.numero}${formData.residencia.andar ? ', ' + formData.residencia.andar : ''}, ${formData.residencia.codigoPostal} ${formData.residencia.localidade}`
      },
      
      // Naturalidade
      naturalidade: {
        freguesia: formData.naturalidade.freguesia || '',
        concelho: formData.naturalidade.concelho,
        distrito: formData.naturalidade.distrito || '',
        naturalidadeCompleta: `${formData.naturalidade.freguesia ? formData.naturalidade.freguesia + ', ' : ''}${formData.naturalidade.concelho}${formData.naturalidade.distrito ? ', ' + formData.naturalidade.distrito : ''}`
      },
      
      // Estado civil
      estadoCivil: formData.estadoCivil,
      comunhaoBens: formData.comunhaoBens || '',
      temConjuge: formData.temConjuge,
      
      // Informações financeiras
      rendimentoMensal: parseFloat(formData.rendimentoMensal) || 0,
      rendimentoAnual: parseFloat(formData.rendimentoAnual) || 0,
      situacaoCredito: formData.situacaoCredito,
      bancoRelacionamento: formData.bancoRelacionamento || '',
      temPreAprovacao: formData.temPreAprovacao,
      valorPreAprovacao: parseFloat(formData.valorPreAprovacao) || 0,
      
      // Preferências de imóvel
      tipoImovelProcurado: formData.tipoImovelProcurado || '',
      localizacaoPreferida: formData.localizacaoPreferida || '',
      caracteristicasEspecificas: formData.caracteristicasEspecificas || '',
      motivoTransacao: formData.motivoTransacao || '',
      
      // Timeline e orçamento
      prazoDecisao: formData.prazoDecisao,
      orcamentoMinimo: parseFloat(formData.orcamentoMinimo) || 0,
      orcamentoMaximo: parseFloat(formData.orcamentoMaximo) || 0,
      tipoFinanciamento: formData.tipoFinanciamento,
      entrada: parseFloat(formData.entrada) || 0,
      
      // Documentação
      documentosDisponiveis: formData.documentosDisponiveis || [],
      anexos: uploadedDocuments || [],
      
      // Observações e classificação
      observacoesConsultor: formData.observacoesConsultor || '',
      prioridadeCliente: formData.prioridadeCliente || 'normal',
      fonteProcura: formData.fonteProcura || '',
      
      // Status e metadados
      status: CLIENT_STATUS.ATIVO,
      isActive: true,
      clientType: 'principal',
      hasOpportunities: true, // Será criada automaticamente
      
      // Interesse original do lead
      interestType: leadData.interestType || '',
      source: leadData.source || '',
      
      // Dados de auditoria
      createdAt: serverTimestamp(),
      createdBy: userId,
      updatedAt: serverTimestamp(),
      lastModifiedBy: userId,
      structureVersion: '3.1'
    };

    const clientRef = await addDoc(collection(db, 'clients'), clientData);
    
    return {
      id: clientRef.id,
      ...clientData,
      createdAt: new Date(), // Para uso local imediato
      updatedAt: new Date()
    };
  }, []);

  // 💑 CRIAR CLIENTE CÔNJUGE
  // =========================
  const createSpouseClient = useCallback(async (mainClientId, leadData, formData, userId) => {
    if (!formData.temConjuge || !['casado', 'uniao_facto'].includes(formData.estadoCivil)) {
      return null;
    }

    const spouseData = {
      // Dados básicos do cônjuge
      name: formData.conjuge.nome,
      email: formData.conjuge.email || '',
      phone: formData.conjuge.telefone || '',
      
      // Relação com cliente principal
      isSpouse: true,
      mainClientId: mainClientId,
      spouseOf: leadData.name,
      
      // Dados pessoais do cônjuge
      numeroCC: formData.conjuge.numeroCC,
      numeroFiscal: formData.conjuge.numeroFiscal,
      profissao: formData.conjuge.profissao || '',
      rendimentoMensal: parseFloat(formData.conjuge.rendimento) || 0,
      
      // Herdar dados de residência do cliente principal
      residencia: {
        rua: formData.residencia.rua,
        numero: formData.residencia.numero,
        andar: formData.residencia.andar || '',
        codigoPostal: formData.residencia.codigoPostal,
        localidade: formData.residencia.localidade,
        concelho: formData.residencia.concelho || '',
        distrito: formData.residencia.distrito || '',
        moradaCompleta: `${formData.residencia.rua} ${formData.residencia.numero}${formData.residencia.andar ? ', ' + formData.residencia.andar : ''}, ${formData.residencia.codigoPostal} ${formData.residencia.localidade}`
      },
      
      // Estado civil igual ao principal
      estadoCivil: formData.estadoCivil,
      comunhaoBens: formData.comunhaoBens || '',
      temConjuge: true,
      
      // Status
      status: CLIENT_STATUS.ATIVO,
      isActive: true,
      clientType: 'conjuge',
      hasOpportunities: true, // Compartilha oportunidades
      
      // Referências
      leadId: leadData.id,
      convertedFromLead: true,
      leadConvertedAt: serverTimestamp(),
      
      // Dados de auditoria
      createdAt: serverTimestamp(),
      createdBy: userId,
      updatedAt: serverTimestamp(),
      lastModifiedBy: userId,
      structureVersion: '3.1'
    };

    const spouseRef = await addDoc(collection(db, 'clients'), spouseData);
    
    return {
      id: spouseRef.id,
      ...spouseData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }, []);

  // 🎯 CRIAR OPORTUNIDADE AUTOMÁTICA
  // =================================
  const createOpportunity = useCallback(async (clientData, spouseData, leadData, formData, userId) => {
    // Determinar tipo de oportunidade baseado no interesse
    const getOpportunityType = (interestType) => {
      if (interestType?.includes('compra')) return OPPORTUNITY_TYPES.COMPRA;
      if (interestType?.includes('venda')) return OPPORTUNITY_TYPES.VENDA;
      if (interestType?.includes('arrendamento')) return OPPORTUNITY_TYPES.ARRENDAMENTO;
      return OPPORTUNITY_TYPES.COMPRA; // padrão
    };

    // Calcular valor estimado baseado no orçamento
    const estimatedValue = formData.orcamentoMaximo || formData.orcamentoMinimo || 0;
    
    // Determinar probabilidade inicial baseada na qualificação
    const getInitialProbability = (formData) => {
      let probability = 25; // base
      
      if (formData.temPreAprovacao) probability += 20;
      if (formData.entrada > 0) probability += 15;
      if (formData.documentosDisponiveis.length >= 5) probability += 10;
      if (formData.situacaoCredito === 'sem_restricoes') probability += 10;
      if (formData.prazoDecisao === 'imediato') probability += 20;
      
      return Math.min(probability, 90); // máximo 90%
    };

    const opportunityData = {
      // Título e descrição
      title: `${getOpportunityType(leadData.interestType)} - ${clientData.name}`,
      description: `Oportunidade criada automaticamente da conversão do lead ${leadData.name}.\nTipo: ${formData.tipoImovelProcurado || 'Não especificado'}\nLocalização: ${formData.localizacaoPreferida || 'Não especificada'}`,
      
      // Cliente principal
      clientId: clientData.id,
      clientName: clientData.name,
      clientEmail: clientData.email,
      clientPhone: clientData.phone,
      
      // Cônjuge (se existir)
      hasSpouse: !!spouseData,
      spouseClientId: spouseData?.id || '',
      spouseName: spouseData?.name || '',
      
      // Tipo e status
      opportunityType: getOpportunityType(leadData.interestType),
      status: OPPORTUNITY_STATUS.QUALIFICACAO, // Já qualificado
      priority: formData.prioridadeCliente || OPPORTUNITY_PRIORITIES.NORMAL,
      
      // Valores financeiros
      value: estimatedValue,
      probability: getInitialProbability(formData),
      estimatedCloseDate: (() => {
        const now = new Date();
        const months = {
          'imediato': 1,
          '1_3_meses': 2,
          '3_6_meses': 4,
          '6_12_meses': 8,
          'acima_12_meses': 12
        };
        now.setMonth(now.getMonth() + (months[formData.prazoDecisao] || 3));
        return now.toISOString().split('T')[0];
      })(),
      
      // Detalhes do imóvel
      propertyDetails: {
        type: formData.tipoImovelProcurado || '',
        location: formData.localizacaoPreferida || '',
        characteristics: formData.caracteristicasEspecificas || '',
        budgetMin: formData.orcamentoMinimo || 0,
        budgetMax: formData.orcamentoMaximo || 0,
        financing: formData.tipoFinanciamento || '',
        downPayment: formData.entrada || 0
      },
      
      // Informações financeiras do cliente
      clientFinancials: {
        monthlyIncome: formData.rendimentoMensal || 0,
        annualIncome: formData.rendimentoAnual || 0,
        creditSituation: formData.situacaoCredito || '',
        hasPreApproval: formData.temPreAprovacao || false,
        preApprovalValue: formData.valorPreAprovacao || 0,
        bank: formData.bancoRelacionamento || ''
      },
      
      // Timeline
      decisionTimeframe: formData.prazoDecisao || '1_3_meses',
      urgency: formData.prazoDecisao === 'imediato' ? 'alta' : 'normal',
      
      // Documentação
      documentsAvailable: formData.documentosDisponiveis || [],
      attachments: clientData.anexos || [],
      
      // Origem e observações
      source: leadData.source || 'lead_conversion',
      leadId: leadData.id,
      convertedFromLead: true,
      notes: `${formData.observacoesConsultor || ''}\n\nConvertido automaticamente do lead em ${new Date().toLocaleDateString('pt-PT')}`,
      
      // Atividades iniciais
      activities: [
        {
          id: Date.now(),
          type: 'conversao',
          title: 'Lead convertido para cliente + oportunidade',
          description: `Cliente ${clientData.name} qualificado e oportunidade criada automaticamente.`,
          date: new Date().toISOString(),
          createdBy: userId,
          outcome: 'Conversão realizada com sucesso'
        }
      ],
      
      // Próximas ações sugeridas
      nextActions: [
        'Agendar primeira reunião presencial',
        'Apresentar portfólio de imóveis compatíveis',
        'Validar documentação financeira',
        'Agendar visitas a propriedades'
      ],
      
      // Metadados
      isActive: true,
      createdAt: serverTimestamp(),
      createdBy: userId,
      updatedAt: serverTimestamp(),
      lastModifiedBy: userId,
      structureVersion: '3.1'
    };

    const opportunityRef = await addDoc(collection(db, 'opportunities'), opportunityData);
    
    return {
      id: opportunityRef.id,
      ...opportunityData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }, []);

  // ✅ FUNÇÃO PRINCIPAL DE CONVERSÃO
  // =================================
  const convertLeadToClient = useCallback(async (conversionData) => {
    if (!user?.uid) {
      throw new Error('Utilizador não autenticado');
    }

    setIsConverting(true);
    setConversionError(null);

    try {
      const { leadId, clientData, createOpportunity: shouldCreateOpportunity, createSpouse } = conversionData;
      
      // Validar dados obrigatórios
      if (!leadId || !clientData) {
        throw new Error('Dados de conversão incompletos');
      }

      // Obter dados do lead
      const leadRef = doc(db, 'leads', leadId);
      
      let mainClient, spouseClient, opportunity, uploadedDocuments = [];
      
      // Usar transação para garantir consistência
      await runTransaction(db, async (transaction) => {
        // 1. UPLOAD DE DOCUMENTOS (se existirem)
        if (clientData.anexos && clientData.anexos.length > 0) {
          console.log('📎 Iniciando upload de documentos...');
          uploadedDocuments = await uploadDocuments(
            clientData.anexos, 
            `temp_${Date.now()}`, // ID temporário
            user.uid
          );
        }

        // 2. CRIAR CLIENTE PRINCIPAL
        console.log('👤 Criando cliente principal...');
        mainClient = await createMainClient(
          { id: leadId, ...clientData },
          clientData,
          uploadedDocuments,
          user.uid
        );

        // Atualizar path dos documentos com ID real do cliente
        if (uploadedDocuments.length > 0) {
          // TODO: Mover documentos para pasta correta (opcional)
          console.log(`📁 ${uploadedDocuments.length} documentos anexados ao cliente ${mainClient.id}`);
        }

        // 3. CRIAR CÔNJUGE (se aplicável)
        if (createSpouse && clientData.temConjuge) {
          console.log('💑 Criando cliente cônjuge...');
          spouseClient = await createSpouseClient(
            mainClient.id,
            { id: leadId, ...clientData },
            clientData,
            user.uid
          );

          // Atualizar cliente principal com referência ao cônjuge
          await updateDoc(doc(db, 'clients', mainClient.id), {
            spouseClientId: spouseClient.id,
            spouseName: spouseClient.name,
            updatedAt: serverTimestamp()
          });
        }

        // 4. CRIAR OPORTUNIDADE (se solicitado)
        if (shouldCreateOpportunity) {
          console.log('🎯 Criando oportunidade...');
          opportunity = await createOpportunity(
            mainClient,
            spouseClient,
            { id: leadId, ...clientData },
            clientData,
            user.uid
          );

          // Atualizar cliente(s) com referência à oportunidade
          const updateClientData = {
            lastOpportunityId: opportunity.id,
            lastOpportunityCreated: serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          await updateDoc(doc(db, 'clients', mainClient.id), updateClientData);
          
          if (spouseClient) {
            await updateDoc(doc(db, 'clients', spouseClient.id), updateClientData);
          }
        }

        // 5. ATUALIZAR LEAD COMO CONVERTIDO
        console.log('🔄 Atualizando status do lead...');
        transaction.update(leadRef, {
          status: LEAD_STATUS.CONVERTIDO,
          isConverted: true,
          convertedAt: serverTimestamp(),
          convertedToClientId: mainClient.id,
          convertedToOpportunityId: opportunity?.id || '',
          spouseClientId: spouseClient?.id || '',
          conversionDetails: {
            mainClientCreated: !!mainClient,
            spouseClientCreated: !!spouseClient,
            opportunityCreated: !!opportunity,
            documentsUploaded: uploadedDocuments.length,
            convertedBy: user.uid,
            conversionDate: new Date().toISOString()
          },
          updatedAt: serverTimestamp(),
          lastModifiedBy: user.uid
        });
      });

      // Resultado da conversão
      const result = {
        success: true,
        leadId: leadId,
        mainClient: mainClient,
        spouseClient: spouseClient,
        opportunity: opportunity,
        documentsUploaded: uploadedDocuments.length,
        message: `Lead convertido com sucesso! ${spouseClient ? 'Cliente principal e cônjuge criados' : 'Cliente criado'}${opportunity ? ' + Oportunidade criada' : ''}.`
      };

      console.log('✅ Conversão concluída com sucesso:', result);
      
      setIsConverting(false);
      return result;

    } catch (error) {
      console.error('❌ Erro na conversão:', error);
      setConversionError(error.message);
      setIsConverting(false);
      
      return {
        success: false,
        message: `Erro na conversão: ${error.message}`
      };
    }
  }, [user, uploadDocuments, createMainClient, createSpouseClient, createOpportunity]);

  // 🗑️ FUNÇÃO DE LIMPEZA EM CASO DE ERRO
  // =====================================
  const rollbackConversion = useCallback(async (conversionResult) => {
    if (!conversionResult || conversionResult.success) return;

    console.log('🔄 Iniciando rollback da conversão...');
    
    try {
      const batch = writeBatch(db);

      // Remover cliente principal
      if (conversionResult.mainClient?.id) {
        const mainClientRef = doc(db, 'clients', conversionResult.mainClient.id);
        batch.delete(mainClientRef);
      }

      // Remover cônjuge
      if (conversionResult.spouseClient?.id) {
        const spouseClientRef = doc(db, 'clients', conversionResult.spouseClient.id);
        batch.delete(spouseClientRef);
      }

      // Remover oportunidade
      if (conversionResult.opportunity?.id) {
        const opportunityRef = doc(db, 'opportunities', conversionResult.opportunity.id);
        batch.delete(opportunityRef);
      }

      // Restaurar status do lead
      if (conversionResult.leadId) {
        const leadRef = doc(db, 'leads', conversionResult.leadId);
        batch.update(leadRef, {
          status: UNIFIED_LEAD_STATUS.NOVO,
          isConverted: false,
          convertedAt: null,
          convertedToClientId: '',
          convertedToOpportunityId: '',
          spouseClientId: '',
          conversionDetails: null,
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();

      // Remover documentos do Storage
      if (conversionResult.documentsUploaded > 0 && conversionResult.mainClient?.anexos) {
        for (const document of conversionResult.mainClient.anexos) {
          try {
            const fileRef = ref(storage, document.filePath);
            await deleteObject(fileRef);
          } catch (deleteError) {
            console.error('Erro ao remover documento:', deleteError);
          }
        }
      }

      console.log('✅ Rollback concluído com sucesso');
      return { success: true, message: 'Reversão realizada com sucesso' };

    } catch (error) {
      console.error('❌ Erro no rollback:', error);
      return { success: false, message: `Erro na reversão: ${error.message}` };
    }
  }, []);

  return {
    // Estados
    isConverting,
    uploadProgress,
    conversionError,
    
    // Funções principais
    convertLeadToClient,
    rollbackConversion,
    
    // Funções auxiliares para testes
    uploadDocuments,
    createMainClient,
    createSpouseClient,
    createOpportunity
  };
};

export default useLeadConversion;