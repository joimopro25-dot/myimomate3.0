// src/utils/ConversionValidations.js
// 🔍 VALIDAÇÕES PARA CONVERSÃO LEAD → CLIENTE
// ============================================
// MyImoMate 3.0 - Sistema completo de validações portuguesas
// ✅ Validação de Cartão de Cidadão português
// ✅ Validação de NIF português
// ✅ Validação de códigos postais portugueses
// ✅ Validação de números de telefone portugueses
// ✅ Validação de emails
// ✅ Validação de campos obrigatórios por estado civil
// ✅ Validação de documentos e anexos

// 🇵🇹 VALIDAÇÕES ESPECÍFICAS PORTUGUESAS
// =======================================

/**
 * Validar Cartão de Cidadão Português
 * Formato: NNNNNNNN N LLN (8 dígitos + 1 dígito verificador + 2 letras + 1 dígito)
 */
export const validateCartaoCidadao = (numeroCC) => {
  if (!numeroCC) return { valid: false, message: 'Número do CC é obrigatório' };
  
  // Remover espaços e converter para maiúsculas
  const cleaned = numeroCC.replace(/\s/g, '').toUpperCase();
  
  // Verificar formato básico (8 dígitos + 1 dígito + 2 letras + 1 dígito)
  const ccRegex = /^(\d{8})(\d)([A-Z]{2})(\d)$/;
  const match = cleaned.match(ccRegex);
  
  if (!match) {
    return { 
      valid: false, 
      message: 'Formato inválido. Use: 00000000 0 ZZ0' 
    };
  }
  
  const [, baseDigits, checkDigit1, letters, checkDigit2] = match;
  
  // Validação do primeiro dígito verificador
  const weights1 = [2, 3, 4, 5, 6, 7, 8, 9];
  let sum1 = 0;
  
  for (let i = 0; i < 8; i++) {
    sum1 += parseInt(baseDigits[i]) * weights1[i];
  }
  
  const remainder1 = sum1 % 11;
  const expectedCheckDigit1 = remainder1 < 2 ? 0 : 11 - remainder1;
  
  if (parseInt(checkDigit1) !== expectedCheckDigit1) {
    return { 
      valid: false, 
      message: 'Primeiro dígito verificador inválido' 
    };
  }
  
  // Validação das letras (devem estar entre A-Z)
  if (!/^[A-Z]{2}$/.test(letters)) {
    return { 
      valid: false, 
      message: 'Letras devem ser A-Z' 
    };
  }
  
  // Validação do segundo dígito verificador
  const fullNumber = baseDigits + checkDigit1 + letters;
  const weights2 = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
  let sum2 = 0;
  
  for (let i = 0; i < 12; i++) {
    const char = fullNumber[i];
    const value = /\d/.test(char) ? parseInt(char) : char.charCodeAt(0) - 55;
    sum2 += value * weights2[i];
  }
  
  const remainder2 = sum2 % 11;
  const expectedCheckDigit2 = remainder2 < 2 ? 0 : 11 - remainder2;
  
  if (parseInt(checkDigit2) !== expectedCheckDigit2) {
    return { 
      valid: false, 
      message: 'Segundo dígito verificador inválido' 
    };
  }
  
  return { 
    valid: true, 
    formatted: `${baseDigits.slice(0,8)} ${checkDigit1} ${letters}${checkDigit2}`,
    message: 'Cartão de Cidadão válido' 
  };
};

/**
 * Validar NIF Português
 * Formato: 9 dígitos com algoritmo de verificação
 */
export const validateNIF = (nif) => {
  if (!nif) return { valid: false, message: 'NIF é obrigatório' };
  
  // Remover espaços e caracteres não numéricos
  const cleaned = nif.replace(/\D/g, '');
  
  if (cleaned.length !== 9) {
    return { 
      valid: false, 
      message: 'NIF deve ter exatamente 9 dígitos' 
    };
  }
  
  // Verificar se começa com dígito válido (1, 2, 3, 5, 6, 7, 8, 9)
  const firstDigit = parseInt(cleaned[0]);
  const validFirstDigits = [1, 2, 3, 5, 6, 7, 8, 9];
  
  if (!validFirstDigits.includes(firstDigit)) {
    return { 
      valid: false, 
      message: 'Primeiro dígito do NIF inválido' 
    };
  }
  
  // Algoritmo de validação do NIF
  const weights = [9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 8; i++) {
    sum += parseInt(cleaned[i]) * weights[i];
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(cleaned[8]) !== checkDigit) {
    return { 
      valid: false, 
      message: 'Dígito verificador do NIF inválido' 
    };
  }
  
  return { 
    valid: true, 
    formatted: cleaned,
    message: 'NIF válido' 
  };
};

/**
 * Validar Código Postal Português
 * Formato: NNNN-NNN
 */
export const validateCodigoPostal = (codigoPostal) => {
  if (!codigoPostal) return { valid: false, message: 'Código postal é obrigatório' };
  
  // Remover espaços
  const cleaned = codigoPostal.replace(/\s/g, '');
  
  // Verificar formato NNNN-NNN
  const cpRegex = /^(\d{4})-?(\d{3})$/;
  const match = cleaned.match(cpRegex);
  
  if (!match) {
    return { 
      valid: false, 
      message: 'Formato inválido. Use: 0000-000' 
    };
  }
  
  const [, firstPart, secondPart] = match;
  
  // Verificar se está na faixa válida portuguesa (1000-9999)
  const firstNumber = parseInt(firstPart);
  if (firstNumber < 1000 || firstNumber > 9999) {
    return { 
      valid: false, 
      message: 'Código postal fora da faixa portuguesa (1000-9999)' 
    };
  }
  
  return { 
    valid: true, 
    formatted: `${firstPart}-${secondPart}`,
    message: 'Código postal válido' 
  };
};

/**
 * Validar Telefone Português
 * Formatos aceites: +351NNNNNNNNN, 00351NNNNNNNNN, 9NNNNNNN, 2NNNNNNN
 */
export const validateTelefonePortugues = (telefone) => {
  if (!telefone) return { valid: false, message: 'Telefone é obrigatório' };
  
  // Remover espaços e caracteres especiais
  const cleaned = telefone.replace(/[\s\-\(\)]/g, '');
  
  // Padrões aceites
  const patterns = [
    /^\+351(9\d{8}|2\d{8})$/, // +351 + móvel ou fixo
    /^00351(9\d{8}|2\d{8})$/, // 00351 + móvel ou fixo
    /^(9\d{8})$/, // Móvel nacional
    /^(2\d{8})$/, // Fixo nacional
    /^(21|22|23|24|25|26|27|28|29)\d{7}$/ // Fixos por região
  ];
  
  const isValid = patterns.some(pattern => pattern.test(cleaned));
  
  if (!isValid) {
    return { 
      valid: false, 
      message: 'Formato de telefone português inválido' 
    };
  }
  
  // Formatar número
  let formatted = cleaned;
  if (cleaned.startsWith('+351')) {
    formatted = cleaned;
  } else if (cleaned.startsWith('00351')) {
    formatted = '+' + cleaned.slice(2);
  } else if (cleaned.length === 9) {
    formatted = '+351' + cleaned;
  }
  
  return { 
    valid: true, 
    formatted: formatted,
    message: 'Telefone válido' 
  };
};

/**
 * Validar Email
 */
export const validateEmail = (email) => {
  if (!email) return { valid: true, message: 'Email é opcional' }; // Email é opcional
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { 
      valid: false, 
      message: 'Formato de email inválido' 
    };
  }
  
  return { 
    valid: true, 
    formatted: email.toLowerCase(),
    message: 'Email válido' 
  };
};

// 📋 VALIDAÇÕES DE CAMPOS OBRIGATÓRIOS
// ====================================

/**
 * Validar campos obrigatórios básicos
 */
