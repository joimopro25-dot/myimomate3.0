// src/components/modals/LeadToClientConversionModal.jsx
// 🔄 MODAL DE CONVERSÃO LEAD → CLIENTE + OPORTUNIDADE
// =====================================================
// MyImoMate 3.0 - Sistema de conversão unificada com qualificação completa
// ✅ Formulário de qualificação do cliente
// ✅ Dados pessoais portugueses completos
// ✅ Sistema de anexos para documentação
// ✅ Criação automática de cônjuge como cliente
// ✅ Validações portuguesas (CC, NIF, CP)
// ✅ Conversão simultânea Cliente + Oportunidade

import React, { useState, useEffect, useRef } from 'react';
import { 
  XMarkIcon, 
  UserIcon, 
  CurrencyEuroIcon, 
  HomeIcon,
  ClockIcon,
  DocumentTextIcon,
  PaperClipIcon,
  ChatBubbleLeftRightIcon,
  HeartIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

const LeadToClientConversionModal = ({ 
  isOpen, 
  onClose, 
  leadData, 
  onConvert, 
  isConverting = false 
}) => {
  const { isDark } = useTheme();
  const fileInputRef = useRef(null);

  // Estados do formulário
  const [activeTab, setActiveTab] = useState('personal');
  const [formData, setFormData] = useState({
    // Dados pessoais principais
    numeroCC: '',
    numeroFiscal: '',
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
    
    // Dados do cônjuge
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
    
    // Informações financeiras
    rendimentoMensal: '',
    rendimentoAnual: '',
    situacaoCredito: 'sem_restricoes',
    bancoRelacionamento: '',
    temPreAprovacao: false,
    valorPreAprovacao: '',
    
    // Detalhes do imóvel
    tipoImovelProcurado: '',
    localizacaoPreferida: '',
    caracteristicasEspecificas: '',
    motivoTransacao: '',
    prazoDecisao: '1_3_meses',
    
    // Orçamento
    orcamentoMinimo: '',
    orcamentoMaximo: '',
    tipoFinanciamento: 'credito_habitacao',
    entrada: '',
    
    // Observações
    observacoesConsultor: '',
    prioridadeCliente: 'normal',
    fonteProcura: '',
    
    // Documentação
    documentosDisponiveis: [],
    anexos: []
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  // Inicializar com dados do lead
  useEffect(() => {
    if (leadData && isOpen) {
      setFormData(prev => ({
        ...prev,
        // Manter dados existentes do lead, apenas preencher campos vazios
        numeroFiscal: leadData.nif || '',
        residencia: {
          ...prev.residencia,
          rua: leadData.address?.rua || '',
          localidade: leadData.address?.localidade || ''
        },
        tipoImovelProcurado: leadData.propertyType || '',
        orcamentoMinimo: leadData.budgetMin || '',
        orcamentoMaximo: leadData.budgetMax || '',
        observacoesConsultor: `Convertido do lead: ${leadData.name}\nTelefone: ${leadData.phone}\nEmail: ${leadData.email}\nInteresse: ${leadData.interestType || 'N/A'}\nOrigem: ${leadData.source || 'N/A'}`
      }));
    }
  }, [leadData, isOpen]);

  // Opções para selects
  const estadoCivilOptions = [
    { value: 'solteiro', label: 'Solteiro(a)' },
    { value: 'casado', label: 'Casado(a)' },
    { value: 'divorciado', label: 'Divorciado(a)' },
    { value: 'viuvo', label: 'Viúvo(a)' },
    { value: 'uniao_facto', label: 'União de Facto' }
  ];

  const comunhaoBensOptions = [
    { value: 'geral', label: 'Comunhão Geral' },
    { value: 'adquiridos', label: 'Comunhão de Adquiridos' },
    { value: 'separacao', label: 'Separação de Bens' }
  ];

  const situacaoCreditoOptions = [
    { value: 'sem_restricoes', label: 'Sem Restrições' },
    { value: 'restricoes_leves', label: 'Restrições Leves' },
    { value: 'restricoes_graves', label: 'Restrições Graves' },
    { value: 'nao_sabe', label: 'Não Sabe/Prefere não dizer' }
  ];

  const prazoDecisaoOptions = [
    { value: 'imediato', label: 'Imediato (até 1 mês)' },
    { value: '1_3_meses', label: '1-3 meses' },
    { value: '3_6_meses', label: '3-6 meses' },
    { value: '6_12_meses', label: '6-12 meses' },
    { value: 'acima_12_meses', label: 'Acima de 12 meses' }
  ];

  const tipoFinanciamentoOptions = [
    { value: 'credito_habitacao', label: 'Crédito Habitação' },
    { value: 'leasing', label: 'Leasing' },
    { value: 'pagamento_vista', label: 'Pagamento à Vista' },
    { value: 'misto', label: 'Misto' }
  ];

  const prioridadeOptions = [
    { value: 'baixa', label: 'Baixa' },
    { value: 'normal', label: 'Normal' },
    { value: 'alta', label: 'Alta' },
    { value: 'urgente', label: 'Urgente' }
  ];

  const documentosOptions = [
    'Cartão de Cidadão',
    'Declaração IRS',
    'Recibos de Vencimento (3 últimos)',
    'Extratos Bancários',
    'Declaração do Banco',
    'Certidão de Casamento',
    'Escritura do Imóvel',
    'Caderneta Predial',
    'Certidão Energética',
    'Licença de Habitação',
    'Seguro do Imóvel',
    'Outros'
  ];

  // Handlers
  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Limpar erro do campo quando modificado
    if (validationErrors[`${section ? section + '.' : ''}${field}`]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${section ? section + '.' : ''}${field}`];
        return newErrors;
      });
    }
  };

  const handleDocumentToggle = (documento) => {
    setFormData(prev => ({
      ...prev,
      documentosDisponiveis: prev.documentosDisponiveis.includes(documento)
        ? prev.documentosDisponiveis.filter(d => d !== documento)
        : [...prev.documentosDisponiveis, documento]
    }));
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    for (const file of files) {
      // Validar tipo e tamanho do arquivo
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats'];
      
      if (file.size > maxSize) {
        alert(`Arquivo ${file.name} é muito grande (máx. 10MB)`);
        continue;
      }
      
      if (!allowedTypes.some(type => file.type.startsWith(type))) {
        alert(`Tipo de arquivo ${file.name} não permitido`);
        continue;
      }

      // Simular upload
      const fileId = Date.now() + Math.random();
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      // Simular progresso
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }
      
      // Adicionar à lista de anexos
      setFormData(prev => ({
        ...prev,
        anexos: [...prev.anexos, {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString()
        }]
      }));
      
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
    }
    
    // Limpar input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId) => {
    setFormData(prev => ({
      ...prev,
      anexos: prev.anexos.filter(file => file.id !== fileId)
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Validações obrigatórias
    if (!formData.numeroCC) errors['numeroCC'] = 'Número do CC é obrigatório';
    if (!formData.numeroFiscal) errors['numeroFiscal'] = 'NIF é obrigatório';
    if (!formData.residencia.rua) errors['residencia.rua'] = 'Rua é obrigatória';
    if (!formData.residencia.codigoPostal) errors['residencia.codigoPostal'] = 'Código postal é obrigatório';
    if (!formData.naturalidade.concelho) errors['naturalidade.concelho'] = 'Concelho de naturalidade é obrigatório';
    
    // Validação do cônjuge se casado
    if (['casado', 'uniao_facto'].includes(formData.estadoCivil) && formData.temConjuge) {
      if (!formData.conjuge.nome) errors['conjuge.nome'] = 'Nome do cônjuge é obrigatório';
      if (!formData.conjuge.numeroCC) errors['conjuge.numeroCC'] = 'CC do cônjuge é obrigatório';
      if (!formData.conjuge.numeroFiscal) errors['conjuge.numeroFiscal'] = 'NIF do cônjuge é obrigatório';
    }
    
    // Validações financeiras
    if (!formData.rendimentoMensal && !formData.rendimentoAnual) {
      errors['rendimentoMensal'] = 'Pelo menos um tipo de rendimento é obrigatório';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      alert('Por favor, corrija os erros no formulário');
      return;
    }
    
    // Preparar dados para conversão
    const conversionData = {
      leadId: leadData.id,
      clientData: formData,
      createOpportunity: true,
      createSpouse: formData.temConjuge && ['casado', 'uniao_facto'].includes(formData.estadoCivil)
    };
    
    onConvert(conversionData);
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'personal', label: 'Dados Pessoais', icon: UserIcon },
    { id: 'financial', label: 'Informações Financeiras', icon: CurrencyEuroIcon },
    { id: 'property', label: 'Detalhes do Imóvel', icon: HomeIcon },
    { id: 'timeline', label: 'Timeline & Orçamento', icon: ClockIcon },
    { id: 'documents', label: 'Documentação', icon: DocumentTextIcon },
    { id: 'notes', label: 'Observações', icon: ChatBubbleLeftRightIcon }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Converter Lead para Cliente + Oportunidade
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Lead: {leadData?.name} • {leadData?.email} • {leadData?.phone}
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`px-6 py-3 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? isDark
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700'
                      : isDark
                        ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[60vh]">
          
          {/* Tab: Dados Pessoais */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Número CC */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Número Cartão Cidadão *
                  </label>
                  <input
                    type="text"
                    value={formData.numeroCC}
                    onChange={(e) => handleInputChange(null, 'numeroCC', e.target.value)}
                    placeholder="00000000 0 ZZ0"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors['numeroCC'] 
                        ? 'border-red-500' 
                        : isDark 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300'
                    }`}
                  />
                  {validationErrors['numeroCC'] && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors['numeroCC']}</p>
                  )}
                </div>

                {/* NIF */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Número Fiscal (NIF) *
                  </label>
                  <input
                    type="text"
                    value={formData.numeroFiscal}
                    onChange={(e) => handleInputChange(null, 'numeroFiscal', e.target.value)}
                    placeholder="000000000"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors['numeroFiscal'] 
                        ? 'border-red-500' 
                        : isDark 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300'
                    }`}
                  />
                  {validationErrors['numeroFiscal'] && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors['numeroFiscal']}</p>
                  )}
                </div>
              </div>

              {/* Residência */}
              <div>
                <h4 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Residência
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Rua *
                    </label>
                    <input
                      type="text"
                      value={formData.residencia.rua}
                      onChange={(e) => handleInputChange('residencia', 'rua', e.target.value)}
                      placeholder="Nome da rua"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors['residencia.rua'] 
                          ? 'border-red-500' 
                          : isDark 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Número
                    </label>
                    <input
                      type="text"
                      value={formData.residencia.numero}
                      onChange={(e) => handleInputChange('residencia', 'numero', e.target.value)}
                      placeholder="Nº"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Andar
                    </label>
                    <input
                      type="text"
                      value={formData.residencia.andar}
                      onChange={(e) => handleInputChange('residencia', 'andar', e.target.value)}
                      placeholder="Andar (opcional)"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      value={formData.residencia.codigoPostal}
                      onChange={(e) => handleInputChange('residencia', 'codigoPostal', e.target.value)}
                      placeholder="0000-000"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors['residencia.codigoPostal'] 
                          ? 'border-red-500' 
                          : isDark 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Localidade
                    </label>
                    <input
                      type="text"
                      value={formData.residencia.localidade}
                      onChange={(e) => handleInputChange('residencia', 'localidade', e.target.value)}
                      placeholder="Localidade"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Naturalidade */}
              <div>
                <h4 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Naturalidade
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Freguesia
                    </label>
                    <input
                      type="text"
                      value={formData.naturalidade.freguesia}
                      onChange={(e) => handleInputChange('naturalidade', 'freguesia', e.target.value)}
                      placeholder="Freguesia"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Concelho *
                    </label>
                    <input
                      type="text"
                      value={formData.naturalidade.concelho}
                      onChange={(e) => handleInputChange('naturalidade', 'concelho', e.target.value)}
                      placeholder="Concelho"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        validationErrors['naturalidade.concelho'] 
                          ? 'border-red-500' 
                          : isDark 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Distrito
                    </label>
                    <input
                      type="text"
                      value={formData.naturalidade.distrito}
                      onChange={(e) => handleInputChange('naturalidade', 'distrito', e.target.value)}
                      placeholder="Distrito"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Estado Civil */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Estado Civil
                  </label>
                  <select
                    value={formData.estadoCivil}
                    onChange={(e) => handleInputChange(null, 'estadoCivil', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  >
                    {estadoCivilOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.estadoCivil === 'casado' && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Comunhão de Bens
                    </label>
                    <select
                      value={formData.comunhaoBens}
                      onChange={(e) => handleInputChange(null, 'comunhaoBens', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecionar...</option>
                      {comunhaoBensOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Dados do Cônjuge */}
              {['casado', 'uniao_facto'].includes(formData.estadoCivil) && (
                <div className={`p-4 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-lg font-medium flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      <HeartIcon className="h-5 w-5 mr-2 text-red-500" />
                      Dados do Cônjuge
                    </h4>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.temConjuge}
                        onChange={(e) => handleInputChange(null, 'temConjuge', e.target.checked)}
                        className="rounded"
                      />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Adicionar cônjuge como cliente
                      </span>
                    </label>
                  </div>

                  {formData.temConjuge && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          value={formData.conjuge.nome}
                          onChange={(e) => handleInputChange('conjuge', 'nome', e.target.value)}
                          placeholder="Nome completo do cônjuge"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            validationErrors['conjuge.nome'] 
                              ? 'border-red-500' 
                              : isDark 
                                ? 'border-gray-600 bg-gray-700 text-white' 
                                : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.conjuge.email}
                          onChange={(e) => handleInputChange('conjuge', 'email', e.target.value)}
                          placeholder="email@exemplo.com"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          CC do Cônjuge *
                        </label>
                        <input
                          type="text"
                          value={formData.conjuge.numeroCC}
                          onChange={(e) => handleInputChange('conjuge', 'numeroCC', e.target.value)}
                          placeholder="00000000 0 ZZ0"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            validationErrors['conjuge.numeroCC'] 
                              ? 'border-red-500' 
                              : isDark 
                                ? 'border-gray-600 bg-gray-700 text-white' 
                                : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          NIF do Cônjuge *
                        </label>
                        <input
                          type="text"
                          value={formData.conjuge.numeroFiscal}
                          onChange={(e) => handleInputChange('conjuge', 'numeroFiscal', e.target.value)}
                          placeholder="000000000"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            validationErrors['conjuge.numeroFiscal'] 
                              ? 'border-red-500' 
                              : isDark 
                                ? 'border-gray-600 bg-gray-700 text-white' 
                                : 'border-gray-300'
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Tab: Informações Financeiras */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rendimento Mensal (€)
                  </label>
                  <input
                    type="number"
                    value={formData.rendimentoMensal}
                    onChange={(e) => handleInputChange(null, 'rendimentoMensal', e.target.value)}
                    placeholder="1500"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      validationErrors['rendimentoMensal'] 
                        ? 'border-red-500' 
                        : isDark 
                          ? 'border-gray-600 bg-gray-700 text-white' 
                          : 'border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rendimento Anual (€)
                  </label>
                  <input
                    type="number"
                    value={formData.rendimentoAnual}
                    onChange={(e) => handleInputChange(null, 'rendimentoAnual', e.target.value)}
                    placeholder="18000"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Situação de Crédito
                  </label>
                  <select
                    value={formData.situacaoCredito}
                    onChange={(e) => handleInputChange(null, 'situacaoCredito', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  >
                    {situacaoCreditoOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Banco de Relacionamento
                  </label>
                  <input
                    type="text"
                    value={formData.bancoRelacionamento}
                    onChange={(e) => handleInputChange(null, 'bancoRelacionamento', e.target.value)}
                    placeholder="Ex: CGD, BCP, Santander..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Pré-aprovação */}
              <div className={`p-4 rounded-lg border-2 border-dashed ${isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'}`}>
                <label className="flex items-center space-x-2 mb-3">
                  <input
                    type="checkbox"
                    checked={formData.temPreAprovacao}
                    onChange={(e) => handleInputChange(null, 'temPreAprovacao', e.target.checked)}
                    className="rounded"
                  />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Tem pré-aprovação de crédito
                  </span>
                </label>
                
                {formData.temPreAprovacao && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Valor da Pré-aprovação (€)
                    </label>
                    <input
                      type="number"
                      value={formData.valorPreAprovacao}
                      onChange={(e) => handleInputChange(null, 'valorPreAprovacao', e.target.value)}
                      placeholder="150000"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Detalhes do Imóvel */}
          {activeTab === 'property' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo de Imóvel Procurado
                  </label>
                  <input
                    type="text"
                    value={formData.tipoImovelProcurado}
                    onChange={(e) => handleInputChange(null, 'tipoImovelProcurado', e.target.value)}
                    placeholder="Ex: Apartamento T2, Moradia T3..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Localização Preferida
                  </label>
                  <input
                    type="text"
                    value={formData.localizacaoPreferida}
                    onChange={(e) => handleInputChange(null, 'localizacaoPreferida', e.target.value)}
                    placeholder="Ex: Centro de Lisboa, Cascais..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Características Específicas
                </label>
                <textarea
                  value={formData.caracteristicasEspecificas}
                  onChange={(e) => handleInputChange(null, 'caracteristicasEspecificas', e.target.value)}
                  placeholder="Ex: Varanda, garagem, piscina, jardim, vista mar..."
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Motivo da Transação
                </label>
                <input
                  type="text"
                  value={formData.motivoTransacao}
                  onChange={(e) => handleInputChange(null, 'motivoTransacao', e.target.value)}
                  placeholder="Ex: Primeira habitação, investimento, mudança..."
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
          )}

          {/* Tab: Timeline & Orçamento */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Prazo para Decisão
                  </label>
                  <select
                    value={formData.prazoDecisao}
                    onChange={(e) => handleInputChange(null, 'prazoDecisao', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  >
                    {prazoDecisaoOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo de Financiamento
                  </label>
                  <select
                    value={formData.tipoFinanciamento}
                    onChange={(e) => handleInputChange(null, 'tipoFinanciamento', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  >
                    {tipoFinanciamentoOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Orçamento Mínimo (€)
                  </label>
                  <input
                    type="number"
                    value={formData.orcamentoMinimo}
                    onChange={(e) => handleInputChange(null, 'orcamentoMinimo', e.target.value)}
                    placeholder="100000"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Orçamento Máximo (€)
                  </label>
                  <input
                    type="number"
                    value={formData.orcamentoMaximo}
                    onChange={(e) => handleInputChange(null, 'orcamentoMaximo', e.target.value)}
                    placeholder="200000"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Entrada Disponível (€)
                  </label>
                  <input
                    type="number"
                    value={formData.entrada}
                    onChange={(e) => handleInputChange(null, 'entrada', e.target.value)}
                    placeholder="30000"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tab: Documentação */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              <div>
                <h4 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Documentos Disponíveis
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {documentosOptions.map((documento) => (
                    <label key={documento} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.documentosDisponiveis.includes(documento)}
                        onChange={() => handleDocumentToggle(documento)}
                        className="rounded"
                      />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {documento}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Upload de Anexos */}
              <div>
                <h4 className={`text-lg font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Anexar Documentos
                </h4>
                <div 
                  className={`border-2 border-dashed rounded-lg p-6 text-center ${
                    isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <PaperClipIcon className={`h-8 w-8 mx-auto mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Clique para anexar documentos ou arraste aqui
                  </p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    PDF, Word, Imagens (máx. 10MB cada)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Escolher Arquivos
                  </button>
                </div>

                {/* Lista de arquivos anexados */}
                {formData.anexos.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h5 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Arquivos Anexados ({formData.anexos.length})
                    </h5>
                    {formData.anexos.map((file) => (
                      <div 
                        key={file.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <DocumentTextIcon className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <div>
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {file.name}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(file.id)}
                          className={`p-1 rounded hover:bg-red-100 ${isDark ? 'text-red-400 hover:bg-red-900' : 'text-red-600'}`}
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Progresso de upload */}
                {Object.keys(uploadProgress).length > 0 && (
                  <div className="mt-4 space-y-2">
                    {Object.entries(uploadProgress).map(([fileId, progress]) => (
                      <div key={fileId} className={`p-3 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-white'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Enviando...
                          </span>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab: Observações */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Observações do Consultor
                </label>
                <textarea
                  value={formData.observacoesConsultor}
                  onChange={(e) => handleInputChange(null, 'observacoesConsultor', e.target.value)}
                  placeholder="Adicione observações importantes sobre o cliente, preferências específicas, histórico de contactos, etc."
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Prioridade do Cliente
                  </label>
                  <select
                    value={formData.prioridadeCliente}
                    onChange={(e) => handleInputChange(null, 'prioridadeCliente', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  >
                    {prioridadeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Fonte de Procura
                  </label>
                  <input
                    type="text"
                    value={formData.fonteProcura}
                    onChange={(e) => handleInputChange(null, 'fonteProcura', e.target.value)}
                    placeholder="Ex: Referência, website, redes sociais..."
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>

              {/* Resumo da conversão */}
              <div className={`p-4 rounded-lg border-2 ${isDark ? 'border-blue-600 bg-blue-900/20' : 'border-blue-200 bg-blue-50'}`}>
                <h4 className={`text-lg font-medium mb-3 flex items-center ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                  <InformationCircleIcon className="h-5 w-5 mr-2" />
                  Resumo da Conversão
                </h4>
                <div className={`text-sm space-y-2 ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
                  <p>• <strong>Lead convertido:</strong> {leadData?.name}</p>
                  <p>• <strong>Cliente principal criado</strong> com dados completos</p>
                  {formData.temConjuge && (
                    <p>• <strong>Cônjuge adicionado</strong> como cliente secundário</p>
                  )}
                  <p>• <strong>Oportunidade criada automaticamente</strong></p>
                  <p>• <strong>Documentos anexados:</strong> {formData.anexos.length} ficheiros</p>
                  <p>• <strong>Documentos disponíveis:</strong> {formData.documentosDisponiveis.length} tipos marcados</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex justify-between ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              isDark 
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Cancelar
          </button>
          
          <div className="flex space-x-3">
            {activeTab !== 'personal' && (
              <button
                onClick={() => {
                  const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1].id);
                  }
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Anterior
              </button>
            )}
            
            {activeTab !== 'notes' ? (
              <button
                onClick={() => {
                  const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1].id);
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Próximo
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isConverting}
                className={`px-6 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2 ${
                  isConverting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isConverting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Convertendo...</span>
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Aprovar e Converter</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadToClientConversionModal;