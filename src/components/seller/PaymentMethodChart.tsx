import React, { useMemo } from 'react';

type PaymentMethod = {
  id: string;
  name: string;
  total: number;
  count: number;
};

type PaymentMethodChartProps = {
  paymentMethods: PaymentMethod[];
  className?: string;
};

const PaymentMethodChart = ({ paymentMethods, className = '' }: PaymentMethodChartProps) => {
  // Preparar datos para el gráfico
  const chartData = useMemo(() => {
    return paymentMethods.map(method => ({
      name: method.name,
      value: method.total
    }));
  }, [paymentMethods]);

  // Colores para los métodos de pago más comunes
  const getMethodColor = (methodName: string, index: number) => {
    const lowerName = methodName.toLowerCase();

    if (lowerName.includes('efectivo')) {
      return '#10B981'; // verde
    } else if (lowerName.includes('tarjeta') && lowerName.includes('crédito')) {
      return '#3B82F6'; // azul
    } else if (lowerName.includes('tarjeta') && lowerName.includes('débito')) {
      return '#6366F1'; // indigo
    } else if (lowerName.includes('transferencia')) {
      return '#8B5CF6'; // púrpura
    } else {
      // Colores de fallback
      const colors = ['#F59E0B', '#EC4899', '#14B8A6', '#EF4444', '#F97316'];
      return colors[index % colors.length];
    }
  };

  // Asignar colores a los datos
  const colors = chartData.map((item, index) => getMethodColor(item.name, index));

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Distribución de Pagos</h3>
      </div>

      <div className="p-6">
        {paymentMethods.length === 0 ? (
          <div className="flex justify-center items-center py-10 text-gray-500">
            <p>No hay datos disponibles</p>
          </div>
        ) : (
          <div style={{ height: '250px' }}>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethodChart;
