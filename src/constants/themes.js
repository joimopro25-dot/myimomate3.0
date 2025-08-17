// src/constants/themes.js

export const THEMES = {
  corporate: {
    id: 'corporate',
    name: 'Corporate',
    description: 'Profissional e minimalista',
    icon: '🏢',
    colors: {
      // Cores principais
      primary: {
        50: '#eff6ff',
        100: '#dbeafe', 
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#1e40af', // Azul principal
        600: '#1e3a8a',
        700: '#1e3a8a',
        800: '#1e3a8a',
        900: '#1e3a8a'
      },
      secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b', // Cinza profissional
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a'
      },
      accent: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316', // Laranja discreto
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12'
      }
    },
    gradients: {
      primary: 'from-blue-800 to-blue-900',
      secondary: 'from-gray-50 to-gray-100',
      accent: 'from-orange-400 to-orange-500'
    },
    typography: {
      fontFamily: 'Inter, system-ui, sans-serif',
      headingWeight: 'font-semibold',
      bodyWeight: 'font-normal',
      sizes: {
        xs: 'text-xs',
        sm: 'text-sm', 
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl'
      }
    },
    components: {
      button: {
        primary: 'bg-blue-800 hover:bg-blue-900 text-white shadow-md',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
        accent: 'bg-orange-500 hover:bg-orange-600 text-white'
      },
      card: 'bg-white border border-gray-200 shadow-sm',
      input: 'border-gray-300 focus:border-blue-800 focus:ring-blue-800'
    }
  },

  milionario: {
    id: 'milionario',
    name: 'Milionário',
    description: 'Luxuoso e premium',
    icon: '💎',
    colors: {
      primary: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#d4af37', // Dourado luxo
        600: '#b8860b',
        700: '#9a7209',
        800: '#7c5f07',
        900: '#654f05'
      },
      secondary: {
        50: '#fafafa',
        100: '#f4f4f5',
        200: '#e4e4e7',
        300: '#d4d4d8',
        400: '#a1a1aa',
        500: '#18181b', // Preto elegante
        600: '#000000',
        700: '#000000',
        800: '#000000',
        900: '#000000'
      },
      accent: {
        50: '#fdf4f3',
        100: '#fce7e5',
        200: '#f9cfcc',
        300: '#f4a8a0',
        400: '#ec7c6c',
        500: '#dc2626', // Vermelho luxo
        600: '#b91c1c',
        700: '#991b1b',
        800: '#7f1d1d',
        900: '#701a1a'
      }
    },
    gradients: {
      primary: 'from-yellow-400 via-yellow-500 to-yellow-600',
      secondary: 'from-black to-gray-900',
      accent: 'from-red-600 to-red-700'
    },
    typography: {
      fontFamily: 'Playfair Display, Georgia, serif',
      headingWeight: 'font-bold',
      bodyWeight: 'font-normal',
      sizes: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base', 
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl'
      }
    },
    components: {
      button: {
        primary: 'bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-black shadow-xl',
        secondary: 'bg-black hover:bg-gray-900 text-yellow-400 border border-yellow-400',
        accent: 'bg-red-600 hover:bg-red-700 text-white shadow-xl'
      },
      card: 'bg-gradient-to-br from-black to-gray-900 border border-yellow-400/20 shadow-2xl',
      input: 'border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500 bg-black text-yellow-100'
    }
  },

  fun: {
    id: 'fun',
    name: 'Fun',
    description: 'Vibrante e divertido',
    icon: '🌈',
    colors: {
      primary: {
        50: '#fdf2f8',
        100: '#fce7f3',
        200: '#fbcfe8', 
        300: '#f9a8d4',
        400: '#f472b6',
        500: '#ec4899', // Rosa vibrante
        600: '#db2777',
        700: '#be185d',
        800: '#9d174d',
        900: '#831843'
      },
      secondary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        300: '#7dd3fc',
        400: '#38bdf8',
        500: '#0ea5e9', // Azul cyan
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e'
      },
      accent: {
        50: '#f7fee7',
        100: '#ecfccb',
        200: '#d9f99d',
        300: '#bef264',
        400: '#a3e635',
        500: '#84cc16', // Verde lime
        600: '#65a30d',
        700: '#4d7c0f',
        800: '#365314',
        900: '#1a2e05'
      }
    },
    gradients: {
      primary: 'from-pink-500 via-purple-500 to-indigo-500',
      secondary: 'from-cyan-400 to-blue-500',
      accent: 'from-green-400 to-lime-500'
    },
    typography: {
      fontFamily: 'Poppins, system-ui, sans-serif',
      headingWeight: 'font-bold',
      bodyWeight: 'font-medium',
      sizes: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg', 
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl'
      }
    },
    components: {
      button: {
        primary: 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-lg transform hover:scale-105',
        secondary: 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white',
        accent: 'bg-gradient-to-r from-green-400 to-lime-500 hover:from-green-500 hover:to-lime-600 text-white'
      },
      card: 'bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-purple-200 shadow-lg',
      input: 'border-purple-300 focus:border-pink-500 focus:ring-pink-500'
    }
  },

  casual: {
    id: 'casual',
    name: 'Casual',
    description: 'Acolhedor e orgânico',
    icon: '☕',
    colors: {
      primary: {
        50: '#f9f7ff',
        100: '#f3f0ff',
        200: '#e9e5ff',
        300: '#d6cdff', 
        400: '#b8a9ff',
        500: '#8b7355', // Marrom terroso
        600: '#7c6644',
        700: '#6d5933',
        800: '#5e4c22',
        900: '#4f3f11'
      },
      secondary: {
        50: '#f6f7f0',
        100: '#eaede1',
        200: '#d4dbc4',
        300: '#b7c5a0',
        400: '#96ad78',
        500: '#7a9655', // Verde natural
        600: '#627b44',
        700: '#4f6135',
        800: '#3f4d2a',
        900: '#333f22'
      },
      accent: {
        50: '#fff8ed',
        100: '#ffeed4',
        200: '#fed9a8',
        300: '#fdc071',
        400: '#fb9d38',
        500: '#f97316', // Laranja terra
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12'
      }
    },
    gradients: {
      primary: 'from-amber-100 to-amber-200',
      secondary: 'from-green-100 to-green-200', 
      accent: 'from-orange-100 to-orange-200'
    },
    typography: {
      fontFamily: 'Merriweather, Georgia, serif',
      headingWeight: 'font-semibold',
      bodyWeight: 'font-normal',
      sizes: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl'
      }
    },
    components: {
      button: {
        primary: 'bg-amber-600 hover:bg-amber-700 text-white shadow-md',
        secondary: 'bg-green-100 hover:bg-green-200 text-green-800',
        accent: 'bg-orange-500 hover:bg-orange-600 text-white'
      },
      card: 'bg-amber-50 border border-amber-200 shadow-sm',
      input: 'border-amber-300 focus:border-amber-500 focus:ring-amber-500'
    }
  },

  feminino: {
    id: 'feminino', 
    name: 'Feminino',
    description: 'Elegante e sofisticado',
    icon: '💖',
    colors: {
      primary: {
        50: '#fdf2f8',
        100: '#fce7f3',
        200: '#fbcfe8',
        300: '#f9a8d4',
        400: '#f472b6',
        500: '#ec4899', // Rosa elegante
        600: '#db2777',
        700: '#be185d',
        800: '#9d174d',
        900: '#831843'
      },
      secondary: {
        50: '#faf5ff',
        100: '#f3e8ff',
        200: '#e9d5ff',
        300: '#d8b4fe',
        400: '#c084fc',
        500: '#a855f7', // Roxo sofisticado
        600: '#9333ea',
        700: '#7c3aed',
        800: '#6b21a8',
        900: '#581c87'
      },
      accent: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b', // Dourado suave
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f'
      }
    },
    gradients: {
      primary: 'from-pink-400 to-pink-600',
      secondary: 'from-purple-400 to-purple-600',
      accent: 'from-yellow-300 to-yellow-500'
    },
    typography: {
      fontFamily: 'Dancing Script, cursive',
      headingWeight: 'font-semibold',
      bodyWeight: 'font-normal',
      sizes: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl'
      }
    },
    components: {
      button: {
        primary: 'bg-gradient-to-r from-pink-400 to-pink-600 hover:from-pink-500 hover:to-pink-700 text-white shadow-lg',
        secondary: 'bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white',
        accent: 'bg-gradient-to-r from-yellow-300 to-yellow-500 hover:from-yellow-400 hover:to-yellow-600 text-gray-900'
      },
      card: 'bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 shadow-lg',
      input: 'border-pink-300 focus:border-pink-500 focus:ring-pink-500'
    }
  },

  masculino: {
    id: 'masculino',
    name: 'Masculino', 
    description: 'Forte e contrastante',
    icon: '⚡',
    colors: {
      primary: {
        50: '#fafafa',
        100: '#f4f4f5',
        200: '#e4e4e7',
        300: '#d4d4d8',
        400: '#a1a1aa',
        500: '#18181b', // Preto forte
        600: '#000000',
        700: '#000000',
        800: '#000000',
        900: '#000000'
      },
      secondary: {
        50: '#fff7ed',
        100: '#ffedd5',
        200: '#fed7aa',
        300: '#fdba74',
        400: '#fb923c',
        500: '#f97316', // Laranja vibrante
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
        900: '#7c2d12'
      },
      accent: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444', // Vermelho intenso
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d'
      }
    },
    gradients: {
      primary: 'from-black to-gray-900',
      secondary: 'from-orange-500 to-orange-700',
      accent: 'from-red-500 to-red-700'
    },
    typography: {
      fontFamily: 'Oswald, Impact, sans-serif',
      headingWeight: 'font-bold',
      bodyWeight: 'font-semibold',
      sizes: {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
        '4xl': 'text-4xl'
      }
    },
    components: {
      button: {
        primary: 'bg-black hover:bg-gray-900 text-white shadow-xl border-2 border-orange-500',
        secondary: 'bg-orange-500 hover:bg-orange-600 text-white font-bold',
        accent: 'bg-red-500 hover:bg-red-600 text-white font-bold shadow-xl'
      },
      card: 'bg-gray-900 border-2 border-orange-500 shadow-2xl',
      input: 'border-orange-500 focus:border-red-500 focus:ring-red-500 bg-black text-white'
    }
  }
};

export const getTheme = (themeId) => {
  return THEMES[themeId] || THEMES.corporate;
};

export const getThemesList = () => {
  return Object.values(THEMES);
};