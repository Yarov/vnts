import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  actions?: ReactNode;
}

export default function Card({ title, children, className = '', footer, actions }: CardProps) {
  return (
    <div className={`bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
}
