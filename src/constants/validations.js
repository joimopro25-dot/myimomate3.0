// src/constants/validations.js
// 🎯 VALIDAÇÕES UNIFICADAS - MyImoMate 3.0
// ========================================
// Sistema completo de validações para mercado imobiliário português
// Inclui validações legais, fiscais, bancárias e de negócio

import {
  UNIFIED_INTEREST_TYPES,
  UNIFIED_BUDGET_RANGES,
  UNIFIED_PRIORITIES,
  UNIFIED_LEAD_STATUS,
  UNIFIED_CLIENT_STATUS,
  UNIFIED_OPPORTUNITY_STATUS
} from './unifiedTypes.js';

// 🇵🇹 REGEX PATTERNS PORTUGUESES
// ===============================

// Telefone português (todos os formatos válidos)
export const PORTUGUESE_PHONE_PATTERNS = {
  MOBILE: /^(\+351|351|00351)?[ -]?9[1236][0-9][ -]?[0-9]{3}[ -]?[0-9]{3}$/,
  LANDLINE: /^(\+351|351|00351)?[ -]?2[0-9]{8}$/,
  FULL: /^(\+351|351|00351)?[ -]?(9[1236][0-9][ -]?[0-9]{3}[ -]?[0-9]{3}|2[0-9]{8})$/
};

// NIF português (com algoritmo de validação)
export const NIF_PATTERN = /^[0-9]{9}$/;

// Código postal português
export const POSTAL_CODE_PATTERN = /^[0-9]{4}-[0-9]{3}$/;

// Email robusto
export const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// IBAN português
export const IBAN_PORTUGAL_PATTERN = /^PT50[0-9]{4}[0-9]{4}[0-9]{11}[0-9]{2}$/;

// Cartão de Cidadão português
export const CC_PATTERN = /^[0-9]{8}[ -]?[0-9]{1}[ -]?[A-Z]{2}[0-9]{1}$/;

// NIB (Número de Identificação Bancária)
export const NIB_PATTERN = /^[0-9]{4}[ -]?[0-9]{4}[ -]?[0-9]{11}[ -]?[0-9]{2}$/;

// 🏢 VALIDAÇÕES IMOBILIÁRIAS ESPECÍFICAS
// ======================================

// Referência de imóvel (matriz predial)
export const PROPERTY_REFERENCE_PATTERN = /^[0-9]{1,6}\/[0-9]{4}$/;

// Licença de habitação
export const HABITACAO_LICENSE_PATTERN = /^[0-9]{2,4}\/[0-9]{4}$/;

// Certidão energética
export const ENERGY_CERTIFICATE_PATTERN = /^[A-Z]{3}[0-9]{8}$/;

// Valor monetário (euros)
export const CURRENCY_PATTERN = /^[0-9]+(\.[0-9]{1,2})?$/;

// Percentagem (0-100)
export const PERCENTAGE_PATTERN = /^(100|[0-9]{1,2})(\.[0-9]{1,2})?$/;

// 📊 CONFIGURAÇÕES DE VALIDAÇÃO
// =============================

export const VALIDATION_CONFIG = {
  // Limites de caracteres
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 100,
  MIN_PHONE_LENGTH: 9,
  MAX_PHONE_LENGTH: 15,
  MIN_EMAIL_LENGTH: 5,
  MAX_EMAIL_LENGTH: 254,
  MIN_ADDRESS_LENGTH: 5,
  MAX_ADDRESS_LENGTH: 200,
  MIN_NOTES_LENGTH: 0,
  MAX_NOTES_LENGTH: 2000,
  
  // Limites financeiros (em euros)
  MIN_PROPERTY_VALUE: 1000,
  MAX_PROPERTY_VALUE: 50000000, // 50M euros
  MIN_COMMISSION_PERCENTAGE: 0.1,
  MAX_COMMISSION_PERCENTAGE: 10.0,
  MIN_RENTAL_VALUE: 50,
  MAX_RENTAL_VALUE: 50000,
  
  // Limites temporais
  MIN_AGE: 16,
  MAX_AGE: 120,
  MAX_FUTURE_YEARS: 5,
  MAX_PAST_YEARS: 150,
  
  // Limites de área (m²)
  MIN_PROPERTY_AREA: 10,
  MAX_PROPERTY_AREA: 100000,
  
  // Limites para quartos/casas de banho
  MIN_BEDROOMS: 0,
  MAX_BEDROOMS: 20,
  MIN_BATHROOMS: 0,
  MAX_BATHROOMS: 10
};

