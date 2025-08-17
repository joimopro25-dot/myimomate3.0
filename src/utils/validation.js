// src/utils/validation.js

/**
 * Utilitários de Validação para MyImoMate 3.0
 * Funções reutilizáveis para validação de formulários
 */

// Regex patterns
export const PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[0-9+\s()-]{9,}$/,
  postalCode: /^\d{4}-\d{3}$/,
  nif: /^\d{9}$/,
  iban: /^PT50\d{19}$/,
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  onlyLetters: /^[A-Za-zÀ-ÿ\s]+$/,
  onlyNumbers: /^\d+$/,
  alphanumeric: /^[A-Za-z0-9]+$/
};

// Mensagens de erro padrão
export const ERROR_MESSAGES = {
  required: 'Este campo é obrigatório',
  email: 'Email inválido',
  phone: 'Número de telefone inválido',
  postalCode: 'Código postal deve ter o formato 0000-000',
  nif: 'NIF deve ter 9 dígitos',
  iban: 'IBAN português inválido',
  passwordTooShort: 'Password deve ter pelo menos 6 caracteres',
  passwordTooWeak: 'Password deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo',
  passwordsNotMatch: 'Passwords não coincidem',
  minLength: (min) => `Deve ter pelo menos ${min} caracteres`,
  maxLength: (max) => `Não pode exceder ${max} caracteres`,
  minValue: (min) => `Valor mínimo é ${min}`,
  maxValue: (max) => `Valor máximo é ${max}`,
  invalidFormat: 'Formato inválido',
  futureDate: 'Data deve ser no futuro',
  pastDate: 'Data deve ser no passado',
  invalidAge: 'Idade deve estar entre 18 e 120 anos'
};

/**
 * Validação de campo obrigatório
 */
export const isRequired = (value, message = ERROR_MESSAGES.required) => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return message;
  }
  return null;
};

/**
 * Validação de email
 */
export const isValidEmail = (email, message = ERROR_MESSAGES.email) => {
  if (!email) return null; // Allow empty for optional fields
  
  if (!PATTERNS.email.test(email)) {
    return message;
  }
  return null;
};

/**
 * Validação de telefone português
 */
export const isValidPhone = (phone, message = ERROR_MESSAGES.phone) => {
  if (!phone) return null; // Allow empty for optional fields
  
  // Remove spaces and special characters for validation
  const cleanPhone = phone.replace(/\s/g, '');
  
  // Check Portuguese mobile numbers (9 digits starting with 9)
  // or landline numbers (9 digits starting with 2)
  // or international format
  const portuguesePatterns = [
    /^9[0-9]{8}$/, // Mobile: 9XXXXXXXX
    /^2[0-9]{8}$/, // Landline: 2XXXXXXXX
    /^\+351[0-9]{9}$/, // International: +351XXXXXXXXX
    /^00351[0-9]{9}$/ // International: 00351XXXXXXXXX
  ];
  
  const isValid = portuguesePatterns.some(pattern => pattern.test(cleanPhone));
  
  if (!isValid) {
    return message;
  }
  return null;
};

/**
 * Validação de código postal português
 */
export const isValidPostalCode = (postalCode, message = ERROR_MESSAGES.postalCode) => {
  if (!postalCode) return null;
  
  if (!PATTERNS.postalCode.test(postalCode)) {
    return message;
  }
  return null;
};

/**
 * Validação de NIF português
 */
export const isValidNIF = (nif, message = ERROR_MESSAGES.nif) => {
  if (!nif) return null;
  
  // Remove any spaces or dashes
  const cleanNIF = nif.replace(/[\s-]/g, '');
  
  if (!PATTERNS.nif.test(cleanNIF)) {
    return message;
  }
  
  // Algorithm to validate Portuguese NIF
  const digits = cleanNIF.split('').map(Number);
  const checkDigit = digits[8];
  
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += digits[i] * (9 - i);
  }
  
  const remainder = sum % 11;
  const expectedCheckDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (checkDigit !== expectedCheckDigit) {
    return 'NIF inválido';
  }
  
  return null;
};

/**
 * Validação de password básica
 */
export const isValidPassword = (password, minLength = 6) => {
  if (!password) {
    return ERROR_MESSAGES.required;
  }
  
  if (password.length < minLength) {
    return ERROR_MESSAGES.passwordTooShort;
  }
  
  return null;
};

/**
 * Validação de password forte
 */
export const isStrongPassword = (password) => {
  if (!password) {
    return ERROR_MESSAGES.required;
  }
  
  if (password.length < 8) {
    return ERROR_MESSAGES.passwordTooWeak;
  }
  
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[@$!%*?&]/.test(password);
  
  if (!hasLower || !hasUpper || !hasNumber || !hasSymbol) {
    return ERROR_MESSAGES.passwordTooWeak;
  }
  
  return null;
};

/**
 * Validação de confirmação de password
 */
export const passwordsMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return ERROR_MESSAGES.required;
  }
  
  if (password !== confirmPassword) {
    return ERROR_MESSAGES.passwordsNotMatch;
  }
  
  return null;
};

/**
 * Validação de comprimento mínimo
 */
export const minLength = (value, min) => {
  if (!value) return null;
  
  if (value.length < min) {
    return ERROR_MESSAGES.minLength(min);
  }
  return null;
};

/**
 * Validação de comprimento máximo
 */
export const maxLength = (value, max) => {
  if (!value) return null;
  
  if (value.length > max) {
    return ERROR_MESSAGES.maxLength(max);
  }
  return null;
};

