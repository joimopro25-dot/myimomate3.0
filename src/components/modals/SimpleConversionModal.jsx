// src/components/modals/SimpleConversionModal.jsx
// 🚀 MODAL DE CONVERSÃO SIMPLES - SEM LOOPS
// ========================================
// MyImoMate 3.0 - Modal básico e funcional
// ✅ Sem estados complexos que causam loops
// ✅ Formulário essencial para conversão
// ✅ Funcional e direto ao ponto

import React, { useState } from 'react';
import { 
  XMarkIcon, 
  UserIcon, 
  CurrencyEuroIcon, 
  HomeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
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

  // Estados básicos do formulário
  const [formData, setFormData] = useState({
    numeroCC: '',
    numeroFiscal: '',
    profissao: '',
    rendimentoMensal: '',
    orcamentoMaximo: leadData?.budgetMax || '',
    prazoDecisao: 'curto',
    motivoCompra: 'primeira_habitacao',
    observacoes: `Lead convertido: ${leadData?.name}\nEmail: ${leadData?.email}\nTelefone: ${leadData?.phone}`
  });

  const [errors, setErrors] = useState({});
  const [approved, setApproved] = useState(false);

  // Validação simples
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.numeroCC.trim()) newErrors.numeroCC = 'CC obrigatório';
    if (!formData.numeroFiscal.trim()) newErrors.numeroFiscal = 'NIF obrigatório';
    if (!formData.profissao.trim()) newErrors.profissao = 'Profissão obrigatória';
    if (!formData.rendimentoMensal || formData.rendimentoMensal <= 0) {
      newErrors.rendimentoMensal = 'Rendimento obrigatório';
    }
    if (!formData.orcamentoMaximo || formData.orcamentoMaximo <= 0) {
      newErrors.orcamentoMaximo = 'Orçamento obrigatório';
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
      alert('É necessário aprovar a conversão');
      return;
    }

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
        validationPassed: true,
        approvedBy: 'manual_approval'
      },
      createOpportunity: true,
      createSpouse: false,
      conversionApproved: true
    };

    onConvert(conversionData);
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden ${isDark() ? 'bg-gray-800' : 'bg-white'}`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark() ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-semibold ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                Converter Lead para Cliente
              </h2>
              <p className={`text-sm ${isDark() ? 'text-gray-300' : 'text-gray-600'}`}>
                Lead: <strong>{leadData?.name}</strong> ({leadData?.email})
              </p>
            </div>
            
            <button
              onClick={onClose}
              className={`p-2 rounded-md ${isDark() ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            
            {/* Dados Pessoais */}
            <div>
              <h3 className={`text-lg font-medium mb-4 flex items-center ${isDark() ? 'text-gray-200' : 'text-gray-900'}`}>
                <UserIcon className="h-5 w-5 mr-2" />
                Dados Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-200' : 'text-gray-700'}`}>
                    Cartão de Cidadão *
                  </label>
                  <input
                    type="text"
                    value={formData.numeroCC}
                    onChange={(e) => updateField('numeroCC', e.target.value)}
                    placeholder="12345678 9 ZZ4"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.numeroCC 
                        ? 'border-red-500' 
                        : isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                  {errors.numeroCC && (
                    <p className="text-red-500 text-xs mt-1">{errors.numeroCC}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-200' : 'text-gray-700'}`}>
                    NIF *
                  </label>
                  <input
                    type="text"
                    value={formData.numeroFiscal}
                    onChange={(e) => updateField('numeroFiscal', e.target.value)}
                    placeholder="123456789"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.numeroFiscal 
                        ? 'border-red-500' 
                        : isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                  {errors.numeroFiscal && (
                    <p className="text-red-500 text-xs mt-1">{errors.numeroFiscal}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-200' : 'text-gray-700'}`}>
                    Profissão *
                  </label>
                  <input
                    type="text"
                    value={formData.profissao}
                    onChange={(e) => updateField('profissao', e.target.value)}
                    placeholder="Ex: Engenheiro, Professor..."
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      errors.profissao 
                        ? 'border-red-500' 
                        : isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  />
                  {errors.profissao && (
                    <p className="text-red-500 text-xs mt-1">{errors.profissao}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Dados Financeiros */}
            <div>
              <h3 className={`text-lg font-medium mb-4 flex items-center ${isDark() ? 'text-gray-200' : 'text-gray-900'}`}>
                <CurrencyEuroIcon className="h-5 w-5 mr-2" />
                Informações Financeiras
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-200' : 'text-gray-700'}`}>
                    Rendimento Mensal *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.rendimentoMensal}
                      onChange={(e) => updateField('rendimentoMensal', e.target.value)}
                      placeholder="1500"
                      className={`w-full pl-8 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        errors.rendimentoMensal 
                          ? 'border-red-500' 
                          : isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    />
                    <span className="absolute left-3 top-2 text-gray-400">€</span>
                  </div>
                  {errors.rendimentoMensal && (
                    <p className="text-red-500 text-xs mt-1">{errors.rendimentoMensal}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-200' : 'text-gray-700'}`}>
                    Orçamento Máximo *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.orcamentoMaximo}
                      onChange={(e) => updateField('orcamentoMaximo', e.target.value)}
                      placeholder="300000"
                      className={`w-full pl-8 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                        errors.orcamentoMaximo 
                          ? 'border-red-500' 
                          : isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                      }`}
                    />
                    <span className="absolute left-3 top-2 text-gray-400">€</span>
                  </div>
                  {errors.orcamentoMaximo && (
                    <p className="text-red-500 text-xs mt-1">{errors.orcamentoMaximo}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Detalhes do Negócio */}
            <div>
              <h3 className={`text-lg font-medium mb-4 flex items-center ${isDark() ? 'text-gray-200' : 'text-gray-900'}`}>
                <HomeIcon className="h-5 w-5 mr-2" />
                Detalhes do Negócio
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-200' : 'text-gray-700'}`}>
                    Prazo para Decisão
                  </label>
                  <select
                    value={formData.prazoDecisao}
                    onChange={(e) => updateField('prazoDecisao', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  >
                    <option value="imediato">Imediato (até 1 mês)</option>
                    <option value="curto">Curto Prazo (1-3 meses)</option>
                    <option value="medio">Médio Prazo (3-6 meses)</option>
                    <option value="longo">Longo Prazo (6+ meses)</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-200' : 'text-gray-700'}`}>
                    Motivo da Compra
                  </label>
                  <select
                    value={formData.motivoCompra}
                    onChange={(e) => updateField('motivoCompra', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                      isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                    }`}
                  >
                    <option value="primeira_habitacao">Primeira Habitação</option>
                    <option value="habitacao_propria">Habitação Própria</option>
                    <option value="investimento">Investimento</option>
                    <option value="mudanca_trabalho">Mudança de Trabalho</option>
                    <option value="melhoria_vida">Melhoria de Vida</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Observações */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark() ? 'text-gray-200' : 'text-gray-700'}`}>
                Observações
              </label>
              <textarea
                value={formData.observacoes}
                onChange={(e) => updateField('observacoes', e.target.value)}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
                  isDark() ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'
                }`}
              />
            </div>

            {/* Aprovação */}
            <div className={`p-4 rounded-lg border-2 border-dashed ${
              approved 
                ? `border-green-500 ${isDark() ? 'bg-green-900/10' : 'bg-green-50'}`
                : `border-gray-400 ${isDark() ? 'bg-gray-800' : 'bg-gray-50'}`
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setApproved(!approved)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                      approved
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {approved ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      <ExclamationTriangleIcon className="h-5 w-5" />
                    )}
                    <span>
                      {approved ? 'Conversão Aprovada' : 'Aprovar Conversão'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${isDark() ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex justify-end space-x-3">
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
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
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
                  <span>Converter Lead</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleConversionModal;