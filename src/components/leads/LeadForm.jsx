// src/components/leads/LeadForm.jsx - VERSÃO EXPANDIDA
// 🎯 FORMULÁRIO COMPLETO E RICO PARA LEADS - MyImoMate 3.0
// =========================================================
// Expandindo o formulário existente mantendo todas as funcionalidades atuais
// NOVOS CAMPOS: Gestor, Propriedade, Pessoais, Financeiros, Técnicos

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedButton } from '../common/ThemedComponents';
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
    LEAD_INTEREST_TYPES,
    BUDGET_RANGES,
    CLIENT_TYPES,
    PROPERTY_STATUS,
    UNIFIED_PRIORITIES,
    UNIFIED_LEAD_SOURCES,
    isValidEmail,
    isValidPhone,
    creating,
    duplicateCheck
  } = useLeads();

  // ✅ ESTADOS DO FORMULÁRIO EXPANDIDOS (mantendo os existentes)
  const [formData, setFormData] = useState({
    // CAMPOS BÁSICOS EXISTENTES (MANTIDOS)
    name: '',
    phone: '',
    email: '',
    interestType: LEAD_INTEREST_TYPES?.COMPRA_CASA || 'compra_casa',
    budgetRange: 'undefined',
    location: '',
    notes: '',
    source: 'manual',
    priority: 'normal',
    preferredContactTime: 'anytime',
    
    // ✅ NOVOS CAMPOS EXPANDIDOS
    // Tipo de cliente
    clientType: CLIENT_TYPES?.COMPRADOR || 'comprador',
    
    // Informações do imóvel
    propertyStatus: PROPERTY_STATUS?.NAO_IDENTIFICADO || 'nao_identificado',
    propertyReference: '',
    propertyLink: '',
    propertyType: '',
    propertyFeatures: '',
    visitScheduled: false,
    visitDate: '',
    visitNotes: '',
    
    // Gestor do imóvel
    managerName: '',
    managerPhone: '',
    managerEmail: '',
    managerCompany: '',
    managerNotes: '',
    managerContactPreference: 'phone',
    lastManagerContact: '',
    
    // Informações pessoais extras
    profession: '',
    company: '',
    languagePreference: 'pt',
    contactPreference: 'phone',
    
    // Situação financeira básica
    employmentStatus: '',
    monthlyIncome: '',
    hasPreApproval: false,
    bankName: '',
    
    // Origem detalhada
    sourceDetails: '',
    referredBy: '',
    campaignId: '',
    utmSource: '',
    
    // Classificação
    leadScore: 0,
    qualificationLevel: 'nao_qualificado',
    urgency: 'normal',
    timeline: '',
    
    // Notas adicionais
    internalNotes: '',
    tags: '',
    followUpDate: '',
    
    // Preferências comunicação
    newsletterOptIn: false,
    smsOptIn: false,
    whatsappOptIn: false,
    marketingOptIn: false,
    
    // Dados técnicos
    deviceType: /Mobile/.test(navigator.userAgent) ? 'mobile' : 'desktop',
    browserLanguage: navigator.language || 'pt',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Lisbon',
    
    ...initialData
  });

  // Estados de validação (MANTIDOS)
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
  
  // Estados de duplicados (MANTIDOS)
  const [duplicates, setDuplicates] = useState([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  
  // Estados de UI (EXPANDIDOS)
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
  const [showAllSections, setShowAllSections] = useState(false);

  // Debounce para verificação de duplicados (MANTIDO)
  const [duplicateCheckTimeout, setDuplicateCheckTimeout] = useState(null);

  // ✅ FUNÇÕES DE ATUALIZAÇÃO (expandidas)
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Validação específica do campo
    validateField(field, value);
  }, []);

  // ✅ VALIDAÇÕES EXPANDIDAS (mantendo as existentes + novas)
  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'name':
        if (!value || value.trim().length < 2) {
          newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
        } else if (value.trim().length > 100) {
          newErrors.name = 'Nome não pode ter mais de 100 caracteres';
        } else {
          delete newErrors.name;
        }
        break;

      case 'phone':
        if (value && !isValidPhone(value)) {
          newErrors.phone = 'Formato de telefone português inválido (ex: 912 345 678)';
        } else {
          delete newErrors.phone;
        }
        break;

      case 'email':
        if (value && !isValidEmail(value)) {
          newErrors.email = 'Formato de email inválido';
        } else {
          delete newErrors.email;
        }
        break;

      // ✅ NOVAS VALIDAÇÕES
      case 'managerPhone':
        if (value && !isValidPhone(value)) {
          newErrors.managerPhone = 'Formato de telefone do gestor inválido';
        } else {
          delete newErrors.managerPhone;
        }
        break;

      case 'managerEmail':
        if (value && !isValidEmail(value)) {
          newErrors.managerEmail = 'Formato de email do gestor inválido';
        } else {
          delete newErrors.managerEmail;
        }
        break;

      case 'propertyLink':
        if (value && !value.match(/^https?:\/\/.+/)) {
          newErrors.propertyLink = 'URL deve começar com http:// ou https://';
        } else {
          delete newErrors.propertyLink;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  // Verificação de duplicados com debounce (MANTIDA)
  useEffect(() => {
    if (duplicateCheckTimeout) {
      clearTimeout(duplicateCheckTimeout);
    }

    const newTimeout = setTimeout(async () => {
      if ((formData.phone && formData.phone.length >= 9) || 
          (formData.email && formData.email.includes('@'))) {
        
        try {
          const result = await checkForDuplicates({ 
            phone: formData.phone || '', 
            email: formData.email || '' 
          })
          if (result.hasDuplicates) {
            setDuplicates(result.duplicates);
            setShowDuplicateWarning(true);
          } else {
            setDuplicates([]);
            setShowDuplicateWarning(false);
          }
        } catch (error) {
          console.log('Erro na verificação de duplicados:', error);
        }
      }
    }, 800);

    setDuplicateCheckTimeout(newTimeout);

    return () => clearTimeout(newTimeout);
  }, [formData.phone, formData.email, checkForDuplicates]);

  // Validação geral (EXPANDIDA)
  const validateForm = () => {
    const newErrors = {};

    // Validações obrigatórias (MANTIDAS)
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.phone && !formData.email) {
      newErrors.phone = 'Telefone ou email é obrigatório';
      newErrors.email = 'Telefone ou email é obrigatório';
    }

    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Formato de telefone inválido';
    }

    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }

    if (!formData.interestType) {
      newErrors.interestType = 'Tipo de interesse é obrigatório';
    }

    // ✅ NOVAS VALIDAÇÕES
    if (formData.managerPhone && !isValidPhone(formData.managerPhone)) {
      newErrors.managerPhone = 'Formato de telefone do gestor inválido';
    }

    if (formData.managerEmail && !isValidEmail(formData.managerEmail)) {
      newErrors.managerEmail = 'Formato de email do gestor inválido';
    }

    if (formData.propertyLink && !formData.propertyLink.match(/^https?:\/\/.+/)) {
      newErrors.propertyLink = 'URL deve ser válida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submissão (MANTIDA + expandida)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setActiveSection('basic');
      return;
    }

    // ✅ PREPARAÇÃO DE DADOS EXPANDIDA
    const finalData = {
      ...formData,
      name: formData.name.trim(),
      phone: formData.phone?.trim() || '',
      email: formData.email?.toLowerCase().trim() || '',
      location: formData.location?.trim() || '',
      notes: formData.notes?.trim() || '',
      
      // ✅ NOVOS CAMPOS LIMPOS
      managerName: formData.managerName?.trim() || '',
      managerPhone: formData.managerPhone?.trim() || '',
      managerEmail: formData.managerEmail?.toLowerCase().trim() || '',
      managerNotes: formData.managerNotes?.trim() || '',
      propertyReference: formData.propertyReference?.trim() || '',
      propertyLink: formData.propertyLink?.trim() || '',
      
      // Tags processadas
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
      
      // Metadados técnicos atualizados
      userAgent: navigator.userAgent,
      formVersion: '3.1-expanded',
      submittedAt: new Date().toISOString()
    };

    await onSubmit(finalData);
  };

  // Reset (EXPANDIDO)
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      interestType: LEAD_INTEREST_TYPES?.COMPRA_CASA || 'compra_casa',
      budgetRange: 'undefined',
      location: '',
      notes: '',
      source: 'manual',
      priority: 'normal',
      preferredContactTime: 'anytime',
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
      tags: '',
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

  // Atualizar isValid sempre que os dados mudarem
  useEffect(() => {
    const hasRequiredFields = formData.name.trim() && 
                             (formData.phone || formData.email) &&
                             formData.interestType;
    const hasNoErrors = Object.keys(errors).length === 0;
    setIsValid(hasRequiredFields && hasNoErrors);
  }, [formData, errors]);

  // Helper functions (EXPANDIDAS)
  const getInterestTypeLabel = (type) => {
    const labels = {
      'compra_casa': 'Compra de Casa',
      'compra_apartamento': 'Compra de Apartamento',
      'venda_casa': 'Venda de Casa',
      'venda_apartamento': 'Venda de Apartamento',
      'arrendamento_casa': 'Arrendamento de Casa',
      'arrendamento_apartamento': 'Arrendamento de Apartamento'
    };
    return labels[type] || type;
  };

  const getClientTypeLabel = (type) => {
    const labels = {
      'comprador': 'Comprador',
      'arrendatario': 'Arrendatário',
      'inquilino': 'Inquilino',
      'vendedor': 'Vendedor',
      'senhorio': 'Senhorio'
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

  // ✅ SEÇÕES DO FORMULÁRIO ORGANIZADAS
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

  // ✅ RENDER DO COMPONENTE EXPANDIDO
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

        {/* ✅ NAVEGAÇÃO POR SEÇÕES (nova) */}
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
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  {section.title}
                  {section.required && ' *'}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ ALERTA DE DUPLICADOS (mantido) */}
      {showDuplicateWarning && duplicates.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 w-full">
              <h4 className="text-sm font-medium text-yellow-800">
                Possíveis duplicados encontrados ({duplicates.length})
              </h4>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {duplicates.slice(0, 3).map((duplicate, index) => (
                  <div key={index} className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
                    <div className="font-medium">{duplicate.name}</div>
                    <div className="text-xs">
                      {duplicate.phone} • {duplicate.email} • 
                      {duplicate.isConverted ? '👤 Cliente' : '📋 Lead'} • 
                      {duplicate.duplicateField === 'phone' ? ' Mesmo telefone' : ' Mesmo email'}
                    </div>
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

      {/* ✅ FORMULÁRIO PRINCIPAL EXPANDIDO */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SEÇÃO: INFORMAÇÕES BÁSICAS (sempre visível) */}
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

              {/* ✅ TIPO DE CLIENTE (novo) */}
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

              {/* Tipo de Interesse */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Interesse *
                </label>
                <select
  value={formData.interestType}
  onChange={(e) => updateField('interestType', e.target.value)}
  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
    errors.interestType ? 'border-red-500' : 'border-gray-300'
  }`}
  required
>
  {LEAD_INTEREST_TYPES && Object.keys(LEAD_INTEREST_TYPES || {}).length > 0 ? 
  Object.entries(LEAD_INTEREST_TYPES).map(([key, value]) => (
    <option key={key} value={value}>
      {getInterestTypeLabel(value)}
    </option>
  )) : (
      <>
        <option value="compra_casa">Compra de Casa</option>
        <option value="compra_apartamento">Compra de Apartamento</option>
        <option value="venda_casa">Venda de Casa</option>
        <option value="venda_apartamento">Venda de Apartamento</option>
        <option value="arrendamento_casa">Arrendamento de Casa</option>
        <option value="investimento">Investimento</option>
      </>
    )
  }
</select>
                {errors.interestType && (
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
                  <option value="undefined">Não definido</option>
                  {Object.entries(BUDGET_RANGES || {}).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              {/* Localização */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização Preferida
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

        {/* ✅ SEÇÃO: INFORMAÇÕES DO IMÓVEL (nova) */}
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
                  <option value="outro">Outro</option>
                </select>
              </div>

              {/* Referência */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referência do Imóvel
                </label>
                <input
                  type="text"
                  value={formData.propertyReference}
                  onChange={(e) => updateField('propertyReference', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: IMO001, REF123..."
                />
              </div>

              {/* Link do Imóvel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link do Imóvel
                </label>
                <input
                  type="url"
                  value={formData.propertyLink}
                  onChange={(e) => updateField('propertyLink', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.propertyLink && touched.propertyLink ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://..."
                />
                {errors.propertyLink && touched.propertyLink && (
                  <p className="text-red-600 text-sm mt-1">{errors.propertyLink}</p>
                )}
              </div>

              {/* Visita Agendada */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.visitScheduled}
                  onChange={(e) => updateField('visitScheduled', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">Visita Agendada</label>
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

              {/* Características do Imóvel */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Características Específicas
                </label>
                <textarea
                  value={formData.propertyFeatures}
                  onChange={(e) => updateField('propertyFeatures', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Quartos, casas de banho, garagem, jardim, etc..."
                />
              </div>

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
                    rows="2"
                    placeholder="Preparação ou observações para a visita..."
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ✅ SEÇÃO: GESTOR DO IMÓVEL (nova) */}
        {(activeSection === 'manager' || showAllSections) && (showAdvancedFields || showAllSections) && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Gestor do Imóvel
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
                  placeholder="Nome completo"
                />
              </div>

              {/* Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa/Agência
                </label>
                <input
                  type="text"
                  value={formData.managerCompany}
                  onChange={(e) => updateField('managerCompany', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da empresa"
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.managerPhone && touched.managerPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="9XX XXX XXX"
                />
                {errors.managerPhone && touched.managerPhone && (
                  <p className="text-red-600 text-sm mt-1">{errors.managerPhone}</p>
                )}
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.managerEmail && touched.managerEmail ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="email@agencia.com"
                />
                {errors.managerEmail && touched.managerEmail && (
                  <p className="text-red-600 text-sm mt-1">{errors.managerEmail}</p>
                )}
              </div>

              {/* Preferência de Contacto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferência de Contacto
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

              {/* Último Contacto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Último Contacto
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
                  Notas sobre o Gestor
                </label>
                <textarea
                  value={formData.managerNotes}
                  onChange={(e) => updateField('managerNotes', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="2"
                  placeholder="Informações sobre contactos anteriores, disponibilidade, etc..."
                />
              </div>
            </div>
          </div>
        )}

        {/* ✅ SEÇÃO: INFORMAÇÕES PESSOAIS (nova) */}
        {(activeSection === 'personal' || showAllSections) && (showAdvancedFields || showAllSections) && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Informações Pessoais
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
                  placeholder="Ex: Engenheiro, Médico..."
                />
              </div>

              {/* Empresa */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa/Empregador
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da empresa"
                />
              </div>

              {/* Horário de Contacto Preferido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Horário Preferido
                </label>
                <select
                  value={formData.preferredContactTime}
                  onChange={(e) => updateField('preferredContactTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="anytime">Qualquer hora</option>
                  <option value="morning">Manhã (9h-12h)</option>
                  <option value="afternoon">Tarde (14h-18h)</option>
                  <option value="evening">Noite (18h-21h)</option>
                  <option value="weekend">Fim de semana</option>
                </select>
              </div>

              {/* Preferência de Contacto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meio Preferido
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

              {/* Status Emprego */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Situação Profissional
                </label>
                <select
                  value={formData.employmentStatus}
                  onChange={(e) => updateField('employmentStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecionar...</option>
                  <option value="empregado">Empregado</option>
                  <option value="autonomo">Trabalhador Autónomo</option>
                  <option value="empresario">Empresário</option>
                  <option value="funcionario_publico">Funcionário Público</option>
                  <option value="reformado">Reformado</option>
                  <option value="desempregado">Desempregado</option>
                  <option value="estudante">Estudante</option>
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
                  placeholder="Ex: 1500"
                  min="0"
                />
              </div>

              {/* Pré-aprovação */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.hasPreApproval}
                  onChange={(e) => updateField('hasPreApproval', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label className="text-sm font-medium text-gray-700">Tem pré-aprovação bancária</label>
              </div>

              {/* Banco */}
              {formData.hasPreApproval && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banco da Pré-aprovação
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => updateField('bankName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nome do banco"
                  />
                </div>
              )}

              {/* Idioma */}
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
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ✅ SEÇÃO: CAMPOS EXTRAS (expandida) */}
        {(activeSection === 'extra' || showAllSections) && (showAdvancedFields || showAllSections) && (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Informações Extras
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
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
                  <option value="baixa">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                </select>
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prazo Desejado
                </label>
                <input
                  type="text"
                  value={formData.timeline}
                  onChange={(e) => updateField('timeline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Dentro de 3 meses..."
                />
              </div>

              {/* Referido Por */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referido Por
                </label>
                <input
                  type="text"
                  value={formData.referredBy}
                  onChange={(e) => updateField('referredBy', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da pessoa que referiu"
                />
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
                  <option value="manual">Manual</option>
                  <option value="website">Website</option>
                  <option value="facebook">Facebook</option>
                  <option value="google">Google Ads</option>
                  <option value="referencia">Referência</option>
                  <option value="telefone">Telefone</option>
                  <option value="email">Email</option>
                </select>
              </div>

              {/* Follow-up */}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => updateField('tags', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="vip, urgente, repetido..."
                />
              </div>

              {/* Opções de Marketing */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferências de Comunicação
                </label>
                
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.newsletterOptIn}
                      onChange={(e) => updateField('newsletterOptIn', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Newsletter</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.smsOptIn}
                      onChange={(e) => updateField('smsOptIn', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">SMS</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.whatsappOptIn}
                      onChange={(e) => updateField('whatsappOptIn', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">WhatsApp</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.marketingOptIn}
                      onChange={(e) => updateField('marketingOptIn', e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">Marketing</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ SEÇÃO: NOTAS (sempre mostrar algumas) */}
        <div className="space-y-4">
          {(showAdvancedFields || showAllSections) && (
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
              Notas e Observações
            </h4>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            
            {/* Notas principais */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas {!showAdvancedFields && !showAllSections ? '' : 'Públicas'}
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={compactMode ? 2 : 3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Informações adicionais, preferências específicas, contexto da conversa..."
              />
            </div>

            {/* Notas internas (só em modo avançado) */}
            {(showAdvancedFields || showAllSections) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas Internas (uso interno)
                </label>
                <textarea
                  value={formData.internalNotes}
                  onChange={(e) => updateField('internalNotes', e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Informações internas, avaliações, observações da equipa..."
                />
              </div>
            )}
          </div>
        </div>

        {/* ✅ BOTÕES (mantidos + expandidos) */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          
          {/* Botão Principal */}
          <ThemedButton
            type="submit"
            disabled={!isValid || creating || duplicateCheck}
            className="flex-1 md:flex-none"
          >
            {creating ? '⏳ Criando...' : 
             duplicateCheck ? '🔍 Verificando...' : 
             showDuplicateWarning ? '⚠️ Criar Mesmo Assim' :
             submitButtonText}
          </ThemedButton>

          {/* Preview (se ativado) */}
          {showPreview && isValid && !compactMode && (
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              👁️ Preview
            </button>
          )}

          {/* Cancelar */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
          )}

          {/* Reset */}
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Limpar formulário"
          >
            🔄
          </button>
        </div>

        {/* INDICADOR DE VALIDAÇÃO (mantido) */}
        <div className="text-sm text-gray-500">
          {Object.keys(touched).length > 0 && (
            <div className="flex items-center gap-2">
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
        </div>
      </form>

      {/* ✅ MODAL DE PREVIEW EXPANDIDO (mantido + expandido) */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Preview do Lead</h3>
            
            <div className="space-y-4">
              
              {/* Dados básicos */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">Informações Básicas</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Nome:</span> {formData.name}</div>
                  <div><span className="font-medium">Tipo:</span> {getClientTypeLabel(formData.clientType)}</div>
                  {formData.phone && <div><span className="font-medium">Telefone:</span> {formData.phone}</div>}
                  {formData.email && <div><span className="font-medium">Email:</span> {formData.email}</div>}
                  <div><span className="font-medium">Interesse:</span> {getInterestTypeLabel(formData.interestType)}</div>
                  <div><span className="font-medium">Orçamento:</span> {BUDGET_RANGES[formData.budgetRange] || 'Não definido'}</div>
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
              {(formData.managerName || formData.managerPhone || formData.managerEmail) && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Gestor do Imóvel</h4>
                  <div className="space-y-2 text-sm">
                    {formData.managerName && <div><span className="font-medium">Nome:</span> {formData.managerName}</div>}
                    {formData.managerCompany && <div><span className="font-medium">Empresa:</span> {formData.managerCompany}</div>}
                    {formData.managerPhone && <div><span className="font-medium">Telefone:</span> {formData.managerPhone}</div>}
                    {formData.managerEmail && <div><span className="font-medium">Email:</span> {formData.managerEmail}</div>}
                    {formData.lastManagerContact && <div><span className="font-medium">Último Contacto:</span> {new Date(formData.lastManagerContact).toLocaleDateString('pt-PT')}</div>}
                  </div>
                </div>
              )}

              {/* Dados pessoais */}
              {(formData.profession || formData.company || formData.employmentStatus || formData.monthlyIncome) && (
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
                      <p className="text-gray-600 mt-1 p-2 bg-gray-50 rounded">{formData.notes}</p>
                    </div>
                  )}
                  {formData.internalNotes && (
                    <div>
                      <span className="font-medium">Internas:</span>
                      <p className="text-gray-600 mt-1 p-2 bg-yellow-50 rounded">{formData.internalNotes}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Preferências de comunicação */}
              {(formData.newsletterOptIn || formData.smsOptIn || formData.whatsappOptIn || formData.marketingOptIn) && (
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Preferências de Comunicação</h4>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {formData.newsletterOptIn && <span className="px-2 py-1 bg-green-100 text-green-800 rounded">Newsletter</span>}
                    {formData.smsOptIn && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">SMS</span>}
                    {formData.whatsappOptIn && <span className="px-2 py-1 bg-green-100 text-green-800 rounded">WhatsApp</span>}
                    {formData.marketingOptIn && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">Marketing</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Alerta de duplicados no preview */}
            {showDuplicateWarning && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 text-sm font-medium mb-2">
                  Atenção: Duplicado detectado
                </p>
                <p className="text-yellow-700 text-sm">
                  Confirme se é realmente uma nova pessoa ou se deve atualizar os dados existentes.
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <ThemedButton
                onClick={handleSubmit}
                disabled={creating}
                className="flex-1"
              >
                {creating ? 'Criando...' : submitButtonText}
              </ThemedButton>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadForm;