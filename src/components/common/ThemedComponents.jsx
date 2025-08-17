// src/components/common/ThemedComponents.jsx

import { useTheme } from '../../contexts/ThemeContext';

// Botão Temático
export const ThemedButton = ({ 
  variant = 'primary', 
  size = 'md',
  children, 
  className = '',
  ...props 
}) => {
  const { getThemeClass } = useTheme();
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl'
  };

  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const themeClasses = getThemeClass('button', variant);

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${themeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Card Temático
export const ThemedCard = ({ 
  children, 
  className = '',
  padding = 'p-6',
  ...props 
}) => {
  const { getThemeClass } = useTheme();
  
  const baseClasses = 'rounded-xl transition-all duration-200';
  const themeClasses = getThemeClass('card');

  return (
    <div 
      className={`${baseClasses} ${themeClasses} ${padding} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Input Temático
export const ThemedInput = ({ 
  label,
  error,
  className = '',
  ...props 
}) => {
  const { getThemeClass, theme } = useTheme();
  
  const baseClasses = `
    block w-full rounded-lg px-3 py-2 text-base
    placeholder-gray-400 transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `;
  
  const themeClasses = getThemeClass('input');

  return (
    <div className="space-y-1">
      {label && (
        <label 
          className={`block text-sm ${theme.typography.headingWeight} text-gray-700`}
          style={{ fontFamily: theme.typography.fontFamily }}
        >
          {label}
        </label>
      )}
      <input
        className={`${baseClasses} ${themeClasses} ${className} ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
        }`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

// Título Temático
export const ThemedHeading = ({ 
  level = 1, 
  children, 
  className = '',
  ...props 
}) => {
  const { theme } = useTheme();
  
  const baseClasses = `${theme.typography.headingWeight} text-gray-900`;
  const levelClasses = {
    1: theme.typography.sizes['4xl'],
    2: theme.typography.sizes['3xl'],
    3: theme.typography.sizes['2xl'],
    4: theme.typography.sizes.xl,
    5: theme.typography.sizes.lg,
    6: theme.typography.sizes.base
  };

  const Component = `h${level}`;

  return (
    <Component
      className={`${baseClasses} ${levelClasses[level]} ${className}`}
      style={{ fontFamily: theme.typography.fontFamily }}
      {...props}
    >
      {children}
    </Component>
  );
};

// Texto Temático
export const ThemedText = ({ 
  size = 'base',
  weight = 'normal',
  children, 
  className = '',
  ...props 
}) => {
  const { theme } = useTheme();
  
  const weightClasses = {
    light: 'font-light',
    normal: theme.typography.bodyWeight,
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold'
  };

  return (
    <p
      className={`${theme.typography.sizes[size]} ${weightClasses[weight]} text-gray-700 ${className}`}
      style={{ fontFamily: theme.typography.fontFamily }}
      {...props}
    >
      {children}
    </p>
  );
};

// Container com Gradiente Temático
export const ThemedGradient = ({ 
  type = 'primary',
  children,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();
  
  const gradientClass = `bg-gradient-to-r ${theme.gradients[type]}`;

  return (
    <div 
      className={`${gradientClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Badge Temático
export const ThemedBadge = ({ 
  variant = 'primary',
  size = 'sm',
  children,
  className = '',
  ...props
}) => {
  const { getThemeColor, theme } = useTheme();
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-3 py-2 text-base'
  };

  const variantStyles = {
    primary: {
      backgroundColor: getThemeColor('primary.100'),
      color: getThemeColor('primary.800'),
      border: `1px solid ${getThemeColor('primary.200')}`
    },
    secondary: {
      backgroundColor: getThemeColor('secondary.100'),
      color: getThemeColor('secondary.800'),
      border: `1px solid ${getThemeColor('secondary.200')}`
    },
    accent: {
      backgroundColor: getThemeColor('accent.100'),
      color: getThemeColor('accent.800'),
      border: `1px solid ${getThemeColor('accent.200')}`
    }
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${sizeClasses[size]} ${className}
      `}
      style={{
        ...variantStyles[variant],
        fontFamily: theme.typography.fontFamily
      }}
      {...props}
    >
      {children}
    </span>
  );
};

// Container Principal Temático
export const ThemedContainer = ({ 
  children,
  className = '',
  background = true,
  ...props
}) => {
  const { theme, isDark } = useTheme();
  
  const bgClass = background 
    ? isDark() 
      ? 'bg-gray-900 text-white' 
      : 'bg-gray-50 text-gray-900'
    : '';

  return (
    <div 
      className={`min-h-screen transition-colors duration-300 ${bgClass} ${className}`}
      style={{ fontFamily: theme.typography.fontFamily }}
      {...props}
    >
      {children}
    </div>
  );
};