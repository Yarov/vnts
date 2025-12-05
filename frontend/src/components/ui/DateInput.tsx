import React from 'react';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface DateInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  min?: string;
  max?: string;
}

const DateInput: React.FC<DateInputProps> = ({ label, value, onChange, icon, min, max }) => {
  return (
    <div className="flex flex-col w-full">
      <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
        {icon || <CalendarIcon className="h-4 w-4 text-primary-500" />} {label}
      </label>
      <div className="relative">
        <input
          type="date"
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm pl-10 pr-3 py-2"
          value={value}
          onChange={e => onChange(e.target.value)}
          min={min}
          max={max}
        />
        <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
          {icon || <CalendarIcon className="h-4 w-4 text-primary-500" />}
        </div>
      </div>
    </div>
  );
};

export default DateInput;