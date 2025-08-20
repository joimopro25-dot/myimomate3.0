// src/components/layout/DashboardLayout.jsx
// Layout COMPLETO: Viewport 100% + User Menu + Hero Icons

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
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

// Widget Sidebar que ocupa toda altura
const WidgetSidebar = ({ className = '' }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`
      w-80 h-full flex flex-col border-l overflow-hidden
      ${isDark() ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
      ${className}
    `}>
      <div className={`p-4 border-b flex-shrink-0 ${isDark() ? 'border-gray-700' : 'border-gray-200'}`}>
        <h3 className={`text-lg font-semibold ${
          isDark() ? 'text-white' : 'text-gray-900'
        }`}>
          Analytics & Widgets
        </h3>
      </div>
      
      <div className="flex-1 p-4 space-y-4 overflow-auto">
        {/* Widget Performance */}
        <div className={`rounded-lg p-4 border ${
          isDark() 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
        }`}>
          <h4 className={`text-sm font-medium mb-3 ${
            isDark() ? 'text-gray-200' : 'text-gray-700'
          }`}>
            📈 Performance
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className={isDark() ? 'text-gray-300' : 'text-gray-600'}>
                Conversão
              </span>
              <span className="font-bold text-green-600">15.3%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{width: '15.3%'}}></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className={isDark() ? 'text-gray-300' : 'text-gray-600'}>
                ROI Mensal
              </span>
              <span className="font-bold text-blue-600">23.4%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{width: '23.4%'}}></div>
            </div>
          </div>
        </div>

        {/* Widget Calendário */}
        <div className={`rounded-lg p-4 border ${
          isDark() 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
        }`}>
          <h4 className={`text-sm font-medium mb-3 ${
            isDark() ? 'text-gray-200' : 'text-gray-700'
          }`}>
            📅 Próximos Eventos
          </h4>
          <div className="space-y-3">
            <div className="text-sm flex justify-between">
              <span className={isDark() ? 'text-gray-300' : 'text-gray-600'}>
                Meeting Ana
              </span>
              <span className="text-blue-600 font-medium">14:00</span>
            </div>
            <div className="text-sm flex justify-between">
              <span className={isDark() ? 'text-gray-300' : 'text-gray-600'}>
                Visita T3 Cascais
              </span>
              <span className="text-green-600 font-medium">16:30</span>
            </div>
            <div className="text-sm flex justify-between">
              <span className={isDark() ? 'text-gray-300' : 'text-gray-600'}>
                Follow-up Carlos
              </span>
              <span className="text-yellow-600 font-medium">Amanhã</span>
            </div>
          </div>
        </div>

        {/* Widget Pipeline */}
        <div className={`rounded-lg p-4 border ${
          isDark() 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
        }`}>
          <h4 className={`text-sm font-medium mb-3 ${
            isDark() ? 'text-gray-200' : 'text-gray-700'
          }`}>
            🎯 Pipeline de Vendas
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className={isDark() ? 'text-gray-300' : 'text-gray-600'}>
                Oportunidades
              </span>
              <span className="font-bold">12</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={isDark() ? 'text-gray-300' : 'text-gray-600'}>
                Em negociação
              </span>
              <span className="font-bold text-yellow-600">5</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className={isDark() ? 'text-gray-300' : 'text-gray-600'}>
                Fechados este mês
              </span>
              <span className="font-bold text-green-600">3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full" style={{width: '75%'}}></div>
            </div>
          </div>
        </div>

        {/* Widget Quick Actions */}
        <div className={`rounded-lg p-4 border ${
          isDark() 
            ? 'bg-gray-700 border-gray-600' 
            : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
        }`}>
          <h4 className={`text-sm font-medium mb-3 ${
            isDark() ? 'text-gray-200' : 'text-gray-700'
          }`}>
            ⚡ Quick Actions
          </h4>
          <div className="space-y-2">
            <button className={`w-full text-left p-2 rounded text-sm transition-colors ${
              isDark() 
                ? 'bg-blue-900/50 hover:bg-blue-800/50 text-blue-200' 
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
            }`}>
              📞 Fazer chamada rápida
            </button>
            <button className={`w-full text-left p-2 rounded text-sm transition-colors ${
              isDark() 
                ? 'bg-green-900/50 hover:bg-green-800/50 text-green-200' 
                : 'bg-green-50 hover:bg-green-100 text-green-700'
            }`}>
              ✉️ Enviar email template
            </button>
            <button className={`w-full text-left p-2 rounded text-sm transition-colors ${
              isDark() 
                ? 'bg-yellow-900/50 hover:bg-yellow-800/50 text-yellow-200' 
                : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'
            }`}>
              📊 Gerar relatório rápido
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sidebar Content que ocupa toda altura
const SidebarContent = ({ 
  navigation, 
  secondaryNavigation, 
  userProfile, 
  theme, 
  isDark, 
  mobile = false,
  onClose = null 
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      navigate('/login');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`px-3 py-3 border-b flex-shrink-0 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center font-medium text-sm
              ${isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}
            `}>
              {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                MyImoMate
              </p>
              <ThemedBadge variant="primary" size="xs">
                v3.0 Otimizado
              </ThemedBadge>
            </div>
          </div>
          {mobile && onClose && (
            <button onClick={onClose} className="p-1">
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const IconComponent = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={mobile ? onClose : undefined}
              className={`
                group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors
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
              <IconComponent className={`w-4 h-4 mr-2 ${item.current ? 'text-current' : 'text-gray-400'}`} />
              <span className="flex-1 text-xs">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className={`px-2 py-3 border-t flex-shrink-0 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="space-y-1">
          {secondaryNavigation.map((item) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={mobile ? onClose : undefined}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors
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
                <IconComponent className={`w-4 h-4 mr-2 ${item.current ? 'text-current' : 'text-gray-400'}`} />
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
        </div>
        
        {/* Botão logout */}
        <button
          onClick={handleLogout}
          className={`
            w-full mt-2 flex items-center px-2 py-2 text-sm font-medium rounded-lg transition-colors
            ${isDark
              ? 'text-gray-400 hover:text-gray-200 hover:bg-red-900/50'
              : 'text-gray-600 hover:text-gray-900 hover:bg-red-50'
            }
          `}
        >
          <span className="mr-2">🚪</span>
          <span className="text-xs">Sair</span>
        </button>
      </div>
    </div>
  );
};

const DashboardLayout = ({ children, showWidgets = false }) => {
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

  // Navegação secundária
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
    // Container que OCUPA 100% DA VIEWPORT - SEM MARGEM/PADDING
    <div className="w-screen h-screen overflow-hidden flex">
      
      {/* Sidebar Desktop - Altura 100% da viewport */}
      <div className={`
        hidden lg:flex lg:flex-col lg:w-56 lg:h-full lg:flex-shrink-0
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
              fixed inset-y-0 left-0 w-56 transform transition-transform duration-200 ease-in-out
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

      {/* Área Principal - Ocupa TODO o espaço restante da viewport */}
      <div className="flex-1 flex h-full overflow-hidden">
        
        {/* Conteúdo Central - Expande para ocupar espaço disponível */}
        <div className={`flex-1 flex flex-col h-full overflow-hidden ${
          isDark() ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          
          {/* Header fixo no topo */}
          <header className={`
            z-40 border-b backdrop-blur-sm flex-shrink-0
            ${isDark() 
              ? 'bg-gray-900/95 border-gray-700' 
              : 'bg-white/95 border-gray-200'
            }
          `}>
            <div className="flex items-center justify-between h-14 px-4 sm:px-6">
              {/* Left side */}
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
                  <Bars3Icon className="w-5 h-5" />
                </button>

                <ThemedHeading 
                  level={4} 
                  className={`ml-4 lg:ml-0 text-lg ${isDark() ? 'text-white' : 'text-gray-900'}`}
                >
                  {navigation.find(item => item.current)?.name || 'Dashboard'}
                </ThemedHeading>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block">
                  <ThemeSelector compact={true} showLabel={false} />
                </div>

                <button className={`
                  relative p-2 rounded-full transition-colors
                  ${isDark() 
                    ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}>
                  <BellIcon className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* User Menu */}
                <div className="relative" id="user-menu">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`
                      flex items-center space-x-2 p-2 rounded-lg transition-colors
                      ${isDark() 
                        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <UserCircleIcon className={`w-8 h-8 ${
                      isDark() ? 'text-gray-300' : 'text-gray-600'
                    }`} />
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${
                      userMenuOpen ? 'rotate-180' : ''
                    } ${isDark() ? 'text-gray-400' : 'text-gray-500'}`} />
                  </button>

                  {/* User Dropdown */}
                  {userMenuOpen && (
                    <div className={`
                      absolute right-0 mt-2 w-72 rounded-lg shadow-lg border z-50
                      ${isDark() 
                        ? 'bg-gray-800 border-gray-700' 
                        : 'bg-white border-gray-200'
                      }
                    `}>
                      
                      {/* Informações da conta */}
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
                            <p className={`text-xs truncate ${isDark() ? 'text-gray-400' : 'text-gray-500'}`}>
                              {currentUser?.email || 'user@example.com'}
                            </p>
                            <ThemedBadge variant="primary" size="xs">
                              {userProfile?.plan || 'starter'}
                            </ThemedBadge>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
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
                          <UserCircleIcon className="w-4 h-4 mr-3" />
                          Perfil
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
                          <CogIcon className="w-4 h-4 mr-3" />
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
                          <CurrencyEuroIcon className="w-4 h-4 mr-3" />
                          Faturação
                        </Link>

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
                          <QuestionMarkCircleIcon className="w-4 h-4 mr-3" />
                          Suporte
                        </Link>

                        <div className={`border-t my-2 ${isDark() ? 'border-gray-700' : 'border-gray-100'}`}></div>

                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleLogout();
                          }}
                          className={`
                            w-full flex items-center px-4 py-2 text-sm transition-colors
                            ${isDark() 
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20' 
                              : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                            }
                          `}
                        >
                          <ArrowRightOnRectangleIcon className="w-4 h-4 mr-3" />
                          Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Conteúdo da página - Ocupa TODA altura restante */}
          <main className="flex-1 overflow-auto">
            <div className="h-full">
              {children}
            </div>
          </main>
        </div>

        {/* Widgets Sidebar - Condicional, ocupa altura total */}
        {showWidgets && (
          <WidgetSidebar className="hidden lg:flex" />
        )}
        
      </div>
    </div>
  );
};

export default DashboardLayout;