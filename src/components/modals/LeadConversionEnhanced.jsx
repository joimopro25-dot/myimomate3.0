// src/components/modals/LeadConversionEnhanced.jsx
// 🔄 MODAL DE CONVERSÃO LEAD → CLIENTE + OPORTUNIDADE ENRIQUECIDO
// ==============================================================
// MyImoMate 3.0 - Combinação do melhor dos dois mundos:
// ✅ Sistema de debug do LeadConversionFix
// ✅ Interface profissional com 6 tabs
// ✅ 40+ campos organizados do LeadToClientConversionModal
// ✅ Sistema de upload de documentos
// ✅ Validações portuguesas completas
// ✅ Sistema de aprovação estruturado
// ✅ DESIGN MODERNO GLASSMORPHISM - Cores claras profissionais

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
  ExclamationTriangleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  UserPlusIcon,
  HeartIcon,
  TrashIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  ThemedCard, 
  ThemedButton, 
  ThemedInput, 
  ThemedSelect, 
  ThemedTextarea,
  ThemedContainer 
} from '../common/ThemedComponents';

const LeadConversionEnhanced = ({ 
  isOpen, 
  onClose, 
  leadData, 
  onConvert, 
  isConverting = false,
  onDebugLog
}) => {
  const { isDark } = useTheme();
  const fileInputRef = useRef(null);
  
  // ✅ ESTADOS CRÍTICOS DO MODAL (MANTIDOS DO LeadConversionFix)
  const [activeTab, setActiveTab] = useState('personal');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [conversionApproved, setConversionApproved] = useState(false);
  const [validationPassed, setValidationPassed] = useState(false);
  const [debugMode, setDebugMode] = useState(true);
  
  // ✅ ESTADOS DO FORMULÁRIO ENRIQUECIDO (COMBINAÇÃO DE AMBOS)
  const [formData, setFormData] = useState({
    // DADOS PESSOAIS PRINCIPAIS
    numeroCC: '',
    numeroFiscal: '',
    profissao: '',
    dataNascimento: '',
    
    // RESIDÊNCIA COMPLETA
    residencia: {
      rua: '',
      numero: '',
      andar: '',
      codigoPostal: '',
      localidade: '',
      concelho: '',
      distrito: ''
    },
    
    // NATURALIDADE
    naturalidade: {
      freguesia: '',
      concelho: '',
      distrito: ''
    },
    
    // ESTADO CIVIL E CÔNJUGE
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
      rendimento: '',
      dataNascimento: ''
    },
    
    // INFORMAÇÕES FINANCEIRAS AVANÇADAS
    rendimentoMensal: '',
    rendimentoAnual: '',
    situacaoCredito: 'sem_restricoes',
    bancoPreferencial: '',
    bancoRelacionamento: '',
    preAprovacaoCredito: false,
    temPreAprovacao: false,
    valorPreAprovado: '',
    valorPreAprovacao: '',
    situacaoEmpreg: '',
    empresaTrabalho: '',
    cargoAtual: '',
    tempoEmprego: '',
    
    // DETALHES DO IMÓVEL
    tipoImovelProcurado: [],
    localizacaoPreferida: [],
    caracteristicasEssenciais: [],
    caracteristicasDesejadas: [],
    caracteristicasEspecificas: '',
    motivoTransacao: '',
    motivoCompra: '',
    
    // TIMELINE E ORÇAMENTO
    prazoDecisao: '1_3_meses',
    orcamentoMinimo: '',
    orcamentoMaximo: '',
    tipoFinanciamento: 'credito_habitacao',
    entrada: '',
    percentagemEntrada: '',
    valorMaximoCredito: '',
    
    // DOCUMENTAÇÃO E ANEXOS
    documentosDisponiveis: [],
    anexos: [],
    observacoesDocumentacao: '',
    
    // OBSERVAÇÕES E NOTAS
    observacoesConsultor: '',
    prioridadeConversao: 'normal',
    prioridadeCliente: 'normal',
    proximosPassos: [],
    notasEspeciais: '',
    fonteProcura: '',
    
    // DISPONIBILIDADE E CONTACTO
    disponibilidadeVisitas: [],
    contactoPreferido: 'telefone',
    melhorHorario: 'manha',
    
    // METADADOS
    origemLead: '',
    canalAquisicao: '',
    campanhaOrigem: '',
    consultorResponsavel: ''
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [conversionHistory, setConversionHistory] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  // ✅ CONTROLAR VISIBILIDADE DO MODAL (MANTIDO)
  useEffect(() => {
    if (isOpen) {
      debugLog('🔍 Modal de conversão enriquecido solicitado para abrir');
      setTimeout(() => {
        setIsModalVisible(true);
        debugLog('✅ Modal de conversão enriquecido agora visível');
      }, 100);
      initializeFormWithLeadData();
    } else {
      setIsModalVisible(false);
      debugLog('❌ Modal de conversão enriquecido fechado');
    }
  }, [isOpen]);

  // ✅ FUNÇÃO DE DEBUG CENTRALIZADA (MANTIDA)
  const debugLog = (message, data = null) => {
    const timestamp = new Date().toLocaleTimeString('pt-PT');
    const logEntry = {
      timestamp,
      message,
      data,
      leadId: leadData?.id,
      modalVisible: isModalVisible
    };
    
    console.log(`[${timestamp}] CONVERSÃO ENRIQUECIDA:`, message, data);
    
    if (onDebugLog) {
      onDebugLog(logEntry);
    }
    
    setConversionHistory(prev => [...prev.slice(-20), logEntry]);
  };

  // ✅ INICIALIZAR FORMULÁRIO COM DADOS DO LEAD (ENRIQUECIDO)
  const initializeFormWithLeadData = () => {
    if (!leadData) {
      debugLog('⚠️ Dados do lead não disponíveis para inicialização');
      return;
    }

    debugLog('🔄 Inicializando formulário enriquecido com dados do lead', leadData);

    setFormData(prev => ({
      ...prev,
      // Dados básicos do lead
      numeroFiscal: leadData.nif || '',
      
      // Localização
      residencia: {
        ...prev.residencia,
        rua: leadData.address?.rua || leadData.location || '',
        localidade: leadData.address?.localidade || '',
        codigoPostal: leadData.address?.codigoPostal || '',
        concelho: leadData.address?.concelho || '',
        distrito: leadData.address?.distrito || ''
      },
      
      // Tipo de imóvel
      tipoImovelProcurado: leadData.propertyType ? [leadData.propertyType] : [],
      
      // Orçamento
      orcamentoMinimo: leadData.budgetMin || leadData.budgetRange === 'ate_100k' ? '50000' : '',
      orcamentoMaximo: leadData.budgetMax || leadData.budget || '',
      
      // Prioridade e interesse
      prioridadeConversao: leadData.priority || 'normal',
      motivoTransacao: leadData.interestType || '',
      
      // Observações iniciais
      observacoesConsultor: `Lead convertido em ${new Date().toLocaleDateString('pt-PT')}
      
DADOS ORIGINAIS DO LEAD:
Nome: ${leadData.name || 'N/A'}
Telefone: ${leadData.phone || 'N/A'}
Email: ${leadData.email || 'N/A'}
Origem: ${leadData.source || 'Desconhecida'}
Interesse: ${leadData.interestType || 'Não especificado'}
Notas: ${leadData.notes || 'Nenhuma nota disponível'}
Prioridade: ${leadData.priority || 'Normal'}
Data criação: ${leadData.createdAt ? new Date(leadData.createdAt.seconds * 1000).toLocaleDateString('pt-PT') : 'N/A'}`,
      
      // Metadados
      origemLead: leadData.source || 'manual',
      canalAquisicao: leadData.source || '',
      consultorResponsavel: leadData.assignedTo || ''
    }));

    debugLog('✅ Formulário enriquecido inicializado com dados do lead');
  };

  // ✅ VALIDAÇÃO OPCIONAL DO FORMULÁRIO (APENAS FORMATOS)
  const validateFormCompleteness = () => {
    debugLog('🔍 Iniciando validação opcional do formulário (apenas formatos)');
    
    const errors = {};
    
    // VALIDAÇÕES OPCIONAIS - APENAS FORMATO DOS DADOS PESSOAIS
    if (formData.numeroCC?.trim() && !/^\d{8}\s?\d{1}\s?[A-Z]{2}\s?\d{1}$/.test(formData.numeroCC)) {
      errors.numeroCC = 'Formato CC inválido (ex: 12345678 1 ZZ 4)';
    }
    
    if (formData.numeroFiscal?.trim() && !/^\d{9}$/.test(formData.numeroFiscal.replace(/\s/g, ''))) {
      errors.numeroFiscal = 'NIF deve ter 9 dígitos';
    }
    
    // VALIDAÇÕES OPCIONAIS DE RESIDÊNCIA - APENAS FORMATO
    if (formData.residencia.codigoPostal?.trim() && !/^\d{4}-\d{3}$/.test(formData.residencia.codigoPostal)) {
      errors['residencia.codigoPostal'] = 'Formato CP inválido (ex: 1234-567)';
    }
    
    // VALIDAÇÕES OPCIONAIS DO CÔNJUGE - APENAS FORMATO SE PREENCHIDOS
    if (['casado', 'uniao_facto'].includes(formData.estadoCivil) && formData.temConjuge) {
      if (formData.conjuge.numeroCC?.trim() && !/^\d{8}\s?\d{1}\s?[A-Z]{2}\s?\d{1}$/.test(formData.conjuge.numeroCC)) {
        errors['conjuge.numeroCC'] = 'Formato CC cônjuge inválido';
      }
      
      if (formData.conjuge.numeroFiscal?.trim() && !/^\d{9}$/.test(formData.conjuge.numeroFiscal.replace(/\s/g, ''))) {
        errors['conjuge.numeroFiscal'] = 'NIF cônjuge deve ter 9 dígitos';
      }
    }
    
    setValidationErrors(errors);
    
    const isValid = Object.keys(errors).length === 0;
    setValidationPassed(isValid);
    
    debugLog(`🎯 Validação ${isValid ? 'APROVADA' : 'REJEITADA'}`, {
      errorsCount: Object.keys(errors).length,
      errors: errors,
      note: 'Todos os campos são opcionais - apenas formatos validados'
    });
    
    return isValid;
  };

  // ✅ GESTÃO DE APROVAÇÃO (MANTIDA)
  const handleApprovalToggle = () => {
    const validationPassed = validateFormCompleteness();
    const newApprovalState = !conversionApproved;
    
    setConversionApproved(newApprovalState);
    
    debugLog(`🔐 Aprovação ${newApprovalState ? 'CONCEDIDA' : 'REVOGADA'}`, {
      approved: newApprovalState,
      validationPassed,
      canProceed: newApprovalState && validationPassed
    });
  };

  // ✅ SUBMISSÃO CONTROLADA DA CONVERSÃO (MANTIDA + ENRIQUECIDA)
  const handleSubmitConversion = () => {
    debugLog('🚀 Tentativa de submissão da conversão enriquecida iniciada');

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

    debugLog('✅ Validação e aprovação OK - procedendo com conversão enriquecida', {
      leadId: leadData.id,
      formDataKeys: Object.keys(formData),
      createSpouse: formData.temConjuge && ['casado', 'uniao_facto'].includes(formData.estadoCivil),
      documentsCount: formData.anexos.length,
      availableDocsCount: formData.documentosDisponiveis.length
    });

    // Preparar dados de conversão enriquecidos
    const conversionData = {
      leadId: leadData.id,
      leadData: leadData,
      clientData: {
        ...formData,
        // Dados básicos do lead
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        source: leadData.source,
        originalLeadId: leadData.id,
        
        // Metadados de conversão
        conversionDate: new Date().toISOString(),
        approvedBy: 'manual_approval',
        validationPassed: true,
        conversionType: 'enhanced_qualification',
        
        // Estatísticas de qualificação
        qualificationScore: calculateQualificationScore(),
        completenessPercentage: calculateCompletenessPercentage(),
        
        // Dados enriquecidos específicos
        hasSpouse: formData.temConjuge && ['casado', 'uniao_facto'].includes(formData.estadoCivil),
        hasDocuments: formData.anexos.length > 0,
        hasPreApproval: formData.temPreAprovacao || formData.preAprovacaoCredito,
        propertyTypesCount: formData.tipoImovelProcurado.length,
        locationsCount: formData.localizacaoPreferida.length
      },
      createOpportunity: true,
      createSpouse: formData.temConjuge && ['casado', 'uniao_facto'].includes(formData.estadoCivil),
      conversionApproved: true,
      uploadedDocuments: formData.anexos,
      
      // Debug info enriquecido
      debugInfo: {
        modalVisible: isModalVisible,
        validationErrors: validationErrors,
        conversionHistory: conversionHistory,
        formCompleteness: calculateCompletenessPercentage(),
        qualificationLevel: getQualificationLevel()
      }
    };

    debugLog('📤 Enviando dados de conversão enriquecida para processamento', conversionData);
    
    // Chamar função de conversão
    onConvert(conversionData);
  };

  // ✅ ATUALIZAÇÃO DE CAMPOS DO FORMULÁRIO (ENRIQUECIDA)
  const updateFormField = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      // Suporte para campos aninhados
      if (path.includes('.')) {
        const [parent, child] = path.split('.');
        if (!newData[parent]) newData[parent] = {};
        newData[parent][child] = value;
      } else {
        newData[path] = value;
      }
      
      return newData;
    });
    
    // Limpar erro do campo quando alterado
    if (validationErrors[path]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[path];
        return newErrors;
      });
    }
  };

  // ✅ GESTÃO DE ARRAYS (NOVA)
  const toggleArrayValue = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  // ✅ SISTEMA DE UPLOAD DE DOCUMENTOS (NOVO)
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      // Validar tipo de ficheiro
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'image/gif'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        alert(`Tipo de ficheiro não suportado: ${file.name}`);
        return;
      }
      
      // Validar tamanho (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert(`Ficheiro muito grande: ${file.name} (máx 10MB)`);
        return;
      }
      
      // Simular upload com progresso
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
      
      // Simular progresso de upload
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          
          // Adicionar ficheiro aos anexos
          setFormData(prev => ({
            ...prev,
            anexos: [...prev.anexos, {
              id: fileId,
              name: file.name,
              size: file.size,
              type: file.type,
              uploadDate: new Date().toISOString(),
              url: URL.createObjectURL(file) // Simulação - em produção seria Firebase Storage
            }]
          }));
          
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        } else {
          setUploadProgress(prev => ({ ...prev, [fileId]: Math.round(progress) }));
        }
      }, 200);
    });
  };

  // ✅ REMOVER FICHEIRO (NOVO)
  const removeFile = (fileId) => {
    setFormData(prev => ({
      ...prev,
      anexos: prev.anexos.filter(file => file.id !== fileId)
    }));
  };

  // ✅ FUNÇÕES DE CÁLCULO (NOVAS)
  const calculateQualificationScore = () => {
    let score = 0;
    const maxScore = 100;
    
    // Dados pessoais (30 pontos)
    if (formData.numeroCC) score += 10;
    if (formData.numeroFiscal) score += 10;
    if (formData.profissao) score += 5;
    if (formData.dataNascimento) score += 5;
    
    // Residência (20 pontos)
    if (formData.residencia.rua) score += 5;
    if (formData.residencia.codigoPostal) score += 5;
    if (formData.residencia.localidade) score += 5;
    if (formData.residencia.concelho) score += 5;
    
    // Dados financeiros (25 pontos)
    if (formData.rendimentoMensal || formData.rendimentoAnual) score += 10;
    if (formData.situacaoEmpreg) score += 5;
    if (formData.temPreAprovacao) score += 10;
    
    // Dados do imóvel (15 pontos)
    if (formData.tipoImovelProcurado.length > 0) score += 5;
    if (formData.orcamentoMaximo) score += 10;
    
    // Documentação (10 pontos)
    if (formData.anexos.length > 0) score += 5;
    if (formData.documentosDisponiveis.length > 0) score += 5;
    
    return Math.round((score / maxScore) * 100);
  };

  const calculateCompletenessPercentage = () => {
    const totalFields = Object.keys(formData).length;
    const filledFields = Object.values(formData).filter(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v && v.toString().trim() !== '');
      }
      return value && value.toString().trim() !== '';
    }).length;
    
    return Math.round((filledFields / totalFields) * 100);
  };

  const getQualificationLevel = () => {
    const score = calculateQualificationScore();
    if (score >= 80) return 'excelente';
    if (score >= 60) return 'boa';
    if (score >= 40) return 'media';
    return 'basica';
  };

  if (!isOpen) return null;

  // ✅ DEFINIÇÃO DE TABS (ENRIQUECIDAS)
  const tabs = [
    { id: 'personal', label: 'Dados Pessoais', icon: UserIcon, count: 8 },
    { id: 'financial', label: 'Informações Financeiras', icon: CurrencyEuroIcon, count: 12 },
    { id: 'property', label: 'Detalhes do Imóvel', icon: HomeIcon, count: 10 },
    { id: 'timeline', label: 'Timeline & Orçamento', icon: ClockIcon, count: 8 },
    { id: 'documents', label: 'Documentação', icon: DocumentTextIcon, count: formData.anexos.length },
    { id: 'notes', label: 'Observações', icon: ChatBubbleLeftRightIcon, count: 6 }
  ];

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <ThemedContainer 
        glass={true}
        className="w-full max-w-6xl flex flex-col bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl shadow-2xl"
        style={{ height: '95vh' }}
      >
        
        {/* ✅ HEADER FIXO COM GLASSMORPHISM */}
        <ThemedCard 
          glass={true}
          className="px-6 py-4 border-b border-emerald-200/50 flex-shrink-0 bg-emerald-50/80 backdrop-blur-md rounded-t-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-semibold flex items-center text-gray-800">
                <UserPlusIcon className="h-6 w-6 mr-2 text-emerald-600" />
                Conversão Qualificada Enriquecida: Lead → Cliente
              </h2>
              
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-sm text-gray-600">
                  <strong>{leadData?.name}</strong> • {leadData?.phone} • {leadData?.email}
                </p>
                
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100/80 text-blue-700 border border-blue-200/50">
                    Score: {calculateQualificationScore()}%
                  </span>
                  
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100/80 text-green-700 border border-green-200/50">
                    Completude: {calculateCompletenessPercentage()}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Toggle Debug Mode */}
              <ThemedButton
                variant={debugMode ? "primary" : "ghost"}
                size="sm"
                onClick={() => setDebugMode(!debugMode)}
                icon={debugMode ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                glass={true}
              />
              
              {/* Botão Fechar */}
              <ThemedButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                icon={<XMarkIcon className="h-5 w-5" />}
                glass={true}
              />
            </div>
          </div>
          
          {/* ✅ DEBUG INFO (CONDICIONAL) */}
          {debugMode && (
            <ThemedCard 
              glass={true}
              className="mt-3 p-3 text-xs bg-slate-100/80 border-slate-200/50"
            >
              <div className="grid grid-cols-4 gap-4 text-slate-700">
                <div>
                  <strong>Estado:</strong> {isModalVisible ? '✅ Visível' : '❌ Oculto'}
                </div>
                <div>
                  <strong>Validação:</strong> {validationPassed ? '✅ OK' : '❌ Erro'}
                </div>
                <div>
                  <strong>Aprovação:</strong> {conversionApproved ? '✅ Aprovado' : '❌ Pendente'}
                </div>
                <div>
                  <strong>Erros:</strong> {Object.keys(validationErrors).length}
                </div>
              </div>
            </ThemedCard>
          )}
        </ThemedCard>

        {/* ✅ NAVEGAÇÃO POR TABS COM GLASSMORPHISM */}
        <ThemedCard 
          glass={true}
          className="px-6 py-3 border-b border-gray-200/50 flex-shrink-0 bg-white/50 backdrop-blur-sm"
        >
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <ThemedButton
                  key={tab.id}
                  variant={isActive ? "primary" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id)}
                  glass={true}
                  className={`transition-all duration-200 ${
                    isActive ? 'bg-emerald-100/90 text-emerald-700 border-emerald-200/70' : 'hover:bg-gray-100/70'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <TabIcon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                        isActive ? 'bg-emerald-200/80' : 'bg-gray-200/80'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </div>
                </ThemedButton>
              );
            })}
          </div>
        </ThemedCard>

        {/* ✅ CONTEÚDO DOS TABS */}
        <div className="flex-1 overflow-y-auto p-6 bg-white/30 backdrop-blur-sm">
          
          {/* TAB 1: DADOS PESSOAIS */}
          {activeTab === 'personal' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                {/* Número CC */}
                <ThemedInput
                  label="Número do Cartão de Cidadão"
                  value={formData.numeroCC}
                  onChange={(e) => updateFormField('numeroCC', e.target.value)}
                  placeholder="12345678 1 ZZ 4"
                  error={validationErrors.numeroCC}
                  glass={true}
                />

                {/* NIF */}
                <ThemedInput
                  label="Número de Identificação Fiscal (NIF)"
                  value={formData.numeroFiscal}
                  onChange={(e) => updateFormField('numeroFiscal', e.target.value)}
                  placeholder="123456789"
                  error={validationErrors.numeroFiscal}
                  glass={true}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Profissão */}
                <ThemedInput
                  label="Profissão"
                  value={formData.profissao}
                  onChange={(e) => updateFormField('profissao', e.target.value)}
                  placeholder="Ex: Engenheiro Informático"
                  glass={true}
                />

                {/* Data de Nascimento */}
                <ThemedInput
                  label="Data de Nascimento"
                  type="date"
                  value={formData.dataNascimento}
                  onChange={(e) => updateFormField('dataNascimento', e.target.value)}
                  glass={true}
                />
              </div>

              {/* Residência */}
              <ThemedCard glass={true} className="p-4 bg-slate-50/80 border-slate-200/50">
                <h3 className="text-lg font-medium mb-4 text-gray-800">
                  Residência
                </h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <ThemedInput
                      label="Rua"
                      value={formData.residencia.rua}
                      onChange={(e) => updateFormField('residencia.rua', e.target.value)}
                      placeholder="Ex: Rua das Flores"
                      error={validationErrors['residencia.rua']}
                      glass={true}
                    />
                  </div>
                  
                  <ThemedInput
                    label="Número"
                    value={formData.residencia.numero}
                    onChange={(e) => updateFormField('residencia.numero', e.target.value)}
                    placeholder="123"
                    glass={true}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <ThemedInput
                    label="Código Postal"
                    value={formData.residencia.codigoPostal}
                    onChange={(e) => updateFormField('residencia.codigoPostal', e.target.value)}
                    placeholder="1234-567"
                    error={validationErrors['residencia.codigoPostal']}
                    glass={true}
                  />
                  
                  <ThemedInput
                    label="Localidade"
                    value={formData.residencia.localidade}
                    onChange={(e) => updateFormField('residencia.localidade', e.target.value)}
                    placeholder="Lisboa"
                    error={validationErrors['residencia.localidade']}
                    glass={true}
                  />
                  
                  <ThemedInput
                    label="Concelho"
                    value={formData.residencia.concelho}
                    onChange={(e) => updateFormField('residencia.concelho', e.target.value)}
                    placeholder="Lisboa"
                    glass={true}
                  />
                </div>
              </ThemedCard>

              {/* Estado Civil */}
              <div className="grid grid-cols-2 gap-6">
                <ThemedSelect
                  label="Estado Civil"
                  value={formData.estadoCivil}
                  onChange={(e) => updateFormField('estadoCivil', e.target.value)}
                  glass={true}
                >
                  <option value="solteiro">Solteiro(a)</option>
                  <option value="casado">Casado(a)</option>
                  <option value="divorciado">Divorciado(a)</option>
                  <option value="viuvo">Viúvo(a)</option>
                  <option value="uniao_facto">União de Facto</option>
                </ThemedSelect>

                {['casado'].includes(formData.estadoCivil) && (
                  <ThemedSelect
                    label="Regime de Bens"
                    value={formData.comunhaoBens}
                    onChange={(e) => updateFormField('comunhaoBens', e.target.value)}
                    error={validationErrors.comunhaoBens}
                    glass={true}
                  >
                    <option value="">Selecionar...</option>
                    <option value="geral">Comunhão Geral</option>
                    <option value="adquiridos">Comunhão de Adquiridos</option>
                    <option value="separacao">Separação de Bens</option>
                  </ThemedSelect>
                )}
              </div>

              {/* Cônjuge */}
              {['casado', 'uniao_facto'].includes(formData.estadoCivil) && (
                <ThemedCard glass={true} className="p-4 bg-pink-50/80 border-pink-200/50">
                  <div className="flex items-center space-x-3 mb-4">
                    <input
                      type="checkbox"
                      id="temConjuge"
                      checked={formData.temConjuge}
                      onChange={(e) => updateFormField('temConjuge', e.target.checked)}
                      className="h-4 w-4 text-pink-600 rounded focus:ring-pink-500"
                    />
                    <label htmlFor="temConjuge" className="text-sm font-medium flex items-center text-gray-700">
                      <HeartIcon className="h-4 w-4 mr-2 text-pink-500" />
                      Adicionar cônjuge como cliente
                    </label>
                  </div>

                  {formData.temConjuge && (
                    <div>
                      <h4 className="text-md font-medium mb-3 flex items-center text-pink-800">
                        <UserPlusIcon className="h-4 w-4 mr-2" />
                        Dados do Cônjuge
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <ThemedInput
                          label="Nome Completo"
                          value={formData.conjuge.nome}
                          onChange={(e) => updateFormField('conjuge.nome', e.target.value)}
                          placeholder="Nome do cônjuge"
                          error={validationErrors['conjuge.nome']}
                          glass={true}
                        />
                        
                        <ThemedInput
                          label="Email"
                          type="email"
                          value={formData.conjuge.email}
                          onChange={(e) => updateFormField('conjuge.email', e.target.value)}
                          placeholder="email@exemplo.com"
                          glass={true}
                        />
                        
                        <ThemedInput
                          label="Cartão de Cidadão"
                          value={formData.conjuge.numeroCC}
                          onChange={(e) => updateFormField('conjuge.numeroCC', e.target.value)}
                          placeholder="12345678 1 ZZ 4"
                          error={validationErrors['conjuge.numeroCC']}
                          glass={true}
                        />
                        
                        <ThemedInput
                          label="NIF"
                          value={formData.conjuge.numeroFiscal}
                          onChange={(e) => updateFormField('conjuge.numeroFiscal', e.target.value)}
                          placeholder="123456789"
                          error={validationErrors['conjuge.numeroFiscal']}
                          glass={true}
                        />
                      </div>
                    </div>
                  )}
                </ThemedCard>
              )}
            </div>
          )}

          {/* TAB 2: INFORMAÇÕES FINANCEIRAS */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                {/* Rendimento Mensal */}
                <ThemedInput
                  label="Rendimento Mensal Líquido"
                  type="number"
                  value={formData.rendimentoMensal}
                  onChange={(e) => updateFormField('rendimentoMensal', e.target.value)}
                  placeholder="1500"
                  error={validationErrors.rendimentoMensal}
                  glass={true}
                />

                {/* Rendimento Anual */}
                <ThemedInput
                  label="Rendimento Anual Bruto"
                  type="number"
                  value={formData.rendimentoAnual}
                  onChange={(e) => updateFormField('rendimentoAnual', e.target.value)}
                  placeholder="25000"
                  glass={true}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Situação de Emprego */}
                <ThemedSelect
                  label="Situação de Emprego"
                  value={formData.situacaoEmpreg}
                  onChange={(e) => updateFormField('situacaoEmpreg', e.target.value)}
                  glass={true}
                >
                  <option value="">Selecionar...</option>
                  <option value="empregado_conta_outrem">Empregado por Conta de Outrem</option>
                  <option value="trabalhador_independente">Trabalhador Independente</option>
                  <option value="empresario">Empresário</option>
                  <option value="funcionario_publico">Funcionário Público</option>
                  <option value="reformado">Reformado</option>
                  <option value="desempregado">Desempregado</option>
                  <option value="estudante">Estudante</option>
                </ThemedSelect>

                {/* Empresa */}
                <ThemedInput
                  label="Empresa onde Trabalha"
                  value={formData.empresaTrabalho}
                  onChange={(e) => updateFormField('empresaTrabalho', e.target.value)}
                  placeholder="Nome da empresa"
                  glass={true}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Situação de Crédito */}
                <ThemedSelect
                  label="Situação de Crédito"
                  value={formData.situacaoCredito}
                  onChange={(e) => updateFormField('situacaoCredito', e.target.value)}
                  glass={true}
                >
                  <option value="sem_restricoes">Sem Restrições</option>
                  <option value="restricoes_menores">Restrições Menores</option>
                  <option value="restricoes_graves">Restrições Graves</option>
                  <option value="incumprimento">Em Incumprimento</option>
                </ThemedSelect>

                {/* Banco Preferencial */}
                <ThemedSelect
                  label="Banco Preferencial"
                  value={formData.bancoPreferencial}
                  onChange={(e) => updateFormField('bancoPreferencial', e.target.value)}
                  glass={true}
                >
                  <option value="">Selecionar...</option>
                  <option value="caixa_geral_depositos">Caixa Geral de Depósitos</option>
                  <option value="millennium_bcp">Millennium BCP</option>
                  <option value="santander">Santander Totta</option>
                  <option value="novo_banco">Novo Banco</option>
                  <option value="bbva">BBVA</option>
                  <option value="abanca">Abanca</option>
                  <option value="credito_agricola">Crédito Agrícola</option>
                  <option value="outros">Outros</option>
                </ThemedSelect>
              </div>

              {/* Pré-aprovação */}
              <ThemedCard glass={true} className="p-4 bg-green-50/80 border-green-200/50">
                <div className="flex items-center space-x-3 mb-4">
                  <input
                    type="checkbox"
                    id="temPreAprovacao"
                    checked={formData.temPreAprovacao}
                    onChange={(e) => updateFormField('temPreAprovacao', e.target.checked)}
                    className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <label htmlFor="temPreAprovacao" className="text-sm font-medium flex items-center text-gray-700">
                    <CheckCircleIcon className="h-4 w-4 mr-2 text-green-500" />
                    Tem pré-aprovação de crédito
                  </label>
                </div>

                {formData.temPreAprovacao && (
                  <div className="grid grid-cols-2 gap-4">
                    <ThemedInput
                      label="Valor Pré-aprovado"
                      type="number"
                      value={formData.valorPreAprovacao}
                      onChange={(e) => updateFormField('valorPreAprovacao', e.target.value)}
                      placeholder="200000"
                      glass={true}
                    />
                    
                    <ThemedInput
                      label="Banco da Pré-aprovação"
                      value={formData.bancoRelacionamento}
                      onChange={(e) => updateFormField('bancoRelacionamento', e.target.value)}
                      placeholder="Nome do banco"
                      glass={true}
                    />
                  </div>
                )}
              </ThemedCard>
            </div>
          )}

          {/* TAB 3: DETALHES DO IMÓVEL */}
          {activeTab === 'property' && (
            <div className="space-y-6">
              
              {/* Tipo de Imóvel */}
              <ThemedCard glass={true} className="p-4 bg-blue-50/80 border-blue-200/50">
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Tipo de Imóvel Procurado
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'apartamento', label: 'Apartamento' },
                    { value: 'moradia', label: 'Moradia' },
                    { value: 'terreno', label: 'Terreno' },
                    { value: 'comercial', label: 'Comercial' },
                    { value: 'armazem', label: 'Armazém' },
                    { value: 'escritorio', label: 'Escritório' }
                  ].map((tipo) => (
                    <label key={tipo.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.tipoImovelProcurado.includes(tipo.value)}
                        onChange={() => toggleArrayValue('tipoImovelProcurado', tipo.value)}
                        className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">
                        {tipo.label}
                      </span>
                    </label>
                  ))}
                </div>
                {validationErrors.tipoImovelProcurado && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.tipoImovelProcurado}</p>
                )}
              </ThemedCard>

              {/* Localização Preferida */}
              <ThemedCard glass={true} className="p-4 bg-indigo-50/80 border-indigo-200/50">
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Localização Preferida
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'lisboa', label: 'Lisboa' },
                    { value: 'porto', label: 'Porto' },
                    { value: 'cascais', label: 'Cascais' },
                    { value: 'sintra', label: 'Sintra' },
                    { value: 'oeiras', label: 'Oeiras' },
                    { value: 'almada', label: 'Almada' },
                    { value: 'setúbal', label: 'Setúbal' },
                    { value: 'outros', label: 'Outros' }
                  ].map((local) => (
                    <label key={local.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.localizacaoPreferida.includes(local.value)}
                        onChange={() => toggleArrayValue('localizacaoPreferida', local.value)}
                        className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">
                        {local.label}
                      </span>
                    </label>
                  ))}
                </div>
              </ThemedCard>

              {/* Características Essenciais */}
              <ThemedCard glass={true} className="p-4 bg-red-50/80 border-red-200/50">
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Características Essenciais
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'elevador', label: 'Elevador' },
                    { value: 'garagem', label: 'Garagem' },
                    { value: 'jardim', label: 'Jardim' },
                    { value: 'terraço', label: 'Terraço' },
                    { value: 'piscina', label: 'Piscina' },
                    { value: 'ar_condicionado', label: 'Ar Condicionado' },
                    { value: 'aquecimento_central', label: 'Aquecimento Central' },
                    { value: 'lareira', label: 'Lareira' }
                  ].map((caract) => (
                    <label key={caract.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.caracteristicasEssenciais.includes(caract.value)}
                        onChange={() => toggleArrayValue('caracteristicasEssenciais', caract.value)}
                        className="h-4 w-4 text-red-600 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">
                        {caract.label}
                      </span>
                    </label>
                  ))}
                </div>
              </ThemedCard>

              {/* Características Desejadas */}
              <ThemedCard glass={true} className="p-4 bg-green-50/80 border-green-200/50">
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Características Desejadas (Opcionais)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'vista_mar', label: 'Vista Mar' },
                    { value: 'condominio_fechado', label: 'Condomínio Fechado' },
                    { value: 'mobilado', label: 'Mobilado' },
                    { value: 'remodelado', label: 'Remodelado' },
                    { value: 'varanda', label: 'Varanda' },
                    { value: 'suite', label: 'Suíte' },
                    { value: 'cozinha_equipada', label: 'Cozinha Equipada' },
                    { value: 'sotao', label: 'Sótão' }
                  ].map((caract) => (
                    <label key={caract.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.caracteristicasDesejadas.includes(caract.value)}
                        onChange={() => toggleArrayValue('caracteristicasDesejadas', caract.value)}
                        className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">
                        {caract.label}
                      </span>
                    </label>
                  ))}
                </div>
              </ThemedCard>

              {/* Motivo da Transação */}
              <div className="grid grid-cols-2 gap-6">
                <ThemedSelect
                  label="Motivo da Transação"
                  value={formData.motivoTransacao}
                  onChange={(e) => updateFormField('motivoTransacao', e.target.value)}
                  glass={true}
                >
                  <option value="">Selecionar...</option>
                  <option value="primeira_habitacao">Primeira Habitação</option>
                  <option value="mudança_residencia">Mudança de Residência</option>
                  <option value="investimento">Investimento</option>
                  <option value="segunda_habitacao">Segunda Habitação</option>
                  <option value="ferias">Casa de Férias</option>
                  <option value="arrendamento">Para Arrendar</option>
                  <option value="comercial">Fins Comerciais</option>
                </ThemedSelect>

                <ThemedSelect
                  label="Contacto Preferido"
                  value={formData.contactoPreferido}
                  onChange={(e) => updateFormField('contactoPreferido', e.target.value)}
                  glass={true}
                >
                  <option value="telefone">Telefone</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                </ThemedSelect>
              </div>

              {/* Características Específicas */}
              <ThemedTextarea
                label="Características Específicas ou Observações"
                value={formData.caracteristicasEspecificas}
                onChange={(e) => updateFormField('caracteristicasEspecificas', e.target.value)}
                rows={4}
                placeholder="Descreva características específicas que procura no imóvel..."
                glass={true}
              />
            </div>
          )}

          {/* TAB 4: TIMELINE & ORÇAMENTO */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              
              {/* Prazo de Decisão */}
              <div className="grid grid-cols-2 gap-6">
                <ThemedSelect
                  label="Prazo para Decisão"
                  value={formData.prazoDecisao}
                  onChange={(e) => updateFormField('prazoDecisao', e.target.value)}
                  glass={true}
                >
                  <option value="imediato">Imediato (até 1 mês)</option>
                  <option value="1_3_meses">1 a 3 meses</option>
                  <option value="3_6_meses">3 a 6 meses</option>
                  <option value="6_12_meses">6 meses a 1 ano</option>
                  <option value="mais_1_ano">Mais de 1 ano</option>
                  <option value="indefinido">Indefinido</option>
                </ThemedSelect>

                <ThemedSelect
                  label="Melhor Horário para Contacto"
                  value={formData.melhorHorario}
                  onChange={(e) => updateFormField('melhorHorario', e.target.value)}
                  glass={true}
                >
                  <option value="manha">Manhã (9h-12h)</option>
                  <option value="tarde">Tarde (14h-18h)</option>
                  <option value="noite">Noite (18h-21h)</option>
                  <option value="qualquer_hora">Qualquer Horário</option>
                  <option value="fins_semana">Apenas Fins de Semana</option>
                </ThemedSelect>
              </div>

              {/* Orçamento */}
              <ThemedCard glass={true} className="p-4 bg-emerald-50/80 border-emerald-200/50">
                <h3 className="text-lg font-medium mb-4 text-gray-800">
                  Orçamento e Financiamento
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <ThemedInput
                    label="Orçamento Mínimo"
                    type="number"
                    value={formData.orcamentoMinimo}
                    onChange={(e) => updateFormField('orcamentoMinimo', e.target.value)}
                    placeholder="100000"
                    glass={true}
                  />
                  
                  <ThemedInput
                    label="Orçamento Máximo"
                    type="number"
                    value={formData.orcamentoMaximo}
                    onChange={(e) => updateFormField('orcamentoMaximo', e.target.value)}
                    placeholder="300000"
                    error={validationErrors.orcamentoMaximo}
                    glass={true}
                  />
                </div>

                <div className="grid grid-cols-3 gap-6 mt-4">
                  <ThemedSelect
                    label="Tipo de Financiamento"
                    value={formData.tipoFinanciamento}
                    onChange={(e) => updateFormField('tipoFinanciamento', e.target.value)}
                    glass={true}
                  >
                    <option value="credito_habitacao">Crédito Habitação</option>
                    <option value="credito_pessoal">Crédito Pessoal</option>
                    <option value="leasing">Leasing</option>
                    <option value="a_pronto">Pagamento a Pronto</option>
                    <option value="misto">Financiamento Misto</option>
                  </ThemedSelect>
                  
                  <ThemedInput
                    label="Valor de Entrada"
                    type="number"
                    value={formData.entrada}
                    onChange={(e) => updateFormField('entrada', e.target.value)}
                    placeholder="60000"
                    glass={true}
                  />
                  
                  <ThemedInput
                    label="Percentagem Entrada (%)"
                    type="number"
                    value={formData.percentagemEntrada}
                    onChange={(e) => updateFormField('percentagemEntrada', e.target.value)}
                    placeholder="20"
                    min="0"
                    max="100"
                    glass={true}
                  />
                </div>
              </ThemedCard>

              {/* Disponibilidade para Visitas */}
              <ThemedCard glass={true} className="p-4 bg-purple-50/80 border-purple-200/50">
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Disponibilidade para Visitas
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'segunda_feira', label: 'Segunda-feira' },
                    { value: 'terca_feira', label: 'Terça-feira' },
                    { value: 'quarta_feira', label: 'Quarta-feira' },
                    { value: 'quinta_feira', label: 'Quinta-feira' },
                    { value: 'sexta_feira', label: 'Sexta-feira' },
                    { value: 'sabado', label: 'Sábado' },
                    { value: 'domingo', label: 'Domingo' },
                    { value: 'qualquer_dia', label: 'Qualquer Dia' }
                  ].map((dia) => (
                    <label key={dia.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.disponibilidadeVisitas.includes(dia.value)}
                        onChange={() => toggleArrayValue('disponibilidadeVisitas', dia.value)}
                        className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">
                        {dia.label}
                      </span>
                    </label>
                  ))}
                </div>
              </ThemedCard>
            </div>
          )}

          {/* TAB 5: DOCUMENTAÇÃO */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              
              {/* Upload de Documentos */}
              <ThemedCard glass={true} className="p-4 bg-sky-50/80 border-sky-200/50">
                <h3 className="text-lg font-medium mb-4 text-gray-800">
                  Upload de Documentos
                </h3>
                
                <div className="border-2 border-dashed border-sky-300/50 rounded-lg p-8 text-center bg-sky-100/30 backdrop-blur-sm">
                  <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-sky-400" />
                  
                  <div className="mt-4">
                    <ThemedButton
                      variant="primary"
                      onClick={() => fileInputRef.current?.click()}
                      icon={<PaperClipIcon className="h-4 w-4" />}
                      glass={true}
                    >
                      Selecionar Ficheiros
                    </ThemedButton>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-600">
                    ou arraste ficheiros para aqui
                  </p>
                  
                  <p className="text-xs mt-1 text-gray-500">
                    PDF, Word, Imagens (máx. 10MB por ficheiro)
                  </p>
                </div>
              </ThemedCard>

              {/* Progresso de Upload */}
              {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(uploadProgress).map(([fileId, progress]) => (
                    <ThemedCard key={fileId} glass={true} className="p-3 bg-gray-100/80 border-gray-200/50">
                      <div className="flex justify-between text-sm mb-1">
                        <span>A fazer upload...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </ThemedCard>
                  ))}
                </div>
              )}

              {/* Lista de Ficheiros Anexados */}
              {formData.anexos.length > 0 && (
                <ThemedCard glass={true} className="p-4 bg-green-50/80 border-green-200/50">
                  <h4 className="text-md font-medium mb-3 text-gray-800">
                    Ficheiros Anexados ({formData.anexos.length})
                  </h4>
                  
                  <div className="space-y-2">
                    {formData.anexos.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-200/70 bg-white/60 backdrop-blur-sm">
                        <div className="flex items-center space-x-3">
                          <DocumentTextIcon className="h-5 w-5 text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        
                        <ThemedButton
                          variant="danger"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          icon={<TrashIcon className="h-4 w-4" />}
                          glass={true}
                        />
                      </div>
                    ))}
                  </div>
                </ThemedCard>
              )}

              {/* Documentos Disponíveis */}
              <ThemedCard glass={true} className="p-4 bg-amber-50/80 border-amber-200/50">
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Documentos Disponíveis (marcar os que tem)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'cc_frente_verso', label: 'CC (Frente e Verso)' },
                    { value: 'irs_ultimo_ano', label: 'IRS Último Ano' },
                    { value: 'recibos_vencimento_3meses', label: 'Recibos Vencimento (3 meses)' },
                    { value: 'declaracao_banco', label: 'Declaração do Banco' },
                    { value: 'mapa_responsabilidades_credito', label: 'Mapa Responsabilidades Crédito' },
                    { value: 'contrato_trabalho', label: 'Contrato de Trabalho' },
                    { value: 'caderneta_predial', label: 'Caderneta Predial (se tem imóvel)' },
                    { value: 'certidao_registo_civil', label: 'Certidão Registo Civil' },
                    { value: 'escritura_imovel', label: 'Escritura de Imóvel Atual' },
                    { value: 'seguro_vida', label: 'Seguro de Vida' }
                  ].map((doc) => (
                    <label key={doc.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.documentosDisponiveis.includes(doc.value)}
                        onChange={() => toggleArrayValue('documentosDisponiveis', doc.value)}
                        className="h-4 w-4 text-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-sm text-gray-700">
                        {doc.label}
                      </span>
                    </label>
                  ))}
                </div>
              </ThemedCard>

              {/* Observações sobre Documentação */}
              <ThemedTextarea
                label="Observações sobre Documentação"
                value={formData.observacoesDocumentacao}
                onChange={(e) => updateFormField('observacoesDocumentacao', e.target.value)}
                rows={3}
                placeholder="Notas sobre documentos em falta, prazo de entrega, etc..."
                glass={true}
              />
            </div>
          )}

          {/* TAB 6: OBSERVAÇÕES */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              
              {/* Observações do Consultor */}
              <ThemedTextarea
                label="Observações do Consultor"
                value={formData.observacoesConsultor}
                onChange={(e) => updateFormField('observacoesConsultor', e.target.value)}
                rows={6}
                placeholder="Notas detalhadas sobre o cliente, conversão, expectativas..."
                glass={true}
              />

              <div className="grid grid-cols-2 gap-6">
                {/* Prioridade do Cliente */}
                <ThemedSelect
                  label="Prioridade do Cliente"
                  value={formData.prioridadeCliente}
                  onChange={(e) => updateFormField('prioridadeCliente', e.target.value)}
                  glass={true}
                >
                  <option value="baixa">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="alta">Alta</option>
                  <option value="urgente">Urgente</option>
                  <option value="vip">VIP</option>
                </ThemedSelect>

                {/* Fonte de Procura */}
                <ThemedSelect
                  label="Como Soube de Nós"
                  value={formData.fonteProcura}
                  onChange={(e) => updateFormField('fonteProcura', e.target.value)}
                  glass={true}
                >
                  <option value="">Selecionar...</option>
                  <option value="google">Google / Pesquisa Online</option>
                  <option value="facebook">Facebook</option>
                  <option value="instagram">Instagram</option>
                  <option value="referencia">Referência de Cliente</option>
                  <option value="placa_venda">Placa de Venda</option>
                  <option value="jornal">Jornal / Anúncio</option>
                  <option value="portal_imoveis">Portal de Imóveis</option>
                  <option value="contacto_direto">Contacto Direto</option>
                  <option value="outros">Outros</option>
                </ThemedSelect>
              </div>

              {/* Próximos Passos */}
              <ThemedCard glass={true} className="p-4 bg-violet-50/80 border-violet-200/50">
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Próximos Passos Planeados
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'agendar_reuniao', label: 'Agendar Reunião Presencial' },
                    { value: 'enviar_propostas', label: 'Enviar Propostas de Imóveis' },
                    { value: 'agendar_visitas', label: 'Agendar Visitas' },
                    { value: 'analise_credito', label: 'Análise de Crédito' },
                    { value: 'contactar_banco', label: 'Contactar Banco' },
                    { value: 'preparar_documentos', label: 'Preparar Documentação' },
                    { value: 'follow_up_1semana', label: 'Follow-up em 1 Semana' },
                    { value: 'apresentar_oportunidades', label: 'Apresentar Oportunidades' }
                  ].map((passo) => (
                    <label key={passo.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.proximosPassos.includes(passo.value)}
                        onChange={() => toggleArrayValue('proximosPassos', passo.value)}
                        className="h-4 w-4 text-violet-600 rounded focus:ring-violet-500"
                      />
                      <span className="text-sm text-gray-700">
                        {passo.label}
                      </span>
                    </label>
                  ))}
                </div>
              </ThemedCard>

              {/* Notas Especiais */}
              <ThemedTextarea
                label="Notas Especiais / Alertas"
                value={formData.notasEspeciais}
                onChange={(e) => updateFormField('notasEspeciais', e.target.value)}
                rows={3}
                placeholder="Alertas importantes, restrições, informações confidenciais..."
                glass={true}
              />

              {/* Resumo da Conversão */}
              <ThemedCard glass={true} className="p-4 bg-blue-50/80 border-blue-200/50">
                <h4 className="text-lg font-medium mb-3 flex items-center text-blue-800">
                  <InformationCircleIcon className="h-5 w-5 mr-2" />
                  Resumo da Conversão
                </h4>
                <div className="text-sm space-y-2 text-blue-700">
                  <p>• <strong>Lead original:</strong> {leadData?.name} ({leadData?.phone})</p>
                  <p>• <strong>Score de qualificação:</strong> {calculateQualificationScore()}%</p>
                  <p>• <strong>Completude de dados:</strong> {calculateCompletenessPercentage()}%</p>
                  <p>• <strong>Nível de qualificação:</strong> {getQualificationLevel()}</p>
                  {formData.temConjuge && (
                    <p>• <strong>Cônjuge:</strong> Será criado como cliente secundário</p>
                  )}
                  <p>• <strong>Documentos anexados:</strong> {formData.anexos.length} ficheiros</p>
                  <p>• <strong>Documentos disponíveis:</strong> {formData.documentosDisponiveis.length} tipos</p>
                  <p>• <strong>Orçamento:</strong> €{formData.orcamentoMinimo || 'N/A'} - €{formData.orcamentoMaximo || 'N/A'}</p>
                  <p>• <strong>Próximos passos:</strong> {formData.proximosPassos.length} acções planeadas</p>
                </div>
              </ThemedCard>
            </div>
          )}
        </div>

        {/* ✅ FOOTER COM CONTROLOS GLASSMORPHISM */}
        <ThemedCard 
          glass={true}
          className="px-6 py-4 border-t border-gray-200/50 flex items-center justify-between flex-shrink-0 bg-gray-50/80 backdrop-blur-md rounded-b-2xl"
        >
          
          <div className="flex items-center space-x-4">
            {/* Validação e Aprovação */}
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg backdrop-blur-sm border ${
              validationPassed 
                ? 'bg-green-100/80 text-green-700 border-green-200/70'
                : 'bg-red-100/80 text-red-700 border-red-200/70'
            }`}>
              {validationPassed ? (
                <CheckCircleIcon className="h-4 w-4" />
              ) : (
                <ExclamationTriangleIcon className="h-4 w-4" />
              )}
              <span className="text-xs font-medium">
                {validationPassed ? 'Validação OK' : `${Object.keys(validationErrors).length} erros`}
              </span>
            </div>

            <ThemedButton
              variant={conversionApproved ? "success" : "outline"}
              size="sm"
              onClick={handleApprovalToggle}
              icon={conversionApproved ? <CheckCircleIcon className="h-4 w-4" /> : <ExclamationTriangleIcon className="h-4 w-4" />}
              glass={true}
            >
              {conversionApproved ? 'Aprovado' : 'Aprovar Conversão'}
            </ThemedButton>
          </div>

          <div className="flex space-x-3">
            {/* Navegação entre tabs */}
            {activeTab !== 'personal' && (
              <ThemedButton
                variant="ghost"
                size="sm"
                onClick={() => {
                  const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                  if (currentIndex > 0) {
                    setActiveTab(tabs[currentIndex - 1].id);
                  }
                }}
                glass={true}
              >
                ← Anterior
              </ThemedButton>
            )}
            
            {activeTab !== 'notes' ? (
              <ThemedButton
                variant="primary"
                size="sm"
                onClick={() => {
                  const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1].id);
                  }
                }}
                glass={true}
              >
                Seguinte →
              </ThemedButton>
            ) : (
              <ThemedButton
                variant="success"
                size="md"
                onClick={handleSubmitConversion}
                disabled={isConverting || !conversionApproved || !validationPassed}
                loading={isConverting}
                icon={<UserPlusIcon className="h-4 w-4" />}
                glass={true}
              >
                {isConverting ? 'Convertendo...' : 'Converter para Cliente'}
              </ThemedButton>
            )}
            
            <ThemedButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              glass={true}
            >
              Cancelar
            </ThemedButton>
          </div>
        </ThemedCard>
      </ThemedContainer>
    </div>
  );
};

export default LeadConversionEnhanced;