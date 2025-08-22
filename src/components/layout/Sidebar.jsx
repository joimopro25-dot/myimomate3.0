// src/components/layout/Sidebar.jsx
// 🎯 COMPONENTE SIDEBAR REUTILIZÁVEL - ELIMINA DUPLICAÇÃO DE CÓDIGO
// ===================================================================
// MyImoMate 3.0 - Baseado na estrutura das páginas existentes
// ✅ Compatível com Hero Icons (usado no projeto)
// ✅ Integração com sistema de temas
// ✅ Navegação consistente
// ✅ Estado ativo automático
// ✅ Design profissional
// ✅ Mobile responsivo

import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
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
  LinkIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark } = useTheme();
  const { userProfile } = useAuth();
  
  // Menu de navegação principal - usando Hero Icons
  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: HomeIcon, 
      path: '/dashboard',
      description: 'Visão geral do sistema'
    },
    { 
      id: 'leads', 
      label: 'Leads', 
      icon: UserGroupIcon, 
      path: '/leads',
      description: 'Gestão de leads'
    },
    { 
      id: 'clients', 
      label: 'Clientes', 
      icon: UsersIcon, 
      path: '/clients',
      description: 'Base de clientes'
    },
    { 
      id: 'visits', 
      label: 'Visitas', 
      icon: EyeIcon, 
      path: '/visits',
      description: 'Agendamento de visitas'
    },
    { 
      id: 'opportunities', 
      label: 'Oportunidades', 
      icon: BriefcaseIcon, 
      path: '/opportunities',
      description: 'Pipeline de vendas'
    },
    { 
      id: 'deals', 
      label: 'Negócios', 
      icon: CurrencyEuroIcon, 
      path: '/deals',
      description: 'Gestão de negócios'
    },
    { 
      id: 'tasks', 
      label: 'Tarefas', 
      icon: CheckIcon, 
      path: '/tasks',
      description: 'Sistema de tarefas'
    },
    { 
      id: 'calendar', 
      label: 'Calendário', 
      icon: CalendarIcon, 
      path: '/calendar',
      description: 'Agenda e eventos'
    }
  ];

  // Menu secundário
  const secondaryItems = [
    { 
      id: 'reports', 
      label: 'Relatórios', 
      icon: ChartBarIcon, 
      path: '/reports',
      description: 'Analytics e relatórios'
    },
    { 
      id: 'integrations', 
      label: 'Integrações', 
      icon: LinkIcon, 
      path: '/integrations',
      description: 'APIs e integrações'
    },
    { 
      id: 'configurations', 
      label: 'Configurações', 
      icon: CogIcon, 
      path: '/configurations',
      description: 'Configurações do sistema'
    },
    { 
      id: 'support', 
      label: 'Suporte', 
      icon: QuestionMarkCircleIcon, 
      path: '/support',
      description: 'Centro de suporte'
    }
  ];

  // Função para verificar se item está ativo
  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  // Função de navegação
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className={`
      w-64 h-full flex flex-col border-r shadow-sm
      ${isDark() 
        ? 'bg-gray-900 border-gray-700' 
        : 'bg-white border-gray-200'
      }
      ${className}
    `}>
      {/* Header da Sidebar */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <div className={`font-bold text-lg ${
              isDark() ? 'text-white' : 'text-gray-900'
            }`}>
              MyImoMate
            </div>
            <div className={`text-xs ${
              isDark() ? 'text-gray-400' : 'text-gray-500'
            }`}>
              CRM Imobiliário
            </div>
          </div>
        </div>
      </div>
      
      {/* Navegação Principal */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-4 py-4 space-y-1">
          {/* Seção Principal */}
          <div className="mb-6">
            <div className={`px-2 mb-2 text-xs font-semibold uppercase tracking-wide ${
              isDark() ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Principal
            </div>
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${active 
                      ? (isDark() 
                          ? 'bg-blue-600 text-white border-l-2 border-blue-400' 
                          : 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                        )
                      : (isDark() 
                          ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        )
                    }
                  `}
                  title={item.description}
                >
                  <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {active && (
                    <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Seção Secundária */}
          <div>
            <div className={`px-2 mb-2 text-xs font-semibold uppercase tracking-wide ${
              isDark() ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Ferramentas
            </div>
            {secondaryItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${active 
                      ? (isDark() 
                          ? 'bg-blue-600 text-white border-l-2 border-blue-400' 
                          : 'bg-blue-50 text-blue-700 border-l-2 border-blue-700'
                        )
                      : (isDark() 
                          ? 'text-gray-300 hover:text-white hover:bg-gray-800' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        )
                    }
                  `}
                  title={item.description}
                >
                  <IconComponent className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {active && (
                    <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
      
      {/* Footer da Sidebar */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {/* Status do Sistema */}
        <div className={`p-3 rounded-lg mb-3 ${
          isDark() 
            ? 'bg-green-900/30 border border-green-700' 
            : 'bg-green-50 border border-green-200'
        }`}>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className={`text-sm font-medium ${
              isDark() ? 'text-green-400' : 'text-green-700'
            }`}>
              Sistema Online
            </span>
          </div>
          <p className={`text-xs mt-1 ${
            isDark() ? 'text-green-300' : 'text-green-600'
          }`}>
            Todos os módulos funcionais
          </p>
        </div>
        
        {/* Informações do Utilizador */}
        {userProfile && (
          <div className={`text-center text-xs ${
            isDark() ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <div className="font-medium">{userProfile.name || 'Utilizador'}</div>
            <div className="mt-1">{userProfile.company || 'MyImoMate'}</div>
          </div>
        )}
        
        {/* Versão */}
        <div className={`text-center mt-2 text-xs ${
          isDark() ? 'text-gray-500' : 'text-gray-400'
        }`}>
          <div>MyImoMate v3.0</div>
          <div>Agosto 2025</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;