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

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, error, clearError, isAuthenticated } = useAuth();
  const { theme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirecionar se já autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      const from = location.state?.from || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Carregar dados salvos se "Remember Me" estava ativo
  useEffect(() => {
    const savedEmail = localStorage.getItem('myimomate-remember-email');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Limpar erros quando utilizador começa a digitar
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [formData, clearError]);

  // Validação do formulário
  const validateForm = () => {
    const errors = {};

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

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Salvar email se "Remember Me" estiver ativo
        if (rememberMe) {
          localStorage.setItem('myimomate-remember-email', formData.email);
        } else {
          localStorage.removeItem('myimomate-remember-email');
        }

        // Redirecionar para destino original ou dashboard
        const from = location.state?.from || '/dashboard';
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Erro no login:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle "Forgot Password"
  const handleForgotPassword = () => {
    navigate('/forgot-password', { 
      state: { email: formData.email } 
    });
  };

  return (
    <ThemedContainer background={false} className="min-h-screen">
      <ThemedGradient 
        type="secondary" 
        className={`min-h-screen flex items-center justify-center py-12 px-4 ${
          isDark() ? 'from-gray-900 via-gray-800 to-black' : 'from-blue-50 to-indigo-100'
        }`}
      >
        <div className="max-w-md w-full space-y-8">
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
              Bem-vindo de volta
            </ThemedHeading>
            
            <ThemedText className={`mb-6 ${
              isDark() ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Entre na sua conta para continuar
            </ThemedText>

            {/* Seletor de Temas */}
            <div className="flex justify-center mb-6">
              <ThemeSelector compact={true} showLabel={false} />
            </div>
          </div>

          {/* Formulário de Login */}
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

              {/* Campo Email */}
              <div>
                <label 
                  htmlFor="email" 
                  className={`block text-sm font-medium mb-2 ${
                    isDark() ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Email
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
                  placeholder="Digite o seu email"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              {/* Campo Password */}
              <div>
                <label 
                  htmlFor="password" 
                  className={`block text-sm font-medium mb-2 ${
                    isDark() ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
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
                    placeholder="Digite a sua password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`
                      absolute inset-y-0 right-0 pr-3 flex items-center
                      ${isDark() ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
                    `}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      )}
                    </svg>
                  </button>
                </div>
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>

              {/* Remember Me e Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
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
                  className={`
                    text-sm font-medium transition-colors
                    ${isDark() 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-500'
                    }
                  `}
                >
                  Esqueceu a password?
                </button>
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
                    Entrando...
                  </div>
                ) : (
                  'Entrar'
                )}
              </ThemedButton>
            </form>

            {/* Link para Registo */}
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

export default LoginPage;