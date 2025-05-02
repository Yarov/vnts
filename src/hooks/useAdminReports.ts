import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getTopClients } from '../services/clientService';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, differenceInDays, startOfDay, endOfDay, subDays } from 'date-fns';
import { Database } from '../types/database.types';
import { getAllSellerCommissions } from '../services/authService';

type Seller = Database['public']['Tables']['sellers']['Row'];

// Definir tipo auxiliar para productos agrupados
type GroupedProduct = {
  id: string;
  name: string;
  quantity: number;
  total: number;
};

interface SaleItem {
  id: string;
  product: {
    id: string;
    name: string;
  };
  quantity: number;
  price: number;
  subtotal: number;
}

interface DetailedSale {
  id: string;
  created_at: string;
  total: number;
  seller: {
    id: string;
    name: string;
  };
  client?: {
    id: string;
    name: string;
  };
  payment_method: {
    id: string;
    name: string;
  };
  items: SaleItem[];
}

interface RawSale {
  id: string;
  created_at: string;
  total: number;
  seller: any;
  client?: any;
  payment_method?: any;
  items?: any[];
}

type UseAdminReportsReturn = {
  dateRange: { start: Date; end: Date };
  setDateRange: (range: { start: Date; end: Date }) => void;
  periodFilter: string;
  setPeriodFilter: (period: string) => void;
  isLoading: boolean;
  sellers: Seller[];
  selectedSellerId: string;
  setSelectedSellerId: (id: string) => void;
  topProducts: GroupedProduct[];
  dailySales: Array<{
    date: string;
    total: number;
    count: number;
  }>;
  totalPeriodo: number;
  cantidadVentas: number;
  ticketPromedio: number;
  promedioDiario: number;
  diaMax: { date: string; total: number; count: number };
  diaMin: { date: string; total: number; count: number };
  diaMasTransacciones: { date: string; total: number; count: number };
  productoMasVendido: GroupedProduct | null;
  clienteMasFrecuente: { id: string; name: string } | null;
  tendencia: { value: number; isPositive: boolean };
  crecimiento: { value: number; isPositive: boolean };
  previousPeriodSales: number;
  handleResetFilters: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleExport: () => void;
  topClientes: Array<{ id: string; name: string }>;
  totalSales: number;
  ventas: DetailedSale[];
  commissions: Array<{
    seller_id: string;
    seller_name: string;
    total_sales: number;
    commission_percentage: number;
    commission_amount: number;
  }>;
};