export const validateRequiredFields = (formData) => {
  const errors = {};
  
  // Campos sempre obrigatórios
  if (!formData.numeroCC?.trim()) {
    errors.numeroCC = 'Número do Cartão de Cidadão é obrigatório';
  }
  
  if (!formData.numeroFiscal?.trim()) {
    errors.numeroFiscal = 'NIF é obrigatório';
  }
  
  if (!formData.residencia?.rua?.trim()) {
    errors['residencia.rua'] = 'Rua é obrigatória';
  }
  
  if (!formData.residencia?.codigoPostal?.trim()) {
    errors['residencia.codigoPostal'] = 'Código postal é obrigatório';
  }
  
  if (!formData.naturalidade?.concelho?.trim()) {
    errors['naturalidade.concelho'] = 'Concelho de naturalidade é obrigatório';
  }
  
  // Validação de rendimento (pelo menos um tipo)
  if (!formData.rendimentoMensal && !formData.rendimentoAnual) {
    errors.rendimento = 'Pelo menos um tipo de rendimento é obrigatório';
  }
  
  return errors;
};

/**
 * Validar campos específicos do cônjuge
 */
export const validateSpouseFields = (formData) => {
  const errors = {};
  
  // Só validar se indicou que tem cônjuge
  if (!formData.temConjuge || !['casado', 'uniao_facto'].includes(formData.estadoCivil)) {
    return errors;
  }
  
  if (!formData.conjuge?.nome?.trim()) {
    errors['conjuge.nome'] = 'Nome do cônjuge é obrigatório';
  }
  
  if (!formData.conjuge?.numeroCC?.trim()) {
    errors['conjuge.numeroCC'] = 'CC do cônjuge é obrigatório';
  }
  
  if (!formData.conjuge?.numeroFiscal?.trim()) {
    errors['conjuge.numeroFiscal'] = 'NIF do cônjuge é obrigatório';
  }
  
  // Validar comunhão de bens se casado
  if (formData.estadoCivil === 'casado' && !formData.comunhaoBens) {
    errors.comunhaoBens = 'Comunhão de bens é obrigatória para casados';
  }
  
  return errors;
};

/**
 * Validar documentos e anexos
 */
export const validateDocuments = (formData) => {
  const errors = {};
  const warnings = [];
  
  // Documentos mínimos recomendados
  const minDocuments = ['Cartão de Cidadão', 'Declaração IRS'];
  const missingDocs = minDocuments.filter(doc => 
    !formData.documentosDisponiveis?.includes(doc)
  );
  
  if (missingDocs.length > 0) {
    warnings.push(`Documentos recomendados em falta: ${missingDocs.join(', ')}`);
  }
  
  // Validar tamanho de anexos
  if (formData.anexos?.length > 0) {
    const oversizeFiles = formData.anexos.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizeFiles.length > 0) {
      errors.anexos = `Arquivos muito grandes (máx. 10MB): ${oversizeFiles.map(f => f.name).join(', ')}`;
    }
    
    // Validar tipos de arquivo
    const allowedTypes = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats'];
    const invalidFiles = formData.anexos.filter(file => 
      !allowedTypes.some(type => file.type?.startsWith(type))
    );
    
    if (invalidFiles.length > 0) {
      errors.tiposAnexos = `Tipos de arquivo não permitidos: ${invalidFiles.map(f => f.name).join(', ')}`;
    }
  }
  
  return { errors, warnings };
};

/**
 * Validar valores financeiros
 */
