import React, { useState, useMemo } from 'react';
import {
  CreditCardIcon,
  BanknotesIcon,
  ArrowPathIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

type PaymentMethod = {
  id: string;
  name: string;
  count: number;
  total: number;
  commission?: number;
  commissionPercentage?: number;
  netAmount?: number;
};

type PaymentsByMethodCardProps = {
  title: string;
  methods: PaymentMethod[];
  className?: string;
  maxVisibleItems?: number;
};

const PaymentsByMethodCard: React.FC<PaymentsByMethodCardProps> = ({
  title,
  methods,
  className = '',
  maxVisibleItems = 4
}) => {
  // Formatear número como moneda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  // Ordenar métodos por monto (de mayor a menor)
  const sortedMethods = useMemo(() => {
    return [...methods].sort((a, b) => b.total - a.total);
  }, [methods]);

  // Determinar si hay que mostrar el "Ver más"
  const hasMoreItems = sortedMethods.length > maxVisibleItems;

  // Estado para controlar si se muestran todos los métodos
  const [showAllMethods, setShowAllMethods] = useState(false);

  // Métodos a mostrar basados en el estado
  const visibleMethods = showAllMethods ? sortedMethods :
                         hasMoreItems ? sortedMethods.slice(0, maxVisibleItems) :
                         sortedMethods;

  return (
    <div className={`bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      </div>

      <div className="py-2 px-4 overflow-y-auto" style={{ maxHeight: sortedMethods.length > 6 ? '250px' : 'auto' }}>
        {sortedMethods.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {visibleMethods.map((method) => {
              // Determine icon based on payment method name
              let icon = <CreditCardIcon className="h-5 w-5 text-[var(--primary-color)]" />;
              let bgColor = "bg-primary-50";
              const methodName = method.name.toLowerCase();

              if (methodName.includes('efectivo')) {
                icon = <BanknotesIcon className="h-5 w-5 text-green-500" />;
                bgColor = "bg-green-50";
              } else if (methodName.includes('transferencia')) {
                icon = <ArrowPathIcon className="h-5 w-5 text-[var(--primary-color)]" />;
                bgColor = "bg-primary-50";
              } else if (methodName.includes('débito')) {
                icon = <CreditCardIcon className="h-5 w-5 text-[var(--primary-color)]" />;
                bgColor = "bg-primary-50";
              } else if (methodName.includes('crédito')) {
                icon = <CreditCardIcon className="h-5 w-5 text-[var(--primary-color)]" />;
                bgColor = "bg-primary-50";
              }

              return (
                <div key={method.id} className="py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-full ${bgColor} mr-3`}>
                        {icon}
                      </div>
                      <span className="text-sm font-medium text-gray-700">{method.name}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-semibold text-gray-800">{formatCurrency(method.total)}</span>
                      <span className="text-xs text-gray-500">{method.count} {method.count === 1 ? 'venta' : 'ventas'}</span>
                    </div>
                  </div>
                  {/* Mostrar desglose de comisiones si existen */}
                  {method.commission !== undefined && method.commission > 0 && (
                    <div className="ml-14 mt-2 text-xs space-y-1">
                      <div className="flex justify-between text-red-600">
                        <span>- Comisión método ({method.commissionPercentage}%)</span>
                        <span>-{formatCurrency(method.commission)}</span>
                      </div>
                      <div className="flex justify-between text-green-600 font-medium">
                        <span>= Monto neto</span>
                        <span>{formatCurrency(method.netAmount || 0)}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {hasMoreItems && (
              <div className="py-2 text-center">
                <button
                  onClick={() => setShowAllMethods(!showAllMethods)}
                  className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                >
                  {showAllMethods ? 'Mostrar menos' : `Ver todos (${sortedMethods.length})`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-gray-500">
            <div className="bg-gray-50 p-3 rounded-full mb-2">
              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">Sin registros hoy</p>
          </div>
        )}
      </div>

      {/* Footer with total */}
      {sortedMethods.length > 0 && (
        <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Total</span>
            <span className="text-2xl md:text-3xl font-bold text-gray-800">
              {formatCurrency(sortedMethods.reduce((sum, method) => sum + method.total, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsByMethodCard;