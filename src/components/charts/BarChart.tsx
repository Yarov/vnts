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
  title?: string;
  data?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
      borderWidth?: number;
    }[];
  };
  labels?: string[];
  datasets?: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
  options?: any;
  yAxisLabel?: string;
  className?: string;
}

export default function BarChart({
  title,
  data,
  labels: propLabels,
  datasets: propDatasets,
  options: customOptions,
  yAxisLabel = '',
  className = '',
}: BarChartProps) {
  // Manejo de propiedades alternativas (retrocompatibilidad)
  const useNewApi = !!data;
  const chartLabels = useNewApi ? data?.labels : propLabels;
  const chartDatasets = useNewApi ? data?.datasets : propDatasets;
  
  // Si no hay datos, devolver un div vacío
  if (!chartLabels || !chartDatasets || chartLabels.length === 0) {
    console.warn('BarChart: Missing or empty data');
    return <div className={className}></div>;
  }
  // Configuración de opciones
  const defaultOptions: ChartOptions<'bar'> = {
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
        boxWidth: 10,
        boxHeight: 10,
        usePointStyle: true,
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
          font: {
            size: 12,
            weight: '500'
          }
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
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.6)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 4
      }
    }
  };

  // Combinar las opciones personalizadas con las predeterminadas
  const mergedOptions = {
    ...defaultOptions,
    ...customOptions
  };

  // Datos formateados para Chart.js
  const chartData = {
    labels: chartLabels,
    datasets: chartDatasets.map(dataset => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.backgroundColor || 'rgba(124, 58, 237, 0.7)',
      borderColor: dataset.borderColor || 'rgb(124, 58, 237)',
      borderWidth: dataset.borderWidth || 0,
      borderRadius: 4,
      maxBarThickness: 32
    })),
  };

  return (
    <div className={className}>
      <Bar options={mergedOptions} data={chartData} />
    </div>
  );
}
