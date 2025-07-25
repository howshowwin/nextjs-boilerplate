'use client';

import React from 'react';

// Apple Button System Props
interface AppleButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'plain';
  size?: 'small' | 'medium' | 'large';
  shape?: 'rectangle' | 'rounded' | 'circle' | 'capsule';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right' | 'only';
  fullWidth?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const AppleButton: React.FC<AppleButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  shape = 'rounded',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  style = {},
  onClick,
  type = 'button',
  ...props
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      padding: '8px 16px',
      fontSize: '15px',
      iconSize: '16px',
      minHeight: '32px',
      borderRadius: '8px'
    },
    medium: {
      padding: '12px 20px',
      fontSize: '17px',
      iconSize: '20px',
      minHeight: '44px',
      borderRadius: '12px'
    },
    large: {
      padding: '16px 24px',
      fontSize: '19px',
      iconSize: '24px',
      minHeight: '52px',
      borderRadius: '16px'
    }
  };

  // Shape configurations
  const shapeConfig = {
    rectangle: '4px',
    rounded: sizeConfig[size].borderRadius,
    circle: '50%',
    capsule: '100px'
  };

  // Variant styles
  const getVariantStyles = () => {
    const baseStyles = {
      transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fontFamily: 'var(--font-system)',
      fontWeight: '600',
      border: 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      textDecoration: 'none',
      userSelect: 'none' as const,
      WebkitUserSelect: 'none' as const
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          background: 'var(--accent)',
          color: 'white',
          boxShadow: 'var(--shadow-1)'
        };

      case 'secondary':
        return {
          ...baseStyles,
          background: 'var(--surface-secondary)',
          color: 'var(--foreground)',
          border: '0.5px solid var(--separator)'
        };

      case 'tertiary':
        return {
          ...baseStyles,
          background: 'transparent',
          color: 'var(--accent)'
        };

      case 'destructive':
        return {
          ...baseStyles,
          background: 'var(--destructive)',
          color: 'white',
          boxShadow: 'var(--shadow-1)'
        };

      case 'plain':
        return {
          ...baseStyles,
          background: 'transparent',
          color: 'var(--foreground-secondary)'
        };

      default:
        return baseStyles;
    }
  };

  // Loading spinner component
  const LoadingSpinner = () => (
    <div 
      className="animate-spin rounded-full border-2 border-t-transparent"
      style={{
        width: sizeConfig[size].iconSize,
        height: sizeConfig[size].iconSize,
        borderColor: variant === 'primary' || variant === 'destructive' ? 'rgba(255, 255, 255, 0.3)' : 'var(--accent)'
      }}
    />
  );

  // Icon wrapper
  const IconWrapper = ({ children }: { children: React.ReactNode }) => (
    <div style={{ 
      width: sizeConfig[size].iconSize, 
      height: sizeConfig[size].iconSize,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {children}
    </div>
  );

  const buttonStyles = {
    ...getVariantStyles(),
    padding: iconPosition === 'only' ? sizeConfig[size].padding.split(' ')[0] : sizeConfig[size].padding,
    fontSize: sizeConfig[size].fontSize,
    minHeight: sizeConfig[size].minHeight,
    borderRadius: shapeConfig[shape],
    width: fullWidth ? '100%' : 'auto',
    aspectRatio: shape === 'circle' ? '1' : 'auto',
    ...style
  };

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    const button = e.currentTarget;
    
    // Apply hover styles based on variant
    switch (variant) {
      case 'primary':
        button.style.background = '#0051d5';
        button.style.transform = 'translateY(-1px)';
        button.style.boxShadow = 'var(--shadow-2)';
        break;
      case 'secondary':
        button.style.background = 'var(--surface)';
        button.style.transform = 'translateY(-1px)';
        button.style.boxShadow = 'var(--shadow-1)';
        break;
      case 'tertiary':
        button.style.background = 'rgba(0, 122, 255, 0.1)';
        button.style.transform = 'scale(1.02)';
        break;
      case 'destructive':
        button.style.background = '#d70015';
        button.style.transform = 'translateY(-1px)';
        button.style.boxShadow = 'var(--shadow-2)';
        break;
      case 'plain':
        button.style.color = 'var(--foreground)';
        button.style.transform = 'scale(1.02)';
        break;
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    
    // Reset to base styles
    button.style.transform = '';
    button.style.boxShadow = buttonStyles.boxShadow as string || '';
    
    switch (variant) {
      case 'primary':
        button.style.background = 'var(--accent)';
        break;
      case 'secondary':
        button.style.background = 'var(--surface-secondary)';
        break;
      case 'tertiary':
      case 'plain':
        button.style.background = 'transparent';
        break;
      case 'destructive':
        button.style.background = 'var(--destructive)';
        break;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    const button = e.currentTarget;
    button.style.transform = 'scale(0.98)';
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    
    // Reset to hover state
    handleMouseEnter(e);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <LoadingSpinner />
          {iconPosition !== 'only' && <span style={{ opacity: 0.7 }}>{children}</span>}
        </>
      );
    }

    if (iconPosition === 'only' && icon) {
      return <IconWrapper>{icon}</IconWrapper>;
    }

    if (iconPosition === 'left' && icon) {
      return (
        <>
          <IconWrapper>{icon}</IconWrapper>
          {children}
        </>
      );
    }

    if (iconPosition === 'right' && icon) {
      return (
        <>
          {children}
          <IconWrapper>{icon}</IconWrapper>
        </>
      );
    }

    return children;
  };

  return (
    <button
      type={type}
      className={`apple-button ${className}`}
      style={buttonStyles}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      disabled={disabled || loading}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default AppleButton;