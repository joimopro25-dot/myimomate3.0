// src/constants/coreStructure.js
// 🎯 ESTRUTURA BASE OBRIGATÓRIA - MyImoMate 3.0
// =============================================
// Campos base que TODOS os módulos devem implementar
// Garante consistência total e rastreamento completo

// 🏗️ ESTRUTURA BASE OBRIGATÓRIA (CORE_DATA_STRUCTURE)
// ===================================================
// Campos que DEVEM existir em TODOS os registos
export const CORE_DATA_STRUCTURE = {
  // IDENTIFICAÇÃO ÚNICA (obrigatório)
  id: {
    type: 'string',
    required: true,
    description: 'ID único do registo gerado pelo Firebase'
  },
  
  // DADOS PESSOAIS BÁSICOS (obrigatórios)
  name: {
    type: 'string',
    required: true,
    minLength: 2,
    maxLength: 100,
    description: 'Nome completo da pessoa'
  },
  
  phone: {
    type: 'string',
    required: true,
    pattern: /^(\+351|351|00351)?[ -]?9[1236][0-9][ -]?[0-9]{3}[ -]?[0-9]{3}$/,
    description: 'Telefone português obrigatório'
  },
  
  email: {
    type: 'string',
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    description: 'Email válido obrigatório'
  },
  
  // DADOS DE INTERESSE (obrigatórios)
  interestType: {
    type: 'string',
    required: true,
    description: 'Tipo de interesse padronizado (de unifiedTypes)'
  },
  
  budgetRange: {
    type: 'string',
    required: true,
    description: 'Faixa de orçamento padronizada (de unifiedTypes)'
  },
  
  // METADADOS DE SISTEMA (obrigatórios)
  status: {
    type: 'string',
    required: true,
    description: 'Status específico do módulo (lead_status, client_status, etc.)'
  },
  
  priority: {
    type: 'string',
    required: false,
    default: 'normal',
    description: 'Prioridade padronizada'
  },
  
  // AUDITORIA (obrigatórios)
  createdAt: {
    type: 'timestamp',
    required: true,
    description: 'Data de criação (serverTimestamp)'
  },
  
  updatedAt: {
    type: 'timestamp',
    required: true,
    description: 'Data de última atualização'
  },
  
  userId: {
    type: 'string',
    required: true,
    description: 'ID do utilizador que criou o registo'
  },
  
  userEmail: {
    type: 'string',
    required: true,
    description: 'Email do utilizador para auditoria'
  },
  
  // REFERÊNCIAS CRUZADAS (para tracking completo)
  leadId: {
    type: 'string',
    required: false,
    description: 'Referência ao lead original (se aplicável)'
  },
  
  clientId: {
    type: 'string',
    required: false,
    description: 'Referência ao cliente (se aplicável)'
  },
  
  opportunityId: {
    type: 'string',
    required: false,
    description: 'Referência à oportunidade (se aplicável)'
  },
  
  dealId: {
    type: 'string',
    required: false,
    description: 'Referência ao negócio (se aplicável)'
  },
  
  // FLAGS DE CONTROLO
  isActive: {
    type: 'boolean',
    required: true,
    default: true,
    description: 'Registo ativo no sistema'
  },
  
  isConverted: {
    type: 'boolean',
    required: false,
    default: false,
    description: 'Foi convertido para próxima etapa'
  }
};

// 👤 ESTRUTURA DADOS PESSOAIS COMPLETOS
// =====================================
// Para clientes e leads qualificados
export const PERSONAL_DATA_STRUCTURE = {
  // DADOS BÁSICOS EXPANDIDOS
  nameFirst: {
    type: 'string',
    required: false,
    description: 'Primeiro nome'
  },
  
  nameLast: {
    type: 'string',
    required: false,
    description: 'Último nome'
  },
  
  phoneSecondary: {
    type: 'string',
    required: false,
    pattern: /^(\+351|351|00351)?[ -]?9[1236][0-9][ -]?[0-9]{3}[ -]?[0-9]{3}$/,
    description: 'Telefone secundário'
  },
  
  emailSecondary: {
    type: 'string',
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    description: 'Email secundário'
  },
  
  // DADOS FISCAIS
  nif: {
    type: 'string',
    required: false,
    pattern: /^[0-9]{9}$/,
    description: 'NIF português (9 dígitos)'
  },
  
  dateOfBirth: {
    type: 'date',
    required: false,
    description: 'Data de nascimento'
  },
  
  nationality: {
    type: 'string',
    required: false,
    default: 'Portuguesa',
    description: 'Nacionalidade'
  },
  
  maritalStatus: {
    type: 'enum',
    required: false,
    enum: ['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_facto'],
    description: 'Estado civil'
  },
  
  // DADOS DO CÔNJUGE (se aplicável)
  spouse: {
    type: 'object',
    required: false,
    structure: {
      name: { type: 'string', description: 'Nome do cônjuge' },
      nif: { type: 'string', pattern: /^[0-9]{9}$/, description: 'NIF do cônjuge' },
      dateOfBirth: { type: 'date', description: 'Data nascimento cônjuge' },
      phone: { type: 'string', description: 'Telefone do cônjuge' },
      email: { type: 'string', description: 'Email do cônjuge' }
    }
  },
  
  // DEPENDENTES
  dependents: {
    type: 'array',
    required: false,
    itemStructure: {
      name: { type: 'string', description: 'Nome do dependente' },
      dateOfBirth: { type: 'date', description: 'Data nascimento dependente' },
      relationship: { 
        type: 'enum', 
        enum: ['filho', 'filha', 'neto', 'neta', 'outro'],
        description: 'Grau parentesco' 
      }
    }
  },
  
  // MORADA COMPLETA
  address: {
    type: 'object',
    required: false,
    structure: {
      street: { type: 'string', description: 'Rua/Avenida' },
      number: { type: 'string', description: 'Número da porta' },
      floor: { type: 'string', description: 'Andar' },
      postalCode: { 
        type: 'string', 
        pattern: /^[0-9]{4}-[0-9]{3}$/,
        description: 'Código postal (1234-567)' 
      },
      city: { type: 'string', description: 'Cidade' },
      district: { type: 'string', description: 'Distrito' },
      country: { type: 'string', default: 'Portugal', description: 'País' }
    }
  },
  
  // PREFERÊNCIAS DE CONTACTO
  preferredContactTime: {
    type: 'enum',
    required: false,
    enum: Object.values(UNIFIED_CONTACT_TIMES),
    default: UNIFIED_CONTACT_TIMES.QUALQUER_HORA,
    description: 'Horário preferencial de contacto'
  },
  
  preferredContactMethod: {
    type: 'enum',
    required: false,
    enum: ['telefone', 'email', 'whatsapp', 'sms'],
    default: 'telefone',
    description: 'Método preferencial de contacto'
  }
};

// 🏠 ESTRUTURA DADOS IMOBILIÁRIOS
// ===============================
// Para oportunidades e negócios
export const PROPERTY_DATA_STRUCTURE = {
  // DADOS BÁSICOS DO IMÓVEL
  propertyType: {
    type: 'enum',
    required: false,
    enum: Object.values(UNIFIED_PROPERTY_TYPES),
    description: 'Tipo de imóvel padronizado'
  },
  
  operationType: {
    type: 'enum',
    required: false,
    enum: ['venda', 'compra', 'arrendamento', 'avaliacao'],
    description: 'Tipo de operação'
  },
  
  // LOCALIZAÇÃO
  location: {
    type: 'object',
    required: false,
    structure: {
      address: { type: 'string', description: 'Morada completa' },
      city: { type: 'string', description: 'Cidade' },
      district: { type: 'string', description: 'Distrito' },
      postalCode: { type: 'string', description: 'Código postal' },
      coordinates: {
        type: 'object',
        structure: {
          lat: { type: 'number', description: 'Latitude' },
          lng: { type: 'number', description: 'Longitude' }
        }
      }
    }
  },
  
  // CARACTERÍSTICAS
  characteristics: {
    type: 'object',
    required: false,
    structure: {
      area: { type: 'number', description: 'Área em m²' },
      bedrooms: { type: 'number', description: 'Número de quartos' },
      bathrooms: { type: 'number', description: 'Número de casas de banho' },
      garage: { type: 'boolean', description: 'Tem garagem' },
      garden: { type: 'boolean', description: 'Tem jardim' },
      balcony: { type: 'boolean', description: 'Tem varanda' },
      condition: { 
        type: 'enum',
        enum: ['novo', 'como_novo', 'bom', 'para_remodelar', 'para_restaurar'],
        description: 'Estado de conservação'
      },
      yearBuilt: { type: 'number', description: 'Ano de construção' },
      energyRating: {
        type: 'enum',
        enum: ['A+', 'A', 'B', 'B-', 'C', 'D', 'E', 'F', 'G'],
        description: 'Certificação energética'
      }
    }
  },
  
  // VALORES FINANCEIROS
  financialData: {
    type: 'object',
    required: false,
    structure: {
      askingPrice: { type: 'number', description: 'Preço pedido' },
      minPrice: { type: 'number', description: 'Preço mínimo' },
      marketValue: { type: 'number', description: 'Valor de mercado' },
      monthlyRent: { type: 'number', description: 'Renda mensal (se arrendamento)' },
      condominium: { type: 'number', description: 'Valor condomínio' },
      imt: { type: 'number', description: 'IMT calculado' },
      stampDuty: { type: 'number', description: 'Imposto de selo' }
    }
  }
};

