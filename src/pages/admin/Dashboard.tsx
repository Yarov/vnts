import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CurrencyDollarIcon,
  ReceiptPercentIcon,
  ShoppingBagIcon,
  UserGroupIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import StatsCard from '../../components/dashboard/StatsCard';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';

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
    productCount: 0,
    dailyChange: { value: 0, isPositive: true },
    weeklyChange: { value: 0, isPositive: true }
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [sellerSales, setSellerSales] = useState<any[]>([]);
  const [sellerCommissions, setSellerCommissions] = useState<any[]>([]);
  const [topClients, setTopClients] = useState<any[]>([]);
  const [dailySalesData, setDailySalesData] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState('week');

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
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        const prevWeek = new Date(lastWeek);
        prevWeek.setDate(prevWeek.getDate() - 7);

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

        setSalesSummary({
          totalSales: totalSalesAmount,
          dailySales: dailySalesAmount,
          weeklySales: weeklySalesAmount,
          productCount: productsData?.length || 0,
          dailyChange,
          weeklyChange
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
        })).sort((a, b) => b.total - a.total);

        setSellerSales(sellerSalesArray);
        
        // Obtener comisiones de vendedores para hoy
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const tomorrow = new Date(todayStart);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const { data: commissionData } = await supabase
          .rpc('get_all_seller_commissions', {
            start_date: todayStart.toISOString(),
            end_date: tomorrow.toISOString()
          });
          
        setSellerCommissions(commissionData || []);

        // Obtener clientes frecuentes
        const { data: clientsData } = await supabase
          .rpc('get_top_clients', { limit_count: 5 });

        setTopClients(clientsData || []);

        // Obtener datos para gráfico de líneas (ventas diarias)
        const past14Days = Array.from({ length: 14 }, (_, i) => {
          const date = new Date(now);
          date.setDate(date.getDate() - (13 - i));
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
          const dayData = past14Days.find(d => d.dateStr === saleDate);

          if (dayData) {
            dayData.sales += parseFloat(sale.total);
          }
        });

        setDailySalesData(past14Days);
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
        backgroundColor: 'rgba(124, 58, 237, 0.7)',
        borderColor: '#7c3aed',
        borderWidth: 1,
      }
    ]
  };

  // Configuración para gráfico de líneas (ventas diarias)
  const salesLineChartData = {
    labels: dailySalesData.map(day => day.formattedDate),
    datasets: [
      {
        label: 'Ventas diarias',
        data: dailySalesData.map(day => day.sales),
        borderColor: 'rgb(124, 58, 237)',
        backgroundColor: 'rgba(124, 58, 237, 0.2)',
        tension: 0.3,
        fill: true,
      }
    ]
  };

  // Columnas para tabla de productos
  const productColumns = [
    { header: 'Producto', accessor: 'name' },
    {
      header: 'Unidades vendidas',
      accessor: 'quantity',
      className: 'text-center'
    },
    {
      header: 'Total',
      accessor: (item: any) => formatCurrency(item.total),
      className: 'text-right font-medium'
    }
  ];

  // Columnas para tabla de clientes
  const clientColumns = [
    { header: 'Cliente', accessor: 'name' },
    {
      header: 'Compras',
      accessor: (item: any) => (
        <Badge color="purple" className="mx-auto">
          {item.purchase_count}
        </Badge>
      ),
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-1 text-gray-800">Panel de Control</h2>
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>{currentDay}</span>
          </div>
        </div>

      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Ventas Totales"
          value={formatCurrency(salesSummary.totalSales)}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          footer="Desde el inicio"
          className="bg-gradient-to-br from-purple-50 to-white"
        />
        <StatsCard
          title="Ventas del Día"
          value={formatCurrency(salesSummary.dailySales)}
          icon={<ReceiptPercentIcon className="h-6 w-6" />}
          change={salesSummary.dailyChange}
          footer="vs. día anterior"
          className="bg-gradient-to-br from-purple-50 to-white"
        />
        <StatsCard
          title="Ventas Semanales"
          value={formatCurrency(salesSummary.weeklySales)}
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          change={salesSummary.weeklyChange}
          footer="vs. semana anterior"
          className="bg-gradient-to-br from-purple-50 to-white"
        />
        <StatsCard
          title="Productos Activos"
          value={salesSummary.productCount}
          icon={<ShoppingBagIcon className="h-6 w-6" />}
          footer="Productos disponibles"
          className="bg-gradient-to-br from-purple-50 to-white"
        />
      </div>

      {/* Gráfico de tendencia de ventas */}
      <Card
        title="Tendencia de Ventas"
        className="mb-6"
        actions={
          <button className="text-xs text-purple-600 hover:text-purple-800 flex items-center">
            Ver detalles <ArrowRightIcon className="h-3 w-3 ml-1" />
          </button>
        }
      >
        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></span>
          </div>
        ) : (
          <div className="h-72">
            <LineChart
              labels={salesLineChartData.labels}
              datasets={salesLineChartData.datasets}
            />
          </div>
        )}
      </Card>

      {/* Gráfico de ventas por vendedor y tabla de productos más vendidos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card
          title="Ventas por Vendedor"
          className="h-full"
          actions={
            <button className="text-xs text-purple-600 hover:text-purple-800 flex items-center">
              Ver detalle <ArrowRightIcon className="h-3 w-3 ml-1" />
            </button>
          }
        >
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></span>
            </div>
          ) : (
            <div className="h-72">
              <BarChart
                labels={sellerChartData.labels}
                datasets={sellerChartData.datasets}
                yAxisLabel=""
              />
            </div>
          )}
        </Card>

        {/* Tabla de productos más vendidos */}
        <Card
          title="Productos Más Vendidos"
          className="h-full"
          actions={
            <button className="text-xs text-purple-600 hover:text-purple-800 flex items-center">
              Ver todos <ArrowRightIcon className="h-3 w-3 ml-1" />
            </button>
          }
        >
          {isLoading ? (
            <div className="flex justify-center py-8">
              <span className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></span>
            </div>
          ) : (
            <Table
              columns={productColumns}
              data={topProducts}
              keyExtractor={(item) => item.id}
              isLoading={false}
              emptyMessage="No hay datos de productos vendidos"
              className="overflow-hidden"
            />
          )}
        </Card>
      </div>

      {/* Tabla de clientes frecuentes */}
      <Card
        title="Clientes Frecuentes"
        className="mb-6"
        actions={
          <button className="text-xs text-purple-600 hover:text-purple-800 flex items-center">
            Ver todos <ArrowRightIcon className="h-3 w-3 ml-1" />
          </button>
        }
      >
        <div className="flex items-center space-x-2 mb-4">
          <UserGroupIcon className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">Top clientes por frecuencia de compra</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></span>
          </div>
        ) : (
          <Table
            columns={clientColumns}
            data={topClients}
            keyExtractor={(item) => item.id}
            isLoading={false}
            emptyMessage="No hay datos de clientes frecuentes"
            className="overflow-hidden"
          />
        )}
      </Card>

      {/* Comisiones de vendedores del día */}
      <Card
        title="Comisiones del Día"
        className="mb-6"
        actions={
          <button className="text-xs text-purple-600 hover:text-purple-800 flex items-center">
            Ver histórico <ArrowRightIcon className="h-3 w-3 ml-1" />
          </button>
        }
      >
        <div className="flex items-center space-x-2 mb-4">
          <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium text-gray-700">Comisiones ganadas por vendedores hoy</span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600"></span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>Vendedor</th>
                  <th className="text-right">Ventas</th>
                  <th className="text-center">Comisión %</th>
                  <th className="text-right">Ganancia</th>
                </tr>
              </thead>
              <tbody>
                {sellerCommissions.length > 0 ? (
                  sellerCommissions.map((commission, index) => (
                    <tr key={commission.seller_id}>
                      <td>{commission.seller_name}</td>
                      <td className="text-right">{formatCurrency(commission.total_sales)}</td>
                      <td className="text-center">
                        <Badge color="purple" className="mx-auto">
                          {commission.commission_percentage}%
                        </Badge>
                      </td>
                      <td className="text-right font-medium text-green-600">
                        {formatCurrency(commission.commission_amount)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">
                      No hay comisiones registradas hoy
                    </td>
                  </tr>
                )}
              </tbody>
              {sellerCommissions.length > 0 && (
                <tfoot>
                  <tr>
                    <th colSpan={3} className="text-right">Total Comisiones:</th>
                    <th className="text-right text-green-600">
                      {formatCurrency(sellerCommissions.reduce((sum, item) => sum + item.commission_amount, 0))}
                    </th>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </Card>

      {/* Estadísticas adicionales o KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="rounded-full bg-purple-100 p-3 mb-3">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Desempeño de Vendedores</h3>
              <p className="text-sm text-gray-500 mt-1">
                Ver análisis detallado de rendimiento
              </p>
              <button className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium">
                Ver reportes
              </button>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="rounded-full bg-purple-100 p-3 mb-3">
              <ShoppingBagIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Inventario de Productos</h3>
              <p className="text-sm text-gray-500 mt-1">
                Gestiona tu catálogo de productos
              </p>
              <button className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium">
                Gestionar
              </button>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <div className="flex flex-col items-center justify-center py-4">
            <div className="rounded-full bg-purple-100 p-3 mb-3">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold">Gestión de Vendedores</h3>
              <p className="text-sm text-gray-500 mt-1">
                Administra tu equipo de ventas
              </p>
              <button className="mt-3 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors text-sm font-medium">
                Gestionar
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
