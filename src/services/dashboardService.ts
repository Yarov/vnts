import { supabase } from '../lib/supabase';
import { getTodayRange } from '../utils/dateUtils';
import { getAllSellerCommissions } from './authService';
import { getTopProducts } from './productService';
import { getTopClients } from './clientService';

/**
 * Obtiene el resumen de ventas diarias y semanales
 * @returns Objeto con información resumida de ventas
 */
export const getSalesSummary = async () => {
  try {
    // Obtener todas las ventas
    const { data: salesData, error: salesError } = await supabase
      .from('sales')
      .select('id, total, created_at');

    if (salesError) throw salesError;

    // Obtener conteo de productos activos
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id')
      .eq('active', true);

    if (productsError) throw productsError;

    // Definir períodos de tiempo
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const prevWeek = new Date(lastWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);

    // Filtrar ventas por período
    const todaySales = salesData?.filter(sale =>
      new Date(sale.created_at) >= today
    ) || [];

    const yesterdaySales = salesData?.filter(sale =>
      new Date(sale.created_at) >= yesterday && new Date(sale.created_at) < today
    ) || [];

    const weeklySales = salesData?.filter(sale =>
      new Date(sale.created_at) >= lastWeek
    ) || [];

    const prevWeeklySales = salesData?.filter(sale =>
      new Date(sale.created_at) >= prevWeek && new Date(sale.created_at) < lastWeek
    ) || [];

    // Calcular totales
    const totalSalesAmount = salesData?.reduce((sum, sale) => sum + parseFloat(sale.total), 0) || 0;
    const dailySalesAmount = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const yesterdaySalesAmount = yesterdaySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const weeklySalesAmount = weeklySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    const prevWeeklySalesAmount = prevWeeklySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);

    // Calcular cambios porcentuales
    const dailyChange = yesterdaySalesAmount === 0
      ? { value: 100, isPositive: true }
      : {
          value: Math.round((dailySalesAmount - yesterdaySalesAmount) / yesterdaySalesAmount * 100 * 10) / 10,
          isPositive: dailySalesAmount >= yesterdaySalesAmount
        };

    const weeklyChange = prevWeeklySalesAmount === 0
      ? { value: 100, isPositive: true }
      : {
          value: Math.round((weeklySalesAmount - prevWeeklySalesAmount) / prevWeeklySalesAmount * 100 * 10) / 10,
          isPositive: weeklySalesAmount >= prevWeeklySalesAmount
        };

    return {
      totalSales: totalSalesAmount,
      dailySales: dailySalesAmount,
      weeklySales: weeklySalesAmount,
      productCount: productsData?.length || 0,
      dailyChange,
      weeklyChange
    };
  } catch (error) {
    console.error('Error al obtener resumen de ventas:', error);
    return {
      totalSales: 0,
      dailySales: 0,
      weeklySales: 0,
      productCount: 0,
      dailyChange: { value: 0, isPositive: true },
      weeklyChange: { value: 0, isPositive: true }
    };
  }
};

/**
 * Obtiene ventas agrupadas por vendedor para un periodo
 * @param startDate Fecha de inicio
 * @returns Array de ventas por vendedor
 */
export const getSellerSales = async (startDate?: Date) => {
  try {
    const lastWeek = startDate || new Date();
    if (!startDate) {
      lastWeek.setDate(lastWeek.getDate() - 7);
    }

    const { data: sellerData } = await supabase
      .from('sales')
      .select(`
        seller_id,
        sellers!inner(name),
        total
      `)
      .gte('created_at', lastWeek.toISOString());

    // Agrupar ventas por vendedor
    const sellerSalesMap = (sellerData || []).reduce((acc: { [key: string]: any }, sale) => {
      const sellerName = sale.sellers[0]?.name;

      if (!acc[sellerName]) {
        acc[sellerName] = {
          seller_id: sale.seller_id,
          name: sellerName,
          total: 0
        };
      }

      acc[sellerName].total += parseFloat(sale.total);
      return acc;
    }, {});

    return Object.values(sellerSalesMap).sort((a: any, b: any) => b.total - a.total);
  } catch (error) {
    console.error('Error al obtener ventas por vendedor:', error);
    return [];
  }
};

/**
 * Obtiene datos completos para el dashboard
 * @returns Objeto con todos los datos del dashboard
 */
export const getDashboardData = async () => {
  try {
    // Obtener resumen de ventas
    const salesSummary = await getSalesSummary();

    // Obtener productos más vendidos
    const topProducts = await getTopProducts(5);

    // Obtener ventas por vendedor
    const sellerSales = await getSellerSales();

    // Obtener comisiones de vendedores para hoy
    const { start: todayStart, end: todayEnd } = getTodayRange();
    const sellerCommissions = await getAllSellerCommissions(todayStart, todayEnd);

    // Obtener clientes frecuentes
    const topClients = await getTopClients(5);

    // Obtener datos para gráfico de líneas (ventas diarias)
    const { data: salesData } = await supabase
      .from('sales')
      .select('total, created_at');

    const past14Days = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return {
        date,
        dateStr: date.toISOString().split('T')[0],
        formattedDate: date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
        sales: 0
      };
    });

    // Agrupar ventas por día
    (salesData || []).forEach(sale => {
      const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
      const dayData = past14Days.find(d => d.dateStr === saleDate);

      if (dayData) {
        dayData.sales += parseFloat(sale.total);
      }
    });

    return {
      salesSummary,
      topProducts,
      sellerSales,
      sellerCommissions,
      topClients,
      dailySalesData: past14Days
    };
  } catch (error) {
    console.error('Error al cargar datos del dashboard:', error);
    return {
      salesSummary: {
        totalSales: 0,
        dailySales: 0,
        weeklySales: 0,
        productCount: 0,
        dailyChange: { value: 0, isPositive: true },
        weeklyChange: { value: 0, isPositive: true }
      },
      topProducts: [],
      sellerSales: [],
      sellerCommissions: [],
      topClients: [],
      dailySalesData: []
    };
  }
};