// 💼 ESTRUTURA DADOS NEGÓCIO
// ==========================
// Para deals e transações
export const BUSINESS_DATA_STRUCTURE = {
  // VALORES DA TRANSAÇÃO
  dealValue: {
    type: 'number',
    required: false,
    description: 'Valor total da transação'
  },
  
  commissionPercentage: {
    type: 'number',
    required: false,
    min: 0,
    max: 100,
    description: 'Percentagem de comissão'
  },
  
  commissionValue: {
    type: 'number',
    required: false,
    description: 'Valor da comissão calculado'
  },
  
  // SISTEMA DE TRANCHES (para pagamentos faseados)
  paymentTranches: {
    type: 'array',
    required: false,
    description: 'Sistema de pagamentos faseados',
    itemStructure: {
      trancheNumber: { type: 'number', description: 'Número da tranche' },
      description: { type: 'string', description: 'Descrição da tranche' },
      amount: { type: 'number', description: 'Valor da tranche' },
      percentage: { type: 'number', description: 'Percentagem do total' },
      dueDate: { type: 'date', description: 'Data de vencimento' },
      status: { 
        type: 'enum',
        enum: ['pendente', 'pago', 'atrasado', 'cancelado'],
        description: 'Status do pagamento'
      },
      paidDate: { type: 'date', description: 'Data de pagamento efetivo' },
      paidAmount: { type: 'number', description: 'Valor pago' },
      notes: { type: 'string', description: 'Observações' }
    }
  },
  
  // DATAS CRÍTICAS DO PROCESSO LEGAL PORTUGUÊS
  legalDates: {
    type: 'object',
    required: false,
    structure: {
      // FASE 1: NEGOCIAÇÃO
      proposalDate: { type: 'date', description: 'Data da proposta' },
      proposalExpiryDate: { type: 'date', description: 'Validade da proposta' },
      proposalAcceptedDate: { type: 'date', description: 'Proposta aceite' },
      
      // FASE 2: CPCV (Contrato Promessa)
      cpcvSignedDate: { type: 'date', description: 'CPCV assinado' },
      cpcvAmount: { type: 'number', description: 'Valor do CPCV' },
      cpcvDueDate: { type: 'date', description: 'Vencimento sinal CPCV' },
      
      // FASE 3: FINANCIAMENTO
      mortgageApplicationDate: { type: 'date', description: 'Pedido crédito habitação' },
      mortgageApprovalDate: { type: 'date', description: 'Aprovação financiamento' },
      mortgageAmount: { type: 'number', description: 'Valor financiamento' },
      
      // FASE 4: ESCRITURA
      deedScheduledDate: { type: 'date', description: 'Escritura agendada' },
      deedCompletedDate: { type: 'date', description: 'Escritura realizada' },
      deedLocation: { type: 'string', description: 'Local da escritura' },
      notaryName: { type: 'string', description: 'Nome do notário' },
      
      // FASE 5: PÓS-VENDA
      keysDeliveredDate: { type: 'date', description: 'Entrega das chaves' },
      guaranteeExpiryDate: { type: 'date', description: 'Fim período garantia' }
    }
  },
  
  // DOCUMENTAÇÃO NECESSÁRIA
  requiredDocuments: {
    type: 'array',
    required: false,
    itemStructure: {
      documentType: { 
        type: 'enum',
        enum: [
          'certidao_predial', 'caderneta_predial', 'planta_aprovada',
          'licenca_habitacao', 'certificado_energetico', 'certidao_comercial',
          'cc_proprietario', 'nif_proprietario', 'certidao_casamento',
          'cpcv_anterior', 'escritura_anterior', 'comprovativo_irs'
        ],
        description: 'Tipo de documento'
      },
      status: {
        type: 'enum',
        enum: ['nao_solicitado', 'solicitado', 'recebido', 'validado', 'em_falta'],
        description: 'Status do documento'
      },
      requestedDate: { type: 'date', description: 'Data solicitação' },
      receivedDate: { type: 'date', description: 'Data receção' },
      expiryDate: { type: 'date', description: 'Data validade' },
      notes: { type: 'string', description: 'Observações' }
    }
  }
};

