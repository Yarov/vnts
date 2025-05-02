import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ReportCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  className?: string;
}

const ReportCard: React.FC<ReportCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-50',
  trend,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 border border-gray-100 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 ${iconBgColor} rounded-lg`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <h3 className="text-base font-medium text-gray-900">{title}</h3>
      </div>

      <p className="text-3xl font-bold text-gray-900 mb-2">
        {value}
      </p>

      {(subtitle || trend) && (
        <div className="flex items-center justify-between">
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {trend.isPositive ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
              <span>{Math.abs(trend.value)}%</span>
              {trend.label && <span className="text-gray-500 ml-1">({trend.label})</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportCard;