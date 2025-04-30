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
      <div className="form-control w-full mb-4">
        <label className="label">
          <span className="label-text">{label}</span>
        </label>
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              input input-bordered w-full
              ${error ? 'input-error' : ''}
              ${leftIcon ? 'pl-10' : ''} 
              ${rightIcon ? 'pr-10' : ''} 
              ${className}
            `}
            {...rest}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </div>
        {helper && !error && (
          <label className="label">
            <span className="label-text-alt">{helper}</span>
          </label>
        )}
        {error && (
          <label className="label">
            <span className="label-text-alt text-error">{error}</span>
          </label>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;