// 🔧 FUNÇÕES DE VALIDAÇÃO BÁSICAS
// ===============================

/**
 * Validar NIF português com algoritmo oficial
 */
export const validateNIF = (nif) => {
  if (!nif || typeof nif !== 'string') {
    return { isValid: false, message: 'NIF é obrigatório' };
  }
  
  // Remover espaços e hífens
  const cleanNIF = nif.replace(/[\s-]/g, '');
  
  // Verificar formato básico
  if (!NIF_PATTERN.test(cleanNIF)) {
    return { isValid: false, message: 'NIF deve ter 9 dígitos' };
  }
  
  // Algoritmo de validação oficial do NIF português
  const digits = cleanNIF.split('').map(Number);
  const firstDigit = digits[0];
  
  // Verificar primeiro dígito válido
  const validFirstDigits = [1, 2, 3, 5, 6, 7, 8, 9];
  if (!validFirstDigits.includes(firstDigit)) {
    return { isValid: false, message: 'NIF inválido - primeiro dígito incorreto' };
  }
  
  // Calcular dígito de controlo
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += digits[i] * (9 - i);
  }
  
  const checkDigit = 11 - (sum % 11);
  const finalCheckDigit = checkDigit >= 10 ? 0 : checkDigit;
  
  if (digits[8] !== finalCheckDigit) {
    return { isValid: false, message: 'NIF inválido - dígito de controlo incorreto' };
  }
  
  return { isValid: true, message: 'NIF válido', formatted: cleanNIF };
};

/**
 * Validar telefone português
 */
export const validatePortuguesePhone = (phone, allowLandline = false) => {
  if (!phone || typeof phone !== 'string') {
    return { isValid: false, message: 'Telefone é obrigatório' };
  }
  
  // Limpar espaços e hífens
  const cleanPhone = phone.replace(/[\s-]/g, '');
  
  // Verificar se é telemóvel
  if (PORTUGUESE_PHONE_PATTERNS.MOBILE.test(phone)) {
    const normalizedPhone = cleanPhone.replace(/^(\+351|351|00351)/, '');
    return { 
      isValid: true, 
      message: 'Telemóvel válido',
      formatted: `+351 ${normalizedPhone.substring(0, 3)} ${normalizedPhone.substring(3, 6)} ${normalizedPhone.substring(6)}`,
      type: 'mobile'
    };
  }
  
  // Verificar se é fixo (se permitido)
  if (allowLandline && PORTUGUESE_PHONE_PATTERNS.LANDLINE.test(phone)) {
    const normalizedPhone = cleanPhone.replace(/^(\+351|351|00351)/, '');
    return { 
      isValid: true, 
      message: 'Telefone fixo válido',
      formatted: `+351 ${normalizedPhone}`,
      type: 'landline'
    };
  }
  
  return { 
    isValid: false, 
    message: allowLandline ? 'Telefone inválido' : 'Apenas telemóveis são aceites'
  };
};

/**
 * Validar email robusto
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email é obrigatório' };
  }
  
  const trimmedEmail = email.toLowerCase().trim();
  
  if (trimmedEmail.length < VALIDATION_CONFIG.MIN_EMAIL_LENGTH) {
    return { isValid: false, message: 'Email muito curto' };
  }
  
  if (trimmedEmail.length > VALIDATION_CONFIG.MAX_EMAIL_LENGTH) {
    return { isValid: false, message: 'Email muito longo' };
  }
  
  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return { isValid: false, message: 'Formato de email inválido' };
  }
  
  // Verificar domínios suspeitos
  const suspiciousDomains = ['10minutemail.com', 'guerrillamail.com', 'tempmail.org'];
  const domain = trimmedEmail.split('@')[1];
  if (suspiciousDomains.includes(domain)) {
    return { isValid: false, message: 'Email temporário não é permitido' };
  }
  
  return { isValid: true, message: 'Email válido', formatted: trimmedEmail };
};

/**
 * Validar código postal português
 */
