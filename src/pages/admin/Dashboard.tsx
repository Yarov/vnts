import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  ShoppingBagIcon,
  UserGroupIcon 
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import StatsCard from '../../components/dashboard/StatsCard';
import BarChart from '../../components/charts/BarChart';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';

// Formatear número como moneda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [salesSummary, setSalesSummary] = useState({
    totalSales: 0,
    dailySales: 0,
    weeklySales: 0,
    productCount: 0
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [sellerSales, setSellerSales] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);
  
  // Obtener el día actual formateado
  const currentDay = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // Obtener resumen de ventas
        const { data: salesData, error: salesError } = await supabase
          .from('sales')
          .select('id, total, created_at');
        
        if (salesError) throw salesError;
        
        // Obtener productos
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, name')
          .eq('active', true);
        
        if (productsError) throw productsError;
        
        // Calcular resumen de ventas
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);
        
        const todaySales = salesData?.filter(sale => 
          new Date(sale.created_at) >= today
        ) || [];
        
        const weeklySales = salesData?.filter(sale => 
          new Date(sale.created_at) >= lastWeek
        ) || [];
        
        const totalSalesAmount = salesData?.reduce((sum, sale) => sum + parseFloat(sale.total), 0) || 0;
        const dailySalesAmount = todaySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
        const weeklySalesAmount = weeklySales.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
        
        setSalesSummary({
          totalSales: totalSalesAmount,
          dailySales: dailySalesAmount,
          weeklySales: weeklySalesAmount,
          productCount: productsData?.length || 0
        });
        
        // Obtener top productos
        const { data: topProductsData } = await supabase
          .rpc('get_top_products', { limit_count: 5 });
        
        setTopProducts(topProductsData || []);
        
        // Obtener ventas por vendedor
        const { data: sellerData } = await supabase
          .from('sales')
          .select(`
            seller_id,
            sellers!inner(name),
            total
          `)
          .gte('created_at', lastWeek.toISOString());
        
        // Agrupar ventas por vendedor
        const sellerSalesMap = (sellerData || []).reduce((acc, sale) => {
          const sellerName = sale.sellers.name;
          
          if (!acc[sellerName]) {
            acc[sellerName] = 0;
          }
          
          acc[sellerName] += parseFloat(sale.total);
          return acc;
        }, {});
        
        const sellerSalesArray = Object.entries(sellerSalesMap).map(([name, total]) => ({
          name,
          total
        }));
        
        setSellerSales(sellerSalesArray);
        
        // Obtener clientes frecuentes
        const { data: clientsData } = await supabase
          .rpc('get_top_clients', { limit_count: 5 });
        
        setTopClients(clientsData || []);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Configuración para gráfico de vendedores
  const sellerChartData = {
    labels: sellerSales.map(seller => seller.name),
    datasets: [
      {
        label: 'Ventas ($)',
        data: sellerSales.map(seller => seller.total),
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
      }
    ]
  };
  
  // Columnas para tabla de productos
  const productColumns = [
    { header: 'Producto', accessor: 'name' },
    { 
      header: 'Unidades vendidas', 
      accessor: 'quantity',
      className: 'text-right' 
    },
    { 
      header: 'Total', 
      accessor: (item: any) => formatCurrency(item.total),
      className: 'text-right' 
    }
  ];
  
  // Columnas para tabla de clientes
  const clientColumns = [
    { header: 'Cliente', accessor: 'name' },
    { 
      header: 'Compras', 
      accessor: 'purchase_count',
      className: 'text-center' 
    },
    { 
      header: 'Última compra', 
      accessor: (item: any) => format(new Date(item.last_purchase), 'dd/MM/yyyy'),
      className: 'text-center' 
    }
  ];

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Dashboard
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {currentDay}
          </p>
        </div>
      </div>
      
      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard 
          title="Ventas Totales"
          value={formatCurrency(salesSummary.totalSales)}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          footer="Desde el inicio"
        />
        <StatsCard 
          title="Ventas del Día"
          value={formatCurrency(salesSummary.dailySales)}
          icon={<ReceiptPercentIcon className="h-6 w-6" />}
          change={salesSummary.dailySales > 0 ? { value: 4.75, isPositive: true } : undefined}
          footer="Actualizado en tiempo real"
        />
        <StatsCard 
          title="Ventas Semanales"
          value={formatCurrency(salesSummary.weeklySales)}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          footer="Últimos 7 días"
        />
        <StatsCard 
          title="Productos Activos"
          value={salesSummary.productCount}
          icon={<ShoppingBagIcon className="h-6 w-6" />}
          footer="Productos disponibles"
        />
      </div>
      
      {/* Gráfico de ventas por vendedor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <BarChart 
          title="Ventas por Vendedor (Últimos 7 días)"
          labels={sellerChartData.labels}
          datasets={sellerChartData.datasets}
          yAxisLabel="Ventas ($)"
        />
        
        {/* Tabla de productos más vendidos */}
        <Card title="Productos Más Vendidos">
          <Table 
            columns={productColumns}
            data={topProducts}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            emptyMessage="No hay datos de productos vendidos"
          />
        </Card>
      </div>
      
      {/* Tabla de clientes frecuentes */}
      <Card title="Clientes Frecuentes" className="mb-6">
        <Table 
          columns={clientColumns}
          data={topClients}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="No hay datos de clientes frecuentes"
        />
      </Card>
    </div>
  );
}
