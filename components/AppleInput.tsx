'use client';

import React, { useState, forwardRef } from 'react';

// Apple Input System Props
interface AppleInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'filled' | 'outlined';
  fullWidth?: boolean;
  required?: boolean;
}

const AppleInput = forwardRef<HTMLInputElement, AppleInputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  size = 'medium',
  variant = 'default',
  fullWidth = false,
  required = false,
  className = '',
  style = {},
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: {
      padding: '8px 12px',
      fontSize: '15px',
      iconSize: '16px',
      height: '36px'
    },
    medium: {
      padding: '12px 16px',
      fontSize: '17px',
      iconSize: '20px',
      height: '44px'
    },
    large: {
      padding: '16px 20px',
      fontSize: '19px',
      iconSize: '24px',
      height: '52px'
    }
  };

  // Variant styles
  const getVariantStyles = () => {
    const baseStyles = {
      transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fontFamily: 'var(--font-system)',
      borderRadius: 'var(--radius-medium)',
      border: '0.5px solid var(--separator)',
      outline: 'none',
      width: fullWidth ? '100%' : 'auto'
    };

    switch (variant) {
      case 'default':
        return {
          ...baseStyles,
          background: isFocused ? 'var(--surface)' : 'var(--surface-secondary)',
          borderColor: isFocused ? 'var(--accent)' : error ? 'var(--destructive)' : 'var(--separator)',
          boxShadow: isFocused ? '0 0 0 4px rgba(0, 122, 255, 0.1)' : 'none'
        };

      case 'filled':
        return {
          ...baseStyles,
          background: 'var(--surface-secondary)',
          border: 'none',
          borderBottom: `2px solid ${isFocused ? 'var(--accent)' : error ? 'var(--destructive)' : 'var(--separator)'}`,
          borderRadius: '8px 8px 0 0'
        };

      case 'outlined':
        return {
          ...baseStyles,
          background: 'transparent',
          borderColor: isFocused ? 'var(--accent)' : error ? 'var(--destructive)' : 'var(--separator)',
          borderWidth: isFocused ? '2px' : '1px'
        };

      default:
        return baseStyles;
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const inputStyles = {
    ...getVariantStyles(),
    height: sizeConfig[size].height,
    fontSize: sizeConfig[size].fontSize,
    padding: leftIcon || rightIcon ? 
      `${sizeConfig[size].padding.split(' ')[0]} ${rightIcon ? '48px' : sizeConfig[size].padding.split(' ')[1]} ${sizeConfig[size].padding.split(' ')[0]} ${leftIcon ? '48px' : sizeConfig[size].padding.split(' ')[1]}` :
      sizeConfig[size].padding,
    color: 'var(--foreground)',
    ...style
  };

  const iconWrapperStyle = {
    position: 'absolute' as const,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none' as const,
    color: isFocused ? 'var(--accent)' : 'var(--foreground-tertiary)',
    transition: 'color 0.2s ease'
  };

  const leftIconStyle = {
    ...iconWrapperStyle,
    left: '12px'
  };

  const rightIconStyle = {
    ...iconWrapperStyle,
    right: '12px'
  };

  return (
    <div className={`apple-input-container ${className}`} style={{ width: fullWidth ? '100%' : 'auto' }}>
      {/* Label */}
      {label && (
        <label 
          className="block text-headline font-medium mb-3"
          style={{ color: error ? 'var(--destructive)' : 'var(--foreground)' }}
        >
          {label}
          {required && (
            <span 
              className="ml-1"
              style={{ color: 'var(--destructive)' }}
            >
              *
            </span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <div style={leftIconStyle}>
            <div style={{ width: sizeConfig[size].iconSize, height: sizeConfig[size].iconSize }}>
              {leftIcon}
            </div>
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          className="apple-input"
          style={inputStyles}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <div style={rightIconStyle}>
            <div style={{ width: sizeConfig[size].iconSize, height: sizeConfig[size].iconSize }}>
              {rightIcon}
            </div>
          </div>
        )}
      </div>

      {/* Helper Text / Error Message */}
      {(error || helperText) && (
        <div className="mt-2">
          <p 
            className="text-footnote"
            style={{ color: error ? 'var(--destructive)' : 'var(--foreground-secondary)' }}
          >
            {error || helperText}
          </p>
        </div>
      )}
    </div>
  );
});

AppleInput.displayName = 'AppleInput';

// Apple Textarea Component
interface AppleTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'filled' | 'outlined';
  fullWidth?: boolean;
  required?: boolean;
  rows?: number;
}

export const AppleTextarea = forwardRef<HTMLTextAreaElement, AppleTextareaProps>(({
  label,
  error,
  helperText,
  size = 'medium',
  variant = 'default',
  fullWidth = false,
  required = false,
  rows = 3,
  className = '',
  style = {},
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  // Size configurations
  const sizeConfig = {
    small: {
      padding: '8px 12px',
      fontSize: '15px'
    },
    medium: {
      padding: '12px 16px',
      fontSize: '17px'
    },
    large: {
      padding: '16px 20px',
      fontSize: '19px'
    }
  };

  // Variant styles (similar to input)
  const getVariantStyles = () => {
    const baseStyles = {
      transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      fontFamily: 'var(--font-system)',
      borderRadius: 'var(--radius-medium)',
      border: '0.5px solid var(--separator)',
      outline: 'none',
      resize: 'vertical' as const,
      width: fullWidth ? '100%' : 'auto',
      minHeight: `${rows * 1.5}em`
    };

    switch (variant) {
      case 'default':
        return {
          ...baseStyles,
          background: isFocused ? 'var(--surface)' : 'var(--surface-secondary)',
          borderColor: isFocused ? 'var(--accent)' : error ? 'var(--destructive)' : 'var(--separator)',
          boxShadow: isFocused ? '0 0 0 4px rgba(0, 122, 255, 0.1)' : 'none'
        };

      case 'filled':
        return {
          ...baseStyles,
          background: 'var(--surface-secondary)',
          border: 'none',
          borderBottom: `2px solid ${isFocused ? 'var(--accent)' : error ? 'var(--destructive)' : 'var(--separator)'}`,
          borderRadius: '8px 8px 0 0'
        };

      case 'outlined':
        return {
          ...baseStyles,
          background: 'transparent',
          borderColor: isFocused ? 'var(--accent)' : error ? 'var(--destructive)' : 'var(--separator)',
          borderWidth: isFocused ? '2px' : '1px'
        };

      default:
        return baseStyles;
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const textareaStyles = {
    ...getVariantStyles(),
    fontSize: sizeConfig[size].fontSize,
    padding: sizeConfig[size].padding,
    color: 'var(--foreground)',
    ...style
  };

  return (
    <div className={`apple-textarea-container ${className}`} style={{ width: fullWidth ? '100%' : 'auto' }}>
      {/* Label */}
      {label && (
        <label 
          className="block text-headline font-medium mb-3"
          style={{ color: error ? 'var(--destructive)' : 'var(--foreground)' }}
        >
          {label}
          {required && (
            <span 
              className="ml-1"
              style={{ color: 'var(--destructive)' }}
            >
              *
            </span>
          )}
        </label>
      )}

      {/* Textarea Field */}
      <textarea
        ref={ref}
        className="apple-textarea"
        style={textareaStyles}
        rows={rows}
        onFocus={handleFocus}
        onBlur={handleBlur}
        {...props}
      />

      {/* Helper Text / Error Message */}
      {(error || helperText) && (
        <div className="mt-2">
          <p 
            className="text-footnote"
            style={{ color: error ? 'var(--destructive)' : 'var(--foreground-secondary)' }}
          >
            {error || helperText}
          </p>
        </div>
      )}
    </div>
  );
});

AppleTextarea.displayName = 'AppleTextarea';

export default AppleInput;