import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helper?: string;
}

const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  ({ label, error, helper, className = '', ...rest }, ref) => {
    return (
      <div className="w-full mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="relative rounded-md shadow-sm">
          <textarea
            ref={ref}
            className={`
              block w-full rounded-md shadow-sm text-sm text-gray-900
              px-3 py-2
              border ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}
              placeholder:text-gray-400
              focus:outline-none focus:ring-2
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              transition-shadow duration-150
              resize-none
              ${className}
            `}
            {...rest}
          />
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

TextAreaField.displayName = 'TextAreaField';

export default TextAreaField;