export const validatePostalCode = (postalCode) => {
  if (!postalCode || typeof postalCode !== 'string') {
    return { isValid: false, message: 'Código postal é obrigatório' };
  }
  
  if (!POSTAL_CODE_PATTERN.test(postalCode)) {
    return { isValid: false, message: 'Código postal deve ter formato 1234-567' };
  }
  
  const firstFour = postalCode.substring(0, 4);
  const lastThree = postalCode.substring(5, 8);
  
  // Verificar se os códigos estão dentro dos limites portugueses
  const firstFourNum = parseInt(firstFour);
  if (firstFourNum < 1000 || firstFourNum > 9999) {
    return { isValid: false, message: 'Código postal português inválido' };
  }
  
  return { isValid: true, message: 'Código postal válido', formatted: postalCode };
};

/**
 * Validar IBAN português
 */
export const validateIBAN = (iban) => {
  if (!iban || typeof iban !== 'string') {
    return { isValid: false, message: 'IBAN é obrigatório' };
  }
  
  const cleanIBAN = iban.replace(/\s/g, '').toUpperCase();
  
  if (!IBAN_PORTUGAL_PATTERN.test(cleanIBAN)) {
    return { isValid: false, message: 'IBAN português inválido' };
  }
  
  // Algoritmo de validação IBAN
  const rearranged = cleanIBAN.substring(4) + cleanIBAN.substring(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (char) => char.charCodeAt(0) - 55);
  
  // Verificação módulo 97
  let remainder = '';
  for (let i = 0; i < numeric.length; i++) {
    remainder = (remainder + numeric[i]) % 97;
  }
  
  if (remainder !== 1) {
    return { isValid: false, message: 'IBAN inválido - dígito de controlo incorreto' };
  }
  
  return { 
    isValid: true, 
    message: 'IBAN válido',
    formatted: `${cleanIBAN.substring(0, 4)} ${cleanIBAN.substring(4, 8)} ${cleanIBAN.substring(8, 12)} ${cleanIBAN.substring(12, 16)} ${cleanIBAN.substring(16, 20)} ${cleanIBAN.substring(20)}`
  };
};

// 💰 VALIDAÇÕES FINANCEIRAS
// =========================

/**
 * Validar valor monetário
 */
export const validateCurrency = (value, min = 0, max = VALIDATION_CONFIG.MAX_PROPERTY_VALUE) => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, message: 'Valor é obrigatório' };
  }
  
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    return { isValid: false, message: 'Valor deve ser numérico' };
  }
  
  if (numValue < min) {
    return { isValid: false, message: `Valor mínimo é €${min.toLocaleString('pt-PT')}` };
  }
  
  if (numValue > max) {
    return { isValid: false, message: `Valor máximo é €${max.toLocaleString('pt-PT')}` };
  }
  
  return { 
    isValid: true, 
    message: 'Valor válido',
    formatted: new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numValue)
  };
};

/**
 * Validar percentagem de comissão
 */
export const validateCommissionPercentage = (percentage) => {
  const result = validateCurrency(
    percentage, 
    VALIDATION_CONFIG.MIN_COMMISSION_PERCENTAGE, 
    VALIDATION_CONFIG.MAX_COMMISSION_PERCENTAGE
  );
  
  if (!result.isValid) {
    result.message = result.message.replace('Valor', 'Percentagem');
  } else {
    result.formatted = `${percentage}%`;
  }
  
  return result;
};

/**
 * Calcular e validar IMT (Imposto Municipal sobre Transmissões)
 */
export const calculateIMT = (propertyValue, propertyType = 'residential', isFirstHome = false) => {
  if (!propertyValue || propertyValue <= 0) {
    return { isValid: false, message: 'Valor do imóvel é obrigatório para calcular IMT' };
  }
  
  let imtValue = 0;
  
  if (propertyType === 'residential') {
    // Tabela IMT para habitação própria permanente (2024)
    if (propertyValue <= 92407) {
      imtValue = 0; // Isento
    } else if (propertyValue <= 126403) {
      imtValue = (propertyValue - 92407) * 0.02;
    } else if (propertyValue <= 172348) {
      imtValue = 680 + (propertyValue - 126403) * 0.05;
    } else if (propertyValue <= 287213) {
      imtValue = 2977 + (propertyValue - 172348) * 0.07;
    } else if (propertyValue <= 574323) {
      imtValue = 11018 + (propertyValue - 287213) * 0.08;
    } else {
      imtValue = 33987 + (propertyValue - 574323) * 0.06;
    }
    
    // Redução para primeira habitação
    if (isFirstHome && propertyValue <= 633453) {
      imtValue = Math.max(0, imtValue - 1000);
    }
  } else {
    // IMT para imóveis não residenciais
    if (propertyValue <= 574323) {
      imtValue = propertyValue * 0.065;
    } else {
      imtValue = 37331 + (propertyValue - 574323) * 0.075;
    }
  }
  
  return {
    isValid: true,
    imtValue: Math.round(imtValue * 100) / 100,
    formatted: new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(imtValue),
    breakdown: {
      propertyValue,
      isFirstHome,
      propertyType,
      exemption: isFirstHome && propertyValue <= 633453 ? 1000 : 0
    }
  };
};

/**
 * Calcular Imposto de Selo
 */
export const calculateStampDuty = (propertyValue, mortgageValue = 0) => {
  // Imposto de selo sobre aquisição = 0.8% do valor
  const acquisitionStampDuty = propertyValue * 0.008;
  
  // Imposto de selo sobre crédito habitação = 0.6% do valor financiado
  const mortgageStampDuty = mortgageValue * 0.006;
  
  const totalStampDuty = acquisitionStampDuty + mortgageStampDuty;
  
  return {
    isValid: true,
    acquisitionStampDuty: Math.round(acquisitionStampDuty * 100) / 100,
    mortgageStampDuty: Math.round(mortgageStampDuty * 100) / 100,
    totalStampDuty: Math.round(totalStampDuty * 100) / 100,
    formatted: new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR'
    }).format(totalStampDuty)
  };
};

// 📅 VALIDAÇÕES DE DATAS
// ======================

/**
 * Validar data de nascimento
 */
export const validateBirthDate = (birthDate) => {
  if (!birthDate) {
    return { isValid: false, message: 'Data de nascimento é obrigatória' };
  }
  
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  
  if (birth > today) {
    return { isValid: false, message: 'Data de nascimento não pode ser no futuro' };
  }
  
  if (age < VALIDATION_CONFIG.MIN_AGE) {
    return { isValid: false, message: `Idade mínima é ${VALIDATION_CONFIG.MIN_AGE} anos` };
  }
  
  if (age > VALIDATION_CONFIG.MAX_AGE) {
    return { isValid: false, message: `Idade máxima é ${VALIDATION_CONFIG.MAX_AGE} anos` };
  }
  
  return { 
    isValid: true, 
    message: 'Data de nascimento válida',
    age,
    formatted: birth.toLocaleDateString('pt-PT')
  };
};

/**
 * Validar sequência de datas legais
 */
