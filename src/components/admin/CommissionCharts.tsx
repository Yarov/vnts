import React from 'react';
import BarChart from '../../components/charts/BarChart';
import Card from '../../components/ui/Card';
import { ReceiptPercentIcon, ChartBarIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

type CommissionChartProps = {
  sellerCommissions: any[];
  weeklyCommissions: any[];
  onRefresh: () => void;
  isLoading: boolean;
  formatCurrency: (value: number) => string;
};

const CommissionCharts: React.FC<CommissionChartProps> = ({
  sellerCommissions,
  weeklyCommissions,
  onRefresh,
  isLoading,
  formatCurrency
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Gráfico de comisiones por vendedor */}
      <Card 
        title="Comisiones por Vendedor" 
        actions={
          <button onClick={onRefresh} className="text-purple-600 hover:text-purple-800">
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        }
      >
        <div className="h-80">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : sellerCommissions.length > 0 ? (
            <BarChart 
              data={{
                labels: sellerCommissions.map(s => s.seller_name),
                datasets: [
                  {
                    label: 'Comisión',
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1,
                    data: sellerCommissions.map(s => s.commission_amount),
                  }
                ],
              }}
              options={{
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context: any) {
                        return `Comisión: ${formatCurrency(context.parsed.x)}`;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value: any) {
                        return formatCurrency(value);
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ReceiptPercentIcon className="h-12 w-12 text-gray-300 mb-2" />
              <p>No hay datos de comisiones disponibles</p>
            </div>
          )}
        </div>
      </Card>

      {/* Gráfico de ventas vs comisiones semanales */}
      <Card 
        title="Ventas vs Comisiones (Semana)" 
        actions={
          <button onClick={onRefresh} className="text-purple-600 hover:text-purple-800">
            <ArrowPathIcon className="h-4 w-4" />
          </button>
        }
      >
        <div className="h-80">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
            </div>
          ) : weeklyCommissions.length > 0 ? (
            <BarChart 
              data={{
                labels: weeklyCommissions.map(s => s.seller_name),
                datasets: [
                  {
                    label: 'Ventas',
                    backgroundColor: 'rgba(124, 58, 237, 0.7)',
                    borderColor: 'rgb(124, 58, 237)',
                    borderWidth: 1,
                    data: weeklyCommissions.map(s => s.total_sales),
                  },
                  {
                    label: 'Comisiones',
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: 'rgb(16, 185, 129)',
                    borderWidth: 1,
                    data: weeklyCommissions.map(s => s.commission_amount),
                  }
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: function(context: any) {
                        return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value: any) {
                        return formatCurrency(value);
                      }
                    }
                  }
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ChartBarIcon className="h-12 w-12 text-gray-300 mb-2" />
              <p>No hay datos de comisiones semanales disponibles</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default CommissionCharts;
