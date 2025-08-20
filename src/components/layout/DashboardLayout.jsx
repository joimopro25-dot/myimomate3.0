// src/components/layout/DashboardLayout.jsx
// Layout Otimizado - Sistema de 3 Colunas

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

// Widget Sidebar Component
const WidgetSidebar = ({ className = '' }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`w-80 bg-white border-l border-gray-200 p-4 overflow-auto ${className} ${
      isDark() ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        isDark() ? 'text-white' : 'text-gray-900'
      }`}>
        Analytics & Widgets
      </h3>
      
      {/* Widget Performance */}
      <div className={`rounded-lg p-4 mb-4 border ${
        isDark() 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
      }`}>
        <h4 className={`text-sm font-medium mb-2 ${
          isDark() ? 'text-gray-200' : 'text-gray-700'
        }`}>
          📈 Performance
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className={isDark() ? 'text-gray-300' : 'text-gray-600'}>
              Conversão
            </span>
            <span className="font-bold text-green-600">15.3%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{width: '15.3%'}}></div>
          </div>
          <div className="flex justify-between text-xs">
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
      <div className={`rounded-lg p-4 mb-4 border ${
        isDark() 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
      }`}>
        <h4 className={`text-sm font-medium mb-2 ${
          isDark() ? 'text-gray-200' : 'text-gray-700'
        }`}>
          📅 Próximos Eventos
        </h4>
        <div className="space-y-2">
          <div className="text-xs flex justify-between">
            <span className={isDark() ? 'text-gray-300' : 'text-gray-600'}>
              Meeting Ana
            </span>
            <span className="text-blue-600 font-medium">14:00</span>
          </div>
          <div className="text-xs flex justify-between">
            <span className={isDark() ? 'text-gray-300' : 'text-gray-600'}>
              Visita T3 Cascais
            </span>
            <span className="text-green-600 font-medium">16:30</span>
          </div>
          <div className="text-xs flex justify-between">
            <span className={isDark() ? 'text-gray-300' : 'text-gray-600'}>
              Follow-up Carlos
            </span>
            <span className="text-yellow-600 font-medium">Amanhã</span>
          </div>
        </div>
      </div>

      {/* Widget Pipeline */}
      <div className={`rounded-lg p-4 mb-4 border ${
        isDark() 
          ? 'bg-gray-700 border-gray-600' 
          : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
      }`}>
        <h4 className={`text-sm font-medium mb-2 ${
          isDark() ? 'text-gray-200' : 'text-gray-700'
        }`}>
          🎯 Pipeline de Vendas
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className={isDark() ? 'text-gray-300' : 'text-gray-600'}>
              Oportunidades
            </span>
            <span className="font-bold">12</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className={isDark() ? 'text-gray-300' : 'text-gray-600'}>
              Em negociação
            </span>
            <span className="font-bold text-yellow-600">5</span>
          </div>
          <div className="flex justify-between text-xs">
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
        <h4 className={`text-sm font-medium mb-2 ${
          isDark() ? 'text-gray-200' : 'text-gray-700'
        }`}>
          ⚡ Quick Actions
        </h4>
        <div className="space-y-2">
          <button className={`w-full text-left p-2 rounded text-xs transition-colors ${
            isDark() 
              ? 'bg-blue-900/50 hover:bg-blue-800/50 text-blue-200' 
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
          }`}>
            📞 Fazer chamada rápida
          </button>
          <button className={`w-full text-left p-2 rounded text-xs transition-colors ${
            isDark() 
              ? 'bg-green-900/50 hover:bg-green-800/50 text-green-200' 
              : 'bg-green-50 hover:bg-green-100 text-green-700'
          }`}>
            ✉️ Enviar email template
          </button>
          <button className={`w-full text-left p-2 rounded text-xs transition-colors ${
            isDark() 
              ? 'bg-yellow-900/50 hover:bg-yellow-800/50 text-yellow-200' 
              : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'
          }`}>
            📊 Gerar relatório rápido
          </button>
        </div>
      </div>
    </div>
  );
};

// Sidebar Content Component (mais compacta)
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
      {/* Header compacto */}
      <div className={`px-3 py-3 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
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

      {/* Navigation compacta */}
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

      {/* Secondary Navigation compacta */}
      <div className={`px-2 py-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
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
        
        {/* Botão logout compacto */}
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
        {/* Sidebar Desktop - Mais compacta (w-56 em vez de w-64) */}
        <div className={`
          hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0
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

        {/* Layout 3 Colunas: Conteúdo Principal + Widgets */}
        <div className={`flex-1 flex overflow-hidden ${showWidgets ? 'lg:ml-56' : 'lg:ml-56'}`}>
          
          {/* Coluna Central - Conteúdo Principal */}
          <div className={`flex-1 bg-gray-50 overflow-auto ${
            isDark() ? 'bg-gray-900' : 'bg-gray-50'
          }`}>
            {/* Header compacto */}
            <header className={`
              sticky top-0 z-40 border-b backdrop-blur-sm
              ${isDark() 
                ? 'bg-gray-900/95 border-gray-700' 
                : 'bg-white/95 border-gray-200'
              }
            `}>
              <div className="flex items-center justify-between h-14 px-4 sm:px-6">
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
                    <Bars3Icon className="w-5 h-5" />
                  </button>

                  {/* Page title compacto */}
                  <ThemedHeading 
                    level={4} 
                    className={`ml-4 lg:ml-0 text-lg ${isDark() ? 'text-white' : 'text-gray-900'}`}
                  >
                    {navigation.find(item => item.current)?.name || 'Dashboard'}
                  </ThemedHeading>
                </div>

                {/* Right side - Actions compactas */}
                <div className="flex items-center space-x-3">
                  {/* Theme Selector compacto */}
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
                    <BellIcon className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      3
                    </span>
                  </button>

                  {/* User avatar compacto */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isDark() 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-blue-500 text-white'
                    }
                  `}>
                    {userProfile?.name?.charAt(0)?.toUpperCase() || currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                </div>
              </div>
            </header>

            {/* Conteúdo da página */}
            <main className="p-4">
              {children}
            </main>
          </div>

          {/* Coluna Direita - Widgets (condicional) */}
          {showWidgets && (
            <WidgetSidebar className="hidden lg:block" />
          )}
          
        </div>
      </div>
    </ThemedContainer>
  );
};

export default DashboardLayout;