import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ReceiptPercentIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { useAtom } from 'jotai';
import { userAtom } from '../../store/auth';
import { supabase } from '../../lib/supabase';
import StatsCard from '../../components/dashboard/StatsCard';

// Formatear número como moneda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};

export default function SellerDashboard() {
  const [user] = useAtom(userAtom);
  const [isLoading, setIsLoading] = useState(true);
  const [salesSummary, setSalesSummary] = useState({
    todaySalesCount: 0,
    todaySalesAmount: 0,
    weekSalesCount: 0,
    weekSalesAmount: 0,
    dailyChange: { value: 0, isPositive: true },
    commission: 0,
    commissionPercentage: 0
  });

  // Obtener el día actual formateado
  const currentDay = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);


  // Función para obtener datos del dashboard
  const fetchDashboardData = async () => {
    setIsLoading(true);

    try {
      // Fecha de hoy
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayStr = today.toISOString();

      // Fecha de ayer
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString();

      // Fecha de hace una semana
      const lastWeek = new Date(today);
      lastWeek.setDate(lastWeek.getDate() - 7);
      const lastWeekStr = lastWeek.toISOString();

      // Obtener ventas del vendedor
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('id, total, created_at, payment_method_id, clients(name)')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });

      if (salesError) throw salesError;

      // Filtrar ventas por fecha
      const todaySales = (salesData || []).filter(sale => sale.created_at >= todayStr);
      const yesterdaySales = (salesData || []).filter(sale => sale.created_at >= yesterdayStr && sale.created_at < todayStr);
      const weekSales = (salesData || []).filter(sale => sale.created_at >= lastWeekStr);

      // Calcular resúmenes
      const todaySalesAmount = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
      const yesterdaySalesAmount = yesterdaySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
      const weekSalesAmount = weekSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);

      // Calcular cambio porcentual
      const dailyChange = yesterdaySalesAmount === 0
        ? { value: 100, isPositive: true }
        : {
            value: Math.round((todaySalesAmount - yesterdaySalesAmount) / yesterdaySalesAmount * 100 * 10) / 10,
            isPositive: todaySalesAmount >= yesterdaySalesAmount
          };

      // Obtener la información del vendedor para saber su porcentaje de comisión
      const { data: sellerData, error: sellerError } = await supabase
        .from('sellers')
        .select('commission_percentage')
        .eq('id', user?.id)
        .single();

      if (sellerError) throw sellerError;

      // Calcular la comisión del día
      const commissionPercentage = sellerData?.commission_percentage || 0;
      const todayCommission = todaySalesAmount * (commissionPercentage / 100);

      setSalesSummary({
        todaySalesCount: todaySales.length,
        todaySalesAmount,
        weekSalesCount: weekSales.length,
        weekSalesAmount,
        dailyChange,
        commission: todayCommission,
        commissionPercentage
      });

      // Obtener detalles de métodos de pago para las ventas recientes
      const paymentMethodIds = [...new Set(salesData?.slice(0, 10).map(s => s.payment_method_id) || [])];

      const { data: paymentMethodsData } = await supabase
        .from('payment_methods')
        .select('id, name')
        .in('id', paymentMethodIds);

      const paymentMethodsMap = (paymentMethodsData || []).reduce((acc, pm) => {
        acc[pm.id] = pm.name;
        return acc;
      }, {});

      // Formatear ventas recientes
      const formattedRecentSales = (salesData || []).slice(0, 10).map(sale => ({
        ...sale,
        payment_method_name: paymentMethodsMap[sale.payment_method_id] || 'Desconocido',
        client_name: sale.clients?.name || 'Sin cliente',
        formatted_date: format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm'),
      }));

      setRecentSales(formattedRecentSales);

      // Obtener productos más vendidos por este vendedor
      const { data: topProducts } = await supabase
        .from('sale_items')
        .select(`
          id,
          product_id,
          quantity,
          subtotal,
          products(name),
          sales!inner(id, seller_id, created_at)
        `)
        .eq('sales.seller_id', user?.id)
        .order('quantity', { ascending: false });

      // Agrupar por producto
      const productSales = {};
      (topProducts || []).forEach(item => {
        const productId = item.product_id;
        const productName = item.products?.name || 'Producto desconocido';

        if (!productSales[productId]) {
          productSales[productId] = {
            id: productId,
            name: productName,
            quantity: 0,
            total: 0,
          };
        }

        productSales[productId].quantity += item.quantity;
        productSales[productId].total += parseFloat(item.subtotal);
      });

      // Convertir a array y ordenar
      const topSellingProductsArray = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setTopSellingProducts(topSellingProductsArray);

      // Obtener datos para gráfico de líneas (ventas diarias)
      const past7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - i));
        return {
          date,
          dateStr: format(date, 'yyyy-MM-dd'),
          formattedDate: format(date, 'dd MMM', { locale: es }),
          sales: 0
        };
      });

      // Agrupar ventas por día
      salesData?.forEach(sale => {
        const saleDate = format(new Date(sale.created_at), 'yyyy-MM-dd');
        const dayData = past7Days.find(d => d.dateStr === saleDate);

        if (dayData) {
          dayData.sales += parseFloat(sale.total);
        }
      });

      setDailySalesData(past7Days);

    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-1 text-gray-800">Mi Panel</h2>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>{currentDay}</span>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatsCard
          title="Ventas del Día"
          value={formatCurrency(salesSummary.todaySalesAmount)}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          change={salesSummary.dailyChange}
          footer={`${salesSummary.todaySalesCount} venta${salesSummary.todaySalesCount !== 1 ? 's' : ''} hoy`}
          className="bg-gradient-to-br from-primary-50 to-white"
        />
        <StatsCard
          title="Comisión del Día"
          value={formatCurrency(salesSummary.commission)}
          icon={<ReceiptPercentIcon className="h-6 w-6" />}
          footer={`${salesSummary.commissionPercentage}% sobre ventas`}
          className="bg-gradient-to-br from-green-50 to-white"
        />
        <StatsCard
          title="Transacciones Totales"
          value={salesSummary.weekSalesCount}
          icon={<ShoppingCartIcon className="h-6 w-6" />}
          footer="Esta semana"
          className="bg-gradient-to-br from-primary-50 to-white"
        />
      </div>
    </div>
  );
}