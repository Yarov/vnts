import React, { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    label, 
    error, 
    helperText, 
    className = '', 
    wrapperClassName = '',
    ...props 
  }, ref) => {
    return (
      <div className={`flex items-start ${wrapperClassName}`}>
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className={`
              h-4 w-4 rounded 
              text-purple-600 
              focus:ring-purple-500 
              border-gray-300
              transition-colors
              ${className}
            `}
            {...props}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={props.id} className={`font-medium ${props.disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {label}
          </label>
          {error ? (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          ) : helperText ? (
            <p className="mt-1 text-sm text-gray-500">{helperText}</p>
          ) : null}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
