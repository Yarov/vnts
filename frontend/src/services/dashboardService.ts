import api from './api';
import { getAllSales, getSalesSummary } from './salesService';
import { getAllProducts } from './productService';
import { getTodayForAPI } from '../utils/dateUtils';

export const getDashboardData = async (organizationId: string, branchId?: string) => {
  try {
    // Obtener resumen de ventas
    const salesSummary = await getSalesSummary(organizationId, branchId);
    
    // Obtener todas las ventas para análisis
    const allSales = await getAllSales(organizationId, branchId);
    
    // Obtener productos
    const products = await getAllProducts(organizationId, true);
    
    // Calcular ventas diarias y semanales
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const prevWeek = new Date(lastWeek);
    prevWeek.setDate(prevWeek.getDate() - 7);
    
    // Filtrar ventas por período
    const todaySales = allSales.filter((sale: any) =>
      new Date(sale.created_at) >= today
    );
    
    const yesterdaySales = allSales.filter((sale: any) =>
      new Date(sale.created_at) >= yesterday && new Date(sale.created_at) < today
    );
    
    const weeklySales = allSales.filter((sale: any) =>
      new Date(sale.created_at) >= lastWeek
    );
    
    const prevWeeklySales = allSales.filter((sale: any) =>
      new Date(sale.created_at) >= prevWeek && new Date(sale.created_at) < lastWeek
    );
    
    // Calcular totales
    const totalSalesAmount = salesSummary.total_amount || 0;
    const dailySalesAmount = todaySales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0);
    const yesterdaySalesAmount = yesterdaySales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0);
    const weeklySalesAmount = weeklySales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0);
    const prevWeeklySalesAmount = prevWeeklySales.reduce((sum: number, sale: any) => sum + parseFloat(sale.total), 0);
    
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
    
    // Obtener comisiones de vendedores del día
    let sellerCommissions: any[] = [];
    try {
      const commissionsResponse = await api.get('/sales/seller_commissions/', {
        params: { 
          organization_id: organizationId,
          date: getTodayForAPI()
        }
      });
      sellerCommissions = commissionsResponse.data || [];
    } catch (error) {
      console.error('Error al obtener comisiones:', error);
    }
    
    // Obtener ventas por método de pago con comisiones (calculado en backend)
    let paymentMethodSales: any[] = [];
    try {
      const paymentResponse = await api.get('/sales/by_payment_method/', {
        params: { 
          organization_id: organizationId,
          ...(branchId && { branch_id: branchId })
        }
      });
      paymentMethodSales = paymentResponse.data || [];
    } catch (error) {
      console.error('Error al obtener ventas por método de pago:', error);
    }
    
    // Obtener productos más vendidos
    let topProducts: any[] = [];
    try {
      const productsResponse = await api.get('/sales/top_products/', {
        params: { organization_id: organizationId }
      });
      topProducts = (productsResponse.data || []).map((p: any) => ({
        id: p.product__id,
        name: p.product__name,
        quantity: p.quantity,
        total: p.total
      }));
    } catch (error) {
      console.error('Error al obtener productos más vendidos:', error);
    }
    
    // Top clientes (simplificado)
    const topClients: any[] = [];
    
    // Ventas diarias últimos 14 días
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
    allSales.forEach((sale: any) => {
      const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
      const dayData = past14Days.find(d => d.dateStr === saleDate);
      
      if (dayData) {
        dayData.sales += parseFloat(sale.total);
      }
    });
    
    return {
      salesSummary: {
        totalSales: totalSalesAmount,
        dailySales: dailySalesAmount,
        weeklySales: weeklySalesAmount,
        productCount: products.length,
        dailyChange,
        weeklyChange
      },
      topProducts,
      sellerSales: [],
      sellerCommissions,
      topClients,
      paymentMethodSales,
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
      paymentMethodSales: [],
      dailySalesData: []
    };
  }
};
