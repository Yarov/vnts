import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea un número como moneda (MXN)
 * @param value Valor numérico a formatear
 * @returns Cadena formateada como moneda
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};

/**
 * Formatea una fecha en formato local español
 * @param date Fecha a formatear
 * @param formatStr Cadena de formato (formato date-fns)
 * @returns Cadena formateada
 */
export const formatDate = (date: Date | string, formatStr: string = 'dd/MM/yyyy'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: es });
};

/**
 * Formatea una fecha como "día de la semana d de mes"
 * @param date Fecha a formatear
 * @returns Cadena formateada (ej: "Lunes 1 de Enero")
 */
export const formatDayMonthLong = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, "EEEE d 'de' MMMM", { locale: es });
};

/**
 * Formatea porcentaje con precisión especificada
 * @param value Valor a formatear
 * @param precision Decimales a mantener
 * @returns Cadena formateada con el porcentaje
 */
export const formatPercentage = (value: number, precision: number = 1): string => {
  return `${Math.round(value * 10 ** precision) / 10 ** precision}%`;
};
