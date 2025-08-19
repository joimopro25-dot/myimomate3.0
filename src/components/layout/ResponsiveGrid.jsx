import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

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

// Card Responsivo com tema
export const ResponsiveCard = ({ 
  children, 
  title, 
  subtitle, 
  actions,
  hover = true,
  padding = 'normal', // 'sm', 'normal', 'lg'
  className = '' 
}) => {
  const { currentTheme } = useTheme();
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
        ${getPadding()}
        ${className}
      `}
      style={{
        backgroundColor: currentTheme.background.primary,
        borderColor: currentTheme.border.light,
        boxShadow: currentTheme.shadow.sm
      }}
    >
      {/* Header do Card */}
      {(title || actions) && (
        <div className={`flex justify-between items-start ${title ? 'mb-4' : 'mb-2'}`}>
          <div className="flex-1">
            {title && (
              <h3 
                style={{ color: currentTheme.text.primary }}
                className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p 
                style={{ color: currentTheme.text.secondary }}
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

// Card de Métrica Individual
export const MetricCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color = 'blue',
  onClick,
  clickable = false 
}) => {
  const { currentTheme } = useTheme();
  const { isMobile } = useResponsive();

  const colorVariants = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', accent: currentTheme.primary.main },
    green: { bg: 'bg-green-50', icon: 'text-green-600', accent: '#10b981' },
    yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', accent: '#f59e0b' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', accent: '#ef4444' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', accent: '#8b5cf6' }
  };

  const variant = colorVariants[color] || colorVariants.blue;

  return (
    <ResponsiveCard 
      hover={clickable}
      className={`${clickable ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`${variant.bg} rounded-lg p-3`}>
          {Icon && <Icon className={`${variant.icon} ${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`} />}
        </div>
        <div className="ml-4 flex-1">
          <p style={{ color: currentTheme.text.secondary }} 
             className={`${isMobile ? 'text-sm' : 'text-base'} font-medium`}>
            {title}
          </p>
          <p style={{ color: currentTheme.text.primary }} 
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
          <span style={{ color: currentTheme.text.secondary }} 
                className="text-sm">
            👆 Clique para gerir
          </span>
        </div>
      )}
    </ResponsiveCard>
  );
};

// Tabela Responsiva
export const ResponsiveTable = ({ 
  columns = [], 
  data = [], 
  onRowClick,
  loading = false,
  emptyMessage = "Nenhum dado encontrado"
}) => {
  const { currentTheme } = useTheme();
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
          <p style={{ color: currentTheme.text.secondary }} className="text-lg">
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
                  <span style={{ color: currentTheme.text.secondary }} className="text-sm font-medium">
                    {col.header}
                  </span>
                  <span style={{ color: currentTheme.text.primary }} className="text-sm">
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
        <table className="min-w-full divide-y" style={{ borderColor: currentTheme.border.light }}>
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th 
                  key={index}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                  style={{ color: currentTheme.text.secondary }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: currentTheme.border.light }}>
            {data.map((row, index) => (
              <tr 
                key={index}
                className={`${onRowClick ? 'hover:bg-gray-50 cursor-pointer' : ''} transition-colors`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: currentTheme.text.primary }}>
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
          <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'flex-row justify-end space-x-3'} pt-6 border-t`}>
            {actions}
          </div>
        )}
      </form>
    </ResponsiveCard>
  );
};

// Container para ações de página
export const PageActions = ({ children, align = 'right' }) => {
  const { isMobile } = useResponsive();

  const alignClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }[align];

  return (
    <div className={`flex ${isMobile ? 'flex-col space-y-2' : `flex-row space-x-3 ${alignClass}`} mb-6`}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;