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
import { useRef } from 'react';

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

interface AreaChartProps {
  title?: string;
  labels: string[];
  data: number[];
  yAxisLabel?: string;
  className?: string;
}

export default function AreaChart({
  title,
  labels,
  data,
  yAxisLabel = '',
  className = '',
}: AreaChartProps) {
  const chartRef = useRef<any>(null);

  // Gradiente dinámico para el área
  const getGradient = (ctx: CanvasRenderingContext2D, area: any) => {
    const gradient = ctx.createLinearGradient(0, area.top, 0, area.bottom);
    gradient.addColorStop(0, 'rgba(124, 58, 237, 0.22)'); // primary-600
    gradient.addColorStop(1, 'rgba(124, 58, 237, 0.04)');
    return gradient;
  };

  // Si no hay datos, mostrar mensaje amigable
  if (!data || data.length === 0) {
    return (
      <div className={className + ' flex items-center justify-center min-h-[220px] text-gray-400 text-base'}>
        No hay datos para mostrar en la gráfica
      </div>
    );
  }

  // Chart.js permite usar función para backgroundColor
  const chartData = {
    labels,
    datasets: [
      {
        label: title || 'Serie',
        data,
        fill: true,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return 'rgba(124, 58, 237, 0.12)';
          return getGradient(ctx, chartArea);
        },
        borderColor: 'rgba(124, 58, 237, 1)', // primary-600
        pointBackgroundColor: 'rgba(99, 102, 241, 1)', // indigo-500
        pointBorderColor: '#fff',
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBorderWidth: 2,
        tension: 0.45, // curva suave
        borderWidth: 3.5,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: !!title,
        text: title,
        font: { size: 18, weight: 'bold' },
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
        titleFont: { size: 16, weight: 'bold' },
        bodyFont: { size: 15 },
        callbacks: {
          label: function(context) {
            let label = '';
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
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: !!yAxisLabel,
          text: yAxisLabel,
          font: { size: 13, weight: 'bold' },
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
      line: {
        borderJoinStyle: 'round',
      },
      point: {
        radius: 4,
        hoverRadius: 7,
        borderWidth: 2,
      }
    },
    animation: {
      duration: 900,
      easing: 'easeOutQuart'
    }
  };

  return (
    <div className={className} style={{ minHeight: 260 }}>
      <Line ref={chartRef} options={options} data={chartData} />
    </div>
  );
}