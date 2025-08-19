// src/pages/profile/CreateProfilePage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import useProfile, { SUBSCRIPTION_PLANS, PAYMENT_METHODS } from '../../hooks/useProfile';
import { 
  ThemedContainer, 
  ThemedButton, 
  ThemedCard, 
  ThemedHeading, 
  ThemedText,
  ThemedInput,
  ThemedGradient
} from '../../components/common/ThemedComponents';

const CreateProfilePage = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const { theme, isDark } = useTheme();
  const { createCompleteProfile, loading, error } = useProfile();

  // Estados do formulário
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Dados pessoais
    name: user?.displayName || '',
    company: '',
    phone: '',
    nif: '',
    
    // Dados profissionais
    role: 'consultor',
    department: '',
    licenseNumber: '',
    
    // Morada
    address: {
      street: '',
      number: '',
      floor: '',
      postalCode: '',
      city: '',
      district: '',
      country: 'Portugal'
    },
    
    // Plano selecionado
    selectedPlan: 'professional',
    
    // Pagamento
    paymentMethod: PAYMENT_METHODS.CREDIT_CARD,
    cardLastFour: '',
    billingEmail: user?.email || '',
    vatNumber: '',
    autoRenew: true,
    
    // Configurações
    theme: 'corporate',
    language: 'pt',
    timezone: 'Europe/Lisbon',
    currency: 'EUR',
    
    // Notificações
    notifications: {
      email: true,
      whatsapp: false,
      browser: true,
      sms: false
    },
    
    // Privacidade
    privacy: {
      profileVisible: true,
      contactSharing: false,
      analyticsOptIn: true,
      marketingOptIn: false
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirecionar se já tem perfil completo
  useEffect(() => {
    if (userProfile?.stats?.profileCompleted) {
      navigate('/dashboard');
    }
  }, [userProfile, navigate]);

  // Validação por step
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Dados pessoais
        if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
        if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
        if (formData.phone && !/^(\+351|351|00351)?[ -]?9[1236][0-9][ -]?[0-9]{3}[ -]?[0-9]{3}$/.test(formData.phone)) {
          newErrors.phone = 'Formato de telefone português inválido';
        }
        if (formData.nif && !/^[1-9][0-9]{8}$/.test(formData.nif)) {
          newErrors.nif = 'NIF deve ter 9 dígitos';
        }
        break;

      case 2: // Dados profissionais e morada
        if (!formData.address.city.trim()) newErrors.city = 'Cidade é obrigatória';
        if (formData.address.postalCode && !/^[0-9]{4}-[0-9]{3}$/.test(formData.address.postalCode)) {
          newErrors.postalCode = 'Código postal inválido (formato: 1234-567)';
        }
        break;

      case 3: // Plano (sempre válido pois tem default)
        break;

      case 4: // Pagamento
        if (!formData.billingEmail.trim()) newErrors.billingEmail = 'Email de faturação é obrigatório';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.billingEmail)) {
          newErrors.billingEmail = 'Email inválido';
        }
        if (formData.paymentMethod === PAYMENT_METHODS.CREDIT_CARD && !formData.cardLastFour) {
          newErrors.cardLastFour = 'Últimos 4 dígitos do cartão são obrigatórios';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Avançar step
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  // Voltar step
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Atualizar dados do formulário
  const updateFormData = (field, value) => {
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
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Limpar erro do campo
    if (errors[field] || errors[field.split('.')[1]]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        delete newErrors[field.split('.')[1]];
        return newErrors;
      });
    }
  };

  // Submeter formulário
  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsSubmitting(true);

    try {
      const result = await createCompleteProfile(formData);
      
      if (result.success) {
        navigate('/dashboard', { 
          state: { 
            message: 'Perfil criado com sucesso! Bem-vindo ao MyImoMate 3.0!',
            type: 'success'
          }
        });
      } else {
        setErrors({ submit: result.error || 'Erro ao criar perfil' });
      }
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Renderizar step atual
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <ThemedHeading level={2} className="mb-2">
                Dados Pessoais
              </ThemedHeading>
              <ThemedText className="text-gray-600">
                Vamos começar com as suas informações básicas
              </ThemedText>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome Completo *
                </label>
                <ThemedInput
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="João Silva"
                  error={errors.name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Empresa
                </label>
                <ThemedInput
                  type="text"
                  value={formData.company}
                  onChange={(e) => updateFormData('company', e.target.value)}
                  placeholder="Imobiliária ABC"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Telefone *
                </label>
                <ThemedInput
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="912 345 678"
                  error={errors.phone}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  NIF
                </label>
                <ThemedInput
                  type="text"
                  value={formData.nif}
                  onChange={(e) => updateFormData('nif', e.target.value)}
                  placeholder="123456789"
                  error={errors.nif}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <ThemedHeading level={2} className="mb-2">
                Dados Profissionais e Morada
              </ThemedHeading>
              <ThemedText className="text-gray-600">
                Informações sobre a sua atividade profissional
              </ThemedText>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Função
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => updateFormData('role', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:border-transparent transition-colors ${
                    isDark() ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="consultor">Consultor Imobiliário</option>
                  <option value="mediador">Mediador Imobiliário</option>
                  <option value="diretor">Diretor de Agência</option>
                  <option value="coordenador">Coordenador</option>
                  <option value="owner">Proprietário</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Departamento
                </label>
                <ThemedInput
                  type="text"
                  value={formData.department}
                  onChange={(e) => updateFormData('department', e.target.value)}
                  placeholder="Vendas, Arrendamento, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nº Licença AMI
                </label>
                <ThemedInput
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => updateFormData('licenseNumber', e.target.value)}
                  placeholder="AMI 12345"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <ThemedHeading level={3} className="mb-4">
                Morada
              </ThemedHeading>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Rua
                  </label>
                  <ThemedInput
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => updateFormData('address.street', e.target.value)}
                    placeholder="Rua das Flores"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Número
                  </label>
                  <ThemedInput
                    type="text"
                    value={formData.address.number}
                    onChange={(e) => updateFormData('address.number', e.target.value)}
                    placeholder="123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Andar
                  </label>
                  <ThemedInput
                    type="text"
                    value={formData.address.floor}
                    onChange={(e) => updateFormData('address.floor', e.target.value)}
                    placeholder="2º Esq"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Código Postal
                  </label>
                  <ThemedInput
                    type="text"
                    value={formData.address.postalCode}
                    onChange={(e) => updateFormData('address.postalCode', e.target.value)}
                    placeholder="1234-567"
                    error={errors.postalCode}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cidade *
                  </label>
                  <ThemedInput
                    type="text"
                    value={formData.address.city}
                    onChange={(e) => updateFormData('address.city', e.target.value)}
                    placeholder="Lisboa"
                    error={errors.city}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Distrito
                  </label>
                  <ThemedInput
                    type="text"
                    value={formData.address.district}
                    onChange={(e) => updateFormData('address.district', e.target.value)}
                    placeholder="Lisboa"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <ThemedHeading level={2} className="mb-2">
                Escolha o Seu Plano
              </ThemedHeading>
              <ThemedText className="text-gray-600">
                Selecione o plano que melhor se adequa às suas necessidades
              </ThemedText>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
                <ThemedCard 
                  key={plan.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    formData.selectedPlan === plan.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:shadow-lg'
                  } ${plan.popular ? 'border-2 border-blue-500' : ''}`}
                  onClick={() => updateFormData('selectedPlan', plan.id)}
                >
                  {plan.popular && (
                    <div className="bg-blue-500 text-white text-sm font-medium px-3 py-1 rounded-full text-center mb-4">
                      Mais Popular
                    </div>
                  )}
                  
                  <div className="text-center">
                    <ThemedHeading level={3} className="mb-2">
                      {plan.name}
                    </ThemedHeading>
                    
                    <div className="mb-4">
                      <span className="text-3xl font-bold">€{plan.price}</span>
                      <span className="text-gray-600">/mês</span>
                    </div>
                    
                    <ul className="space-y-2 text-sm text-left">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </ThemedCard>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <ThemedHeading level={2} className="mb-2">
                Informações de Pagamento
              </ThemedHeading>
              <ThemedText className="text-gray-600">
                Configure os seus dados de faturação
              </ThemedText>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Método de Pagamento
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => updateFormData('paymentMethod', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:border-transparent transition-colors ${
                    isDark() ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value={PAYMENT_METHODS.CREDIT_CARD}>Cartão de Crédito</option>
                  <option value={PAYMENT_METHODS.DEBIT_CARD}>Cartão de Débito</option>
                  <option value={PAYMENT_METHODS.MBWAY}>MB WAY</option>
                  <option value={PAYMENT_METHODS.MULTIBANCO}>Multibanco</option>
                  <option value={PAYMENT_METHODS.BANK_TRANSFER}>Transferência Bancária</option>
                </select>
              </div>

              {(formData.paymentMethod === PAYMENT_METHODS.CREDIT_CARD || 
                formData.paymentMethod === PAYMENT_METHODS.DEBIT_CARD) && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Últimos 4 dígitos do cartão *
                  </label>
                  <ThemedInput
                    type="text"
                    value={formData.cardLastFour}
                    onChange={(e) => updateFormData('cardLastFour', e.target.value)}
                    placeholder="1234"
                    maxLength={4}
                    error={errors.cardLastFour}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email de Faturação *
                </label>
                <ThemedInput
                  type="email"
                  value={formData.billingEmail}
                  onChange={(e) => updateFormData('billingEmail', e.target.value)}
                  placeholder="faturacao@empresa.com"
                  error={errors.billingEmail}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  NIF/NIPC para Faturação
                </label>
                <ThemedInput
                  type="text"
                  value={formData.vatNumber}
                  onChange={(e) => updateFormData('vatNumber', e.target.value)}
                  placeholder="123456789"
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoRenew"
                  checked={formData.autoRenew}
                  onChange={(e) => updateFormData('autoRenew', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoRenew" className="ml-2 text-sm">
                  Renovação automática (recomendado)
                </label>
              </div>
            </div>
          </div>
        );

      case 5:
        const selectedPlan = SUBSCRIPTION_PLANS[formData.selectedPlan.toUpperCase()];
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <ThemedHeading level={2} className="mb-2">
                Confirmação e Configurações
              </ThemedHeading>
              <ThemedText className="text-gray-600">
                Revise os seus dados e configure as preferências
              </ThemedText>
            </div>

            {/* Resumo da conta */}
            <ThemedCard className="p-6">
              <ThemedHeading level={3} className="mb-4">
                Resumo da Conta
              </ThemedHeading>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Nome:</strong> {formData.name}
                </div>
                <div>
                  <strong>Email:</strong> {user?.email}
                </div>
                <div>
                  <strong>Telefone:</strong> {formData.phone}
                </div>
                <div>
                  <strong>Empresa:</strong> {formData.company || 'N/A'}
                </div>
                <div>
                  <strong>Função:</strong> {formData.role}
                </div>
                <div>
                  <strong>Cidade:</strong> {formData.address.city}
                </div>
              </div>
            </ThemedCard>

            {/* Resumo do plano */}
            <ThemedCard className="p-6">
              <ThemedHeading level={3} className="mb-4">
                Plano Selecionado
              </ThemedHeading>
              
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="font-semibold">{selectedPlan.name}</div>
                  <div className="text-sm text-gray-600">
                    {selectedPlan.features.slice(0, 3).join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">€{selectedPlan.price}</div>
                  <div className="text-sm text-gray-600">por mês</div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                Método de pagamento: {formData.paymentMethod === PAYMENT_METHODS.CREDIT_CARD ? 'Cartão de Crédito' : 
                                     formData.paymentMethod === PAYMENT_METHODS.MBWAY ? 'MB WAY' : 
                                     'Outro'}
              </div>
            </ThemedCard>

            {/* Configurações básicas */}
            <ThemedCard className="p-6">
              <ThemedHeading level={3} className="mb-4">
                Preferências
              </ThemedHeading>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tema
                  </label>
                  <select
                    value={formData.theme}
                    onChange={(e) => updateFormData('theme', e.target.value)}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark() ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="corporate">Corporate</option>
                    <option value="fun">Fun</option>
                    <option value="casual">Casual</option>
                    <option value="feminine">Feminino</option>
                    <option value="masculine">Masculino</option>
                    <option value="millionaire">Milionário</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Notificações
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.notifications.email}
                        onChange={(e) => updateFormData('notifications.email', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">Notificações por email</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.notifications.browser}
                        onChange={(e) => updateFormData('notifications.browser', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">Notificações do navegador</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Privacidade
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.privacy.analyticsOptIn}
                        onChange={(e) => updateFormData('privacy.analyticsOptIn', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">Aceito análise de dados para melhorar o serviço</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.privacy.marketingOptIn}
                        onChange={(e) => updateFormData('privacy.marketingOptIn', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm">Aceito receber comunicações de marketing</span>
                    </label>
                  </div>
                </div>
              </div>
            </ThemedCard>

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="text-red-800 text-sm">{errors.submit}</div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ThemedContainer className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 5 && (
                  <div className={`w-12 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <ThemedText className="text-sm text-gray-600">
              Passo {currentStep} de 5
            </ThemedText>
          </div>
        </div>

        {/* Conteúdo do step */}
        <ThemedCard className="p-8">
          {renderStep()}
        </ThemedCard>

        {/* Botões de navegação */}
        <div className="flex justify-between mt-8">
          <ThemedButton
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={currentStep === 1 ? 'invisible' : ''}
          >
            Anterior
          </ThemedButton>

          {currentStep < 5 ? (
            <ThemedButton onClick={nextStep}>
              Próximo
            </ThemedButton>
          ) : (
            <ThemedButton 
              onClick={handleSubmit}
              disabled={isSubmitting || loading}
              className="min-w-[120px]"
            >
              {isSubmitting || loading ? 'Criando...' : 'Criar Perfil'}
            </ThemedButton>
          )}
        </div>
      </div>
    </ThemedContainer>
  );
};

export default CreateProfilePage;