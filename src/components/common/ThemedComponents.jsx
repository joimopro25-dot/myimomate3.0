// src/components/common/ThemedComponents.jsx
// MyImoMate 3.0 - Sistema de Design Profissional
// Componentes com cores sólidas pastéis modernas e visual empresarial

import { useTheme } from '../../contexts/ThemeContext';

// 🎨 PALETAS DE CORES PASTÉIS PROFISSIONAIS
const MODERN_COLORS = {
  // Cores sólidas pastéis por tema
  solids: {
    modern: {
      primary: 'bg-emerald-50 border-emerald-200',
      primaryText: 'text-emerald-800',
      secondary: 'bg-slate-50 border-slate-200', 
      secondaryText: 'text-slate-700',
      accent: 'bg-sky-100 border-sky-300',
      accentText: 'text-sky-800',
      success: 'bg-green-50 border-green-200',
      successText: 'text-green-800',
      warning: 'bg-amber-50 border-amber-200',
      warningText: 'text-amber-800',
      danger: 'bg-rose-50 border-rose-200',
      dangerText: 'text-rose-800',
      info: 'bg-blue-50 border-blue-200',
      infoText: 'text-blue-800'
    },
    dark: {
      primary: 'bg-slate-800 border-slate-700',
      primaryText: 'text-slate-100',
      secondary: 'bg-gray-800 border-gray-700',
      secondaryText: 'text-gray-200',
      accent: 'bg-indigo-900 border-indigo-700',
      accentText: 'text-indigo-200',
      success: 'bg-green-900 border-green-700',
      successText: 'text-green-200',
      warning: 'bg-yellow-900 border-yellow-700',
      warningText: 'text-yellow-200',
      danger: 'bg-red-900 border-red-700',
      dangerText: 'text-red-200',
      info: 'bg-blue-900 border-blue-700',
      infoText: 'text-blue-200'
    },
    light: {
      primary: 'bg-gray-50 border-gray-200',
      primaryText: 'text-gray-800',
      secondary: 'bg-white border-gray-200',
      secondaryText: 'text-gray-700',
      accent: 'bg-blue-50 border-blue-200',
      accentText: 'text-blue-800',
      success: 'bg-emerald-50 border-emerald-200',
      successText: 'text-emerald-800',
      warning: 'bg-orange-50 border-orange-200',
      warningText: 'text-orange-800',
      danger: 'bg-red-50 border-red-200',
      dangerText: 'text-red-800',
      info: 'bg-sky-50 border-sky-200',
      infoText: 'text-sky-800'
    },
    corporate: {
      primary: 'bg-blue-50 border-blue-200',
      primaryText: 'text-blue-900',
      secondary: 'bg-slate-50 border-slate-200',
      secondaryText: 'text-slate-800',
      accent: 'bg-indigo-50 border-indigo-200',
      accentText: 'text-indigo-900',
      success: 'bg-teal-50 border-teal-200',
      successText: 'text-teal-800',
      warning: 'bg-amber-50 border-amber-200',
      warningText: 'text-amber-800',
      danger: 'bg-red-50 border-red-200',
      dangerText: 'text-red-800',
      info: 'bg-cyan-50 border-cyan-200',
      infoText: 'text-cyan-800'
    },
    minimal: {
      primary: 'bg-gray-100 border-gray-300',
      primaryText: 'text-gray-800',
      secondary: 'bg-white border-gray-200',
      secondaryText: 'text-gray-700',
      accent: 'bg-slate-100 border-slate-300',
      accentText: 'text-slate-800',
      success: 'bg-green-100 border-green-300',
      successText: 'text-green-800',
      warning: 'bg-yellow-100 border-yellow-300',
      warningText: 'text-yellow-800',
      danger: 'bg-red-100 border-red-300',
      dangerText: 'text-red-800',
      info: 'bg-blue-100 border-blue-300',
      infoText: 'text-blue-800'
    },
    vibrant: {
      primary: 'bg-purple-100 border-purple-300',
      primaryText: 'text-purple-900',
      secondary: 'bg-gray-100 border-gray-300',
      secondaryText: 'text-gray-800',
      accent: 'bg-pink-100 border-pink-300',
      accentText: 'text-pink-900',
      success: 'bg-lime-100 border-lime-300',
      successText: 'text-lime-800',
      warning: 'bg-orange-100 border-orange-300',
      warningText: 'text-orange-800',
      danger: 'bg-rose-100 border-rose-300',
      dangerText: 'text-rose-800',
      info: 'bg-sky-100 border-sky-300',
      infoText: 'text-sky-800'
    }
  },

  // Sombras suaves e profissionais
  shadows: {
    sm: 'shadow-sm hover:shadow-md',
    md: 'shadow-md hover:shadow-lg',
    lg: 'shadow-lg hover:shadow-xl',
    xl: 'shadow-xl hover:shadow-2xl',
    subtle: 'shadow-sm shadow-gray-200/50 hover:shadow-md hover:shadow-gray-300/50',
    colored: {
      emerald: 'shadow-sm shadow-emerald-200/30 hover:shadow-md hover:shadow-emerald-300/40',
      blue: 'shadow-sm shadow-blue-200/30 hover:shadow-md hover:shadow-blue-300/40',
      slate: 'shadow-sm shadow-slate-200/30 hover:shadow-md hover:shadow-slate-300/40',
      rose: 'shadow-sm shadow-rose-200/30 hover:shadow-md hover:shadow-rose-300/40',
      amber: 'shadow-sm shadow-amber-200/30 hover:shadow-md hover:shadow-amber-300/40'
    }
  },

  // Glassmorphism suave
  glass: {
    light: 'bg-white/90 backdrop-blur-sm border border-white/40',
    dark: 'bg-gray-900/80 backdrop-blur-sm border border-gray-700/40',
    colored: 'bg-white/95 backdrop-blur-sm border border-gray-200/60'
  }
};