/**
 * Validação de valor numérico mínimo
 */
export const minValue = (value, min) => {
  if (!value) return null;
  
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue < min) {
    return ERROR_MESSAGES.minValue(min);
  }
  return null;
};

/**
 * Validação de valor numérico máximo
 */
export const maxValue = (value, max) => {
  if (!value) return null;
  
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue > max) {
    return ERROR_MESSAGES.maxValue(max);
  }
  return null;
};

/**
 * Validação de data futura
 */
export const isFutureDate = (date, message = ERROR_MESSAGES.futureDate) => {
  if (!date) return null;
  
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to compare only dates
  
  if (inputDate <= today) {
    return message;
  }
  return null;
};

/**
 * Validação de data passada
 */
export const isPastDate = (date, message = ERROR_MESSAGES.pastDate) => {
  if (!date) return null;
  
  const inputDate = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  if (inputDate >= today) {
    return message;
  }
  return null;
};

/**
 * Validação de idade
 */
export const isValidAge = (birthDate, minAge = 18, maxAge = 120) => {
  if (!birthDate) return null;
  
  const birth = new Date(birthDate);
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  if (age < minAge || age > maxAge) {
    return ERROR_MESSAGES.invalidAge;
  }
  
  return null;
};

/**
 * Validação de URL
 */
export const isValidURL = (url, message = 'URL inválida') => {
  if (!url) return null;
  
  try {
    new URL(url);
    return null;
  } catch {
    return message;
  }
};

/**
 * Validação de formato monetário
 */
export const isValidCurrency = (value, message = 'Valor monetário inválido') => {
  if (!value) return null;
  
  // Allow formats: 123, 123.45, 123,45, €123, 123€
  const cleanValue = value.toString().replace(/[€\s]/g, '').replace(',', '.');
  const numValue = parseFloat(cleanValue);
  
  if (isNaN(numValue) || numValue < 0) {
    return message;
  }
  
  return null;
};

/**
 * Validador composto para múltiplas validações
 */
export const validate = (value, validators) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) {
      return error;
    }
  }
  return null;
};

/**
 * Validação de formulário completo
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = formData[field];
    
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Utilitários específicos para o domínio imobiliário
 */
export const RealEstateValidators = {
  /**
   * Validação de preço de imóvel
   */
  propertyPrice: (price) => {
    const error = isValidCurrency(price);
    if (error) return error;
    
    const numPrice = parseFloat(price.toString().replace(/[€\s,]/g, '').replace(',', '.'));
    if (numPrice < 1000) {
      return 'Preço deve ser superior a €1.000';
    }
    if (numPrice > 10000000) {
      return 'Preço deve ser inferior a €10.000.000';
    }
    return null;
  },

  /**
   * Validação de área de imóvel
   */
  propertyArea: (area) => {
    if (!area) return null;
    
    const numArea = parseFloat(area);
    if (isNaN(numArea) || numArea <= 0) {
      return 'Área deve ser um número positivo';
    }
    if (numArea > 10000) {
      return 'Área não pode exceder 10.000 m²';
    }
    return null;
  },

  /**
   * Validação de número de quartos
   */
  bedrooms: (bedrooms) => {
    if (!bedrooms) return null;
    
    const numBedrooms = parseInt(bedrooms);
    if (isNaN(numBedrooms) || numBedrooms < 0 || numBedrooms > 20) {
      return 'Número de quartos deve estar entre 0 e 20';
    }
    return null;
  },

  /**
   * Validação de licença de utilização
   */
  utilizationLicense: (license) => {
    if (!license) return null;
    
    // Format: 123/2020 or 123/20
    const licensePattern = /^\d{1,4}\/\d{2,4}$/;
    if (!licensePattern.test(license)) {
      return 'Licença deve ter o formato 123/2020';
    }
    return null;
  }
};

/**
 * Validadores específicos para CRM
 */
export const CRMValidators = {
  /**
   * Validação de lead source
   */
  leadSource: (source) => {
    const validSources = [
      'website', 'facebook', 'google', 'referral', 
      'phone', 'email', 'walk-in', 'other'
    ];
    
    if (source && !validSources.includes(source)) {
      return 'Fonte de lead inválida';
    }
    return null;
  },

  /**
   * Validação de prioridade
   */
  priority: (priority) => {
    const validPriorities = ['baixa', 'média', 'alta', 'urgente'];
    
    if (priority && !validPriorities.includes(priority)) {
      return 'Prioridade inválida';
    }
    return null;
  },

  /**
   * Validação de estado de negócio
   */
  dealStatus: (status) => {
    const validStatuses = [
      'prospecting', 'qualification', 'proposal', 
      'negotiation', 'closing', 'won', 'lost'
    ];
    
    if (status && !validStatuses.includes(status)) {
      return 'Estado de negócio inválido';
    }
    return null;
  }
};

// Export default object with all validators
export default {
  PATTERNS,
  ERROR_MESSAGES,
  isRequired,
  isValidEmail,
  isValidPhone,
  isValidPostalCode,
  isValidNIF,
  isValidPassword,
  isStrongPassword,
  passwordsMatch,
  minLength,
  maxLength,
  minValue,
  maxValue,
  isFutureDate,
  isPastDate,
  isValidAge,
  isValidURL,
  isValidCurrency,
  validate,
  validateForm,
  RealEstateValidators,
  CRMValidators
};