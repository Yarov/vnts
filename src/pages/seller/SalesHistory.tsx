import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  FunnelIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { useAtom } from 'jotai';
import { userAtom } from '../../store/auth';
import { supabase } from '../../lib/supabase';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import FormField from '../../components/ui/FormField';
import Select from '../../components/ui/Select';
import { Database } from '../../types/database.types';

type Sale = Database['public']['Tables']['sales']['Row'];
type PaymentMethod = Database['public']['Tables']['payment_methods']['Row'];
type Client = Database['public']['Tables']['clients']['Row'];
type SaleItem = Database['public']['Tables']['sale_items']['Row'] & {
  product_name?: string;
};

interface SaleWithDetails extends Sale {
  client_name?: string;
  payment_method_name?: string;
  formatted_date?: string;
  items?: SaleItem[];
}

// Formatear número como moneda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};

export default function SalesHistory() {
  const [user] = useAtom(userAtom);
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [filteredSales, setFilteredSales] = useState<SaleWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentSale, setCurrentSale] = useState<SaleWithDetails | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  
  // Filtros
  const [dateRange, setDateRange] = useState<{
    start: string | null;
    end: string | null;
  }>({
    start: null,
    end: null,
  });
  const [clientFilter, setClientFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [minAmountFilter, setMinAmountFilter] = useState('');
  const [maxAmountFilter, setMaxAmountFilter] = useState('');
  
  // Obtener el día actual formateado
  const currentDay = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  useEffect(() => {
    if (user?.id) {
      fetchSalesHistory();
      fetchPaymentMethods();
      fetchClients();
    }
  }, [user]);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [sales, dateRange, clientFilter, paymentMethodFilter, minAmountFilter, maxAmountFilter]);

  // Función para obtener historial de ventas
  const fetchSalesHistory = async () => {
    setIsLoading(true);
    
    try {
      // Obtener ventas del vendedor
      const { data: salesData, error: salesError } = await supabase
        .from('sales')
        .select('id, total, created_at, payment_method_id, client_id, notes')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (salesError) throw salesError;
      
      // Obtener relaciones
      const clientIds = [...new Set((salesData || []).map(s => s.client_id).filter(Boolean))];
      const paymentMethodIds = [...new Set((salesData || []).map(s => s.payment_method_id))];
      
      const [clientsResponse, paymentMethodsResponse] = await Promise.all([
        supabase.from('clients').select('id, name').in('id', clientIds),
        supabase.from('payment_methods').select('id, name').in('id', paymentMethodIds)
      ]);
      
      const clientsMap = (clientsResponse.data || []).reduce((acc, client) => {
        acc[client.id] = client.name;
        return acc;
      }, {});
      
      const paymentMethodsMap = (paymentMethodsResponse.data || []).reduce((acc, pm) => {
        acc[pm.id] = pm.name;
        return acc;
      }, {});
      
      // Formatear ventas
      const formattedSales = (salesData || []).map(sale => ({
        ...sale,
        client_name: sale.client_id ? clientsMap[sale.client_id] : 'Sin cliente',
        payment_method_name: paymentMethodsMap[sale.payment_method_id] || 'Desconocido',
        formatted_date: format(new Date(sale.created_at), 'dd/MM/yyyy HH:mm'),
      }));
      
      setSales(formattedSales);
      setFilteredSales(formattedSales);
    } catch (error) {
      console.error('Error al cargar historial de ventas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Obtener métodos de pago para filtro
  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error al cargar métodos de pago:', error);
    }
  };

  // Obtener clientes para filtro
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = [...sales];
    
    // Filtro por fecha
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(sale => new Date(sale.created_at) >= startDate);
    }
    
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // Final del día
      filtered = filtered.filter(sale => new Date(sale.created_at) <= endDate);
    }
    
    // Filtro por cliente
    if (clientFilter) {
      filtered = filtered.filter(sale => sale.client_id === clientFilter);
    }
    
    // Filtro por método de pago
    if (paymentMethodFilter) {
      filtered = filtered.filter(sale => sale.payment_method_id === paymentMethodFilter);
    }
    
    // Filtro por monto mínimo
    if (minAmountFilter) {
      const minAmount = parseFloat(minAmountFilter);
      filtered = filtered.filter(sale => parseFloat(sale.total) >= minAmount);
    }
    
    // Filtro por monto máximo
    if (maxAmountFilter) {
      const maxAmount = parseFloat(maxAmountFilter);
      filtered = filtered.filter(sale => parseFloat(sale.total) <= maxAmount);
    }
    
    setFilteredSales(filtered);
  };

  // Resetear filtros
  const resetFilters = () => {
    setDateRange({ start: null, end: null });
    setClientFilter('');
    setPaymentMethodFilter('');
    setMinAmountFilter('');
    setMaxAmountFilter('');
  };

  // Ver detalles de una venta
  const viewSaleDetails = async (sale: SaleWithDetails) => {
    setCurrentSale(sale);
    
    try {
      // Obtener items de la venta
      const { data: itemsData, error: itemsError } = await supabase
        .from('sale_items')
        .select(`
          id, quantity, price, subtotal, product_id,
          products(name)
        `)
        .eq('sale_id', sale.id);
      
      if (itemsError) throw itemsError;
      
      // Formatear items
      const formattedItems = (itemsData || []).map(item => ({
        ...item,
        product_name: item.products?.name || 'Producto desconocido',
      }));
      
      // Actualizar venta actual con sus items
      setCurrentSale({
        ...sale,
        items: formattedItems,
      });
    } catch (error) {
      console.error('Error al cargar detalles de venta:', error);
    } finally {
      setIsDetailModalOpen(true);
    }
  };

  // Columnas para tabla de ventas
  const salesColumns = [
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
      accessor: (sale: SaleWithDetails) => formatCurrency(parseFloat(sale.total)),
      className: 'text-right'
    },
    { 
      header: 'Acciones', 
      accessor: (sale: SaleWithDetails) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => viewSaleDetails(sale)}
          icon={<EyeIcon className="h-4 w-4" />}
        >
          Ver detalles
        </Button>
      ),
      className: 'text-right'
    },
  ];
  
  // Columnas para tabla de items de venta
  const saleItemsColumns = [
    { 
      header: 'Producto', 
      accessor: 'product_name',
    },
    { 
      header: 'Cantidad', 
      accessor: 'quantity',
      className: 'text-center'
    },
    { 
      header: 'Precio', 
      accessor: (item: SaleItem) => formatCurrency(parseFloat(item.price)),
      className: 'text-right'
    },
    { 
      header: 'Subtotal', 
      accessor: (item: SaleItem) => formatCurrency(parseFloat(item.subtotal)),
      className: 'text-right'
    },
  ];
  
  // Opciones para selector de clientes
  const clientOptions = clients.map(client => ({
    value: client.id,
    label: client.name
  }));

  // Opciones para selector de métodos de pago
  const paymentMethodOptions = paymentMethods.map(method => ({
    value: method.id,
    label: method.name
  }));

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Historial de Ventas
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {currentDay}
          </p>
        </div>
      </div>
      
      {/* Filtros */}
      <Card className="mb-6">
        <div className="flex items-center mb-4">
          <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
          <h3 className="text-lg font-medium">Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Fecha inicio
            </label>
            <div className="relative">
              <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="date"
                className="pl-10 input w-full"
                value={dateRange.start || ''}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value || null })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Fecha fin
            </label>
            <div className="relative">
              <CalendarIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="date"
                className="pl-10 input w-full"
                value={dateRange.end || ''}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value || null })}
              />
            </div>
          </div>
          
          <Select
            label="Cliente"
            options={[{ value: '', label: 'Todos los clientes' }, ...clientOptions]}
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
          />
          
          <Select
            label="Método de pago"
            options={[{ value: '', label: 'Todos los métodos' }, ...paymentMethodOptions]}
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
          />
          
          <FormField
            label="Monto mínimo"
            type="number"
            placeholder="Min $"
            value={minAmountFilter}
            onChange={(e) => setMinAmountFilter(e.target.value)}
          />
          
          <FormField
            label="Monto máximo"
            type="number"
            placeholder="Max $"
            value={maxAmountFilter}
            onChange={(e) => setMaxAmountFilter(e.target.value)}
          />
          
          <div className="flex items-end sm:col-span-2">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="w-full"
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Tabla de ventas */}
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">Mis ventas</h3>
          <p className="text-sm text-gray-500">
            {filteredSales.length} venta{filteredSales.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Table
          columns={salesColumns}
          data={filteredSales}
          keyExtractor={(item) => item.id}
          isLoading={isLoading}
          emptyMessage="No se encontraron ventas con los filtros aplicados"
        />
      </Card>
      
      {/* Modal de detalles de venta */}
      {isDetailModalOpen && currentSale && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Backdrop */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Detalles de Venta
                </h3>
                
                <div className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Fecha</p>
                    <p className="font-medium">{currentSale.formatted_date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cliente</p>
                    <p className="font-medium">{currentSale.client_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Método de pago</p>
                    <p className="font-medium">{currentSale.payment_method_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-medium">{formatCurrency(parseFloat(currentSale.total))}</p>
                  </div>
                  {currentSale.notes && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Notas</p>
                      <p className="font-medium">{currentSale.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Productos</h4>
                  <Table
                    columns={saleItemsColumns}
                    data={currentSale.items || []}
                    keyExtractor={(item) => item.id}
                    emptyMessage="No hay productos disponibles"
                  />
                </div>
                
                <div className="mt-5">
                  <Button
                    variant="outline"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
