import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import Card from '../ui/Card';

// Registrar los componentes necesarios de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  title: string;
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
  yAxisLabel?: string;
  className?: string;
}

export default function BarChart({
  title,
  labels,
  datasets,
  yAxisLabel = '',
  className = '',
}: BarChartProps) {
  // Configuración de opciones
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
        }
      }
    }
  };

  // Datos formateados para Chart.js
  const data = {
    labels,
    datasets: datasets.map(dataset => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.backgroundColor || 'rgba(14, 165, 233, 0.5)', // primary-500 con opacidad
      borderColor: dataset.borderColor || 'rgb(14, 165, 233)', // primary-500
      borderWidth: dataset.borderWidth || 1,
    })),
  };

  return (
    <Card title={title} className={className}>
      <div className="h-64">
        <Bar options={options} data={data} />
      </div>
    </Card>
  );
}
