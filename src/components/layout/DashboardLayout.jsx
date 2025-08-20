// src/components/layout/DashboardLayout.jsx

import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  ThemedContainer, 
  ThemedButton, 
  ThemedHeading, 
  ThemedText,
  ThemedGradient,
  ThemedBadge
} from '../common/ThemedComponents';
import ThemeSelector from '../common/ThemeSelector';
import {
  HomeIcon,
  UserGroupIcon,
  UsersIcon,
  EyeIcon,
  BriefcaseIcon,
  CurrencyEuroIcon,
  CheckIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  QuestionMarkCircleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  
  const { currentUser, userProfile, logout } = useAuth();
  const { theme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Fechar menus quando mudar de página
  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('#user-menu')) {
        setUserMenuOpen(false);
      }
      if (!event.target.closest('#mobile-sidebar')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegação principal
  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      current: location.pathname === '/dashboard'
    },
    {
      name: 'Leads',
      href: '/leads',
      icon: UserGroupIcon,
      current: location.pathname.startsWith('/leads')
    },
    {
      name: 'Clientes',
      href: '/clients',
      icon: UsersIcon,
      current: location.pathname.startsWith('/clients')
    },
    {
      name: 'Visitas',
      href: '/visits',
      icon: EyeIcon,
      current: location.pathname.startsWith('/visits')
    },
    {
      name: 'Oportunidades',
      href: '/opportunities',
      icon: BriefcaseIcon,
      current: location.pathname.startsWith('/opportunities')
    },
    {
      name: 'Negócios',
      href: '/deals',
      icon: CurrencyEuroIcon,
      current: location.pathname.startsWith('/deals')
    },
    {
      name: 'Tarefas',
      href: '/tasks',
      icon: CheckIcon,
      current: location.pathname.startsWith('/tasks')
    },
    {
      name: 'Calendário',
      href: '/calendar',
      icon: CalendarIcon,
      current: location.pathname.startsWith('/calendar')
    }
  ];

  // Navegação secundária (bottom da sidebar)
  const secondaryNavigation = [
    {
      name: 'Relatórios',
      href: '/reports',
      icon: ChartBarIcon,
      current: location.pathname.startsWith('/reports')
    },
    {
      name: 'Configurações',
      href: '/settings',
      icon: CogIcon,
      current: location.pathname.startsWith('/settings')
    },
    {
      name: 'Suporte',
      href: '/support',
      icon: QuestionMarkCircleIcon,
      current: location.pathname.startsWith('/support')
    }
  ];

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <ThemedContainer background={true} className="min-h-screen">
      <div className="flex h-screen">
        {/* Sidebar Desktop */}
        <div className={`
          hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0
          ${isDark() 
            ? 'bg-gray-900 border-r border-gray-700' 
            : 'bg-white border-r border-gray-200'
          }
        `}>
          <SidebarContent 
            navigation={navigation}
            secondaryNavigation={secondaryNavigation}
            userProfile={userProfile}
            theme={theme}
            isDark={isDark}
          />
        </div>

        {/* Sidebar Mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Overlay */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div 
              id="mobile-sidebar"
              className={`
                fixed inset-y-0 left-0 w-64 transform transition-transform duration-200 ease-in-out
                ${isDark() 
                  ? 'bg-gray-900 border-r border-gray-700' 
                  : 'bg-white border-r border-gray-200'
                }
              `}
            >
              <SidebarContent 
                navigation={navigation}
                secondaryNavigation={secondaryNavigation}
                userProfile={userProfile}
                theme={theme}
                isDark={isDark}
                mobile={true}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Conteúdo Principal */}
        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <header className={`
            sticky top-0 z-40 border-b
            ${isDark() 
              ? 'bg-gray-800/95 border-gray-700 backdrop-blur-sm' 
              : 'bg-white/95 border-gray-200 backdrop-blur-sm'
            }
          `}>
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
              {/* Left side - Mobile menu button */}
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className={`
                    lg:hidden p-2 rounded-md transition-colors
                    ${isDark() 
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>

                {/* Page title (mobile) */}
                <ThemedHeading 
                  level={4} 
                  className={`ml-4 lg:hidden ${isDark() ? 'text-white' : 'text-gray-900'}`}
                >
                  {navigation.find(item => item.current)?.name || 'Dashboard'}
                </ThemedHeading>
              </div>

              {/* Right side - Theme selector, notifications, user menu */}
              <div className="flex items-center space-x-4">
                {/* Theme Selector */}
                <div className="hidden sm:block">
                  <ThemeSelector compact={true} showLabel={false} />
                </div>

                {/* Notifications */}
                <button className={`
                  relative p-2 rounded-full transition-colors
                  ${isDark() 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}>
                  <BellIcon className="w-6 h-6" />
                  {/* Badge de notificação */}
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* User Menu */}
                <div className="relative" id="user-menu">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`
                      flex items-center space-x-3 p-2 rounded-lg transition-colors
                      ${isDark() 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${isDark() 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-500 text-white'
                      }
                    `}>
                      {userProfile?.name?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className={`text-sm font-medium ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                        {userProfile?.name || currentUser?.displayName || 'Utilizador'}
                      </p>
                      <p className={`text-xs ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
                        {userProfile?.plan || 'starter'}
                      </p>
                    </div>
                    <svg className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* User Dropdown - MELHORADO */}
                  {userMenuOpen && (
                    <div className={`
                      absolute right-0 mt-2 w-72 rounded-lg shadow-lg border
                      ${isDark() 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-200'
                      }
                    `}>
                      
                      {/* ✅ SEÇÃO DE INFORMAÇÕES DA CONTA */}
                      <div className={`px-4 py-3 border-b ${isDark() ? 'border-gray-700' : 'border-gray-100'}`}>
                        <div className="flex items-center space-x-3">
                          <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium
                            ${isDark() 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-blue-500 text-white'
                            }
                          `}>
                            {userProfile?.name?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${isDark() ? 'text-white' : 'text-gray-900'}`}>
                              {userProfile?.name || currentUser?.displayName || 'Utilizador'}
                            </p>
                            <p className={`text-sm truncate ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
                              {currentUser?.email || 'sem-email@exemplo.com'}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <p className={`text-xs ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
                                Plano:
                              </p>
                              <ThemedBadge variant="primary" size="xs">
                                {userProfile?.plan || 'Starter'}
                              </ThemedBadge>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ✅ LINKS DE NAVEGAÇÃO */}
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className={`
                            flex items-center px-4 py-2 text-sm transition-colors
                            ${isDark() 
                              ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                            }
                          `}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <span className="mr-3">👤</span>
                          Ver Perfil
                        </Link>
                        
                        <Link
                          to="/settings"
                          className={`
                            flex items-center px-4 py-2 text-sm transition-colors
                            ${isDark() 
                              ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                            }
                          `}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <span className="mr-3">⚙️</span>
                          Configurações
                        </Link>
                        
                        <Link
                          to="/billing"
                          className={`
                            flex items-center px-4 py-2 text-sm transition-colors
                            ${isDark() 
                              ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                            }
                          `}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <span className="mr-3">💳</span>
                          Faturação
                        </Link>

                        {/* ✅ LINK ADICIONAL - SUPORTE */}
                        <Link
                          to="/support"
                          className={`
                            flex items-center px-4 py-2 text-sm transition-colors
                            ${isDark() 
                              ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                              : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                            }
                          `}
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <span className="mr-3">🆘</span>
                          Suporte
                        </Link>
                        
                        <hr className={`my-1 ${isDark() ? 'border-gray-700' : 'border-gray-200'}`} />
                        
                        <button
                          onClick={handleLogout}
                          className={`
                            flex items-center w-full text-left px-4 py-2 text-sm transition-colors
                            ${isDark() 
                              ? 'text-red-400 hover:text-red-300 hover:bg-gray-700' 
                              : 'text-red-600 hover:text-red-700 hover:bg-gray-100'
                            }
                          `}
                        >
                          <span className="mr-3">🚪</span>
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemedContainer>
  );
};

