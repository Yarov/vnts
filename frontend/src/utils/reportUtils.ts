import { startOfDay, endOfDay, subDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Opciones predefinidas para filtros de fecha en reportes
 */
export const dateRangeOptions = [
  { label: 'Hoy', value: 'today' },
  { label: 'Ayer', value: 'yesterday' },
  { label: 'Últimos 7 días', value: 'last7days' },
  { label: 'Últimos 30 días', value: 'last30days' },
  { label: 'Este mes', value: 'thisMonth' },
  { label: 'Mes anterior', value: 'lastMonth' },
  { label: 'Personalizado', value: 'custom' }
];

/**
 * Mapea un valor de rango de fecha a fechas reales
 * @param value Valor del rango
 * @returns Objeto con fechas de inicio y fin
 */
export const getDateRangeFromValue = (value: string): { start: Date; end: Date } => {
  const now = new Date();
  const today = startOfDay(now);
  const end = endOfDay(now);

  switch (value) {
    case 'today':
      return { start: today, end };

    case 'yesterday': {
      const yesterday = subDays(today, 1);
      return {
        start: yesterday,
        end: endOfDay(yesterday)
      };
    }

    case 'last7days':
      return {
        start: subDays(today, 6),
        end
      };

    case 'last30days':
      return {
        start: subDays(today, 29),
        end
      };

    case 'thisMonth': {
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start: thisMonth,
        end
      };
    }

    case 'lastMonth': {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      return {
        start: lastMonth,
        end: subDays(thisMonth, 1)
      };
    }

    case 'custom':
    default:
      return { start: subDays(today, 30), end };
  }
};

/**
 * Genera descripción legible de un rango de fechas
 * @param start Fecha de inicio
 * @param end Fecha de fin
 * @returns Descripción del rango
 */
export const getDateRangeDescription = (start: Date, end: Date): string => {
  const formatOpt = { locale: es };

  if (format(start, 'yyyy-MM-dd') === format(end, 'yyyy-MM-dd')) {
    return `${format(start, "d 'de' MMMM 'de' yyyy", formatOpt)}`;
  }

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${format(start, "d", formatOpt)} - ${format(end, "d 'de' MMMM 'de' yyyy", formatOpt)}`;
  }

  if (start.getFullYear() === end.getFullYear()) {
    return `${format(start, "d 'de' MMMM", formatOpt)} - ${format(end, "d 'de' MMMM 'de' yyyy", formatOpt)}`;
  }

  return `${format(start, "d 'de' MMMM 'de' yyyy", formatOpt)} - ${format(end, "d 'de' MMMM 'de' yyyy", formatOpt)}`;
};

/**
 * Formatea datos para gráficos de pastel/dona
 * @param data Datos originales
 * @param labelField Campo a usar como etiqueta
 * @param valueField Campo a usar como valor
 * @param maxItems Número máximo de items (el resto se agrupa en "Otros")
 * @returns Datos formateados para gráficos
 */
export const formatPieChartData = (
  data: any[],
  labelField: string,
  valueField: string,
  maxItems: number = 5
): { label: string; value: number; color: string }[] => {
  if (!data || data.length === 0) return [];

  // Colores para las gráficas
  const colors = [
    '#8884d8',
    '#82ca9d',
    '#ffc658',
    '#ff8042',
    '#0088fe',
    '#00c49f',
    '#ffbb28',
    '#ff8042',
    '#a4de6c'
  ];

  // Clonar y ordenar datos
  const sortedData = [...data].sort((a, b) => b[valueField] - a[valueField]);

  // Si hay más items de los especificados, agrupar el resto
  if (sortedData.length > maxItems) {
    const topItems = sortedData.slice(0, maxItems);
    const otherItems = sortedData.slice(maxItems);

    const othersValue = otherItems.reduce((sum, item) => sum + Number(item[valueField]), 0);

    topItems.push({
      [labelField]: 'Otros',
      [valueField]: othersValue
    });

    return topItems.map((item, index) => ({
      label: item[labelField],
      value: Number(item[valueField]),
      color: colors[index % colors.length]
    }));
  }

  // Si no hay suficientes items, devolver todos
  return sortedData.map((item, index) => ({
    label: item[labelField],
    value: Number(item[valueField]),
    color: colors[index % colors.length]
  }));
};

/**
 * Formatea datos para gráficos de barras
 * @param data Datos originales
 * @param labelField Campo a usar como etiqueta
 * @param valueField Campo a usar como valor
 * @param maxItems Número máximo de items
 * @returns Datos formateados para gráficos
 */
export const formatBarChartData = (
  data: any[],
  labelField: string,
  valueField: string,
  maxItems: number = 10
): { name: string; value: number }[] => {
  if (!data || data.length === 0) return [];

  // Clonar y ordenar datos
  const sortedData = [...data]
    .sort((a, b) => b[valueField] - a[valueField])
    .slice(0, maxItems);

  return sortedData.map(item => ({
    name: item[labelField],
    value: Number(item[valueField])
  }));
};

/**
 * Formatea datos para gráficos de línea
 * @param data Datos originales
 * @param dateField Campo de fecha
 * @param valueField Campo de valor
 * @returns Datos formateados para gráficos
 */
export const formatLineChartData = (
  data: any[],
  dateField: string,
  valueField: string
): { date: string; value: number }[] => {
  if (!data || data.length === 0) return [];

  return data.map(item => ({
    date: format(new Date(item[dateField]), 'dd/MM/yyyy'),
    value: Number(item[valueField])
  }));
};
