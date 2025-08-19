import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  HomeIcon,
  UserGroupIcon,
  UsersIcon,
  EyeIcon,
  BriefcaseIcon,
  CurrencyEuroIcon,
  CheckSquareIcon,
  CalendarIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  UserCircleIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

const ResponsiveLayout = ({ children, title, actions }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { currentUser, logout } = useAuth();
  const { currentTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Detectar tamanho da tela
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false); // Fechar sidebar mobile em desktop
      }
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Menu de navegação
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, current: location.pathname === '/dashboard' },
    { name: 'Leads', href: '/leads', icon: UserGroupIcon, current: location.pathname.startsWith('/leads') },
    { name: 'Clientes', href: '/clients', icon: UsersIcon, current: location.pathname.startsWith('/clients') },
    { name: 'Visitas', href: '/visits', icon: EyeIcon, current: location.pathname.startsWith('/visits') },
    { name: 'Oportunidades', href: '/opportunities', icon: BriefcaseIcon, current: location.pathname.startsWith('/opportunities') },
    { name: 'Negócios', href: '/deals', icon: CurrencyEuroIcon, current: location.pathname.startsWith('/deals') },
    { name: 'Tarefas', href: '/tasks', icon: CheckSquareIcon, current: location.pathname.startsWith('/tasks') },
    { name: 'Calendário', href: '/calendar', icon: CalendarIcon, current: location.pathname.startsWith('/calendar') },
    { name: 'Relatórios', href: '/reports', icon: ChartBarIcon, current: location.pathname.startsWith('/reports') },
    { name: 'Configurações', href: '/settings', icon: CogIcon, current: location.pathname.startsWith('/settings') },
  ];

  const handleNavigation = (href) => {
    navigate(href);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Sidebar Component
  const Sidebar = ({ mobile = false }) => (
    <div className={`
      ${mobile ? 'lg:hidden' : 'hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0'}
      ${mobile ? 'relative' : ''}
    `}>
      <div style={{ backgroundColor: currentTheme.sidebar.background }} 
           className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto border-r border-gray-200">
        
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <div className="flex items-center">
            <div style={{ backgroundColor: currentTheme.primary.main }} 
                 className="w-8 h-8 rounded-lg flex items-center justify-center">
              <HomeIcon className="w-5 h-5 text-white" />
            </div>
            <span style={{ color: currentTheme.text.primary }} 
                  className="ml-2 text-xl font-bold">
              MyImoMate
            </span>
          </div>
        </div>

        {/* Navegação */}
        <nav className="mt-8 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = item.current;
            return (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left transition-colors duration-200
                  ${isActive 
                    ? `text-white` 
                    : `hover:bg-opacity-75`
                  }
                `}
                style={{
                  backgroundColor: isActive ? currentTheme.primary.main : 'transparent',
                  color: isActive ? 'white' : currentTheme.text.secondary
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = currentTheme.sidebar.hover;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
                {!isMobile && (
                  <ChevronRightIcon className={`ml-auto h-4 w-4 transition-transform duration-200 ${isActive ? 'rotate-90' : ''}`} />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center w-full">
            <UserCircleIcon style={{ color: currentTheme.text.secondary }} className="w-8 h-8" />
            <div className="ml-3 flex-1">
              <p style={{ color: currentTheme.text.primary }} className="text-sm font-medium">
                {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Utilizador'}
              </p>
              <button
                onClick={handleLogout}
                style={{ color: currentTheme.text.secondary }}
                className="text-xs hover:underline"
              >
                Terminar sessão
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: currentTheme.background.secondary }}>
      
      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <XMarkIcon className="h-6 w-6 text-white" />
              </button>
            </div>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`flex flex-col w-0 flex-1 overflow-hidden ${!isMobile ? 'lg:pl-64' : ''}`}>
        
        {/* Header */}
        <div style={{ backgroundColor: currentTheme.background.primary }} 
             className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow border-b border-gray-200">
          
          {/* Mobile menu button */}
          {isMobile && (
            <button
              className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          )}

          {/* Header content */}
          <div className="flex-1 px-4 flex justify-between items-center sm:px-6 lg:px-8">
            
            {/* Título da página */}
            <div className="flex-1">
              <h1 style={{ color: currentTheme.text.primary }} 
                  className="text-2xl font-semibold">
                {title || 'Dashboard'}
              </h1>
            </div>

            {/* Actions do header */}
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              
              {/* Notificações */}
              <button style={{ color: currentTheme.text.secondary }}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <BellIcon className="h-6 w-6" />
              </button>

              {/* Ações customizadas */}
              {actions && (
                <div className="flex items-center space-x-2">
                  {actions}
                </div>
              )}

              {/* Avatar do usuário */}
              <div className="relative">
                <button className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <UserCircleIcon style={{ color: currentTheme.text.secondary }} className="h-8 w-8" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Content container com margens responsivas */}
              <div className="w-full">
                {children}
              </div>
              
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResponsiveLayout;