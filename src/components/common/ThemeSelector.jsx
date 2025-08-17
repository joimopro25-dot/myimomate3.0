// src/components/common/ThemeSelector.jsx

import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeSelector = ({ 
  position = 'bottom-right', 
  showLabel = true,
  compact = false 
}) => {
  const { currentTheme, changeTheme, availableThemes, isChanging } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = async (themeId) => {
    await changeTheme(themeId);
    setIsOpen(false);
  };

  const currentThemeData = availableThemes.find(t => t.id === currentTheme);

  return (
    <div className="relative">
      {/* Botão do Seletor */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200
          ${isChanging ? 'opacity-50 pointer-events-none' : ''}
          ${compact ? 'px-2 py-1' : 'px-3 py-2'}
          bg-white/90 hover:bg-white border border-gray-200 hover:border-gray-300 
          shadow-md hover:shadow-lg backdrop-blur-sm
        `}
        disabled={isChanging}
      >
        <span className={`${compact ? 'text-lg' : 'text-xl'}`}>
          {currentThemeData?.icon}
        </span>
        {showLabel && !compact && (
          <span className="text-sm font-medium text-gray-700">
            {currentThemeData?.name}
          </span>
        )}
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown de Temas */}
      {isOpen && (
        <>
          {/* Overlay para fechar */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu de temas */}
          <div className={`
            absolute z-50 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200
            ${position.includes('right') ? 'right-0' : 'left-0'}
            ${position.includes('top') ? 'bottom-full mb-2' : 'top-full mt-2'}
          `}>
            {/* Header do menu */}
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                Escolher Tema
              </h3>
              <p className="text-sm text-gray-500">
                Personalize a aparência do seu CRM
              </p>
            </div>

            {/* Lista de temas */}
            <div className="p-2 max-h-96 overflow-y-auto">
              {availableThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => handleThemeChange(theme.id)}
                  className={`
                    w-full p-3 rounded-lg transition-all duration-200 mb-1
                    flex items-center space-x-3 text-left
                    ${currentTheme === theme.id 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : 'hover:bg-gray-50 border-2 border-transparent'
                    }
                  `}
                >
                  {/* Ícone do tema */}
                  <div className="text-2xl">{theme.icon}</div>
                  
                  {/* Informações do tema */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 truncate">
                        {theme.name}
                      </h4>
                      {currentTheme === theme.id && (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {theme.description}
                    </p>
                  </div>

                  {/* Preview das cores */}
                  <div className="flex space-x-1">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: theme.colors.primary[500] }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: theme.colors.secondary[500] }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: theme.colors.accent[500] }}
                    />
                  </div>
                </button>
              ))}
            </div>

            {/* Footer com informação */}
            <div className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <p className="text-xs text-gray-500 text-center">
                O tema escolhido será salvo automaticamente
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ThemeSelector;