export const validateLegalDateSequence = (dates) => {
  const errors = [];
  const dateOrder = [
    'proposalDate',
    'proposalAcceptedDate', 
    'cpcvSignedDate',
    'mortgageApplicationDate',
    'mortgageApprovalDate',
    'deedScheduledDate',
    'deedCompletedDate',
    'keysDeliveredDate'
  ];
  
  let previousDate = null;
  
  dateOrder.forEach(dateKey => {
    const currentDate = dates[dateKey];
    if (currentDate) {
      const current = new Date(currentDate);
      
      if (previousDate && current < previousDate) {
        errors.push(`${dateKey} não pode ser anterior à data anterior no processo`);
      }
      
      previousDate = current;
    }
  });
  
  // Validações específicas
  if (dates.proposalExpiryDate && dates.proposalDate) {
    const proposal = new Date(dates.proposalDate);
    const expiry = new Date(dates.proposalExpiryDate);
    
    if (expiry <= proposal) {
      errors.push('Data de validade da proposta deve ser posterior à data da proposta');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// 🏠 VALIDAÇÕES IMOBILIÁRIAS
// ==========================

/**
 * Validar características do imóvel
 */
export const validatePropertyCharacteristics = (characteristics) => {
  const errors = [];
  
  if (characteristics.area) {
    if (characteristics.area < VALIDATION_CONFIG.MIN_PROPERTY_AREA) {
      errors.push(`Área mínima é ${VALIDATION_CONFIG.MIN_PROPERTY_AREA}m²`);
    }
    if (characteristics.area > VALIDATION_CONFIG.MAX_PROPERTY_AREA) {
      errors.push(`Área máxima é ${VALIDATION_CONFIG.MAX_PROPERTY_AREA}m²`);
    }
  }
  
  if (characteristics.bedrooms !== undefined) {
    if (characteristics.bedrooms < VALIDATION_CONFIG.MIN_BEDROOMS || 
        characteristics.bedrooms > VALIDATION_CONFIG.MAX_BEDROOMS) {
      errors.push(`Quartos deve estar entre ${VALIDATION_CONFIG.MIN_BEDROOMS} e ${VALIDATION_CONFIG.MAX_BEDROOMS}`);
    }
  }
  
  if (characteristics.bathrooms !== undefined) {
    if (characteristics.bathrooms < VALIDATION_CONFIG.MIN_BATHROOMS || 
        characteristics.bathrooms > VALIDATION_CONFIG.MAX_BATHROOMS) {
      errors.push(`Casas de banho deve estar entre ${VALIDATION_CONFIG.MIN_BATHROOMS} e ${VALIDATION_CONFIG.MAX_BATHROOMS}`);
    }
  }
  
  if (characteristics.yearBuilt) {
    const currentYear = new Date().getFullYear();
    if (characteristics.yearBuilt < (currentYear - VALIDATION_CONFIG.MAX_PAST_YEARS) || 
        characteristics.yearBuilt > (currentYear + VALIDATION_CONFIG.MAX_FUTURE_YEARS)) {
      errors.push(`Ano de construção deve estar entre ${currentYear - VALIDATION_CONFIG.MAX_PAST_YEARS} e ${currentYear + VALIDATION_CONFIG.MAX_FUTURE_YEARS}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validar referência predial
 */
export const validatePropertyReference = (reference) => {
  if (!reference || typeof reference !== 'string') {
    return { isValid: false, message: 'Referência predial é obrigatória' };
  }
  
  if (!PROPERTY_REFERENCE_PATTERN.test(reference)) {
    return { isValid: false, message: 'Referência predial deve ter formato 123456/2024' };
  }
  
  return { isValid: true, message: 'Referência predial válida' };
};

// 📋 VALIDAÇÕES DE FORMULÁRIO
// ===========================

/**
 * Validador principal para leads
 */
export const validateLead = (leadData) => {
  const errors = {};
  
  // Nome
  if (!leadData.name || leadData.name.trim().length < VALIDATION_CONFIG.MIN_NAME_LENGTH) {
    errors.name = `Nome deve ter pelo menos ${VALIDATION_CONFIG.MIN_NAME_LENGTH} caracteres`;
  }
  
  // Telefone
  const phoneValidation = validatePortuguesePhone(leadData.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.message;
  }
  
  // Email
  const emailValidation = validateEmail(leadData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message;
  }
  
  // Tipo de interesse
  if (!leadData.interestType || !Object.values(UNIFIED_INTEREST_TYPES).includes(leadData.interestType)) {
    errors.interestType = 'Tipo de interesse é obrigatório';
  }
  
  // Faixa de orçamento
  if (!leadData.budgetRange || !Object.keys(UNIFIED_BUDGET_RANGES).includes(leadData.budgetRange)) {
    errors.budgetRange = 'Faixa de orçamento é obrigatória';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    formattedData: {
      ...leadData,
      phone: phoneValidation.isValid ? phoneValidation.formatted : leadData.phone,
      email: emailValidation.isValid ? emailValidation.formatted : leadData.email
    }
  };
};

/**
 * Validador principal para clientes
 */
export const validateClient = (clientData) => {
  const errors = {};
  
  // Validações básicas (mesmo que lead)
  const leadValidation = validateLead(clientData);
  Object.assign(errors, leadValidation.errors);
  
  // NIF (se fornecido)
  if (clientData.nif) {
    const nifValidation = validateNIF(clientData.nif);
    if (!nifValidation.isValid) {
      errors.nif = nifValidation.message;
    }
  }
  
  // Data de nascimento (se fornecida)
  if (clientData.dateOfBirth) {
    const birthValidation = validateBirthDate(clientData.dateOfBirth);
    if (!birthValidation.isValid) {
      errors.dateOfBirth = birthValidation.message;
    }
  }
  
  // Morada (se fornecida)
  if (clientData.address) {
    if (clientData.address.postalCode) {
      const postalValidation = validatePostalCode(clientData.address.postalCode);
      if (!postalValidation.isValid) {
        errors['address.postalCode'] = postalValidation.message;
      }
    }
  }
  
  // Cônjuge (se fornecido)
  if (clientData.spouse && clientData.spouse.nif) {
    const spouseNifValidation = validateNIF(clientData.spouse.nif);
    if (!spouseNifValidation.isValid) {
      errors['spouse.nif'] = `NIF do cônjuge: ${spouseNifValidation.message}`;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    formattedData: leadValidation.formattedData
  };
};

/**
 * Validador para oportunidades
 */
export const validateOpportunity = (opportunityData) => {
  const errors = {};
  
  // Título obrigatório
  if (!opportunityData.title || opportunityData.title.trim().length < 3) {
    errors.title = 'Título deve ter pelo menos 3 caracteres';
  }
  
  // Cliente obrigatório
  if (!opportunityData.clientId) {
    errors.clientId = 'Cliente é obrigatório';
  }
  
  // Valor estimado (se fornecido)
  if (opportunityData.estimatedValue) {
    const valueValidation = validateCurrency(opportunityData.estimatedValue);
    if (!valueValidation.isValid) {
      errors.estimatedValue = valueValidation.message;
    }
  }
  
  // Percentagem de comissão (se fornecida)
  if (opportunityData.commissionPercentage) {
    const commissionValidation = validateCommissionPercentage(opportunityData.commissionPercentage);
    if (!commissionValidation.isValid) {
      errors.commissionPercentage = commissionValidation.message;
    }
  }
  
  // Data de fecho esperada
  if (opportunityData.expectedCloseDate) {
    const closeDate = new Date(opportunityData.expectedCloseDate);
    const today = new Date();
    
    if (closeDate <= today) {
      errors.expectedCloseDate = 'Data de fecho deve ser no futuro';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validador para negócios
 */
export const validateDeal = (dealData) => {
  const errors = {};
  
  // Validações básicas de oportunidade
  const opportunityValidation = validateOpportunity(dealData);
  Object.assign(errors, opportunityValidation.errors);
  
  // Valor do negócio obrigatório
  if (!dealData.dealValue || dealData.dealValue <= 0) {
    errors.dealValue = 'Valor do negócio é obrigatório e deve ser maior que zero';
  } else {
    const valueValidation = validateCurrency(dealData.dealValue);
    if (!valueValidation.isValid) {
      errors.dealValue = valueValidation.message;
    }
  }
  
  // Validar tranches de pagamento (se fornecidas)
  if (dealData.paymentTranches && dealData.paymentTranches.length > 0) {
    const totalPercentage = dealData.paymentTranches.reduce((sum, tranche) => sum + (tranche.percentage || 0), 0);
    
    if (Math.abs(totalPercentage - 100) > 0.01) {
      errors.paymentTranches = 'Total das percentagens das tranches deve ser 100%';
    }
    
    dealData.paymentTranches.forEach((tranche, index) => {
      if (!tranche.amount || tranche.amount <= 0) {
        errors[`tranche_${index}_amount`] = `Valor da tranche ${index + 1} é obrigatório`;
      }
      
      if (!tranche.dueDate) {
        errors[`tranche_${index}_dueDate`] = `Data de vencimento da tranche ${index + 1} é obrigatória`;
      }
    });
  }
  
  // Validar sequência de datas legais (se fornecidas)
  if (dealData.legalDates) {
    const dateValidation = validateLegalDateSequence(dealData.legalDates);
    if (!dateValidation.isValid) {
      errors.legalDates = dateValidation.errors.join(', ');
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// 🔍 VALIDADOR DE DUPLICADOS
// ==========================

/**
 * Detectar duplicados por telefone ou email
 */
export const validateForDuplicates = async (data, existingRecords, excludeId = null) => {
  const duplicates = [];
  
  const phoneValidation = validatePortuguesePhone(data.phone);
  const emailValidation = validateEmail(data.email);
  
  if (!phoneValidation.isValid && !emailValidation.isValid) {
    return { hasDuplicates: false, duplicates: [] };
  }
  
  const normalizedPhone = phoneValidation.isValid ? 
    data.phone.replace(/[\s\-\+]/g, '').replace(/^(351|00351)/, '') : null;
  const normalizedEmail = emailValidation.isValid ? 
    data.email.toLowerCase().trim() : null;
  
  existingRecords.forEach(record => {
    if (excludeId && record.id === excludeId) return;
    
    let isDuplicate = false;
    let duplicateField = null;
    
    // Verificar telefone
    if (normalizedPhone && record.phone) {
      const recordPhone = record.phone.replace(/[\s\-\+]/g, '').replace(/^(351|00351)/, '');
      if (recordPhone === normalizedPhone) {
        isDuplicate = true;
        duplicateField = 'phone';
      }
    }
    
    // Verificar email
    if (normalizedEmail && record.email) {
      const recordEmail = record.email.toLowerCase().trim();
      if (recordEmail === normalizedEmail) {
        isDuplicate = true;
        duplicateField = 'email';
      }
    }
    
    if (isDuplicate) {
      duplicates.push({
        ...record,
        duplicateField,
        similarity: duplicateField === 'phone' ? 'Telefone idêntico' : 'Email idêntico'
      });
    }
  });
  
  return {
    hasDuplicates: duplicates.length > 0,
    duplicates,
    recommendation: duplicates.length > 0 ? 
      'Foram encontrados registos similares. Verifique se não é um duplicado.' : 
      'Nenhum duplicado encontrado.'
  };
};

// 🚀 VALIDADOR UNIVERSAL
// ======================

/**
 * Validador principal que escolhe automaticamente o tipo correto
 */
export const validateRecord = (data, recordType, existingRecords = []) => {
  let validation;
  
  switch (recordType) {
    case 'lead':
      validation = validateLead(data);
      break;
    case 'client':
      validation = validateClient(data);
      break;
    case 'opportunity':
      validation = validateOpportunity(data);
      break;
    case 'deal':
      validation = validateDeal(data);
      break;
    default:
      validation = { isValid: false, errors: { general: 'Tipo de registo não suportado' } };
  }
  
  // Adicionar validação de duplicados se há registos existentes
  if (validation.isValid && existingRecords.length > 0) {
    return validateForDuplicates(data, existingRecords).then(duplicateCheck => ({
      ...validation,
      duplicateCheck
    }));
  }
  
  return Promise.resolve(validation);
};

// 📊 UTILITÁRIOS DE FORMATAÇÃO
// ============================

/**
 * Formatar dados após validação
 */
export const formatValidatedData = (data, validationResult) => {
  if (!validationResult.isValid) {
    return data;
  }
  
  const formatted = { ...data };
  
  // Formatar telefone
  if (data.phone) {
    const phoneValidation = validatePortuguesePhone(data.phone);
    if (phoneValidation.isValid) {
      formatted.phone = phoneValidation.formatted;
    }
  }
  
  // Formatar email
  if (data.email) {
    const emailValidation = validateEmail(data.email);
    if (emailValidation.isValid) {
      formatted.email = emailValidation.formatted;
    }
  }
  
  // Formatar NIF
  if (data.nif) {
    const nifValidation = validateNIF(data.nif);
    if (nifValidation.isValid) {
      formatted.nif = nifValidation.formatted;
    }
  }
  
  // Formatar código postal
  if (data.address && data.address.postalCode) {
    const postalValidation = validatePostalCode(data.address.postalCode);
    if (postalValidation.isValid) {
      formatted.address.postalCode = postalValidation.formatted;
    }
  }
  
  return formatted;
};

// 🎯 EXPORTAÇÃO FINAL
// ===================
export default {
  // Patterns
  PORTUGUESE_PHONE_PATTERNS,
  NIF_PATTERN,
  POSTAL_CODE_PATTERN,
  EMAIL_PATTERN,
  IBAN_PORTUGAL_PATTERN,
  CC_PATTERN,
  NIB_PATTERN,
  PROPERTY_REFERENCE_PATTERN,
  HABITACAO_LICENSE_PATTERN,
  ENERGY_CERTIFICATE_PATTERN,
  CURRENCY_PATTERN,
  PERCENTAGE_PATTERN,
  
  // Configurações
  VALIDATION_CONFIG,
  
  // Validações básicas
  validateNIF,
  validatePortuguesePhone,
  validateEmail,
  validatePostalCode,
  validateIBAN,
  
  // Validações financeiras
  validateCurrency,
  validateCommissionPercentage,
  calculateIMT,
  calculateStampDuty,
  
  // Validações de datas
  validateBirthDate,
  validateLegalDateSequence,
  
  // Validações imobiliárias
  validatePropertyCharacteristics,
  validatePropertyReference,
  
  // Validações de formulário
  validateLead,
  validateClient,
  validateOpportunity,
  validateDeal,
  
  // Validações de duplicados
  validateForDuplicates,
  
  // Validador universal
  validateRecord,
  
  // Utilitários
  formatValidatedData
};