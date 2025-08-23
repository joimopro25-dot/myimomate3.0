// src/utils/ConversionValidation_Relaxed.js
// VALIDAÇÃO FLEXÍVEL PARA CONVERSÃO DE LEADS
// ==========================================

// REGRAS DE VALIDAÇÃO RELAXADAS - Para permitir conversões com dados mínimos
const RELAXED_VALIDATION_RULES = {
  // Apenas campos críticos obrigatórios
  REQUIRED_CRITICAL_FIELDS: [
    'name', // Do lead
    'phone' // Do lead
  ],
  
  // Campos recomendados mas não obrigatórios
  RECOMMENDED_FIELDS: [
    'numeroCC',
    'numeroFiscal', 
    'profissao',
    'residencia.rua',
    'orcamentoMaximo'
  ],
  
  // Pontuação mínima reduzida para 30/100
  MIN_QUALITY_SCORE: 30,
  
  // Permitir orçamentos mais baixos
  MIN_BUDGET: 1000,
  MAX_BUDGET: 50000000
};

// VALIDADOR RELAXADO
export class RelaxedConversionValidator {
  constructor(debugMode = true) {
    this.debugMode = debugMode;
  }

  log(message, data = null) {
    if (this.debugMode) {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] RELAXED_VALIDATION: ${message}`, data);
    }
  }

  // VALIDAÇÃO PRINCIPAL - APENAS CAMPOS CRÍTICOS
  validateConversion(leadData, formData, options = {}) {
    const startTime = Date.now();
    
    this.log('🔍 Iniciando validação relaxada de conversão', {
      leadId: leadData?.id,
      hasFormData: !!formData,
      options
    });

    const validation = {
      timestamp: new Date().toISOString(),
      leadId: leadData?.id,
      isValid: false,
      qualityScore: 0,
      errors: [],
      warnings: [],
      recommendations: []
    };

    try {
      // 1. VALIDAR APENAS CAMPOS CRÍTICOS
      this.validateCriticalFields(leadData, formData, validation);
      
      // 2. CALCULAR PONTUAÇÃO FLEXÍVEL
      this.calculateFlexibleQualityScore(leadData, formData, validation);
      
      // 3. GERAR RECOMENDAÇÕES PARA MELHORAR DADOS
      this.generateImprovementRecommendations(formData, validation);
      
      // 4. APROVAR SE TEM DADOS MÍNIMOS
      validation.isValid = validation.errors.length === 0 && 
                          validation.qualityScore >= RELAXED_VALIDATION_RULES.MIN_QUALITY_SCORE;

      const duration = Date.now() - startTime;
      
      this.log(`✅ Validação relaxada concluída em ${duration}ms`, {
        isValid: validation.isValid,
        errors: validation.errors.length,
        warnings: validation.warnings.length,
        qualityScore: validation.qualityScore
      });

    } catch (error) {
      this.log('❌ Erro durante validação relaxada', error);
      validation.errors.push({
        field: 'system',
        message: 'Erro interno durante validação',
        type: 'error'
      });
    }

    return validation;
  }

  // VALIDAR APENAS CAMPOS CRÍTICOS
  validateCriticalFields(leadData, formData, validation) {
    this.log('⚡ Validando apenas campos críticos');
    
    // Verificar se tem nome (do lead ou formulário)
    const hasName = leadData?.name || formData?.nome;
    if (!hasName) {
      validation.errors.push({
        field: 'name',
        message: 'Nome é obrigatório',
        type: 'critical'
      });
    }

    // Verificar se tem telefone (do lead ou formulário)
    const hasPhone = leadData?.phone || formData?.telefone;
    if (!hasPhone) {
      validation.errors.push({
        field: 'phone',
        message: 'Telefone é obrigatório',
        type: 'critical'
      });
    }

    // TUDO O RESTO É OPCIONAL - apenas avisos
    if (!formData?.numeroCC) {
      validation.warnings.push({
        field: 'numeroCC',
        message: 'Cartão de Cidadão não fornecido - recomendado completar depois',
        type: 'recommendation'
      });
    }

    if (!formData?.numeroFiscal) {
      validation.warnings.push({
        field: 'numeroFiscal',
        message: 'NIF não fornecido - recomendado completar depois',
        type: 'recommendation'
      });
    }

    if (!formData?.orcamentoMaximo) {
      validation.warnings.push({
        field: 'orcamentoMaximo',
        message: 'Orçamento não definido - importante para qualificação',
        type: 'recommendation'
      });
    }
  }

  // CALCULAR PONTUAÇÃO FLEXÍVEL
  calculateFlexibleQualityScore(leadData, formData, validation) {
    let score = 0;

    // Dados básicos do lead (40 pontos)
    if (leadData?.name) score += 10;
    if (leadData?.phone) score += 10;
    if (leadData?.email) score += 20;

    // Dados do formulário (60 pontos)
    if (formData?.numeroCC) score += 15;
    if (formData?.numeroFiscal) score += 15;
    if (formData?.profissao) score += 10;
    if (formData?.orcamentoMaximo) score += 20;

    validation.qualityScore = Math.min(score, 100);

    this.log('📊 Pontuação flexível calculada', {
      score: validation.qualityScore,
      threshold: RELAXED_VALIDATION_RULES.MIN_QUALITY_SCORE,
      approved: validation.qualityScore >= RELAXED_VALIDATION_RULES.MIN_QUALITY_SCORE
    });
  }

  // GERAR RECOMENDAÇÕES DE MELHORIA
  generateImprovementRecommendations(formData, validation) {
    const recommendations = [];

    if (!formData?.numeroCC && !formData?.numeroFiscal) {
      recommendations.push('Solicitar documentos de identificação (CC e NIF) em próximo contacto');
    }

    if (!formData?.orcamentoMaximo) {
      recommendations.push('Definir orçamento máximo para melhor qualificação de imóveis');
    }

    if (!formData?.residencia?.rua) {
      recommendations.push('Recolher endereço completo para análise de localização');
    }

    if (!formData?.rendimentoMensal && !formData?.rendimentoAnual) {
      recommendations.push('Avaliar capacidade financeira em reunião presencial');
    }

    if (!formData?.tipoImovel) {
      recommendations.push('Identificar tipo de imóvel pretendido (apartamento, moradia, etc.)');
    }

    validation.recommendations = recommendations;

    this.log('💡 Geradas recomendações de melhoria', {
      count: recommendations.length,
      recommendations
    });
  }
}

// FUNÇÃO PRINCIPAL PARA USO NO HOOK
export const validateLeadConversionRelaxed = (leadData, formData, options = {}) => {
  const validator = new RelaxedConversionValidator(true);
  return validator.validateConversion(leadData, formData, options);
};