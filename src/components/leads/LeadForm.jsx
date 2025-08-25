// src/components/leads/LeadForm.jsx - VERSÃO CORRIGIDA COM SEGURANÇA TOTAL
// 🛡️ CORREÇÃO: Verificações de segurança para campos undefined na edição
// ✅ REGRA DE MESTRE: TODAS as funcionalidades mantidas (100%)
// ✅ CORREÇÃO ESPECÍFICA: Linha 583 - processamento seguro de tags
// ✅ CAMPOS DE EDIÇÃO: Exatamente iguais aos de criação (nova lead)

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedButton } from '../common/ThemedComponents';

// ✅ IMPORTS DIRETOS DAS CONSTANTES (MANTIDO)
import {
  UNIFIED_INTEREST_TYPES,
  UNIFIED_INTEREST_LABELS,
  UNIFIED_BUDGET_RANGES,
  UNIFIED_PRIORITIES,
  UNIFIED_LEAD_SOURCES,
  UNIFIED_CONTACT_TIMES,
  getInterestTypeLabel,
  getBudgetRangeLabel
} from '../../constants/unifiedTypes.js';

// ✅ HOOK SÓ PARA AÇÕES E VALIDAÇÕES (MANTIDO)
import useLeads from '../../hooks/useLeads';

const LeadForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  showPreview = true,
  compactMode = false,
  autoFocus = true,
  submitButtonText = 'Criar Lead'
}) => {
  const { theme } = useTheme();
  
  // Hook de leads para validações e duplicados (MANTIDO)
  const {
    createLead,
    checkForDuplicates,
    CLIENT_TYPES,      
    PROPERTY_STATUS,   
    isValidEmail,
    isValidPhone,
    creating,
    duplicateCheck
  } = useLeads();

  // ✅ CONSTANTES SEGURAS COM FALLBACKS (MANTIDAS)
  const safeInterestTypes = UNIFIED_INTEREST_TYPES || {
    COMPRA_CASA: 'compra_casa',
    COMPRA_APARTAMENTO: 'compra_apartamento',
    VENDA_CASA: 'venda_casa',
    VENDA_APARTAMENTO: 'venda_apartamento',
    ARRENDAMENTO_CASA: 'arrendamento_casa',
    INVESTIMENTO: 'investimento'
  };

  const safeBudgetRanges = UNIFIED_BUDGET_RANGES || {
    'ate_50k': 'Até €50.000',
    '50k_100k': '€50.000 - €100.000',
    '100k_150k': '€100.000 - €150.000',
    'indefinido': 'A definir'
  };

  const safePriorities = UNIFIED_PRIORITIES || {
    BAIXA: 'baixa',
    NORMAL: 'normal',
    ALTA: 'alta',
    URGENTE: 'urgente'
  };

  const safeLeadSources = UNIFIED_LEAD_SOURCES || {
    WEBSITE: 'website',
    TELEFONE: 'telefone',
    EMAIL: 'email',
    REFERENCIA: 'referencia',
    REDES_SOCIAIS: 'redes_sociais',
    MANUAL: 'manual'
  };

  const safeContactTimes = UNIFIED_CONTACT_TIMES || {
    MANHA: 'manha',
    TARDE: 'tarde',
    NOITE: 'noite',
    QUALQUER_ALTURA: 'qualquer_altura'
  };

  // ✅ FUNÇÃO AUXILIAR PARA STRINGS SEGURAS (NOVA - CORREÇÃO PRINCIPAL)
  const safeString = (value) => {
    return (value !== null && value !== undefined) ? String(value) : '';
  };

  // ✅ FUNÇÃO AUXILIAR PARA BOOLEANS SEGUROS (NOVA)
  const safeBool = (value) => {
    return Boolean(value);
  };

  // ✅ ESTADOS DO FORMULÁRIO (MANTIDOS TODOS)
  const [formData, setFormData] = useState({
    // CAMPOS BÁSICOS 
    name: '',
    phone: '',
    email: '',
    interestType: safeInterestTypes?.COMPRA_CASA || 'compra_casa',
    budgetRange: 'indefinido',
    location: '',
    notes: '',
    source: 'manual',
    priority: 'normal',
    preferredContactTime: 'qualquer_altura',
    clientType: CLIENT_TYPES?.COMPRADOR || 'comprador',
    
    // CAMPOS DO IMÓVEL
    propertyStatus: PROPERTY_STATUS?.NAO_IDENTIFICADO || 'nao_identificado',
    propertyReference: '',
    propertyLink: '',
    propertyType: '',
    propertyFeatures: '',
    visitScheduled: false,
    visitDate: '',
    visitNotes: '',
    
    // CAMPOS DO GESTOR
    managerName: '',
    managerPhone: '',
    managerEmail: '',
    managerCompany: '',
    managerNotes: '',
    managerContactPreference: 'phone',
    lastManagerContact: '',
    
    // CAMPOS PESSOAIS
    profession: '',
    company: '',
    languagePreference: 'pt',
    contactPreference: 'phone',
    
    // CAMPOS FINANCEIROS
    employmentStatus: '',
    monthlyIncome: '',
    hasPreApproval: false,
    bankName: '',
    
    // CAMPOS TÉCNICOS
    sourceDetails: '',
    referredBy: '',
    campaignId: '',
    utmSource: '',
    leadScore: 0,
    qualificationLevel: 'nao_qualificado',
    urgency: 'normal',
    timeline: '',
    internalNotes: '',
    tags: '', // ⚠️ CAMPO CRÍTICO - sempre string vazia por padrão
    followUpDate: '',
    
    // OPT-INS
    newsletterOptIn: false,
    smsOptIn: false,
    whatsappOptIn: false,
    marketingOptIn: false,
    
    // METADADOS
    deviceType: /Mobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
    browserLanguage: navigator.language || 'pt',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Lisbon'
  });

  // Estados auxiliares (MANTIDOS)
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [showAllSections, setShowAllSections] = useState(false);

  // ✅ INICIALIZAÇÃO COM DADOS EXISTENTES (CORRIGIDA COM SEGURANÇA TOTAL)
  useEffect(() => {
    if (initialData) {
      console.log('🔄 Inicializando formulário com dados existentes:', initialData);
      
      setFormData({
        // CAMPOS BÁSICOS COM VERIFICAÇÕES DE SEGURANÇA
        name: safeString(initialData.name),
        phone: safeString(initialData.phone),
        email: safeString(initialData.email),
        interestType: initialData.interestType || safeInterestTypes?.COMPRA_CASA || 'compra_casa',
        budgetRange: initialData.budgetRange || 'indefinido',
        location: safeString(initialData.location),
        notes: safeString(initialData.notes),
        source: initialData.source || 'manual',
        priority: initialData.priority || 'normal',
        preferredContactTime: initialData.preferredContactTime || 'qualquer_altura',
        clientType: initialData.clientType || CLIENT_TYPES?.COMPRADOR || 'comprador',
        
        // CAMPOS DO IMÓVEL COM SEGURANÇA
        propertyStatus: initialData.propertyStatus || PROPERTY_STATUS?.NAO_IDENTIFICADO || 'nao_identificado',
        propertyReference: safeString(initialData.propertyReference),
        propertyLink: safeString(initialData.propertyLink),
        propertyType: safeString(initialData.propertyType),
        propertyFeatures: safeString(initialData.propertyFeatures),
        visitScheduled: safeBool(initialData.visitScheduled),
        visitDate: safeString(initialData.visitDate),
        visitNotes: safeString(initialData.visitNotes),
        
        // CAMPOS DO GESTOR COM SEGURANÇA
        managerName: safeString(initialData.managerName),
        managerPhone: safeString(initialData.managerPhone),
        managerEmail: safeString(initialData.managerEmail),
        managerCompany: safeString(initialData.managerCompany),
        managerNotes: safeString(initialData.managerNotes),
        managerContactPreference: initialData.managerContactPreference || 'phone',
        lastManagerContact: safeString(initialData.lastManagerContact),
        
        // CAMPOS PESSOAIS COM SEGURANÇA
        profession: safeString(initialData.profession),
        company: safeString(initialData.company),
        languagePreference: initialData.languagePreference || 'pt',
        contactPreference: initialData.contactPreference || 'phone',
        
        // CAMPOS FINANCEIROS COM SEGURANÇA
        employmentStatus: safeString(initialData.employmentStatus),
        monthlyIncome: safeString(initialData.monthlyIncome),
        hasPreApproval: safeBool(initialData.hasPreApproval),
        bankName: safeString(initialData.bankName),
        
        // CAMPOS TÉCNICOS COM SEGURANÇA
        sourceDetails: safeString(initialData.sourceDetails),
        referredBy: safeString(initialData.referredBy),
        campaignId: safeString(initialData.campaignId),
        utmSource: safeString(initialData.utmSource),
        leadScore: initialData.leadScore || 0,
        qualificationLevel: initialData.qualificationLevel || 'nao_qualificado',
        urgency: initialData.urgency || 'normal',
        timeline: safeString(initialData.timeline),
        internalNotes: safeString(initialData.internalNotes),
        tags: safeString(initialData.tags), // 🛡️ CORREÇÃO CRÍTICA - sempre string
        followUpDate: safeString(initialData.followUpDate),
        
        // OPT-INS COM SEGURANÇA
        newsletterOptIn: safeBool(initialData.newsletterOptIn),
        smsOptIn: safeBool(initialData.smsOptIn),
        whatsappOptIn: safeBool(initialData.whatsappOptIn),
        marketingOptIn: safeBool(initialData.marketingOptIn),
        
        // METADADOS MANTIDOS
        deviceType: initialData.deviceType || (/Mobile/.test(navigator.userAgent) ? 'mobile' : 'desktop'),
        browserLanguage: initialData.browserLanguage || navigator.language || 'pt',
        timezone: initialData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Lisbon'
      });
      
      console.log('✅ Formulário inicializado com segurança total');
    }
  }, [initialData, CLIENT_TYPES, PROPERTY_STATUS, safeInterestTypes]);

  // Atualizar campo individual (MANTIDA)
  const updateField = useCallback((fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Limpar erro se o campo foi preenchido
    if (value && errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
    
    // Marcar como touched
    setTouched(prev => ({
      ...prev,
      [fieldName]: true
    }));
  }, [errors]);

  // Verificação de duplicados (MANTIDA)
  useEffect(() => {
    const checkDuplicatesDebounced = async () => {
      if ((formData.phone && formData.phone.length >= 9) || 
          (formData.email && formData.email.includes('@'))) {
        try {
          const found = await checkForDuplicates({
            phone: formData.phone,
            email: formData.email
          });
          
          if (found.length > 0) {
            setDuplicates(found);
            setShowDuplicateWarning(true);
          } else {
            setDuplicates([]);
            setShowDuplicateWarning(false);
          }
        } catch (error) {
          console.error('Erro ao verificar duplicados:', error);
        }
      }
    };

    const timeoutId = setTimeout(checkDuplicatesDebounced, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.phone, formData.email, checkForDuplicates]);

  // Validação do formulário (MANTIDA)
  const validateForm = () => {
    const newErrors = {};

    // Validar nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar contacto (pelo menos um)
    if (!formData.phone && !formData.email) {
      newErrors.phone = 'Telefone ou email é obrigatório';
      newErrors.email = 'Telefone ou email é obrigatório';
    }

    // Validar telefone se fornecido
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Formato de telefone inválido';
    }

    // Validar email se fornecido
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    // Validar interesse
    if (!formData.interestType) {
      newErrors.interestType = 'Tipo de interesse é obrigatório';
    }

    // Validar URL da propriedade se fornecida
    if (formData.propertyLink && formData.propertyLink.trim() && 
        !formData.propertyLink.match(/^https?:\/\/.+/)) {
      newErrors.propertyLink = 'URL deve ser válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ SUBMISSÃO COM PROCESSAMENTO SEGURO DE TAGS (CORREÇÃO DA LINHA 583)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setActiveSection('basic');
      return;
    }

    // 🛡️ PREPARAÇÃO DE DADOS COM SEGURANÇA TOTAL (CORREÇÃO CRÍTICA)
    const finalData = {
      ...formData,
      name: safeString(formData.name).trim(),
      phone: safeString(formData.phone).trim(),
      email: safeString(formData.email).toLowerCase().trim(),
      location: safeString(formData.location).trim(),
      notes: safeString(formData.notes).trim(),
      
      // CAMPOS DO GESTOR COM SEGURANÇA
      managerName: safeString(formData.managerName).trim(),
      managerPhone: safeString(formData.managerPhone).trim(),
      managerEmail: safeString(formData.managerEmail).toLowerCase().trim(),
      managerNotes: safeString(formData.managerNotes).trim(),
      propertyReference: safeString(formData.propertyReference).trim(),
      propertyLink: safeString(formData.propertyLink).trim(),
      
      // 🛡️ TAGS PROCESSADAS COM SEGURANÇA TOTAL (CORREÇÃO DA LINHA 583)
      tags: safeString(formData.tags).trim() ? 
            safeString(formData.tags).split(',').map(tag => safeString(tag).trim()).filter(Boolean) : 
            [],
      
      // METADADOS TÉCNICOS
      userAgent: navigator.userAgent,
      formVersion: '3.1-expanded-safe',
      submittedAt: new Date().toISOString(),
      lastModified: initialData ? new Date().toISOString() : undefined
    };

    console.log('📤 Submetendo dados do formulário:', finalData);
    await onSubmit(finalData);
  };

  // Reset do formulário (MANTIDO)
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      interestType: safeInterestTypes?.COMPRA_CASA || 'compra_casa',
      budgetRange: 'indefinido',
      location: '',
      notes: '',
      source: 'manual',
      priority: 'normal',
      preferredContactTime: 'qualquer_altura',
      clientType: CLIENT_TYPES?.COMPRADOR || 'comprador',
      propertyStatus: PROPERTY_STATUS?.NAO_IDENTIFICADO || 'nao_identificado',
      propertyReference: '',
      propertyLink: '',
      propertyType: '',
      propertyFeatures: '',
      visitScheduled: false,
      visitDate: '',
      visitNotes: '',
      managerName: '',
      managerPhone: '',
      managerEmail: '',
      managerCompany: '',
      managerNotes: '',
      managerContactPreference: 'phone',
      lastManagerContact: '',
      profession: '',
      company: '',
      languagePreference: 'pt',
      contactPreference: 'phone',
      employmentStatus: '',
      monthlyIncome: '',
      hasPreApproval: false,
      bankName: '',
      sourceDetails: '',
      referredBy: '',
      campaignId: '',
      utmSource: '',
      leadScore: 0,
      qualificationLevel: 'nao_qualificado',
      urgency: 'normal',
      timeline: '',
      internalNotes: '',
      tags: '', // 🛡️ SEMPRE STRING VAZIA
      followUpDate: '',
      newsletterOptIn: false,
      smsOptIn: false,
      whatsappOptIn: false,
      marketingOptIn: false,
      deviceType: /Mobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
      browserLanguage: navigator.language || 'pt',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Lisbon'
    });
    setErrors({});
    setTouched({});
    setDuplicates([]);
    setShowDuplicateWarning(false);
    setActiveSection('basic');
  };

  // Validação contínua (MANTIDA)
  useEffect(() => {
    const hasRequiredFields = formData.name.trim() && 
                             (formData.phone || formData.email) &&
                             formData.interestType;
    const hasNoErrors = Object.keys(errors).length === 0;
    setIsValid(hasRequiredFields && hasNoErrors);
  }, [formData, errors]);

  // Helper functions (MANTIDAS)
  const getInterestTypeLabelSafe = (type) => {
    return UNIFIED_INTEREST_LABELS?.[type] || getInterestTypeLabel(type) || type;
  };

  const getClientTypeLabel = (type) => {
    const labels = {
      'comprador': 'Comprador',
      'arrendatario': 'Arrendatário',
      'inquilino': 'Inquilino',
      'vendedor': 'Vendedor',
      'senhorio': 'Senhorio',
      'investidor': 'Investidor'
    };
    return labels[type] || type;
  };

  const getPropertyStatusLabel = (status) => {
    const labels = {
      'nao_identificado': 'Não Identificado',
      'identificado': 'Identificado',
      'visitado': 'Visitado',
      'rejeitado': 'Rejeitado',
      'aprovado': 'Aprovado'
    };
    return labels[status] || status;
  };

  // Seções do formulário (MANTIDAS)
  const sections = [
    {
      id: 'basic',
      title: 'Básico',
      required: true,
      fields: ['name', 'clientType', 'phone', 'email', 'interestType', 'budgetRange']
    },
    {
      id: 'property',
      title: 'Imóvel',
      required: false,
      fields: ['propertyStatus', 'propertyReference', 'propertyLink', 'propertyType']
    },
    {
      id: 'manager',
      title: 'Gestor',
      required: false,
      fields: ['managerName', 'managerPhone', 'managerEmail', 'managerCompany']
    },
    {
      id: 'personal',
      title: 'Pessoal',
      required: false,
      fields: ['profession', 'company', 'preferredContactTime', 'contactPreference']
    },
    {
      id: 'extra',
      title: 'Extra',
      required: false,
      fields: ['notes', 'internalNotes', 'tags', 'urgency']
    }
  ];

  // ✅ RENDER DO COMPONENTE (MANTIDO 100% - TODAS AS SEÇÕES)
  return (
    <div className={`${theme?.cardBg || 'bg-white'} rounded-lg shadow-lg p-6 w-full max-w-4xl`}>
      
      {/* CABEÇALHO COM NAVEGAÇÃO */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {initialData ? 'Editar Lead' : 'Novo Lead'}
          </h3>
          
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowAllSections(!showAllSections)}
              className="text-sm px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {showAllSections ? 'Compactar' : 'Expandir'}
            </button>
            
            {!compactMode && (
              <button
                type="button"
                onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                {showAdvancedFields ? 'Campos Básicos' : 'Campos Avançados'}
              </button>
            )}
          </div>
        </div>

        {/* NAVEGAÇÃO POR SEÇÕES */}
        {!compactMode && (showAdvancedFields || showAllSections) && (
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {sections.map((section) => {
              const hasErrors = section.fields.some(field => errors[field] && touched[field]);
              const isComplete = section.fields.every(field => 
                !section.required || formData[field]
              );
              
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
                    ${activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : hasErrors
                      ? 'bg-red-50 text-red-700 hover:bg-red-100'
                      : isComplete
                      ? 'bg-green-50 text-green-700 hover:bg-green-100'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  {section.title} {section.required && '*'}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* AVISO DE DUPLICADOS */}
      {showDuplicateWarning && duplicates.length > 0 && (
        <div className="mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <span className="text-yellow-800 font-medium">⚠️ Possíveis duplicados encontrados</span>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-yellow-700">
                {duplicates.map((duplicate, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-yellow-100 rounded">
                    <span className="font-medium">{duplicate.name}</span>
                    <span className="text-xs bg-yellow-200 px-2 py-1 rounded">
                      {duplicate.type === 'client' ? '👤 Cliente' : '📋 Lead'} • 
                      {duplicate.duplicateField === 'phone' ? ' Mesmo telefone' : ' Mesmo email'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                Revise os dados antes de continuar ou confirme se é uma nova pessoa.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* FORMULÁRIO PRINCIPAL */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SEÇÃO: INFORMAÇÕES BÁSICAS */}
        {(activeSection === 'basic' || showAllSections || (!showAdvancedFields && !showAllSections)) && (
          <div className="space-y-4">
            {(showAdvancedFields || showAllSections) && (
              <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
                Informações Básicas *
              </h4>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Nome */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.name && touched.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nome completo do prospective cliente"
                  autoFocus={autoFocus}
                  required
                />
                {errors.name && touched.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Tipo de Cliente */}
              {(showAdvancedFields || showAllSections) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Cliente
                  </label>
                  <select
                    value={formData.clientType}
                    onChange={(e) => updateField('clientType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {CLIENT_TYPES && Object.entries(CLIENT_TYPES).map(([key, value]) => (
                      <option key={key} value={value}>
                        {getClientTypeLabel(value)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                  {duplicateCheck && formData.phone && (
                    <span className="text-blue-500 text-xs ml-2">🔍 Verificando...</span>
                  )}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.phone && touched.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="9XX XXX XXX"
                />
                {errors.phone && touched.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                  {duplicateCheck && formData.email && (
                    <span className="text-blue-500 text-xs ml-2">🔍 Verificando...</span>
                  )}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="email@exemplo.com"
                />
                {errors.email && touched.email && (
                  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Interesse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Interesse *
                </label>
                <select
                  value={formData.interestType}
                  onChange={(e) => updateField('interestType', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.interestType && touched.interestType ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  {safeInterestTypes && Object.entries(safeInterestTypes).map(([key, value]) => (
                    <option key={key} value={value}>
                      {getInterestTypeLabelSafe(value)}
                    </option>
                  ))}
                </select>
                {errors.interestType && touched.interestType && (
                  <p className="text-red-600 text-sm mt-1">{errors.interestType}</p>
                )}
              </div>

              {/* Orçamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Orçamento
                </label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => updateField('budgetRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(safeBudgetRanges).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Localização */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização Pretendida
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Cidade, distrito, zona..."
                />
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO: INFORMAÇÕES DO IMÓVEL */}
        {(activeSection === 'property' || showAllSections) && (showAdvancedFields || showAllSections) && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Informações do Imóvel
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Status do Imóvel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status do Imóvel
                </label>
                <select
                  value={formData.propertyStatus}
                  onChange={(e) => updateField('propertyStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {PROPERTY_STATUS && Object.entries(PROPERTY_STATUS).map(([key, value]) => (
                    <option key={key} value={value}>
                      {getPropertyStatusLabel(value)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo de Propriedade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Propriedade
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => updateField('propertyType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecionar...</option>
                  <option value="apartamento">Apartamento</option>
                  <option value="moradia">Moradia</option>
                  <option value="terreno">Terreno</option>
                  <option value="comercial">Comercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              {/* Referência da Propriedade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referência da Propriedade
                </label>
                <input
                  type="text"
                  value={formData.propertyReference}
                  onChange={(e) => updateField('propertyReference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: REF001, IMO123..."
                />
              </div>

              {/* Link da Propriedade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link da Propriedade
                </label>
                <input
                  type="url"
                  value={formData.propertyLink}
                  onChange={(e) => updateField('propertyLink', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.propertyLink && touched.propertyLink ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://exemplo.com/imovel"
                />
                {errors.propertyLink && touched.propertyLink && (
                  <p className="text-red-600 text-sm mt-1">{errors.propertyLink}</p>
                )}
              </div>

              {/* Características da Propriedade */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Características Específicas
                </label>
                <textarea
                  value={formData.propertyFeatures}
                  onChange={(e) => updateField('propertyFeatures', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="T3, garagem, terraço, piscina, etc..."
                />
              </div>

              {/* Visita Agendada */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="visitScheduled"
                    checked={formData.visitScheduled}
                    onChange={(e) => updateField('visitScheduled', e.target.checked)}
                    className="mr-2 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="visitScheduled" className="text-sm font-medium text-gray-700">
                    Visita Agendada
                  </label>
                </div>
              </div>

              {/* Data da Visita */}
              {formData.visitScheduled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data da Visita
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.visitDate}
                    onChange={(e) => updateField('visitDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Notas da Visita */}
              {formData.visitScheduled && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas da Visita
                  </label>
                  <textarea
                    value={formData.visitNotes}
                    onChange={(e) => updateField('visitNotes', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Observações sobre a visita..."
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEÇÃO: INFORMAÇÕES DO GESTOR */}
        {(activeSection === 'manager' || showAllSections) && (showAdvancedFields || showAllSections) && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Informações do Gestor/Intermediário
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Nome do Gestor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Gestor
                </label>
                <input
                  type="text"
                  value={formData.managerName}
                  onChange={(e) => updateField('managerName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do gestor ou intermediário"
                />
              </div>

              {/* Telefone do Gestor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone do Gestor
                </label>
                <input
                  type="tel"
                  value={formData.managerPhone}
                  onChange={(e) => updateField('managerPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="9XX XXX XXX"
                />
              </div>

              {/* Email do Gestor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email do Gestor
                </label>
                <input
                  type="email"
                  value={formData.managerEmail}
                  onChange={(e) => updateField('managerEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="gestor@empresa.com"
                />
              </div>

              {/* Empresa do Gestor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa/Agência
                </label>
                <input
                  type="text"
                  value={formData.managerCompany}
                  onChange={(e) => updateField('managerCompany', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da empresa ou agência"
                />
              </div>

              {/* Preferência de Contacto do Gestor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contacto Preferido (Gestor)
                </label>
                <select
                  value={formData.managerContactPreference}
                  onChange={(e) => updateField('managerContactPreference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="phone">Telefone</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                </select>
              </div>

              {/* Último Contacto com Gestor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Último Contacto com Gestor
                </label>
                <input
                  type="date"
                  value={formData.lastManagerContact}
                  onChange={(e) => updateField('lastManagerContact', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Notas do Gestor */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas sobre Gestor
                </label>
                <textarea
                  value={formData.managerNotes}
                  onChange={(e) => updateField('managerNotes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Observações sobre o gestor ou intermediário..."
                />
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO: INFORMAÇÕES PESSOAIS */}
        {(activeSection === 'personal' || showAllSections) && (showAdvancedFields || showAllSections) && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Informações Pessoais e de Contacto
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Profissão */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profissão
                </label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => updateField('profession', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Engenheiro, Professor..."
                />
              </div>

              {/* Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa onde Trabalha
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da empresa"
                />
              </div>

              {/* Preferência de Contacto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contacto Preferido
                </label>
                <select
                  value={formData.contactPreference}
                  onChange={(e) => updateField('contactPreference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="phone">Telefone</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                </select>
              </div>

              {/* Horário Preferido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário Preferido
                </label>
                <select
                  value={formData.preferredContactTime}
                  onChange={(e) => updateField('preferredContactTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(safeContactTimes).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value === 'manha' ? 'Manhã (9h-12h)' :
                       value === 'tarde' ? 'Tarde (14h-18h)' :
                       value === 'noite' ? 'Noite (18h-21h)' :
                       'Qualquer altura'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Idioma Preferido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Idioma Preferido
                </label>
                <select
                  value={formData.languagePreference}
                  onChange={(e) => updateField('languagePreference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pt">Português</option>
                  <option value="en">Inglês</option>
                  <option value="es">Espanhol</option>
                  <option value="fr">Francês</option>
                </select>
              </div>

              {/* Situação Laboral */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Situação Laboral
                </label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) => updateField('employmentStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecionar...</option>
                  <option value="empregado">Empregado por Conta de Outrem</option>
                  <option value="independente">Trabalhador Independente</option>
                  <option value="empresario">Empresário</option>
                  <option value="reformado">Reformado</option>
                  <option value="estudante">Estudante</option>
                  <option value="desempregado">Desempregado</option>
                </select>
              </div>

              {/* Rendimento Mensal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rendimento Mensal (€)
                </label>
                <input
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => updateField('monthlyIncome', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: 1200"
                  min="0"
                />
              </div>

              {/* Pré-aprovação */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasPreApproval"
                    checked={formData.hasPreApproval}
                    onChange={(e) => updateField('hasPreApproval', e.target.checked)}
                    className="mr-2 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="hasPreApproval" className="text-sm font-medium text-gray-700">
                    Tem Pré-aprovação de Crédito
                  </label>
                </div>
              </div>

              {/* Banco */}
              {formData.hasPreApproval && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banco
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => updateField('bankName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: CGD, BPI, Santander..."
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEÇÃO: CAMPOS EXTRA */}
        {(activeSection === 'extra' || showAllSections) && (showAdvancedFields || showAllSections) && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Informações Adicionais
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Prioridade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => updateField('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(safePriorities).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value === 'baixa' ? 'Baixa' :
                       value === 'normal' ? 'Normal' :
                       value === 'alta' ? 'Alta' :
                       'Urgente'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Urgência */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgência
                </label>
                <select
                  value={formData.urgency}
                  onChange={(e) => updateField('urgency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="normal">Normal</option>
                  <option value="urgente">Urgente</option>
                  <option value="muito_urgente">Muito Urgente</option>
                </select>
              </div>

              {/* Origem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origem do Lead
                </label>
                <select
                  value={formData.source}
                  onChange={(e) => updateField('source', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(safeLeadSources).map(([key, value]) => (
                    <option key={key} value={value}>
                      {value === 'website' ? 'Website' :
                       value === 'telefone' ? 'Telefone' :
                       value === 'email' ? 'Email' :
                       value === 'referencia' ? 'Referência' :
                       value === 'redes_sociais' ? 'Redes Sociais' :
                       'Manual'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prazo para Decisão
                </label>
                <select
                  value={formData.timeline}
                  onChange={(e) => updateField('timeline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecionar...</option>
                  <option value="imediato">Imediato (até 1 mês)</option>
                  <option value="curto_prazo">Curto prazo (1-3 meses)</option>
                  <option value="medio_prazo">Médio prazo (3-6 meses)</option>
                  <option value="longo_prazo">Longo prazo (6+ meses)</option>
                </select>
              </div>

              {/* Referenciado por */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referenciado por
                </label>
                <input
                  type="text"
                  value={formData.referredBy}
                  onChange={(e) => updateField('referredBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da pessoa ou empresa"
                />
              </div>

              {/* Data de Follow-up */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Follow-up
                </label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => updateField('followUpDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (separadas por vírgulas)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => updateField('tags', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: primeira_habitacao, investimento, urgente"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separe as tags com vírgulas para melhor organização
                </p>
              </div>

              {/* Notas Públicas */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Públicas
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Informações que podem ser partilhadas com o cliente..."
                />
              </div>

              {/* Notas Internas */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Internas
                </label>
                <textarea
                  value={formData.internalNotes}
                  onChange={(e) => updateField('internalNotes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Notas privadas apenas para uso interno..."
                />
              </div>
            </div>

            {/* Opt-ins */}
            <div className="border-t pt-4">
              <h5 className="text-md font-semibold text-gray-800 mb-3">Consentimentos</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* Newsletter */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newsletterOptIn"
                    checked={formData.newsletterOptIn}
                    onChange={(e) => updateField('newsletterOptIn', e.target.checked)}
                    className="mr-2 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="newsletterOptIn" className="text-sm text-gray-700">
                    Newsletter por Email
                  </label>
                </div>

                {/* SMS */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="smsOptIn"
                    checked={formData.smsOptIn}
                    onChange={(e) => updateField('smsOptIn', e.target.checked)}
                    className="mr-2 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="smsOptIn" className="text-sm text-gray-700">
                    SMS Marketing
                  </label>
                </div>

                {/* WhatsApp */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="whatsappOptIn"
                    checked={formData.whatsappOptIn}
                    onChange={(e) => updateField('whatsappOptIn', e.target.checked)}
                    className="mr-2 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="whatsappOptIn" className="text-sm text-gray-700">
                    WhatsApp Marketing
                  </label>
                </div>

                {/* Marketing Geral */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="marketingOptIn"
                    checked={formData.marketingOptIn}
                    onChange={(e) => updateField('marketingOptIn', e.target.checked)}
                    className="mr-2 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="marketingOptIn" className="text-sm text-gray-700">
                    Comunicações Marketing
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOTÕES DE AÇÃO */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-4">
            {onCancel && (
              <ThemedButton
                variant="secondary"
                onClick={onCancel}
                disabled={creating}
              >
                Cancelar
              </ThemedButton>
            )}
            
            {showPreview && (
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                disabled={creating}
              >
                👁️ Preview
              </button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ThemedButton
              type="submit"
              disabled={!isValid || creating}
              loading={creating}
            >
              {creating ? 'A processar...' : submitButtonText}
            </ThemedButton>
          </div>
        </div>

        {/* STATUS DE VALIDAÇÃO */}
        {!compactMode && (
          <div className="text-center text-sm">
            {isValid ? (
              <span className="text-green-600">✅ Formulário válido</span>
            ) : (
              <span className="text-red-600">❌ Corrija os erros acima</span>
            )}
            {duplicateCheck && (
              <span className="text-blue-600">🔍 Verificando duplicados...</span>
            )}
          </div>
        )}
      </form>

      {/* MODAL DE PREVIEW */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Preview do Lead</h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              
              {/* Dados básicos */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Informações Básicas</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Nome:</span> {formData.name}</div>
                  <div><span className="font-medium">Tipo:</span> {getClientTypeLabel(formData.clientType)}</div>
                  {formData.phone && <div><span className="font-medium">Telefone:</span> {formData.phone}</div>}
                  {formData.email && <div><span className="font-medium">Email:</span> {formData.email}</div>}
                  <div><span className="font-medium">Interesse:</span> {getInterestTypeLabelSafe(formData.interestType)}</div>
                  <div><span className="font-medium">Orçamento:</span> {safeBudgetRanges[formData.budgetRange] || 'Não definido'}</div>
                  {formData.location && <div><span className="font-medium">Localização:</span> {formData.location}</div>}
                </div>
              </div>

              {/* Dados do imóvel */}
              {(formData.propertyReference || formData.propertyLink || formData.propertyType || formData.propertyStatus !== 'nao_identificado') && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Imóvel</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Status:</span> {getPropertyStatusLabel(formData.propertyStatus)}</div>
                    {formData.propertyType && <div><span className="font-medium">Tipo:</span> {formData.propertyType}</div>}
                    {formData.propertyReference && <div><span className="font-medium">Referência:</span> {formData.propertyReference}</div>}
                    {formData.propertyLink && <div><span className="font-medium">Link:</span> <a href={formData.propertyLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Ver Imóvel</a></div>}
                    {formData.visitScheduled && <div><span className="font-medium">Visita:</span> {formData.visitDate ? new Date(formData.visitDate).toLocaleString('pt-PT') : 'Agendada'}</div>}
                  </div>
                </div>
              )}

              {/* Dados do gestor */}
              {(formData.managerName || formData.managerPhone || formData.managerEmail || formData.managerCompany) && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Gestor/Intermediário</h4>
                  <div className="space-y-2 text-sm">
                    {formData.managerName && <div><span className="font-medium">Nome:</span> {formData.managerName}</div>}
                    {formData.managerCompany && <div><span className="font-medium">Empresa:</span> {formData.managerCompany}</div>}
                    {formData.managerPhone && <div><span className="font-medium">Telefone:</span> {formData.managerPhone}</div>}
                    {formData.managerEmail && <div><span className="font-medium">Email:</span> {formData.managerEmail}</div>}
                    <div><span className="font-medium">Contacto preferido:</span> {formData.managerContactPreference}</div>
                  </div>
                </div>
              )}

              {/* Dados pessoais */}
              {(formData.profession || formData.company || formData.employmentStatus || formData.monthlyIncome || formData.hasPreApproval) && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Informações Pessoais</h4>
                  <div className="space-y-2 text-sm">
                    {formData.profession && <div><span className="font-medium">Profissão:</span> {formData.profession}</div>}
                    {formData.company && <div><span className="font-medium">Empresa:</span> {formData.company}</div>}
                    {formData.employmentStatus && <div><span className="font-medium">Situação:</span> {formData.employmentStatus}</div>}
                    {formData.monthlyIncome && <div><span className="font-medium">Rendimento:</span> {formData.monthlyIncome}€/mês</div>}
                    {formData.hasPreApproval && <div><span className="font-medium">Pré-aprovação:</span> {formData.bankName || 'Sim'}</div>}
                    <div><span className="font-medium">Contacto preferido:</span> {formData.contactPreference} ({formData.preferredContactTime})</div>
                  </div>
                </div>
              )}

              {/* Classificação */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Classificação</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Origem:</span> {formData.source}</div>
                  <div><span className="font-medium">Prioridade:</span> {formData.priority}</div>
                  <div><span className="font-medium">Urgência:</span> {formData.urgency}</div>
                  {formData.timeline && <div><span className="font-medium">Prazo:</span> {formData.timeline}</div>}
                  {formData.referredBy && <div><span className="font-medium">Referido por:</span> {formData.referredBy}</div>}
                  {formData.tags && <div><span className="font-medium">Tags:</span> {formData.tags}</div>}
                </div>
              </div>

              {/* Notas */}
              {(formData.notes || formData.internalNotes) && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Notas</h4>
                  {formData.notes && (
                    <div className="mb-2">
                      <span className="font-medium">Públicas:</span>
                      <p className="text-gray-600 mt-1 p-2 bg-gray-50 rounded text-xs">{formData.notes}</p>
                    </div>
                  )}
                  {formData.internalNotes && (
                    <div>
                      <span className="font-medium">Internas:</span>
                      <p className="text-gray-600 mt-1 p-2 bg-red-50 rounded text-xs">{formData.internalNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Consentimentos */}
              {(formData.newsletterOptIn || formData.smsOptIn || formData.whatsappOptIn || formData.marketingOptIn) && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Consentimentos</h4>
                  <div className="space-y-1 text-sm">
                    {formData.newsletterOptIn && <div>✅ Newsletter por Email</div>}
                    {formData.smsOptIn && <div>✅ SMS Marketing</div>}
                    {formData.whatsappOptIn && <div>✅ WhatsApp Marketing</div>}
                    {formData.marketingOptIn && <div>✅ Comunicações Marketing</div>}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fechar Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadForm;