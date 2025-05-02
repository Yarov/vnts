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
    'rgba(124, 58, 237, 0.85)', // primary-600
    'rgba(99, 102, 241, 0.85)', // indigo-500
    'rgba(59, 130, 246, 0.85)', // blue-500
    'rgba(16, 185, 129, 0.85)', // emerald-500
    'rgba(251, 191, 36, 0.85)', // yellow-400
    'rgba(239, 68, 68, 0.85)',  // red-500
    'rgba(236, 72, 153, 0.85)', // pink-500
    'rgba(34, 197, 94, 0.85)',  // green-500
  ];

  // Datos formateados para Chart.js
  const chartData = {
    labels: chartLabels,
    datasets: chartDatasets.map((dataset, idx) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.backgroundColor || chartLabels.map((_, i) => PRIMARY_COLORS[i % PRIMARY_COLORS.length]),
      borderColor: dataset.borderColor || 'rgba(124, 58, 237, 1)',
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
        color: '#7c3aed',
        padding: { top: 8, bottom: 16 },
      },
      tooltip: {
        backgroundColor: 'rgba(255,255,255,0.97)',
        titleColor: '#7c3aed',
        bodyColor: '#1e293b',
        borderColor: '#7c3aed',
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
          color: '#7c3aed',
        },
        ticks: {
          color: '#6366f1',
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
