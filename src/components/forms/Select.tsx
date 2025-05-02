import { SelectHTMLAttributes, ReactNode, forwardRef } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value'> {
  label?: string;
  options: SelectOption[];
  value?: string;
  error?: string;
  icon?: ReactNode;
  helperText?: string;
  wrapperClassName?: string;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({
    label,
    options,
    error,
    icon,
    helperText,
    className = '',
    wrapperClassName = '',
    placeholder,
    ...props
  }, ref) => {
    return (
      <div className={`${wrapperClassName}`}>
        {label && (
          <label htmlFor={props.id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative rounded-md shadow-sm">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <select
            ref={ref}
            className={`
              block w-full rounded-md shadow-sm text-sm text-gray-900
              ${icon ? 'pl-10' : 'pl-3'}
              pr-10
              py-2.5
              border ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]'}
              placeholder:text-gray-400
              focus:outline-none focus:ring-2
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              transition-shadow duration-150
              appearance-none
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ChevronDownIcon className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        {error ? (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