// 📊 ESTRUTURA DADOS ANÁLISE
// ==========================
// Para relatórios e métricas
export const ANALYTICS_DATA_STRUCTURE = {
  // MÉTRICAS DE PERFORMANCE
  metrics: {
    type: 'object',
    required: false,
    structure: {
      conversionRate: { type: 'number', description: 'Taxa de conversão' },
      averageResponseTime: { type: 'number', description: 'Tempo médio resposta' },
      totalInteractions: { type: 'number', description: 'Total de interações' },
      lastContactDate: { type: 'date', description: 'Último contacto' },
      nextFollowUpDate: { type: 'date', description: 'Próximo follow-up' }
    }
  },
  
  // ORIGEM E RASTREAMENTO
  sourceTracking: {
    type: 'object',
    required: false,
    structure: {
      originalSource: { 
        type: 'enum',
        enum: Object.values(UNIFIED_LEAD_SOURCES),
        description: 'Fonte original' 
      },
      sourceDetails: { type: 'string', description: 'Detalhes da fonte' },
      referrerUrl: { type: 'string', description: 'URL de referência' },
      campaign: { type: 'string', description: 'Campanha de marketing' },
      utmParameters: {
        type: 'object',
        structure: {
          utm_source: { type: 'string' },
          utm_medium: { type: 'string' },
          utm_campaign: { type: 'string' },
          utm_term: { type: 'string' },
          utm_content: { type: 'string' }
        }
      }
    }
  },
  
  // DADOS TÉCNICOS
  technicalData: {
    type: 'object',
    required: false,
    structure: {
      userAgent: { type: 'string', description: 'User agent do browser' },
      ipAddress: { type: 'string', description: 'Endereço IP' },
      sessionId: { type: 'string', description: 'ID da sessão' },
      deviceType: { type: 'string', description: 'Tipo de dispositivo' },
      browserLanguage: { type: 'string', description: 'Idioma do browser' }
    }
  }
};

// 🔧 FUNÇÕES DE VALIDAÇÃO
// =======================

/**
 * Validar se um objeto contém todos os campos obrigatórios da estrutura base
 */
