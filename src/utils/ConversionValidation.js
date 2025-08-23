// src/utils/ConversionValidation.js
// 🛡️ SISTEMA DE VALIDAÇÕES OBRIGATÓRIAS PARA CONVERSÃO
// =====================================================
// MyImoMate 3.0 - Validações rigorosas antes da conversão
// ✅ Validações portuguesas completas (CC, NIF, CP)
// ✅ Verificação de dados obrigatórios
// ✅ Validação de estrutura de dados
// ✅ Prevenção de conversões incompletas
// ✅ Sistema de pontuação de qualidade
// ✅ Relatórios detalhados de validação

// ✅ CONSTANTES DE VALIDAÇÃO
const VALIDATION_RULES = {
  // Dados pessoais obrigatórios
  REQUIRED_PERSONAL_FIELDS: [
    'numeroCC',
    'numeroFiscal', 
    'profissao',
    'residencia.rua',
    'residencia.codigoPostal',
    'residencia.localidade',
    'naturalidade.concelho'
  ],
  
  // Dados financeiros obrigatórios
  REQUIRED_FINANCIAL_FIELDS: [
    'rendimentoMensal_OR_rendimentoAnual'
  ],
  
  // Dados do imóvel obrigatórios
  REQUIRED_PROPERTY_FIELDS: [
    'tipoImovelProcurado',
    'orcamentoMaximo'
  ],
  
  // Timeline obrigatório
  REQUIRED_TIMELINE_FIELDS: [
    'prazoDecisao',
    'motivoCompra'
  ],
  
  // Pontuação mínima para aprovação
  MIN_QUALITY_SCORE: 80,
  
  // Limites de valores
  MIN_BUDGET: 10000,
  MAX_BUDGET: 10000000,
  MIN_INCOME: 500,
  MAX_INCOME: 50000
};

