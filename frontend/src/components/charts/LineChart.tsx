import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';

// Registrar los componentes necesarios de ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    tension?: number;
    fill?: boolean;
  }[];
  title?: string;
  yAxisLabel?: string;
  className?: string;
}

export default function LineChart({
  labels,
  datasets,
  title = '',
  yAxisLabel = '',
  className = '',
}: LineChartProps) {
  // Configuración de opciones
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      title: {
        display: !!title,
        text: title,
        font: {
          size: 16,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1f2937',
        bodyColor: '#4b5563',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('es-MX', { 
                style: 'currency', 
                currency: 'MXN',
                minimumFractionDigits: 0, 
                maximumFractionDigits: 0 
              }).format(context.parsed.y);
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
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('es-MX', { 
              style: 'currency', 
              currency: 'MXN',
              minimumFractionDigits: 0, 
              maximumFractionDigits: 0 
            }).format(value as number);
          }
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
    elements: {
      line: {
        tension: 0.3,
      },
      point: {
        radius: 3,
        hoverRadius: 6,
      }
    }
  };

  // Datos formateados para Chart.js
  const data = {
    labels,
    datasets: datasets.map(dataset => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.borderColor || 'rgb(124, 58, 237)',
      backgroundColor: dataset.backgroundColor || 'rgba(124, 58, 237, 0.2)',
      tension: dataset.tension || 0.3,
      fill: dataset.fill !== undefined ? dataset.fill : false,
    })),
  };

  return (
    <div className={className}>
      <Line options={options} data={data} />
    </div>
  );
}
