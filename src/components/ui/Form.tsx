import React, { FormHTMLAttributes, ReactNode } from 'react';

interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
  title?: string;
  description?: string;
  error?: string;
  onSubmit?: (e: React.FormEvent) => void;
}

const Form: React.FC<FormProps> = ({
  children,
  title,
  description,
  error,
  onSubmit,
  className = '',
  ...props
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-100">
          {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
      )}

      {error && (
        <div className="px-6 pt-4 -mb-2">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-500"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 7a1 1 0 012 0v5a1 1 0 11-2 0V7zm1 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} {...props}>
        <div className="px-6 py-4 space-y-4">{children}</div>
      </form>
    </div>
  );
};

export default Form;