export const validateFinancialValues = (formData) => {
  const errors = {};
  const warnings = [];
  
  // Validar rendimentos
  const rendimentoMensal = parseFloat(formData.rendimentoMensal) || 0;
  const rendimentoAnual = parseFloat(formData.rendimentoAnual) || 0;
  
  if (rendimentoMensal > 0 && rendimentoAnual > 0) {
    const expectedAnnual = rendimentoMensal * 12;
    const difference = Math.abs(rendimentoAnual - expectedAnnual) / expectedAnnual;
    
    if (difference > 0.2) { // Diferença superior a 20%
      warnings.push('Rendimento mensal e anual não são consistentes');
    }
  }
  
  // Validar orçamento
  const orcamentoMin = parseFloat(formData.orcamentoMinimo) || 0;
  const orcamentoMax = parseFloat(formData.orcamentoMaximo) || 0;
  
  if (orcamentoMin > 0 && orcamentoMax > 0 && orcamentoMin >= orcamentoMax) {
    errors.orcamento = 'Orçamento mínimo deve ser menor que o máximo';
  }
  
  // Validar entrada vs orçamento
  const entrada = parseFloat(formData.entrada) || 0;
  if (entrada > 0 && orcamentoMax > 0 && entrada > orcamentoMax) {
    errors.entrada = 'Entrada não pode ser superior ao orçamento máximo';
  }
  
  // Validar pré-aprovação vs orçamento
  if (formData.temPreAprovacao) {
    const preAprovacao = parseFloat(formData.valorPreAprovacao) || 0;
    if (preAprovacao > 0 && orcamentoMax > 0 && preAprovacao < orcamentoMax * 0.8) {
      warnings.push('Valor pré-aprovado pode ser insuficiente para o orçamento desejado');
    }
  }
  
  return { errors, warnings };
};

// 🔍 FUNÇÃO PRINCIPAL DE VALIDAÇÃO COMPLETA
// ==========================================

/**
 * Validação completa do formulário de conversão
 */
export const validateConversionForm = (formData) => {
  const allErrors = {};
  const allWarnings = [];
  
  try {
    // 1. Validações portuguesas específicas
    const ccValidation = validateCartaoCidadao(formData.numeroCC);
    if (!ccValidation.valid) allErrors.numeroCC = ccValidation.message;
    
    const nifValidation = validateNIF(formData.numeroFiscal);
    if (!nifValidation.valid) allErrors.numeroFiscal = nifValidation.message;
    
    const cpValidation = validateCodigoPostal(formData.residencia?.codigoPostal);
    if (!cpValidation.valid) allErrors['residencia.codigoPostal'] = cpValidation.message;
    
    // 2. Validar campos obrigatórios
    const requiredErrors = validateRequiredFields(formData);
    Object.assign(allErrors, requiredErrors);
    
    // 3. Validar cônjuge
    const spouseErrors = validateSpouseFields(formData);
    Object.assign(allErrors, spouseErrors);
    
    // Validar dados do cônjuge se fornecidos
    if (formData.temConjuge && formData.conjuge?.numeroCC) {
      const spouseCCValidation = validateCartaoCidadao(formData.conjuge.numeroCC);
      if (!spouseCCValidation.valid) allErrors['conjuge.numeroCC'] = spouseCCValidation.message;
    }
    
    if (formData.temConjuge && formData.conjuge?.numeroFiscal) {
      const spouseNIFValidation = validateNIF(formData.conjuge.numeroFiscal);
      if (!spouseNIFValidation.valid) allErrors['conjuge.numeroFiscal'] = spouseNIFValidation.message;
    }
    
    // 4. Validar documentos
    const docValidation = validateDocuments(formData);
    Object.assign(allErrors, docValidation.errors);
    allWarnings.push(...docValidation.warnings);
    
    // 5. Validar valores financeiros
    const finValidation = validateFinancialValues(formData);
    Object.assign(allErrors, finValidation.errors);
    allWarnings.push(...finValidation.warnings);
    
    // 6. Validações de negócio
    if (formData.prazoDecisao === 'imediato' && !formData.temPreAprovacao) {
      allWarnings.push('Cliente com prazo imediato sem pré-aprovação pode ter dificuldades');
    }
    
    if (formData.situacaoCredito !== 'sem_restricoes' && parseFloat(formData.orcamentoMaximo) > 300000) {
      allWarnings.push('Orçamento elevado com restrições de crédito pode ser problemático');
    }
    
  } catch (error) {
    console.error('Erro nas validações:', error);
    allErrors.validation = 'Erro interno na validação';
  }
  
  return {
    isValid: Object.keys(allErrors).length === 0,
    errors: allErrors,
    warnings: allWarnings,
    summary: {
      errorCount: Object.keys(allErrors).length,
      warningCount: allWarnings.length,
      hasBlockingErrors: Object.keys(allErrors).length > 0
    }
  };
};

