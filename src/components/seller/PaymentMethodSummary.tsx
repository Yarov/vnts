import React from 'react';
import { CreditCardIcon, BanknotesIcon, ArrowPathIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

type PaymentMethod = {
  id: string;
  name: string;
  total: number;
  count: number;
};

type PaymentMethodSummaryProps = {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};

// Función para determinar el icono basado en el nombre del método de pago
const getPaymentIcon = (methodName: string) => {
  const lowerName = methodName.toLowerCase();
  
  if (lowerName.includes('efectivo')) {
    return <BanknotesIcon className="h-6 w-6 text-green-500" />;
  } else if (lowerName.includes('tarjeta') || lowerName.includes('crédito') || lowerName.includes('débito')) {
    return <CreditCardIcon className="h-6 w-6 text-blue-500" />;
  } else if (lowerName.includes('transferencia')) {
    return <ArrowPathIcon className="h-6 w-6 text-purple-500" />;
  } else {
    return <CurrencyDollarIcon className="h-6 w-6 text-gray-500" />;
  }
};

const PaymentMethodSummary = ({ paymentMethods, isLoading }: PaymentMethodSummaryProps) => {
  // Calcular el total general
  const totalAmount = paymentMethods.reduce((sum, method) => sum + method.total, 0);
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Ventas por Método de Pago</h3>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : paymentMethods.length === 0 ? (
        <div className="px-6 py-8 text-center text-gray-500">
          <p>No hay ventas registradas hoy</p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {paymentMethods.map((method) => (
              <li key={method.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-gray-100 mr-4">
                    {getPaymentIcon(method.name)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{method.name}</p>
                    <p className="text-sm text-gray-500">{method.count} {method.count === 1 ? 'venta' : 'ventas'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(method.total)}</p>
                  <p className="text-sm text-gray-500">
                    {totalAmount > 0 ? `${Math.round((method.total / totalAmount) * 100)}%` : '0%'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="px-6 py-4 bg-gray-50 border-t">
            <div className="flex justify-between items-center">
              <p className="font-medium text-gray-700">Total del día</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentMethodSummary;
