// src/components/clients/ClientForm.jsx
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedButton } from '../common/ThemedComponents';
import useClients from '../../hooks/useClients';

// 🎯 COMPONENTE DE FORMULÁRIO AVANÇADO PARA CLIENTES
// ==================================================
// MyImoMate 3.0 - Formulário reutilizável e inteligente
// Funcionalidades: Criar/Editar, Validação tempo real, Múltiplos contactos, Morada completa

const ClientForm = ({
  initialData = null,
  mode = 'create', // create, edit
  onSubmit,
  onCancel,
  showPreview = true,
  compactMode = false,
  autoFocus = true,
  submitButtonText = null
}) => {
  const { theme } = useTheme();
  
  // Hook de clientes para validações e operações
  const {
    createClient,
    updateClient,
    checkForDuplicates,
    CLIENT_TYPES,
    CLIENT_STATUS,
    CLIENT_BUDGET_RANGES,
    PROPERTY_INTERESTS,
    CONTACT_TYPES,
    isValidEmail,
    isValidPhone,
    isValidNIF,
    isValidPostalCode,
    creating,
    updating,
    duplicateCheck
  } = useClients();

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    phoneSecondary: '',
    email: '',
    emailSecondary: '',
    nif: '',
    clientType: CLIENT_TYPES.COMPRADOR,
    status: CLIENT_STATUS.ATIVO,
    address: {
      street: '',
      number: '',
      floor: '',
      door: '',
      postalCode: '',
      city: '',
      district: '',
      country: 'Portugal'
    },
    propertyInterests: [PROPERTY_INTERESTS.COMPRA_CASA],
    budgetRange: 'undefined',
    preferredLocations: [],
    preferredContactMethod: 'phone',
    preferredContactTime: 'anytime',
    contactNotes: '',
    profession: '',
    company: '',
    notes: '',
    allowsMarketing: true,
    ...initialData
  });

  // Estados de validação
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
  
  // Estados de duplicados
  const [duplicates, setDuplicates] = useState([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  
  // Estados de UI
  const [currentSection, setCurrentSection] = useState(0);
  const [showAllSections, setShowAllSections] = useState(compactMode);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);

  // Debounce para verificação de duplicados
  const [duplicateCheckTimeout, setDuplicateCheckTimeout] = useState(null);

  // Seções do formulário
  const formSections = [
    {
      title: 'Dados Básicos',
      icon: '👤',
      required: true,
      fields: ['name', 'phone', 'email', 'clientType', 'status']
    },
    {
      title: 'Contactos Múltiplos',
      icon: '📞',
      required: false,
      fields: ['phoneSecondary', 'emailSecondary', 'preferredContactMethod']
    },
    {
      title: 'Dados Fiscais',
      icon: '🏛️',
      required: false,
      fields: ['nif']
    },
    {
      title: 'Morada Completa',
      icon: '🏠',
      required: false,
      fields: ['address']
    },
    {
      title: 'Preferências',
      icon: '⭐',
      required: false,
      fields: ['propertyInterests', 'budgetRange', 'preferredContactTime']
    },
    {
      title: 'Informações Adicionais',
      icon: '📝',
      required: false,
      fields: ['profession', 'company', 'notes', 'allowsMarketing']
    }
  ];

  // 📝 ATUALIZAR CAMPO DO FORMULÁRIO
  const updateField = useCallback((field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Limpar erro específico quando user corrige
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // 🔍 VALIDAR CAMPO ESPECÍFICO
  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'name':
        if (!value?.trim()) return 'Nome é obrigatório';
        if (value.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres';
        return null;
        
      case 'phone':
        if (!value?.trim()) return 'Telefone principal é obrigatório';
        if (!isValidPhone(value)) return 'Formato de telefone inválido (9XX XXX XXX)';
        return null;
        
      case 'phoneSecondary':
        if (value && !isValidPhone(value)) return 'Formato de telefone secundário inválido';
        return null;
        
      case 'email':
        if (value && !isValidEmail(value)) return 'Formato de email inválido';
        return null;
        
      case 'emailSecondary':
        if (value && !isValidEmail(value)) return 'Formato de email secundário inválido';
        return null;
        
      case 'nif':
        if (value && !isValidNIF(value)) return 'NIF deve ter 9 dígitos';
        return null;
        
      case 'address.postalCode':
        if (value && !isValidPostalCode(value)) return 'Código postal inválido (XXXX-XXX)';
        return null;
        
      case 'address.city':
        if (value && value.length < 2) return 'Cidade deve ter pelo menos 2 caracteres';
        return null;
        
      default:
        return null;
    }
  }, [isValidPhone, isValidEmail, isValidNIF, isValidPostalCode]);

  // 🔍 VALIDAR FORMULÁRIO COMPLETO
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Validar campos obrigatórios
    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Telefone principal é obrigatório';
    }

    // Validar formatos se preenchidos
    if (formData.phone && !isValidPhone(formData.phone)) {
      newErrors.phone = 'Formato de telefone inválido';
    }
    
    if (formData.phoneSecondary && !isValidPhone(formData.phoneSecondary)) {
      newErrors.phoneSecondary = 'Formato de telefone secundário inválido';
    }
    
    if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Formato de email inválido';
    }
    
    if (formData.emailSecondary && !isValidEmail(formData.emailSecondary)) {
      newErrors.emailSecondary = 'Formato de email secundário inválido';
    }
    
    if (formData.nif && !isValidNIF(formData.nif)) {
      newErrors.nif = 'NIF deve ter 9 dígitos';
    }
    
    if (formData.address?.postalCode && !isValidPostalCode(formData.address.postalCode)) {
      newErrors['address.postalCode'] = 'Código postal inválido (XXXX-XXX)';
    }

    // Validar pelo menos um meio de contacto
    if (!formData.phone?.trim() && !formData.email?.trim()) {
      newErrors.contact = 'Telefone ou email é obrigatório';
    }

    setErrors(newErrors);
    const formIsValid = Object.keys(newErrors).length === 0;
    setIsValid(formIsValid);
    
    return formIsValid;
  }, [formData, isValidPhone, isValidEmail, isValidNIF, isValidPostalCode]);

  // 🔍 VERIFICAR DUPLICADOS COM DEBOUNCE
  const checkDuplicatesDebounced = useCallback((phone, email, nif) => {
    // Limpar timeout anterior
    if (duplicateCheckTimeout) {
      clearTimeout(duplicateCheckTimeout);
    }

    // Só verificar se tiver dados críticos
    if (!phone?.trim() && !email?.trim() && !nif?.trim()) {
      setDuplicates([]);
      setShowDuplicateWarning(false);
      return;
    }

    // Novo timeout para verificação
    const newTimeout = setTimeout(async () => {
      try {
        const excludeId = mode === 'edit' && initialData?.id ? initialData.id : null;
        const result = await checkForDuplicates(phone, email, nif, excludeId);
        setDuplicates(result.duplicates || []);
        setShowDuplicateWarning(result.hasDuplicates);
      } catch (error) {
        console.error('Erro ao verificar duplicados:', error);
      }
    }, 500); // 500ms debounce

    setDuplicateCheckTimeout(newTimeout);
  }, [checkForDuplicates, duplicateCheckTimeout, mode, initialData]);

  // 📝 MANIPULAR SUBMISSÃO
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Se há duplicados em modo criação, mostrar preview/confirmação
    if (mode === 'create' && showDuplicateWarning && duplicates.length > 0) {
      setShowPreviewModal(true);
      return;
    }

    await submitForm();
  };

  // 📝 SUBMETER FORMULÁRIO
  const submitForm = async () => {
    try {
      if (onSubmit) {
        // Usar callback personalizado se fornecido
        await onSubmit(formData);
      } else {
        // Usar função padrão do hook
        let result;
        if (mode === 'edit' && initialData?.id) {
          result = await updateClient(initialData.id, formData);
        } else {
          result = await createClient(formData);
        }
        
        if (result.success) {
          resetForm();
        }
      }
      setShowPreviewModal(false);
    } catch (error) {
      console.error('Erro ao submeter formulário:', error);
    }
  };

  // 🔄 RESET DO FORMULÁRIO
  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      phoneSecondary: '',
      email: '',
      emailSecondary: '',
      nif: '',
      clientType: CLIENT_TYPES.COMPRADOR,
      status: CLIENT_STATUS.ATIVO,
      address: {
        street: '',
        number: '',
        floor: '',
        door: '',
        postalCode: '',
        city: '',
        district: '',
        country: 'Portugal'
      },
      propertyInterests: [PROPERTY_INTERESTS.COMPRA_CASA],
      budgetRange: 'undefined',
      preferredLocations: [],
      preferredContactMethod: 'phone',
      preferredContactTime: 'anytime',
      contactNotes: '',
      profession: '',
      company: '',
      notes: '',
      allowsMarketing: true
    });
    setErrors({});
    setTouched({});
    setDuplicates([]);
    setShowDuplicateWarning(false);
    setCurrentSection(0);
    setShowAdvancedFields(false);
  };

  // 🎯 NAVEGAR ENTRE SEÇÕES
  const goToNextSection = () => {
    if (currentSection < formSections.length - 1) {
      setCurrentSection(prev => prev + 1);
    }
  };

  const goToPrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  };

  // 🔍 OBTER RÓTULOS LEGÍVEIS
  const getClientTypeLabel = (type) => {
    const labels = {
      [CLIENT_TYPES.COMPRADOR]: 'Comprador',
      [CLIENT_TYPES.VENDEDOR]: 'Vendedor',
      [CLIENT_TYPES.INQUILINO]: 'Inquilino',
      [CLIENT_TYPES.SENHORIO]: 'Senhorio',
      [CLIENT_TYPES.INVESTIDOR]: 'Investidor',
      [CLIENT_TYPES.MISTO]: 'Misto'
    };
    return labels[type] || type;
  };

  const getStatusLabel = (status) => {
    const labels = {
      [CLIENT_STATUS.ATIVO]: 'Ativo',
      [CLIENT_STATUS.INATIVO]: 'Inativo',
      [CLIENT_STATUS.VIP]: 'VIP',
      [CLIENT_STATUS.PROSPECT]: 'Prospect',
      [CLIENT_STATUS.EX_CLIENTE]: 'Ex-Cliente',
      [CLIENT_STATUS.BLOQUEADO]: 'Bloqueado'
    };
    return labels[status] || status;
  };

  // ⚡ EFEITOS
  useEffect(() => {
    validateForm();
  }, [formData, validateForm]);

  useEffect(() => {
    checkDuplicatesDebounced(formData.phone, formData.email, formData.nif);
  }, [formData.phone, formData.email, formData.nif, checkDuplicatesDebounced]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (duplicateCheckTimeout) {
        clearTimeout(duplicateCheckTimeout);
      }
    };
  }, [duplicateCheckTimeout]);

  // Determinar texto do botão
  const getSubmitButtonText = () => {
    if (submitButtonText) return submitButtonText;
    if (creating) return '⏳ Criando...';
    if (updating) return '⏳ Atualizando...';
    if (duplicateCheck) return '🔍 Verificando...';
    if (showDuplicateWarning && mode === 'create') return '⚠️ Criar Mesmo Assim';
    return mode === 'edit' ? '✅ Atualizar Cliente' : '✅ Criar Cliente';
  };

  const currentSectionData = formSections[currentSection];

  return (
    <div className={`client-form ${compactMode ? 'compact' : ''}`}>
      
      {/* ALERTA DE DUPLICADOS */}
      {showDuplicateWarning && duplicates.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <div className="text-yellow-600 text-xl mr-3">⚠️</div>
            <div className="flex-1">
              <h4 className="font-medium text-yellow-800 mb-2">
                Possível duplicado encontrado
              </h4>
              <div className="space-y-2">
                {duplicates.slice(0, 2).map((duplicate, index) => (
                  <div key={index} className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
                    <div className="font-medium">{duplicate.name}</div>
                    <div>{duplicate.phone} | {duplicate.email}</div>
                    {duplicate.nif && <div>NIF: {duplicate.nif}</div>}
                    <div className="text-xs">
                      {duplicate.duplicateField === 'phone' ? 'Mesmo telefone' : 
                       duplicate.duplicateField === 'email' ? 'Mesmo email' : 
                       'Mesmo NIF'}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-yellow-700 mt-2">
                Revise os dados antes de continuar ou confirme se é uma pessoa diferente.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* NAVEGAÇÃO POR SEÇÕES (se não compacto) */}
      {!showAllSections && !compactMode && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {currentSectionData.icon} {currentSectionData.title}
            </h3>
            <div className="text-sm text-gray-500">
              Seção {currentSection + 1} de {formSections.length}
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentSection + 1) / formSections.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* FORMULÁRIO */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SEÇÃO 0: DADOS BÁSICOS */}
        {(showAllSections || currentSection === 0) && (
          <div className="space-y-4">
            {showAllSections && (
              <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                👤 Dados Básicos
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
                  placeholder="Nome completo do cliente"
                  autoFocus={autoFocus && currentSection === 0}
                  required
                />
                {errors.name && touched.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Telefone Principal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone Principal *
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
                  required
                />
                {errors.phone && touched.phone && (
                  <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Email Principal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Principal
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

              {/* Tipo de Cliente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Cliente *
                </label>
                <select
                  value={formData.clientType}
                  onChange={(e) => updateField('clientType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {Object.values(CLIENT_TYPES).map(type => (
                    <option key={type} value={type}>
                      {getClientTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(CLIENT_STATUS).map(status => (
                    <option key={status} value={status}>
                      {getStatusLabel(status)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Erro de contacto */}
              {errors.contact && (
                <div className="md:col-span-2">
                  <p className="text-red-600 text-sm">{errors.contact}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEÇÃO 1: CONTACTOS MÚLTIPLOS */}
        {(showAllSections || currentSection === 1) && (
          <div className="space-y-4">
            {showAllSections && (
              <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                📞 Contactos Múltiplos
              </h4>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Telefone Secundário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone Secundário
                </label>
                <input
                  type="tel"
                  value={formData.phoneSecondary}
                  onChange={(e) => updateField('phoneSecondary', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.phoneSecondary && touched.phoneSecondary ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="9XX XXX XXX"
                />
                {errors.phoneSecondary && touched.phoneSecondary && (
                  <p className="text-red-600 text-sm mt-1">{errors.phoneSecondary}</p>
                )}
              </div>

              {/* Email Secundário */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Secundário
                </label>
                <input
                  type="email"
                  value={formData.emailSecondary}
                  onChange={(e) => updateField('emailSecondary', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.emailSecondary && touched.emailSecondary ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="email2@exemplo.com"
                />
                {errors.emailSecondary && touched.emailSecondary && (
                  <p className="text-red-600 text-sm mt-1">{errors.emailSecondary}</p>
                )}
              </div>

              {/* Método de contacto preferido */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Método de Contacto Preferido
                </label>
                <select
                  value={formData.preferredContactMethod}
                  onChange={(e) => updateField('preferredContactMethod', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="phone">Telefone</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                </select>
              </div>

              {/* Melhor hora para contacto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Melhor Hora para Contacto
                </label>
                <select
                  value={formData.preferredContactTime}
                  onChange={(e) => updateField('preferredContactTime', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="anytime">Qualquer hora</option>
                  <option value="morning">Manhã (9h-12h)</option>
                  <option value="afternoon">Tarde (12h-18h)</option>
                  <option value="evening">Noite (18h-21h)</option>
                  <option value="weekend">Fins de semana</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO 2: DADOS FISCAIS */}
        {(showAllSections || currentSection === 2) && (
          <div className="space-y-4">
            {showAllSections && (
              <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                🏛️ Dados Fiscais
              </h4>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* NIF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NIF (Número de Identificação Fiscal)
                  {duplicateCheck && formData.nif && (
                    <span className="text-blue-500 text-xs ml-2">🔍 Verificando...</span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.nif}
                  onChange={(e) => updateField('nif', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors.nif && touched.nif ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="123456789"
                  maxLength={9}
                />
                {errors.nif && touched.nif && (
                  <p className="text-red-600 text-sm mt-1">{errors.nif}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Campo opcional, mas útil para evitar duplicados
                </p>
              </div>

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
                  placeholder="Ex: Engenheiro, Médico, Empresário..."
                />
              </div>

              {/* Empresa */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da empresa onde trabalha"
                />
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO 3: MORADA COMPLETA */}
        {(showAllSections || currentSection === 3) && (
          <div className="space-y-4">
            {showAllSections && (
              <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                🏠 Morada Completa
              </h4>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Rua */}
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rua/Avenida
                </label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => updateField('address.street', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da rua ou avenida"
                />
              </div>

              {/* Número */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={formData.address.number}
                  onChange={(e) => updateField('address.number', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="123"
                />
              </div>

              {/* Andar */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Andar
                </label>
                <input
                  type="text"
                  value={formData.address.floor}
                  onChange={(e) => updateField('address.floor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="3º"
                />
              </div>

              {/* Porta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Porta
                </label>
                <input
                  type="text"
                  value={formData.address.door}
                  onChange={(e) => updateField('address.door', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Esq"
                />
              </div>

              {/* Código Postal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Código Postal
                </label>
                <input
                  type="text"
                  value={formData.address.postalCode}
                  onChange={(e) => updateField('address.postalCode', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors['address.postalCode'] && touched['address.postalCode'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1000-001"
                />
                {errors['address.postalCode'] && touched['address.postalCode'] && (
                  <p className="text-red-600 text-sm mt-1">{errors['address.postalCode']}</p>
                )}
              </div>

              {/* Cidade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => updateField('address.city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                    errors['address.city'] && touched['address.city'] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Lisboa"
                />
                {errors['address.city'] && touched['address.city'] && (
                  <p className="text-red-600 text-sm mt-1">{errors['address.city']}</p>
                )}
              </div>

              {/* Distrito */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distrito
                </label>
                <input
                  type="text"
                  value={formData.address.district}
                  onChange={(e) => updateField('address.district', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Lisboa"
                />
              </div>

              {/* País */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  País
                </label>
                <input
                  type="text"
                  value={formData.address.country}
                  onChange={(e) => updateField('address.country', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Portugal"
                />
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO 4: PREFERÊNCIAS */}
        {(showAllSections || currentSection === 4) && (
          <div className="space-y-4">
            {showAllSections && (
              <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                ⭐ Preferências
              </h4>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Faixa de Orçamento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faixa de Orçamento
                </label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => updateField('budgetRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(CLIENT_BUDGET_RANGES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Interesse Imobiliário Principal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Principal Interesse
                </label>
                <select
                  value={formData.propertyInterests[0] || PROPERTY_INTERESTS.COMPRA_CASA}
                  onChange={(e) => updateField('propertyInterests', [e.target.value])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(PROPERTY_INTERESTS).map(([key, value]) => (
                    <option key={value} value={value}>
                      {value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO 5: INFORMAÇÕES ADICIONAIS */}
        {(showAllSections || currentSection === 5) && (
          <div className="space-y-4">
            {showAllSections && (
              <h4 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                📝 Informações Adicionais
              </h4>
            )}
            
            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas / Observações
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={compactMode ? 2 : 3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Informações adicionais, preferências específicas, histórico..."
              />
            </div>

            {/* GDPR */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowsMarketing"
                checked={formData.allowsMarketing}
                onChange={(e) => updateField('allowsMarketing', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="allowsMarketing" className="ml-2 text-sm text-gray-700">
                Cliente autoriza contacto para marketing e comunicações comerciais (GDPR)
              </label>
            </div>
          </div>
        )}

        {/* NAVEGAÇÃO E BOTÕES */}
        <div className="flex gap-3 pt-6 border-t">
          
          {/* Navegação entre seções */}
          {!showAllSections && !compactMode && (
            <>
              <button
                type="button"
                onClick={goToPrevSection}
                disabled={currentSection === 0}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>
              
              {currentSection < formSections.length - 1 ? (
                <button
                  type="button"
                  onClick={goToNextSection}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Próxima →
                </button>
              ) : null}
            </>
          )}

          {/* Botões principais */}
          {(showAllSections || currentSection === formSections.length - 1) && (
            <>
              {/* Botão Principal */}
              <ThemedButton
                type="submit"
                disabled={!isValid || creating || updating || duplicateCheck}
                className="flex-1 md:flex-none"
              >
                {getSubmitButtonText()}
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
            </>
          )}
        </div>

        {/* INDICADOR DE VALIDAÇÃO */}
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

      {/* MODAL DE PREVIEW */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Preview do Cliente</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Dados Básicos</h4>
                <div className="space-y-1 text-sm">
                  <div><strong>Nome:</strong> {formData.name}</div>
                  <div><strong>Tipo:</strong> {getClientTypeLabel(formData.clientType)}</div>
                  <div><strong>Status:</strong> {getStatusLabel(formData.status)}</div>
                  {formData.nif && <div><strong>NIF:</strong> {formData.nif}</div>}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contacto</h4>
                <div className="space-y-1 text-sm">
                  {formData.phone && <div><strong>Telefone:</strong> {formData.phone}</div>}
                  {formData.email && <div><strong>Email:</strong> {formData.email}</div>}
                  {formData.phoneSecondary && <div><strong>Tel. Secundário:</strong> {formData.phoneSecondary}</div>}
                  {formData.emailSecondary && <div><strong>Email Secundário:</strong> {formData.emailSecondary}</div>}
                </div>
              </div>

              {formData.address?.city && (
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-2">Morada</h4>
                  <div className="text-sm">
                    {[
                      formData.address.street,
                      formData.address.number,
                      formData.address.floor,
                      formData.address.door
                    ].filter(Boolean).join(', ')}
                    {formData.address.postalCode && `, ${formData.address.postalCode}`}
                    {formData.address.city && `, ${formData.address.city}`}
                  </div>
                </div>
              )}

              <div className="md:col-span-2">
                <h4 className="font-medium text-gray-900 mb-2">Preferências</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Orçamento:</strong> {CLIENT_BUDGET_RANGES[formData.budgetRange]}</div>
                  <div><strong>Contacto:</strong> {formData.preferredContactMethod}</div>
                  <div><strong>Profissão:</strong> {formData.profession || 'N/A'}</div>
                  <div><strong>Marketing:</strong> {formData.allowsMarketing ? 'Sim' : 'Não'}</div>
                </div>
              </div>

              {formData.notes && (
                <div className="md:col-span-2">
                  <h4 className="font-medium text-gray-900 mb-2">Notas</h4>
                  <p className="text-sm text-gray-600">{formData.notes}</p>
                </div>
              )}
            </div>

            {/* Alerta de duplicados no preview */}
            {showDuplicateWarning && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-yellow-800 text-sm font-medium mb-2">
                  ⚠️ Atenção: Duplicado detectado
                </p>
                <p className="text-yellow-700 text-sm">
                  Confirme se é realmente uma pessoa diferente ou se deve atualizar os dados existentes.
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <ThemedButton
                onClick={submitForm}
                disabled={creating || updating}
                className="flex-1"
              >
                {creating || updating ? '⏳ Processando...' : '✅ Confirmar'}
              </ThemedButton>
              
              <button
                onClick={() => setShowPreviewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Editar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientForm;