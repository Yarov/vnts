import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart } from '../charts/BarChart';

type WeeklySalesData = {
  day: string;
  date: string;
  total: number;
  count: number;
};

type WeeklySalesOverviewProps = {
  data: WeeklySalesData[];
  isLoading: boolean;
  className?: string;
};

const WeeklySalesOverview = ({ data, isLoading, className = '' }: WeeklySalesOverviewProps) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      formattedDay: format(new Date(item.date), 'EEE', { locale: es }),
    }));
  }, [data]);

  const totalSales = useMemo(() => {
    return data.reduce((sum, item) => sum + item.total, 0);
  }, [data]);

  const totalCount = useMemo(() => {
    return data.reduce((sum, item) => sum + item.count, 0);
  }, [data]);

  const avgPerDay = useMemo(() => {
    return data.length > 0 ? totalSales / data.length : 0;
  }, [data, totalSales]);

  const bestDay = useMemo(() => {
    if (data.length === 0) return null;
    return data.reduce((best, current) => 
      current.total > best.total ? current : best, data[0]);
  }, [data]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(value);
  };

  return (
    <div className={`bg-white rounded-xl shadow-md overflow-hidden ${className}`}>
      <div className="px-6 py-4 bg-gray-50 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Rendimiento Semanal</h3>
        <p className="text-sm text-gray-500 mt-1">Ventas por día de la semana</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="px-6 py-10 text-center text-gray-500">
          <p>No hay datos suficientes para mostrar el rendimiento semanal</p>
        </div>
      ) : (
        <>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Ventas totales</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalSales)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Transacciones</p>
                <p className="text-xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Promedio diario</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(avgPerDay)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Mejor día</p>
                <p className="text-xl font-bold text-gray-900">
                  {bestDay ? format(new Date(bestDay.date), 'EEEE', { locale: es }) : '-'}
                </p>
              </div>
            </div>

            <div style={{ height: '300px' }}>
              <BarChart
                data={chartData}
                keys={['total']}
                indexBy="formattedDay"
                colors={['#3B82F6']}
                margin={{ top: 20, right: 20, bottom: 40, left: 60 }}
                padding={0.4}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Día',
                  legendPosition: 'middle',
                  legendOffset: 32
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                  legend: 'Ventas (MXN)',
                  legendPosition: 'middle',
                  legendOffset: -50,
                  format: value => 
                    new Intl.NumberFormat('es-MX', {
                      style: 'currency',
                      currency: 'MXN',
                      notation: 'compact'
                    }).format(value as number)
                }}
                enableLabel={true}
                labelSkipWidth={12}
                labelSkipHeight={12}
                labelFormat={value => 
                  new Intl.NumberFormat('es-MX', {
                    style: 'currency',
                    currency: 'MXN',
                    notation: 'compact'
                  }).format(value as number)
                }
                tooltip={({ indexValue, value }) => (
                  <div className="bg-white shadow-md rounded-md p-2 text-sm">
                    <strong>{indexValue}</strong>: {formatCurrency(value as number)}
                  </div>
                )}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WeeklySalesOverview;
