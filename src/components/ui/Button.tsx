import React, { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      fullWidth = false,
      className = '',
      ...props
    },
    ref
  ) => {
    // Variant styles
    const variantStyles = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 border-transparent',
      secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 border-transparent',
      outline: 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 border-transparent',
      link: 'bg-transparent text-primary-600 hover:text-primary-700 border-transparent p-0 shadow-none',
      danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent',
    };

    // Size styles
    const sizeStyles = {
      sm: 'text-xs px-2.5 py-1.5',
      md: 'text-sm px-4 py-2',
      lg: 'text-base px-6 py-3',
    };

    // Base styles
    const baseStyles = 'inline-flex items-center justify-center font-medium border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed';

    return (
      <button
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant] || variantStyles.primary}
          ${sizeStyles[size] || sizeStyles.md}
          ${fullWidth ? 'w-full' : ''}
          ${variant !== 'link' ? 'shadow-sm' : ''}
          ${className}
        `}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <svg
            className={`animate-spin h-4 w-4 text-current ${iconPosition === 'left' ? 'mr-2' : 'mr-0'}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}
        {!loading && icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        {children}
        {!loading && icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
