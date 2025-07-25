'use client';

import React from 'react';

// Apple Card System Props
interface AppleCardProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'small' | 'medium' | 'large';
  radius?: 'small' | 'medium' | 'large' | 'xl';
  hover?: boolean;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const AppleCard: React.FC<AppleCardProps> = ({
  children,
  variant = 'primary',
  padding = 'medium',
  radius = 'large',
  hover = false,
  interactive = false,
  className = '',
  style = {},
  onClick,
  ...props
}) => {
  // Padding configurations
  const paddingConfig = {
    none: '0',
    small: '12px',
    medium: '16px',
    large: '24px'
  };

  // Radius configurations
  const radiusConfig = {
    small: 'var(--radius-small)',
    medium: 'var(--radius-medium)',
    large: 'var(--radius-large)',
    xl: 'var(--radius-xl)'
  };

  // Variant styles
  const getVariantStyles = () => {
    const baseStyles = {
      display: 'block',
      transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      cursor: interactive || onClick ? 'pointer' : 'default',
      userSelect: 'none' as const,
      WebkitUserSelect: 'none' as const
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          background: 'var(--surface)',
          border: '0.5px solid var(--separator)',
          boxShadow: 'var(--shadow-2)'
        };

      case 'secondary':
        return {
          ...baseStyles,
          background: 'var(--surface-secondary)',
          boxShadow: 'var(--shadow-1)'
        };

      case 'elevated':
        return {
          ...baseStyles,
          background: 'var(--surface)',
          border: '0.5px solid var(--separator)',
          boxShadow: 'var(--shadow-3)'
        };

      case 'outlined':
        return {
          ...baseStyles,
          background: 'transparent',
          border: '1px solid var(--separator)'
        };

      case 'glass':
        return {
          ...baseStyles,
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'var(--blur-light)',
          WebkitBackdropFilter: 'var(--blur-light)',
          border: '0.5px solid rgba(255, 255, 255, 0.2)',
          boxShadow: 'var(--shadow-2)'
        };

      default:
        return baseStyles;
    }
  };

  // Hover and interaction effects
  const shouldHaveInteraction = hover || interactive || onClick;

  const cardStyles = {
    ...getVariantStyles(),
    padding: paddingConfig[padding],
    borderRadius: radiusConfig[radius],
    ...style
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldHaveInteraction) return;
    
    const card = e.currentTarget;
    
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'elevated':
        card.style.transform = 'translateY(-2px) scale(1.01)';
        card.style.boxShadow = 'var(--shadow-3)';
        break;
      case 'outlined':
        card.style.background = 'var(--surface-secondary)';
        card.style.transform = 'scale(1.02)';
        break;
      case 'glass':
        card.style.background = 'rgba(255, 255, 255, 0.9)';
        card.style.transform = 'translateY(-1px) scale(1.01)';
        break;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldHaveInteraction) return;
    
    const card = e.currentTarget;
    
    // Reset to base styles
    card.style.transform = '';
    
    switch (variant) {
      case 'primary':
        card.style.boxShadow = 'var(--shadow-2)';
        break;
      case 'secondary':
        card.style.boxShadow = 'var(--shadow-1)';
        card.style.background = 'var(--surface-secondary)';
        break;
      case 'elevated':
        card.style.boxShadow = 'var(--shadow-3)';
        break;
      case 'outlined':
        card.style.background = 'transparent';
        break;
      case 'glass':
        card.style.background = 'rgba(255, 255, 255, 0.8)';
        break;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldHaveInteraction) return;
    
    const card = e.currentTarget;
    card.style.transform = 'scale(0.99)';
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!shouldHaveInteraction) return;
    
    // Reset to hover state
    handleMouseEnter(e);
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`apple-card ${className}`}
      style={cardStyles}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      {...props}
    >
      {children}
    </div>
  );
};

// Card Header Component
interface AppleCardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const AppleCardHeader: React.FC<AppleCardHeaderProps> = ({
  title,
  subtitle,
  action,
  icon,
  className = ''
}) => {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center space-x-3">
        {icon && (
          <div 
            className="p-2 rounded-xl"
            style={{ background: 'var(--surface-secondary)' }}
          >
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-headline font-semibold" style={{ color: 'var(--foreground)' }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-footnote" style={{ color: 'var(--foreground-secondary)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

// Card Content Component
interface AppleCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const AppleCardContent: React.FC<AppleCardContentProps> = ({
  children,
  className = ''
}) => {
  return (
    <div className={`${className}`}>
      {children}
    </div>
  );
};

// Card Footer Component
interface AppleCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const AppleCardFooter: React.FC<AppleCardFooterProps> = ({
  children,
  className = ''
}) => {
  return (
    <div 
      className={`pt-4 mt-4 border-t border-opacity-20 ${className}`}
      style={{ borderColor: 'var(--separator)' }}
    >
      {children}
    </div>
  );
};

// Card Divider Component
export const AppleCardDivider: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div 
      className={`my-4 border-t border-opacity-20 ${className}`}
      style={{ borderColor: 'var(--separator)' }}
    />
  );
};

export default AppleCard;