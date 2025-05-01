import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  ReceiptPercentIcon,
  CalendarIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAtom } from 'jotai';
import { userAtom } from '../../store/auth';
import { supabase } from '../../lib/supabase';
import StatsCard from '../../components/dashboard/StatsCard';
import PaymentsByMethodCard from '../../components/seller/PaymentsByMethodCard';

// Formatear número como moneda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(value);
};

export default function SellerDashboard() {
  const [user, setUser] = useAtom(userAtom);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [salesSummary, setSalesSummary] = useState({
    todaySalesCount: 0,
    todaySalesAmount: 0,
    weekSalesCount: 0,
    weekSalesAmount: 0,
    dailyChange: { value: 0, isPositive: true },
    commission: 0,
    commissionPercentage: 0
  });
  const [paymentMethodsData, setPaymentMethodsData] = useState<any[]>([]);

  // Obtener el día actual formateado
  const currentDay = format(new Date(), "EEEE d 'de' MMMM", { locale: es });

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  // Función para ir a la página de nueva venta
  const goToNewSale = () => {
    navigate('/seller/new-sale');
  };

  // Función para cerrar sesión
  const handleLogout = () => {
    setUser(null);
    navigate('/seller-login');
  };

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
        .select('id, total, created_at')
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

      // Obtener ventas por método de pago para hoy
      const { data: paymentMethodsResult, error: paymentMethodsError } = await supabase
        .from('sales')
        .select(`
          id, total, created_at,
          payment_method:payment_method_id(id, name)
        `)
        .eq('seller_id', user?.id)
        .gte('created_at', todayStr);

      if (paymentMethodsError) throw paymentMethodsError;

      // Procesar datos de métodos de pago
      const methodsMap = new Map();

      paymentMethodsResult?.forEach(sale => {
        const methodId = sale.payment_method.id;
        const methodName = sale.payment_method.name;
        const total = parseFloat(sale.total);

        if (methodsMap.has(methodId)) {
          const current = methodsMap.get(methodId);
          methodsMap.set(methodId, {
            ...current,
            total: current.total + total,
            count: current.count + 1
          });
        } else {
          methodsMap.set(methodId, {
            id: methodId,
            name: methodName,
            total: total,
            count: 1
          });
        }
      });

      setPaymentMethodsData(Array.from(methodsMap.values()));


      setSalesSummary({
        todaySalesCount: todaySales.length,
        todaySalesAmount,
        weekSalesCount: weekSales.length,
        weekSalesAmount,
        dailyChange,
        commission: todayCommission,
        commissionPercentage
      });

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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-10">
        <div className="sm:col-span-2 lg:col-span-1">
          <StatsCard
            title="Ventas del Día"
            value={formatCurrency(salesSummary.todaySalesAmount)}
            icon={<CurrencyDollarIcon className="h-6 w-6" />}
            change={salesSummary.dailyChange}
            footer={`${salesSummary.todaySalesCount} venta${salesSummary.todaySalesCount !== 1 ? 's' : ''} hoy`}
            className="bg-gradient-to-br from-primary-50 to-white h-full"
          />
        </div>
        <StatsCard
          title="Comisión del Día"
          value={formatCurrency(salesSummary.commission)}
          icon={<ReceiptPercentIcon className="h-6 w-6" />}
          footer={`${salesSummary.commissionPercentage}% sobre ventas`}
          className="bg-gradient-to-br from-green-50 to-white h-full"
        />
        <div className={`${paymentMethodsData.length > 4 ? 'sm:col-span-2 lg:col-span-1' : ''}`}>
          <PaymentsByMethodCard
            title="Pagos por método"
            methods={paymentMethodsData}
            className="h-full"
            maxVisibleItems={4}
          />
        </div>
      </div>

      {/* Botones grandes de acción */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={goToNewSale}
          className="py-8 px-6 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors flex flex-col items-center shadow-sm border border-primary-400"
        >
          <ShoppingCartIcon className="h-14 w-14 mb-3" />
          <span className="text-xl font-bold">Nueva Venta</span>
          <span className="text-sm opacity-80 mt-2">Registrar una nueva transacción</span>
        </button>

        <button
          onClick={handleLogout}
          className="py-8 px-6 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors flex flex-col items-center shadow-sm border border-gray-200"
        >
          <ArrowRightOnRectangleIcon className="h-14 w-14 mb-3" />
          <span className="text-xl font-bold">Terminar Venta</span>
          <span className="text-sm opacity-80 mt-2">Finalizar y cerrar sesión</span>
        </button>
      </div>
    </div>
  );
}