import React from 'react';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';

type DailyPaymentData = {
  date: string;
  [key: string]: string | number;
};

type PaymentMethodHistoryProps = {
  data: DailyPaymentData[];
  isLoading: boolean;
  className?: string;
};

const PaymentMethodHistory = ({
  data,
  isLoading,
  className = ''
}: PaymentMethodHistoryProps) => {
  // Obtener todos los métodos de pago únicos
  const paymentMethods = React.useMemo(() => {
    const methods = new Set<string>();
    data.forEach(day => {
      Object.keys(day).forEach(key => {
        if (key !== 'date') {
          methods.add(key);
        }
      });
    });
    return Array.from(methods);
  }, [data]);

  // Función para generar colores para los métodos de pago
  const getMethodColor = (methodName: string, index: number) => {
    const lowerName = methodName.toLowerCase();

    if (lowerName.includes('efectivo')) {
      return '#10B981'; // verde
    } else if (lowerName.includes('crédito')) {
      return '#3B82F6'; // azul
    } else if (lowerName.includes('débito')) {
      return '#6366F1'; // indigo
    } else if (lowerName.includes('transferencia')) {
      return '#8B5CF6'; // púrpura
    } else {
      // Colores de fallback
      const colors = ['#F59E0B', '#EC4899', '#14B8A6', '#EF4444', '#F97316'];
      return colors[index % colors.length];
    }
  };

  // Generar los datos para el barChart
  const chartData = React.useMemo(() => {
    // Si no hay datos, mostrar los últimos 7 días en blanco
    if (data.length === 0) {
      return Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        return {
          date: format(date, 'EEE d', { locale: es }),
          ...paymentMethods.reduce((acc, method) => ({ ...acc, [method]: 0 }), {})
        };
      });
    }

    return data.map(day => ({
      ...day,
      date: format(new Date(day.date), 'EEE d', { locale: es })
    }));
  }, [data, paymentMethods]);

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Tendencia de Ventas por Método</h3>
      </div>

    </div>
  );
};

export default PaymentMethodHistory;
