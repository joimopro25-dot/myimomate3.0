// src/components/common/ProtectedRoute.jsx

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ThemedContainer, ThemedHeading, ThemedText } from './ThemedComponents';

const ProtectedRoute = ({ 
  children, 
  requireEmailVerification = false,
  requiredRole = null,
  fallbackPath = '/login' 
}) => {
  const { 
    currentUser, 
    userProfile, 
    loading, 
    isAuthenticated, 
    isEmailVerified 
  } = useAuth();
  const { theme, isDark } = useTheme();
  const location = useLocation();

  // Loading state - mostrar spinner enquanto carrega
  if (loading) {
    return (
      <ThemedContainer className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className={`
            inline-block animate-spin rounded-full h-12 w-12 border-b-2 mb-4
            ${isDark() ? 'border-white' : 'border-blue-600'}
          `}></div>
          <ThemedHeading level={3} className={`mb-2 ${
            isDark() ? 'text-white' : 'text-gray-900'
          }`}>
            Carregando...
          </ThemedHeading>
          <ThemedText className={isDark() ? 'text-gray-300' : 'text-gray-600'}>
            Verificando autenticação
          </ThemedText>
        </div>
      </ThemedContainer>
    );
  }

  // Utilizador não autenticado - redirecionar para login
  if (!isAuthenticated()) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Verificar se email precisa estar verificado
  if (requireEmailVerification && !isEmailVerified()) {
    return <EmailVerificationRequired />;
  }

  // Verificar role/permissões se especificado
  if (requiredRole && userProfile?.role !== requiredRole) {
    return <AccessDenied requiredRole={requiredRole} userRole={userProfile?.role} />;
  }

  // Utilizador autenticado e autorizado - mostrar conteúdo
  return children;
};

// Componente para quando email não está verificado
const EmailVerificationRequired = () => {
  const { 
    currentUser, 
    resendVerificationEmail, 
    logout 
  } = useAuth();
  const { isDark } = useTheme();

  const handleResendEmail = async () => {
    const result = await resendVerificationEmail();
    if (result.success) {
      alert('Email de verificação reenviado!');
    } else {
      alert('Erro ao reenviar email: ' + result.message);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ThemedContainer className="min-h-screen flex items-center justify-center">
      <div className={`
        max-w-md w-full mx-4 p-8 rounded-xl shadow-xl text-center
        ${isDark() 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
        }
      `}>
        <div className="text-6xl mb-6">📧</div>
        
        <ThemedHeading level={2} className={`mb-4 ${
          isDark() ? 'text-white' : 'text-gray-900'
        }`}>
          Verificação de Email Necessária
        </ThemedHeading>
        
        <ThemedText className={`mb-6 ${
          isDark() ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Para continuar, verifique o seu email <strong>{currentUser?.email}</strong>. 
          Verifique a sua caixa de entrada e spam.
        </ThemedText>
        
        <div className="space-y-3">
          <button
            onClick={handleResendEmail}
            className={`
              w-full px-4 py-2 rounded-lg font-medium transition-colors
              ${isDark()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            Reenviar Email de Verificação
          </button>
          
          <button
            onClick={handleLogout}
            className={`
              w-full px-4 py-2 rounded-lg font-medium transition-colors
              ${isDark()
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }
            `}
          >
            Fazer Logout
          </button>
        </div>
        
        <ThemedText size="sm" className={`mt-4 ${
          isDark() ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Já verificou? Recarregue a página.
        </ThemedText>
      </div>
    </ThemedContainer>
  );
};

// Componente para quando utilizador não tem permissão
const AccessDenied = ({ requiredRole, userRole }) => {
  const { logout } = useAuth();
  const { isDark } = useTheme();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ThemedContainer className="min-h-screen flex items-center justify-center">
      <div className={`
        max-w-md w-full mx-4 p-8 rounded-xl shadow-xl text-center
        ${isDark() 
          ? 'bg-gray-800 border border-gray-700' 
          : 'bg-white border border-gray-200'
        }
      `}>
        <div className="text-6xl mb-6">🚫</div>
        
        <ThemedHeading level={2} className={`mb-4 ${
          isDark() ? 'text-white' : 'text-gray-900'
        }`}>
          Acesso Negado
        </ThemedHeading>
        
        <ThemedText className={`mb-6 ${
          isDark() ? 'text-gray-300' : 'text-gray-600'
        }`}>
          Esta página requer permissões de <strong>{requiredRole}</strong>. 
          O seu nível atual é <strong>{userRole || 'desconhecido'}</strong>.
        </ThemedText>
        
        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className={`
              w-full px-4 py-2 rounded-lg font-medium transition-colors
              ${isDark()
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            Voltar
          </button>
          
          <button
            onClick={handleLogout}
            className={`
              w-full px-4 py-2 rounded-lg font-medium transition-colors
              ${isDark()
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }
            `}
          >
            Fazer Logout
          </button>
        </div>
        
        <ThemedText size="sm" className={`mt-4 ${
          isDark() ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Contacte o administrador para alterar as suas permissões.
        </ThemedText>
      </div>
    </ThemedContainer>
  );
};

export default ProtectedRoute;