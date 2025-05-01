import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCartIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

type QuickActionsProps = {
  onLogout: () => void;
  className?: string;
};

const QuickActions = ({ onLogout, className = '' }: QuickActionsProps) => {
  const navigate = useNavigate();

  const actions = [
    {
      name: 'Nueva Venta',
      description: 'Registrar una nueva transacción',
      icon: <ShoppingCartIcon className="h-6 w-6" />,
      iconColor: 'bg-primary-100 text-primary-700',
      onClick: () => navigate('/seller/new-sale')
    },
    {
      name: 'Historial',
      description: 'Ver las ventas anteriores',
      icon: <ClockIcon className="h-6 w-6" />,
      iconColor: 'bg-indigo-100 text-indigo-700',
      onClick: () => navigate('/seller/sales-history')
    },
    {
      name: 'Reportes',
      description: 'Ver estadísticas detalladas',
      icon: <ChartBarIcon className="h-6 w-6" />,
      iconColor: 'bg-green-100 text-green-700',
      onClick: () => navigate('/seller/dashboard')
    },
    {
      name: 'Cerrar Sesión',
      description: 'Finalizar y salir del sistema',
      icon: <ArrowRightOnRectangleIcon className="h-6 w-6" />,
      iconColor: 'bg-gray-100 text-gray-700',
      onClick: onLogout
    }
  ];

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Acciones Rápidas</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-200">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex flex-col items-center justify-center p-6 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className={`p-3 rounded-full ${action.iconColor} mb-3`}>
              {action.icon}
            </div>
            <span className="font-medium text-gray-900">{action.name}</span>
            <span className="text-xs text-gray-500 mt-1 text-center">{action.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