export function useAdminReports(): UseAdminReportsReturn {
  const [searchParams] = useSearchParams();
  const [commissions, setCommissions] = useState<Array<{
    seller_id: string;
    seller_name: string;
    total_sales: number;
    commission_percentage: number;
    commission_amount: number;
  }>>([]);

  // Calcular primer y último día del mes actual
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: firstDay,
    end: lastDay,
  });
  const [periodFilter, setPeriodFilter] = useState('month');
  const [isLoading, setIsLoading] = useState(true);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [selectedSellerId, setSelectedSellerId] = useState<string>('');
  const [topProducts, setTopProducts] = useState<GroupedProduct[]>([]);
  const [dailySales, setDailySales] = useState<Array<{ date: string; total: number; count: number }>>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [activeTab, setActiveTab] = useState(() => {
    const tabFromUrl = searchParams.get('tab');
    return tabFromUrl && ['resumen', 'ventas', 'clientes', 'productos', 'vendedores', 'pagos', 'comparativas'].includes(tabFromUrl)
      ? tabFromUrl
      : 'resumen';
  });
  const [topClientes, setTopClientes] = useState<Array<{ id: string; name: string }>>([]);
  const [previousPeriodSales, setPreviousPeriodSales] = useState(0);
  const [ventas, setVentas] = useState<DetailedSale[]>([]);

  useEffect(() => {
    fetchSellers();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [dateRange, selectedSellerId]);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Si ya hay un rango de fechas seleccionado y es un cambio desde custom, mantener ese rango
    if (periodFilter === 'custom') {
      return;
    }

    switch (periodFilter) {
      case 'today':
        setDateRange({
          start: today,
          end: new Date(today.getTime())
        });
        break;
      case 'yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        setDateRange({
          start: yesterday,
          end: yesterday
        });
        break;
      }
      case 'week': {
        const weekStart = startOfWeek(today, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
        setDateRange({
          start: weekStart,
          end: weekEnd
        });
        break;
      }
      case 'month': {
        // Si ya hay un rango de fechas seleccionado, usar ese mes
        const baseDate = dateRange.start || today;
        const monthStart = startOfMonth(baseDate);
        const monthEnd = endOfMonth(baseDate);
        setDateRange({
          start: monthStart,
          end: monthEnd
        });
        break;
      }
    }
  }, [periodFilter]);

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

  // Función para obtener ventas de un rango de fechas específico
  const getSalesForDateRange = async (start: Date, end: Date) => {
    try {
      const startStr = startOfDay(start).toISOString();
      const endStr = endOfDay(end).toISOString();

      let query = supabase
        .from('sales')
        .select('total')
        .gte('created_at', startStr)
        .lte('created_at', endStr);

      if (selectedSellerId) {
        query = query.eq('seller_id', selectedSellerId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).reduce((sum, sale) => sum + parseFloat(sale.total), 0);
    } catch (error) {
      console.error('Error al obtener ventas del periodo:', error);
      return 0;
    }
  };

  // Función para obtener ventas del periodo anterior comparable
  const getPreviousPeriodSales = async () => {
    try {
      let previousStart: Date;
      let previousEnd: Date;

      switch (periodFilter) {
        case 'today': {
          // Para "hoy", el periodo anterior es "ayer"
          const yesterday = subDays(dateRange.start, 1);
          previousStart = startOfDay(yesterday);
          previousEnd = endOfDay(yesterday);
          break;
        }
        case 'yesterday': {
          // Para "ayer", el periodo anterior es "anteayer"
          const dayBeforeYesterday = subDays(dateRange.start, 1);
          previousStart = startOfDay(dayBeforeYesterday);
          previousEnd = endOfDay(dayBeforeYesterday);
          break;
        }
        case 'week': {
          // Para "semana", el periodo anterior son los 7 días anteriores exactos
          const weekStart = new Date(dateRange.start);
          weekStart.setDate(weekStart.getDate() - 7);
          previousStart = startOfWeek(weekStart, { weekStartsOn: 1 });
          previousEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
          break;
        }
        case 'month': {
          // Para "mes", el periodo anterior es el mes anterior exacto
          const previousMonth = new Date(dateRange.start);
          previousMonth.setMonth(previousMonth.getMonth() - 1);
          previousStart = startOfMonth(previousMonth);
          previousEnd = endOfMonth(previousMonth);
          break;
        }
        default: {
          // Para periodos personalizados, usar la misma duración hacia atrás
          const duration = differenceInDays(dateRange.end, dateRange.start);
          previousStart = subDays(dateRange.start, duration + 1);
          previousEnd = subDays(dateRange.start, 1);
          break;
        }
      }

      return await getSalesForDateRange(previousStart, previousEnd);
    } catch (error) {
      console.error('Error al obtener ventas del periodo anterior:', error);
      return 0;
    }
  };

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      // Ajustar rango para incluir todo el día
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      const startDateStr = startDate.toISOString();
      const endDateStr = endDate.toISOString();

      // Obtener comisiones del periodo
      const commissionsData = await getAllSellerCommissions(startDateStr, endDateStr);
      setCommissions(commissionsData);

      // Consulta detallada de ventas con items
      const { data: ventasData, error: ventasError } = await supabase
        .from('sales')
        .select(`
          id,
          created_at,
          total,
          seller:seller_id (
            id,
            name
          ),
          client:client_id (
            id,
            name
          ),
          payment_method:payment_method_id (
            id,
            name
          ),
          items:sale_items (
            id,
            product:product_id (
              id,
              name
            ),
            quantity,
            price,
            subtotal
          )
        `)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr)
        .order('created_at', { ascending: false });

      if (ventasError) throw ventasError;

      // Filtrar por vendedor si es necesario
      let filteredSales = ventasData || [] as RawSale[];
      if (selectedSellerId) {
        filteredSales = filteredSales.filter((sale: RawSale) => {
          if (!sale.seller || typeof sale.seller !== 'object' || Array.isArray(sale.seller)) {
            return false;
          }
          return sale.seller.id === selectedSellerId;
        });
      }

      // Convertir ventas al formato esperado
      const typedSales: DetailedSale[] = filteredSales.map((sale: RawSale) => {
        // Extraer datos del vendedor
        const sellerData = sale.seller && typeof sale.seller === 'object' && !Array.isArray(sale.seller)
          ? {
              id: typeof sale.seller.id === 'string' ? sale.seller.id : '',
              name: typeof sale.seller.name === 'string' ? sale.seller.name : ''
            }
          : { id: '', name: '' };

        // Extraer datos del cliente si existe
        let clientData = undefined;
        if (sale.client && typeof sale.client === 'object' && !Array.isArray(sale.client)) {
          if ('id' in sale.client && 'name' in sale.client) {
            clientData = {
              id: typeof sale.client.id === 'string' ? sale.client.id : '',
              name: typeof sale.client.name === 'string' ? sale.client.name : ''
            };
          }
        }

        // Extraer datos del método de pago si existe
        let paymentMethodData = undefined;
        if (sale.payment_method && typeof sale.payment_method === 'object' && !Array.isArray(sale.payment_method)) {
          if ('id' in sale.payment_method && 'name' in sale.payment_method) {
            paymentMethodData = {
              id: typeof sale.payment_method.id === 'string' ? sale.payment_method.id : '',
              name: typeof sale.payment_method.name === 'string' ? sale.payment_method.name : ''
            };
          }
        }

        // Extraer datos de los items de venta
        const items = Array.isArray(sale.items) ? sale.items.map(item => {
          let productData = { id: '', name: '' };
          if (item.product && typeof item.product === 'object' && !Array.isArray(item.product)) {
            if ('id' in item.product && 'name' in item.product) {
              productData = {
                id: typeof item.product.id === 'string' ? item.product.id : '',
                name: typeof item.product.name === 'string' ? item.product.name : ''
              };
            }
          }

          return {
            id: item.id,
            product: productData,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal
          } as SaleItem;
        }) : [];

        return {
          id: sale.id,
          created_at: sale.created_at,
          total: sale.total,
          seller: sellerData,
          client: clientData,
          payment_method: paymentMethodData || { id: '', name: '' },
          items: items
        } as DetailedSale;
      });

      setVentas(typedSales);

      // Consulta resumida de ventas para estadísticas
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select(`
          id,
          total,
          created_at,
          seller_id
        `)
        .gte('created_at', startDateStr)
        .lte('created_at', endDateStr);

      if (salesError) throw salesError;

      // Filtrar ventas por vendedor si es necesario
      let filteredStatsData = salesData || [];
      if (selectedSellerId) {
        filteredStatsData = filteredStatsData.filter(sale => sale.seller_id === selectedSellerId);
      }

      // Calcular total de ventas
      const total = filteredStatsData.reduce((sum, sale) => sum + parseFloat(sale.total), 0);
      setTotalSales(total);

      // Consulta de items de venta
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

      // Filtrar items por vendedor si es necesario
      let filteredItems = (saleItems || []) as any[];
      if (selectedSellerId) {
        filteredItems = filteredItems.filter(item =>
          item.sales &&
          typeof item.sales.seller_id !== 'undefined' &&
          item.sales.seller_id === selectedSellerId
        );
      }

      // Agrupar productos
      const productMap: Record<string, GroupedProduct> = {};
      filteredItems.forEach(item => {
        const productId = item.product_id;
        const productName = item.products && typeof item.products === 'object' && 'name' in item.products
          ? item.products.name
          : 'Producto desconocido';

        if (!productMap[productId]) {
          productMap[productId] = {
            id: productId,
            name: productName,
            quantity: 0,
            total: 0,
          };
        }
        productMap[productId].quantity += item.quantity;
        productMap[productId].total += parseFloat(item.subtotal);
      });

      // Ordenar productos por total
      const topProductsArray = Object.values(productMap)
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);
      setTopProducts(topProductsArray);

      // Agrupar ventas por día
      const dailyMap = {} as Record<string, { date: string; total: number; count: number }>;
      (filteredStatsData || []).forEach(sale => {
        const date = new Date(sale.created_at).toISOString().split('T')[0];
        if (!dailyMap[date]) {
          dailyMap[date] = {
            date,
            total: 0,
            count: 0,
          };
        }
        dailyMap[date].total += parseFloat(sale.total);
        dailyMap[date].count += 1;
      });

      // Ordenar ventas diarias por fecha
      const dailySalesArray = Object.values(dailyMap)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setDailySales(dailySalesArray);

      // Cargar clientes frecuentes
      const clientesFrecuentes = await getTopClients(10);
      setTopClientes(clientesFrecuentes);

      // Obtener ventas del periodo anterior para comparaciones
      const previousPeriodTotal = await getPreviousPeriodSales();

      // Guardar el total del periodo anterior en una variable de estado
      setPreviousPeriodSales(previousPeriodTotal);

    } catch (error) {
      console.error('Error al cargar datos del reporte:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setPeriodFilter('month');
    setDateRange({ start: firstDay, end: lastDay });
    setSelectedSellerId('');
  };

  const handleExport = () => {
    alert('Función de exportación no implementada');
  };

  // Calcular KPIs considerando el periodo seleccionado
  const totalPeriodo = dailySales.reduce((sum, d) => sum + (d.total || 0), 0);
  const cantidadVentas = dailySales.reduce((sum, d) => sum + (d.count || 0), 0);

  // Calcular ticket promedio con validación
  const ticketPromedio = cantidadVentas > 0
    ? Math.round((totalPeriodo / cantidadVentas) * 100) / 100
    : 0;

  // Calcular promedio diario según el periodo
  const diasEnPeriodo = Math.max(1, differenceInDays(dateRange.end, dateRange.start) + 1);
  const promedioDiario = Math.round((totalPeriodo / diasEnPeriodo) * 100) / 100;

  // Calcular días destacados con validación de datos
  const diaMax = dailySales.length > 0
    ? dailySales.reduce((max, d) => (d.total || 0) > (max.total || 0) ? d : max, dailySales[0])
    : { date: '', total: 0, count: 0 };

  const diaMin = dailySales.length > 0
    ? dailySales.reduce((min, d) =>
        (d.total || 0) < (min.total || 0) && (d.total || 0) > 0 ? d : min,
        { ...dailySales[0], total: Number.MAX_VALUE }
      )
    : { date: '', total: 0, count: 0 };

  const diaMasTransacciones = dailySales.length > 0
    ? dailySales.reduce((max, d) => (d.count || 0) > (max.count || 0) ? d : max, dailySales[0])
    : { date: '', total: 0, count: 0 };

  // Producto y cliente más destacados
  const productoMasVendido = topProducts && topProducts.length > 0 ? topProducts[0] : null;
  const clienteMasFrecuente = topClientes && topClientes.length > 0 ? topClientes[0] : null;

  // Actualizar cálculo de tendencia y crecimiento
  let tendencia = { value: 0, isPositive: true };
  let crecimiento = { value: 0, isPositive: true };

  if (dailySales.length > 0) {
    if (periodFilter === 'today' || periodFilter === 'yesterday') {
      // Para periodos de un día, tendencia y crecimiento son lo mismo
      const currentTotal = totalPeriodo;
      const diff = currentTotal - previousPeriodSales;

      tendencia = {
        value: previousPeriodSales === 0 ? 0 : Math.round((diff / previousPeriodSales) * 100),
        isPositive: diff >= 0
      };
      crecimiento = tendencia;
    } else {
      // Para periodos más largos, calcular tendencia basada en la evolución dentro del periodo
      const sortedSales = [...dailySales].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const mitad = Math.floor(sortedSales.length / 2);
      const primeraParteTotal = sortedSales.slice(0, mitad).reduce((sum, d) => sum + d.total, 0);
      const segundaParteTotal = sortedSales.slice(mitad).reduce((sum, d) => sum + d.total, 0);

      // Calcular tendencia (evolución dentro del periodo actual)
      const diffTendencia = segundaParteTotal - primeraParteTotal;
      tendencia = {
        value: primeraParteTotal === 0 ? 0 : Math.round((diffTendencia / primeraParteTotal) * 100),
        isPositive: diffTendencia >= 0
      };

      // Calcular crecimiento (comparación con periodo anterior)
      const diffCrecimiento = totalPeriodo - previousPeriodSales;
      crecimiento = {
        value: previousPeriodSales === 0 ? 0 : Math.round((diffCrecimiento / previousPeriodSales) * 100),
        isPositive: diffCrecimiento >= 0
      };
    }
  }

  return {
    dateRange,
    setDateRange,
    periodFilter,
    setPeriodFilter,
    isLoading,
    sellers,
    selectedSellerId,
    setSelectedSellerId,
    topProducts,
    dailySales,
    totalPeriodo,
    cantidadVentas,
    ticketPromedio,
    promedioDiario,
    diaMax,
    diaMin,
    diaMasTransacciones,
    productoMasVendido,
    clienteMasFrecuente,
    tendencia,
    crecimiento,
    previousPeriodSales,
    handleResetFilters,
    activeTab,
    setActiveTab,
    handleExport,
    topClientes,
    totalSales,
    ventas,
    commissions,
  };
}