export const validateCoreStructure = (data) => {
  const errors = [];
  const required = Object.entries(CORE_DATA_STRUCTURE)
    .filter(([key, config]) => config.required)
    .map(([key]) => key);
  
  required.forEach(field => {
    if (!data[field]) {
      errors.push(`Campo obrigatório em falta: ${field}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    missingFields: required.filter(field => !data[field])
  };
};

/**
 * Aplicar estrutura base a qualquer objeto
 */
export const applyCoreStructure = (data, userId, userEmail) => {
  const now = new Date();
  
  return {
    ...data,
    // Garantir campos obrigatórios
    userId: userId || data.userId,
    userEmail: userEmail || data.userEmail,
    createdAt: data.createdAt || now,
    updatedAt: now,
    isActive: data.isActive !== undefined ? data.isActive : true,
    priority: data.priority || UNIFIED_PRIORITIES.NORMAL,
    
    // Garantir estrutura de referências
    leadId: data.leadId || null,
    clientId: data.clientId || null,
    opportunityId: data.opportunityId || null,
    dealId: data.dealId || null,
    isConverted: data.isConverted || false
  };
};

/**
 * Criar esquema de validação para formulários
 */
export const createValidationSchema = (moduleType) => {
  const baseSchema = { ...CORE_DATA_STRUCTURE };
  
  switch (moduleType) {
    case 'lead':
      return {
        ...baseSchema,
        status: {
          ...baseSchema.status,
          enum: Object.values(UNIFIED_LEAD_STATUS)
        }
      };
      
    case 'client':
      return {
        ...baseSchema,
        ...PERSONAL_DATA_STRUCTURE,
        status: {
          ...baseSchema.status,
          enum: Object.values(UNIFIED_CLIENT_STATUS)
        }
      };
      
    case 'opportunity':
      return {
        ...baseSchema,
        ...PROPERTY_DATA_STRUCTURE,
        status: {
          ...baseSchema.status,
          enum: Object.values(UNIFIED_OPPORTUNITY_STATUS)
        }
      };
      
    case 'deal':
      return {
        ...baseSchema,
        ...BUSINESS_DATA_STRUCTURE,
        status: {
          ...baseSchema.status,
          enum: Object.values(UNIFIED_DEAL_STATUS)
        }
      };
      
    default:
      return baseSchema;
  }
};

/**
 * Gerar template vazio para novo registo
 */
export const createEmptyRecord = (moduleType, userId, userEmail) => {
  const baseRecord = {
    name: '',
    phone: '',
    email: '',
    interestType: UNIFIED_INTEREST_TYPES.COMPRA_CASA,
    budgetRange: 'indefinido',
    priority: UNIFIED_PRIORITIES.NORMAL,
    isActive: true,
    isConverted: false,
    leadId: null,
    clientId: null,
    opportunityId: null,
    dealId: null
  };
  
  return applyCoreStructure(baseRecord, userId, userEmail);
};

// 📋 TEMPLATES ESPECÍFICOS POR MÓDULO
// ===================================

export const LEAD_TEMPLATE = {
  ...CORE_DATA_STRUCTURE,
  status: UNIFIED_LEAD_STATUS.NOVO,
  source: UNIFIED_LEAD_SOURCES.WEBSITE,
  notes: ''
};

export const CLIENT_TEMPLATE = {
  ...CORE_DATA_STRUCTURE,
  ...PERSONAL_DATA_STRUCTURE,
  status: UNIFIED_CLIENT_STATUS.ATIVO,
  clientType: 'comprador'
};

export const OPPORTUNITY_TEMPLATE = {
  ...CORE_DATA_STRUCTURE,
  ...PROPERTY_DATA_STRUCTURE,
  status: UNIFIED_OPPORTUNITY_STATUS.IDENTIFICACAO,
  probability: 10,
  estimatedValue: 0
};

export const DEAL_TEMPLATE = {
  ...CORE_DATA_STRUCTURE,
  ...BUSINESS_DATA_STRUCTURE,
  status: UNIFIED_DEAL_STATUS.EM_NEGOCIACAO,
  dealValue: 0,
  commissionPercentage: 2.5
};

// 🚀 EXPORTAÇÃO FINAL
// ===================
export default {
  CORE_DATA_STRUCTURE,
  PERSONAL_DATA_STRUCTURE,
  PROPERTY_DATA_STRUCTURE,
  BUSINESS_DATA_STRUCTURE,
  ANALYTICS_DATA_STRUCTURE,
  
  // Templates
  LEAD_TEMPLATE,
  CLIENT_TEMPLATE,
  OPPORTUNITY_TEMPLATE,
  DEAL_TEMPLATE,
  
  // Funções
  validateCoreStructure,
  applyCoreStructure,
  createValidationSchema,
  createEmptyRecord
};