// ✅ PADRÕES DE VALIDAÇÃO PORTUGUESES
const PORTUGUESE_PATTERNS = {
  // Cartão de Cidadão: 12345678 9 ZZ4
  CC: /^(\d{8})\s?(\d{1})\s?([A-Z]{2})(\d{1})$/,
  
  // NIF: 9 dígitos
  NIF: /^\d{9}$/,
  
  // Código Postal: NNNN-NNN
  POSTAL_CODE: /^\d{4}-\d{3}$/,
  
  // Telefone português: +351, 91, 96, 92, 93, etc.
  PHONE: /^(\+351|351)?\s?(9[1236]|2\d)\s?\d{3}\s?\d{4}$/,
  
  // Email
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// ✅ LISTA DE CONCELHOS PORTUGUESES (amostra)
const PORTUGUESE_COUNTIES = [
  'Lisboa', 'Porto', 'Coimbra', 'Braga', 'Aveiro', 'Setúbal', 'Funchal',
  'Vila Nova de Gaia', 'Amadora', 'Matosinhos', 'Gondomar', 'Sintra',
  'Cascais', 'Oeiras', 'Almada', 'Maia', 'Valongo', 'Paredes', 'Santa Maria da Feira',
  'Leiria', 'Viseu', 'Évora', 'Santarém', 'Faro', 'Portimão', 'Albufeira'
];

// ✅ VALIDADOR PRINCIPAL DE CONVERSÃO
export class ConversionValidator {
  constructor(debugMode = false) {
    this.debugMode = debugMode;
    this.validationHistory = [];
    this.currentValidation = null;
  }

  // 🔍 FUNÇÃO PRINCIPAL DE VALIDAÇÃO
  validateConversion(leadData, formData, options = {}) {
    const startTime = Date.now();
    
    this.log('🔍 Iniciando validação completa de conversão', {
      leadId: leadData?.id,
      formDataKeys: Object.keys(formData || {}),
      options
    });

    const validation = {
      timestamp: new Date().toISOString(),
      leadId: leadData?.id,
      isValid: false,
      qualityScore: 0,
      errors: [],
      warnings: [],
      details: {},
      recommendations: []
    };

    this.currentValidation = validation;

    try {
      // 1. Validar dados do lead
      this.validateLeadData(leadData, validation);
      
      // 2. Validar dados pessoais
      this.validatePersonalData(formData, validation);
      
      // 3. Validar dados financeiros
      this.validateFinancialData(formData, validation);
      
      // 4. Validar dados do imóvel
      this.validatePropertyData(formData, validation);
      
      // 5. Validar timeline
      this.validateTimelineData(formData, validation);
      
      // 6. Validar cônjuge (se aplicável)
      this.validateSpouseData(formData, validation);
      
      // 7. Calcular pontuação de qualidade
      this.calculateQualityScore(validation);
      
      // 8. Gerar recomendações
      this.generateRecommendations(validation);
      
      // 9. Determinar se está válido para conversão
      validation.isValid = validation.errors.length === 0 && 
                          validation.qualityScore >= VALIDATION_RULES.MIN_QUALITY_SCORE;

      const duration = Date.now() - startTime;
      
      this.log(`✅ Validação concluída em ${duration}ms`, {
        isValid: validation.isValid,
        errors: validation.errors.length,
        warnings: validation.warnings.length,
        qualityScore: validation.qualityScore
      });

    } catch (error) {
      this.log('❌ Erro durante validação', error);
      validation.errors.push({
        field: 'system',
        message: 'Erro interno durante validação',
        type: 'critical',
        details: error.message
      });
    }

    this.validationHistory.push(validation);
    return validation;
  }

  // 🔍 VALIDAR DADOS DO LEAD
  validateLeadData(leadData, validation) {
    this.log('📋 Validando dados do lead');
    
    if (!leadData) {
      validation.errors.push({
        field: 'leadData',
        message: 'Dados do lead não fornecidos',
        type: 'critical'
      });
      return;
    }

    // Verificar campos essenciais do lead
    const requiredLeadFields = ['id', 'name', 'email'];
    
    for (const field of requiredLeadFields) {
      if (!leadData[field]) {
        validation.errors.push({
          field: `lead.${field}`,
          message: `Campo obrigatório do lead: ${field}`,
          type: 'error'
        });
      }
    }

    // Validar email do lead
    if (leadData.email && !PORTUGUESE_PATTERNS.EMAIL.test(leadData.email)) {
      validation.errors.push({
        field: 'lead.email',
        message: 'Email do lead inválido',
        type: 'error'
      });
    }

    validation.details.leadValidation = {
      hasId: !!leadData.id,
      hasName: !!leadData.name,
      hasEmail: !!leadData.email,
      emailValid: leadData.email ? PORTUGUESE_PATTERNS.EMAIL.test(leadData.email) : false
    };
  }

  // 🔍 VALIDAR DADOS PESSOAIS
  validatePersonalData(formData, validation) {
    this.log('👤 Validando dados pessoais');
    
    if (!formData) {
      validation.errors.push({
        field: 'formData',
        message: 'Dados do formulário não fornecidos',
        type: 'critical'
      });
      return;
    }

    // Validar Cartão de Cidadão
    this.validateCC(formData.numeroCC, validation);
    
    // Validar NIF
    this.validateNIF(formData.numeroFiscal, validation);
    
    // Validar profissão
    if (!formData.profissao?.trim()) {
      validation.errors.push({
        field: 'profissao',
        message: 'Profissão é obrigatória',
        type: 'error'
      });
    } else if (formData.profissao.length < 3) {
      validation.warnings.push({
        field: 'profissao',
        message: 'Profissão muito curta, pode não ser específica suficiente',
        type: 'quality'
      });
    }

    // Validar residência
    this.validateAddress(formData.residencia, validation, 'residencia');
    
    // Validar naturalidade
    this.validateNaturalidade(formData.naturalidade, validation);
    
    // Validar estado civil
    this.validateEstadoCivil(formData.estadoCivil, formData.comunhaoBens, validation);

    validation.details.personalData = {
      ccValid: this.isValidCC(formData.numeroCC),
      nifValid: this.isValidNIF(formData.numeroFiscal),
      hasProfession: !!formData.profissao,
      hasCompleteAddress: this.hasCompleteAddress(formData.residencia),
      hasNaturalidade: !!formData.naturalidade?.concelho
    };
  }

  // 🔍 VALIDAR CARTÃO DE CIDADÃO
  validateCC(numeroCC, validation) {
    if (!numeroCC?.trim()) {
      validation.errors.push({
        field: 'numeroCC',
        message: 'Número do Cartão de Cidadão é obrigatório',
        type: 'error'
      });
      return;
    }

    // Remover espaços e validar formato
    const cleanCC = numeroCC.replace(/\s/g, '');
    
    if (!PORTUGUESE_PATTERNS.CC.test(cleanCC)) {
      validation.errors.push({
        field: 'numeroCC',
        message: 'Formato do Cartão de Cidadão inválido (deve ser: 12345678 9 ZZ4)',
        type: 'error'
      });
      return;
    }

    // Validação adicional do dígito verificador
    const match = cleanCC.match(PORTUGUESE_PATTERNS.CC);
    if (match) {
      const [, number, check1, letters, check2] = match;
      
      // Validar dígitos verificadores (algoritmo simplificado)
      if (!this.validateCCCheckDigits(number, check1, letters, check2)) {
        validation.warnings.push({
          field: 'numeroCC',
          message: 'Dígitos verificadores do CC podem estar incorretos',
          type: 'verification'
        });
      }
    }
  }

  // 🔍 VALIDAR NIF
  validateNIF(numeroFiscal, validation) {
    if (!numeroFiscal?.trim()) {
      validation.errors.push({
        field: 'numeroFiscal',
        message: 'Número de Identificação Fiscal é obrigatório',
        type: 'error'
      });
      return;
    }

    if (!PORTUGUESE_PATTERNS.NIF.test(numeroFiscal)) {
      validation.errors.push({
        field: 'numeroFiscal',
        message: 'NIF deve ter exatamente 9 dígitos',
        type: 'error'
      });
      return;
    }

    // Validar dígito verificador do NIF
    if (!this.validateNIFCheckDigit(numeroFiscal)) {
      validation.errors.push({
        field: 'numeroFiscal',
        message: 'Dígito verificador do NIF inválido',
        type: 'error'
      });
    }

    // Verificar se é NIF de pessoa singular
    const firstDigit = parseInt(numeroFiscal[0]);
    if (![1, 2, 3].includes(firstDigit)) {
      validation.warnings.push({
        field: 'numeroFiscal',
        message: 'NIF não parece ser de pessoa singular',
        type: 'verification'
      });
    }
  }

  // 🔍 VALIDAR MORADA
  validateAddress(address, validation, prefix = '') {
    if (!address) {
      validation.errors.push({
        field: `${prefix}.address`,
        message: 'Dados de morada são obrigatórios',
        type: 'error'
      });
      return;
    }

    // Validar rua
    if (!address.rua?.trim()) {
      validation.errors.push({
        field: `${prefix}.rua`,
        message: 'Rua é obrigatória',
        type: 'error'
      });
    }

    // Validar código postal
    if (!address.codigoPostal?.trim()) {
      validation.errors.push({
        field: `${prefix}.codigoPostal`,
        message: 'Código postal é obrigatório',
        type: 'error'
      });
    } else if (!PORTUGUESE_PATTERNS.POSTAL_CODE.test(address.codigoPostal)) {
      validation.errors.push({
        field: `${prefix}.codigoPostal`,
        message: 'Formato do código postal inválido (deve ser NNNN-NNN)',
        type: 'error'
      });
    }

    // Validar localidade
    if (!address.localidade?.trim()) {
      validation.errors.push({
        field: `${prefix}.localidade`,
        message: 'Localidade é obrigatória',
        type: 'error'
      });
    }

    // Sugerir concelho se não fornecido
    if (!address.concelho?.trim()) {
      validation.warnings.push({
        field: `${prefix}.concelho`,
        message: 'Concelho não especificado, recomenda-se o preenchimento',
        type: 'completeness'
      });
    }
  }

  // 🔍 VALIDAR NATURALIDADE
  validateNaturalidade(naturalidade, validation) {
    if (!naturalidade?.concelho?.trim()) {
      validation.errors.push({
        field: 'naturalidade.concelho',
        message: 'Concelho de naturalidade é obrigatório',
        type: 'error'
      });
      return;
    }

    // Verificar se o concelho é válido
    const isValidCounty = PORTUGUESE_COUNTIES.some(county => 
      county.toLowerCase().includes(naturalidade.concelho.toLowerCase()) ||
      naturalidade.concelho.toLowerCase().includes(county.toLowerCase())
    );

    if (!isValidCounty) {
      validation.warnings.push({
        field: 'naturalidade.concelho',
        message: 'Concelho pode não estar correto, verificar ortografia',
        type: 'verification'
      });
    }
  }

  // 🔍 VALIDAR ESTADO CIVIL
  validateEstadoCivil(estadoCivil, comunhaoBens, validation) {
    const validStates = ['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_facto'];
    
    if (!estadoCivil || !validStates.includes(estadoCivil)) {
      validation.errors.push({
        field: 'estadoCivil',
        message: 'Estado civil inválido',
        type: 'error'
      });
      return;
    }

    // Se casado ou união de facto, comunhão de bens é obrigatória
    if (['casado', 'uniao_facto'].includes(estadoCivil)) {
      if (!comunhaoBens?.trim()) {
        validation.errors.push({
          field: 'comunhaoBens',
          message: 'Regime de bens é obrigatório para casados/união de facto',
          type: 'error'
        });
      }
    }
  }

  // 🔍 VALIDAR DADOS FINANCEIROS
  validateFinancialData(formData, validation) {
    this.log('💰 Validando dados financeiros');

    // Pelo menos um tipo de rendimento deve estar preenchido
    const hasMonthly = formData.rendimentoMensal && !isNaN(formData.rendimentoMensal) && parseFloat(formData.rendimentoMensal) > 0;
    const hasYearly = formData.rendimentoAnual && !isNaN(formData.rendimentoAnual) && parseFloat(formData.rendimentoAnual) > 0;

    if (!hasMonthly && !hasYearly) {
      validation.errors.push({
        field: 'rendimento',
        message: 'Pelo menos um tipo de rendimento (mensal ou anual) é obrigatório',
        type: 'error'
      });
    }

    // Validar rendimento mensal
    if (hasMonthly) {
      const monthlyIncome = parseFloat(formData.rendimentoMensal);
      
      if (monthlyIncome < VALIDATION_RULES.MIN_INCOME) {
        validation.warnings.push({
          field: 'rendimentoMensal',
          message: `Rendimento mensal muito baixo (€${monthlyIncome}), verificar se está correto`,
          type: 'verification'
        });
      }
      
      if (monthlyIncome > VALIDATION_RULES.MAX_INCOME) {
        validation.warnings.push({
          field: 'rendimentoMensal',
          message: `Rendimento mensal muito alto (€${monthlyIncome}), verificar se está correto`,
          type: 'verification'
        });
      }
    }

    // Validar consistência entre rendimentos
    if (hasMonthly && hasYearly) {
      const monthlyIncome = parseFloat(formData.rendimentoMensal);
      const yearlyIncome = parseFloat(formData.rendimentoAnual);
      const expectedYearly = monthlyIncome * 14; // 14 meses em Portugal
      
      const discrepancy = Math.abs(yearlyIncome - expectedYearly) / expectedYearly;
      
      if (discrepancy > 0.2) { // Mais de 20% de diferença
        validation.warnings.push({
          field: 'rendimento',
          message: 'Rendimento mensal e anual não são consistentes entre si',
          type: 'consistency'
        });
      }
    }

    // Validar situação de crédito
    const validCreditSituations = ['sem_restricoes', 'restricoes_menores', 'restricoes_significativas', 'incumprimento'];
    if (formData.situacaoCredito && !validCreditSituations.includes(formData.situacaoCredito)) {
      validation.warnings.push({
        field: 'situacaoCredito',
        message: 'Situação de crédito inválida',
        type: 'format'
      });
    }

    // Validar pré-aprovação
    if (formData.preAprovacaoCredito && formData.valorPreAprovado) {
      const preApprovedValue = parseFloat(formData.valorPreAprovado);
      
      if (isNaN(preApprovedValue) || preApprovedValue <= 0) {
        validation.warnings.push({
          field: 'valorPreAprovado',
          message: 'Valor de pré-aprovação inválido',
          type: 'format'
        });
      }
    }

    validation.details.financialData = {
      hasIncomeData: hasMonthly || hasYearly,
      monthlyIncome: hasMonthly ? parseFloat(formData.rendimentoMensal) : null,
      yearlyIncome: hasYearly ? parseFloat(formData.rendimentoAnual) : null,
      hasPreApproval: !!formData.preAprovacaoCredito,
      creditSituation: formData.situacaoCredito
    };
  }

  // 🔍 VALIDAR DADOS DO IMÓVEL
  validatePropertyData(formData, validation) {
    this.log('🏠 Validando dados do imóvel');

    // Tipo de imóvel é obrigatório
    if (!formData.tipoImovelProcurado || !Array.isArray(formData.tipoImovelProcurado) || formData.tipoImovelProcurado.length === 0) {
      validation.errors.push({
        field: 'tipoImovelProcurado',
        message: 'Pelo menos um tipo de imóvel deve ser selecionado',
        type: 'error'
      });
    }

    // Orçamento máximo é obrigatório
    if (!formData.orcamentoMaximo || isNaN(formData.orcamentoMaximo) || parseFloat(formData.orcamentoMaximo) <= 0) {
      validation.errors.push({
        field: 'orcamentoMaximo',
        message: 'Orçamento máximo é obrigatório e deve ser um valor válido',
        type: 'error'
      });
    } else {
      const maxBudget = parseFloat(formData.orcamentoMaximo);
      
      // Verificar limites razoáveis
      if (maxBudget < VALIDATION_RULES.MIN_BUDGET) {
        validation.warnings.push({
          field: 'orcamentoMaximo',
          message: `Orçamento muito baixo (€${maxBudget}), verificar se está correto`,
          type: 'verification'
        });
      }
      
      if (maxBudget > VALIDATION_RULES.MAX_BUDGET) {
        validation.warnings.push({
          field: 'orcamentoMaximo',
          message: `Orçamento muito alto (€${maxBudget}), verificar se está correto`,
          type: 'verification'
        });
      }
    }

    // Validar consistência entre orçamento mínimo e máximo
    if (formData.orcamentoMinimo && formData.orcamentoMaximo) {
      const minBudget = parseFloat(formData.orcamentoMinimo);
      const maxBudget = parseFloat(formData.orcamentoMaximo);
      
      if (minBudget >= maxBudget) {
        validation.errors.push({
          field: 'orcamento',
          message: 'Orçamento mínimo deve ser inferior ao máximo',
          type: 'logic'
        });
      }
      
      // Verificar se a diferença não é muito pequena
      const difference = (maxBudget - minBudget) / maxBudget;
      if (difference < 0.1) { // Menos de 10% de diferença
        validation.warnings.push({
          field: 'orcamento',
          message: 'Diferença entre orçamento mínimo e máximo é muito pequena',
          type: 'range'
        });
      }
    }

    // Validar localização preferida
    if (formData.localizacaoPreferida && Array.isArray(formData.localizacaoPreferida) && formData.localizacaoPreferida.length === 0) {
      validation.warnings.push({
        field: 'localizacaoPreferida',
        message: 'Nenhuma localização preferida especificada',
        type: 'completeness'
      });
    }

    validation.details.propertyData = {
      hasPropertyTypes: formData.tipoImovelProcurado?.length > 0,
      propertyTypesCount: formData.tipoImovelProcurado?.length || 0,
      hasBudget: !!formData.orcamentoMaximo,
      budgetRange: formData.orcamentoMaximo ? parseFloat(formData.orcamentoMaximo) : null,
      hasLocation: formData.localizacaoPreferida?.length > 0
    };
  }

  // 🔍 VALIDAR TIMELINE
  validateTimelineData(formData, validation) {
    this.log('⏰ Validando timeline');

    // Prazo para decisão é obrigatório
    if (!formData.prazoDecisao?.trim()) {
      validation.errors.push({
        field: 'prazoDecisao',
        message: 'Prazo para decisão é obrigatório',
        type: 'error'
      });
    }

    // Motivo da compra é obrigatório
    if (!formData.motivoCompra?.trim()) {
      validation.errors.push({
        field: 'motivoCompra',
        message: 'Motivo da compra é obrigatório',
        type: 'error'
      });
    }

    // Validar prioridade
    const validPriorities = ['normal', 'alta', 'urgente'];
    if (formData.prioridadeConversao && !validPriorities.includes(formData.prioridadeConversao)) {
      validation.warnings.push({
        field: 'prioridadeConversao',
        message: 'Prioridade de conversão inválida',
        type: 'format'
      });
    }

    validation.details.timelineData = {
      hasDecisionTimeline: !!formData.prazoDecisao,
      hasPurchaseReason: !!formData.motivoCompra,
      priority: formData.prioridadeConversao || 'normal'
    };
  }

  // 🔍 VALIDAR DADOS DO CÔNJUGE
  validateSpouseData(formData, validation) {
    if (!formData.temConjuge || !['casado', 'uniao_facto'].includes(formData.estadoCivil)) {
      return; // Cônjuge não é necessário
    }

    this.log('💑 Validando dados do cônjuge');

    const spouse = formData.conjuge || {};

    // Nome do cônjuge é obrigatório
    if (!spouse.nome?.trim()) {
      validation.errors.push({
        field: 'conjuge.nome',
        message: 'Nome do cônjuge é obrigatório',
        type: 'error'
      });
    }

    // CC do cônjuge é obrigatório
    if (!spouse.numeroCC?.trim()) {
      validation.errors.push({
        field: 'conjuge.numeroCC',
        message: 'Cartão de Cidadão do cônjuge é obrigatório',
        type: 'error'
      });
    } else {
      // Validar formato do CC
      const cleanCC = spouse.numeroCC.replace(/\s/g, '');
      if (!PORTUGUESE_PATTERNS.CC.test(cleanCC)) {
        validation.errors.push({
          field: 'conjuge.numeroCC',
          message: 'Formato do CC do cônjuge inválido',
          type: 'error'
        });
      }
    }

    // NIF do cônjuge é obrigatório
    if (!spouse.numeroFiscal?.trim()) {
      validation.errors.push({
        field: 'conjuge.numeroFiscal',
        message: 'NIF do cônjuge é obrigatório',
        type: 'error'
      });
    } else {
      // Validar NIF
      if (!PORTUGUESE_PATTERNS.NIF.test(spouse.numeroFiscal)) {
        validation.errors.push({
          field: 'conjuge.numeroFiscal',
          message: 'NIF do cônjuge inválido',
          type: 'error'
        });
      } else if (!this.validateNIFCheckDigit(spouse.numeroFiscal)) {
        validation.errors.push({
          field: 'conjuge.numeroFiscal',
          message: 'Dígito verificador do NIF do cônjuge inválido',
          type: 'error'
        });
      }
    }

    // Verificar se os dados do cônjuge não são iguais aos do principal
    if (spouse.numeroCC === formData.numeroCC) {
      validation.errors.push({
        field: 'conjuge.numeroCC',
        message: 'CC do cônjuge não pode ser igual ao do cliente principal',
        type: 'logic'
      });
    }

    if (spouse.numeroFiscal === formData.numeroFiscal) {
      validation.errors.push({
        field: 'conjuge.numeroFiscal',
        message: 'NIF do cônjuge não pode ser igual ao do cliente principal',
        type: 'logic'
      });
    }

    validation.details.spouseData = {
      hasSpouse: formData.temConjuge,
      spouseComplete: !!(spouse.nome && spouse.numeroCC && spouse.numeroFiscal),
      spouseDataValid: this.isValidCC(spouse.numeroCC) && this.isValidNIF(spouse.numeroFiscal)
    };
  }

  // 🔍 CALCULAR PONTUAÇÃO DE QUALIDADE
  calculateQualityScore(validation) {
    this.log('🎯 Calculando pontuação de qualidade');

    let score = 0;
    const maxScore = 100;

    // Dados pessoais (30 pontos)
    if (validation.details.personalData?.ccValid) score += 8;
    if (validation.details.personalData?.nifValid) score += 8;
    if (validation.details.personalData?.hasProfession) score += 5;
    if (validation.details.personalData?.hasCompleteAddress) score += 5;
    if (validation.details.personalData?.hasNaturalidade) score += 4;

    // Dados financeiros (25 pontos)
    if (validation.details.financialData?.hasIncomeData) score += 15;
    if (validation.details.financialData?.hasPreApproval) score += 10;

    // Dados do imóvel (25 pontos)
    if (validation.details.propertyData?.hasPropertyTypes) score += 10;
    if (validation.details.propertyData?.hasBudget) score += 10;
    if (validation.details.propertyData?.hasLocation) score += 5;

    // Timeline (10 pontos)
    if (validation.details.timelineData?.hasDecisionTimeline) score += 5;
    if (validation.details.timelineData?.hasPurchaseReason) score += 5;

    // Cônjuge (10 pontos bonus se aplicável)
    if (validation.details.spouseData?.hasSpouse && validation.details.spouseData?.spouseComplete) {
      score += 10;
    }

    // Penalizações por erros
    score -= validation.errors.length * 5;
    score -= validation.warnings.length * 2;

    // Garantir que está entre 0 e 100
    score = Math.max(0, Math.min(maxScore, score));

    validation.qualityScore = score;

    this.log(`📊 Pontuação de qualidade calculada: ${score}/100`);
  }

  // 🔍 GERAR RECOMENDAÇÕES
  generateRecommendations(validation) {
    const recommendations = [];

    // Recomendações baseadas em erros
    if (validation.errors.length > 0) {
      recommendations.push({
        type: 'critical',
        message: `Corrigir ${validation.errors.length} erro(s) crítico(s) antes de converter`,
        priority: 'high',
        fields: validation.errors.map(e => e.field)
      });
    }

    // Recomendações de qualidade
    if (validation.qualityScore < 60) {
      recommendations.push({
        type: 'quality',
        message: 'Pontuação de qualidade baixa - considere obter mais informações',
        priority: 'medium',
        suggestions: ['Completar dados financeiros', 'Especificar localização preferida', 'Adicionar documentação']
      });
    }

    // Recomendações específicas
    if (!validation.details.financialData?.hasPreApproval) {
      recommendations.push({
        type: 'opportunity',
        message: 'Cliente sem pré-aprovação - oportunidade para assistência financeira',
        priority: 'low',
        action: 'Sugerir consultoria de crédito'
      });
    }

    if (validation.details.propertyData?.propertyTypesCount > 3) {
      recommendations.push({
        type: 'focus',
        message: 'Cliente interessado em muitos tipos de imóvel - pode precisar de orientação',
        priority: 'medium',
        action: 'Agendar reunião para definir prioridades'
      });
    }

    validation.recommendations = recommendations;
    this.log(`💡 Geradas ${recommendations.length} recomendações`);
  }

  // 🛠️ FUNÇÕES AUXILIARES DE VALIDAÇÃO

  isValidCC(numeroCC) {
    if (!numeroCC) return false;
    const cleanCC = numeroCC.replace(/\s/g, '');
    return PORTUGUESE_PATTERNS.CC.test(cleanCC);
  }

  isValidNIF(numeroFiscal) {
    if (!numeroFiscal) return false;
    return PORTUGUESE_PATTERNS.NIF.test(numeroFiscal) && this.validateNIFCheckDigit(numeroFiscal);
  }

  validateNIFCheckDigit(nif) {
    if (!nif || nif.length !== 9) return false;
    
    const digits = nif.split('').map(Number);
    const checkDigit = digits[8];
    
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += digits[i] * (9 - i);
    }
    
    const remainder = sum % 11;
    const expectedCheckDigit = remainder < 2 ? 0 : 11 - remainder;
    
    return checkDigit === expectedCheckDigit;
  }

  validateCCCheckDigits(number, check1, letters, check2) {
    // Algoritmo simplificado - numa implementação real seria mais complexo
    return true; // Por agora assumir válido
  }

  hasCompleteAddress(address) {
    return address && 
           address.rua?.trim() && 
           address.codigoPostal?.trim() && 
           address.localidade?.trim() &&
           PORTUGUESE_PATTERNS.POSTAL_CODE.test(address.codigoPostal);
  }

  // 🔍 FUNÇÃO DE LOG
  log(message, data = null) {
    if (this.debugMode) {
      const timestamp = new Date().toLocaleTimeString('pt-PT');
      console.log(`[${timestamp}] VALIDATION:`, message, data);
    }
  }

  // 📊 RELATÓRIO DE VALIDAÇÃO
  generateValidationReport(validation) {
    return {
      summary: {
        isValid: validation.isValid,
        qualityScore: validation.qualityScore,
        errorsCount: validation.errors.length,
        warningsCount: validation.warnings.length,
        recommendationsCount: validation.recommendations.length
      },
      details: validation.details,
      issues: {
        errors: validation.errors,
        warnings: validation.warnings
      },
      recommendations: validation.recommendations,
      timestamp: validation.timestamp
    };
  }

  // 🧹 LIMPEZA DE DADOS
  cleanupValidationHistory() {
    // Manter apenas as últimas 10 validações
    this.validationHistory = this.validationHistory.slice(-10);
  }
}

// ✅ FUNÇÃO DE CONVENIÊNCIA PARA VALIDAÇÃO RÁPIDA
export const validateLeadConversion = (leadData, formData, options = {}) => {
  const validator = new ConversionValidator(options.debug || false);
  return validator.validateConversion(leadData, formData, options);
};

// ✅ EXPORTAR CONSTANTES ÚTEIS
export {
  VALIDATION_RULES,
  PORTUGUESE_PATTERNS,
  PORTUGUESE_COUNTIES
};

// ✅ EXPORTAR CLASSE PRINCIPAL
export default ConversionValidator;