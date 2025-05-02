import { format, subDays, subWeeks, startOfDay, endOfDay } from 'date-fns';

/**
 * Obtiene fecha actual al inicio del día
 * @returns Date object
 */
export const getCurrentDate = (): Date => {
  return startOfDay(new Date());
};

/**
 * Obtiene fecha del día anterior
 * @returns Date object
 */
export const getYesterdayDate = (): Date => {
  const today = startOfDay(new Date());
  return subDays(today, 1);
};

/**
 * Obtiene fecha de inicio de la semana actual
 * @returns Date object
 */
export const getWeekStartDate = (): Date => {
  const today = startOfDay(new Date());
  return subDays(today, today.getDay());
};

/**
 * Obtiene fecha de inicio de la semana pasada
 * @returns Date object
 */
export const getPreviousWeekStartDate = (): Date => {
  return subWeeks(getWeekStartDate(), 1);
};

/**
 * Obtiene un array de fechas para los últimos n días
 * @param days Número de días a obtener
 * @returns Array de objetos de fecha con formato
 */
export const getPastDays = (days: number): Array<{
  date: Date;
  dateStr: string;
  formattedDate: string;
}> => {
  const now = new Date();

  return Array.from({ length: days }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - 1 - i));

    return {
      date,
      dateStr: format(date, 'yyyy-MM-dd'),
      formattedDate: format(date, 'dd MMM')
    };
  });
};

/**
 * Crea un filtro de rango de fechas
 * @param startDate Fecha inicio (opcional)
 * @param endDate Fecha fin (opcional)
 * @returns Objeto con fechas formateadas como ISO string
 */
export const createDateFilter = (startDate?: Date, endDate?: Date) => {
  return {
    start: startDate ? startOfDay(startDate).toISOString() : null,
    end: endDate ? endOfDay(endDate).toISOString() : null
  };
};

/**
 * Obtiene el rango de fechas para hoy
 * @returns Objeto con fecha inicio y fin de hoy
 */
export const getTodayRange = () => {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    start: today.toISOString(),
    end: tomorrow.toISOString()
  };
};