// 🛠️ FUNÇÕES AUXILIARES DE FORMATAÇÃO
// ====================================

/**
 * Formatar dados antes de submeter
 */
export const formatFormDataForSubmission = (formData) => {
  const formatted = { ...formData };
  
  // Formatar números
  if (formatted.numeroCC) {
    const ccValidation = validateCartaoCidadao(formatted.numeroCC);
    if (ccValidation.valid) formatted.numeroCC = ccValidation.formatted;
  }
  
  if (formatted.numeroFiscal) {
    const nifValidation = validateNIF(formatted.numeroFiscal);
    if (nifValidation.valid) formatted.numeroFiscal = nifValidation.formatted;
  }
  
  if (formatted.residencia?.codigoPostal) {
    const cpValidation = validateCodigoPostal(formatted.residencia.codigoPostal);
    if (cpValidation.valid) formatted.residencia.codigoPostal = cpValidation.formatted;
  }
  
  // Formatar cônjuge
  if (formatted.conjuge?.numeroCC) {
    const spouseCCValidation = validateCartaoCidadao(formatted.conjuge.numeroCC);
    if (spouseCCValidation.valid) formatted.conjuge.numeroCC = spouseCCValidation.formatted;
  }
  
  if (formatted.conjuge?.numeroFiscal) {
    const spouseNIFValidation = validateNIF(formatted.conjuge.numeroFiscal);
    if (spouseNIFValidation.valid) formatted.conjuge.numeroFiscal = spouseNIFValidation.formatted;
  }
  
  // Converter strings numéricas
  const numericFields = [
    'rendimentoMensal', 'rendimentoAnual', 'valorPreAprovacao',
    'orcamentoMinimo', 'orcamentoMaximo', 'entrada'
  ];
  
  numericFields.forEach(field => {
    if (formatted[field] && typeof formatted[field] === 'string') {
      const numValue = parseFloat(formatted[field]);
      formatted[field] = isNaN(numValue) ? 0 : numValue;
    }
  });
  
  // Converter rendimento do cônjuge
  if (formatted.conjuge?.rendimento && typeof formatted.conjuge.rendimento === 'string') {
    const numValue = parseFloat(formatted.conjuge.rendimento);
    formatted.conjuge.rendimento = isNaN(numValue) ? 0 : numValue;
  }
  
  return formatted;
};

/**
 * Obter resumo de validação para interface
 */
export const getValidationSummary = (validationResult) => {
  const { isValid, errors, warnings, summary } = validationResult;
  
  let status = 'success';
  let message = 'Todos os dados estão válidos';
  let color = 'green';
  
  if (summary.hasBlockingErrors) {
    status = 'error';
    message = `${summary.errorCount} erro(s) encontrado(s)`;
    color = 'red';
  } else if (summary.warningCount > 0) {
    status = 'warning';
    message = `${summary.warningCount} aviso(s) encontrado(s)`;
    color = 'yellow';
  }
  
  return {
    status,
    message,
    color,
    canProceed: !summary.hasBlockingErrors,
    details: {
      errors: Object.keys(errors).length > 0 ? errors : null,
      warnings: warnings.length > 0 ? warnings : null
    }
  };
};

export default {
  // Validações individuais
  validateCartaoCidadao,
  validateNIF,
  validateCodigoPostal,
  validateTelefonePortugues,
  validateEmail,
  
  // Validações por secção
  validateRequiredFields,
  validateSpouseFields,
  validateDocuments,
  validateFinancialValues,
  
  // Validação completa
  validateConversionForm,
  
  // Utilitários
  formatFormDataForSubmission,
  getValidationSummary
};