// src/pages/auth/RegisterPage.jsx

import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  ThemedContainer, 
  ThemedButton, 
  ThemedCard, 
  ThemedHeading, 
  ThemedText,
  ThemedGradient,
  ThemedInput,
  ThemedBadge
} from '../../components/common/ThemedComponents';
import ThemeSelector from '../../components/common/ThemeSelector';

// 📝 PÁGINA DE REGISTO
// ====================

const RegisterPage = () => {
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    plan: 'professional', // Padrão para o plano mais popular
    acceptTerms: false,
    acceptMarketing: false
  });

  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [emailExistsChecked, setEmailExistsChecked] = useState(false);

  // Estados de mensagem
  const [successMessage, setSuccessMessage] = useState('');

  // Hooks
  const { 
    register, 
    checkEmailExists,
    error, 
    clearError, 
    isAuthenticated, 
    isRegistering,
    initializationComplete 
  } = useAuth();
  
  const { theme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔄 EFEITOS
  // ==========

  // Redirecionar se já autenticado
  useEffect(() => {
    if (initializationComplete && isAuthenticated) {
      console.log('👤 Utilizador já autenticado, redirecionando...');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate, initializationComplete]);

  // Limpar erros quando utilizador digita
  useEffect(() => {
    if (error && Object.values(formData).some(value => value !== '' && value !== false)) {
      clearError();
    }
  }, [formData, error, clearError]);

  // Verificar força da password
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password));
    } else {
      setPasswordStrength('');
    }
  }, [formData.password]);

  // Auto-limpar mensagens de sucesso
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // 💪 FUNÇÃO PARA CALCULAR FORÇA DA PASSWORD
  // =========================================
  const calculatePasswordStrength = (password) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^A-Za-z0-9]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score < 2) return 'weak';
    if (score < 4) return 'medium';
    return 'strong';
  };

  // Obter cor da força da password
  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'strong': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  // Obter texto da força da password
  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'Fraca';
      case 'medium': return 'Média';
      case 'strong': return 'Forte';
      default: return '';
    }
  };

  // 🔍 VALIDAÇÃO DO FORMULÁRIO
  // ==========================
  const validateForm = () => {
    const errors = {};

    // Validar nome
    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Nome não pode exceder 100 caracteres';
    } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(formData.name.trim())) {
      errors.name = 'Nome só pode conter letras e espaços';
    }

    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Por favor, introduza um email válido';
      }
    }

    // Validar password
    if (!formData.password) {
      errors.password = 'Password é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'Password deve ter pelo menos 6 caracteres';
    } else if (passwordStrength === 'weak') {
      errors.password = 'Password muito fraca. Adicione maiúsculas, números ou símbolos';
    }

    // Validar confirmação de password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de password é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords não coincidem';
    }

    // Validar empresa (opcional mas se preenchida deve ser válida)
    if (formData.company && formData.company.trim().length < 2) {
      errors.company = 'Nome da empresa deve ter pelo menos 2 caracteres';
    }

    // Validar telefone (opcional mas se preenchido deve ser válido)
    if (formData.phone) {
      const phoneRegex = /^[0-9+\s()-]{9,}$/;
      const cleanPhone = formData.phone.replace(/\s/g, '');
      
      // Validar formatos portugueses
      const portuguesePatterns = [
        /^9[0-9]{8}$/, // Mobile: 9XXXXXXXX
        /^2[0-9]{8}$/, // Landline: 2XXXXXXXX
        /^\+351[0-9]{9}$/, // Internacional: +351XXXXXXXXX
      ];
      
      const isValidPortuguesePhone = portuguesePatterns.some(pattern => pattern.test(cleanPhone));
      
      if (!isValidPortuguesePhone && !phoneRegex.test(formData.phone)) {
        errors.phone = 'Número de telefone inválido (formato português: 9XXXXXXXX ou 2XXXXXXXX)';
      }
    }

    // Validar termos
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'Deve aceitar os termos e condições para continuar';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validar campo individual
  const validateField = async (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Nome é obrigatório';
        } else if (value.trim().length < 2) {
          error = 'Nome deve ter pelo menos 2 caracteres';
        } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(value.trim())) {
          error = 'Nome só pode conter letras e espaços';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'Email é obrigatório';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            error = 'Email inválido';
          } else {
            // Verificar se email já existe (apenas quando sair do campo)
            try {
              const exists = await checkEmailExists(value.trim().toLowerCase());
              if (exists) {
                error = 'Este email já está registado. Tente fazer login.';
              }
              setEmailExistsChecked(true);
            } catch (emailCheckError) {
              console.warn('Erro ao verificar email:', emailCheckError);
              // Não mostrar erro se a verificação falhar
            }
          }
        }
        break;

      case 'password':
        if (!value) {
          error = 'Password é obrigatória';
        } else if (value.length < 6) {
          error = 'Password deve ter pelo menos 6 caracteres';
        }
        break;

      case 'confirmPassword':
        if (!value) {
          error = 'Confirmação de password é obrigatória';
        } else if (formData.password !== value) {
          error = 'Passwords não coincidem';
        }
        break;

      case 'phone':
        if (value) {
          const cleanPhone = value.replace(/\s/g, '');
          const portuguesePatterns = [
            /^9[0-9]{8}$/, // Mobile
            /^2[0-9]{8}$/, // Landline
            /^\+351[0-9]{9}$/, // Internacional
          ];
          
          const isValid = portuguesePatterns.some(pattern => pattern.test(cleanPhone));
          if (!isValid) {
            error = 'Número de telefone inválido';
          }
        }
        break;
    }

    return error;
  };

  // 📝 HANDLERS
  // ===========

  // Handle input changes
  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Validação em tempo real apenas após primeira tentativa de submit
    if (submitAttempted) {
      const fieldError = await validateField(name, type === 'checkbox' ? checked : value);
      setFormErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }

    // Limpar erro específico quando utilizador corrige
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle plan selection
  const handlePlanSelect = (planId) => {
    setFormData(prev => ({
      ...prev,
      plan: planId
    }));
  };

  // Handle blur (quando sair do campo) - para verificações assíncronas
  const handleFieldBlur = async (e) => {
    const { name, value } = e.target;
    
    if (submitAttempted) {
      const fieldError = await validateField(name, value);
      setFormErrors(prev => ({
        ...prev,
        [name]: fieldError
      }));
    }
  };

  // 🚀 HANDLE FORM SUBMISSION
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔄 Tentativa de registo iniciada...');
    setSubmitAttempted(true);
    setSuccessMessage('');
    
    // Validar formulário
    if (!validateForm()) {
      console.log('❌ Validação falhou:', formErrors);
      return;
    }

    try {
      console.log('📤 Enviando dados de registo...');
      
      const result = await register(
        formData.email.trim().toLowerCase(), 
        formData.password, 
        {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          company: formData.company.trim(),
          phone: formData.phone.trim(),
          plan: formData.plan,
          role: 'consultor'
        }
      );
      
      if (result.success) {
        console.log('✅ Registo bem-sucedido!');
        
        // Mostrar feedback positivo
        setSuccessMessage('Conta criada com sucesso! Redirecionando para o login...');
        
        // Redirecionar para login após pequeno delay
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Conta criada com sucesso! Verifique o seu email para ativar a conta e faça login.',
              email: formData.email.trim().toLowerCase()
            } 
          });
        }, 2000);

      } else {
        // Erro já tratado pelo AuthContext
        console.log('❌ Registo falhou:', result.message);
      }
      
    } catch (error) {
      console.error('💥 Erro inesperado no registo:', error);
      setFormErrors({ 
        general: 'Erro inesperado. Tente novamente.' 
      });
    }
  };

  // 🎯 PLANOS DISPONÍVEIS
  // ====================
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '29€',
      priceNote: '/mês',
      description: 'Perfeito para começar',
      features: [
        '500 leads por mês',
        'Dashboard básico',
        'Suporte por email',
        '1 utilizador'
      ],
      color: 'blue'
    },
    {
      id: 'professional',
      name: 'Professional', 
      price: '79€',
      priceNote: '/mês',
      description: 'Mais popular',
      features: [
        'Leads ilimitados',
        'Automação de follow-up',
        'Relatórios avançados',
        'Até 5 utilizadores',
        'Integração WhatsApp'
      ],
      popular: true,
      color: 'green'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '149€', 
      priceNote: '/mês',
      description: 'Para equipas grandes',
      features: [
        'Tudo do Professional',
        'API personalizada',
        'Suporte 24/7',
        'Utilizadores ilimitados',
        'Gestor de conta dedicado'
      ],
      color: 'purple'
    }
  ];

  // 🎨 RENDERIZAÇÃO CONDICIONAL
  // ===========================

  // Mostrar loading se ainda não inicializou
  if (!initializationComplete) {
    return (
      <ThemedContainer background={false} className="min-h-screen">
        <ThemedGradient 
          type="secondary" 
          className="min-h-screen flex items-center justify-center"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <ThemedText>A inicializar...</ThemedText>
          </div>
        </ThemedGradient>
      </ThemedContainer>
    );
  }

  return (
    <ThemedContainer background={false} className="min-h-screen">
      <ThemedGradient 
        type="secondary" 
        className={`min-h-screen flex items-center justify-center py-12 px-4 ${
          isDark() ? 'from-gray-900 via-gray-800 to-black' : 'from-blue-50 to-indigo-100'
        }`}
      >
        <div className="max-w-4xl w-full space-y-8">
          
          {/* 🎨 HEADER COM LOGO E TEMAS */}
          <div className="text-center">
            <div className="flex justify-center items-center space-x-4 mb-6">
              <ThemedGradient 
                type="primary" 
                className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-bold text-2xl">🏡</span>
              </ThemedGradient>
              
              <div>
                <ThemedHeading level={1} className={`text-2xl ${
                  isDark() ? 'text-white' : 'text-gray-900'
                }`}>
                  MyImoMate 3.0
                </ThemedHeading>
                <ThemedText className={`text-sm ${
                  isDark() ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  CRM Imobiliário Inteligente
                </ThemedText>
              </div>
            </div>
            
            <ThemedHeading level={2} className={`mb-2 ${
              isDark() ? 'text-white' : 'text-gray-900'
            }`}>
              Criar nova conta
            </ThemedHeading>
            
            <ThemedText className={`mb-6 ${
              isDark() ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Junte-se a milhares de profissionais imobiliários que confiam no MyImoMate
            </ThemedText>

            {/* Seletor de Temas */}
            <div className="flex justify-center mb-8">
              <ThemeSelector />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 📋 FORMULÁRIO DE REGISTO */}
            <div className="lg:col-span-2">
              <ThemedCard className="p-8">
                
                {/* 🎉 MENSAGEM DE SUCESSO */}
                {successMessage && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex">
                      <svg className="w-5 h-5 text-green-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h3 className="text-sm font-medium text-green-800">Sucesso!</h3>
                        <p className="text-sm text-green-700 mt-1">{successMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ❌ MENSAGEM DE ERRO GERAL */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex">
                      <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h3 className="text-sm font-medium text-red-800">Erro no registo</h3>
                        <p className="text-sm text-red-700 mt-1">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                  
                  {/* 👤 CAMPO NOME */}
                  <div>
                    <label 
                      htmlFor="name" 
                      className={`block text-sm font-medium mb-2 ${
                        isDark() ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Nome completo *
                    </label>
                    <ThemedInput
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      placeholder="Joaquim Manuel Alexandre Oliveira"
                      className={`
                        ${formErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                      `}
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>

                  {/* 📧 CAMPO EMAIL */}
                  <div>
                    <label 
                      htmlFor="email" 
                      className={`block text-sm font-medium mb-2 ${
                        isDark() ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Email *
                    </label>
                    <ThemedInput
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      placeholder="seuemail@exemplo.com"
                      className={`
                        ${formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                      `}
                    />
                    {formErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                    )}
                  </div>

                  {/* 🔒 CAMPO PASSWORD */}
                  <div>
                    <label 
                      htmlFor="password" 
                      className={`block text-sm font-medium mb-2 ${
                        isDark() ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Password *
                    </label>
                    <div className="relative">
                      <ThemedInput
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Crie uma password segura"
                        className={`
                          pr-10
                          ${formErrors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                        `}
                      />
                      
                      {/* Botão Toggle Password */}
                      <button
                        type="button"
                        className={`
                          absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5
                          ${isDark() 
                            ? 'text-gray-400 hover:text-gray-300' 
                            : 'text-gray-400 hover:text-gray-600'
                          }
                        `}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <svg 
                          className="h-5 w-5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          {showPassword ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          )}
                        </svg>
                      </button>
                    </div>
                    
                    {/* Indicador de força da password */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  passwordStrength === 'weak' ? 'bg-red-500 w-1/3' :
                                  passwordStrength === 'medium' ? 'bg-yellow-500 w-2/3' :
                                  passwordStrength === 'strong' ? 'bg-green-500 w-full' : 'w-0'
                                }`}
                              ></div>
                            </div>
                          </div>
                          <span className={`text-xs font-medium ${getPasswordStrengthColor()}`}>
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {formErrors.password && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                    )}
                  </div>

                  {/* 🔒 CONFIRMAÇÃO DE PASSWORD */}
                  <div>
                    <label 
                      htmlFor="confirmPassword" 
                      className={`block text-sm font-medium mb-2 ${
                        isDark() ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Confirmar password *
                    </label>
                    <div className="relative">
                      <ThemedInput
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="Repita a sua password"
                        className={`
                          pr-10
                          ${formErrors.confirmPassword ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                        `}
                      />
                      
                      {/* Botão Toggle Confirm Password */}
                      <button
                        type="button"
                        className={`
                          absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5
                          ${isDark() 
                            ? 'text-gray-400 hover:text-gray-300' 
                            : 'text-gray-400 hover:text-gray-600'
                          }
                        `}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <svg 
                          className="h-5 w-5" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          {showConfirmPassword ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          )}
                        </svg>
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* 🏢 EMPRESA (OPCIONAL) */}
                  <div>
                    <label 
                      htmlFor="company" 
                      className={`block text-sm font-medium mb-2 ${
                        isDark() ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Empresa <span className="text-gray-400">(opcional)</span>
                    </label>
                    <ThemedInput
                      id="company"
                      name="company"
                      type="text"
                      autoComplete="organization"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Joaquim Oliveira Yoga"
                      className={`
                        ${formErrors.company ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                      `}
                    />
                    {formErrors.company && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.company}</p>
                    )}
                  </div>

                  {/* 📞 TELEFONE (OPCIONAL) */}
                  <div>
                    <label 
                      htmlFor="phone" 
                      className={`block text-sm font-medium mb-2 ${
                        isDark() ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Telefone <span className="text-gray-400">(opcional)</span>
                    </label>
                    <ThemedInput
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      onBlur={handleFieldBlur}
                      placeholder="911918796"
                      className={`
                        ${formErrors.phone ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
                      `}
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Formato: 9XXXXXXXX ou 2XXXXXXXX
                    </p>
                  </div>

                  {/* ✅ CHECKBOXES DE TERMOS E MARKETING */}
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <input
                        id="acceptTerms"
                        name="acceptTerms"
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={handleInputChange}
                        className={`
                          mt-1 h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-offset-2
                          ${isDark() 
                            ? 'text-blue-600 focus:ring-blue-500 bg-gray-700 border-gray-600' 
                            : 'text-blue-600 focus:ring-blue-500'
                          }
                        `}
                      />
                      <label 
                        htmlFor="acceptTerms" 
                        className={`ml-2 block text-sm ${
                          isDark() ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Aceito os{' '}
                        <Link 
                          to="/terms" 
                          className="text-blue-600 hover:text-blue-500"
                          target="_blank"
                        >
                          Termos e Condições
                        </Link>
                        {' '}e{' '}
                        <Link 
                          to="/privacy" 
                          className="text-blue-600 hover:text-blue-500"
                          target="_blank"
                        >
                          Política de Privacidade
                        </Link>
                        {' '}*
                      </label>
                    </div>
                    {formErrors.acceptTerms && (
                      <p className="text-sm text-red-600">{formErrors.acceptTerms}</p>
                    )}

                    <div className="flex items-start">
                      <input
                        id="acceptMarketing"
                        name="acceptMarketing"
                        type="checkbox"
                        checked={formData.acceptMarketing}
                        onChange={handleInputChange}
                        className={`
                          mt-1 h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-offset-2
                          ${isDark() 
                            ? 'text-blue-600 focus:ring-blue-500 bg-gray-700 border-gray-600' 
                            : 'text-blue-600 focus:ring-blue-500'
                          }
                        `}
                      />
                      <label 
                        htmlFor="acceptMarketing" 
                        className={`ml-2 block text-sm ${
                          isDark() ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Aceito receber emails sobre novidades e promoções <span className="text-gray-400">(opcional)</span>
                      </label>
                    </div>
                  </div>

                  {/* 🚀 BOTÃO DE SUBMIT */}
                  <ThemedButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full"
                    disabled={isRegistering || !formData.acceptTerms}
                  >
                    {isRegistering ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Criando conta...
                      </div>
                    ) : (
                      'Criar Conta'
                    )}
                  </ThemedButton>
                </form>

                {/* 📝 LINK PARA LOGIN */}
                <div className="mt-6 text-center">
                  <ThemedText className={isDark() ? 'text-gray-400' : 'text-gray-600'}>
                    Já tem conta?{' '}
                    <Link 
                      to="/login" 
                      className={`
                        font-medium transition-colors
                        ${isDark() 
                          ? 'text-blue-400 hover:text-blue-300' 
                          : 'text-blue-600 hover:text-blue-500'
                        }
                      `}
                    >
                      Fazer login
                    </Link>
                  </ThemedText>
                </div>
              </ThemedCard>
            </div>

            {/* 💳 SELEÇÃO DE PLANOS */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <ThemedCard className="p-6">
                  <ThemedHeading level={3} className="mb-4">
                    Escolha o seu plano
                  </ThemedHeading>
                  
                  <div className="space-y-4">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`
                          relative p-4 rounded-lg border-2 cursor-pointer transition-all
                          ${formData.plan === plan.id
                            ? 'border-blue-500 bg-blue-50'
                            : isDark()
                              ? 'border-gray-600 bg-gray-800 hover:border-gray-500'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }
                        `}
                        onClick={() => handlePlanSelect(plan.id)}
                      >
                        {plan.popular && (
                          <ThemedBadge 
                            variant="success" 
                            className="absolute -top-2 -right-2"
                          >
                            Popular
                          </ThemedBadge>
                        )}
                        
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className={`font-semibold ${
                              isDark() ? 'text-white' : 'text-gray-900'
                            }`}>
                              {plan.name}
                            </h4>
                            <p className={`text-sm ${
                              isDark() ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {plan.description}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${
                              isDark() ? 'text-white' : 'text-gray-900'
                            }`}>
                              {plan.price}
                            </div>
                            <div className={`text-xs ${
                              isDark() ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {plan.priceNote}
                            </div>
                          </div>
                        </div>
                        
                        <ul className="space-y-1 text-sm">
                          {plan.features.map((feature, index) => (
                            <li key={index} className={`flex items-center ${
                              isDark() ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        
                        {/* Radio button visual */}
                        <div className="absolute top-4 right-4">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            formData.plan === plan.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {formData.plan === plan.id && (
                              <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                      💡 Pode alterar o seu plano a qualquer momento após o registo.
                    </p>
                  </div>
                </ThemedCard>
              </div>
            </div>
          </div>

          {/* 🏠 LINK DE VOLTA À HOME */}
          <div className="text-center">
            <Link 
              to="/" 
              className={`
                inline-flex items-center text-sm font-medium transition-colors
                ${isDark() 
                  ? 'text-gray-400 hover:text-gray-300' 
                  : 'text-gray-600 hover:text-gray-500'
                }
              `}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar à página inicial
            </Link>
          </div>
        </div>
      </ThemedGradient>
    </ThemedContainer>
  );
};

export default RegisterPage;