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
    <div className={`stats-card rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden ${className}`}>
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-gray-500">{title}</h2>
            <div className="stat-value text-2xl md:text-3xl font-bold text-gray-800">
              {value}
            </div>
            
            {change && (
              <div
                className={`flex items-center text-sm font-medium ${
                  change.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change.isPositive ? (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                )}
                <span>{Math.abs(change.value)}%</span>
              </div>
            )}
          </div>
          
          {icon && (
            <div className="rounded-full bg-primary-100 p-3 flex items-center justify-center text-primary-600">
              {icon}
            </div>
          )}
        </div>
      </div>
      
      {footer && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <div className="text-xs text-gray-500">{footer}</div>
        </div>
      )}
    </div>
  );
}
