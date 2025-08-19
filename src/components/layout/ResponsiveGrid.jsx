import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

// Hook personalizado ultra seguro para tema
const useSafeTheme = () => {
  const themeData = useTheme();
  
  // VERIFICAÇÃO ULTRA DEFENSIVA - Máxima segurança
  const getThemeValue = (path, fallback) => {
    try {
      if (!themeData) return fallback;
      if (!themeData.currentTheme) return fallback;
      
      const pathArray = path.split('.');
      let current = themeData.currentTheme;
      
      for (const key of pathArray) {
        if (!current || !current[key]) return fallback;
        current = current[key];
      }
      
      return current || fallback;
    } catch (error) {
      console.warn(`Erro ao acessar tema em ${path}:`, error);
      return fallback;
    }
  };

  return {
    background: {
      primary: getThemeValue('background.primary', '#ffffff'),
      secondary: getThemeValue('background.secondary', '#f9fafb')
    },
    text: {
      primary: getThemeValue('text.primary', '#1f2937'),
      secondary: getThemeValue('text.secondary', '#6b7280')
    },
    border: {
      light: getThemeValue('border.light', '#e5e7eb')
    },
    primary: {
      main: getThemeValue('primary.main', '#3b82f6')
    }
  };
};

// Hook para breakpoints responsivos
export const useResponsive = () => {
  const [breakpoint, setBreakpoint] = React.useState('desktop');

  React.useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 640) setBreakpoint('mobile');
      else if (width < 768) setBreakpoint('sm');
      else if (width < 1024) setBreakpoint('tablet');
      else if (width < 1280) setBreakpoint('desktop');
      else setBreakpoint('xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile' || breakpoint === 'sm',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop' || breakpoint === 'xl'
  };
};

