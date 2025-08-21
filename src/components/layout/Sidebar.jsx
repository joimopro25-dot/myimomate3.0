// src/components/layout/Sidebar.jsx
// 🎯 COMPONENTE SIDEBAR REUTILIZÁVEL
// ===================================
// MyImoMate 3.0 - Baseado exatamente no sidebar da Dashboard
// ✅ Mantém design original da DashboardPage
// ✅ Componente independente e reutilizável
// ✅ Navegação consistente para todas as páginas

import { useNavigate } from 'react-router-dom';
import { 
  BarChart3,
  Phone,
  Users, 
  Home,
  Target,
  Briefcase,
  CheckSquare,
  Calendar,
  Settings,
  Link
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  
  // Menu de navegação - EXATAMENTE igual ao da Dashboard
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, path: '/dashboard' },
    { id: 'leads', label: 'Leads', icon: Phone, path: '/leads' },
    { id: 'clients', label: 'Clientes', icon: Users, path: '/clients' },
    { id: 'visits', label: 'Visitas', icon: Home, path: '/visits' },
    { id: 'opportunities', label: 'Oportunidades', icon: Target, path: '/opportunities' },
    { id: 'deals', label: 'Negócios', icon: Briefcase, path: '/deals' },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare, path: '/tasks' },
    { id: 'calendar', label: 'Calendário', icon: Calendar, path: '/calendar' },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, path: '/reports' },
    { id: 'integrations', label: 'Integrações', icon: Link, path: '/integrations' },
    { id: 'settings', label: 'Configurações', icon: Settings, path: '/settings' },
  ];

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 shadow-sm z-10">
      <div className="p-6">
        {/* Logo e Branding - IGUAL ao Dashboard */}
        <div className="flex items-center mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg mr-3 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <div className="font-bold text-gray-900">MyImoMate</div>
            <div className="text-xs text-gray-500">CRM Imobiliário</div>
          </div>
        </div>
        
        {/* Navegação Principal - EXATO da Dashboard */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = window.location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <IconComponent className="w-4 h-4 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        {/* Status do Sistema - IGUAL ao Dashboard */}
        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium text-green-700">Sistema Online</span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Todos os módulos funcionais
          </p>
        </div>
        
        {/* Versão do Sistema - IGUAL ao Dashboard */}
        <div className="mt-4 text-center">
          <div className="text-xs text-gray-400">MyImoMate v3.0</div>
          <div className="text-xs text-gray-400">Agosto 2025</div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;