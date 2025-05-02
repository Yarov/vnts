import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { salesAtom, loadingSalesAtom, salesDateFilterAtom, salesSellerFilterAtom, filteredSalesAtom } from '../store/sales';
import { getSalesWithDetails } from '../services/salesService';
import { getDateRangeFromValue } from '../utils/reportUtils';

/**
 * Hook para gestionar ventas con filtros y paginación
 * @param initialDateRange Valor inicial del rango de fechas
 * @param initialSellerId ID inicial del vendedor
 * @returns Objeto con estados y funciones para manejar ventas
 */
export function useSales(
  initialDateRange: string = 'last7days',
  initialSellerId: string = ''
) {
  // Estados de Jotai
  const [, setSales] = useAtom(salesAtom);
  const [loading, setLoading] = useAtom(loadingSalesAtom);
  const [dateFilter, setDateFilter] = useAtom(salesDateFilterAtom);
  const [sellerFilter, setSellerFilter] = useAtom(salesSellerFilterAtom);
  const [filteredSales] = useAtom(filteredSalesAtom);

  // Estados locales
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [dateRangeValue, setDateRangeValue] = useState(initialDateRange);
  const [customDateRange, setCustomDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({ start: null, end: null });

  // Efecto para cargar ventas cuando cambian los filtros
  useEffect(() => {
    loadSales();
  }, [dateRangeValue, customDateRange]);

  // Inicialización
  useEffect(() => {
    // Establecer filtro de vendedor si se proporciona
    if (initialSellerId) {
      setSellerFilter(initialSellerId);
    }

    // Establecer filtro de fecha inicial
    updateDateRange(initialDateRange);
  }, []);

  // Función para actualizar el rango de fechas
  const updateDateRange = (value: string) => {
    setDateRangeValue(value);

    if (value !== 'custom') {
      const { start, end } = getDateRangeFromValue(value);
      setDateFilter({
        start: start.toISOString(),
        end: end.toISOString()
      });
    }
  };

  // Función para establecer rango personalizado
  const setCustomRange = (start: Date | null, end: Date | null) => {
    setCustomDateRange({ start, end });

    if (start && end) {
      setDateFilter({
        start: start.toISOString(),
        end: end.toISOString()
      });
    }
  };

  // Función para cargar ventas con los filtros actuales
  const loadSales = async () => {
    setLoading(true);

    try {
      const salesData = await getSalesWithDetails(
        dateFilter.start || undefined,
        dateFilter.end || undefined,
        sellerFilter || undefined
      );

      setSales(salesData as any);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error al cargar ventas:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar el filtro de vendedor
  const updateSellerFilter = (sellerId: string) => {
    setSellerFilter(sellerId);
    loadSales();
  };

  // Calcular paginación
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Cambiar página
  const changePage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Cambiar items por página
  const changeItemsPerPage = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  return {
    sales: paginatedSales,
    allSales: filteredSales,
    loading,
    dateRangeValue,
    customDateRange,
    sellerFilter,
    pagination: {
      currentPage,
      totalPages,
      itemsPerPage,
      changePage,
      changeItemsPerPage
    },
    updateDateRange,
    setCustomRange,
    updateSellerFilter,
    refreshSales: loadSales
  };
}