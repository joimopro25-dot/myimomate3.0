// src/contexts/ThemeContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { THEMES, getTheme } from '../constants/themes';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('corporate');
  const [isChanging, setIsChanging] = useState(false);

  // Carregar tema salvo do localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('myimomate-theme');
    if (savedTheme && THEMES[savedTheme]) {
      setCurrentTheme(savedTheme);
    }
  }, []);

  // Aplicar fontes do Google Fonts dinamicamente
  useEffect(() => {
    const theme = getTheme(currentTheme);
    const fontFamily = theme.typography.fontFamily;
    
    // Remover link anterior se existir
    const existingLink = document.getElementById('theme-font');
    if (existingLink) {
      existingLink.remove();
    }

    // Adicionar nova fonte se necessário
    if (fontFamily.includes('Playfair Display')) {
      const link = document.createElement('link');
      link.id = 'theme-font';
      link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    } else if (fontFamily.includes('Poppins')) {
      const link = document.createElement('link');
      link.id = 'theme-font';
      link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    } else if (fontFamily.includes('Merriweather')) {
      const link = document.createElement('link');
      link.id = 'theme-font';
      link.href = 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    } else if (fontFamily.includes('Dancing Script')) {
      const link = document.createElement('link');
      link.id = 'theme-font';
      link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    } else if (fontFamily.includes('Oswald')) {
      const link = document.createElement('link');
      link.id = 'theme-font';
      link.href = 'https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [currentTheme]);

  const changeTheme = async (themeId) => {
    if (themeId === currentTheme) return;
    
    setIsChanging(true);
    
    // Pequena animação de transição
    await new Promise(resolve => setTimeout(resolve, 150));
    
    setCurrentTheme(themeId);
    localStorage.setItem('myimomate-theme', themeId);
    
    // Finalizar transição
    setTimeout(() => setIsChanging(false), 150);
  };

  const theme = getTheme(currentTheme);

  const value = {
    // Estado atual
    currentTheme,
    theme,
    isChanging,
    
    // Ações
    changeTheme,
    
    // Helpers
    getThemeColor: (colorPath) => {
      const paths = colorPath.split('.');
      let color = theme.colors;
      
      for (const path of paths) {
        color = color[path];
        if (!color) return '#000000';
      }
      
      return color;
    },
    
    getThemeClass: (component, variant = 'primary') => {
      return theme.components[component]?.[variant] || '';
    },
    
    // Lista de temas disponíveis
    availableThemes: Object.values(THEMES),
    
    // Verificar se é tema dark
    isDark: () => {
      return ['milionario', 'masculino'].includes(currentTheme);
    },
    
    // Aplicar estilo de fonte
    getFontStyle: () => {
      return {
        fontFamily: theme.typography.fontFamily
      };
    }
  };

  return (
    <ThemeContext.Provider value={value}>
      <div 
        className={`theme-${currentTheme} ${isChanging ? 'theme-changing' : ''}`}
        style={{
          fontFamily: theme.typography.fontFamily,
          transition: isChanging ? 'all 0.3s ease-in-out' : 'none'
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
};