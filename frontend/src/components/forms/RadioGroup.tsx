import React from 'react';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps {
  label?: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
  disabled?: boolean;
}

const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  name,
  options,
  value,
  onChange,
  error,
  helperText,
  wrapperClassName = '',
  disabled = false,
}) => {
  return (
    <div className={wrapperClassName}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id={`${name}-${option.value}`}
                name={name}
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                disabled={disabled}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor={`${name}-${option.value}`}
                className={`font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}
              >
                {option.label}
              </label>
              {option.description && (
                <p className="text-gray-500">{option.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {error ? (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      ) : null}
    </div>
  );
};

export default RadioGroup;