// Grid Container Responsivo
export const ResponsiveGrid = ({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 4 }, 
  gap = 6,
  className = '' 
}) => {
  const { breakpoint } = useResponsive();
  
  const getColumns = () => {
    switch (breakpoint) {
      case 'mobile':
      case 'sm':
        return cols.mobile || 1;
      case 'tablet':
        return cols.tablet || 2;
      case 'desktop':
      case 'xl':
      default:
        return cols.desktop || 4;
    }
  };

  return (
    <div 
      className={`grid gap-${gap} ${className}`}
      style={{ gridTemplateColumns: `repeat(${getColumns()}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
};

// Card Responsivo com tema - VERSÃO ULTRA SEGURA
export const ResponsiveCard = ({ 
  children, 
  title, 
  subtitle, 
  actions,
  hover = true,
  padding = 'normal', // 'sm', 'normal', 'lg'
  className = '',
  onClick
}) => {
  const safeTheme = useSafeTheme();
  const { isMobile } = useResponsive();

  const getPadding = () => {
    if (isMobile) {
      switch (padding) {
        case 'sm': return 'p-3';
        case 'lg': return 'p-6';
        default: return 'p-4';
      }
    } else {
      switch (padding) {
        case 'sm': return 'p-4';
        case 'lg': return 'p-8';
        default: return 'p-6';
      }
    }
  };

  return (
    <div
      className={`
        rounded-lg border transition-all duration-200
        ${hover ? 'hover:shadow-lg' : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${getPadding()}
        ${className}
      `}
      style={{
        backgroundColor: safeTheme.background.primary,
        borderColor: safeTheme.border.light,
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }}
      onClick={onClick}
    >
      {/* Header do Card */}
      {(title || actions) && (
        <div className={`flex justify-between items-start ${title ? 'mb-4' : 'mb-2'}`}>
          <div className="flex-1">
            {title && (
              <h3 
                style={{ color: safeTheme.text.primary }}
                className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p 
                style={{ color: safeTheme.text.secondary }}
                className={`${isMobile ? 'text-sm' : 'text-base'} mt-1`}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2 ml-4">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Conteúdo do Card */}
      <div>
        {children}
      </div>
    </div>
  );
};

// Métricas Cards Responsivos
export const MetricsGrid = ({ metrics = [] }) => {
  const { isMobile } = useResponsive();

  return (
    <ResponsiveGrid 
      cols={{ mobile: 1, tablet: 2, desktop: 4 }}
      gap={isMobile ? 4 : 6}
      className="mb-8"
    >
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </ResponsiveGrid>
  );
};

// Card de Métrica Individual - VERSÃO ULTRA SEGURA
export const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon, 
  color = 'blue',
  onClick,
  clickable = false 
}) => {
  const safeTheme = useSafeTheme();
  const { isMobile } = useResponsive();

  // Emojis por cor
  const colorEmojis = {
    blue: '📊',
    green: '📈',
    yellow: '⚡',
    red: '🔥',
    purple: '💎'
  };

  const colorVariants = {
    blue: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3b82f6' },
    green: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981' },
    yellow: { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
    red: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444' },
    purple: { bg: 'rgba(139, 92, 246, 0.1)', text: '#8b5cf6' }
  };

  const variant = colorVariants[color] || colorVariants.blue;

  return (
    <ResponsiveCard 
      hover={clickable}
      className={`${clickable ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div 
          className="rounded-lg p-3"
          style={{ backgroundColor: variant.bg }}
        >
          <span className={`${isMobile ? 'text-xl' : 'text-2xl'}`}>
            {colorEmojis[color] || '📊'}
          </span>
        </div>
        <div className="ml-4 flex-1">
          <p style={{ color: safeTheme.text.secondary }} 
             className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
            {title}
          </p>
          <p style={{ color: safeTheme.text.primary }} 
             className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold`}>
            {value}
          </p>
          {change && (
            <p className={`text-sm ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change}
            </p>
          )}
        </div>
      </div>
      {clickable && (
        <div className="mt-2">
          <span style={{ color: safeTheme.text.secondary }} 
                className="text-sm">
            👆 Clique para gerir
          </span>
        </div>
      )}
    </ResponsiveCard>
  );
};

// Tabela Responsiva - VERSÃO ULTRA SEGURA
export const ResponsiveTable = ({ 
  columns = [], 
  data = [], 
  onRowClick,
  loading = false,
  emptyMessage = "Nenhum dado encontrado"
}) => {
  const safeTheme = useSafeTheme();
  const { isMobile } = useResponsive();

  if (loading) {
    return (
      <ResponsiveCard>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </ResponsiveCard>
    );
  }

  if (data.length === 0) {
    return (
      <ResponsiveCard>
        <div className="text-center py-12">
          <p style={{ color: safeTheme.text.secondary }} className="text-lg">
            {emptyMessage}
          </p>
        </div>
      </ResponsiveCard>
    );
  }

  // Mobile: Card Layout
  if (isMobile) {
    return (
      <div className="space-y-4">
        {data.map((row, index) => (
          <ResponsiveCard 
            key={index}
            hover={!!onRowClick}
            className={onRowClick ? 'cursor-pointer' : ''}
            onClick={() => onRowClick?.(row)}
          >
            <div className="space-y-2">
              {columns.map((col, colIndex) => (
                <div key={colIndex} className="flex justify-between">
                  <span style={{ color: safeTheme.text.secondary }} className="text-sm font-medium">
                    {col.header}
                  </span>
                  <span style={{ color: safeTheme.text.primary }} className="text-sm">
                    {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]}
                  </span>
                </div>
              ))}
            </div>
          </ResponsiveCard>
        ))}
      </div>
    );
  }

  // Desktop: Table Layout
  return (
    <ResponsiveCard padding="sm">
      <div className="overflow-hidden">
        <table className="min-w-full divide-y" style={{ borderColor: safeTheme.border.light }}>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: safeTheme.text.secondary }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: safeTheme.border.light }}>
            {data.map((row, index) => (
              <tr 
                key={index}
                className={`${onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''} transition-colors`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: safeTheme.text.primary }}>
                    {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ResponsiveCard>
  );
};

// Page Actions Container
export const PageActions = ({ children }) => {
  const { isMobile } = useResponsive();
  
  return (
    <div className={`flex items-center space-x-2 ${isMobile ? 'flex-col space-y-2 space-x-0' : ''}`}>
      {children}
    </div>
  );
};

// Layout de Formulário Responsivo
export const ResponsiveForm = ({ children, title, subtitle, onSubmit, actions }) => {
  const { isMobile } = useResponsive();

  return (
    <ResponsiveCard 
      title={title}
      subtitle={subtitle}
      padding={isMobile ? 'normal' : 'lg'}
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {children}
        </div>
        {actions && (
          <div className={`flex ${isMobile ? 'flex-col space-y-2' : 'justify-end space-x-4'}`}>
            {actions}
          </div>
        )}
      </form>
    </ResponsiveCard>
  );
};