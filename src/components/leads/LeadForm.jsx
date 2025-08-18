// src/components/leads/LeadForm.jsx
import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedButton } from '../common/ThemedComponents';
import useLeads from '../../hooks/useLeads';

// 🎯 COMPONENTE DE FORMULÁRIO AVANÇADO PARA LEADS
// ===============================================
// MyImoMate 3.0 - Formulário reutilizável e inteligente
// Funcionalidades: Validação tempo real, Duplicados, Auto-complete, Preview

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
  
  // Hook de leads para validações e duplicados
  const {
    createLead,
    checkForDuplicates,
    LEAD_INTEREST_TYPES,
    BUDGET_RANGES,
    isValidEmail,
    isValidPhone,
    creating,
    duplicateCheck
  } = useLeads();

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interestType: LEAD_INTEREST_TYPES.COMPRA_CASA,
    budgetRange: 'undefined',
    location: '',
    notes: '',
    source: 'manual',
    priority: 'normal',
    preferredContactTime: 'anytime',
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
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Debounce para verificação de duplicados
  const [duplicateCheckTimeout, setDuplicateCheckTimeout] = useState(null);

  // 📝 ATUALIZAR CAMPO DO FORMULÁRIO
  const updateField = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        if (value && !isValidPhone(value)) return 'Formato de telefone inválido (use 9XX XXX XXX)';
        return null;
        
      case 'email':
        if (value && !isValidEmail(value)) return 'Formato de email inválido';
        return null;
        
      case 'location':
        if (value && value.length < 2) return 'Localização deve ter pelo menos 2 caracteres';
        return null;
        
      default:
        return null;
    }
  }, [isValidPhone, isValidEmail]);

  // 🔍 VALIDAR FORMULÁRIO COMPLETO
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    // Validar campos individuais
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    // Validações específicas
    if (!formData.name?.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    
    if (!formData.phone?.trim() && !formData.email?.trim()) {
      newErrors.contact = 'Telefone ou email é obrigatório';
    }

    setErrors(newErrors);
    const formIsValid = Object.keys(newErrors).length === 0;
    setIsValid(formIsValid);
    
    return formIsValid;
  }, [formData, validateField]);

  // 🔍 VERIFICAR DUPLICADOS COM DEBOUNCE
  const checkDuplicatesDebounced = useCallback((phone, email) => {
    // Limpar timeout anterior
    if (duplicateCheckTimeout) {
      clearTimeout(duplicateCheckTimeout);
    }

    // Só verificar se tiver dados válidos
    if (!phone?.trim() && !email?.trim()) {
      setDuplicates([]);
      setShowDuplicateWarning(false);
      return;
    }

    // Novo timeout para verificação
    const newTimeout = setTimeout(async () => {
      try {
        const result = await checkForDuplicates(phone, email);
        setDuplicates(result.duplicates || []);
        setShowDuplicateWarning(result.hasDuplicates);
      } catch (error) {
        console.error('Erro ao verificar duplicados:', error);
      }
    }, 500); // 500ms debounce

    setDuplicateCheckTimeout(newTimeout);
  }, [checkForDuplicates, duplicateCheckTimeout]);

  // 📝 MANIPULAR SUBMISSÃO
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Se há duplicados, mostrar preview/confirmação
    if (showDuplicateWarning && duplicates.length > 0) {
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
        const result = await createLead(formData);
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
      email: '',
      interestType: LEAD_INTEREST_TYPES.COMPRA_CASA,
      budgetRange: 'undefined',
      location: '',
      notes: '',
      source: 'manual',
      priority: 'normal',
      preferredContactTime: 'anytime'
    });
    setErrors({});
    setTouched({});
    setDuplicates([]);
    setShowDuplicateWarning(false);
    setShowAdvancedFields(false);
  };

  // 🔍 OBTER RÓTULOS LEGÍVEIS
  const getInterestTypeLabel = (type) => {
    const labels = {
      [LEAD_INTEREST_TYPES.COMPRA_CASA]: 'Compra Casa',
      [LEAD_INTEREST_TYPES.COMPRA_APARTAMENTO]: 'Compra Apartamento',
      [LEAD_INTEREST_TYPES.COMPRA_TERRENO]: 'Compra Terreno',
      [LEAD_INTEREST_TYPES.COMPRA_COMERCIAL]: 'Compra Comercial',
      [LEAD_INTEREST_TYPES.VENDA_CASA]: 'Venda Casa',
      [LEAD_INTEREST_TYPES.VENDA_APARTAMENTO]: 'Venda Apartamento',
      [LEAD_INTEREST_TYPES.VENDA_TERRENO]: 'Venda Terreno',
      [LEAD_INTEREST_TYPES.VENDA_COMERCIAL]: 'Venda Comercial',
      [LEAD_INTEREST_TYPES.ARRENDAMENTO_CASA]: 'Arrendamento Casa',
      [LEAD_INTEREST_TYPES.ARRENDAMENTO_APARTAMENTO]: 'Arrendamento Apartamento',
      [LEAD_INTEREST_TYPES.ARRENDAMENTO_COMERCIAL]: 'Arrendamento Comercial',
      [LEAD_INTEREST_TYPES.INVESTIMENTO]: 'Investimento',
      [LEAD_INTEREST_TYPES.AVALIACAO]: 'Avaliação',
      [LEAD_INTEREST_TYPES.CONSULTORIA]: 'Consultoria'
    };
    return labels[type] || type;
  };

  // ⚡ EFEITOS
  useEffect(() => {
    validateForm();
  }, [formData, validateForm]);

  useEffect(() => {
    checkDuplicatesDebounced(formData.phone, formData.email);
  }, [formData.phone, formData.email, checkDuplicatesDebounced]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (duplicateCheckTimeout) {
        clearTimeout(duplicateCheckTimeout);
      }
    };
  }, [duplicateCheckTimeout]);

  return (
    <div className={`lead-form ${compactMode ? 'compact' : ''}`}>
      
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
                    <div className="text-xs">
                      {duplicate.isClient ? '👤 Cliente' : '📋 Lead'} • 
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

      {/* FORMULÁRIO PRINCIPAL */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* DADOS BÁSICOS */}
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

          {/* Erro de contacto */}
          {errors.contact && (
            <div className="md:col-span-2">
              <p className="text-red-600 text-sm">{errors.contact}</p>
            </div>
          )}
        </div>

        {/* DADOS DE INTERESSE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Tipo de Interesse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Interesse *
            </label>
            <select
              value={formData.interestType}
              onChange={(e) => updateField('interestType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              {Object.entries(LEAD_INTEREST_TYPES).map(([key, value]) => (
                <option key={value} value={value}>
                  {getInterestTypeLabel(value)}
                </option>
              ))}
            </select>
          </div>

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
              {Object.entries(BUDGET_RANGES).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                errors.location && touched.location ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Cidade, distrito, zona específica..."
            />
            {errors.location && touched.location && (
              <p className="text-red-600 text-sm mt-1">{errors.location}</p>
            )}
          </div>
        </div>

        {/* CAMPOS AVANÇADOS */}
        {!compactMode && (
          <div>
            <button
              type="button"
              onClick={() => setShowAdvancedFields(!showAdvancedFields)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-4"
            >
              {showAdvancedFields ? '⬆️ Ocultar campos avançados' : '⬇️ Mostrar campos avançados'}
            </button>

            {showAdvancedFields && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                
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
                      <option value="low">Baixa</option>
                      <option value="normal">Normal</option>
                      <option value="high">Alta</option>
                      <option value="urgent">Urgente</option>
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

                  {/* Fonte */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fonte do Lead
                    </label>
                    <select
                      value={formData.source}
                      onChange={(e) => updateField('source', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="manual">Inserção Manual</option>
                      <option value="website">Website</option>
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="google">Google Ads</option>
                      <option value="referral">Referência</option>
                      <option value="cold_call">Chamada Fria</option>
                      <option value="email">Email Marketing</option>
                      <option value="event">Evento</option>
                      <option value="other">Outro</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NOTAS */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas / Observações
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            rows={compactMode ? 2 : 3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Informações adicionais, preferências específicas, contexto da conversa..."
          />
        </div>

        {/* BOTÕES */}
        <div className="flex gap-3 pt-4">
          
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
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Preview do Lead</h3>
            
            <div className="space-y-3">
              <div>
                <span className="font-medium">Nome:</span> {formData.name}
              </div>
              {formData.phone && (
                <div>
                  <span className="font-medium">Telefone:</span> {formData.phone}
                </div>
              )}
              {formData.email && (
                <div>
                  <span className="font-medium">Email:</span> {formData.email}
                </div>
              )}
              <div>
                <span className="font-medium">Interesse:</span> {getInterestTypeLabel(formData.interestType)}
              </div>
              <div>
                <span className="font-medium">Orçamento:</span> {BUDGET_RANGES[formData.budgetRange]}
              </div>
              {formData.location && (
                <div>
                  <span className="font-medium">Localização:</span> {formData.location}
                </div>
              )}
              {formData.notes && (
                <div>
                  <span className="font-medium">Notas:</span> 
                  <p className="text-gray-600 mt-1">{formData.notes}</p>
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
                  Confirme se é realmente uma nova pessoa ou se deve atualizar os dados existentes.
                </p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <ThemedButton
                onClick={submitForm}
                disabled={creating}
                className="flex-1"
              >
                {creating ? '⏳ Criando...' : '✅ Confirmar'}
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

export default LeadForm;