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
  ThemedBadge
} from '../../components/common/ThemedComponents';
import ThemeSelector from '../../components/common/ThemeSelector';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    phone: '',
    plan: 'starter',
    acceptTerms: false,
    acceptMarketing: false
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const { register, error, clearError, isAuthenticated } = useAuth();
  const { theme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirecionar se já autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Limpar erros quando utilizador começa a digitar
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData, clearError]);

  // Verificar força da password
  useEffect(() => {
    if (formData.password) {
      setPasswordStrength(calculatePasswordStrength(formData.password));
    } else {
      setPasswordStrength('');
    }
  }, [formData.password]);

  // Função para calcular força da password
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

  // Validação do formulário
  const validateForm = () => {
    const errors = {};

    // Validar nome
    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar email
    if (!formData.email) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    // Validar password
    if (!formData.password) {
      errors.password = 'Password é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'Password deve ter pelo menos 6 caracteres';
    }

    // Validar confirmação de password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de password é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords não coincidem';
    }

    // Validar telefone (opcional mas se preenchido deve ser válido)
    if (formData.phone && !/^[0-9+\s()-]{9,}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Número de telefone inválido';
    }

    // Validar termos
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'Deve aceitar os termos e condições';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpar erro específico quando utilizador começa a corrigir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await register(formData.email, formData.password, {
        name: formData.name.trim(),
        email: formData.email,
        company: formData.company.trim(),
        phone: formData.phone.trim(),
        plan: formData.plan,
        role: 'consultor'
      });
      
      if (result.success) {
        // Redirecionar para página de sucesso ou login
        navigate('/login', { 
          state: { 
            message: 'Conta criada com sucesso! Verifique o seu email e faça login.',
            email: formData.email
          } 
        });
      }
    } catch (error) {
      console.error('Erro no registo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Planos disponíveis
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: '29€',
      description: 'Perfeito para começar',
      features: ['500 leads', 'Básico']
    },
    {
      id: 'professional',
      name: 'Professional', 
      price: '79€',
      description: 'Mais popular',
      features: ['Leads ilimitados', 'Automação'],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '149€', 
      description: 'Para equipas grandes',
      features: ['Tudo incluído', 'Suporte 24/7']
    }
  ];

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'strong': return 'text-green-500';
      default: return 'text-gray-400';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak': return 'Fraca';
      case 'medium': return 'Média';
      case 'strong': return 'Forte';
      default: return '';
    }
  };

  return (
    <ThemedContainer background={false} className="min-h-screen">
      <ThemedGradient 
        type="secondary" 
        className={`min-h-screen flex items-center justify-center py-12 px-4 ${
          isDark() ? 'from-gray-900 via-gray-800 to-black' : 'from-blue-50 to-indigo-100'
        }`}
      >
        <div className="max-w-2xl w-full space-y-8">
          {/* Header com logo e seletor de temas */}
          <div className="text-center">
            <div className="flex justify-center items-center space-x-4 mb-6">
              <ThemedGradient 
                type="primary" 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
              >
                <span className="text-white font-bold text-2xl">🏡</span>
              </ThemedGradient>
              <ThemedHeading level={1} className={`${
                isDark() ? 'text-white' : 'text-gray-900'
              }`}>
                MyImoMate 3.0
              </ThemedHeading>
            </div>
            
            <ThemedHeading level={2} className={`mb-2 ${
              isDark() ? 'text-white' : 'text-gray-900'
            }`}>
              Criar nova conta
            </ThemedHeading>
            
            <ThemedText className={`mb-6 ${
              isDark() ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Junte-se a centenas de consultores que já revolucionaram o seu negócio
            </ThemedText>

            {/* Seletor de Temas */}
            <div className="flex justify-center mb-6">
              <ThemeSelector compact={true} showLabel={false} />
            </div>
          </div>

          {/* Formulário de Registo */}
          <ThemedCard className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mostrar erro global se existir */}
              {error && (
                <div className={`
                  p-4 rounded-lg border text-sm
                  ${isDark() 
                    ? 'bg-red-900/20 border-red-800 text-red-300' 
                    : 'bg-red-50 border-red-200 text-red-700'
                  }
                `}>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {/* Grid para campos lado a lado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Campo Nome */}
                <div className="md:col-span-1">
                  <label 
                    htmlFor="name" 
                    className={`block text-sm font-medium mb-2 ${
                      isDark() ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Nome completo *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`
                      block w-full px-3 py-2 border rounded-lg shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-offset-2
                      transition-colors duration-200
                      ${formErrors.name 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : isDark()
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                      }
                    `}
                    placeholder="João Silva"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>

                {/* Campo Email */}
                <div className="md:col-span-1">
                  <label 
                    htmlFor="email" 
                    className={`block text-sm font-medium mb-2 ${
                      isDark() ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`
                      block w-full px-3 py-2 border rounded-lg shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-offset-2
                      transition-colors duration-200
                      ${formErrors.email 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : isDark()
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                      }
                    `}
                    placeholder="joao@exemplo.com"
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                {/* Campo Empresa */}
                <div className="md:col-span-1">
                  <label 
                    htmlFor="company" 
                    className={`block text-sm font-medium mb-2 ${
                      isDark() ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Empresa
                  </label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    value={formData.company}
                    onChange={handleInputChange}
                    className={`
                      block w-full px-3 py-2 border rounded-lg shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-offset-2
                      transition-colors duration-200
                      ${isDark()
                        ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500'
                        : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                      }
                    `}
                    placeholder="Silva Imobiliária"
                  />
                </div>

                {/* Campo Telefone */}
                <div className="md:col-span-1">
                  <label 
                    htmlFor="phone" 
                    className={`block text-sm font-medium mb-2 ${
                      isDark() ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Telefone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`
                      block w-full px-3 py-2 border rounded-lg shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-offset-2
                      transition-colors duration-200
                      ${formErrors.phone 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : isDark()
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                      }
                    `}
                    placeholder="+351 912 345 678"
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              {/* Escolha do Plano */}
              <div>
                <label className={`block text-sm font-medium mb-4 ${
                  isDark() ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Escolher Plano *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => (
                    <div
                      key={plan.id}
                      className={`
                        relative cursor-pointer rounded-lg border p-4 transition-all
                        ${formData.plan === plan.id
                          ? isDark()
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-blue-500 bg-blue-50'
                          : isDark()
                            ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }
                      `}
                      onClick={() => setFormData(prev => ({ ...prev, plan: plan.id }))}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <ThemedBadge variant="primary" size="xs">
                            Popular
                          </ThemedBadge>
                        </div>
                      )}
                      <input
                        type="radio"
                        name="plan"
                        value={plan.id}
                        checked={formData.plan === plan.id}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <div className="text-center">
                        <h3 className={`font-semibold ${
                          isDark() ? 'text-white' : 'text-gray-900'
                        }`}>
                          {plan.name}
                        </h3>
                        <p className={`text-2xl font-bold mt-1 ${
                          isDark() ? 'text-blue-400' : 'text-blue-600'
                        }`}>
                          {plan.price}
                        </p>
                        <p className={`text-sm mt-1 ${
                          isDark() ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {plan.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Campo Password */}
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
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`
                      block w-full px-3 py-2 pr-10 border rounded-lg shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-offset-2
                      transition-colors duration-200
                      ${formErrors.password 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : isDark()
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                      }
                    `}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`
                      absolute inset-y-0 right-0 pr-3 flex items-center
                      ${isDark() ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
                    `}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                </div>
                {formData.password && (
                  <p className={`mt-1 text-sm ${getPasswordStrengthColor()}`}>
                    Password {getPasswordStrengthText()}
                  </p>
                )}
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>

              {/* Campo Confirmar Password */}
              <div>
                <label 
                  htmlFor="confirmPassword" 
                  className={`block text-sm font-medium mb-2 ${
                    isDark() ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Confirmar Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`
                      block w-full px-3 py-2 pr-10 border rounded-lg shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-offset-2
                      transition-colors duration-200
                      ${formErrors.confirmPassword 
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                        : isDark()
                          ? 'border-gray-600 bg-gray-700 text-white focus:border-blue-500 focus:ring-blue-500'
                          : 'border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-blue-500'
                      }
                    `}
                    placeholder="Repita a password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`
                      absolute inset-y-0 right-0 pr-3 flex items-center
                      ${isDark() ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
                    `}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {showConfirmPassword ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                </div>
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>

              {/* Checkboxes */}
              <div className="space-y-4">
                {/* Termos e Condições */}
                <div className="flex items-start">
                  <input
                    id="acceptTerms"
                    name="acceptTerms"
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={handleInputChange}
                    className={`
                      h-4 w-4 mt-1 rounded border-gray-300 focus:ring-2 focus:ring-offset-2
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
                      className={`font-medium ${
                        isDark() ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                      }`}
                      target="_blank"
                    >
                      Termos e Condições
                    </Link>
                    {' '}e{' '}
                    <Link 
                      to="/privacy" 
                      className={`font-medium ${
                        isDark() ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'
                      }`}
                      target="_blank"
                    >
                      Política de Privacidade
                    </Link>
                    {' *'}
                  </label>
                </div>
                {formErrors.acceptTerms && (
                  <p className="text-sm text-red-600">{formErrors.acceptTerms}</p>
                )}

                {/* Marketing */}
                <div className="flex items-start">
                  <input
                    id="acceptMarketing"
                    name="acceptMarketing"
                    type="checkbox"
                    checked={formData.acceptMarketing}
                    onChange={handleInputChange}
                    className={`
                      h-4 w-4 mt-1 rounded border-gray-300 focus:ring-2 focus:ring-offset-2
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
                    Aceito receber emails sobre novidades e promoções (opcional)
                  </label>
                </div>
              </div>

              {/* Botão de Submit */}
              <ThemedButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Criando conta...
                  </div>
                ) : (
                  'Criar Conta'
                )}
              </ThemedButton>
            </form>

            {/* Link para Login */}
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

          {/* Link de volta à home */}
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