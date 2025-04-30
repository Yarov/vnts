import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ReceiptPercentIcon,
} from '@heroicons/react/24/outline';
import { useAtom } from 'jotai';
import { userAtom } from '../../store/auth';
import { supabase } from '../../lib/supabase';
import Card from '../../components/ui/Card';
import StatsCard from '../../components/dashboard/StatsCard';
import Table from '../../components/ui/Table';

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
  });
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [topSellingProducts, setTopSellingProducts] = useState<any[]>([]);
  
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
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      
      // Fecha de hace una semana
      const lastWeek = new Date();
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
      const todaySales = (salesData || []).filter(sale => sale.created_at >= today);
      const weekSales = (salesData || []).filter(sale => sale.created_at >= lastWeekStr);
      
      // Calcular resúmenes
      const todaySalesAmount = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
      const weekSalesAmount = weekSales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
      
      setSalesSummary({
        todaySalesCount: todaySales.length,
        todaySalesAmount,
        weekSalesCount: weekSales.length,
        weekSalesAmount,
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
          sales!inner(id, seller_id)
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
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Columnas para tabla de ventas recientes
  const recentSalesColumns = [
    { 
      header: 'Fecha', 
      accessor: 'formatted_date',
    },
    { 
      header: 'Cliente', 
      accessor: 'client_name',
    },
    { 
      header: 'Método de pago', 
      accessor: 'payment_method_name',
    },
    { 
      header: 'Total', 
      accessor: (sale: any) => formatCurrency(parseFloat(sale.total)),
      className: 'text-right font-medium'
    },
  ];
  
  // Columnas para tabla de productos más vendidos
  const topProductsColumns = [
    { 
      header: 'Producto', 
      accessor: 'name',
    },
    { 
      header: 'Unidades', 
      accessor: 'quantity',
      className: 'text-center'
    },
    { 
      header: 'Total', 
      accessor: (product: any) => formatCurrency(product.total),
      className: 'text-right font-medium'
    },
  ];

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Mi Panel
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {currentDay}
          </p>
        </div>
      </div>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard 
          title="Ventas del Día"
          value={formatCurrency(salesSummary.todaySalesAmount)}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          footer={`${salesSummary.todaySalesCount} venta${salesSummary.todaySalesCount !== 1 ? 's' : ''} hoy`}
        />
        <StatsCard 
          title="Ventas de la Semana"
          value={formatCurrency(salesSummary.weekSalesAmount)}
          icon={<ReceiptPercentIcon className="h-6 w-6" />}
          footer={`Últimos 7 días`}
        />
        <StatsCard 
          title="Transacciones Totales"
          value={salesSummary.weekSalesCount}
          icon={<ShoppingCartIcon className="h-6 w-6" />}
          footer="Esta semana"
        />
      </div>
      
      {/* Tablas de productos más vendidos y ventas recientes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabla de productos más vendidos */}
        <Card title="Mis Productos Más Vendidos">
          <Table 
            columns={topProductsColumns}
            data={topSellingProducts}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            emptyMessage="No hay datos de productos vendidos todavía"
          />
        </Card>
        
        {/* Tabla de ventas recientes */}
        <Card title="Mis Ventas Recientes">
          <Table 
            columns={recentSalesColumns}
            data={recentSales}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            emptyMessage="No has registrado ventas recientemente"
          />
        </Card>
      </div>
    </div>
  );
}
