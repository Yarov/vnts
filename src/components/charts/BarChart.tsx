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

  // Colores primarios para las barras (puedes ajustar según tu paleta)
  const PRIMARY_COLORS = [
    'var(--primary-color)', // primary color
    'rgba(59, 130, 246, 0.85)', // blue-500
    'rgba(16, 185, 129, 0.85)', // emerald-500
    'rgba(245, 158, 11, 0.85)', // amber-500
    'rgba(239, 68, 68, 0.85)', // red-500
    'rgba(236, 72, 153, 0.85)', // pink-500
    'rgba(168, 85, 247, 0.85)', // purple-500
  ];

  // Datos formateados para Chart.js
  const chartData = {
    labels: chartLabels,
    datasets: chartDatasets.map((dataset, idx) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.backgroundColor || chartLabels.map((_, i) => PRIMARY_COLORS[i % PRIMARY_COLORS.length]),
      borderColor: dataset.borderColor || 'var(--primary-600)',
      borderWidth: dataset.borderWidth || 0,
      borderRadius: 10,
      maxBarThickness: 40,
      minBarLength: 2,
    })),
  };

  // Configuración de opciones
  const defaultOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: chartDatasets.length > 1,
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
          size: 18,
          weight: 'bold',
        },
        color: 'var(--primary-color)',
        padding: { top: 8, bottom: 16 },
      },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.97)',
        titleColor: 'var(--primary-color)',
        bodyColor: '#1e293b',
        borderColor: 'var(--primary-color)',
        borderWidth: 1.5,
        padding: 14,
        boxWidth: 12,
        boxHeight: 12,
        usePointStyle: true,
        titleFont: { size: 16, weight: 'bold' },
        bodyFont: { size: 15 },
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
            size: 13,
            weight: 'bold'
          },
          color: 'var(--primary-color)',
        },
        ticks: {
          color: 'var(--primary-color)',
          font: { size: 13 },
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
          color: 'rgba(124,58,237,0.08)'
        }
      },
      x: {
        ticks: {
          color: '#6366f1',
          font: { size: 13 },
        },
        grid: {
          display: false
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 10
      }
    },
    animation: {
      duration: 900,
      easing: 'easeOutQuart'
    }
  };

  // Combinar las opciones personalizadas con las predeterminadas
  const mergedOptions = {
    ...defaultOptions,
    ...customOptions
  };

  return (
    <div className={className}>
      <Bar options={mergedOptions} data={chartData} />
    </div>
  );
}
