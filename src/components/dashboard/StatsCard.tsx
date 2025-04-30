import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  footer?: string;
  className?: string;
}

export default function StatsCard({
  title,
  value,
  icon,
  change,
  footer,
  className = '',
}: StatsCardProps) {
  return (
    <div className={`bg-white overflow-hidden shadow rounded-lg ${className}`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {icon && (
              <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                {icon}
              </div>
            )}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {change && (
                <div
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    change.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {change.isPositive ? (
                    <svg className="w-5 h-5 self-center flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 self-center flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span>{change.value}%</span>
                </div>
              )}
            </dd>
          </div>
        </div>
      </div>
      {footer && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm text-gray-500">{footer}</div>
        </div>
      )}
    </div>
  );
}
