// src/components/clients/ClientForm.jsx
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedButton } from '../common/ThemedComponents';
import useClients from '../../hooks/useClients';

// 🎯 COMPONENTE DE FORMULÁRIO AVANÇADO PARA CLIENTES
// ==================================================
// MyImoMate 3.0 - Formulário wizard de 4 seções com validações avançadas
// Funcionalidades: Criar/Editar, Validação tempo real, Múltiplos contactos, Duplicados

const ClientForm = ({
  initialData = null,
  mode = 'create', // create, edit
  onSubmit,
  onCancel,
  showPreview = true,
  compactMode = false,
  autoFocus = true,
  submitButtonText = null,
  className = ''
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
    clientType: 'comprador',
    status: 'ativo',
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

  // Estados de validação e UI
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [showAllSections, setShowAllSections] = useState(compactMode);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Seções do formulário
  const formSections = [
    { id: 'basic', title: 'Dados Básicos', icon: '👤' },
    { id: 'contact', title: 'Contactos', icon: '📞' },
    { id: 'address', title: 'Morada', icon: '📍' },
    { id: 'preferences', title: 'Preferências', icon: '⭐' }
  ];

  // Helper function para debounce
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // 📝 MANIPULAR MUDANÇAS NO FORMULÁRIO
  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const parts = field.split('.');
      if (parts.length === 2) {
        const [parent, child] = parts;
        setFormData(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }

    // Marcar campo como tocado
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Limpar erro específico quando user começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // ✅ VALIDAÇÃO EM TEMPO REAL
  const validateField = useCallback((field, value) => {
    switch (field) {
      case 'name':
        if (!value || value.trim().length < 2) {
          return 'Nome deve ter pelo menos 2 caracteres';
        }
        break;
        
      case 'phone':
        if (!value) {
          return 'Telefone é obrigatório';
        }
        if (!isValidPhone?.(value)) {
          return 'Telefone inválido (ex: 912 345 678)';
        }
        break;
        
      case 'phoneSecondary':
        if (value && !isValidPhone?.(value)) {
          return 'Telefone secundário inválido';
        }
        break;
        
      case 'email':
        if (!value) {
          return 'Email é obrigatório';
        }
        if (!isValidEmail?.(value)) {
          return 'Email inválido';
        }
        break;
        
      case 'emailSecondary':
        if (value && !isValidEmail?.(value)) {
          return 'Email secundário inválido';
        }
        break;
        
      case 'nif':
        if (value && !isValidNIF?.(value)) {
          return 'NIF inválido (9 dígitos)';
        }
        break;
        
      case 'address.postalCode':
        if (value && !isValidPostalCode?.(value)) {
          return 'Código postal inválido (ex: 1000-001)';
        }
        break;
        
      default:
        return null;
    }
    return null;
  }, [isValidPhone, isValidEmail, isValidNIF, isValidPostalCode]);

  // 🔍 VERIFICAR DUPLICADOS COM DEBOUNCE
  const checkDuplicatesDebounced = useCallback(
    debounce(async (phone, email) => {
      if (!phone && !email) return;

      try {
        const result = await checkForDuplicates?.(phone, email);
        if (result?.found) {
          setDuplicates(result.clients || []);
          setShowDuplicateWarning(true);
        } else {
          setDuplicates([]);
          setShowDuplicateWarning(false);
        }
      } catch (err) {
        console.error('Erro ao verificar duplicados:', err);
      }
    }, 500),
    [checkForDuplicates]
  );

  // 📋 VALIDAÇÃO COMPLETA DO FORMULÁRIO
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Validar campos obrigatórios
    newErrors.name = validateField('name', formData.name);
    newErrors.phone = validateField('phone', formData.phone);
    newErrors.email = validateField('email', formData.email);
    
    // Validar campos opcionais se preenchidos
    if (formData.phoneSecondary) {
      newErrors.phoneSecondary = validateField('phoneSecondary', formData.phoneSecondary);
    }
    
    if (formData.emailSecondary) {
      newErrors.emailSecondary = validateField('emailSecondary', formData.emailSecondary);
    }
    
    if (formData.nif) {
      newErrors.nif = validateField('nif', formData.nif);
    }
    
    if (formData.address.postalCode) {
      newErrors['address.postalCode'] = validateField('address.postalCode', formData.address.postalCode);
    }

    // Remover erros null
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  // 📝 SUBMETER FORMULÁRIO
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      // Validar formulário
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      // Verificar duplicados em tempo real
      if (mode === 'create') {
        const duplicateResult = await checkForDuplicates?.(formData.phone, formData.email);
        if (duplicateResult?.found && !window.confirm(
          `Encontrámos ${duplicateResult.clients.length} cliente(s) com dados similares. Continuar mesmo assim?`
        )) {
          setIsSubmitting(false);
          return;
        }
      }

      let result;
      if (mode === 'create') {
        result = await createClient?.(formData);
      } else {
        result = await updateClient?.(initialData?.id, formData);
      }

      if (result?.success) {
        // Chamar callback se fornecido
        onSubmit?.(result.client, formData);
        
        // Reset do formulário se for criação
        if (mode === 'create') {
          resetForm();
        }
      } else {
        setErrors({ submit: result?.error || 'Erro ao processar formulário' });
      }
    } catch (err) {
      setErrors({ submit: `Erro inesperado: ${err.message}` });
    } finally {
      setIsSubmitting(false);
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
      clientType: 'comprador',
      status: 'ativo',
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
    setCurrentSection(0);
    setShowDuplicateWarning(false);
    setDuplicates([]);
  };

  // 🎯 NAVEGAR ENTRE SEÇÕES
  const nextSection = () => {
    if (currentSection < formSections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  // 👀 PREVIEW DO CLIENTE
  const showPreviewHandler = () => {
    if (validateForm()) {
      setShowPreviewModal(true);
    }
  };

  // 🔍 OBTER RÓTULOS LEGÍVEIS
  const getClientTypeLabel = (type) => {
    const labels = {
      'comprador': 'Comprador',
      'vendedor': 'Vendedor',
      'inquilino': 'Inquilino',
      'senhorio': 'Senhorio',
      'investidor': 'Investidor',
      'misto': 'Misto'
    };
    return labels[type] || type;
  };

  const getBudgetRangeLabel = (range) => {
    const labels = {
      '0-50k': 'Até €50.000',
      '50k-100k': '€50.000 - €100.000',
      '100k-200k': '€100.000 - €200.000',
      '200k-300k': '€200.000 - €300.000',
      '300k-500k': '€300.000 - €500.000',
      '500k-750k': '€500.000 - €750.000',
      '750k-1M': '€750.000 - €1.000.000',
      '1M-2M': '€1.000.000 - €2.000.000',
      '2M+': 'Acima de €2.000.000',
      'unlimited': 'Sem limite',
      'undefined': 'A definir'
    };
    return labels[range] || range;
  };

  // ⚡ EFEITOS
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  useEffect(() => {
    // Verificar duplicados quando telefone ou email mudarem
    if ((formData.phone || formData.email) && mode === 'create') {
      checkDuplicatesDebounced(formData.phone, formData.email);
    }
  }, [formData.phone, formData.email, mode, checkDuplicatesDebounced]);

  useEffect(() => {
    setIsValid(validateForm());
  }, [formData, validateForm]);

  // RENDER DAS SEÇÕES
  const renderBasicSection = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
        <span>👤</span> Dados Básicos
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nome */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="João Silva"
            autoFocus={autoFocus}
            required
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Tipo de Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Cliente
          </label>
          <select
            value={formData.clientType}
            onChange={(e) => handleInputChange('clientType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="comprador">Comprador</option>
            <option value="vendedor">Vendedor</option>
            <option value="inquilino">Inquilino</option>
            <option value="senhorio">Senhorio</option>
            <option value="investidor">Investidor</option>
            <option value="misto">Misto</option>
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="vip">VIP</option>
            <option value="prospect">Prospect</option>
            <option value="ex_cliente">Ex-Cliente</option>
            <option value="bloqueado">Bloqueado</option>
          </select>
        </div>

        {/* NIF */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            NIF (opcional)
          </label>
          <input
            type="text"
            value={formData.nif}
            onChange={(e) => handleInputChange('nif', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.nif ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="123456789"
            maxLength={9}
          />
          {errors.nif && (
            <p className="text-red-600 text-sm mt-1">{errors.nif}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderContactSection = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
        <span>📞</span> Contactos
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Telefone Principal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone Principal *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="912 345 678"
            required
          />
          {errors.phone && (
            <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
          )}
        </div>

        {/* Telefone Secundário */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone Secundário
          </label>
          <input
            type="tel"
            value={formData.phoneSecondary}
            onChange={(e) => handleInputChange('phoneSecondary', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.phoneSecondary ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="213 456 789"
          />
          {errors.phoneSecondary && (
            <p className="text-red-600 text-sm mt-1">{errors.phoneSecondary}</p>
          )}
        </div>

        {/* Email Principal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Principal *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="joao@email.com"
            required
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email}</p>
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
            onChange={(e) => handleInputChange('emailSecondary', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors.emailSecondary ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="joao.trabalho@email.com"
          />
          {errors.emailSecondary && (
            <p className="text-red-600 text-sm mt-1">{errors.emailSecondary}</p>
          )}
        </div>

        {/* Método de Contacto Preferido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Método Preferido
          </label>
          <select
            value={formData.preferredContactMethod}
            onChange={(e) => handleInputChange('preferredContactMethod', e.target.value)}
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
            onChange={(e) => handleInputChange('preferredContactTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="anytime">Qualquer hora</option>
            <option value="morning">Manhã (9h-12h)</option>
            <option value="afternoon">Tarde (14h-18h)</option>
            <option value="evening">Noite (18h-21h)</option>
            <option value="business_hours">Horário comercial</option>
          </select>
        </div>
      </div>

      {/* Notas de Contacto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas de Contacto
        </label>
        <textarea
          value={formData.contactNotes}
          onChange={(e) => handleInputChange('contactNotes', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Preferências especiais de contacto..."
        />
      </div>
    </div>
  );

  const renderAddressSection = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
        <span>📍</span> Morada
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rua */}
        <div className="md:col-span-2 lg:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rua/Avenida
          </label>
          <input
            type="text"
            value={formData.address.street}
            onChange={(e) => handleInputChange('address.street', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Rua da República"
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
            onChange={(e) => handleInputChange('address.number', e.target.value)}
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
            onChange={(e) => handleInputChange('address.floor', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="3º Esq"
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
            onChange={(e) => handleInputChange('address.door', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="A"
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
            onChange={(e) => handleInputChange('address.postalCode', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
              errors['address.postalCode'] ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="1000-001"
          />
          {errors['address.postalCode'] && (
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
            onChange={(e) => handleInputChange('address.city', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Lisboa"
          />
        </div>

        {/* Distrito */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Distrito
          </label>
          <input
            type="text"
            value={formData.address.district}
            onChange={(e) => handleInputChange('address.district', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Lisboa"
          />
        </div>
      </div>
    </div>
  );

  const renderPreferencesSection = () => (
    <div className="space-y-4">
      <h4 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
        <span>⭐</span> Preferências
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Faixa de Orçamento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Faixa de Orçamento
          </label>
          <select
            value={formData.budgetRange}
            onChange={(e) => handleInputChange('budgetRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="undefined">A definir</option>
            <option value="0-50k">Até €50.000</option>
            <option value="50k-100k">€50.000 - €100.000</option>
            <option value="100k-200k">€100.000 - €200.000</option>
            <option value="200k-300k">€200.000 - €300.000</option>
            <option value="300k-500k">€300.000 - €500.000</option>
            <option value="500k-750k">€500.000 - €750.000</option>
            <option value="750k-1M">€750.000 - €1.000.000</option>
            <option value="1M-2M">€1.000.000 - €2.000.000</option>
            <option value="2M+">Acima de €2.000.000</option>
            <option value="unlimited">Sem limite</option>
          </select>
        </div>

        {/* Profissão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profissão
          </label>
          <input
            type="text"
            value={formData.profession}
            onChange={(e) => handleInputChange('profession', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Engenheiro, Professor, etc."
          />
        </div>

        {/* Empresa */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empresa
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Nome da empresa"
          />
        </div>

        {/* Marketing */}
        <div className="md:col-span-2 flex items-center justify-between p-4 border border-gray-300 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Permite Marketing
            </label>
            <p className="text-xs text-gray-500">
              Aceita receber comunicações promocionais
            </p>
          </div>
          <div className="ml-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.allowsMarketing}
                onChange={(e) => handleInputChange('allowsMarketing', e.target.checked)}
                className="form-checkbox h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm">Sim</span>
            </label>
          </div>
        </div>
      </div>

      {/* Localizações Preferidas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Localizações Preferidas
        </label>
        <textarea
          value={formData.preferredLocations.join(', ')}
          onChange={(e) => handleInputChange('preferredLocations', e.target.value.split(',').map(l => l.trim()).filter(l => l))}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Lisboa, Porto, Cascais... (separar por vírgulas)"
        />
      </div>

      {/* Notas Gerais */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas e Observações
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Informações adicionais sobre o cliente..."
        />
      </div>
    </div>
  );

  return (
    <div className={`client-form ${className}`}>
      
      {/* ALERTA DE DUPLICADOS */}
      {showDuplicateWarning && duplicates.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Possíveis duplicados encontrados
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Encontrámos {duplicates.length} cliente(s) com dados similares:</p>
                <ul className="mt-1 list-disc list-inside">
                  {duplicates.map((duplicate, index) => (
                    <li key={index}>
                      {duplicate.name} - {duplicate.phone} - {duplicate.email}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* NAVEGAÇÃO POR SEÇÕES (se não compacto) */}
        {!showAllSections && (
          <div className="flex flex-wrap justify-center mb-6">
            {formSections.map((section, index) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setCurrentSection(index)}
                className={`mx-1 mb-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                  currentSection === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {section.icon} {section.title}
              </button>
            ))}
          </div>
        )}

        {/* RENDERIZAR SEÇÕES */}
        {showAllSections ? (
          <div className="space-y-8">
            {renderBasicSection()}
            {renderContactSection()}
            {renderAddressSection()}
            {renderPreferencesSection()}
          </div>
        ) : (
          <div>
            {currentSection === 0 && renderBasicSection()}
            {currentSection === 1 && renderContactSection()}
            {currentSection === 2 && renderAddressSection()}
            {currentSection === 3 && renderPreferencesSection()}
          </div>
        )}

        {/* ERRO DE SUBMISSÃO */}
        {errors.submit && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{errors.submit}</p>
          </div>
        )}

        {/* BOTÕES DE AÇÃO */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          
          {/* Navegação entre seções */}
          {!showAllSections && (
            <div className="flex gap-2">
              {currentSection > 0 && (
                <button
                  type="button"
                  onClick={prevSection}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  ← Anterior
                </button>
              )}
              
              {currentSection < formSections.length - 1 && (
                <button
                  type="button"
                  onClick={nextSection}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Próximo →
                </button>
              )}
            </div>
          )}

          {/* Botões principais */}
          <div className="flex gap-2 ml-auto">
            {showPreview && (currentSection === formSections.length - 1 || showAllSections) && (
              <button
                type="button"
                onClick={showPreviewHandler}
                disabled={!isValid}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50"
              >
                👀 Preview
              </button>
            )}

            {(currentSection === formSections.length - 1 || showAllSections) && (
              <ThemedButton
                type="submit"
                disabled={!isValid || isSubmitting || creating || updating}
              >
                {isSubmitting || creating || updating ? (
                  '⏳ Processando...'
                ) : (
                  submitButtonText || (mode === 'create' ? '👤 Criar Cliente' : '✏️ Atualizar Cliente')
                )}
              </ThemedButton>
            )}

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      {/* MODAL DE PREVIEW */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Preview do Cliente</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>Nome:</strong> {formData.name}
                </div>
                <div>
                  <strong>Tipo:</strong> {getClientTypeLabel(formData.clientType)}
                </div>
                <div>
                  <strong>Telefone:</strong> {formData.phone}
                </div>
                <div>
                  <strong>Email:</strong> {formData.email}
                </div>
                <div>
                  <strong>Orçamento:</strong> {getBudgetRangeLabel(formData.budgetRange)}
                </div>
                <div>
                  <strong>Cidade:</strong> {formData.address.city || 'N/A'}
                </div>
              </div>
              
              {formData.notes && (
                <div>
                  <strong>Notas:</strong>
                  <p className="mt-1 text-gray-600">{formData.notes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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

export default ClientForm;