// 🎯 BOTÃO MODERNO PROFISSIONAL
export const ThemedButton = ({ 
  variant = 'primary', 
  size = 'md',
  subtle = false,
  glass = false,
  children, 
  className = '',
  icon,
  loading = false,
  ...props 
}) => {
  const { currentTheme } = useTheme();
  
  const baseClasses = `
    relative overflow-hidden font-medium rounded-lg transition-all duration-200 
    transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-3 
    focus:ring-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed
    disabled:transform-none group border-2
  `;

  const sizeClasses = {
    xs: 'px-3 py-1.5 text-xs',
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
    xl: 'px-10 py-4 text-lg'
  };

  const themeColors = MODERN_COLORS.solids[currentTheme] || MODERN_COLORS.solids.modern;

  const variantClasses = {
    primary: `${themeColors.primary} ${themeColors.primaryText} hover:bg-emerald-100 
             ${subtle ? MODERN_COLORS.shadows.subtle : MODERN_COLORS.shadows.colored.emerald}`,
    secondary: `${themeColors.secondary} ${themeColors.secondaryText} hover:bg-slate-100 
               ${subtle ? MODERN_COLORS.shadows.subtle : MODERN_COLORS.shadows.colored.slate}`,
    accent: `${themeColors.accent} ${themeColors.accentText} hover:bg-sky-200 
            ${subtle ? MODERN_COLORS.shadows.subtle : MODERN_COLORS.shadows.colored.blue}`,
    success: `${themeColors.success} ${themeColors.successText} hover:bg-green-100 
             ${subtle ? MODERN_COLORS.shadows.subtle : MODERN_COLORS.shadows.colored.emerald}`,
    warning: `${themeColors.warning} ${themeColors.warningText} hover:bg-amber-100 
             ${subtle ? MODERN_COLORS.shadows.subtle : MODERN_COLORS.shadows.colored.amber}`,
    danger: `${themeColors.danger} ${themeColors.dangerText} hover:bg-rose-100 
            ${subtle ? MODERN_COLORS.shadows.subtle : MODERN_COLORS.shadows.colored.rose}`,
    outline: `border-2 border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50 
             ${MODERN_COLORS.shadows.sm}`,
    ghost: 'text-gray-600 bg-transparent border-transparent hover:bg-gray-100 hover:border-gray-200',
    glass: `${MODERN_COLORS.glass.colored} text-gray-700 hover:bg-white/100`
  };

  const glassEffect = glass ? MODERN_COLORS.glass.light : '';

  return (
    <button
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${glassEffect}
        ${className}
      `}
      {...props}
    >
      <div className="relative flex items-center justify-center gap-2">
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        )}
        {icon && !loading && <span className="text-base">{icon}</span>}
        {children}
      </div>
    </button>
  );
};

// 📦 CARD MODERNO PROFISSIONAL
export const ThemedCard = ({ 
  children, 
  className = '', 
  hover = true, 
  subtle = false,
  glass = false,
  colored = false,
  ...props 
}) => {
  const { currentTheme } = useTheme();
  
  const baseClasses = `
    rounded-xl border-2 transition-all duration-200 
    ${hover ? 'hover:scale-[1.01] hover:-translate-y-0.5' : ''}
  `;

  const glassClasses = glass ? MODERN_COLORS.glass.light : '';
  const themeColors = MODERN_COLORS.solids[currentTheme] || MODERN_COLORS.solids.modern;
  const coloredClasses = colored ? themeColors.primary : '';
  
  const defaultClasses = !glass && !colored ? `
    bg-white border-gray-200 
    ${subtle ? MODERN_COLORS.shadows.subtle : MODERN_COLORS.shadows.md}
  ` : '';

  return (
    <div
      className={`
        ${baseClasses}
        ${glassClasses}
        ${coloredClasses}
        ${defaultClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// 📊 CARD DE MÉTRICAS PROFISSIONAL
export const ThemedMetricCard = ({ 
  title,
  value,
  change,
  changeType = 'positive',
  icon,
  color = 'emerald',
  size = 'md',
  subtle = false,
  className = ''
}) => {
  const { currentTheme } = useTheme();
  
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-50 border-emerald-200',
      shadow: MODERN_COLORS.shadows.colored.emerald,
      text: 'text-emerald-800',
      accent: 'text-emerald-600',
      icon: 'text-emerald-500'
    },
    blue: {
      bg: 'bg-blue-50 border-blue-200',
      shadow: MODERN_COLORS.shadows.colored.blue,
      text: 'text-blue-800',
      accent: 'text-blue-600',
      icon: 'text-blue-500'
    },
    slate: {
      bg: 'bg-slate-50 border-slate-200',
      shadow: MODERN_COLORS.shadows.colored.slate,
      text: 'text-slate-800',
      accent: 'text-slate-600',
      icon: 'text-slate-500'
    },
    rose: {
      bg: 'bg-rose-50 border-rose-200',
      shadow: MODERN_COLORS.shadows.colored.rose,
      text: 'text-rose-800',
      accent: 'text-rose-600',
      icon: 'text-rose-500'
    },
    amber: {
      bg: 'bg-amber-50 border-amber-200',
      shadow: MODERN_COLORS.shadows.colored.amber,
      text: 'text-amber-800',
      accent: 'text-amber-600',
      icon: 'text-amber-500'
    }
  };

  const sizeClasses = {
    sm: { container: 'p-4', value: 'text-xl', title: 'text-sm', icon: 'text-lg' },
    md: { container: 'p-6', value: 'text-2xl', title: 'text-sm', icon: 'text-xl' },
    lg: { container: 'p-8', value: 'text-3xl', title: 'text-base', icon: 'text-2xl' }
  };

  const changeIcon = changeType === 'positive' ? '↗' : changeType === 'negative' ? '↘' : '→';
  const changeColorClass = changeType === 'positive' ? 'text-green-600' : 
                           changeType === 'negative' ? 'text-red-600' : 'text-gray-500';

  return (
    <ThemedCard
      className={`
        ${colorClasses[color].bg}
        ${subtle ? MODERN_COLORS.shadows.subtle : colorClasses[color].shadow}
        ${sizeClasses[size].container}
        relative overflow-hidden group border-2
        hover:scale-105 transform transition-all duration-200
        ${className}
      `}
    >
      {/* Conteúdo principal */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className={`${colorClasses[color].accent} ${sizeClasses[size].title} font-medium`}>
              {title}
            </p>
            <p className={`${colorClasses[color].text} ${sizeClasses[size].value} font-bold mt-1`}>
              {value}
            </p>
          </div>
          
          {icon && (
            <div className={`${colorClasses[color].icon} ${sizeClasses[size].icon} opacity-70 
                           group-hover:opacity-100 transition-opacity duration-200`}>
              {icon}
            </div>
          )}
        </div>
        
        {change && (
          <div className={`flex items-center gap-1.5 ${changeColorClass} text-xs font-medium`}>
            <span className="font-bold">{changeIcon}</span>
            <span>{change}</span>
            <span className="opacity-60">vs anterior</span>
          </div>
        )}
      </div>
    </ThemedCard>
  );
};

// 📝 INPUT MODERNO PROFISSIONAL
export const ThemedInput = ({ 
  label,
  error,
  icon,
  glass = false,
  className = '',
  ...props 
}) => {
  const { currentTheme } = useTheme();
  
  const glassClasses = glass ? MODERN_COLORS.glass.light : 'bg-white';
  
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                         group-focus-within:text-emerald-500 transition-colors duration-200">
            {icon}
          </div>
        )}
        
        <input
          className={`
            w-full rounded-lg border-2 border-gray-200
            ${glassClasses}
            ${icon ? 'pl-10 pr-4' : 'px-4'} py-2.5
            text-gray-900 text-sm
            placeholder-gray-400
            focus:border-emerald-400 focus:ring-3 focus:ring-emerald-500/20
            transition-all duration-200
            hover:border-gray-300
            ${MODERN_COLORS.shadows.sm}
            ${className}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <span>⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

// 📋 SELECT MODERNO PROFISSIONAL  
export const ThemedSelect = ({ 
  label,
  error,
  children,
  glass = false,
  className = '',
  ...props 
}) => {
  const glassClasses = glass ? MODERN_COLORS.glass.light : 'bg-white';
  
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative group">
        <select
          className={`
            w-full rounded-lg border-2 border-gray-200
            ${glassClasses}
            px-4 py-2.5 pr-10
            text-gray-900 text-sm
            focus:border-emerald-400 focus:ring-3 focus:ring-emerald-500/20
            transition-all duration-200
            hover:border-gray-300
            ${MODERN_COLORS.shadows.sm}
            cursor-pointer
            ${className}
          `}
          {...props}
        >
          {children}
        </select>
        
        {/* Ícone de seta */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                       group-focus-within:text-emerald-500 transition-colors duration-200 pointer-events-none">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <span>⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

// 📝 TEXTAREA MODERNO PROFISSIONAL
export const ThemedTextarea = ({ 
  label,
  error,
  glass = false,
  className = '',
  rows = 4,
  ...props 
}) => {
  const glassClasses = glass ? MODERN_COLORS.glass.light : 'bg-white';
  
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative group">
        <textarea
          rows={rows}
          className={`
            w-full rounded-lg border-2 border-gray-200
            ${glassClasses}
            px-4 py-3
            text-gray-900 text-sm
            placeholder-gray-400
            focus:border-emerald-400 focus:ring-3 focus:ring-emerald-500/20
            transition-all duration-200
            hover:border-gray-300
            ${MODERN_COLORS.shadows.sm}
            resize-vertical
            ${className}
          `}
          {...props}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <span>⚠</span>
          {error}
        </p>
      )}
    </div>
  );
};

// 📄 CONTAINER MODERNO
export const ThemedContainer = ({ 
  children, 
  className = '',
  maxWidth = '7xl',
  glass = false,
  ...props 
}) => {
  const glassClasses = glass ? MODERN_COLORS.glass.light : '';
  
  return (
    <div
      className={`
        container mx-auto px-4 sm:px-6 lg:px-8
        max-w-${maxWidth}
        ${glassClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

// 📝 TEXTO MODERNO
export const ThemedText = ({ 
  children, 
  variant = 'body',
  className = '',
  muted = false,
  ...props 
}) => {
  const { currentTheme } = useTheme();
  
  const variantClasses = {
    h1: 'text-3xl md:text-4xl font-bold',
    h2: 'text-2xl md:text-3xl font-bold',
    h3: 'text-xl md:text-2xl font-bold',
    h4: 'text-lg md:text-xl font-semibold',
    h5: 'text-base md:text-lg font-semibold',
    h6: 'text-sm md:text-base font-semibold',
    body: 'text-sm',
    small: 'text-xs',
    caption: 'text-xs'
  };

  const textClasses = muted ? 'text-gray-500' : 'text-gray-900';
  const Tag = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(variant) ? variant : 'p';
  
  return (
    <Tag
      className={`
        ${variantClasses[variant]}
        ${textClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </Tag>
  );
};

// 📊 HEADING MODERNO
export const ThemedHeading = ({ 
  children, 
  level = 1,
  muted = false,
  className = '',
  ...props 
}) => {
  const textClasses = muted ? 'text-gray-600' : 'text-gray-900';
  
  return (
    <ThemedText
      variant={`h${level}`}
      className={`
        ${textClasses}
        font-bold tracking-tight
        ${className}
      `}
      {...props}
    >
      {children}
    </ThemedText>
  );
};

// 🎯 BADGE MODERNO PROFISSIONAL
export const ThemedBadge = ({ 
  children,
  variant = 'primary',
  size = 'md',
  pill = true,
  className = ''
}) => {
  const { currentTheme } = useTheme();
  
  const baseClasses = `
    inline-flex items-center font-medium transition-all duration-200 border
    ${pill ? 'rounded-full' : 'rounded-md'}
    ${MODERN_COLORS.shadows.sm}
  `;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-sm'
  };

  const themeColors = MODERN_COLORS.solids[currentTheme] || MODERN_COLORS.solids.modern;

  const variantClasses = {
    primary: `${themeColors.primary} ${themeColors.primaryText}`,
    success: `${themeColors.success} ${themeColors.successText}`,
    warning: `${themeColors.warning} ${themeColors.warningText}`,
    danger: `${themeColors.danger} ${themeColors.dangerText}`,
    info: `${themeColors.info} ${themeColors.infoText}`,
    secondary: `${themeColors.secondary} ${themeColors.secondaryText}`
  };

  return (
    <span className={`
      ${baseClasses}
      ${sizeClasses[size]}
      ${variantClasses[variant]}
      ${className}
    `}>
      {children}
    </span>
  );
};

// 📊 PROGRESS BAR MODERNO
export const ThemedProgress = ({ 
  value = 0,
  max = 100,
  variant = 'primary',
  size = 'md',
  showValue = true,
  className = ''
}) => {
  const { currentTheme } = useTheme();
  const percentage = Math.min((value / max) * 100, 100);
  
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };

  const themeColors = MODERN_COLORS.solids[currentTheme] || MODERN_COLORS.solids.modern;

  const variantClasses = {
    primary: 'bg-emerald-400',
    success: 'bg-green-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
    info: 'bg-blue-400'
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showValue && (
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <span>Progresso</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      
      <div className={`
        w-full bg-gray-200 rounded-full overflow-hidden border
        ${sizeClasses[size]}
        ${MODERN_COLORS.shadows.sm}
      `}>
        <div
          className={`
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            transition-all duration-500 ease-out
            rounded-full
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// Container com Cores Temáticas
export const ThemedBackground = ({ 
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const { currentTheme } = useTheme();
  const themeColors = MODERN_COLORS.solids[currentTheme] || MODERN_COLORS.solids.modern;
  
  const backgroundClass = themeColors[variant] || themeColors.primary;

  return (
    <div 
      className={`${backgroundClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Alias para compatibilidade (ThemedGradient → ThemedBackground)
export const ThemedGradient = ThemedBackground;

export default {
  ThemedButton,
  ThemedCard,
  ThemedMetricCard,
  ThemedInput,
  ThemedSelect,
  ThemedTextarea,
  ThemedContainer,
  ThemedText,
  ThemedHeading,
  ThemedBadge,
  ThemedProgress,
  ThemedBackground,
  ThemedGradient, // Compatibilidade
  MODERN_COLORS
};