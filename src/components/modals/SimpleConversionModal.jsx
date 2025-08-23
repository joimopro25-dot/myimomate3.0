// src/components/modals/SimpleConversionModal.jsx
// VERSÃO FOLHA ÚNICA COM SCROLL - COMPLETA E FUNCIONAL
// ===================================================

import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  UserIcon, 
  CurrencyEuroIcon, 
  HomeIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  UserPlusIcon,
  MapPinIcon,
  IdentificationIcon,
  BanknotesIcon,
  PaperClipIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../../contexts/ThemeContext';

const SimpleConversionModal = ({ 
  isOpen, 
  onClose, 
  leadData, 
  onConvert, 
  isConverting = false
}) => {
  const { isDark } = useTheme();

  // Estados do formulário expandido
  const [formData, setFormData] = useState({
    // Dados básicos (pré-preenchidos)
    nome: '',
    email: '',
    telefone: '',
    
    // Informações pessoais
    numeroCC: '',
    numeroFiscal: '',
    profissao: '',
    dataNascimento: '',
    estadoCivil: 'solteiro',
    comunhaoBens: '',
    
    // Residência
    residenciaRua: '',
    residenciaNumero: '',
    residenciaAndar: '',
    residenciaCP: '',
    residenciaLocalidade: '',
    residenciaConcelho: '',
    
    // Naturalidade
    naturalidadeFreguesia: '',
    naturalidadeConcelho: '',
    
    // Cônjuge
    temConjuge: false,
    conjugeNome: '',
    conjugeCC: '',
    conjugeNIF: '',
    conjugeEmail: '',
    conjugeTelefone: '',
    conjugeProfissao: '',
    conjugeDataNascimento: '',
    
    // Financeiro
    rendimentoMensal: '',
    rendimentoAnual: '',
    situacaoCredito: 'sem_restricoes',
    preAprovacaoCredito: false,
    valorPreAprovado: '',
    bancoPreferencial: '',
    
    // Imóvel
    tipoImovel: '',
    orcamentoMinimo: '',
    orcamentoMaximo: '',
    caracteristicasEssenciais: [],
    
    // Timeline
    prazoDecisao: 'curto',
    motivoCompra: 'primeira_habitacao',
    
    // Documentação
    documentosDisponiveis: [],
    
    // Observações
    observacoesConsultor: '',
    proximosPassos: []
  });

  const [errors, setErrors] = useState({});
  const [approved, setApproved] = useState(false);

  // Inicialização com dados do lead
  useEffect(() => {
    if (leadData && isOpen) {
      setFormData(prev => ({
        ...prev,
        nome: leadData.name || '',
        email: leadData.email || '',
        telefone: leadData.phone || '',
        orcamentoMaximo: leadData.budget || '',
        observacoesConsultor: `Lead convertido: ${leadData.name || 'N/A'}
Origem: ${leadData.source || 'Desconhecida'}
Data de conversão: ${new Date().toLocaleDateString('pt-PT')}
Email: ${leadData.email || 'N/A'}
Telefone: ${leadData.phone || 'N/A'}
${leadData.notes ? `Notas do lead: ${leadData.notes}` : ''}`,
        proximosPassos: leadData.interestType === 'compra' 
          ? ['contacto_24h', 'agendamento_visita']
          : ['contacto_24h', 'avaliacao_imovel']
      }));
    }
  }, [leadData, isOpen]);

  // Constantes
  const TIPOS_IMOVEL = ['apartamento', 'moradia', 'terreno', 'comercial', 'garagem'];
  const ESTADOS_CIVIL = ['solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_facto'];
  const SITUACOES_CREDITO = ['sem_restricoes', 'restricoes_menores', 'restricoes_graves'];
  const MOTIVOS_COMPRA = ['primeira_habitacao', 'mudanca_residencia', 'investimento', 'segunda_habitacao'];
  const DOCUMENTOS_LISTA = ['cartao_cidadao', 'nif', 'iban', 'declaracao_irs', 'recibos_vencimento', 'pre_aprovacao_credito'];
  const CARACTERISTICAS_IMOVEL = ['elevador', 'garagem', 'jardim', 'piscina', 'terraço', 'ar_condicionado'];

  // Funções auxiliares
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleArrayValue = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nome?.trim()) newErrors.nome = 'Nome obrigatório';
    if (!formData.telefone?.trim()) newErrors.telefone = 'Telefone obrigatório';
    
    if (formData.temConjuge && !formData.conjugeNome?.trim()) {
      newErrors.conjugeNome = 'Nome do cônjuge obrigatório';
    }
    
    if (formData.numeroCC && !/^\d{8}\s?\d{1}\s?[A-Z]{2}\s?\d{1}$/.test(formData.numeroCC)) {
      newErrors.numeroCC = 'Formato inválido (ex: 12345678 1 ZZ 4)';
    }
    
    if (formData.numeroFiscal && !/^\d{9}$/.test(formData.numeroFiscal)) {
      newErrors.numeroFiscal = 'NIF deve ter 9 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      alert('Por favor, corrija os erros no formulário');
      return;
    }

    if (!approved) {
      alert('É necessário aprovar a conversão para continuar');
      return;
    }

    const conversionData = {
      leadId: leadData.id,
      leadData: leadData,
      clientData: {
        ...formData,
        name: formData.nome,
        email: formData.email,
        phone: formData.telefone,
        source: leadData.source,
        originalLeadId: leadData.id,
        conversionDate: new Date().toISOString(),
        validationPassed: true,
        approvedBy: 'manual_approval'
      },
      createOpportunity: true,
      createSpouse: formData.temConjuge,
      conversionApproved: true
    };

    onConvert(conversionData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-6xl h-[95vh] overflow-hidden ${isDark() ? 'bg-gray-800' : 'bg-white'}`}>
        
        {/* Header Fixo */}
        <div className={`px-6 py-4 border-b ${isDark() ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-semibold flex items-center ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                <UserPlusIcon className="h-6 w-6 mr-2 text-blue-500" />
                Conversão Qualificada: Lead → Cliente
              </h2>
              <div className="flex items-center space-x-4 mt-1">
                <p className={`text-sm ${isDark() ? 'text-gray-300' : 'text-gray-600'}`}>
                  <strong>{leadData?.name}</strong> • {leadData?.phone}
                </p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isDark() ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                }`}>
                  {leadData?.source || 'Manual'}
                </span>
              </div>
            </div>
            
            <button onClick={onClose} className={`p-2 rounded-md ${isDark() ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Conteúdo Scrollável */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* SEÇÃO 1: DADOS PESSOAIS */}
            <div className="space-y-6">
              <h3 className={`text-lg font-medium flex items-center ${isDark() ? 'text-gray-200' : 'text-gray-900'} border-b pb-2`}>
                <IdentificationIcon className="h-5 w-5 mr-2" />
                Dados Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nome */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => updateField('nome', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.nome ? 'border-red-500' : isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    } ${formData.nome && !errors.nome ? 'bg-green-50 border-green-300' : ''}`}
                  />
                  {errors.nome && <p className="text-red-500 text-xs mt-1">{errors.nome}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => updateField('telefone', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.telefone ? 'border-red-500' : isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                  {errors.telefone && <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>}
                </div>

                {/* CC */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    Cartão Cidadão
                  </label>
                  <input
                    type="text"
                    placeholder="12345678 1 ZZ 4"
                    value={formData.numeroCC}
                    onChange={(e) => updateField('numeroCC', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.numeroCC ? 'border-red-500' : isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                  {errors.numeroCC && <p className="text-red-500 text-xs mt-1">{errors.numeroCC}</p>}
                </div>

                {/* NIF */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    NIF
                  </label>
                  <input
                    type="text"
                    placeholder="123456789"
                    value={formData.numeroFiscal}
                    onChange={(e) => updateField('numeroFiscal', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.numeroFiscal ? 'border-red-500' : isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                  {errors.numeroFiscal && <p className="text-red-500 text-xs mt-1">{errors.numeroFiscal}</p>}
                </div>

                {/* Profissão */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    Profissão
                  </label>
                  <input
                    type="text"
                    value={formData.profissao}
                    onChange={(e) => updateField('profissao', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* Data Nascimento */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) => updateField('dataNascimento', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>

                {/* Estado Civil */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    Estado Civil
                  </label>
                  <select
                    value={formData.estadoCivil}
                    onChange={(e) => updateField('estadoCivil', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  >
                    {ESTADOS_CIVIL.map(estado => (
                      <option key={estado} value={estado}>
                        {estado.replace('_', ' ').charAt(0).toUpperCase() + estado.replace('_', ' ').slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Comunhão Bens */}
                {formData.estadoCivil === 'casado' && (
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                      Comunhão de Bens
                    </label>
                    <select
                      value={formData.comunhaoBens}
                      onChange={(e) => updateField('comunhaoBens', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecionar...</option>
                      <option value="adquiridos">Comunhão de Adquiridos</option>
                      <option value="geral">Comunhão Geral</option>
                      <option value="separacao">Separação de Bens</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* SEÇÃO 2: RESIDÊNCIA */}
            <div className="space-y-4">
              <h4 className={`text-md font-medium ${isDark() ? 'text-gray-300' : 'text-gray-800'}`}>
                <MapPinIcon className="h-4 w-4 inline mr-2" />
                Residência
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <input
                    type="text"
                    placeholder="Rua"
                    value={formData.residenciaRua}
                    onChange={(e) => updateField('residenciaRua', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Nº"
                  value={formData.residenciaNumero}
                  onChange={(e) => updateField('residenciaNumero', e.target.value)}
                  className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Andar"
                  value={formData.residenciaAndar}
                  onChange={(e) => updateField('residenciaAndar', e.target.value)}
                  className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  }`}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="1234-567"
                  value={formData.residenciaCP}
                  onChange={(e) => updateField('residenciaCP', e.target.value)}
                  className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Localidade"
                  value={formData.residenciaLocalidade}
                  onChange={(e) => updateField('residenciaLocalidade', e.target.value)}
                  className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Concelho"
                  value={formData.residenciaConcelho}
                  onChange={(e) => updateField('residenciaConcelho', e.target.value)}
                  className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>

            {/* SEÇÃO 3: CÔNJUGE */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="temConjuge"
                  checked={formData.temConjuge}
                  onChange={(e) => updateField('temConjuge', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="temConjuge" className={`font-medium flex items-center ${isDark() ? 'text-gray-200' : 'text-gray-900'}`}>
                  <HeartIcon className="h-5 w-5 mr-2" />
                  Tem Cônjuge/Companheiro(a)?
                </label>
              </div>

              {formData.temConjuge && (
                <div className={`p-4 rounded-lg ${isDark() ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                        Nome do Cônjuge *
                      </label>
                      <input
                        type="text"
                        value={formData.conjugeNome}
                        onChange={(e) => updateField('conjugeNome', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                          errors.conjugeNome ? 'border-red-500' : isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                        }`}
                      />
                      {errors.conjugeNome && <p className="text-red-500 text-xs mt-1">{errors.conjugeNome}</p>}
                    </div>
                    
                    <input
                      type="text"
                      placeholder="CC do cônjuge"
                      value={formData.conjugeCC}
                      onChange={(e) => updateField('conjugeCC', e.target.value)}
                      className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    />
                    
                    <input
                      type="text"
                      placeholder="NIF do cônjuge"
                      value={formData.conjugeNIF}
                      onChange={(e) => updateField('conjugeNIF', e.target.value)}
                      className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    />
                    
                    <input
                      type="email"
                      placeholder="Email do cônjuge"
                      value={formData.conjugeEmail}
                      onChange={(e) => updateField('conjugeEmail', e.target.value)}
                      className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    />
                    
                    <input
                      type="tel"
                      placeholder="Telefone do cônjuge"
                      value={formData.conjugeTelefone}
                      onChange={(e) => updateField('conjugeTelefone', e.target.value)}
                      className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    />
                    
                    <input
                      type="text"
                      placeholder="Profissão do cônjuge"
                      value={formData.conjugeProfissao}
                      onChange={(e) => updateField('conjugeProfissao', e.target.value)}
                      className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    />
                    
                    <input
                      type="date"
                      value={formData.conjugeDataNascimento}
                      onChange={(e) => updateField('conjugeDataNascimento', e.target.value)}
                      className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SEÇÃO 4: INFORMAÇÕES FINANCEIRAS */}
            <div className="space-y-6">
              <h3 className={`text-lg font-medium flex items-center ${isDark() ? 'text-gray-200' : 'text-gray-900'} border-b pb-2`}>
                <BanknotesIcon className="h-5 w-5 mr-2" />
                Informações Financeiras
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rendimento Mensal
                  </label>
                  <input
                    type="number"
                    placeholder="2500"
                    value={formData.rendimentoMensal}
                    onChange={(e) => updateField('rendimentoMensal', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rendimento Anual
                  </label>
                  <input
                    type="number"
                    placeholder="30000"
                    value={formData.rendimentoAnual}
                    onChange={(e) => updateField('rendimentoAnual', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    Situação de Crédito
                  </label>
                  <select
                    value={formData.situacaoCredito}
                    onChange={(e) => updateField('situacaoCredito', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  >
                    {SITUACOES_CREDITO.map(situacao => (
                      <option key={situacao} value={situacao}>
                        {situacao.replace('_', ' ').charAt(0).toUpperCase() + situacao.replace('_', ' ').slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="preAprovacao"
                  checked={formData.preAprovacaoCredito}
                  onChange={(e) => updateField('preAprovacaoCredito', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="preAprovacao" className={`text-sm ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tem pré-aprovação de crédito habitação?
                </label>
              </div>

              {formData.preAprovacaoCredito && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <input
                    type="number"
                    placeholder="Valor pré-aprovado"
                    value={formData.valorPreAprovado}
                    onChange={(e) => updateField('valorPreAprovado', e.target.value)}
                    className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Banco"
                    value={formData.bancoPreferencial}
                    onChange={(e) => updateField('bancoPreferencial', e.target.value)}
                    className={`px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>
              )}
            </div>

            {/* SEÇÃO 5: DETALHES DO IMÓVEL */}
            <div className="space-y-6">
              <h3 className={`text-lg font-medium flex items-center ${isDark() ? 'text-gray-200' : 'text-gray-900'} border-b pb-2`}>
                <HomeIcon className="h-5 w-5 mr-2" />
                Detalhes do Imóvel
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tipo de Imóvel
                  </label>
                  <select
                    value={formData.tipoImovel}
                    onChange={(e) => updateField('tipoImovel', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Selecionar...</option>
                    {TIPOS_IMOVEL.map(tipo => (
                      <option key={tipo} value={tipo}>
                        {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-1">
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    Orçamento Máximo
                  </label>
                  <input
                    type="number"
                    value={formData.orcamentoMaximo}
                    onChange={(e) => updateField('orcamentoMaximo', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    } ${formData.orcamentoMaximo ? 'bg-green-50 border-green-300' : ''}`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    Prazo de Decisão
                  </label>
                  <select
                    value={formData.prazoDecisao}
                    onChange={(e) => updateField('prazoDecisao', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  >
                    <option value="imediato">Imediato</option>
                    <option value="curto">Curto Prazo</option>
                    <option value="medio">Médio Prazo</option>
                    <option value="longo">Longo Prazo</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                    Motivo da Compra
                  </label>
                  <select
                    value={formData.motivoCompra}
                    onChange={(e) => updateField('motivoCompra', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  >
                    {MOTIVOS_COMPRA.map(motivo => (
                      <option key={motivo} value={motivo}>
                        {motivo.replace('_', ' ').charAt(0).toUpperCase() + motivo.replace('_', ' ').slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-3 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                  Características Essenciais
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {CARACTERISTICAS_IMOVEL.map(carac => (
                    <label key={carac} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.caracteristicasEssenciais.includes(carac)}
                        onChange={() => toggleArrayValue('caracteristicasEssenciais', carac)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                        {carac.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* SEÇÃO 6: DOCUMENTAÇÃO */}
            <div className="space-y-4">
              <h3 className={`text-lg font-medium flex items-center ${isDark() ? 'text-gray-200' : 'text-gray-900'} border-b pb-2`}>
                <PaperClipIcon className="h-5 w-5 mr-2" />
                Documentação Disponível
              </h3>
              
              <div className="grid grid-cols-3 gap-2">
                {DOCUMENTOS_LISTA.map(doc => (
                  <label key={doc} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.documentosDisponiveis.includes(doc)}
                      onChange={() => toggleArrayValue('documentosDisponiveis', doc)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`text-sm ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                      {doc.replace('_', ' ').charAt(0).toUpperCase() + doc.replace('_', ' ').slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* SEÇÃO 7: OBSERVAÇÕES */}
            <div className="space-y-4">
              <h3 className={`text-lg font-medium flex items-center ${isDark() ? 'text-gray-200' : 'text-gray-900'} border-b pb-2`}>
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Observações
              </h3>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                  Observações do Consultor
                </label>
                <textarea
                  rows={4}
                  value={formData.observacoesConsultor}
                  onChange={(e) => updateField('observacoesConsultor', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                    isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                  }`}
                  placeholder="Observações sobre o cliente..."
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-3 ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                  Próximos Passos Sugeridos
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'contacto_24h', 'agendamento_visita', 'pre_aprovacao_credito', 
                    'avaliacao_imovel', 'estrategia_marketing', 'pesquisa_mercado'
                  ].map(passo => (
                    <label key={passo} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.proximosPassos.includes(passo)}
                        onChange={() => toggleArrayValue('proximosPassos', passo)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${isDark() ? 'text-gray-300' : 'text-gray-700'}`}>
                        {passo.replace('_', ' ').charAt(0).toUpperCase() + passo.replace('_', ' ').slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* SEÇÃO 8: APROVAÇÃO */}
            <div className={`p-8 rounded-xl border-4 ${
              approved 
                ? `border-green-500 ${isDark() ? 'bg-green-900/20' : 'bg-green-50'}`
                : `border-red-500 ${isDark() ? 'bg-red-900/20' : 'bg-red-50'}`
            }`}>
              <div className="text-center space-y-6">
                <h4 className={`text-2xl font-bold ${isDark() ? 'text-gray-200' : 'text-gray-900'}`}>
                  APROVAÇÃO DA CONVERSÃO
                </h4>
                
                <button
                  onClick={() => setApproved(!approved)}
                  className={`px-12 py-6 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-xl ${
                    approved
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                  }`}
                >
                  {approved ? (
                    <>
                      <CheckCircleIcon className="h-8 w-8 inline mr-3" />
                      CONVERSÃO APROVADA
                    </>
                  ) : (
                    <>
                      <ExclamationTriangleIcon className="h-8 w-8 inline mr-3" />
                      CLIQUE PARA APROVAR
                    </>
                  )}
                </button>
                
                {approved ? (
                  <div className={`p-4 rounded-lg ${isDark() ? 'bg-green-800' : 'bg-green-100'}`}>
                    <p className={`text-lg font-bold ${isDark() ? 'text-green-200' : 'text-green-800'}`}>
                      PRONTO PARA CONVERTER!
                    </p>
                  </div>
                ) : (
                  <div className={`p-4 rounded-lg ${isDark() ? 'bg-red-800' : 'bg-red-100'}`}>
                    <p className={`text-lg font-bold ${isDark() ? 'text-red-200' : 'text-red-800'}`}>
                      APROVAÇÃO NECESSÁRIA
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Fixo */}
        <div className={`px-6 py-4 border-t ${isDark() ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Scroll para ver todos os campos • * = obrigatórios
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={isConverting}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  isDark() 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                } disabled:opacity-50`}
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                disabled={isConverting || !approved}
                className={`px-8 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                  approved && !isConverting
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
                    <span>Converter Lead → Cliente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleConversionModal;