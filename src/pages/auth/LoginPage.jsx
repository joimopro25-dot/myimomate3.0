// src/pages/auth/LoginPage.jsx

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
  ThemedInput
} from '../../components/common/ThemedComponents';
import ThemeSelector from '../../components/common/ThemeSelector';

// 🔐 PÁGINA DE LOGIN
// ==================

const LoginPage = () => {
  // Estados do formulário
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Estados de mensagem
  const [successMessage, setSuccessMessage] = useState('');
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);

  // Hooks
  const { 
    login, 
    resetPassword,
    error, 
    clearError, 
    isAuthenticated, 
    isLoggingIn,
    isResettingPassword,
    initializationComplete 
  } = useAuth();
  
  const { theme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // 🔄 EFEITOS
  // ==========

  // Redirecionar se já autenticado (após inicialização completa)
  useEffect(() => {
    if (initializationComplete && isAuthenticated()) {
      console.log('👤 Utilizador já autenticado, redirecionando...');
      setShowWelcomeBack(true);
      
      setTimeout(() => {
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }, 1500);
    }
  }, [isAuthenticated, navigate, location, initializationComplete]);

  // Carregar dados salvos se "Remember Me" estava ativo
  useEffect(() => {
    const savedEmail = localStorage.getItem('myimomate-remember-email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
      console.log('📧 Email carregado do localStorage:', savedEmail);
    }
  }, []);

  // Verificar mensagens de estado (ex: vindo do registo)
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Limpar message do state para não aparecer novamente
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Limpar erros quando utilizador digita
  useEffect(() => {
    if (error && (formData.email || formData.password)) {
      clearError();
    }
  }, [formData.email, formData.password, error, clearError]);

  // Auto-limpar mensagens de sucesso
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // 🔍 VALIDAÇÃO DO FORMULÁRIO
  // ==========================
  const validateForm = () => {
    const errors = {};

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
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validar campo individual (para feedback em tempo real)
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'email':
        if (!value.trim()) {
          error = 'Email é obrigatório';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            error = 'Email inválido';
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
    }

    return error;
  };

  // 📝 HANDLERS
  // ===========

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validação em tempo real apenas após primeira tentativa de submit
    if (submitAttempted) {
      const fieldError = validateField(name, value);
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

  // Handle checkbox Remember Me
  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  // 🚀 HANDLE FORM SUBMISSION
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔄 Tentativa de login iniciada...');
    setSubmitAttempted(true);
    setSuccessMessage('');
    
    // Validar formulário
    if (!validateForm()) {
      console.log('❌ Validação falhou:', formErrors);
      return;
    }

    try {
      console.log('📤 Enviando dados de login...');
      
      const result = await login(formData.email.trim().toLowerCase(), formData.password);
      
      if (result.success) {
        console.log('✅ Login bem-sucedido!');
        
        // Gerenciar "Remember Me"
        if (rememberMe) {
          localStorage.setItem('myimomate-remember-email', formData.email.trim().toLowerCase());
          console.log('💾 Email guardado para próximo login');
        } else {
          localStorage.removeItem('myimomate-remember-email');
          console.log('🗑️ Email removido do localStorage');
        }

        // Mostrar feedback positivo
        setSuccessMessage('Login realizado com sucesso! Redirecionando...');
        
        // Redirecionar após pequeno delay para mostrar feedback
        setTimeout(() => {
          const from = location.state?.from?.pathname || '/dashboard';
          console.log('🎯 Redirecionando para:', from);
          navigate(from, { replace: true });
        }, 1000);

      } else {
        // Erro já tratado pelo AuthContext
        console.log('❌ Login falhou:', result.message);
      }
      
    } catch (error) {
      console.error('💥 Erro inesperado no login:', error);
      setFormErrors({ 
        general: 'Erro inesperado. Tente novamente.' 
      });
    }
  };

  // 🔑 HANDLE FORGOT PASSWORD
  // =========================
  const handleForgotPassword = async () => {
    // Verificar se email está preenchido
    if (!formData.email.trim()) {
      setFormErrors({ email: 'Introduza o seu email primeiro' });
      return;
    }

    // Verificar se email é válido
    const emailError = validateField('email', formData.email);
    if (emailError) {
      setFormErrors({ email: emailError });
      return;
    }

    try {
      console.log('🔄 Enviando email de recuperação...');
      const result = await resetPassword(formData.email.trim().toLowerCase());
      
      if (result.success) {
        setSuccessMessage('Email de recuperação enviado! Verifique a sua caixa de entrada.');
        setFormErrors({});
      }
    } catch (error) {
      console.error('❌ Erro ao enviar email de recuperação:', error);
    }
  };

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

  // Mostrar welcome back se já autenticado
  if (showWelcomeBack) {
    return (
      <ThemedContainer background={false} className="min-h-screen">
        <ThemedGradient 
          type="secondary" 
          className="min-h-screen flex items-center justify-center"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <ThemedHeading level={2} className="text-green-600 mb-2">
              Bem-vindo de volta!
            </ThemedHeading>
            <ThemedText>Redirecionando para o dashboard...</ThemedText>
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
        <div className="max-w-md w-full space-y-8">
          
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
              Entrar na sua conta
            </ThemedHeading>
            
            <ThemedText className={`mb-6 ${
              isDark() ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Introduza os seus dados para aceder ao painel
            </ThemedText>

            {/* Seletor de Temas */}
            <div className="flex justify-center mb-6">
              <ThemeSelector />
            </div>
          </div>

          {/* 📋 FORMULÁRIO DE LOGIN */}
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
                    <h3 className="text-sm font-medium text-red-800">Erro no login</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
              
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
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Introduza a sua password"
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
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>

              {/* 💾 REMEMBER ME E FORGOT PASSWORD */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                    className={`
                      h-4 w-4 rounded border-gray-300 focus:ring-2 focus:ring-offset-2
                      ${isDark() 
                        ? 'text-blue-600 focus:ring-blue-500 bg-gray-700 border-gray-600' 
                        : 'text-blue-600 focus:ring-blue-500'
                      }
                    `}
                  />
                  <label 
                    htmlFor="remember-me" 
                    className={`ml-2 block text-sm ${
                      isDark() ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    Lembrar-me
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isResettingPassword}
                  className={`
                    text-sm font-medium transition-colors
                    ${isResettingPassword ? 'opacity-50 cursor-not-allowed' : ''}
                    ${isDark() 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-500'
                    }
                  `}
                >
                  {isResettingPassword ? 'Enviando...' : 'Esqueceu a password?'}
                </button>
              </div>

              {/* 🚀 BOTÃO DE SUBMIT */}
              <ThemedButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={isLoggingIn || !formData.email || !formData.password}
              >
                {isLoggingIn ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </ThemedButton>
            </form>

            {/* 📝 LINK PARA REGISTO */}
            <div className="mt-6 text-center">
              <ThemedText className={isDark() ? 'text-gray-400' : 'text-gray-600'}>
                Ainda não tem conta?{' '}
                <Link 
                  to="/register" 
                  className={`
                    font-medium transition-colors
                    ${isDark() 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-500'
                    }
                  `}
                >
                  Criar conta
                </Link>
              </ThemedText>
            </div>
          </ThemedCard>

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

export default LoginPage;