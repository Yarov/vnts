import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import Card from '../ui/Card';

// Registrar los componentes necesarios de ChartJS
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface PieChartProps {
  title: string;
  labels: string[];
  data: number[];
  backgroundColor?: string[];
  borderColor?: string[];
  className?: string;
}

export default function PieChart({
  title,
  labels,
  data,
  backgroundColor = [
    'var(--primary-color)',
    'rgba(59, 130, 246, 0.7)', // blue-500
    'rgba(99, 102, 241, 0.7)', // indigo-500
    'rgba(16, 185, 129, 0.7)', // emerald-500
    'rgba(245, 158, 11, 0.7)', // amber-500
    'rgba(239, 68, 68, 0.7)', // red-500
    'rgba(236, 72, 153, 0.7)', // pink-500
    'rgba(168, 85, 247, 0.7)', // purple-500
  ],
  borderColor = [
    'var(--primary-600)',
    'rgb(59, 130, 246)', // blue-500
    'rgb(99, 102, 241)', // indigo-500
    'rgb(16, 185, 129)', // emerald-500
    'rgb(245, 158, 11)', // amber-500
    'rgb(239, 68, 68)', // red-500
    'rgb(236, 72, 153)', // pink-500
    'rgb(168, 85, 247)', // purple-500
  ],
  className = '',
}: PieChartProps) {
  // Configuración de opciones
  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 15,
          padding: 15,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw as number;
            const total = context.chart.data.datasets[0].data.reduce((a, b) => (a as number) + (b as number), 0) as number;
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}% (${value})`;
          }
        }
      }
    },
  };

  // Datos formateados para Chart.js
  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderColor,
        borderWidth: 1,
      },
    ],
  };

  return (
    <Card title={title} className={className}>
      <div className="h-64">
        <Pie options={options} data={chartData} />
      </div>
    </Card>
  );
}
