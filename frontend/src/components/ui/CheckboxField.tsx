import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  helper?: string;
}

const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, helper, className = '', ...rest }, ref) => {
    return (
      <div className="flex items-start mb-4">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            {...rest}
          />
        </div>
        <div className="ml-2 text-sm">
          <label className="font-medium text-gray-700">
            {label}
          </label>
          {helper && (
            <p className="text-gray-500">{helper}</p>
          )}
        </div>
      </div>
    );
  }
);

CheckboxField.displayName = 'CheckboxField';

export default CheckboxField;
