import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helper?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, helper, leftIcon, rightIcon, className = '', ...rest }, ref) => {
    return (
      <div className="w-full mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="relative rounded-md shadow-sm">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              block w-full rounded-md shadow-sm text-sm text-gray-900
              ${leftIcon ? 'pl-10' : 'pl-3'} 
              ${rightIcon ? 'pr-10' : 'pr-3'} 
              py-2.5 
              border ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}
              placeholder:text-gray-400
              focus:outline-none focus:ring-2 
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              transition-shadow duration-150
              ${className}
            `}
            {...rest}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        ) : helper ? (
          <p className="mt-1 text-sm text-gray-500">{helper}</p>
        ) : null}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