// Componente separado para o conteúdo da sidebar
const SidebarContent = ({ 
  navigation, 
  secondaryNavigation, 
  userProfile, 
  theme, 
  isDark, 
  mobile = false,
  onClose 
}) => {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <ThemedGradient 
          type="primary" 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
        >
          <HomeIcon className="w-5 h-5 text-white" />
        </ThemedGradient>
        <ThemedHeading level={3} className={`ml-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          MyImoMate
        </ThemedHeading>
        {mobile && (
          <button
            onClick={onClose}
            className={`
              ml-auto p-1 rounded-md transition-colors
              ${isDark 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }
            `}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User Info */}
      <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-3">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-medium
            ${isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}
          `}>
            {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {userProfile?.name || 'Utilizador'}
            </p>
            <div className="flex items-center space-x-2">
              <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {userProfile?.company || 'Sem empresa'}
              </p>
              <ThemedBadge variant="primary" size="xs">
                {userProfile?.plan || 'starter'}
              </ThemedBadge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`
                group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                ${item.current
                  ? isDark
                    ? 'bg-blue-900 text-blue-200'
                    : 'bg-blue-50 text-blue-700'
                  : isDark
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
            >
              <IconComponent className={`w-5 h-5 mr-3 ${item.current ? 'text-current' : 'text-gray-400'}`} />
              <span className="flex-1">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className={`px-3 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="space-y-1">
          {secondaryNavigation.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                  ${item.current
                    ? isDark
                      ? 'bg-gray-700 text-gray-100'
                      : 'bg-gray-100 text-gray-900'
                    : isDark
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                <IconComponent className={`w-5 h-5 mr-3 ${item.current ? 'text-current' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;