import { useState, useEffect } from 'react';
import { getDashboardData } from '../services/dashboardService';
import { formatCurrency, formatDate, formatDayMonthLong } from '../utils/formatters';

export function useAdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [salesSummary, setSalesSummary] = useState({
    totalSales: 0,
    dailySales: 0,
    weeklySales: 0,
    productCount: 0,
    dailyChange: { value: 0, isPositive: true },
    weeklyChange: { value: 0, isPositive: true }
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [sellerCommissions, setSellerCommissions] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);

  // Obtener el día actual formateado
  const currentDay = formatDayMonthLong(new Date());

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const dashboardData = await getDashboardData();
        setSalesSummary(dashboardData.salesSummary);
        setTopProducts(dashboardData.topProducts || []);
        setSellerCommissions(dashboardData.sellerCommissions || []);
        setTopClients(dashboardData.topClients || []);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return {
    isLoading,
    salesSummary,
    topProducts,
    sellerCommissions,
    topClients,
    currentDay,
    formatCurrency,
    formatDate
  };
}