// src/components/modals/LeadConversionFix.jsx
// 🔧 CORREÇÃO DO SISTEMA DE CONVERSÃO LEAD → CLIENTE + OPORTUNIDADE
// ================================================================
// MyImoMate 3.0 - Correção crítica do modal de conversão
// ✅ Modal obrigatório para conversão
// ✅ Validação completa antes de converter
// ✅ Prevenção de conversões incompletas
// ✅ Sistema de aprovação estruturado
// ✅ Debug e logs detalhados

import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  UserIcon, 
  CurrencyEuroIcon, 
  HomeIcon,
  ClockIcon,
  DocumentTextIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  UserPlusIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

const LeadConversionFix = ({ 
  isOpen, 
  onClose, 
  leadData, 
  onConvert, 
  isConverting = false,
  onDebugLog
}) => {
  const { isDark } = useTheme();
  
  // Estados críticos do modal
  const [activeTab, setActiveTab] = useState('personal');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [conversionApproved, setConversionApproved] = useState(false);
  const [validationPassed, setValidationPassed] = useState(false);
  const [debugMode, setDebugMode] = useState(true);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    numeroCC: '',
    numeroFiscal: '',
    profissao: '',
    residencia: {
      rua: '',
      numero: '',
      andar: '',
      codigoPostal: '',
      localidade: '',
      concelho: '',
      distrito: ''
    },
    naturalidade: {
      freguesia: '',
      concelho: '',
      distrito: ''
    },
    estadoCivil: 'solteiro',
    comunhaoBens: '',
    temConjuge: false,
    conjuge: {
      nome: '',
      numeroCC: '',
      numeroFiscal: '',
      email: '',
      telefone: '',
      profissao: '',
      rendimento: ''
    },
    rendimentoMensal: '',
    rendimentoAnual: '',
    situacaoCredito: 'sem_restricoes',
    bancoPreferencial: '',
    preAprovacaoCredito: false,
    valorPreAprovado: '',
    tipoImovelProcurado: [],
    localizacaoPreferida: [],
    orcamentoMinimo: '',
    orcamentoMaximo: '',
    caracteristicasEssenciais: [],
    caracteristicasDesejadas: [],
    prazoDecisao: '',
    motivoCompra: '',
    prioridadeConversao: 'normal',
    disponibilidadeVisitas: [],
    documentosDisponiveis: [],
    anexos: [],
    observacoesDocumentacao: '',
    observacoesConsultor: '',
    proximosPassos: [],
    notasEspeciais: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [conversionHistory, setConversionHistory] = useState([]);

  // Controlar visibilidade do modal
  useEffect(() => {
    if (isOpen) {
      debugLog('🔍 Modal de conversão solicitado para abrir');
      setTimeout(() => {
        setIsModalVisible(true);
        debugLog('✅ Modal de conversão agora visível');
      }, 100);
      initializeFormWithLeadData();
    } else {
      setIsModalVisible(false);
      debugLog('❌ Modal de conversão fechado');
    }
  }, [isOpen]);

  // Função de debug centralizada
  const debugLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString('pt-PT');
    const logEntry = {
      timestamp,
      message,
      data,
      leadId: leadData?.id,
      modalVisible: isModalVisible
    };
    
    console.log(`[${timestamp}] CONVERSÃO:`, message, data);
    
    if (onDebugLog) {
      onDebugLog(logEntry);
    }
    
    setConversionHistory(prev => [...prev.slice(-20), logEntry]);
  };

  // Inicializar formulário com dados do lead
  const initializeFormWithLeadData = () => {
    if (!leadData) {
      debugLog('⚠️ Dados do lead não disponíveis para inicialização');
      return;
    }

    debugLog('🔄 Inicializando formulário com dados do lead', leadData);

    setFormData(prev => ({
      ...prev,
      nome: leadData.name || '',
      email: leadData.email || '',
      telefone: leadData.phone || '',
      tipoImovelProcurado: leadData.propertyType ? [leadData.propertyType] : [],
      orcamentoMaximo: leadData.budget || '',
      prioridadeConversao: leadData.priority || 'normal',
      observacoesConsultor: `Lead convertido em ${new Date().toLocaleDateString('pt-PT')}\nOrigem: ${leadData.source || 'Desconhecida'}\nInteresse inicial: ${leadData.notes || 'Não especificado'}`
    }));

    debugLog('✅ Formulário inicializado com dados do lead');
  };

  // Validação rigorosa do formulário
  const validateFormCompleteness = () => {
    debugLog('🔍 Iniciando validação completa do formulário');
    
    const errors = {};
    
    // Validações obrigatórias - Dados pessoais
    if (!formData.numeroCC?.trim()) {
      errors.numeroCC = 'Número do Cartão de Cidadão é obrigatório';
    } else if (!/^\d{8}\s?\d{1}\s?[A-Z]{2}\d{1}$/.test(formData.numeroCC.replace(/\s/g, ''))) {
      errors.numeroCC = 'Formato do CC inválido (deve ser: 12345678 9 ZZ4)';
    }
    
    if (!formData.numeroFiscal?.trim()) {
      errors.numeroFiscal = 'Número de Identificação Fiscal é obrigatório';
    } else if (!/^\d{9}$/.test(formData.numeroFiscal)) {
      errors.numeroFiscal = 'NIF deve ter exatamente 9 dígitos';
    }
    
    if (!formData.profissao?.trim()) {
      errors.profissao = 'Profissão é obrigatória para qualificação';
    }
    
    // Validações de residência
    if (!formData.residencia.rua?.trim()) {
      errors['residencia.rua'] = 'Rua da residência é obrigatória';
    }
    
    if (!formData.residencia.codigoPostal?.trim()) {
      errors['residencia.codigoPostal'] = 'Código postal é obrigatório';
    } else if (!/^\d{4}-\d{3}$/.test(formData.residencia.codigoPostal)) {
      errors['residencia.codigoPostal'] = 'Formato do código postal inválido (NNNN-NNN)';
    }
    
    if (!formData.residencia.localidade?.trim()) {
      errors['residencia.localidade'] = 'Localidade é obrigatória';
    }
    
    // Validações de naturalidade
    if (!formData.naturalidade.concelho?.trim()) {
      errors['naturalidade.concelho'] = 'Concelho de naturalidade é obrigatório';
    }
    
    // Validações financeiras
    if (!formData.rendimentoMensal && !formData.rendimentoAnual) {
      errors.rendimentoMensal = 'Pelo menos um tipo de rendimento é obrigatório';
    }
    
    if (formData.rendimentoMensal && (isNaN(formData.rendimentoMensal) || formData.rendimentoMensal <= 0)) {
      errors.rendimentoMensal = 'Rendimento mensal deve ser um valor válido';
    }
    
    // Validações do cônjuge (se casado)
    if (['casado', 'uniao_facto'].includes(formData.estadoCivil)) {
      if (!formData.comunhaoBens) {
        errors.comunhaoBens = 'Comunhão de bens é obrigatória para casados';
      }
      
      if (formData.temConjuge) {
        if (!formData.conjuge.nome?.trim()) {
          errors['conjuge.nome'] = 'Nome do cônjuge é obrigatório';
        }
        if (!formData.conjuge.numeroCC?.trim()) {
          errors['conjuge.numeroCC'] = 'CC do cônjuge é obrigatório';
        }
        if (!formData.conjuge.numeroFiscal?.trim()) {
          errors['conjuge.numeroFiscal'] = 'NIF do cônjuge é obrigatório';
        }
      }
    }
    
    // Validações do imóvel
    if (!formData.tipoImovelProcurado || formData.tipoImovelProcurado.length === 0) {
      errors.tipoImovelProcurado = 'Pelo menos um tipo de imóvel deve ser selecionado';
    }
    
    if (!formData.orcamentoMaximo || isNaN(formData.orcamentoMaximo) || formData.orcamentoMaximo <= 0) {
      errors.orcamentoMaximo = 'Orçamento máximo é obrigatório e deve ser válido';
    }
    
    // Validações de timeline
    if (!formData.prazoDecisao) {
      errors.prazoDecisao = 'Prazo para decisão é obrigatório para qualificação';
    }
    
    if (!formData.motivoCompra?.trim()) {
      errors.motivoCompra = 'Motivo da compra é obrigatório para qualificar interesse';
    }

    const totalErrors = Object.keys(errors).length;
    
    debugLog(`📊 Validação concluída: ${totalErrors} erros encontrados`, {
      totalErrors,
      errors: Object.keys(errors),
      isValid: totalErrors === 0
    });
    
    setValidationErrors(errors);
    setValidationPassed(totalErrors === 0);
    
    return totalErrors === 0;
  };

  // Função de aprovação manual da conversão
  const handleApprovalToggle = () => {
    const newApprovalState = !conversionApproved;
    setConversionApproved(newApprovalState);
    
    debugLog(`🔐 Aprovação da conversão ${newApprovalState ? 'CONCEDIDA' : 'REVOGADA'}`, {
      approved: newApprovalState,
      validationPassed,
      canProceed: newApprovalState && validationPassed
    });
  };

  // Submissão controlada da conversão
  const handleSubmitConversion = () => {
    debugLog('🚀 Tentativa de submissão da conversão iniciada');

    // Verificar validação
    if (!validateFormCompleteness()) {
      debugLog('❌ Validação falhou - conversão bloqueada');
      alert('❌ Por favor, corrija todos os erros no formulário antes de converter');
      return;
    }

    // Verificar aprovação
    if (!conversionApproved) {
      debugLog('❌ Conversão não aprovada - bloqueada');
      alert('❌ É necessário aprovar a conversão para continuar');
      return;
    }

    debugLog('✅ Validação e aprovação OK - procedendo com conversão', {
      leadId: leadData.id,
      formDataKeys: Object.keys(formData),
      createSpouse: formData.temConjuge && ['casado', 'uniao_facto'].includes(formData.estadoCivil)
    });

    // Preparar dados de conversão
    const conversionData = {
      leadId: leadData.id,
      leadData: leadData,
      clientData: {
        ...formData,
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        source: leadData.source,
        originalLeadId: leadData.id,
        conversionDate: new Date().toISOString(),
        approvedBy: 'manual_approval',
        validationPassed: true
      },
      createOpportunity: true,
      createSpouse: formData.temConjuge && ['casado', 'uniao_facto'].includes(formData.estadoCivil),
      conversionApproved: true,
      debugInfo: {
        modalVisible: isModalVisible,
        validationErrors: validationErrors,
        conversionHistory: conversionHistory
      }
    };

    debugLog('📤 Enviando dados de conversão para processamento', conversionData);
    
    // Chamar função de conversão
    onConvert(conversionData);
  };

  // Atualização de campos do formulário
  const updateFormField = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      // Suporte para campos aninhados
      if (path.includes('.')) {
        const [parent, child] = path.split('.');
        newData[parent] = { ...newData[parent], [child]: value };
      } else {
        newData[path] = value;
      }
      
      debugLog(`📝 Campo atualizado: ${path} = ${value}`);
      return newData;
    });
    
    // Limpar erro de validação deste campo
    if (validationErrors[path]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[path];
        return newErrors;
      });
    }
  };

  // Renderizar tabs de navegação
  const renderTabs = () => {
    const tabs = [
      { id: 'personal', label: 'Dados Pessoais', icon: UserIcon, required: true },
      { id: 'financial', label: 'Informações Financeiras', icon: CurrencyEuroIcon, required: true },
      { id: 'property', label: 'Detalhes do Imóvel', icon: HomeIcon, required: true },
      { id: 'timeline', label: 'Timeline & Urgência', icon: ClockIcon, required: true },
      { id: 'documents', label: 'Documentação', icon: DocumentTextIcon, required: false },
      { id: 'approval', label: 'Aprovação Final', icon: CheckCircleIcon, required: true }
    ];

    return (
      <div className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const hasErrors = Object.keys(validationErrors).some(key => 
              key.startsWith(tab.id) || 
              (tab.id === 'personal' && ['numeroCC', 'numeroFiscal', 'profissao'].includes(key)) ||
              (tab.id === 'financial' && ['rendimentoMensal', 'rendimentoAnual'].includes(key))
            );
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  isActive
                    ? `border-blue-500 text-blue-600 ${isDark ? 'text-blue-400' : ''}`
                    : `border-transparent ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
                {tab.required && (
                  <span className="text-red-500 text-xs">*</span>
                )}
                {hasErrors && (
                  <ExclamationTriangleIcon className="h-4 w-4 text-red-500" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    );
  };

  // Renderizar conteúdo dos tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalDataTab();
      case 'financial':
        return renderFinancialTab();
      case 'property':
        return renderPropertyTab();
      case 'timeline':
        return renderTimelineTab();
      case 'documents':
        return renderDocumentsTab();
      case 'approval':
        return renderApprovalTab();
      default:
        return null;
    }
  };

  // TAB: DADOS PESSOAIS
  const renderPersonalDataTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Número do CC */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Número do Cartão de Cidadão *
          </label>
          <input
            type="text"
            value={formData.numeroCC}
            onChange={(e) => updateFormField('numeroCC', e.target.value)}
            placeholder="12345678 9 ZZ4"
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              validationErrors.numeroCC 
                ? 'border-red-500' 
                : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
            }`}
          />
          {validationErrors.numeroCC && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.numeroCC}</p>
          )}
        </div>

        {/* NIF */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Número de Identificação Fiscal *
          </label>
          <input
            type="text"
            value={formData.numeroFiscal}
            onChange={(e) => updateFormField('numeroFiscal', e.target.value)}
            placeholder="123456789"
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              validationErrors.numeroFiscal 
                ? 'border-red-500' 
                : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
            }`}
          />
          {validationErrors.numeroFiscal && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.numeroFiscal}</p>
          )}
        </div>

        {/* Profissão */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Profissão *
          </label>
          <input
            type="text"
            value={formData.profissao}
            onChange={(e) => updateFormField('profissao', e.target.value)}
            placeholder="Ex: Engenheiro, Professor, Comercial..."
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              validationErrors.profissao 
                ? 'border-red-500' 
                : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
            }`}
          />
          {validationErrors.profissao && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.profissao}</p>
          )}
        </div>

        {/* Estado Civil */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Estado Civil *
          </label>
          <select
            value={formData.estadoCivil}
            onChange={(e) => updateFormField('estadoCivil', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
            }`}
          >
            <option value="solteiro">Solteiro(a)</option>
            <option value="casado">Casado(a)</option>
            <option value="divorciado">Divorciado(a)</option>
            <option value="viuvo">Viúvo(a)</option>
            <option value="uniao_facto">União de Facto</option>
          </select>
        </div>

        {/* Rua */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Rua *
          </label>
          <input
            type="text"
            value={formData.residencia.rua}
            onChange={(e) => updateFormField('residencia.rua', e.target.value)}
            placeholder="Ex: Rua da Liberdade, 123"
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              validationErrors['residencia.rua'] 
                ? 'border-red-500' 
                : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
            }`}
          />
          {validationErrors['residencia.rua'] && (
            <p className="text-red-500 text-xs mt-1">{validationErrors['residencia.rua']}</p>
          )}
        </div>

        {/* Código Postal */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Código Postal *
          </label>
          <input
            type="text"
            value={formData.residencia.codigoPostal}
            onChange={(e) => updateFormField('residencia.codigoPostal', e.target.value)}
            placeholder="1000-001"
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              validationErrors['residencia.codigoPostal'] 
                ? 'border-red-500' 
                : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
            }`}
          />
          {validationErrors['residencia.codigoPostal'] && (
            <p className="text-red-500 text-xs mt-1">{validationErrors['residencia.codigoPostal']}</p>
          )}
        </div>

        {/* Localidade */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Localidade *
          </label>
          <input
            type="text"
            value={formData.residencia.localidade}
            onChange={(e) => updateFormField('residencia.localidade', e.target.value)}
            placeholder="Ex: Lisboa"
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              validationErrors['residencia.localidade'] 
                ? 'border-red-500' 
                : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
            }`}
          />
          {validationErrors['residencia.localidade'] && (
            <p className="text-red-500 text-xs mt-1">{validationErrors['residencia.localidade']}</p>
          )}
        </div>

        {/* Concelho de Naturalidade */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Concelho de Naturalidade *
          </label>
          <input
            type="text"
            value={formData.naturalidade.concelho}
            onChange={(e) => updateFormField('naturalidade.concelho', e.target.value)}
            placeholder="Ex: Coimbra"
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              validationErrors['naturalidade.concelho'] 
                ? 'border-red-500' 
                : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
            }`}
          />
          {validationErrors['naturalidade.concelho'] && (
            <p className="text-red-500 text-xs mt-1">{validationErrors['naturalidade.concelho']}</p>
          )}
        </div>
      </div>

      {/* Comunhão de Bens (se casado) */}
      {['casado', 'uniao_facto'].includes(formData.estadoCivil) && (
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Regime de Bens *
          </label>
          <select
            value={formData.comunhaoBens}
            onChange={(e) => updateFormField('comunhaoBens', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              validationErrors.comunhaoBens 
                ? 'border-red-500' 
                : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
            }`}
          >
            <option value="">Selecione o regime de bens</option>
            <option value="comunhao_geral">Comunhão Geral</option>
            <option value="comunhao_adquiridos">Comunhão de Adquiridos</option>
            <option value="separacao_bens">Separação de Bens</option>
          </select>
          {validationErrors.comunhaoBens && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.comunhaoBens}</p>
          )}
        </div>
      )}

      {/* Checkbox para cônjuge */}
      {['casado', 'uniao_facto'].includes(formData.estadoCivil) && (
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="temConjuge"
            checked={formData.temConjuge}
            onChange={(e) => updateFormField('temConjuge', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="temConjuge" className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <UserPlusIcon className="inline h-4 w-4 mr-1" />
            Adicionar cônjuge como cliente
          </label>
        </div>
      )}

      {/* Dados do cônjuge (se selecionado) */}
      {formData.temConjuge && ['casado', 'uniao_facto'].includes(formData.estadoCivil) && (
        <div className={`p-4 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
          <h4 className={`font-medium mb-4 flex items-center ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            <HeartIcon className="h-5 w-5 mr-2 text-pink-500" />
            Dados do Cônjuge
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.conjuge.nome}
                onChange={(e) => updateFormField('conjuge.nome', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  validationErrors['conjuge.nome'] 
                    ? 'border-red-500' 
                    : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                }`}
              />
              {validationErrors['conjuge.nome'] && (
                <p className="text-red-500 text-xs mt-1">{validationErrors['conjuge.nome']}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                Cartão de Cidadão *
              </label>
              <input
                type="text"
                value={formData.conjuge.numeroCC}
                onChange={(e) => updateFormField('conjuge.numeroCC', e.target.value)}
                placeholder="12345678 9 ZZ4"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  validationErrors['conjuge.numeroCC'] 
                    ? 'border-red-500' 
                    : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                }`}
              />
              {validationErrors['conjuge.numeroCC'] && (
                <p className="text-red-500 text-xs mt-1">{validationErrors['conjuge.numeroCC']}</p>
              )}
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                NIF *
              </label>
              <input
                type="text"
                value={formData.conjuge.numeroFiscal}
                onChange={(e) => updateFormField('conjuge.numeroFiscal', e.target.value)}
                placeholder="123456789"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  validationErrors['conjuge.numeroFiscal'] 
                    ? 'border-red-500' 
                    : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                }`}
              />
              {validationErrors['conjuge.numeroFiscal'] && (
                <p className="text-red-500 text-xs mt-1">{validationErrors['conjuge.numeroFiscal']}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // TAB: INFORMAÇÕES FINANCEIRAS
  const renderFinancialTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Rendimento Mensal */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Rendimento Mensal Líquido *
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.rendimentoMensal}
              onChange={(e) => updateFormField('rendimentoMensal', e.target.value)}
              placeholder="1500"
              className={`w-full pl-8 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                validationErrors.rendimentoMensal 
                  ? 'border-red-500' 
                  : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
              }`}
            />
            <CurrencyEuroIcon className="h-5 w-5 text-gray-400 absolute left-2 top-2.5" />
          </div>
          {validationErrors.rendimentoMensal && (
            <p className="text-red-500 text-xs mt-1">{validationErrors.rendimentoMensal}</p>
          )}
        </div>

        {/* Situação de Crédito */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
            Situação de Crédito
          </label>
          <select
            value={formData.situacaoCredito}
            onChange={(e) => updateFormField('situacaoCredito', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
            }`}
          >
            <option value="sem_restricoes">Sem Restrições</option>
            <option value="restricoes_menores">Restrições Menores</option>
            <option value="restricoes_significativas">Restrições Significativas</option>
            <option value="incumprimento">Em Incumprimento</option>
          </select>
        </div>
      </div>
    </div>
  );

  // TAB: DETALHES DO IMÓVEL
  const renderPropertyTab = () => (
    <div className="space-y-6">
      
      {/* Tipo de Imóvel Procurado */}
      <div>
        <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          Tipo de Imóvel Procurado *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['apartamento', 'moradia', 'terreno', 'comercial', 'industrial', 'escritorio'].map((tipo) => (
            <label key={tipo} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.tipoImovelProcurado.includes(tipo)}
                onChange={(e) => {
                  const newTypes = e.target.checked 
                    ? [...formData.tipoImovelProcurado, tipo]
                    : formData.tipoImovelProcurado.filter(t => t !== tipo);
                  updateFormField('tipoImovelProcurado', newTypes);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className={`text-sm capitalize ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {tipo}
              </span>
            </label>
          ))}
        </div>
        {validationErrors.tipoImovelProcurado && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.tipoImovelProcurado}</p>
        )}
      </div>

      {/* Orçamento Máximo */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          Orçamento Máximo *
        </label>
        <div className="relative">
          <input
            type="number"
            value={formData.orcamentoMaximo}
            onChange={(e) => updateFormField('orcamentoMaximo', e.target.value)}
            placeholder="300000"
            className={`w-full pl-8 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
              validationErrors.orcamentoMaximo 
                ? 'border-red-500' 
                : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
            }`}
          />
          <CurrencyEuroIcon className="h-5 w-5 text-gray-400 absolute left-2 top-2.5" />
        </div>
        {validationErrors.orcamentoMaximo && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.orcamentoMaximo}</p>
        )}
      </div>
    </div>
  );

  // TAB: TIMELINE E URGÊNCIA
  const renderTimelineTab = () => (
    <div className="space-y-6">
      
      {/* Prazo para Decisão */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          Prazo para Decisão *
        </label>
        <select
          value={formData.prazoDecisao}
          onChange={(e) => updateFormField('prazoDecisao', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
            validationErrors.prazoDecisao 
              ? 'border-red-500' 
              : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
          }`}
        >
          <option value="">Selecione o prazo</option>
          <option value="imediato">Imediato (até 1 mês)</option>
          <option value="curto">Curto Prazo (1-3 meses)</option>
          <option value="medio">Médio Prazo (3-6 meses)</option>
          <option value="longo">Longo Prazo (6+ meses)</option>
          <option value="indefinido">Sem prazo definido</option>
        </select>
        {validationErrors.prazoDecisao && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.prazoDecisao}</p>
        )}
      </div>

      {/* Motivo da Compra */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          Motivo da Compra *
        </label>
        <select
          value={formData.motivoCompra}
          onChange={(e) => updateFormField('motivoCompra', e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
            validationErrors.motivoCompra 
              ? 'border-red-500' 
              : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
          }`}
        >
          <option value="">Selecione o motivo</option>
          <option value="primeira_habitacao">Primeira Habitação</option>
          <option value="habitacao_propria">Habitação Própria</option>
          <option value="investimento">Investimento</option>
          <option value="mudanca_trabalho">Mudança de Trabalho</option>
          <option value="aumento_familia">Aumento da Família</option>
          <option value="melhoria_vida">Melhoria de Qualidade de Vida</option>
          <option value="outro">Outro</option>
        </select>
        {validationErrors.motivoCompra && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.motivoCompra}</p>
        )}
      </div>
    </div>
  );

  // TAB: DOCUMENTAÇÃO
  const renderDocumentsTab = () => (
    <div className="space-y-6">
      <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'} border`}>
        <div className="flex items-center space-x-2 mb-2">
          <InformationCircleIcon className="h-5 w-5 text-blue-500" />
          <span className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
            Documentação (Opcional)
          </span>
        </div>
        <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-600'}`}>
          Esta secção é opcional mas recomendada. A documentação pode ser anexada agora ou posteriormente no processo.
        </p>
      </div>
    </div>
  );

  // TAB: APROVAÇÃO FINAL
  const renderApprovalTab = () => (
    <div className="space-y-6">
      
      {/* Status de Validação */}
      <div className={`p-4 rounded-lg border-2 ${
        validationPassed 
          ? `border-green-500 ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`
          : `border-red-500 ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`
      }`}>
        <div className="flex items-center space-x-3 mb-3">
          {validationPassed ? (
            <CheckCircleIcon className="h-6 w-6 text-green-500" />
          ) : (
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
          )}
          <span className={`font-medium ${
            validationPassed 
              ? 'text-green-700' 
              : 'text-red-700'
          }`}>
            {validationPassed ? 'Validação Aprovada' : 'Validação Pendente'}
          </span>
        </div>
        
        <p className={`text-sm ${
          validationPassed 
            ? isDark ? 'text-green-200' : 'text-green-600'
            : isDark ? 'text-red-200' : 'text-red-600'
        }`}>
          {validationPassed 
            ? 'Todos os campos obrigatórios foram preenchidos corretamente.'
            : `${Object.keys(validationErrors).length} erro(s) encontrado(s). Por favor, corrija antes de aprovar.`
          }
        </p>

        {!validationPassed && (
          <div className="mt-3">
            <button
              onClick={validateFormCompleteness}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              🔍 Verificar novamente
            </button>
          </div>
        )}
      </div>

      {/* Resumo dos Dados */}
      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border`}>
        <h4 className={`font-medium mb-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          Resumo da Conversão
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Lead:</span>
            <span className={`ml-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {leadData?.name} ({leadData?.email})
            </span>
          </div>
          
          <div>
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Profissão:</span>
            <span className={`ml-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {formData.profissao || 'Não informado'}
            </span>
          </div>
          
          <div>
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Estado Civil:</span>
            <span className={`ml-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {formData.estadoCivil || 'Não informado'}
            </span>
          </div>
          
          <div>
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Cônjuge:</span>
            <span className={`ml-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {formData.temConjuge ? `Sim (${formData.conjuge.nome})` : 'Não'}
            </span>
          </div>
          
          <div>
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Orçamento:</span>
            <span className={`ml-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {formData.orcamentoMaximo ? `€${parseInt(formData.orcamentoMaximo).toLocaleString('pt-PT')}` : 'Não informado'}
            </span>
          </div>
          
          <div>
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Prazo:</span>
            <span className={`ml-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
              {formData.prazoDecisao || 'Não informado'}
            </span>
          </div>
        </div>
      </div>

      {/* Aprovação Manual */}
      <div className={`p-4 rounded-lg border-2 border-dashed ${
        conversionApproved 
          ? `border-green-500 ${isDark ? 'bg-green-900/10' : 'bg-green-50'}`
          : `border-gray-400 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleApprovalToggle}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                conversionApproved
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {conversionApproved ? (
                <CheckCircleIcon className="h-5 w-5" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5" />
              )}
              <span>
                {conversionApproved ? 'Conversão Aprovada' : 'Aprovar Conversão'}
              </span>
            </button>
          </div>
          
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {conversionApproved 
              ? '✅ Pronto para converter'
              : '⏳ Aprovação necessária'
            }
          </div>
        </div>
        
        <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          A aprovação manual garante que todos os dados foram revistos antes da conversão.
        </p>
      </div>

      {/* Observações Finais */}
      <div>
        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          Observações do Consultor
        </label>
        <textarea
          value={formData.observacoesConsultor}
          onChange={(e) => updateFormField('observacoesConsultor', e.target.value)}
          placeholder="Observações finais sobre o cliente, próximos passos, notas especiais..."
          rows={4}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
            isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
          }`}
        />
      </div>
    </div>
  );

  // Mostrar debug (se ativado)
  const renderDebugPanel = () => {
    if (!debugMode) return null;

    return (
      <div className={`mt-4 p-3 rounded-md text-xs ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">🔍 Debug Info</span>
          <button
            onClick={() => setDebugMode(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <EyeSlashIcon className="h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-1">
          <div>Modal Visível: {isModalVisible ? '✅' : '❌'}</div>
          <div>Validação: {validationPassed ? '✅' : '❌'} ({Object.keys(validationErrors).length} erros)</div>
          <div>Aprovação: {conversionApproved ? '✅' : '❌'}</div>
          <div>Logs: {conversionHistory.length} entradas</div>
          <div>Lead ID: {leadData?.id}</div>
        </div>
      </div>
    );
  };

  // Se modal não deve ser visível, retornar null
  if (!isOpen || !isModalVisible) {
    debugLog('❌ Modal não deve ser renderizado', { isOpen, isModalVisible });
    return null;
  }

  debugLog('✅ Renderizando modal de conversão', { 
    activeTab, 
    validationPassed, 
    conversionApproved,
    errorsCount: Object.keys(validationErrors).length
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🔄 Conversão Lead → Cliente + Oportunidade
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Lead: <strong>{leadData?.name}</strong> ({leadData?.email})
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Botão de Debug */}
              <button
                onClick={() => setDebugMode(!debugMode)}
                className={`p-2 rounded-md ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                title="Toggle Debug"
              >
                {debugMode ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
              
              {/* Botão de Fechar */}
              <button
                onClick={onClose}
                className={`p-2 rounded-md ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs de Navegação */}
        {renderTabs()}

        {/* Conteúdo do Modal */}
        <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {renderTabContent()}
          
          {/* Debug Panel */}
          {renderDebugPanel()}
        </div>

        {/* Footer com Ações */}
        <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            
            {/* Status */}
            <div className="flex items-center space-x-4 text-sm">
              <div className={`flex items-center space-x-2 ${
                validationPassed ? 'text-green-600' : 'text-red-600'
              }`}>
                {validationPassed ? (
                  <CheckCircleIcon className="h-4 w-4" />
                ) : (
                  <ExclamationTriangleIcon className="h-4 w-4" />
                )}
                <span>
                  {validationPassed ? 'Validação OK' : `${Object.keys(validationErrors).length} erros`}
                </span>
              </div>
              
              <div className={`flex items-center space-x-2 ${
                conversionApproved ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {conversionApproved ? (
                  <CheckCircleIcon className="h-4 w-4" />
                ) : (
                  <ClockIcon className="h-4 w-4" />
                )}
                <span>
                  {conversionApproved ? 'Aprovado' : 'Pendente'}
                </span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex items-center space-x-3">
              
              {/* Botão Validar */}
              <button
                onClick={validateFormCompleteness}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                🔍 Validar
              </button>

              {/* Botão Cancelar */}
              <button
                onClick={onClose}
                disabled={isConverting}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                Cancelar
              </button>

              {/* Botão Converter */}
              <button
                onClick={handleSubmitConversion}
                disabled={!validationPassed || !conversionApproved || isConverting}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  validationPassed && conversionApproved && !isConverting
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }`}
              >
                {isConverting ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Convertendo...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Converter Lead</span>
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Mensagem de Status */}
          {(!validationPassed || !conversionApproved) && (
            <div className={`mt-3 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {!validationPassed && '⚠️ Complete todos os campos obrigatórios'}
              {!validationPassed && !conversionApproved && ' • '}
              {!conversionApproved && '🔐 Aprovação manual necessária'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadConversionFix;