import { SelectHTMLAttributes, forwardRef } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
  helper?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, helper, className = '', ...rest }, ref) => {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <select
          ref={ref}
          className={`
            block w-full pl-3 pr-10 py-2 text-base border-gray-300 
            focus:outline-none focus:ring-primary-500 focus:border-primary-500 
            rounded-md shadow-sm
            ${error ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500' : ''}
            ${className}
          `}
          {...rest}
        >
          <option value="">Seleccionar...</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {helper && !error && (
          <p className="mt-1 text-sm text-gray-500">
            {helper}
          </p>
        )}
        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
