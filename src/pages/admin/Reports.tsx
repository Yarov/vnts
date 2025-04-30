import { useState, useEffect } from 'react';
import { format, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  CalendarIcon,
  FunnelIcon,
  ArrowDownTrayIcon 
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import BarChart from '../../components/charts/BarChart';
import Table from '../../components/ui/Table';
import { Database } from '../../types/database.types';

type Seller = Database['public']['Tables']['sellers']['Row'];
type Product = Database['public']['Tables']['products']['Row'];

// Formatear número como moneda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};

export default function Reports() {
  const [dateRange, setDateRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: startOfDay(subDays(new Date(), 30)),
    end: endOfDay(new Date())
  });
  
  const [periodFilter, setPeriodFilter] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [dailySales, setDailySales] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [averageSale, setAverageSale] = useState(0);
  
  // Cargar datos al montar el componente
  useEffect(() => {
    fetchSellers();
  }, []);
  
  // Aplicar filtros cuando cambien
  useEffect(() => {
    fetchReportData();
  }, [dateRange, selectedSellerId]);
  
  // Actualizar rango de fechas al cambiar el período
  useEffect(() => {
    const today = new Date();
    
    switch (periodFilter) {
      case 'today':
        setDateRange({
          start: startOfDay(today),
          end: endOfDay(today)
        });
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        setDateRange({
          start: startOfDay(yesterday),
          end: endOfDay(yesterday)
        });
        break;
      case 'week':
        setDateRange({
          start: startOfWeek(today, { locale: es }),
          end: endOfWeek(today, { locale: es })
        });
        break;
      case 'month':
        setDateRange({
          start: startOfMonth(today),
          end: endOfMonth(today)
        });
        break;
      case 'custom':
        // No hacer nada, se mantiene el rango personalizado
        break;
    }
  }, [periodFilter]);
  
  // Obtener vendedores
  const fetchSellers = async () => {
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) throw error;
      setSellers(data || []);
    } catch (error) {
      console.error('Error al cargar vendedores:', error);
    }
  };
  
  // Obtener datos para el reporte
  const fetchReportData = async () => {
    setIsLoading(true);
    
    try {
      const startDateStr = dateRange.start.toISOString();
      const endDateStr = dateRange.end.toISOString();
      
      // Consulta con filtros
      let query = supabase
        .from('sales')
        .select(`
          id,
          seller_id,
          client_id,
          payment_method_id,
          total,
          created_at,
          sellers(name)
        `)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr);
      
      // Filtro por vendedor
      if (selectedSellerId) {
        query = query.eq('seller_id', selectedSellerId);
      }
      
      const { data: salesData, error: salesError } = await query.order('created_at');
      
      if (salesError) throw salesError;
      
      setSalesData(salesData || []);
      
      // Calcular totales
      const total = (salesData || []).reduce((sum, sale) => sum + parseFloat(sale.total), 0);
      setTotalSales(total);
      
      const avg = salesData && salesData.length > 0 ? total / salesData.length : 0;
      setAverageSale(avg);
      
      // Obtener productos más vendidos en el período
      const { data: saleItems, error: itemsError } = await supabase
        .from('sale_items')
        .select(`
          id,
          product_id,
          quantity,
          subtotal,
          products(name),
          sales!inner(id, created_at, seller_id)
        `)
        .gte('sales.created_at', startDateStr)
        .lte('sales.created_at', endDateStr);
      
      if (itemsError) throw itemsError;
      
      // Filtro por vendedor en los items
      let filteredItems = saleItems || [];
      if (selectedSellerId) {
        filteredItems = filteredItems.filter(item => 
          item.sales.seller_id === selectedSellerId
        );
      }
      
      // Agrupar por producto
      const productMap = {};
      
      filteredItems.forEach(item => {
        const productId = item.product_id;
        const productName = item.products?.name || 'Producto desconocido';
        
        if (!productMap[productId]) {
          productMap[productId] = {
            id: productId,
            name: productName,
            quantity: 0,
            total: 0
          };
        }
        
        productMap[productId].quantity += item.quantity;
        productMap[productId].total += parseFloat(item.subtotal);
      });
      
      // Convertir a array y ordenar
      const topProductsArray = Object.values(productMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
      
      setTopProducts(topProductsArray);
      
      // Agrupar ventas por día
      const dailyMap = {};
      
      (salesData || []).forEach(sale => {
        const date = format(new Date(sale.created_at), 'yyyy-MM-dd');
        
        if (!dailyMap[date]) {
          dailyMap[date] = {
            date,
            total: 0,
            count: 0
          };
        }
        
        dailyMap[date].total += parseFloat(sale.total);
        dailyMap[date].count += 1;
      });
      
      // Convertir a array y ordenar por fecha
      const dailySalesArray = Object.values(dailyMap)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      setDailySales(dailySalesArray);
    } catch (error) {
      console.error('Error al cargar datos del reporte:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Opciones para selector de vendedores
  const sellerOptions = [
    { value: '', label: 'Todos los vendedores' },
    ...sellers.map(seller => ({
      value: seller.id,
      label: seller.name
    }))
  ];
  
  // Datos para gráfico de ventas diarias
  const dailySalesChartData = {
    labels: dailySales.map(day => format(new Date(day.date), 'dd/MM')),
    datasets: [
      {
        label: 'Ventas diarias',
        data: dailySales.map(day => day.total),
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
      }
    ]
  };
  
  // Datos para gráfico de productos más vendidos
  const topProductsChartData = {
    labels: topProducts.slice(0, 5).map(product => product.name),
    datasets: [
      {
        label: 'Ventas por producto',
        data: topProducts.slice(0, 5).map(product => product.total),
        backgroundColor: 'rgba(14, 165, 233, 0.5)',
      }
    ]
  };
  
  // Columnas para tabla de productos
  const productColumns = [
    { header: 'Producto', accessor: 'name' },
    { 
      header: 'Unidades', 
      accessor: 'quantity',
      className: 'text-center'
    },
    { 
      header: 'Total vendido', 
      accessor: (product: any) => formatCurrency(product.total),
      className: 'text-right'
    },
  ];
  
  // Columnas para tabla de ventas
  const salesColumns = [
    { 
      header: 'Fecha', 
      accessor: (sale: any) => format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm'),
    },
    { 
      header: 'Vendedor', 
      accessor: (sale: any) => sale.sellers?.name || 'Desconocido',
    },
    { 
      header: 'Total', 
      accessor: (sale: any) => formatCurrency(parseFloat(sale.total)),
      className: 'text-right'
    },
  ];

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Reportes
          </h2>
        </div>
      </div>
      
      {/* Filtros */}
      <Card className="mb-6">
        <div className="flex items-center mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Período
            </label>
            <select
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
            >
              <option value="today">Hoy</option>
              <option value="yesterday">Ayer</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>
          
          {periodFilter === 'custom' && (
            <>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Fecha inicio
                </label>
                <div className="relative">
                  <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="date"
                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={format(dateRange.start, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const newDate = e.target.value ? new Date(e.target.value) : new Date();
                      setDateRange({
                        ...dateRange,
                        start: startOfDay(newDate)
                      });
                    }}
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Fecha fin
                </label>
                <div className="relative">
                  <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="date"
                    className="pl-10 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    value={format(dateRange.end, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const newDate = e.target.value ? new Date(e.target.value) : new Date();
                      setDateRange({
                        ...dateRange,
                        end: endOfDay(newDate)
                      });
                    }}
                  />
                </div>
              </div>
            </>
          )}
          
          <Select
            label="Vendedor"
            options={sellerOptions}
            value={selectedSellerId}
            onChange={(e) => setSelectedSellerId(e.target.value)}
          />
          
          <div className="lg:col-span-4 flex justify-between items-center">
            <div className="flex space-x-4">
              <div>
                <span className="block text-sm font-medium text-gray-500">Período</span>
                <span className="text-lg font-medium">
                  {format(dateRange.start, 'dd/MM/yyyy')} - {format(dateRange.end, 'dd/MM/yyyy')}
                </span>
              </div>
              
              <div>
                <span className="block text-sm font-medium text-gray-500">Total</span>
                <span className="text-lg font-medium">{formatCurrency(totalSales)}</span>
              </div>
              
              <div>
                <span className="block text-sm font-medium text-gray-500">Ventas</span>
                <span className="text-lg font-medium">{salesData.length}</span>
              </div>
              
              <div>
                <span className="block text-sm font-medium text-gray-500">Promedio</span>
                <span className="text-lg font-medium">{formatCurrency(averageSale)}</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowDownTrayIcon className="h-4 w-4 mr-1" />}
              onClick={() => alert('Función de exportación no implementada')}
            >
              Exportar
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <BarChart 
          title="Ventas Diarias"
          labels={dailySalesChartData.labels}
          datasets={dailySalesChartData.datasets}
          yAxisLabel="Ventas ($)"
        />
        
        <BarChart 
          title="Top 5 Productos"
          labels={topProductsChartData.labels}
          datasets={topProductsChartData.datasets}
          yAxisLabel="Ventas ($)"
        />
      </div>
      
      {/* Tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Productos Más Vendidos">
          <Table
            columns={productColumns}
            data={topProducts}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            emptyMessage="No hay datos disponibles para el período seleccionado"
          />
        </Card>
        
        <Card title="Listado de Ventas">
          <Table
            columns={salesColumns}
            data={salesData}
            keyExtractor={(item) => item.id}
            isLoading={isLoading}
            emptyMessage="No hay ventas para el período seleccionado"
          />
        </Card>
      </div>
    </div>
  );
}
